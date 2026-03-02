'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useMemo, useState, type FormEvent } from 'react';
import AdminExamplesEditor from '@/components/AdminExamplesEditor';
import AdminTagEditor from '@/components/AdminTagEditor';
import {
  adminAiProviderOptions,
  defaultAdminAiProvider,
  type AdminAiProvider,
} from '@/lib/adminAiProviders';
import {
  adminDraftFieldLabels,
  buildQuestionPayload,
  createEmptyAdminQuestionDraft,
  validateAdminQuestionDraft,
  type AdminParseResult,
  type AdminQuestionDraft,
  type AdminQuestionDraftField,
} from '@/lib/adminQuestionDraft';
import { auth, db } from '@/lib/firebase';

interface AddQuestionFormProps {
  onCreated?: () => void;
}

type ParseStatus = 'idle' | 'parsing' | 'parsed' | 'failed';

const topicOverrideOptions = ['react', 'javascript'] as const;

const getLabelClassName = (highlight: boolean): string =>
  highlight
    ? 'mb-1.5 block text-sm font-semibold text-[var(--brand-secondary)]'
    : 'mb-1.5 block text-sm font-semibold text-[var(--text-1)]';

const AddQuestionForm = ({ onCreated }: AddQuestionFormProps) => {
  const [rawInput, setRawInput] = useState('');
  const [provider, setProvider] = useState<AdminAiProvider>(defaultAdminAiProvider);
  const [topicOverride, setTopicOverride] = useState('');
  const [draft, setDraft] = useState<AdminQuestionDraft>(createEmptyAdminQuestionDraft());
  const [warnings, setWarnings] = useState<string[]>([]);
  const [hasParsedDraft, setHasParsedDraft] = useState(false);
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => validateAdminQuestionDraft(draft), [draft]);

  const setDraftField = <K extends keyof AdminQuestionDraft>(
    field: K,
    value: AdminQuestionDraft[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const isMissingField = (field: AdminQuestionDraftField): boolean =>
    hasParsedDraft && validation.missingFields.includes(field);

  const currentStep = !hasParsedDraft ? 1 : !validation.canSave ? 3 : 4;

  const handleParse = async () => {
    if (!rawInput.trim()) {
      setError('Paste the full mixed question content before parsing.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('You need an active admin session before using AI parsing.');
      return;
    }

    setParseStatus('parsing');
    setError(null);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/parse-question', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          rawInput,
          topicOverride,
        }),
      });

      const payload = (await response.json()) as Partial<AdminParseResult> & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || 'The AI parser could not process this input.');
      }

      if (!payload.draft) {
        throw new Error('The AI parser returned an empty draft.');
      }

      setDraft(payload.draft);
      setWarnings(Array.isArray(payload.warnings) ? payload.warnings : []);
      setHasParsedDraft(true);
      setParseStatus('parsed');
    } catch (parseError) {
      setParseStatus('failed');
      setError((parseError as Error).message);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!hasParsedDraft) {
      setError('Parse the mixed question content before saving.');
      return;
    }

    if (!validation.canSave) {
      setError('Review the missing required fields before saving.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'questions'), {
        ...buildQuestionPayload(draft),
        updatedAt: serverTimestamp(),
      });

      setRawInput('');
      setTopicOverride('');
      setDraft(createEmptyAdminQuestionDraft());
      setWarnings([]);
      setHasParsedDraft(false);
      setParseStatus('idle');
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
        <p className="rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-3 text-sm text-[var(--text-1)]">
          {error}
        </p>
      )}

      <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-2)] p-4 md:p-5">
        <div className="mb-5 grid gap-2 sm:grid-cols-4">
          {['Paste', 'Parse', 'Review', 'Save'].map((step, index) => {
            const stepNumber = index + 1;
            const active = currentStep === stepNumber;
            const complete = currentStep > stepNumber;

            return (
              <div
                key={step}
                className={`rounded-2xl border px-3 py-3 ${
                  complete || active
                    ? 'border-[color-mix(in_srgb,var(--brand-primary)_18%,var(--border))] bg-[color-mix(in_srgb,var(--brand-primary)_8%,var(--surface-3))]'
                    : 'border-[var(--border)] bg-[var(--surface-1)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                      complete
                        ? 'bg-[var(--brand-primary)] text-white'
                        : active
                          ? 'bg-[color-mix(in_srgb,var(--brand-primary)_14%,var(--surface-3))] text-[var(--brand-primary)]'
                          : 'bg-[var(--surface-1)] text-[var(--text-3)]'
                    }`}
                  >
                    {stepNumber}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-1)]">{step}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
              Step 1
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--text-1)]">Paste Full Question Content</h3>
            <p className="mt-1 text-sm text-[var(--text-2)]">
              Paste one mixed block of English, Armenian, examples, tags, and code. AI will sort it into the existing question fields for review.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="provider" className="mb-1.5 block text-sm font-semibold text-[var(--text-1)]">
                AI provider
              </label>
              <select
                id="provider"
                value={provider}
                onChange={(event) => setProvider(event.target.value as AdminAiProvider)}
                className="search-input w-full"
              >
                {adminAiProviderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="topicOverride" className="mb-1.5 block text-sm font-semibold text-[var(--text-1)]">
                Topic ID override (optional)
              </label>
              <select
                id="topicOverride"
                value={topicOverride}
                onChange={(event) => setTopicOverride(event.target.value)}
                className="search-input w-full"
              >
                <option value="">Auto-detect from content</option>
                {topicOverrideOptions.map((topicId) => (
                  <option key={topicId} value={topicId}>
                    {topicId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="rawInput" className="mb-1.5 block text-sm font-semibold text-[var(--text-1)]">
              Mixed source text
            </label>
            <textarea
              id="rawInput"
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
              className="search-input min-h-56 w-full"
              placeholder="Paste the full mixed question draft here..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleParse}
              disabled={parseStatus === 'parsing'}
              className="btn-primary px-4 py-2 text-sm font-semibold"
            >
              {parseStatus === 'parsing'
                ? 'Parsing...'
                : hasParsedDraft
                  ? 'Parse Again'
                  : 'Parse with AI'}
            </button>
            {hasParsedDraft && (
              <p className="self-center text-sm text-[var(--text-2)]">
                Parsed draft ready. Review the structured fields below before saving.
              </p>
            )}
          </div>
        </div>
      </div>

      {hasParsedDraft && (
        <div className="space-y-5">
          <div className="space-y-4 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-2)] p-4 md:p-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                Step 2
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--text-1)]">Review Parsed Content</h3>
              <p className="mt-1 text-sm text-[var(--text-2)]">
                Fix anything AI sorted incorrectly, then save the question to Firestore using the same schema as the current site.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-3)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                  Missing required fields
                </p>
                {validation.missingFields.length === 0 ? (
                  <p className="mt-2 text-sm text-[var(--text-2)]">All required fields are ready.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-[var(--text-1)]">
                    {validation.missingFields.map((field) => (
                      <li key={field}>{adminDraftFieldLabels[field]}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-3)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                  Parser warnings
                </p>
                {warnings.length === 0 ? (
                  <p className="mt-2 text-sm text-[var(--text-2)]">No parser warnings.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-[var(--text-1)]">
                    {warnings.map((warning, index) => (
                      <li key={`${warning}-${index}`}>{warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-2)] p-4 md:p-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                Core Content
              </p>
              <div className="mt-4 space-y-5">
                <div>
                  <label htmlFor="topicId" className={getLabelClassName(isMissingField('topicId'))}>
                    Topic ID
                  </label>
                  <input
                    id="topicId"
                    value={draft.topicId}
                    onChange={(event) => setDraftField('topicId', event.target.value)}
                    className="search-input w-full"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="enText" className={getLabelClassName(isMissingField('enText'))}>
                      Question (ENG)
                    </label>
                    <textarea
                      id="enText"
                      value={draft.enText}
                      onChange={(event) => setDraftField('enText', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="amText" className={getLabelClassName(isMissingField('amText'))}>
                      Question (ARM)
                    </label>
                    <textarea
                      id="amText"
                      value={draft.amText}
                      onChange={(event) => setDraftField('amText', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="enAnswer" className={getLabelClassName(isMissingField('enAnswer'))}>
                      Answer (ENG)
                    </label>
                    <textarea
                      id="enAnswer"
                      value={draft.enAnswer}
                      onChange={(event) => setDraftField('enAnswer', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="amAnswer" className={getLabelClassName(isMissingField('amAnswer'))}>
                      Answer (ARM)
                    </label>
                    <textarea
                      id="amAnswer"
                      value={draft.amAnswer}
                      onChange={(event) => setDraftField('amAnswer', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enExplanation"
                      className={getLabelClassName(isMissingField('enExplanation'))}
                    >
                      Explanation (ENG)
                    </label>
                    <textarea
                      id="enExplanation"
                      value={draft.enExplanation}
                      onChange={(event) => setDraftField('enExplanation', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="amExplanation"
                      className={getLabelClassName(isMissingField('amExplanation'))}
                    >
                      Explanation (ARM)
                    </label>
                    <textarea
                      id="amExplanation"
                      value={draft.amExplanation}
                      onChange={(event) => setDraftField('amExplanation', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                Lists
              </p>
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enPitfalls"
                      className={getLabelClassName(isMissingField('enPitfalls'))}
                    >
                      Pitfalls (ENG, one per line)
                    </label>
                    <textarea
                      id="enPitfalls"
                      value={draft.enPitfallsText}
                      onChange={(event) => setDraftField('enPitfallsText', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="amPitfalls"
                      className={getLabelClassName(isMissingField('amPitfalls'))}
                    >
                      Pitfalls (ARM, one per line)
                    </label>
                    <textarea
                      id="amPitfalls"
                      value={draft.amPitfallsText}
                      onChange={(event) => setDraftField('amPitfallsText', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enFollowups"
                      className={getLabelClassName(isMissingField('enFollowups'))}
                    >
                      Follow-ups (ENG, one per line)
                    </label>
                    <textarea
                      id="enFollowups"
                      value={draft.enFollowupsText}
                      onChange={(event) => setDraftField('enFollowupsText', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="amFollowups"
                      className={getLabelClassName(isMissingField('amFollowups'))}
                    >
                      Follow-ups (ARM, one per line)
                    </label>
                    <textarea
                      id="amFollowups"
                      value={draft.amFollowupsText}
                      onChange={(event) => setDraftField('amFollowupsText', event.target.value)}
                      className="search-input min-h-24 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className={getLabelClassName(isMissingField('examples'))}>Examples (required)</p>
              <AdminExamplesEditor
                examples={draft.examples}
                onChange={(nextExamples) => setDraftField('examples', nextExamples)}
              />
            </div>

            <div>
              <p className="mb-1.5 text-sm font-semibold text-[var(--text-1)]">Category tags</p>
              <AdminTagEditor
                tags={draft.tags}
                onChange={(nextTags) => setDraftField('tags', nextTags)}
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                Advanced
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="codeLanguage" className="mb-1.5 block text-sm font-semibold text-[var(--text-1)]">
                    Primary code language
                  </label>
                  <input
                    id="codeLanguage"
                    value={draft.codeLanguage}
                    onChange={(event) => setDraftField('codeLanguage', event.target.value)}
                    className="search-input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="codeSnippet" className="mb-1.5 block text-sm font-semibold text-[var(--text-1)]">
                    Primary code snippet
                  </label>
                  <textarea
                    id="codeSnippet"
                    value={draft.codeSnippet}
                    onChange={(event) => setDraftField('codeSnippet', event.target.value)}
                    className="search-input code-editor-input min-h-24 w-full font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-2)] p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-1)]">Final step</p>
              <p className="mt-1 text-sm text-[var(--text-2)]">
                Confirm the structured fields, then save the question to Firestore.
              </p>
            </div>
            <button
              type="submit"
              disabled={!validation.canSave || isSubmitting}
              className="btn-primary px-4 py-2 text-sm font-semibold"
            >
              {isSubmitting ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default AddQuestionForm;
