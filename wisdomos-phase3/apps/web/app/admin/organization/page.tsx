'use client'

/**
 * Organization Admin Dashboard
 * Phoenix Rising WisdomOS
 *
 * Complete organization management interface for owners and admins
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  Mail,
  Shield,
  Settings,
  CreditCard,
  BarChart3,
  UserPlus,
  Copy,
  Check,
  X,
  ExternalLink,
  Download,
  Upload,
  Eye,
  Trash2,
  MoreVertical,
  Send,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { PhoenixButton } from '@/components/ui/phoenix-button'
import { PhoenixInput } from '@/components/ui/phoenix-input'

interface Organization {
  id: string
  name: string
  domain: string
  slug: string
  plan: string
  ssoEnabled: boolean
  logoUrl?: string
  primaryColor: string
  status: string
  createdAt: Date
}

interface Member {
  userId: string
  role: string
  status: string
  department?: string
  title?: string
  joinedAt: Date
  lastActiveAt?: Date
  email?: string
  name?: string
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  invitedBy: string
  expiresAt: Date
  createdAt: Date
}

interface OrgStats {
  activeUsers: number
  pendingInvitations: number
  totalStorage: number
  monthlyActivity: number
}

export default function OrganizationAdmin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'invitations' | 'sso' | 'billing'>('overview')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [stats, setStats] = useState<OrgStats>({
    activeUsers: 0,
    pendingInvitations: 0,
    totalStorage: 0,
    monthlyActivity: 0
  })
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    loadOrganizationData()
  }, [])

  const loadOrganizationData = async () => {
    try {
      setLoading(true)
      // Load organization details, members, invitations, and stats
      const [orgRes, membersRes, invitesRes, statsRes] = await Promise.all([
        fetch('/api/admin/organization'),
        fetch('/api/admin/organization/members'),
        fetch('/api/admin/organization/invitations'),
        fetch('/api/admin/organization/stats')
      ])

      if (orgRes.ok) setOrganization(await orgRes.json())
      if (membersRes.ok) setMembers(await membersRes.json())
      if (invitesRes.ok) setInvitations(await invitesRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (error) {
      console.error('Failed to load organization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendInvitation = async () => {
    try {
      const response = await fetch('/api/admin/organization/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      })

      if (response.ok) {
        setShowInviteModal(false)
        setInviteEmail('')
        loadOrganizationData()
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
    }
  }

  const revokeInvitation = async (invitationId: string) => {
    try {
      await fetch(`/api/admin/organization/invitations/${invitationId}`, {
        method: 'DELETE'
      })
      loadOrganizationData()
    } catch (error) {
      console.error('Failed to revoke invitation:', error)
    }
  }

  const removeMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await fetch(`/api/admin/organization/members/${userId}`, {
        method: 'DELETE'
      })
      loadOrganizationData()
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${organization?.slug}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phoenix-orange"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {organization?.logoUrl ? (
                <img src={organization.logoUrl} alt={organization.name} className="w-12 h-12 rounded-lg" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-phoenix-orange to-phoenix-red rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-black">{organization?.name}</h1>
                <p className="text-sm text-gray-600">{organization?.domain} • {organization?.plan} plan</p>
              </div>
            </div>
            <PhoenixButton onClick={() => setShowInviteModal(true)} variant="primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Members
            </PhoenixButton>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'invitations', label: 'Invitations', icon: Mail },
              { id: 'sso', label: 'SSO', icon: Shield },
              { id: 'billing', label: 'Billing', icon: CreditCard }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-phoenix-orange text-phoenix-orange'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'blue' },
                { label: 'Pending Invites', value: stats.pendingInvitations, icon: Mail, color: 'yellow' },
                { label: 'Storage Used', value: `${stats.totalStorage}GB`, icon: BarChart3, color: 'green' },
                { label: 'Monthly Activity', value: `${stats.monthlyActivity}%`, icon: TrendingUp, color: 'purple' }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                    <p className="text-3xl font-bold text-black">{stat.value}</p>
                  </div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-black mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={copyInviteLink}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-phoenix-orange transition-colors"
                >
                  {copiedLink ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
                  <div className="text-left">
                    <p className="font-medium text-black">Copy Invite Link</p>
                    <p className="text-xs text-gray-500">Share with your team</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-phoenix-orange transition-colors">
                  <Download className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-black">Export Data</p>
                    <p className="text-xs text-gray-500">Download CSV</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-phoenix-orange transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-black">Org Settings</p>
                    <p className="text-xs text-gray-500">Configure workspace</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-black mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {members.slice(0, 5).map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-phoenix-orange to-phoenix-red rounded-full flex items-center justify-center text-white font-medium">
                        {member.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-black">{member.name || member.email}</p>
                        <p className="text-sm text-gray-600">
                          {member.status === 'active' ? 'Active' : 'Invited'} • {member.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">Team Members ({members.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-phoenix-orange to-phoenix-red rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {member.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-black">{member.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                          member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.department || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        {member.role !== 'owner' && (
                          <button
                            onClick={() => removeMember(member.userId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Pending Invitations ({invitations.length})</h2>
              <PhoenixButton onClick={() => setShowInviteModal(true)} variant="primary" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                New Invitation
              </PhoenixButton>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invitations.map((invite) => (
                    <tr key={invite.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-black">{invite.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {invite.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invite.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          invite.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invite.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {invite.status === 'pending' && (
                          <button
                            onClick={() => revokeInvitation(invite.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sso' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Single Sign-On Configuration</h2>
            <p className="text-gray-600 mb-6">
              Configure enterprise SSO for seamless authentication across your organization.
            </p>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Enterprise Feature</p>
                <p className="text-sm text-yellow-700 mt-1">
                  SSO configuration requires an enterprise plan. Contact our sales team to upgrade.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-black mb-4">Billing & Subscription</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-black">Current Plan</p>
                  <p className="text-sm text-gray-600 capitalize">{organization?.plan}</p>
                </div>
                <PhoenixButton variant="secondary">Upgrade Plan</PhoenixButton>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-black mb-4">Usage This Month</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Users</span>
                      <span className="text-sm font-medium text-black">{stats.activeUsers} / Unlimited</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-phoenix-orange h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Storage</span>
                      <span className="text-sm font-medium text-black">{stats.totalStorage}GB / 1000GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-phoenix-orange h-2 rounded-full" style={{ width: `${stats.totalStorage / 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-black">Invite Team Member</h3>
                <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <PhoenixInput
                  type="email"
                  label="Email Address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={`colleague@${organization?.domain}`}
                />

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <PhoenixButton onClick={() => setShowInviteModal(false)} variant="secondary" className="flex-1">
                  Cancel
                </PhoenixButton>
                <PhoenixButton onClick={sendInvitation} variant="primary" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Invite
                </PhoenixButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
