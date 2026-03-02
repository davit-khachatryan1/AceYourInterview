'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Menu, Search } from 'lucide-react';
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
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
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

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)]">
      <TopicProgressBar percentage={completionState.percentage} />

      <div className="flex min-h-[calc(100vh-3px)]">
        <Sidebar
          topics={topics}
          activeTopicId={activeTopicId}
          onTopicSelect={setActiveTopicId}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebar}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto w-full max-w-[1240px]">
            <header className="panel-surface mb-6 p-5 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="icon-button md:hidden"
                    aria-label="Open topics"
                  >
                    <Menu size={18} />
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="display-heading text-4xl md:text-6xl">AceYourInterview</h1>
                      {isDemoFallback && (
                        <span className="micro-badge">
                          Demo Mode
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-2)]">Focused prep mode · {language === 'en' ? 'English' : 'Armenian'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <ThemeToggle />
                  <DualLanguageToggle />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="search-input flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm"
                  aria-label="Open search"
                >
                  <Search size={17} className="text-[var(--text-3)]" />
                  <span className="flex-1 text-[var(--text-2)]">Search questions, tags, and examples</span>
                  <span className="kbd-badge">
                    ⌘K
                  </span>
                </button>
              </div>
            </header>

            {status && <AppStatusBanner variant={status.variant} message={status.message} />}

            <section className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="elevated-card relative overflow-hidden p-5 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--sage-green)_54%,transparent),color-mix(in_srgb,var(--soft-peach)_38%,transparent))]">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-3)]">Topic Progress</p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.02em]">{completionState.percentage}%</p>
              </div>
              <div className="elevated-card relative overflow-hidden p-5 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--light-caramel)_44%,transparent),color-mix(in_srgb,var(--sage-green)_48%,transparent))]">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-3)]">Learned</p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.02em]">
                  {completionState.learnedCount}/{completionState.totalCount}
                </p>
              </div>
              <div className="elevated-card relative overflow-hidden p-5 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--sage-green)_52%,transparent),color-mix(in_srgb,var(--lemon-chiffon)_34%,transparent))]">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-3)]">Topic</p>
                <p className="mt-1 text-xl font-semibold tracking-[-0.01em]">{activeTopicLabel}</p>
              </div>
            </section>

            <section className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="display-heading text-[1.65rem]">Interview Deck</h2>
                <p className="text-sm text-[var(--text-2)]">Open a question card to study full details, code parts, and follow-ups.</p>
              </div>
            </section>

            {(loading || preferencesLoading) && (
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <QuestionSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            )}

            {!loading && filteredQuestions.length === 0 && (
              <div className="panel-surface p-6 text-sm text-[var(--text-2)]">No questions in this topic yet.</div>
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
