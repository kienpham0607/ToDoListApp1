import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InboxScreen() {
  // Mock tasks
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Review quarterly reports', description: 'Go through Q1 financial reports and prepare summary', priority: 'high', category: 'work', status: 'To Do', due: '2024-03-25' },
    { id: '2', title: 'Buy groceries', description: 'Milk, eggs, bread, vegetables', priority: 'medium', category: 'shopping', status: 'In Progress', due: '2024-03-22' },
    { id: '3', title: 'Plan team offsite', description: 'Venue shortlist and agenda draft', priority: 'low', category: 'work', status: 'Completed', due: '2024-04-10' },
  ]);
  const [categoryFilter] = useState('All Categories');
  const [priorityFilter] = useState('All Priorities');
  const [tab, setTab] = useState('All');

  // Add Task modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newDue, setNewDue] = useState('');

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d < today && tab !== 'Completed';
  };

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const byCat = categoryFilter === 'All Categories' || t.category.toLowerCase() === categoryFilter.toLowerCase();
      const byPr = priorityFilter === 'All Priorities' || t.priority.toLowerCase() === priorityFilter.toLowerCase();
      const byTab = tab === 'All' || t.status === tab;
      return byCat && byPr && byTab;
    });
  }, [tasks, categoryFilter, priorityFilter, tab]);

  const countBy = (s) => tasks.filter(t => t.status === s).length;
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>Manage your personal to-do list and stay organized</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filterRow}>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>{categoryFilter}</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </Pressable>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>{priorityFilter}</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </Pressable>
          <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add Task</Text>
          </Pressable>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrap}><Ionicons name="ellipse-outline" size={16} color="#9AA3AE" /></View>
            <Text style={styles.summaryLabel}>To Do</Text>
            <Text style={styles.summaryValue}>{countBy('To Do')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrap}><Ionicons name="time-outline" size={16} color="#9AA3AE" /></View>
            <Text style={styles.summaryLabel}>In Progress</Text>
            <Text style={styles.summaryValue}>{countBy('In Progress')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrap}><Ionicons name="checkmark-circle-outline" size={16} color="#9AA3AE" /></View>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>{countBy('Completed')}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {['All','To Do','In Progress','Completed'].map(name => (
            <Pressable key={name} onPress={() => setTab(name)} style={[styles.tabPill, tab===name && styles.tabPillActive]}>
              <Text style={[styles.tabText, tab===name && styles.tabTextActive]}>{name}{name==='All' ? ` (${tasks.length})` : ''}</Text>
            </Pressable>
          ))}
        </View>

        {/* Task list */}
        <View style={{ gap: 12, marginTop: 12, marginBottom: 24 }}>
          {filtered.map(t => (
            <View key={t.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleRow}>
                  <View style={styles.checkbox} />
                  <Text style={styles.taskTitle}>{t.title}</Text>
                </View>
                <Pressable>
                  <Ionicons name="trash-outline" size={18} color="#9AA3AE" />
                </Pressable>
              </View>
              <Text style={styles.taskDesc}>{t.description}</Text>
              <View style={styles.taskMetaRow}>
                <View style={[styles.badge, styles[`priority_${t.priority}`]]}><Text style={[styles.badgeText, styles[`priorityText_${t.priority}`]]}>{t.priority}</Text></View>
                <View style={[styles.badge, styles.badgeSoft]}><Ionicons name="pricetag" size={12} color="#4B5563" /><Text style={styles.badgeSoftText}>{t.category}</Text></View>
                <View style={[styles.badge, isOverdue(t.due) ? styles.badgeDanger : styles.badgeSoft]}>
                  <Ionicons name="calendar" size={12} color={isOverdue(t.due) ? '#DC2626' : '#4B5563'} />
                  <Text style={[styles.badgeSoftText, isOverdue(t.due) && { color: '#DC2626', fontWeight: '700' }]}>{new Date(t.due).toDateString().slice(4)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.addModalCard}>
            <View style={styles.addHeaderRow}>
              <View>
                <Text style={styles.addTitle}>Add New Task</Text>
                <Text style={styles.addSubtitle}>Create a new personal task to keep track of your to-dos</Text>
              </View>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>

            <View style={{ gap: 12 }}>
              <View>
                <Text style={styles.inputLabel}>Title</Text>
                <View style={styles.inputField}><Text style={styles.hiddenText}>{newTitle}</Text></View>
                <View style={styles.textInputWrap}>
                  <Text
                    style={styles.textInput}
                    onPressIn={() => {}}
                  >{newTitle || 'Enter task title'}</Text>
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>Description</Text>
                <View style={styles.textAreaWrap}>
                  <Text
                    style={styles.textArea}
                  >{newDescription || 'Add details about this task'}</Text>
                </View>
              </View>

              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Priority</Text>
                  <View style={styles.selectField}>
                    <Text style={styles.selectText}>{newPriority}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </View>
                </View>
                <View style={{ width: 14 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.selectField}>
                    <Text style={styles.selectText}>{newCategory}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </View>
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>Due Date (Optional)</Text>
                <View style={styles.dateField}>
                  <Text style={styles.datePlaceholder}>{newDue || 'mm/dd/yyyy'}</Text>
                  <Ionicons name="calendar-clear" size={16} color="#6B7280" />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.createBtn}
                onPress={() => {
                  const id = String(Date.now());
                  const mappedPriority = newPriority.toLowerCase();
                  const mappedCategory = newCategory.toLowerCase();
                  setTasks([
                    { id, title: newTitle || 'Untitled', description: newDescription, priority: mappedPriority, category: mappedCategory, status: 'To Do', due: newDue ? new Date(newDue).toISOString().slice(0,10) : '' },
                    ...tasks,
                  ]);
                  setShowAddModal(false);
                  setNewTitle('');
                  setNewDescription('');
                  setNewPriority('Medium');
                  setNewCategory('Personal');
                  setNewDue('');
                  setTab('All');
                }}
              >
                <Text style={styles.createText}>Create Task</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
    fontSize: 30,
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
  // New - filters
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterText: {
    color: '#374151',
    fontSize: 14,
  },
  addButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // Add Task modal styles
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  addModalCard: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  addHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  addSubtitle: {
    marginTop: 4,
    color: '#6B7280',
  },
  inputLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 6,
  },
  textInputWrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textInput: {
    color: '#6B7280',
  },
  textAreaWrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 84,
  },
  textArea: {
    color: '#6B7280',
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    color: '#374151',
  },
  dateField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePlaceholder: {
    color: '#6B7280',
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelText: {
    color: '#111827',
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createText: {
    color: '#fff',
    fontWeight: '800',
  },
  // Summary cards
  summaryRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  // Tabs
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tabPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabPillActive: {
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  tabText: {
    color: '#374151',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#3730A3',
  },
  // Task list
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  taskDesc: {
    color: '#6B7280',
    marginTop: 6,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeSoft: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeSoftText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priority_high: { backgroundColor: '#FDE8E8' },
  priority_medium: { backgroundColor: '#FEF3C7' },
  priority_low: { backgroundColor: '#DCFCE7' },
  priorityText_high: { color: '#DC2626', fontWeight: '700', fontSize: 12 },
  priorityText_medium: { color: '#D97706', fontWeight: '700', fontSize: 12 },
  priorityText_low: { color: '#16A34A', fontWeight: '700', fontSize: 12 },
});
