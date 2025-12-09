// Minimal Metro config compatible with Expo SDK 54+
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for react-native-toast-message module resolution
config.resolver.sourceExts.push('mjs');

module.exports = config;
