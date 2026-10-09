#!/usr/bin/env node
/**
 * Sinh module frontend CRUD chuẩn từ khuôn scripts/module-template/.
 *
 *   npm run gen:module -- --entity Supplier --label "nhà cung cấp" --route master-data/suppliers
 *
 * Tham số:
 *   --entity   (bắt buộc) Tên thực thể PascalCase số ít: Supplier
 *   --label    (bắt buộc) Tên tiếng Việt viết thường: "nhà cung cấp"
 *   --label-en Tên tiếng Anh cho tệp chữ en, vd: "Suppliers" (bỏ trống -> tạm dùng chữ tiếng Việt, cần dịch sau)
 *   --route    (bắt buộc) Đường dẫn trang, cũng là thư mục module: master-data/suppliers
 *   --plural   Số nhiều PascalCase (mặc định: <Entity>s)
 *   --resource Endpoint API (mặc định: /<kebab số nhiều>/)
 *   --code     Mã phân hệ RBAC (mặc định: SUPPLIER) — phải khớp permission_module ở backend
 *   --schema   Tên schema OpenAPI (mặc định: <Entity>)
 *   --dry-run  Chỉ in ra các file sẽ tạo
 *
 * Tạo thêm tệp chữ messages/vi/<ns>.json + messages/en/<ns>.json (ns = camelCase số nhiều, vd: suppliers)
 * và đăng ký namespace vào messages/<locale>/index.ts (rule frontend-i18n.md).
 *
 * Yêu cầu: backend đã có endpoint (python manage.py startmodule ...) và đã chạy `npm run gen:api`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE_DIR = path.join(ROOT, "scripts", "module-template");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[name] = true;
    else {
      args[name] = next;
      i++;
    }
  }
  return args;
}

const toKebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toSnakeUpper = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const upperFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
if (!args.entity || !args.label || !args.route) {
  fail('Thiếu tham số. Ví dụ: npm run gen:module -- --entity Supplier --label "nhà cung cấp" --route master-data/suppliers');
}
if (!/^[A-Z][A-Za-z0-9]*$/.test(args.entity)) fail("--entity phải là PascalCase, ví dụ: Supplier");
if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(args.route)) fail("--route chỉ gồm chữ thường, số, '-' và '/', ví dụ: master-data/suppliers");

const Entity = args.entity;
const Entities = args.plural || `${Entity}s`;
const vars = {
  __ENTITIES_KEY__: toSnakeUpper(Entities),
  __Entities__: Entities,
  __entities__: toKebab(Entities),
  __Entity__: Entity,
  __entity__: lowerFirst(Entity),
  __MODULE_CODE__: args.code || toSnakeUpper(Entity),
  __Label__: upperFirst(args.label),
  __label__: args.label,
  __RESOURCE__: args.resource || `/${toKebab(Entities)}/`,
  __SCHEMA__: args.schema || Entity,
  __TABLE_KEY__: `${toKebab(Entities)}-table`,
  __ROUTE__: args.route,
  __NS__: lowerFirst(Entities),
};
const render = (text) => Object.entries(vars).reduce((acc, [k, v]) => acc.split(k).join(v), text);

const moduleDir = path.join(ROOT, "src", "modules", ...args.route.split("/"));
const pageFile = path.join(ROOT, "src", "app", "(admin)", "(dashboard)", ...args.route.split("/"), "page.tsx");
if (fs.existsSync(moduleDir)) fail(`Thư mục module đã tồn tại: ${path.relative(ROOT, moduleDir)}`);
if (fs.existsSync(pageFile)) fail(`Route đã tồn tại: ${path.relative(ROOT, pageFile)}`);

// ---------------------------------------------------------------- tạo file từ khuôn
const planned = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".tpl") && entry.name !== "page.tsx.tpl") {
      const rel = path.relative(TEMPLATE_DIR, full).replace(/\.tpl$/, "");
      planned.push({ from: full, to: path.join(moduleDir, render(rel)) });
    }
  }
}
walk(TEMPLATE_DIR);
planned.push({ from: path.join(TEMPLATE_DIR, "page.tsx.tpl"), to: pageFile });

// ---------------------------------------------------------------- tệp chữ i18n (messages/<locale>/<ns>.json)
const NS = vars.__NS__;
const MESSAGES_DIR = path.join(ROOT, "messages");
const LOCALES = ["vi", "en"];
for (const loc of LOCALES) {
  if (fs.existsSync(path.join(MESSAGES_DIR, loc, `${NS}.json`))) fail(`Namespace chữ đã tồn tại: messages/${loc}/${NS}.json`);
}
const labelEn = typeof args["label-en"] === "string" ? args["label-en"].trim() : "";
const entityEn = labelEn ? labelEn.charAt(0).toLowerCase() + labelEn.slice(1) : "";
const messagesByLocale = {
  vi: {
    pageTitle: vars.__Label__,
    title: vars.__Label__,
    entity: vars.__label__,
    searchPlaceholder: "Tìm theo mã, tên, mô tả…",
    fields: { name: `Tên ${vars.__label__}` },
    form: {
      createTitle: `Thêm ${vars.__label__}`,
      editTitle: `Sửa ${vars.__label__} {code}`,
      codeFormat: "Chỉ gồm chữ IN HOA, số, gạch dưới, gạch ngang",
    },
  },
  en: labelEn
    ? {
        pageTitle: labelEn,
        title: labelEn,
        entity: entityEn,
        searchPlaceholder: "Search by code, name, description…",
        fields: { name: "Name" },
        form: {
          createTitle: `Add ${entityEn}`,
          editTitle: `Edit ${entityEn} {code}`,
          codeFormat: "Uppercase letters, digits, underscores and hyphens only",
        },
      }
    : null,
};
// Chưa có tên tiếng Anh -> tạm chép chữ tiếng Việt (i18n:check vẫn khớp khóa), in nhắc dịch
if (!messagesByLocale.en) messagesByLocale.en = messagesByLocale.vi;

function registerNamespace(loc) {
  const indexFile = path.join(MESSAGES_DIR, loc, "index.ts");
  let src = fs.readFileSync(indexFile, "utf8");
  const importLine = `import ${NS} from "./${NS}.json";`;
  if (src.includes(importLine)) return;
  const imports = [...src.matchAll(/^import .* from "\.\/.*\.json";$/gm)];
  if (!imports.length || !/const messages = \{[^}]*\};/.test(src)) fail(`Không nhận dạng được messages/${loc}/index.ts`);
  const last = imports[imports.length - 1];
  const at = last.index + last[0].length;
  src = `${src.slice(0, at)}\n${importLine}${src.slice(at)}`;
  src = src.replace(/const messages = \{([^}]*)\};/, (_m, body) => `const messages = {${body.replace(/\s*$/, "")}, ${NS} };`);
  fs.writeFileSync(indexFile, src);
}

// ---------------------------------------------------------------- quyền trong constants/permissions.ts
const permFile = path.join(ROOT, "src", "constants", "permissions.ts");
const MARKER = "  // [gen:module]";
const code = vars.__MODULE_CODE__;
let permSource = fs.readFileSync(permFile, "utf8");
if (!permSource.includes(MARKER)) fail("Không tìm thấy marker [gen:module] trong src/constants/permissions.ts");
const permBlock =
  `  ${code}: {\n` +
  ["VIEW", "READ", "CREATE", "UPDATE", "DELETE", "EXPORT", "IMPORT"]
    .map((a) => `    ${a}: "${code}_${a}",`)
    .join("\n") +
  "\n  },\n";
const addPermissions = !new RegExp(`^\\s+${code}: \\{`, "m").test(permSource);

console.log(`\nSinh module "${vars.__Label__}" (${Entity}) tại /${args.route}\n`);
for (const f of planned) console.log(`  + ${path.relative(ROOT, f.to)}`);
if (addPermissions) console.log(`  ~ src/constants/permissions.ts (thêm PERMISSIONS.${code})`);
for (const loc of LOCALES) console.log(`  + messages/${loc}/${NS}.json  ~ messages/${loc}/index.ts`);

if (args["dry-run"]) {
  console.log("\n(dry-run: chưa ghi file)\n");
  process.exit(0);
}

for (const f of planned) {
  fs.mkdirSync(path.dirname(f.to), { recursive: true });
  fs.writeFileSync(f.to, render(fs.readFileSync(f.from, "utf8")));
}
if (addPermissions) {
  permSource = permSource.replace(MARKER, `${permBlock}${MARKER}`);
  fs.writeFileSync(permFile, permSource);
}
for (const loc of LOCALES) {
  fs.writeFileSync(path.join(MESSAGES_DIR, loc, `${NS}.json`), `${JSON.stringify(messagesByLocale[loc], null, 2)}\n`);
  registerNamespace(loc);
}

// ---------------------------------------------------------------- kiểm tra schema OpenAPI
const generated = path.join(ROOT, "src", "types", "api.generated.ts");
const schemaReady =
  fs.existsSync(generated) &&
  fs.readFileSync(generated, "utf8").includes(`        ${vars.__SCHEMA__}: {`);

console.log(`
✔ Xong. Bước tiếp theo:
  1. ${schemaReady ? "Schema OpenAPI đã có" : `Chưa thấy schema "${vars.__SCHEMA__}" -> chạy backend startmodule, spectacular, rồi \`npm run gen:api\``}
  2. Backend seed_core đã có phân hệ ${code} (route_path "/${args.route}") -> \`python manage.py seed_core\`
  3. \`npx tsc --noEmit\` -> \`npm run lint\` -> \`npm run build\`${labelEn ? "" : `
  ! Chưa có --label-en: messages/en/${NS}.json đang chép chữ tiếng Việt -> dịch sang tiếng Anh`}
`);
