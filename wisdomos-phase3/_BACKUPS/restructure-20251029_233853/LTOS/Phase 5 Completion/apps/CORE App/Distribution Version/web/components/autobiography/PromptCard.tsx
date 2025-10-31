'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AutobiographyPrompt } from '@/lib/autobiography/types';

interface PromptCardProps {
  prompt: AutobiographyPrompt;
  chapter: string;
  isCompleted?: boolean;
  completedDate?: Date | string;
  index: number;
}

export function PromptCard({
  prompt,
  chapter,
  isCompleted = false,
  completedDate,
  index,
}: PromptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`p-6 ${isCompleted ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className="pt-1">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-2">{prompt.question}</h3>
              {prompt.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {prompt.description}
                </p>
              )}
            </div>

            {/* Coaching Tip */}
            {prompt.coachingTip && (
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {prompt.coachingTip}
                  </p>
                </div>
              </div>
            )}

            {/* Examples */}
            {prompt.examples && prompt.examples.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Example starters:
                </p>
                <ul className="space-y-1">
                  {prompt.examples.map((example, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-600 dark:text-gray-400 italic pl-4 border-l-2 border-gray-300 dark:border-gray-700"
                    >
                      "{example}"
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Status and Action */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {isCompleted && completedDate && (
                  <Badge variant="outline" className="text-green-700 dark:text-green-300">
                    Completed {new Date(completedDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              <Link
                href={
                  isCompleted
                    ? `/autobiography/chapter/${chapter}?prompt=${prompt.id}`
                    : `/autobiography/new?chapter=${chapter}&prompt=${prompt.id}`
                }
              >
                <Button variant={isCompleted ? 'outline' : 'default'} size="sm">
                  {isCompleted ? 'View Entry' : 'Start Writing'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
