'use client';

import FulfillmentDisplayTemplate from '@/components/FulfillmentDisplayTemplate';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FulfillmentDisplayPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-black hover:text-black dark:text-black dark:hover:text-black mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documentation
        </Link>
        
        <FulfillmentDisplayTemplate />
      </div>
    </div>
  );
}