import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const priorities = ['Low', 'Medium', 'High'];
  const categories = ['Personal', 'Work', 'Shopping', 'Health', 'Other'];

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
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowAddModal(false)}
        >
          <Pressable style={styles.addModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.addHeaderRow}>
              <View>
                <Text style={styles.addTitle}>Add New Task</Text>
                <Text style={styles.addSubtitle}>Create a new personal task to keep track of your to-dos</Text>
              </View>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                {/* Title Input */}
                <View>
                  <Text style={styles.inputLabel}>Title</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter task title"
                    placeholderTextColor="#9CA3AF"
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />
                </View>

                {/* Description Input */}
                <View>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={styles.textAreaField}
                    placeholder="Add details about this task"
                    placeholderTextColor="#9CA3AF"
                    value={newDescription}
                    onChangeText={setNewDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Priority and Category Row */}
                <View style={styles.row2}>
                  <View style={styles.dropdownWrapper}>
                    <Text style={styles.inputLabel}>Priority</Text>
                    <Pressable
                      style={styles.selectField}
                      onPress={() => {
                        setShowPriorityDropdown(!showPriorityDropdown);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.selectText}>{newPriority}</Text>
                      <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </Pressable>
                    {showPriorityDropdown && (
                      <View style={styles.dropdownList}>
                        {priorities.map((p) => (
                          <Pressable
                            key={p}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setNewPriority(p);
                              setShowPriorityDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{p}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={{ width: 14 }} />
                  <View style={styles.dropdownWrapper}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <Pressable
                      style={styles.selectField}
                      onPress={() => {
                        setShowCategoryDropdown(!showCategoryDropdown);
                        setShowPriorityDropdown(false);
                      }}
                    >
                      <Text style={styles.selectText}>{newCategory}</Text>
                      <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </Pressable>
                    {showCategoryDropdown && (
                      <View style={styles.dropdownList}>
                        {categories.map((c) => (
                          <Pressable
                            key={c}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setNewCategory(c);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{c}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Due Date */}
                <View>
                  <Text style={styles.inputLabel}>Due Date (Optional)</Text>
                  <Pressable
                    style={styles.dateField}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={[styles.datePlaceholder, newDue && { color: '#111827' }]}>
                      {newDue ? new Date(newDue).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'mm/dd/yyyy'}
                    </Text>
                    <Ionicons name="calendar-clear" size={16} color="#6B7280" />
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => {
                setShowAddModal(false);
                setNewTitle('');
                setNewDescription('');
                setNewPriority('Medium');
                setNewCategory('Personal');
                setNewDue('');
              }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.createBtn}
                onPress={() => {
                  if (!newTitle.trim()) {
                    return;
                  }
                  const id = String(Date.now());
                  const mappedPriority = newPriority.toLowerCase();
                  const mappedCategory = newCategory.toLowerCase();
                  setTasks([
                    { id, title: newTitle, description: newDescription, priority: mappedPriority, category: mappedCategory, status: 'To Do', due: newDue ? new Date(newDue).toISOString().slice(0,10) : '' },
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
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <Pressable style={styles.datePickerContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.datePickerTitle}>Select Due Date</Text>
            <TextInput
              style={styles.datePickerInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={newDue}
              onChangeText={setNewDue}
            />
            <View style={styles.datePickerButtons}>
              <Pressable 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerButtonTextPrimary}>Confirm</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    zIndex: 9999,
  },
  addModalCard: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    zIndex: 10000,
    elevation: 10000,
    overflow: 'visible',
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
  modalScroll: {
    maxHeight: 400,
    zIndex: 1,
    overflow: 'visible',
  },
  inputLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 6,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  textAreaField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 84,
    fontSize: 14,
    color: '#111827',
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 10001,
    overflow: 'visible',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    zIndex: 10002,
    elevation: 10002,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 10002,
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'visible',
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
  datePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  datePickerInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
    marginBottom: 20,
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerButtonPrimary: {
    backgroundColor: '#2563EB',
  },
  datePickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  datePickerButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
