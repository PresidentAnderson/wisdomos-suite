'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Minus, AlertTriangle, Trophy, ChevronRight, Star } from 'lucide-react'
import { AssessmentTool as AssessmentType, RelationshipAssessment } from '@/types/integrated-display'

interface AssessmentToolProps {
  data?: AssessmentType
  relationships?: any[] // From FulfillmentDisplay
  onUpdate?: (data: AssessmentType) => void
}

export default function AssessmentTool({ data, relationships, onUpdate }: AssessmentToolProps) {
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'summary' | 'detail' | 'trends'>('summary')

  // Demo data
  const assessmentData: AssessmentType = data || {
    userId: 'demo',
    lastAssessment: new Date(),
    assessments: [
      {
        id: 'a1',
        relationshipId: 'p1',
        score: 5,
        trust: 5,
        reliability: 5,
        openness: 5,
        notes: 'Exceptional partnership, mutual growth',
        assessedAt: new Date(),
        weekend: 5
      },
      {
        id: 'a2',
        relationshipId: 'p2',
        score: 4,
        trust: 4,
        reliability: 5,
        openness: 3,
        notes: 'Good collaboration, could improve communication',
        assessedAt: new Date(),
        weekend: 4
      },
      {
        id: 'a3',
        relationshipId: 'p3',
        score: 4,
        trust: 5,
        reliability: 3,
        openness: 4,
        notes: 'Strong foundation, inconsistent contact',
        assessedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        weekend: 3
      }
    ],
    summaries: [
      {
        relationshipId: 'p1',
        averageScore: 5,
        trend: 'stable',
        historicalScores: [
          { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), score: 4.5 },
          { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), score: 4.8 },
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 5 },
          { date: new Date(), score: 5 }
        ],
        recommendations: ['Continue current practices', 'Explore new growth areas together']
      },
      {
        relationshipId: 'p2',
        averageScore: 4,
        trend: 'improving',
        historicalScores: [
          { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), score: 3.5 },
          { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), score: 3.8 },
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 4 },
          { date: new Date(), score: 4 }
        ],
        recommendations: ['Schedule regular check-ins', 'Practice more open communication']
      },
      {
        relationshipId: 'p3',
        averageScore: 4,
        trend: 'declining',
        historicalScores: [
          { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), score: 4.5 },
          { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), score: 4.3 },
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 4 },
          { date: new Date(), score: 4 }
        ],
        recommendations: ['Increase contact frequency', 'Address any unspoken concerns']
      }
    ],
    insights: [
      {
        id: 'i1',
        type: 'celebration',
        title: 'Strong Support Network',
        description: 'Your top relationships are providing exceptional support',
        relatedIds: ['p1'],
        createdAt: new Date(),
        dismissed: false
      },
      {
        id: 'i2',
        type: 'pattern',
        title: 'Communication Pattern',
        description: 'Openness scores are lower across multiple relationships',
        relatedIds: ['p2', 'p3'],
        createdAt: new Date(),
        dismissed: false
      },
      {
        id: 'i3',
        type: 'warning',
        title: 'Declining Connection',
        description: 'One relationship showing downward trend - may need attention',
        relatedIds: ['p3'],
        createdAt: new Date(),
        dismissed: false
      }
    ]
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-black" />
      case 'declining': return <TrendingDown className="w-4 h-4 text-black" />
      default: return <Minus className="w-4 h-4 text-black" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'celebration': return <Trophy className="w-4 h-4 text-black" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-black" />
      case 'pattern': return <BarChart3 className="w-4 h-4 text-black" />
      default: return <ChevronRight className="w-4 h-4 text-black" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-black'
    if (score >= 3.5) return 'text-black'
    if (score >= 2.5) return 'text-black'
    return 'text-black'
  }

  const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={`${onChange ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`w-4 h-4 ${star <= value ? 'text-black fill-yellow-500' : 'text-black'}`}
          />
        </button>
      ))}
    </div>
  )

  // Mock relationship names
  const getRelationshipName = (id: string) => {
    const names: Record<string, string> = {
      p1: 'Sarah',
      p2: 'Michael',
      p3: 'Mom'
    }
    return names[id] || 'Unknown'
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-phoenix-gold/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
            <BarChart3 className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Assessment Tool</h2>
            <p className="text-sm text-black">Relationship Health Analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-3 py-1 rounded ${viewMode === 'summary' ? 'bg-phoenix-gold text-black' : 'bg-gray-100'}`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-3 py-1 rounded ${viewMode === 'detail' ? 'bg-phoenix-gold text-black' : 'bg-gray-100'}`}
          >
            Detail
          </button>
          <button
            onClick={() => setViewMode('trends')}
            className={`px-3 py-1 rounded ${viewMode === 'trends' ? 'bg-phoenix-gold text-black' : 'bg-gray-100'}`}
          >
            Trends
          </button>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="mb-4 space-y-2">
        {assessmentData.insights.filter(i => !i.dismissed).map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
              p-3 rounded-lg flex items-start gap-3
              ${insight.type === 'celebration' ? 'bg-yellow-50 border border-yellow-200' : ''}
              ${insight.type === 'warning' ? 'bg-red-50 border border-red-200' : ''}
              ${insight.type === 'pattern' ? 'bg-blue-50 border border-blue-200' : ''}
              ${insight.type === 'recommendation' ? 'bg-green-50 border border-green-200' : ''}
            `}
          >
            {getInsightIcon(insight.type)}
            <div className="flex-1">
              <h4 className="font-medium text-sm">{insight.title}</h4>
              <p className="text-xs text-black mt-1">{insight.description}</p>
            </div>
            <button
              onClick={() => {
                // Mark as dismissed
              }}
              className="text-black hover:text-black"
            >
              ×
            </button>
          </motion.div>
        ))}
      </div>

      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="space-y-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <p className="text-xs text-black">Average Score</p>
              <p className="text-2xl font-bold text-black">
                {(assessmentData.summaries.reduce((acc, s) => acc + s.averageScore, 0) / assessmentData.summaries.length).toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-xs text-black">Relationships</p>
              <p className="text-2xl font-bold text-black">
                {assessmentData.summaries.length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="text-xs text-black">Last Assessment</p>
              <p className="text-sm font-bold text-black">
                {new Date(assessmentData.lastAssessment).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Relationship Summaries */}
          <div className="space-y-3">
            {assessmentData.summaries.map((summary) => {
              const latestAssessment = assessmentData.assessments.find(a => a.relationshipId === summary.relationshipId)
              
              return (
                <div key={summary.relationshipId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{getRelationshipName(summary.relationshipId)}</h3>
                      {getTrendIcon(summary.trend)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(summary.averageScore)}`}>
                        {summary.averageScore.toFixed(1)}
                      </span>
                      <StarRating value={Math.round(summary.averageScore)} />
                    </div>
                  </div>
                  
                  {latestAssessment && (
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div className="text-center">
                        <p className="text-xs text-black">Trust</p>
                        <p className="font-semibold">{latestAssessment.trust}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-black">Reliability</p>
                        <p className="font-semibold">{latestAssessment.reliability}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-black">Openness</p>
                        <p className="font-semibold">{latestAssessment.openness}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-black">Weekend</p>
                        <p className="font-semibold">W{latestAssessment.weekend}</p>
                      </div>
                    </div>
                  )}
                  
                  {summary.recommendations.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-black mb-1">Recommendations:</p>
                      {summary.recommendations.map((rec, i) => (
                        <p key={i} className="text-xs text-black">• {rec}</p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Detail View */}
      {viewMode === 'detail' && (
        <div className="space-y-4">
          {assessmentData.assessments.map((assessment) => (
            <div key={assessment.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{getRelationshipName(assessment.relationshipId)}</h3>
                <span className="text-xs text-black">
                  {new Date(assessment.assessedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Score</span>
                  <StarRating value={assessment.score} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trust</span>
                  <StarRating value={assessment.trust} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reliability</span>
                  <StarRating value={assessment.reliability} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Openness</span>
                  <StarRating value={assessment.openness} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekend Rating</span>
                  <span className="font-semibold">Weekend {assessment.weekend}</span>
                </div>
              </div>
              
              {assessment.notes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-black">Notes:</p>
                  <p className="text-sm text-black italic">{assessment.notes}</p>
                </div>
              )}
            </div>
          ))}
          
          <button className="w-full py-2 bg-phoenix-gold text-black rounded-lg hover:bg-phoenix-orange transition-colors">
            Add New Assessment
          </button>
        </div>
      )}

      {/* Trends View */}
      {viewMode === 'trends' && (
        <div className="space-y-4">
          {assessmentData.summaries.map((summary) => (
            <div key={summary.relationshipId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{getRelationshipName(summary.relationshipId)}</h3>
                {getTrendIcon(summary.trend)}
              </div>
              
              {/* Simple line chart visualization */}
              <div className="h-32 relative">
                <div className="absolute inset-0 flex items-end justify-between">
                  {summary.historicalScores.map((score, i) => {
                    const height = (score.score / 5) * 100
                    return (
                      <div
                        key={i}
                        className="flex-1 mx-0.5 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${height}%` }}
                        title={`${score.score} - ${new Date(score.date).toLocaleDateString()}`}
                      />
                    )
                  })}
                </div>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-black">
                  <span>5</span>
                  <span>2.5</span>
                  <span>0</span>
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="flex justify-between mt-2 text-xs text-black">
                <span>3 mo</span>
                <span>2 mo</span>
                <span>1 mo</span>
                <span>Now</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekend Legend */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-black mb-2">Weekend Rating System:</p>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="font-semibold">W2:</span> Acquaintance
          </div>
          <div>
            <span className="font-semibold">W3:</span> Friend
          </div>
          <div>
            <span className="font-semibold">W4:</span> Close Friend
          </div>
          <div>
            <span className="font-semibold">W5:</span> Inner Circle
          </div>
        </div>
      </div>
    </div>
  )
}