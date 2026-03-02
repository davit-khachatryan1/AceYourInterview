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
    <div className="pill-control inline-flex items-center gap-1 rounded-[14px] p-1">
      {options.map((option) => {
        const active = theme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              active
                ? 'border border-[color-mix(in_srgb,var(--brand-primary)_18%,var(--border))] bg-[color-mix(in_srgb,var(--brand-primary)_12%,var(--surface-1))] text-[var(--brand-primary)]'
                : 'text-[var(--text-2)] hover:bg-[var(--surface-1)] hover:text-[var(--text-1)]'
            }`}
            aria-pressed={active}
            aria-label={`Switch to ${option.label} theme`}
          >
            <Icon size={13} />
            <span className="hidden md:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
