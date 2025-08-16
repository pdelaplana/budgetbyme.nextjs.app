// Debug script to test Firebase Admin SDK initialization
console.log('🔄 Testing Firebase Admin SDK...');

async function testFirebaseAdmin() {
  try {
    // Import the firebase admin config
    const { storage } = await import(
      './src/server/lib/firebase-admin/index.ts'
    );

    console.log('✅ Firebase Admin SDK imported successfully');

    // Test bucket access
    const bucket = storage.bucket();
    console.log('✅ Storage bucket initialized:', bucket.name);

    // Test listing files (this will verify permissions)
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log('✅ Storage bucket accessible, file count:', files.length);

    console.log('🎉 Firebase Admin SDK is working correctly!');
  } catch (error) {
    console.error('❌ Firebase Admin SDK test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFirebaseAdmin();
