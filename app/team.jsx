import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { 
  fetchProjects, 
  fetchProjectMembers, 
  fetchAllUsers,
  addMemberToProject,
  createNewProject,
  deleteProjectById,
  selectProjects,
  selectProjectMembers,
  selectUsers,
  selectTeamLoading,
  selectTeamError,
  clearError
} from '@/store/teamSlice';
import { selectToken, selectIsAuthenticated } from '@/store/authSlice';

export default function TeamScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const projects = useSelector(selectProjects);
  const projectMembers = useSelector(selectProjectMembers);
  const users = useSelector(selectUsers);
  const loading = useSelector(selectTeamLoading);
  const error = useSelector(selectTeamError);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showTeamDetailModal, setShowTeamDetailModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Form states for adding member
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  
  // Form states for creating team
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  // Fetch data when component mounts or when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('Team: Fetching initial data...');
      dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));
      dispatch(fetchProjectMembers({ token, offset: 0, limit: 1000 }));
      dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));
    }
  }, [isAuthenticated, token, dispatch]);

  // Debug: Log when projects or projectMembers change
  useEffect(() => {
    console.log('Team: projects changed:', projects?.length || 0);
    if (projects && projects.length > 0) {
      console.log('Team: Sample project:', {
        id: projects[0].id,
        name: projects[0].name,
        idType: typeof projects[0].id
      });
    }
  }, [projects]);

  useEffect(() => {
    console.log('Team: projectMembers changed:', projectMembers?.length || 0);
    if (projectMembers && projectMembers.length > 0) {
      console.log('Team: Sample projectMember:', {
        id: projectMembers[0].id,
        projectId: projectMembers[0].project?.id,
        projectName: projectMembers[0].project?.name,
        projectIdType: typeof projectMembers[0].project?.id,
        userId: projectMembers[0].user?.id,
        username: projectMembers[0].user?.username
      });
    }
  }, [projectMembers]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && token) {
        console.log('Team: Screen focused, refreshing data...');
        dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));
        dispatch(fetchProjectMembers({ token, offset: 0, limit: 1000 }));
        dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));
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

  // Debug: Log when selectedProject changes
  useEffect(() => {
    console.log('selectedProject changed:', selectedProject);
  }, [selectedProject]);

  // Debug: Log when selectedUser changes
  useEffect(() => {
    console.log('selectedUser changed:', selectedUser);
  }, [selectedUser]);

  // Refresh project members when team detail modal opens
  useEffect(() => {
    if (showTeamDetailModal && selectedTeam && token) {
      console.log('Team detail modal opened, refreshing project members for team:', selectedTeam.name, 'ID:', selectedTeam.id);
      dispatch(fetchProjectMembers({ token, offset: 0, limit: 1000 }));
      dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));
    }
  }, [showTeamDetailModal, selectedTeam, token, dispatch]);

  // Get members for selected team
  const selectedTeamMembers = useMemo(() => {
    if (!selectedTeam || !projectMembers || !users) {
      console.log('selectedTeamMembers: Missing data', {
        selectedTeam: !!selectedTeam,
        projectMembers: projectMembers?.length || 0,
        users: users?.length || 0
      });
      return [];
    }
    
    console.log('selectedTeamMembers: Computing members for team:', selectedTeam.id, selectedTeam.name);
    console.log('selectedTeamMembers: Team ID type:', typeof selectedTeam.id);
    console.log('selectedTeamMembers: Total projectMembers:', projectMembers.length);
    console.log('selectedTeamMembers: Total users:', users.length);
    
    // Debug: Log first few projectMembers to see structure
    if (projectMembers.length > 0) {
      console.log('selectedTeamMembers: Sample projectMember structure:', {
        memberId: projectMembers[0].id,
        projectId: projectMembers[0].project?.id,
        projectIdType: typeof projectMembers[0].project?.id,
        projectName: projectMembers[0].project?.name,
        projectFull: projectMembers[0].project
      });
    }
    
    // Filter members by project ID or project name (fallback)
    // Handle both string and number types for IDs
    const teamId = selectedTeam.id;
    const teamName = selectedTeam.name;
    
    const teamMembersList = projectMembers
      .filter(member => {
        const memberProjectId = member.project?.id;
        const memberProjectName = member.project?.name;
        
        // Convert both to strings for comparison to handle type mismatches
        const matchesById = String(memberProjectId) === String(teamId) || memberProjectId === teamId;
        const matchesByName = memberProjectName === teamName;
        
        if (matchesById || matchesByName) {
          console.log('selectedTeamMembers: Found matching member:', {
            memberId: member.id,
            userId: member.user?.id,
            projectId: memberProjectId,
            projectIdType: typeof memberProjectId,
            projectName: memberProjectName,
            teamId: teamId,
            teamIdType: typeof teamId,
            teamName: teamName,
            matchesById,
            matchesByName
          });
        } else {
          // Log first few non-matching members for debugging
          if (projectMembers.indexOf(member) < 3) {
            console.log('selectedTeamMembers: Non-matching member:', {
              memberId: member.id,
              projectId: memberProjectId,
              projectIdType: typeof memberProjectId,
              projectName: memberProjectName,
              teamId: teamId,
              teamIdType: typeof teamId,
              teamName: teamName,
              idMatch: String(memberProjectId) === String(teamId),
              nameMatch: memberProjectName === teamName
            });
          }
        }
        
        return matchesById || matchesByName;
      })
      .map(member => {
        const user = users.find(u => u.id === member.user?.id) || member.user;
        const colors = ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'];
        const avatarColor = colors[(member.user?.id || 0) % colors.length];
        
        return {
          id: member.id,
          userId: member.user?.id,
          name: user?.fullName || user?.username || 'Unknown',
          email: user?.email || '',
          initials: (user?.fullName || user?.username || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          avatarColor: avatarColor,
          joinedAt: member.joinedAt,
        };
      });
    
    console.log('selectedTeamMembers: Final count:', teamMembersList.length);
    if (teamMembersList.length === 0) {
      console.log('selectedTeamMembers: No members found. Checking all projectMembers...');
      projectMembers.slice(0, 5).forEach((member, index) => {
        console.log(`selectedTeamMembers: projectMember[${index}]:`, {
          memberId: member.id,
          projectId: member.project?.id,
          projectIdType: typeof member.project?.id,
          projectName: member.project?.name,
          projectFull: JSON.stringify(member.project)
        });
      });
    }
    return teamMembersList;
  }, [selectedTeam, projectMembers, users]);

  // Get member count for each team
  const teamsWithMemberCount = useMemo(() => {
    if (!projects || !projectMembers) {
      console.log('teamsWithMemberCount: Missing data', {
        projects: projects?.length || 0,
        projectMembers: projectMembers?.length || 0
      });
      return [];
    }
    
    console.log('teamsWithMemberCount: Computing member counts');
    console.log('teamsWithMemberCount: Total projects:', projects.length);
    console.log('teamsWithMemberCount: Total projectMembers:', projectMembers.length);
    
    // Debug: Log first few projectMembers to see structure
    if (projectMembers.length > 0) {
      console.log('teamsWithMemberCount: Sample projectMember:', JSON.stringify(projectMembers[0], null, 2));
      console.log('teamsWithMemberCount: Sample projectMember.project:', projectMembers[0]?.project);
      console.log('teamsWithMemberCount: Sample projectMember.project.id:', projectMembers[0]?.project?.id);
      console.log('teamsWithMemberCount: Sample projectMember.project.name:', projectMembers[0]?.project?.name);
    }
    
    // Debug: Log first few projects
    if (projects.length > 0) {
      console.log('teamsWithMemberCount: Sample project:', JSON.stringify(projects[0], null, 2));
      console.log('teamsWithMemberCount: Sample project.id:', projects[0]?.id);
      console.log('teamsWithMemberCount: Sample project.name:', projects[0]?.name);
    }
    
    return projects.map(team => {
      // Filter members by project ID or project name (fallback)
      // Handle both string and number types for IDs
      const teamId = team.id;
      const teamName = team.name;
      
      const matchingMembers = projectMembers.filter(member => {
        const memberProjectId = member.project?.id;
        const memberProjectName = member.project?.name;
        
        // Convert both to strings for comparison to handle type mismatches
        const matchesById = String(memberProjectId) === String(teamId) || memberProjectId === teamId;
        const matchesByName = memberProjectName === teamName;
        
        if (matchesById || matchesByName) {
          console.log(`teamsWithMemberCount: Found matching member for team "${team.name}":`, {
            memberId: member.id,
            memberProjectId,
            memberProjectIdType: typeof memberProjectId,
            memberProjectName,
            teamId,
            teamIdType: typeof teamId,
            teamName,
            matchesById,
            matchesByName
          });
        }
        
        return matchesById || matchesByName;
      });
      
      const memberCount = matchingMembers.length;
      
      if (memberCount > 0) {
        console.log(`teamsWithMemberCount: Team "${team.name}" (ID: ${teamId}, type: ${typeof teamId}) has ${memberCount} members`);
        console.log(`teamsWithMemberCount: Matching members:`, matchingMembers.map(m => ({
          memberId: m.id,
          projectId: m.project?.id,
          projectName: m.project?.name
        })));
      } else {
        console.log(`teamsWithMemberCount: Team "${team.name}" (ID: ${teamId}, type: ${typeof teamId}) has 0 members`);
      }
      
      return {
        ...team,
        memberCount,
      };
    });
  }, [projects, projectMembers]);

  // Filter teams by search query (applied to teamsWithMemberCount)
  const filteredTeamsWithCount = useMemo(() => {
    if (!teamsWithMemberCount) return [];
    if (!searchQuery) return teamsWithMemberCount;
    
    const query = searchQuery.toLowerCase();
    return teamsWithMemberCount.filter(team =>
      team.name?.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query)
    );
  }, [teamsWithMemberCount, searchQuery]);

  // Handle create team
  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a team name',
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
        text2: 'You must be logged in to create a team',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    try {
      const projectData = {
        name: teamName.trim(),
        description: teamDescription.trim() || null,
      };

      const createdProject = await dispatch(createNewProject({
        token,
        projectData,
      })).unwrap();

      console.log('Team created successfully:', createdProject);
      console.log('Team created - Project ID:', createdProject.id, 'Name:', createdProject.name);

      setTeamName('');
      setTeamDescription('');
      setShowCreateTeamModal(false);

      // Wait a bit to ensure backend has finished adding creator as member
      console.log('Waiting 500ms before refreshing data...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh projects and project members to show the new team with creator as member
      console.log('Refreshing data after team creation...');
      console.log('Step 1: Fetching projects...');
      const projectsResult = await dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));
      console.log('Step 1 completed. Projects:', projectsResult.payload?.content?.length || 0);
      
      console.log('Step 2: Fetching project members...');
      const membersResult = await dispatch(fetchProjectMembers({ token, offset: 0, limit: 1000 }));
      console.log('Step 2 completed. Project members:', membersResult.payload?.content?.length || 0);
      if (membersResult.payload?.content && membersResult.payload.content.length > 0) {
        console.log('Step 2: Sample projectMember:', JSON.stringify(membersResult.payload.content[0], null, 2));
        // Check if any member belongs to the new project
        const newProjectMembers = membersResult.payload.content.filter(m => 
          String(m.project?.id) === String(createdProject.id) || m.project?.name === createdProject.name
        );
        console.log('Step 2: Members for new project:', newProjectMembers.length);
        newProjectMembers.forEach((m, idx) => {
          console.log(`Step 2: Member ${idx}:`, {
            memberId: m.id,
            projectId: m.project?.id,
            projectName: m.project?.name,
            userId: m.user?.id,
            username: m.user?.username
          });
        });
      }
      
      console.log('Step 3: Fetching users...');
      await dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));
      console.log('Step 3 completed');
      
      console.log('Data refresh completed');

      Toast.show({
        type: 'success',
        text1: 'Team Created',
        text2: `"${teamName.trim()}" has been created successfully`,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (error) {
      console.error('Failed to create team:', error);
      // Error will be handled by useEffect watching error
    }
  };

  // Handle delete team
  const handleDeleteTeam = (team) => {
    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!token) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'You must be logged in to delete a team',
                position: 'top',
                visibilityTime: 3000,
                topOffset: 60,
              });
              return;
            }

            try {
              await dispatch(deleteProjectById({
                token,
                projectId: team.id,
              })).unwrap();

              // Refresh data
              await dispatch(fetchProjects({ token, offset: 0, limit: 1000 }));
              await dispatch(fetchProjectMembers({ token, offset: 0, limit: 1000 }));

              // Close team detail modal if it was open for this team
              if (selectedTeam && selectedTeam.id === team.id) {
                setShowTeamDetailModal(false);
                setSelectedTeam(null);
              }

              Toast.show({
                type: 'success',
                text1: 'Team Deleted',
                text2: `"${team.name}" has been deleted successfully`,
                position: 'top',
                visibilityTime: 3000,
                topOffset: 60,
              });
            } catch (error) {
              console.error('Failed to delete team:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.message || 'Failed to delete team',
                position: 'top',
                visibilityTime: 3000,
                topOffset: 60,
              });
            }
          },
        },
      ]
    );
  };

  // Handle add member to team
  const handleAddMember = async () => {
    console.log('handleAddMember called');
    console.log('selectedProject:', selectedProject);
    console.log('selectedUser:', selectedUser);
    console.log('token present:', !!token);

    if (!selectedProject) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a team',
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

    // Check if user is already in the team
    const isAlreadyMember = projectMembers.some(
      member => member.project?.name === selectedProject && member.user?.username === selectedUser
    );

    if (isAlreadyMember) {
      Toast.show({
        type: 'error',
        text1: 'Already Member',
        text2: 'This user is already a member of this team',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    try {
      // Validate project name exists in projects list
      const project = projects.find(p => p.name === selectedProject);
      if (!project) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Selected team not found. Please refresh and try again.',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 60,
        });
        return;
      }

      // Validate user exists in users list
      const user = users.find(u => u.username === selectedUser);
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Selected user not found. Please refresh and try again.',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 60,
        });
        return;
      }

      const memberData = {
        projectName: selectedProject.trim(),
        memberName: selectedUser.trim(),
      };

      console.log('Dispatching addMemberToProject with:', { 
        token: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
        memberData,
        project: project,
        user: user
      });

      const result = await dispatch(addMemberToProject({
        token,
        memberData,
      })).unwrap();

      console.log('Add member result:', result);

      setSelectedProject('');
      setSelectedUser('');
      setShowAddMemberModal(false);

      // Refresh project members to update the team detail modal
      await dispatch(fetchProjectMembers({ token, offset: 0, limit: 1000 }));
      
      // Also refresh users to ensure we have latest user data
      await dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));

      // If team detail modal was open, refresh it to show new member
      if (showTeamDetailModal && selectedTeam) {
        console.log('Team detail modal is open, refreshing selectedTeam to trigger re-render');
        // Force refresh by updating selectedTeam reference
        const teamToRefresh = { ...selectedTeam };
        setSelectedTeam(null);
        setTimeout(() => {
          setSelectedTeam(teamToRefresh);
        }, 100);
      }

      Toast.show({
        type: 'success',
        text1: 'Member Added',
        text2: 'Member has been added to team successfully',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (error) {
      console.error('Failed to add member - Full error:', error);
      console.error('Error object keys:', Object.keys(error || {}));
      
      // When using .unwrap(), rejectWithValue data is in error object directly, not error.payload
      // Check both error object and error.payload for compatibility
      const errorData = error?.payload || error;
      const errorStatus = errorData?.status || error?.status;
      let errorMessage = errorData?.message || error?.message || 'Failed to add member to team';
      let errorDetails = errorData?.details || error?.details;
      
      console.error('Error status:', errorStatus);
      console.error('Error message:', errorMessage);
      console.error('Error details:', errorDetails);
      
      // Handle specific error cases based on status
      if (errorStatus === 404) {
        errorMessage = 'Team or user not found';
        errorDetails = 'Please check that the team name and username are correct';
      } else if (errorStatus === 401) {
        errorMessage = 'Authentication failed';
        errorDetails = 'Your session has expired. Please login again';
      } else if (errorStatus === 403) {
        errorMessage = 'Access denied';
        errorDetails = 'Your token may be invalid or expired. Please login again';
      } else if (errorStatus === 400) {
        // Check for duplicate member error
        if (errorMessage.includes('already') || 
            errorMessage.includes('existed') || 
            errorMessage.includes('THIS_PERSON_DOES_NOT_BELONG_TO_THE_PROJECT')) {
          errorMessage = 'User is already a member of this team';
          errorDetails = errorDetails || 'This user has already been added to the team';
        } else {
          errorMessage = errorMessage || 'Invalid request';
          errorDetails = errorDetails || 'Please check your input';
        }
      } else if (errorMessage.includes('already') || errorMessage.includes('existed')) {
        errorMessage = 'User is already a member of this team';
        errorDetails = errorDetails || 'This user has already been added to the team';
      } else if (!errorStatus && errorMessage === 'Access denied') {
        // Fallback: if message is "Access denied" but no status, assume 403
        errorMessage = 'Access denied';
        errorDetails = 'Your token may be invalid or expired. Please login again';
      }
      
      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: errorDetails || 'Please try again',
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
        <Text style={styles.headerTitle}>Team Management</Text>
        <View style={styles.headerButtons}>
          <Pressable style={styles.createTeamButton} onPress={() => setShowCreateTeamModal(true)}>
            <Ionicons name="people" size={18} color="#fff" />
            <Text style={styles.createTeamButtonText}>New Team</Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Team Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{projects.length}</Text>
          <Text style={styles.statLabel}>Total Teams</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {projectMembers.length}
          </Text>
          <Text style={styles.statLabel}>Total Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.length}
          </Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
      </View>

      {/* Teams List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Teams</Text>
        </View>
        
        {loading && projects.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading teams...</Text>
          </View>
        ) : filteredTeamsWithCount.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No teams found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try adjusting your search' 
                : 'Create your first team to get started'}
            </Text>
          </View>
        ) : (
          filteredTeamsWithCount.map((team) => {
            return (
              <Pressable
                key={team.id}
                style={styles.teamCard}
                onPress={async () => {
                  console.log('Team clicked:', team.name, 'ID:', team.id, 'Member count:', team.memberCount);
                  
                  // Refresh project members before opening modal to ensure we have latest data
                  if (token) {
                    console.log('Refreshing project members before opening team detail...');
                    await dispatch(fetchProjectMembers({ token, offset: 0, limit: 1000 }));
                    await dispatch(fetchAllUsers({ token, offset: 0, limit: 1000 }));
                    console.log('Project members refreshed');
                  }
                  
                  setSelectedTeam(team);
                  setShowTeamDetailModal(true);
                }}
              >
                <View style={styles.teamCardHeader}>
                  <View style={styles.teamIcon}>
                    <Ionicons name="people" size={24} color="#2563EB" />
                  </View>
                  <View style={styles.teamCardInfo}>
                    <Text style={styles.teamCardName}>{team.name || 'Untitled Team'}</Text>
                    {team.description && (
                      <Text style={styles.teamCardDescription} numberOfLines={2}>
                        {team.description}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
                
                <View style={styles.teamCardFooter}>
                  <View style={styles.teamCardStats}>
                    <Ionicons name="people-outline" size={16} color="#6B7280" />
                    <Text style={styles.teamCardStatText}>
                      {team.memberCount || 0} {(team.memberCount || 0) === 1 ? 'member' : 'members'}
                    </Text>
                  </View>
                  {team.startDate && (
                    <View style={styles.teamCardStats}>
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text style={styles.teamCardStatText}>
                        {new Date(team.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Create Team Modal */}
      <Modal
        visible={showCreateTeamModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateTeamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Team</Text>
              <Pressable onPress={() => setShowCreateTeamModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Team Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter team name"
                  placeholderTextColor="#9CA3AF"
                  value={teamName}
                  onChangeText={setTeamName}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter team description (optional)"
                  placeholderTextColor="#9CA3AF"
                  value={teamDescription}
                  onChangeText={setTeamDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.modalActions}>
                <Pressable 
                  style={styles.cancelButton}
                  onPress={() => {
                    setTeamName('');
                    setTeamDescription('');
                    setShowCreateTeamModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.createButton, (!teamName.trim() || loading) && styles.createButtonDisabled]}
                  onPress={handleCreateTeam}
                  disabled={!teamName.trim() || loading}
                >
                  <Text style={styles.createButtonText}>
                    {loading ? 'Creating...' : 'Create Team'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Team Detail Modal - Manage Members */}
      <Modal
        visible={showTeamDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowTeamDetailModal(false);
          setSelectedTeam(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalTeamIcon}>
                  <Ionicons name="people" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>{selectedTeam?.name || 'Team'}</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedTeamMembers.length} {selectedTeamMembers.length === 1 ? 'member' : 'members'}
                  </Text>
                </View>
              </View>
              <View style={styles.modalHeaderRight}>
                <Pressable 
                  style={styles.deleteTeamButton}
                  onPress={() => {
                    if (selectedTeam) {
                      handleDeleteTeam(selectedTeam);
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </Pressable>
                <Pressable onPress={() => {
                  setShowTeamDetailModal(false);
                  setSelectedTeam(null);
                }}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Members List */}
              <View style={styles.formGroup}>
                <View style={styles.membersListHeader}>
                  <Text style={styles.label}>Team Members</Text>
                  <Pressable 
                    style={styles.addMemberInlineButton}
                    onPress={() => {
                      if (selectedTeam) {
                        console.log('Opening add member modal from team detail');
                        console.log('Selected team:', selectedTeam);
                        console.log('Team name:', selectedTeam.name);
                        console.log('Team ID:', selectedTeam.id);
                        
                        // Set the project name first
                        setSelectedProject(selectedTeam.name);
                        setSelectedUser(''); // Reset selected user
                        
                        // Close team detail modal and open add member modal
                        setShowTeamDetailModal(false);
                        
                        // Small delay to ensure state is updated
                        setTimeout(() => {
                          console.log('Opening add member modal, selectedProject:', selectedTeam.name);
                          setShowAddMemberModal(true);
                        }, 150);
                      }
                    }}
                  >
                    <Ionicons name="person-add" size={16} color="#2563EB" />
                    <Text style={styles.addMemberInlineButtonText}>Add</Text>
                  </Pressable>
                </View>
                
                {loading && selectedTeamMembers.length === 0 ? (
                  <View style={styles.emptyMembersContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.emptyMembersText}>Loading members...</Text>
                  </View>
                ) : selectedTeamMembers.length === 0 ? (
                  <View style={styles.emptyMembersContainer}>
                    <Ionicons name="people-outline" size={32} color="#9CA3AF" />
                    <Text style={styles.emptyMembersText}>No members yet</Text>
                    <Text style={styles.emptyMembersSubtext}>Add members to this team</Text>
                  </View>
                ) : (
                  <View style={styles.membersList}>
                    {selectedTeamMembers.map((member, index) => (
                      <View key={member.id || member.userId || `member-${index}`} style={styles.memberListItem}>
                        <View style={styles.memberListItemLeft}>
                          <View style={[styles.memberListItemAvatar, { backgroundColor: member.avatarColor }]}>
                            <Text style={styles.memberListItemAvatarText}>{member.initials}</Text>
                          </View>
                          <View style={styles.memberListItemInfo}>
                            <Text style={styles.memberListItemName}>{member.name}</Text>
                            <Text style={styles.memberListItemEmail}>{member.email || 'No email'}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddMemberModal(false);
          setSelectedProject('');
          setSelectedUser('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Member to Team</Text>
              <Pressable onPress={() => {
                setShowAddMemberModal(false);
                setSelectedProject('');
                setSelectedUser('');
              }}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Team *</Text>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {projects.length === 0 ? (
                    <View style={styles.emptyDropdown}>
                      <Text style={styles.emptyDropdownText}>No teams available. Create a team first.</Text>
                    </View>
                  ) : (
                    projects.map((project) => (
                      <Pressable
                        key={project.id}
                        style={[
                          styles.dropdownOption,
                          selectedProject === project.name && styles.dropdownOptionSelected
                        ]}
                        onPress={() => setSelectedProject(project.name)}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          selectedProject === project.name && styles.dropdownOptionTextSelected
                        ]}>
                          {project.name}
                        </Text>
                        {selectedProject === project.name && (
                          <Ionicons name="checkmark" size={20} color="#2563EB" />
                        )}
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Member *</Text>
                {selectedProject && (
                  <Text style={styles.selectedTeamHint}>
                    Adding to: <Text style={styles.selectedTeamName}>{selectedProject}</Text>
                  </Text>
                )}
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {users.length === 0 ? (
                    <View style={styles.emptyDropdown}>
                      <Text style={styles.emptyDropdownText}>No users available. Loading...</Text>
                    </View>
                  ) : (
                    users.map((user) => {
                      // Check if user is already in selected team
                      const isAlreadyMember = selectedProject && projectMembers.some(
                        member => member.project?.name === selectedProject && member.user?.username === user.username
                      );
                      
                      return (
                        <Pressable
                          key={user.id}
                          style={[
                            styles.dropdownOption,
                            selectedUser === user.username && styles.dropdownOptionSelected,
                            isAlreadyMember && styles.dropdownOptionDisabled
                          ]}
                          onPress={() => {
                            if (!isAlreadyMember) {
                              console.log('Selected user:', user.username, 'for team:', selectedProject);
                              setSelectedUser(user.username);
                            } else {
                              console.log('User already in team:', user.username);
                            }
                          }}
                          disabled={isAlreadyMember}
                        >
                          <View style={styles.userOption}>
                            <View style={styles.userOptionInfo}>
                              <Text style={[
                                styles.dropdownOptionText,
                                selectedUser === user.username && styles.dropdownOptionTextSelected,
                                isAlreadyMember && styles.dropdownOptionTextDisabled
                              ]}>
                                {user.fullName || user.username}
                                {isAlreadyMember && ' (Already in team)'}
                              </Text>
                              <Text style={styles.userEmail}>{user.email}</Text>
                            </View>
                            {selectedUser === user.username && !isAlreadyMember && (
                              <Ionicons name="checkmark" size={20} color="#2563EB" />
                            )}
                            {isAlreadyMember && (
                              <Ionicons name="checkmark-circle" size={20} color="#9CA3AF" />
                            )}
                          </View>
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
              </View>
              <View style={styles.modalActions}>
                <Pressable 
                  style={styles.cancelButton}
                  onPress={() => {
                    setSelectedProject('');
                    setSelectedUser('');
                    setShowAddMemberModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.createButton, (!selectedProject || !selectedUser || loading) && styles.createButtonDisabled]}
                  onPress={handleAddMember}
                  disabled={!selectedProject || !selectedUser || loading}
                >
                  <Text style={styles.createButtonText}>
                    {loading ? 'Adding...' : 'Add Member'}
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
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  createTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createTeamButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    padding: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  addMemberButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
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
    color: '#374151',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  memberProjects: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  projectsLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  projectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  projectTagText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  noProjectsText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  memberFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
  dropdownScroll: {
    maxHeight: 200,
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
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamCardInfo: {
    flex: 1,
  },
  teamCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  teamCardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  teamCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  teamCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamCardStatText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteTeamButton: {
    padding: 4,
  },
  modalTeamIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E0ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  membersListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addMemberInlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  addMemberInlineButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyMembersContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMembersText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  emptyMembersSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  membersList: {
    gap: 8,
  },
  memberListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberListItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberListItemAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  memberListItemInfo: {
    flex: 1,
  },
  memberListItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  memberListItemEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  memberListItemRight: {
    alignItems: 'flex-end',
  },
  memberRoleBadge: {
    backgroundColor: '#E0ECFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberRoleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  dropdownOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  dropdownOptionTextDisabled: {
    color: '#9CA3AF',
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
});
