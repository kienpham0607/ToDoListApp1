import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createProject, getProjects, deleteProject } from '@/services/projectApi';
import { addProjectMember, getProjectMembers, getAllUsers, getProjectMembersByProjectId } from '@/services/projectMemberApi';

// Initial state
const initialState = {
  projects: [], // All projects (teams)
  projectMembers: [], // All project members
  users: [], // All users (for adding to teams)
  loading: false,
  error: null,
  projectsTotalElements: 0,
  membersTotalElements: 0,
  usersTotalElements: 0,
};

// Async thunk to create a project (team)
export const createNewProject = createAsyncThunk(
  'team/createProject',
  async ({ token, projectData }, { rejectWithValue }) => {
    try {
      console.log('Redux: Creating project (team):', projectData);
      const response = await createProject(token, projectData);
      console.log('Redux: Project created successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Create project error:', error);
      const errorMessage = error.message || 'Không thể tạo project';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Async thunk to fetch projects
export const fetchProjects = createAsyncThunk(
  'team/fetchProjects',
  async ({ token, offset = 0, limit = 1000 }, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching projects, offset:', offset, 'limit:', limit);
      const response = await getProjects(token, offset, limit);
      console.log('Redux: Projects fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Fetch projects error:', error);
      const errorMessage = error.message || 'Không thể tải danh sách projects';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Async thunk to delete a project
export const deleteProjectById = createAsyncThunk(
  'team/deleteProject',
  async ({ token, projectId }, { rejectWithValue }) => {
    try {
      console.log('Redux: Deleting project, ID:', projectId);
      await deleteProject(token, projectId);
      console.log('Redux: Project deleted successfully');
      return projectId;
    } catch (error) {
      console.error('Redux: Delete project error:', error);
      const errorMessage = error.message || 'Could not delete project';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Async thunk to add a member to a project
export const addMemberToProject = createAsyncThunk(
  'team/addMember',
  async ({ token, memberData }, { rejectWithValue }) => {
    try {
      console.log('Redux: Adding member to project:', memberData);
      const response = await addProjectMember(token, memberData);
      console.log('Redux: Member added successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Add member error:', error);
      console.error('Redux: Error status:', error?.status);
      console.error('Redux: Error details:', error?.details);
      const errorMessage = error.message || 'Không thể thêm member vào project';
      const errorDetails = error.details || 'Please try again later';
      // Preserve status and details in rejected value
      return rejectWithValue({ 
        message: errorMessage,
        details: errorDetails,
        status: error.status 
      });
    }
  }
);

// Async thunk to fetch project members
export const fetchProjectMembers = createAsyncThunk(
  'team/fetchProjectMembers',
  async ({ token, offset = 0, limit = 1000 }, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching project members, offset:', offset, 'limit:', limit);
      const response = await getProjectMembers(token, offset, limit);
      console.log('Redux: Project members fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Fetch project members error:', error);
      const errorMessage = error.message || 'Không thể tải danh sách project members';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Async thunk to fetch all users
export const fetchAllUsers = createAsyncThunk(
  'team/fetchAllUsers',
  async ({ token, offset = 0, limit = 1000 }, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching all users, offset:', offset, 'limit:', limit);
      const response = await getAllUsers(token, offset, limit);
      console.log('Redux: Users fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Fetch users error:', error);
      const errorMessage = error.message || 'Không thể tải danh sách users';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Async thunk to fetch project members by project ID
export const fetchProjectMembersByProjectId = createAsyncThunk(
  'team/fetchProjectMembersByProjectId',
  async ({ token, projectId }, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching project members for project ID:', projectId);
      const members = await getProjectMembersByProjectId(token, projectId);
      console.log('Redux: Project members fetched successfully:', members.length);
      return { projectId, members };
    } catch (error) {
      console.error('Redux: Fetch project members by project ID error:', error);
      const errorMessage = error.message || 'Không thể tải danh sách project members';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Team slice
const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.projectsTotalElements = 0;
    },
    clearProjectMembers: (state) => {
      state.projectMembers = [];
      state.membersTotalElements = 0;
    },
    clearUsers: (state) => {
      state.users = [];
      state.usersTotalElements = 0;
    },
  },
  extraReducers: (builder) => {
    // Create project
    builder
      .addCase(createNewProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewProject.fulfilled, (state, action) => {
        state.loading = false;
        const newProject = action.payload;
        console.log('Redux: Project created, adding to state:', newProject);
        console.log('Redux: New project ID:', newProject.id, 'Name:', newProject.name);
        state.projects.unshift(newProject);
        state.projectsTotalElements += 1;
        // Note: Creator member will be added by backend, but we need to fetch projectMembers separately
      })
      .addCase(createNewProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể tạo project' };
      });

    // Fetch projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        const newProjects = response.content || [];
        console.log('Redux: Projects fetched, count:', newProjects.length);
        if (newProjects.length > 0) {
          console.log('Redux: Sample project:', JSON.stringify(newProjects[0], null, 2));
        }
        state.projects = newProjects;
        state.projectsTotalElements = response.totalElements || 0;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể tải danh sách projects' };
      });

    // Add member to project
    builder
      .addCase(addMemberToProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMemberToProject.fulfilled, (state, action) => {
        state.loading = false;
        const newMember = action.payload;
        state.projectMembers.unshift(newMember);
        state.membersTotalElements += 1;
      })
      .addCase(addMemberToProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể thêm member vào project' };
      });

    // Fetch project members
    builder
      .addCase(fetchProjectMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        const newMembers = response.content || [];
        console.log('Redux: Setting projectMembers, count:', newMembers.length);
        if (newMembers.length > 0) {
          console.log('Redux: Sample projectMember:', JSON.stringify(newMembers[0], null, 2));
          console.log('Redux: Sample projectMember.project:', newMembers[0]?.project);
          console.log('Redux: Sample projectMember.project.id:', newMembers[0]?.project?.id);
          console.log('Redux: Sample projectMember.project.name:', newMembers[0]?.project?.name);
        }
        state.projectMembers = newMembers;
        state.membersTotalElements = response.totalElements || 0;
      })
      .addCase(fetchProjectMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể tải danh sách project members' };
      });

    // Fetch all users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        state.users = response.content || [];
        state.usersTotalElements = response.totalElements || 0;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể tải danh sách users' };
      })
      // Delete project
      .addCase(deleteProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProjectById.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.projects = state.projects.filter(project => project.id !== deletedId);
        state.projectsTotalElements = Math.max(0, state.projectsTotalElements - 1);
        // Also remove project members associated with this project
        state.projectMembers = state.projectMembers.filter(member => member.project?.id !== deletedId);
      })
      .addCase(deleteProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể xóa project' };
      })
      // Fetch project members by project ID
      .addCase(fetchProjectMembersByProjectId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectMembersByProjectId.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, members } = action.payload;
        console.log('Redux: fetchProjectMembersByProjectId.fulfilled');
        console.log('Redux: projectId:', projectId);
        console.log('Redux: members received:', members?.length || 0);
        
        if (members && members.length > 0) {
          console.log('Redux: Sample member structure:', JSON.stringify(members[0], null, 2));
          console.log('Redux: Sample member.project:', members[0]?.project);
          console.log('Redux: Sample member.user:', members[0]?.user);
        }
        
        // Replace all projectMembers with members for this specific project
        // Since API returns only members for this project, we replace the entire array
        state.projectMembers = members || [];
        state.membersTotalElements = members?.length || 0;
        console.log('Redux: Updated projectMembers count:', state.projectMembers.length);
        state.error = null;
      })
      .addCase(fetchProjectMembersByProjectId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể tải danh sách project members' };
      });
  },
});

// Selectors
export const selectProjects = (state) => state.team.projects;
export const selectProjectMembers = (state) => state.team.projectMembers;
export const selectUsers = (state) => state.team.users;
export const selectTeamLoading = (state) => state.team.loading;
export const selectTeamError = (state) => state.team.error;

// Actions
export const { clearError, clearProjects, clearProjectMembers, clearUsers } = teamSlice.actions;

// Reducer
export default teamSlice.reducer;

