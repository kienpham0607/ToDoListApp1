import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { login as loginAPI, register as registerAPI } from '@/services/authApi';
import { getUserById, getUserByUsername, updateMyProfile as updateMyProfileAPI } from '@/services/userApi';

const TOKEN_KEY = 'todyapp_token_v1';
const CREDENTIAL_KEY = 'todyapp_credentials_v1';

// Robust Base64 decode function
const decodeBase64 = (input) => {
  try {
    if (typeof atob === 'function') {
      return atob(input);
    }
  } catch (e) {
    // Fallthrough to polyfill
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 == 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }

  for (let bc = 0, bs = 0, buffer, i = 0;
    buffer = str.charAt(i++);
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
};

// Helper to parse JWT
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(decodeBase64(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('Redux: Error parsing JWT:', e);
    return null;
  }
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      console.log('Redux: Starting login for user:', username);
      const token = await loginAPI(username, password);
      console.log('Redux: Login API successful, saving token');
      // Save token to secure store
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('Redux: Token saved successfully');

      // Get user info after login
      let userInfo = null;
      try {
        userInfo = await getUserByUsername(token, username);
        console.log('Redux: User info loaded:', userInfo);
      } catch (userError) {
        console.warn('Redux: Could not load user info, using username only:', userError);
        // If can't get user info, just use username
        userInfo = { username, fullName: username };
      }

      // Calculate expiry from token
      let tokenExpiry = null;
      const decoded = parseJwt(token);
      if (decoded && decoded.exp) {
        tokenExpiry = decoded.exp * 1000; // Convert to ms
        console.log('Redux: Token expires at:', new Date(tokenExpiry).toLocaleString());
      } else {
        // Fallback if parsing fails (shouldn't happen with valid JWT)
        // Default to 24 hours to match backend
        tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
        console.log('Redux: Could not parse token expiry, using default 24h');
      }

      return {
        token,
        username,
        userInfo: userInfo || { username, fullName: username },
        tokenExpiry
      };
    } catch (error) {
      console.error('Redux: Login error:', error);
      console.error('Redux: Error message:', error.message);
      const errorMessage = error.message || 'Login failed';
      console.error('Redux: Rejecting with message:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for register
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ username, email, password, fullName, role = 'member' }, { rejectWithValue }) => {
    try {
      console.log('Redux: Registering user with role:', role);
      console.log('Redux: Role type:', typeof role);
      const result = await registerAPI(username, email, password, fullName, role);
      console.log('Redux: Registration successful');
      // Store user info for display (since register doesn't return user object)
      return {
        result,
        userInfo: { username, email, fullName, role }
      };
    } catch (error) {
      console.error('Redux: Registration error:', error);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Async thunk to load saved token
export const loadToken = createAsyncThunk(
  'auth/loadToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      if (token) {
        // Validation: Check if token is expired
        const decoded = parseJwt(token);
        if (decoded && decoded.exp) {
          const expiry = decoded.exp * 1000;
          if (Date.now() >= expiry) {
            console.log('Redux: Loaded token is EXPIRED. Discarding.');
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            return null;
          }
          console.log('Redux: Loaded token is valid until:', new Date(expiry).toLocaleString());
          // Return both token and expiry
          return { token, tokenExpiry: expiry };
        } else {
          // Fallback: If we can't decode it, we can either discard it or keep it conservatively.
          // Given the robust decoder, failure likely means invalid token. Discard.
          console.warn('Redux: Could not decode loaded token. Discarding.');
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          return null;
        }
      }

      console.log('Loaded token from storage: No token');
      return null;
    } catch (error) {
      console.error('Error loading token:', error);
      return null;
    }
  }
);

// Async thunk to save credentials
export const saveCredentials = createAsyncThunk(
  'auth/saveCredentials',
  async ({ username, password }) => {
    await SecureStore.setItemAsync(CREDENTIAL_KEY, JSON.stringify({ username, password }));
  }
);

// Async thunk to clear credentials
export const clearCredentials = createAsyncThunk(
  'auth/clearCredentials',
  async () => {
    await SecureStore.deleteItemAsync(CREDENTIAL_KEY);
  }
);

// Async thunk to logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    // Only delete token, keep credentials if user wants to remember
    // Credentials will only be deleted when user unchecks "Remember me"
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    // Don't delete CREDENTIAL_KEY here - let user control it via "Remember me" checkbox
  }
);

// Async thunk to update user profile (uses new /user/profile endpoint)
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, updateData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }

      console.log('Redux: Updating my profile (using /user/profile endpoint)');
      // Use new endpoint that gets user from JWT token
      const updatedUser = await updateMyProfileAPI(token, updateData);
      console.log('Redux: User profile updated:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Redux: Update user error:', error);
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Async thunk to refresh user info
export const refreshUserInfo = createAsyncThunk(
  'auth/refreshUserInfo',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }

      console.log('Redux: Refreshing user info:', userId);
      const userInfo = await getUserById(token, userId);
      console.log('Redux: User info refreshed:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('Redux: Refresh user info error:', error);
      return rejectWithValue(error.message || 'Failed to refresh user info');
    }
  }
);

// Async thunk to change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ userId, currentPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      if (!token) {
        console.error('Redux: No token found in state');
        return rejectWithValue('No authentication token found. Please login again.');
      }

      if (!newPassword || newPassword.length < 6) {
        return rejectWithValue('New password must be at least 6 characters');
      }

      console.log('Redux: Changing password (using /user/profile endpoint)');
      console.log('Redux: Token exists:', !!token);
      console.log('Redux: Token length:', token.length);
      console.log('Redux: Token preview:', token.substring(0, 20) + '...');

      // Backend now only updates fields that are provided (not null)
      // So we only send password field - other fields will remain unchanged
      // Note: userId is not needed anymore - backend gets it from JWT token
      const updateData = {
        password: newPassword,
      };

      console.log('Redux: Updating password only');

      // Use new endpoint that gets user from JWT token
      const updatedUser = await updateMyProfileAPI(token, updateData);
      console.log('Redux: Password changed successfully');
      return updatedUser;
    } catch (error) {
      console.error('Redux: Change password error:', error);
      console.error('Redux: Error message:', error.message);
      console.error('Redux: Error stack:', error.stack);
      // Check if error is about duplicate username/email
      // This shouldn't happen when updating password, but handle it gracefully
      if (error.message && error.message.includes('already exists')) {
        return rejectWithValue('Failed to change password. Please try again or contact support.');
      }
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

// Async thunk to check token expiration
export const checkTokenExpiry = createAsyncThunk(
  'auth/checkTokenExpiry',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { token, tokenExpiry, isAuthenticated } = state.auth;

    // If no token or not authenticated, nothing to check
    if (!token || !isAuthenticated) {
      return { isValid: false };
    }

    // If no expiry set, assume token is valid (backward compatibility)
    if (!tokenExpiry) {
      // Try to parse now if we have token
      const decoded = parseJwt(token);
      if (decoded && decoded.exp) {
        const expiry = decoded.exp * 1000;
        if (Date.now() >= expiry) {
          console.log('Token expired (checked late), logging out...');
          await dispatch(logoutUser());
          return { isValid: false, expired: true };
        }
        return { isValid: true, expiresIn: expiry - Date.now() };
      }
      return { isValid: true };
    }

    // Check if token is expired
    const now = Date.now();
    const isValid = now < tokenExpiry;

    if (!isValid) {
      console.log('Token expired, logging out...');
      // Token expired, logout user
      await dispatch(logoutUser());
      return { isValid: false, expired: true };
    }

    return { isValid: true, expiresIn: tokenExpiry - now };
  }
);

const initialState = {
  token: null,
  username: null,
  userInfo: null, // Store full user info: { id, username, email, fullName, role }
  isLoading: false,
  error: null,
  isAuthenticated: false,
  tokenExpiry: null, // Timestamp when token expires
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.userInfo = action.payload.userInfo;
        state.isAuthenticated = true;
        state.tokenExpiry = action.payload.tokenExpiry;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Load Token
    builder
      .addCase(loadToken.pending, (state) => {
        // Don't change loading state for token load
      })
      .addCase(loadToken.fulfilled, (state, action) => {
        if (action.payload) {
          // Payload is now object { token, tokenExpiry }
          const { token, tokenExpiry } = action.payload;
          state.token = token;
          state.isAuthenticated = true;
          state.tokenExpiry = tokenExpiry;

          console.log('Token loaded, user authenticated');
        } else {
          // Only clear token if user is not already authenticated
          if (!state.isAuthenticated && !state.token) {
            state.token = null;
            state.isAuthenticated = false;
            state.tokenExpiry = null;
            console.log('No token found, user not authenticated');
          } else {
            console.log('Token not found in storage, but user is already authenticated. Keeping current state.');
          }
        }
      })
      .addCase(loadToken.rejected, (state) => {
        // Only clear token if user is not already authenticated
        if (!state.isAuthenticated && !state.token) {
          state.token = null;
          state.isAuthenticated = false;
          console.log('Token load failed, user not authenticated');
        } else {
          console.log('Token load failed, but user is already authenticated. Keeping current state.');
        }
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.username = null;
        state.userInfo = null;
        state.isAuthenticated = false;
        state.tokenExpiry = null;
        state.error = null;
      });

    // Update User Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload;
        state.username = action.payload.username;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Refresh User Info
    builder
      .addCase(refreshUserInfo.pending, (state) => {
      })
      .addCase(refreshUserInfo.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.username = action.payload.username;
      })
      .addCase(refreshUserInfo.rejected, (state, action) => {
        console.error('Failed to refresh user info:', action.payload);
      });

    // Check Token Expiry
    builder
      .addCase(checkTokenExpiry.fulfilled, (state, action) => {
        if (!action.payload.isValid && action.payload.expired) {
          // Token expired, logout handled by logoutUser thunk
        }
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

// Selectors - Using createSelector for memoization
// Base selectors
const selectAuthState = (state) => state.auth;

// Memoized selectors
export const selectToken = createSelector(
  [selectAuthState],
  (auth) => auth.token
);

export const selectUserInfo = createSelector(
  [selectAuthState],
  (auth) => auth.userInfo
);

export const selectUsername = createSelector(
  [selectAuthState],
  (auth) => auth.username
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectIsLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);

export const selectError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

// Combined selectors
export const selectUserDisplayName = createSelector(
  [selectUserInfo],
  (userInfo) => userInfo?.fullName || userInfo?.username || 'User'
);

export const selectUserInitials = createSelector(
  [selectUserInfo],
  (userInfo) => {
    const name = userInfo?.fullName || userInfo?.username || 'U';
    return name.substring(0, 2).toUpperCase();
  }
);

export const selectUserId = createSelector(
  [selectUserInfo],
  (userInfo) => userInfo?.id
);
