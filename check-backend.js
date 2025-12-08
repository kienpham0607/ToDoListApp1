/**
 * Script kiểm tra Backend có đang chạy không
 * 
 * Chạy script này để test kết nối đến backend:
 *   node check-backend.js
 */

const http = require('http');

const API_URL = 'http://localhost:8000/ba-todolist/api/auth/login';

console.log('🔍 Đang kiểm tra Backend...');
console.log('📍 URL:', API_URL);
console.log('');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/ba-todolist/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  console.log('✅ Backend đang chạy!');
  console.log('📊 Status Code:', res.statusCode);
  console.log('📋 Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📦 Response:', data || '(empty)');
    console.log('');
    if (res.statusCode === 200 || res.statusCode === 400) {
      console.log('✅ Backend hoạt động bình thường!');
      console.log('💡 Bạn có thể chạy app React Native.');
    } else {
      console.log('⚠️  Backend trả về status code không mong đợi.');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Không thể kết nối đến Backend!');
  console.error('📝 Lỗi:', error.message);
  console.log('');
  console.log('🔧 Hãy thử các bước sau:');
  console.log('1. Kiểm tra Backend có đang chạy không:');
  console.log('   cd App-ba');
  console.log('   mvn spring-boot:run');
  console.log('');
  console.log('2. Kiểm tra port 8000 có đang được sử dụng:');
  console.log('   netstat -ano | findstr :8000  (Windows)');
  console.log('   lsof -i :8000  (Mac/Linux)');
  console.log('');
  console.log('3. Kiểm tra firewall có chặn port 8000 không');
});

req.write(JSON.stringify({ username: 'test', password: 'test' }));
req.end();

