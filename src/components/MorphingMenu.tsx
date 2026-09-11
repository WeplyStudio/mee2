import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { uiSfx } from '../utils/audio';
import {
  AnimatedSoundWave,
  AnimatedClose,
  AnimatedFolder,
  AnimatedUser,
  AnimatedSparkle,
  AnimatedEvidence,
  AnimatedMail,
  AnimatedArrowUpRight,
} from './AnimatedIcons';

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lang?: Language;
  onSelectLang?: (l: Language) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onOpenContact: () => void;
  onOpenStory: () => void;
  onOpen404?: () => void;
  onScrollTo: (id: string) => void;
  menuLabel: string;
}

// Sophisticated custom bezier easing curves
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT_CUBIC = [0.65, 0, 0.35, 1] as const;

// Staggered motion variants for smooth menu items entry
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: EASE_IN_OUT_CUBIC,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: EASE_OUT_EXPO,
    },
  },
};

export const MorphingMenu: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  isAudioPlaying,
  onToggleAudio,
  onOpenContact,
  onOpenStory,
  onScrollTo,
  menuLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNameToggled, setIsNameToggled] = useState<boolean>(false);
  const [isNameHovered, setIsNameHovered] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        uiSfx.playClick();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleNav = (action: () => void) => {
    uiSfx.playClick();
    setIsOpen(false);
    setTimeout(() => {
      action();
    }, 380);
  };

  return (
    <>
      {/* Backdrop fading in behind with smooth easing */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 bg-black/70 backdrop-blur-[4px] z-45 pointer-events-auto"
            onClick={() => {
              uiSfx.playClick();
              setIsOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Anchor Container */}
      <div className="relative w-[156px] sm:w-[170px] h-[38px] sm:h-[40px] pointer-events-auto z-50">
        <motion.div
          ref={containerRef}
          initial={false}
          animate={
            isOpen
              ? {
                  width: 'min(calc(100vw - 32px), 350px)',
                  height: 'min(calc(100vh - 120px), 490px)',
                  borderRadius: 28,
                  backgroundColor: '#141414',
                  boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }
              : {
                  width: '100%',
                  height: '100%',
                  borderRadius: 20,
                  backgroundColor: '#0d0d0e',
                  boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.5)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }
          }
          transition={{
            duration: isOpen ? 0.48 : 0.38,
            ease: isOpen ? EASE_OUT_EXPO : EASE_IN_OUT_CUBIC,
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2 overflow-hidden border flex flex-col justify-between select-none cursor-pointer"
          style={{ transformOrigin: 'top center' }}
          onClick={() => {
            if (!isOpen) {
              uiSfx.playClick();
              setIsOpen(true);
            }
          }}
        >
          {/* Closed State Pill Content */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                key="closed-pill-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
                className="absolute inset-0 flex items-center justify-between px-5 text-xs sm:text-[13px] font-sans font-light tracking-tight text-white hover:text-zinc-200"
              >
                <span className="font-mono-code text-zinc-400 tracking-wider text-xs">[ ]</span>
                <span className="font-normal lowercase tracking-tight text-xs sm:text-[13px]">{menuLabel}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Open State Menu Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="open-menu-content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col justify-between h-full w-full p-6 sm:p-7 text-[#e4e4e7] cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Row: o lend an ear       close */}
                <motion.div variants={itemVariants} className="flex items-center justify-between text-xs text-zinc-400">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      uiSfx.playSwitch();
                      onToggleAudio();
                    }}
                    onMouseEnter={() => uiSfx.playHover()}
                    className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group lowercase"
                  >
                    <AnimatedSoundWave isPlaying={isAudioPlaying} size={13} />
                    <span className="font-normal tracking-tight text-zinc-400 group-hover:text-zinc-200 text-xs sm:text-[13px]">
                      lend an ear
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      uiSfx.playClick();
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => uiSfx.playHover()}
                    className="group flex items-center gap-1.5 font-normal text-white hover:text-zinc-300 transition-colors tracking-tight text-xs sm:text-[13px] cursor-pointer lowercase"
                  >
                    <span>close</span>
                    <AnimatedClose size={13} className="text-zinc-400 group-hover:text-white" />
                  </button>
                </motion.div>

                {/* Middle Main Navigation List: portfolio, identity, thought, evidence, leave a thought */}
                <nav className="flex flex-col space-y-2.5 sm:space-y-3 my-auto pl-0.5">
                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNav(() => onScrollTo('projects'));
                      }}
                      onMouseEnter={() => uiSfx.playHover()}
                      className="group flex items-center justify-between text-left text-[29px] sm:text-[34px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-[1.2] cursor-pointer lowercase w-full"
                    >
                      <span>portfolio</span>
                      <AnimatedFolder size={18} className="text-zinc-500 group-hover:text-white transition-colors opacity-70 group-hover:opacity-100" />
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNav(onOpenStory);
                      }}
                      onMouseEnter={() => uiSfx.playHover()}
                      className="group flex items-center justify-between text-left text-[29px] sm:text-[34px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-[1.2] cursor-pointer lowercase w-full"
                    >
                      <span>identity</span>
                      <AnimatedUser size={18} className="text-zinc-500 group-hover:text-white transition-colors opacity-70 group-hover:opacity-100" />
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNav(() => onScrollTo('thought'));
                      }}
                      onMouseEnter={() => uiSfx.playHover()}
                      className="group flex items-center justify-between text-left text-[29px] sm:text-[34px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-[1.2] cursor-pointer lowercase w-full"
                    >
                      <span>thought</span>
                      <AnimatedSparkle size={18} className="text-zinc-500 group-hover:text-white transition-colors opacity-70 group-hover:opacity-100" />
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNav(() => onScrollTo('stats'));
                      }}
                      onMouseEnter={() => uiSfx.playHover()}
                      className="group flex items-center justify-between text-left text-[29px] sm:text-[34px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-[1.2] cursor-pointer lowercase w-full"
                    >
                      <span>evidence</span>
                      <AnimatedEvidence size={18} className="text-zinc-500 group-hover:text-white transition-colors opacity-70 group-hover:opacity-100" />
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNav(onOpenContact);
                      }}
                      onMouseEnter={() => uiSfx.playHover()}
                      className="group flex items-center justify-between text-left text-[29px] sm:text-[34px] font-normal tracking-tight text-zinc-300 hover:text-white transition-all duration-200 hover:translate-x-1 leading-[1.2] cursor-pointer lowercase w-full"
                    >
                      <span>leave a thought</span>
                      <AnimatedMail size={18} className="text-zinc-500 group-hover:text-white transition-colors opacity-70 group-hover:opacity-100" />
                    </button>
                  </motion.div>
                </nav>

                {/* Bottom Row: [ jason ] / [ steward jason liuwindra ]        instagram   github */}
                <motion.div variants={itemVariants} className="flex items-center justify-between text-xs sm:text-[13px] pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      uiSfx.playClick();
                      setIsNameToggled((prev) => !prev);
                    }}
                    onMouseEnter={() => {
                      setIsNameHovered(true);
                      uiSfx.playHover();
                    }}
                    onMouseLeave={() => setIsNameHovered(false)}
                    className="font-mono-code text-white text-xs sm:text-[13px] tracking-tight font-normal select-none cursor-pointer hover:text-zinc-300 transition-colors"
                    aria-label={`Toggle brand name: ${(isNameToggled || isNameHovered) ? 'steward jason liuwindra' : 'jason'}`}
                    title="hover atau tekan untuk melihat nama"
                  >
                    [ {(isNameToggled || isNameHovered) ? 'steward jason liuwindra' : 'jason'} ]
                  </button>

                  <div className="flex items-center gap-3.5 sm:gap-4 text-zinc-400 font-normal text-xs sm:text-[13px]">
                    <a
                      href="https://instagram.com/jasonn.doc"
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-0.5 hover:text-white transition-colors lowercase"
                      onClick={(e) => {
                        e.stopPropagation();
                        uiSfx.playClick();
                      }}
                      onMouseEnter={() => uiSfx.playHover()}
                    >
                      <span>instagram</span>
                      <AnimatedArrowUpRight size={10} className="opacity-70 group-hover:opacity-100" />
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-0.5 hover:text-white transition-colors lowercase"
                      onClick={(e) => {
                        e.stopPropagation();
                        uiSfx.playClick();
                      }}
                      onMouseEnter={() => uiSfx.playHover()}
                    >
                      <span>github</span>
                      <AnimatedArrowUpRight size={10} className="opacity-70 group-hover:opacity-100" />
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};
