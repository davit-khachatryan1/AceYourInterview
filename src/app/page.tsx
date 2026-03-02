'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppStatusBanner from '@/components/AppStatusBanner';
import DualLanguageToggle from '@/components/DualLanguageToggle';
import InterviewCard from '@/components/InterviewCard';
import QuestionDetailModal from '@/components/QuestionDetailModal';
import QuestionSkeleton from '@/components/QuestionSkeleton';
import SearchDialog from '@/components/SearchDialog';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import TopicProgressBar from '@/components/TopicProgressBar';
import { useQuestions } from '@/hooks/useQuestions';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserSession } from '@/hooks/useUserSession';
import { useUIStore } from '@/store/uiStore';
import type { NormalizedQuestion } from '@/types/interview';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  const language = useUIStore((state) => state.language);
  const activeTopicId = useUIStore((state) => state.activeTopicId);
  const setActiveTopicId = useUIStore((state) => state.setActiveTopicId);
  const searchOpen = useUIStore((state) => state.searchOpen);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [queryQuestionId, setQueryQuestionId] = useState<string | null>(null);

  const session = useUserSession();
  const { questions, topics, loading, error, sourceMode, isDemoFallback } = useQuestions();
  const persistenceEnabled = !isDemoFallback && !session.setupRequired;

  const { loading: preferencesLoading } = useUserPreferences({
    uid: session.user?.uid ?? null,
    loading: session.loading,
    error: session.error,
    disabled: !persistenceEnabled,
  });

  useEffect(() => {
    if (topics.length === 0) {
      return;
    }

    const hasActiveTopic = activeTopicId ? topics.some((topic) => topic.id === activeTopicId) : false;
    if (!hasActiveTopic) {
      setActiveTopicId(topics[0]!.id);
    }
  }, [activeTopicId, setActiveTopicId, topics]);

  const filteredQuestions = useMemo(() => {
    if (!activeTopicId) {
      return questions;
    }

    return questions.filter((question) => question.topicId === activeTopicId);
  }, [activeTopicId, questions]);

  const questionIds = useMemo(() => filteredQuestions.map((question) => question.id), [filteredQuestions]);

  const { learnedSet, completionState, markLearned } = useUserProgress(
    session.user?.uid ?? null,
    activeTopicId,
    questionIds,
    { loading: session.loading, error: session.error },
    persistenceEnabled,
  );

  useEffect(() => {
    const syncFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      setQueryQuestionId(params.get('q'));
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);

    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  const updateQuestionQueryParam = useCallback(
    (questionId: string | null) => {
      const params = new URLSearchParams(window.location.search);
      if (questionId) {
        params.set('q', questionId);
      } else {
        params.delete('q');
      }

      const query = params.toString();
      router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
      setQueryQuestionId(questionId);
    },
    [pathname, router],
  );

  const openQuestionModal = useCallback(
    (question: NormalizedQuestion) => {
      if (activeTopicId !== question.topicId) {
        setActiveTopicId(question.topicId);
      }
      setSelectedQuestionId(question.id);
      updateQuestionQueryParam(question.id);
    },
    [activeTopicId, setActiveTopicId, updateQuestionQueryParam],
  );

  const closeQuestionModal = useCallback(() => {
    setSelectedQuestionId(null);
    updateQuestionQueryParam(null);
  }, [updateQuestionQueryParam]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!queryQuestionId) {
      setSelectedQuestionId(null);
      return;
    }

    const target = questions.find((question) => question.id === queryQuestionId);
    if (!target) {
      setSelectedQuestionId(null);
      return;
    }

    if (target.topicId !== activeTopicId) {
      setActiveTopicId(target.topicId);
    }

    setSelectedQuestionId(target.id);
  }, [activeTopicId, loading, queryQuestionId, questions, setActiveTopicId]);

  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId],
  );

  const selectedIndex = useMemo(() => {
    if (!selectedQuestion) {
      return -1;
    }

    return filteredQuestions.findIndex((question) => question.id === selectedQuestion.id);
  }, [filteredQuestions, selectedQuestion]);

  const prevQuestion = selectedIndex > 0 ? filteredQuestions[selectedIndex - 1] : null;
  const nextQuestion = selectedIndex >= 0 && selectedIndex < filteredQuestions.length - 1
    ? filteredQuestions[selectedIndex + 1]
    : null;

  const handleModalNavigation = useCallback(
    (direction: 'prev' | 'next') => {
      const target = direction === 'prev' ? prevQuestion : nextQuestion;
      if (!target) {
        return;
      }

      setSelectedQuestionId(target.id);
      updateQuestionQueryParam(target.id);
    },
    [nextQuestion, prevQuestion, updateQuestionQueryParam],
  );

  useEffect(() => {
    if (!selectedQuestion || searchOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const targetElement = event.target as HTMLElement | null;
      const isTypingTarget =
        targetElement?.tagName === 'INPUT' ||
        targetElement?.tagName === 'TEXTAREA' ||
        targetElement?.isContentEditable;

      if (isTypingTarget) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeQuestionModal();
      }

      if (event.key === 'ArrowLeft' && prevQuestion) {
        event.preventDefault();
        handleModalNavigation('prev');
      }

      if (event.key === 'ArrowRight' && nextQuestion) {
        event.preventDefault();
        handleModalNavigation('next');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeQuestionModal, handleModalNavigation, nextQuestion, prevQuestion, searchOpen, selectedQuestion]);

  const handleQuestionSelection = useCallback(
    (questionId: string, topicId: string) => {
      const selected = questions.find((question) => question.id === questionId);
      if (!selected) {
        setActiveTopicId(topicId);
        return;
      }

      openQuestionModal(selected);
    },
    [openQuestionModal, questions, setActiveTopicId],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === 'Escape' && !selectedQuestion) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedQuestion, setSearchOpen]);

  const status = useMemo(() => {
    if (loading || preferencesLoading) {
      return {
        variant: 'loading' as const,
        message: 'Preparing your interview workspace...',
      };
    }

    if (isDemoFallback && session.setupRequired) {
      return {
        variant: 'firebase_setup_needed' as const,
        message: 'Firebase keys are missing. Demo questions are shown until config is set.',
      };
    }

    if (isDemoFallback && error) {
      return {
        variant: 'firestore_unavailable' as const,
        message: error,
      };
    }

    if (sourceMode === 'demo') {
      return {
        variant: 'demo_mode' as const,
        message: 'Previewing demo interview content.',
      };
    }

    return null;
  }, [error, isDemoFallback, loading, preferencesLoading, session.setupRequired, sourceMode]);

  const activeTopicLabel = topics.find((topic) => topic.id === activeTopicId)?.label ?? 'All Topics';
  const quickTopics = useMemo(() => {
    const maxQuickTopics = 6;
    if (topics.length <= maxQuickTopics) {
      return topics;
    }

    const initial = topics.slice(0, maxQuickTopics);
    const activeTopic = topics.find((topic) => topic.id === activeTopicId);
    if (!activeTopic || initial.some((topic) => topic.id === activeTopic.id)) {
      return initial;
    }

    return [...initial.slice(0, maxQuickTopics - 1), activeTopic];
  }, [activeTopicId, topics]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)]">
      <TopicProgressBar percentage={completionState.percentage} />

      <div className="flex min-h-[calc(100vh-3px)]">
        <Sidebar
          topics={topics}
          activeTopicId={activeTopicId}
          completionPercentage={completionState.percentage}
          onTopicSelect={setActiveTopicId}
          onSearchOpen={() => setSearchOpen(true)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_96%,var(--surface-1))]">
            <div className="space-y-3 px-4 py-4 md:px-6 xl:px-8 2xl:px-10">
              <div className="flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_auto] xl:items-center">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="icon-button md:hidden"
                    aria-label="Open topics"
                  >
                    <Menu size={18} />
                  </button>

                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-black tracking-tight"
                      style={{ background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      AceYourInterview
                    </p>
                    <p className="truncate text-xs text-[var(--text-3)]">
                      {activeTopicId ? activeTopicLabel : 'Interview prep workspace'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="search-input flex w-full items-center gap-3 px-4 py-3 text-left text-sm"
                  aria-label="Open search"
                >
                  <Search size={17} className="text-[var(--text-3)]" />
                  <span className="flex-1 text-[var(--text-2)]">Search questions, examples, and tags</span>
                  <span className="kbd-badge">Cmd K</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <DualLanguageToggle />
                  <ThemeToggle />
                  <Link href={session.user ? '/admin' : '/login'} className="btn-secondary px-4 py-2 text-sm">
                    {session.user ? 'Admin' : 'Sign In'}
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
                  {quickTopics.map((topic) => {
                    const active = topic.id === activeTopicId;

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setActiveTopicId(topic.id)}
                        className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150"
                        style={active ? {
                          border: '1px solid rgba(124,58,237,0.45)',
                          background: 'rgba(124,58,237,0.14)',
                          color: '#c4b5fd',
                          boxShadow: '0 0 12px rgba(124,58,237,0.2)',
                        } : {
                          border: '1px solid var(--border)',
                          background: 'var(--surface-1)',
                          color: 'var(--text-2)',
                        }}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-3)]">
                  <span className="micro-badge">{filteredQuestions.length} visible</span>
                  <span className="micro-badge">{completionState.percentage}% complete</span>
                  {isDemoFallback && <span className="micro-badge">Demo Mode</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-4 py-6 md:px-6 md:py-8 xl:px-8 2xl:px-10">
            {status && (
              <div>
                <AppStatusBanner variant={status.variant} message={status.message} />
              </div>
            )}

            <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              {/* ── Hero / Topic Banner ── */}
              <div className="panel-surface relative overflow-hidden p-6 md:p-8">
                {/* decorative gradient shimmer */}
                <div className="pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] opacity-60"
                  style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.08) 0%,rgba(236,72,153,0.04) 60%,transparent 100%)' }} />
                <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-40"
                  style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.25) 0%,transparent 70%)', filter: 'blur(40px)' }} />

                <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">Current topic</p>
                <h1
                  className="display-heading relative mt-3 text-3xl md:text-5xl"
                  style={{ background: 'linear-gradient(135deg,#f1f5f9 30%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {activeTopicLabel}
                </h1>
                <p className="relative mt-4 max-w-3xl text-sm leading-relaxed text-[var(--text-2)] md:text-base">
                  Work through one topic at a time, open the full answer when needed, and keep the deck focused instead of jumping across sections.
                </p>

                <div className="relative mt-5 flex flex-wrap items-center gap-2">
                  <span className="chip-pill">{language === 'en' ? '🇺🇸 English' : '🇦🇲 Armenian'}</span>
                  <span className="micro-badge">{filteredQuestions.length} questions</span>
                  {sourceMode === 'demo' && <span className="micro-badge">Demo</span>}
                </div>

                <div className="relative mt-6 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setSearchOpen(true)} className="btn-primary px-5 py-2.5 text-sm">
                    Open Search
                    <ArrowRight size={15} />
                  </button>
                  <p className="text-sm text-[var(--text-3)]">
                    Review answers, examples, pitfalls & follow-ups.
                  </p>
                </div>
              </div>

              {/* ── Study Progress Card ── */}
              <div className="panel-surface relative overflow-hidden p-6">
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle,rgba(236,72,153,0.3) 0%,transparent 70%)', filter: 'blur(30px)' }} />

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">Study progress</p>
                <div className="mt-4 space-y-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p
                        className="text-5xl font-black tracking-[-0.05em]"
                        style={{ background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                      >
                        {completionState.percentage}%
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-3)]">Completion in topic</p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-2xl font-black"
                        style={{ background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                      >
                        {completionState.learnedCount}
                      </p>
                      <p className="text-xs text-[var(--text-3)]">learned</p>
                    </div>
                  </div>

                  {/* gradient glow progress bar */}
                  <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(completionState.percentage, completionState.totalCount > 0 ? 2 : 0)}%`,
                        background: 'linear-gradient(90deg,#7c3aed,#ec4899)',
                        boxShadow: completionState.percentage > 0 ? '0 0 10px rgba(124,58,237,0.6)' : 'none',
                      }}
                    />
                  </div>

                  {/* mini stat chips */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.07)] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-3)]">✓ Learned</p>
                      <p className="mt-2 text-xl font-black text-[var(--text-1)]">
                        {completionState.learnedCount}
                        <span className="text-sm font-semibold text-[var(--text-3)]">/{completionState.totalCount}</span>
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[rgba(236,72,153,0.2)] bg-[rgba(236,72,153,0.06)] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-3)]">📚 Ready</p>
                      <p className="mt-2 text-xl font-black text-[var(--text-1)]">{filteredQuestions.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-wrap items-end justify-between gap-3 pb-2">
              <div className="flex items-center gap-3">
                {/* gradient accent bar */}
                <div className="h-8 w-1 rounded-full" style={{ background: 'linear-gradient(180deg,#7c3aed,#ec4899)', boxShadow: '0 0 8px rgba(124,58,237,0.5)' }} />
                <div>
                  <h2 className="display-heading text-[1.65rem]">
                    <span style={{ background: 'linear-gradient(135deg,#f1f5f9,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Question Deck
                    </span>
                  </h2>
                  <p className="mt-0.5 text-sm text-[var(--text-3)]">
                    Open any card to review the answer, examples, and follow-ups.
                  </p>
                </div>
              </div>
              <span
                className="rounded-full border px-3 py-1 text-xs font-bold"
                style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.1)', color: '#a78bfa' }}
              >
                {filteredQuestions.length} cards
              </span>
            </section>

            {(loading || preferencesLoading) && (
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <QuestionSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            )}

            {!loading && filteredQuestions.length === 0 && (
              <div className="panel-surface relative overflow-hidden p-10 text-center">
                {/* bg glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full opacity-40"
                  style={{ background: 'radial-gradient(ellipse,rgba(124,58,237,0.2) 0%,transparent 70%)', filter: 'blur(30px)' }} />
                {/* icon */}
                <div
                  className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl text-3xl"
                  style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(236,72,153,0.1))', border: '1px solid rgba(124,58,237,0.25)' }}
                >
                  📭
                </div>
                <p
                  className="text-xl font-black"
                  style={{ background: 'linear-gradient(135deg,#f1f5f9,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  No questions yet
                </p>
                <p className="mt-2 text-sm text-[var(--text-3)]">
                  This topic has no questions loaded. Connect Firebase or add content via the admin panel.
                </p>
                <Link
                  href="/login"
                  className="btn-primary mt-6 inline-flex px-5 py-2.5 text-sm"
                >
                  Go to Admin
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {!loading && filteredQuestions.length > 0 && (
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {filteredQuestions.map((question) => (
                  <InterviewCard
                    key={question.id}
                    question={question}
                    learned={learnedSet.has(question.id)}
                    onOpen={() => openQuestionModal(question)}
                    onLearnedChange={async (learned) => {
                      const { newlyCompleted } = await markLearned(question.id, learned);
                      if (newlyCompleted) {
                        void confetti({
                          particleCount: 120,
                          spread: 78,
                          origin: { y: 0.7 },
                        });
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        questions={questions}
        activeTopicId={activeTopicId}
        onSelectQuestion={handleQuestionSelection}
      />

      <QuestionDetailModal
        question={selectedQuestion}
        open={selectedQuestion !== null}
        onClose={closeQuestionModal}
        onPrev={() => handleModalNavigation('prev')}
        onNext={() => handleModalNavigation('next')}
        canPrev={prevQuestion !== null}
        canNext={nextQuestion !== null}
        learned={selectedQuestion ? learnedSet.has(selectedQuestion.id) : false}
        onLearnedChange={async (learned) => {
          if (!selectedQuestion) {
            return;
          }

          const { newlyCompleted } = await markLearned(selectedQuestion.id, learned);
          if (newlyCompleted) {
            void confetti({
              particleCount: 120,
              spread: 78,
              origin: { y: 0.7 },
            });
          }
        }}
      />
    </div>
  );
}
