'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Home, Settings } from 'lucide-react';

// Test component to verify all imports work
export default function TestComponent() {
  const [count, setCount] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-white rounded-lg shadow"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-black" />
        <Home className="w-6 h-6 text-black" />
        <Settings className="w-6 h-6 text-black" />
      </div>
      <h3 className="text-xl font-bold mb-2">Test Component</h3>
      <p className="text-black mb-4">All imports working correctly!</p>
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-purple-600 text-black rounded hover:bg-purple-700"
      >
        Click count: {count}
      </button>
    </motion.div>
  );
}