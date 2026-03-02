'use client';

import { motion } from 'framer-motion';
import {
  Aperture,
  BookOpen,
  Code2,
  Cpu,
  LayoutPanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Smartphone,
  X,
} from 'lucide-react';
import type { TopicSummary } from '@/types/interview';

interface SidebarProps {
  topics: TopicSummary[];
  activeTopicId: string | null;
  onTopicSelect: (topicId: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const iconForTopic = (topicId: string) => {
  if (topicId.includes('react')) return Aperture;
  if (topicId.includes('system')) return Cpu;
  if (topicId.includes('mobile')) return Smartphone;
  if (topicId.includes('javascript') || topicId.includes('typescript')) return Code2;
  return LayoutPanelLeft;
};

const PanelContent = ({
  topics,
  activeTopicId,
  onTopicSelect,
  collapsed,
  onToggleCollapsed,
  onMobileClose,
  mobile,
}: {
  topics: TopicSummary[];
  activeTopicId: string | null;
  onTopicSelect: (topicId: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onMobileClose: () => void;
  mobile: boolean;
}) => {
  const totalQuestions = topics.reduce((sum, topic) => sum + topic.count, 0);
  const activeTopicCount = topics.find((topic) => topic.id === activeTopicId)?.count ?? 0;
  const activeTopicShare =
    totalQuestions > 0 ? Math.round((activeTopicCount / totalQuestions) * 100) : 0;

  return (
    <div className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      <div className="border-b border-[var(--border)] px-3.5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] text-[var(--brand-primary)]">
              <BookOpen size={18} />
            </div>
            {!collapsed && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-3)]">
                  Workspace
                </p>
                <h2 className="text-sm font-semibold text-[var(--text-1)]">AceYourInterview</h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {mobile ? (
              <button
                type="button"
                onClick={onMobileClose}
                className="icon-button"
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="icon-button"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <div className="mb-3 px-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-3)]">
              Topics
            </p>
          </div>
        )}

        <nav className="space-y-1.5">
          {topics.map((topic, index) => {
            const Icon = iconForTopic(topic.id);
            const active = activeTopicId === topic.id;

            return (
              <motion.button
                key={topic.id}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: index * 0.02, ease: [0.2, 0.9, 0.3, 1] }}
                onClick={() => {
                  onTopicSelect(topic.id);
                  if (mobile) {
                    onMobileClose();
                  }
                }}
                className={`interactive-row relative w-full overflow-hidden px-3 py-2.5 text-left ${
                  active
                    ? 'border-[color-mix(in_srgb,var(--brand-primary)_22%,var(--border))] bg-[color-mix(in_srgb,var(--brand-primary)_9%,var(--surface-1))] text-[var(--text-1)]'
                    : 'text-[var(--text-2)]'
                }`}
              >
                {active && (
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[var(--brand-primary)]" />
                )}

                <span className="flex items-center gap-3">
                  <Icon size={16} className={active ? 'text-[var(--brand-primary)]' : undefined} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{topic.label}</span>
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-3)]">
                        {topic.count}
                      </span>
                    </>
                  )}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--border)] p-3.5">
        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] p-3">
          {!collapsed ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[var(--text-1)]">Current topic focus</p>
                <span className="text-xs font-medium text-[var(--text-3)]">{activeTopicShare}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[var(--surface-3)]">
                <div
                  className="h-full rounded-full bg-[var(--brand-primary)]"
                  style={{ width: `${Math.max(activeTopicShare, totalQuestions > 0 ? 12 : 0)}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-[var(--text-3)]">Questions in topic</span>
                <span className="font-semibold text-[var(--text-1)]">{activeTopicCount}</span>
              </div>
            </>
          ) : (
            <div className="grid place-items-center rounded-2xl bg-[var(--surface-2)] px-1 py-2 text-xs font-semibold text-[var(--brand-primary)]">
              {activeTopicShare}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({
  topics,
  activeTopicId,
  onTopicSelect,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileClose,
}: SidebarProps) => {
  return (
    <>
      <aside className={`hidden h-full md:block ${collapsed ? 'w-20' : 'w-64'}`}>
        <PanelContent
          topics={topics}
          activeTopicId={activeTopicId}
          onTopicSelect={onTopicSelect}
          collapsed={collapsed}
          onToggleCollapsed={onToggleCollapsed}
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
            className="fixed left-0 top-0 z-40 h-screen w-72 md:hidden"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
          >
            <PanelContent
              topics={topics}
              activeTopicId={activeTopicId}
              onTopicSelect={onTopicSelect}
              collapsed={false}
              onToggleCollapsed={onToggleCollapsed}
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
