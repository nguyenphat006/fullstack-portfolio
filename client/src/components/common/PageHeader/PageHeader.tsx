import React from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ title: string; href?: string }>;
  /** Nút bên phải (tối đa 1 nút chính) */
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

/** Tiêu đề trang: tên + 1 dòng mô tả, thao tác chính bên phải */
export function PageHeader({ title, subtitle, extra, children }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl leading-8 font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {extra && <div className="flex flex-wrap items-center gap-2">{extra}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default PageHeader;
