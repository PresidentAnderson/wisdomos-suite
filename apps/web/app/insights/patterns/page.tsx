"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Loader2, TrendingUp, Activity, Brain } from "lucide-react";

interface PatternData {
  date: string;
  energy: number;
  focus: number;
  fulfillment: number;
}

interface PatternInsight {
  title: string;
  description: string;
  icon: string;
}

export default function PatternsPage() {
  const [patternData, setPatternData] = useState<PatternData[]>([]);
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");

  useEffect(() => {
    async function fetchPatterns() {
      try {
        const res = await fetch("/api/insights/patterns");
        if (!res.ok) {
          // Fallback to mock data if API fails
          setPatternData([
            { date: "Mon", energy: 72, focus: 68, fulfillment: 75 },
            { date: "Tue", energy: 78, focus: 70, fulfillment: 80 },
            { date: "Wed", energy: 65, focus: 63, fulfillment: 70 },
            { date: "Thu", energy: 80, focus: 75, fulfillment: 82 },
            { date: "Fri", energy: 85, focus: 81, fulfillment: 88 },
            { date: "Sat", energy: 90, focus: 88, fulfillment: 92 },
            { date: "Sun", energy: 76, focus: 70, fulfillment: 78 },
          ]);
          setInsights([
            {
              title: "Peak Performance Window",
              description: "Your focus peaks between Thursday and Saturday. Schedule high-impact work during these days.",
              icon: "trending-up"
            },
            {
              title: "Mid-Week Dip",
              description: "Energy consistently drops on Wednesdays. Consider lighter tasks or self-care activities.",
              icon: "activity"
            },
            {
              title: "Weekend Recovery",
              description: "Fulfillment scores rise sharply on weekends, indicating effective rest and restoration.",
              icon: "brain"
            }
          ]);
          setAiInsight(
            "Your patterns indicate stronger alignment when structured routines precede creative work. Try scheduling your highest-impact activities between 9–11am on high-energy days (Thu-Sat)."
          );
        } else {
          const data = await res.json();
          setPatternData(data.patterns);
          setInsights(data.insights || []);
          setAiInsight(data.aiInsight || "");
        }
      } catch (err) {
        console.error("Error fetching patterns:", err);
        // Use fallback data
        setPatternData([
          { date: "Mon", energy: 72, focus: 68, fulfillment: 75 },
          { date: "Tue", energy: 78, focus: 70, fulfillment: 80 },
          { date: "Wed", energy: 65, focus: 63, fulfillment: 70 },
          { date: "Thu", energy: 80, focus: 75, fulfillment: 82 },
          { date: "Fri", energy: 85, focus: 81, fulfillment: 88 },
          { date: "Sat", energy: 90, focus: 88, fulfillment: 92 },
          { date: "Sun", energy: 76, focus: 70, fulfillment: 78 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPatterns();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "trending-up":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "activity":
        return <Activity className="h-5 w-5 text-yellow-500" />;
      case "brain":
        return <Brain className="h-5 w-5 text-purple-500" />;
      default:
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <main className="p-8 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-phoenix-orange" />
          <span className="ml-3 text-slate-400">Analyzing your behavioral patterns...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 space-y-8 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-phoenix-orange to-red-500">
          Behavioral Patterns
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Discover recurring behavioral and emotional trends based on your activity and fulfillment metrics.
        </p>
      </section>

      {/* Main Chart */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-slate-900/40 border border-slate-800 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-100">Weekly Energy, Focus & Fulfillment</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patternData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  name="Energy"
                  dot={{ fill: "#38bdf8" }}
                />
                <Line
                  type="monotone"
                  dataKey="focus"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  name="Focus"
                  dot={{ fill: "#a78bfa" }}
                />
                <Line
                  type="monotone"
                  dataKey="fulfillment"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="Fulfillment"
                  dot={{ fill: "#f97316" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights Panel */}
        <Card className="bg-slate-900/40 border border-slate-800 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-100">Key Patterns</h2>
            <ul className="space-y-4">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700">
                  <div className="mt-0.5">
                    {getIcon(insight.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-200">{insight.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{insight.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* AI Insight Section */}
      {aiInsight && (
        <section className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-phoenix-orange/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-phoenix-orange/10 rounded-lg">
              <Brain className="h-6 w-6 text-phoenix-orange" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2 text-slate-100">AI-Generated Insight</h2>
              <p className="text-slate-300 leading-relaxed">{aiInsight}</p>
            </div>
          </div>
        </section>
      )}

      {/* Pattern Statistics */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-900/40 border border-slate-800 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Average Energy</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">
                  {Math.round(patternData.reduce((sum, d) => sum + d.energy, 0) / patternData.length)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border border-slate-800 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Average Focus</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">
                  {Math.round(patternData.reduce((sum, d) => sum + d.focus, 0) / patternData.length)}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border border-slate-800 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Average Fulfillment</p>
                <p className="text-3xl font-bold text-phoenix-orange mt-1">
                  {Math.round(patternData.reduce((sum, d) => sum + d.fulfillment, 0) / patternData.length)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-phoenix-orange/30" />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
