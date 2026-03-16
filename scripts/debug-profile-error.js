const http = require('http'); // eslint-disable-line @typescript-eslint/no-require-imports

// Wait a moment for server to start
setTimeout(() => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/profile/builder',
    method: 'GET',
    headers: {
      'Cookie': 'your-session-cookie-here'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Response (first 500 chars):');
      console.log(data.substring(0, 500));
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });

  req.end();
}, 3000);
