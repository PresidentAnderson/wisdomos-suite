'use client';

import Link from 'next/link';
import { useState } from 'react';

function yearsAround(center: number, span = 60) {
  const arr: number[] = [];
  for (let y = center - span; y <= center + span; y++) arr.push(y);
  return arr;
}

export default function AutobiographyIndex() {
  const now = new Date();
  const thisYear = now.getFullYear();
  const [centerYear, setCenterYear] = useState(thisYear);
  const years = yearsAround(centerYear, 60);

  // Group years by decade for better visualization
  const decades: { [key: string]: number[] } = {};
  years.forEach(year => {
    const decade = Math.floor(year / 10) * 10;
    if (!decades[decade]) decades[decade] = [];
    decades[decade].push(year);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              WisdomOS
            </Link>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-white/70 hover:text-white">Dashboard</Link>
              <Link href="/journal" className="text-white/70 hover:text-white">Journal</Link>
              <Link href="/goals" className="text-white/70 hover:text-white">Goals</Link>
              <Link href="/autobiography" className="text-cyan-400">Autobiography</Link>
              <Link href="/library" className="text-white/70 hover:text-white">Library</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Autobiography</h1>
          <p className="text-gray-300 text-lg mb-2">
            Year-by-year pages for your learning & completions
          </p>
          <p className="text-gray-400 text-sm">
            Capture each year\'s narrative, identify earliest similar occurrences, 
            recognize what you made it mean then, and declare your new commitment now.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Navigate to Year</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCenterYear(centerYear - 10)}
                className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30"
              >
                ← Previous Decade
              </button>
              <button
                onClick={() => setCenterYear(thisYear)}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30"
              >
                Current Year
              </button>
              <button
                onClick={() => setCenterYear(centerYear + 10)}
                className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30"
              >
                Next Decade →
              </button>
            </div>
          </div>

          {/* Year Input */}
          <div className="flex items-center space-x-4 mb-6">
            <input
              type="number"
              value={centerYear}
              onChange={(e) => setCenterYear(parseInt(e.target.value) || thisYear)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white w-32"
              placeholder="Year"
            />
            <Link href={`/autobiography/${centerYear}`}>
              <button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-purple-600">
                Go to {centerYear}
              </button>
            </Link>
          </div>
        </div>

        {/* Years Grid by Decade */}
        <div className="space-y-6">
          {Object.entries(decades).map(([decade, decadeYears]) => (
            <div key={decade} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">{decade}s</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {decadeYears.map(year => {
                  const isCurrent = year === thisYear;
                  const isFuture = year > thisYear;
                  const isPast = year < thisYear;
                  
                  return (
                    <Link
                      key={year}
                      href={`/autobiography/${year}`}
                      className={`
                        px-3 py-2 rounded-lg text-center transition-all
                        ${isCurrent 
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold' 
                          : isFuture
                          ? 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 border border-yellow-500/30'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }
                      `}
                    >
                      {year}
                      {isCurrent && <div className="text-xs">Now</div>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-semibold text-white mb-4">How to Use Your Autobiography</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold text-cyan-400 mb-2">📝 For Each Year</h4>
              <ul className="space-y-1 text-sm">
                <li>• Record significant events and experiences</li>
                <li>• Identify patterns and recurring themes</li>
                <li>• Link to relevant life areas</li>
                <li>• Tag people, places, and contexts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">🔍 Reflection Process</h4>
              <ul className="space-y-1 text-sm">
                <li>• Find the earliest similar occurrence</li>
                <li>• Recognize what you made it mean then</li>
                <li>• Acknowledge your intelligent response</li>
                <li>• Declare your new commitment now</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}