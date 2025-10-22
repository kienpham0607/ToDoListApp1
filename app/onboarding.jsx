import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen === 0) {
      setCurrentScreen(1);
    } else if (currentScreen === 1) {
      setCurrentScreen(2);
    } else {
      router.replace('/(tabs)/homepage');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/homepage');
  };

  const renderScreen1 = () => (
    <View style={styles.screenContainer}>
      <View style={styles.backgroundGradient}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoIcon}>
              <Ionicons name="list" size={40} color="#029688" />
              <View style={styles.logoCheckmark}>
                <Ionicons name="checkmark" size={24} color="#4CAF50" />
              </View>
            </View>
          </View>
        </View>
        
        <Text style={styles.appName}>Todyapp</Text>
        <Text style={styles.tagline}>The best to do list application for you</Text>
        
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>
        
        <Pressable style={styles.continueButton1} onPress={handleNext}>
          <Text style={styles.continueText1}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
        </Pressable>
      </View>
    </View>
  );

  const renderScreen2 = () => (
    <View style={styles.screen2Container}>
      <View style={styles.screen2HeaderMinimal}>
        <Pressable onPress={handleSkip} style={styles.skipButton2}>
          <Text style={styles.skipText2}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.illustrationContainer}>
        <Image
          source={require('../assets/images/Onboarding Image.png')}
          style={styles.illustration}
          contentFit="contain"
        />
      </View>

      <View style={styles.contentSection2}>
        <Text style={styles.featureTitle2}>Your convenience in making a todo list</Text>
        <Text style={styles.featureDescription2}>
          Here&apos;s a mobile platform that helps you create task or to list so that it can help you in every job easier and faster.
        </Text>

        <View style={styles.dotsContainer2}>
          <View style={[styles.dot2, styles.dotInactive2]} />
          <View style={[styles.dot2, styles.dotActive2]} />
          <View style={[styles.dot2, styles.dotInactive2]} />
        </View>

        <Pressable style={styles.continueButton2} onPress={handleNext}>
          <Text style={styles.continueText2}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderScreen3 = () => (
    <View style={styles.screen3Container}>
      <View style={styles.screen3HeaderMinimal}>
        <Pressable onPress={handleSkip} style={styles.skipButton3}>
          <Text style={styles.skipText3}>Skip</Text>
        </Pressable>
      </View>
      
      <View style={styles.illustrationContainer}>
        <Image
          source={require('../assets/images/Onboarding Image.png')}
          style={styles.illustration}
          contentFit="contain"
        />
      </View>
      
      <View style={styles.contentSection3}>
        <Text style={styles.featureTitle3}>Find the practicality in making your todo list</Text>
        <Text style={styles.featureDescription3}>
          Easy-to-understand user interface that makes you more comfortable when you want to create a task or to do list, Todyapp can also improve productivity
        </Text>
        
        <View style={styles.dotsContainer2}>
          <View style={[styles.dot2, styles.dotInactive2]} />
          <View style={[styles.dot2, styles.dotInactive2]} />
          <View style={[styles.dot2, styles.dotActive2]} />
        </View>
        
        <Pressable style={styles.continueButton3} onPress={handleNext}>
          <Text style={styles.continueText3}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {currentScreen === 0 ? renderScreen1() : currentScreen === 1 ? renderScreen2() : renderScreen3()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#029688',
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Screen 1 styles
  logoContainer: {
    marginBottom: 40,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  logoIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCheckmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 4 },
    }),
  },
  appName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  continueButton1: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  continueText1: {
    color: '#029688',
    fontSize: 16,
    fontWeight: '600',
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: '#029688',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  // Screen 2 styles - New design
  screen2Container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  screen2HeaderMinimal: {
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingBottom: 10,
    paddingRight: 20,
  },
  screen2Time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  screen2StatusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  skipButton2: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText2: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  phoneMockup2: {
    alignItems: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  phoneFrame2: {
    width: 200,
    height: 400,
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 10 },
    }),
  },
  phoneScreen2: {
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
    marginBottom: 8,
  },
  phoneSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  floatingCard1: {
    position: 'absolute',
    top: -20,
    right: -40,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  floatingCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCardText: {
    fontSize: 12,
    color: '#333',
  },
  floatingCard2: {
    position: 'absolute',
    bottom: -20,
    left: -60,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
    }),
  },
  socialConnect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  socialText: {
    fontSize: 12,
    color: '#333',
  },
  socialIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection2: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  illustration: {
    width: '100%',
    maxWidth: 320,
    height: 260,
  },
  // Todo list styles for screen 2
  todoList2: {
    marginTop: 16,
    gap: 8,
  },
  todoItem2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todoCheckbox2: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoText2: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  // Inbox styles for screen 3
  inboxHeader3: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  taskCheckbox3: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent3: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskDot3: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  addButton3: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // New styles for screen 2
  themeScrollContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeCard: {
    backgroundColor: '#029688',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  themeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeCardText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  placeholderCard: {
    backgroundColor: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    height: 40,
  },
  floatingCardLeft1: {
    position: 'absolute',
    top: -30,
    left: -40,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  floatingCardLeft2: {
    position: 'absolute',
    top: 20,
    left: -50,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  floatingCardRight: {
    position: 'absolute',
    top: -20,
    right: -30,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  floatingCardContent: {
    alignItems: 'center',
    gap: 4,
  },
  floatingCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  floatingCardSubtitle: {
    fontSize: 10,
    color: '#666',
  },
  statusDots: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // New styles for screen 3
  taskCards3: {
    gap: 12,
    marginTop: 16,
  },
  priorityTaskCard1: {
    backgroundColor: '#029688',
    padding: 16,
    borderRadius: 12,
  },
  priorityTaskCard2: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 12,
  },
  priorityTaskTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  priorityTaskProject: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  priorityTaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityTaskTime: {
    color: '#fff',
    fontSize: 10,
  },
  floatingCardLeft3: {
    position: 'absolute',
    top: -30,
    left: -40,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  floatingCardRight3: {
    position: 'absolute',
    top: -20,
    right: -30,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  floatingCardContent3: {
    gap: 8,
  },
  circlePlaceholder: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  contentSection3: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  featureTitle2: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureDescription2: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  dotsContainer2: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot2: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive2: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  dotInactive2: {
    backgroundColor: '#ddd',
  },
  continueButton2: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
    alignSelf: 'center',
  },
  continueText2: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Common styles
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  // Screen 3 styles
  screen3Container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  screen3HeaderMinimal: {
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingBottom: 10,
    paddingRight: 20,
  },
  screen3Time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  screen3StatusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  skipButton3: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText3: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  phoneMockup3: {
    alignItems: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  phoneFrame3: {
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
  phoneScreen3: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  phoneStatusBar3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  phoneTime3: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  phoneStatusIcons3: {
    flexDirection: 'row',
    gap: 2,
  },
  phoneContent3: {
    padding: 20,
  },
  phoneTitle3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  taskList3: {
    gap: 16,
  },
  taskItem3: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  taskHeader3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle3: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskDate3: {
    fontSize: 12,
    color: '#666',
  },
  taskMeta3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCategory3: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText3: {
    fontSize: 12,
    color: '#666',
  },
  taskIcons3: {
    flexDirection: 'row',
    gap: 8,
  },
  floatingCard3: {
    position: 'absolute',
    top: -20,
    right: -40,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  floatingCardText3: {
    fontSize: 12,
    color: '#333',
  },
  floatingCard4: {
    position: 'absolute',
    bottom: -20,
    left: -60,
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
  priorityItem3: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityText3: {
    fontSize: 12,
    color: '#333',
  },
  featureTitle3: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureDescription3: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  dotsContainer3: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot3: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive3: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  dotInactive3: {
    backgroundColor: '#ddd',
  },
  continueButton3: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
    alignSelf: 'center',
  },
  continueText3: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
