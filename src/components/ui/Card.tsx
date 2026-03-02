import { createElement, type HTMLAttributes } from 'react';

type CardTag = 'div' | 'section' | 'article';
type CardVariant = 'default' | 'interactive' | 'subtle';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardTag;
  variant?: CardVariant;
  padding?: CardPadding;
}

const variantClassName: Record<CardVariant, string> = {
  default: 'panel-surface',
  interactive: 'elevated-card',
  subtle: 'rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-2)]',
};

const paddingClassName: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

const Card = ({
  as = 'div',
  className,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) => {
  const resolvedClassName = [variantClassName[variant], paddingClassName[padding], className]
    .filter(Boolean)
    .join(' ');

  return createElement(as, {
    ...props,
    className: resolvedClassName,
  });
};

export default Card;
