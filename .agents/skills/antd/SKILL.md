---
name: antd
description: >
  Use when the user's task involves Ant Design (antd) — writing antd components,
  debugging antd issues, querying antd APIs/props/tokens/demos, migrating between
  antd versions, or analyzing antd usage in a project. Triggers on antd-related
  code, imports from 'antd', or explicit antd questions.
allowed-tools:
  - run_command(antd *)
  - run_command(npm install -g @ant-design/cli*)
---

# Ant Design CLI Skill (Offline & Official)

You have access to `@ant-design/cli` — a local CLI tool with bundled antd metadata for v4/v5/v6 (plus migration guides for v3 → v4, v4 → v5, v5 → v6). Use it to query component knowledge, analyze projects, and guide migrations. All data is offline, no network needed.

## Setup & Check
Before first use, ensure `@ant-design/cli` is installed globally:
```bash
npm install -g @ant-design/cli
```

**Always use `--format json` when parsing programmatically.**

## Essential Scenarios & Workflows

### 1. Writing Antd Component Code
Before writing antd component code, look up its API first:
```bash
# Check what props are available
antd info Button --format json

# Get a working demo as starting point
antd demo Button basic --format json

# Check semantic classNames/styles for custom styling
antd semantic Button --format json

# Check component-level design tokens for theming
antd token Button --format json

# Get the overall design language (design.md)
antd design.md --format json
```

### 2. Looking Up Full Documentation
```bash
antd doc Table --format json        # full markdown docs for Table
antd doc Modal --format json        # full markdown docs for Modal
```

### 3. Debugging & Linting Deprecations
```bash
# Check if any component in a file uses deprecated props
antd lint ./src/modules/users/components/UserModalForm.tsx

# Lint all files in src
antd lint ./src

# Diagnose project environment & setup
antd doctor
```

### 4. Critical Ant Design v6 Rules
- **Modal & Drawer**: Use `destroyOnHidden`, **DO NOT** use `destroyOnClose`.
- **Card**: Use `variant="borderless"` (not `bordered={false}`) and `styles={{ body: { ... } }}` (not `bodyStyle`).
- **Statistic**: Use `styles={{ content: { ... } }}` (not `valueStyle`).
- **Dropdown / Select**: Use `popupRender` (not `dropdownRender`).
- **Alert**: Use `title={...}` (not `message={...}`).
- **Table**: Use `styles={{ body: ... }}` and ensure all columns have `filteredValue` defined if any column uses controlled filtering.
