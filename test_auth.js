const https = require('https');

const data = 'email=admin%40tableserve.com&password=password123';
const options = {
  hostname: 'qr-ev56brnzd-shrey005.vercel.app',
  port: 443,
  path: '/api/auth/callback/credentials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  if (res.headers.location) {
    console.log('Location:', decodeURIComponent(res.headers.location));
  }
});

req.write(data);
req.end();
