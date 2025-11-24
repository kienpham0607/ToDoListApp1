import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddTaskScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState('');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const priorities = ['Low', 'Medium', 'High'];
  const categories = ['Personal', 'Work', 'Shopping', 'Health', 'Other'];

  const handleCreateTask = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    // Handle create task logic here
    Alert.alert('Success', 'Task created successfully', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>Create a new personal task to keep track of your to-dos</Text>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add details about this task"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Priority and Category Row */}
        <View style={styles.row}>
          {/* Priority Dropdown */}
          <View style={styles.halfSection}>
            <Text style={styles.label}>Priority</Text>
            <Pressable
              style={styles.dropdown}
              onPress={() => {
                setShowPriorityDropdown(!showPriorityDropdown);
                setShowCategoryDropdown(false);
              }}
            >
              <Text style={styles.dropdownText}>{priority}</Text>
              <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </Pressable>
            {showPriorityDropdown && (
              <View style={styles.dropdownList}>
                {priorities.map((p) => (
                  <Pressable
                    key={p}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setPriority(p);
                      setShowPriorityDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Category Dropdown */}
          <View style={styles.halfSection}>
            <Text style={styles.label}>Category</Text>
            <Pressable
              style={styles.dropdown}
              onPress={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowPriorityDropdown(false);
              }}
            >
              <Text style={styles.dropdownText}>{category}</Text>
              <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </Pressable>
            {showCategoryDropdown && (
              <View style={styles.dropdownList}>
                {categories.map((c) => (
                  <Pressable
                    key={c}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategory(c);
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
        <View style={styles.section}>
          <Text style={styles.label}>Due Date (Optional)</Text>
          <Pressable
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <TextInput
              style={styles.dateInputText}
              placeholder="mm/dd/yyyy"
              placeholderTextColor="#9CA3AF"
              value={dueDate ? formatDate(dueDate) : ''}
              editable={false}
            />
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.createButton} onPress={handleCreateTask}>
          <Text style={styles.createButtonText}>Create Task</Text>
        </Pressable>
      </View>

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
            {/* Simple date input - in real app, use a proper date picker library */}
            <TextInput
              style={styles.datePickerInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={dueDate}
              onChangeText={(text) => {
                setDueDate(text);
              }}
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfSection: {
    flex: 1,
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});

