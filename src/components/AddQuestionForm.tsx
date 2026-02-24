"use client";

import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AddQuestionForm = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'questions'), {
        question,
        answer,
        codeSnippet,
        topic,
      });
      setQuestion('');
      setAnswer('');
      setCodeSnippet('');
      setTopic('');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 p-6 rounded-lg">
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
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full bg-slate-background border border-white/20 rounded-md p-2 text-white"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="answer" className="block text-white/80 mb-2">Answer</label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full bg-slate-background border border-white/20 rounded-md p-2 text-white"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="codeSnippet" className="block text-white/80 mb-2">Code Snippet</label>
        <textarea
          id="codeSnippet"
          value={codeSnippet}
          onChange={(e) => setCodeSnippet(e.target.value)}
          className="w-full bg-slate-background border border-white/20 rounded-md p-2 text-white"
        />
      </div>
      <button type="submit" disabled={isSubmitting} className="bg-cobalt-blue text-white px-4 py-2 rounded-md">
        {isSubmitting ? 'Submitting...' : 'Add Question'}
      </button>
    </form>
  );
};

export default AddQuestionForm;
