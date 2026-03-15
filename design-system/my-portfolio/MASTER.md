# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** My Portfolio
**Updated:** 2026-03-15
**Category:** Developer Tool / IDE

---

## Global Rules

### Color Palette — Mệnh Thổ (Earth Element)

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background | `#0C0A09` | `--color-background` |
| Foreground/Text | `#FAF9F6` | `--color-text` |
| Text Muted | `#A8A29E` | `--color-text-muted` |
| CTA/Primary | `#E04444` | `--color-cta` |
| CTA Glow | `rgba(224,68,68,0.35)` | `--cta-glow` |
| Accent Earth (Amber) | `#D97706` | `--accent-earth` |
| Accent Warm (Brown) | `#92400E` | `--accent-warm` |
| Primary Brand | `#1C1917` | `--color-primary-brand` |
| Secondary Brand | `#292524` | `--color-secondary-brand` |
| Border | `#44403C` | `--color-border` |

**Color Notes:** Warm dark stone backgrounds + red CTA + amber/terracotta earth accents. Inspired by mệnh thổ (Earth element) — grounded, warm, powerful.

### Typography

- **Heading Font:** Figtree
- **Body Font:** Figtree
- **Mood:** minimal, portfolio, designer, creative, clean, artistic
- **Google Fonts:** [Figtree](https://fonts.google.com/specimen/Figtree)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');
```

### Component System

- **Preferred UI Library:** shadcn/ui components
- **Implementation Rule:** Prioritize `shadcn/ui` components first, then compose custom wrappers only when needed
- **Consistency Rule:** Keep styling aligned with existing Tailwind tokens and project theme variables
- **Accessibility Rule:** Prefer shadcn/ui primitives for built-in keyboard and focus behavior

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(12,10,9,0.15)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(12,10,9,0.25)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(12,10,9,0.3)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(12,10,9,0.4)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #E04444;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #1C1917;
  border: 2px solid #1C1917;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #1C1917;
  border: 1px solid #44403C;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  border-color: rgba(224, 68, 68, 0.3);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #44403C;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #E04444;
  outline: none;
  box-shadow: 0 0 0 3px rgba(224, 68, 68, 0.2);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: #1C1917;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Vibrant & Block-based

**Keywords:** Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern, energetic

**Best For:** Startups, creative agencies, gaming, social media, youth-focused, entertainment, consumer

**Key Effects:** Large sections (48px+ gaps), animated patterns, bold hover (color shift), scroll-snap, large type (32px+), 200-300ms

### Page Pattern

**Pattern Name:** Portfolio Grid

- **Conversion Strategy:**  hover overlay info,  lightbox view, Visuals first. Filter by category. Fast loading essential.
- **CTA Placement:** Project Card Hover + Footer Contact
- **Section Order:** 1. Hero (Name/Role), 2. Project Grid (Masonry), 3. About/Philosophy, 4. Contact

---

## Anti-Patterns (Do NOT Use)

- ❌ Flat design without depth
- ❌ Text-heavy pages
- ❌ Green (#22C55E) color — replaced by Earth palette

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icon libraries only
- ❌ **Ignoring Hugeicons priority** — Prefer Hugeicons as default icon set (project uses Hugeicons via shadcn/ui)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] Hugeicons is used as primary icon library
- [ ] If using another icon set, keep Hugeicons as priority/default and ensure visual consistency
- [ ] All icons from a consistent icon set strategy (Hugeicons-first)
- [ ] Prefer shadcn/ui components for buttons, cards, inputs, dialogs, and navigation primitives
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] All CTA/accent colors use `#E04444` (red) NOT `#22C55E` (green)
