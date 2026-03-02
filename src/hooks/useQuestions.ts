'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore';
import { demoQuestions } from '@/data/demoQuestions';
import { db } from '@/lib/firebase';
import { isFirebaseConfigured } from '@/lib/firebaseConfig';
import { useUIStore } from '@/store/uiStore';
import {
  normalizeQuestion,
  type NormalizedQuestion,
  type QuestionExampleRecord,
  type QuestionRecord,
  type TopicSummary,
} from '@/types/interview';

export type QuestionsSourceMode = 'firestore' | 'demo';

interface UseQuestionsState {
  questions: NormalizedQuestion[];
  topics: TopicSummary[];
  loading: boolean;
  error: string | null;
  sourceMode: QuestionsSourceMode;
  isDemoFallback: boolean;
}

interface UseQuestionsOptions {
  enableDemoFallback?: boolean;
}

const toRecord = (doc: { id: string; data: () => DocumentData }): QuestionRecord => {
  const data = doc.data();
  const toStringArray = (value: unknown): string[] | undefined => {
    if (!Array.isArray(value)) {
      return undefined;
    }

    const cleaned = value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
    return cleaned.length > 0 ? cleaned : undefined;
  };

  const toExamples = (value: unknown): QuestionExampleRecord[] | undefined => {
    if (!Array.isArray(value)) {
      return undefined;
    }

    const cleaned = value
      .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
      .map((entry, index) => ({
        id: typeof entry.id === 'string' && entry.id.trim().length > 0 ? entry.id : `${doc.id}-example-${index + 1}`,
        en_title: typeof entry.en_title === 'string' ? entry.en_title : undefined,
        am_title: typeof entry.am_title === 'string' ? entry.am_title : undefined,
        en_description: typeof entry.en_description === 'string' ? entry.en_description : undefined,
        am_description: typeof entry.am_description === 'string' ? entry.am_description : undefined,
        codeSnippet: typeof entry.codeSnippet === 'string' ? entry.codeSnippet : undefined,
        codeLanguage: typeof entry.codeLanguage === 'string' ? entry.codeLanguage : undefined,
      }));

    return cleaned.length > 0 ? cleaned : undefined;
  };

  return {
    id: doc.id,
    topicId: typeof data.topicId === 'string' ? data.topicId : undefined,
    topic: typeof data.topic === 'string' ? data.topic : undefined,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((tag: unknown): tag is string => typeof tag === 'string')
      : undefined,
    en_text: typeof data.en_text === 'string' ? data.en_text : undefined,
    am_text: typeof data.am_text === 'string' ? data.am_text : undefined,
    en_answer: typeof data.en_answer === 'string' ? data.en_answer : undefined,
    am_answer: typeof data.am_answer === 'string' ? data.am_answer : undefined,
    en_explanation: typeof data.en_explanation === 'string' ? data.en_explanation : undefined,
    am_explanation: typeof data.am_explanation === 'string' ? data.am_explanation : undefined,
    en_pitfalls: toStringArray(data.en_pitfalls),
    am_pitfalls: toStringArray(data.am_pitfalls),
    en_followups: toStringArray(data.en_followups),
    am_followups: toStringArray(data.am_followups),
    examples: toExamples(data.examples),
    question: typeof data.question === 'string' ? data.question : undefined,
    answer: typeof data.answer === 'string' ? data.answer : undefined,
    codeSnippet: typeof data.codeSnippet === 'string' ? data.codeSnippet : undefined,
    codeLanguage: typeof data.codeLanguage === 'string' ? data.codeLanguage : undefined,
  };
};

const shouldUseDemoFallback = (errorMessage: string): boolean => {
  const normalized = errorMessage.toLowerCase();
  return (
    normalized.includes('api-key-not-valid') ||
    normalized.includes('permission-denied') ||
    normalized.includes('network-request-failed') ||
    normalized.includes('unavailable')
  );
};

export const useQuestions = (
  topicId?: string,
  options: UseQuestionsOptions = {},
): UseQuestionsState => {
  const language = useUIStore((state) => state.language);
  const [records, setRecords] = useState<QuestionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState<QuestionsSourceMode>('firestore');
  const enableDemoFallback = options.enableDemoFallback ?? true;

  useEffect(() => {
    if (!isFirebaseConfigured) {
      if (enableDemoFallback) {
        setRecords(demoQuestions);
        setSourceMode('demo');
        setError('Firebase is not configured. Showing demo questions.');
      } else {
        setRecords([]);
        setSourceMode('firestore');
        setError('Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values to continue.');
      }
      setLoading(false);
      return;
    }

    const questionsRef = collection(db, 'questions');

    const unsubscribe = onSnapshot(
      questionsRef,
      (snapshot) => {
        const nextRecords = snapshot.docs.map((doc) => toRecord(doc));
        setRecords(nextRecords);
        setSourceMode('firestore');
        setLoading(false);
        setError(null);
      },
      (nextError) => {
        if (enableDemoFallback && shouldUseDemoFallback(nextError.message)) {
          setRecords(demoQuestions);
          setSourceMode('demo');
          setError('Firestore is unavailable right now. Showing demo questions.');
        } else {
          setRecords([]);
          setSourceMode('firestore');
          setError('Could not load questions from Firestore.');
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [enableDemoFallback]);

  const normalizedQuestions = useMemo(
    () => records.map((record) => normalizeQuestion(record, language)),
    [language, records],
  );

  const topics = useMemo(() => {
    const map = new Map<string, TopicSummary>();

    for (const question of normalizedQuestions) {
      const existing = map.get(question.topicId);
      if (!existing) {
        map.set(question.topicId, {
          id: question.topicId,
          label: question.topicLabel,
          count: 1,
        });
      } else {
        existing.count += 1;
      }
    }

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [normalizedQuestions]);

  const questions = useMemo(() => {
    if (!topicId) {
      return normalizedQuestions;
    }

    return normalizedQuestions.filter((question) => question.topicId === topicId);
  }, [normalizedQuestions, topicId]);

  return {
    questions,
    topics,
    loading,
    error,
    sourceMode,
    isDemoFallback: sourceMode === 'demo',
  };
};
