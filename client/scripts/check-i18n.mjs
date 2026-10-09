#!/usr/bin/env node
/**
 * So khớp khóa chữ giữa messages/vi (nguồn chuẩn) và messages/en.
 * Thiếu khóa ở en, thừa khóa ở en, hoặc tệp namespace không khớp -> exit 1 (CI chặn).
 *
 *   npm run i18n:check
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "messages");
const BASE = "vi";
const OTHERS = ["en"];

function flatten(obj, prefix = "", out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") flatten(value, full, out);
    else out.set(full, String(value));
  }
  return out;
}

function load(locale) {
  const dir = path.join(ROOT, locale);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const map = new Map();
  for (const f of files) {
    const ns = f.replace(/\.json$/, "");
    for (const [k, v] of flatten(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")), ns)) map.set(k, v);
  }
  return { files: new Set(files), map };
}

const base = load(BASE);
let problems = 0;
const report = (message) => {
  problems++;
  console.error(`✖ ${message}`);
};
for (const locale of OTHERS) {
  const other = load(locale);
  for (const f of base.files) if (!other.files.has(f)) report(`${locale}: thiếu tệp ${f}`);
  for (const f of other.files) if (!base.files.has(f)) report(`${locale}: thừa tệp ${f}`);
  for (const k of base.map.keys()) if (!other.map.has(k)) report(`${locale}: thiếu khóa ${k}`);
  for (const k of other.map.keys()) if (!base.map.has(k)) report(`${locale}: thừa khóa ${k}`);
  for (const [k, v] of other.map) if (!v.trim()) report(`${locale}: khóa rỗng ${k}`);
}
if (problems) {
  console.error(`\n${problems} vấn đề về tệp chữ.`);
  process.exit(1);
}
console.log(`✔ Tệp chữ khớp: ${base.map.size} khóa × ${OTHERS.length + 1} ngôn ngữ`);
