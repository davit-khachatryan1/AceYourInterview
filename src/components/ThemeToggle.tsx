'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { ThemePreference } from '@/store/uiStore';

const options: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="relative inline-flex h-12 items-center gap-0.5 rounded-[14px] p-1"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      {options.map((option) => {
        const active = theme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className="relative inline-flex h-full items-center gap-1.5 rounded-[11px] px-3 py-2 text-xs font-semibold transition-all duration-200"
            style={active ? {
              background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(236,72,153,0.12))',
              border: '1px solid rgba(124,58,237,0.35)',
              color: '#c4b5fd',
              boxShadow: '0 0 12px rgba(124,58,237,0.2)',
            } : {
              border: '1px solid transparent',
              color: 'var(--text-2)',
            }}
            aria-pressed={active}
            aria-label={`Switch to ${option.label} theme`}
          >
            <Icon size={14} />
            <span className="hidden md:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
