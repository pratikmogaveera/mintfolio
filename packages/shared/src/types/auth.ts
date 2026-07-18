export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  accessToken: string;
}
