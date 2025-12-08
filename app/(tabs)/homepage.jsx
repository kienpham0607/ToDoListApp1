import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/store/authSlice';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Navigate to login screen after logout
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      router.replace('/login');
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const inProgressTasks = [
    { id: '1', title: 'Office Project', description: 'Grocery shopping app design', progress: 75, color: '#2196F3', icon: 'briefcase' },
    { id: '2', title: 'Personal Project', description: 'Uber Eats redesign challenge', progress: 45, color: '#FF9800', icon: 'person' },
  ];

  const taskGroups = [
    { id: '1', title: 'Office Project', tasks: 23, progress: 70, color: '#E91E63', icon: 'briefcase' },
    { id: '2', title: 'Personal Project', tasks: 30, progress: 52, color: '#9C27B0', icon: 'person' },
    { id: '3', title: 'Daily Study', tasks: 30, progress: 87, color: '#FF9800', icon: 'book' },
  ];


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Login Button - Only show if not authenticated */}
      {!isAuthenticated && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Home</Text>
            </View>
            <Pressable style={styles.loginButton} onPress={handleLogin}>
              <Ionicons name="log-in-outline" size={18} color="#029688" />
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Greeting Section */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#029688" />
              </View>
            </View>
            <View style={styles.userText}>
              <Text style={styles.greeting}>
                Hello {userInfo?.fullName || userInfo?.username || 'User'}!
              </Text>
            </View>
            {/* Logout button - Only show when authenticated */}
            {isAuthenticated && (
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#666" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Today's Task Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryText}>Your today&apos;s task almost done!</Text>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Pressable style={styles.viewTaskButton}>
                <Text style={styles.viewTaskText}>View Task</Text>
              </Pressable>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>85%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* In Progress Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>6</Text>
            </View>

          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {inProgressTasks.map((task) => (
              <View key={task.id} style={[styles.taskCard, { backgroundColor: task.color }]}>
                <View style={styles.taskCardHeader}>
                  <Text style={styles.taskCardTitle}>{task.title}</Text>
                  <Ionicons name={task.icon} size={20} color="#fff" />
                </View>
                <Text style={styles.taskCardDescription}>{task.description}</Text>
                <View style={styles.taskProgressBar}>
                  <View style={[styles.taskProgressFill, { width: `${task.progress}%` }]} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Task Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Task Groups</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>4</Text>
            </View>

          </View>
          {taskGroups.map((group) => (
            <View key={group.id} style={styles.groupCard}>
              <View style={styles.groupLeft}>
                <View style={[styles.groupIcon, { backgroundColor: group.color }]}>
                  <Ionicons name={group.icon} size={20} color="#fff" />
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <Text style={styles.groupTasks}>{group.tasks} Tasks</Text>
                </View>
              </View>
              <View style={styles.groupProgress}>
                <Text style={[styles.groupProgressText, { color: group.color }]}>{group.progress}%</Text>
                <View style={styles.groupProgressCircle}>
                  <View style={[styles.groupProgressFill, { 
                    backgroundColor: group.color,
                    transform: [{ rotate: `${(group.progress / 100) * 360}deg` }]
                  }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  // User Section
  userSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  userText: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  // Summary Card
  summaryCard: {
    backgroundColor: '#9C27B0',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    flex: 1,
  },
  viewTaskButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  viewTaskText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  sectionBadge: {
    backgroundColor: '#E1BEE7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C27B0',
  },
  // In Progress Tasks
  horizontalScroll: {
    paddingLeft: 20,
  },
  taskCard: {
    width: 200,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
    }),
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  taskCardDescription: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 12,
    opacity: 0.9,
  },
  taskProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  // Task Groups
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  groupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  groupTasks: {
    fontSize: 14,
    color: '#666',
  },
  groupProgress: {
    alignItems: 'center',
  },
  groupProgressText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupProgressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupProgressFill: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  // Header
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#029688',
  },
  loginButtonText: {
    color: '#029688',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
});


