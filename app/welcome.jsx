import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleEmailContinue = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Welcome to <Text style={styles.appName}>Todyapp</Text>
          </Text>
        </View>

        <View style={styles.phoneMockup}>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneScreen}>
              <View style={styles.phoneStatusBar}>
                <Text style={styles.phoneTime}>9:41</Text>
                <View style={styles.phoneStatusIcons}>
                  <Ionicons name="cellular" size={12} color="#000" />
                  <Ionicons name="wifi" size={12} color="#000" />
                  <Ionicons name="battery-full" size={12} color="#000" />
                </View>
              </View>
              
              <View style={styles.phoneContent}>
                <Text style={styles.phoneTitle}>Theme</Text>
                
                <View style={styles.colorOptions}>
                  <View style={[styles.colorOption, styles.colorOptionSelected]}>
                    <View style={[styles.colorBar, { backgroundColor: '#4CAF50' }]} />
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                  <View style={styles.colorOption}>
                    <View style={[styles.colorBar, { backgroundColor: '#FFEB3B' }]} />
                  </View>
                  <View style={styles.colorOption}>
                    <View style={[styles.colorBar, { backgroundColor: '#FF9800' }]} />
                  </View>
                  <View style={styles.colorOption}>
                    <View style={[styles.colorBar, { backgroundColor: '#9E9E9E' }]} />
                  </View>
                  <View style={styles.colorOption}>
                    <View style={[styles.colorBar, { backgroundColor: '#2196F3' }]} />
                  </View>
                  <View style={styles.colorOption}>
                    <View style={[styles.colorBar, { backgroundColor: '#4CAF50' }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          {/* Floating cards */}
          <View style={styles.floatingCard1}>
            <View style={styles.chartContainer}>
              <View style={[styles.chartBar, { backgroundColor: '#F44336', height: 20 }]} />
              <View style={[styles.chartBar, { backgroundColor: '#4CAF50', height: 30 }]} />
              <View style={[styles.chartBar, { backgroundColor: '#2196F3', height: 25 }]} />
              <View style={[styles.chartBar, { backgroundColor: '#9C27B0', height: 15 }]} />
              <View style={[styles.chartBar, { backgroundColor: '#FF9800', height: 35 }]} />
            </View>
          </View>
          
          <View style={styles.floatingCard2}>
            <View style={styles.taskItem}>
              <Ionicons name="alert-circle" size={16} color="#F44336" />
              <Text style={styles.taskText}>Missing Task</Text>
              <Ionicons name="ellipsis-horizontal" size={16} color="#999" />
            </View>
            <View style={styles.taskItem}>
              <Ionicons name="folder" size={16} color="#2196F3" />
              <Text style={styles.taskText}>New Project</Text>
              <Ionicons name="ellipsis-horizontal" size={16} color="#999" />
            </View>
            <View style={styles.taskItem}>
              <Ionicons name="folder" size={16} color="#4CAF50" />
              <Text style={styles.taskText}>New Project</Text>
              <Ionicons name="ellipsis-horizontal" size={16} color="#999" />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.emailButton} onPress={handleEmailContinue}>
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.emailButtonText}>Continue with email</Text>
          </Pressable>
          
          <Text style={styles.orText}>or continue with</Text>
          
          <View style={styles.socialButtons}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={20} color="#1877f2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </Pressable>
            
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="#db4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </Pressable>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={handleLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  appName: {
    color: '#029688',
  },
  phoneMockup: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  phoneFrame: {
    width: 200,
    height: 400,
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  phoneStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  phoneTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  phoneStatusIcons: {
    flexDirection: 'row',
    gap: 2,
  },
  phoneContent: {
    padding: 20,
  },
  phoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  colorOptions: {
    gap: 12,
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  colorBar: {
    width: 120,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  floatingCard1: {
    position: 'absolute',
    top: -20,
    left: -40,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
  },
  floatingCard2: {
    position: 'absolute',
    bottom: -20,
    right: -40,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  emailButton: {
    backgroundColor: '#029688',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 16,
    gap: 8,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#029688',
    fontWeight: '500',
  },
});
