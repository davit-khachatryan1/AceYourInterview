'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { QuestionExampleRecord } from '@/types/interview';

interface AdminExamplesEditorProps {
  examples: QuestionExampleRecord[];
  onChange: (nextExamples: QuestionExampleRecord[]) => void;
}

const createEmptyExample = (index: number): QuestionExampleRecord => ({
  id: `example-${index + 1}`,
  en_title: '',
  am_title: '',
  en_description: '',
  am_description: '',
  codeSnippet: '',
  codeLanguage: 'tsx',
});

const AdminExamplesEditor = ({ examples, onChange }: AdminExamplesEditorProps) => {
  const updateExample = (index: number, patch: Partial<QuestionExampleRecord>) => {
    const next = [...examples];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {examples.map((example, index) => (
        <div key={example.id ?? `example-${index}`} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--text-1)]">Example {index + 1}</p>
            <button
              type="button"
              onClick={() => onChange(examples.filter((_, itemIndex) => itemIndex !== index))}
              className="icon-button"
              aria-label={`Remove example ${index + 1}`}
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={example.en_title ?? ''}
              onChange={(event) => updateExample(index, { en_title: event.target.value })}
              className="search-input"
              placeholder="Title (ENG)"
            />
            <input
              value={example.am_title ?? ''}
              onChange={(event) => updateExample(index, { am_title: event.target.value })}
              className="search-input"
              placeholder="Title (ARM)"
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <textarea
              value={example.en_description ?? ''}
              onChange={(event) => updateExample(index, { en_description: event.target.value })}
              className="search-input min-h-24"
              placeholder="Description (ENG)"
            />
            <textarea
              value={example.am_description ?? ''}
              onChange={(event) => updateExample(index, { am_description: event.target.value })}
              className="search-input min-h-24"
              placeholder="Description (ARM)"
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={example.codeLanguage ?? 'tsx'}
              onChange={(event) => updateExample(index, { codeLanguage: event.target.value })}
              className="search-input"
              placeholder="Code language"
            />
            <textarea
              value={example.codeSnippet ?? ''}
              onChange={(event) => updateExample(index, { codeSnippet: event.target.value })}
              className="search-input code-editor-input min-h-24 font-mono text-xs"
              placeholder="Code snippet"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...examples, createEmptyExample(examples.length)])}
        className="btn-secondary px-3 py-2 text-sm"
      >
        <Plus size={14} />
        Add Example
      </button>
    </div>
  );
};

export default AdminExamplesEditor;
