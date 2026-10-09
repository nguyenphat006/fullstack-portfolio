export interface RoleItem {
  id: number;
  role_code: string;
  role_name: string;
  description?: string;
  is_active: boolean;
  permissions_count?: number;
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionItem {
  id: number;
  permission_code: string;
  permission_name: string;
  module: string;
  description?: string;
  created_at?: string;
}

export interface UserItem {
  id: number;
  username: string;
  name?: string;
  full_name?: string;
  email: string;
  phone_number?: string;
  avatar?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_staff?: boolean;
  roles?: RoleItem[];
  role_codes?: string[];
  role_names?: string;
  description?: string;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateUserInput {
  username: string;
  full_name: string;
  email: string;
  phone_number?: string;
  password?: string;
  is_active: boolean;
  role_ids?: number[];
  description?: string;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export interface UserQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
  ordering?: string;
}
