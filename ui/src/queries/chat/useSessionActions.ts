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

import Client from '@services/Api';
import { APIResponse } from '@shared/types';
import { Session } from '@shared/types/session';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useSessionActions(username?: string) {
  const queryClient = useQueryClient();

  const invalidateSessions = async () => {
    if (username) {
      await queryClient.invalidateQueries({ queryKey: ['sessions', username] });
    }
  };

  const validateApiResponse = async (apiCall: Promise<APIResponse>) => {
    const response = await apiCall;
    if (!response.success) {
      throw new Error(response.error || 'API request failed');
    }
    return response.data;
  };

  const createSession = useMutation({
    mutationFn: (session: Session) => {
      if (!username)
        throw new Error('Username is required to create a session.');
      return validateApiResponse(Client.createSession(username, session));
    },
    onSuccess: invalidateSessions,
  });

  const updateSession = useMutation({
    mutationFn: (session: Session) => {
      if (!username)
        throw new Error('Username is required to update a session.');
      return validateApiResponse(Client.updateSession(username, session));
    },
    onSuccess: invalidateSessions,
  });

  const deleteSession = useMutation({
    mutationFn: (sessionName: string) => {
      if (!username)
        throw new Error('Username is required to delete a session.');
      return validateApiResponse(Client.deleteSession(username, sessionName));
    },
    onSuccess: invalidateSessions,
  });

  return { createSession, updateSession, deleteSession };
}
