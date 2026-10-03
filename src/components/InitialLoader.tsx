import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { uiSfx } from '../utils/audio';

interface InitialLoaderProps {
  onComplete?: () => void;
  lang?: string;
}

export const InitialLoader: React.FC<InitialLoaderProps> = ({ onComplete }) => {
  // Stage 0: 'hi'
  // Stage 1: "i'm Jason!"
  // Stage 2: Curtain slide up exit
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lock body scrolling while loader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 3 Seconds exact counter (0% -> 100%): 100 steps * 30ms = 3000ms (3.0s)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Sequence timeline:
    // t = 0ms: step 0 ("hi")
    // t = 1500ms: step 1 ("i'm Jason!")
    // t = 3050ms: step 2 (curtain slide up exit after 3s loader completes)
    const timer1 = setTimeout(() => {
      try {
        uiSfx.playSwitch();
      } catch {}
      setStep(1);
    }, 1500);

    const timer2 = setTimeout(() => {
      try {
        uiSfx.playClick();
      } catch {}
      setStep(2);
    }, 3050);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearInterval(interval);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = '';
        onComplete?.();
      }}
    >
      {step < 2 && (
        <React.Fragment key="initial-loader-wrapper">
          {/* Solid White Screen Backdrop */}
          <motion.div
            key="initial-loader-solid-bg"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ zIndex: 2147483646, backgroundColor: '#ffffff' }}
            className="fixed inset-0 top-0 left-0 w-full h-full bg-white pointer-events-auto"
          />

          {/* Main Slide-Up Animated White Curtain Layer */}
          <motion.div
            key="initial-loader-curtain"
            initial={{ y: '0%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{
              duration: 0.9,
              ease: [0.76, 0, 0.24, 1], // Custom cubic-bezier luxury curtain slide up
            }}
            style={{ zIndex: 2147483647, backgroundColor: '#ffffff' }}
            className="fixed inset-0 top-0 left-0 w-screen h-screen bg-white text-zinc-900 flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden font-sans pointer-events-auto border-b border-zinc-200/50 shadow-2xl"
          >
            {/* Top Bar - Clean & Minimal */}
            <div className="flex justify-between items-center text-xs font-mono-code text-zinc-400 uppercase tracking-widest">
              <div></div>
              <div className="text-zinc-400">2026</div>
            </div>

            {/* Center Main Container: Text Slide + Centered Counter */}
            <div className="flex-1 flex flex-col items-center justify-center relative my-auto">
              {/* Slide Up Text Animation */}
              <div className="overflow-hidden relative h-[90px] sm:h-[130px] md:h-[160px] w-full flex items-center justify-center px-4">
                <AnimatePresence mode="wait">
                  {step === 0 ? (
                    <motion.div
                      key="text-hi"
                      initial={{ y: '130%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{ y: '-130%', opacity: 0 }}
                      transition={{
                        duration: 0.55,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-zinc-900 lowercase flex items-center gap-1 sm:gap-2"
                    >
                      <span>hi</span>
                      <span className="text-[#d92338]">.</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="text-jason"
                      initial={{ y: '130%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{ y: '-130%', opacity: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-900 lowercase flex items-center gap-1 sm:gap-2 whitespace-nowrap"
                    >
                      <span>i'm Jason!</span>
                      <span className="text-[#d92338] text-3xl sm:text-5xl md:text-6xl">✦</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Centered Counter (3 Seconds Exact Duration, Medium-Large Clean Size) */}
              <div className="mt-8 sm:mt-12 flex flex-col items-center gap-3">
                <div className="text-xl sm:text-2xl md:text-3xl font-mono-code font-bold text-zinc-800 tracking-widest tabular-nums">
                  [ {String(progress).padStart(3, '0')}% ]
                </div>

                {/* Subtle Centered Progress Bar Line */}
                <div className="w-36 sm:w-60 h-[2.5px] bg-zinc-100 rounded-full overflow-hidden relative border border-zinc-200/70">
                  <motion.div
                    className="h-full bg-[#d92338]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'linear', duration: 0.03 }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Footer inside Loader */}
            <div className="flex justify-between items-end text-[11px] sm:text-xs font-mono-code text-zinc-500">
              <div className="space-y-0.5">
                <div className="text-zinc-700 font-medium">[designer & software engineer]</div>
                <div className="text-zinc-400">jakarta / worldwide</div>
              </div>

              <div className="text-zinc-400 font-mono-code">
                [ 001 / 001 ]
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>,
    document.body
  );
};
