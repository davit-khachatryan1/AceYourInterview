'use client';

import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { MouseEvent, KeyboardEvent } from 'react';
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
      className="group relative flex min-h-[300px] cursor-pointer flex-col overflow-hidden"
      aria-label={`Open details for ${question.questionText}`}
    >
      {/* Gradient accent line at top, revealed on hover */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, #7c3aed, #ec4899)' }}
      />

      {/* Learned glow overlay */}
      {learned && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-30"
          style={{ background: 'radial-gradient(ellipse at top left,rgba(124,58,237,0.18) 0%,transparent 60%)' }}
        />
      )}

      {/* Top row: topic badge + learned badge */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <Badge variant="topic">{question.topicLabel}</Badge>
        {learned && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold"
            style={{ borderColor: 'rgba(124,58,237,0.35)', background: 'rgba(124,58,237,0.12)', color: '#a78bfa' }}
          >
            <CheckCircle2 size={11} />
            Learned
          </span>
        )}
      </div>

      {/* Question text — much larger */}
      <div className="flex-1">
        <h3 className="text-lg font-bold leading-snug tracking-[-0.02em] text-[var(--text-1)] md:text-xl">
          {question.questionText}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--text-2)]">
          {preview}
        </p>
      </div>

      {/* Tags */}
      <div className="mt-5 flex flex-wrap gap-2">
        {question.tags.slice(0, 3).map((tag) => (
          <Badge key={`${question.id}-${tag}`} variant="tag">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Bottom action row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
        <Button type="button" variant="primary" size="sm" onClick={onOpen}
          className="min-w-[8rem] px-5 py-2.5 text-sm"
        >
          Study Now
          <ArrowUpRight size={15} />
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
          {learned
            ? <span className="font-semibold text-[var(--brand-primary)]">Marked ✓</span>
            : <span className="text-[var(--text-3)]">Mark as learned</span>
          }
        </label>
      </div>
    </Card>
  );
};

export default InterviewCard;
