import { HugeiconsIcon } from "@hugeicons/react";
import {
  CodeCircleIcon,
  Briefcase07Icon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons";
import { HOME_TECH_STACK } from "../constants";

const iconMap: Record<string, typeof CodeCircleIcon> = {
  CodeCircleIcon,
  Briefcase07Icon,
  BookOpen01Icon,
};

export function HomeTechStack() {
  return (
    <section id="cong-nghe" className="ds-section">
      <div className="ds-container space-y-10">
        <div className="space-y-3 ds-reveal">
          <p className="ds-badge">Công Nghệ</p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl lg:text-5xl">
            Stack <span className="ds-gradient-text">Kỹ Thuật</span>
          </h2>
          <p className="max-w-3xl text-base text-[var(--color-text-muted)] md:text-lg">
            Các công nghệ và công cụ tôi sử dụng hàng ngày để xây dựng sản phẩm chất lượng.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {HOME_TECH_STACK.map((category, catIdx) => (
            <div
              key={category.id}
              className={`ds-glow-card ds-reveal ds-reveal-delay-${catIdx + 1}`}
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-xl bg-[var(--color-secondary)]/60 p-2.5 text-[var(--color-cta)]">
                  <HugeiconsIcon
                    icon={iconMap[category.iconName] || CodeCircleIcon}
                    size={22}
                  />
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {category.title}
                </h3>
              </div>

              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item.name} className="ds-tech-item">
                    <span className="flex-1 text-sm text-[var(--color-text)]">
                      {item.name}
                    </span>
                    {/* Proficiency bar */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 w-4 rounded-full transition-all duration-200"
                          style={{
                            background:
                              i < item.level
                                ? "var(--cta)"
                                : "var(--border)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
