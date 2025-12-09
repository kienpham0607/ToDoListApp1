import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '@/store';
import { toastConfig } from '@/utils/toastConfig';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="theme-selection" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="create-project" 
          options={{ 
            headerShown: true,
            title: 'Create Projects',
            headerBackTitle: 'Back'
          }} 
        />
        <Stack.Screen 
          name="project-detail" 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="messages" 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="documents" 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="team" 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="add-task" 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="admin-users" 
          options={{ 
            headerShown: false
          }} 
        />
        </Stack>
        <StatusBar style="auto" />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </Provider>
  );
}
