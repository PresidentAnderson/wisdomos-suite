'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Sparkles, Zap } from 'lucide-react'

interface LifeArea {
  id: string
  name: string
  color: string
  energy: number
  orbitRadius: number
  angleOffset: number
  connections: string[]
  score: number
}

interface Position {
  x: number
  y: number
}

export default function OrbitalFulfillmentDisplay() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [positions, setPositions] = useState<Record<string, Position>>({})
  const [angle, setAngle] = useState(0)
  const [orbitSpeed, setOrbitSpeed] = useState(0.01)
  const [radiusScale, setRadiusScale] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [draggedArea, setDraggedArea] = useState<string | null>(null)

  const lifeAreas: LifeArea[] = [
    {
      id: 'work',
      name: 'Work & Purpose',
      color: '#FFD23F',
      energy: 0.8,
      orbitRadius: 180,
      angleOffset: 0,
      connections: ['Sarah (Mentor)', 'Team Lead', 'Project Partners'],
      score: 4.2,
    },
    {
      id: 'health',
      name: 'Health',
      color: '#FF5E5B',
      energy: 0.6,
      orbitRadius: 210,
      angleOffset: 1.2,
      connections: ['Dr. Martinez', 'Fitness Coach'],
      score: 3.8,
    },
    {
      id: 'intimacy',
      name: 'Intimacy',
      color: '#E155B0',
      energy: 0.9,
      orbitRadius: 240,
      angleOffset: 2.4,
      connections: ['Partner', 'Close Friends'],
      score: 4.7,
    },
    {
      id: 'finance',
      name: 'Finance',
      color: '#FCA311',
      energy: 0.5,
      orbitRadius: 270,
      angleOffset: 3.6,
      connections: ['Financial Advisor'],
      score: 3.2,
    },
    {
      id: 'spiritual',
      name: 'Spiritual',
      color: '#7209B7',
      energy: 0.7,
      orbitRadius: 300,
      angleOffset: 4.8,
      connections: ['Meditation Group', 'Spiritual Mentor'],
      score: 4.0,
    },
    {
      id: 'creativity',
      name: 'Creativity',
      color: '#00F5FF',
      energy: 0.75,
      orbitRadius: 330,
      angleOffset: 0.6,
      connections: ['Art Community', 'Creative Partner'],
      score: 4.3,
    },
  ]

  // Initialize positions based on orbit
  useEffect(() => {
    const initialPositions: Record<string, Position> = {}
    lifeAreas.forEach((area) => {
      const orbitX = Math.cos(angle + area.angleOffset) * area.orbitRadius * radiusScale
      const orbitY = Math.sin(angle + area.angleOffset) * area.orbitRadius * radiusScale
      initialPositions[area.id] = { x: orbitX, y: orbitY }
    })
    setPositions(initialPositions)
  }, [])

  // Gravity orbit animation
  useEffect(() => {
    if (isPaused || draggedArea) return
    const orbit = setInterval(() => {
      setAngle((a) => (a + orbitSpeed) % (2 * Math.PI))
    }, 30)
    return () => clearInterval(orbit)
  }, [orbitSpeed, isPaused, draggedArea])

  // Update positions based on orbit angle
  useEffect(() => {
    if (draggedArea) return
    setPositions((prev) => {
      const updated: Record<string, Position> = {}
      lifeAreas.forEach((area) => {
        if (!prev[area.id]) {
          const orbitX = Math.cos(angle + area.angleOffset) * area.orbitRadius * radiusScale
          const orbitY = Math.sin(angle + area.angleOffset) * area.orbitRadius * radiusScale
          updated[area.id] = { x: orbitX, y: orbitY }
        } else {
          // Gentle pull back to orbit
          const targetX = Math.cos(angle + area.angleOffset) * area.orbitRadius * radiusScale
          const targetY = Math.sin(angle + area.angleOffset) * area.orbitRadius * radiusScale
          const currentX = prev[area.id].x
          const currentY = prev[area.id].y

          // Smooth interpolation back to orbit
          updated[area.id] = {
            x: currentX + (targetX - currentX) * 0.05,
            y: currentY + (targetY - currentY) * 0.05,
          }
        }
      })
      return updated
    })
  }, [angle, radiusScale, draggedArea])

  // Collision detection and magnetic grouping
  useEffect(() => {
    if (draggedArea) return
    const interval = setInterval(() => {
      setPositions((prev) => {
        const updated = { ...prev }
        const keys = Object.keys(prev)

        // Collision detection
        for (let i = 0; i < keys.length; i++) {
          for (let j = i + 1; j < keys.length; j++) {
            const a = prev[keys[i]]
            const b = prev[keys[j]]
            if (!a || !b) continue

            const dx = b.x - a.x
            const dy = b.y - a.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            // Repel if too close
            if (dist < 120 && dist > 0) {
              const overlap = 120 - dist
              const nx = dx / dist
              const ny = dy / dist
              updated[keys[i]] = {
                x: a.x - nx * overlap * 0.3,
                y: a.y - ny * overlap * 0.3,
              }
              updated[keys[j]] = {
                x: b.x + nx * overlap * 0.3,
                y: b.y + ny * overlap * 0.3,
              }
            }
          }
        }

        return updated
      })
    }, 50)

    return () => clearInterval(interval)
  }, [draggedArea])

  const handleMouseDown = (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggedArea(areaId)
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedArea) return
      const container = e.currentTarget as HTMLElement
      const rect = container.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const x = e.clientX - rect.left - centerX
      const y = e.clientY - rect.top - centerY

      setPositions((prev) => ({
        ...prev,
        [draggedArea]: { x, y },
      }))
    },
    [draggedArea]
  )

  const handleMouseUp = () => {
    setDraggedArea(null)
  }

  const resetPositions = () => {
    const initialPositions: Record<string, Position> = {}
    lifeAreas.forEach((area) => {
      const orbitX = Math.cos(angle + area.angleOffset) * area.orbitRadius * radiusScale
      const orbitY = Math.sin(angle + area.angleOffset) * area.orbitRadius * radiusScale
      initialPositions[area.id] = { x: orbitX, y: orbitY }
    })
    setPositions(initialPositions)
  }

  const getReflection = (areaId: string) => {
    const reflections: Record<string, string> = {
      work: 'Work relationships orbit with purpose — steady and glowing with collaborative energy.',
      health: 'Health is stabilizing — maintain your rhythm and rest. Your body is your temple.',
      intimacy: 'Intimacy in harmony — nurture emotional gravity. Deep connections fuel your phoenix rise.',
      finance: 'Finance needs rebalancing — find your sustainable orbit. Build wealth with wisdom.',
      spiritual: 'Spiritual center strong — align orbit with inner truth. Your soul guides the journey.',
      creativity: 'Creative energy flows freely — let imagination dance in orbital harmony.',
    }
    return reflections[areaId] || 'Your life area is in motion — observe and adjust your orbit.'
  }

  return (
    <div
      className="relative w-full h-[85vh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl px-6 py-4 flex flex-wrap gap-4 items-center text-white z-10"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <label className="block text-xs font-semibold text-white/80">Orbit Speed</label>
            <input
              type="range"
              min="0.001"
              max="0.05"
              step="0.001"
              value={orbitSpeed}
              onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
              className="w-32 accent-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <div>
            <label className="block text-xs font-semibold text-white/80">Radius Scale</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={radiusScale}
              onChange={(e) => setRadiusScale(parseFloat(e.target.value))}
              className="w-32 accent-purple-500"
            />
          </div>
        </div>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl shadow-lg transition-all ${
            isPaused
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </button>

        <button
          onClick={resetPositions}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </motion.div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {lifeAreas.map((area) => {
          const pos = positions[area.id]
          if (!pos) return null

          return area.connections.map((_, i) => {
            const targetAngle = angle + i * 0.5
            const targetX = Math.cos(targetAngle) * 50
            const targetY = Math.sin(targetAngle) * 50

            return (
              <motion.line
                key={`${area.id}-link-${i}`}
                x1={`calc(50% + ${pos.x}px)`}
                y1={`calc(50% + ${pos.y}px)`}
                x2={`calc(50% + ${pos.x + targetX}px)`}
                y2={`calc(50% + ${pos.y + targetY}px)`}
                stroke={area.color}
                strokeWidth="2"
                strokeOpacity="0.4"
                filter="url(#glow)"
                animate={{
                  pathLength: [0.6, 1, 0.6],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )
          })
        })}
      </svg>

      {/* Life Area Orbs */}
      <div className="absolute inset-0 flex items-center justify-center">
        {lifeAreas.map((area) => {
          const pos = positions[area.id]
          if (!pos) return null

          const isSelected = selectedArea === area.id
          const isDragging = draggedArea === area.id

          return (
            <motion.div
              key={area.id}
              className="absolute flex flex-col items-center cursor-move select-none"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => handleMouseDown(area.id, e)}
              onClick={() => setSelectedArea(isSelected ? null : area.id)}
              whileHover={{ scale: isDragging ? 1 : 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Glow Effect */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${area.color}66, transparent)`,
                  filter: 'blur(40px)',
                  width: isSelected ? 250 : 180,
                  height: isSelected ? 250 : 180,
                  zIndex: -1,
                }}
                animate={{ opacity: area.energy, scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Orb */}
              <motion.div
                className="flex flex-col items-center justify-center text-center rounded-full shadow-2xl border-4 border-white/20 backdrop-blur-sm relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${area.color}dd, ${area.color}aa)`,
                  width: isSelected ? 140 : 100,
                  height: isSelected ? 140 : 100,
                  boxShadow: `0 0 40px ${area.color}80, inset 0 0 20px ${area.color}40`,
                }}
                animate={{
                  scale: isSelected ? 1.15 : isDragging ? 1.1 : 1,
                  rotate: isDragging ? 5 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white font-bold drop-shadow-lg text-sm px-2 z-10">
                  {area.name}
                </span>
                {isSelected && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white/90 text-xs font-semibold mt-1 z-10"
                  >
                    {area.score}/5.0
                  </motion.span>
                )}

                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"
                  animate={{ x: [-100, 200] }}
                  transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
                />
              </motion.div>

              {/* Connection Count Badge */}
              {area.connections.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white"
                >
                  {area.connections.length}
                </motion.div>
              )}

              {/* Connections Popup */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-[120%] text-sm text-white bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl min-w-[200px] z-20"
                  >
                    <p className="font-bold mb-2 text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Connections:
                    </p>
                    {area.connections.length > 0 ? (
                      <div className="space-y-1">
                        {area.connections.map((c, i) => (
                          <p key={i} className="flex items-center gap-2 text-white/90">
                            <span className="text-amber-500">•</span> {c}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="italic text-white/60">No active connections</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Center Point */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-white to-amber-300 shadow-lg"
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* AI Reflection Panel */}
      <AnimatePresence>
        {selectedArea && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-2 border-amber-500/50 p-6 rounded-2xl shadow-2xl max-w-md text-center z-20"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Phoenix Reflection</h2>
            </div>
            <p className="text-white/90 leading-relaxed">{getReflection(selectedArea)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-xs text-white/80"
      >
        <p>🖱️ Drag orbs to reposition</p>
        <p>👆 Click orbs to view details</p>
      </motion.div>
    </div>
  )
}
