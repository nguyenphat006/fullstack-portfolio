import { HOME_ABOUT_CONTENT } from "../constants";

export function HomeAboutSection() {
  return (
    <section id="ve-toi" className="ds-section">
      <div className="ds-container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Text */}
          <div className="space-y-6 ds-reveal">
            <span className="ds-badge">{HOME_ABOUT_CONTENT.badge}</span>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl lg:text-5xl">
              {HOME_ABOUT_CONTENT.title}
            </h2>

            <div className="space-y-3">
              {HOME_ABOUT_CONTENT.bio.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <ul className="space-y-3">
              {HOME_ABOUT_CONTENT.values.map((value) => (
                <li
                  key={value}
                  className="ds-list-item text-sm text-[var(--color-text-muted)] md:text-base"
                >
                  {value}
                </li>
              ))}
            </ul>

            <a
              href={HOME_ABOUT_CONTENT.ctaHref}
              className="ds-btn-neon inline-block"
            >
              {HOME_ABOUT_CONTENT.ctaLabel}
            </a>
          </div>

          {/* Right: Terminal Card */}
          <div className="ds-reveal ds-reveal-delay-3">
            <div className="ds-terminal">
              <div className="ds-terminal-bar">
                <div className="ds-terminal-dot" style={{ background: "#EF4444" }} />
                <div className="ds-terminal-dot" style={{ background: "#F59E0B" }} />
                <div className="ds-terminal-dot" style={{ background: "#22C55E" }} />
                <span className="ml-3 text-xs text-[var(--color-text-muted)]">
                  terminal — zsh
                </span>
              </div>
              <div className="ds-terminal-body">
                {HOME_ABOUT_CONTENT.terminalLines.map((line, i) => (
                  <p
                    key={i}
                    className={`${
                      line.startsWith("$")
                        ? "text-[var(--color-cta)] font-semibold"
                        : "text-[var(--color-text-muted)]"
                    } ${i > 0 ? "mt-1.5" : ""}`}
                  >
                    {line}
                  </p>
                ))}
                <span className="ds-cursor-blink mt-2" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
