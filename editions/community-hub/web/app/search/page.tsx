'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar,
  Tag,
  User,
  FileText,
  Shield,
  Heart,
  Target,
  BookOpen,
  Award,
  Sliders,
  X,
  ChevronDown,
  Clock,
  Loader2,
  ArrowUpDown,
  Grid3X3,
  List,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  boundaryAuditApi, 
  upsetDocumentationApi, 
  fulfillmentDisplayApi,
  autobiographyApi,
  contributionsApi,
  achievementsApi 
} from '@/lib/database';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'boundary_audit' | 'upset_doc' | 'fulfillment_display' | 'autobiography' | 'contribution' | 'achievement';
  title: string;
  content: string;
  excerpt: string;
  date: Date;
  category?: string;
  tags: string[];
  status?: string;
  relevance: number;
  url: string;
}

interface SearchFilters {
  types: string[];
  categories: string[];
  status: string[];
  dateRange: 'all' | 'week' | 'month' | 'year';
  customDateStart?: Date;
  customDateEnd?: Date;
  tags: string[];
  sortBy: 'relevance' | 'date' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface SearchStats {
  totalResults: number;
  resultsByType: { [key: string]: number };
  searchTime: number;
}

const contentTypes = [
  { id: 'boundary_audit', label: 'Boundary Audits', icon: Shield, color: 'purple' },
  { id: 'upset_doc', label: 'Upset Documentation', icon: Heart, color: 'red' },
  { id: 'fulfillment_display', label: 'Fulfillment Displays', icon: Target, color: 'green' },
  { id: 'autobiography', label: 'Autobiography', icon: BookOpen, color: 'blue' },
  { id: 'contribution', label: 'Contributions', icon: User, color: 'indigo' },
  { id: 'achievement', label: 'Achievements', icon: Award, color: 'yellow' }
];

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [stats, setStats] = useState<SearchStats | null>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    categories: [],
    status: [],
    dateRange: 'all',
    tags: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const [allData, setAllData] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Load all user data on component mount
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

    try {
      const [
        boundaryAudits,
        upsetDocs,
        fulfillmentDisplays,
        autobiographyEntries,
        contributions,
        achievements
      ] = await Promise.all([
        boundaryAuditApi.getAll(user.id),
        upsetDocumentationApi.getAll(user.id),
        fulfillmentDisplayApi.getAll(user.id),
        autobiographyApi.getAll(user.id),
        contributionsApi.getAll(user.id),
        achievementsApi.getAll(user.id)
      ]);

      // Transform data into searchable format
      const searchableData: SearchResult[] = [
        ...boundaryAudits.map(item => ({
          id: item.id,
          type: 'boundary_audit' as const,
          title: item.title,
          content: `${item.current_boundary} ${item.desired_boundary} ${item.action_steps.join(' ')}`,
          excerpt: item.current_boundary.substring(0, 100) + '...',
          date: parseISO(item.created_at),
          category: item.category,
          tags: [],
          status: item.status,
          relevance: 0,
          url: `/tools/boundary-audit`
        })),
        ...upsetDocs.map(item => ({
          id: item.id,
          type: 'upset_doc' as const,
          title: item.title,
          content: `${item.trigger_event} ${item.emotional_response} ${item.reframe_perspective} ${item.learned_wisdom}`,
          excerpt: item.trigger_event.substring(0, 100) + '...',
          date: parseISO(item.created_at),
          category: 'emotional',
          tags: item.underlying_values || [],
          status: item.status,
          relevance: 0,
          url: `/tools/upset-documentation`
        })),
        ...fulfillmentDisplays.map(item => ({
          id: item.id,
          type: 'fulfillment_display' as const,
          title: item.title,
          content: `${item.description} ${item.reflection} ${item.goals.join(' ')} ${item.achievements.join(' ')}`,
          excerpt: item.description.substring(0, 100) + '...',
          date: parseISO(item.created_at),
          category: 'fulfillment',
          tags: [],
          status: 'active',
          relevance: 0,
          url: `/tools/fulfillment-display`
        })),
        ...autobiographyEntries.map(item => ({
          id: item.id,
          type: 'autobiography' as const,
          title: item.title,
          content: `${item.description} ${item.lessons_learned.join(' ')} ${item.reframe_notes || ''}`,
          excerpt: item.description.substring(0, 100) + '...',
          date: parseISO(item.date_occurred),
          category: item.life_area,
          tags: [],
          status: 'published',
          relevance: 0,
          url: `/tools/autobiography`
        })),
        ...contributions.map(item => ({
          id: item.id,
          type: 'contribution' as const,
          title: item.title,
          content: item.content,
          excerpt: item.content.substring(0, 100) + '...',
          date: parseISO(item.created_at),
          category: 'community',
          tags: item.tags || [],
          status: 'published',
          relevance: 0,
          url: `/contributions`
        })),
        ...achievements.map(item => ({
          id: item.id,
          type: 'achievement' as const,
          title: item.achievement_name,
          content: item.description,
          excerpt: item.description.substring(0, 100) + '...',
          date: parseISO(item.earned_at),
          category: item.achievement_type,
          tags: [],
          status: 'earned',
          relevance: 0,
          url: `/achievements`
        }))
      ];

      setAllData(searchableData);

      // Extract available filters
      const tags = new Set<string>();
      const categories = new Set<string>();

      searchableData.forEach(item => {
        item.tags.forEach(tag => tags.add(tag));
        if (item.category) categories.add(item.category);
      });

      setAvailableTags(Array.from(tags));
      setAvailableCategories(Array.from(categories));

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Perform search and filtering
  const searchResults = useMemo(() => {
    const startTime = performance.now();
    
    let filteredData = [...allData];

    // Text search
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
      
      filteredData = filteredData.map(item => {
        let relevance = 0;
        const searchableText = `${item.title} ${item.content}`.toLowerCase();

        searchTerms.forEach(term => {
          const titleMatches = (item.title.toLowerCase().match(new RegExp(term, 'g')) || []).length;
          const contentMatches = (item.content.toLowerCase().match(new RegExp(term, 'g')) || []).length;
          
          relevance += titleMatches * 3; // Title matches are more important
          relevance += contentMatches * 1;
        });

        return { ...item, relevance };
      }).filter(item => item.relevance > 0);
    }

    // Apply filters
    if (filters.types.length > 0) {
      filteredData = filteredData.filter(item => filters.types.includes(item.type));
    }

    if (filters.categories.length > 0) {
      filteredData = filteredData.filter(item => 
        item.category && filters.categories.includes(item.category)
      );
    }

    if (filters.status.length > 0) {
      filteredData = filteredData.filter(item => 
        item.status && filters.status.includes(item.status)
      );
    }

    if (filters.tags.length > 0) {
      filteredData = filteredData.filter(item => 
        filters.tags.some(tag => item.tags.includes(tag))
      );
    }

    // Date filtering
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredData = filteredData.filter(item => item.date >= cutoff);
    }

    // Sorting
    filteredData.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'relevance':
          comparison = b.relevance - a.relevance;
          break;
        case 'date':
          comparison = b.date.getTime() - a.date.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return filters.sortOrder === 'desc' ? comparison : -comparison;
    });

    const endTime = performance.now();
    
    // Calculate stats
    const resultsByType: { [key: string]: number } = {};
    filteredData.forEach(item => {
      resultsByType[item.type] = (resultsByType[item.type] || 0) + 1;
    });

    setStats({
      totalResults: filteredData.length,
      resultsByType,
      searchTime: endTime - startTime
    });

    return filteredData;
  }, [allData, query, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(searchResults);
  };

  const toggleFilter = (filterType: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentValue = prev[filterType];
      
      // Only apply to array-type filters
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [filterType]: currentValue.includes(value)
            ? currentValue.filter(item => item !== value)
            : [...currentValue, value]
        };
      }
      
      return prev;
    });
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      categories: [],
      status: [],
      dateRange: 'all',
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = contentTypes.find(t => t.id === type);
    if (!typeConfig) return FileText;
    return typeConfig.icon;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = contentTypes.find(t => t.id === type);
    return typeConfig?.color || 'gray';
  };

  // Use searchResults directly instead of results state
  const displayResults = searchResults;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-black mb-2">
            Search Your Wisdom
          </h1>
          <p className="text-black dark:text-black">
            Find insights across all your tools and entries
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your wisdom journey..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-black placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                showFilters || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== 'all' && f !== 'relevance' && f !== 'desc')
                  ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 text-black dark:text-black'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== 'all' && f !== 'relevance' && f !== 'desc') && (
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              )}
            </button>
          </form>

          {/* Search Stats */}
          {stats && query && (
            <div className="mt-4 flex items-center justify-between text-sm text-black dark:text-black">
              <div>
                Found {stats.totalResults} result{stats.totalResults !== 1 ? 's' : ''} 
                {query && ` for "${query}"`} 
                in {Math.round(stats.searchTime)}ms
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded ${viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900/20 text-black' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded ${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900/20 text-black' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Content Types */}
                <div>
                  <h3 className="font-medium text-black dark:text-black mb-3">Content Types</h3>
                  <div className="space-y-2">
                    {contentTypes.map((type) => (
                      <label key={type.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type.id)}
                          onChange={() => toggleFilter('types', type.id)}
                          className="rounded border-gray-300 text-black focus:ring-purple-500"
                        />
                        <type.icon className="w-4 h-4" />
                        <span className="text-sm text-black dark:text-black">
                          {type.label}
                        </span>
                        <span className="text-xs text-black ml-auto">
                          {stats?.resultsByType[type.id] || 0}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                {availableCategories.length > 0 && (
                  <div>
                    <h3 className="font-medium text-black dark:text-black mb-3">Categories</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableCategories.map((category) => (
                        <label key={category} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={() => toggleFilter('categories', category)}
                            className="rounded border-gray-300 text-black focus:ring-purple-500"
                          />
                          <span className="text-sm text-black dark:text-black capitalize">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Range */}
                <div>
                  <h3 className="font-medium text-black dark:text-black mb-3">Date Range</h3>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-black text-sm"
                  >
                    <option value="all">All time</option>
                    <option value="week">Last week</option>
                    <option value="month">Last month</option>
                    <option value="year">Last year</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="font-medium text-black dark:text-black mb-3">Sort By</h3>
                  <div className="space-y-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-black text-sm"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="title">Title</option>
                    </select>
                    <button
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' 
                      }))}
                      className="flex items-center gap-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      <span className="text-sm">
                        {filters.sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-black dark:text-black">
                  {Object.values(filters).filter(f => Array.isArray(f) ? f.length > 0 : f !== 'all' && f !== 'relevance' && f !== 'desc').length} filter{Object.values(filters).filter(f => Array.isArray(f) ? f.length > 0 : f !== 'all' && f !== 'relevance' && f !== 'desc').length !== 1 ? 's' : ''} active
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-black dark:text-black hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="space-y-6">
          {displayResults.length === 0 && query && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-black dark:text-black mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black dark:text-black mb-2">
                No results found
              </h3>
              <p className="text-black dark:text-black mb-4">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={clearFilters}
                className="text-black dark:text-black hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {displayResults.length === 0 && !query && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-black dark:text-black mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black dark:text-black mb-2">
                Start searching your wisdom
              </h3>
              <p className="text-black dark:text-black">
                Enter a search term to find insights across all your content
              </p>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {displayResults.map((result) => {
                const Icon = getTypeIcon(result.type);
                const color = getTypeColor(result.type);
                
                return (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-black dark:text-black">
                              {result.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-black dark:text-black">
                              <span className="capitalize">
                                {contentTypes.find(t => t.id === result.type)?.label}
                              </span>
                              <span>•</span>
                              <Clock className="w-4 h-4" />
                              <span>{format(result.date, 'MMM dd, yyyy')}</span>
                              {result.category && (
                                <>
                                  <span>•</span>
                                  <Tag className="w-4 h-4" />
                                  <span className="capitalize">{result.category}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {query && result.relevance > 0 && (
                              <span className="text-xs text-black dark:text-black bg-purple-100 dark:bg-purple-900/20 px-2 py-1 rounded">
                                {Math.round(result.relevance * 10) / 10}% match
                              </span>
                            )}
                            <Link
                              href={result.url}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-black" />
                            </Link>
                          </div>
                        </div>
                        <p className="text-black dark:text-black mb-3">
                          {result.excerpt}
                        </p>
                        {result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {result.tags.slice(0, 5).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-black dark:text-black px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 5 && (
                              <span className="text-xs text-black dark:text-black">
                                +{result.tags.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayResults.map((result) => {
                const Icon = getTypeIcon(result.type);
                const color = getTypeColor(result.type);
                
                return (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-black dark:text-black truncate">
                          {result.title}
                        </h3>
                        <p className="text-sm text-black dark:text-black">
                          {format(result.date, 'MMM dd')}
                        </p>
                      </div>
                      <Link
                        href={result.url}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-black" />
                      </Link>
                    </div>
                    <p className="text-sm text-black dark:text-black mb-3 line-clamp-3">
                      {result.excerpt}
                    </p>
                    {result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-black dark:text-black px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}