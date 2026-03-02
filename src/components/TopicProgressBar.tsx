'use client';

import { motion } from 'framer-motion';

interface TopicProgressBarProps {
  percentage: number;
}

const TopicProgressBar = ({ percentage }: TopicProgressBarProps) => {
  return (
    <div className="sticky top-0 z-30 h-[3px] w-full bg-[color-mix(in_srgb,var(--surface-2)_78%,transparent)]">
      <motion.div
        className="h-full bg-[linear-gradient(90deg,var(--sage-green),var(--light-caramel),var(--burnt-peach))]"
        initial={false}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.42, ease: [0.2, 0.9, 0.3, 1] }}
      />
    </div>
  );
};

export default TopicProgressBar;
