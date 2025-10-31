'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AUTOBIOGRAPHY_CHAPTERS } from '@/lib/autobiography/constants';
import { useAutobiographyEntries } from '@/hooks/useAutobiography';

export function ChapterNavigation() {
  const { data: entries = [] } = useAutobiographyEntries();

  // Calculate progress for each chapter
  const chapterProgress = AUTOBIOGRAPHY_CHAPTERS.map((chapter) => {
    const completedPrompts = entries.filter((e) => e.chapter === chapter.id).length;
    const totalPrompts = chapter.prompts.length;
    const progress = totalPrompts > 0 ? (completedPrompts / totalPrompts) * 100 : 0;

    return {
      ...chapter,
      completedPrompts,
      progress: Math.round(progress),
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chapterProgress.map((chapter, index) => {
        const IconComponent = (LucideIcons as any)[chapter.icon] || LucideIcons.BookOpen;

        return (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/autobiography/chapter/${chapter.id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 p-3 rounded-lg">
                    <IconComponent className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{chapter.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {chapter.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {chapter.completedPrompts} of {chapter.totalPrompts} completed
                        </span>
                        <Badge variant={chapter.progress === 100 ? 'default' : 'secondary'}>
                          {chapter.progress}%
                        </Badge>
                      </div>
                      <Progress value={chapter.progress} className="h-2" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
