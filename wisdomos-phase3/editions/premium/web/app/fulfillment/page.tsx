'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Map, Users, Plus, ChevronLeft, Settings, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

interface LifeAreaNode {
  id: string
  name: string
  phoenixName: string
  color: string
  position: { x: number; y: number }
  size: number
  relationships: Relationship[]
}

interface Relationship {
  id: string
  name: string
  frequency: number
  notes?: string
  position: { x: number; y: number }
  lastContact?: Date
}

const initialLifeAreas: LifeAreaNode[] = [
  {
    id: '1',
    name: 'Work & Purpose',
    phoenixName: 'Sacred Fire',
    color: '#FFD700',
    position: { x: 200, y: 150 },
    size: 80,
    relationships: [
      {
        id: '1-1',
        name: 'Sarah (Mentor)',
        frequency: 5,
        notes: 'Weekly check-ins',
        position: { x: 180, y: 100 },
        lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '2',
    name: 'Health & Recovery',
    phoenixName: 'Inner Flame',
    color: '#E63946',
    position: { x: 400, y: 200 },
    size: 75,
    relationships: [
      {
        id: '2-1',
        name: 'Dr. Martinez',
        frequency: 4,
        position: { x: 450, y: 150 },
        lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '3',
    name: 'Finance',
    phoenixName: 'Golden Wings',
    color: '#FF914D',
    position: { x: 300, y: 350 },
    size: 70,
    relationships: [],
  },
  {
    id: '4',
    name: 'Intimacy & Love',
    phoenixName: 'Heart\'s Ember',
    color: '#F72585',
    position: { x: 150, y: 300 },
    size: 85,
    relationships: [
      {
        id: '4-1',
        name: 'Partner',
        frequency: 10,
        position: { x: 100, y: 280 },
        lastContact: new Date(),
      },
    ],
  },
  {
    id: '5',
    name: 'Time & Energy',
    phoenixName: 'Life Force',
    color: '#3A0CA3',
    position: { x: 500, y: 300 },
    size: 75,
    relationships: [],
  },
  {
    id: '6',
    name: 'Spiritual Alignment',
    phoenixName: 'Divine Spark',
    color: '#7209B7',
    position: { x: 250, y: 250 },
    size: 70,
    relationships: [],
  },
  {
    id: '7',
    name: 'Creativity & Expression',
    phoenixName: 'Creative Flame',
    color: '#F72585',
    position: { x: 350, y: 100 },
    size: 65,
    relationships: [],
  },
  {
    id: '8',
    name: 'Friendship & Community',
    phoenixName: 'Circle of Fire',
    color: '#4CC9F0',
    position: { x: 450, y: 350 },
    size: 75,
    relationships: [],
  },
  {
    id: '9',
    name: 'Learning & Growth',
    phoenixName: 'Rising Wisdom',
    color: '#06B6D4',
    position: { x: 100, y: 200 },
    size: 70,
    relationships: [],
  },
  {
    id: '10',
    name: 'Home & Environment',
    phoenixName: 'Nest of Renewal',
    color: '#10B981',
    position: { x: 550, y: 150 },
    size: 65,
    relationships: [],
  },
  {
    id: '11',
    name: 'Sexuality',
    phoenixName: 'Passionate Fire',
    color: '#E63946',
    position: { x: 200, y: 400 },
    size: 60,
    relationships: [],
  },
  {
    id: '12',
    name: 'Emotional Regulation',
    phoenixName: 'Inner Phoenix',
    color: '#8B5CF6',
    position: { x: 400, y: 450 },
    size: 70,
    relationships: [],
  },
  {
    id: '13',
    name: 'Legacy & Archives',
    phoenixName: 'Eternal Flame',
    color: '#1D3557',
    position: { x: 300, y: 500 },
    size: 65,
    relationships: [],
  },
]

export default function FulfillmentDisplayPage() {
  const [lifeAreas, setLifeAreas] = useState<LifeAreaNode[]>(initialLifeAreas)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showAddRelationship, setShowAddRelationship] = useState(false)
  const [newRelationshipName, setNewRelationshipName] = useState('')
  const [newRelationshipFreq, setNewRelationshipFreq] = useState(5)
  const [selectedLifeAreaId, setSelectedLifeAreaId] = useState('1')
  const mapRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (
    e: React.MouseEvent,
    nodeId: string,
    nodeType: 'area' | 'relationship'
  ) => {
    setIsDragging(true)
    setSelectedNode(nodeId)
    
    const rect = mapRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedNode) return

    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const newPosition = {
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y,
    }

    // Update position based on node type
    setLifeAreas(areas => 
      areas.map(area => {
        if (area.id === selectedNode) {
          return { ...area, position: newPosition }
        }
        
        // Check if it's a relationship
        const updatedRelationships = area.relationships.map(rel => 
          rel.id === selectedNode ? { ...rel, position: newPosition } : rel
        )
        
        return { ...area, relationships: updatedRelationships }
      })
    )
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setSelectedNode(null)
  }

  const addRelationship = (areaId: string) => {
    if (!newRelationshipName) return

    // Find the area to add the relationship to
    const targetArea = lifeAreas.find(area => area.id === areaId)
    if (!targetArea) return

    // Position the new relationship near the life area
    const angleOffset = targetArea.relationships.length * (Math.PI / 4) // Spread relationships around the area
    const distance = targetArea.size + 50 // Place outside the area circle
    const newRelationship: Relationship = {
      id: `${areaId}-${Date.now()}`,
      name: newRelationshipName,
      frequency: newRelationshipFreq,
      position: { 
        x: targetArea.position.x + Math.cos(angleOffset) * distance,
        y: targetArea.position.y + Math.sin(angleOffset) * distance
      },
      notes: targetArea.name + ' connection',
      lastContact: new Date(),
    }

    setLifeAreas(areas =>
      areas.map(area =>
        area.id === areaId
          ? { 
              ...area, 
              relationships: [...area.relationships, newRelationship],
              size: Math.min(120, area.size + 5) // Grow the circle slightly with each relationship
            }
          : area
      )
    )

    // Also save to community page localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wisdomos_connections') || '[]'
      const connections = JSON.parse(stored)
      connections.push({
        id: newRelationship.id,
        name: newRelationshipName,
        lifeArea: targetArea.name,
        frequency: newRelationshipFreq,
        lastContact: new Date(),
        notes: `Connected to ${targetArea.name} - ${targetArea.phoenixName}`,
        urgency: 'low'
      })
      localStorage.setItem('wisdomos_connections', JSON.stringify(connections))
      
      // Dispatch event to notify community page
      window.dispatchEvent(new Event('wisdomos:connection-added'))
    }

    setNewRelationshipName('')
    setNewRelationshipFreq(5)
    setSelectedLifeAreaId('1')
    setShowAddRelationship(false)
  }

  const getUrgencyColor = (lastContact: Date | undefined, frequency: number) => {
    if (!lastContact) return '#F59E0B' // Yellow
    
    const daysSince = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
    const threshold = frequency <= 5 ? 7 : frequency <= 7 ? 3 : 1
    
    if (daysSince > threshold * 2) return '#E63946' // Red
    if (daysSince > threshold) return '#F59E0B' // Yellow
    return '#10B981' // Green
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <PhoenixButton variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </PhoenixButton>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Fulfillment Display
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <PhoenixButton
                onClick={() => setShowAddRelationship(true)}
                size="sm"
                variant="secondary"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Connection
              </PhoenixButton>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="mb-6 p-4 bg-white/50 rounded-lg border border-phoenix-gold/20">
          <p className="text-sm text-black flex items-center gap-2">
            <Map className="w-4 h-4 text-black" />
            Drag to move • Large circles = Life Areas • Small circles = Relationships • Colors indicate contact urgency
          </p>
        </div>

        {/* Interactive Map */}
        <div className="bg-white rounded-2xl shadow-xl border border-phoenix-gold/20 overflow-hidden">
          <div
            ref={mapRef}
            className="relative w-full h-[700px] bg-gradient-to-br from-gray-50 to-white cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Life Areas */}
            {lifeAreas.map((area) => (
              <div key={area.id}>
                {/* Life Area Node */}
                <motion.div
                  className="absolute cursor-move select-none group"
                  style={{
                    left: area.position.x - area.size / 2,
                    top: area.position.y - area.size / 2,
                    width: area.size,
                    height: area.size,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, area.id, 'area')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    width: area.size,
                    height: area.size,
                    left: area.position.x - area.size / 2,
                    top: area.position.y - area.size / 2,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-full h-full rounded-full border-4 border-white shadow-lg flex items-center justify-center relative"
                    style={{ backgroundColor: area.color }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold text-black mb-1">
                        {area.name.split(' ')[0]}
                      </div>
                      <div className="text-xs text-black/80 font-medium">
                        {area.phoenixName}
                      </div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {area.name}
                      <br />
                      {area.relationships.length} connections
                    </div>
                  </div>
                </motion.div>

                {/* Relationships */}
                {area.relationships.map((relationship) => (
                  <motion.div
                    key={relationship.id}
                    className="absolute cursor-move select-none group"
                    style={{
                      left: relationship.position.x - 15,
                      top: relationship.position.y - 15,
                      width: 30,
                      height: 30,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, relationship.id, 'relationship')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div
                      className="w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center relative"
                      style={{ 
                        backgroundColor: getUrgencyColor(relationship.lastContact, relationship.frequency)
                      }}
                    >
                      <Users className="w-3 h-3 text-black" />
                      
                      {/* Connection Line */}
                      <svg
                        className="absolute pointer-events-none"
                        style={{
                          left: -relationship.position.x + area.position.x - 15,
                          top: -relationship.position.y + area.position.y - 15,
                          width: Math.abs(area.position.x - relationship.position.x) + 30,
                          height: Math.abs(area.position.y - relationship.position.y) + 30,
                        }}
                      >
                        <line
                          x1={relationship.position.x < area.position.x ? 15 : Math.abs(area.position.x - relationship.position.x) + 15}
                          y1={relationship.position.y < area.position.y ? 15 : Math.abs(area.position.y - relationship.position.y) + 15}
                          x2={relationship.position.x < area.position.x ? Math.abs(area.position.x - relationship.position.x) + 15 : 15}
                          y2={relationship.position.y < area.position.y ? Math.abs(area.position.y - relationship.position.y) + 15 : 15}
                          stroke={area.color}
                          strokeWidth="2"
                          strokeOpacity="0.5"
                        />
                      </svg>
                      
                      {/* Tooltip */}
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        <div className="font-semibold">{relationship.name}</div>
                        <div>Frequency: {relationship.frequency}/10</div>
                        {relationship.lastContact && (
                          <div>
                            Last: {Math.floor((Date.now() - relationship.lastContact.getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </div>
                        )}
                        {relationship.notes && <div>{relationship.notes}</div>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg p-4 border border-phoenix-gold/20">
          <h3 className="font-semibold mb-3">Contact Urgency</h3>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-black">Recent contact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-black">Due soon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-black">Overdue</span>
            </div>
          </div>
        </div>
      </main>

      {/* Add Relationship Modal */}
      {showAddRelationship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold mb-4 text-black">Add New Connection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newRelationshipName}
                  onChange={(e) => setNewRelationshipName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  placeholder="Person's name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Contact Frequency (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newRelationshipFreq}
                  onChange={(e) => setNewRelationshipFreq(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-black text-center">
                  {newRelationshipFreq}/10
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Life Area
                </label>
                <select 
                  value={selectedLifeAreaId}
                  onChange={(e) => setSelectedLifeAreaId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                >
                  {lifeAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <PhoenixButton
                onClick={() => setShowAddRelationship(false)}
                variant="ghost"
                className="flex-1"
              >
                Cancel
              </PhoenixButton>
              <PhoenixButton
                onClick={() => addRelationship(selectedLifeAreaId)}
                className="flex-1"
              >
                Add Connection
              </PhoenixButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}