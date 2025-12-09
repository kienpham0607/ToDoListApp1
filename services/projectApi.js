import { API_BASE_URL } from '@/config/api';

/**
 * Create a new project (team)
 * @param {string} token - JWT token
 * @param {Object} projectData - Project data
 * @param {string} projectData.name - Project name (required)
 * @param {string} projectData.description - Project description (optional)
 * @param {string} projectData.startDate - Start date (YYYY-MM-DD format, optional)
 * @param {string} projectData.endDate - End date (YYYY-MM-DD format, optional)
 * @returns {Promise<Object>} Created project response
 */
export const createProject = async (token, projectData) => {
  const url = `${API_BASE_URL}/project/create`;
  console.log('Creating project (team):', url);
  console.log('Project data:', projectData);
  
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  if (!projectData.name || projectData.name.trim() === '') {
    throw new Error('Project name is required');
  }

  const requestBody = {
    name: projectData.name.trim(),
    description: projectData.description && projectData.description.trim() 
      ? projectData.description.trim() 
      : null,
    startDate: projectData.startDate || null,
    endDate: projectData.endDate || null,
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

    console.log('Create project response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to create project';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.code || errorMessage;
      } catch (_) {
        const errorText = await response.text();
        errorMessage = errorText.trim() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const projectResponse = await response.json();
    console.log('Project created successfully:', projectResponse);
    return projectResponse;
  } catch (error) {
    console.error('Create project error:', error);
    throw error;
  }
};

/**
 * Get projects with paging
 * @param {string} token - JWT token
 * @param {number} offset - Offset for paging
 * @param {number} limit - Limit for paging
 * @returns {Promise<Object>} Projects page response
 */
export const getProjects = async (token, offset = 0, limit = 1000) => {
  const url = `${API_BASE_URL}/project/paging?offset=${offset}&limit=${limit}`;
  console.log('Getting projects:', url);

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

    console.log('Get projects response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch projects';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.code || errorMessage;
      } catch (_) {
        const errorText = await response.text();
        errorMessage = errorText.trim() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const projectsPage = await response.json();
    console.log('Projects received:', projectsPage);
    return projectsPage;
  } catch (error) {
    console.error('Get projects error:', error);
    throw error;
  }
};

/**
 * Delete a project (team)
 * @param {string} token - JWT token
 * @param {number} projectId - Project ID to delete
 * @returns {Promise<void>}
 */
export const deleteProject = async (token, projectId) => {
  const url = `${API_BASE_URL}/project/delete?id=${projectId}`;
  console.log('Deleting project:', url);
  console.log('Project ID:', projectId);
  
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  if (!projectId) {
    throw new Error('Project ID is required');
  }

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    console.log('Delete project response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to delete project';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.code || errorMessage;
      } catch (_) {
        const errorText = await response.text();
        errorMessage = errorText.trim() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('Project deleted successfully');
  } catch (error) {
    console.error('Delete project error:', error);
    throw error;
  }
};

/**
 * Get a project by ID
 * @param {string} token - JWT token
 * @param {number} projectId - Project ID
 * @returns {Promise<Object>} Project response
 */
export const getProjectById = async (token, projectId) => {
  const url = `${API_BASE_URL}/project/detail?id=${projectId}`;
  console.log('Getting project by ID:', url);

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

    console.log('Get project by ID response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch project';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.code || errorMessage;
      } catch (_) {
        const errorText = await response.text();
        errorMessage = errorText.trim() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const projectResponse = await response.json();
    console.log('Project received:', projectResponse);
    return projectResponse;
  } catch (error) {
    console.error('Get project by ID error:', error);
    throw error;
  }
};

/**
 * Update a project
 * @param {string} token - JWT token
 * @param {number} projectId - Project ID to update
 * @param {Object} projectData - Project data to update
 * @param {string} projectData.name - Project name (optional)
 * @param {string} projectData.description - Project description (optional)
 * @param {string} projectData.startDate - Start date (YYYY-MM-DD format, optional)
 * @param {string} projectData.endDate - End date (YYYY-MM-DD format, optional)
 * @returns {Promise<Object>} Updated project response
 */
export const updateProject = async (token, projectId, projectData) => {
  const url = `${API_BASE_URL}/project/update?id=${projectId}`;
  console.log('Updating project:', url);
  console.log('Project ID:', projectId);
  console.log('Project data:', projectData);

  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const requestBody = {};
  if (projectData.name !== undefined) {
    requestBody.name = projectData.name.trim();
  }
  if (projectData.description !== undefined) {
    requestBody.description = projectData.description && projectData.description.trim() 
      ? projectData.description.trim() 
      : null;
  }
  if (projectData.startDate !== undefined) {
    requestBody.startDate = projectData.startDate || null;
  }
  if (projectData.endDate !== undefined) {
    requestBody.endDate = projectData.endDate || null;
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Update project response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to update project';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.code || errorMessage;
      } catch (_) {
        const errorText = await response.text();
        errorMessage = errorText.trim() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const projectResponse = await response.json();
    console.log('Project updated successfully:', projectResponse);
    return projectResponse;
  } catch (error) {
    console.error('Update project error:', error);
    throw error;
  }
};

