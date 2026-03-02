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
    <div className="pill-control relative flex h-10 w-32 items-center gap-1 rounded-[12px] p-1">
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-[10px] border border-[color-mix(in_srgb,var(--brand-primary)_18%,var(--border))] bg-[color-mix(in_srgb,var(--brand-primary)_12%,var(--surface-1))]"
        animate={{ x: language === 'en' ? '100%' : '0%' }}
        transition={{ duration: 0.18, ease: [0.2, 0.84, 0.24, 1] }}
      />

      {options.map((option) => {
        const selected = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`relative z-10 flex h-full flex-1 items-center justify-center rounded-[10px] text-[11px] font-semibold tracking-[0.1em] transition-colors duration-300 ${
              selected ? 'text-[var(--brand-primary)]' : 'text-[var(--text-2)]'
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
