import { axiosClient, http } from "./axiosClient";

/** Tải tệp qua axiosClient (kèm JWT) rồi lưu về máy — không mở URL API trong tab mới (thiếu token → 401). */
export async function downloadFile(url: string, fileName: string) {
  const blob = (await axiosClient.get(url, { responseType: "blob" })) as unknown as Blob;
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

/** Tệp kết quả của tác vụ nền (xuất dữ liệu); tên tệp lấy từ `file_url` của job */
export async function downloadJobFile(jobId: number) {
  const job = await http.get<{ file_url?: string | null }>(`/jobs/${jobId}/status/`);
  const name = job.file_url?.split("/").pop() || `ket_qua_${jobId}.xlsx`;
  await downloadFile(`/jobs/${jobId}/download/`, name);
}
