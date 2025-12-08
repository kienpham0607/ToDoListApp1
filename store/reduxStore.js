/**
 * Redux Store Configuration
 * 
 * File này cấu hình Redux store cho toàn bộ ứng dụng.
 * Tập hợp tất cả các reducers và cấu hình middleware.
 * 
 * Reducers được quản lý:
 * - auth: Quản lý authentication (login, logout, user info)
 * - userManagement: Quản lý users (chỉ dành cho admin)
 * 
 * Cách sử dụng:
 *   import { store } from '@/store/reduxStore';
 *   Hoặc: import { store } from '@/store'; (tự động dùng index.js)
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userManagementReducer from './userManagementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userManagement: userManagementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Bỏ qua các action types này trong serializable check
        // Vì chúng có thể chứa dữ liệu không serializable được
        ignoredActions: ['auth/login/fulfilled', 'auth/loadToken/fulfilled'],
      },
    }),
});

