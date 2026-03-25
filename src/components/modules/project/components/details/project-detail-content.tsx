import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectItem } from "@/config/projects";

export function ProjectDetailContent({ project }: { project: ProjectItem }) {
  return (
    <div className="relative min-h-screen pb-32 pt-32 text-white overflow-hidden">
      {/* Dynamic Colored Background Glow based on project.color */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] rounded-full blur-[150px] opacity-20 pointer-events-none"
        style={{ backgroundColor: project.color }}
      />

      {/* Hero Banner Area */}
      <div className="ds-container relative z-10">
        <h1 
          className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 mb-6 leading-tight"
        >
          {project.title}
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-3xl leading-relaxed mb-12 font-light">
          {project.summary}
        </p>
      </div>

      <div className="w-full aspect-[16/9] md:aspect-[21/9] relative mb-16 md:mb-24 shadow-2xl border-y border-white/5">
         <Image 
            src={project.image} 
            alt={project.title} 
            fill 
            className="object-cover object-center" 
            priority
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/20 to-transparent" />
      </div>

      <div className="ds-container grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        {/* Main Content */}
        <div className="lg:col-span-8 prose prose-invert prose-lg max-w-none">
          <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-4">
            <span className="w-8 h-1 rounded-full bg-[var(--color-cta)]" />
            Vấn đề & Giải pháp
          </h2>
          <p className="text-white/70 leading-loose text-lg whitespace-pre-line font-light">
            {project.content}
          </p>
        </div>

        {/* Meta Sidebar */}
        <div className="lg:col-span-4 space-y-10 p-8 rounded-3xl bg-secondary/30 border border-white/5 backdrop-blur-xl shrink-0 h-fit sticky top-32">
           <div>
             <h4 className="text-xs font-mono text-white/40 mb-3 uppercase tracking-widest">Đội ngũ & Vai trò</h4>
             <p className="text-xl font-semibold text-white">{project.role}</p>
           </div>
           <div>
             <h4 className="text-xs font-mono text-white/40 mb-3 uppercase tracking-widest">Thời gian triển khai</h4>
             <p className="text-xl font-semibold text-white">{project.year}</p>
           </div>
           <div>
             <h4 className="text-xs font-mono text-white/40 mb-4 uppercase tracking-widest">Ngăn xếp Công nghệ</h4>
             <div className="flex flex-wrap gap-2">
                {project.stack.map(s => (
                   <span key={s} className="bg-black/50 border border-white/10 text-[var(--color-cta)] px-4 py-1.5 rounded-full text-xs font-mono font-bold">
                     {s}
                   </span>
                ))}
             </div>
           </div>

           <div className="space-y-4 pt-8 border-t border-white/10">
              {project.liveUrl && (
                  <Button asChild className="w-full h-14 bg-[var(--color-cta)] text-black hover:bg-[var(--color-cta)]/90 rounded-2xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]">
                    <a href={project.liveUrl} target="_blank" rel="noreferrer">
                      Truy cập Trực tiếp <ExternalLink className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
              )}
              {project.githubUrl && (
                  <Button asChild variant="outline" className="w-full h-14 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-2xl font-bold transition-all hover:scale-[1.02]">
                    <a href={project.githubUrl} target="_blank" rel="noreferrer">
                      Khám phá Mã nguồn <Github className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
