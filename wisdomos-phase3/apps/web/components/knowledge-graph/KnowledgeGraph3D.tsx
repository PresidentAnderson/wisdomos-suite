"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading 3D Graph...</div>,
});

interface GraphNode {
  id: string;
  name: string;
  type: "tag" | "cluster" | "event";
  color: string;
  size: number;
  cluster?: string;
  count?: number;
  summary?: string;
  metadata?: any;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface KnowledgeGraph3DProps {
  graphType: "autobiography" | "coach";
  userId: string;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  focusNode?: string | null;
  showClusters?: boolean;
  show2D?: boolean;
}

export default function KnowledgeGraph3D({
  graphType,
  userId,
  onNodeClick,
  onNodeHover,
  focusNode,
  showClusters = true,
  show2D = false,
}: KnowledgeGraph3DProps) {
  const fgRef = useRef<any>();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Fetch graph data from API
  useEffect(() => {
    loadGraphData();
  }, [graphType, userId]);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch clusters
      const clustersRes = await fetch(
        `/api/knowledge-graph/cluster-tags?graphType=${graphType}`,
        {
          headers: {
            Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("authToken") : ""}`,
          },
        }
      );

      if (!clustersRes.ok) {
        throw new Error("Failed to load clusters");
      }

      const clustersData = await clustersRes.json();

      // Fetch relationships
      const relationshipsRes = await fetch(
        `/api/knowledge-graph/relationships?graphType=${graphType}`,
        {
          headers: {
            Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("authToken") : ""}`,
          },
        }
      );

      const relationshipsData = relationshipsRes.ok
        ? await relationshipsRes.json()
        : { relationships: [] };

      // Build graph nodes
      const nodes: GraphNode[] = [];
      const nodeMap = new Map<string, GraphNode>();

      // Add cluster nodes (larger bubbles)
      if (showClusters && clustersData.clusters) {
        clustersData.clusters.forEach((cluster: any) => {
          const node: GraphNode = {
            id: cluster.id,
            name: cluster.name,
            type: "cluster",
            color: cluster.color,
            size: Math.max(15, cluster.eventCount * 2),
            cluster: cluster.id,
            count: cluster.eventCount,
            summary: cluster.summary,
            metadata: cluster,
          };
          nodes.push(node);
          nodeMap.set(node.id, node);

          // Add tag nodes for each cluster
          cluster.tags.forEach((tag: string, index: number) => {
            const tagNodeId = `${cluster.id}-tag-${tag}`;
            const tagNode: GraphNode = {
              id: tagNodeId,
              name: tag,
              type: "tag",
              color: adjustColor(cluster.color, 0.3),
              size: 5,
              cluster: cluster.id,
              metadata: { clusterName: cluster.name },
            };
            nodes.push(tagNode);
            nodeMap.set(tagNodeId, tagNode);
          });
        });
      }

      // Build graph links
      const links: GraphLink[] = [];

      // Add cluster-to-tag links
      if (showClusters && clustersData.clusters) {
        clustersData.clusters.forEach((cluster: any) => {
          cluster.tags.forEach((tag: string) => {
            const tagNodeId = `${cluster.id}-tag-${tag}`;
            links.push({
              source: cluster.id,
              target: tagNodeId,
              strength: 0.8,
              type: "hierarchical",
            });
          });
        });
      }

      // Add tag-to-tag relationships
      if (relationshipsData.relationships) {
        relationshipsData.relationships.forEach((rel: any) => {
          // Find nodes with matching tag names
          const sourceNodes = nodes.filter((n) => n.name === rel.sourceTag);
          const targetNodes = nodes.filter((n) => n.name === rel.targetTag);

          sourceNodes.forEach((src) => {
            targetNodes.forEach((tgt) => {
              if (src.id !== tgt.id) {
                links.push({
                  source: src.id,
                  target: tgt.id,
                  strength: rel.strength,
                  type: rel.relationshipType,
                });
              }
            });
          });
        });
      }

      setGraphData({ nodes, links });
    } catch (err: any) {
      console.error("Error loading graph data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Focus on specific node
  useEffect(() => {
    if (focusNode && fgRef.current) {
      const node = graphData.nodes.find((n) => n.id === focusNode);
      if (node) {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(4, 1000);
      }
    }
  }, [focusNode, graphData]);

  // Handle node click
  const handleNodeClick = useCallback(
    (node: any) => {
      if (onNodeClick) {
        onNodeClick(node as GraphNode);
      }

      // Focus camera on clicked node
      if (fgRef.current) {
        const distance = 100;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          node,
          1000
        );
      }
    },
    [onNodeClick]
  );

  // Handle node hover
  const handleNodeHover = useCallback(
    (node: any) => {
      setHoveredNode(node);
      if (onNodeHover) {
        onNodeHover(node as GraphNode);
      }
    },
    [onNodeHover]
  );

  // Double-click to reset camera
  const handleBackgroundClick = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000, 50);
    }
  }, []);

  // Custom node rendering
  const nodeThreeObject = useCallback((node: any) => {
    const nodeObj = node as GraphNode;

    // Import THREE dynamically
    if (typeof window === "undefined") return null;

    const THREE = require("three");

    // Different shapes based on type
    let geometry;
    if (nodeObj.type === "cluster") {
      geometry = new THREE.SphereGeometry(nodeObj.size, 32, 32);
    } else if (nodeObj.type === "tag") {
      geometry = new THREE.SphereGeometry(nodeObj.size, 16, 16);
    } else {
      geometry = new THREE.BoxGeometry(nodeObj.size, nodeObj.size, nodeObj.size);
    }

    const material = new THREE.MeshLambertMaterial({
      color: nodeObj.color,
      transparent: true,
      opacity: 0.8,
    });

    return new THREE.Mesh(geometry, material);
  }, []);

  // Custom link rendering
  const linkColor = useCallback((link: any) => {
    const linkObj = link as GraphLink;
    return linkObj.type === "hierarchical" ? "#FF6B35" : "#6366F1";
  }, []);

  const linkWidth = useCallback((link: any) => {
    const linkObj = link as GraphLink;
    return linkObj.type === "hierarchical" ? 2 : linkObj.strength * 1.5;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 border-4 border-phoenix-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Loading knowledge graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-red-600">Error loading graph: {error}</p>
        <button
          onClick={loadGraphData}
          className="px-4 py-2 bg-phoenix-orange text-white rounded-lg hover:bg-phoenix-red transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-gray-600">No data available for this knowledge graph.</p>
        <p className="text-sm text-gray-500">
          Add some {graphType === "autobiography" ? "autobiography entries" : "coaching sessions"} to see your graph!
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node: any) => `
          <div class="bg-black/80 text-white px-3 py-2 rounded-lg">
            <div class="font-bold">${node.name}</div>
            ${node.summary ? `<div class="text-xs mt-1">${node.summary}</div>` : ""}
            ${node.count ? `<div class="text-xs text-gray-300">${node.count} events</div>` : ""}
          </div>
        `}
        nodeThreeObject={nodeThreeObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundDoubleClick={handleBackgroundClick}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        enableNodeDrag={true}
        enableNavigationControls={true}
        showNavInfo={false}
        backgroundColor="#f9fafb"
      />

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-4 bg-white rounded-xl shadow-xl border border-phoenix-gold/20 p-4 max-w-xs"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: hoveredNode.color }}
              />
              <div>
                <h3 className="font-bold text-gray-900">{hoveredNode.name}</h3>
                <p className="text-xs text-gray-600 capitalize">{hoveredNode.type}</p>
                {hoveredNode.summary && (
                  <p className="text-sm text-gray-700 mt-2">{hoveredNode.summary}</p>
                )}
                {hoveredNode.count && (
                  <p className="text-xs text-phoenix-orange mt-1 font-medium">
                    {hoveredNode.count} events
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg text-xs space-y-1">
        <p>🖱️ Click node to focus</p>
        <p>🖱️ Double-click background to reset</p>
        <p>🖱️ Drag to rotate | Scroll to zoom</p>
      </div>
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
