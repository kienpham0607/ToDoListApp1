import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('To do');

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekday = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return { d: i + 1, label: weekday[date.getDay()] };
    });
  }, [daysInMonth, month, year, weekday]);

  const [selectedIndex, setSelectedIndex] = useState(today.getDate() - 1);
  const dateScrollRef = useRef(null);

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

  const tasks = [
    { id: '1', title: 'Market Research', project: 'Grocery shopping app design', time: '10:00 AM', status: 'Done', color: '#90CAF9' },
    { id: '2', title: 'Competitive Analysis', project: 'Grocery shopping app design', time: '12:00 PM', status: 'In Progress', color: '#FFE082' },
    { id: '3', title: 'Create Low-fidelity Wireframe', project: 'Uber Eats redesign challenge', time: '07:00 PM', status: 'To-do', color: '#B39DDB' },
    { id: '4', title: 'How to pitch a Design Sprint', project: 'About design sprint', time: '09:00 PM', status: 'To-do', color: '#A5D6A7' },
  ];

  const filteredTasks = tasks.filter(t => selectedTab === 'All' ? true : (selectedTab === 'To do' ? t.status === 'To-do' : t.status === selectedTab));

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
          {filteredTasks.map(task => (
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
                  <View style={[styles.statusBadge, task.status === 'Done' ? styles.badgeDone : task.status === 'In Progress' ? styles.badgeInProgress : styles.badgeTodo]}>
                    <Text style={[styles.badgeText, task.status === 'In Progress' && { color: '#FB8C00' }]}>{task.status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardAction}>
                <Ionicons name="bookmark-outline" size={18} color="#BDBDBD" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating add button */}
      <Pressable style={styles.fab} onPress={() => router.push('/(tabs)/inbox')}>
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
});
