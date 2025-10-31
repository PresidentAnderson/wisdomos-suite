"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  Tag,
  TrendingUp,
  Heart,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface Session {
  id: string;
  transcript: string;
  tags: string[];
  duration: number;
  sentiment: {
    overall_sentiment: string;
    primary_emotion: string;
    intensity: number;
  };
  insights: string;
  sessionType: string;
  mood: string;
  energy: number;
  createdAt: string;
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, selectedType, selectedSentiment]);

  const fetchSessions = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/coach/transcribe?limit=100", { headers });
      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();
      setSessions(data.sessions || []);
      setFilteredSessions(data.sessions || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((s) => s.sessionType === selectedType);
    }

    if (selectedSentiment !== "all") {
      filtered = filtered.filter((s) => s.sentiment?.overall_sentiment === selectedSentiment);
    }

    setFilteredSessions(filtered);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-700";
      case "negative":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcripts or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="reflection">Reflection</option>
            <option value="breakthrough">Breakthrough</option>
            <option value="integration">Integration</option>
            <option value="gratitude">Gratitude</option>
            <option value="challenge">Challenge</option>
          </select>

          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredSessions.length} of {sessions.length} sessions
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 capitalize">{session.sessionType}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                    session.sentiment?.overall_sentiment
                  )}`}
                >
                  {session.sentiment?.overall_sentiment}
                </span>
                {session.energy && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    ⚡ {session.energy}/10
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">{session.transcript}</p>

            {session.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {session.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {session.insights && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <p className="text-sm font-medium text-orange-900">Phoenix Insights</p>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{session.insights}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <Search className="w-16 h-16 text-gray-400 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-700">No sessions found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
