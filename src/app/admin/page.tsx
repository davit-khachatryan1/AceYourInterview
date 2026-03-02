'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import AddQuestionForm from '@/components/AddQuestionForm';
import QuestionsList from '@/components/QuestionsList';
import Card from '@/components/ui/Card';
import withAuth from '@/components/withAuth';

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 text-[var(--text-1)] md:p-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs font-medium text-[var(--text-2)]">
              <ShieldCheck size={13} />
              Admin workspace
            </div>
            <h1 className="display-heading mt-3 text-3xl md:text-4xl">Question Control Center</h1>
            <p className="mt-2 text-sm text-[var(--text-2)]">
              Create, review, and maintain interview content without changing the learner-side experience.
            </p>
          </div>

          <Link href="/" className="btn-secondary px-4 py-2 text-sm">
            <ArrowLeft size={15} />
            Learner View
          </Link>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card as="section" className="p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-3)]">Create Question</p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--text-1)]">AI-assisted authoring</h2>
              </div>
            </div>
            <AddQuestionForm />
          </Card>

          <Card as="section" className="p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-3)]">Recent Questions</p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--text-1)]">Library index</h2>
              </div>
            </div>
            <div className="max-h-[78vh] overflow-y-auto pr-1">
              <QuestionsList />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminPage);
