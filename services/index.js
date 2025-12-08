/**
 * API Services Index - Entry Point
 * 
 * File này là entry point khi import từ folder @/services
 * Re-export từ apiServices.js để giữ backward compatibility
 * 
 * Cách sử dụng:
 *   import { login, register } from '@/services';
 *   import { getUserById } from '@/services';
 * 
 * Hoặc import từ file cụ thể (khuyến nghị):
 *   import { login } from '@/services/authApi';
 *   import { getUserById } from '@/services/userApi';
 * 
 * Hoặc import từ apiServices.js:
 *   import { login, getUserById } from '@/services/apiServices';
 */

// Re-export từ apiServices.js
export * from './apiServices';

