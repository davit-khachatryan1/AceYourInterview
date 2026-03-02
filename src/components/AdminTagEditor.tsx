'use client';

import { GripVertical, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface AdminTagEditorProps {
  tags: string[];
  onChange: (nextTags: string[]) => void;
}

const normalizeTag = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');

const reorder = (items: string[], from: number, to: number): string[] => {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

const AdminTagEditor = ({ tags, onChange }: AdminTagEditorProps) => {
  const [draft, setDraft] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const commitDraft = () => {
    const normalized = normalizeTag(draft);
    if (!normalized || tags.includes(normalized)) {
      setDraft('');
      return;
    }

    onChange([...tags, normalized]);
    setDraft('');
  };

  return (
    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              commitDraft();
            }
          }}
          className="search-input w-full"
          placeholder="Add category/tag"
        />
        <button type="button" onClick={commitDraft} className="btn-secondary" aria-label="Add tag">
          <Plus size={14} />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {tags.map((tag, index) => (
          <div
            key={tag}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) {
                return;
              }
              onChange(reorder(tags, dragIndex, index));
              setDragIndex(null);
            }}
            className="interactive-row flex items-center justify-between px-2.5 py-2"
          >
            <span className="inline-flex items-center gap-2 text-xs text-[var(--text-1)]">
              <GripVertical size={13} className="text-[var(--text-3)]" />
              {tag}
            </span>
            <button
              type="button"
              onClick={() => onChange(tags.filter((entry) => entry !== tag))}
              className="btn-ghost p-1.5 text-[var(--text-3)]"
              aria-label={`Remove ${tag}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTagEditor;
