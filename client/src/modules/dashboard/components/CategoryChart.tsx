"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCssVars } from "@/hooks/useCssVars";
import type { CategoryCount } from "../types";

/** Số NVL theo nhóm gốc (top 6 + Khác), cột ngang để đọc được nhãn dài */
export function CategoryChart({ data }: { data: CategoryCount[] }) {
  const t = useTranslations("dashboard");
  const c = useCssVars(["--c-info", "--c-text-secondary", "--c-surface", "--c-border", "--c-text", "--c-bg-muted"] as const);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" width={170} tick={{ fontSize: 12, fill: c["--c-text-secondary"] }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: c["--c-bg-muted"] }}
          formatter={(v) => [v, t("materialsTooltip")]}
          contentStyle={{ background: c["--c-surface"], border: `1px solid ${c["--c-border"]}`, borderRadius: 8, fontSize: 13, color: c["--c-text"] }}
        />
        <Bar dataKey="count" fill={c["--c-info"]} radius={[0, 4, 4, 0]} barSize={16} label={{ position: "right", fontSize: 12, fill: c["--c-text-secondary"] }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
