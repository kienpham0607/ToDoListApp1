import { API_BASE_URL } from '@/config/api';

/**
 * Get list of users with pagination (Admin only)
 * @param {string} token - JWT token
 * @param {number} offset - Page offset (default: 0)
 * @param {number} limit - Page size (default: 10)
 * @returns {Promise<Object>} Paginated user list { content: [], totalElements, totalPages, ... }
 */
export const getUsersList = async (token, offset = 0, limit = 10) => {
  const url = `${API_BASE_URL}/user/paging?offset=${offset}&limit=${limit}`;
  console.log('Getting users list:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    console.log('Get users list response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get users list failed:', errorText);
      throw new Error(errorText || 'Failed to get users list');
    }

    const data = await response.json();
    console.log('Users list received:', data);
    return data;
  } catch (error) {
    console.error('Get users list error:', error);
    throw error;
  }
};

/**
 * Create new user (Admin only)
 * @param {string} token - JWT token
 * @param {Object} userData - User data { username, email, password, fullName }
 * @returns {Promise<Object>} Created user information
 */
export const createUser = async (token, userData) => {
  const url = `${API_BASE_URL}/user/create`;
  console.log('Creating user:', url);
  console.log('User data:', { ...userData, password: '***' });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(userData),
    });

    console.log('Create user response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to create user';
      try {
        const errorJson = await response.json();
        console.error('Create user failed - JSON:', errorJson);
        errorMessage = errorJson.message || errorJson.code || errorMessage;
        
        // Handle specific error codes
        if (errorJson.code === '003' || errorJson.message === 'USER_IS_EXISTED') {
          errorMessage = 'Username or email already exists. Please use different credentials.';
        }
      } catch (_) {
        const errorText = await response.text();
        console.error('Create user failed - Text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const createdUser = await response.json();
    console.log('User created successfully:', createdUser);
    return createdUser;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

/**
 * Delete user (Admin only)
 * @param {string} token - JWT token
 * @param {number} userId - User ID to delete
 * @returns {Promise<void>}
 */
export const deleteUser = async (token, userId) => {
  const url = `${API_BASE_URL}/user/delete?id=${userId}`;
  console.log('Deleting user:', url);
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    console.log('Delete user response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete user failed:', errorText);
      throw new Error(errorText || 'Failed to delete user');
    }

    console.log('User deleted successfully');
    return true;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

