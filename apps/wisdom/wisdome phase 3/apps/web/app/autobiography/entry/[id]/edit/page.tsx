'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EntryForm } from '@/components/autobiography/EntryForm';
import { useAutobiographyEntry } from '@/hooks/useAutobiography';
import { AUTOBIOGRAPHY_CHAPTERS } from '@/lib/autobiography/constants';

export default function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: entry, isLoading, error } = useAutobiographyEntry(id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Entry Not Found</h1>
        <Link href="/autobiography">
          <Button>Return to Autobiography</Button>
        </Link>
      </div>
    );
  }

  const chapter = AUTOBIOGRAPHY_CHAPTERS.find((c) => c.id === entry.chapter);
  const prompt = chapter?.prompts.find((p) => p.id === entry.promptId);

  if (!chapter || !prompt) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Entry Data</h1>
        <Link href="/autobiography">
          <Button>Return to Autobiography</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href={`/autobiography/entry/${id}`}>
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Entry
        </Button>
      </Link>

      <EntryForm
        chapter={entry.chapter}
        prompt={prompt}
        existingEntry={entry}
        mode="edit"
      />
    </div>
  );
}
