'use client';

import { deleteDoc, doc } from 'firebase/firestore';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import EditQuestionForm from '@/components/EditQuestionForm';
import { useQuestions } from '@/hooks/useQuestions';
import { db } from '@/lib/firebase';
import { useUIStore } from '@/store/uiStore';
import type { QuestionRecord } from '@/types/interview';

const QuestionsList = () => {
  const { questions, loading, error } = useQuestions(undefined, { enableDemoFallback: false });
  const language = useUIStore((state) => state.language);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRecord | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this question?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'questions', id));
    } catch (deleteError) {
      window.alert((deleteError as Error).message);
    }
  };

  if (loading) {
    return <p className="text-sm text-[var(--text-2)]">Loading questions...</p>;
  }

  if (error) {
    return <p className="text-sm text-[var(--text-1)]">{error}</p>;
  }

  return (
    <>
      <div className="space-y-2">
        {questions.map((question) => {
          const source = question.record;
          const primaryText = language === 'en' ? source.en_text ?? source.question : source.am_text ?? source.question;

          return (
            <div key={question.id} className="interactive-row p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text-1)]">
                    {primaryText || 'Untitled question'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-3)]">{question.topicLabel}</p>
                </div>
                <span className="micro-badge">#{question.id.slice(0, 6)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary px-2.5 py-1.5 text-xs"
                  onClick={() => setEditingQuestion(question.record)}
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-ghost border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-1)] hover:border-[var(--border-strong)]"
                  onClick={() => handleDelete(question.id)}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingQuestion && (
        <EditQuestionForm
          question={editingQuestion}
          onUpdated={() => setEditingQuestion(null)}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </>
  );
};

export default QuestionsList;
