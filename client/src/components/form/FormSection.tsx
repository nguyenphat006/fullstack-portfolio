import React from "react";

interface FormSectionProps {
  title?: string;
  description?: string;
  /** Số cột trên desktop (mobile luôn 1 cột) */
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
}

/** Nhóm trường trong form: tiêu đề nhỏ + lưới 2 cột (1 cột trên mobile). Ô chiếm cả hàng: className="form-section__full". */
export function FormSection({ title, description, columns = 2, children }: FormSectionProps) {
  return (
    <section className="form-section">
      {(title || description) && (
        <header className="form-section__head">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </header>
      )}
      <div className={`form-section__grid form-section__grid--${columns}`}>{children}</div>
    </section>
  );
}
