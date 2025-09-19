import { supabase } from '../lib/supabase';

export async function testStorageConnection() {
  console.log('Testing Supabase Storage connection...');
  
  try {
    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('✅ Storage connection successful');
    console.log('Available buckets:', buckets?.map(b => b.name) || []);
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return false;
    }
    
    // Test 2: Check if profile-pictures bucket exists
    const profilePicturesBucket = buckets?.find(bucket => bucket.id === 'profile-pictures');
    if (profilePicturesBucket) {
      console.log('✅ Profile pictures bucket found');
      console.log('Bucket details:', profilePicturesBucket);
    } else {
      console.log('⚠️ Profile pictures bucket not found');
      
      // Try to create it
      console.log('Attempting to create profile-pictures bucket...');
      const { error: createError } = await supabase.storage.createBucket('profile-pictures', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Failed to create bucket:', createError);
        return false;
      } else {
        console.log('✅ Profile pictures bucket created successfully');
      }
    }
    
    // Test 3: Check user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ User authenticated:', user.id);
      
      // Test 4: Try to list files in user's folder (this tests permissions)
      const { data: files, error: listError } = await supabase.storage
        .from('profile-pictures')
        .list(user.id);
      
      if (listError) {
        console.error('❌ Error listing user files:', listError);
      } else {
        console.log('✅ Can access user folder');
        console.log('User files:', files?.map(f => f.name) || []);
      }
    } else {
      console.log('⚠️ User not authenticated');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
}

// Function to test file upload
export async function testFileUpload() {
  console.log('Testing file upload...');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ User not authenticated');
    return false;
  }
  
  try {
    // Create a simple test file (1x1 pixel PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const response = await fetch(testImageData);
    const blob = await response.blob();
    
    const testFile = new File([blob], 'test-avatar.png', { type: 'image/png' });
    
    const filePath = `${user.id}/test-avatar.png`;
    
    console.log('Uploading test file to:', filePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, testFile, { upsert: true });
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return false;
    }
    
    console.log('✅ Upload successful:', uploadData);
    
    // Test getting public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);
    
    console.log('✅ Public URL:', urlData.publicUrl);
    
    // Clean up test file
    await supabase.storage
      .from('profile-pictures')
      .remove([filePath]);
    
    console.log('✅ Test file cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ File upload test failed:', error);
    return false;
  }
}

// Add to window for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testStorage = testStorageConnection;
  (window as any).testFileUpload = testFileUpload;
}
