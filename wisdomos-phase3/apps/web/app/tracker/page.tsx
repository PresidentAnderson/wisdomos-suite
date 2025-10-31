'use client';

import React from 'react';
import Navigation from '../../components/Navigation';
import Dashboard from '../../components/tracker/Dashboard';
import { LifeAreaMonth } from '../../lib/fulfillment';
import './tracker.css';

// Mock data for demonstration
const mockLifeAreas: Record<string, { name: string; months: LifeAreaMonth[] }> = {
  work: {
    name: 'Work & Purpose',
    months: [{
      lifeAreaId: 'work',
      year: 2025,
      month: 8, // Aug
      days: [
        { date: '2025-08-01', color: 'green', note: 'deep work session' },
        { date: '2025-08-02', color: 'yellow', note: 'emails and meetings' },
        { date: '2025-08-03', color: 'red', note: 'context switching chaos' },
        { date: '2025-08-05', color: 'green' },
        { date: '2025-08-06', color: 'yellow' },
        { date: '2025-08-07', color: 'green', note: 'flow state achieved' },
      ]
    }]
  },
  health: {
    name: 'Health',
    months: [{
      lifeAreaId: 'health',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-01', color: 'yellow' },
        { date: '2025-08-02', color: 'green', note: 'great workout' },
        { date: '2025-08-04', color: 'red', note: 'slept late' },
        { date: '2025-08-06', color: 'yellow' },
        { date: '2025-08-08', color: 'green' },
      ]
    }]
  },
  finance: {
    name: 'Finance',
    months: [{
      lifeAreaId: 'finance',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-01', color: 'green', note: 'budget on track' },
        { date: '2025-08-15', color: 'yellow', note: 'reconciled accounts' },
        { date: '2025-08-20', color: 'green' },
      ]
    }]
  },
  intimacy: {
    name: 'Intimacy & Romance',
    months: [{
      lifeAreaId: 'intimacy',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-01', color: 'green' },
        { date: '2025-08-03', color: 'yellow' },
        { date: '2025-08-10', color: 'green', note: 'date night' },
      ]
    }]
  },
  time: {
    name: 'Time Management',
    months: [{
      lifeAreaId: 'time',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-01', color: 'yellow' },
        { date: '2025-08-05', color: 'green' },
        { date: '2025-08-12', color: 'red', note: 'overcommitted' },
      ]
    }]
  },
  spiritual: {
    name: 'Spiritual Growth',
    months: [{
      lifeAreaId: 'spiritual',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-01', color: 'green', note: 'meditation' },
        { date: '2025-08-07', color: 'green' },
      ]
    }]
  },
  creativity: {
    name: 'Creativity',
    months: [{
      lifeAreaId: 'creativity',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-02', color: 'green', note: 'new project started' },
        { date: '2025-08-09', color: 'yellow' },
      ]
    }]
  },
  friendship: {
    name: 'Friendship',
    months: [{
      lifeAreaId: 'friendship',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-03', color: 'green', note: 'game night' },
        { date: '2025-08-10', color: 'yellow' },
      ]
    }]
  },
  learning: {
    name: 'Learning & Growth',
    months: [{
      lifeAreaId: 'learning',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-01', color: 'green', note: 'course progress' },
        { date: '2025-08-08', color: 'green' },
      ]
    }]
  },
  home: {
    name: 'Home & Environment',
    months: [{
      lifeAreaId: 'home',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-04', color: 'yellow', note: 'cleaning day' },
        { date: '2025-08-11', color: 'green' },
      ]
    }]
  },
  sexuality: {
    name: 'Sexuality',
    months: [{
      lifeAreaId: 'sexuality',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-02', color: 'green' },
        { date: '2025-08-09', color: 'yellow' },
      ]
    }]
  },
  emotional: {
    name: 'Emotional Well-being',
    months: [{
      lifeAreaId: 'emotional',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-01', color: 'yellow' },
        { date: '2025-08-05', color: 'green', note: 'therapy session' },
        { date: '2025-08-12', color: 'yellow' },
      ]
    }]
  },
  legacy: {
    name: 'Legacy & Impact',
    months: [{
      lifeAreaId: 'legacy',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-03', color: 'green', note: 'volunteer work' },
      ]
    }]
  },
  music: {
    name: 'Music Production',
    months: [{
      lifeAreaId: 'music',
      year: 2025,
      month: 8,
      days: [
        { date: '2025-08-01', color: 'green', note: 'new track started' },
        { date: '2025-08-07', color: 'yellow' },
        { date: '2025-08-14', color: 'green', note: 'mixing session' },
      ]
    }]
  }
};

// Mock people data
const mockPeople = {
  'p-anna': {
    id: 'p-anna',
    name: 'Anna Zhang',
    role: 'Therapist',
    lastContactAt: '2025-08-20T15:10:00Z',
    lastContactChannel: 'WhatsApp Call (20m)',
    lastContactNote: 'Cleared up billing confusion',
    interactions: [
      { at: '2025-08-20T15:10:00Z', channel: 'Call', note: 'Cleared billing', color: 'green' },
      { at: '2025-08-12T09:00:00Z', channel: 'Text', note: 'Rescheduled', color: 'yellow' },
      { at: '2025-08-03T19:00:00Z', channel: 'In person', note: 'Argument', color: 'red' },
    ],
    linkedLifeAreas: ['health','emotional'],
    nextTouchpoint: { at: '2025-08-27T14:00:00Z', note: 'Send follow-up PDF' }
  },
  'p-john': {
    id: 'p-john',
    name: 'John Davidson',
    role: 'Business Partner',
    lastContactAt: '2025-08-18T10:30:00Z',
    lastContactChannel: 'Zoom Meeting',
    lastContactNote: 'Discussed Q4 strategy',
    interactions: [
      { at: '2025-08-18T10:30:00Z', channel: 'Zoom', note: 'Q4 planning', color: 'green' },
      { at: '2025-08-10T14:00:00Z', channel: 'Email', note: 'Contract review', color: 'yellow' },
    ],
    linkedLifeAreas: ['work','finance'],
    nextTouchpoint: { at: '2025-08-25T09:00:00Z', note: 'Review final proposal' }
  },
  'p-sarah': {
    id: 'p-sarah',
    name: 'Sarah Miller',
    role: 'Life Partner',
    lastContactAt: '2025-08-22T20:00:00Z',
    lastContactChannel: 'In Person',
    lastContactNote: 'Date night - Italian restaurant',
    interactions: [
      { at: '2025-08-22T20:00:00Z', channel: 'In Person', note: 'Date night', color: 'green' },
      { at: '2025-08-19T08:00:00Z', channel: 'Morning chat', note: 'Planning weekend', color: 'green' },
      { at: '2025-08-15T21:00:00Z', channel: 'Text', note: 'Running late', color: 'yellow' },
    ],
    linkedLifeAreas: ['intimacy','emotional','home'],
  }
};

export default function TrackerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Life Area Tracker
          </h1>
          <p className="text-gray-400">
            Visualize your progress across all life areas throughout the year
          </p>
        </div>

        {/* Dashboard with Table/Circle View Toggle */}
        <Dashboard 
          lifeAreas={mockLifeAreas}
          peopleIndex={mockPeople}
          circleData={null}
        />

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Table View: Click month dots to expand</li>
              <li>• Drag or use G/Y/R keys to paint days</li>
              <li>• Shift+R for Reset Ritual</li>
              <li>• Arrow keys navigate, Up/Down jumps week</li>
              <li>• Import/Export CSV or JSON data</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Color Weights</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Green = 2 points (thriving)</li>
              <li>• Yellow = 1 point (needs attention)</li>
              <li>• Red = 0 points (critical)</li>
              <li>• Monthly avg ≥1.33 = Green</li>
              <li>• Monthly avg ≤0.66 = Red</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Circle View</h3>
            <p className="text-sm text-gray-400">
              Click Circle View to see relationship network. Click on people to view their 
              details, linked life areas, and interaction history.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}