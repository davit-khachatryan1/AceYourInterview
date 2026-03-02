'use client';

import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import AdminExamplesEditor from '@/components/AdminExamplesEditor';
import AdminTagEditor from '@/components/AdminTagEditor';
import { db } from '@/lib/firebase';
import type { QuestionExampleRecord, QuestionRecord } from '@/types/interview';

interface EditQuestionFormProps {
  question: QuestionRecord;
  onUpdated: () => void;
  onCancel: () => void;
}

const listToText = (list?: string[]): string => (Array.isArray(list) ? list.join('\n') : '');

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

const createExampleFallback = (question: QuestionRecord): QuestionExampleRecord[] => {
  if (Array.isArray(question.examples) && question.examples.length > 0) {
    return question.examples;
  }

  return [
    {
      id: `${question.id}-example-1`,
      en_title: 'Primary Example',
      am_title: 'Հիմնական օրինակ',
      en_description: question.en_explanation ?? question.en_answer ?? question.answer ?? '',
      am_description: question.am_explanation ?? question.am_answer ?? question.answer ?? '',
      codeSnippet: question.codeSnippet ?? '',
      codeLanguage: question.codeLanguage ?? 'tsx',
    },
  ];
};

const EditQuestionForm = ({ question, onUpdated, onCancel }: EditQuestionFormProps) => {
  const [topicId, setTopicId] = useState(question.topicId ?? question.topic ?? '');
  const [enText, setEnText] = useState(question.en_text ?? question.question ?? '');
  const [amText, setAmText] = useState(question.am_text ?? '');
  const [enAnswer, setEnAnswer] = useState(question.en_answer ?? question.answer ?? '');
  const [amAnswer, setAmAnswer] = useState(question.am_answer ?? '');
  const [enExplanation, setEnExplanation] = useState(question.en_explanation ?? question.en_answer ?? question.answer ?? '');
  const [amExplanation, setAmExplanation] = useState(question.am_explanation ?? question.am_answer ?? question.answer ?? '');
  const [enPitfalls, setEnPitfalls] = useState(listToText(question.en_pitfalls));
  const [amPitfalls, setAmPitfalls] = useState(listToText(question.am_pitfalls));
  const [enFollowups, setEnFollowups] = useState(listToText(question.en_followups));
  const [amFollowups, setAmFollowups] = useState(listToText(question.am_followups));
  const [codeSnippet, setCodeSnippet] = useState(question.codeSnippet ?? '');
  const [codeLanguage, setCodeLanguage] = useState(question.codeLanguage ?? 'tsx');
  const [tags, setTags] = useState<string[]>(question.tags ?? []);
  const [examples, setExamples] = useState<QuestionExampleRecord[]>(createExampleFallback(question));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTopicId(question.topicId ?? question.topic ?? '');
    setEnText(question.en_text ?? question.question ?? '');
    setAmText(question.am_text ?? '');
    setEnAnswer(question.en_answer ?? question.answer ?? '');
    setAmAnswer(question.am_answer ?? '');
    setEnExplanation(question.en_explanation ?? question.en_answer ?? question.answer ?? '');
    setAmExplanation(question.am_explanation ?? question.am_answer ?? question.answer ?? '');
    setEnPitfalls(listToText(question.en_pitfalls));
    setAmPitfalls(listToText(question.am_pitfalls));
    setEnFollowups(listToText(question.en_followups));
    setAmFollowups(listToText(question.am_followups));
    setCodeSnippet(question.codeSnippet ?? '');
    setCodeLanguage(question.codeLanguage ?? 'tsx');
    setTags(question.tags ?? []);
    setExamples(createExampleFallback(question));
  }, [question]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const parsedEnPitfalls = toList(enPitfalls);
    const parsedAmPitfalls = toList(amPitfalls);
    const parsedEnFollowups = toList(enFollowups);
    const parsedAmFollowups = toList(amFollowups);
    const normalizedExamples = normalizeExamples(examples);

    const isBaseInvalid =
      !topicId.trim() ||
      !enText.trim() ||
      !amText.trim() ||
      !enAnswer.trim() ||
      !amAnswer.trim() ||
      !enExplanation.trim() ||
      !amExplanation.trim();

    const areListsInvalid =
      parsedEnPitfalls.length === 0 ||
      parsedAmPitfalls.length === 0 ||
      parsedEnFollowups.length === 0 ||
      parsedAmFollowups.length === 0;

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
      const questionRef = doc(db, 'questions', question.id);
      await updateDoc(questionRef, {
        topicId: topicId.trim(),
        topic: topicId.trim(),
        en_text: enText.trim(),
        am_text: amText.trim(),
        en_answer: enAnswer.trim(),
        am_answer: amAnswer.trim(),
        en_explanation: enExplanation.trim(),
        am_explanation: amExplanation.trim(),
        en_pitfalls: parsedEnPitfalls,
        am_pitfalls: parsedAmPitfalls,
        en_followups: parsedEnFollowups,
        am_followups: parsedAmFollowups,
        examples: normalizedExamples,
        question: enText.trim(),
        answer: enAnswer.trim(),
        tags,
        codeSnippet: codeSnippet.trim() || normalizedExamples[0]!.codeSnippet,
        codeLanguage: codeLanguage.trim() || normalizedExamples[0]!.codeLanguage,
        updatedAt: serverTimestamp(),
      });

      onUpdated();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--overlay)] p-4">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-strong)] md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-3)]">Edit Question</p>
            <h3 className="display-heading mt-1 text-3xl text-[var(--text-1)]">Update content</h3>
          </div>
          <button type="button" onClick={onCancel} className="icon-button" aria-label="Close edit dialog">
            <X size={15} />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-3 text-sm text-[var(--text-1)]">
            {error}
          </p>
        )}

        <div className="space-y-5 rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] p-4 md:p-5">
          <div>
            <label htmlFor="editTopicId" className="mb-1.5 block text-sm font-semibold text-[var(--text-1)]">Topic ID</label>
            <input id="editTopicId" value={topicId} onChange={(event) => setTopicId(event.target.value)} className="search-input w-full" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <textarea id="editEnText" value={enText} onChange={(event) => setEnText(event.target.value)} className="search-input min-h-24 w-full" placeholder="Question (ENG)" />
            <textarea id="editAmText" value={amText} onChange={(event) => setAmText(event.target.value)} className="search-input min-h-24 w-full" placeholder="Question (ARM)" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <textarea id="editEnAnswer" value={enAnswer} onChange={(event) => setEnAnswer(event.target.value)} className="search-input min-h-24 w-full" placeholder="Answer (ENG)" />
            <textarea id="editAmAnswer" value={amAnswer} onChange={(event) => setAmAnswer(event.target.value)} className="search-input min-h-24 w-full" placeholder="Answer (ARM)" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <textarea id="editEnExplanation" value={enExplanation} onChange={(event) => setEnExplanation(event.target.value)} className="search-input min-h-24 w-full" placeholder="Explanation (ENG)" />
            <textarea id="editAmExplanation" value={amExplanation} onChange={(event) => setAmExplanation(event.target.value)} className="search-input min-h-24 w-full" placeholder="Explanation (ARM)" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <textarea id="editEnPitfalls" value={enPitfalls} onChange={(event) => setEnPitfalls(event.target.value)} className="search-input min-h-24 w-full" placeholder="Pitfalls (ENG, one per line)" />
            <textarea id="editAmPitfalls" value={amPitfalls} onChange={(event) => setAmPitfalls(event.target.value)} className="search-input min-h-24 w-full" placeholder="Pitfalls (ARM, one per line)" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <textarea id="editEnFollowups" value={enFollowups} onChange={(event) => setEnFollowups(event.target.value)} className="search-input min-h-24 w-full" placeholder="Follow-ups (ENG, one per line)" />
            <textarea id="editAmFollowups" value={amFollowups} onChange={(event) => setAmFollowups(event.target.value)} className="search-input min-h-24 w-full" placeholder="Follow-ups (ARM, one per line)" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input id="editCodeLang" value={codeLanguage} onChange={(event) => setCodeLanguage(event.target.value)} className="search-input w-full" placeholder="Primary code language" />
            <textarea id="editCodeSnippet" value={codeSnippet} onChange={(event) => setCodeSnippet(event.target.value)} className="search-input code-editor-input min-h-24 w-full font-mono text-xs" placeholder="Primary code snippet" />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--text-1)]">Examples (required)</p>
            <AdminExamplesEditor examples={examples} onChange={setExamples} />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-[var(--text-1)]">Category tags</p>
            <AdminTagEditor tags={tags} onChange={setTags} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary px-4 py-2 text-sm font-semibold">
            {isSubmitting ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuestionForm;
