'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import AddQuestionForm from '@/components/AddQuestionForm';
import QuestionsList from '@/components/QuestionsList';
import withAuth from '@/components/withAuth';

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 text-[var(--text-1)] md:p-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <header className="panel-surface mb-6 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
                <ShieldCheck size={12} />
                Admin Workspace
              </div>
              <h1 className="display-heading text-4xl md:text-5xl">Question Control Center</h1>
              <p className="mt-2 text-sm text-[var(--text-2)]">Create, edit, and publish bilingual interview content with structured examples.</p>
            </div>

            <Link href="/" className="btn-secondary text-sm">
              <ArrowLeft size={15} />
              Learner View
            </Link>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <section className="panel-surface p-5">
            <h2 className="display-heading mb-3 text-[1.5rem]">Add New Question</h2>
            <AddQuestionForm />
          </section>

          <section className="panel-surface p-5">
            <h2 className="display-heading mb-3 text-[1.5rem]">Existing Questions</h2>
            <div className="max-h-[78vh] overflow-y-auto pr-1">
              <QuestionsList />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminPage);
