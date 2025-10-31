'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, HelpCircle, Mail, Users, BookOpen, ExternalLink, Check, Star, Bug, Lightbulb, AlertCircle } from 'lucide-react'

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other'

interface FeedbackForm {
  type: FeedbackType
  subject: string
  message: string
  email: string
  priority: 'low' | 'medium' | 'high'
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackForm>({
    type: 'feature',
    subject: '',
    message: '',
    email: '',
    priority: 'medium'
  })

  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Submit feedback to backend
    console.log('Feedback submitted:', feedback)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFeedback({
        type: 'feature',
        subject: '',
        message: '',
        email: '',
        priority: 'medium'
      })
    }, 3000)
  }

  const feedbackTypes = [
    {
      value: 'bug' as const,
      label: 'Bug Report',
      icon: Bug,
      description: 'Report an issue',
      color: 'red'
    },
    {
      value: 'feature' as const,
      label: 'Feature Request',
      icon: Lightbulb,
      description: 'Suggest new feature',
      color: 'yellow'
    },
    {
      value: 'improvement' as const,
      label: 'Improvement',
      icon: Star,
      description: 'Enhance existing',
      color: 'blue'
    },
    {
      value: 'other' as const,
      label: 'Other',
      icon: MessageSquare,
      description: 'General feedback',
      color: 'purple'
    }
  ]

  const supportResources = [
    {
      title: 'Help Center',
      description: 'Browse articles and guides',
      icon: BookOpen,
      link: '/help',
      color: 'blue'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: Users,
      link: '/community',
      color: 'purple'
    },
    {
      title: 'Email Support',
      description: 'support@wisdomos.com',
      icon: Mail,
      link: 'mailto:support@wisdomos.com',
      color: 'green'
    },
    {
      title: 'FAQ',
      description: 'Common questions answered',
      icon: HelpCircle,
      link: '/faq',
      color: 'orange'
    }
  ]

  const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
      icon: 'text-red-600 dark:text-red-400'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-600 dark:text-yellow-400',
      icon: 'text-yellow-600 dark:text-yellow-400'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'text-purple-600 dark:text-purple-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-600 dark:text-green-400'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-600 dark:text-orange-400',
      icon: 'text-orange-600 dark:text-orange-400'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Feedback & Support
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We're here to help and would love to hear from you
        </p>
      </div>

      {/* Submit Feedback */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Send Feedback
          </h3>
        </div>

        {submitted ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 text-center"
          >
            <Check className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Thank You!
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your feedback has been submitted. We'll review it and get back to you soon.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                What type of feedback?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon
                  const colors = colorMap[type.color]
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, type: type.value })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        feedback.type === type.value
                          ? `${colors.border} ${colors.bg}`
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${
                        feedback.type === type.value ? colors.icon : 'text-slate-400'
                      }`} />
                      <div className={`font-medium mb-1 ${
                        feedback.type === type.value ? colors.text : 'text-slate-900 dark:text-white'
                      }`}>
                        {type.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {type.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={feedback.subject}
                onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="Brief summary of your feedback"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Message
              </label>
              <textarea
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                placeholder="Tell us more about your feedback..."
                rows={5}
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={feedback.priority}
                onChange={(e) => setFeedback({ ...feedback, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="low">Low - Suggestion or minor issue</option>
                <option value="medium">Medium - Affects experience</option>
                <option value="high">High - Critical or blocking</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your Email (optional)
              </label>
              <input
                type="email"
                value={feedback.email}
                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="your@email.com"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                If you'd like us to follow up with you
              </p>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Feedback
            </button>
          </form>
        )}
      </motion.div>

      {/* Rate Your Experience */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-yellow-900/20 rounded-xl p-6 border border-yellow-100 dark:border-yellow-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500 rounded-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Rate Your Experience
          </h3>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          How would you rate your experience with WisdomOS?
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= rating
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {rating === 5 && "Amazing! Thank you for the 5-star rating! ⭐"}
              {rating === 4 && "Great! We're glad you're enjoying WisdomOS."}
              {rating === 3 && "Thanks for the feedback. We'll keep improving!"}
              {rating <= 2 && "We're sorry to hear that. Please share your feedback above."}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Support Resources */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Support Resources
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {supportResources.map((resource) => {
            const Icon = resource.icon
            const colors = colorMap[resource.color]
            return (
              <a
                key={resource.title}
                href={resource.link}
                className={`p-4 ${colors.bg} rounded-lg border ${colors.border} hover:shadow-md transition-all group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                  <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className={`font-semibold ${colors.text} mb-1`}>
                  {resource.title}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {resource.description}
                </div>
              </a>
            )
          })}
        </div>
      </motion.div>

      {/* Response Time */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-green-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
              Response Times
            </h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Critical issues:</strong> Within 4 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>General support:</strong> Within 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span><strong>Feature requests:</strong> Reviewed weekly</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
