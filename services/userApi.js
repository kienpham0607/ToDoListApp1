import { API_BASE_URL } from '@/config/api';

/**
 * Get current user info by ID
 * @param {string} token - JWT token
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User information
 */
export const getUserById = async (token, userId) => {
  const url = `${API_BASE_URL}/user/detail?id=${userId}`;
  console.log('Getting user info:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    console.log('Get user response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get user failed:', errorText);
      throw new Error(errorText || 'Failed to get user information');
    }

    const userData = await response.json();
    console.log('User data received:', userData);
    return userData;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

/**
 * Get user by username (workaround: search through paging)
 * @param {string} token - JWT token
 * @param {string} username - Username
 * @returns {Promise<Object>} User information
 */
export const getUserByUsername = async (token, username) => {
  // Workaround: Get all users and find by username
  // This is not efficient but works without modifying backend
  const url = `${API_BASE_URL}/user/paging?offset=0&limit=1000`;
  console.log('Searching user by username:', username);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get users');
    }

    const data = await response.json();
    const users = data.content || [];
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    console.log('User found:', user);
    return user;
  } catch (error) {
    console.error('Get user by username error:', error);
    throw error;
  }
};

/**
 * Update user profile API (for admin - requires userId)
 * @param {string} token - JWT token
 * @param {number} userId - User ID
 * @param {Object} updateData - Update data { username?, email?, password?, fullName?, role? }
 * @returns {Promise<Object>} Updated user information
 */
export const updateUser = async (token, userId, updateData) => {
  const url = `${API_BASE_URL}/user/update?id=${userId}`;
  console.log('Updating user (admin):', url);
  console.log('Update data:', { ...updateData, password: updateData.password ? '***' : undefined });
  console.log('User ID:', userId);
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(updateData),
    });

    console.log('Update user response status:', response.status);
    
    // Read response body once to avoid "Already read" error
    const responseText = await response.text();
    console.log('Update user response text length:', responseText.length);
    
    if (!response.ok) {
      let errorMessage = 'Failed to update profile';
      
      // If response is empty, provide more specific error based on status code
      if (!responseText || responseText.trim().length === 0) {
        if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your input.';
        } else if (response.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Forbidden. You do not have permission to perform this action.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Update failed with status ${response.status}. Please try again.`;
        }
        console.error('Update user failed - Empty response, status:', response.status);
      } else {
        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(responseText);
          console.error('Update user failed - JSON:', errorJson);
          errorMessage = errorJson.message || errorJson.code || errorMessage;
          
          if (errorJson.code === '003' || errorJson.message === 'USER_IS_EXISTED') {
            errorMessage = 'Username or email already exists. Please use different credentials.';
          }
        } catch (_) {
          // Not JSON, use text as error message
          console.error('Update user failed - Text:', responseText);
          errorMessage = responseText.trim() || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    // Parse successful response
    let userData;
    try {
      if (!responseText || responseText.trim().length === 0) {
        console.warn('Update user response is empty, but status is OK');
        userData = { id: userId, ...updateData };
      } else {
        userData = JSON.parse(responseText);
      }
      console.log('User updated successfully:', userData);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Invalid response from server');
    }
    
    return userData;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

/**
 * Update current user's own profile API (for regular users - no userId needed)
 * @param {string} token - JWT token
 * @param {Object} updateData - Update data { username?, email?, password?, fullName? }
 * @returns {Promise<Object>} Updated user information
 */
export const updateMyProfile = async (token, updateData) => {
  const url = `${API_BASE_URL}/user/profile`;
  console.log('Updating my profile:', url);
  console.log('Update data:', { ...updateData, password: updateData.password ? '***' : undefined });
  console.log('Token present:', !!token);
  console.log('Token length:', token ? token.length : 0);
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(updateData),
    });

    console.log('Update my profile response status:', response.status);
    console.log('Update my profile response headers:', Object.fromEntries(response.headers.entries()));
    
    // Read response body once to avoid "Already read" error
    const responseText = await response.text();
    console.log('Update my profile response text length:', responseText.length);
    
    if (!response.ok) {
      let errorMessage = 'Failed to update profile';
      
      // If response is empty, provide more specific error based on status code
      if (!responseText || responseText.trim().length === 0) {
        if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your input.';
        } else if (response.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Forbidden. You do not have permission or your token is invalid/expired.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Update failed with status ${response.status}. Please try again.`;
        }
        console.error('Update my profile failed - Empty response, status:', response.status);
      } else {
        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(responseText);
          console.error('Update my profile failed - JSON:', errorJson);
          errorMessage = errorJson.message || errorJson.code || errorMessage;
          
          if (errorJson.code === '003' || errorJson.message === 'USER_IS_EXISTED') {
            if (updateData.password && !updateData.username && !updateData.email) {
              errorMessage = 'Failed to update password. Please try again.';
            } else {
              errorMessage = 'Username or email already exists. Please use different credentials.';
            }
          }
        } catch (_) {
          // Not JSON, use text as error message
          console.error('Update my profile failed - Text:', responseText);
          errorMessage = responseText.trim() || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    // Parse successful response
    let userData;
    try {
      if (!responseText || responseText.trim().length === 0) {
        console.warn('Update my profile response is empty, but status is OK');
        userData = { ...updateData };
      } else {
        userData = JSON.parse(responseText);
      }
      console.log('My profile updated successfully:', userData);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Invalid response from server');
    }
    
    return userData;
  } catch (error) {
    console.error('Update my profile error:', error);
    throw error;
  }
};

