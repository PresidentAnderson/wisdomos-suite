import { Suspense } from 'react';
import { AutobiographyDashboard } from '@/components/autobiography/AutobiographyDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'My Autobiography | WisdomOS',
  description: 'Document your life story with AI-powered insights and voice coaching',
};

export default function AutobiographyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={<AutobiographyDashboardSkeleton />}>
        <AutobiographyDashboard />
      </Suspense>
    </div>
  );
}

function AutobiographyDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
