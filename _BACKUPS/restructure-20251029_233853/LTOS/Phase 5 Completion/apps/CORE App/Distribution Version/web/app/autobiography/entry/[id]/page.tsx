'use client';

import { use } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EntryView } from '@/components/autobiography/EntryView';
import { useAutobiographyEntry } from '@/hooks/useAutobiography';

export default function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: entry, isLoading, error } = useAutobiographyEntry(id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Entry Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The entry you are looking for does not exist or you don't have permission to view it.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <EntryView entry={entry} />
    </div>
  );
}
