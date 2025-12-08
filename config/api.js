// API Configuration
import { Platform } from 'react-native';

// Tự động chọn URL dựa trên platform
// Android Emulator: 10.0.2.2
// iOS Simulator: localhost
// Physical Device: Thay YOUR_COMPUTER_IP bằng IP máy tính của bạn
// Để lấy IP: Windows (ipconfig), Mac/Linux (ifconfig)

// Nếu 10.0.2.2 không hoạt động, thử dùng IP máy tính của bạn
// IP máy tính hiện tại: 192.168.0.182
const MANUAL_IP = '192.168.0.182'; // IP máy tính của bạn

const getBaseURL = () => {
  const platform = Platform.OS;
  
  // Android Emulator hoặc Physical Device
  if (platform === 'android') {
    // Nếu có MANUAL_IP được set, dùng nó (thường hoạt động tốt hơn 10.0.2.2)
    if (MANUAL_IP) {
      console.log(`Using MANUAL_IP for Android: ${MANUAL_IP}`);
      return `http://${MANUAL_IP}:8000/ba-todolist/api`;
    }
    // Android Emulator - 10.0.2.2 là IP đặc biệt để trỏ về localhost của máy host
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

