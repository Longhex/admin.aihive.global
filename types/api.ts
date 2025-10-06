export interface SystemUser {
  id: string;
  username: string;
  password?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export enum SubscriptionPlanEnum {
  free,
  basic,
  pro,
  enterprise,
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
  max_tokens: number;
  max_apps: number;
  max_file_datasets: number;
  subscription_plan: SubscriptionPlanEnum;
}

export interface ApiResponse {
  data: User[];
  status: number;
  message: string;
}

export interface QueryPagination {
  page: number;
  pageSize: number;
}
