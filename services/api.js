/**
 * API Services - Backward Compatibility File
 * 
 * File này re-export tất cả APIs để tương thích với code cũ.
 * Code mới nên import từ file riêng hoặc apiServices.js:
 *   - import { login, register } from '@/services/authApi';
 *   - import { getUserById } from '@/services/userApi';
 *   - Hoặc: import { login, getUserById } from '@/services/apiServices';
 * 
 * @deprecated Sử dụng file riêng hoặc @/services/apiServices.js thay thế
 */

// Re-export all APIs for backward compatibility
export { login, register } from './authApi';
export { getUserById, getUserByUsername, updateUser } from './userApi';
export { getUsersList, createUser, deleteUser } from './adminApi';

