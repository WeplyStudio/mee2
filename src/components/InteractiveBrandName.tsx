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
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);

  // Expanded on desktop hover OR on touch/click toggle for mobile accessibility
  const isExpanded = isHovered || isToggled;
  const currentText = isExpanded ? fullName : shortName;

  const handleMouseEnter = () => {
    setIsHovered(true);
    uiSfx.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    uiSfx.playClick();
    setIsToggled((prev) => !prev);
  };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ overflowAnchor: 'none' }}
    >
      <motion.button
        type="button"
        layout="position"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative inline-flex items-center justify-center font-sans tracking-tight text-2xl sm:text-4xl md:text-5xl select-none cursor-pointer focus:outline-hidden py-1 px-3 rounded-xl h-[56px] sm:h-[68px] md:h-[76px]"
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        transition={{
          layout: { type: 'spring', stiffness: 350, damping: 28 },
        }}
        style={{ overflowAnchor: 'none' }}
        aria-label={`Interactive name: ${currentText}`}
        title="hover to view full name"
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
            <motion.span
              key={currentText}
              initial={{ opacity: 0, y: 4, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(3px)' }}
              transition={{
                duration: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-zinc-900 font-medium px-0.5 tracking-tight lowercase whitespace-nowrap"
            >
              {currentText}
            </motion.span>
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
