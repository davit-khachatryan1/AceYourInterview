import type { QuestionExampleRecord } from '@/types/interview';

export type AdminQuestionDraftField =
  | 'topicId'
  | 'enText'
  | 'amText'
  | 'enAnswer'
  | 'amAnswer'
  | 'enExplanation'
  | 'amExplanation'
  | 'enPitfalls'
  | 'amPitfalls'
  | 'enFollowups'
  | 'amFollowups'
  | 'examples';

export interface AdminQuestionDraft {
  topicId: string;
  enText: string;
  amText: string;
  enAnswer: string;
  amAnswer: string;
  enExplanation: string;
  amExplanation: string;
  enPitfallsText: string;
  amPitfallsText: string;
  enFollowupsText: string;
  amFollowupsText: string;
  codeSnippet: string;
  codeLanguage: string;
  tags: string[];
  examples: QuestionExampleRecord[];
}

export interface AdminParseResult {
  draft: AdminQuestionDraft;
  missingFields: AdminQuestionDraftField[];
  warnings: string[];
}

export interface AdminQuestionParseSource {
  topicId?: unknown;
  enText?: unknown;
  amText?: unknown;
  enAnswer?: unknown;
  amAnswer?: unknown;
  enExplanation?: unknown;
  amExplanation?: unknown;
  enPitfalls?: unknown;
  amPitfalls?: unknown;
  enFollowups?: unknown;
  amFollowups?: unknown;
  codeSnippet?: unknown;
  codeLanguage?: unknown;
  tags?: unknown;
  examples?: unknown;
}

interface DraftValidationResult {
  canSave: boolean;
  missingFields: AdminQuestionDraftField[];
}

const defaultCodeLanguage = 'tsx';

export const adminDraftFieldLabels: Record<AdminQuestionDraftField, string> = {
  topicId: 'Topic ID',
  enText: 'Question (ENG)',
  amText: 'Question (ARM)',
  enAnswer: 'Answer (ENG)',
  amAnswer: 'Answer (ARM)',
  enExplanation: 'Explanation (ENG)',
  amExplanation: 'Explanation (ARM)',
  enPitfalls: 'Pitfalls (ENG)',
  amPitfalls: 'Pitfalls (ARM)',
  enFollowups: 'Follow-ups (ENG)',
  amFollowups: 'Follow-ups (ARM)',
  examples: 'Examples',
};

const toTrimmedString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const toNonEmptyStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

export const listToText = (value?: string[]): string =>
  Array.isArray(value) ? value.map((entry) => entry.trim()).filter(Boolean).join('\n') : '';

export const textToList = (value: string): string[] =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const normalizeTag = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');

export const normalizeTags = (value: unknown): string[] => {
  const rawEntries = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\n,]/)
      : [];

  const normalized = rawEntries
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => normalizeTag(entry))
    .filter(Boolean);

  return [...new Set(normalized)];
};

export const createEmptyExample = (index = 0): QuestionExampleRecord => ({
  id: `example-${index + 1}`,
  en_title: '',
  am_title: '',
  en_description: '',
  am_description: '',
  codeSnippet: '',
  codeLanguage: defaultCodeLanguage,
});

export const normalizeExamples = (examples: QuestionExampleRecord[]): QuestionExampleRecord[] =>
  examples.map((example, index) => ({
    id: toTrimmedString(example.id) || `example-${index + 1}`,
    en_title: toTrimmedString(example.en_title),
    am_title: toTrimmedString(example.am_title),
    en_description: toTrimmedString(example.en_description),
    am_description: toTrimmedString(example.am_description),
    codeSnippet: toTrimmedString(example.codeSnippet),
    codeLanguage: toTrimmedString(example.codeLanguage) || defaultCodeLanguage,
  }));

const toExamples = (value: unknown): QuestionExampleRecord[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry, index) => ({
      id: toTrimmedString(entry.id) || `example-${index + 1}`,
      en_title: toTrimmedString(entry.en_title),
      am_title: toTrimmedString(entry.am_title),
      en_description: toTrimmedString(entry.en_description),
      am_description: toTrimmedString(entry.am_description),
      codeSnippet: toTrimmedString(entry.codeSnippet),
      codeLanguage: toTrimmedString(entry.codeLanguage) || defaultCodeLanguage,
    }));
};

export const createEmptyAdminQuestionDraft = (): AdminQuestionDraft => ({
  topicId: '',
  enText: '',
  amText: '',
  enAnswer: '',
  amAnswer: '',
  enExplanation: '',
  amExplanation: '',
  enPitfallsText: '',
  amPitfallsText: '',
  enFollowupsText: '',
  amFollowupsText: '',
  codeSnippet: '',
  codeLanguage: defaultCodeLanguage,
  tags: [],
  examples: [createEmptyExample()],
});

export const createAdminQuestionDraft = (
  source: AdminQuestionParseSource = {},
): AdminQuestionDraft => ({
  topicId: toTrimmedString(source.topicId),
  enText: toTrimmedString(source.enText),
  amText: toTrimmedString(source.amText),
  enAnswer: toTrimmedString(source.enAnswer),
  amAnswer: toTrimmedString(source.amAnswer),
  enExplanation: toTrimmedString(source.enExplanation),
  amExplanation: toTrimmedString(source.amExplanation),
  enPitfallsText: toNonEmptyStringList(source.enPitfalls).join('\n'),
  amPitfallsText: toNonEmptyStringList(source.amPitfalls).join('\n'),
  enFollowupsText: toNonEmptyStringList(source.enFollowups).join('\n'),
  amFollowupsText: toNonEmptyStringList(source.amFollowups).join('\n'),
  codeSnippet: toTrimmedString(source.codeSnippet),
  codeLanguage: toTrimmedString(source.codeLanguage) || defaultCodeLanguage,
  tags: normalizeTags(source.tags),
  examples: toExamples(source.examples),
});

export const validateAdminQuestionDraft = (
  draft: AdminQuestionDraft,
): DraftValidationResult => {
  const missingFields: AdminQuestionDraftField[] = [];

  if (!draft.topicId.trim()) missingFields.push('topicId');
  if (!draft.enText.trim()) missingFields.push('enText');
  if (!draft.amText.trim()) missingFields.push('amText');
  if (!draft.enAnswer.trim()) missingFields.push('enAnswer');
  if (!draft.amAnswer.trim()) missingFields.push('amAnswer');
  if (!draft.enExplanation.trim()) missingFields.push('enExplanation');
  if (!draft.amExplanation.trim()) missingFields.push('amExplanation');
  if (textToList(draft.enPitfallsText).length === 0) missingFields.push('enPitfalls');
  if (textToList(draft.amPitfallsText).length === 0) missingFields.push('amPitfalls');
  if (textToList(draft.enFollowupsText).length === 0) missingFields.push('enFollowups');
  if (textToList(draft.amFollowupsText).length === 0) missingFields.push('amFollowups');

  const normalizedExamples = normalizeExamples(draft.examples);
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

  if (hasInvalidExample) {
    missingFields.push('examples');
  }

  return {
    canSave: missingFields.length === 0,
    missingFields,
  };
};

export const buildQuestionPayload = (draft: AdminQuestionDraft) => {
  const normalizedExamples = normalizeExamples(draft.examples);

  return {
    topicId: draft.topicId.trim(),
    topic: draft.topicId.trim(),
    en_text: draft.enText.trim(),
    am_text: draft.amText.trim(),
    en_answer: draft.enAnswer.trim(),
    am_answer: draft.amAnswer.trim(),
    en_explanation: draft.enExplanation.trim(),
    am_explanation: draft.amExplanation.trim(),
    en_pitfalls: textToList(draft.enPitfallsText),
    am_pitfalls: textToList(draft.amPitfallsText),
    en_followups: textToList(draft.enFollowupsText),
    am_followups: textToList(draft.amFollowupsText),
    examples: normalizedExamples,
    question: draft.enText.trim(),
    answer: draft.enAnswer.trim(),
    tags: normalizeTags(draft.tags),
    codeSnippet: draft.codeSnippet.trim() || normalizedExamples[0]?.codeSnippet || '',
    codeLanguage:
      draft.codeLanguage.trim() || normalizedExamples[0]?.codeLanguage || defaultCodeLanguage,
  };
};
