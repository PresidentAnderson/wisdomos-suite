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
import { REFRAME_PROMPTS } from '@wisdomos/contrib';

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
        <p className="text-gray-600">Complete your past, author your future</p>
      </div>

      {/* View Mode Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'timeline'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-200 text-gray-700'
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
              : 'bg-gray-200 text-gray-700'
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
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Target className="inline mr-2" size={18} />
          Future Vision
        </button>
      </div>

      {/* Navigation */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setSelectedYear((prev) => Math.max(startYear, prev - 10))}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-2xl font-bold">
          {viewMode === 'decade'
            ? `${currentDecade}s`
            : viewMode === 'future'
            ? `${selectedYear} - ${selectedYear + 10}`
            : selectedYear}
        </div>
        <button
          onClick={() => setSelectedYear((prev) => Math.min(endYear, prev + 10))}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-400 to-blue-400" />

          {/* Years */}
          <div className="space-y-8">
            {yearsInView.map((year) => {
              const yearEvents = events.filter((e) => e.year === year);
              const isCurrent = year === currentYear;
              const isFuture = year > currentYear;

              return (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative flex items-center"
                >
                  {/* Year Marker */}
                  <div
                    className={`timeline-year z-10 ${
                      isCurrent
                        ? 'bg-green-500'
                        : isFuture
                        ? 'bg-blue-400'
                        : 'bg-purple-400'
                    }`}
                    style={{ left: 'calc(50% - 40px)' }}
                  >
                    {year}
                  </div>

                  {/* Events */}
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Left side events */}
                    <div className="text-right pr-24">
                      {yearEvents
                        .filter((_, i) => i % 2 === 0)
                        .map((event) => (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.02 }}
                            className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {event.description.substring(0, 100)}...
                            </p>
                            {event.isReframed && (
                              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Reframed
                              </span>
                            )}
                          </motion.div>
                        ))}
                    </div>

                    {/* Right side events */}
                    <div className="pl-24">
                      {yearEvents
                        .filter((_, i) => i % 2 === 1)
                        .map((event) => (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.02 }}
                            className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {event.description.substring(0, 100)}...
                            </p>
                            {event.isReframed && (
                              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Reframed
                              </span>
                            )}
                          </motion.div>
                        ))}
                    </div>
                  </div>

                  {/* Add Event Button */}
                  {!isFuture && (
                    <button
                      onClick={() => {
                        setSelectedYear(year);
                        setIsAddingEvent(true);
                      }}
                      className="absolute right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Decade View */}
      {viewMode === 'decade' && (
        <div className="grid grid-cols-5 gap-4">
          {decadeYears.map((year) => {
            const yearEvents = events.filter((e) => e.year === year);
            return (
              <motion.div
                key={year}
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer"
                onClick={() => {
                  setSelectedYear(year);
                  setViewMode('timeline');
                }}
              >
                <div className="text-lg font-bold mb-2">{year}</div>
                <div className="text-sm text-gray-600">
                  {yearEvents.length} event{yearEvents.length !== 1 ? 's' : ''}
                </div>
                {yearEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="mt-2 text-xs truncate">
                    • {event.title}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Future Vision View */}
      {viewMode === 'future' && (
        <div className="space-y-6">
          {[2030, 2040, 2050].map((year) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Vision for {year}</h3>
              <textarea
                className="w-full p-4 border rounded-lg"
                rows={4}
                placeholder={`Describe your vision for ${year}...`}
              />
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Goals</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Add a goal..."
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedEvent.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Year: {selectedEvent.year}
              </p>
              <p className="mb-6">{selectedEvent.description}</p>

              {selectedEvent.isReframed && selectedEvent.reframe && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <RefreshCw className="mr-2" size={18} />
                    Reframed Narrative
                  </h3>
                  <p className="mb-2">{selectedEvent.reframe.newNarrative}</p>
                  <div className="space-y-1">
                    {selectedEvent.reframe.insights.map((insight, i) => (
                      <div key={i} className="text-sm">
                        • {insight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedEvent.isReframed && (
                <button
                  onClick={() => setReframeStage(0)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  <Brain className="inline mr-2" size={18} />
                  Reframe This Event
                </button>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Add Event to {selectedYear}</h2>
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
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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