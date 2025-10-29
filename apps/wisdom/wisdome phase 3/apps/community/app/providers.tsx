'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from 'react-hot-toast';
import Navigation from '../components/Navigation';
import PWAStatus from '../components/PWAStatus';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <main className="lg:ml-64 min-h-screen">
            <div className="lg:hidden h-16"></div> {/* Spacer for mobile header */}
            {children}
          </main>
          <PWAStatus />
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#dc2626',
              },
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
}