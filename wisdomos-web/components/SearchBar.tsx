'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: string
  id: string
  title: string
  description: string
  date: string
  url: string
  completed?: boolean
  year?: number
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        performSearch()
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  const performSearch = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setIsOpen(data.results.length > 0)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      journal: '📝',
      contact: '👤',
      goal: '🎯',
      contribution: '💎',
      autobiography: '📖'
    }
    return icons[type] || '📄'
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything..."
          className="w-full px-4 py-2 pl-10 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          🔍
        </div>
        {loading && (
          <div className="absolute right-3 top-2.5 text-gray-400">
            <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">{getTypeIcon(result.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium truncate">{result.title}</h4>
                    {result.completed && (
                      <span className="text-green-400 text-xs">✓ Completed</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm truncate">{result.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 capitalize">{result.type}</span>
                    {result.year && (
                      <span className="text-xs text-gray-500">• Year {result.year}</span>
                    )}
                    <span className="text-xs text-gray-500">
                      • {new Date(result.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}