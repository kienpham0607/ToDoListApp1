import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { loadToken } from '@/store/authSlice';
import { createNewTask, fetchTasks, deleteExistingTask, updateExistingTask, selectMyTasks, selectTasksLoading, selectTasksError, clearError } from '@/store/taskSlice';

export default function MyTasksScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, token, username, userInfo } = useSelector((state) => state.auth);
  const myTasks = useSelector(selectMyTasks);
  const tasksLoading = useSelector(selectTasksLoading);
  const tasksError = useSelector(selectTasksError);

  // Get username from state or userInfo
  const currentUsername = username || userInfo?.username || null;

  // Load token when component mounts if not already loaded
  useEffect(() => {
    if (!token && !isAuthenticated) {
      console.log('MyTasks: No token found, loading token from storage...');
      dispatch(loadToken());
    }
  }, [token, isAuthenticated, dispatch]);

  // Only redirect to login if we're sure there's no token after loading attempt
  // Give a small delay to allow token to load
  useEffect(() => {
    if (!isAuthenticated && !token) {
      const timer = setTimeout(() => {
        // Double check - if still not authenticated after delay, redirect
        if (!isAuthenticated && !token) {
          console.log('MyTasks: Still not authenticated after token load attempt, redirecting to login');
          router.replace('/login');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, token, router]);

  // Fetch tasks when component mounts and token is available
  useEffect(() => {
    if (token && isAuthenticated) {
      console.log('MyTasks: Fetching tasks...');
      dispatch(fetchTasks({ token, offset: 0, limit: 100 }))
        .catch((error) => {
          console.error('MyTasks: Failed to fetch tasks:', error);
          // Error will be handled by tasksError useEffect
        });
    }
  }, [token, isAuthenticated, dispatch]);

  // Reload tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token && isAuthenticated) {
        console.log('MyTasks: Screen focused, refreshing tasks...');
        dispatch(fetchTasks({ token, offset: 0, limit: 100 }))
          .catch((error) => {
            console.error('MyTasks: Failed to refresh tasks:', error);
            // Error will be handled by tasksError useEffect
          });
      }
    }, [token, isAuthenticated, dispatch])
  );

  // Show error toast if there's an error - ALWAYS display errors to user
  useEffect(() => {
    if (tasksError) {
      console.log('MyTasks: Displaying error to user:', tasksError);

      // Extract clean error message and details
      let errorMessage = 'Đã xảy ra lỗi';
      let errorDetails = 'Vui lòng thử lại sau';

      // Handle object error format
      if (typeof tasksError === 'object' && tasksError !== null) {
        errorMessage = String(tasksError.message || errorMessage);
        errorDetails = String(tasksError.details || errorDetails);

        // If message contains JSON string, try to parse it
        if (errorMessage.includes('{') && errorMessage.includes('}')) {
          try {
            const parsed = JSON.parse(errorMessage);
            if (parsed.message) errorMessage = String(parsed.message);
            if (parsed.details) errorDetails = String(parsed.details);
          } catch (_e) {
            // If parsing fails, clean up the message
            errorMessage = errorMessage.replace(/^.*?"message"\s*:\s*"([^"]+)".*$/i, '$1');
          }
        }
      }
      // Handle string error format
      else if (typeof tasksError === 'string') {
        errorMessage = tasksError;
      }

      // Clean up error messages - ensure user-friendly format
      errorMessage = errorMessage.trim() || 'Đã xảy ra lỗi';
      errorDetails = errorDetails.trim() || 'Vui lòng thử lại sau';

      // Always show error toast - ensure it's visible and user-friendly (top right corner)
      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: errorDetails,
        position: 'top',
        visibilityTime: errorDetails && errorDetails !== 'Vui lòng thử lại sau' ? 6000 : 4000,
        topOffset: 60,
        onHide: () => {
          console.log('MyTasks: Error toast hidden, clearing error');
          dispatch(clearError());
        },
      });
    }
  }, [tasksError, dispatch]);

  // Map API tasks to display format
  const tasks = useMemo(() => {
    return myTasks.map((task) => {
      // Map progress to status
      let status = 'To Do';
      if (task.progress === 100) {
        status = 'Completed';
      } else if (task.progress > 0) {
        status = 'In Progress';
      }

      // Map backend priority (low, medium, high) to UI format (Low, Medium, High)
      const priorityMap = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
      };
      const displayPriority = priorityMap[task.priority] || 'Medium';

      return {
        id: task.id, // Keep as number for API calls
        idString: String(task.id), // String version for React key
        title: task.name || '',
        description: task.description || '',
        priority: displayPriority.toLowerCase(), // Use priority from API
        category: 'Personal', // Personal tasks
        status: status,
        due: task.dueDate || '',
        progress: task.progress || 0,
        originalTask: task, // Keep reference to original task data
      };
    });
  }, [myTasks]);

  // Handle delete task - show confirmation dialog
  const handleDeleteTask = useCallback((taskId, taskTitle) => {
    console.log('handleDeleteTask called:', { taskId, taskTitle, hasToken: !!token });

    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to delete a task',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    // Ensure taskId is a number
    const id = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;

    if (!id || isNaN(id)) {
      console.error('Invalid taskId:', taskId);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'ID task không hợp lệ',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    console.log('Setting task to delete:', { id, title: taskTitle });
    const taskData = { id, title: taskTitle };
    setTaskToDelete(taskData);
    taskToDeleteRef.current = taskData; // Also store in ref
    setShowDeleteConfirm(true);
  }, [token]);

  // Confirm delete task - use ref to avoid closure issues
  const confirmDeleteTask = useCallback(async () => {
    if (!token) {
      console.error('Delete task: Missing token');
      setShowDeleteConfirm(false);
      return;
    }

    // Get taskToDelete from ref first (most reliable), fallback to state
    const currentTask = taskToDeleteRef.current || taskToDelete;

    if (!currentTask) {
      console.error('Delete task: Missing taskToDelete', {
        fromRef: taskToDeleteRef.current,
        fromState: taskToDelete
      });
      setShowDeleteConfirm(false);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tìm thấy thông tin task để xóa',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    // Ensure taskId is a number
    const taskId = typeof currentTask.id === 'string' ? parseInt(currentTask.id, 10) : currentTask.id;

    if (!taskId || isNaN(taskId)) {
      console.error('Delete task: Invalid taskId', currentTask.id);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'ID task không hợp lệ',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    const taskTitle = currentTask.title || 'task';
    console.log('Delete task: Attempting to delete task', { taskId, taskTitle, currentTask });

    // Don't close modal yet - wait until after successful deletion
    // This prevents state from being reset before the function completes

    try {
      await dispatch(deleteExistingTask({ token, taskId })).unwrap();

      // Close modal and clear state only after successful deletion
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      taskToDeleteRef.current = null; // Also clear ref

      // Refresh tasks list after successful deletion
      console.log('Delete successful, refreshing tasks...');
      await dispatch(fetchTasks({ token, offset: 0, limit: 100 }));

      Toast.show({
        type: 'success',
        text1: 'Task Deleted',
        text2: `"${taskTitle}" has been deleted successfully`,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (error) {
      console.error('Failed to delete task:', error);

      // Re-open modal if error occurs (so user can try again)
      setShowDeleteConfirm(true);

      // Extract error message and details - ensure clean user-friendly messages
      let errorMessage = 'Không thể xóa task';
      let errorDetails = 'Vui lòng thử lại sau';

      // Handle Redux rejected action error (unwrap() throws the payload)
      if (error?.payload) {
        if (typeof error.payload === 'object' && error.payload !== null) {
          errorMessage = String(error.payload.message || errorMessage);
          errorDetails = String(error.payload.details || errorDetails);
        } else if (typeof error.payload === 'string') {
          errorMessage = error.payload;
        }
      }
      // Handle direct error object
      else if (error && typeof error === 'object') {
        errorMessage = String(error.message || errorMessage);
        errorDetails = String(error.details || errorDetails);

        // If message contains JSON, try to parse it
        if (errorMessage.includes('{') && errorMessage.includes('}')) {
          try {
            const parsed = JSON.parse(errorMessage);
            if (parsed.message) errorMessage = String(parsed.message);
            if (parsed.details) errorDetails = String(parsed.details);
          } catch (_e) {
            // If parsing fails, use the message as is but clean it up
            errorMessage = errorMessage.replace(/^.*?\{/, '').replace(/\}.*$/, '').trim();
          }
        }
      }
      // Handle string error
      else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Clean up error messages - remove any JSON artifacts
      errorMessage = errorMessage.replace(/^Failed to delete task:\s*/i, '');
      errorMessage = errorMessage.replace(/^.*?"message"\s*:\s*"([^"]+)".*$/i, '$1');
      errorMessage = errorMessage.trim() || 'Không thể xóa task';

      // ALWAYS show error toast - ensure user sees it clearly (top right corner)
      console.log('MyTasks: Showing delete task error to user:', errorMessage, errorDetails);
      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: errorDetails,
        position: 'top',
        visibilityTime: errorDetails && errorDetails !== 'Vui lòng thử lại sau' ? 6000 : 4000,
        topOffset: 60,
      });
    }
  }, [taskToDelete, token, dispatch]);

  // Cancel delete
  const cancelDeleteTask = useCallback(() => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
    taskToDeleteRef.current = null; // Also clear ref
  }, []);

  // Close edit modal and clear state
  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setTaskToEdit(null);
    taskToEditRef.current = null; // Also clear ref
    setEditTitle('');
    editTitleRef.current = '';
    setEditDescription('');
    editDescriptionRef.current = '';
    setEditPriority('Medium');
    editPriorityRef.current = 'Medium';
    setEditDue('');
    editDueRef.current = '';
    setSelectedEditCalendarDate(null);
    selectedEditCalendarDateRef.current = null;
  }, []);

  // Handle edit task - open edit modal
  const handleEditTask = useCallback((task) => {
    console.log('handleEditTask called with token:', token ? 'exists' : 'null');
    console.log('handleEditTask called with task:', JSON.stringify(task, null, 2));
    console.log('handleEditTask task.originalTask:', JSON.stringify(task.originalTask, null, 2));

    // Check if token is a valid string (not boolean)
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.error('handleEditTask: No valid token found!', { token, tokenType: typeof token });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng đăng nhập lại để chỉnh sửa task',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    console.log('Opening edit modal for task:', task);

    // Map priority from backend format to UI format
    const priorityMap = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
    };
    const displayPriority = priorityMap[task.originalTask?.priority] || 'Medium';

    // Get dueDate from multiple possible sources
    const dueDate = task.originalTask?.dueDate || task.originalTask?.due_date || task.originalTask?.due || task.due || null;
    console.log('handleEditTask: Extracted dueDate:', dueDate);

    setTaskToEdit(task);
    taskToEditRef.current = task; // Also store in ref

    // Set form values - ensure title is always a string
    const taskTitle = task.title || task.originalTask?.name || '';
    const taskDescription = task.description || '';
    const taskDueDate = dueDate || '';

    console.log('handleEditTask: Setting form values:', {
      taskTitle,
      taskDescription,
      displayPriority,
      taskDueDate
    });

    // Set both state and refs
    const titleValue = String(taskTitle);
    setEditTitle(titleValue);
    editTitleRef.current = titleValue;

    setEditDescription(taskDescription);
    editDescriptionRef.current = taskDescription;

    setEditPriority(displayPriority);
    editPriorityRef.current = displayPriority;

    setEditDue(taskDueDate);
    editDueRef.current = taskDueDate;

    if (dueDate) {
      try {
        const dateObj = new Date(dueDate);
        setSelectedEditCalendarDate(dateObj);
        selectedEditCalendarDateRef.current = dateObj;
      } catch (e) {
        console.error('Error parsing dueDate:', e);
        setSelectedEditCalendarDate(null);
        selectedEditCalendarDateRef.current = null;
      }
    } else {
      setSelectedEditCalendarDate(null);
      selectedEditCalendarDateRef.current = null;
    }
    setShowEditModal(true);
  }, [token]);

  // Handle update task
  const handleUpdateTask = useCallback(async () => {
    // Check if token is a valid string (not boolean)
    const currentToken = typeof token === 'string' && token.trim() !== '' ? token : null;

    // Get taskToEdit from ref first (most reliable), fallback to state
    const currentTaskToEdit = taskToEditRef.current || taskToEdit;

    // Get form values from refs first (most reliable), fallback to state
    const currentEditTitle = editTitleRef.current || editTitle || '';
    const currentEditDescription = editDescriptionRef.current || editDescription || '';
    const currentEditPriority = editPriorityRef.current || editPriority || 'Medium';
    const currentEditDue = editDueRef.current || editDue || '';
    const currentSelectedEditCalendarDate = selectedEditCalendarDateRef.current || selectedEditCalendarDate;

    console.log('handleUpdateTask called with token:', currentToken ? 'exists' : 'null', { tokenType: typeof token, token });
    console.log('handleUpdateTask called with taskToEdit:', currentTaskToEdit ? 'exists' : 'null', {
      fromRef: taskToEditRef.current,
      fromState: taskToEdit
    });
    console.log('handleUpdateTask form values from refs:', {
      editTitle: editTitleRef.current,
      editDescription: editDescriptionRef.current,
      editPriority: editPriorityRef.current,
      editDue: editDueRef.current,
      selectedEditCalendarDate: selectedEditCalendarDateRef.current
    });
    console.log('handleUpdateTask form values from state:', {
      editTitle,
      editDescription,
      editPriority,
      editDue,
      selectedEditCalendarDate
    });

    if (!currentToken || !currentTaskToEdit) {
      console.error('handleUpdateTask: Missing token or taskToEdit!', {
        token: !!currentToken,
        tokenType: typeof token,
        taskToEdit: !!currentTaskToEdit,
        fromRef: !!taskToEditRef.current,
        fromState: !!taskToEdit
      });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: !currentToken ? 'Vui lòng đăng nhập lại để cập nhật task' : 'Không tìm thấy thông tin task. Vui lòng thử lại.',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    // Validate inputs - use values from refs (most reliable)
    console.log('handleUpdateTask: currentEditTitle value:', currentEditTitle, 'type:', typeof currentEditTitle);

    // Đảm bảo editTitle luôn là string, không bao giờ null/undefined
    const titleValue = currentEditTitle != null ? String(currentEditTitle) : '';
    const trimmedTitle = titleValue.trim();

    console.log('handleUpdateTask: titleValue:', titleValue, 'trimmedTitle:', trimmedTitle, 'length:', trimmedTitle.length);

    if (!trimmedTitle || trimmedTitle.length === 0) {
      console.error('handleUpdateTask: Title validation failed!', {
        currentEditTitle,
        editTitleRef: editTitleRef.current,
        editTitleState: editTitle,
        titleValue,
        trimmedTitle,
        editTitleType: typeof currentEditTitle,
        editTitleIsNull: currentEditTitle == null,
        editTitleIsUndefined: currentEditTitle === undefined
      });
      Toast.show({
        type: 'error',
        text1: 'Lỗi xác thực',
        text2: 'Vui lòng nhập tiêu đề task',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    try {
      // Format due date to YYYY-MM-DD
      // Use selectedEditCalendarDate from ref if available, otherwise use editDue from ref
      let formattedDueDate = null;
      if (currentSelectedEditCalendarDate) {
        // Use the selected calendar date
        formattedDueDate = currentSelectedEditCalendarDate.toISOString().split('T')[0];
        console.log('handleUpdateTask: Using currentSelectedEditCalendarDate:', formattedDueDate);
      } else if (currentEditDue) {
        // Fallback to editDue string
        if (/^\d{4}-\d{2}-\d{2}$/.test(currentEditDue)) {
          formattedDueDate = currentEditDue;
        } else {
          const date = new Date(currentEditDue);
          if (!isNaN(date.getTime())) {
            formattedDueDate = date.toISOString().split('T')[0];
          }
        }
        console.log('handleUpdateTask: Using currentEditDue:', formattedDueDate);
      }
      console.log('handleUpdateTask: Final formattedDueDate:', formattedDueDate);

      // Map priority from UI to backend format
      const priorityMap = {
        'Low': 'low',
        'Medium': 'medium',
        'High': 'high',
      };
      const backendPriority = priorityMap[currentEditPriority] || 'medium';

      // Prepare update data
      const updateData = {
        name: trimmedTitle,
        description: (currentEditDescription || '').trim() || null,
        dueDate: formattedDueDate,
        priority: backendPriority,
      };

      console.log('MyTasks: Updating task with data:', updateData);

      // Update task via API
      await dispatch(updateExistingTask({
        token: currentToken,
        taskId: currentTaskToEdit.id,
        taskData: updateData,
      })).unwrap();

      // Close modal and reset form
      setShowEditModal(false);
      setTaskToEdit(null);
      taskToEditRef.current = null; // Also clear ref
      setEditTitle('');
      editTitleRef.current = '';
      setEditDescription('');
      editDescriptionRef.current = '';
      setEditPriority('Medium');
      editPriorityRef.current = 'Medium';
      setEditDue('');
      editDueRef.current = '';
      setSelectedEditCalendarDate(null);
      selectedEditCalendarDateRef.current = null;

      // Refresh tasks list
      await dispatch(fetchTasks({ token: currentToken, offset: 0, limit: 100 }));

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Task Updated',
        text2: `"${trimmedTitle}" has been updated successfully`,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (error) {
      console.error('Failed to update task:', error);

      let errorMessage = 'Không thể cập nhật task';
      let errorDetails = 'Vui lòng thử lại sau';

      if (error?.payload) {
        if (typeof error.payload === 'object' && error.payload !== null) {
          errorMessage = String(error.payload.message || errorMessage);
          errorDetails = String(error.payload.details || errorDetails);
        } else if (typeof error.payload === 'string') {
          errorMessage = error.payload;
        }
      } else if (error?.message) {
        errorMessage = error.message;
        errorDetails = error.details || errorDetails;
      }

      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: errorDetails,
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
    }
  }, [token, taskToEdit, editTitle, editDescription, editPriority, editDue, selectedEditCalendarDate, dispatch]);

  // Handle toggle complete - update progress
  const handleToggleComplete = useCallback(async (taskId, newProgress) => {
    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to update a task',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    console.log('Toggling task completion:', { taskId, newProgress });

    try {
      await dispatch(updateExistingTask({
        token,
        taskId,
        taskData: { progress: newProgress }
      })).unwrap();

      // Refresh tasks list after update
      await dispatch(fetchTasks({ token, offset: 0, limit: 100 }));

      Toast.show({
        type: 'success',
        text1: newProgress === 100 ? 'Task Completed' : 'Task Reopened',
        text2: newProgress === 100 ? 'Task has been marked as completed' : 'Task has been reopened',
        position: 'top',
        visibilityTime: 2000,
        topOffset: 60,
      });
    } catch (error) {
      console.error('Failed to toggle task completion:', error);

      let errorMessage = 'Không thể cập nhật task';
      let errorDetails = 'Vui lòng thử lại sau';

      if (error?.payload) {
        if (typeof error.payload === 'object' && error.payload !== null) {
          errorMessage = String(error.payload.message || errorMessage);
          errorDetails = String(error.payload.details || errorDetails);
        } else if (typeof error.payload === 'string') {
          errorMessage = error.payload;
        }
      } else if (error?.message) {
        errorMessage = error.message;
        errorDetails = error.details || errorDetails;
      }

      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: errorDetails,
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
    }
  }, [token, dispatch]);

  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [showCategoryFilterDropdown, setShowCategoryFilterDropdown] = useState(false);
  const [showPriorityFilterDropdown, setShowPriorityFilterDropdown] = useState(false);
  const [tab, setTab] = useState('All');

  // Add Task modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newDue, setNewDue] = useState('');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  // Use ref to store taskToDelete to avoid closure issues
  const taskToDeleteRef = useRef(null);

  // Edit task modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  // Use ref to store taskToEdit to avoid closure issues
  const taskToEditRef = useRef(null);
  const [editTitle, setEditTitle] = useState('');
  // Use refs to store form values to avoid closure issues
  const editTitleRef = useRef('');
  const editDescriptionRef = useRef('');
  const editPriorityRef = useRef('Medium');
  const editDueRef = useRef('');
  const selectedEditCalendarDateRef = useRef(null);
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editDue, setEditDue] = useState('');
  const [showEditPriorityDropdown, setShowEditPriorityDropdown] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [selectedEditCalendarDate, setSelectedEditCalendarDate] = useState(null);

  const priorities = ['Low', 'Medium', 'High'];
  const categories = ['Personal', 'Work', 'Shopping', 'Health', 'Other'];

  // Debug: Log editTitle changes
  useEffect(() => {
    if (showEditModal) {
      console.log('Edit modal is open, editTitle:', editTitle, 'type:', typeof editTitle);
    }
  }, [editTitle, showEditModal]);

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d < today && tab !== 'Completed';
  };

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const byCat = categoryFilter === 'All Categories' || t.category.toLowerCase() === categoryFilter.toLowerCase();
      const byPr = priorityFilter === 'All Priorities' || t.priority.toLowerCase() === priorityFilter.toLowerCase();
      const byTab = tab === 'All' || t.status === tab;
      return byCat && byPr && byTab;
    });
  }, [tasks, categoryFilter, priorityFilter, tab]);

  const countBy = (s) => tasks.filter(t => t.status === s).length;

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setNewDue(`${year}-${month}-${day}`);
    }
  };

  const onEditDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEditDatePicker(false);
    }
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      setEditDue(dateStr);
      editDueRef.current = dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>My Tasks</Text>
          <Text style={styles.pageSubtitle}>Manage your personal to-do list and stay organized</Text>
        </View>

        {/* Filters Section */}
        <View style={styles.sectionCard}>
          {(showCategoryFilterDropdown || showPriorityFilterDropdown) && (
            <Pressable
              style={styles.dropdownOverlay}
              onPress={() => {
                setShowCategoryFilterDropdown(false);
                setShowPriorityFilterDropdown(false);
              }}
            />
          )}
          <View style={styles.filterRow}>
            {/* Category Filter */}
            <View style={styles.filterChipWrapper}>
              <Pressable
                style={styles.filterChip}
                onPress={() => {
                  setShowCategoryFilterDropdown(!showCategoryFilterDropdown);
                  setShowPriorityFilterDropdown(false);
                }}
              >
                <Text style={styles.filterText} numberOfLines={1}>{categoryFilter}</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </Pressable>
              {showCategoryFilterDropdown && (
                <View style={styles.filterDropdown}>
                  {['All Categories', ...categories].map((cat, index) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.filterDropdownItem,
                        index === categories.length && styles.filterDropdownItemLast
                      ]}
                      onPress={() => {
                        setCategoryFilter(cat);
                        setShowCategoryFilterDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.filterDropdownText,
                        categoryFilter === cat && styles.filterDropdownTextActive
                      ]}>
                        {cat}
                      </Text>
                      {categoryFilter === cat && (
                        <Ionicons name="checkmark" size={16} color="#2563EB" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Priority Filter */}
            <View style={styles.filterChipWrapper}>
              <Pressable
                style={styles.filterChip}
                onPress={() => {
                  setShowPriorityFilterDropdown(!showPriorityFilterDropdown);
                  setShowCategoryFilterDropdown(false);
                }}
              >
                <Text style={styles.filterText} numberOfLines={1}>{priorityFilter}</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </Pressable>
              {showPriorityFilterDropdown && (
                <View style={styles.filterDropdown}>
                  {['All Priorities', ...priorities].map((pri, index) => (
                    <Pressable
                      key={pri}
                      style={[
                        styles.filterDropdownItem,
                        index === priorities.length && styles.filterDropdownItemLast
                      ]}
                      onPress={() => {
                        setPriorityFilter(pri);
                        setShowPriorityFilterDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.filterDropdownText,
                        priorityFilter === pri && styles.filterDropdownTextActive
                      ]}>
                        {pri}
                      </Text>
                      {priorityFilter === pri && (
                        <Ionicons name="checkmark" size={16} color="#2563EB" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Add Task Button */}
            <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Task</Text>
            </Pressable>
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="ellipse-outline" size={18} color="#6B7280" />
            </View>
            <Text style={styles.summaryLabel}>To Do</Text>
            <Text style={styles.summaryValue}>{countBy('To Do')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="time-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.summaryLabel}>In Progress</Text>
            <Text style={styles.summaryValue}>{countBy('In Progress')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
            </View>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>{countBy('Completed')}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {['All', 'To Do', 'In Progress', 'Completed'].map(name => (
            <Pressable key={name} onPress={() => setTab(name)} style={[styles.tabPill, tab === name && styles.tabPillActive]}>
              <Text style={[styles.tabText, tab === name && styles.tabTextActive]}>{name}{name === 'All' ? ` (${tasks.length})` : ''}</Text>
            </Pressable>
          ))}
        </View>

        {/* Task list */}
        <View style={styles.tasksList}>
          {tasksLoading && tasks.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No tasks found</Text>
              <Text style={styles.emptySubtext}>Create your first task to get started</Text>
            </View>
          ) : (
            filtered.map(t => (
              <View key={t.idString} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskTitleRow}>
                    <Pressable
                      onPress={() => {
                        console.log('Checkbox pressed for task:', { id: t.id, title: t.title, currentProgress: t.progress });
                        handleToggleComplete(t.id, t.progress === 100 ? 0 : 100);
                      }}
                      style={styles.checkboxContainer}
                    >
                      {t.progress === 100 ? (
                        <View style={styles.checkboxChecked}>
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                      ) : (
                        <View style={styles.checkbox} />
                      )}
                    </Pressable>
                    <Text style={[styles.taskTitle, t.progress === 100 && styles.taskTitleCompleted]}>{t.title}</Text>
                  </View>
                  <View style={styles.taskActions}>
                    <Pressable
                      onPress={() => {
                        console.log('Edit button pressed:', { id: t.id, title: t.title });
                        handleEditTask(t);
                      }}
                      style={styles.editButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="pencil-outline" size={18} color="#2563EB" />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        console.log('Delete button pressed:', { id: t.id, title: t.title });
                        handleDeleteTask(t.id, t.title);
                      }}
                      style={styles.deleteButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#9AA3AE" />
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.taskDesc}>{t.description}</Text>
                <View style={styles.taskMetaRow}>
                  <View style={[styles.badge, styles[`priority_${t.priority}`]]}><Text style={[styles.badgeText, styles[`priorityText_${t.priority}`]]}>{t.priority}</Text></View>
                  <View style={[styles.badge, styles.badgeSoft]}><Ionicons name="pricetag" size={12} color="#4B5563" /><Text style={styles.badgeSoftText}>{t.category}</Text></View>
                  {(() => {
                    // Always show due date badge if due date exists
                    if (!t.due || (typeof t.due === 'string' && t.due.trim() === '')) {
                      return null;
                    }

                    let displayDate = '';
                    try {
                      const date = new Date(t.due);
                      if (!isNaN(date.getTime())) {
                        const day = date.getDate();
                        const month = date.toLocaleDateString('en-US', { month: 'short' });
                        const year = date.getFullYear();
                        displayDate = `${month} ${day}, ${year}`;
                      } else {
                        displayDate = String(t.due);
                      }
                    } catch (_e) {
                      displayDate = String(t.due);
                    }

                    if (!displayDate) return null;

                    const overdue = isOverdue(t.due);
                    return (
                      <View style={[styles.badge, overdue ? styles.badgeDanger : styles.badgeSoft]}>
                        <Ionicons name="calendar" size={12} color={overdue ? '#DC2626' : '#4B5563'} />
                        <Text style={[styles.badgeSoftText, overdue && { color: '#DC2626', fontWeight: '700' }]}>
                          {displayDate}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddModal(false)}
        >
          <Pressable style={styles.addModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.addHeaderRow}>
              <View>
                <Text style={styles.addTitle}>Add New Task</Text>
                <Text style={styles.addSubtitle}>Create a new personal task to keep track of your to-dos</Text>
              </View>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                {/* Title Input */}
                <View>
                  <Text style={styles.inputLabel}>Title</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter task title"
                    placeholderTextColor="#9CA3AF"
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />
                </View>

                {/* Description Input */}
                <View>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={styles.textAreaField}
                    placeholder="Add details about this task"
                    placeholderTextColor="#9CA3AF"
                    value={newDescription}
                    onChangeText={setNewDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Priority and Category Row */}
                <View style={styles.row2}>
                  <View style={styles.dropdownWrapper}>
                    <Text style={styles.inputLabel}>Priority</Text>
                    <Pressable
                      style={styles.selectField}
                      onPress={() => {
                        setShowPriorityDropdown(!showPriorityDropdown);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.selectText}>{newPriority}</Text>
                      <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </Pressable>
                    {showPriorityDropdown && (
                      <View style={styles.dropdownList}>
                        {priorities.map((p, index) => (
                          <Pressable
                            key={p}
                            style={[
                              styles.dropdownItem,
                              index === priorities.length - 1 && styles.dropdownItemLast
                            ]}
                            onPress={() => {
                              setNewPriority(p);
                              setShowPriorityDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{p}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={{ width: 14 }} />
                  <View style={styles.dropdownWrapper}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <Pressable
                      style={styles.selectField}
                      onPress={() => {
                        setShowCategoryDropdown(!showCategoryDropdown);
                        setShowPriorityDropdown(false);
                      }}
                    >
                      <Text style={styles.selectText}>{newCategory}</Text>
                      <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </Pressable>
                    {showCategoryDropdown && (
                      <View style={styles.dropdownList}>
                        {categories.map((c, index) => (
                          <Pressable
                            key={c}
                            style={[
                              styles.dropdownItem,
                              index === categories.length - 1 && styles.dropdownItemLast
                            ]}
                            onPress={() => {
                              setNewCategory(c);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{c}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Due Date */}
                <View style={{ zIndex: 1 }}>
                  <Text style={styles.inputLabel}>Due Date (Optional)</Text>
                  <Pressable
                    style={[styles.dateField, { zIndex: 1 }]}
                    onPress={() => setShowDatePicker(!showDatePicker)}
                  >
                    <Text style={[styles.datePlaceholder, newDue && { color: '#111827' }]}>
                      {newDue ? new Date(newDue).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'mm/dd/yyyy'}
                    </Text>
                    <Ionicons name="calendar-clear" size={16} color="#6B7280" />
                  </Pressable>
                  {Platform.OS === 'ios' && showDatePicker && (
                    <DateTimePicker
                      value={newDue ? new Date(newDue) : new Date()}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      style={styles.datePickerIOSInline}
                      textColor="#000000"
                      minimumDate={new Date()}
                    />
                  )}
                  {Platform.OS === 'android' && showDatePicker && (
                    <DateTimePicker
                      value={newDue ? new Date(newDue) : new Date()}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => {
                setShowAddModal(false);
                setNewTitle('');
                setNewDescription('');
                setNewPriority('Medium');
                setNewCategory('Personal');
                setNewDue('');
              }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.createBtn, tasksLoading && { opacity: 0.6 }]}
                disabled={tasksLoading}
                onPress={async () => {
                  if (!newTitle.trim()) {
                    Toast.show({
                      type: 'error',
                      text1: 'Validation Error',
                      text2: 'Please enter a task title',
                      position: 'top',
                      visibilityTime: 3000,
                    });
                    return;
                  }

                  if (!token) {
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: 'You must be logged in to create a task',
                      position: 'top',
                      visibilityTime: 3000,
                      topOffset: 60,
                    });
                    return;
                  }

                  if (!currentUsername) {
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: 'Unable to get username. Please try logging in again.',
                      position: 'top',
                      visibilityTime: 3000,
                      topOffset: 60,
                    });
                    return;
                  }

                  try {
                    // Validate inputs
                    const trimmedTitle = newTitle.trim();
                    if (!trimmedTitle) {
                      Toast.show({
                        type: 'error',
                        text1: 'Validation Error',
                        text2: 'Please enter a task title',
                        position: 'top',
                        visibilityTime: 3000,
                        topOffset: 60,
                      });
                      return;
                    }

                    if (!currentUsername || currentUsername.trim() === '') {
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Unable to get username. Please try logging in again.',
                        position: 'top',
                        visibilityTime: 3000,
                      });
                      return;
                    }

                    // Format due date to YYYY-MM-DD
                    let formattedDueDate = null;
                    if (newDue) {
                      // If it's already in YYYY-MM-DD format, use it
                      if (/^\d{4}-\d{2}-\d{2}$/.test(newDue)) {
                        formattedDueDate = newDue;
                      } else {
                        // Try to parse and format
                        const date = new Date(newDue);
                        if (!isNaN(date.getTime())) {
                          formattedDueDate = date.toISOString().split('T')[0];
                        }
                      }
                    }

                    // Map priority from UI to backend format (low, medium, high)
                    const priorityMap = {
                      'Low': 'low',
                      'Medium': 'medium',
                      'High': 'high',
                    };
                    const backendPriority = priorityMap[newPriority] || 'medium';

                    // Prepare task data
                    const taskData = {
                      projectName: '', // Empty string for personal tasks
                      name: trimmedTitle,
                      description: (newDescription || '').trim(),
                      assignedTo: currentUsername.trim(), // Use current user's username (required by backend)
                      dueDate: formattedDueDate,
                      priority: backendPriority, // Send priority to backend
                    };

                    console.log('MyTasks: Creating task with data:', {
                      ...taskData,
                      assignedTo: taskData.assignedTo || '***',
                    });

                    // Create task via API
                    await dispatch(createNewTask({
                      token,
                      taskData,
                    })).unwrap();

                    // Close modal and reset form
                    setShowAddModal(false);
                    setNewTitle('');
                    setNewDescription('');
                    setNewPriority('Medium');
                    setNewCategory('Personal');
                    setNewDue('');
                    setTab('All');

                    // Show success toast (top right corner)
                    Toast.show({
                      type: 'success',
                      text1: 'Task Created',
                      text2: `"${trimmedTitle}" has been created successfully`,
                      position: 'top',
                      visibilityTime: 3000,
                      topOffset: 60,
                    });
                  } catch (error) {
                    console.error('Failed to create task:', error);

                    // Extract error message and details - ensure clean user-friendly messages
                    let errorMessage = 'Không thể tạo task';
                    let errorDetails = 'Vui lòng thử lại sau';

                    // Handle Redux rejected action error (unwrap() throws the payload)
                    if (error?.payload) {
                      if (typeof error.payload === 'object' && error.payload !== null) {
                        errorMessage = String(error.payload.message || errorMessage);
                        errorDetails = String(error.payload.details || errorDetails);
                      } else if (typeof error.payload === 'string') {
                        errorMessage = error.payload;
                      }
                    }
                    // Handle direct error object
                    else if (error && typeof error === 'object') {
                      errorMessage = String(error.message || errorMessage);
                      errorDetails = String(error.details || errorDetails);

                      // If message contains JSON, try to parse it
                      if (errorMessage.includes('{') && errorMessage.includes('}')) {
                        try {
                          const parsed = JSON.parse(errorMessage);
                          if (parsed.message) errorMessage = String(parsed.message);
                          if (parsed.details) errorDetails = String(parsed.details);
                        } catch (_e) {
                          // If parsing fails, use the message as is but clean it up
                          errorMessage = errorMessage.replace(/^.*?\{/, '').replace(/\}.*$/, '').trim();
                        }
                      }
                    }
                    // Handle string error
                    else if (typeof error === 'string') {
                      errorMessage = error;
                    }

                    // Clean up error messages - remove any JSON artifacts
                    errorMessage = errorMessage.replace(/^Failed to create task:\s*/i, '');
                    errorMessage = errorMessage.replace(/^.*?"message"\s*:\s*"([^"]+)".*$/i, '$1');
                    errorMessage = errorMessage.trim() || 'Không thể tạo task';

                    // ALWAYS show error toast - ensure user sees it clearly (top right corner)
                    console.log('MyTasks: Showing create task error to user:', errorMessage, errorDetails);
                    Toast.show({
                      type: 'error',
                      text1: errorMessage,
                      text2: errorDetails,
                      position: 'top',
                      visibilityTime: errorDetails && errorDetails !== 'Vui lòng thử lại sau' ? 6000 : 4000,
                      topOffset: 60,
                    });
                  }
                }}
              >
                <Text style={styles.createText}>
                  {tasksLoading ? 'Creating...' : 'Create Task'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>



      {/* Edit Task Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeEditModal}
        >
          <Pressable style={styles.addModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.addHeaderRow}>
              <View>
                <Text style={styles.addTitle}>Edit Task</Text>
                <Text style={styles.addSubtitle}>Update your task details</Text>
              </View>
              <Pressable onPress={closeEditModal}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalFieldsContainer}>
                {/* Title Input */}
                <View style={styles.modalFieldWrapper}>
                  <Text style={styles.inputLabel}>Title</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter task title"
                    placeholderTextColor="#9CA3AF"
                    value={editTitle || ''}
                    onChangeText={(text) => {
                      console.log('Title input changed:', text);
                      setEditTitle(text);
                      editTitleRef.current = text; // Also update ref
                    }}
                    onBlur={() => {
                      console.log('Title input blurred, current value:', editTitle, 'ref value:', editTitleRef.current);
                    }}
                  />
                </View>

                {/* Description Input */}
                <View style={styles.modalFieldWrapper}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={styles.textAreaField}
                    placeholder="Add details about this task"
                    placeholderTextColor="#9CA3AF"
                    value={editDescription}
                    onChangeText={(text) => {
                      setEditDescription(text);
                      editDescriptionRef.current = text; // Also update ref
                    }}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Priority */}
                <View style={[styles.dropdownWrapper, styles.modalFieldWrapper, styles.priorityFieldWrapper]}>
                  <Text style={styles.inputLabel}>Priority</Text>
                  <Pressable
                    style={styles.selectField}
                    onPress={() => {
                      setShowEditPriorityDropdown(!showEditPriorityDropdown);
                    }}
                  >
                    <Text style={styles.selectText}>{editPriority}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </Pressable>
                  {showEditPriorityDropdown && (
                    <View style={styles.dropdownList}>
                      {priorities.map((p, index) => (
                        <Pressable
                          key={p}
                          style={[
                            styles.dropdownItem,
                            index === priorities.length - 1 && styles.dropdownItemLast
                          ]}
                          onPress={() => {
                            setEditPriority(p);
                            editPriorityRef.current = p; // Also update ref
                            setShowEditPriorityDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{p}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Due Date */}
                <View style={[styles.modalFieldWrapper, styles.dueDateFieldWrapper, { zIndex: 1 }]}>
                  <Text style={styles.inputLabel}>Due Date (Optional)</Text>
                  <Pressable
                    style={[styles.dateField, { zIndex: 1 }]}
                    onPress={() => setShowEditDatePicker(!showEditDatePicker)}
                  >
                    <Text style={[styles.datePlaceholder, editDue && { color: '#111827' }]}>
                      {editDue ? new Date(editDue).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'mm/dd/yyyy'}
                    </Text>
                    <Ionicons name="calendar-clear" size={16} color="#6B7280" />
                  </Pressable>
                  {Platform.OS === 'ios' && showEditDatePicker && (
                    <DateTimePicker
                      value={editDue ? new Date(editDue) : new Date()}
                      mode="date"
                      display="spinner"
                      onChange={onEditDateChange}
                      style={styles.datePickerIOSInline}
                      textColor="#000000"
                      minimumDate={new Date()}
                    />
                  )}
                  {Platform.OS === 'android' && showEditDatePicker && (
                    <DateTimePicker
                      value={editDue ? new Date(editDue) : new Date()}
                      mode="date"
                      display="default"
                      onChange={onEditDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Spacer để tạo khoảng cách giữa form và buttons */}
            <View style={styles.modalActionsSpacer} />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={closeEditModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.createBtn, tasksLoading && { opacity: 0.6 }]}
                disabled={tasksLoading}
                onPress={handleUpdateTask}
              >
                <Text style={styles.createText}>
                  {tasksLoading ? 'Updating...' : 'Update Task'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>



      {/* Custom Delete Confirmation Dialog */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDeleteTask}
      >
        <Pressable
          style={styles.deleteModalOverlay}
          onPress={cancelDeleteTask}
        >
          <Pressable style={styles.deleteModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteIconContainer}>
              <View style={styles.deleteIconWrapper}>
                <Ionicons name="trash" size={32} color="#EF4444" />
              </View>
            </View>
            <Text style={styles.deleteModalTitle}>Delete Task</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete &quot;{taskToDelete?.title}&quot;? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalActions}>
              <Pressable
                style={styles.deleteCancelButton}
                onPress={cancelDeleteTask}
              >
                <Text style={styles.deleteCancelText}>CANCEL</Text>
              </Pressable>
              <Pressable
                style={styles.deleteConfirmButton}
                onPress={() => {
                  // Double check taskToDelete exists before calling confirmDeleteTask
                  if (!taskToDelete) {
                    console.error('Delete button pressed but taskToDelete is null');
                    Toast.show({
                      type: 'error',
                      text1: 'Lỗi',
                      text2: 'Không tìm thấy thông tin task. Vui lòng thử lại.',
                      position: 'top',
                      visibilityTime: 3000,
                      topOffset: 60,
                    });
                    setShowDeleteConfirm(false);
                    return;
                  }
                  console.log('Delete button pressed with taskToDelete:', taskToDelete);
                  confirmDeleteTask();
                }}
              >
                <Text style={styles.deleteConfirmText}>DELETE</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
    zIndex: 1,
  },
  pageHeader: {
    paddingHorizontal: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    overflow: 'visible',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
    position: 'relative',
    zIndex: 1000,
    marginTop: 0,
    overflow: 'visible',
  },
  filterChipWrapper: {
    position: 'relative',
    zIndex: 1001,
    minWidth: 120,
    flex: 1,
    maxWidth: Platform.select({
      ios: '48%',
      android: '45%',
    }),
    overflow: 'visible',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexShrink: 1,
  },
  filterText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    zIndex: 9999,
    elevation: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 9999,
      },
    }),
  },
  filterDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterDropdownItemLast: {
    borderBottomWidth: 0,
  },
  filterDropdownText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  filterDropdownTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: Platform.select({
      ios: 14,
      android: 16,
    }),
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
    flexShrink: 0,
    minWidth: Platform.select({
      ios: 110,
      android: 140,
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  // Add Task modal styles
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 9999,
  },
  modalContent: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  addModalCard: {
    width: '100%',
    maxWidth: 600, // Tăng maxWidth từ 560 lên 600 để modal rộng hơn
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 28, // Tăng padding từ 24 lên 28 để có không gian rộng hơn
    zIndex: 10000,
    elevation: 10000,
    overflow: 'visible',
  },
  addHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Tăng marginBottom từ 12 lên 20 để có khoảng cách tốt hơn với form
  },
  addTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  addSubtitle: {
    marginTop: 4,
    color: '#6B7280',
  },
  modalScroll: {
    // maxHeight: 500, // Removed to allow growing within parent
    zIndex: 1,
    overflow: 'visible',
    paddingBottom: 8,
    flexGrow: 0, // Let it grow to content size, constrained by parent max height
  },
  modalFieldsContainer: {
    // Không dùng gap, sẽ dùng marginBottom cho từng field
  },
  modalFieldWrapper: {
    marginBottom: 24, // Tăng marginBottom từ 20 lên 24 để có khoảng cách lớn hơn
  },
  inputLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    letterSpacing: 0.1,
    marginBottom: 8, // Tăng khoảng cách giữa label và input
    lineHeight: 18,
  },
  inputField: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    fontWeight: '400',
    lineHeight: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  textAreaField: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 96,
    fontSize: 15,
    color: '#111827',
    fontWeight: '400',
    lineHeight: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 10007, // Tăng zIndex lên 10007 để dropdown hiển thị trên cùng
    overflow: 'visible',
    minHeight: 80, // Thêm minHeight để đảm bảo có đủ không gian cho dropdown
  },
  priorityFieldWrapper: {
    marginBottom: 40, // Tăng marginBottom từ 32 lên 40 để tạo khoảng cách lớn hơn với Due Date
    paddingBottom: 12, // Tăng paddingBottom để đảm bảo dropdown không overlap với Due Date
  },
  dueDateFieldWrapper: {
    marginTop: 0, // Đảm bảo không có marginTop
    marginBottom: 24, // Tăng marginBottom từ 16 lên 24 để tạo khoảng cách lớn hơn với buttons
  },
  modalActionsSpacer: {
    height: 20, // Tăng spacer từ 16 lên 20 để tạo khoảng cách lớn hơn giữa form và action buttons
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    marginBottom: 8,
    zIndex: 10008,
    elevation: 10008,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 10008,
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  dropdownItemLast: {
    borderBottomWidth: 0, // Loại bỏ borderBottom của item cuối cùng
  },
  dropdownItemActive: {
    backgroundColor: '#F0F9FF',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    lineHeight: 22,
  },
  dropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'visible',
    zIndex: 10004, // Đảm bảo row2 có zIndex để dropdowns có thể hiển thị trên cùng
  },
  selectField: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectFieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  priorityIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#9CA3AF',
  },
  priorityIndicatorHigh: {
    backgroundColor: '#DC2626',
  },
  priorityIndicatorMedium: {
    backgroundColor: '#D97706',
  },
  priorityIndicatorLow: {
    backgroundColor: '#16A34A',
  },
  selectFieldHigh: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  selectFieldMedium: {
    borderColor: '#FEF3C7',
    backgroundColor: '#FFFBEB',
  },
  selectFieldLow: {
    borderColor: '#DCFCE7',
    backgroundColor: '#F0FDF4',
  },
  selectText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  selectTextHigh: {
    color: '#DC2626',
  },
  selectTextMedium: {
    color: '#D97706',
  },
  selectTextLow: {
    color: '#16A34A',
  },
  dateField: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dateFieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dateClearButton: {
    padding: 4,
    marginLeft: 8,
  },
  datePlaceholder: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  datePlaceholderFilled: {
    color: '#111827',
    fontWeight: '500',
  },
  modalActions: {
    marginTop: 48, // Tăng marginTop từ 40 lên 48 để tạo khoảng cách lớn hơn với Due Date field
    paddingTop: 24, // Giữ paddingTop ở 24
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12, // Gap giữa Cancel và Update Task
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  updateBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 132,
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  updateBtnDisabled: {
    opacity: 0.6,
  },
  updateText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  datePickerInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
    marginBottom: 20,
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerButtonPrimary: {
    backgroundColor: '#2563EB',
  },
  datePickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  datePickerButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Calendar styles
  calendarContainer: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  calendarDayNames: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calendarDayToday: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  calendarDaySelected: {
    backgroundColor: '#2563EB',
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  calendarDayTextToday: {
    color: '#2563EB',
    fontWeight: '700',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  calendarDayTextPast: {
    color: '#9CA3AF',
  },
  // Summary cards
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  // Tabs
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabPillActive: {
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  tabText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#3730A3',
  },
  // Task list
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checkboxContainer: {
    padding: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
  },
  taskDesc: {
    color: '#6B7280',
    marginTop: 6,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeSoft: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeSoftText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priority_high: { backgroundColor: '#FDE8E8' },
  priority_medium: { backgroundColor: '#FEF3C7' },
  priority_low: { backgroundColor: '#DCFCE7' },
  priorityText_high: { color: '#DC2626', fontWeight: '700', fontSize: 12 },
  priorityText_medium: { color: '#D97706', fontWeight: '700', fontSize: 12 },
  priorityText_low: { color: '#16A34A', fontWeight: '700', fontSize: 12 },
  // Loading and empty states
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  // Delete Confirmation Modal
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  deleteIconContainer: {
    marginBottom: 16,
  },
  deleteIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  deleteConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  datePickerIOSInline: {
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: 8,
  },
});

