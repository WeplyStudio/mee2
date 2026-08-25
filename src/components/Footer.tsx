import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { TRANSLATIONS } from '../data/portfolioData';
import { Language } from '../types';

interface FooterProps {
  footerProgress?: number;
  lang: Language;
  onNavigateHome: () => void;
  onNavigateAboutMe: () => void;
  onOpenContact: () => void;
  onScrollToProjects: () => void;
  onScrollToServices?: () => void;
  onScrollToFaq?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  footerProgress = 1,
  lang,
  onNavigateHome,
  onNavigateAboutMe,
  onOpenContact,
  onScrollToProjects,
  onScrollToServices,
  onScrollToFaq,
}) => {
  const t = TRANSLATIONS[lang];
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);

  const logoLetters = ['[', 'j', 'a', 'y', 's', ']'];
  const safeProgress = typeof footerProgress === 'number' && !Number.isNaN(footerProgress) ? footerProgress : 1;

  return (
    <footer
      id="contact"
      className="sticky bottom-0 z-0 pt-20 pb-12 px-6 sm:px-12 bg-[#fdfdfd] border-t border-zinc-200/80 min-h-[450px] overflow-hidden"
      style={{
        transform: `translateY(${-110 * (1 - safeProgress)}px)`,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Top Grid Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 pb-16">
          
          {/* Column 1: [contact] & get in touch */}
          <div className="sm:col-span-6 space-y-3">
            <ScrollReveal delay={100} distance={20}>
              <div className="text-[11px] font-mono-code text-zinc-400 lowercase tracking-wider">
                {t.contactLabel}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={180} distance={25}>
              <div className="space-y-1">
                <button
                  onClick={onOpenContact}
                  className="group inline-flex items-center gap-3 text-2xl sm:text-3.5xl font-extrabold tracking-tight text-zinc-900 hover:text-blue-700 transition-all duration-300 text-left cursor-pointer lowercase"
                >
                  <span>{t.getInTouch}</span>
                  <ArrowRight
                    size={24}
                    className="opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-700"
                  />
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Column 2: [links] */}
          <div className="sm:col-span-3 space-y-2 font-mono-code text-xs">
            <ScrollReveal delay={120} distance={20}>
              <div className="text-[11px] text-zinc-400 mb-2 lowercase tracking-wider">
                {t.linksLabel}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={200} distance={25}>
              <ul className="space-y-1.5 text-zinc-600">
                <li>
                  <button
                    onClick={onNavigateHome}
                    className="hover:text-black hover:translate-x-1 transition-all duration-200 cursor-pointer lowercase flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-zinc-300 group-hover:bg-zinc-800"></span>
                    <span>{t.home}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateAboutMe}
                    className="hover:text-black hover:translate-x-1 transition-all duration-200 cursor-pointer lowercase flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-zinc-300 group-hover:bg-zinc-800"></span>
                    <span>{t.aboutme}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={onScrollToProjects}
                    className="hover:text-black hover:translate-x-1 transition-all duration-200 cursor-pointer lowercase flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-zinc-300 group-hover:bg-zinc-800"></span>
                    <span>{t.projects}</span>
                  </button>
                </li>
                {onScrollToServices && (
                  <li>
                    <button
                      onClick={onScrollToServices}
                      className="hover:text-black hover:translate-x-1 transition-all duration-200 cursor-pointer lowercase flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-zinc-300 group-hover:bg-zinc-800"></span>
                      <span>{t.services}</span>
                    </button>
                  </li>
                )}
                {onScrollToFaq && (
                  <li>
                    <button
                      onClick={onScrollToFaq}
                      className="hover:text-black hover:translate-x-1 transition-all duration-200 cursor-pointer lowercase flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-zinc-300 group-hover:bg-zinc-800"></span>
                      <span>{t.faq}</span>
                    </button>
                  </li>
                )}
              </ul>
            </ScrollReveal>
          </div>

          {/* Column 3: [connect] */}
          <div className="sm:col-span-3 space-y-2 font-mono-code text-xs">
            <ScrollReveal delay={140} distance={20}>
              <div className="text-[11px] text-zinc-400 mb-2 lowercase tracking-wider">
                {t.connectLabel}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={220} distance={25}>
              <ul className="space-y-1.5 text-zinc-600">
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="group hover:text-black transition-colors flex items-center gap-1.5 lowercase"
                  >
                    <span>{t.instagram}</span>
                    <ArrowUpRight
                      size={11}
                      className="text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                    />
                  </a>
                </li>
              </ul>
            </ScrollReveal>
          </div>
        </div>

        {/* Giant [jays] Logo with Interactive Letter Animation & Tracking Reveal */}
        <ScrollReveal delay={100} distance={35}>
          <div className="py-8 border-t border-zinc-200/80 group">
            <div className="flex items-center justify-between text-[18vw] font-black tracking-tighter text-zinc-950 leading-none select-none hover:tracking-normal transition-all duration-700 cursor-default">
              {logoLetters.map((char, index) => (
                <span
                  key={index}
                  onMouseEnter={() => setHoveredLetter(index)}
                  onMouseLeave={() => setHoveredLetter(null)}
                  className={`inline-block transition-transform duration-300 ${
                    hoveredLetter === index
                      ? '-translate-y-3 scale-105 text-blue-700'
                      : hoveredLetter !== null && Math.abs(hoveredLetter - index) === 1
                      ? '-translate-y-1.5 text-zinc-800'
                      : ''
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom Copyright & Location Row */}
        <ScrollReveal delay={150} distance={15}>
          <div className="pt-8 border-t border-zinc-200/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-400 font-mono-code lowercase">
            <span>indonesia</span>
            <span>{t.designedBy}</span>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};
