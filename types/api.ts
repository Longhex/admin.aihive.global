export interface SystemUser {
  id: string;
  username: string;
  password?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone_number: string;
  last_login_ip: string;
  language: string;
  end_date: string;
  last_login: string;
  theme: string;
  created_at: string;
  timezone: string;
  updated_at: string;
}

export interface ApiResponse {
  data: User[];
  status: number;
  message: string;
}
