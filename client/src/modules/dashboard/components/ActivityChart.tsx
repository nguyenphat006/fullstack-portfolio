"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCssVars } from "@/hooks/useCssVars";
import type { ActivityPoint } from "../types";

const dayLabel = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

/** Số thao tác theo ngày (14 ngày) */
export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const t = useTranslations("dashboard");
  const c = useCssVars(["--c-primary", "--c-border", "--c-text-secondary", "--c-surface", "--c-text"] as const);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c["--c-primary"]} stopOpacity={0.25} />
            <stop offset="100%" stopColor={c["--c-primary"]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c["--c-border"]} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={dayLabel} tick={{ fontSize: 12, fill: c["--c-text-secondary"] }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: c["--c-text-secondary"] }} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          labelFormatter={(v) => dayLabel(String(v))}
          formatter={(v) => [v, t("activityTooltip")]}
          contentStyle={{ background: c["--c-surface"], border: `1px solid ${c["--c-border"]}`, borderRadius: 8, fontSize: 13, color: c["--c-text"] }}
        />
        <Area type="monotone" dataKey="count" stroke={c["--c-primary"]} strokeWidth={2} fill="url(#activityFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
