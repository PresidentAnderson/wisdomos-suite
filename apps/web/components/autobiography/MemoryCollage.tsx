// components/autobiography/MemoryCollage.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Plus, Camera, Play, FileText, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Memory {
  id: string;
  type: "photo" | "video" | "note";
  url?: string;
  thumbnail?: string;
  caption?: string;
  date?: string;
  tags?: string[];
}

interface MemoryCollageProps {
  memories: Memory[];
  onAddMemory?: () => void;
  onMemoryClick?: (memory: Memory) => void;
  maxDisplay?: number;
  className?: string;
}

export default function MemoryCollage({
  memories = [],
  onAddMemory,
  onMemoryClick,
  maxDisplay = 6,
  className,
}: MemoryCollageProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lightboxMemory, setLightboxMemory] = useState<Memory | null>(null);

  const displayMemories = memories.slice(0, maxDisplay);
  const hasMore = memories.length > maxDisplay;

  const handleMemoryClick = (memory: Memory) => {
    setLightboxMemory(memory);
    onMemoryClick?.(memory);
  };

  const closeLightbox = () => {
    setLightboxMemory(null);
  };

  // Masonry-style layout classes based on index
  const getMasonryClass = (index: number) => {
    const patterns = [
      "col-span-2 row-span-2", // Large square
      "col-span-1 row-span-1", // Small square
      "col-span-1 row-span-2", // Tall rectangle
      "col-span-2 row-span-1", // Wide rectangle
      "col-span-1 row-span-1", // Small square
      "col-span-1 row-span-1", // Small square
    ];
    return patterns[index % patterns.length];
  };

  const getMemoryIcon = (type: Memory["type"]) => {
    switch (type) {
      case "video":
        return <Play className="w-6 h-6" />;
      case "note":
        return <FileText className="w-6 h-6" />;
      default:
        return <Camera className="w-6 h-6" />;
    }
  };

  if (memories.length === 0) {
    // Empty state
    return (
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/30",
          className
        )}
      >
        <button
          onClick={onAddMemory}
          className="flex flex-col items-center gap-3 w-full"
        >
          <div className="rounded-full bg-indigo-100 p-4">
            <Plus className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-700">Add Your First Memory</p>
            <p className="text-sm text-gray-500 mt-1">
              Photos, videos, or notes from this year
            </p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Masonry Grid */}
      <div
        className={cn(
          "grid grid-cols-4 auto-rows-[100px] gap-2",
          className
        )}
      >
        {displayMemories.map((memory, index) => (
          <div
            key={memory.id}
            className={cn(
              "relative group cursor-pointer overflow-hidden rounded-lg transition-all duration-300",
              getMasonryClass(index),
              hoveredIndex === index && "ring-2 ring-indigo-500 shadow-xl z-10"
            )}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleMemoryClick(memory)}
          >
            {/* Memory Content */}
            {memory.type === "photo" && memory.url && (
              <Image
                src={memory.url}
                alt={memory.caption || "Memory"}
                fill
                className={cn(
                  "object-cover transition-transform duration-500",
                  hoveredIndex === index && "scale-110"
                )}
              />
            )}

            {memory.type === "video" && memory.thumbnail && (
              <>
                <Image
                  src={memory.thumbnail}
                  alt={memory.caption || "Video"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="rounded-full bg-white/90 p-3">
                    <Play className="w-6 h-6 text-gray-800 fill-gray-800" />
                  </div>
                </div>
              </>
            )}

            {memory.type === "note" && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-50 p-4 flex flex-col">
                <FileText className="w-6 h-6 text-amber-600 mb-2" />
                <p className="text-sm text-gray-700 line-clamp-3">
                  {memory.caption || "Note"}
                </p>
              </div>
            )}

            {/* Overlay on Hover */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
              )}
            >
              {memory.caption && (
                <p className="text-white text-sm font-medium line-clamp-2">
                  {memory.caption}
                </p>
              )}
              {memory.date && (
                <p className="text-white/70 text-xs mt-1">{memory.date}</p>
              )}
              <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Memory Type Badge */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="rounded-full bg-black/50 backdrop-blur-sm px-2 py-1 flex items-center gap-1">
                {getMemoryIcon(memory.type)}
              </div>
            </div>
          </div>
        ))}

        {/* Add More Button */}
        {onAddMemory && (
          <div
            className={cn(
              "relative group cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 transition-all hover:border-indigo-400 hover:bg-indigo-50/30",
              "col-span-1 row-span-1"
            )}
            onClick={onAddMemory}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-indigo-100 p-2 group-hover:bg-indigo-200 transition-colors">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs text-gray-600 font-medium">
                Add More
              </span>
            </div>
          </div>
        )}

        {/* More Indicator */}
        {hasMore && (
          <div
            className={cn(
              "relative rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow",
              "col-span-1 row-span-1"
            )}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">+{memories.length - maxDisplay}</p>
              <p className="text-xs opacity-90">more</p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxMemory && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div
            className="relative max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Content */}
            {lightboxMemory.type === "photo" && lightboxMemory.url && (
              <div className="relative w-full h-[70vh]">
                <Image
                  src={lightboxMemory.url}
                  alt={lightboxMemory.caption || "Memory"}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {lightboxMemory.type === "video" && lightboxMemory.url && (
              <video
                src={lightboxMemory.url}
                controls
                className="w-full max-h-[70vh]"
              >
                Your browser does not support video playback.
              </video>
            )}

            {lightboxMemory.type === "note" && (
              <div className="p-8 bg-gradient-to-br from-amber-50 to-amber-100 min-h-[400px]">
                <FileText className="w-12 h-12 text-amber-600 mb-4" />
                <p className="text-gray-800 text-lg whitespace-pre-wrap">
                  {lightboxMemory.caption}
                </p>
              </div>
            )}

            {/* Lightbox Footer */}
            {(lightboxMemory.caption || lightboxMemory.date || lightboxMemory.tags) && (
              <div className="bg-white border-t border-gray-200 p-6">
                {lightboxMemory.caption && (
                  <p className="text-gray-800 font-medium mb-2">
                    {lightboxMemory.caption}
                  </p>
                )}
                {lightboxMemory.date && (
                  <p className="text-gray-500 text-sm mb-3">
                    {lightboxMemory.date}
                  </p>
                )}
                {lightboxMemory.tags && lightboxMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {lightboxMemory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
