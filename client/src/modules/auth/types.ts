export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_superuser?: boolean;
  roles?: { id: number; role_code: string; role_name: string }[];
  role_codes: string[];
  permissions: string[];
  avatar?: string | null;
  department?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: UserProfile;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}
