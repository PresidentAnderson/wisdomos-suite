'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LifeArea {
  id: string
  name: string
  phoenixName?: string
  icon?: string
  color?: string
  status?: 'BREAKDOWN' | 'ATTENTION' | 'THRIVING'
  score?: number
  description?: string
}

interface LifeAreasContextType {
  lifeAreas: LifeArea[]
  setLifeAreas: (areas: LifeArea[]) => void
  getLifeAreaById: (id: string) => LifeArea | undefined
  updateLifeArea: (id: string, updates: Partial<LifeArea>) => void
  addLifeArea: (area: LifeArea) => void
  removeLifeArea: (id: string) => void
}

const LifeAreasContext = createContext<LifeAreasContextType | undefined>(undefined)

// Default canonical life areas
const DEFAULT_LIFE_AREAS: LifeArea[] = [
  { 
    id: 'work-purpose', 
    name: 'Work & Purpose', 
    phoenixName: 'Phoenix of Achievement',
    icon: '💼', 
    color: 'bg-blue-500',
    status: 'ATTENTION',
    score: 65,
    description: 'Your professional life, career goals, and sense of purpose'
  },
  { 
    id: 'creativity-expression', 
    name: 'Creativity & Expression',
    phoenixName: 'Phoenix of Creation', 
    icon: '🎨', 
    color: 'bg-purple-500',
    status: 'THRIVING',
    score: 80,
    description: 'Creative pursuits, artistic expression, and innovation'
  },
  { 
    id: 'community-contribution', 
    name: 'Community & Contribution',
    phoenixName: 'Phoenix of Service', 
    icon: '🤝', 
    color: 'bg-green-500',
    status: 'ATTENTION',
    score: 70,
    description: 'Community involvement, volunteering, and social impact'
  },
  { 
    id: 'personal-growth', 
    name: 'Personal Growth & Wisdom',
    phoenixName: 'Phoenix of Wisdom', 
    icon: '🌱', 
    color: 'bg-indigo-500',
    status: 'THRIVING',
    score: 85,
    description: 'Learning, self-improvement, and spiritual development'
  },
  { 
    id: 'health-wellness', 
    name: 'Health & Wellness',
    phoenixName: 'Phoenix of Vitality', 
    icon: '❤️', 
    color: 'bg-red-500',
    status: 'ATTENTION',
    score: 60,
    description: 'Physical health, mental wellness, and self-care'
  },
  { 
    id: 'financial-abundance', 
    name: 'Financial Abundance',
    phoenixName: 'Phoenix of Prosperity', 
    icon: '💰', 
    color: 'bg-yellow-500',
    status: 'BREAKDOWN',
    score: 45,
    description: 'Financial security, wealth building, and abundance mindset'
  },
  { 
    id: 'material-comfort', 
    name: 'Material Comfort',
    phoenixName: 'Phoenix of Comfort', 
    icon: '🏡', 
    color: 'bg-orange-500',
    status: 'ATTENTION',
    score: 70,
    description: 'Living environment, possessions, and physical comfort'
  },
  { 
    id: 'relationships-love', 
    name: 'Relationships & Love',
    phoenixName: 'Phoenix of Connection', 
    icon: '💑', 
    color: 'bg-pink-500',
    status: 'THRIVING',
    score: 90,
    description: 'Romantic relationships, family bonds, and deep connections'
  },
  { 
    id: 'adventure-experiences', 
    name: 'Adventure & Experiences',
    phoenixName: 'Phoenix of Adventure', 
    icon: '🌍', 
    color: 'bg-teal-500',
    status: 'ATTENTION',
    score: 55,
    description: 'Travel, new experiences, and stepping out of comfort zone'
  },
  { 
    id: 'music-production', 
    name: 'Music Production',
    phoenixName: 'Phoenix of Harmony', 
    icon: '🎵', 
    color: 'bg-purple-600',
    status: 'THRIVING',
    score: 75,
    description: 'Creative expression through music composition, production, and sound design'
  },
]

export function LifeAreasProvider({ children }: { children: ReactNode }) {
  const [lifeAreas, setLifeAreasState] = useState<LifeArea[]>(DEFAULT_LIFE_AREAS)

  useEffect(() => {
    // Load life areas from localStorage on mount
    const stored = localStorage.getItem('wisdomos_life_areas')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLifeAreasState(parsed)
        }
      } catch (error) {
        console.error('Error loading life areas:', error)
      }
    }
  }, [])

  const setLifeAreas = (areas: LifeArea[]) => {
    setLifeAreasState(areas)
    localStorage.setItem('wisdomos_life_areas', JSON.stringify(areas))
  }

  const getLifeAreaById = (id: string) => {
    return lifeAreas.find(area => area.id === id)
  }

  const updateLifeArea = (id: string, updates: Partial<LifeArea>) => {
    const updated = lifeAreas.map(area => 
      area.id === id ? { ...area, ...updates } : area
    )
    setLifeAreas(updated)
  }

  const addLifeArea = (area: LifeArea) => {
    setLifeAreas([...lifeAreas, area])
  }

  const removeLifeArea = (id: string) => {
    setLifeAreas(lifeAreas.filter(area => area.id !== id))
  }

  return (
    <LifeAreasContext.Provider 
      value={{
        lifeAreas,
        setLifeAreas,
        getLifeAreaById,
        updateLifeArea,
        addLifeArea,
        removeLifeArea,
      }}
    >
      {children}
    </LifeAreasContext.Provider>
  )
}

export function useLifeAreas() {
  const context = useContext(LifeAreasContext)
  if (context === undefined) {
    throw new Error('useLifeAreas must be used within a LifeAreasProvider')
  }
  return context
}