'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Grid3x3,
  AlertCircle,
  Clock,
  Target,
  TrendingUp,
  ChevronLeft,
  Plus,
  Edit,
  Save,
  X,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Zap,
  Archive
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

interface PriorityItem {
  id: string
  lifeArea: string
  task: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  status: 'green' | 'yellow' | 'red'
  statusText: string
  nextAction: string
  deadline: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  hoursPerWeek?: number
  notes?: string
}

const defaultItems: PriorityItem[] = [
  {
    id: '1',
    lifeArea: 'Health & Recovery',
    task: 'Complete infection treatment',
    priority: 'P0',
    status: 'yellow',
    statusText: 'Critical',
    nextAction: 'Take medications daily',
    deadline: '2025-07-31',
    effort: 'low',
    impact: 'high',
    hoursPerWeek: 2
  },
  {
    id: '2',
    lifeArea: 'Legal Matters',
    task: 'File CIBC chargeback',
    priority: 'P0',
    status: 'red',
    statusText: 'Urgent',
    nextAction: 'Submit documentation',
    deadline: '2025-07-15',
    effort: 'medium',
    impact: 'high',
    hoursPerWeek: 4
  },
  {
    id: '3',
    lifeArea: 'Business Empire',
    task: 'Deploy 10 agents',
    priority: 'P1',
    status: 'green',
    statusText: 'Active',
    nextAction: 'Complete agent framework',
    deadline: '2025-08-15',
    effort: 'high',
    impact: 'high',
    hoursPerWeek: 40
  },
  {
    id: '4',
    lifeArea: 'Intimacy (Djamel)',
    task: 'Relationship clarity conversation',
    priority: 'P1',
    status: 'yellow',
    statusText: 'Needs Attention',
    nextAction: 'Schedule conversation',
    deadline: '2025-07-20',
    effort: 'medium',
    impact: 'high',
    hoursPerWeek: 8
  },
  {
    id: '5',
    lifeArea: 'Financial Recovery',
    task: 'Implement wealth strategy',
    priority: 'P2',
    status: 'yellow',
    statusText: 'Stabilizing',
    nextAction: 'Set up automated systems',
    deadline: '2025-08-01',
    effort: 'medium',
    impact: 'medium',
    hoursPerWeek: 16
  },
  {
    id: '6',
    lifeArea: 'Creative Projects',
    task: 'Complete ZendehNet script',
    priority: 'P2',
    status: 'green',
    statusText: 'Flowing',
    nextAction: 'Write Act 3',
    deadline: '2025-07-30',
    effort: 'medium',
    impact: 'medium',
    hoursPerWeek: 6
  },
  {
    id: '7',
    lifeArea: 'Time Management',
    task: 'Install calendar blocks',
    priority: 'P3',
    status: 'red',
    statusText: 'Neglected',
    nextAction: 'Block deep work time',
    deadline: '2025-07-13',
    effort: 'low',
    impact: 'high',
    hoursPerWeek: 4
  }
]

const priorityColors = {
  P0: 'bg-red-500 text-black',
  P1: 'bg-orange-500 text-black',
  P2: 'bg-yellow-500 text-black',
  P3: 'bg-gray-500 text-black'
}

const statusColors = {
  green: 'bg-green-100 text-black border-green-300',
  yellow: 'bg-yellow-100 text-black border-yellow-300',
  red: 'bg-red-100 text-black border-red-300'
}

const statusIcons = {
  green: CheckCircle,
  yellow: AlertTriangle,
  red: AlertCircle
}

export default function PriorityMatrixPage() {
  const [items, setItems] = useState<PriorityItem[]>(defaultItems)
  const [viewMode, setViewMode] = useState<'list' | 'quadrant' | 'timeline'>('list')
  const [editingItem, setEditingItem] = useState<PriorityItem | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'impact'>('priority')

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wisdomos_priority_matrix')
        if (stored) {
          setItems(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Error loading priority matrix:', error)
        setItems(defaultItems)
      }
    }
  }, [])

  // Save to localStorage
  const saveItems = (newItems: PriorityItem[]) => {
    setItems(newItems)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wisdomos_priority_matrix', JSON.stringify(newItems))
      } catch (error) {
        console.error('Error saving priority matrix:', error)
      }
    }
  }

  // Calculate total hours
  const totalHours = items.reduce((sum, item) => sum + (item.hoursPerWeek || 0), 0)
  const p0Hours = items.filter(i => i.priority === 'P0').reduce((sum, item) => sum + (item.hoursPerWeek || 0), 0)
  const p1Hours = items.filter(i => i.priority === 'P1').reduce((sum, item) => sum + (item.hoursPerWeek || 0), 0)

  // Sort and filter items
  const processedItems = items
    .filter(item => filterPriority === 'all' || item.priority === filterPriority)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return a.priority.localeCompare(b.priority)
      } else if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      } else {
        const impactOrder = { high: 0, medium: 1, low: 2 }
        return impactOrder[a.impact] - impactOrder[b.impact]
      }
    })

  const addItem = (item: Omit<PriorityItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() }
    saveItems([...items, newItem])
    setShowAddItem(false)
  }

  const updateItem = (updatedItem: PriorityItem) => {
    saveItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
    setEditingItem(null)
  }

  const deleteItem = (id: string) => {
    saveItems(items.filter(item => item.id !== id))
  }

  const getDaysUntilDeadline = (deadline: string) => {
    try {
      const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return days
    } catch (error) {
      console.error('Error calculating days until deadline:', error)
      return 0
    }
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
                Priority Matrix
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-black" />
              <span className="text-sm text-black">Q3 2025 Focus</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resource Allocation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-phoenix-gold/20">
          <h2 className="text-lg font-semibold text-black mb-4">Weekly Resource Allocation</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-black">Total Committed Hours</span>
              <span className="text-2xl font-bold text-black">{totalHours}h / week</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-black">P0 Critical:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div 
                    className="bg-red-500 h-6 rounded-full flex items-center justify-center text-xs text-black font-medium"
                    style={{ width: `${(p0Hours / totalHours) * 100}%` }}
                  >
                    {p0Hours}h
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm text-black">P1 Important:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div 
                    className="bg-orange-500 h-6 rounded-full flex items-center justify-center text-xs text-black font-medium"
                    style={{ width: `${(p1Hours / totalHours) * 100}%` }}
                  >
                    {p1Hours}h
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-phoenix-gold/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {['list', 'quadrant', 'timeline'].map(mode => (
                <PhoenixButton
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  variant={viewMode === mode ? 'primary' : 'ghost'}
                  size="sm"
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </PhoenixButton>
              ))}
            </div>

            <div className="flex gap-4">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-black text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="P0">P0 Critical</option>
                <option value="P1">P1 Important</option>
                <option value="P2">P2 Medium</option>
                <option value="P3">P3 Low</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-black text-sm"
              >
                <option value="priority">Sort by Priority</option>
                <option value="deadline">Sort by Deadline</option>
                <option value="impact">Sort by Impact</option>
              </select>

              <PhoenixButton
                onClick={() => setShowAddItem(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </PhoenixButton>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {processedItems.map((item, index) => {
              const StatusIcon = statusIcons[item.status]
              const daysLeft = getDaysUntilDeadline(item.deadline)
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-xl border-2 p-6"
                  style={{ borderColor: item.status === 'green' ? '#10B981' : item.status === 'yellow' ? '#F59E0B' : '#EF4444' + '40' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[item.status]}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {item.statusText}
                        </span>
                        <span className="text-sm text-black font-medium">{item.lifeArea}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-black mb-1">{item.task}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-black mb-3">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>Impact: {item.impact}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          <span>Effort: {item.effort}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.hoursPerWeek}h/week</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-black mb-1">Next Action:</p>
                        <p className="text-sm text-black">{item.nextAction}</p>
                      </div>

                      {item.notes && (
                        <p className="text-sm text-black italic">{item.notes}</p>
                      )}
                    </div>

                    <div className="ml-6 text-right">
                      <div className={`text-2xl font-bold ${daysLeft <= 3 ? 'text-black' : daysLeft <= 7 ? 'text-black' : 'text-black'}`}>
                        {daysLeft > 0 ? `${daysLeft}d` : 'Overdue'}
                      </div>
                      <div className="text-xs text-black">
                        {new Date(item.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-black hover:text-black"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-black hover:text-black"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {viewMode === 'quadrant' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Impact, Low Effort (Quick Wins) */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Wins
              </h3>
              <div className="text-xs text-black mb-3">High Impact • Low Effort</div>
              <div className="space-y-3">
                {processedItems
                  .filter(i => i.impact === 'high' && i.effort === 'low')
                  .map(item => (
                    <div key={item.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                        <span className="text-sm font-medium text-black">{item.task}</span>
                      </div>
                      <div className="text-xs text-black">{item.nextAction}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* High Impact, High Effort (Major Projects) */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-orange-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Major Projects
              </h3>
              <div className="text-xs text-black mb-3">High Impact • High Effort</div>
              <div className="space-y-3">
                {processedItems
                  .filter(i => i.impact === 'high' && i.effort === 'high')
                  .map(item => (
                    <div key={item.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                        <span className="text-sm font-medium text-black">{item.task}</span>
                      </div>
                      <div className="text-xs text-black">{item.nextAction}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Low Impact, Low Effort (Fill Ins) */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Fill Ins
              </h3>
              <div className="text-xs text-black mb-3">Low Impact • Low Effort</div>
              <div className="space-y-3">
                {processedItems
                  .filter(i => i.impact === 'low' && i.effort === 'low')
                  .map(item => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                        <span className="text-sm font-medium text-black">{item.task}</span>
                      </div>
                      <div className="text-xs text-black">{item.nextAction}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Low Impact, High Effort (Avoid) */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <X className="w-5 h-5" />
                Avoid / Delegate
              </h3>
              <div className="text-xs text-black mb-3">Low Impact • High Effort</div>
              <div className="space-y-3">
                {processedItems
                  .filter(i => i.impact === 'low' && i.effort === 'high')
                  .map(item => (
                    <div key={item.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                        <span className="text-sm font-medium text-black">{item.task}</span>
                      </div>
                      <div className="text-xs text-black">{item.nextAction}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
            <h3 className="text-lg font-semibold text-black mb-4">Timeline View</h3>
            <div className="space-y-4">
              {processedItems
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                .map((item, index) => {
                  const daysLeft = getDaysUntilDeadline(item.deadline)
                  const StatusIcon = statusIcons[item.status]
                  
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-32 text-right">
                        <div className="text-sm font-medium text-black">
                          {new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className={`text-xs ${daysLeft <= 3 ? 'text-black' : daysLeft <= 7 ? 'text-black' : 'text-black'}`}>
                          {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                        </div>
                      </div>
                      
                      <div className="w-px h-16 bg-gray-300"></div>
                      
                      <div className="flex-1 flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                        <StatusIcon className={`w-4 h-4 ${
                          item.status === 'green' ? 'text-black' :
                          item.status === 'yellow' ? 'text-black' :
                          'text-black'
                        }`} />
                        <span className="font-medium text-black">{item.task}</span>
                        <span className="text-sm text-black">• {item.lifeArea}</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddItem || editingItem) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold mb-4 text-black">
                {editingItem ? 'Edit Priority Item' : 'Add Priority Item'}
              </h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const item = {
                    id: editingItem?.id || Date.now().toString(),
                    lifeArea: (formData.get('lifeArea') as string) || '',
                    task: (formData.get('task') as string) || '',
                    priority: (formData.get('priority') as any) || 'P2',
                    status: (formData.get('status') as any) || 'yellow',
                    statusText: (formData.get('statusText') as string) || '',
                    nextAction: (formData.get('nextAction') as string) || '',
                    deadline: (formData.get('deadline') as string) || new Date().toISOString().split('T')[0],
                    effort: (formData.get('effort') as any) || 'medium',
                    impact: (formData.get('impact') as any) || 'medium',
                    hoursPerWeek: Number(formData.get('hoursPerWeek')) || 0,
                    notes: (formData.get('notes') as string) || ''
                  }
                  
                  try {
                    if (editingItem) {
                      updateItem(item)
                    } else {
                      addItem(item)
                    }
                  } catch (error) {
                    console.error('Error saving item:', error)
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Life Area</label>
                    <input
                      name="lifeArea"
                      type="text"
                      defaultValue={editingItem?.lifeArea}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Priority</label>
                    <select
                      name="priority"
                      defaultValue={editingItem?.priority || 'P2'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="P0">P0 - Critical</option>
                      <option value="P1">P1 - Important</option>
                      <option value="P2">P2 - Medium</option>
                      <option value="P3">P3 - Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Task</label>
                  <input
                    name="task"
                    type="text"
                    defaultValue={editingItem?.task}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingItem?.status || 'yellow'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Status Text</label>
                    <input
                      name="statusText"
                      type="text"
                      defaultValue={editingItem?.statusText}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Hours/Week</label>
                    <input
                      name="hoursPerWeek"
                      type="number"
                      defaultValue={editingItem?.hoursPerWeek || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Next Action</label>
                  <input
                    name="nextAction"
                    type="text"
                    defaultValue={editingItem?.nextAction}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Deadline</label>
                    <input
                      name="deadline"
                      type="date"
                      defaultValue={editingItem?.deadline}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Effort</label>
                    <select
                      name="effort"
                      defaultValue={editingItem?.effort || 'medium'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Impact</label>
                    <select
                      name="impact"
                      defaultValue={editingItem?.impact || 'medium'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={editingItem?.notes}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                <div className="flex gap-3">
                  <PhoenixButton type="submit">
                    {editingItem ? 'Update' : 'Add'} Item
                  </PhoenixButton>
                  <PhoenixButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingItem(null)
                      setShowAddItem(false)
                    }}
                  >
                    Cancel
                  </PhoenixButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}