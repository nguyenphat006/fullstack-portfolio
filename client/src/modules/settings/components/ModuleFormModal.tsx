"use client";

import React, { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useController, useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboboxField, FieldShell, FormDialog, FormSection, SelectField, SwitchField, TextField, TextareaField } from "@/components/form";
import { AVAILABLE_ICONS, getIconByName } from "@/constants/iconMap";
import type { ModuleRegistryItem, ModuleCreateInput, ModuleUpdateInput } from "../types";

interface ModuleFormModalProps {
  open: boolean;
  editingModule: ModuleRegistryItem | null;
  existingModules: ModuleRegistryItem[];
  onCancel: () => void;
  onSubmit: (values: ModuleCreateInput | ModuleUpdateInput) => Promise<void>;
  loading?: boolean;
}

interface ModuleFormValues {
  module_code: string;
  module_name: string;
  module_name_en: string;
  icon: string;
  route_path: string;
  parent_code: string;
  sort_order: number;
  is_navigation: boolean;
  is_active: boolean;
  description: string;
  description_en: string;
  actions: string[];
}

/** Hành động khởi tạo khi tạo phân hệ mới — nhãn dịch theo khóa settings.moduleForm.actionOptions.<CODE> */
const COMMON_ACTIONS = ["VIEW", "READ", "CREATE", "UPDATE", "DELETE", "EXPORT", "IMPORT", "APPROVE", "RELEASE", "EXECUTE"] as const;

const ROOT = "__root__";

function ActionsField({ control }: { control: ReturnType<typeof useForm<ModuleFormValues>>["control"] }) {
  const t = useTranslations("settings.moduleForm");
  const { field } = useController({ control, name: "actions" });
  const value = field.value ?? [];
  return (
    <FieldShell id="f-actions" label={t("initialActions")} hint={t("initialActionsHint")} className="form-section__full">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {COMMON_ACTIONS.map((code) => (
          <label key={code} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.includes(code)}
              onCheckedChange={(v) => field.onChange(v ? [...value, code] : value.filter((x) => x !== code))}
            />
            {code} — {t(`actionOptions.${code}`)}
          </label>
        ))}
      </div>
    </FieldShell>
  );
}

export function ModuleFormModal({ open, editingModule, existingModules, onCancel, onSubmit }: ModuleFormModalProps) {
  const t = useTranslations("settings.moduleForm");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const form = useForm<ModuleFormValues>();
  const isEditing = Boolean(editingModule);

  const iconOptions = useMemo(
    () =>
      AVAILABLE_ICONS.map((name) => ({ value: name, label: name.replace(/Outlined$/, ""), icon: getIconByName(name) })),
    [],
  );
  const parentOptions = useMemo(
    () => [
      { value: ROOT, label: t("rootMenu") },
      ...existingModules.filter((m) => m.id !== editingModule?.id && !m.parent_code).map((m) => ({ value: m.module_code, label: `${m.module_name} (${m.module_code})` })),
    ],
    [existingModules, editingModule, t],
  );

  useEffect(() => {
    if (!open) return;
    form.reset(
      editingModule
        ? {
            module_code: editingModule.module_code,
            module_name: editingModule.module_name,
            module_name_en: editingModule.module_name_en ?? "",
            icon: editingModule.icon || "AppstoreOutlined",
            route_path: editingModule.route_path ?? "",
            parent_code: editingModule.parent_code || ROOT,
            sort_order: editingModule.sort_order ?? 0,
            is_navigation: editingModule.is_navigation ?? true,
            is_active: editingModule.is_active ?? true,
            description: editingModule.description ?? "",
            description_en: editingModule.description_en ?? "",
            actions: [],
          }
        : {
            module_code: "",
            module_name: "",
            module_name_en: "",
            icon: "AppstoreOutlined",
            route_path: "",
            parent_code: ROOT,
            sort_order: (existingModules.length + 1) * 10,
            is_navigation: true,
            is_active: true,
            description: "",
            description_en: "",
            actions: ["VIEW", "READ", "CREATE", "UPDATE", "DELETE"],
          },
    );
  }, [open, editingModule, existingModules, form]);

  return (
    <FormDialog
      open={open}
      onClose={onCancel}
      title={isEditing ? t("editTitle", { code: editingModule?.module_code ?? "" }) : t("createTitle")}
      form={form}
      submitText={isEditing ? tc("actions.saveChanges") : t("createSubmit")}
      onSubmit={async ({ module_code, actions, parent_code, module_name_en, description_en, ...rest }) => {
        const common = {
          ...rest,
          parent_code: parent_code === ROOT ? "" : parent_code,
          route_path: rest.route_path.trim(),
          // Trống -> null: menu tiếng Anh dùng lại tên / mô tả tiếng Việt
          module_name_en: module_name_en.trim() || null,
          description_en: description_en.trim() || null,
        };
        await onSubmit(isEditing ? common : { ...common, module_code: module_code.trim().toUpperCase(), actions });
      }}
    >
      <FormSection>
        <TextField<ModuleFormValues>
          name="module_code"
          label={t("code")}
          placeholder={t("codePlaceholder")}
          disabled={isEditing}
          transform={(v) => v.toUpperCase()}
          inputClassName="font-mono"
          rules={{
            required: isEditing ? false : tv("required", { field: t("code") }),
            pattern: { value: /^[A-Z0-9_]+$/, message: tv("codeFormat") },
          }}
        />
        <TextField<ModuleFormValues> name="module_name" label={t("name")} placeholder={t("namePlaceholder")} rules={{ required: tv("required", { field: t("name") }) }} />
        <TextField<ModuleFormValues> name="module_name_en" label={t("nameEn")} placeholder={t("nameEnPlaceholder")} hint={t("enFallbackHint")} />
        <ComboboxField<ModuleFormValues> name="icon" label={t("icon")} options={iconOptions} placeholder={t("iconPlaceholder")} />
        <TextField<ModuleFormValues> name="route_path" label={t("route")} placeholder={t("routePlaceholder")} hint={t("routeHint")} inputClassName="font-mono" />
        <SelectField<ModuleFormValues> name="parent_code" label={t("parent")} options={parentOptions} />
        <SwitchField<ModuleFormValues> name="is_navigation" label={t("showInMenu")} onText={t("navShown")} offText={t("navHidden")} />
        <SwitchField<ModuleFormValues> name="is_active" label={tc("fields.status")} onText={tc("status.active")} offText={tc("status.inactive")} />
        <TextareaField<ModuleFormValues> name="description" label={tc("fields.description")} rows={2} placeholder={t("descriptionPlaceholder")} className="form-section__full" />
        <TextareaField<ModuleFormValues> name="description_en" label={t("descriptionEn")} rows={2} placeholder={t("descriptionEnPlaceholder")} className="form-section__full" />
        {!isEditing && <ActionsField control={form.control} />}
      </FormSection>
    </FormDialog>
  );
}
