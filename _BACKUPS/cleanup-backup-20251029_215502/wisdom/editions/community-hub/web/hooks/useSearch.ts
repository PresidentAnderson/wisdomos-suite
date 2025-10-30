import React, { useState, useMemo, useCallback } from 'react';

interface SearchableItem {
  id: string;
  title: string;
  content?: string;
  tags?: string[];
  category?: string;
  type?: string;
  [key: string]: any;
}

interface SearchOptions {
  fuzzyThreshold?: number;
  includeScore?: boolean;
  searchFields?: string[];
  filterBy?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult<T> {
  item: T;
  score: number;
  matches: SearchMatch[];
}

interface SearchMatch {
  field: string;
  value: string;
  indices: number[][];
}

export function useSearch<T extends SearchableItem>(
  items: T[],
  options: SearchOptions = {}
) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const {
    fuzzyThreshold = 0.6,
    includeScore = false,
    searchFields = ['title', 'content', 'tags'],
    filterBy = {},
    sortBy = 'score',
    sortOrder = 'desc'
  } = options;

  // Fuzzy search algorithm
  const fuzzyMatch = useCallback((text: string, pattern: string): { score: number; indices: number[][] } => {
    if (!pattern) return { score: 1, indices: [] };
    if (!text) return { score: 0, indices: [] };

    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();

    // Exact match gets highest score
    if (textLower.includes(patternLower)) {
      const startIndex = textLower.indexOf(patternLower);
      return {
        score: 1,
        indices: [[startIndex, startIndex + patternLower.length - 1]]
      };
    }

    // Character-by-character fuzzy matching
    let patternIndex = 0;
    let score = 0;
    let consecutiveMatches = 0;
    const indices: number[][] = [];
    let currentMatch: number[] | null = null;

    for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
      if (textLower[i] === patternLower[patternIndex]) {
        if (!currentMatch) {
          currentMatch = [i, i];
        } else {
          currentMatch[1] = i;
        }
        
        patternIndex++;
        consecutiveMatches++;
        
        // Bonus for consecutive matches
        score += consecutiveMatches > 1 ? 2 : 1;
      } else {
        if (currentMatch) {
          indices.push([...currentMatch]);
          currentMatch = null;
        }
        consecutiveMatches = 0;
      }
    }

    if (currentMatch) {
      indices.push(currentMatch);
    }

    // Calculate final score
    const matchRatio = patternIndex / patternLower.length;
    const lengthRatio = patternLower.length / textLower.length;
    const finalScore = (score / patternLower.length) * matchRatio * lengthRatio;

    return {
      score: Math.min(finalScore, 1),
      indices
    };
  }, []);

  // Advanced search with filters and sorting
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      let filtered = [...items];
      
      // Apply filters
      Object.entries(filterBy).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filtered = filtered.filter(item => {
            const itemValue = item[key];
            if (Array.isArray(itemValue)) {
              return itemValue.includes(value);
            }
            return itemValue === value;
          });
        }
      });

      return filtered.map(item => ({
        item,
        score: 1,
        matches: []
      }));
    }

    setIsSearching(true);
    
    const results: SearchResult<T>[] = [];
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

    items.forEach(item => {
      // Apply filters first
      const passesFilter = Object.entries(filterBy).every(([key, value]) => {
        if (value === undefined || value === null || value === '') return true;
        const itemValue = item[key];
        if (Array.isArray(itemValue)) {
          return itemValue.includes(value);
        }
        return itemValue === value;
      });

      if (!passesFilter) return;

      let totalScore = 0;
      let totalMatches = 0;
      const allMatches: SearchMatch[] = [];

      // Search across specified fields
      searchFields.forEach(field => {
        const fieldValue = item[field];
        if (!fieldValue) return;

        let fieldText = '';
        if (Array.isArray(fieldValue)) {
          fieldText = fieldValue.join(' ');
        } else if (typeof fieldValue === 'string') {
          fieldText = fieldValue;
        } else {
          fieldText = String(fieldValue);
        }

        // Score each query term
        queryTerms.forEach(term => {
          const match = fuzzyMatch(fieldText, term);
          if (match.score >= fuzzyThreshold) {
            totalScore += match.score;
            totalMatches++;
            
            if (match.indices.length > 0) {
              allMatches.push({
                field,
                value: fieldText,
                indices: match.indices
              });
            }
          }
        });
      });

      // Only include items that match at least one term
      if (totalMatches > 0) {
        const averageScore = totalScore / Math.max(totalMatches, 1);
        const queryTermScore = totalMatches / queryTerms.length; // Bonus for matching more terms
        const finalScore = (averageScore + queryTermScore) / 2;

        results.push({
          item,
          score: finalScore,
          matches: allMatches
        });
      }
    });

    // Sort results
    results.sort((a, b) => {
      if (sortBy === 'score') {
        return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
      } else if (sortBy && sortBy in a.item && sortBy in b.item) {
        const aValue = a.item[sortBy];
        const bValue = b.item[sortBy];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortOrder === 'desc' ? -comparison : comparison;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        }
      }
      
      return 0;
    });

    setTimeout(() => setIsSearching(false), 100);
    return results;
  }, [query, items, filterBy, searchFields, fuzzyThreshold, sortBy, sortOrder, fuzzyMatch]);

  // Highlight matches in text
  const highlightMatches = useCallback((text: string, matches: SearchMatch[], field: string) => {
    const fieldMatches = matches.filter(match => match.field === field);
    if (fieldMatches.length === 0) return text;

    const allIndices = fieldMatches.flatMap(match => match.indices);
    allIndices.sort((a, b) => a[0] - b[0]);

    let result = '';
    let lastIndex = 0;

    allIndices.forEach(([start, end]) => {
      // Add text before match
      result += text.slice(lastIndex, start);
      
      // Add highlighted match
      result += `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded">${text.slice(start, end + 1)}</mark>`;
      
      lastIndex = end + 1;
    });

    // Add remaining text
    result += text.slice(lastIndex);
    return result;
  }, []);

  // Search suggestions based on existing data
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];

    const suggestionSet = new Set<string>();

    // Add suggestions from all searchable fields
    items.forEach(item => {
      searchFields.forEach(field => {
        const value = item[field];
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => {
              if (typeof v === 'string' && v.toLowerCase().includes(query.toLowerCase())) {
                suggestionSet.add(v);
              }
            });
          } else if (typeof value === 'string') {
            const words = value.split(' ').filter(word => 
              word.length > 2 && word.toLowerCase().startsWith(query.toLowerCase())
            );
            words.forEach(word => suggestionSet.add(word));
          }
        }
      });
    });

    return Array.from(suggestionSet).slice(0, 5);
  }, [query, items, searchFields]);

  // Search statistics
  const stats = useMemo(() => ({
    totalItems: items.length,
    filteredItems: searchResults.length,
    hasQuery: query.trim().length > 0,
    queryTerms: query.trim() ? query.toLowerCase().split(' ').filter(t => t.length > 0) : [],
    averageScore: searchResults.length > 0 
      ? searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length 
      : 0
  }), [items.length, searchResults, query]);

  return {
    query,
    setQuery,
    results: includeScore ? searchResults : searchResults.map(r => r.item),
    searchResults: includeScore ? searchResults : undefined,
    isSearching,
    suggestions,
    stats,
    highlightMatches,
    clearSearch: () => setQuery(''),
    hasResults: searchResults.length > 0
  };
}

// Hook for debounced search
export function useDebouncedSearch<T extends SearchableItem>(
  items: T[],
  options: SearchOptions & { debounceMs?: number } = {}
) {
  const { debounceMs = 300, ...searchOptions } = options;
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [inputQuery, setInputQuery] = useState('');

  // Debounce the query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputQuery, debounceMs]);

  const searchResults = useSearch(items, { ...searchOptions });

  // Override query management
  React.useEffect(() => {
    searchResults.setQuery(debouncedQuery);
  }, [debouncedQuery]);

  return {
    ...searchResults,
    query: inputQuery,
    setQuery: setInputQuery,
    isDebouncing: inputQuery !== debouncedQuery
  };
}