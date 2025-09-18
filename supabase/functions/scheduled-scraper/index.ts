// Scheduled Social Media Scraper - Runs every 15 minutes
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CronJobConfig {
  name: string;
  schedule: string; // cron expression
  function_name: string;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
}

// Cron job configurations
const CRON_JOBS: CronJobConfig[] = [
  {
    name: 'realtime-scraper',
    schedule: '*/15 * * * *', // Every 15 minutes
    function_name: 'realtime-scraper',
    enabled: true
  },
  {
    name: 'social-media-scraper',
    schedule: '*/30 * * * *', // Every 30 minutes
    function_name: 'social-media-scraper',
    enabled: true
  },
  {
    name: 'cleanup-old-mentions',
    schedule: '0 2 * * *', // Daily at 2 AM
    function_name: 'cleanup-old-mentions',
    enabled: true
  }
];

// Function to calculate next run time from cron expression
function getNextRunTime(cronExpression: string): Date {
  // Simplified cron parser - in production use a proper cron library
  const now = new Date();
  const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ');
  
  // For */15 pattern, add 15 minutes
  if (minute.startsWith('*/')) {
    const interval = parseInt(minute.slice(2));
    return new Date(now.getTime() + interval * 60 * 1000);
  }
  
  // For specific times, calculate next occurrence
  const nextRun = new Date(now);
  
  if (hour !== '*') {
    nextRun.setHours(parseInt(hour));
  }
  if (minute !== '*') {
    nextRun.setMinutes(parseInt(minute));
  }
  nextRun.setSeconds(0);
  nextRun.setMilliseconds(0);
  
  // If time has passed today, move to tomorrow
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  return nextRun;
}

// Function to check if it's time to run a job
function shouldRunJob(job: CronJobConfig): boolean {
  if (!job.enabled) return false;
  
  const now = new Date();
  const lastRun = job.last_run ? new Date(job.last_run) : new Date(0);
  
  // Parse cron expression for minutes interval
  const [minute] = job.schedule.split(' ');
  
  if (minute.startsWith('*/')) {
    const interval = parseInt(minute.slice(2));
    const timeSinceLastRun = now.getTime() - lastRun.getTime();
    const intervalMs = interval * 60 * 1000;
    
    return timeSinceLastRun >= intervalMs;
  }
  
  return false;
}

// Function to execute a job
async function executeJob(job: CronJobConfig): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🚀 Executing job: ${job.name}`);
    
    const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${job.function_name}`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({ triggered_by: 'scheduler' })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Job ${job.name} completed successfully`);
      return { success: true, message: result.message || 'Job completed' };
    } else {
      console.error(`❌ Job ${job.name} failed:`, result.error);
      return { success: false, message: result.error || 'Job failed' };
    }
    
  } catch (error) {
    console.error(`❌ Error executing job ${job.name}:`, error);
    return { success: false, message: error.message };
  }
}

// Function to update job status in database
async function updateJobStatus(supabase: any, job: CronJobConfig, success: boolean, message: string) {
  try {
    const now = new Date().toISOString();
    const nextRun = getNextRunTime(job.schedule).toISOString();
    
    // Store job execution log
    await supabase.from('cron_job_logs').insert({
      job_name: job.name,
      executed_at: now,
      success: success,
      message: message,
      next_scheduled_run: nextRun
    });
    
    // Update job status
    await supabase.from('cron_jobs').upsert({
      name: job.name,
      schedule: job.schedule,
      function_name: job.function_name,
      enabled: job.enabled,
      last_run: now,
      next_run: nextRun,
      last_success: success,
      last_message: message
    });
    
  } catch (error) {
    console.error('Error updating job status:', error);
  }
}

// Function to clean up old social mentions
async function cleanupOldMentions(supabase: any): Promise<{ success: boolean; message: string }> {
  try {
    // Delete mentions older than 7 days with low urgency
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('social_mentions')
      .delete()
      .lt('created_at', sevenDaysAgo)
      .lte('urgency_score', 2);
    
    if (error) throw error;
    
    // Delete mentions older than 30 days regardless of urgency
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await supabase
      .from('social_mentions')
      .delete()
      .lt('created_at', thirtyDaysAgo);
    
    return { success: true, message: 'Old mentions cleaned up successfully' };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Main scheduler function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('⏰ Scheduler triggered at:', new Date().toISOString());
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get current job statuses from database
    const { data: jobStatuses } = await supabase
      .from('cron_jobs')
      .select('*');
    
    // Merge with configuration
    const jobsToCheck = CRON_JOBS.map(configJob => {
      const dbJob = jobStatuses?.find(j => j.name === configJob.name);
      return {
        ...configJob,
        last_run: dbJob?.last_run,
        next_run: dbJob?.next_run
      };
    });

    const executionResults = [];

    // Check each job
    for (const job of jobsToCheck) {
      if (shouldRunJob(job)) {
        console.log(`📋 Job ${job.name} is due to run`);
        
        let result;
        
        if (job.function_name === 'cleanup-old-mentions') {
          result = await cleanupOldMentions(supabase);
        } else {
          result = await executeJob(job);
        }
        
        executionResults.push({
          job: job.name,
          success: result.success,
          message: result.message
        });
        
        // Update job status
        await updateJobStatus(supabase, job, result.success, result.message);
        
        // Add delay between jobs to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } else {
        console.log(`⏭️  Job ${job.name} not due to run yet`);
      }
    }

    // Return summary
    const successCount = executionResults.filter(r => r.success).length;
    const totalCount = executionResults.length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Scheduler completed. ${successCount}/${totalCount} jobs executed successfully`,
        executed_jobs: executionResults,
        next_check: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Next check in 5 minutes
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Scheduler error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
