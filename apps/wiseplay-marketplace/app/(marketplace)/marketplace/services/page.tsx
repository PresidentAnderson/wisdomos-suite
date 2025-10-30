import { Suspense } from 'react';
import { searchServices, getCategories } from '@/lib/marketplace/search';
import ServiceGrid from '@/components/marketplace/ServiceGrid';
import ServiceFilters from '@/components/marketplace/ServiceFilters';
import { Search, SlidersHorizontal } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    query?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
  };
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1');
  const limit = 12;

  // Parse filters from URL
  const filters = {
    query: searchParams.query,
    categoryId: searchParams.categoryId,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    sortBy: (searchParams.sortBy || 'relevance') as 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest',
    page,
    limit,
  };

  // Fetch services and categories in parallel
  const [servicesResult, categories] = await Promise.all([
    searchServices(filters),
    getCategories(),
  ]);

  const { services, total, hasMore } = servicesResult;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Browse Offerings</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Discover authentic partnerships and transformational opportunities from our community
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold">Filters</h2>
                </div>
                <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded" />}>
                  <ServiceFilters
                    categories={categories}
                    currentFilters={filters}
                  />
                </Suspense>
              </div>

              {/* Active Filters Summary */}
              {(filters.query || filters.categoryId || filters.minPrice || filters.maxPrice) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-semibold mb-3">Active Filters</h3>
                  <div className="space-y-2 text-sm">
                    {filters.query && (
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{filters.query}</span>
                      </div>
                    )}
                    {filters.categoryId && (
                      <div className="text-gray-600">
                        Category: {categories.find(c => c.id === filters.categoryId)?.name}
                      </div>
                    )}
                    {(filters.minPrice || filters.maxPrice) && (
                      <div className="text-gray-600">
                        Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {total} {total === 1 ? 'Offering' : 'Offerings'} Found
                </h2>
                {filters.query && (
                  <p className="text-sm text-gray-600 mt-1">
                    Results for "{filters.query}"
                  </p>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                <select
                  defaultValue={filters.sortBy}
                  onChange={(e) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('sortBy', e.target.value);
                    window.location.href = url.toString();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Services Grid */}
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md h-80 animate-pulse" />
                ))}
              </div>
            }>
              <ServiceGrid services={services} />
            </Suspense>

            {/* No Results */}
            {services.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No offerings found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <a
                  href="/marketplace/services"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all"
                >
                  Clear Filters
                </a>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  {/* Previous Button */}
                  {page > 1 && (
                    <a
                      href={`?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </a>
                  )}

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = pageNum === page;

                    // Show first, last, current, and surrounding pages
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <a
                          key={pageNum}
                          href={`?${new URLSearchParams({ ...searchParams, page: String(pageNum) })}`}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            isCurrentPage
                              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </a>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}

                  {/* Next Button */}
                  {page < totalPages && (
                    <a
                      href={`?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </a>
                  )}
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
