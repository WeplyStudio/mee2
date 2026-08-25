import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/portfolioData';

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lang: Language;
  onSelectLang: (l: Language) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onOpenContact: () => void;
  onOpenStory: () => void;
  onOpen404?: () => void;
  onScrollTo: (id: string) => void;
  menuLabel: string;
}

export const MorphingMenu: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  lang,
  onSelectLang,
  isAudioPlaying,
  onToggleAudio,
  onOpenContact,
  onOpenStory,
  onScrollTo,
  menuLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleNav = (action: () => void) => {
    setIsOpen(false);
    setTimeout(() => {
      action();
    }, 450);
  };

  return (
    <>
      {/* Backdrop fading in behind */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto ${
          isOpen ? 'opacity-100 z-45' : 'opacity-0 pointer-events-none z-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Anchor Wrapper so standard header spacing isn't affected when menu morphs/grows */}
      <div className="relative w-[110px] h-[34px] pointer-events-auto">
        {/* Morphing Element Container */}
        <div
          ref={containerRef}
          className={`absolute top-0 left-1/2 -translate-x-1/2 transition-[width,height,border-radius,background-color,box-shadow,border-color,transform] duration-[550ms] ease-[cubic-bezier(0.25,1,0.2,1)] ${
            isOpen
              ? 'w-[calc(100vw-32px)] max-w-[380px] h-[520px] bg-[#111112] rounded-[32px] sm:rounded-[36px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] border border-white/[0.08] z-50 flex flex-col justify-between text-[#e4e4e7] pointer-events-auto'
              : 'w-[110px] h-[34px] bg-[#0f0f10] hover:bg-black rounded-full items-center justify-center text-white cursor-pointer shadow-md hover:shadow-lg active:scale-95 border border-transparent z-40 flex'
          }`}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
          style={{
            transformOrigin: 'top center',
            willChange: 'width, height, border-radius, background-color, transform',
          }}
        >
          {/* Closed Button State Content */}
          <div
            className={`absolute inset-0 flex items-center justify-center gap-2 text-xs sm:text-[13px] font-mono-code font-normal transition-all duration-300 ${
              isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            <span>[ ]</span>
            <span>{menuLabel}</span>
          </div>

          {/* Open Menu State Content */}
          <div
            className={`flex flex-col justify-between h-full w-full p-7 sm:p-8 transition-all duration-500 ${
              isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'
            }`}
          >
            {/* Top Row */}
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAudio();
                }}
                className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full border border-zinc-400 group-hover:border-white transition-all ${
                    isAudioPlaying ? 'bg-emerald-400 border-emerald-400 ring-2 ring-emerald-400/30' : ''
                  }`}
                ></span>
                <span className="font-normal tracking-wide text-zinc-400 group-hover:text-zinc-200 lowercase">
                  {t.lendAnEar}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="font-semibold text-white hover:text-zinc-300 transition-colors tracking-tight text-xs cursor-pointer lowercase"
              >
                {t.close}
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col space-y-3.5 sm:space-y-4 pl-1 my-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNav(() => onScrollTo('hero'));
                }}
                className="text-left text-2xl sm:text-[32px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-tight cursor-pointer lowercase"
              >
                {t.home}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNav(onOpenStory);
                }}
                className="text-left text-2xl sm:text-[32px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-tight cursor-pointer lowercase"
              >
                {t.aboutme}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNav(() => onScrollTo('projects'));
                }}
                className="text-left text-2xl sm:text-[32px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-tight cursor-pointer lowercase"
              >
                {t.projects}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNav(() => onScrollTo('services'));
                }}
                className="text-left text-2xl sm:text-[32px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-tight cursor-pointer lowercase"
              >
                {t.services}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNav(onOpenContact);
                }}
                className="text-left text-2xl sm:text-[32px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-tight cursor-pointer lowercase"
              >
                {t.getInTouch}
              </button>
            </div>

            {/* Language Switcher Row */}
            <div className="pt-3 pb-1 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono-code text-zinc-500 lowercase">
                  [language / bahasa]
                </span>
                <span className="text-[10px] font-mono-code text-zinc-500 uppercase">
                  {lang}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 bg-zinc-900/90 rounded-xl p-1 border border-zinc-800">
                {[
                  { code: 'id', label: 'ID', desc: 'Indonesian' },
                  { code: 'en', label: 'EN', desc: 'English' },
                  { code: 'de', label: 'DE', desc: 'Deutsch' },
                  { code: 'ja', label: 'JA', desc: '日本語' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLang(item.code as Language);
                    }}
                    className={`py-1.5 px-1 rounded-lg text-xs font-mono-code flex flex-col items-center justify-center transition-all cursor-pointer ${
                      lang === item.code
                        ? 'bg-[#ea580c] text-white font-bold shadow-xs scale-100'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    <span className="font-bold text-xs tracking-wider">{item.label}</span>
                    <span className="text-[9px] opacity-80">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
              <div className="font-bold text-sm tracking-tight font-mono-code text-white">
                [jays]
              </div>

              <div className="flex items-center gap-3.5 text-zinc-400 font-normal text-xs">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors lowercase"
                  onClick={(e) => e.stopPropagation()}
                >
                  instagram
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors lowercase"
                  onClick={(e) => e.stopPropagation()}
                >
                  github
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
