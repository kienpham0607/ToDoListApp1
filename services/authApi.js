import { API_BASE_URL } from '@/config/api';
import { Platform } from 'react-native';

/**
 * Login API
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<string>} JWT token
 */
export const login = async (username, password) => {
  const url = `${API_BASE_URL}/auth/login`;
  console.log('Attempting login to:', url);
  console.log('Request body:', { username, password: '***' });
  
  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout: Server did not respond within 10 seconds')), 10000);
  });

  try {
    // Race between fetch and timeout
    const fetchPromise = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);
    console.log('Response received, status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        // Try to parse as JSON first (ErrorResponse format)
        const errorJson = await response.json();
        console.error('Login failed - JSON:', errorJson);
        errorMessage = errorJson.message || errorJson.code || errorMessage;
        
        // Handle specific error codes
        if (errorJson.code === '400' && errorJson.message === 'WRONG_USER_OR_PASSWORD') {
          errorMessage = 'Invalid username or password. Please check your credentials.';
        }
      } catch (_) {
        // If not JSON, read as text
        const errorText = await response.text();
        console.error('Login failed - Text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const token = await response.text();
    console.log('Login successful, token received:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('Login error caught:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('API URL:', url);
    
    // Provide more helpful error messages
    if (error.message.includes('Network request failed') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('timeout') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed')) {
      const platform = Platform.OS;
      let troubleshooting = '';
      
      console.error('=== Connection Error Details ===');
      console.error('Platform:', platform);
      console.error('Trying URL:', url);
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('==============================');
      
      if (platform === 'android') {
        troubleshooting = `\n\n🔧 Hướng dẫn khắc phục cho Android:

1. ✅ Kiểm tra Backend có đang chạy không:
   cd App-ba
   mvn spring-boot:run
   
2. ✅ Test backend từ máy tính:
   curl http://localhost:8000/ba-todolist/api/auth/login
   
3. ✅ Nếu dùng Android Emulator:
   - URL nên là: http://10.0.2.2:8000/ba-todolist/api
   - Hoặc dùng IP máy tính: http://192.168.0.182:8000/ba-todolist/api
   - Kiểm tra MANUAL_IP trong config/api.js
   
4. ✅ Nếu dùng Physical Device (điện thoại thật):
   - Đảm bảo điện thoại và máy tính cùng WiFi
   - Lấy IP máy tính: ipconfig (Windows) hoặc ifconfig (Mac/Linux)
   - Cập nhật MANUAL_IP trong config/api.js với IP mới
   
5. ✅ Kiểm tra Firewall:
   - Cho phép Java/Maven qua firewall
   - Hoặc tạm thời tắt firewall để test`;
      } else if (platform === 'ios') {
        troubleshooting = `\n\n🔧 Hướng dẫn khắc phục cho iOS:

1. ✅ Kiểm tra Backend có đang chạy không:
   cd App-ba
   mvn spring-boot:run
   
2. ✅ Test backend:
   curl http://localhost:8000/ba-todolist/api/auth/login
   
3. ✅ Nếu dùng iOS Simulator:
   - URL: http://localhost:8000/ba-todolist/api
   - Đảm bảo backend đang chạy trên máy Mac
   
4. ✅ Nếu dùng Physical Device:
   - Dùng IP máy tính thay vì localhost
   - Cập nhật config/api.js để dùng IP máy tính`;
      } else {
        // Web platform
        troubleshooting = `\n\n🔧 Hướng dẫn khắc phục cho Web:

1. ✅ Kiểm tra Backend có đang chạy không:
   cd App-ba
   mvn spring-boot:run
   
2. ✅ Test backend:
   curl http://localhost:8000/ba-todolist/api/auth/login
   
3. ✅ Kiểm tra browser console:
   - Mở Developer Tools (F12)
   - Xem tab Network để kiểm tra request
   
4. ✅ Nếu backend chạy trên máy khác:
   - Cập nhật config/api.js để dùng IP máy tính thay vì localhost`;
      }
      
      const errorMsg = `❌ Không thể kết nối đến server.\n\n📍 Đang cố kết nối đến: ${url}\n\n${troubleshooting}\n\n💡 Xem file TROUBLESHOOTING.md để biết thêm chi tiết.`;
      throw new Error(errorMsg);
    }
    throw error;
  }
};

/**
 * Register API
 * @param {string} username - Username
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} fullName - Full name
 * @param {string} role - Role (admin, manager, member) - optional, defaults to member
 * @returns {Promise<string>} Success message or token
 */
export const register = async (username, email, password, fullName, role = 'member') => {
  const url = `${API_BASE_URL}/auth/register`;
  console.log('Attempting register to:', url);
  console.log('Register data:', { username, email, password: '***', fullName, role });
  
  try {
    const requestBody = {
      username,
      email,
      password,
      fullName,
      role: role || 'member', // Always include role, default to 'member'
    };
    
    console.log('Request body:', { ...requestBody, password: '***' });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        // Try to parse as JSON first (ErrorResponse format)
        const errorJson = await response.json();
        console.error('Register failed - JSON:', errorJson);
        errorMessage = errorJson.message || errorJson.code || errorMessage;
        
        // Handle specific error codes
        if (errorJson.code === '003' || errorJson.message === 'USER_IS_EXISTED') {
          errorMessage = 'Username or email already exists. Please use different credentials.';
        }
      } catch (_) {
        // If not JSON, read as text
        const errorText = await response.text();
        console.error('Register failed - Text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.text();
    console.log('Register successful');
    return result;
  } catch (error) {
    console.error('Register error:', error);
    console.error('API URL:', url);
    console.error('Error details:', error.message);
    
    // Provide more helpful error messages
    if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please ensure:\n1. Backend is running on port 8000\n2. You are using the correct URL for your device');
    }
    throw error;
  }
};

