'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Copy, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import type { NormalizedQuestion } from '@/types/interview';

type SectionId = 'answer' | 'code-parts' | 'examples' | 'pitfalls' | 'followups';

interface QuestionDetailModalProps {
  question: NormalizedQuestion | null;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  learned: boolean;
  onLearnedChange: (learned: boolean) => void;
}

const sectionItems: Array<{ id: SectionId; label: string }> = [
  { id: 'answer', label: 'Answer' },
  { id: 'code-parts', label: 'Code Parts' },
  { id: 'examples', label: 'Examples' },
  { id: 'pitfalls', label: 'Pitfalls' },
  { id: 'followups', label: 'Follow-ups' },
];

const fallbackCopy = async (value: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const CodeBlock = ({ codeSnippet, codeLanguage }: { codeSnippet: string; codeLanguage: string }) => {
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const [codeHtml, setCodeHtml] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    let canceled = false;

    const render = async () => {
      try {
        const { codeToHtml } = await import('shiki');
        const html = await codeToHtml(codeSnippet, {
          lang: codeLanguage,
          theme: resolvedTheme === 'light' ? 'github-light' : 'github-dark',
        });

        if (!canceled) {
          setCodeHtml(html);
        }
      } catch {
        if (!canceled) {
          setCodeHtml(null);
        }
      }
    };

    void render();

    return () => {
      canceled = true;
    };
  }, [codeLanguage, codeSnippet, resolvedTheme]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(codeSnippet);
      } else {
        await fallbackCopy(codeSnippet);
      }

      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 1200);
    } catch {
      setCopySuccess(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--code-bg)]">
      <button
        type="button"
        onClick={handleCopy}
        className="icon-button absolute right-3 top-3 z-10 px-2.5 py-1 text-xs"
      >
        {copySuccess ? <Check size={13} /> : <Copy size={13} />}
        {copySuccess ? 'Copied' : 'Copy'}
      </button>

      {codeHtml ? (
        <div className="overflow-x-auto p-4 text-sm" dangerouslySetInnerHTML={{ __html: codeHtml }} />
      ) : (
        <pre className="overflow-x-auto p-4 text-sm text-slate-100">
          <code>{codeSnippet}</code>
        </pre>
      )}
    </div>
  );
};

const QuestionDetailModal = ({
  question,
  open,
  onClose,
  onPrev,
  onNext,
  canPrev,
  canNext,
  learned,
  onLearnedChange,
}: QuestionDetailModalProps) => {
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});
  const [activeSection, setActiveSection] = useState<SectionId>('answer');

  const primaryCode = useMemo(() => {
    if (!question) {
      return null;
    }

    if (question.codeSnippet && question.codeSnippet.trim().length > 0) {
      return {
        codeSnippet: question.codeSnippet,
        codeLanguage: question.codeLanguage ?? 'tsx',
      };
    }

    const firstExample = question.examples.find((example) => example.codeSnippet.trim().length > 0);
    if (!firstExample) {
      return null;
    }

    return {
      codeSnippet: firstExample.codeSnippet,
      codeLanguage: firstExample.codeLanguage,
    };
  }, [question]);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => dialogRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      previousActiveElementRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || !contentRef.current) {
      return;
    }

    const container = contentRef.current;

    const syncActiveSection = () => {
      const topOffset = 170;
      let current: SectionId = 'answer';

      for (const item of sectionItems) {
        const section = sectionRefs.current[item.id];
        if (!section) {
          continue;
        }

        const y = section.getBoundingClientRect().top - container.getBoundingClientRect().top;
        if (y <= topOffset) {
          current = item.id;
        }
      }

      setActiveSection(current);
    };

    syncActiveSection();
    container.addEventListener('scroll', syncActiveSection, { passive: true });

    return () => container.removeEventListener('scroll', syncActiveSection);
  }, [open, question?.id]);

  if (!question) {
    return null;
  }

  const modalIdBase = `question-modal-${question.id}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-[var(--overlay)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close question details"
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${modalIdBase}-title`}
            className="fixed inset-0 z-50 p-0 md:inset-6 md:p-0"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.985 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.28, ease: [0.16, 0.95, 0.24, 1] }}
          >
            <div
              ref={dialogRef}
              tabIndex={-1}
              className="flex h-full flex-col rounded-none bg-[var(--surface-1)] md:mx-auto md:max-w-6xl md:rounded-[24px] md:border md:border-[var(--border)] md:shadow-[var(--shadow-strong)]"
            >
              <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface-1)] p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="chip-pill">
                        {question.topicLabel}
                      </span>
                      {question.tags.map((tag) => (
                        <span
                          key={`${question.id}-${tag}`}
                          className="tag-chip text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h2 id={`${modalIdBase}-title`} className="display-heading text-xl text-[var(--text-1)] md:text-[2rem]">
                      {question.questionText}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="pill-control inline-flex cursor-pointer items-center gap-2 border-[var(--chip-border)] bg-[var(--chip-bg)] px-3 py-1.5 text-xs text-[var(--chip-text)]">
                      <input
                        type="checkbox"
                        checked={learned}
                        onChange={(event) => onLearnedChange(event.target.checked)}
                        className="h-4 w-4 rounded border border-[var(--border)] bg-transparent"
                      />
                      Mark Learned
                    </label>

                    <button type="button" onClick={onPrev} disabled={!canPrev} className="icon-button" aria-label="Previous question">
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button" onClick={onNext} disabled={!canNext} className="icon-button" aria-label="Next question">
                      <ChevronRight size={16} />
                    </button>
                    <button type="button" onClick={onClose} className="icon-button" aria-label="Close modal">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {sectionItems.map((item) => {
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          sectionRefs.current[item.id]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
                          setActiveSection(item.id);
                        }}
                        className={`pill-control px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all ${
                          active
                            ? 'border-[color-mix(in_srgb,var(--brand-primary)_18%,var(--border))] bg-[color-mix(in_srgb,var(--brand-primary)_10%,var(--surface-1))] text-[var(--brand-primary)]'
                            : 'text-[var(--text-3)]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </header>

              <div ref={contentRef} className="flex-1 space-y-7 overflow-y-auto p-4 md:p-6">
                <motion.section
                  id={`${modalIdBase}-answer`}
                  ref={(node) => {
                    sectionRefs.current.answer = node;
                  }}
                  className="panel-surface space-y-3 p-5"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.03 }}
                >
                  <h3 className="display-heading text-[1.4rem] text-[var(--text-1)]">Answer</h3>
                  <p className="leading-relaxed text-[var(--text-2)]">{question.explanationText}</p>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="text-sm font-semibold text-[var(--text-1)]">Interview summary</p>
                    <p className="mt-2 leading-relaxed text-[var(--text-2)]">{question.answerText}</p>
                  </div>
                </motion.section>

                <motion.section
                  id={`${modalIdBase}-code-parts`}
                  ref={(node) => {
                    sectionRefs.current['code-parts'] = node;
                  }}
                  className="panel-surface space-y-3 p-5"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.06 }}
                >
                  <h3 className="display-heading text-[1.4rem] text-[var(--text-1)]">Code Parts</h3>
                  {primaryCode ? (
                    <CodeBlock codeSnippet={primaryCode.codeSnippet} codeLanguage={primaryCode.codeLanguage} />
                  ) : (
                    <p className="text-sm text-[var(--text-2)]">No primary code snippet available for this question.</p>
                  )}
                </motion.section>

                <motion.section
                  id={`${modalIdBase}-examples`}
                  ref={(node) => {
                    sectionRefs.current.examples = node;
                  }}
                  className="panel-surface space-y-3 p-5"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.09 }}
                >
                  <h3 className="display-heading text-[1.4rem] text-[var(--text-1)]">Examples</h3>
                  {question.examples.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {question.examples.map((example) => (
                        <article key={example.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                          <h4 className="text-base font-semibold text-[var(--text-1)]">{example.title}</h4>
                          <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">{example.description}</p>
                          <div className="mt-3">
                            <CodeBlock codeSnippet={example.codeSnippet} codeLanguage={example.codeLanguage} />
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-2)]">No detailed examples available yet.</p>
                  )}
                </motion.section>

                <motion.section
                  id={`${modalIdBase}-pitfalls`}
                  ref={(node) => {
                    sectionRefs.current.pitfalls = node;
                  }}
                  className="panel-surface space-y-3 p-5"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.12 }}
                >
                  <h3 className="display-heading text-[1.4rem] text-[var(--text-1)]">Pitfalls</h3>
                  {question.pitfalls.length > 0 ? (
                    <ul className="space-y-2">
                      {question.pitfalls.map((pitfall, index) => (
                        <li key={`${question.id}-pitfall-${index}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-2)]">
                          {pitfall}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--text-2)]">No documented pitfalls yet. Add them in admin for this question.</p>
                  )}
                </motion.section>

                <motion.section
                  id={`${modalIdBase}-followups`}
                  ref={(node) => {
                    sectionRefs.current.followups = node;
                  }}
                  className="panel-surface space-y-3 p-5"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.15 }}
                >
                  <h3 className="display-heading text-[1.4rem] text-[var(--text-1)]">Follow-ups</h3>
                  {question.followups.length > 0 ? (
                    <ul className="space-y-2">
                      {question.followups.map((followup, index) => (
                        <li key={`${question.id}-followup-${index}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-2)]">
                          {followup}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--text-2)]">No follow-up prompts documented yet.</p>
                  )}
                </motion.section>
              </div>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuestionDetailModal;
