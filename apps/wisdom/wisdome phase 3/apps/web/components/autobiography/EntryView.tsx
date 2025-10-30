'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash2,
  Calendar,
  Tag,
  Globe,
  Lock,
  Volume2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteEntry } from '@/hooks/useAutobiography';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { calculateReadingTime } from '@/lib/autobiography/validation';
import type { AutobiographyEntry } from '@/lib/autobiography/types';

interface EntryViewProps {
  entry: AutobiographyEntry;
}

export function EntryView({ entry }: EntryViewProps) {
  const router = useRouter();
  const deleteMutation = useDeleteEntry();
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const [showInsights, setShowInsights] = useState(false);

  const readingTime = calculateReadingTime(entry.wordCount);

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(entry.id);
    router.push('/autobiography');
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(entry.response);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Link href="/autobiography">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Autobiography
        </Button>
      </Link>

      {/* Entry Header */}
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{entry.promptText}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
              <span>{entry.wordCount} words</span>
              <span>{readingTime} min read</span>
              {entry.isPublic ? (
                <Badge variant="outline" className="gap-1">
                  <Globe className="w-3 h-3" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSpeak}>
              <Volume2 className="w-4 h-4 mr-2" />
              {isSpeaking ? 'Stop' : 'Listen'}
            </Button>
            <Link href={`/autobiography/entry/${entry.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    autobiography entry.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Tags and Sentiment */}
        <div className="flex items-center gap-4 mb-6">
          {entry.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {entry.sentiment && (
            <Badge variant="outline" className="capitalize">
              {entry.sentiment}
            </Badge>
          )}
        </div>

        {/* Entry Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed">{entry.response}</p>
        </div>
      </Card>

      {/* AI Insights */}
      {entry.aiInsights && (
        <Card className="p-6">
          <Button
            variant="ghost"
            className="w-full justify-between mb-4"
            onClick={() => setShowInsights(!showInsights)}
          >
            <span className="flex items-center gap-2 font-semibold text-lg">
              <Sparkles className="w-5 h-5" />
              AI Insights
            </span>
            <span className="text-sm">{showInsights ? 'Hide' : 'Show'}</span>
          </Button>

          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              {entry.aiInsights.themes?.length > 0 && (
                <div>
                  <strong className="text-purple-800 dark:text-purple-200">Themes:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.aiInsights.themes.map((theme: string) => (
                      <Badge key={theme} variant="outline">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {entry.aiInsights.insights && (
                <div>
                  <strong className="text-purple-800 dark:text-purple-200">Insights:</strong>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {entry.aiInsights.insights}
                  </p>
                </div>
              )}
              {entry.aiInsights.suggestions?.length > 0 && (
                <div>
                  <strong className="text-purple-800 dark:text-purple-200">
                    Reflective Questions:
                  </strong>
                  <ul className="mt-2 space-y-2 list-disc list-inside">
                    {entry.aiInsights.suggestions.map((suggestion: string, i: number) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </Card>
      )}
    </div>
  );
}
