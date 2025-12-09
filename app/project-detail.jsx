import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { 
  fetchProjectById,
  selectSelectedProject,
  selectProjectLoading,
  selectProjectError,
  clearError,
  clearSelectedProject
} from '@/store/projectSlice';
import {
  fetchProjectMembersByProjectId,
  fetchAllUsers,
  addMemberToProject,
  selectProjectMembers,
  selectUsers
} from '@/store/teamSlice';
import {
  fetchTasks,
  selectTasks
} from '@/store/taskSlice';
import { selectToken, selectIsAuthenticated } from '@/store/authSlice';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams();
  const projectId = id ? Number(id) : null;

  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const project = useSelector(selectSelectedProject);
  const projectMembers = useSelector(selectProjectMembers);
  const allUsers = useSelector(selectUsers);
  const allTasks = useSelector(selectTasks);
  const loading = useSelector(selectProjectLoading);
  const error = useSelector(selectProjectError);

  // State for add member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Fetch project detail, members, and tasks when component mounts
  useEffect(() => {
    if (isAuthenticated && token && projectId) {
      console.log('ProjectDetail: Fetching project detail for ID:', projectId);
      console.log('ProjectDetail: Token present:', !!token);
      console.log('ProjectDetail: Token length:', token ? token.length : 0);
      console.log('ProjectDetail: Is authenticated:', isAuthenticated);
      dispatch(fetchProjectById({ token, projectId }));
      dispatch(fetchProjectMembersByProjectId({ token, projectId }));
      dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));
      dispatch(fetchTasks({ token, offset: 0, limit: 1000 }));
    } else {
      console.log('ProjectDetail: Cannot fetch - missing requirements:', {
        isAuthenticated,
        hasToken: !!token,
        projectId
      });
    }
  }, [isAuthenticated, token, projectId, dispatch]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && token && projectId) {
        console.log('ProjectDetail: Screen focused, refreshing data...');
        dispatch(fetchProjectById({ token, projectId }));
        dispatch(fetchProjectMembersByProjectId({ token, projectId }));
        dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));
        dispatch(fetchTasks({ token, offset: 0, limit: 1000 }));
      }
    }, [isAuthenticated, token, projectId, dispatch])
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

  // Cleanup selected project when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSelectedProject());
    };
  }, [dispatch]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString || 'Not set';
    }
  }, []);

  // Filter project members for this project (members are already filtered by project ID from API)
  const teamMembers = useMemo(() => {
    console.log('ProjectDetail: Computing teamMembers');
    console.log('ProjectDetail: project:', project?.id, project?.name);
    console.log('ProjectDetail: projectMembers from Redux:', projectMembers?.length || 0);
    
    if (!project) {
      console.log('ProjectDetail: No project');
      return [];
    }
    
    if (!projectMembers || projectMembers.length === 0) {
      console.log('ProjectDetail: No projectMembers in Redux state');
      return [];
    }
    
    // Since API already filters by projectId, we can use all members
    // But we still filter to be safe
    const filtered = projectMembers
      .filter(member => {
        if (!member) {
          console.log('ProjectDetail: Null member found');
          return false;
        }
        
        // API should already filter by projectId, but double-check
        const matchesById = member.project?.id && String(member.project.id) === String(project.id);
        const matchesByName = member.project?.name && member.project.name === project.name;
        
        if (matchesById || matchesByName) {
          console.log('ProjectDetail: Member matches project:', {
            memberId: member.id,
            memberProjectId: member.project?.id,
            memberProjectName: member.project?.name,
            projectId: project.id,
            projectName: project.name
          });
        }
        
        return matchesById || matchesByName;
      })
      .map(member => {
        const user = member.user;
        if (!user) {
          console.log('ProjectDetail: Member missing user data:', member);
          return null;
        }
        
        const initials = (user?.fullName || user?.username || 'U')
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        
        // roleInProject từ backend là enum (leader hoặc member), có thể là string hoặc enum value
        const role = member.roleInProject || '';
        const roleString = typeof role === 'string' ? role : String(role);
        
        return {
          id: member.id,
          userId: user?.id,
          name: user?.fullName || user?.username || 'Unknown',
          email: user?.email || '',
          initials,
          role: roleString, // roleInProject từ backend (leader hoặc member)
        };
      })
      .filter(m => m !== null); // Remove null entries
    
    console.log('ProjectDetail: Filtered team members count:', filtered.length);
    if (filtered.length > 0) {
      console.log('ProjectDetail: Team members:', filtered.map(m => ({ 
        id: m.id, 
        name: m.name, 
        email: m.email, 
        role: m.role 
      })));
    } else {
      console.log('ProjectDetail: No team members found after filtering');
      if (projectMembers.length > 0) {
        console.log('ProjectDetail: Sample projectMember from Redux:', JSON.stringify(projectMembers[0], null, 2));
      }
    }
    
    return filtered;
  }, [project, projectMembers]);

  // Filter available users (not already members)
  const availableUsers = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];
    if (!teamMembers || teamMembers.length === 0) {
      // If no team members yet, return all users filtered by search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return allUsers.filter(user => {
          const matchesName = (user.fullName || '').toLowerCase().includes(query);
          const matchesUsername = (user.username || '').toLowerCase().includes(query);
          const matchesEmail = (user.email || '').toLowerCase().includes(query);
          return matchesName || matchesUsername || matchesEmail;
        });
      }
      return allUsers;
    }
    
    const filtered = allUsers.filter(user => {
      // Filter out users who are already members
      const isMember = teamMembers.some(m => m.userId === user.id);
      if (isMember) return false;
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (user.fullName || '').toLowerCase().includes(query);
        const matchesUsername = (user.username || '').toLowerCase().includes(query);
        const matchesEmail = (user.email || '').toLowerCase().includes(query);
        return matchesName || matchesUsername || matchesEmail;
      }
      
      return true;
    });
    
    return filtered;
  }, [allUsers, teamMembers, searchQuery]);

  // Reset modal state when closing
  const handleCloseModal = useCallback(() => {
    setSelectedUser('');
    setSearchQuery('');
    setShowAddMemberModal(false);
  }, []);

  // Handle add member to project
  const handleAddMember = useCallback(async () => {
    if (!project) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Project not found',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    if (!selectedUser) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a member',
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
        text2: 'You must be logged in to add a member',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    // Check if user is already in the project
    const isAlreadyMember = teamMembers.some(
      member => member.name === selectedUser || member.userId === selectedUser
    );

    if (isAlreadyMember) {
      Toast.show({
        type: 'error',
        text1: 'Already Member',
        text2: 'This user is already a member of this project',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    setIsAddingMember(true);
    try {
      const memberData = {
        projectName: project.name.trim(),
        memberName: selectedUser.trim(),
      };

      await dispatch(addMemberToProject({
        token,
        memberData,
      })).unwrap();

      setSelectedUser('');
      setSearchQuery('');
      setShowAddMemberModal(false);

      // Refresh project members
      await dispatch(fetchProjectMembersByProjectId({ token, projectId }));
      await dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));

      Toast.show({
        type: 'success',
        text1: 'Member Added',
        text2: 'Member has been added to project successfully',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (error) {
      console.error('Failed to add member:', error);
      const errorData = error?.payload || error;
      const errorMessage = errorData?.message || error?.message || 'Failed to add member to project';
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
    } finally {
      setIsAddingMember(false);
    }
  }, [project, selectedUser, token, teamMembers, dispatch, projectId]);

  // Find project manager (leader role - người tạo team)
  const projectManager = useMemo(() => {
    // Tìm member có role là "leader" (người tạo team)
    const manager = teamMembers.find(m => {
      const role = m.role?.toLowerCase?.() || m.role || '';
      return role === 'leader';
    });
    
    if (manager) {
      console.log('ProjectDetail: Found project manager (leader):', manager.name);
      return {
        name: manager.name,
        email: manager.email,
        initials: manager.initials,
      };
    }
    
    // Fallback: Nếu không tìm thấy leader, lấy member đầu tiên
    // (trường hợp này không nên xảy ra vì backend tự động thêm creator là leader)
    if (teamMembers.length > 0) {
      console.log('ProjectDetail: No leader found, using first member:', teamMembers[0].name);
      return {
        name: teamMembers[0].name,
        email: teamMembers[0].email,
        initials: teamMembers[0].initials,
      };
    }
    
    console.log('ProjectDetail: No team members found');
    return {
      name: 'Unknown',
      email: '',
      initials: 'U',
    };
  }, [teamMembers]);

  // Filter tasks for this project
  const projectTasks = useMemo(() => {
    if (!project || !allTasks) return [];
    
    return allTasks.filter(task => 
      task.projectName === project.name ||
      (task.project && String(task.project.id) === String(project.id))
    );
  }, [project, allTasks]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {
      'To Do': [],
      'In Progress': [],
      'Review': [],
      'Done': [],
    };

    projectTasks.forEach(task => {
      const status = task.status || 'todo';
      let statusKey = 'To Do';
      
      if (status.toLowerCase() === 'todo') statusKey = 'To Do';
      else if (status.toLowerCase() === 'inprogress' || status.toLowerCase() === 'in progress') statusKey = 'In Progress';
      else if (status.toLowerCase() === 'review') statusKey = 'Review';
      else if (status.toLowerCase() === 'completed' || status.toLowerCase() === 'done') statusKey = 'Done';
      
      const taskData = {
        id: task.id,
        title: task.name || task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        status: statusKey,
        dueDate: task.dueDate ? formatDate(task.dueDate) : null,
        progress: task.progress || 0,
        assignedTo: task.assignedTo ? {
          name: task.assignedTo,
          initials: task.assignedTo.substring(0, 2).toUpperCase(),
        } : null,
      };

      // Calculate overdue
      if (taskData.dueDate && task.dueDate) {
        const due = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (due < today && statusKey !== 'Done') {
          const diff = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
          taskData.isOverdue = true;
          taskData.daysOverdue = diff;
        }
      }

      grouped[statusKey].push(taskData);
    });

    return grouped;
  }, [projectTasks, formatDate]);

  // Calculate project metrics
  const metrics = useMemo(() => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => 
      t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'done'
    ).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate days remaining
    let daysRemaining = 0;
    if (project?.endDate) {
      const end = new Date(project.endDate);
      const today = new Date();
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      daysRemaining = diff > 0 ? diff : 0;
    }

    // Calculate status
    let status = 'Active';
    if (project?.endDate) {
      const end = new Date(project.endDate);
      const today = new Date();
      if (end < today) {
        status = 'Completed';
      } else if (project?.startDate) {
        const start = new Date(project.startDate);
        if (start > today) {
          status = 'Planning';
        }
      }
    } else if (project?.startDate) {
      const start = new Date(project.startDate);
      const today = new Date();
      if (start > today) {
        status = 'Planning';
      }
    }

    return {
      progress,
      completedTasks,
      totalTasks,
      daysRemaining,
      teamSize: teamMembers.length,
      status,
    };
  }, [project, projectTasks, teamMembers]);

  // Show loading state
  if (loading && !project) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading project...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if project not found
  if (!project && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Project not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
            <Text style={styles.backText}>Back to Projects</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.headerSection}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
            <Text style={styles.backText}>Back to Projects</Text>
          </Pressable>
        </View>

        {/* Project Title Card */}
        <View style={styles.projectCard}>
          <View style={styles.projectTitleRow}>
            <Text style={styles.projectTitle}>{project?.name || 'Untitled Project'}</Text>
            <View style={[styles.statusTag, metrics.status === 'Active' && styles.statusTagActive]}>
              <Text style={[styles.statusTagText, metrics.status === 'Active' && styles.statusTagTextActive]}>
                {metrics.status.toLowerCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.projectDescription}>{project?.description || 'No description'}</Text>
        </View>

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Project Overview</Text>
          <Text style={styles.pageSubtitle}>Track progress and manage tasks</Text>
        </View>

        {/* Progress Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Project Progress</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${metrics.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{metrics.progress}%</Text>
          </View>
          <Text style={styles.progressSubtext}>
            {metrics.completedTasks} of {metrics.totalTasks} tasks completed
          </Text>
        </View>

        {/* Metrics Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrapper, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#6366F1" />
              </View>
              <Text style={styles.metricLabel}>Completed</Text>
              <Text style={styles.metricValue}>{metrics.completedTasks}</Text>
              <Text style={styles.metricSubtext}>tasks done</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrapper, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="time-outline" size={20} color="#2563EB" />
              </View>
              <Text style={styles.metricLabel}>Time Left</Text>
              <Text style={styles.metricValue}>{metrics.daysRemaining}</Text>
              <Text style={styles.metricSubtext}>days remaining</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrapper, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="cash-outline" size={20} color="#059669" />
              </View>
              <Text style={styles.metricLabel}>Budget</Text>
              <Text style={styles.metricValue}>$0</Text>
              <Text style={styles.metricSubtext}>allocated</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrapper, { backgroundColor: '#E0ECFF' }]}>
                <Ionicons name="people-outline" size={20} color="#2563EB" />
              </View>
              <Text style={styles.metricLabel}>Team Size</Text>
              <Text style={styles.metricValue}>{metrics.teamSize}</Text>
              <Text style={styles.metricSubtext}>members</Text>
            </View>
          </View>
        </View>

        {/* Project Manager Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0ECFF' }]}>
              <Ionicons name="person-outline" size={20} color="#2563EB" />
            </View>
            <Text style={styles.sectionTitle}>Project Manager</Text>
          </View>
          <View style={styles.managerInfo}>
            <View style={styles.managerAvatar}>
              <Text style={styles.managerAvatarText}>{projectManager.initials}</Text>
            </View>
            <View style={styles.managerDetails}>
              <Text style={styles.managerRole}>Project Manager</Text>
              <Text style={styles.managerName}>{projectManager.name}</Text>
              {projectManager.email && (
                <Text style={styles.managerEmail}>{projectManager.email}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </View>
            <Text style={styles.sectionTitle}>Timeline</Text>
          </View>
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Start Date</Text>
              <Text style={styles.timelineValue}>
                {project?.startDate ? formatDate(project.startDate) : 'Not set'}
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>End Date</Text>
              <Text style={styles.timelineValue}>
                {project?.endDate ? formatDate(project.endDate) : 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Team Members Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0ECFF' }]}>
              <Ionicons name="people-outline" size={20} color="#2563EB" />
            </View>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <View style={styles.teamCountBadge}>
              <Text style={styles.teamCountText}>{teamMembers.length}</Text>
            </View>
            <Pressable 
              style={styles.addMemberButton}
              onPress={() => setShowAddMemberModal(true)}
            >
              <Ionicons name="add" size={18} color="#2563EB" />
              <Text style={styles.addMemberButtonText}>Add</Text>
            </Pressable>
          </View>
          {teamMembers.length === 0 ? (
            <Text style={styles.emptyText}>No team members yet</Text>
          ) : (
            <View style={styles.teamMembersContainer}>
              {teamMembers.map((member) => (
                <View key={member.id || member.userId} style={styles.teamMemberTag}>
                  <Text style={styles.teamMemberInitials}>{member.initials}</Text>
                  <Text style={styles.teamMemberName}>{member.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Add Member Modal */}
        <Modal
          visible={showAddMemberModal}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Member to Team</Text>
                <Pressable onPress={handleCloseModal}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Select Member *</Text>
                  {project && (
                    <Text style={styles.selectedTeamHint}>
                      Adding to: <Text style={styles.selectedTeamName}>{project.name}</Text>
                    </Text>
                  )}
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {availableUsers.length === 0 ? (
                      <View style={styles.emptyDropdown}>
                        <Text style={styles.emptyDropdownText}>
                          {searchQuery 
                            ? 'No users found. Try adjusting your search.'
                            : 'All users are already members of this project.'
                          }
                        </Text>
                      </View>
                    ) : (
                      availableUsers.map((user) => {
                        const isSelected = selectedUser === user.username;
                        
                        return (
                          <Pressable
                            key={user.id}
                            style={[
                              styles.dropdownOption,
                              isSelected && styles.dropdownOptionSelected
                            ]}
                            onPress={() => setSelectedUser(user.username)}
                          >
                            <View style={styles.userOption}>
                              <View style={styles.userOptionInfo}>
                                <Text style={[
                                  styles.dropdownOptionText,
                                  isSelected && styles.dropdownOptionTextSelected
                                ]}>
                                  {user.fullName || user.username}
                                </Text>
                                <Text style={styles.userEmail}>{user.email}</Text>
                              </View>
                              {isSelected && (
                                <Ionicons name="checkmark" size={20} color="#2563EB" />
                              )}
                            </View>
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
                {availableUsers.length > 0 && (
                  <View style={styles.searchHintContainer}>
                    <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                    <TextInput
                      style={styles.searchInputInline}
                      placeholder="Search by name, username, or email..."
                      placeholderTextColor="#9CA3AF"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                      <Pressable
                        onPress={() => setSearchQuery('')}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      >
                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                      </Pressable>
                    )}
                  </View>
                )}
                <View style={styles.modalActions}>
                  <Pressable 
                    style={styles.cancelButton}
                    onPress={handleCloseModal}
                    disabled={isAddingMember}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable 
                    style={[
                      styles.createButton,
                      (!selectedUser || isAddingMember) && styles.createButtonDisabled
                    ]}
                    onPress={handleAddMember}
                    disabled={!selectedUser || isAddingMember}
                  >
                    <Text style={styles.createButtonText}>
                      {isAddingMember ? 'Adding...' : 'Add Member'}
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Tasks Section */}
        <View style={styles.sectionCard}>
          <View style={styles.tasksHeader}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <Pressable style={styles.newTaskButton} onPress={() => router.push('/add-task')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.newTaskButtonText}>New Task</Text>
            </Pressable>
          </View>

          {/* Kanban Board */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.kanbanContainer}>
            {['To Do', 'In Progress', 'Review', 'Done'].map((status) => {
              const statusTasks = tasksByStatus[status] || [];
              return (
                <View key={status} style={styles.kanbanColumn}>
                  <View style={styles.kanbanHeader}>
                    <View style={[styles.statusDot, 
                      status === 'To Do' && styles.statusDotGray,
                      status === 'In Progress' && styles.statusDotBlue,
                      status === 'Review' && styles.statusDotYellow,
                      status === 'Done' && styles.statusDotGreen,
                    ]} />
                    <Text style={styles.kanbanTitle}>{status}</Text>
                    <Text style={styles.kanbanCount}>{statusTasks.length}</Text>
                  </View>
                  
                  {statusTasks.map((task) => (
                    <View key={task.id} style={styles.taskCard}>
                      <View style={styles.taskCardHeader}>
                        <Text style={styles.taskCardTitle}>{task.title}</Text>
                        {task.priority && (
                          <View style={[styles.priorityBadge, 
                            (task.priority.toLowerCase() === 'high' || task.priority === 'High') && styles.priorityHigh,
                            (task.priority.toLowerCase() === 'medium' || task.priority === 'Medium') && styles.priorityMedium,
                            (task.priority.toLowerCase() === 'low' || task.priority === 'Low') && styles.priorityLow,
                          ]}>
                            <Text style={[styles.priorityText,
                              (task.priority.toLowerCase() === 'high' || task.priority === 'High') && styles.priorityTextHigh,
                              (task.priority.toLowerCase() === 'medium' || task.priority === 'Medium') && styles.priorityTextMedium,
                              (task.priority.toLowerCase() === 'low' || task.priority === 'Low') && styles.priorityTextLow,
                            ]}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      {task.description && (
                        <Text style={styles.taskDescription}>{task.description}</Text>
                      )}
                      
                      {task.status && (
                        <View style={[styles.taskStatusBadge,
                          task.status === 'To Do' && styles.taskStatusToDo,
                          task.status === 'In Progress' && styles.taskStatusInProgress,
                          task.status === 'Done' && styles.taskStatusDone,
                        ]}>
                          <Text style={styles.taskStatusText}>{task.status}</Text>
                        </View>
                      )}
                      
                      {task.assignedTo && (
                        <View style={styles.taskAssigned}>
                          <View style={styles.taskAssignedAvatar}>
                            <Text style={styles.taskAssignedInitials}>{task.assignedTo.initials}</Text>
                          </View>
                          <Text style={styles.taskAssignedName}>{task.assignedTo.name}</Text>
                        </View>
                      )}
                      
                      {task.progress !== undefined && task.progress !== null && (
                        <View style={styles.taskProgress}>
                          <Ionicons name="checkmark-circle-outline" size={16} color="#6B7280" />
                          <View style={styles.taskProgressBar}>
                            <View style={[styles.taskProgressBarFill, { width: `${task.progress}%` }]} />
                          </View>
                          <Text style={styles.taskProgressPercent}>{task.progress}%</Text>
                        </View>
                      )}
                      
                      {task.dueDate && (
                        <View style={styles.taskDueDate}>
                          <Ionicons 
                            name={task.isOverdue ? "alert-circle" : "calendar-outline"} 
                            size={16} 
                            color={task.isOverdue ? "#DC2626" : "#6B7280"} 
                          />
                          <Text style={[styles.taskDueDateText, task.isOverdue && styles.taskDueDateOverdue]}>
                            {task.dueDate}
                            {task.isOverdue && ` (${task.daysOverdue} days overdue)`}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
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
  headerSection: {
    marginBottom: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
    fontWeight: '500',
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
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
  },
  statusTagActive: {
    backgroundColor: '#D1FAE5',
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'lowercase',
  },
  statusTagTextActive: {
    color: '#059669',
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 14,
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    minWidth: 40,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    width: '47%',
    alignItems: 'flex-start',
  },
  metricIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  managerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  managerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  managerAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  managerDetails: {
    flex: 1,
  },
  managerRole: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  managerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  managerEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineItem: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  timelineValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  teamCountBadge: {
    marginLeft: 'auto',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  teamCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  teamMembersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamMemberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  teamMemberInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  teamMemberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  newTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  newTaskButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  kanbanContainer: {
    marginHorizontal: -18,
    paddingHorizontal: 18,
  },
  kanbanColumn: {
    width: 320,
    marginRight: 16,
  },
  kanbanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotGray: {
    backgroundColor: '#9CA3AF',
  },
  statusDotBlue: {
    backgroundColor: '#2563EB',
  },
  statusDotYellow: {
    backgroundColor: '#F59E0B',
  },
  statusDotGreen: {
    backgroundColor: '#10B981',
  },
  kanbanTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  kanbanCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  taskCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityMedium: {
    backgroundColor: '#FEF3C7',
  },
  priorityLow: {
    backgroundColor: '#DCFCE7',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityTextHigh: {
    color: '#DC2626',
  },
  priorityTextMedium: {
    color: '#D97706',
  },
  priorityTextLow: {
    color: '#16A34A',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  taskStatusToDo: {
    backgroundColor: '#F3F4F6',
  },
  taskStatusInProgress: {
    backgroundColor: '#DBEAFE',
  },
  taskStatusDone: {
    backgroundColor: '#D1FAE5',
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  taskAssigned: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskAssignedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  taskAssignedInitials: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  taskAssignedName: {
    fontSize: 14,
    color: '#6B7280',
  },
  taskProgress: {
    marginBottom: 12,
    gap: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  taskProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 4,
  },
  taskProgressBarFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  taskProgressPercent: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  taskDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDueDateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  taskDueDateOverdue: {
    color: '#DC2626',
    fontWeight: '600',
  },
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
  selectedTeamHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  selectedTeamName: {
    fontWeight: '600',
    color: '#2563EB',
  },
  dropdownScroll: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  emptyDropdown: {
    padding: 20,
    alignItems: 'center',
  },
  emptyDropdownText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  userOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  userOptionInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  searchHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    gap: 8,
  },
  searchInputInline: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
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
});
