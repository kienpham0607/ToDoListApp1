import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectToken, selectUserInfo } from '@/store/authSlice';
import { fetchTasks, selectTasks, selectTasksLoading } from '@/store/taskSlice';
import { fetchProjects, selectProjects, selectProjectLoading } from '@/store/projectSlice';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const userInfo = useSelector(selectUserInfo);
  const token = useSelector(selectToken);
  const tasks = useSelector(selectTasks);
  const tasksLoading = useSelector(selectTasksLoading);
  const projects = useSelector(selectProjects);
  const projectsLoading = useSelector(selectProjectLoading);

  // Fetch data when component mounts
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchTasks({ token, offset: 0, limit: 1000 }));
      dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));
    }
  }, [isAuthenticated, token, dispatch]);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/login');
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Calculate today's tasks statistics
  const todayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    const completedToday = todayTasks.filter(task => task.progress === 100).length;
    const totalToday = todayTasks.length;
    const progress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    return {
      total: totalToday,
      completed: completedToday,
      progress,
    };
  }, [tasks]);

  // Get in progress tasks (progress > 0 and < 100)
  const inProgressTasks = useMemo(() => {
    const inProgress = tasks.filter(task => 
      task.progress > 0 && task.progress < 100
    ).slice(0, 10); // Limit to 10 tasks

    // Map to display format with colors
    const colors = ['#2196F3', '#FF9800', '#4CAF50', '#9C27B0', '#F44336', '#00BCD4'];
    const icons = ['briefcase', 'person', 'book', 'home', 'school', 'build'];
    
    return inProgress.map((task, index) => {
      const projectName = task.projectName || 'Personal';
      const colorIndex = index % colors.length;
      
      return {
        id: task.id,
        title: projectName,
        description: task.name || task.description || '',
        progress: task.progress || 0,
        color: colors[colorIndex],
        icon: icons[colorIndex % icons.length],
      };
    });
  }, [tasks]);

  // Calculate task groups (projects) statistics
  const taskGroups = useMemo(() => {
    const projectStats = {};
    
    // Group tasks by project
    tasks.forEach(task => {
      const projectName = task.projectName || 'Personal';
      const projectId = task.projectId || null;
      
      if (!projectStats[projectName]) {
        projectStats[projectName] = {
          name: projectName,
          projectId: projectId,
          tasks: [],
          total: 0,
          completed: 0,
        };
      }
      projectStats[projectName].tasks.push(task);
      projectStats[projectName].total++;
      // Keep the first non-null projectId found
      if (!projectStats[projectName].projectId && projectId) {
        projectStats[projectName].projectId = projectId;
      }
      if (task.progress === 100) {
        projectStats[projectName].completed++;
      }
    });

    // Try to match projectName with projects to get projectId
    const projectNameToIdMap = {};
    projects.forEach(project => {
      projectNameToIdMap[project.name] = project.id;
    });

    // Convert to array and calculate progress
    const colors = ['#E91E63', '#9C27B0', '#FF9800', '#2196F3', '#4CAF50', '#F44336'];
    const icons = ['briefcase', 'person', 'book', 'home', 'school', 'build'];
    
    return Object.values(projectStats).map((stat, index) => {
      const progress = stat.total > 0 
        ? Math.round((stat.completed / stat.total) * 100) 
        : 0;
      const colorIndex = index % colors.length;
      
      // Try to get projectId from projects list if not found in tasks
      const finalProjectId = stat.projectId || projectNameToIdMap[stat.name] || null;
      
      return {
        id: stat.name,
        title: stat.name,
        projectId: finalProjectId,
        tasks: stat.total,
        progress,
        color: colors[colorIndex],
        icon: icons[colorIndex % icons.length],
      };
    }).sort((a, b) => b.tasks - a.tasks); // Sort by number of tasks
  }, [tasks, projects]);


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
            <Text style={styles.summaryText}>
              {todayStats.total === 0 
                ? "You don't have any tasks today!" 
                : todayStats.progress === 100
                ? "All today's tasks completed!"
                : "Your today's task almost done!"}
            </Text>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Pressable 
                style={styles.viewTaskButton}
                onPress={() => router.push('/(tabs)/my-tasks')}
              >
                <Text style={styles.viewTaskText}>View Task</Text>
              </Pressable>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>{todayStats.progress}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* In Progress Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{inProgressTasks.length}</Text>
            </View>
          </View>
          {tasksLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#9C27B0" />
            </View>
          ) : inProgressTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks in progress</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {inProgressTasks.map((task) => (
                <View key={task.id} style={[styles.taskCard, { backgroundColor: task.color }]}>
                  <View style={styles.taskCardHeader}>
                    <Text style={styles.taskCardTitle}>{task.title}</Text>
                    <Ionicons name={task.icon} size={20} color="#fff" />
                  </View>
                  <Text style={styles.taskCardDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                  <View style={styles.taskProgressBar}>
                    <View style={[styles.taskProgressFill, { width: `${task.progress}%` }]} />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Task Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Task Groups</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{taskGroups.length}</Text>
            </View>
          </View>
          {projectsLoading || tasksLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#9C27B0" />
            </View>
          ) : taskGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No task groups yet</Text>
            </View>
          ) : (
            taskGroups.map((group) => (
              <Pressable 
                key={group.id} 
                style={styles.groupCard}
                onPress={() => {
                  if (group.title === 'Personal' || !group.projectId) {
                    // Navigate to personal tasks
                    router.push('/(tabs)/my-tasks');
                  } else {
                    // Navigate to project detail page with projectId
                    router.push(`/project-detail?id=${group.projectId}`);
                  }
                }}
              >
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
              </Pressable>
            ))
          )}
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});


