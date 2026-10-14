// Sinh danh mục công nghệ (tên + slug + màu) từ simple-icons cho ô chọn "Công nghệ" ở admin.
// Chạy lại khi muốn cập nhật danh mục: npm run gen:tech
import * as icons from "simple-icons";
import { writeFileSync } from "node:fs";

const catalog = Object.values(icons)
  .filter((i) => i && typeof i === "object" && "slug" in i && "title" in i)
  .map((i) => [i.title, i.slug, i.hex])
  .sort((a, b) => a[0].localeCompare(b[0]));

writeFileSync(new URL("../src/constants/tech-catalog.json", import.meta.url), JSON.stringify(catalog));
console.log(`Đã ghi ${catalog.length} công nghệ`);
