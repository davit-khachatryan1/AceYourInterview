import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Question {
  id: string;
  question: string;
  answer: string;
  codeSnippet?: string;
  topic: string;
}

interface EditQuestionFormProps {
  question: Question;
  onUpdated: () => void;
  onCancel: () => void;
}

const EditQuestionForm: React.FC<EditQuestionFormProps> = ({ question, onUpdated, onCancel }) => {
  const [questionText, setQuestionText] = useState(question.question);
  const [answer, setAnswer] = useState(question.answer);
  const [codeSnippet, setCodeSnippet] = useState(question.codeSnippet || '');
  const [topic, setTopic] = useState(question.topic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuestionText(question.question);
    setAnswer(question.answer);
    setCodeSnippet(question.codeSnippet || '');
    setTopic(question.topic);
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const questionRef = doc(db, 'questions', question.id);
      await updateDoc(questionRef, {
        question: questionText,
        answer,
        codeSnippet,
        topic,
      });
      onUpdated();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
        <form onSubmit={handleSubmit} className="bg-slate-background p-6 rounded-lg w-full max-w-lg border border-white/20">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
            <label htmlFor="topic" className="block text-white/80 mb-2">Topic</label>
            <input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-background border border-white/20 rounded-md p-2 text-white"
            />
        </div>
        <div className="mb-4">
            <label htmlFor="question" className="block text-white/80 mb-2">Question</label>
            <input
            id="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full bg-slate-background border border-white/20 rounded-md p-2 text-white"
            />
        </div>
        <div className="mb-4">
            <label htmlFor="answer" className="block text-white/80 mb-2">Answer</label>
            <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-slate-background border border-white/20 rounded-md p-2 text-white h-24"
            />
        </div>
        <div className="mb-4">
            <label htmlFor="codeSnippet" className="block text-white/80 mb-2">Code Snippet</label>
            <textarea
            id="codeSnippet"
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            className="w-full bg-slate-background border border-white/20 rounded-md p-2 text-white h-32"
            />
        </div>
        <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-white/10 text-white px-4 py-2 rounded-md">
                Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-cobalt-blue text-white px-4 py-2 rounded-md">
            {isSubmitting ? 'Updating...' : 'Update Question'}
            </button>
        </div>
        </form>
    </div>
  );
};

export default EditQuestionForm;
