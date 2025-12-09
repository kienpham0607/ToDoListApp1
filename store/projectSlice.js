import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createProject, getProjects, deleteProject, getProjectById, updateProject } from '@/services/projectApi';

// Initial state
const initialState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  totalElements: 0,
};

// Async thunk to create a project
export const createNewProject = createAsyncThunk(
  'project/createProject',
  async ({ token, projectData }, { rejectWithValue }) => {
    try {
      console.log('Redux: Creating project:', projectData);
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
  'project/fetchProjects',
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

// Async thunk to fetch a project by ID
export const fetchProjectById = createAsyncThunk(
  'project/fetchProjectById',
  async ({ token, projectId }, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching project by ID:', projectId);
      const response = await getProjectById(token, projectId);
      console.log('Redux: Project fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Fetch project by ID error:', error);
      const errorMessage = error.message || 'Không thể tải project';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Async thunk to update a project
export const updateProjectById = createAsyncThunk(
  'project/updateProject',
  async ({ token, projectId, projectData }, { rejectWithValue }) => {
    try {
      console.log('Redux: Updating project:', projectId, projectData);
      const response = await updateProject(token, projectId, projectData);
      console.log('Redux: Project updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Redux: Update project error:', error);
      const errorMessage = error.message || 'Không thể cập nhật project';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Async thunk to delete a project
export const deleteProjectById = createAsyncThunk(
  'project/deleteProject',
  async ({ token, projectId }, { rejectWithValue }) => {
    try {
      console.log('Redux: Deleting project:', projectId);
      await deleteProject(token, projectId);
      console.log('Redux: Project deleted successfully');
      return projectId;
    } catch (error) {
      console.error('Redux: Delete project error:', error);
      const errorMessage = error.message || 'Không thể xóa project';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Project slice
const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.totalElements = 0;
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
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
        state.projects.unshift(newProject);
        state.totalElements += 1;
        state.error = null;
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
        state.projects = response.content || [];
        state.totalElements = response.totalElements || 0;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể tải danh sách projects' };
      });

    // Fetch project by ID
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
        state.error = null;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể tải project' };
      });

    // Update project
    builder
      .addCase(updateProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectById.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProject = action.payload;
        const index = state.projects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
          state.projects[index] = updatedProject;
        }
        if (state.selectedProject && state.selectedProject.id === updatedProject.id) {
          state.selectedProject = updatedProject;
        }
        state.error = null;
      })
      .addCase(updateProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể cập nhật project' };
      });

    // Delete project
    builder
      .addCase(deleteProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProjectById.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.projects = state.projects.filter(project => project.id !== deletedId);
        state.totalElements = Math.max(0, state.totalElements - 1);
        if (state.selectedProject && state.selectedProject.id === deletedId) {
          state.selectedProject = null;
        }
        state.error = null;
      })
      .addCase(deleteProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Không thể xóa project' };
      });
  },
});

// Export actions
export const { clearError, clearProjects, setSelectedProject, clearSelectedProject } = projectSlice.actions;

// Export selectors
export const selectProjects = (state) => state.project.projects;
export const selectSelectedProject = (state) => state.project.selectedProject;
export const selectProjectLoading = (state) => state.project.loading;
export const selectProjectError = (state) => state.project.error;
export const selectProjectTotalElements = (state) => state.project.totalElements;

// Export reducer
export default projectSlice.reducer;

