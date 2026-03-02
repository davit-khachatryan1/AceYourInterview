'use client';

import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import type { Language } from '@/types/interview';

const options: Array<{ label: string; value: Language }> = [
  { label: 'ARM', value: 'am' },
  { label: 'ENG', value: 'en' },
];

const DualLanguageToggle = () => {
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  return (
    <div className="pill-control relative flex h-11 w-40 items-center gap-1 rounded-[14px] p-1">
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-[10px] border border-[color-mix(in_srgb,var(--burnt-peach)_56%,transparent)] bg-[linear-gradient(180deg,var(--soft-peach),var(--light-caramel))] shadow-[0_8px_18px_color-mix(in_srgb,var(--burnt-peach)_34%,transparent)]"
        animate={{ x: language === 'en' ? '100%' : '0%' }}
        transition={{ duration: 0.26, ease: [0.2, 0.84, 0.24, 1] }}
      />

      {options.map((option) => {
        const selected = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`relative z-10 flex-1 rounded-lg text-xs font-semibold tracking-[0.12em] transition-colors duration-300 ${
              selected ? 'text-[var(--pitch-black)]' : 'text-[var(--text-2)]'
            }`}
            onClick={() => setLanguage(option.value)}
            aria-pressed={selected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default DualLanguageToggle;
