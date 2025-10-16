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

import { NavigateFunction } from 'react-router-dom'

import { createAsyncThunk,createSlice, PayloadAction } from '@reduxjs/toolkit'
import Client from '@services/Api'
import { User } from '@shared/types'

import { createSession, fetchSessions } from './sessionReducer'

import { AppDispatch, RootState } from '@store'

export interface AuthState {
  username: string
  admin: boolean
  publicUser: User | null
  token: string | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

export const login = createAsyncThunk<
  void,
  { username: string; password: string; admin: boolean; navigate: NavigateFunction },
  { dispatch: AppDispatch; state: RootState; rejectValue: string }
>('auth/login', async ({ admin, navigate, username }, { dispatch, rejectWithValue }) => {
  try {
    // TODO: fake token for now (replace with API call later if needed)
    const token = 'dummyToken'
    localStorage.setItem('user', JSON.stringify({ username, admin, token }))

    const userResponse = await Client.getUser(username)
    if (!userResponse || userResponse.error) {
      return rejectWithValue('Failed to fetch user')
    }

    dispatch(setUsername(username))
    dispatch(setAdmin(admin))
    dispatch(setToken(token))
    dispatch(setPublicUser(userResponse.data))

    if (admin) {
      navigate('/projects')
      return
    }

    const sessions = await dispatch(fetchSessions(username)).unwrap()
    if (sessions && sessions.length > 0) {
      navigate(`/chat/${sessions[0].uid}`)
    } else {
      const newSession = await dispatch(createSession({ username, ownerId: userResponse.data.uid })).unwrap()
      navigate(`/chat/${newSession.uid}`)
    }
  } catch (error) {
    console.error('Failed to fetch models:', error);
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: () => {
    const stored = localStorage.getItem('user')
    const parsed: User | undefined = stored ? JSON.parse(stored): undefined
    return {
      username: parsed?.username || '',
      admin: parsed?.admin || false,
      token: parsed?.token || null,
      publicUser: null,
      status: 'idle',
      error: null,
    } as AuthState
  },
  reducers: {
    logout(state) {
      state.username = ''
      state.admin = false
      state.publicUser = null
      state.token = null
      state.status = 'idle'
      state.error = null
      localStorage.removeItem('user')
    },
    setUsername(state, action: PayloadAction<string>) {
      state.username = action.payload
    },
    setPublicUser(state, action: PayloadAction<User>) {
      state.publicUser = action.payload
    },
    setAdmin(state, action: PayloadAction<boolean>) {
      state.admin = action.payload
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, state => {
        state.status = 'idle'
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Login failed'
      })
  },
})

export const { logout, setAdmin, setPublicUser, setToken, setUsername } = authSlice.actions
export default authSlice.reducer

