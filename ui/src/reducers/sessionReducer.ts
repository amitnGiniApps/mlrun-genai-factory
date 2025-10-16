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
import { ChatHistory } from '@shared/types'
import { Session } from '@shared/types/session'

interface SessionsState {
  sessions: Session[]
  selectedSession: Session | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: SessionsState = {
  sessions: [],
  selectedSession: null,
  status: 'idle',
  error: null
}

export const fetchSessions = createAsyncThunk<
  Session[],
  string,
  { rejectValue: string }
>('sessions/fetchSessions', async (username, { rejectWithValue }) => {
  try {
    const sessionsResponse = await Client.getSessions(username)
    if (!sessionsResponse || sessionsResponse.error) {
      return rejectWithValue('Failed to fetch sessions')
    }

    return sessionsResponse.data.sort((a: Session, b: Session) => {
      const dateA = new Date(a.created as string)
      const dateB = new Date(b.created as string)
      return dateA.getTime() - dateB.getTime()
    })
  } catch {
    return rejectWithValue('Network error')
  }
})

export const createSession = createAsyncThunk<
  Session,
  { username: string; ownerId: string },
  { rejectValue: string }
>('sessions/createSession', async ({ ownerId, username }, { rejectWithValue }) => {
  try {
    const sessionData = {
      name: 'default2',
      description: '* New Chat',
      workflow_id: 'default',
      labels: {},
      owner_id: ownerId
    }

    const newSessionResponse = await Client.createSession(username, sessionData)

    if (!newSessionResponse || newSessionResponse.error) {
      return rejectWithValue('Failed to create session')
    }

    return newSessionResponse.data
  } catch {
    return rejectWithValue('Network error')
  }
})

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    setSessions(state, action: PayloadAction<Session[]>) {
      state.sessions = action.payload
    },
    setSelectedSession(state, action: PayloadAction<Session>) {
      state.selectedSession = action.payload
    },
    clearSessions(state) {
      state.sessions = []
      state.selectedSession = null
      state.status = 'idle'
      state.error = null
    },
    addSession(state, action: PayloadAction<Session>) {
      state.sessions.push(action.payload)
    },
    addMessage(
      state,
      action: PayloadAction<{ sessionId: string; message: ChatHistory }>
    ) {
      const { message, sessionId } = action.payload

      const session = state.sessions.find(s => s.uid === sessionId)
      if (session) {
        if (!session.history) {
          session.history = []
        }
        session.history.push(message)
      }

      // Update in selectedSession if it matches
      if (state.selectedSession?.uid === sessionId) {
        if (!state.selectedSession.history) {
          state.selectedSession.history = []
        }
        state.selectedSession.history.push(message)
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSessions.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSessions.fulfilled, (state, action: PayloadAction<Session[]>) => {
        state.status = 'idle'
        state.sessions = action.payload
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to fetch sessions'
      })
      .addCase(createSession.fulfilled, (state, action: PayloadAction<Session>) => {
        state.sessions.push(action.payload)
        state.selectedSession = action.payload
      })
  }
})

export const { addMessage, addSession, clearSessions, setSelectedSession, setSessions } = sessionsSlice.actions
export default sessionsSlice.reducer
