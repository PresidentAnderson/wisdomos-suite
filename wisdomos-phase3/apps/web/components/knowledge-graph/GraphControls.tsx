"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Filter,
  Play,
  Sparkles,
} from "lucide-react";

interface GraphControlsProps {
  graphType: "autobiography" | "coach";
  onRegenerateThemes: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onToggle2D: () => void;
  is2D: boolean;
  onSearch: (query: string) => void;
  onStartReplay?: () => void;
  loading?: boolean;
}

export default function GraphControls({
  graphType,
  onRegenerateThemes,
  onExport,
  onImport,
  onToggle2D,
  is2D,
  onSearch,
  onStartReplay,
  loading = false,
}: GraphControlsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-phoenix-gold/20 p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search tags, clusters..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-phoenix-orange"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onRegenerateThemes}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-phoenix-orange to-phoenix-red text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">Regenerate Themes</span>
        </button>

        <button
          onClick={onToggle2D}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-phoenix-orange text-phoenix-orange rounded-lg hover:bg-phoenix-orange/10 transition-all"
        >
          {is2D ? (
            <Maximize2 className="w-4 h-4" />
          ) : (
            <Minimize2 className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{is2D ? "3D" : "2D"} View</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Export</span>
        </button>

        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">Import</span>
          <input
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {onStartReplay && (
          <button
            onClick={onStartReplay}
            className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Session Replay</span>
          </button>
        )}
      </div>

      {/* Graph Type Badge */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-500">Graph Type:</span>
        <span className="px-3 py-1 bg-phoenix-gold/10 text-phoenix-orange rounded-full text-xs font-medium capitalize">
          {graphType}
        </span>
      </div>
    </div>
  );
}
