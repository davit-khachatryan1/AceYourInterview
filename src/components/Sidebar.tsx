'use client';

import { motion } from 'framer-motion';
import { Aperture, Code2, Cpu, LayoutPanelLeft, PanelLeftClose, PanelLeftOpen, Smartphone, X } from 'lucide-react';
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

  return (
    <div className="panel-surface h-full border-r border-[var(--border)] p-3.5">
      <div className="mb-4 border-b border-[var(--border)] pb-3">
        <div className="mb-3 flex items-center justify-between">
          {!collapsed && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-3)]">Learning Hub</p>
              <h2 className="display-heading mt-1 text-[1.6rem] text-[var(--text-1)]">Topics</h2>
            </div>
          )}

          <div className="flex items-center gap-1">
            {mobile && (
              <button type="button" onClick={onMobileClose} className="icon-button" aria-label="Close sidebar">
                <X size={16} />
              </button>
            )}

            {!mobile && (
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

        {!collapsed && (
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">Question Bank</p>
            <p className="mt-1 text-xl font-semibold text-[var(--text-1)]">{totalQuestions}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {!collapsed && <p className="px-1 text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">Core Topics</p>}

        <nav className="space-y-1">
          {topics.map((topic, index) => {
            const Icon = iconForTopic(topic.id);
            const active = activeTopicId === topic.id;

            return (
              <motion.button
                key={topic.id}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: index * 0.025, ease: [0.2, 0.9, 0.3, 1] }}
                onClick={() => {
                  onTopicSelect(topic.id);
                  if (mobile) {
                    onMobileClose();
                  }
                }}
                className={`interactive-row relative w-full overflow-hidden px-3 py-2.5 ${active ? 'border-[color-mix(in_srgb,var(--sage-green)_56%,var(--border))] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--sage-green)_26%,var(--surface-2)),color-mix(in_srgb,var(--lemon-chiffon)_16%,var(--surface-2)))] text-[var(--text-1)] shadow-[var(--shadow-float)] before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-[var(--sage-green)]' : 'text-[var(--text-2)]'}`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">{topic.label}</span>
                      <span className="inline-flex min-w-6 items-center justify-center rounded-md border border-[var(--chip-border)] bg-[var(--chip-bg)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--chip-text)]">{topic.count}</span>
                    </>
                  )}
                </span>
              </motion.button>
            );
          })}
        </nav>
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
      <aside className={`hidden h-full md:block ${collapsed ? 'w-20' : 'w-72'}`}>
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
