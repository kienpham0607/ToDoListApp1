import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { getUsersList, createUser, deleteUser } from '@/services/adminApi';
import { updateUser as updateUserAPI } from '@/services/userApi';

// Async thunk to fetch users list
export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async ({ offset = 0, limit = 10 }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }
      
      console.log('Redux: Fetching users list');
      const data = await getUsersList(token, offset, limit);
      console.log('Redux: Users list fetched:', data);
      return data;
    } catch (error) {
      console.error('Redux: Fetch users error:', error);
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

// Async thunk to create user
export const createNewUser = createAsyncThunk(
  'userManagement/createUser',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }
      
      console.log('Redux: Creating new user');
      const newUser = await createUser(token, userData);
      console.log('Redux: User created:', newUser);
      return newUser;
    } catch (error) {
      console.error('Redux: Create user error:', error);
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

// Async thunk to update user (admin)
export const updateUserAdmin = createAsyncThunk(
  'userManagement/updateUser',
  async ({ userId, updateData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }
      
      console.log('Redux: Updating user (admin):', userId);
      const updatedUser = await updateUserAPI(token, userId, updateData);
      console.log('Redux: User updated:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Redux: Update user error:', error);
      return rejectWithValue(error.message || 'Failed to update user');
    }
  }
);

// Async thunk to delete user
export const deleteUserAdmin = createAsyncThunk(
  'userManagement/deleteUser',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }
      
      console.log('Redux: Deleting user:', userId);
      await deleteUser(token, userId);
      console.log('Redux: User deleted');
      return userId;
    } catch (error) {
      console.error('Redux: Delete user error:', error);
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

const initialState = {
  users: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  isLoading: false,
  error: null,
};

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetUsers: (state) => {
      state.users = [];
      state.totalElements = 0;
      state.totalPages = 0;
      state.currentPage = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.content || [];
        state.totalElements = action.payload.totalElements || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.number || 0;
        state.pageSize = action.payload.size || 10;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create User
    builder
      .addCase(createNewUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new user to list
        state.users.unshift(action.payload);
        state.totalElements += 1;
        state.error = null;
      })
      .addCase(createNewUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update User
    builder
      .addCase(updateUserAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update user in list
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUserAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete User
    builder
      .addCase(deleteUserAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUserAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove user from list
        state.users = state.users.filter(u => u.id !== action.payload);
        state.totalElements -= 1;
        state.error = null;
      })
      .addCase(deleteUserAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetUsers } = userManagementSlice.actions;
export default userManagementSlice.reducer;

// Selectors
const selectUserManagementState = (state) => state.userManagement;

export const selectUsers = createSelector(
  [selectUserManagementState],
  (userManagement) => userManagement.users
);

export const selectUsersLoading = createSelector(
  [selectUserManagementState],
  (userManagement) => userManagement.isLoading
);

export const selectUsersError = createSelector(
  [selectUserManagementState],
  (userManagement) => userManagement.error
);

export const selectUsersPagination = createSelector(
  [selectUserManagementState],
  (userManagement) => ({
    totalElements: userManagement.totalElements,
    totalPages: userManagement.totalPages,
    currentPage: userManagement.currentPage,
    pageSize: userManagement.pageSize,
  })
);

