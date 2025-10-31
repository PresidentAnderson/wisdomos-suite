"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, TrendingUp } from "lucide-react";

interface Cluster {
  id: string;
  name: string;
  summary: string;
  color: string;
  tags: string[];
  confidence: number;
  eventCount: number;
}

interface ThemesPanelProps {
  clusters: Cluster[];
  onClusterClick: (clusterId: string) => void;
  onClusterHover: (clusterId: string | null) => void;
}

export default function ThemesPanel({
  clusters,
  onClusterClick,
  onClusterHover,
}: ThemesPanelProps) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  if (clusters.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-phoenix-gold/20 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-phoenix-orange" />
          <h3 className="text-xl font-bold text-gray-900">Life Themes</h3>
        </div>
        <p className="text-sm text-gray-600">
          No themes yet. Click "Regenerate Themes" to analyze your data.
        </p>
      </div>
    );
  }

  // Sort clusters by event count
  const sortedClusters = [...clusters].sort((a, b) => b.eventCount - a.eventCount);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-phoenix-gold/20 p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-phoenix-orange" />
        <h3 className="text-xl font-bold text-gray-900">Life Themes</h3>
        <span className="ml-auto text-sm text-gray-500">{clusters.length} themes</span>
      </div>

      <div className="space-y-3">
        {sortedClusters.map((cluster, index) => (
          <motion.div
            key={cluster.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => onClusterHover(cluster.id)}
            onMouseLeave={() => onClusterHover(null)}
            className="group"
          >
            <div
              className="p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md"
              style={{
                borderColor: cluster.color,
                backgroundColor: `${cluster.color}10`,
              }}
              onClick={() => {
                onClusterClick(cluster.id);
                setExpandedCluster(
                  expandedCluster === cluster.id ? null : cluster.id
                );
              }}
            >
              {/* Cluster Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Color Bubble */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: cluster.color }}
                  >
                    {cluster.eventCount}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-phoenix-orange transition-colors">
                      {cluster.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">{cluster.summary}</p>

                    {/* Confidence & Event Count */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3" />
                        <span>{Math.round(cluster.confidence * 100)}% confidence</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {cluster.tags.length} tags
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedCluster === cluster.id ? "rotate-90" : ""
                  }`}
                />
              </div>

              {/* Expanded Tags */}
              <AnimatePresence>
                {expandedCluster === cluster.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-200"
                  >
                    <p className="text-xs text-gray-600 font-medium mb-2">Tags in this theme:</p>
                    <div className="flex flex-wrap gap-2">
                      {cluster.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white rounded-full text-xs capitalize"
                          style={{ color: cluster.color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="pt-4 border-t border-gray-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Events:</span>
          <span className="font-bold text-gray-900">
            {sortedClusters.reduce((sum, c) => sum + c.eventCount, 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Tags:</span>
          <span className="font-bold text-gray-900">
            {sortedClusters.reduce((sum, c) => sum + c.tags.length, 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Avg Confidence:</span>
          <span className="font-bold text-gray-900">
            {Math.round(
              (sortedClusters.reduce((sum, c) => sum + c.confidence, 0) /
                sortedClusters.length) *
                100
            )}
            %
          </span>
        </div>
      </div>
    </div>
  );
}
