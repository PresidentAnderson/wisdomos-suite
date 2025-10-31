'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  RefreshCw, 
  Users, 
  DollarSign, 
  Building2, 
  Ticket,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Link,
  Unlink
} from 'lucide-react'

interface HubSpotStats {
  totalContacts: number
  totalDeals: number
  totalCompanies: number
  totalTickets: number
  lastSync: string
  webhookStatus: 'connected' | 'disconnected' | 'error'
}

interface WebhookEvent {
  id: string
  eventType: string
  objectType: string
  occurredAt: string
  status: 'processed' | 'pending' | 'error'
}

export function HubSpotIntegration() {
  const [isConnected, setIsConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [stats, setStats] = useState<HubSpotStats>({
    totalContacts: 0,
    totalDeals: 0,
    totalCompanies: 0,
    totalTickets: 0,
    lastSync: 'Never',
    webhookStatus: 'disconnected'
  })
  const [recentEvents, setRecentEvents] = useState<WebhookEvent[]>([])

  useEffect(() => {
    checkConnectionStatus()
    loadStats()
    loadRecentEvents()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/hubspot/webhook/status')
      if (!response.ok) {
        throw new Error('Failed to fetch status')
      }
      const data = await response.json()
      setIsConnected(data.configured)
      setStats(prev => ({ 
        ...prev, 
        webhookStatus: data.status || (data.configured ? 'connected' : 'disconnected')
      }))
    } catch (error) {
      console.error('Failed to check HubSpot connection:', error)
      setIsConnected(false)
      setStats(prev => ({ ...prev, webhookStatus: 'error' }))
    }
  }

  const loadStats = async () => {
    // In production, fetch actual stats from API
    setStats(prev => ({
      totalContacts: 247,
      totalDeals: 18,
      totalCompanies: 42,
      totalTickets: 7,
      lastSync: new Date().toLocaleString(),
      webhookStatus: prev.webhookStatus // Preserve webhook status
    }))
  }

  const loadRecentEvents = async () => {
    // In production, fetch actual events from API
    setRecentEvents([
      {
        id: '1',
        eventType: 'contact.creation',
        objectType: 'CONTACT',
        occurredAt: new Date(Date.now() - 3600000).toLocaleString(),
        status: 'processed'
      },
      {
        id: '2',
        eventType: 'deal.propertyChange',
        objectType: 'DEAL',
        occurredAt: new Date(Date.now() - 7200000).toLocaleString(),
        status: 'processed'
      },
      {
        id: '3',
        eventType: 'company.creation',
        objectType: 'COMPANY',
        occurredAt: new Date(Date.now() - 10800000).toLocaleString(),
        status: 'pending'
      }
    ])
  }

  const syncData = async (type: 'contacts' | 'deals' | 'all') => {
    setIsSyncing(true)
    try {
      const response = await fetch(`/api/hubspot/sync/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' }) // Replace with actual user ID
      })
      const data = await response.json()
      
      if (data.success) {
        await loadStats()
        alert(`Successfully synced ${data.synced} ${type}`)
      }
    } catch (error) {
      console.error(`Failed to sync ${type}:`, error)
      alert(`Failed to sync ${type}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'processed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'error':
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getEventIcon = (objectType: string) => {
    switch (objectType) {
      case 'CONTACT':
        return <Users className="w-4 h-4" />
      case 'DEAL':
        return <DollarSign className="w-4 h-4" />
      case 'COMPANY':
        return <Building2 className="w-4 h-4" />
      case 'TICKET':
        return <Ticket className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>HubSpot Integration</CardTitle>
              <CardDescription>
                Sync your CRM data with WisdomOS contributions
              </CardDescription>
            </div>
            <Badge 
              variant={isConnected ? 'default' : 'secondary'}
              className={`${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}
            >
              {isConnected ? (
                <>
                  <Link className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <Unlink className="w-3 h-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>Webhook Status: 
                <span className={`ml-2 inline-flex items-center`}>
                  <span className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(stats.webhookStatus)}`} />
                  {stats.webhookStatus}
                </span>
              </p>
              <p className="mt-1">Last Sync: {stats.lastSync}</p>
            </div>
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => syncData('all')}
                disabled={!isConnected || isSyncing}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contacts</p>
                <p className="text-2xl font-bold">{stats.totalContacts}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => syncData('contacts')}
              disabled={!isConnected || isSyncing}
            >
              Sync Contacts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deals</p>
                <p className="text-2xl font-bold">{stats.totalDeals}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => syncData('deals')}
              disabled={!isConnected || isSyncing}
            >
              Sync Deals
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Companies</p>
                <p className="text-2xl font-bold">{stats.totalCompanies}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets</p>
                <p className="text-2xl font-bold">{stats.totalTickets}</p>
              </div>
              <Ticket className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Webhook Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Real-time events from HubSpot webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent events
              </p>
            ) : (
              recentEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getEventIcon(event.objectType)}
                    <div>
                      <p className="text-sm font-medium">{event.eventType}</p>
                      <p className="text-xs text-muted-foreground">{event.occurredAt}</p>
                    </div>
                  </div>
                  <Badge variant={event.status === 'processed' ? 'default' : 'secondary'}>
                    {event.status === 'processed' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {event.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {event.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {event.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>How HubSpot Integration Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Automatic Contribution Creation</p>
                <p className="text-sm text-muted-foreground">
                  New contacts and deals automatically create contributions in your Being, Doing, and Having categories
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Real-time Synchronization</p>
                <p className="text-sm text-muted-foreground">
                  Webhooks ensure your WisdomOS data stays in sync with HubSpot changes instantly
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Relationship Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Track professional relationships and their impact on your Phoenix journey
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}