import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import {
  fetchProjects,
  selectProjects,
  selectProjectLoading
} from '@/store/projectSlice';
import {
  fetchProjectMembersByProjectId,
  selectProjectMembers,
  selectTeamLoading
} from '@/store/teamSlice';
import {
  createNewTask,
  selectTasksLoading
} from '@/store/taskSlice';
import { selectToken, selectIsAuthenticated } from '@/store/authSlice';

export default function AddTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const projects = useSelector(selectProjects);
  const projectMembers = useSelector(selectProjectMembers);
  const projectsLoading = useSelector(selectProjectLoading);
  const tasksLoading = useSelector(selectTasksLoading);
  const teamLoading = useSelector(selectTeamLoading);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const priorities = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ];

  // Fetch projects when component mounts
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));
    }
  }, [isAuthenticated, token, dispatch]);

  // Handle pre-selected project from params
  useEffect(() => {
    if (params.projectId && projects.length > 0 && !selectedProject) {
      const preselected = projects.find(p => String(p.id) === String(params.projectId));
      if (preselected) {
        console.log('AddTask: Pre-selecting project:', preselected.name);
        setSelectedProject(preselected);
      }
    }
  }, [params.projectId, projects]);

  // Fetch project members when project is selected
  useEffect(() => {
    if (selectedProject && isAuthenticated && token) {
      console.log('AddTask: Fetching members for project:', selectedProject.id, selectedProject.name);
      dispatch(fetchProjectMembersByProjectId({ token, projectId: selectedProject.id }))
        .then((result) => {
          if (fetchProjectMembersByProjectId.fulfilled.match(result)) {
            console.log('AddTask: Members fetched successfully:', result.payload.members?.length || 0);
          } else {
            console.error('AddTask: Failed to fetch members:', result.payload);
          }
        });
    } else {
      setSelectedMember(null);
    }
  }, [selectedProject, isAuthenticated, token, dispatch]);

  // Available members for selected project
  const availableMembers = useMemo(() => {
    if (!selectedProject) {
      console.log('AddTask: No selected project');
      return [];
    }
    if (!projectMembers || projectMembers.length === 0) {
      console.log('AddTask: No project members available');
      return [];
    }

    // Since fetchProjectMembersByProjectId replaces projectMembers with only members for that project,
    // we don't need to filter by project.id - all members are already for the selected project
    console.log('AddTask: Available members count:', projectMembers.length);
    console.log('AddTask: Sample member:', projectMembers[0] ? JSON.stringify(projectMembers[0], null, 2) : 'No members');

    return projectMembers;
  }, [selectedProject, projectMembers]);

  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch {
      return dateString;
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(formatDateForInput(selectedDate));
    }
  };

  const handleCreateTask = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Vui lòng nhập tên công việc',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    if (!selectedProject) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Vui lòng chọn dự án',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    if (!selectedMember) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Vui lòng chọn thành viên',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Bạn phải đăng nhập để tạo công việc',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    try {
      const taskData = {
        projectName: selectedProject.name,
        projectId: selectedProject.id,
        name: name.trim(),
        description: description.trim() || null,
        assignedTo: selectedMember.user?.username || selectedMember.username || selectedMember,
        assigneeId: selectedMember.user?.id || selectedMember.userId,
        dueDate: dueDate || null,
        priority: priority,
      };

      await dispatch(createNewTask({
        token,
        taskData,
      })).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã giao việc cho thành viên',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });

      // Reset form
      setName('');
      setDescription('');
      setPriority('low');
      setDueDate('');
      setSelectedProject(null);
      setSelectedMember(null);

      // Navigate back
      router.back();
    } catch (error) {
      console.error('Failed to create task:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể tạo công việc. Vui lòng thử lại.',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Giao việc cho thành viên</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>Giao việc cho thành viên trong nhóm dự án</Text>

        {/* Project Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Dự án *</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => {
              setShowProjectDropdown(!showProjectDropdown);
              setShowPriorityDropdown(false);
              setShowMemberDropdown(false);
            }}
          >
            <Text style={[styles.dropdownText, !selectedProject && styles.dropdownPlaceholder]}>
              {selectedProject ? selectedProject.name : 'Chọn dự án'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          </Pressable>
          {showProjectDropdown && (
            <ScrollView
              style={styles.dropdownList}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {projectsLoading ? (
                <View style={styles.dropdownLoading}>
                  <ActivityIndicator size="small" color="#2563EB" />
                </View>
              ) : projects && projects.length > 0 ? (
                projects.map((project) => (
                  <Pressable
                    key={project.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedProject(project);
                      setShowProjectDropdown(false);
                      setSelectedMember(null);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{project.name}</Text>
                  </Pressable>
                ))
              ) : (
                <View style={styles.dropdownEmpty}>
                  <Text style={styles.dropdownEmptyText}>Không có dự án nào</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Member Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Thành viên (Tùy chọn)</Text>
          <Pressable
            style={[styles.dropdown, !selectedProject && styles.dropdownDisabled]}
            onPress={() => {
              if (selectedProject) {
                console.log('AddTask: Opening member dropdown');
                console.log('AddTask: Selected project:', selectedProject.name, selectedProject.id);
                console.log('AddTask: Available members count:', availableMembers.length);
                console.log('AddTask: Project members from Redux:', projectMembers?.length || 0);
                if (availableMembers.length > 0) {
                  console.log('AddTask: First member sample:', JSON.stringify(availableMembers[0], null, 2));
                }
                setShowMemberDropdown(!showMemberDropdown);
                setShowPriorityDropdown(false);
                setShowProjectDropdown(false);
              } else {
                Toast.show({
                  type: 'info',
                  text1: 'Thông báo',
                  text2: 'Vui lòng chọn dự án trước',
                  position: 'top',
                  visibilityTime: 2000,
                  topOffset: 60,
                });
              }
            }}
            disabled={!selectedProject}
          >
            <Text style={[styles.dropdownText, !selectedMember && styles.dropdownPlaceholder]}>
              {selectedMember
                ? (selectedMember.user?.fullName || selectedMember.user?.username || selectedMember.username || 'Đã chọn')
                : 'Chọn thành viên'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          </Pressable>
          {showMemberDropdown && selectedProject && (
            <ScrollView
              style={styles.dropdownList}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {teamLoading ? (
                <View style={styles.dropdownLoading}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={styles.dropdownLoadingText}>Đang tải thành viên...</Text>
                </View>
              ) : availableMembers.length > 0 ? (
                availableMembers.map((member, index) => {
                  const user = member.user || {};
                  const memberName = user.fullName || user.username || member.username || `Thành viên ${index + 1}`;
                  const memberId = member.id || member.userId || user.id || index;

                  console.log('AddTask: Rendering member:', { memberId, memberName, hasUser: !!member.user });

                  return (
                    <Pressable
                      key={memberId}
                      style={styles.dropdownItem}
                      onPress={() => {
                        console.log('AddTask: Member selected:', member);
                        setSelectedMember(member);
                        setShowMemberDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{memberName}</Text>
                    </Pressable>
                  );
                })
              ) : (
                <View style={styles.dropdownEmpty}>
                  <Text style={styles.dropdownEmptyText}>
                    {selectedProject ? 'Dự án này chưa có thành viên nào' : 'Vui lòng chọn dự án trước'}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Tên công việc *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên công việc"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Thêm chi tiết về công việc này"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Priority Dropdown */}
        <View style={styles.section}>
          <Text style={styles.label}>Độ ưu tiên</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => {
              setShowPriorityDropdown(!showPriorityDropdown);
              setShowProjectDropdown(false);
              setShowMemberDropdown(false);
            }}
          >
            <Text style={styles.dropdownText}>
              {priorities.find(p => p.value === priority)?.label || 'Medium'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          </Pressable>
          {showPriorityDropdown && (
            <ScrollView
              style={styles.dropdownList}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {priorities.map((p) => (
                <Pressable
                  key={p.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setPriority(p.value);
                    setShowPriorityDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{p.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Hạn hoàn thành (Tùy chọn)</Text>
          <Pressable
            style={styles.dateInput}
            onPress={() => {
              if (dueDate) {
                setTempDate(new Date(dueDate));
              } else {
                setTempDate(new Date());
              }
              setShowDatePicker(!showDatePicker);
            }}
          >
            <Text style={[styles.dateInputText, !dueDate && styles.dateInputPlaceholder]}>
              {dueDate ? formatDateForDisplay(dueDate) : 'Chọn ngày'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          </Pressable>
          {Platform.OS === 'ios' && showDatePicker && (
            <DateTimePicker
              value={dueDate ? new Date(dueDate) : new Date()}
              mode="date"
              display="spinner"
              onChange={onDateChange}
              style={styles.datePickerIOSInline}
              textColor="#000000"
              minimumDate={new Date()}
            />
          )}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={dueDate ? new Date(dueDate) : new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </Pressable>
        <Pressable
          style={[styles.createButton, (!name.trim() || !selectedProject || !selectedMember || tasksLoading) && styles.createButtonDisabled]}
          onPress={handleCreateTask}
          disabled={!name.trim() || !selectedProject || !selectedMember || tasksLoading}
        >
          {tasksLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Giao việc</Text>
          )}
        </Pressable>
      </View>


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
    position: 'relative',
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
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
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
    maxHeight: 280,
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
  dropdownLoading: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    fontSize: 14,
    color: '#9CA3AF',
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
  dateInputPlaceholder: {
    color: '#9CA3AF',
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
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
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
    textAlign: 'center',
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  calendarDayNames: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  calendarDayToday: {
    backgroundColor: '#E0ECFF',
  },
  calendarDaySelected: {
    backgroundColor: '#2563EB',
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  calendarDayTextToday: {
    color: '#2563EB',
    fontWeight: '700',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  calendarDayTextPast: {
    color: '#9CA3AF',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  datePickerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerButtonPrimary: {
    backgroundColor: '#2563EB',
  },
  datePickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  datePickerButtonTextPrimary: {
    color: '#fff',
  },
  datePickerIOSInline: {
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: 8,
  },
});
