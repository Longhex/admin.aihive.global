export interface User {
  id: string;
  username: string;
  password?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  data: User[];
  status: number;
  message: string;
}
