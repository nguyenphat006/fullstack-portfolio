# MY PORTFOLIO — Design System v3.0

## Philosophy
Minimal, dark, high-contrast. Let the work speak — remove all visual noise.

---

## Color System

> **Nguyên tắc:** Chỉ dùng **đen + trắng + xám**. Không màu accent.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0E0E0E` | Nền toàn trang (lab 5.27%) |
| `--foreground` | `#FFFFFF` | Text chính |
| `--text` | `#FFFFFF` | Text nội dung |
| `--text-muted` | `#999999` | Text phụ, mô tả |
| `--cta` | `#FFFFFF` | Nút CTA chính |
| `--card` | `#141414` | Nền card/terminal |
| `--secondary` | `#1A1A1A` | Nền phụ, sidebar |
| `--border` | `#2A2A2A` | Đường viền |
| `--accent` | `#2A2A2A` | Hover backgrounds |
| `--dock-bg` | `#1C1816` | Nền Dock (nâu tối) |

### Dark Mode (`.dark`)
Giống `:root` nhưng tối hơn 1 bậc (`--background: #0A0A0A`).

---

## Typography
- Font: System default / Inter
- Heading: `text-4xl` → `text-6xl`, `font-bold`, `tracking-tight`
- Body: `text-base` / `text-lg`, `text-white/50` (muted)
- Labels: `text-sm` / `text-xs`

---

## Buttons

| Variant | Height | Padding | Style |
|---------|--------|---------|-------|
| Primary | `h-11` (44px) | `px-6` | Bg white, text black |
| Secondary | `h-11` | `px-6` | Border `#2A2A2A`, text white |
| Neon | `h-11` | `px-6` | Bg white, subtle glow |
| Icon size | — | — | 16px inside buttons |

---

## Icons
- Small (chips/labels): 14px
- Medium (cards/buttons): 16–20px
- Large (decorative): 24px
- Lib: `@hugeicons/react` + `@hugeicons/core-free-icons`

---

## Dock Component
- Vị trí: Fixed bottom center, z-50
- Nền: `#1C1816/90` (nâu tối, backdrop-blur)
- Icon bg: `bg-black/60` (tròn, dark)
- Icon size: 20px, magnification 40→56px
- Có tooltip (shadcn/ui Tooltip)
- Nội dung: Home | — | GitHub | LinkedIn | Email | CV | — | Menu

---

## Cards
> **Nguyên tắc:** Tránh lạm dụng card. Chỉ dùng khi cần nhóm nội dung (projects, blog).

- Container: `bg-[#141414]` hoặc `bg-transparent`
- Border: `border border-[#2A2A2A]`
- Hover: `whileHover={{ y: -4 }}`
- **KHÔNG** dùng card cho stats/số liệu → hiển thị inline

---

## Animation (Motion)
- Import: `from "motion/react"` (KHÔNG dùng `"framer-motion"`)
- Scroll reveal: `whileInView` + `viewport={{ once: true }}`
- Hover lift: `whileHover={{ y: -4 }}`
- Stagger: `delay: i * 0.1`
- Ease: `"easeOut" as const`
- Terminal lines: stagger `delay: 0.12`

---

## Navigation
| Element | Desktop | Mobile |
|---------|---------|--------|
| Sidebar | Fixed left, dot indicators, logo "N" | Hidden |
| Dock | Bottom center, magnification | Bottom center |
| Fullscreen menu | Burger trong Dock → overlay đen | Burger → overlay |

---

## Pre-Delivery Checklist
- [ ] Không có màu nào ngoài đen/trắng/xám (trừ dock nâu tối)
- [ ] Hero section không có stat cards
- [ ] Tất cả import dùng `motion/react`
- [ ] Dock có tooltips và icon bg tròn đen
- [ ] Buttons đều `h-11 px-6 text-sm`
- [ ] Không có text/element bị cắt trên mobile
