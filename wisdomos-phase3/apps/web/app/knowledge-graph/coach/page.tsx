"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import KnowledgeGraph3D from "@/components/knowledge-graph/KnowledgeGraph3D";
import GraphControls from "@/components/knowledge-graph/GraphControls";
import ThemesPanel from "@/components/knowledge-graph/ThemesPanel";
import { Brain, ArrowLeft } from "lucide-react";

export default function CoachKnowledgeGraphPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [clusters, setClusters] = useState<any[]>([]);
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const [is2D, setIs2D] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (storedUserId) {
      setUserId(storedUserId);
      loadClusters();
    }
  }, []);

  const loadClusters = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
      const response = await fetch("/api/knowledge-graph/cluster-tags?graphType=coach", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClusters(data.clusters || []);
      }
    } catch (err) {
      console.error("Failed to load clusters:", err);
    }
  };

  const handleRegenerateThemes = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
      const response = await fetch("/api/knowledge-graph/cluster-tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          graphType: "coach",
          forceRefresh: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClusters(data.clusters || []);
        alert("Themes regenerated successfully!");
      } else {
        throw new Error("Failed to regenerate themes");
      }
    } catch (err: any) {
      console.error("Error regenerating themes:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
      const response = await fetch("/api/knowledge-graph/export?graphType=coach", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `coach-sessions-graph-${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export graph");
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
      const response = await fetch("/api/knowledge-graph/import?merge=merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Import successful! ${result.stats.clustersImported} clusters imported.`);
        loadClusters();
      } else {
        throw new Error("Import failed");
      }
    } catch (err: any) {
      console.error("Import error:", err);
      alert(`Import failed: ${err.message}`);
    }
  };

  const handleClusterClick = (clusterId: string) => {
    setFocusedNode(clusterId);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Coach Sessions Knowledge Graph
                </h1>
                <p className="text-gray-600">
                  Visualize insights and patterns from your coaching journey
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GraphControls
              graphType="coach"
              onRegenerateThemes={handleRegenerateThemes}
              onExport={handleExport}
              onImport={handleImport}
              onToggle2D={() => setIs2D(!is2D)}
              is2D={is2D}
              onSearch={(query) => console.log("Search:", query)}
              loading={loading}
            />

            <div className="mt-6">
              <ThemesPanel
                clusters={clusters}
                onClusterClick={handleClusterClick}
                onClusterHover={(id) => setFocusedNode(id)}
              />
            </div>
          </motion.div>

          {/* Main Graph Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-purple-200 overflow-hidden"
            style={{ height: "calc(100vh - 200px)" }}
          >
            <KnowledgeGraph3D
              graphType="coach"
              userId={userId}
              focusNode={focusedNode}
              onNodeClick={(node) => console.log("Node clicked:", node)}
              onNodeHover={(node) => console.log("Node hover:", node)}
              show2D={is2D}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
