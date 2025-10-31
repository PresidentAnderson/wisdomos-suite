'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar,
  Users,
  Target,
  Brain,
  Award,
  Clock,
  Sparkles,
  Download,
  Filter,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/lib/database';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

interface AnalyticsData {
  totalEntries: number;
  weeklyProgress: number[];
  categoryBreakdown: { [key: string]: number };
  streakData: number[];
  moodTracking: { [key: string]: number };
  timeSpentAnalysis: { [key: string]: number };
  goalsProgress: { completed: number; total: number };
  insightScore: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  productivityScore: number;
  wellnessScore: number;
  learningScore: number;
  socialScore: number;
  activityHeatmap: { [key: string]: number };
  achievements: any[];
}

export default function AnalyticsPage() {
  const { user, userProfile } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await analyticsApi.getComprehensiveAnalytics(user.id, timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black dark:text-black">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Chart configurations
  const weeklyProgressData = {
    labels: eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    }).map(date => format(date, 'MMM dd')),
    datasets: [
      {
        label: 'Daily Entries',
        data: analyticsData?.weeklyProgress || [0, 1, 2, 1, 3, 2, 4],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const categoryBreakdownData = {
    labels: ['Boundary Audits', 'Upset Docs', 'Fulfillment', 'Autobiography'],
    datasets: [
      {
        data: [
          analyticsData?.categoryBreakdown?.boundary || 0,
          analyticsData?.categoryBreakdown?.upset || 0,
          analyticsData?.categoryBreakdown?.fulfillment || 0,
          analyticsData?.categoryBreakdown?.autobiography || 0
        ],
        backgroundColor: [
          '#8B5CF6',
          '#EF4444',
          '#10B981',
          '#3B82F6'
        ],
        borderWidth: 0
      }
    ]
  };

  const wellnessRadarData = {
    labels: ['Productivity', 'Wellness', 'Learning', 'Social', 'Insight'],
    datasets: [
      {
        label: 'Your Scores',
        data: [
          analyticsData?.productivityScore || 0,
          analyticsData?.wellnessScore || 0,
          analyticsData?.learningScore || 0,
          analyticsData?.socialScore || 0,
          analyticsData?.insightScore || 0
        ],
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgb(147, 51, 234)',
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(147, 51, 234)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-black mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-black dark:text-black">
                Comprehensive insights into your wisdom journey
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-black focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="365d">Last year</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-black"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black text-sm">Total Entries</p>
                <p className="text-3xl font-bold">{analyticsData?.totalEntries || 0}</p>
                <p className="text-black text-xs mt-1">
                  +{analyticsData?.weeklyGrowth || 0}% this week
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-black" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-black"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black text-sm">Insight Score</p>
                <p className="text-3xl font-bold">{analyticsData?.insightScore || 0}</p>
                <p className="text-black text-xs mt-1">
                  Based on reflection depth
                </p>
              </div>
              <Brain className="w-8 h-8 text-black" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-black"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black text-sm">Current Streak</p>
                <p className="text-3xl font-bold">{userProfile?.streak_count || 0}</p>
                <p className="text-black text-xs mt-1">days in a row</p>
              </div>
              <Calendar className="w-8 h-8 text-black" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-black"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black text-sm">Achievements</p>
                <p className="text-3xl font-bold">{analyticsData?.achievements?.length || 0}</p>
                <p className="text-black text-xs mt-1">badges earned</p>
              </div>
              <Award className="w-8 h-8 text-black" />
            </div>
          </motion.div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black dark:text-black">
                Weekly Progress
              </h3>
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <div className="h-64">
              <Line data={weeklyProgressData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black dark:text-black">
                Tool Usage Distribution
              </h3>
              <PieChart className="w-5 h-5 text-black" />
            </div>
            <div className="h-64 flex items-center justify-center">
              <div style={{ width: '250px', height: '250px' }}>
                <Doughnut data={categoryBreakdownData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </motion.div>

          {/* Wellness Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black dark:text-black">
                Wellness Profile
              </h3>
              <Target className="w-5 h-5 text-black" />
            </div>
            <div className="h-64">
              <Radar 
                data={wellnessRadarData} 
                options={{ 
                  responsive: true, 
                  scales: { 
                    r: { 
                      beginAtZero: true, 
                      max: 100 
                    } 
                  } 
                }} 
              />
            </div>
          </motion.div>

          {/* Insights & Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-black"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-xl font-bold">AI Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Productivity Trend</p>
                <p className="text-xs text-black">
                  Your boundary audit completion rate has increased 45% this week. 
                  Great progress on setting healthy limits!
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Reflection Depth</p>
                <p className="text-xs text-black">
                  Your recent upset documentation shows deeper emotional processing. 
                  Consider exploring these patterns further.
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Growth Opportunity</p>
                <p className="text-xs text-black">
                  You haven't updated your fulfillment display in 5 days. 
                  Regular check-ins help maintain momentum.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-bold text-black dark:text-black mb-4">
              Time Investment
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-black dark:text-black">This week</span>
                <span className="font-semibold">2.5 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black dark:text-black">Average session</span>
                <span className="font-semibold">15 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black dark:text-black">Peak time</span>
                <span className="font-semibold">Evening</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-bold text-black dark:text-black mb-4">
              Goal Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Weekly Goal</span>
                  <span>5/7 days</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Target</span>
                  <span>12/20 entries</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-bold text-black dark:text-black mb-4">
              Recent Achievements
            </h3>
            <div className="space-y-2">
              {(analyticsData?.achievements || [
                { name: 'First Steps', description: 'Created your first boundary audit' },
                { name: 'Streak Starter', description: '3 days in a row' },
                { name: 'Deep Thinker', description: 'Completed detailed reflection' }
              ]).slice(0, 3).map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-black">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-black dark:text-black">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Export Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-black dark:text-black mb-2">
                Export Analytics
              </h3>
              <p className="text-black dark:text-black text-sm">
                Download your data and insights for external analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <Download className="w-4 h-4" />
                PDF Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition">
                <Download className="w-4 h-4" />
                CSV Data
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}