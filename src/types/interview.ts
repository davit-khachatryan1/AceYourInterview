export type Language = 'en' | 'am';

export interface QuestionExampleRecord {
  id?: string;
  en_title?: string;
  am_title?: string;
  en_description?: string;
  am_description?: string;
  codeSnippet?: string;
  codeLanguage?: string;
}

export interface QuestionRecord {
  id: string;
  topicId?: string;
  topic?: string;
  tags?: string[];
  en_text?: string;
  am_text?: string;
  en_answer?: string;
  am_answer?: string;
  en_explanation?: string;
  am_explanation?: string;
  en_pitfalls?: string[];
  am_pitfalls?: string[];
  en_followups?: string[];
  am_followups?: string[];
  examples?: QuestionExampleRecord[];
  question?: string;
  answer?: string;
  codeSnippet?: string;
  codeLanguage?: string;
}

export interface NormalizedQuestionExample {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  codeLanguage: string;
}

export interface NormalizedQuestion {
  id: string;
  topicId: string;
  topicLabel: string;
  tags: string[];
  questionText: string;
  answerText: string;
  explanationText: string;
  pitfalls: string[];
  followups: string[];
  examples: NormalizedQuestionExample[];
  isFallbackLanguage: boolean;
  codeSnippet?: string;
  codeLanguage?: string;
  record: QuestionRecord;
}

export interface TopicSummary {
  id: string;
  label: string;
  count: number;
}

export interface UserPrefs {
  language: Language;
  updatedAt?: Date;
}

export interface TopicProgress {
  learnedQuestionIds: string[];
  completedAt?: Date;
  updatedAt?: Date;
}

const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const cleanList = (value?: string[]): string[] => (Array.isArray(value) ? value.filter(nonEmpty).map((entry) => entry.trim()) : []);

const pickText = ({
  primary,
  secondary,
  legacy,
  fallback,
}: {
  primary?: string;
  secondary?: string;
  legacy?: string;
  fallback: string;
}): string => {
  if (nonEmpty(primary)) return primary.trim();
  if (nonEmpty(secondary)) return secondary.trim();
  if (nonEmpty(legacy)) return legacy.trim();
  return fallback;
};

const fallbackToLabel = (value: string): string => {
  const cleaned = value.replace(/[-_]+/g, ' ').trim();
  if (!cleaned) {
    return 'General';
  }

  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
};

export const toTopicId = (record: QuestionRecord): string => {
  const candidate = record.topicId ?? record.topic ?? 'general';
  return candidate.trim().toLowerCase().replace(/\s+/g, '-');
};

export const toTopicLabel = (record: QuestionRecord): string => {
  return fallbackToLabel(record.topicId ?? record.topic ?? 'general');
};

export const normalizeQuestion = (
  record: QuestionRecord,
  language: Language,
): NormalizedQuestion => {
  const preferredQuestion = language === 'en' ? record.en_text : record.am_text;
  const secondaryQuestion = language === 'en' ? record.am_text : record.en_text;
  const preferredAnswer = language === 'en' ? record.en_answer : record.am_answer;
  const secondaryAnswer = language === 'en' ? record.am_answer : record.en_answer;
  const preferredExplanation = language === 'en' ? record.en_explanation : record.am_explanation;
  const secondaryExplanation = language === 'en' ? record.am_explanation : record.en_explanation;
  const preferredPitfalls = language === 'en' ? cleanList(record.en_pitfalls) : cleanList(record.am_pitfalls);
  const secondaryPitfalls = language === 'en' ? cleanList(record.am_pitfalls) : cleanList(record.en_pitfalls);
  const preferredFollowups = language === 'en' ? cleanList(record.en_followups) : cleanList(record.am_followups);
  const secondaryFollowups = language === 'en' ? cleanList(record.am_followups) : cleanList(record.en_followups);

  const questionText = pickText({
    primary: preferredQuestion,
    secondary: secondaryQuestion,
    legacy: record.question,
    fallback: 'Question unavailable',
  });

  const answerText = pickText({
    primary: preferredAnswer,
    secondary: secondaryAnswer,
    legacy: record.answer,
    fallback: 'Answer unavailable',
  });

  const explanationText = pickText({
    primary: preferredExplanation,
    secondary: secondaryExplanation,
    legacy: preferredAnswer ?? secondaryAnswer ?? record.answer,
    fallback: answerText,
  });

  const pitfalls = preferredPitfalls.length > 0 ? preferredPitfalls : secondaryPitfalls;
  const followups = preferredFollowups.length > 0 ? preferredFollowups : secondaryFollowups;

  const runtimeExamples: QuestionExampleRecord[] =
    Array.isArray(record.examples) && record.examples.length > 0
      ? record.examples
      : nonEmpty(record.codeSnippet)
        ? [
            {
              id: `${record.id}-legacy-example`,
              en_title: 'Primary Example',
              am_title: 'Հիմնական օրինակ',
              en_description: record.en_explanation ?? record.en_answer ?? record.answer ?? '',
              am_description: record.am_explanation ?? record.am_answer ?? record.answer ?? '',
              codeSnippet: record.codeSnippet,
              codeLanguage: record.codeLanguage ?? 'tsx',
            },
          ]
        : [];

  const examples: NormalizedQuestionExample[] = runtimeExamples
    .map((example, index) => {
      const title = pickText({
        primary: language === 'en' ? example.en_title : example.am_title,
        secondary: language === 'en' ? example.am_title : example.en_title,
        fallback: `Example ${index + 1}`,
      });
      const description = pickText({
        primary: language === 'en' ? example.en_description : example.am_description,
        secondary: language === 'en' ? example.am_description : example.en_description,
        fallback: 'Walk through this example and explain the tradeoffs.',
      });
      const codeSnippet = nonEmpty(example.codeSnippet) ? example.codeSnippet : '';

      return {
        id: nonEmpty(example.id) ? example.id : `${record.id}-example-${index + 1}`,
        title,
        description,
        codeSnippet,
        codeLanguage: nonEmpty(example.codeLanguage) ? example.codeLanguage : 'tsx',
      };
    })
    .filter((example) => example.codeSnippet.length > 0);

  return {
    id: record.id,
    topicId: toTopicId(record),
    topicLabel: toTopicLabel(record),
    tags: record.tags ?? [],
    questionText,
    answerText,
    explanationText,
    pitfalls,
    followups,
    examples,
    isFallbackLanguage: !nonEmpty(preferredQuestion) && !!(nonEmpty(secondaryQuestion) || nonEmpty(record.question)),
    codeSnippet: record.codeSnippet,
    codeLanguage: record.codeLanguage,
    record,
  };
};
