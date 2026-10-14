"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoverImageField, FormSection, MarkdownField, PeriodField, SwitchField, TechStackField, TextField, TextareaField, TranslateButton } from "@/components/form";
import { useBreadcrumbTitle } from "@/hooks/useBreadcrumbTitle";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { applyServerErrors } from "@/lib/api/formErrors";
import { slugify } from "@/lib/text/slugify";
import { useCreateProjectMutation, useProjectDetail, useUpdateProjectMutation } from "./hooks/useProjectsQuery";
import { projectService } from "./services/project.service";
import type { ProjectCreateInput, ProjectItem } from "./types";

const LIST_HREF = "/content/projects";

interface Values {
  slug: string; title: string; title_en: string; summary: string; summary_en: string; stack: string[]; year: string; year_en: string;
  image: string; color: string; role: string; role_en: string; content: string; content_en: string; live_url: string; github_url: string;
  featured: boolean; description: string; is_active: boolean;
}

const EMPTY: Values = {
  slug: "", title: "", title_en: "", summary: "", summary_en: "", stack: [], year: "", year_en: "",
  image: "", color: "#7C3AED", role: "", role_en: "", content: "", content_en: "", live_url: "", github_url: "", featured: false,
  description: "", is_active: true,
};

const TRANSLATED: [keyof Values, keyof Values][] = [
  ["title", "title_en"], ["summary", "summary_en"], ["role", "role_en"], ["content", "content_en"],
];

const toValues = (p: ProjectItem): Values => ({
  slug: p.slug, title: p.title, title_en: p.title_en ?? "", summary: p.summary, summary_en: p.summary_en ?? "",
  stack: Array.isArray(p.stack) ? (p.stack as string[]) : [], year: p.year, year_en: p.year_en ?? "", image: p.image, color: p.color,
  role: p.role, role_en: p.role_en ?? "", content: p.content, content_en: p.content_en ?? "", live_url: p.live_url || "",
  github_url: p.github_url || "", featured: p.featured ?? false, description: p.description || "", is_active: p.is_active ?? true,
});

const toPayload = (v: Values): ProjectCreateInput => ({
  slug: v.slug.trim().toLowerCase(), title: v.title.trim(), title_en: v.title_en.trim(), summary: v.summary.trim(), summary_en: v.summary_en.trim(),
  stack: v.stack, year: v.year.trim(), year_en: v.year_en.trim(), image: v.image.trim(),
  color: v.color.trim(), role: v.role.trim(), role_en: v.role_en.trim(), content: v.content, content_en: v.content_en,
  live_url: v.live_url.trim() || null, github_url: v.github_url.trim() || null, featured: v.featured,
  description: v.description.trim(), is_active: v.is_active,
});

/** Trang soạn dự án (thêm / sửa) toàn màn hình: nội dung song ngữ bên trái, ảnh + thông tin bên phải. */
export function ProjectEditorView({ id }: { id?: number }) {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const router = useRouter();
  const form = useForm<Values>({ defaultValues: EMPTY });
  const detail = useProjectDetail(id ?? null);
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const saving = createMutation.isPending || updateMutation.isPending;
  useBreadcrumbTitle(id ? detail.data?.title : t("form.createTitle"));

  useEffect(() => {
    if (detail.data) form.reset(toValues(detail.data));
  }, [detail.data, form]);

  // Tạo mới: slug tự sinh theo tiêu đề tiếng Việt cho tới khi người dùng tự sửa ô slug.
  // Đang sửa bản ghi: giữ slug cũ (đổi slug làm hỏng URL đã chia sẻ / đã được Google lập chỉ mục).
  const title = useWatch({ control: form.control, name: "title" });
  useEffect(() => {
    if (id || form.getFieldState("slug").isDirty) return;
    form.setValue("slug", slugify(title ?? ""), { shouldValidate: Boolean(title) });
  }, [id, title, form]);

  const req = (field: string) => ({ required: tv("required", { field }) });
  const max = (n: number) => ({ maxLength: { value: n, message: tv("maxLength", { max: n }) } });
  const upload = projectService.uploadMedia;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (id) {
        await updateMutation.mutateAsync({ id, data: toPayload(values) });
        toast.success(tc("messages.updated", { entity: t("entity") }));
        form.reset(values);
      } else {
        const created = await createMutation.mutateAsync(toPayload(values));
        toast.success(tc("messages.created", { entity: t("entity") }));
        router.replace(`${LIST_HREF}/${created.id}/edit`);
      }
    } catch (error) {
      if (!applyServerErrors(form, error)) toast.error(extractErrorMessage(error, tc("messages.loadError")));
    }
  });

  if (id && detail.isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="mx-auto max-w-[1400px] space-y-4">
        {/* Thanh tiêu đề dính: quay lại · tiêu đề · lưu */}
        <div className="sticky top-14 z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-[var(--c-header-bg)] px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <Button type="button" variant="ghost" size="icon" asChild aria-label={tc("actions.back")}>
              <Link href={LIST_HREF}><ArrowLeft /></Link>
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-foreground">
                {id ? t("form.editTitle", { code: detail.data?.slug ?? "" }) : t("form.createTitle")}
              </h1>
              <p className="truncate text-xs text-muted-foreground">{t("title")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" asChild><Link href={LIST_HREF}>{tc("actions.cancel")}</Link></Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              {id ? tc("actions.saveChanges") : t("form.createTitle")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Nội dung song ngữ */}
          <section className="rounded-xl border bg-card p-4 sm:p-5">
            <Tabs defaultValue="vi">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <TabsList>
                  <TabsTrigger value="vi">{t("form.tabVi")}</TabsTrigger>
                  <TabsTrigger value="en">{t("form.tabEn")}</TabsTrigger>
                </TabsList>
                <TranslateButton
                  getSource={() => Object.fromEntries(TRANSLATED.map(([vi, en]) => [en, String(form.getValues(vi) ?? "")]))}
                  getCurrent={() => Object.fromEntries(TRANSLATED.map(([, en]) => [en, String(form.getValues(en) ?? "")]))}
                  onResult={(res) => Object.entries(res).forEach(([k, v]) => form.setValue(k as keyof Values, v, { shouldDirty: true }))}
                />
              </div>
              <TabsContent value="vi" forceMount className="data-[state=inactive]:hidden">
                <FormSection>
                  <TextField<Values> name="title" label={t("fields.title")} rules={{ ...req(t("fields.title")), ...max(255) }} className="form-section__full" />
                  <TextField<Values> name="role" label={t("fields.role")} rules={{ ...req(t("fields.role")), ...max(150) }} />
                  <TextareaField<Values> name="summary" label={t("fields.summary")} rows={3} className="form-section__full" rules={req(t("fields.summary"))} />
                  <MarkdownField<Values> name="content" label={t("fields.content")} upload={upload} rules={req(t("fields.content"))} />
                </FormSection>
              </TabsContent>
              <TabsContent value="en" forceMount className="data-[state=inactive]:hidden">
                <FormSection>
                  <TextField<Values> name="title_en" label={t("fields.title")} rules={max(255)} className="form-section__full" />
                  <TextField<Values> name="role_en" label={t("fields.role")} rules={max(150)} />
                  <TextareaField<Values> name="summary_en" label={t("fields.summary")} rows={3} className="form-section__full" />
                  <MarkdownField<Values> name="content_en" label={t("fields.content")} upload={upload} />
                </FormSection>
              </TabsContent>
            </Tabs>
          </section>

          {/* Ảnh + thông tin chung */}
          <aside className="space-y-4">
            <section className="rounded-xl border bg-card p-4">
              <FormSection>
                <CoverImageField<Values> name="image" label={t("fields.image")} upload={upload} rules={req(t("fields.image"))} />
              </FormSection>
            </section>
            <section className="rounded-xl border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold text-foreground">{t("fields.general")}</h2>
              <div className="space-y-3">
                <TextField<Values> name="slug" label={t("fields.slug")} hint={id ? undefined : t("form.slugHint")} transform={(x) => slugify(x)} inputClassName="font-mono" rules={{ ...req(t("fields.slug")), ...max(150) }} />
                <PeriodField<Values> name="year" nameEn="year_en" label={t("fields.year")} rules={req(t("fields.year"))} />
                <TechStackField<Values> name="stack" label={t("fields.stack")} />
                <TextField<Values> name="color" type="color" label={t("fields.color")} rules={req(t("fields.color"))} inputClassName="h-10 p-1" />
                <TextField<Values> name="live_url" type="url" label={t("fields.liveUrl")} rules={max(500)} />
                <TextField<Values> name="github_url" type="url" label={t("fields.githubUrl")} rules={max(500)} />
                <SwitchField<Values> name="featured" label={t("fields.featured")} onText={tc("status.yes")} offText={tc("status.no")} />
                <SwitchField<Values> name="is_active" label={tc("fields.status")} onText={tc("status.active")} offText={tc("status.inactive")} />
                <TextareaField<Values> name="description" label={tc("fields.description")} rows={2} maxLength={500} />
              </div>
            </section>
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}
