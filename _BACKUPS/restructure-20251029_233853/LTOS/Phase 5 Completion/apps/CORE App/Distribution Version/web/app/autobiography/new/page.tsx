'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EntryForm } from '@/components/autobiography/EntryForm';
import { AUTOBIOGRAPHY_CHAPTERS } from '@/lib/autobiography/constants';

function NewEntryContent() {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapter') || 'early-life';
  const promptId = searchParams.get('prompt');

  const chapter = AUTOBIOGRAPHY_CHAPTERS.find((c) => c.id === chapterId);
  const prompt = chapter?.prompts.find((p) => p.id === promptId) || chapter?.prompts[0];

  if (!chapter || !prompt) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Chapter or Prompt Not Found</h1>
        <Link href="/autobiography">
          <Button>Return to Autobiography</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href={`/autobiography/chapter/${chapterId}`}>
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to {chapter.title}
        </Button>
      </Link>

      <EntryForm chapter={chapterId} prompt={prompt} mode="create" />
    </div>
  );
}

export default function NewEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4 text-center">Loading...</div>
      }
    >
      <NewEntryContent />
    </Suspense>
  );
}
