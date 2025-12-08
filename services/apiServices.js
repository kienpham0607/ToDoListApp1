/**
 * API Services - Central Export File
 * 
 * File này tập hợp và export tất cả các API functions từ các file riêng lẻ.
 * Giúp import dễ dàng từ một nơi duy nhất.
 * 
 * Cách sử dụng:
 *   import { login, register } from '@/services/apiServices';
 *   import { getUserById, updateUser } from '@/services/apiServices';
 *   import { getUsersList, createUser } from '@/services/apiServices';
 * 
 * Hoặc import từ file riêng:
 *   import { login } from '@/services/authApi';
 *   import { getUserById } from '@/services/userApi';
 */

// Authentication APIs - Đăng nhập và đăng ký
export { login, register } from './authApi';

// User APIs - Quản lý thông tin user
export { getUserById, getUserByUsername, updateUser } from './userApi';

// Admin APIs - Quản lý users (chỉ dành cho admin)
export { getUsersList, createUser, deleteUser } from './adminApi';

