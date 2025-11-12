import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { Alert, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateProjectScreen() {
  const router = useRouter();
  
  // Form states
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planning');
  const [budget, setBudget] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [showManagerPicker, setShowManagerPicker] = useState(false);
  const [showTeamMembersPicker, setShowTeamMembersPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const managerDropdownRef = useRef(null);
  const teamMembersDropdownRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [managerLayout, setManagerLayout] = useState({ y: 0, height: 0 });
  const [teamMembersLayout, setTeamMembersLayout] = useState({ y: 0, height: 0 });
  
  const screenHeight = Dimensions.get('window').height;

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

    // Show success message
    Alert.alert('Success', 'Project created successfully!', [
      {
        text: 'OK',
        onPress: () => {
          router.back();
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.headerTitle}>Create New Project</Text>
          <Text style={styles.headerSubtitle}>Add a new project with team members and budget details</Text>
        </View>
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
          <View style={[styles.formGroupHalf, { marginRight: 12, zIndex: 10004, position: 'relative' }]}>
            <Text style={styles.label}>Status</Text>
            <View style={[styles.dropdownContainer, { zIndex: 10005 }]}>
              <Pressable 
                style={styles.dropdown}
                onPress={() => setShowStatusPicker(!showStatusPicker)}
              >
                <Text style={styles.dropdownText}>{status}</Text>
                <Ionicons 
                  name={showStatusPicker ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#6B7280" 
                  style={{ marginLeft: 8 }} 
                />
              </Pressable>
              {showStatusPicker && (
                <View style={[styles.dropdownList, { zIndex: 10006, elevation: 30 }]}>
                  {statusOptions.map((option, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.dropdownItem,
                        status === option && styles.dropdownItemSelected,
                        index === statusOptions.length - 1 && styles.dropdownItemLast
                      ]}
                      onPress={() => {
                        setStatus(option);
                        setShowStatusPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        status === option && styles.dropdownItemTextSelected
                      ]}>
                        {option}
                      </Text>
                      {status === option && (
                        <Ionicons name="checkmark" size={18} color="#2563EB" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
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
          <View style={[styles.formGroupHalf, { marginRight: 12, zIndex: 1 }]}>
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
        <View 
          ref={managerDropdownRef}
          style={[styles.formGroup, { zIndex: 1, position: 'relative' }]}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setManagerLayout({ y, height });
          }}
        >
          <View style={styles.labelRow}>
            <Text style={styles.label}>Project Manager</Text>
            <Text style={styles.requiredAsterisk}> *</Text>
          </View>
          <View style={styles.dropdownContainer}>
            <Pressable 
              style={styles.dropdown}
              onPress={() => {
                const newState = !showManagerPicker;
                setShowManagerPicker(newState);
                if (newState) {
                  setTimeout(() => {
                    if (scrollViewRef.current && managerDropdownRef.current) {
                      managerDropdownRef.current.measureLayout(
                        scrollViewRef.current,
                        (x, y, width, height) => {
                          const dropdownHeight = 150;
                          const actionButtonsHeight = 100;
                          const visibleArea = screenHeight - 200;
                          const totalNeeded = y + height + dropdownHeight + actionButtonsHeight;
                          const scrollNeeded = totalNeeded - visibleArea;
                          if (scrollNeeded > 0) {
                            scrollViewRef.current.scrollTo({ 
                              y: y + scrollNeeded + 20, 
                              animated: true 
                            });
                          }
                        },
                        () => {
                          // Fallback: use layout state
                          const dropdownHeight = 150;
                          const actionButtonsHeight = 100;
                          const visibleArea = screenHeight - 200;
                          const totalNeeded = managerLayout.y + managerLayout.height + dropdownHeight + actionButtonsHeight;
                          const scrollNeeded = totalNeeded - visibleArea;
                          if (scrollNeeded > 0 && scrollViewRef.current) {
                            scrollViewRef.current.scrollTo({ 
                              y: managerLayout.y + scrollNeeded + 20, 
                              animated: true 
                            });
                          }
                        }
                      );
                    }
                  }, 150);
                }
              }}
            >
              <Text style={[styles.dropdownText, !projectManager && styles.dropdownPlaceholder]}>
                {projectManager || 'Select project manager'}
              </Text>
              <Ionicons 
                name={showManagerPicker ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#6B7280" 
                style={{ marginLeft: 8 }} 
              />
            </Pressable>
            {showManagerPicker && (
              <View style={[styles.dropdownList, { zIndex: 10001, elevation: 25 }]}>
                {projectManagers.map((manager, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.dropdownItem,
                      projectManager === manager && styles.dropdownItemSelected,
                      index === projectManagers.length - 1 && styles.dropdownItemLast
                    ]}
                    onPress={() => {
                      setProjectManager(manager);
                      setShowManagerPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      projectManager === manager && styles.dropdownItemTextSelected
                    ]}>
                      {manager}
                    </Text>
                    {projectManager === manager && (
                      <Ionicons name="checkmark" size={18} color="#2563EB" />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Team Members */}
        <View 
          ref={teamMembersDropdownRef}
          style={[styles.formGroup, { zIndex: 10001 }]}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setTeamMembersLayout({ y, height });
          }}
        >
          <Text style={styles.label}>Team Members</Text>
          <View style={styles.teamMembersContainer}>
            {selectedTeamMembers.length > 0 && (
              <View style={styles.selectedMembersContainer}>
                {selectedTeamMembers.map((memberId) => {
                  const member = teamMembers.find(m => m.id === memberId);
                  if (!member) return null;
                  return (
                    <View key={memberId} style={styles.selectedMemberChip}>
                      <View style={styles.chipAvatar}>
                        <Text style={styles.chipAvatarText}>{member.initials}</Text>
                      </View>
                      <Text style={styles.chipName}>{member.name}</Text>
                      <Pressable
                        onPress={() => toggleTeamMember(memberId)}
                        style={styles.chipRemoveButton}
                      >
                        <Ionicons name="close" size={16} color="#6B7280" />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
            <View style={[styles.dropdownContainer, { zIndex: 10002 }]}>
              <Pressable
                style={styles.addMemberButton}
                onPress={() => {
                const newState = !showTeamMembersPicker;
                setShowTeamMembersPicker(newState);
                if (newState) {
                  setTimeout(() => {
                    if (scrollViewRef.current && teamMembersDropdownRef.current) {
                      teamMembersDropdownRef.current.measureLayout(
                        scrollViewRef.current,
                        (x, y, width, height) => {
                          const dropdownHeight = 200;
                          const actionButtonsHeight = 100; // Approximate height of action buttons
                          const visibleArea = screenHeight - 200; // Account for header and safe area
                          const totalNeeded = y + height + dropdownHeight + actionButtonsHeight;
                          const scrollNeeded = totalNeeded - visibleArea;
                          if (scrollNeeded > 0) {
                            scrollViewRef.current.scrollTo({ 
                              y: y + scrollNeeded + 20, 
                              animated: true 
                            });
                          }
                        },
                        () => {
                          // Fallback: use layout state
                          const dropdownHeight = 200;
                          const actionButtonsHeight = 100;
                          const visibleArea = screenHeight - 200;
                          const totalNeeded = teamMembersLayout.y + teamMembersLayout.height + dropdownHeight + actionButtonsHeight;
                          const scrollNeeded = totalNeeded - visibleArea;
                          if (scrollNeeded > 0 && scrollViewRef.current) {
                            scrollViewRef.current.scrollTo({ 
                              y: teamMembersLayout.y + scrollNeeded + 20, 
                              animated: true 
                            });
                          }
                        }
                      );
                    }
                  }, 150);
                }
              }}
              >
                <Ionicons name="add" size={20} color="#2563EB" />
                <Text style={styles.addMemberText}>Add Team Member</Text>
                <Ionicons 
                  name={showTeamMembersPicker ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#2563EB" 
                  style={{ marginLeft: 'auto' }} 
                />
              </Pressable>
              {showTeamMembersPicker && (
                <View style={[styles.dropdownList, { zIndex: 10003, elevation: 25 }]}>
                  {teamMembers.map((member) => (
                    <Pressable
                      key={member.id}
                      style={[
                        styles.dropdownItem,
                        selectedTeamMembers.includes(member.id) && styles.dropdownItemSelected,
                        teamMembers.indexOf(member) === teamMembers.length - 1 && styles.dropdownItemLast
                      ]}
                      onPress={() => toggleTeamMember(member.id)}
                    >
                      <View style={styles.dropdownItemLeft}>
                        <View style={styles.dropdownAvatar}>
                          <Text style={styles.dropdownAvatarText}>{member.initials}</Text>
                        </View>
                        <View style={styles.dropdownItemInfo}>
                          <Text style={[
                            styles.dropdownItemText,
                            selectedTeamMembers.includes(member.id) && styles.dropdownItemTextSelected
                          ]}>
                            {member.name}
                          </Text>
                          <Text style={styles.dropdownItemEmail}>{member.email}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.dropdownCheckbox,
                        selectedTeamMembers.includes(member.id) && styles.dropdownCheckboxChecked
                      ]}>
                        {selectedTeamMembers.includes(member.id) && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.modalActions, { zIndex: 1, position: 'relative' }]}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 250, // Extra padding to ensure dropdowns don't get cut off by action buttons
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 24,
    position: 'relative',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  formGroupHalf: {
    flex: 1,
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.2,
  },
  requiredAsterisk: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 110,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 9999,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dropdownText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    zIndex: 10000,
    elevation: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dropdownAvatarText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownItemInfo: {
    flex: 1,
  },
  dropdownItemEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dropdownCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownCheckboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dateInputText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  teamMembersContainer: {
    gap: 12,
  },
  selectedMembersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  chipAvatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  chipName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563EB',
    marginRight: 4,
  },
  chipRemoveButton: {
    padding: 2,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  addMemberText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 20,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.2,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.2,
  },
});

