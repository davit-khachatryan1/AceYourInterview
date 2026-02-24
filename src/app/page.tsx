"use client";

import Sidebar from "@/components/Sidebar";
import DualLanguageToggle from "@/components/DualLanguageToggle";
import InterviewCard from "@/components/InterviewCard";
import { useQuestions } from "@/hooks/useQuestions";
import { useEffect } from "react";

export default function Home() {
  const { questions, loading, error, fetchQuestions } = useQuestions();

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return (
    <div className="flex h-screen bg-slate-background text-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Ace Your Interview</h1>
          <DualLanguageToggle />
        </div>
        {loading && <p>Loading questions...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {questions.map((q) => (
              <InterviewCard
                key={q.id}
                question={q.question}
                answer={q.answer}
                codeSnippet={q.codeSnippet}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
