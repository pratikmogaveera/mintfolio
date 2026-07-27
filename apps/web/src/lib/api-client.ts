import { ApiResponse, Holding, MFScheme, PortfolioLog, User } from '@mintfolio/shared';
import axios from 'axios';
import { CreateHoldingPayload, LoginUserPayload, SignUpUserPayload, UpdateHoldingPayload } from './schema';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- Auth ---

export const signUpUser = (payload: SignUpUserPayload) => apiClient.post('/auth/register', payload);

export const loginUser = (payload: LoginUserPayload) =>
  apiClient.post<ApiResponse<User>>('/auth/authenticate', payload);

export const logoutUser = () => apiClient.post('/auth/logout');

export const getUserDetails = () => apiClient.get<ApiResponse<User>>('/auth/me');

// --- Scheme ---

export const searchSchemes = (query: string) =>
  apiClient.get<ApiResponse<MFScheme[]>>('/scheme/search', { params: { q: query } });

// --- Portfolio ---

export const getHoldings = () => apiClient.get<ApiResponse<Holding[]>>('/portfolio/holdings');

export const createHolding = (payload: CreateHoldingPayload) =>
  apiClient.post<ApiResponse<Holding>>('/portfolio/holdings', payload);

export const updateHolding = (holdingId: string, payload: UpdateHoldingPayload) =>
  apiClient.patch<ApiResponse<Pick<Holding, 'id'>>>(`/portfolio/holdings/${holdingId}`, payload);

export const deleteHolding = (holdingId: string) =>
  apiClient.delete<ApiResponse<Pick<Holding, 'id'>>>(`/portfolio/holdings/${holdingId}`);

export const getPortfolioLogs = () => apiClient.get<ApiResponse<PortfolioLog[]>>('/portfolio/logs');

export const getNavHistory = (schemeCode: string) =>
  apiClient.get<ApiResponse<number[]>>('/portfolio/nav-history', { params: { scheme_code: schemeCode } });

// --- Notifications ---

export const subscribeToNotifications = (payload: { endpoint: string; p256dh: string; auth: string }) =>
  apiClient.post('/notifications/subscribe', payload);

export const getNotificationStatus = (endpoint: string) =>
  apiClient.post<ApiResponse<{ id: string; is_active: boolean }>>('/notifications/status', { endpoint });

export const toggleNotificationStatus = (endpoint: string) =>
  apiClient.patch<ApiResponse<{ id: string; is_active: boolean }>>('/notifications/status', { endpoint });
