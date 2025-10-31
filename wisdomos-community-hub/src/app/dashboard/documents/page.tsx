'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, Plus, Search, Filter, Download, Share, Calendar, Tag, Folder } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

interface Document {
  id: string
  title: string
  description: string
  type: 'note' | 'template' | 'guide' | 'report' | 'resource'
  category: 'personal' | 'work' | 'learning' | 'reference'
  tags: string[]
  created_at: string
  updated_at: string
  size: string
  author: string
  shared: boolean
  starred: boolean
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Personal Development Plan 2025',
    description: 'Comprehensive plan outlining goals and strategies for personal growth this year',
    type: 'guide',
    category: 'personal',
    tags: ['goals', 'planning', '2025', 'development'],
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-20T14:15:00Z',
    size: '2.4 MB',
    author: 'You',
    shared: false,
    starred: true
  },
  {
    id: '2',
    title: 'Meeting Notes Template',
    description: 'Standardized template for capturing meeting notes and action items',
    type: 'template',
    category: 'work',
    tags: ['meetings', 'template', 'productivity'],
    created_at: '2025-01-10T09:15:00Z',
    updated_at: '2025-01-10T09:15:00Z',
    size: '156 KB',
    author: 'You',
    shared: true,
    starred: false
  },
  {
    id: '3',
    title: 'Weekly Reflection Journal',
    description: 'Weekly reflections on progress, challenges, and insights',
    type: 'note',
    category: 'personal',
    tags: ['reflection', 'journal', 'weekly', 'insights'],
    created_at: '2025-01-08T18:45:00Z',
    updated_at: '2025-01-20T12:30:00Z',
    size: '1.8 MB',
    author: 'You',
    shared: false,
    starred: true
  },
  {
    id: '4',
    title: 'Learning Resources Collection',
    description: 'Curated collection of articles, books, and courses for continuous learning',
    type: 'resource',
    category: 'learning',
    tags: ['resources', 'learning', 'books', 'courses'],
    created_at: '2025-01-05T16:20:00Z',
    updated_at: '2025-01-18T11:00:00Z',
    size: '3.2 MB',
    author: 'You',
    shared: true,
    starred: false
  },
  {
    id: '5',
    title: 'Project Status Report - Q1',
    description: 'Quarterly report on project progress and key metrics',
    type: 'report',
    category: 'work',
    tags: ['project', 'report', 'Q1', 'metrics'],
    created_at: '2025-01-03T14:00:00Z',
    updated_at: '2025-01-15T16:45:00Z',
    size: '890 KB',
    author: 'You',
    shared: true,
    starred: false
  }
]

const TYPE_COLORS = {
  note: 'bg-blue-100 text-blue-800',
  template: 'bg-green-100 text-green-800',
  guide: 'bg-purple-100 text-purple-800',
  report: 'bg-orange-100 text-orange-800',
  resource: 'bg-pink-100 text-pink-800'
}

const CATEGORY_COLORS = {
  personal: 'bg-purple-100 text-purple-800',
  work: 'bg-blue-100 text-blue-800',
  learning: 'bg-green-100 text-green-800',
  reference: 'bg-gray-100 text-gray-800'
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents] = useState<Document[]>(MOCK_DOCUMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showStarredOnly, setShowStarredOnly] = useState(false)

  const handleCreateDocument = () => {
    trackEvent('document_create_clicked', { user_id: user?.id })
    alert('Create new document feature would be implemented here')
  }

  const handleDownload = (docId: string) => {
    trackEvent('document_downloaded', { user_id: user?.id, document_id: docId })
    alert('Download functionality would be implemented here')
  }

  const handleShare = (docId: string) => {
    trackEvent('document_shared', { user_id: user?.id, document_id: docId })
    alert('Share functionality would be implemented here')
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === 'all' || doc.type === selectedType
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesStarred = !showStarredOnly || doc.starred
    
    return matchesSearch && matchesType && matchesCategory && matchesStarred
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <DashboardLayout 
      title="Documents" 
      description="Organize and manage your personal knowledge repository"
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
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="note">Notes</option>
                <option value="template">Templates</option>
                <option value="guide">Guides</option>
                <option value="report">Reports</option>
                <option value="resource">Resources</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="learning">Learning</option>
                <option value="reference">Reference</option>
              </select>

              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  showStarredOnly 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                ⭐ Starred
              </button>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
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
                <Tag className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Starred</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.starred).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Share className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shared</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.shared).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Folder className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(documents.map(d => d.category)).size}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Documents Grid */}
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedType !== 'all' || selectedCategory !== 'all' || showStarredOnly
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first document.'}
              </p>
              {!searchQuery && selectedType === 'all' && selectedCategory === 'all' && !showStarredOnly && (
                <Button onClick={handleCreateDocument}>Create First Document</Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      {document.starred && <span className="text-yellow-500">⭐</span>}
                      {document.shared && <span className="text-green-500">🔗</span>}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {document.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {document.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[document.type]}`}>
                      {document.type}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[document.category]}`}>
                      {document.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {document.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                    {document.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        +{document.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {formatDate(document.updated_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{document.size}</span>
                      <span>by {document.author}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Open
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(document.id)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShare(document.id)}
                    >
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}