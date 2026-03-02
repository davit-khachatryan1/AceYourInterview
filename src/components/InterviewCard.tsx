'use client';

import { ArrowUpRight } from 'lucide-react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { NormalizedQuestion } from '@/types/interview';

interface InterviewCardProps {
  question: NormalizedQuestion;
  learned: boolean;
  onLearnedChange: (learned: boolean) => void;
  onOpen: () => void;
}

const InterviewCard = ({ question, learned, onLearnedChange, onOpen }: InterviewCardProps) => {
  const preview = question.explanationText.trim() || question.answerText.trim();

  const stopCardOpen = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };

  return (
    <article
      id={`question-card-${question.id}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className="elevated-card group cursor-pointer p-6"
      aria-label={`Open details for ${question.questionText}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="chip-pill">
          {question.topicLabel}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--light-caramel)] opacity-80 transition-opacity group-hover:text-[var(--soft-peach)] group-hover:opacity-100">
          Open
          <ArrowUpRight size={13} />
        </span>
      </div>

      <h3 className="text-lg font-semibold tracking-[-0.01em] text-[var(--text-1)] md:text-xl">{question.questionText}</h3>

      <p className="mt-3 max-h-[4.7rem] overflow-hidden text-sm leading-relaxed text-[var(--text-2)]">{preview}</p>

      {question.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.slice(0, 3).map((tag) => (
            <span key={`${question.id}-${tag}`} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onOpen} className="btn-accent-soft text-xs">
          Open Details
        </button>

        <label
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--text-2)]"
          onClick={stopCardOpen}
          onKeyDown={stopCardOpen}
        >
          <input
            type="checkbox"
            checked={learned}
            onChange={(event) => onLearnedChange(event.target.checked)}
            className="h-4 w-4 rounded border border-[var(--border)] bg-transparent"
          />
          Mark as Learned
        </label>
      </div>
    </article>
  );
};

export default InterviewCard;
