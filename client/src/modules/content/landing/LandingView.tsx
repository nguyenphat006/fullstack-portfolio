"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ExternalLink, Languages, Loader2, Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { useConfirm } from "@/components/feedback/confirm";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERMISSIONS } from "@/constants/permissions";
import { useModuleHeader } from "@/hooks/useModuleHeader";
import { usePermission } from "@/hooks/usePermission";
import { http } from "@/lib/api/axiosClient";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { cn } from "@/lib/utils";
import { JsonFields } from "./JsonFields";
import { collectTexts, humanize, setAt, syncNeutral, type Json } from "./jsonTools";

interface Section {
  id: number;
  key: string;
  content: Json;
  content_en: Json;
  is_active: boolean;
  updated_at: string;
  updated_by_name: string;
}

const KEY = ["landing-sections"] as const;
const NO_SECTIONS: Section[] = [];

const uploadMedia = async (file: File) => {
  const body = new FormData();
  body.append("file", file);
  const res = await http.post<{ image_url: string }>("/landing-sections/upload-media/?kind=image", body);
  return res.image_url;
};

/** Editor một phần: bản nháp VI / EN giữ trong state cho tới khi bấm Lưu */
function SectionEditor({ section, canEdit }: { section: Section; canEdit: boolean }) {
  const t = useTranslations("landing");
  const tc = useTranslations("common");
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [vi, setVi] = useState<Json>(section.content);
  const [en, setEn] = useState<Json>(() => syncNeutral(section.content, section.content_en));
  const [active, setActive] = useState(section.is_active);
  const [translating, setTranslating] = useState(false);
  const dirty = vi !== section.content || active !== section.is_active || en !== section.content_en;

  const save = useMutation({
    mutationFn: () =>
      http.patch<Section>(`/landing-sections/${section.key}/`, { content: vi, content_en: syncNeutral(vi, en), is_active: active }),
    onSuccess: () => {
      toast.success(t("saved"));
      queryClient.invalidateQueries({ queryKey: KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error, tc("messages.loadError"))),
  });

  // Dịch toàn bộ chữ tiếng Việt sang tiếng Anh (chia lô 20 trường / lần gọi)
  const translate = async () => {
    const ok = await confirm({ title: t("translateTitle"), description: t("translateBody"), confirmText: t("translate") });
    if (!ok) return;
    setTranslating(true);
    try {
      const pairs = collectTexts(vi);
      let next = syncNeutral(vi, en);
      for (let i = 0; i < pairs.length; i += 20) {
        const texts = Object.fromEntries(pairs.slice(i, i + 20));
        const res = await http.post<{ translations: Record<string, string> }>("/translate/", { texts, source: "vi", target: "en" });
        for (const [path, text] of Object.entries(res.translations)) next = setAt(next, JSON.parse(path), text);
      }
      setEn(next);
      setLang("en");
      toast.success(t("translated"));
    } catch (error) {
      toast.error(extractErrorMessage(error, t("translateError")));
    } finally {
      setTranslating(false);
    }
  };

  const label = (key: string) => {
    const path = `fields.${key}` as "fields.title";
    return t.has(path) ? t(path) : humanize(key);
  };
  const ctx = { lockNeutral: lang === "en" || !canEdit, upload: uploadMedia, label };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-foreground">{t(`sections.${section.key}.title` as "sections.hero.title")}</h2>
          <p className="text-xs text-muted-foreground">{t(`sections.${section.key}.hint` as "sections.hero.hint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={active} onCheckedChange={setActive} disabled={!canEdit} />
            {t("active")}
          </label>
          {canEdit && (
            <Button type="button" variant="outline" size="sm" onClick={translate} disabled={translating}>
              {translating ? <Loader2 className="animate-spin" /> : <Languages />} {t("translate")}
            </Button>
          )}
          {canEdit && (
            <Button type="button" size="sm" onClick={() => save.mutate()} disabled={!dirty || save.isPending}>
              {save.isPending ? <Loader2 className="animate-spin" /> : <Save />} {tc("actions.saveChanges")}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <Tabs value={lang} onValueChange={(v) => setLang(v as "vi" | "en")}>
          <TabsList>
            <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
        </Tabs>
        {lang === "en" && <p className="text-xs text-muted-foreground">{t("neutralHint")}</p>}
        {!active && <p className="rounded-md bg-[var(--c-warning-bg)] px-3 py-2 text-xs text-[var(--c-warning)]">{t("inactiveHint")}</p>}
        <JsonFields
          key={lang}
          value={lang === "vi" ? vi : en}
          onChange={(v) => (lang === "vi" ? setVi(v) : setEn(v))}
          ctx={ctx}
        />
        <p className="text-right text-xs text-muted-foreground">
          {t("updated", { at: section.updated_at, by: section.updated_by_name || "—" })}
        </p>
      </div>
    </div>
  );
}

/** Cấu hình landing: menu các phần bên trái, editor bên phải. */
export function LandingView() {
  const t = useTranslations("landing");
  const { title, subtitle } = useModuleHeader("LANDING");
  const { can } = usePermission();
  const query = useQuery({ queryKey: KEY, queryFn: () => http.get<Section[]>("/landing-sections/") });
  const sections = query.data ?? NO_SECTIONS;
  const [current, setCurrent] = useState<string | null>(null);
  const selected = useMemo(() => sections.find((s) => s.key === current) ?? sections[0], [sections, current]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={title || t("title")}
        subtitle={subtitle}
        extra={
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noreferrer"><ExternalLink /> {t("viewSite")}</a>
          </Button>
        }
      />

      {query.isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-2 lg:flex-col lg:self-start">
            {sections.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setCurrent(s.key)}
                className={cn(
                  "flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selected?.key === s.key ? "bg-[var(--c-primary-bg)] font-medium text-[var(--c-primary)]" : "text-[var(--c-text-2)] hover:bg-[var(--c-bg-muted)]",
                )}
              >
                {t(`sections.${s.key}.title` as "sections.hero.title")}
                {!s.is_active && <span className="size-1.5 rounded-full bg-[var(--c-text-tertiary)]" aria-hidden />}
              </button>
            ))}
          </nav>
          {selected && <SectionEditor key={`${selected.key}-${selected.updated_at}`} section={selected} canEdit={can(PERMISSIONS.LANDING.UPDATE)} />}
        </div>
      )}
    </div>
  );
}

export default LandingView;
