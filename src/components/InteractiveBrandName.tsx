import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { uiSfx } from '../utils/audio';

interface InteractiveBrandNameProps {
  shortName?: string;
  fullName?: string;
  className?: string;
}

export const InteractiveBrandName: React.FC<InteractiveBrandNameProps> = ({
  shortName = 'jason',
  fullName = 'steward jason liuwindra',
  className = '',
}) => {
  // 3-step cycle: [jason] -> [steward jason liuwindra] -> [     ] -> [jason]
  const [stateIndex, setStateIndex] = useState<number>(0);

  const states = [
    { key: 'short', text: shortName },
    { key: 'full', text: fullName },
    { key: 'empty', text: '' },
  ];

  const current = states[stateIndex];

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    uiSfx.playClick();
    setStateIndex((prev) => (prev + 1) % states.length);
  };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ overflowAnchor: 'none' }}
    >
      <motion.button
        type="button"
        layout="position"
        onClick={handleToggle}
        onMouseEnter={() => uiSfx.playHover()}
        className="group relative inline-flex items-center justify-center font-sans tracking-tight text-2xl sm:text-4xl md:text-5xl select-none cursor-pointer focus:outline-hidden py-1 px-3 rounded-xl h-[56px] sm:h-[68px] md:h-[76px]"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.01 }}
        transition={{
          layout: { type: 'spring', stiffness: 350, damping: 28 },
        }}
        style={{ overflowAnchor: 'none' }}
        aria-label={`Interactive name: ${current.text || 'empty'}. Click to cycle name.`}
        title="click to change"
      >
        {/* Opening bracket */}
        <motion.span
          layout="position"
          className="text-zinc-300 font-light font-sans group-hover:text-zinc-400 transition-colors duration-200"
          transition={{
            layout: { type: 'spring', stiffness: 350, damping: 28 },
          }}
        >
          [
        </motion.span>

        {/* Dynamic content area */}
        <motion.span
          layout="position"
          className="relative inline-flex items-center justify-center px-2 sm:px-3 overflow-visible h-full"
          transition={{
            layout: { type: 'spring', stiffness: 350, damping: 28 },
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {current.text !== '' ? (
              <motion.span
                key={current.key}
                initial={{ opacity: 0, y: 4, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -4, filter: 'blur(3px)' }}
                transition={{
                  duration: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-zinc-900 font-medium px-0.5 tracking-tight lowercase whitespace-nowrap"
              >
                {current.text}
              </motion.span>
            ) : (
              <motion.span
                key="empty-space"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-block w-8 sm:w-16 h-4 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </motion.span>

        {/* Closing bracket */}
        <motion.span
          layout="position"
          className="text-zinc-300 font-light font-sans group-hover:text-zinc-400 transition-colors duration-200"
          transition={{
            layout: { type: 'spring', stiffness: 350, damping: 28 },
          }}
        >
          ]
        </motion.span>
      </motion.button>
    </div>
  );
};
