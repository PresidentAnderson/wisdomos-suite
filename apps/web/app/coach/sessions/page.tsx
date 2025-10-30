"use client";

import SessionHistory from "@/components/coach/SessionHistory";

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-phoenix-orange to-phoenix-gold bg-clip-text text-transparent">
            Session History
          </h1>
          <p className="text-gray-600">
            Browse and search through your coaching sessions
          </p>
        </div>

        <SessionHistory />
      </div>
    </div>
  );
}
