import { http } from "@/lib/api/axiosClient";
import { createCrudService } from "@/lib/api/crud";
import type { EntityStatistics } from "@/lib/api/types";
import type { CreateUserInput, UpdateUserInput, UserItem, UserQueryParams } from "../types";

const RESOURCE = "/users/";
const baseCrud = createCrudService<UserItem, CreateUserInput, UpdateUserInput, UserQueryParams>(RESOURCE);

export interface UserStatistics extends EntityStatistics {
  management: number;
}

export interface UserImportResult {
  count: number;
  errors?: string[];
}

export const userService = {
  ...baseCrud,

  statistics: () => http.get<UserStatistics>(`${RESOURCE}statistics/`),

  /** Nhập danh sách người dùng từ các dòng Excel đã parse ở client */
  importExcel: (rows: Record<string, unknown>[]) => http.post<UserImportResult>(`${RESOURCE}import-excel/`, { rows }),

  /** URL tải file mẫu Excel */
  getExcelTemplateUrl: (): string => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    return `${baseURL}${RESOURCE}excel-template/`;
  },
};
