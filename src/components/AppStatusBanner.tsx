'use client';

import { AlertTriangle, Database, Loader2, Sparkles } from 'lucide-react';

type StatusVariant = 'loading' | 'firebase_setup_needed' | 'firestore_unavailable' | 'demo_mode';

interface AppStatusBannerProps {
  variant: StatusVariant;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const styles: Record<StatusVariant, { icon: typeof Loader2; className: string; title: string }> = {
  loading: {
    icon: Loader2,
    className: 'status-loading',
    title: 'Loading',
  },
  firebase_setup_needed: {
    icon: AlertTriangle,
    className: 'status-warning',
    title: 'Firebase Setup Needed',
  },
  firestore_unavailable: {
    icon: Database,
    className: 'status-warning',
    title: 'Firestore Unavailable',
  },
  demo_mode: {
    icon: Sparkles,
    className: 'status-demo',
    title: 'Demo Mode',
  },
};

const AppStatusBanner = ({ variant, message, actionLabel, onAction }: AppStatusBannerProps) => {
  const meta = styles[variant];
  const Icon = meta.icon;

  return (
    <div className={`status-banner mb-6 ${meta.className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 text-[var(--text-2)]">
          <Icon size={16} className={variant === 'loading' ? 'animate-spin' : ''} />
          <div>
            <p className="text-sm font-semibold text-[var(--text-1)]">{meta.title}</p>
            <p className="text-sm text-[var(--text-2)]">{message}</p>
          </div>
        </div>

        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className="btn-secondary text-xs">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default AppStatusBanner;
