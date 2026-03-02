'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { NormalizedQuestion } from '@/types/interview';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  questions: NormalizedQuestion[];
  activeTopicId: string | null;
  onSelectQuestion: (questionId: string, topicId: string) => void;
}

const SearchDialog = ({ open, onClose, questions, activeTopicId, onSelectQuestion }: SearchDialogProps) => {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [searchAllTopics, setSearchAllTopics] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedValue(query, 120);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSearchAllTopics(false);
    }
  }, [open]);

  const scopedQuestions = useMemo(() => {
    if (searchAllTopics || !activeTopicId) {
      return questions;
    }

    return questions.filter((question) => question.topicId === activeTopicId);
  }, [activeTopicId, questions, searchAllTopics]);

  const results = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    if (!needle) {
      return scopedQuestions.slice(0, 12);
    }

    return scopedQuestions
      .filter((question) => {
        const haystack = `${question.questionText} ${question.answerText} ${question.tags.join(' ')} ${question.topicLabel}`.toLowerCase();
        return haystack.includes(needle);
      })
      .slice(0, 24);
  }, [debouncedQuery, scopedQuestions]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-[var(--overlay)]"
            aria-label="Close search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.section
            className="fixed left-1/2 top-[8vh] z-50 w-[min(980px,94vw)] -translate-x-1/2 panel-surface overflow-hidden rounded-[18px]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search questions"
          >
            <div className="border-b border-[var(--border)] p-4 md:p-5">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-[var(--text-3)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search questions, examples, and tags..."
                  className="search-input w-full bg-transparent"
                />
                <button type="button" onClick={onClose} className="icon-button" aria-label="Close search dialog">
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSearchAllTopics((current) => !current)}
                  className={`pill-control px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${searchAllTopics ? 'border-[color-mix(in_srgb,var(--sage-green)_58%,var(--border))] bg-[color-mix(in_srgb,var(--lemon-chiffon)_22%,var(--surface-2))] text-[var(--text-1)]' : 'text-[var(--text-3)]'}`}
                >
                  {searchAllTopics ? 'All Topics' : 'Current Topic'}
                </button>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-3)]">{results.length} results</p>
              </div>
            </div>

            <div className="max-h-[58vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="p-4 text-sm text-[var(--text-2)]">No matching questions.</p>
              ) : (
                <ul className="space-y-1">
                  {results.map((result, index) => (
                    <motion.li
                      key={result.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.01 }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectQuestion(result.id, result.topicId);
                          onClose();
                        }}
                        className="interactive-row w-full px-4 py-3 text-left hover:border-[color-mix(in_srgb,var(--sage-green)_64%,var(--border))] hover:bg-[color-mix(in_srgb,var(--surface-1)_82%,var(--lemon-chiffon)_18%)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-[var(--text-1)]">{result.questionText}</p>
                          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">{result.topicLabel}</span>
                        </div>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchDialog;
