/**
 * Redux Store Index - Entry Point
 * 
 * File này là entry point khi import từ folder @/store
 * Re-export từ reduxStore.js để giữ backward compatibility
 * 
 * Cách sử dụng:
 *   import { store } from '@/store';
 * 
 * Hoặc import trực tiếp từ reduxStore.js:
 *   import { store } from '@/store/reduxStore';
 */

// Re-export store từ reduxStore.js
export { store } from './reduxStore';

