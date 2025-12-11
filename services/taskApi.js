import { API_BASE_URL } from '@/config/api';

/**
 * Create a new task
 * @param {string} token - JWT token
 * @param {Object} taskData - Task data
 * @param {string} taskData.projectName - Project name (empty string for personal tasks)
 * @param {string} taskData.name - Task name
 * @param {string} taskData.description - Task description
 * @param {string} taskData.assignedTo - Assigned user (username or fullName for personal tasks)
 * @param {string} taskData.dueDate - Due date (YYYY-MM-DD format)
 * @param {string} taskData.priority - Task priority ('low', 'medium', 'high')
 * @returns {Promise<Object>} Created task response
 */
export const createTask = async (token, taskData) => {
  const url = `${API_BASE_URL}/task/create`;

  // Validate required fields before sending
  if (!taskData.name || taskData.name.trim() === '') {
    throw new Error('Task name is required');
  }
  if ((!taskData.assignedTo || taskData.assignedTo.trim() === '') && !taskData.assigneeId) {
    throw new Error('AssignedTo or AssigneeId is required');
  }

  // Prepare request body
  // Note: Priority is optional - backend will use default (medium) if not provided
  const validPriorities = ['low', 'medium', 'high'];
  let priorityValue = null;
  if (taskData.priority) {
    const normalizedPriority = taskData.priority.toLowerCase().trim();
    if (validPriorities.includes(normalizedPriority)) {
      priorityValue = normalizedPriority;
    }
  }

  // Prepare projectName - empty string for personal tasks, null if not provided
  const projectName = taskData.projectName !== undefined && taskData.projectName !== null
    ? taskData.projectName.trim()
    : '';

  // Prepare description - null if empty, otherwise trimmed value
  const description = taskData.description && taskData.description.trim()
    ? taskData.description.trim()
    : null;

  const requestBody = {
    projectName: projectName,
    projectId: taskData.projectId || null,
    name: taskData.name.trim(),
    assignedTo: taskData.assignedTo ? taskData.assignedTo.trim() : null,
    assigneeId: taskData.assigneeId || null,
    dueDate: taskData.dueDate || null,
  };

  // Only add description if it's not null
  if (description !== null) {
    requestBody.description = description;
  }

  // Only add priority if it's valid, otherwise let backend use default
  if (priorityValue) {
    requestBody.priority = priorityValue;
  }

  console.log('Creating task:', url);
  console.log('Task data:', {
    ...requestBody,
    assignedTo: requestBody.assignedTo || '***',
    priority: requestBody.priority || 'not included (will use default)'
  });
  console.log('Request body JSON:', JSON.stringify(requestBody));
  console.log('Request body keys:', Object.keys(requestBody));
  console.log('Name:', requestBody.name, 'Length:', requestBody.name?.length);
  console.log('AssignedTo:', requestBody.assignedTo, 'Length:', requestBody.assignedTo?.length);
  console.log('DueDate:', requestBody.dueDate);

  console.log('Token being sent:', token ? token.substring(0, 20) + '...' : 'null');

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

    console.log('Create task response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Không thể tạo task';
      let errorDetails = null;

      try {
        const errorJson = await response.json();
        console.error('Create task failed - JSON:', errorJson);
        console.error('Request data that failed:', requestBody);

        // Parse error message from backend
        const backendMessage = errorJson.message || errorJson.code || '';
        const errorCode = errorJson.code || '';
        const status = response.status;

        // Map error codes to user-friendly Vietnamese messages with SPECIFIC error details
        if (errorCode === '400' || status === 400) {
          // Check error details field if available
          const errorDetailsField = errorJson.details || null;

          if (backendMessage === 'Invalid input data' || backendMessage.includes('Invalid')) {
            // Determine SPECIFIC validation failure from request data
            const specificErrors = [];

            // Check name field
            if (!requestBody.name || requestBody.name.trim() === '') {
              specificErrors.push('Tên task không được để trống');
            }

            // Check assignedTo field
            if (!requestBody.assignedTo || requestBody.assignedTo.trim() === '') {
              specificErrors.push('Người được gán không được để trống');
            }

            // Check dueDate field
            if (requestBody.dueDate) {
              const dueDate = new Date(requestBody.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              dueDate.setHours(0, 0, 0, 0);
              if (dueDate < today) {
                specificErrors.push('Ngày hết hạn không được trong quá khứ');
              }
            }

            // If we found specific errors, show them (without "Dữ liệu không hợp lệ" title)
            if (specificErrors.length > 0) {
              errorMessage = specificErrors[0]; // Use first error as title
              errorDetails = specificErrors.length > 1 ? specificErrors.slice(1).join('\n• ') : null;
            } else if (errorDetailsField) {
              // Use backend details if available
              errorMessage = String(errorDetailsField).split('\n')[0] || 'Lỗi validation';
              errorDetails = String(errorDetailsField).split('\n').slice(1).join('\n') || null;
            } else {
              // Fallback to general message
              errorMessage = 'Vui lòng kiểm tra lại thông tin đã nhập';
              errorDetails = null;
            }
          } else if (backendMessage.includes('name') || backendMessage.includes('Name')) {
            errorMessage = 'Tên task không hợp lệ';
            errorDetails = 'Tên task không được để trống. Vui lòng nhập tên task.';
          } else if (backendMessage.includes('assignedTo') || backendMessage.includes('AssignedTo')) {
            errorMessage = 'Người được gán không hợp lệ';
            errorDetails = 'Người được gán không được để trống hoặc không tìm thấy người dùng. Vui lòng thử lại.';
          } else if (backendMessage.includes('date') || backendMessage.includes('Date') || backendMessage.includes('due')) {
            errorMessage = 'Ngày hết hạn không hợp lệ';
            errorDetails = 'Ngày hết hạn không được trong quá khứ. Vui lòng chọn ngày hôm nay hoặc ngày trong tương lai.';
          } else {
            errorMessage = backendMessage || 'Dữ liệu không hợp lệ';
            errorDetails = errorDetailsField || 'Vui lòng kiểm tra lại thông tin đã nhập';
          }
        } else if (errorCode === '404' || status === 404) {
          if (backendMessage.includes('NOT_FOUND') || backendMessage.includes('not found')) {
            errorMessage = 'Không tìm thấy';
            errorDetails = 'Không tìm thấy người dùng hoặc dự án. Vui lòng thử lại.';
          } else {
            errorMessage = 'Không tìm thấy tài nguyên';
          }
        } else if (errorCode === '401' || status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn';
          errorDetails = 'Vui lòng đăng nhập lại';
        } else if (errorCode === '403' || status === 403) {
          errorMessage = 'Không có quyền thực hiện';
          errorDetails = 'Bạn không có quyền tạo task này';
        } else if (errorCode === '500' || status === 500) {
          errorMessage = 'Lỗi server';
          errorDetails = 'Đã xảy ra lỗi trên server. Vui lòng thử lại sau.';
        } else {
          errorMessage = backendMessage || `Lỗi không xác định (${status})`;
        }
      } catch (_) {
        const errorText = await response.text();
        console.error('Create task failed - Text:', errorText);

        // Try to provide user-friendly message even from text response
        if (errorText.includes('Invalid') || errorText.includes('invalid')) {
          errorMessage = 'Dữ liệu không hợp lệ';
          errorDetails = 'Vui lòng kiểm tra lại thông tin đã nhập';
        } else {
          errorMessage = errorText.trim() || errorMessage;
        }
      }

      // Create error object with message and details
      const error = new Error(errorMessage);
      error.details = errorDetails;
      throw error;
    }

    const taskResponse = await response.json();
    console.log('Task created successfully:', taskResponse);
    return taskResponse;
  } catch (error) {
    console.error('Create task error:', error);

    // If error already has message and details, just rethrow it
    if (error.message && (error.details !== undefined || error.message !== 'Failed to create task')) {
      throw error;
    }

    // Handle network errors and other unexpected errors
    let errorMessage = 'Không thể tạo task';
    let errorDetails = null;

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Lỗi kết nối';
      errorDetails = 'Không thể kết nối đến server. Vui lòng kiểm tra:\n• Kết nối mạng\n• Backend có đang chạy không';
    } else if (error.message) {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.details = errorDetails;
    throw enhancedError;
  }
};

/**
 * Get tasks with paging
 * @param {string} token - JWT token
 * @param {number} offset - Offset for paging
 * @param {number} limit - Limit for paging
 * @returns {Promise<Object>} Tasks page response
 */
export const getTasks = async (token, offset = 0, limit = 100) => {
  const url = `${API_BASE_URL}/task/paging?offset=${offset}&limit=${limit}`;
  console.log('Getting tasks:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    console.log('Get tasks response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Không thể tải danh sách task';
      let errorDetails = null;

      try {
        const errorJson = await response.json();
        console.error('Get tasks failed - JSON:', errorJson);

        const backendMessage = errorJson.message || errorJson.code || '';
        const status = response.status;

        if (status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn';
          errorDetails = 'Vui lòng đăng nhập lại';
        } else if (status === 403) {
          errorMessage = 'Không có quyền truy cập';
          errorDetails = 'Bạn không có quyền xem tasks này';
        } else if (status === 500) {
          errorMessage = 'Lỗi server';
          errorDetails = 'Đã xảy ra lỗi trên server. Vui lòng thử lại sau.';
        } else {
          errorMessage = backendMessage || errorMessage;
        }
      } catch (_) {
        const errorText = await response.text();
        console.error('Get tasks failed - Text:', errorText);
        errorMessage = errorText.trim() || errorMessage;
      }

      const error = new Error(errorMessage);
      error.details = errorDetails;
      throw error;
    }

    const tasksPage = await response.json();
    console.log('Tasks received:', tasksPage);
    return tasksPage;
  } catch (error) {
    console.error('Get tasks error:', error);

    // If error already has message and details, just rethrow it
    if (error.message && (error.details !== undefined || error.message !== 'Failed to fetch tasks')) {
      throw error;
    }

    // Handle network errors and other unexpected errors
    let errorMessage = 'Không thể tải danh sách task';
    let errorDetails = null;

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Lỗi kết nối';
      errorDetails = 'Không thể kết nối đến server. Vui lòng kiểm tra:\n• Kết nối mạng\n• Backend có đang chạy không';
    } else if (error.message) {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.details = errorDetails;
    throw enhancedError;
  }
};

/**
 * Update a task
 * @param {string} token - JWT token
 * @param {number} taskId - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task response
 */
export const updateTask = async (token, taskId, taskData) => {
  const url = `${API_BASE_URL}/task/update?id=${taskId}`;
  console.log('Updating task:', url);
  console.log('Update task - token exists:', !!token);
  console.log('Update task - taskId:', taskId);
  console.log('Update task - taskData:', JSON.stringify(taskData, null, 2));

  if (!token) {
    throw new Error('Token is required to update a task');
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(taskData),
    });

    console.log('Update task response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to update task';
      try {
        const errorJson = await response.json();
        console.error('Update task failed - JSON:', errorJson);
        errorMessage = errorJson.message || errorJson.code || errorMessage;
      } catch (_) {
        const errorText = await response.text();
        console.error('Update task failed - Text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const taskResponse = await response.json();
    console.log('Task updated successfully:', taskResponse);
    return taskResponse;
  } catch (error) {
    console.error('Update task error:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} token - JWT token
 * @param {number} taskId - Task ID
 * @returns {Promise<void>}
 */
export const deleteTask = async (token, taskId) => {
  const url = `${API_BASE_URL}/task/delete?id=${taskId}`;
  console.log('Deleting task:', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });

    console.log('Delete task response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Không thể xóa task';
      let errorDetails = null;

      try {
        const errorJson = await response.json();
        console.error('Delete task failed - JSON:', errorJson);

        const backendMessage = errorJson.message || errorJson.code || '';
        const status = response.status;

        if (status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn';
          errorDetails = 'Vui lòng đăng nhập lại';
        } else if (status === 403) {
          errorMessage = 'Không có quyền xóa';
          errorDetails = 'Bạn không có quyền xóa task này';
        } else if (status === 404) {
          errorMessage = 'Không tìm thấy task';
          errorDetails = 'Task này có thể đã bị xóa';
        } else if (status === 500) {
          errorMessage = 'Lỗi server';
          errorDetails = 'Đã xảy ra lỗi trên server. Vui lòng thử lại sau.';
        } else {
          errorMessage = backendMessage || errorMessage;
        }
      } catch (_) {
        const errorText = await response.text();
        console.error('Delete task failed - Text:', errorText);
        errorMessage = errorText.trim() || errorMessage;
      }

      const error = new Error(errorMessage);
      error.details = errorDetails;
      throw error;
    }

    console.log('Task deleted successfully');
  } catch (error) {
    console.error('Delete task error:', error);

    // If error already has message and details, just rethrow it
    if (error.message && (error.details !== undefined || error.message !== 'Failed to delete task')) {
      throw error;
    }

    // Handle network errors and other unexpected errors
    let errorMessage = 'Không thể xóa task';
    let errorDetails = null;

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Lỗi kết nối';
      errorDetails = 'Không thể kết nối đến server. Vui lòng kiểm tra:\n• Kết nối mạng\n• Backend có đang chạy không';
    } else if (error.message) {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.details = errorDetails;
    throw enhancedError;
  }
};

