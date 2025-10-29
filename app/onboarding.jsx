import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          <Image
            source={require('../assets/images/Onboarding Image.png')}
            style={styles.image}
            contentFit="contain"
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Task Management &{"\n"}To-Do List</Text>
          <Text style={styles.subtitle}>
            This productive tool is designed to help you better manage your task
            project‑wise conveniently!
          </Text>
        </View>

        <Pressable style={styles.startButton} onPress={handleStart} android_ripple={{ color: 'rgba(255,255,255,0.2)' }}>
          <Text style={styles.startText}>Let’s Start</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.startIcon} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxWidth: 360,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 6 },
    }),
  },
  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F7FF',
  },
  image: {
    width: '100%',
    height: 300,
  },
  textBlock: {
    marginTop: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: '#2B2D31',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
  startButton: {
    marginTop: 18,
    backgroundColor: '#6C4CF1',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  startText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  startIcon: {
    marginLeft: 8,
  },
});
