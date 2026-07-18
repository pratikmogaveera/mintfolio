export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string | string[];
}
