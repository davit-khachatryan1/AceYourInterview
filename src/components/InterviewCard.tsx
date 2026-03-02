'use client';

import { ArrowUpRight, MoreHorizontal } from 'lucide-react';
import type { KeyboardEvent, MouseEvent } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
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
    <Card
      as="article"
      variant="interactive"
      padding="lg"
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
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden"
      aria-label={`Open details for ${question.questionText}`}
    >
      {/* Gradient accent line at top, revealed on hover */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, #7c3aed, #ec4899)' }}
      />

      <div className="mb-4 flex items-start justify-between gap-3">
        <Badge variant="topic">{question.topicLabel}</Badge>
        <button
          type="button"
          className="icon-button h-9 w-9"
          onClick={(event) => {
            stopCardOpen(event);
            onOpen();
          }}
          aria-label="Open question actions"
        >
          <MoreHorizontal size={15} />
        </button>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold tracking-[-0.02em] text-[var(--text-1)] md:text-lg">
          {question.questionText}
        </h3>

        <p className="mt-3 max-h-[4.5rem] overflow-hidden text-sm leading-relaxed text-[var(--text-2)]">
          {preview}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {question.tags.slice(0, 3).map((tag) => (
          <Badge key={`${question.id}-${tag}`} variant="tag">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <Button type="button" variant="primary" size="sm" onClick={onOpen} className="min-w-[6.5rem]">
          Start
          <ArrowUpRight size={14} />
        </Button>

        <label
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--text-2)]"
          onClick={stopCardOpen}
          onKeyDown={stopCardOpen}
        >
          <input
            type="checkbox"
            checked={learned}
            onChange={(event) => onLearnedChange(event.target.checked)}
            className="h-4 w-4 rounded border border-[var(--border)] bg-transparent accent-[#7c3aed]"
          />
          {learned ? <span className="font-semibold text-[var(--brand-primary)]">Learned ✓</span> : 'Mark as learned'}
        </label>
      </div>
    </Card>
  );
};

export default InterviewCard;
