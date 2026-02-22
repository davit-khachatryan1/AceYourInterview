import { create } from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // You will need to create this file and initialize firebase

interface Question {
  id: string;
  question: string;
  answer: string;
  codeSnippet?: string;
  topic: string;
}

interface QuestionsState {
  questions: Question[];
  loading: boolean;
  error: string | null;
  fetchQuestions: () => Promise<void>;
}

export const useQuestions = create<QuestionsState>((set) => ({
  questions: [],
  loading: true,
  error: null,
  fetchQuestions: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'questions'));
      const questions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Question));
      set({ questions, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
