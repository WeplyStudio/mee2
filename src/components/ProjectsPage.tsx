import React, { useState, useEffect } from 'react';
import { PROJECTS_DATA, TRANSLATIONS } from '../data/portfolioData';
import { ProjectMockup } from './ProjectMockup';
import { ScrollReveal } from './ScrollReveal';
import { Language, Project } from '../types';

interface ProjectsPageProps {
  lang: Language;
  onBack: () => void;
  onOpenContact: () => void;
  onSelectProject: (project: Project) => void;
}

const FILTERS = [
  'all',
  'web hosting & cloud',
  'fintech & loan verification',
  'digital invitation builder'
];

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  lang,
  onBack,
  onOpenContact,
  onSelectProject,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeFilter, setActiveFilter] = useState('all');

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter logic
  const filteredProjects = PROJECTS_DATA.filter((project) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'web hosting & cloud') {
      return project.id === 'zylo';
    }
    if (activeFilter === 'fintech & loan verification') {
      return project.id === 'trufin';
    }
    if (activeFilter === 'digital invitation builder') {
      return project.id === 'krigstudio';
    }
    return true;
  });

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-6 sm:px-12">
      
      {/* Header Info Row matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 sm:pb-16 items-start">
        {/* Left Column Label */}
        <div className="md:col-span-3">
          <ScrollReveal delay={100} distance={20}>
            <div className="text-xs sm:text-[13px] font-mono-code text-zinc-400 lowercase">
              [works]
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column Intro Text */}
        <div className="md:col-span-9">
          <ScrollReveal delay={180} distance={25}>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-3xl lowercase">
              {lang === 'id'
                ? 'koleksi kurasi proyek unggulan yang saya bangun — zylo (perusahaan website hosting & cloud platform), trufin (web verifikasi keaslian instansi keuangan & pinjol), dan krigstudio (platform web undangan digital). fokus saya adalah arsitektur kode yang bersih dan antarmuka yang bermakna.'
                : lang === 'de'
                ? 'eine kuratierte auswahl meiner leitprojekte: zylo (web-hosting & cloud-plattform), trufin (verifizierungsplattform für finanzinstitute & online-kredite) und krigstudio (plattform für digitale einladungen). mein fokus liegt auf sauberer architektur und intuitiven interfaces.'
                : lang === 'ja'
                ? '手掛けた代表的な3つのプロジェクト（zylo：Webホスティング、trufin：金融機関・融資検証プラットフォーム、krigstudio：デジタル招待状ビルダー）のケーススタディです。複雑な技術を明快で美しいインターフェースへと昇華させました。'
                : "a curated selection of core platforms i've founded, designed, and built — zylo (high-performance web hosting), trufin (financial institution & loan verification), and krigstudio (digital invitation creator). crafted with clean code architecture and intentional interfaces."}
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Filter Nav List matching screenshot style */}
      <ScrollReveal delay={250} distance={15}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-12 border-b border-zinc-200/60 text-xs sm:text-[13px] font-mono-code text-zinc-400 select-none">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`transition-colors flex items-center gap-1.5 cursor-pointer hover:text-black py-1 ${
                  isActive ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
                }`}
              >
                <span>•</span>
                <span className="lowercase">{filter}</span>
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Projects Grid matching screenshot */}
      <div className="py-12">
        {filteredProjects.length === 0 ? (
          <div className="py-24 text-center text-zinc-400 text-xs font-mono-code lowercase">
            no projects match this filter
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-zinc-200">
            {filteredProjects.map((project, idx) => (
              <ScrollReveal key={project.id} delay={idx * 80} distance={25}>
                <div
                  onClick={() => onSelectProject(project)}
                  className="group cursor-pointer flex flex-col justify-between h-full border-r border-b border-zinc-200 hover:bg-zinc-100/40 transition-all duration-300 relative overflow-hidden"
                >
                  {/* High fidelity mockup frame */}
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-zinc-50 border-b border-zinc-200/80">
                    <ProjectMockup type={project.imageType} imageUrl={project.imageUrl} />
                  </div>

                  {/* Caption & Metadata below */}
                  <div className="p-4 sm:p-5 space-y-1">
                    <div className="text-xs sm:text-[13px] font-bold text-zinc-950 group-hover:text-blue-700 transition-colors lowercase leading-tight">
                      {project.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono-code lowercase">
                      {project.client}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* "Let's build something meaningful" section with get in touch button */}
      <section className="py-24 sm:py-32 px-6 text-center max-w-xl mx-auto space-y-6">
        <ScrollReveal delay={100} distance={20}>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 lowercase">
            {t.buildHeading}
          </h3>
        </ScrollReveal>

        <ScrollReveal delay={180} distance={15}>
          <p className="text-xs sm:text-[13px] text-zinc-500 leading-relaxed lowercase">
            {t.buildSub}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={240} distance={15}>
          <div className="pt-2">
            <button
              onClick={onOpenContact}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 hover:border-zinc-900 bg-white hover:bg-zinc-50 text-zinc-800 hover:text-black text-xs font-mono-code transition-all shadow-xs active:scale-95 cursor-pointer lowercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse"></span>
              <span>• {t.getInTouch}</span>
            </button>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
};
