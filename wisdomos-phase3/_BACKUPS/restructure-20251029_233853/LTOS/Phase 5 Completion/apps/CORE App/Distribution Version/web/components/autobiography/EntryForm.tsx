'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, Sparkles, Tag, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { VoiceCoach } from './VoiceCoach';
import { useCreateEntry, useUpdateEntry, useAnalyzeEntry } from '@/hooks/useAutobiography';
import { countWords } from '@/lib/autobiography/validation';
import type { AutobiographyPrompt, AutobiographyEntry } from '@/lib/autobiography/types';

interface EntryFormProps {
  chapter: string;
  prompt: AutobiographyPrompt;
  existingEntry?: AutobiographyEntry;
  mode?: 'create' | 'edit';
}

export function EntryForm({ chapter, prompt, existingEntry, mode = 'create' }: EntryFormProps) {
  const router = useRouter();
  const [response, setResponse] = useState(existingEntry?.response || '');
  const [tags, setTags] = useState<string[]>(existingEntry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(existingEntry?.isPublic || false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const createMutation = useCreateEntry();
  const updateMutation = useUpdateEntry();
  const analyzeMutation = useAnalyzeEntry();

  const wordCount = countWords(response);
  const isValid = wordCount >= 50;

  // Handle voice coach transcript updates
  const handleTranscriptUpdate = (text: string) => {
    setResponse(text);
  };

  // Add tag
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Analyze entry with AI
  const handleAnalyze = async () => {
    if (!response || wordCount < 50) return;

    setIsAnalyzing(true);
    try {
      const insights = await analyzeMutation.mutateAsync({
        text: response,
        promptText: prompt.question,
      });

      // Optionally auto-add suggested tags from themes
      if (insights.themes && insights.themes.length > 0) {
        const newTags = insights.themes
          .slice(0, 5)
          .map((theme) => theme.toLowerCase())
          .filter((theme) => !tags.includes(theme));
        setTags([...tags, ...newTags].slice(0, 10));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    const entryData = {
      chapter,
      promptId: prompt.id,
      promptText: prompt.question,
      response,
      tags,
      isPublic,
    };

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(entryData);
        router.push('/autobiography');
      } else if (existingEntry) {
        await updateMutation.mutateAsync({
          id: existingEntry.id,
          data: { response, tags, isPublic },
        });
        router.push(`/autobiography/entry/${existingEntry.id}`);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Prompt Display */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-3">
          {prompt.question}
        </h2>
        {prompt.description && (
          <p className="text-amber-700 dark:text-amber-300 mb-4">{prompt.description}</p>
        )}
        {prompt.coachingTip && (
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-amber-300 dark:border-amber-700">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Coaching Tip:</strong> {prompt.coachingTip}
            </p>
          </div>
        )}
      </div>

      {/* Voice Coach */}
      <VoiceCoach prompt={prompt} onTranscriptUpdate={handleTranscriptUpdate} />

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Response Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="response" className="text-lg font-semibold">
              Your Response
            </Label>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm ${
                  isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                }`}
              >
                {wordCount} words {!isValid && '(minimum 50)'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={!isValid || isAnalyzing}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'AI Insights'}
              </Button>
            </div>
          </div>
          <Textarea
            id="response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Share your story here... Let your memories flow freely."
            className="min-h-[300px] text-base leading-relaxed"
            required
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-lg font-semibold">
            <Tag className="w-4 h-4 inline mr-2" />
            Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/10"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
          <Input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type a tag and press Enter (max 10 tags)"
            disabled={tags.length >= 10}
          />
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-3">
            {isPublic ? (
              <Globe className="w-5 h-5 text-blue-500" />
            ) : (
              <Lock className="w-5 h-5 text-gray-500" />
            )}
            <div>
              <Label htmlFor="isPublic" className="font-semibold cursor-pointer">
                {isPublic ? 'Public Entry' : 'Private Entry'}
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isPublic
                  ? 'Anyone can view this entry'
                  : 'Only you can view this entry'}
              </p>
            </div>
          </div>
          <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || createMutation.isPending || updateMutation.isPending}
            className="flex-1"
          >
            <Save className="w-5 h-5 mr-2" />
            {mode === 'create' ? 'Save Entry' : 'Update Entry'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* AI Insights Display */}
      {analyzeMutation.data && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            AI Insights
          </h3>
          <div className="space-y-4">
            <div>
              <strong className="text-purple-800 dark:text-purple-200">Sentiment:</strong>
              <span className="ml-2 capitalize">{analyzeMutation.data.sentiment}</span>
            </div>
            {analyzeMutation.data.themes.length > 0 && (
              <div>
                <strong className="text-purple-800 dark:text-purple-200">Themes:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analyzeMutation.data.themes.map((theme) => (
                    <Badge key={theme} variant="outline">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {analyzeMutation.data.insights && (
              <div>
                <strong className="text-purple-800 dark:text-purple-200">Insights:</strong>
                <p className="mt-2 text-purple-700 dark:text-purple-300">
                  {analyzeMutation.data.insights}
                </p>
              </div>
            )}
            {analyzeMutation.data.suggestions.length > 0 && (
              <div>
                <strong className="text-purple-800 dark:text-purple-200">
                  Reflective Questions:
                </strong>
                <ul className="mt-2 space-y-2 list-disc list-inside text-purple-700 dark:text-purple-300">
                  {analyzeMutation.data.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
