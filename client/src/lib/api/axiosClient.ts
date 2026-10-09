import { readClientLocale } from "@/i18n/config";
import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { isApiEnvelope, type ApiEnvelope } from "./types";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request Interceptor: Tự động đính kèm Access Token vào Header
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Backend trả thông báo / lỗi / tên menu theo ngôn ngữ giao diện đang chọn
      if (config.headers) config.headers["Accept-Language"] = readClientLocale();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý lỗi toàn cục, Silent Token Refresh khi gặp 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  // Bóc envelope {success, message, data} -> trả thẳng `data`. Blob/file giữ nguyên.
  // Cần cả envelope (vd. lấy `message`) thì truyền config `{ rawEnvelope: true }` hoặc dùng `http.envelope`.
  (response) => {
    const body = response.data;
    if (response.config.rawEnvelope || !isApiEnvelope(body)) return body;
    return body.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Không xử lý refresh nếu request là login hoặc refresh endpoint
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login/") ||
      originalRequest?.url?.includes("/auth/token/refresh/");

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      if (typeof window === "undefined") {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (!window.location.pathname.startsWith("/login")) {
          // Interceptor nằm ngoài cây React (không có router) -> điều hướng cứng, đồng thời xóa sạch state
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const tokens = isApiEnvelope(response.data) ? response.data.data : response.data;
        const { access: newAccessToken, refresh: newRefreshToken } = tokens as { access: string; refresh?: string };
        localStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }
        axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (!window.location.pathname.startsWith("/login")) {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

declare module "axios" {
  interface AxiosRequestConfig {
    /** Trả nguyên envelope thay vì bóc `data` */
    rawEnvelope?: boolean;
  }
}

/**
 * Wrapper có kiểu dữ liệu cho axiosClient: `http.get<User>("/users/1/")` trả `Promise<User>`.
 * Dùng trong mọi service thay vì gọi axiosClient trực tiếp.
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => axiosClient.get<T, T>(url, config),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => axiosClient.post<T, T>(url, body, config),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => axiosClient.put<T, T>(url, body, config),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => axiosClient.patch<T, T>(url, body, config),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) => axiosClient.delete<T, T>(url, config),
  /** Lấy nguyên envelope khi cần `message` từ server (vd. hiển thị số bản ghi bị bỏ qua) */
  envelope: {
    post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
      axiosClient.post<ApiEnvelope<T>, ApiEnvelope<T>>(url, body, { ...config, rawEnvelope: true }),
  },
};

export default axiosClient;
