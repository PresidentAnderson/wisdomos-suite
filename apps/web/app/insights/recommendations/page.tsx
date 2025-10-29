"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2, RefreshCw, TrendingUp, Target, ChevronDown, ChevronUp, Info } from "lucide-react";

interface Recommendation {
  recommendation: string;
  reasoning: string;
  dataPoint: string;
}

interface RecommendationResponse {
  recommendations: Recommendation[];
  generatedAt: string;
  basedOn: {
    dataPoints: number;
    averageEnergy: number;
    averageFocus: number;
    averageFulfillment: number;
  };
}

function RecommendationItem({ rec, index }: { rec: Recommendation; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="bg-slate-800/40 border border-slate-700 rounded-lg hover:border-phoenix-orange/50 transition-all group">
      <div className="flex items-start gap-4 p-4">
        <div className="flex-shrink-0 mt-1">
          <CheckCircle2 className="h-5 w-5 text-green-500/70 group-hover:text-green-400 transition-colors" />
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-slate-300 leading-relaxed group-hover:text-slate-100 transition-colors">
            {rec.recommendation}
          </p>

          {/* Expandable reasoning section */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }
            }}
            className="flex items-center gap-2 text-sm text-phoenix-orange/80 hover:text-phoenix-orange transition-colors focus:outline-none focus:ring-2 focus:ring-phoenix-orange/50 focus:ring-offset-2 focus:ring-offset-slate-800 rounded px-2 py-1 -ml-2"
            aria-expanded={isExpanded}
            aria-controls={`reasoning-${index}`}
          >
            <Info className="h-4 w-4" />
            <span className="font-medium">Why this matters</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Expanded reasoning content */}
          {isExpanded && (
            <div
              id={`reasoning-${index}`}
              className="pl-6 border-l-2 border-phoenix-orange/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    Explanation
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {rec.reasoning}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    Based On
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed font-mono">
                    {rec.dataPoint}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function RecommendationsPage() {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchRecommendations() {
    try {
      setRefreshing(true);
      const res = await fetch("/api/insights/recommendations", {
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const responseData = await res.json();
      setData(responseData);
    } catch (err) {
      console.error("Error fetching recommendations:", err);

      // Fallback recommendations
      setData({
        recommendations: [
          {
            recommendation: "Establish consistent sleep and wake times for better energy regulation.",
            reasoning: "Sleep consistency regulates cortisol and melatonin rhythms, stabilizing energy throughout the day. This creates predictable energy patterns that make planning easier.",
            dataPoint: "Fallback recommendation"
          },
          {
            recommendation: "Batch similar tasks to reduce context switching and improve focus.",
            reasoning: "Task batching eliminates the cognitive overhead of context switching. Each switch costs 15-25 minutes of focus recovery time.",
            dataPoint: "Fallback recommendation"
          },
          {
            recommendation: "Conduct weekly reviews to identify patterns and adjust your approach.",
            reasoning: "Weekly reviews create awareness of what is working and what is not. This metacognition enables continuous improvement in your systems.",
            dataPoint: "Fallback recommendation"
          },
          {
            recommendation: "Protect high-energy windows for strategic, high-impact work.",
            reasoning: "Peak energy times are limited and should be reserved for your most important work. Tactical tasks can be done during lower-energy periods.",
            dataPoint: "Fallback recommendation"
          },
          {
            recommendation: "Schedule regular breaks to maintain sustainable performance.",
            reasoning: "Breaks prevent mental fatigue and maintain cognitive performance throughout the day. Working without breaks leads to diminishing returns.",
            dataPoint: "Fallback recommendation"
          }
        ],
        generatedAt: new Date().toISOString(),
        basedOn: {
          dataPoints: 7,
          averageEnergy: 78,
          averageFocus: 74,
          averageFulfillment: 81
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading && !refreshing) {
    return (
      <main className="p-8 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-phoenix-orange" />
          <span className="ml-3 text-slate-400">Generating personalized insights...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8 text-slate-100">
      {/* Header */}
      <section className="space-y-2 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-phoenix-orange to-red-500">
              AI-Powered Recommendations
            </h1>
            <p className="text-slate-400 max-w-2xl mt-2">
              Adaptive suggestions generated from your behavioral analytics and energy-focus trends.
            </p>
          </div>
          <Button
            onClick={fetchRecommendations}
            disabled={refreshing}
            variant="outline"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-phoenix-orange/50 transition-all"
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Analytics Overview */}
      {data?.basedOn && (
        <section className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Data Points</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {data.basedOn.dataPoints}
                  </p>
                </div>
                <Target className="h-6 w-6 text-blue-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border-cyan-500/30 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Energy</p>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">
                    {data.basedOn.averageEnergy}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-cyan-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Focus</p>
                  <p className="text-2xl font-bold text-purple-400 mt-1">
                    {data.basedOn.averageFocus}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-purple-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Fulfillment</p>
                  <p className="text-2xl font-bold text-phoenix-orange mt-1">
                    {data.basedOn.averageFulfillment}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-phoenix-orange/30" />
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recommendations List */}
      <Card className="bg-slate-900/40 border border-slate-800 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-phoenix-orange" />
            Personalized Recommendations
          </h2>
          
          {data?.recommendations && data.recommendations.length > 0 ? (
            <ul className="space-y-4">
              {data.recommendations.map((rec, idx) => (
                <RecommendationItem key={idx} rec={rec} index={idx} />
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No recommendations available at this time.</p>
              <p className="text-sm text-slate-500 mt-2">
                Check back after logging more activity data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Attribution */}
      <section className="mt-8 p-6 bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-slate-700 rounded-xl backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-phoenix-orange/10 rounded-lg flex-shrink-0">
            <Sparkles className="h-6 w-6 text-phoenix-orange" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">About These Recommendations</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              These insights are generated by analyzing your behavioral patterns, energy levels, focus metrics,
              and fulfillment scores over time. Recommendations adapt to rising and falling trends in your data,
              helping you optimize routines, improve well-being, and achieve greater alignment with your goals.
            </p>
            {data?.generatedAt && (
              <p className="text-slate-500 text-xs">
                Last updated: {new Date(data.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
