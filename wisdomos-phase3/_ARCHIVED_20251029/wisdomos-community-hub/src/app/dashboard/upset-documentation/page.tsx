'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, Plus, Search, Filter, Calendar, Tag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

interface UpsetDocument {
  id: string
  title: string
  description: string
  category: 'incident' | 'complaint' | 'concern' | 'feedback'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'submitted' | 'under_review' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  author: string
  tags: string[]
}

const MOCK_DOCUMENTS: UpsetDocument[] = [
  {
    id: '1',
    title: 'Service Delay Incident Report',
    description: 'Customer experienced significant delays in service delivery affecting project timeline.',
    category: 'incident',
    priority: 'high',
    status: 'under_review',
    created_at: '2025-01-20T10:30:00Z',
    updated_at: '2025-01-20T14:15:00Z',
    author: 'John Smith',
    tags: ['service', 'delay', 'timeline']
  },
  {
    id: '2',
    title: 'Product Quality Concern',
    description: 'Multiple customers reported issues with recent product batch quality.',
    category: 'concern',
    priority: 'medium',
    status: 'submitted',
    created_at: '2025-01-19T16:45:00Z',
    updated_at: '2025-01-19T16:45:00Z',
    author: 'Sarah Johnson',
    tags: ['quality', 'product', 'batch']
  },
  {
    id: '3',
    title: 'Customer Feedback - UX Improvements',
    description: 'Suggestions for improving user experience based on customer surveys.',
    category: 'feedback',
    priority: 'low',
    status: 'resolved',
    created_at: '2025-01-18T09:20:00Z',
    updated_at: '2025-01-20T11:30:00Z',
    author: 'Mike Wilson',
    tags: ['ux', 'survey', 'improvement']
  }
]

const CATEGORY_COLORS = {
  incident: 'bg-red-100 text-red-800',
  complaint: 'bg-orange-100 text-orange-800',
  concern: 'bg-yellow-100 text-yellow-800',
  feedback: 'bg-blue-100 text-blue-800'
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-yellow-100 text-yellow-800',
  urgent: 'bg-red-100 text-red-800'
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
}

export default function UpsetDocumentationPage() {
  const { user } = useAuth()
  const [documents] = useState<UpsetDocument[]>(MOCK_DOCUMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const handleCreateDocument = () => {
    trackEvent('upset_document_create_clicked', { user_id: user?.id })
    // In a real app, this would open a modal or navigate to create page
    alert('Create new upset documentation feature would be implemented here')
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout 
      title="Upset Documentation" 
      description="Track and manage customer concerns, incidents, and feedback"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="incident">Incidents</option>
                <option value="complaint">Complaints</option>
                <option value="concern">Concerns</option>
                <option value="feedback">Feedback</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <Button onClick={handleCreateDocument} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'under_review').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Tag className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.priority === 'high' || d.priority === 'urgent').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Filter className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'resolved').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first upset documentation.'}
              </p>
              {!searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && (
                <Button onClick={handleCreateDocument}>Create First Document</Button>
              )}
            </Card>
          ) : (
            filteredDocuments.map((document) => (
              <Card key={document.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {document.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {document.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[document.category]}`}>
                            {document.category}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[document.priority]}`}>
                            {document.priority} priority
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[document.status]}`}>
                            {document.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {document.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="text-sm text-gray-500">
                          <p>Created by {document.author} • {formatDate(document.created_at)}</p>
                          {document.updated_at !== document.created_at && (
                            <p>Updated {formatDate(document.updated_at)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}