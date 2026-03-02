'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState, type FormEvent } from 'react';
import AdminExamplesEditor from '@/components/AdminExamplesEditor';
import AdminTagEditor from '@/components/AdminTagEditor';
import { db } from '@/lib/firebase';
import type { QuestionExampleRecord } from '@/types/interview';

interface AddQuestionFormProps {
  onCreated?: () => void;
}

const initialState = {
  topicId: '',
  enText: '',
  amText: '',
  enAnswer: '',
  amAnswer: '',
  enExplanation: '',
  amExplanation: '',
  enPitfalls: '',
  amPitfalls: '',
  enFollowups: '',
  amFollowups: '',
  codeSnippet: '',
  codeLanguage: 'tsx',
};

const createEmptyExample = (): QuestionExampleRecord => ({
  id: 'example-1',
  en_title: '',
  am_title: '',
  en_description: '',
  am_description: '',
  codeSnippet: '',
  codeLanguage: 'tsx',
});

const toList = (value: string): string[] => value.split('\n').map((entry) => entry.trim()).filter(Boolean);

const normalizeExamples = (examples: QuestionExampleRecord[]): QuestionExampleRecord[] =>
  examples.map((example, index) => ({
    id: example.id?.trim() || `example-${index + 1}`,
    en_title: example.en_title?.trim() || '',
    am_title: example.am_title?.trim() || '',
    en_description: example.en_description?.trim() || '',
    am_description: example.am_description?.trim() || '',
    codeSnippet: example.codeSnippet?.trim() || '',
    codeLanguage: example.codeLanguage?.trim() || 'tsx',
  }));

const AddQuestionForm = ({ onCreated }: AddQuestionFormProps) => {
  const [form, setForm] = useState(initialState);
  const [tags, setTags] = useState<string[]>([]);
  const [examples, setExamples] = useState<QuestionExampleRecord[]>([createEmptyExample()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const enPitfalls = toList(form.enPitfalls);
    const amPitfalls = toList(form.amPitfalls);
    const enFollowups = toList(form.enFollowups);
    const amFollowups = toList(form.amFollowups);
    const normalizedExamples = normalizeExamples(examples);

    const isBaseInvalid =
      !form.topicId.trim() ||
      !form.enText.trim() ||
      !form.amText.trim() ||
      !form.enAnswer.trim() ||
      !form.amAnswer.trim() ||
      !form.enExplanation.trim() ||
      !form.amExplanation.trim();

    const areListsInvalid =
      enPitfalls.length === 0 ||
      amPitfalls.length === 0 ||
      enFollowups.length === 0 ||
      amFollowups.length === 0;

    const hasInvalidExample =
      normalizedExamples.length === 0 ||
      normalizedExamples.some(
        (example) =>
          !example.en_title ||
          !example.am_title ||
          !example.en_description ||
          !example.am_description ||
          !example.codeSnippet ||
          !example.codeLanguage,
      );

    if (isBaseInvalid || areListsInvalid || hasInvalidExample) {
      setError('All bilingual detail fields and at least one complete example are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'questions'), {
        topicId: form.topicId.trim(),
        topic: form.topicId.trim(),
        en_text: form.enText.trim(),
        am_text: form.amText.trim(),
        en_answer: form.enAnswer.trim(),
        am_answer: form.amAnswer.trim(),
        en_explanation: form.enExplanation.trim(),
        am_explanation: form.amExplanation.trim(),
        en_pitfalls: enPitfalls,
        am_pitfalls: amPitfalls,
        en_followups: enFollowups,
        am_followups: amFollowups,
        examples: normalizedExamples,
        question: form.enText.trim(),
        answer: form.enAnswer.trim(),
        tags,
        codeSnippet: form.codeSnippet.trim() || normalizedExamples[0]!.codeSnippet,
        codeLanguage: form.codeLanguage.trim() || normalizedExamples[0]!.codeLanguage,
        updatedAt: serverTimestamp(),
      });

      setForm(initialState);
      setTags([]);
      setExamples([createEmptyExample()]);
      onCreated?.();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-xl border border-[color-mix(in_srgb,var(--burnt-tangerine)_45%,var(--border))] bg-[color-mix(in_srgb,var(--burnt-tangerine)_16%,transparent)] p-2.5 text-sm text-[var(--text-1)]">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="topicId" className="mb-1.5 block text-sm text-[var(--text-2)]">Topic ID</label>
        <input
          id="topicId"
          value={form.topicId}
          onChange={(event) => setForm((current) => ({ ...current, topicId: event.target.value }))}
          className="search-input w-full"
          placeholder="react"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="enText" className="mb-1.5 block text-sm text-[var(--text-2)]">Question (ENG)</label>
          <textarea
            id="enText"
            value={form.enText}
            onChange={(event) => setForm((current) => ({ ...current, enText: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
        <div>
          <label htmlFor="amText" className="mb-1.5 block text-sm text-[var(--text-2)]">Question (ARM)</label>
          <textarea
            id="amText"
            value={form.amText}
            onChange={(event) => setForm((current) => ({ ...current, amText: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="enAnswer" className="mb-1.5 block text-sm text-[var(--text-2)]">Answer (ENG)</label>
          <textarea
            id="enAnswer"
            value={form.enAnswer}
            onChange={(event) => setForm((current) => ({ ...current, enAnswer: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
        <div>
          <label htmlFor="amAnswer" className="mb-1.5 block text-sm text-[var(--text-2)]">Answer (ARM)</label>
          <textarea
            id="amAnswer"
            value={form.amAnswer}
            onChange={(event) => setForm((current) => ({ ...current, amAnswer: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="enExplanation" className="mb-1.5 block text-sm text-[var(--text-2)]">Explanation (ENG)</label>
          <textarea
            id="enExplanation"
            value={form.enExplanation}
            onChange={(event) => setForm((current) => ({ ...current, enExplanation: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
        <div>
          <label htmlFor="amExplanation" className="mb-1.5 block text-sm text-[var(--text-2)]">Explanation (ARM)</label>
          <textarea
            id="amExplanation"
            value={form.amExplanation}
            onChange={(event) => setForm((current) => ({ ...current, amExplanation: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="enPitfalls" className="mb-1.5 block text-sm text-[var(--text-2)]">Pitfalls (ENG, one per line)</label>
          <textarea
            id="enPitfalls"
            value={form.enPitfalls}
            onChange={(event) => setForm((current) => ({ ...current, enPitfalls: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
        <div>
          <label htmlFor="amPitfalls" className="mb-1.5 block text-sm text-[var(--text-2)]">Pitfalls (ARM, one per line)</label>
          <textarea
            id="amPitfalls"
            value={form.amPitfalls}
            onChange={(event) => setForm((current) => ({ ...current, amPitfalls: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="enFollowups" className="mb-1.5 block text-sm text-[var(--text-2)]">Follow-ups (ENG, one per line)</label>
          <textarea
            id="enFollowups"
            value={form.enFollowups}
            onChange={(event) => setForm((current) => ({ ...current, enFollowups: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
        <div>
          <label htmlFor="amFollowups" className="mb-1.5 block text-sm text-[var(--text-2)]">Follow-ups (ARM, one per line)</label>
          <textarea
            id="amFollowups"
            value={form.amFollowups}
            onChange={(event) => setForm((current) => ({ ...current, amFollowups: event.target.value }))}
            className="search-input min-h-24 w-full"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="codeLanguage" className="mb-1.5 block text-sm text-[var(--text-2)]">Primary code language</label>
          <input
            id="codeLanguage"
            value={form.codeLanguage}
            onChange={(event) => setForm((current) => ({ ...current, codeLanguage: event.target.value }))}
            className="search-input w-full"
          />
        </div>
        <div>
          <label htmlFor="codeSnippet" className="mb-1.5 block text-sm text-[var(--text-2)]">Primary code snippet</label>
          <textarea
            id="codeSnippet"
            value={form.codeSnippet}
            onChange={(event) => setForm((current) => ({ ...current, codeSnippet: event.target.value }))}
            className="search-input min-h-24 w-full font-mono text-xs"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-[var(--text-2)]">Examples (required)</p>
        <AdminExamplesEditor examples={examples} onChange={setExamples} />
      </div>

      <div>
        <p className="mb-1.5 text-sm text-[var(--text-2)]">Category tags</p>
        <AdminTagEditor tags={tags} onChange={setTags} />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary px-4 py-2 text-sm font-semibold">
        {isSubmitting ? 'Saving...' : 'Add Question'}
      </button>
    </form>
  );
};

export default AddQuestionForm;
