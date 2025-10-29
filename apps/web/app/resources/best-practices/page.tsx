"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BookOpen, Target, TrendingUp, Heart, Brain, Calendar } from "lucide-react";

interface BestPractice {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips: string[];
}

export default function BestPracticesPage() {
  const practices: BestPractice[] = [
    {
      icon: <Calendar className="h-6 w-6 text-blue-400" />,
      title: "Daily Integration",
      description: "Small, consistent insights drive long-term transformation.",
      tips: [
        "Reflect briefly every morning to set intentions",
        "Review your day in the evening (5-10 minutes)",
        "Log emotions and energy levels consistently",
        "Build rituals around check-ins"
      ]
    },
    {
      icon: <Target className="h-6 w-6 text-green-400" />,
      title: "Align with Your Life Areas",
      description: "Balance energy across growth, relationships, and contribution.",
      tips: [
        "Revisit each life area weekly",
        "Set specific, measurable goals per area",
        "Monitor fulfillment scores for trends",
        "Adjust focus based on what needs attention"
      ]
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-400" />,
      title: "Use Analytics Wisely",
      description: "Metrics are feedback, not judgment. Let data reveal trends—then act intentionally.",
      tips: [
        "Track patterns over weeks, not days",
        "Look for recurring themes in low-energy periods",
        "Celebrate upward trends in fulfillment",
        "Don't over-optimize; trust your intuition"
      ]
    },
    {
      icon: <Brain className="h-6 w-6 text-phoenix-orange" />,
      title: "Apply AI Insights Thoughtfully",
      description: "Treat AI recommendations as mirrors, not orders.",
      tips: [
        "Use insights to clarify your own direction",
        "Test recommendations one at a time",
        "Reflect on what resonates personally",
        "Adapt suggestions to fit your context"
      ]
    },
    {
      icon: <Heart className="h-6 w-6 text-red-400" />,
      title: "Embrace the Phoenix Cycle",
      description: "Transformation isn't linear. Honor each phase.",
      tips: [
        "Ashes: Reflect deeply without rushing solutions",
        "Fire: Lean into discomfort; breakthroughs emerge",
        "Rebirth: Celebrate small wins and progress",
        "Flight: Share your journey to inspire others"
      ]
    },
    {
      icon: <BookOpen className="h-6 w-6 text-cyan-400" />,
      title: "Journal Consistently",
      description: "The more you write, the smarter your analytics become.",
      tips: [
        "Write freely without censoring thoughts",
        "Tag entries by mood or topic for easier search",
        "Review past entries monthly to spot growth",
        "Use prompts when you feel stuck"
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8 space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-phoenix-orange to-red-500">
          Best Practices
        </h1>
        <p className="text-slate-400 max-w-3xl leading-relaxed">
          Proven strategies for mastering WisdomOS and sustaining long-term fulfillment with the Phoenix Method.
          These principles help you maximize insights, maintain momentum, and integrate transformation into daily life.
        </p>
      </header>

      {/* Practices Grid */}
      <section className="grid gap-6 md:grid-cols-2">
        {practices.map((practice, index) => (
          <Card
            key={index}
            className="bg-slate-900/40 border border-slate-800 shadow-lg hover:border-phoenix-orange/50 transition-all backdrop-blur-sm group"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg group-hover:bg-slate-800 transition-colors">
                  {practice.icon}
                </div>
                <h2 className="text-xl font-semibold text-slate-100 group-hover:text-phoenix-orange transition-colors">
                  {practice.title}
                </h2>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {practice.description}
              </p>

              <ul className="space-y-2 pl-4 border-l-2 border-slate-700 group-hover:border-phoenix-orange/50 transition-colors">
                {practice.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="text-sm text-slate-400">
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Pro Tip Section */}
      <section className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-phoenix-orange/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-phoenix-orange/10 rounded-lg flex-shrink-0">
            <Sparkles className="h-6 w-6 text-phoenix-orange" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Pro Tip: Consistency Compounds</h2>
            <p className="text-slate-300 leading-relaxed">
              The more consistent your journaling and check-ins, the smarter WisdomOS becomes. Each reflection fuels
              your adaptive analytics and recommendations. Even 2-3 entries per week create meaningful pattern detection.
              Quality matters more than quantity—authentic reflections yield better insights than rushed check-ins.
            </p>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <Card className="bg-slate-900/40 border border-slate-800 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-phoenix-orange" />
            Recommended Implementation Timeline
          </h2>

          <div className="space-y-4 pl-6 border-l-2 border-slate-700">
            <div>
              <h3 className="text-lg font-medium text-slate-200">Week 1-2: Foundation</h3>
              <p className="text-sm text-slate-400 mt-1">
                Start with daily check-ins and journal entries. Focus on consistency over perfection.
                Explore all life areas and set initial baselines.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-200">Week 3-4: Pattern Recognition</h3>
              <p className="text-sm text-slate-400 mt-1">
                Begin reviewing analytics. Look for energy patterns and fulfillment trends.
                Start acting on initial AI recommendations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-200">Month 2+: Optimization</h3>
              <p className="text-sm text-slate-400 mt-1">
                Refine your approach based on what works. Experiment with scheduling high-impact work
                during peak energy windows. Deepen practices that yield results.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-200">Month 3+: Integration</h3>
              <p className="text-sm text-slate-400 mt-1">
                WisdomOS becomes second nature. Insights are personalized and actionable.
                Share your progress with others and contribute to the community.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Pitfalls */}
      <Card className="bg-slate-900/40 border border-yellow-500/30 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">Common Pitfalls to Avoid</h2>

          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Over-tracking:</strong> Don't let analytics become a burden.
                If check-ins feel like chores, reduce frequency temporarily.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Ignoring intuition:</strong> Data informs but doesn't dictate.
                Trust your gut when recommendations don't feel right.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Perfectionism:</strong> Missed days are normal.
                Progress isn't linear—focus on the trend, not individual data points.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold">•</span>
              <div>
                <strong className="text-slate-100">Neglecting rest:</strong> High fulfillment requires recovery.
                Honor downtime as essential, not optional.
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
