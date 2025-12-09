import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, saveCredentials, clearCredentials, clearError, loadToken } from '@/store/authSlice';

const CREDENTIAL_KEY = 'todyapp_credentials_v1';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const loadSavedCredentials = async () => {
    try {
      console.log('Loading saved credentials...');
      const json = await SecureStore.getItemAsync(CREDENTIAL_KEY);
      console.log('Loaded credentials from storage:', json ? 'Found' : 'Not found');
      if (json) {
        const creds = JSON.parse(json);
        console.log('Parsed credentials:', { username: creds?.username, hasPassword: !!creds?.password });
        if (creds?.username && creds?.password) {
          // Use setTimeout to ensure state updates properly
          setTimeout(() => {
          setUsername(creds.username);
          setPassword(creds.password);
          setRememberMe(true);
            console.log('Credentials loaded and set:', { username: creds.username, rememberMe: true });
          }, 100);
        } else {
          console.log('Credentials found but missing username or password');
        }
      } else {
        console.log('No saved credentials found');
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  useEffect(() => {
    loadSavedCredentials();
    // Load token if exists
    dispatch(loadToken());
  }, [dispatch]);

  // Reload credentials when screen comes into focus (user navigates back to login)
  useFocusEffect(
    useCallback(() => {
      console.log('Login screen focused, reloading credentials...');
      loadSavedCredentials();
    }, [])
  );

  // Navigate to homepage if authenticated (after successful login)
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        router.replace('/(tabs)/homepage');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show error alert
  useEffect(() => {
    if (error && !isLoading) {
      // Only show alert, don't log the full error message again (already logged in authApi)
      alert(error);
      dispatch(clearError());
    }
  }, [error, isLoading, dispatch]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Clear any previous errors
    dispatch(clearError());

    try {
      console.log('Starting login for:', username.trim());
      const result = await dispatch(loginUser({ 
        username: username.trim(), 
        password 
      })).unwrap();
      
      console.log('Login successful:', result);
      
      // Save or clear credentials based on remember me checkbox
      if (rememberMe) {
        console.log('Saving credentials for remember me:', { username: username.trim(), hasPassword: !!password });
        try {
          // Save directly to SecureStore to ensure it works
          await SecureStore.setItemAsync(CREDENTIAL_KEY, JSON.stringify({ 
            username: username.trim(), 
            password 
          }));
          console.log('Credentials saved successfully to SecureStore');
          // Also dispatch to Redux for consistency
          dispatch(saveCredentials({ 
            username: username.trim(), 
            password 
          }));
        } catch (saveError) {
          console.error('Error saving credentials:', saveError);
        }
      } else {
        console.log('Clearing credentials (remember me not checked)');
        try {
          await SecureStore.deleteItemAsync(CREDENTIAL_KEY);
          console.log('Credentials cleared successfully from SecureStore');
          // Also dispatch to Redux for consistency
        dispatch(clearCredentials());
        } catch (clearError) {
          console.error('Error clearing credentials:', clearError);
        }
      }
      
      // Navigation will happen automatically via useEffect when isAuthenticated changes
    } catch (error) {
      // Error is already set in Redux state and will be shown by useEffect
      // Don't show duplicate alert here - useEffect will handle it
      console.error('Login failed:', error?.message || error);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleBack = () => {
    router.push('/(tabs)/homepage');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Your work faster and structured with Todyapp</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor="#A0A0A0"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                hitSlop={8}
                style={styles.eyeButton}
              >
                <Ionicons name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color="#999" />
              </Pressable>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Pressable style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>
            <View />
          </View>

          <Pressable 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Next</Text>
            )}
          </Pressable>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don’t have an account? </Text>
            <Pressable onPress={handleSignUp}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1.5,
    borderColor: '#E4E6EB',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E4E6EB',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#029688',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#029688',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E4E6EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#029688',
    borderColor: '#029688',
  },
  rememberText: {
    fontSize: 14,
    color: '#333',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
});
