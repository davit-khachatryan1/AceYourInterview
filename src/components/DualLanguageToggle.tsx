'use client';

import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import type { Language } from '@/types/interview';

const options: Array<{ label: string; flag: string; value: Language }> = [
  { label: 'ARM', flag: '🇦🇲', value: 'am' },
  { label: 'ENG', flag: '🇺🇸', value: 'en' },
];

const DualLanguageToggle = () => {
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  return (
    <div
      className="relative flex h-12 items-center gap-0.5 rounded-[14px] p-1"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        width: '9.5rem',
      }}
    >
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-[11px]"
        style={{
          background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(236,72,153,0.12))',
          border: '1px solid rgba(124,58,237,0.35)',
          boxShadow: '0 0 12px rgba(124,58,237,0.2)',
        }}
        animate={{ x: language === 'en' ? '100%' : '0%' }}
        transition={{ duration: 0.2, ease: [0.2, 0.84, 0.24, 1] }}
      />

      {options.map((option) => {
        const selected = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className="relative z-10 flex h-full flex-1 items-center justify-center gap-1.5 rounded-[11px] text-xs font-semibold tracking-[0.06em] transition-colors duration-200"
            style={{ color: selected ? '#c4b5fd' : 'var(--text-2)' }}
            onClick={() => setLanguage(option.value)}
            aria-pressed={selected}
          >
            <span className="text-sm">{option.flag}</span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default DualLanguageToggle;
