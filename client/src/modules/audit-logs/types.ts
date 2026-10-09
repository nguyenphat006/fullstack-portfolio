export interface AuditLogUser {
  id: number | null;
  username: string;
  full_name: string;
  email?: string;
  /** Tên các vai trò hiện tại của người thực hiện */
  roles?: string[];
}

export interface AuditDiffItem {
  field: string;
  /** Nhãn trường theo ngôn ngữ (verbose_name) */
  label?: string;
  old_value: unknown;
  new_value: unknown;
  /** Giá trị dễ đọc do backend dựng (tên bản ghi liên kết, nhãn lựa chọn, ngày giờ); null → tự định dạng giá trị gốc */
  old_display?: string | null;
  new_display?: string | null;
}

export interface AuditLogItem {
  id: string;
  created_at: string;
  model_name: string;
  model_code: string;
  action_label: string;
  action_code: string;
  object_id: number;
  user: AuditLogUser;
  url: string;
  ip_address?: string;
  user_agent?: string;
  http_method?: string;
  diff: AuditDiffItem[];
  snapshot?: Record<string, unknown>;
}

export interface AuditLogFilterParams {
  page?: number;
  page_size?: number;
  model?: string;
  action?: string;
  user?: string;
  ordering?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  object_id?: number;
}

export interface AuditFilterOption {
  value: string;
  label: string;
}

export interface AuditOptionsData {
  models: AuditFilterOption[];
  actions: AuditFilterOption[];
}
