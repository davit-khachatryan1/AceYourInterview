import type { HTMLAttributes } from 'react';

type BadgeVariant = 'topic' | 'tag' | 'status' | 'kbd' | 'muted';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClassName: Record<BadgeVariant, string> = {
  topic: 'chip-pill',
  tag: 'tag-chip',
  status: 'micro-badge',
  kbd: 'kbd-badge',
  muted:
    'inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)]',
};

const Badge = ({ variant = 'muted', className, ...props }: BadgeProps) => {
  const resolvedClassName = [variantClassName[variant], className].filter(Boolean).join(' ');
  return <span className={resolvedClassName} {...props} />;
};

export default Badge;
