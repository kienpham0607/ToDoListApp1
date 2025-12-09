// API Configuration
import { Platform } from 'react-native';

// Tự động chọn URL dựa trên platform
// Android Emulator: 10.0.2.2
// iOS Simulator: localhost
// Physical Device: Thay bằng IP của MÁY CHẠY BACKEND (server)
// 
// ⚠️ QUAN TRỌNG: IP này là IP của MÁY CHẠY BACKEND, không phải IP máy chạy app!
// 
// Cách lấy IP của máy chạy backend:
//   - Windows: ipconfig (tìm IPv4 Address)
//   - Mac/Linux: ifconfig hoặc ip addr
// 
// Ví dụ: Nếu backend chạy trên máy có IP 192.168.1.100
//         thì đặt MANUAL_IP = '192.168.1.100'
// 
// Lưu ý: Cả máy chạy backend VÀ máy chạy app phải cùng mạng WiFi/LAN
// ⚠️ IP này sẽ được tự động cập nhật khi chạy: npm run detect-ip hoặc npm start
// Hoặc chạy thủ công: node scripts/auto-detect-ip.js
const MANUAL_IP = '192.168.0.182'; // ⚠️ AUTO-UPDATED: IP của máy chạy backend (tự động cập nhật)

const getBaseURL = () => {
  const platform = Platform.OS;
  
  // Android Emulator hoặc Physical Device
  if (platform === 'android') {
    // Dùng MANUAL_IP (IP LAN) thay vì 10.0.2.2 vì 10.0.2.2 có thể không hoạt động
    // Backend phải có server.address=0.0.0.0 trong application.properties
    if (MANUAL_IP) {
      console.log(`Using LAN IP for Android: ${MANUAL_IP}`);
      console.log('⚠️ Make sure backend has server.address=0.0.0.0 in application.properties');
      return `http://${MANUAL_IP}:8000/ba-todolist/api`;
    }
    // Fallback: Thử dùng 10.0.2.2 nếu không có MANUAL_IP
    console.log('Using default Android Emulator IP: 10.0.2.2');
    return 'http://10.0.2.2:8000/ba-todolist/api';
  } 
  
  // iOS Simulator
  if (platform === 'ios') {
    // Trên Windows, iOS Simulator có thể không truy cập được localhost
    // Nên dùng IP máy tính nếu có MANUAL_IP
    if (MANUAL_IP) {
      console.log(`Using MANUAL_IP for iOS: ${MANUAL_IP}`);
      return `http://${MANUAL_IP}:8000/ba-todolist/api`;
    }
    console.log('Using localhost for iOS Simulator');
    return 'http://localhost:8000/ba-todolist/api';
  }
  
  // Web platform
  // Nếu đang chạy trên web và backend chạy trên máy khác, có thể cần dùng IP
  // Nhưng mặc định dùng localhost cho web
  console.log('Using localhost for Web platform');
  return 'http://localhost:8000/ba-todolist/api';
};

export const API_BASE_URL = getBaseURL();

// Debug: Log URL để kiểm tra
console.log('=== API Configuration ===');
console.log('Platform:', Platform.OS);
console.log('API Base URL:', API_BASE_URL);
console.log('Manual IP:', MANUAL_IP || 'Not set');
console.log('');
console.log('💡 Để test backend:');
console.log('  Windows PowerShell: .\\test-backend.ps1');
console.log('  Hoặc: node check-backend.js');
console.log('========================');

