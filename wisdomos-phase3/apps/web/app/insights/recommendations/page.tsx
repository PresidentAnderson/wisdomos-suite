'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Star,
  Clock,
  Zap,
  Target,
  Heart,
  Brain,
  Users,
  Loader2,
} from 'lucide-react';

interface Recommendation {
  id: string;
  content: string;
  category: string;
  priority: string;
  createdAt: string;
  energyScore?: number;
  focusScore?: number;
  fulfillmentScore?: number;
  trends?: {
    energy: string;
    focus: string;
    fulfillment: string;
  };
  isActioned?: boolean;
  feedbackRating?: number;
}

const categoryIcons: Record<string, any> = {
  energy: Zap,
  focus: Target,
  fulfillment: Heart,
  relationships: Users,
  growth: Brain,
  health: Heart,
  work: Target,
  general: Sparkles,
};

const categoryColors: Record<string, string> = {
  energy: 'from-yellow-500 to-orange-500',
  focus: 'from-blue-500 to-indigo-500',
  fulfillment: 'from-purple-500 to-pink-500',
  relationships: 'from-green-500 to-emerald-500',
  growth: 'from-cyan-500 to-teal-500',
  health: 'from-red-500 to-rose-500',
  work: 'from-indigo-500 to-purple-500',
  general: 'from-slate-500 to-gray-500',
};

const priorityBadges: Record<string, { color: string; label: string }> = {
  high: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'High Priority' },
  medium: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'Medium' },
  low: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Low Priority' },
  critical: { color: 'bg-red-600/30 text-red-200 border-red-600/50', label: 'Critical' },
};

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === 'rising') return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (trend === 'falling') return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRec, setSelectedRec] = useState<string | null>(null);

  async function loadRecommendations(refresh = false) {
    try {
      setLoading(!refresh);
      setRefreshing(refresh);

      const url = `/api/insights/recommendations${refresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Failed to load recommendations');

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function markAsActioned(recId: string) {
    try {
      const res = await fetch('/api/insights/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId: recId, action: 'mark_actioned' }),
      });

      if (res.ok) {
        setRecommendations((recs) =>
          recs.map((r) => (r.id === recId ? { ...r, isActioned: true } : r))
        );
      }
    } catch (err) {
      console.error('Error marking as actioned:', err);
    }
  }

  async function rateRecommendation(recId: string, rating: number) {
    try {
      await fetch('/api/insights/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId: recId, rating }),
      });

      setRecommendations((recs) =>
        recs.map((r) => (r.id === recId ? { ...r, feedbackRating: rating } : r))
      );
    } catch (err) {
      console.error('Error rating recommendation:', err);
    }
  }

  useEffect(() => {
    loadRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                  AI-Powered Recommendations
                </h1>
              </div>
              <p className="text-slate-400 max-w-2xl">
                Personalized insights generated from your behavioral patterns, energy analytics, and emerging trends
              </p>
            </div>

            <button
              onClick={() => loadRecommendations(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
            <p className="text-slate-400 text-lg">Analyzing your patterns...</p>
            <p className="text-slate-500 text-sm mt-2">Generating personalized insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {recommendations.map((rec, index) => {
                const Icon = categoryIcons[rec.category] || Sparkles;
                const priorityBadge = priorityBadges[rec.priority] || priorityBadges.medium;

                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative bg-slate-900/40 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all ${
                      rec.isActioned ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryColors[rec.category]} bg-opacity-20`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-300 capitalize">{rec.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadge.color}`}>
                              {priorityBadge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(rec.createdAt).toLocaleDateString()}
                            </div>
                            {rec.trends && (
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  <TrendIcon trend={rec.trends.energy} />
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  <TrendIcon trend={rec.trends.focus} />
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  <TrendIcon trend={rec.trends.fulfillment} />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {rec.isActioned && (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-slate-200 text-lg leading-relaxed mb-4">{rec.content}</p>

                    {/* Scores */}
                    {(rec.energyScore || rec.focusScore || rec.fulfillmentScore) && (
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        {rec.energyScore && (
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-slate-400">Energy: </span>
                            <span className="text-slate-200 font-medium">{rec.energyScore}</span>
                          </div>
                        )}
                        {rec.focusScore && (
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-400">Focus: </span>
                            <span className="text-slate-200 font-medium">{rec.focusScore}</span>
                          </div>
                        )}
                        {rec.fulfillmentScore && (
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="text-slate-400">Fulfillment: </span>
                            <span className="text-slate-200 font-medium">{rec.fulfillmentScore}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                      <div className="flex items-center gap-2">
                        {!rec.isActioned && (
                          <button
                            onClick={() => markAsActioned(rec.id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark as Done
                          </button>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => rateRecommendation(rec.id, rating)}
                            className={`p-1 rounded transition-colors ${
                              rec.feedbackRating && rec.feedbackRating >= rating
                                ? 'text-yellow-400'
                                : 'text-slate-600 hover:text-yellow-500'
                            }`}
                          >
                            <Star
                              className="w-4 h-4"
                              fill={rec.feedbackRating && rec.feedbackRating >= rating ? 'currentColor' : 'none'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {recommendations.length === 0 && !loading && (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-300 mb-2">No recommendations yet</h3>
                <p className="text-slate-500 mb-6">
                  Start journaling and tracking your patterns to receive personalized insights
                </p>
                <button
                  onClick={() => loadRecommendations(true)}
                  className="px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors"
                >
                  Generate Recommendations
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
