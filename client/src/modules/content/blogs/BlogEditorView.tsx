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
import { CoverImageField, DayField, FormSection, MarkdownField, SwitchField, TextField, TextareaField, TranslateButton } from "@/components/form";
import { useBreadcrumbTitle } from "@/hooks/useBreadcrumbTitle";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { applyServerErrors } from "@/lib/api/formErrors";
import { slugify } from "@/lib/text/slugify";
import { useBlogDetail, useCreateBlogMutation, useUpdateBlogMutation } from "./hooks/useBlogsQuery";
import { blogService } from "./services/blog.service";
import type { BlogCreateInput, BlogItem } from "./types";

const LIST_HREF = "/content/blogs";

interface Values {
  slug: string; title: string; title_en: string; excerpt: string; excerpt_en: string; published_date: string; published_date_en: string;
  category: string; category_en: string; read_time: string; read_time_en: string; image: string; content: string; content_en: string;
  description: string; is_active: boolean;
}

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const EMPTY: Values = {
  slug: "", title: "", title_en: "", excerpt: "", excerpt_en: "", published_date: today(), published_date_en: "", category: "", category_en: "",
  read_time: "", read_time_en: "", image: "", content: "", content_en: "", description: "", is_active: true,
};

const TRANSLATED: [keyof Values, keyof Values][] = [
  ["title", "title_en"], ["excerpt", "excerpt_en"], ["category", "category_en"],
  ["read_time", "read_time_en"], ["content", "content_en"],
];

const toValues = (b: BlogItem): Values => ({
  slug: b.slug, title: b.title, title_en: b.title_en ?? "", excerpt: b.excerpt, excerpt_en: b.excerpt_en ?? "",
  published_date: b.published_date, published_date_en: b.published_date_en ?? "", category: b.category, category_en: b.category_en ?? "",
  read_time: b.read_time, read_time_en: b.read_time_en ?? "", image: b.image, content: b.content, content_en: b.content_en ?? "",
  description: b.description || "", is_active: b.is_active ?? true,
});

const toPayload = (v: Values): BlogCreateInput => ({
  slug: v.slug.trim().toLowerCase(), title: v.title.trim(), title_en: v.title_en.trim(), excerpt: v.excerpt.trim(), excerpt_en: v.excerpt_en.trim(),
  published_date: v.published_date.trim(), published_date_en: v.published_date_en.trim(), category: v.category.trim(),
  category_en: v.category_en.trim(), read_time: v.read_time.trim(), read_time_en: v.read_time_en.trim(), image: v.image.trim(),
  content: v.content, content_en: v.content_en, description: v.description.trim(), is_active: v.is_active,
});

/** Trang soạn bài viết (thêm / sửa) toàn màn hình: nội dung song ngữ bên trái, ảnh + thông tin bên phải. */
export function BlogEditorView({ id }: { id?: number }) {
  const t = useTranslations("blogs");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const router = useRouter();
  const form = useForm<Values>({ defaultValues: EMPTY });
  const detail = useBlogDetail(id ?? null);
  const createMutation = useCreateBlogMutation();
  const updateMutation = useUpdateBlogMutation();
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
  const upload = blogService.uploadMedia;

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
                  <TextField<Values> name="category" label={t("fields.category")} rules={{ ...req(t("fields.category")), ...max(100) }} />
                  <TextField<Values> name="read_time" label={t("fields.readTime")} rules={{ ...req(t("fields.readTime")), ...max(30) }} />
                  <TextareaField<Values> name="excerpt" label={t("fields.excerpt")} rows={3} className="form-section__full" rules={req(t("fields.excerpt"))} />
                  <MarkdownField<Values> name="content" label={t("fields.content")} upload={upload} rules={req(t("fields.content"))} />
                </FormSection>
              </TabsContent>
              <TabsContent value="en" forceMount className="data-[state=inactive]:hidden">
                <FormSection>
                  <TextField<Values> name="title_en" label={t("fields.title")} rules={max(255)} className="form-section__full" />
                  <TextField<Values> name="category_en" label={t("fields.category")} rules={max(100)} />
                  <TextField<Values> name="read_time_en" label={t("fields.readTime")} rules={max(30)} />
                  <TextareaField<Values> name="excerpt_en" label={t("fields.excerpt")} rows={3} className="form-section__full" />
                  <MarkdownField<Values> name="content_en" label={t("fields.content")} upload={upload} />
                </FormSection>
              </TabsContent>
            </Tabs>
          </section>

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
                <DayField<Values> name="published_date" nameEn="published_date_en" label={t("fields.publishedDate")} rules={req(t("fields.publishedDate"))} />
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
