'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PromptCard } from './PromptCard';
import { useChapterEntries } from '@/hooks/useAutobiography';
import { AUTOBIOGRAPHY_CHAPTERS } from '@/lib/autobiography/constants';

interface ChapterViewProps {
  chapterId: string;
}

export function ChapterView({ chapterId }: ChapterViewProps) {
  const chapter = AUTOBIOGRAPHY_CHAPTERS.find((c) => c.id === chapterId);
  const { data: entries = [] } = useChapterEntries(chapterId);

  if (!chapter) {
    return <div>Chapter not found</div>;
  }

  const IconComponent = (LucideIcons as any)[chapter.icon] || LucideIcons.BookOpen;
  const completedPrompts = entries.length;
  const totalPrompts = chapter.prompts.length;
  const progress = totalPrompts > 0 ? (completedPrompts / totalPrompts) * 100 : 0;

  // Create a map of completed prompts
  const completedPromptsMap = entries.reduce((acc, entry) => {
    acc[entry.promptId] = entry;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-8">
      {/* Chapter Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-8 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-start gap-6">
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 p-4 rounded-xl">
            <IconComponent className="w-10 h-10 text-amber-700 dark:text-amber-300" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">
              {chapter.title}
            </h1>
            <p className="text-lg text-amber-700 dark:text-amber-300 mb-6">
              {chapter.description}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {completedPrompts} of {totalPrompts} prompts completed
                </span>
                <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                  {Math.round(progress)}%
                </Badge>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Prompts List */}
      <div className="space-y-4">
        {chapter.prompts.map((prompt, index) => {
          const completedEntry = completedPromptsMap[prompt.id];
          return (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              chapter={chapterId}
              isCompleted={!!completedEntry}
              completedDate={completedEntry?.createdAt}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
