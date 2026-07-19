import { ApiResponse, User } from '@mintfolio/shared';
import axios from 'axios';
import { LoginUserPayload, SignUpUserPayload } from './schema';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const signUpUser = (payload: SignUpUserPayload) => apiClient.post('/auth/register', payload);

export const getUserDetails = () => apiClient.get<ApiResponse<User>>('/auth/me');

export const loginUser = (payload: LoginUserPayload) =>
  apiClient.post<ApiResponse<User>>('/auth/authenticate', payload);

export const logoutUser = () => apiClient.post('/auth/logout');
