import { ApiResponse, Holding, MFScheme, User } from '@mintfolio/shared';
import axios from 'axios';
import { CreateHoldingPayload, LoginUserPayload, SignUpUserPayload, UpdateHoldingPayload } from './schema';

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

export const searchSchemes = (query: string) =>
  apiClient.get<ApiResponse<MFScheme[]>>('/scheme/search', { params: { q: query } });

export const getHoldings = () => apiClient.get<ApiResponse<Holding[]>>('/portfolio/holdings');

export const createHolding = (payload: CreateHoldingPayload) =>
  apiClient.post<ApiResponse<Holding>>('/portfolio/holdings', payload);

export const updateHolding = (holdingId: string, payload: UpdateHoldingPayload) =>
  apiClient.patch<ApiResponse<Pick<Holding, 'id'>>>(`/portfolio/holdings/${holdingId}`, payload);

export const deleteHolding = (holdingId: string) =>
  apiClient.delete<ApiResponse<Pick<Holding, 'id'>>>(`/portfolio/holdings/${holdingId}`);

export const getNavHistory = (schemeCode: string) =>
  apiClient.get<ApiResponse<number[]>>('/portfolio/nav-history', { params: { scheme_code: schemeCode } });
