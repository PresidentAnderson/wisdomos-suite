'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  Heart, 
  Shield, 
  AlertTriangle,
  ChevronLeft,
  Copy,
  CheckCircle,
  Users,
  Briefcase,
  DollarSign,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

interface ConversationTemplate {
  id: string
  category: string
  icon: React.ElementType
  color: string
  title: string
  context: string
  opener: string
  questions: {
    level: 'green' | 'yellow' | 'red'
    text: string
    purpose: string
  }[]
  closers: string[]
}

const conversationTemplates: ConversationTemplate[] = [
  {
    id: 'michael-ops',
    category: 'Work & Operations',
    icon: Briefcase,
    color: '#FFD700',
    title: 'Clarifying Support Role with Michael',
    context: 'When you need to reset expectations about operational support vs friendship',
    opener: "Hey Michael, j'aimerais te parler de quelque chose de tranquille mais important. On peut prendre 20 minutes?",
    questions: [
      {
        level: 'green',
        text: "Où en es-tu en ce moment?",
        purpose: "Opens space for their perspective"
      },
      {
        level: 'green',
        text: "Comment perçois-tu ton rôle actuel auprès de moi et dans ce projet?",
        purpose: "Reveals their self-perception"
      },
      {
        level: 'green',
        text: "Qu'est-ce que tu penses que j'attends de toi concrètement?",
        purpose: "Uncovers assumptions"
      },
      {
        level: 'yellow',
        text: "Est-ce que tu sens que tu peux être régulier et fiable dans ce rôle?",
        purpose: "Tests commitment capacity"
      },
      {
        level: 'yellow',
        text: "Qu'est-ce qui te motive personnellement à être impliqué ici?",
        purpose: "Reveals true motivations"
      },
      {
        level: 'yellow',
        text: "À quoi es-tu engagé en ce moment – ici et ailleurs?",
        purpose: "Maps competing priorities"
      },
      {
        level: 'yellow',
        text: "Est-ce qu'il y a des attentes silencieuses que tu as envers moi ou ce projet?",
        purpose: "Surfaces hidden expectations"
      },
      {
        level: 'yellow',
        text: "Pour toi, qu'est-ce que ça veut dire offrir du soutien opérationnel ici?",
        purpose: "Defines operational support"
      },
      {
        level: 'yellow',
        text: "Est-ce que tu te sens capable d'exécuter certaines tâches sans que je doive vérifier constamment?",
        purpose: "Tests autonomy readiness"
      },
      {
        level: 'red',
        text: "Est-ce que tu es à l'aise avec l'idée d'être redevable des résultats?",
        purpose: "Establishes accountability"
      },
      {
        level: 'red',
        text: "Quelles tâches veux-tu prendre en charge cette semaine, et sur quoi puis-je compter à 100%?",
        purpose: "Creates concrete commitments"
      },
      {
        level: 'red',
        text: "Si tu devais choisir aujourd'hui entre l'amitié ou le soutien opérationnel, où est-ce que tu sens que tu as le plus de valeur ou d'envie?",
        purpose: "Forces role clarity"
      }
    ],
    closers: [
      "Merci d'avoir pris le temps pour cette conversation. Je vais réfléchir à ce que tu m'as partagé.",
      "On se donne une semaine pour voir comment ça se passe avec ce qu'on s'est dit?",
      "Est-ce qu'on peut créer une boucle de retour pour ajuster en temps réel?"
    ]
  },
  {
    id: 'djamel-intimacy',
    category: 'Intimacy & Love',
    icon: Heart,
    color: '#F72585',
    title: 'Relationship Clarity with Djamel',
    context: 'When you need to address alignment and presence in your intimate partnership',
    opener: "Djamel, I need us to have a real conversation about where we are and where we're going. Can we create sacred space for this?",
    questions: [
      {
        level: 'green',
        text: "How are you experiencing our relationship right now?",
        purpose: "Opens emotional space"
      },
      {
        level: 'green',
        text: "What feels most alive between us?",
        purpose: "Identifies strengths"
      },
      {
        level: 'green',
        text: "What do you need from me that you're not getting?",
        purpose: "Reveals gaps"
      },
      {
        level: 'yellow',
        text: "Where do you feel we're out of alignment?",
        purpose: "Surfaces misalignment"
      },
      {
        level: 'yellow',
        text: "What patterns do you see us repeating?",
        purpose: "Identifies cycles"
      },
      {
        level: 'yellow',
        text: "How present do you feel I am with you?",
        purpose: "Tests presence quality"
      },
      {
        level: 'red',
        text: "What are you tolerating that you don't want to?",
        purpose: "Reveals compromises"
      },
      {
        level: 'red',
        text: "If we don't change anything, where do you see us in a year?",
        purpose: "Projects current trajectory"
      },
      {
        level: 'red',
        text: "What would need to shift for you to feel fully met?",
        purpose: "Defines transformation needed"
      }
    ],
    closers: [
      "Thank you for your honesty. Let's sit with this and reconvene tomorrow.",
      "I'm committed to us. Let's create a weekly check-in to track our progress.",
      "What support do we need to make these changes sustainable?"
    ]
  },
  {
    id: 'financial-dispute',
    category: 'Financial Sovereignty',
    icon: DollarSign,
    color: '#FF914D',
    title: 'Disputing Unauthorized Charges',
    context: 'When you need to firmly but professionally dispute financial predation',
    opener: "I'm calling about unauthorized charges on my account that need immediate reversal.",
    questions: [
      {
        level: 'green',
        text: "Can you see the charge for [amount] on [date]?",
        purpose: "Establishes facts"
      },
      {
        level: 'green',
        text: "What documentation do you need from me?",
        purpose: "Shows cooperation"
      },
      {
        level: 'yellow',
        text: "Who authorized this charge and when?",
        purpose: "Demands accountability"
      },
      {
        level: 'yellow',
        text: "What is your dispute resolution timeline?",
        purpose: "Sets expectations"
      },
      {
        level: 'red',
        text: "Given that this was unauthorized, when will the full refund be processed?",
        purpose: "Assumes resolution"
      },
      {
        level: 'red',
        text: "What is your supervisor's name and direct line?",
        purpose: "Escalation preparation"
      },
      {
        level: 'red',
        text: "Should I have my attorney handle this directly?",
        purpose: "Shows serious intent"
      }
    ],
    closers: [
      "I'll expect confirmation of the reversal within 24 hours.",
      "I'm documenting this conversation. What's your employee ID?",
      "If this isn't resolved by [date], I'll proceed with formal complaints."
    ]
  },
  {
    id: 'boundary-family',
    category: 'Family Boundaries',
    icon: Shield,
    color: '#8B5CF6',
    title: 'Setting Boundaries with Toxic Family',
    context: 'When you need to protect yourself from family members who have harmed you',
    opener: "I need to be clear about my boundaries moving forward.",
    questions: [
      {
        level: 'green',
        text: "Do you understand why I've needed distance?",
        purpose: "Tests awareness"
      },
      {
        level: 'yellow',
        text: "What would need to change for any relationship to be possible?",
        purpose: "Sets conditions"
      },
      {
        level: 'red',
        text: "Can you respect that contact needs to be on my terms?",
        purpose: "Establishes control"
      }
    ],
    closers: [
      "I'll reach out if and when I'm ready.",
      "This boundary is non-negotiable.",
      "My wellbeing comes first."
    ]
  },
  {
    id: 'time-protection',
    category: 'Time & Energy',
    icon: Clock,
    color: '#3A0CA3',
    title: 'Protecting Focus Time',
    context: 'When someone repeatedly interrupts your deep work or creative time',
    opener: "I need to talk about how we handle my focus time.",
    questions: [
      {
        level: 'green',
        text: "Are you aware that I block 6-9am for deep work?",
        purpose: "Establishes awareness"
      },
      {
        level: 'yellow',
        text: "What makes you feel it's okay to interrupt during these times?",
        purpose: "Reveals assumptions"
      },
      {
        level: 'yellow',
        text: "How can we handle your needs without breaking my focus?",
        purpose: "Seeks solution"
      },
      {
        level: 'red',
        text: "Can you commit to respecting these boundaries going forward?",
        purpose: "Gets commitment"
      }
    ],
    closers: [
      "Let's try this for a week and see how it works.",
      "I need this to work for my mission to succeed.",
      "Thank you for understanding how important this is."
    ]
  }
]

export default function DifficultConversationsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ConversationTemplate | null>(null)
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set())

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItems(prev => new Set(prev).add(id))
    setTimeout(() => {
      setCopiedItems(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 2000)
  }

  const toggleQuestion = (questionId: string) => {
    setCompletedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  const levelColors = {
    green: 'bg-green-100 text-black border-green-300',
    yellow: 'bg-yellow-100 text-black border-yellow-300',
    red: 'bg-red-100 text-black border-red-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <PhoenixButton variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </PhoenixButton>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Difficult Conversations Toolkit
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-black" />
              <span className="text-sm text-black">Boundary Setting Scripts</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-phoenix-gold/20">
          <h2 className="text-lg font-semibold text-black mb-3">How to Use This Toolkit</h2>
          <div className="space-y-2 text-sm text-black">
            <p>1. Choose a conversation template that matches your situation</p>
            <p>2. Review the opener and practice saying it out loud</p>
            <p>3. Select questions based on the conversation flow (green → yellow → red)</p>
            <p>4. Click questions to mark as asked, copy text to clipboard for reference</p>
            <p>5. Use closers to gracefully end the conversation</p>
          </div>
        </div>

        {/* Template Grid */}
        {!selectedTemplate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversationTemplates.map((template) => {
              const Icon = template.icon
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-xl border-2 p-6 cursor-pointer hover:shadow-2xl transition-shadow"
                  style={{ borderColor: template.color + '40' }}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: template.color + '20' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: template.color }} />
                    </div>
                    <span className="text-xs font-medium text-black">{template.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">{template.title}</h3>
                  <p className="text-sm text-black">{template.context}</p>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* Selected Template Detail */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <PhoenixButton
              onClick={() => {
                setSelectedTemplate(null)
                setCompletedQuestions(new Set())
              }}
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Templates
            </PhoenixButton>

            {/* Template Header */}
            <div 
              className="bg-white rounded-2xl shadow-xl border-2 p-6"
              style={{ borderColor: selectedTemplate.color + '40' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <selectedTemplate.icon 
                    className="w-6 h-6" 
                    style={{ color: selectedTemplate.color }} 
                  />
                  <h2 className="text-2xl font-bold text-black">{selectedTemplate.title}</h2>
                </div>
                <span className="text-sm text-black">{selectedTemplate.category}</span>
              </div>
              <p className="text-black">{selectedTemplate.context}</p>
            </div>

            {/* Opener */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
              <h3 className="text-lg font-semibold text-black mb-3">Opening Statement</h3>
              <div className="bg-blue-50 rounded-lg p-4 relative">
                <p className="text-black pr-10">{selectedTemplate.opener}</p>
                <button
                  onClick={() => copyToClipboard(selectedTemplate.opener, 'opener')}
                  className="absolute top-4 right-4 text-black hover:text-black"
                >
                  {copiedItems.has('opener') ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
              <h3 className="text-lg font-semibold text-black mb-3">Questions to Ask</h3>
              <div className="space-y-3">
                {selectedTemplate.questions.map((question, index) => {
                  const questionId = `q-${index}`
                  const isCompleted = completedQuestions.has(questionId)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-lg border p-4 cursor-pointer transition-all ${
                        isCompleted ? 'opacity-50' : ''
                      } ${levelColors[question.level]}`}
                      onClick={() => toggleQuestion(questionId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium uppercase">
                              {question.level === 'green' ? '🟢 Opening' : 
                               question.level === 'yellow' ? '🟡 Probing' : 
                               '🔴 Direct'}
                            </span>
                            {isCompleted && (
                              <CheckCircle className="w-4 h-4 text-black" />
                            )}
                          </div>
                          <p className="font-medium text-black">{question.text}</p>
                          <p className="text-xs text-black mt-1 italic">{question.purpose}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(question.text, questionId)
                          }}
                          className="ml-3 text-black hover:text-black"
                        >
                          {copiedItems.has(questionId) ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-black mb-2">
                  <span>Questions Asked</span>
                  <span>{completedQuestions.size} / {selectedTemplate.questions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-phoenix-red to-phoenix-orange"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(completedQuestions.size / selectedTemplate.questions.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Closers */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
              <h3 className="text-lg font-semibold text-black mb-3">Closing Statements</h3>
              <div className="space-y-3">
                {selectedTemplate.closers.map((closer, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 relative hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-black pr-10">{closer}</p>
                    <button
                      onClick={() => copyToClipboard(closer, `closer-${index}`)}
                      className="absolute top-4 right-4 text-black hover:text-black"
                    >
                      {copiedItems.has(`closer-${index}`) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-black mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-black mb-2">Remember</h3>
                  <ul className="text-sm text-black space-y-1">
                    <li>• Stay calm and centered in your truth</li>
                    <li>• You're not responsible for their emotional reaction</li>
                    <li>• It's okay to pause or end the conversation if needed</li>
                    <li>• Document important conversations in writing afterward</li>
                    <li>• Your boundaries are valid and non-negotiable</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}