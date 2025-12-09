import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { 
  fetchProjects, 
  createNewProject,
  deleteProjectById,
  selectProjects,
  selectProjectLoading,
  selectProjectError,
  clearError
} from '@/store/projectSlice';
import { selectToken, selectIsAuthenticated } from '@/store/authSlice';

export default function ProjectsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const projects = useSelector(selectProjects);
  const loading = useSelector(selectProjectLoading);
  const error = useSelector(selectProjectError);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
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

      resetForm();
      setShowCreateModal(false);

      // Refresh projects list
      await dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));

      Toast.show({
        type: 'success',
        text1: 'Project Created',
        text2: `"${projectName.trim()}" has been created successfully`,
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
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>Create New Project</Text>
                <Text style={styles.modalSubtitle}>Add a new project with team members and budget details</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={handleCloseModal}>
                <Ionicons name="close-outline" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
              {/* Project Name */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Project Name</Text>
                  <Text style={styles.requiredAsterisk}> *</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter project name"
                  placeholderTextColor="#9CA3AF"
                  value={projectName}
                  onChangeText={setProjectName}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter project description"
                  placeholderTextColor="#9CA3AF"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>


              {/* Start Date & End Date Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroupHalf, { marginRight: 12 }]}>
                  <Text style={styles.label}>Start Date</Text>
                  <View style={styles.dateInput}>
                    <Ionicons name="calendar-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.dateInputText}
                      placeholder="Pick a date"
                      placeholderTextColor="#9CA3AF"
                      value={startDate}
                      onChangeText={setStartDate}
                    />
                  </View>
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>End Date</Text>
                  <View style={styles.dateInput}>
                    <Ionicons name="calendar-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.dateInputText}
                      placeholder="Pick a date"
                      placeholderTextColor="#9CA3AF"
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </View>
                </View>
              </View>


              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={handleCloseModal}>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    position: 'relative',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalHeaderContent: {
    alignItems: 'center',
    width: '100%',
    paddingRight: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 4,
    zIndex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  requiredAsterisk: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
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

