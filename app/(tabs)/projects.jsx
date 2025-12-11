import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { 
  fetchProjects, 
  createNewProject,
  selectProjects,
  selectProjectLoading,
  selectProjectError,
  clearError
} from '@/store/projectSlice';
import {
  fetchAllUsers,
  addMemberToProject,
  selectUsers
} from '@/store/teamSlice';
import { selectToken, selectIsAuthenticated } from '@/store/authSlice';

export default function ProjectsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const projects = useSelector(selectProjects);
  const loading = useSelector(selectProjectLoading);
  const error = useSelector(selectProjectError);
  const allUsers = useSelector(selectUsers);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); // Array of usernames
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  
  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempEndDate, setTempEndDate] = useState(new Date());

  // Fetch data when component mounts or when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('Projects: Fetching initial data...');
      dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));
    }
  }, [isAuthenticated, token, dispatch]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && token) {
        console.log('Projects: Screen focused, refreshing data...');
        dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));
      }
    }, [isAuthenticated, token, dispatch])
  );

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: error.message || 'Error',
        text2: 'Vui lòng thử lại sau',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const resetForm = () => {
    setProjectName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setSelectedMembers([]);
    setMemberSearchQuery('');
  };

  // Fetch users when modal opens
  useEffect(() => {
    if (showCreateModal && isAuthenticated && token) {
      dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));
    }
  }, [showCreateModal, isAuthenticated, token, dispatch]);

  // Filter available users for member selection
  const availableUsersForSelection = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];
    
    return allUsers.filter(user => {
      // Filter by search query
      if (memberSearchQuery.trim()) {
        const query = memberSearchQuery.toLowerCase();
        const matchesName = (user.fullName || '').toLowerCase().includes(query);
        const matchesUsername = (user.username || '').toLowerCase().includes(query);
        const matchesEmail = (user.email || '').toLowerCase().includes(query);
        return matchesName || matchesUsername || matchesEmail;
      }
      return true;
    });
  }, [allUsers, memberSearchQuery]);

  const toggleMemberSelection = (username) => {
    setSelectedMembers(prev => {
      if (prev.includes(username)) {
        return prev.filter(u => u !== username);
      } else {
        return [...prev, username];
      }
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openStartDatePicker = () => {
    if (startDate) {
      setTempStartDate(new Date(startDate));
    } else {
      setTempStartDate(new Date());
    }
    setShowStartDatePicker(true);
  };

  const openEndDatePicker = () => {
    if (endDate) {
      setTempEndDate(new Date(endDate));
    } else {
      setTempEndDate(startDate ? new Date(startDate) : new Date());
    }
    setShowEndDatePicker(true);
  };

  const closeStartDatePicker = () => {
    setShowStartDatePicker(false);
  };

  const closeEndDatePicker = () => {
    setShowEndDatePicker(false);
  };

  // Render calendar days for start date
  const renderStartCalendarDays = () => {
    const currentDate = new Date(tempStartDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = startDate ? new Date(startDate) : null;
    if (selectedDate) selectedDate.setHours(0, 0, 0, 0);
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-start-${i}`} style={styles.calendarDay} />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const isPast = date < today;
      
      days.push(
        <Pressable
          key={`start-${day}`}
          style={[
            styles.calendarDay,
            isToday && styles.calendarDayToday,
            isSelected && styles.calendarDaySelected,
            isPast && styles.calendarDayPast,
          ]}
          onPress={() => {
            if (!isPast) {
              setStartDate(formatDateForInput(date));
              setTempStartDate(date);
            }
          }}
          disabled={isPast}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.calendarDayTextToday,
            isSelected && styles.calendarDayTextSelected,
            isPast && styles.calendarDayTextPast,
          ]}>
            {day}
          </Text>
        </Pressable>
      );
    }
    
    return days;
  };

  // Render calendar days for end date
  const renderEndCalendarDays = () => {
    const currentDate = new Date(tempEndDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = startDate ? new Date(startDate) : today;
    minDate.setHours(0, 0, 0, 0);
    
    const selectedDate = endDate ? new Date(endDate) : null;
    if (selectedDate) selectedDate.setHours(0, 0, 0, 0);
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-end-${i}`} style={styles.calendarDay} />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const isBeforeMin = date < minDate;
      
      days.push(
        <Pressable
          key={`end-${day}`}
          style={[
            styles.calendarDay,
            isToday && styles.calendarDayToday,
            isSelected && styles.calendarDaySelected,
            isBeforeMin && styles.calendarDayPast,
          ]}
          onPress={() => {
            if (!isBeforeMin) {
              setEndDate(formatDateForInput(date));
              setTempEndDate(date);
            }
          }}
          disabled={isBeforeMin}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.calendarDayTextToday,
            isSelected && styles.calendarDayTextSelected,
            isBeforeMin && styles.calendarDayTextPast,
          ]}>
            {day}
          </Text>
        </Pressable>
      );
    }
    
    return days;
  };

  const handleCloseModal = () => {
    resetForm();
    setShowCreateModal(false);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    // If already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Try to parse and convert to YYYY-MM-DD
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return null;
    }
  };

  const handleCreateProject = async () => {
    // Validation
    if (!projectName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a project name',
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
        text2: 'You must be logged in to create a project',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    // Validate dates if both are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'End date must be after start date',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 60,
        });
        return;
      }
    }

    try {
      const projectData = {
        name: projectName.trim(),
        description: description.trim() || null,
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
      };

      await dispatch(createNewProject({
        token,
        projectData,
      })).unwrap();

      // Add selected members to the project
      if (selectedMembers.length > 0) {
        const memberPromises = selectedMembers.map(username =>
          dispatch(addMemberToProject({
            token,
            memberData: {
              projectName: projectName.trim(),
              memberName: username,
            },
          })).unwrap()
        );

        try {
          await Promise.all(memberPromises);
          console.log('All members added successfully');
        } catch (memberError) {
          console.error('Some members failed to add:', memberError);
          // Continue even if some members fail to add
        }
      }

      resetForm();
      setShowCreateModal(false);

      // Refresh projects list
      await dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));

      Toast.show({
        type: 'success',
        text1: 'Project Created',
        text2: `"${projectName.trim()}" has been created successfully${selectedMembers.length > 0 ? ` with ${selectedMembers.length} member(s)` : ''}`,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      // Error will be handled by useEffect watching error
    }
  };

  // Filter and map projects for display
  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    
    return projects.map(project => {
      // Compute status based on dates
      let computedStatus = 'Active';
      const now = new Date();
      if (project.endDate) {
        const endDate = new Date(project.endDate);
        if (endDate < now) {
          computedStatus = 'Completed';
        } else if (project.startDate) {
          const startDate = new Date(project.startDate);
          if (startDate > now) {
            computedStatus = 'Planning';
          }
        }
      } else if (project.startDate) {
        const startDate = new Date(project.startDate);
        if (startDate > now) {
          computedStatus = 'Planning';
        }
      }
      
      return {
        ...project,
        title: project.name,
        date: formatDateForDisplay(project.endDate) || formatDateForDisplay(project.startDate) || '',
        status: computedStatus,
      };
    }).filter((project) => {
      const matchesSearch = !searchQuery || 
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All Status' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Projects</Text>
          <Text style={styles.pageSubtitle}>Manage and track all your projects</Text>
        </View>

        {/* Search and Filter Section */}
        <View style={styles.sectionCard}>
          <View style={styles.filterRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search projects..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable 
              style={styles.statusFilter}
              onPress={() => {
                const statuses = ['All Status', 'Active', 'Planning'];
                const currentIndex = statuses.indexOf(statusFilter);
                const nextIndex = (currentIndex + 1) % statuses.length;
                setStatusFilter(statuses[nextIndex]);
              }}
            >
              <Text style={styles.statusFilterText}>{statusFilter}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" style={{ marginLeft: 8 }} />
            </Pressable>
          </View>
        </View>

        {/* Projects List */}
        <View style={styles.projectsSection}>
          <View style={styles.projectsHeader}>
            <Text style={styles.sectionTitle}>All Projects</Text>
            <Pressable 
              style={styles.newProjectButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.newProjectText}>New Project</Text>
            </Pressable>
          </View>

          <View style={styles.projectsList}>
            {loading && projects.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading projects...</Text>
              </View>
            ) : filteredProjects.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No projects found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try adjusting your search' : 'Create your first project to get started'}
                </Text>
              </View>
            ) : (
              filteredProjects.map((project) => (
              <Pressable
                key={project.id}
                style={styles.projectCard}
                onPress={() => router.push(`/project-detail?id=${project.id}`)}
              >
                <View style={styles.projectHeader}>
                  <View style={styles.projectTitleRow}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <View style={[
                      styles.statusBadge,
                      project.status === 'Active' ? styles.statusActive : styles.statusPlanning
                    ]}>
                      <Text style={[
                        styles.statusText,
                        project.status === 'Active' ? styles.statusTextActive : styles.statusTextPlanning
                      ]}>
                        {project.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.projectDescription}>{project.description}</Text>
                </View>
                <View style={styles.projectMeta}>
                  {project.startDate && (
                    <View style={styles.metaItem}>
                      <View style={[styles.metaIconWrapper, { backgroundColor: '#F3F4F6' }]}>
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      </View>
                      <Text style={styles.metaText}>
                        {formatDateForDisplay(project.startDate)}
                        {project.endDate ? ` - ${formatDateForDisplay(project.endDate)}` : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Create New Project Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Project</Text>
              <Pressable onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Project Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter project name"
                  placeholderTextColor="#9CA3AF"
                  value={projectName}
                  onChangeText={setProjectName}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter project description (optional)"
                  placeholderTextColor="#9CA3AF"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Start Date</Text>
                <Pressable style={styles.dateInput} onPress={openStartDatePicker}>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                  <Text style={[styles.dateInputText, !startDate && styles.dateInputPlaceholder]}>
                    {startDate || 'Select start date (optional)'}
                  </Text>
                  {startDate && (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setStartDate('');
                      }}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </Pressable>
                  )}
                </Pressable>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>End Date</Text>
                <Pressable style={styles.dateInput} onPress={openEndDatePicker}>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                  <Text style={[styles.dateInputText, !endDate && styles.dateInputPlaceholder]}>
                    {endDate || 'Select end date (optional)'}
                  </Text>
                  {endDate && (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setEndDate('');
                      }}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </Pressable>
                  )}
                </Pressable>
              </View>

              {/* Add Members Section */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Add Team Members</Text>
                <View style={styles.memberSearchContainer}>
                  <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                  <TextInput
                    style={styles.memberSearchInput}
                    placeholder="Search members..."
                    placeholderTextColor="#9CA3AF"
                    value={memberSearchQuery}
                    onChangeText={setMemberSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {memberSearchQuery.length > 0 && (
                    <Pressable
                      onPress={() => setMemberSearchQuery('')}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </Pressable>
                  )}
                </View>
                <ScrollView style={styles.memberList} nestedScrollEnabled>
                  {availableUsersForSelection.length === 0 ? (
                    <View style={styles.emptyMemberList}>
                      <Text style={styles.emptyMemberText}>
                        {memberSearchQuery ? 'No users found' : 'No users available'}
                      </Text>
                    </View>
                  ) : (
                    availableUsersForSelection.map((user) => {
                      const isSelected = selectedMembers.includes(user.username);
                      const initials = (user.fullName || user.username || 'U')
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();
                      
                      return (
                        <Pressable
                          key={user.id}
                          style={[
                            styles.memberItem,
                            isSelected && styles.memberItemSelected
                          ]}
                          onPress={() => toggleMemberSelection(user.username)}
                        >
                          <View style={styles.memberItemLeft}>
                            <View style={[
                              styles.memberAvatar,
                              isSelected && styles.memberAvatarSelected
                            ]}>
                              <Text style={[
                                styles.memberAvatarText,
                                isSelected && styles.memberAvatarTextSelected
                              ]}>
                                {initials}
                              </Text>
                            </View>
                            <View style={styles.memberInfo}>
                              <Text style={[
                                styles.memberName,
                                isSelected && styles.memberNameSelected
                              ]}>
                                {user.fullName || user.username}
                              </Text>
                              {user.email && (
                                <Text style={styles.memberEmail}>{user.email}</Text>
                              )}
                            </View>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                          )}
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
                {selectedMembers.length > 0 && (
                  <View style={styles.selectedMembersContainer}>
                    <Text style={styles.selectedMembersLabel}>
                      {selectedMembers.length} {selectedMembers.length === 1 ? 'member' : 'members'} selected
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.modalActions}>
                <Pressable 
                  style={styles.cancelButton}
                  onPress={handleCloseModal}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.createButton, (!projectName.trim() || loading) && styles.createButtonDisabled]}
                  onPress={handleCreateProject}
                  disabled={!projectName.trim() || loading}
                >
                  <Text style={styles.createButtonText}>
                    {loading ? 'Creating...' : 'Create Project'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Start Date Picker Modal */}
      <Modal
        visible={showStartDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={closeStartDatePicker}
      >
        <Pressable 
          style={styles.datePickerOverlay}
          onPress={closeStartDatePicker}
        >
          <Pressable style={styles.datePickerContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.datePickerTitle}>Select Start Date</Text>
            
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Pressable 
                  style={styles.calendarNavButton}
                  onPress={() => {
                    const current = new Date(tempStartDate);
                    current.setMonth(current.getMonth() - 1);
                    setTempStartDate(current);
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#2563EB" />
                </Pressable>
                <Text style={styles.calendarMonthText}>
                  {tempStartDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <Pressable 
                  style={styles.calendarNavButton}
                  onPress={() => {
                    const current = new Date(tempStartDate);
                    current.setMonth(current.getMonth() + 1);
                    setTempStartDate(current);
                  }}
                >
                  <Ionicons name="chevron-forward" size={20} color="#2563EB" />
                </Pressable>
              </View>
              
              <View style={styles.calendarDayNames}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.calendarDayName}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.calendarGrid}>
                {renderStartCalendarDays()}
              </View>
            </View>
            
            <View style={styles.datePickerButtons}>
              <Pressable 
                style={styles.datePickerButton}
                onPress={closeStartDatePicker}
              >
                <Text style={styles.datePickerButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                onPress={() => {
                  if (tempStartDate) {
                    setStartDate(formatDateForInput(tempStartDate));
                  }
                  closeStartDatePicker();
                }}
              >
                <Text style={styles.datePickerButtonTextPrimary}>Confirm</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* End Date Picker Modal */}
      <Modal
        visible={showEndDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={closeEndDatePicker}
      >
        <Pressable 
          style={styles.datePickerOverlay}
          onPress={closeEndDatePicker}
        >
          <Pressable style={styles.datePickerContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.datePickerTitle}>Select End Date</Text>
            
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Pressable 
                  style={styles.calendarNavButton}
                  onPress={() => {
                    const current = new Date(tempEndDate);
                    current.setMonth(current.getMonth() - 1);
                    setTempEndDate(current);
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#2563EB" />
                </Pressable>
                <Text style={styles.calendarMonthText}>
                  {tempEndDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <Pressable 
                  style={styles.calendarNavButton}
                  onPress={() => {
                    const current = new Date(tempEndDate);
                    current.setMonth(current.getMonth() + 1);
                    setTempEndDate(current);
                  }}
                >
                  <Ionicons name="chevron-forward" size={20} color="#2563EB" />
                </Pressable>
              </View>
              
              <View style={styles.calendarDayNames}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.calendarDayName}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.calendarGrid}>
                {renderEndCalendarDays()}
              </View>
            </View>
            
            <View style={styles.datePickerButtons}>
              <Pressable 
                style={styles.datePickerButton}
                onPress={closeEndDatePicker}
              >
                <Text style={styles.datePickerButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                onPress={() => {
                  if (tempEndDate) {
                    setEndDate(formatDateForInput(tempEndDate));
                  }
                  closeEndDatePicker();
                }}
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
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  pageHeader: {
    paddingHorizontal: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
  },
  statusFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  projectsSection: {
    gap: 16,
  },
  projectsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  newProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    minWidth: 160,
    ...Platform.select({
      ios: {
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  newProjectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  projectHeader: {
    marginBottom: 12,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusPlanning: {
    backgroundColor: '#DBEAFE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextPlanning: {
    color: '#2563EB',
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  teamMembersList: {
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  teamMemberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  teamMemberEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  dateInputPlaceholder: {
    color: '#9CA3AF',
  },
  // Member Selection Styles
  memberSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  memberSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  memberList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  emptyMemberList: {
    padding: 20,
    alignItems: 'center',
  },
  emptyMemberText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  memberItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarSelected: {
    backgroundColor: '#2563EB',
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  memberAvatarTextSelected: {
    color: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  memberNameSelected: {
    color: '#2563EB',
  },
  memberEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectedMembersContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectedMembersLabel: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  // Date Picker Modal Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
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
});

