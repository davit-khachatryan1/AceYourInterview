'use client';

const QuestionSkeleton = () => {
  return (
    <article className="elevated-card animate-pulse p-6">
      <div className="h-6 w-20 rounded-full bg-[var(--surface-3)]" />
      <div className="mt-5 h-5 w-5/6 rounded bg-[var(--surface-3)]" />
      <div className="mt-2 h-5 w-2/3 rounded bg-[var(--surface-3)]" />
      <div className="mt-5 h-12 w-full rounded-xl bg-[var(--surface-2)]" />
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-[var(--surface-2)]" />
        <div className="h-6 w-20 rounded-full bg-[var(--surface-2)]" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <div className="h-9 w-24 rounded-xl bg-[var(--surface-2)]" />
        <div className="h-5 w-28 rounded bg-[var(--surface-3)]" />
      </div>
    </article>
  );
};

export default QuestionSkeleton;
