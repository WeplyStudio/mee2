import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export type BlindsTransitionStage = 'idle' | 'closing' | 'opening';

interface CurtainBlindsTransitionProps {
  stage: BlindsTransitionStage;
  targetPageName?: string;
  onClosed?: () => void;
  onOpened?: () => void;
}

const NUM_SLATS = 8;
const SLATS_ARRAY = Array.from({ length: NUM_SLATS }, (_, i) => i);

export const CurtainBlindsTransition: React.FC<CurtainBlindsTransitionProps> = ({
  stage,
  targetPageName,
  onClosed,
  onOpened,
}) => {
  const hasTriggeredClosedRef = useRef(false);
  const hasTriggeredOpenedRef = useRef(false);

  useEffect(() => {
    hasTriggeredClosedRef.current = false;
    hasTriggeredOpenedRef.current = false;

    if (stage === 'closing') {
      // Safety fallback timer in case animation event is throttled
      const fallbackTimer = setTimeout(() => {
        if (!hasTriggeredClosedRef.current) {
          hasTriggeredClosedRef.current = true;
          onClosed?.();
        }
      }, 550);
      return () => clearTimeout(fallbackTimer);
    } else if (stage === 'opening') {
      const fallbackTimer = setTimeout(() => {
        if (!hasTriggeredOpenedRef.current) {
          hasTriggeredOpenedRef.current = true;
          onOpened?.();
        }
      }, 550);
      return () => clearTimeout(fallbackTimer);
    }
  }, [stage, onClosed, onOpened]);

  if (stage === 'idle') return null;

  const isClosing = stage === 'closing';

  return (
    <div
      className="fixed inset-0 z-[99999] pointer-events-auto overflow-hidden select-none"
      aria-hidden="true"
    >
      {SLATS_ARRAY.map((index) => {
        const isCenterSlat = index === Math.floor(NUM_SLATS / 2);

        return (
          <motion.div
            key={`${stage}-${index}`}
            initial={{ scaleY: isClosing ? 0 : 1 }}
            animate={{ scaleY: isClosing ? 1 : 0 }}
            transition={{
              duration: 0.34,
              delay: index * 0.028,
              ease: [0.76, 0, 0.24, 1],
            }}
            onAnimationComplete={() => {
              if (isClosing && index === NUM_SLATS - 1) {
                if (!hasTriggeredClosedRef.current) {
                  hasTriggeredClosedRef.current = true;
                  onClosed?.();
                }
              } else if (!isClosing && index === NUM_SLATS - 1) {
                if (!hasTriggeredOpenedRef.current) {
                  hasTriggeredOpenedRef.current = true;
                  onOpened?.();
                }
              }
            }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              top: `${(index * 100) / NUM_SLATS}%`,
              height: `calc(${100 / NUM_SLATS}vh + 1.5px)`,
              transformOrigin: isClosing ? 'top' : 'bottom',
              willChange: 'transform',
            }}
            className="w-full bg-[#0a0a0c] border-b border-white/[0.08] shadow-2xl flex items-center justify-between px-6 sm:px-12 relative"
          >
            {/* Clean centered page name only */}
            {isCenterSlat && targetPageName && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs sm:text-sm md:text-base font-mono-code text-zinc-200 uppercase tracking-widest font-medium">
                  {targetPageName}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
