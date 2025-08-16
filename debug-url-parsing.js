// Test URL parsing logic for photo removal

function testUrlParsing() {
  const testUrl =
    'https://storage.googleapis.com/budgetbyme-f7fc6.firebasestorage.app/users/m0FOEW2tluXJVGT4TUqEKuJzK1g1/images/profile_1755325472943.jpg';

  console.log('Original URL:', testUrl);

  const url = new URL(testUrl);
  console.log('URL pathname:', url.pathname);

  const pathParts = url.pathname.split('/');
  console.log('Path parts:', pathParts);

  // Remove empty first element and bucket name
  const storagePath = pathParts.slice(2).join('/');
  console.log('Extracted storage path:', storagePath);
  console.log(
    'Expected storage path: users/m0FOEW2tluXJVGT4TUqEKuJzK1g1/images/profile_1755325472943.jpg',
  );
}

testUrlParsing();
