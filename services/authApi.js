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
  
  // Use AbortController for proper timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 30000); // 30 seconds timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify({
        username,
        password,
      }),
      signal: controller.signal, // Enable abort
    });

    clearTimeout(timeoutId); // Clear timeout if request succeeds
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
    clearTimeout(timeoutId); // Clear timeout in case of error
    
    // Log detailed error for debugging (only in console)
    const platform = Platform.OS;
    
    // Check if it's an abort error (timeout)
    const isTimeout = error.name === 'AbortError' || error.message.includes('aborted');
    const isNetworkError = error.message.includes('Network request failed') || 
                           error.message.includes('Failed to fetch') ||
                           error.message.includes('NetworkError') ||
                           error.message.includes('timeout');
    
    if (isTimeout || isNetworkError) {
      // Build troubleshooting guide as single string
      let troubleshootingGuide = '';
      
      if (platform === 'android') {
        troubleshootingGuide = `🔧 Troubleshooting Guide for Android:
📍 Trying to connect to: ${url}

1. ✅ Check if backend is running:
   cd App-ba
   mvn spring-boot:run

2. ✅ Test backend from computer:
   curl http://localhost:8000/ba-todolist/api/auth/login

3. ✅ For Android Emulator:
   - Try: http://10.0.2.2:8000/ba-todolist/api
   - Or use computer IP: http://192.168.1.242:8000/ba-todolist/api
   - Check MANUAL_IP in config/api.js

4. ✅ For Physical Device:
   - Ensure phone and computer are on same WiFi
   - Get computer IP: ipconfig (Windows) or ifconfig (Mac/Linux)
   - Update MANUAL_IP in config/api.js

5. ✅ Check Firewall:
   - Allow Java/Maven through firewall
   - Or temporarily disable firewall for testing

6. ✅ Verify IP address:
   - Run: ipconfig (Windows) to get current IP
   - Update MANUAL_IP in config/api.js if changed`;
      } else if (platform === 'ios') {
        troubleshootingGuide = `🔧 Troubleshooting Guide for iOS:
📍 Trying to connect to: ${url}

1. ✅ Check if backend is running:
   cd App-ba
   mvn spring-boot:run

2. ✅ Test backend:
   curl http://localhost:8000/ba-todolist/api/auth/login

3. ✅ For iOS Simulator:
   - If on Mac: Use http://localhost:8000/ba-todolist/api
   - If on Windows: Use computer IP: http://192.168.1.242:8000/ba-todolist/api
   - Check MANUAL_IP in config/api.js

4. ✅ For Physical Device:
   - Ensure device and computer are on same WiFi
   - Use computer IP instead of localhost
   - Update config/api.js to use computer IP: 192.168.1.242

5. ✅ Check Firewall:
   - Allow Java/Maven through firewall
   - Windows Firewall may block port 8000

6. ✅ Verify IP address:
   - Run: ipconfig (Windows) to get current IP
   - Update MANUAL_IP in config/api.js if changed`;
      } else {
        // Web platform
        troubleshootingGuide = `🔧 Troubleshooting Guide for Web:
📍 Trying to connect to: ${url}

1. ✅ Check if backend is running:
   cd App-ba
   mvn spring-boot:run

2. ✅ Test backend:
   curl http://localhost:8000/ba-todolist/api/auth/login

3. ✅ Check browser console:
   - Open Developer Tools (F12)
   - Check Network tab for request details

4. ✅ If backend runs on different machine:
   - Update config/api.js to use computer IP instead of localhost`;
      }
      
      // Log all troubleshooting info in ONE console.error call
      console.error(`=== Login Connection Error ===
Platform: ${platform}
Error Type: ${error.constructor.name}
Error Name: ${error.name}
Error Message: ${error.message}
Is Timeout: ${isTimeout}
Is Network Error: ${isNetworkError}
${troubleshootingGuide}
=====================================`);
      
      // Return short, user-friendly error message for alert
      if (isTimeout) {
        throw new Error('Kết nối timeout.\n\nVui lòng kiểm tra:\n• Backend có đang chạy không?\n• IP trong config/api.js có đúng không?\n• Firewall có chặn port 8000 không?\n\nXem console để biết thêm chi tiết.');
      } else {
        throw new Error('Không thể kết nối đến server.\n\nVui lòng kiểm tra:\n• Backend có đang chạy không?\n• Kết nối mạng có ổn định không?\n• IP trong config/api.js có đúng không?\n\nXem console để biết thêm chi tiết.');
      }
    }
    
    // For other errors, log basic info
    console.error(`Login error: ${error.message || error}`);
    console.error(`API URL: ${url}`);
    console.error(`Error name: ${error.name}`);
    
    // Return the original message (but truncate if too long)
    const errorMsg = error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
    const maxLength = 200;
    const finalErrorMsg = errorMsg.length > maxLength 
      ? errorMsg.substring(0, maxLength) + '...' 
      : errorMsg;
    throw new Error(finalErrorMsg);
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

