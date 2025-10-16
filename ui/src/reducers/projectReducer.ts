// Copyright 2024 Iguazio
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import Client from '@services/Api'
import { Project } from '@shared/types/project'

interface ProjectsState {
  projects: Project[]
  selectedProject: Project | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  status: 'idle',
  error: null
}

export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>('projects/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    const projectsResponse = await Client.getProjects()
    if (!projectsResponse || projectsResponse.error) {
      return rejectWithValue('Failed to fetch projects')
    }
    return projectsResponse.data
  } catch {
    return rejectWithValue('Network error')
  }
})

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.projects = action.payload
    },
    clearProjects(state) {
      state.projects = []
      state.selectedProject = null
      state.status = 'idle'
      state.error = null
    },
    setSelectedProject(state, action: PayloadAction<Project | null>) {
      state.selectedProject = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProjects.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.status = 'idle'
        state.projects = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to fetch projects'
      })
  }
})

export const { clearProjects, setProjects, setSelectedProject } = projectsSlice.actions
export default projectsSlice.reducer
