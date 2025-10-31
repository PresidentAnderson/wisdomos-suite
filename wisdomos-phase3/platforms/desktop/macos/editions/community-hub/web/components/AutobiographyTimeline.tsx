'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Edit,
  Image,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Heart,
  Brain
} from 'lucide-react';

// Local constants instead of importing from workspace
const REFRAME_PROMPTS = [
  {
    stage: 'identify',
    prompt: 'Identify an early incident that still affects you',
    questions: [
      'What happened?',
      'How old were you?',
      'Who was involved?',
      'What emotions did you feel?',
    ],
  },
  {
    stage: 'acknowledge',
    prompt: 'Acknowledge the impact',
    questions: [
      'How has this shaped your behavior?',
      'What patterns emerged from this?',
      'What beliefs did you form?',
    ],
  },
  {
    stage: 'reframe',
    prompt: 'Create a new narrative',
    questions: [
      'What did you learn from this?',
      'How did it make you stronger?',
      'What gifts came from this experience?',
      'How can you see this with compassion?',
    ],
  },
];

interface TimelineEvent {
  id: string;
  year: number;
  month?: number;
  title: string;
  description: string;
  isReframed?: boolean;
  reframe?: {
    newNarrative: string;
    insights: string[];
  };
  media?: Array<{ type: string; url: string }>;
}

export function AutobiographyTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'decade' | 'future'>('timeline');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [reframeStage, setReframeStage] = useState(0);

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 100;
  const endYear = currentYear + 50;

  const getDecade = (year: number) => Math.floor(year / 10) * 10;
  const currentDecade = getDecade(selectedYear);

  const handleAddEvent = (event: Partial<TimelineEvent>) => {
    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      year: selectedYear,
      title: event.title || '',
      description: event.description || '',
      ...event,
    };
    setEvents((prev) => [...prev, newEvent].sort((a, b) => a.year - b.year));
    setIsAddingEvent(false);
  };

  const handleReframe = (eventId: string, reframe: any) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? { ...event, isReframed: true, reframe }
          : event
      )
    );
  };

  const yearsInView = Array.from({ length: 11 }, (_, i) => selectedYear - 5 + i);
  const decadeYears = Array.from({ length: 10 }, (_, i) => currentDecade + i);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Autobiography Timeline</h1>
        <p className="text-black">Complete your past, author your future</p>
      </div>

      {/* View Mode Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'timeline'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-200 text-black'
          }`}
        >
          <Clock className="inline mr-2" size={18} />
          Timeline
        </button>
        <button
          onClick={() => setViewMode('decade')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'decade'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-200 text-black'
          }`}
        >
          <Calendar className="inline mr-2" size={18} />
          Decade View
        </button>
        <button
          onClick={() => setViewMode('future')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'future'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-200 text-black'
          }`}
        >
          <Target className="inline mr-2" size={18} />
          Future Vision
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Autobiography Timeline Demo</h2>
          <p className="text-black mb-6">
            This is the WisdomOS Community Hub running on Vercel! The full autobiography timeline 
            feature requires the complete backend integration with Supabase.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Calendar className="mx-auto mb-3 text-black" size={32} />
              <h3 className="font-semibold mb-2">Timeline View</h3>
              <p className="text-sm text-black">Navigate your life events year by year</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Brain className="mx-auto mb-3 text-black" size={32} />
              <h3 className="font-semibold mb-2">Reframe Tool</h3>
              <p className="text-sm text-black">Transform past incidents into wisdom</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Target className="mx-auto mb-3 text-black" size={32} />
              <h3 className="font-semibold mb-2">Future Vision</h3>
              <p className="text-sm text-black">Plan and visualize your future decades</p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => setIsAddingEvent(true)}
              className="px-6 py-3 bg-blue-500 text-black rounded-lg hover:bg-blue-600 transition"
            >
              <Plus className="inline mr-2" size={18} />
              Try Adding a Demo Event
            </button>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddingEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsAddingEvent(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Add Demo Event</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddEvent({
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                  });
                }}
              >
                <input
                  name="title"
                  type="text"
                  className="w-full p-2 border rounded-lg mb-4"
                  placeholder="Event title"
                  required
                />
                <textarea
                  name="description"
                  className="w-full p-2 border rounded-lg mb-4"
                  rows={4}
                  placeholder="Describe what happened..."
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingEvent(false)}
                    className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-black rounded-lg hover:bg-blue-600"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}