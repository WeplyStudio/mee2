import React, { useState, useEffect } from 'react';
import { Project, Language } from '../types';
import { ProjectMockup } from './ProjectMockup';
import { ScrollReveal } from './ScrollReveal';
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react';

interface Props {
  project: Project;
  lang: Language;
  onBack: () => void;
  onOpenContact: () => void;
  onSelectProject: (project: Project) => void;
  allProjects: Project[];
}

export const ProjectDetailPage: React.FC<Props> = ({
  project,
  lang,
  onBack,
  onOpenContact,
  onSelectProject,
  allProjects,
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // Scroll to top on project load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [project.id]);

  const labels = {
    id: {
      company: '[perusahaan]',
      role: '[peran]',
      type: '[tipe]',
      tech: '[teknologi]',
      problem: '[masalah]',
      decisions: '[keputusan]',
      impact: '[dampak]',
      achievements: '[pencapaian]',
      screens: '[tampilan]',
      backToWorks: '• kembali ke karya',
      clickToZoom: 'klik untuk memperbesar',
      nextWork: 'karya selanjutnya •'
    },
    en: {
      company: '[company]',
      role: '[role]',
      type: '[type]',
      tech: '[tech]',
      problem: '[problem]',
      decisions: '[decisions]',
      impact: '[impact]',
      achievements: '[achievements]',
      screens: '[screens]',
      backToWorks: '• back to works',
      clickToZoom: 'click to zoom screen',
      nextWork: 'next work •'
    },
    de: {
      company: '[unternehmen]',
      role: '[rolle]',
      type: '[typ]',
      tech: '[technologie]',
      problem: '[problem]',
      decisions: '[entscheidungen]',
      impact: '[wirkung]',
      achievements: '[erfolge]',
      screens: '[ansichten]',
      backToWorks: '• zurück zu den werken',
      clickToZoom: 'klicken zum vergrößern',
      nextWork: 'nächstes werk •'
    },
    ja: {
      company: '[クライアント]',
      role: '[担当領域]',
      type: '[カテゴリ]',
      tech: '[技術スタック]',
      problem: '[課題]',
      decisions: '[設計方針]',
      impact: '[成果・影響]',
      achievements: '[主要実績]',
      screens: '[画面プレビュー]',
      backToWorks: '• 実績一覧へ戻る',
      clickToZoom: 'クリックして拡大',
      nextWork: '次の実績 •'
    }
  };

  const l = labels[lang] || labels.en;
  const nextProject = allProjects.find((p) => p.id === project.nextProjectId) || allProjects[0];

  return (
    <div className="min-h-screen bg-[#fbfbfb] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white pt-24 sm:pt-32">
      <main className="max-w-5xl mx-auto px-6 sm:px-12 space-y-16 sm:space-y-24 pb-20">
        {/* ------------------------------------------------------------- */}
        {/* HERO: Project Title & Summary */}
        {/* ------------------------------------------------------------- */}
        <section className="space-y-6">
          <ScrollReveal delay={50} distance={20}>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 leading-[1.1] lowercase">
              {project.title}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={100} distance={20}>
            <p className="text-xs sm:text-[13.5px] text-zinc-600 leading-relaxed max-w-3xl font-normal lowercase">
              {project.summary || project.description}
            </p>
          </ScrollReveal>

          {/* 4 Metadata Columns matching screenshot */}
          <ScrollReveal delay={150} distance={20}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 sm:pt-10 border-t border-zinc-200/80">
              <div className="space-y-1">
                <div className="text-[11px] font-mono-code text-zinc-400 lowercase">
                  {l.company}
                </div>
                <div className="text-xs sm:text-[13px] font-medium text-zinc-900 lowercase">
                  {project.company || project.client}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono-code text-zinc-400 lowercase">
                  {l.role}
                </div>
                <div className="text-xs sm:text-[13px] font-medium text-zinc-900 lowercase">
                  {project.role}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono-code text-zinc-400 lowercase">
                  {l.type}
                </div>
                <div className="text-xs sm:text-[13px] font-medium text-zinc-900 lowercase">
                  {project.type || project.category}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono-code text-zinc-400 lowercase">
                  {l.tech}
                </div>
                <div className="text-xs sm:text-[13px] font-mono-code text-zinc-800 lowercase">
                  {project.tech}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* NARRATIVE SECTIONS: Problem, Decisions, Impact */}
        {/* ------------------------------------------------------------- */}
        <section className="space-y-12 sm:space-y-16 border-t border-zinc-200/80 pt-12 sm:pt-16">
          {/* [problem] */}
          <ScrollReveal delay={100} distance={20}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-16 items-start">
              <div className="md:col-span-3 text-xs sm:text-[13px] font-mono-code text-zinc-400 lowercase">
                {l.problem}
              </div>
              <div className="md:col-span-9 text-xs sm:text-[13px] text-zinc-700 leading-relaxed max-w-2xl lowercase">
                {project.problem}
              </div>
            </div>
          </ScrollReveal>

          {/* [decisions] */}
          <ScrollReveal delay={150} distance={20}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-16 items-start">
              <div className="md:col-span-3 text-xs sm:text-[13px] font-mono-code text-zinc-400 lowercase">
                {l.decisions}
              </div>
              <div className="md:col-span-9 text-xs sm:text-[13px] text-zinc-700 leading-relaxed max-w-2xl lowercase">
                {project.decisions}
              </div>
            </div>
          </ScrollReveal>

          {/* [impact] */}
          <ScrollReveal delay={200} distance={20}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-16 items-start">
              <div className="md:col-span-3 text-xs sm:text-[13px] font-mono-code text-zinc-400 lowercase">
                {l.impact}
              </div>
              <div className="md:col-span-9 text-xs sm:text-[13px] text-zinc-700 leading-relaxed max-w-2xl lowercase">
                {project.impact}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* ACHIEVEMENTS / IMPACT METRICS */}
        {/* ------------------------------------------------------------- */}
        <section className="border-t border-zinc-200/80 pt-12 sm:pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
            <div className="md:col-span-3">
              <ScrollReveal delay={100} distance={20}>
                <div className="text-xs sm:text-[13px] font-mono-code text-zinc-400 lowercase">
                  {l.achievements}
                </div>
              </ScrollReveal>
            </div>

            <div className="md:col-span-9 space-y-10 sm:space-y-12">
              {project.achievements.map((item, idx) => (
                <ScrollReveal key={item.number + item.title} delay={idx * 100} distance={25}>
                  <div className="space-y-2 group">
                    <div className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight font-mono-code">
                      {item.number}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-zinc-900 lowercase">
                        {item.title}
                      </div>
                      <p className="text-xs sm:text-[12.5px] text-zinc-500 leading-relaxed max-w-xl lowercase">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* VISUAL SHOWCASE */}
        {/* ------------------------------------------------------------- */}
        <section className="border-t border-zinc-200/80 pt-12 sm:pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
            <div className="md:col-span-3">
              <ScrollReveal delay={100} distance={20}>
                <div className="text-xs sm:text-[13px] font-mono-code text-zinc-400 lowercase">
                  {l.screens}
                </div>
              </ScrollReveal>
            </div>

            <div className="md:col-span-9">
              <ScrollReveal delay={120} distance={20}>
                <div 
                  onClick={() => setIsZoomOpen(true)}
                  className="rounded-2xl overflow-hidden border border-zinc-200/90 shadow-sm hover:shadow-md hover:border-zinc-400 transition-all duration-300 cursor-zoom-in relative group"
                >
                  <ProjectMockup type={project.imageType} imageUrl={project.imageUrl} className="min-h-[320px] sm:min-h-[480px]" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-mono-code opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
                    <Maximize2 className="w-3 h-3" />
                    <span>{l.clickToZoom}</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* BOTTOM NAVIGATION: Back to works & Next Project */}
        {/* ------------------------------------------------------------- */}
        <section className="pt-12 sm:pt-16 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-xs sm:text-[13px] font-mono-code text-zinc-600 hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>{l.backToWorks}</span>
          </button>

          {nextProject && (
            <button
              onClick={() => onSelectProject(nextProject)}
              className="group flex items-center gap-2 text-xs sm:text-[13px] font-mono-code text-zinc-800 hover:text-black font-semibold transition-colors cursor-pointer text-right"
            >
              <span className="truncate max-w-[280px] sm:max-w-none">{nextProject.title}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          )}
        </section>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* FULLSCREEN LIGHTBOX MODAL */}
      {/* ------------------------------------------------------------- */}
      {isZoomOpen && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-zinc-950 rounded-2xl border border-zinc-800 p-2 sm:p-4 shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-20 cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full h-full flex items-center justify-center p-2">
              <img 
                src={project.imageUrl || `/${project.imageType}.png`}
                alt={project.title}
                className="w-full h-auto max-h-[82vh] object-contain rounded-xl"
              />
            </div>

            <div className="px-3 py-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-code text-zinc-400">
              <div className="text-white font-bold">
                {project.title}
              </div>
              <div>
                [{project.imageType}]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
