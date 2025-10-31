'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChapterView } from '@/components/autobiography/ChapterView';
import { AUTOBIOGRAPHY_CHAPTERS } from '@/lib/autobiography/constants';

export default function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const chapter = AUTOBIOGRAPHY_CHAPTERS.find((c) => c.id === id);

  if (!chapter) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Chapter Not Found</h1>
        <Link href="/autobiography">
          <Button>Return to Autobiography</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/autobiography">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Autobiography
        </Button>
      </Link>

      <ChapterView chapterId={id} />
    </div>
  );
}
