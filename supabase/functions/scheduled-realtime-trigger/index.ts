// Scheduled Real-Time Trigger for Automatic Feed Updates
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Main scheduled function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('⏰ Scheduled real-time feed trigger activated...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Call the real-time feed orchestrator
    const orchestratorResponse = await fetch(`${supabaseUrl}/functions/v1/realtime-feed-orchestrator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ scheduled: true })
    });

    const orchestratorResult = await orchestratorResponse.json();
    
    if (!orchestratorResponse.ok) {
      throw new Error(`Orchestrator failed: ${orchestratorResult.error}`);
    }

    console.log('✅ Scheduled real-time feed update completed');
    console.log(`📊 Stats: ${JSON.stringify(orchestratorResult.stats)}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduled real-time feed update completed',
        timestamp: new Date().toISOString(),
        stats: orchestratorResult.stats,
        api_status: orchestratorResult.api_status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Scheduled trigger error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
