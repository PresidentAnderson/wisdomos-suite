'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Save, X } from 'lucide-react'
import { Dimension } from '@/types/fulfillment-v5'

interface DimensionTableProps {
  dimensions: Dimension[]
  onMetricUpdate?: (dimensionName: string, metric: number) => void
}

export default function DimensionTable({ dimensions, onMetricUpdate }: DimensionTableProps) {
  const [editingDimension, setEditingDimension] = useState<string | null>(null)
  const [editMetric, setEditMetric] = useState<number>(0)

  const startEdit = (dimension: Dimension) => {
    setEditingDimension(dimension.name)
    setEditMetric(dimension.metric || 0)
  }

  const saveMetric = (dimensionName: string) => {
    onMetricUpdate?.(dimensionName, editMetric)
    setEditingDimension(null)
  }

  const cancelEdit = () => {
    setEditingDimension(null)
    setEditMetric(0)
  }

  const getMetricColor = (metric?: number) => {
    if (!metric) return 'bg-gray-100 text-gray-400'
    if (metric >= 4) return 'bg-green-100 text-green-800'
    if (metric >= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Dimension</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Focus</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Key Inquiry</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Practices</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Metric (1-5)</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Notes</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map((dim, idx) => (
              <motion.tr
                key={dim.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-gray-200 hover:bg-white transition-colors"
              >
                {/* Dimension Name */}
                <td className="px-4 py-4">
                  <span className="font-semibold text-black">{dim.name}</span>
                </td>

                {/* Focus */}
                <td className="px-4 py-4 text-gray-700">{dim.focus}</td>

                {/* Inquiry */}
                <td className="px-4 py-4 text-gray-600 italic">{dim.inquiry}</td>

                {/* Practices */}
                <td className="px-4 py-4">
                  <ul className="space-y-1">
                    {dim.practices.map((practice, pidx) => (
                      <li key={pidx} className="text-xs text-gray-600">
                        • {practice}
                      </li>
                    ))}
                  </ul>
                </td>

                {/* Metric */}
                <td className="px-4 py-4">
                  {editingDimension === dim.name ? (
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editMetric}
                        onChange={(e) => setEditMetric(Number(e.target.value))}
                        className="w-16 px-2 py-1 border rounded text-center"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold text-center ${getMetricColor(dim.metric)}`}
                      >
                        {dim.metric || '-'}
                      </span>
                    </div>
                  )}
                </td>

                {/* Notes */}
                <td className="px-4 py-4 text-xs text-gray-500">{dim.notes || '-'}</td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex justify-center gap-2">
                    {editingDimension === dim.name ? (
                      <>
                        <button
                          onClick={() => saveMetric(dim.name)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(dim)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit metric"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
