export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    requestId?: string;
    source?: string;
    updatedAt?: string;
  };
}
