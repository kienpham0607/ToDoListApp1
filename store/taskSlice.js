import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { createTask as createTaskAPI, getTasks as getTasksAPI, updateTask as updateTaskAPI, deleteTask as deleteTaskAPI } from '@/services/taskApi';

// Initial state
const initialState = {
  tasks: [],
  myTasks: [], // Personal tasks (projectName is null or empty)
  calendarTasks: [], // Tasks filtered by date for calendar view
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  selectedDate: null, // Currently selected date for calendar (YYYY-MM-DD format)
};

// Async thunk to create a task
export const createNewTask = createAsyncThunk(
  'tasks/create',
  async ({ token, taskData }, { rejectWithValue }) => {
    try {
      console.log('Redux: Creating task:', taskData);
      const response = await createTaskAPI(token, taskData);
      console.log('Redux: Task created successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Create task error:', error);
      // Preserve error details if available
      const errorMessage = error.message || 'Không thể tạo task';
      const errorDetails = error.details || 'Vui lòng thử lại sau';
      return rejectWithValue({ message: errorMessage, details: errorDetails });
    }
  }
);

// Async thunk to fetch tasks
export const fetchTasks = createAsyncThunk(
  'tasks/fetch',
  async ({ token, offset = 0, limit = 100 }, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching tasks, offset:', offset, 'limit:', limit);
      const response = await getTasksAPI(token, offset, limit);
      console.log('Redux: Tasks fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Fetch tasks error:', error);
      // Preserve error details if available
      const errorMessage = error.message || 'Không thể tải danh sách task';
      const errorDetails = error.details || 'Vui lòng thử lại sau';
      return rejectWithValue({ message: errorMessage, details: errorDetails });
    }
  }
);

// Async thunk to fetch tasks for calendar (filter by date)
export const fetchTasksByDate = createAsyncThunk(
  'tasks/fetchByDate',
  async ({ token, date, offset = 0, limit = 1000 }, { rejectWithValue, getState }) => {
    try {
      console.log('Redux: Fetching tasks for date:', date);
      // Fetch all tasks first (or use cached tasks if available)
      const state = getState();
      let tasks = state.tasks.tasks || [];
      
      // If we don't have tasks yet, fetch them
      if (tasks.length === 0) {
        const response = await getTasksAPI(token, offset, limit);
        tasks = response.content || [];
      }
      
      // Filter tasks by date
      const dateStr = date instanceof Date 
        ? date.toISOString().split('T')[0] 
        : date;
      
      const filteredTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = task.dueDate.split('T')[0]; // Handle both date and datetime formats
        return taskDate === dateStr;
      });
      
      console.log(`Redux: Found ${filteredTasks.length} tasks for date ${dateStr}`);
      return { tasks: filteredTasks, date: dateStr };
    } catch (error) {
      console.error('Redux: Fetch tasks by date error:', error);
      const errorMessage = error.message || 'Không thể tải tasks theo ngày';
      const errorDetails = error.details || 'Vui lòng thử lại sau';
      return rejectWithValue({ message: errorMessage, details: errorDetails });
    }
  }
);

// Async thunk to update a task
export const updateExistingTask = createAsyncThunk(
  'tasks/update',
  async ({ token, taskId, taskData }, { rejectWithValue }) => {
    try {
      console.log('Redux: Updating task:', taskId, taskData);
      const response = await updateTaskAPI(token, taskId, taskData);
      console.log('Redux: Task updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Update task error:', error);
      return rejectWithValue(error.message || 'Failed to update task');
    }
  }
);

// Async thunk to delete a task
export const deleteExistingTask = createAsyncThunk(
  'tasks/delete',
  async ({ token, taskId }, { rejectWithValue }) => {
    try {
      console.log('Redux: Deleting task:', taskId);
      await deleteTaskAPI(token, taskId);
      console.log('Redux: Task deleted successfully');
      return taskId;
    } catch (error) {
      console.error('Redux: Delete task error:', error);
      // Preserve error details if available
      const errorMessage = error.message || 'Không thể xóa task';
      const errorDetails = error.details || 'Vui lòng thử lại sau';
      return rejectWithValue({ message: errorMessage, details: errorDetails });
    }
  }
);

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.myTasks = [];
      state.calendarTasks = [];
      state.totalElements = 0;
      state.totalPages = 0;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
      console.log('Redux: setSelectedDate called with:', action.payload);
      console.log('Redux: Current tasks count:', state.tasks.length);
      
      // Filter tasks by selected date
      if (action.payload && state.tasks.length > 0) {
        const dateStr = action.payload instanceof Date 
          ? action.payload.toISOString().split('T')[0] 
          : action.payload;
        console.log('Redux: Filtering tasks for date:', dateStr);
        
        // Debug: Log sample tasks with dueDate (check multiple possible field names)
        console.log('Redux: Sample tasks with date fields (first 5):');
        state.tasks.slice(0, 5).forEach((task, index) => {
          const dueDate = task.dueDate || task.due_date || task.due || null;
          console.log(`  Task ${index + 1}: name="${task.name}", dueDate="${task.dueDate}", due_date="${task.due_date}", due="${task.due}", resolved="${dueDate}"`);
        });
        
        state.calendarTasks = state.tasks.filter(task => {
          // Check multiple possible field names for due date
          const dueDate = task.dueDate || task.due_date || task.due || null;
          if (!dueDate) {
            console.log(`Redux: Task "${task.name}" has no dueDate (checked dueDate, due_date, due)`);
            return false;
          }
          const taskDate = dueDate.split('T')[0];
          const matches = taskDate === dateStr;
          console.log(`Redux: Task "${task.name}": dueDate="${dueDate}", taskDate="${taskDate}", targetDate="${dateStr}", matches=${matches}`);
          return matches;
        });
        console.log('Redux: Filtered calendar tasks count:', state.calendarTasks.length);
      } else {
        console.log('Redux: No payload or no tasks, clearing calendarTasks');
        state.calendarTasks = [];
      }
    },
  },
  extraReducers: (builder) => {
    // Create task
    builder
      .addCase(createNewTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.loading = false;
        const newTask = action.payload;
        // Add to tasks list
        state.tasks.unshift(newTask);
        // If it's a personal task (no projectName), add to myTasks
        if (!newTask.projectName || newTask.projectName === '') {
          state.myTasks.unshift(newTask);
        }
        state.totalElements += 1;
        
        // Update calendarTasks if the new task matches the selected date
        if (state.selectedDate && newTask.dueDate) {
          const dateStr = state.selectedDate instanceof Date 
            ? state.selectedDate.toISOString().split('T')[0] 
            : state.selectedDate;
          const taskDate = newTask.dueDate.split('T')[0];
          if (taskDate === dateStr) {
            // Add to calendarTasks if it matches selected date
            state.calendarTasks.unshift(newTask);
            console.log('Redux: Added new task to calendarTasks for date:', dateStr);
          }
        }
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.loading = false;
        // Handle both string and object error payloads
        if (typeof action.payload === 'object' && action.payload?.message) {
          state.error = action.payload;
        } else {
          state.error = { 
            message: action.payload || 'Không thể tạo task', 
            details: 'Vui lòng thử lại sau' 
          };
        }
      });

    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        state.tasks = response.content || [];
        console.log('Redux: fetchTasks.fulfilled - Total tasks:', state.tasks.length);
        console.log('Redux: fetchTasks.fulfilled - Selected date:', state.selectedDate);
        
        // Debug: Log full structure of first task to see all fields
        if (state.tasks.length > 0) {
          console.log('Redux: First task structure:', JSON.stringify(state.tasks[0], null, 2));
          console.log('Redux: First task keys:', Object.keys(state.tasks[0]));
          console.log('Redux: First task dueDate:', state.tasks[0].dueDate);
          console.log('Redux: First task due_date:', state.tasks[0].due_date);
          console.log('Redux: First task due:', state.tasks[0].due);
        }
        
        // Filter personal tasks (projectName is null or empty)
        state.myTasks = state.tasks.filter(
          (task) => !task.projectName || task.projectName === ''
        );
        state.totalElements = response.totalElements || 0;
        state.totalPages = response.totalPages || 0;
        
        // Update calendar tasks if date is selected
        if (state.selectedDate) {
          const dateStr = state.selectedDate instanceof Date 
            ? state.selectedDate.toISOString().split('T')[0] 
            : state.selectedDate;
          console.log('Redux: Filtering calendar tasks for date:', dateStr);
          
          // Debug: Log all tasks with their dueDate (check multiple possible field names)
          console.log('Redux: All tasks with date fields:');
          state.tasks.forEach((task, index) => {
            const dueDate = task.dueDate || task.due_date || task.due || null;
            console.log(`  Task ${index + 1}: name="${task.name}", dueDate="${task.dueDate}", due_date="${task.due_date}", due="${task.due}", resolved="${dueDate}"`);
          });
          
          state.calendarTasks = state.tasks.filter(task => {
            // Check multiple possible field names for due date
            const dueDate = task.dueDate || task.due_date || task.due || null;
            if (!dueDate) {
              console.log(`Redux: Task "${task.name}" has no dueDate (checked dueDate, due_date, due)`);
              return false;
            }
            const taskDate = dueDate.split('T')[0];
            const matches = taskDate === dateStr;
            console.log(`Redux: Task "${task.name}": dueDate="${dueDate}", taskDate="${taskDate}", targetDate="${dateStr}", matches=${matches}`);
            return matches;
          });
          console.log('Redux: Filtered calendar tasks count:', state.calendarTasks.length);
        } else {
          console.log('Redux: No selected date, calendarTasks will be empty');
          state.calendarTasks = [];
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        // Handle both string and object error payloads
        if (typeof action.payload === 'object' && action.payload?.message) {
          state.error = action.payload;
        } else {
          state.error = { 
            message: action.payload || 'Không thể tải danh sách task', 
            details: 'Vui lòng thử lại sau' 
          };
        }
      });

    // Fetch tasks by date
    builder
      .addCase(fetchTasksByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.calendarTasks = action.payload.tasks || [];
        state.selectedDate = action.payload.date;
      })
      .addCase(fetchTasksByDate.rejected, (state, action) => {
        state.loading = false;
        if (typeof action.payload === 'object' && action.payload?.message) {
          state.error = action.payload;
        } else {
          state.error = { 
            message: action.payload || 'Không thể tải tasks theo ngày', 
            details: 'Vui lòng thử lại sau' 
          };
        }
      });

    // Update task
    builder
      .addCase(updateExistingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload;
        // Update in tasks list
        const taskIndex = state.tasks.findIndex((t) => t.id === updatedTask.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = updatedTask;
        }
        // Update in myTasks if it's a personal task
        if (!updatedTask.projectName || updatedTask.projectName === '') {
          const myTaskIndex = state.myTasks.findIndex((t) => t.id === updatedTask.id);
          if (myTaskIndex !== -1) {
            state.myTasks[myTaskIndex] = updatedTask;
          } else {
            // If it wasn't in myTasks before, add it
            state.myTasks.unshift(updatedTask);
          }
        } else {
          // If it's no longer a personal task, remove from myTasks
          state.myTasks = state.myTasks.filter((t) => t.id !== updatedTask.id);
        }
      })
      .addCase(updateExistingTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update task';
      });

    // Delete task
    builder
      .addCase(deleteExistingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingTask.fulfilled, (state, action) => {
        state.loading = false;
        const taskId = action.payload;
        // Remove from tasks list
        state.tasks = state.tasks.filter((t) => t.id !== taskId);
        // Remove from myTasks
        state.myTasks = state.myTasks.filter((t) => t.id !== taskId);
        state.totalElements = Math.max(0, state.totalElements - 1);
      })
      .addCase(deleteExistingTask.rejected, (state, action) => {
        state.loading = false;
        // Handle both string and object error payloads
        if (typeof action.payload === 'object' && action.payload?.message) {
          state.error = action.payload;
        } else {
          state.error = { 
            message: action.payload || 'Không thể xóa task', 
            details: 'Vui lòng thử lại sau' 
          };
        }
      });
  },
});

// Selectors
export const selectTasks = (state) => state.tasks.tasks;
export const selectMyTasks = (state) => state.tasks.myTasks;
export const selectCalendarTasks = (state) => state.tasks.calendarTasks;
export const selectSelectedDate = (state) => state.tasks.selectedDate;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectTasksTotal = (state) => state.tasks.totalElements;

// Selector to get tasks by status
export const selectTasksByStatus = createSelector(
  [selectMyTasks],
  (tasks) => {
    return {
      all: tasks,
      todo: tasks.filter((t) => !t.progress || t.progress === 0),
      inProgress: tasks.filter((t) => t.progress > 0 && t.progress < 100),
      completed: tasks.filter((t) => t.progress === 100),
    };
  }
);

export const { clearError, clearTasks, setSelectedDate } = taskSlice.actions;
export default taskSlice.reducer;

