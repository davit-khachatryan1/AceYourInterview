'use client';

import { motion } from 'framer-motion';
import { Aperture, BookOpen, Code2, Cpu, Search, Smartphone, X } from 'lucide-react';
import type { TopicSummary } from '@/types/interview';

interface SidebarProps {
  topics: TopicSummary[];
  activeTopicId: string | null;
  completionPercentage: number;
  onTopicSelect: (topicId: string) => void;
  onSearchOpen: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const iconForTopic = (topicId: string) => {
  if (topicId.includes('react')) return Aperture;
  if (topicId.includes('system')) return Cpu;
  if (topicId.includes('mobile')) return Smartphone;
  if (topicId.includes('javascript') || topicId.includes('typescript')) return Code2;
  return BookOpen;
};

const SidebarContent = ({
  topics,
  activeTopicId,
  completionPercentage,
  onTopicSelect,
  onSearchOpen,
  onMobileClose,
  mobile,
}: {
  topics: TopicSummary[];
  activeTopicId: string | null;
  completionPercentage: number;
  onTopicSelect: (topicId: string) => void;
  onSearchOpen: () => void;
  onMobileClose: () => void;
  mobile: boolean;
}) => {
  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? null;

  return (
    <div className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      <div className="border-b border-[var(--border)] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 0 16px rgba(124,58,237,0.45)' }}
            >
              <BookOpen size={17} />
            </div>
            <div>
              <p
                className="text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                AceYourInterview
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-3)]">Interview prep workspace</p>
            </div>
          </div>

          {mobile && (
            <button
              type="button"
              onClick={onMobileClose}
              className="icon-button"
              aria-label="Close topic drawer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-3)]">Topics</p>
            <p className="mt-1 text-xs text-[var(--text-3)]">{topics.length} sections available</p>
          </div>

          <button type="button" onClick={onSearchOpen} className="btn-ghost px-2.5 py-1.5 text-xs">
            <Search size={13} />
            Search
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1.5">
          {topics.map((topic, index) => {
            const Icon = iconForTopic(topic.id);
            const active = activeTopicId === topic.id;

            return (
              <motion.button
                key={topic.id}
                type="button"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, delay: index * 0.018 }}
                onClick={() => {
                  onTopicSelect(topic.id);
                  if (mobile) {
                    onMobileClose();
                  }
                }}
                className={`relative flex w-full items-center gap-3 rounded-[18px] border px-3.5 py-3 text-left transition-all duration-150 ${
                  active
                    ? 'border-[rgba(124,58,237,0.35)] bg-[rgba(124,58,237,0.1)] text-[var(--text-1)]'
                    : 'border-transparent bg-transparent text-[var(--text-2)] hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]'
                }`}
                style={active ? { boxShadow: '0 0 18px rgba(124,58,237,0.12)' } : undefined}
                aria-pressed={active}
              >
                {active && (
                  <span
                    className="absolute inset-y-3 left-0 w-[3px] rounded-full"
                    style={{ background: 'linear-gradient(180deg,#7c3aed,#ec4899)' }}
                  />
                )}

                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border"
                  style={active
                    ? { borderColor: 'rgba(124,58,237,0.35)', background: 'rgba(124,58,237,0.14)', color: '#a78bfa' }
                    : { borderColor: 'var(--border)', background: 'var(--surface-2)' }
                  }
                >
                  <Icon size={15} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{topic.label}</span>
                  <span className="mt-0.5 block text-[11px] text-[var(--text-3)]">{topic.count} questions</span>
                </span>

                <span
                  className="inline-flex min-w-7 items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold"
                  style={active
                    ? { borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.12)', color: '#a78bfa' }
                    : { borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-3)' }
                  }
                >
                  {topic.count}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--border)] p-4">
        <div className="rounded-[18px] border border-[rgba(124,58,237,0.2)] bg-[var(--surface-2)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">Progress</p>
            <span
              className="text-sm font-black"
              style={{ background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {completionPercentage}%
            </span>
          </div>

          <p className="mt-1.5 truncate text-sm font-semibold text-[var(--text-1)]">
            {activeTopic?.label ?? 'No topic selected'}
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-1)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(completionPercentage, activeTopic ? 4 : 0)}%`,
                background: 'linear-gradient(90deg,#7c3aed,#ec4899)',
                boxShadow: completionPercentage > 0 ? '0 0 8px rgba(124,58,237,0.5)' : 'none',
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[var(--text-3)]">Questions in topic</span>
            <span className="font-bold text-[var(--text-2)]">{activeTopic?.count ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({
  topics,
  activeTopicId,
  completionPercentage,
  onTopicSelect,
  onSearchOpen,
  mobileOpen,
  onMobileClose,
}: SidebarProps) => {
  return (
    <>
      <aside className="hidden h-screen w-72 shrink-0 md:block">
        <SidebarContent
          topics={topics}
          activeTopicId={activeTopicId}
          completionPercentage={completionPercentage}
          onTopicSelect={onTopicSelect}
          onSearchOpen={onSearchOpen}
          onMobileClose={onMobileClose}
          mobile={false}
        />
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-[var(--overlay)] md:hidden"
            aria-label="Close topic drawer"
            onClick={onMobileClose}
          />
          <motion.aside
            className="fixed left-0 top-0 z-40 h-screen w-[min(20rem,88vw)] md:hidden"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
          >
            <SidebarContent
              topics={topics}
              activeTopicId={activeTopicId}
              completionPercentage={completionPercentage}
              onTopicSelect={onTopicSelect}
              onSearchOpen={onSearchOpen}
              onMobileClose={onMobileClose}
              mobile
            />
          </motion.aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
