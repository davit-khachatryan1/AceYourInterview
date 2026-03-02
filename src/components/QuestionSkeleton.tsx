'use client';

const QuestionSkeleton = () => {
  return (
    <article className="elevated-card animate-pulse rounded-[16px] p-6">
      <div className="h-6 w-24 rounded-md bg-[color-mix(in_srgb,var(--surface-1)_70%,var(--border))]" />
      <div className="mt-4 h-5 w-5/6 rounded bg-[color-mix(in_srgb,var(--surface-1)_70%,var(--border))]" />
      <div className="mt-2 h-5 w-2/3 rounded bg-[color-mix(in_srgb,var(--surface-1)_70%,var(--border))]" />
      <div className="mt-6 h-10 w-36 rounded-md bg-[color-mix(in_srgb,var(--surface-1)_70%,var(--border))]" />
      <div className="mt-6 space-y-2">
        <div className="h-4 w-full rounded bg-[color-mix(in_srgb,var(--surface-1)_70%,var(--border))]" />
        <div className="h-4 w-11/12 rounded bg-[color-mix(in_srgb,var(--surface-1)_70%,var(--border))]" />
        <div className="h-4 w-3/4 rounded bg-[color-mix(in_srgb,var(--surface-1)_70%,var(--border))]" />
      </div>
    </article>
  );
};

export default QuestionSkeleton;
