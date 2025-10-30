'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Tag,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChapterNavigation } from './ChapterNavigation';
import { useAutobiographyEntries, useEntryStats } from '@/hooks/useAutobiography';

export function AutobiographyDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: entries = [], isLoading } = useAutobiographyEntries();
  const stats = useEntryStats();

  const recentEntries = entries.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            My Autobiography
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Document your life story, one memory at a time
          </p>
        </div>
        <Link href="/autobiography/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
              <p className="text-2xl font-bold">{stats.totalEntries}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Words</p>
              <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Words/Entry</p>
              <p className="text-2xl font-bold">{stats.averageWordsPerEntry}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg">
              <Tag className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unique Tags</p>
              <p className="text-2xl font-bold">{stats.allTags.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chapters */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Chapters</h2>
        <ChapterNavigation />
      </div>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Entries</h2>
            <Link href="/autobiography/entries">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/autobiography/entry/${entry.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{entry.promptText}</h3>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {entry.response}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                          <span>{entry.wordCount} words</span>
                          {entry.sentiment && (
                            <Badge variant="outline" className="capitalize">
                              {entry.sentiment}
                            </Badge>
                          )}
                        </div>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Start Your Autobiography</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Begin documenting your life story by creating your first entry
          </p>
          <Link href="/autobiography/new">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create First Entry
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
