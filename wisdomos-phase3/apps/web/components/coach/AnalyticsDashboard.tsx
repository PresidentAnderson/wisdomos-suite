"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Tag,
  Heart,
  Zap,
  Brain,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const COLORS = ["#f97316", "#6366f1", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];

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

export default function AnalyticsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/coach/transcribe?limit=50", {
        headers,
      });

      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate tag frequency
  const tagFrequency: Record<string, number> = {};
  sessions.forEach((s) =>
    s.tags?.forEach((t: string) => {
      tagFrequency[t] = (tagFrequency[t] || 0) + 1;
    })
  );

  const tagChartData = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Calculate sentiment distribution
  const sentimentCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const sentiment = s.sentiment?.overall_sentiment || "neutral";
    sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
  });

  const sentimentChartData = Object.entries(sentimentCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Energy trends over time
  const energyTrendData = sessions
    .slice()
    .reverse()
    .slice(0, 20)
    .map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      energy: s.energy || 5,
      intensity: s.sentiment?.intensity || 5,
    }));

  // Session type distribution
  const sessionTypeCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    sessionTypeCounts[s.sessionType] = (sessionTypeCounts[s.sessionType] || 0) + 1;
  });

  const sessionTypeData = Object.entries(sessionTypeCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Calculate stats
  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const avgEnergy = sessions.reduce((sum, s) => sum + (s.energy || 0), 0) / (totalSessions || 1);
  const avgIntensity = sessions.reduce(
    (sum, s) => sum + (s.sentiment?.intensity || 0),
    0
  ) / (totalSessions || 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  if (totalSessions === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Sparkles className="w-16 h-16 text-gray-400 mx-auto" />
        <h3 className="text-xl font-semibold text-gray-700">No sessions yet</h3>
        <p className="text-gray-500">
          Start recording reflections to see your analytics
        </p>
        <button
          onClick={() => (window.location.href = "/coach")}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          Record Your First Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-orange-600" />
            <p className="text-sm font-medium text-orange-900">Total Sessions</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">{totalSessions}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Total Time</p>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {Math.floor(totalDuration / 60)}m
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-green-600" />
            <p className="text-sm font-medium text-green-900">Avg Energy</p>
          </div>
          <p className="text-3xl font-bold text-green-600">{avgEnergy.toFixed(1)}/10</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">Avg Intensity</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {avgIntensity.toFixed(1)}/10
          </p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tag Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-800">Top Themes</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tagChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                dataKey="value"
              >
                {tagChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-800">Sentiment Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sentimentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-800">Energy & Intensity Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={energyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#10b981"
                strokeWidth={3}
                name="Energy Level"
              />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Emotional Intensity"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Session Types */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-800">Session Types</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sessionTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => (window.location.href = "/coach")}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          Record New Session
        </button>
        <button
          onClick={() => (window.location.href = "/coach/sessions")}
          className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-medium hover:bg-orange-50 transition-colors"
        >
          View All Sessions
        </button>
      </div>
    </div>
  );
}
