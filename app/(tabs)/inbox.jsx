import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InboxScreen() {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState('1');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [group, setGroup] = useState('');
  const [assignee, setAssignee] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState('To-do');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const activeMonth = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth() + monthOffset, 1);
  }, [monthOffset]);
  const monthLabel = useMemo(() => activeMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' }), [activeMonth]);

  const daysInActiveMonth = useMemo(() => new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0).getDate(), [activeMonth]);
  const firstWeekday = useMemo(() => new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1).getDay(), [activeMonth]);
  const weekLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const setDateFromParts = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    setDate(`${y}-${mm}-${dd}`);
    setShowDatePicker(false);
  };

  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);
  const confirmTime = () => {
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    setTime(`${hh}:${mm}`);
    setShowTimePicker(false);
  };

  const submitTask = () => {
    if (!taskTitle.trim() && !taskDescription.trim()) return;
    // In a real app, send to backend or global state. Here we just clear.
    setTaskTitle('');
    setTaskDescription('');
    setPriority('1');
    setShowPriorityMenu(false);
    setGroup('');
    setAssignee('');
    setCategory('General');
    setStatus('To-do');
    setDate('');
    setTime('');
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Task</Text>
        <Text style={styles.subtitle}>Enter details to create a new task</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyState}>
            <Ionicons name="download-outline" size={64} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>Create a task using the composer below</Text>
          </View>
        </ScrollView>

        <View style={styles.composerContainer}>
          <View style={styles.handleBar} />
          <View style={styles.composerHeader}>
            <Pressable style={styles.priorityBadge} onPress={() => setShowPriorityMenu(!showPriorityMenu)}>
              <Ionicons name="flame" size={14} color="#fff" />
              <Text style={styles.priorityBadgeText}>{`Priority task ${priority}`}</Text>
              <Ionicons name="chevron-up" size={14} color="#fff" />
            </Pressable>
            {showPriorityMenu && (
              <View style={styles.priorityMenu}>
                {(['1','2','3','4']).map(p => (
                  <Pressable key={p} style={styles.priorityMenuItem} onPress={() => { setPriority(p); setShowPriorityMenu(false); }}>
                    <Ionicons name="flame" size={12} color={p==='1' ? '#F44336' : p==='2' ? '#FFA726' : p==='3' ? '#4CAF50' : '#29B6F6'} />
                    <Text style={styles.priorityMenuText}>{`Priority task ${p}`}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <TextInput
            style={styles.composerTitle}
            placeholder="eg : Meeting with client"
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholderTextColor="#9AA0A6"
          />
          {/* Group / Project */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLeft}>
              <Ionicons name="people-outline" size={18} color="#95A1AC" />
              <Text style={styles.fieldLabel}>Group / Project</Text>
            </View>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Marketing Team"
              value={group}
              onChangeText={setGroup}
              placeholderTextColor="#9AA0A6"
            />
          </View>
          {/* Assignee */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLeft}>
              <Ionicons name="person-outline" size={18} color="#95A1AC" />
              <Text style={styles.fieldLabel}>Assignee</Text>
            </View>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Alex Nguyen"
              value={assignee}
              onChangeText={setAssignee}
              placeholderTextColor="#9AA0A6"
            />
          </View>
          <TextInput
            style={styles.composerDescription}
            placeholder="Description"
            value={taskDescription}
            onChangeText={setTaskDescription}
            placeholderTextColor="#9AA0A6"
            multiline
          />
          {/* Category / Status */}
          <View style={styles.tagRow}>
            {['General','Design','Development','Research'].map(tag => (
              <Pressable key={tag} style={[styles.tagChip, category===tag && styles.tagChipActive]} onPress={() => setCategory(tag)}>
                <Text style={[styles.tagText, category===tag && styles.tagTextActive]}>{tag}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.statusRow}>
            {['To-do','In Progress','Done'].map(s => (
              <Pressable key={s} style={[styles.statusChip, status===s && styles.statusChipActive]} onPress={() => setStatus(s)}>
                <Text style={[styles.statusText, status===s && styles.statusTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          {/* Date & Time */}
          <View style={styles.datetimeRow}>
            <Pressable style={styles.datetimeItem} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={18} color="#95A1AC" />
              <TextInput
                style={styles.datetimeInput}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                placeholderTextColor="#9AA0A6"
              />
            </Pressable>
            <Pressable style={styles.datetimeItem} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={18} color="#95A1AC" />
              <TextInput
                style={styles.datetimeInput}
                placeholder="HH:MM"
                value={time}
                onChangeText={setTime}
                placeholderTextColor="#9AA0A6"
              />
            </Pressable>
          </View>

          <View style={styles.composerToolbar}>
            <View style={styles.toolbarLeft}>
              <Ionicons name="calendar-outline" size={18} color="#95A1AC" />
              <Ionicons name="time-outline" size={18} color="#95A1AC" />
              <Ionicons name="notifications-outline" size={18} color="#95A1AC" />
              <Ionicons name="flag-outline" size={18} color="#95A1AC" />
            </View>
            <Pressable style={styles.sendButton} onPress={submitTask}>
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.emojiRow}>
            {['😀','😁','😅','🤔','👏','😴','🤞'].map(e => (
              <Text key={e} style={styles.emoji}>{e}</Text>
            ))}
          </View>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setMonthOffset(monthOffset - 1)}>
                  <Ionicons name="chevron-back" size={20} color="#333" />
                </Pressable>
                <Text style={styles.modalTitle}>{monthLabel}</Text>
                <Pressable onPress={() => setMonthOffset(monthOffset + 1)}>
                  <Ionicons name="chevron-forward" size={20} color="#333" />
                </Pressable>
              </View>
              <View style={styles.weekRow}>
                {weekLabels.map(w => (
                  <Text key={w} style={styles.weekLabel}>{w}</Text>
                ))}
              </View>
              <View style={styles.calendarGrid}>
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.calendarCell} />
                ))}
                {Array.from({ length: daysInActiveMonth }, (_, i) => i + 1).map(d => (
                  <Pressable key={d} style={styles.calendarCell} onPress={() => setDateFromParts(activeMonth.getFullYear(), activeMonth.getMonth(), d)}>
                    <Text style={styles.calendarDay}>{d}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={styles.modalClose} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select time</Text>
              <View style={styles.timePickRow}>
                <View style={styles.timePickCol}>
                  {hourOptions.map(h => (
                    <Pressable key={h} style={[styles.timePickItem, hour===h && styles.timePickItemActive]} onPress={() => setHour(h)}>
                      <Text style={[styles.timePickText, hour===h && styles.timePickTextActive]}>{String(h).padStart(2,'0')}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.timePickCol}>
                  {minuteOptions.map(m => (
                    <Pressable key={m} style={[styles.timePickItem, minute===m && styles.timePickItemActive]} onPress={() => setMinute(m)}>
                      <Text style={[styles.timePickText, minute===m && styles.timePickTextActive]}>{String(m).padStart(2,'0')}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.timeActions}>
                <Pressable style={styles.modalClose} onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalClose,{ backgroundColor: '#029688' }]} onPress={confirmTime}>
                  <Text style={[styles.modalCloseText,{ color: '#fff' }]}>Set</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Composer
  composerContainer: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
      android: { elevation: 12 },
    }),
  },
  handleBar: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  composerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#029688',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityMenu: {
    position: 'absolute',
    top: 32,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    width: 180,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 8 },
    }),
  },
  priorityMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priorityMenuText: {
    color: '#333',
    fontSize: 12,
  },
  composerTitle: {
    fontSize: 16,
    color: '#2E2E2E',
    paddingVertical: 10,
  },
  composerDescription: {
    fontSize: 14,
    color: '#5F6368',
    paddingVertical: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F4',
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    color: '#5F6368',
    fontSize: 13,
  },
  fieldInput: {
    flex: 1,
    marginLeft: 12,
    textAlign: 'right',
    color: '#2E2E2E',
    fontSize: 14,
    paddingVertical: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EDE7F6',
  },
  tagChipActive: {
    backgroundColor: '#9C27B0',
  },
  tagText: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  statusChipActive: {
    backgroundColor: '#9C27B0',
  },
  statusText: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#fff',
  },
  datetimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  datetimeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datetimeInput: {
    flex: 1,
    fontSize: 14,
    color: '#2E2E2E',
  },
  composerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#029688',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
  },
  emoji: {
    fontSize: 18,
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekLabel: {
    width: `${100/7}%`,
    textAlign: 'center',
    color: '#9AA3AE',
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: `${100/7}%`,
    paddingVertical: 10,
    alignItems: 'center',
  },
  calendarDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 36,
    color: '#333',
  },
  modalClose: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
  },
  modalCloseText: {
    color: '#333',
    fontWeight: '600',
  },
  timePickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timePickCol: {
    flex: 1,
    maxHeight: 220,
  },
  timePickItem: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  timePickItemActive: {
    backgroundColor: '#EDE7F6',
  },
  timePickText: {
    fontSize: 16,
    color: '#333',
  },
  timePickTextActive: {
    color: '#9C27B0',
    fontWeight: '700',
  },
  timeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
