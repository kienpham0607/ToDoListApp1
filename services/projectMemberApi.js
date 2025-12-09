import { API_BASE_URL } from '@/config/api';

/**
 * Add a member to a project (team)
 * @param {string} token - JWT token
 * @param {Object} memberData - Member data
 * @param {string} memberData.projectName - Project name (required)
 * @param {string} memberData.memberName - Username of the member to add (required)
 * @returns {Promise<Object>} Created project member response
 */
export const addProjectMember = async (token, memberData) => {
  const url = `${API_BASE_URL}/project-member/create`;
  console.log('Adding project member:', url);
  console.log('Member data:', memberData);
  
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  if (!memberData.projectName || memberData.projectName.trim() === '') {
    throw new Error('Project name is required');
  }
  if (!memberData.memberName || memberData.memberName.trim() === '') {
    throw new Error('Member name (username) is required');
  }

  const requestBody = {
    projectName: memberData.projectName.trim(),
    memberName: memberData.memberName.trim(),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Add project member response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to add member to project';
      let errorDetails = null;
      
      // Read response as text first to avoid "Already read" error
      const responseText = await response.text();
      console.error('Add project member failed - Response text:', responseText);
      
      try {
        // Try to parse as JSON
        const errorJson = JSON.parse(responseText);
        console.error('Add project member failed - JSON:', errorJson);
        errorMessage = errorJson.message || errorJson.code || errorMessage;
        errorDetails = errorJson.details || null;
        
        // Handle specific error codes
        if (response.status === 404) {
          if (errorJson.code === '001' || errorJson.code === 'NOT_FOUND' || errorMessage.includes('NOT_FOUND')) {
            errorMessage = 'Project or user not found';
            errorDetails = 'Please check that the team name and username are correct';
          }
        } else if (response.status === 400) {
          // Check for duplicate member error
          if (errorJson.code === 'MEMBER_ALREADY_EXISTS' || 
              errorMessage.includes('MEMBER_ALREADY_EXISTS') ||
              errorMessage.includes('THIS_PERSON_DOES_NOT_BELONG_TO_THE_PROJECT') || 
              errorMessage.includes('already') || 
              errorMessage.includes('duplicate') ||
              errorMessage.includes('existed')) {
            errorMessage = 'User is already a member of this team';
            errorDetails = 'This user has already been added to the team';
          } else {
            errorMessage = errorMessage || 'Invalid request';
            errorDetails = errorDetails || 'Please check your input';
          }
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed';
          errorDetails = 'Your session has expired. Please login again';
        } else if (response.status === 403) {
          errorMessage = 'Access denied';
          errorDetails = 'Your token may be invalid or expired. Please login again';
        }
      } catch (parseError) {
        // If not JSON or empty response, use default error message based on status
        console.error('Failed to parse error response as JSON:', parseError);
        if (!responseText || responseText.trim() === '') {
          // Empty response - use status-based default messages
          if (response.status === 403) {
            errorMessage = 'Access denied';
            errorDetails = 'Your token may be invalid or expired. Please login again';
          } else if (response.status === 401) {
            errorMessage = 'Authentication failed';
            errorDetails = 'Your session has expired. Please login again';
          } else {
            errorMessage = errorMessage || 'Request failed';
            errorDetails = errorDetails || 'Please try again';
          }
        } else {
          errorMessage = responseText.trim() || errorMessage;
        }
      }
      
      const error = new Error(errorMessage);
      error.details = errorDetails;
      error.status = response.status;
      throw error;
    }

    const memberResponse = await response.json();
    console.log('Project member added successfully:', memberResponse);
    return memberResponse;
  } catch (error) {
    console.error('Add project member error:', error);
    console.error('Error status:', error?.status);
    console.error('Error details:', error?.details);
    // Preserve status and details when re-throwing
    if (error.status !== undefined) {
      const newError = new Error(error.message || 'Failed to add member to project');
      newError.status = error.status;
      newError.details = error.details;
      throw newError;
    }
    throw error;
  }
};

/**
 * Get project members with paging
 * @param {string} token - JWT token
 * @param {number} offset - Offset for paging
 * @param {number} limit - Limit for paging
 * @returns {Promise<Object>} Project members page response
 */
export const getProjectMembers = async (token, offset = 0, limit = 1000) => {
  const url = `${API_BASE_URL}/project-member/paging?offset=${offset}&limit=${limit}`;
  console.log('Getting project members:', url);

  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    console.log('Get project members response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch project members';
      
      // Read response as text first to avoid "Already read" error
      const responseText = await response.text();
      console.error('Get project members failed - Response text:', responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.message || errorJson.code || errorMessage;
      } catch (parseError) {
        console.error('Failed to parse error response as JSON:', parseError);
        errorMessage = responseText.trim() || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const membersPage = await response.json();
    console.log('Project members received:', membersPage);
    return membersPage;
  } catch (error) {
    console.error('Get project members error:', error);
    throw error;
  }
};

/**
 * Get all users (for selecting members to add to team)
 * @param {string} token - JWT token
 * @param {number} offset - Offset for paging
 * @param {number} limit - Limit for paging
 * @returns {Promise<Object>} Users page response
 */
export const getAllUsers = async (token, offset = 0, limit = 1000) => {
  const url = `${API_BASE_URL}/user/paging?offset=${offset}&limit=${limit}`;
  console.log('Getting all users:', url);

  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    console.log('Get all users response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch users';
      
      // Read response as text first to avoid "Already read" error
      const responseText = await response.text();
      console.error('Get all users failed - Response text:', responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.message || errorJson.code || errorMessage;
      } catch (parseError) {
        console.error('Failed to parse error response as JSON:', parseError);
        errorMessage = responseText.trim() || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const usersPage = await response.json();
    console.log('Users received:', usersPage);
    return usersPage;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Get project members by project ID
 * @param {string} token - JWT token
 * @param {number} projectId - Project ID
 * @returns {Promise<Array>} Array of project members
 */
export const getProjectMembersByProjectId = async (token, projectId) => {
  const url = `${API_BASE_URL}/project-member/by-project?projectId=${projectId}`;
  console.log('Getting project members by project ID:', url);
  console.log('Token present:', !!token);
  console.log('Token length:', token ? token.length : 0);
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  if (!projectId) {
    throw new Error('Project ID is required');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    console.log('Get project members by project ID response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch project members';
      
      // Read response as text first to avoid "Already read" error
      const responseText = await response.text();
      console.error('Get project members by project ID failed - Response text:', responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.message || errorJson.code || errorMessage;
      } catch (parseError) {
        console.error('Failed to parse error response as JSON:', parseError);
        errorMessage = responseText.trim() || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const members = await response.json();
    console.log('Project members by project ID received:', members.length);
    return members;
  } catch (error) {
    console.error('Get project members by project ID error:', error);
    throw error;
  }
};

