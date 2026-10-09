import React, { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import type { HeroConfig } from "@/components/detail";
import { ACTIVE_STATUS, StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime, parseDateTime } from "@/components/list";
import type { UserItem } from "./types";

function dateText(value?: string | null) {
  const d = parseDateTime(value);
  return d ? formatDateTime(d) : null;
}

/** Cấu hình Hero dùng chung cho trang chi tiết và ngăn xem nhanh (chữ theo ngôn ngữ đang chọn) */
export function useUserHero(): (u: UserItem) => HeroConfig {
  const t = useTranslations("users");
  const tc = useTranslations("common");
  return useCallback(
    (u: UserItem): HeroConfig => ({
      title: u.full_name || u.username,
      image: u.avatar || null,
      badges: [
        <StatusBadge key="status" map={ACTIVE_STATUS} value={u.is_active} />,
        ...(u.is_superuser
          ? [
              <StatusBadge
                key="super"
                tone="accent"
                label={
                  <>
                    <Crown className="size-3" /> {t("superAdmin")}
                  </>
                }
              />,
            ]
          : []),
      ],
      code: `@${u.username}`,
      subtitle: [u.roles?.map((r) => r.role_name).join(", ") || t("noRole")],
      updatedAt: u.updated_at,
      fields: [
        { label: t("fields.email"), value: u.email ? <a href={`mailto:${u.email}`}>{u.email}</a> : null },
        { label: t("fields.phone"), value: u.phone_number },
        { label: t("fields.lastLogin"), value: dateText(u.last_login) ?? t("neverLoggedIn") },
        { label: tc("fields.createdAt"), value: dateText(u.created_at) },
        { label: tc("fields.note"), value: u.description, wide: true },
      ],
    }),
    [t, tc],
  );
}
