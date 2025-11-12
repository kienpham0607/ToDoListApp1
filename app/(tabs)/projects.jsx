import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjectsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planning');
  const [budget, setBudget] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const [projects, setProjects] = useState([
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Complete redesign of company website',
      status: 'Active',
      manager: 'Project Manager',
      date: '6/30/2024',
      budget: '50000',
      startDate: '1/15/2024',
      endDate: '6/30/2024',
      teamMembers: ['1', '2'],
    },
    {
      id: '2',
      title: 'Mobile App Development',
      description: 'Build iOS and Android mobile application',
      status: 'Planning',
      manager: 'Project Manager',
      date: '12/31/2024',
      budget: '100000',
      startDate: '3/1/2024',
      endDate: '12/31/2024',
      teamMembers: ['2', '3'],
    },
    {
      id: '3',
      title: 'Marketing Campaign Q2',
      description: 'Q2 marketing initiatives and campaigns',
      status: 'Active',
      manager: 'Project Manager',
      date: '6/30/2024',
      budget: '25000',
      startDate: '4/1/2024',
      endDate: '6/30/2024',
      teamMembers: ['1'],
    },
  ]);

  const teamMembers = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', initials: 'AU' },
    { id: '2', name: 'Project Manager', email: 'manager@example.com', initials: 'PM' },
    { id: '3', name: 'Team Member', email: 'member@example.com', initials: 'TM' },
  ];

  const projectManagers = [
    'Project Manager',
    'Admin User',
    'Team Lead',
  ];

  const statusOptions = ['Planning', 'Active', 'On Hold', 'Completed'];

  const toggleTeamMember = (memberId) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const resetForm = () => {
    setProjectName('');
    setDescription('');
    setStatus('Planning');
    setBudget('0');
    setStartDate('');
    setEndDate('');
    setProjectManager('');
    setSelectedTeamMembers([]);
  };

  const handleCloseModal = () => {
    resetForm();
    setShowCreateModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // If already in format m/d/yyyy, return as is
    if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      return dateString;
    }
    // Try to parse and format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const handleCreateProject = () => {
    // Validation
    if (!projectName.trim()) {
      Alert.alert('Validation Error', 'Please enter a project name.');
      return;
    }

    if (!projectManager) {
      Alert.alert('Validation Error', 'Please select a project manager.');
      return;
    }

    // Validate dates if both are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        Alert.alert('Validation Error', 'End date must be after start date.');
        return;
      }
    }

    // Get selected team member names
    const selectedMembers = teamMembers
      .filter(member => selectedTeamMembers.includes(member.id))
      .map(member => member.name);

    const newProject = {
      id: String(Date.now()),
      title: projectName.trim(),
      description: description.trim() || '',
      status: status,
      manager: projectManager,
      date: formatDate(endDate) || formatDate(startDate) || new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
      budget: budget || '0',
      startDate: formatDate(startDate) || '',
      endDate: formatDate(endDate) || '',
      teamMembers: selectedTeamMembers,
      teamMemberNames: selectedMembers,
    };

    setProjects([newProject, ...projects]);
    
    // Show success message
    Alert.alert('Success', 'Project created successfully!', [
      {
        text: 'OK',
        onPress: () => {
          resetForm();
          setShowCreateModal(false);
        }
      }
    ]);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Projects</Text>
            <Text style={styles.subtitle}>Manage and track all your projects</Text>
          </View>
          <Pressable 
            style={styles.newProjectButton}
            onPress={() => router.push('/create-project')}
          >
            <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.newProjectText}>New Project</Text>
          </Pressable>
        </View>

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
            style={[styles.statusFilter, { marginLeft: 12 }]}
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        <View style={styles.projectsList}>
          {filteredProjects.map((project) => (
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
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                  <Text style={styles.metaText}>{project.manager}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                  <Text style={styles.metaText}>{project.date}</Text>
                </View>
              </View>
            </Pressable>
          ))}
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

              {/* Status & Budget Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroupHalf, { marginRight: 12 }]}>
                  <Text style={styles.label}>Status</Text>
                  <Pressable 
                    style={styles.dropdown}
                    onPress={() => {
                      const currentIndex = statusOptions.indexOf(status);
                      const nextIndex = (currentIndex + 1) % statusOptions.length;
                      setStatus(statusOptions[nextIndex]);
                    }}
                  >
                    <Text style={styles.dropdownText}>{status}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" style={{ marginLeft: 8 }} />
                  </Pressable>
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Budget ($)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                  />
                </View>
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

              {/* Project Manager */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Project Manager</Text>
                  <Text style={styles.requiredAsterisk}> *</Text>
                </View>
                <Pressable 
                  style={styles.dropdown}
                  onPress={() => {
                    const currentIndex = projectManagers.indexOf(projectManager);
                    const nextIndex = (currentIndex + 1) % projectManagers.length;
                    setProjectManager(projectManagers[nextIndex]);
                  }}
                >
                  <Text style={[styles.dropdownText, !projectManager && styles.dropdownPlaceholder]}>
                    {projectManager || 'Select project manager'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#6B7280" style={{ marginLeft: 8 }} />
                </Pressable>
              </View>

              {/* Team Members */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Team Members</Text>
                <View style={styles.teamMembersList}>
                  {teamMembers.map((member) => (
                    <Pressable
                      key={member.id}
                      style={styles.teamMemberItem}
                      onPress={() => toggleTeamMember(member.id)}
                    >
                      <View style={styles.teamMemberLeft}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{member.initials}</Text>
                        </View>
                        <View style={styles.teamMemberInfo}>
                          <Text style={styles.teamMemberName}>{member.name}</Text>
                          <Text style={styles.teamMemberEmail}>{member.email}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.checkbox,
                        selectedTeamMembers.includes(member.id) && styles.checkboxChecked
                      ]}>
                        {selectedTeamMembers.includes(member.id) && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={handleCloseModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.createButton, (!projectName.trim() || !projectManager) && styles.createButtonDisabled]}
                  onPress={handleCreateProject}
                  disabled={!projectName.trim() || !projectManager}
                >
                  <Text style={styles.createButtonText}>Create Project</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  newProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newProjectText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
  },
  statusFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  projectsList: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
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
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
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

