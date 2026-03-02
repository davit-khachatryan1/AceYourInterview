'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isFirebaseConfigured } from '@/lib/firebaseConfig';

interface CompletionState {
  completed: boolean;
  learnedCount: number;
  totalCount: number;
  percentage: number;
}

interface UseUserProgressResult {
  learnedSet: Set<string>;
  completionState: CompletionState;
  markLearned: (questionId: string, learned: boolean) => Promise<{ newlyCompleted: boolean }>;
  loading: boolean;
  error: string | null;
}

const uniqueIds = (ids: string[]): string[] => [...new Set(ids.filter(Boolean))];

export const useUserProgress = (
  uid: string | null,
  topicId: string | null,
  questionIds: string[],
  sessionState: { loading: boolean; error: string | null },
  persistenceEnabled = true,
): UseUserProgressResult => {
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const learnedRef = useRef<string[]>([]);
  const completedRef = useRef(false);
  const localProgressRef = useRef<Record<string, string[]>>({});

  useEffect(() => {
    learnedRef.current = learnedIds;
  }, [learnedIds]);

  useEffect(() => {
    completedRef.current = !!completedAt;
  }, [completedAt]);

  useEffect(() => {
    if (!topicId) {
      setLearnedIds([]);
      setCompletedAt(null);
      return;
    }

    if (!persistenceEnabled || !isFirebaseConfigured) {
      setLearnedIds(localProgressRef.current[topicId] ?? []);
      setCompletedAt(null);
      setError(null);
      return;
    }

    if (!uid) {
      setLearnedIds([]);
      setCompletedAt(null);
      return;
    }

    const progressRef = doc(db, 'users', uid, 'topicProgress', topicId);
    const unsubscribe = onSnapshot(
      progressRef,
      (snapshot) => {
        const data = snapshot.data();
        const ids = Array.isArray(data?.learnedQuestionIds)
          ? data.learnedQuestionIds.filter((value: unknown): value is string => typeof value === 'string')
          : [];
        setLearnedIds(uniqueIds(ids));

        const completedValue = data?.completedAt;
        if (completedValue && typeof completedValue.toDate === 'function') {
          setCompletedAt(completedValue.toDate());
        } else {
          setCompletedAt(null);
        }

        setError(null);
      },
      (nextError) => {
        setError(nextError.message);
      },
    );

    return () => unsubscribe();
  }, [topicId, uid, persistenceEnabled]);

  const learnedSet = useMemo(() => new Set(learnedIds), [learnedIds]);

  const completionState = useMemo<CompletionState>(() => {
    const totalCount = questionIds.length;
    const learnedCount = questionIds.filter((id) => learnedSet.has(id)).length;
    const completed = totalCount > 0 && learnedCount === totalCount;
    const percentage = totalCount === 0 ? 0 : Math.round((learnedCount / totalCount) * 100);

    return {
      completed,
      learnedCount,
      totalCount,
      percentage,
    };
  }, [learnedSet, questionIds]);

  const markLearned = useCallback(
    async (questionId: string, learned: boolean): Promise<{ newlyCompleted: boolean }> => {
      if (!topicId) {
        return { newlyCompleted: false };
      }

      const nextSet = new Set(learnedRef.current);
      if (learned) {
        nextSet.add(questionId);
      } else {
        nextSet.delete(questionId);
      }

      const nextIds = uniqueIds([...nextSet]);
      const nextAllLearned = questionIds.length > 0 && questionIds.every((id) => nextSet.has(id));
      const newlyCompleted = nextAllLearned && !completedRef.current;

      if (!persistenceEnabled || !isFirebaseConfigured || !uid) {
        localProgressRef.current[topicId] = nextIds;
        setLearnedIds(nextIds);
        setCompletedAt(nextAllLearned ? new Date() : null);
        return { newlyCompleted };
      }

      const progressRef = doc(db, 'users', uid, 'topicProgress', topicId);
      const payload: Record<string, unknown> = {
        learnedQuestionIds: nextIds,
        updatedAt: serverTimestamp(),
      };

      if (nextAllLearned) {
        payload.completedAt = serverTimestamp();
      }

      try {
        await setDoc(progressRef, payload, { merge: true });
        return { newlyCompleted };
      } catch (writeError) {
        setError((writeError as Error).message);
        return { newlyCompleted: false };
      }
    },
    [questionIds, topicId, uid, persistenceEnabled],
  );

  return {
    learnedSet,
    completionState,
    markLearned,
    loading: persistenceEnabled && isFirebaseConfigured ? sessionState.loading : false,
    error: persistenceEnabled && isFirebaseConfigured ? error ?? sessionState.error : null,
  };
};
