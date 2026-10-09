export interface PermissionItem {
  id: number;
  permission_code: string;
  permission_name: string;
  module: string;
  description?: string;
  created_at?: string;
}

export interface GroupedPermission {
  module: string;
  module_name?: string;
  icon?: string | null;
  description?: string | null;
  permissions: PermissionItem[];
}

export interface RoleItem {
  id: number;
  role_code: string;
  role_name: string;
  description?: string;
  is_active: boolean;
  permissions_count: number;
  users_count: number;
  permission_ids?: number[];
  permission_codes?: string[];
  created_at: string;
  updated_at: string;
}

export interface RoleCreateInput {
  role_code: string;
  role_name: string;
  description?: string;
  is_active?: boolean;
}

export interface RoleUpdateInput {
  role_name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ModuleRegistryItem {
  id: number;
  module_code: string;
  module_name: string;
  /** Tên tiếng Anh (menu khi chọn English); trống -> dùng module_name */
  module_name_en?: string | null;
  icon?: string | null;
  route_path?: string | null;
  parent_code?: string | null;
  sort_order: number;
  is_navigation: boolean;
  is_active: boolean;
  description?: string | null;
  description_en?: string | null;
  permissions?: PermissionItem[];
  permissions_count?: number;
  created_at?: string;
  updated_at?: string;
  children?: ModuleRegistryItem[];
}

export interface ModuleCreateInput {
  module_code: string;
  module_name: string;
  module_name_en?: string | null;
  icon?: string;
  route_path?: string;
  parent_code?: string;
  sort_order?: number;
  is_navigation?: boolean;
  is_active?: boolean;
  description?: string;
  description_en?: string | null;
  actions?: string[];
}

export interface ModuleUpdateInput {
  module_name?: string;
  module_name_en?: string | null;
  icon?: string;
  route_path?: string;
  parent_code?: string;
  sort_order?: number;
  is_navigation?: boolean;
  is_active?: boolean;
  description?: string;
  description_en?: string | null;
}

export interface AddActionInput {
  action_code: string;
  action_name?: string;
  description?: string;
}
