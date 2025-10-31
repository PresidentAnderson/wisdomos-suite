"use client"

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon?: string | null;
}

interface FilterValues {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface ServiceFiltersProps {
  categories: Category[];
  currentFilters: FilterValues;
}

export default function ServiceFilters({ categories, currentFilters }: ServiceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    query: currentFilters.query || '',
    categoryId: currentFilters.categoryId || '',
    minPrice: currentFilters.minPrice?.toString() || '',
    maxPrice: currentFilters.maxPrice?.toString() || '',
  });

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // Build URL with new filters
    const params = new URLSearchParams();
    if (updated.query) params.set('query', updated.query);
    if (updated.categoryId) params.set('categoryId', updated.categoryId);
    if (updated.minPrice) params.set('minPrice', updated.minPrice);
    if (updated.maxPrice) params.set('maxPrice', updated.maxPrice);

    // Preserve sort order
    const sortBy = searchParams.get('sortBy');
    if (sortBy) params.set('sortBy', sortBy);

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`/marketplace/services?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
    });
    router.push('/marketplace/services');
  };

  const hasActiveFilters = filters.query || filters.categoryId || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilters({ query: filters.query });
            }
          }}
          placeholder="Search offerings..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        {filters.query && (
          <button
            onClick={() => updateFilters({ query: '' })}
            className="text-sm text-orange-600 hover:text-orange-700 mt-1"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={filters.categoryId}
          onChange={(e) => updateFilters({ categoryId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="Min"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder="Max"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        {(filters.minPrice || filters.maxPrice) && (
          <button
            onClick={() => updateFilters({ minPrice: '', maxPrice: '' })}
            className="text-sm text-orange-600 hover:text-orange-700 mt-1"
          >
            Clear price range
          </button>
        )}
      </div>

      {/* Apply Filters Button */}
      <Button
        onClick={() => updateFilters(filters)}
        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
      >
        Apply Filters
      </Button>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
