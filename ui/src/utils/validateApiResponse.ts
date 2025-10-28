import { APIResponse } from '@shared/types';

export async function validateApiResponse(
  apiCall: Promise<APIResponse>,
  context: string,
) {
  const response = await apiCall;

  if (!response.success) {
    const message = response.error || `API request failed during ${context}`;
    console.error(`[${context} Error]:`, message);
    throw new Error(message);
  }

  return response.data;
}
