import React, { useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ArrowUpRight, Sparkles, FolderKanban, X, Compass, CheckCircle2 } from 'lucide-react';
import { uiSfx } from '../utils/audio';
import { Language } from '../types';

interface MobileWelcomeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreProjects: () => void;
  onOpenAboutMe: () => void;
  onOpenContact: () => void;
  lang: Language;
}

const WELCOME_TEXTS: Record<Language, {
  badge: string;
  title: string;
  subtitle: string;
  exploreBtn: string;
  aboutBtn: string;
  contactBtn: string;
  closeBtn: string;
}> = {
  id: {
    badge: 'Tersedia Untuk Proyek',
    title: 'selamat datang.',
    subtitle: 'jason — designer & software engineer berbasis di jakarta.',
    exploreBtn: 'lihat hasil karya',
    aboutBtn: 'tentang saya',
    contactBtn: 'hubungi saya',
    closeBtn: 'lanjutkan ke situs',
  },
  en: {
    badge: 'Available For Projects',
    title: 'welcome.',
    subtitle: 'jason — designer & software engineer based in jakarta.',
    exploreBtn: 'explore projects',
    aboutBtn: 'about me',
    contactBtn: 'get in touch',
    closeBtn: 'continue to site',
  },
  de: {
    badge: 'Verfügbar für Projekte',
    title: 'willkommen.',
    subtitle: 'jason — designer & software engineer aus jakarta.',
    exploreBtn: 'projekte erkunden',
    aboutBtn: 'über mich',
    contactBtn: 'kontaktieren',
    closeBtn: 'zur website',
  },
  ja: {
    badge: 'プロジェクト対応可能',
    title: 'ようこそ。',
    subtitle: 'jason — ジャカルタのデザイナー & ソフトウェアエンジニア。',
    exploreBtn: '実績を見る',
    aboutBtn: '私について',
    contactBtn: 'お問い合わせ',
    closeBtn: 'サイトへ進む',
  },
};

export const MobileWelcomeDrawer: React.FC<MobileWelcomeDrawerProps> = ({
  isOpen,
  onClose,
  onExploreProjects,
  onOpenAboutMe,
  onOpenContact,
  lang,
}) => {
  const content = WELCOME_TEXTS[lang] || WELCOME_TEXTS.en;

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // If dragged down by more than 100px or high velocity, close drawer
    if (info.offset.y > 90 || info.velocity.y > 400) {
      uiSfx.playSwitch();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="sm:hidden">
          {/* iOS Backdrop Dim */}
          <motion.div
            key="ios-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              uiSfx.playSwitch();
              onClose();
            }}
            style={{ zIndex: 99990 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* iOS Bottom Sheet Card */}
          <motion.div
            key="ios-drawer-sheet"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 350,
              mass: 0.8,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{ zIndex: 99991 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0f0f11] text-white rounded-t-[32px] p-5 pb-7 shadow-[0_-20px_60px_rgba(0,0,0,0.85)] border-t border-zinc-800/80 select-none overflow-hidden"
          >
            {/* Drag Handle Bar */}
            <div className="w-10 h-1 bg-zinc-700/80 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing" />

            {/* Top Bar: Status Badge + Close Button */}
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono-code text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d92338] animate-pulse"></span>
                <span>{content.badge}</span>
              </div>

              <button
                onClick={() => {
                  uiSfx.playSwitch();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile & Welcome Headline Box */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/60 flex-shrink-0 flex items-center justify-center relative">
                <img
                  src="/jason.png"
                  alt="Jason"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="font-bold text-zinc-400 font-mono-code text-lg">J</span>
                <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-zinc-900 rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xl font-bold tracking-tight text-white font-sans lowercase">
                    {content.title}
                  </h3>
                  <CheckCircle2 size={16} className="text-[#d92338]" />
                </div>
                <p className="text-xs text-zinc-400 font-mono-code leading-relaxed mt-0.5 truncate">
                  {content.subtitle}
                </p>
              </div>
            </div>

            {/* Action Buttons Stack */}
            <div className="space-y-2.5">
              {/* Primary Action Button: Explore Projects */}
              <button
                onClick={() => {
                  uiSfx.playClick();
                  onExploreProjects();
                  onClose();
                }}
                className="w-full py-3.5 px-5 bg-white text-black font-semibold text-sm rounded-xl flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group shadow-lg shadow-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban size={17} className="text-zinc-900" />
                  <span className="tracking-tight lowercase">{content.exploreBtn}</span>
                </div>
                <ArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {/* Secondary Buttons Grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    uiSfx.playClick();
                    onOpenAboutMe();
                    onClose();
                  }}
                  className="py-3 px-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono-code rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles size={14} className="text-zinc-400" />
                  <span>[ {content.aboutBtn} ]</span>
                </button>

                <button
                  onClick={() => {
                    uiSfx.playClick();
                    onOpenContact();
                    onClose();
                  }}
                  className="py-3 px-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono-code rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Compass size={14} className="text-zinc-400" />
                  <span>[ {content.contactBtn} ]</span>
                </button>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => {
                  uiSfx.playSwitch();
                  onClose();
                }}
                className="w-full pt-2 text-center text-xs font-mono-code text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                [ {content.closeBtn} ]
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
