'use client';

import AddQuestionForm from '@/components/AddQuestionForm';
import QuestionsList from '@/components/QuestionsList';
import withAuth from '@/components/withAuth';

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-slate-background text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Add New Question</h2>
            <AddQuestionForm />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Existing Questions</h2>
            <QuestionsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminPage);
