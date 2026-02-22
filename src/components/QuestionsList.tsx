import React, { useEffect, useState } from 'react';
import { useQuestions } from '@/hooks/useQuestions';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EditQuestionForm from './EditQuestionForm';

interface Question {
  id: string;
  question: string;
  answer: string;
  codeSnippet?: string;
  topic: string;
}

const QuestionsList = () => {
  const { questions, loading, error, fetchQuestions } = useQuestions();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteDoc(doc(db, 'questions', id));
        fetchQuestions(); // Refresh the list
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleUpdate = () => {
    setEditingQuestion(null);
    fetchQuestions();
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
          <div>
            <h4 className="font-semibold">{q.question}</h4>
            <p className="text-sm text-white/60">{q.topic}</p>
          </div>
          <div className="space-x-2">
            <button onClick={() => handleEdit(q)} className="text-sm text-cobalt-blue hover:underline">Edit</button>
            <button onClick={() => handleDelete(q.id)} className="text-sm text-red-500 hover:underline">Delete</button>
          </div>
        </div>
      ))}

      {editingQuestion && (
        <EditQuestionForm
          question={editingQuestion}
          onUpdated={handleUpdate}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default QuestionsList;
