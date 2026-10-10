import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/landing/ui/button";
import type { ProjectItem } from "@/config/projects";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { ProjectUi } from "@/content/project";
import { PROSE_CLASSES } from "@/components/modules/blog/prose";
import { fmt } from "@/content/format";

export function ProjectDetailContent({ project, ui }: { project: ProjectItem; ui: ProjectUi }) {
  return (
    <div className="relative min-h-screen pb-32 pt-32 text-foreground overflow-hidden">
      {/* Dynamic Colored Background Glow based on project.color */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] rounded-full blur-[150px] opacity-20 pointer-events-none"
        style={{ backgroundColor: project.color }}
      />

      {/* Hero Banner Area */}
      <div className="ds-container relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50 mb-6 leading-tight">
          {project.title}
        </h1>
        <p className="text-lg md:text-xl text-foreground/70 max-w-3xl leading-relaxed mb-12">{project.summary}</p>
      </div>

      <div className="ds-container mb-16 md:mb-24">
        <div className="w-full relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-border bg-secondary shadow-2xl p-4 md:p-8">
          <Image
            src={project.image}
            alt={fmt(ui.thumbAlt, { title: project.title })}
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-contain object-center"
            priority
          />
        </div>
      </div>

      <div className="ds-container grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        {/* Main Content */}
        <div className={`lg:col-span-8 ${PROSE_CLASSES} prose-lg`}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{project.content}</ReactMarkdown>
        </div>

        {/* Meta Sidebar */}
        <aside className="lg:col-span-4 space-y-10 p-8 rounded-3xl bg-secondary/50 border border-border backdrop-blur-xl shrink-0 h-fit sticky top-32">
          <div>
            <h2 className="text-xs text-foreground/60 mb-3 uppercase tracking-widest">{ui.team}</h2>
            <p className="text-xl font-bold text-foreground">{project.role}</p>
          </div>
          <div>
            <h2 className="text-xs text-foreground/60 mb-3 uppercase tracking-widest">{ui.period}</h2>
            <p className="text-xl font-bold text-foreground">{project.year}</p>
          </div>
          <div>
            <h2 className="text-xs text-foreground/60 mb-4 uppercase tracking-widest">{ui.stack}</h2>
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li key={s} className="bg-background/60 border border-border text-foreground px-4 py-1.5 rounded-full text-xs font-bold">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 pt-8 border-t border-border">
            {project.liveUrl && (
              <Button asChild className="w-full h-14 bg-[var(--color-cta)] text-background hover:bg-[var(--color-cta)]/90 rounded-2xl font-bold shadow-lg transition-all hover:scale-[1.02]">
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  {ui.live} <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline" className="w-full h-14 bg-foreground/5 border-border text-foreground hover:bg-foreground/10 hover:text-foreground rounded-2xl font-bold transition-all hover:scale-[1.02]">
                <a href={project.githubUrl} target="_blank" rel="noreferrer">
                  {ui.source} <Icons.github className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
