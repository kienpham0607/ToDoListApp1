import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTasks, 
  setSelectedDate,
  selectCalendarTasks,
  selectSelectedDate,
  selectTasksLoading,
  selectTasksError,
  selectTasks,
} from '@/store/taskSlice';
import { selectToken, selectIsAuthenticated } from '@/store/authSlice';

export default function CalendarScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('To do');

  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const calendarTasks = useSelector(selectCalendarTasks);
  const selectedDate = useSelector(selectSelectedDate);
  const allTasks = useSelector(selectTasks);
  const loading = useSelector(selectTasksLoading);
  const error = useSelector(selectTasksError);

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekday = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return { d: i + 1, label: weekday[date.getDay()], date };
    });
  }, [daysInMonth, month, year, weekday]);

  const [selectedIndex, setSelectedIndex] = useState(today.getDate() - 1);
  const dateScrollRef = useRef(null);

  // Format date to YYYY-MM-DD
  const formatDate = useMemo(() => {
    return (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
  }, []);

  // Get selected date as Date object
  const selectedDateObj = useMemo(() => {
    return days[selectedIndex]?.date || today;
  }, [selectedIndex, days, today]);

  // Set initial selected date when component mounts (must run before fetchTasks)
  useEffect(() => {
    if (isAuthenticated && token && selectedDateObj) {
      const dateStr = formatDate(selectedDateObj);
      console.log('Calendar: Setting initial selected date:', dateStr, 'from selectedDateObj:', selectedDateObj);
      dispatch(setSelectedDate(dateStr));
    }
  }, [isAuthenticated, token, selectedDateObj, dispatch, formatDate]);

  // Fetch tasks when component mounts or when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('Calendar: Fetching tasks...');
      dispatch(fetchTasks({ token, offset: 0, limit: 1000 }));
    }
  }, [isAuthenticated, token, dispatch]);

  // Refresh tasks when screen comes into focus (e.g., after creating a task)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && token) {
        console.log('Calendar: Screen focused, refreshing tasks...');
        dispatch(fetchTasks({ token, offset: 0, limit: 1000 }));
      }
    }, [isAuthenticated, token, dispatch])
  );

  // Update calendar tasks when date changes
  useEffect(() => {
    if (isAuthenticated && token && selectedDateObj) {
      const dateStr = formatDate(selectedDateObj);
      console.log('Calendar: Date changed, setting selected date:', dateStr);
      console.log('Calendar: Total tasks available:', allTasks.length);
      dispatch(setSelectedDate(dateStr));
    }
  }, [selectedIndex, selectedDateObj, isAuthenticated, token, dispatch, formatDate, allTasks.length]);

  useEffect(() => {
    // Auto-scroll to bring today's pill into view
    const pillWidth = 64; // must match styles.datePill width
    const gap = 10;       // must match styles.datePill marginRight
    const horizontalPadding = 16; // headerCard inner padding
    const x = Math.max(selectedIndex * (pillWidth + gap) - horizontalPadding, 0);
    if (dateScrollRef.current && typeof dateScrollRef.current.scrollTo === 'function') {
      dateScrollRef.current.scrollTo({ x, animated: true });
    }
  }, [selectedIndex]);

  // Map task status from backend to UI
  const mapStatus = (status) => {
    if (!status) return 'To-do';
    const statusLower = status.toLowerCase();
    if (statusLower === 'done' || statusLower === 'completed') return 'Completed';
    if (statusLower === 'in_progress' || statusLower === 'inprogress') return 'In Progress';
    return 'To-do';
  };

  // Map priority to color
  const getPriorityColor = (priority) => {
    if (!priority) return '#B39DDB'; // Default purple
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') return '#EF5350'; // Red
    if (priorityLower === 'medium') return '#FFA726'; // Orange
    if (priorityLower === 'low') return '#66BB6A'; // Green
    return '#B39DDB'; // Default purple
  };

  // Format time from dueDate (if it includes time) or use default
  const formatTaskTime = (dueDate) => {
    if (!dueDate) return 'No time';
    try {
      // If dueDate includes time (ISO format with time)
      if (dueDate.includes('T')) {
        const date = new Date(dueDate);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
      }
      return 'All day';
    } catch {
      return 'All day';
    }
  };

  // Transform API tasks to UI format
  const transformedTasks = useMemo(() => {
    console.log('Calendar: Transforming tasks, calendarTasks count:', calendarTasks.length);
    console.log('Calendar: Selected date:', selectedDate);
    const transformed = calendarTasks.map(task => {
      console.log('Calendar: Task:', task.name, 'dueDate:', task.dueDate);
      return {
        id: String(task.id),
        title: task.name || 'Untitled Task',
        project: task.project?.name || task.projectName || 'Personal Task',
        time: formatTaskTime(task.dueDate),
        status: mapStatus(task.status),
        color: getPriorityColor(task.priority),
        progress: task.progress || 0,
      };
    });
    console.log('Calendar: Transformed tasks count:', transformed.length);
    return transformed;
  }, [calendarTasks, selectedDate]);

  // Filter tasks by selected tab
  const filteredTasks = useMemo(() => {
    if (selectedTab === 'All') return transformedTasks;
    if (selectedTab === 'To do') return transformedTasks.filter(t => t.status === 'To-do');
    if (selectedTab === 'In Progress') return transformedTasks.filter(t => t.status === 'In Progress');
    if (selectedTab === 'Completed') return transformedTasks.filter(t => t.status === 'Completed');
    return transformedTasks;
  }, [transformedTasks, selectedTab]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Ionicons name="chevron-back" size={18} color="#333" />
            <Text style={styles.headerTitle}>Today’s Tasks</Text>
            <Ionicons name="notifications" size={18} color="#333" />
          </View>

          {/* Date strip */}
          <ScrollView ref={dateScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
            {days.map((day, idx) => {
              const active = idx === selectedIndex;
              return (
                <Pressable key={day.d} onPress={() => setSelectedIndex(idx)} style={[styles.datePill, active && styles.datePillActive]}>
                  <Text style={[styles.dateNum, active && styles.dateNumActive]}>{day.d}</Text>
                  <Text style={[styles.dateLabel, active && styles.dateLabelActive]}>{day.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Segmented tabs */}
          <View style={styles.tabsRow}>
            {['All','To do','In Progress','Completed'].map(tab => {
              const active = tab === selectedTab;
              return (
                <Pressable key={tab} onPress={() => setSelectedTab(tab)} style={[styles.tabChip, active && styles.tabChipActive]}>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Tasks list */}
        <View style={styles.listSection}>
          {loading && calendarTasks.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9C27B0" />
              <Text style={styles.loadingText}>Đang tải tasks...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {typeof error === 'object' ? error.message : error}
              </Text>
            </View>
          ) : filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>Không có tasks nào cho ngày này</Text>
            </View>
          ) : (
            filteredTasks.map(task => (
              <View key={task.id} style={styles.taskCard}>
                <View style={[styles.taskAccent, { backgroundColor: task.color }]} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskProject}>{task.project}</Text>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.timeRow}>
                      <Ionicons name="time" size={14} color="#64B5F6" />
                      <Text style={styles.timeText}>{task.time}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge, 
                      task.status === 'Completed' ? styles.badgeDone : 
                      task.status === 'In Progress' ? styles.badgeInProgress : 
                      styles.badgeTodo
                    ]}>
                      <Text style={[
                        styles.badgeText, 
                        task.status === 'In Progress' && { color: '#FB8C00' },
                        task.status === 'Completed' && { color: '#4CAF50' }
                      ]}>
                        {task.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardAction}>
                  <Ionicons name="bookmark-outline" size={18} color="#BDBDBD" />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating add button */}
      <Pressable style={styles.fab} onPress={() => router.push('/(tabs)/my-tasks')}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  dateStrip: {
    paddingRight: 8,
  },
  datePill: {
    width: 64,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#f2f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  datePillActive: {
    backgroundColor: '#9C27B0',
  },
  dateNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  dateNumActive: {
    color: '#fff',
  },
  dateLabel: {
    marginTop: 2,
    fontSize: 12,
    color: '#8C8C8C',
  },
  dateLabelActive: {
    color: '#E3F2FD',
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#EDE7F6',
    marginRight: 10,
  },
  tabChipActive: {
    backgroundColor: '#9C27B0',
  },
  tabText: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  listSection: {
    gap: 12,
    marginTop: 6,
    marginBottom: 24,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  taskAccent: {
    width: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskProject: {
    fontSize: 11,
    color: '#9AA3AE',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    color: '#64B5F6',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#EDE7F6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9C27B0',
  },
  badgeDone: {
    backgroundColor: '#E8F5E9',
  },
  badgeInProgress: {
    backgroundColor: '#FFF3E0',
  },
  badgeTodo: {
    backgroundColor: '#EDE7F6',
  },
  cardAction: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#9C27B0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#9C27B0',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    marginVertical: 12,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#9AA3AE',
    textAlign: 'center',
  },
});
