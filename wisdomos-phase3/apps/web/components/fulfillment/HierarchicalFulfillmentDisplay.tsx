'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Github, ExternalLink, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

// Types
interface Dimension {
  name: string
  focus: string
  keyInquiry: string
  practices: string[]
  metric?: number
}

interface Project {
  id: string
  name: string
  description: string
  url?: string
  dimensions?: Dimension[]
  projects?: Project[] // For nested projects (like GitHub repos)
}

interface Subdomain {
  id: string
  name: string
  projects: Project[]
}

interface LifeArea {
  id: string
  name: string
  phoenix: string
  status: 'Thriving' | 'Attention' | 'Breakdown'
  score: number
  commitments: number
  subdomains: Subdomain[]
}

export default function HierarchicalFulfillmentDisplay() {
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch GitHub repos for AXAI Innovations
        const res = await fetch('https://api.github.com/orgs/axaiinovation/repos')
        const data = await res.json()

        const projects: Project[] = data.map((repo: any) => ({
          id: repo.id.toString(),
          name: repo.name,
          description: repo.description || 'No description',
          url: repo.html_url,
        }))

        const structure: LifeArea[] = [
          {
            id: 'enterprise',
            name: 'Enterprise Dimensions — Creation, Wealth & Structure',
            phoenix: 'Phoenix of Achievement',
            status: 'Thriving',
            score: 80,
            commitments: 12,
            subdomains: [
              {
                id: 'work-purpose',
                name: 'Work & Purpose',
                projects: [
                  {
                    id: 'axai-innovations',
                    name: 'AXAI Innovations',
                    description:
                      'Umbrella organization for all proprietary systems and platforms.',
                    projects: projects,
                  },
                ],
              },
              {
                id: 'hostel-ops',
                name: 'Hostel Operations',
                projects: [
                  {
                    id: 'pvt-hostel',
                    name: 'PVT Hostel',
                    description: 'Core hospitality operation with integrated management systems.',
                    dimensions: fiveDimensions('Hostel Operations'),
                  },
                ],
              },
            ],
          },
          {
            id: 'personal',
            name: 'Personal Growth & Wellbeing',
            phoenix: 'Phoenix of Renewal',
            status: 'Attention',
            score: 65,
            commitments: 8,
            subdomains: [
              {
                id: 'health',
                name: 'Health & Fitness',
                projects: [
                  {
                    id: 'fitness-routine',
                    name: 'Fitness Routine',
                    description: 'Daily exercise and wellness practices',
                    dimensions: fiveDimensions('Health & Fitness'),
                  },
                ],
              },
            ],
          },
        ]
        setLifeAreas(structure)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16"
        >
          <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent mb-2">
            Fulfillment Display
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Hierarchical view of your life areas, projects, and five-dimension framework
          </p>
        </motion.div>

        {/* Life Areas */}
        {lifeAreas.map((area, index) => (
          <LifeAreaCard
            key={area.id}
            area={area}
            index={index}
            expanded={expanded}
            toggleExpand={toggleExpand}
          />
        ))}

        {/* Acceptable/Non-Tolerated Panels */}
        <AcceptablePanels />
      </div>
    </div>
  )
}

// Life Area Card Component
function LifeAreaCard({
  area,
  index,
  expanded,
  toggleExpand,
}: {
  area: LifeArea
  index: number
  expanded: Record<string, boolean>
  toggleExpand: (key: string) => void
}) {
  const statusConfig = {
    Thriving: {
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-400',
    },
    Attention: {
      icon: AlertCircle,
      color: 'from-yellow-500 to-orange-600',
      bg: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-400',
    },
    Breakdown: {
      icon: XCircle,
      color: 'from-red-500 to-rose-600',
      bg: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
    },
  }

  const config = statusConfig[area.status]
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 ${config.border} overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${config.bg} p-6 cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => toggleExpand(area.id)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: expanded[area.id] ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{area.name}</h2>
            </div>
            <div className="flex items-center gap-4 ml-9">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg bg-white/50 dark:bg-slate-800/50 ${config.text}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">{area.status}</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">{area.phoenix}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-4xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent">
                {area.score}
              </div>
              <TrendingUp className={`w-6 h-6 ${config.text}`} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {area.commitments} commitments
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded[area.id] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-200 dark:border-slate-700"
          >
            <div className="p-6 space-y-4">
              {area.subdomains.map((subdomain) => (
                <SubdomainCard key={subdomain.id} subdomain={subdomain} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Subdomain Card Component
function SubdomainCard({ subdomain }: { subdomain: Subdomain }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-l-4 border-purple-500 dark:border-purple-600 pl-6 ml-4">
      <div
        className="flex justify-between items-center cursor-pointer group"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {subdomain.name}
          </h3>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-3"
          >
            {subdomain.projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Project Card Component
function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 shadow-md border border-slate-200 dark:border-slate-600">
      <div
        className="flex justify-between items-start cursor-pointer group"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {project.url && <Github className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
            <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {project.name}
            </h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{project.description}</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            {project.dimensions ? (
              <DimensionTable dimensions={project.dimensions} />
            ) : project.projects ? (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Repositories ({project.projects.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                  {project.projects.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-amber-500 dark:hover:border-amber-500 transition-colors group"
                    >
                      <Github className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                        {repo.name}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-500 ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Dimension Table Component
function DimensionTable({ dimensions }: { dimensions: Dimension[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
          <tr>
            <th className="p-2 text-left font-semibold text-slate-900 dark:text-white">Dimension</th>
            <th className="p-2 text-left font-semibold text-slate-900 dark:text-white">Focus</th>
            <th className="p-2 text-left font-semibold text-slate-900 dark:text-white">Key Inquiry</th>
            <th className="p-2 text-left font-semibold text-slate-900 dark:text-white">Practices</th>
            <th className="p-2 text-center font-semibold text-slate-900 dark:text-white">Score (1–5)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800">
          {dimensions.map((d, i) => (
            <tr key={i} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <td className="p-2 font-medium text-slate-900 dark:text-white">{d.name}</td>
              <td className="p-2 text-slate-700 dark:text-slate-300">{d.focus}</td>
              <td className="p-2 italic text-slate-600 dark:text-slate-400">{d.keyInquiry}</td>
              <td className="p-2 text-slate-700 dark:text-slate-300">
                <div className="flex flex-wrap gap-1">
                  {d.practices.map((practice, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs"
                    >
                      {practice}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-2 text-center">
                {d.metric ? (
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      {d.metric}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/5</span>
                  </div>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Acceptable/Non-Tolerated Panels
function AcceptablePanels() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid md:grid-cols-2 gap-6 mt-8"
    >
      {/* What's Acceptable */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h5 className="text-xl font-bold text-green-900 dark:text-green-100">What's Acceptable</h5>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-green-500 mt-1">✓</span>
            <span>Daily morning routine with meditation and reflection</span>
          </li>
          <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-green-500 mt-1">✓</span>
            <span>Healthy work-life boundaries and self-care practices</span>
          </li>
          <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-green-500 mt-1">✓</span>
            <span>Creative expression and continuous learning</span>
          </li>
          <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-green-500 mt-1">✓</span>
            <span>Building authentic relationships and community</span>
          </li>
        </ul>
      </div>

      {/* No Longer Tolerated */}
      <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h5 className="text-xl font-bold text-red-900 dark:text-red-100">No Longer Tolerated</h5>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-red-500 mt-1">✗</span>
            <span>Overcommitting and burnout patterns</span>
          </li>
          <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-red-500 mt-1">✗</span>
            <span>Toxic relationships or draining environments</span>
          </li>
          <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-red-500 mt-1">✗</span>
            <span>Procrastination on key goals and priorities</span>
          </li>
          <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-red-500 mt-1">✗</span>
            <span>Compromising values for short-term gains</span>
          </li>
        </ul>
      </div>
    </motion.div>
  )
}

// Helper: create five-dimension templates per domain
function fiveDimensions(domain: string): Dimension[] {
  const defaults: Record<string, Dimension[]> = {
    'Work & Purpose': [
      {
        name: 'Creative',
        focus: 'Artistic & conceptual innovation',
        keyInquiry: 'How am I expressing vision and originality?',
        practices: ['Writing', 'Design', 'Content Creation'],
        metric: 4,
      },
      {
        name: 'Operational',
        focus: 'Systems & team processes',
        keyInquiry: 'Are my operations effective and scalable?',
        practices: ['Documentation', 'Delegation'],
        metric: 3,
      },
      {
        name: 'Strategic',
        focus: 'Vision & long-term direction',
        keyInquiry: 'Is my strategy clear and measurable?',
        practices: ['Roadmapping', 'Quarterly Planning'],
        metric: 4,
      },
      {
        name: 'Innovative',
        focus: 'R&D and technology',
        keyInquiry: 'Am I experimenting and improving consistently?',
        practices: ['Research', 'Prototyping'],
        metric: 5,
      },
      {
        name: 'Administrative',
        focus: 'Order & compliance',
        keyInquiry: 'Are tasks organized and tracked?',
        practices: ['Reporting', 'Recordkeeping'],
        metric: 3,
      },
    ],
    'Hostel Operations': [
      {
        name: 'Guest Experience',
        focus: 'Hospitality & comfort',
        keyInquiry: 'Are guests fulfilled and cared for?',
        practices: ['Surveys', 'Interactions'],
        metric: 4,
      },
      {
        name: 'Cleanliness',
        focus: 'Environmental order',
        keyInquiry: 'Are standards consistently met?',
        practices: ['Daily cleaning audit'],
        metric: 5,
      },
      {
        name: 'Staff Integrity',
        focus: 'Service quality',
        keyInquiry: 'Are staff embodying respect and care?',
        practices: ['Meetings', 'Feedback'],
        metric: 4,
      },
      {
        name: 'Profitability',
        focus: 'Revenue & occupancy',
        keyInquiry: 'Is the hostel profitable and stable?',
        practices: ['Monthly finance review'],
        metric: 3,
      },
      {
        name: 'Reputation',
        focus: 'Community perception',
        keyInquiry: 'How am I perceived publicly?',
        practices: ['Reviews', 'Social media'],
        metric: 4,
      },
    ],
    'Health & Fitness': [
      {
        name: 'Physical',
        focus: 'Strength & endurance',
        keyInquiry: 'Am I building physical capacity?',
        practices: ['Exercise', 'Sports'],
        metric: 4,
      },
      {
        name: 'Nutritional',
        focus: 'Diet & nourishment',
        keyInquiry: 'Am I fueling my body optimally?',
        practices: ['Meal planning', 'Hydration'],
        metric: 3,
      },
      {
        name: 'Rest & Recovery',
        focus: 'Sleep & restoration',
        keyInquiry: 'Am I getting adequate rest?',
        practices: ['Sleep tracking', 'Rest days'],
        metric: 4,
      },
      {
        name: 'Mental Fitness',
        focus: 'Stress management',
        keyInquiry: 'How resilient am I mentally?',
        practices: ['Meditation', 'Breathwork'],
        metric: 5,
      },
      {
        name: 'Preventive Care',
        focus: 'Health monitoring',
        keyInquiry: 'Am I proactive about health?',
        practices: ['Check-ups', 'Screening'],
        metric: 3,
      },
    ],
  }
  return defaults[domain] || []
}
