'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Clock, CheckCircle, Target,
  Calendar, Filter, BarChart3, AlertTriangle, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { boundaryAuditApi } from '@/lib/database';
import type { BoundaryAudit } from '@/lib/supabase';
import toast from 'react-hot-toast';

const CATEGORIES = ['personal', 'professional', 'family', 'social'] as const;
const PRIORITIES = ['low', 'medium', 'high'] as const;
const STATUSES = ['draft', 'active', 'completed'] as const;

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500', textColor: 'text-black', bgColor: 'bg-gray-100', icon: Clock },
  active: { label: 'Active', color: 'bg-green-500', textColor: 'text-black', bgColor: 'bg-green-100', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-blue-500', textColor: 'text-black', bgColor: 'bg-blue-100', icon: Target }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-400', textColor: 'text-black' },
  medium: { label: 'Medium', color: 'bg-yellow-400', textColor: 'text-black' },
  high: { label: 'High', color: 'bg-red-400', textColor: 'text-black' }
};

export default function BoundaryAuditPage() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<BoundaryAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAudit, setEditingAudit] = useState<BoundaryAudit | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  const [formData, setFormData] = useState<{
    title: string;
    category: 'personal' | 'professional' | 'family' | 'social';
    current_boundary: string;
    desired_boundary: string;
    action_steps: string[];
    priority: 'low' | 'medium' | 'high';
    status: 'draft' | 'active' | 'completed';
  }>({
    title: '',
    category: 'personal',
    current_boundary: '',
    desired_boundary: '',
    action_steps: [''],
    priority: 'medium',
    status: 'draft'
  });

  useEffect(() => {
    if (user) {
      loadAudits();
    }
  }, [user]);

  const loadAudits = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await boundaryAuditApi.getAll(user.id);
      setAudits(data);
    } catch (error) {
      console.error('Error loading boundary audits:', error);
      toast.error('Failed to load boundary audits');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'personal',
      current_boundary: '',
      desired_boundary: '',
      action_steps: [''],
      priority: 'medium',
      status: 'draft'
    });
    setEditingAudit(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title || !formData.current_boundary) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const auditData = {
        ...formData,
        user_id: user.id,
        action_steps: formData.action_steps.filter(step => step.trim() !== '')
      };

      if (editingAudit) {
        const updatedAudit = await boundaryAuditApi.update(editingAudit.id, user.id, auditData);
        setAudits(prev => prev.map(audit => 
          audit.id === updatedAudit.id ? updatedAudit : audit
        ));
        toast.success('Boundary audit updated successfully');
      } else {
        const createdAudit = await boundaryAuditApi.create(auditData);
        setAudits(prev => [createdAudit, ...prev]);
        toast.success('Boundary audit created successfully');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving boundary audit:', error);
      toast.error('Failed to save boundary audit');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (audit: BoundaryAudit) => {
    setEditingAudit(audit);
    setFormData({
      title: audit.title,
      category: audit.category,
      current_boundary: audit.current_boundary,
      desired_boundary: audit.desired_boundary || '',
      action_steps: (audit.action_steps as string[]) || [''],
      priority: audit.priority,
      status: audit.status
    });
    setShowForm(true);
  };

  const handleDelete = async (auditId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this boundary audit?')) return;

    try {
      await boundaryAuditApi.delete(auditId, user.id);
      setAudits(prev => prev.filter(audit => audit.id !== auditId));
      toast.success('Boundary audit deleted successfully');
    } catch (error) {
      console.error('Error deleting boundary audit:', error);
      toast.error('Failed to delete boundary audit');
    }
  };

  const addActionStep = () => {
    setFormData(prev => ({
      ...prev,
      action_steps: [...prev.action_steps, '']
    }));
  };

  const updateActionStep = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      action_steps: prev.action_steps.map((step, i) => i === index ? value : step)
    }));
  };

  const removeActionStep = (index: number) => {
    if (formData.action_steps.length > 1) {
      setFormData(prev => ({
        ...prev,
        action_steps: prev.action_steps.filter((_, i) => i !== index)
      }));
    }
  };

  const getFilteredAudits = () => {
    return audits.filter(audit => {
      const matchesCategory = !filterCategory || audit.category === filterCategory;
      const matchesStatus = !filterStatus || audit.status === filterStatus;
      const matchesPriority = !filterPriority || audit.priority === filterPriority;
      return matchesCategory && matchesStatus && matchesPriority;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-4" />
          <p className="text-black dark:text-black">Loading your boundary audits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-black mb-2">
          Boundary Audit Tool
        </h1>
        <p className="text-black dark:text-black">
          Define, track, and strengthen your personal boundaries across different life areas
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(status => (
            <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map(priority => (
            <option key={priority} value={priority}>{PRIORITY_CONFIG[priority].label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowForm(true)}
          className="ml-auto px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Boundary Audit
        </button>
      </div>

      {/* Audits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredAudits().map((audit) => {
          const statusConfig = STATUS_CONFIG[audit.status];
          const priorityConfig = PRIORITY_CONFIG[audit.priority];
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div
              key={audit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 ${priorityConfig.textColor}`}>
                      {priorityConfig.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-black dark:text-black mb-1">{audit.title}</h3>
                  <p className="text-sm text-black dark:text-black capitalize mb-3">
                    {audit.category}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(audit)}
                    className="p-1 text-black hover:text-black dark:hover:text-black"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(audit.id)}
                    className="p-1 text-black hover:text-black dark:hover:text-black"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-black dark:text-black uppercase tracking-wide mb-1">
                    Current Boundary
                  </p>
                  <p className="text-sm text-black dark:text-black line-clamp-3">
                    {audit.current_boundary}
                  </p>
                </div>
                
                {audit.desired_boundary && (
                  <div>
                    <p className="text-xs font-medium text-black dark:text-black uppercase tracking-wide mb-1">
                      Desired Boundary
                    </p>
                    <p className="text-sm text-black dark:text-black line-clamp-3">
                      {audit.desired_boundary}
                    </p>
                  </div>
                )}

                {audit.action_steps && (audit.action_steps as string[]).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-black dark:text-black uppercase tracking-wide mb-1">
                      Action Steps
                    </p>
                    <ul className="text-sm text-black dark:text-black space-y-1">
                      {(audit.action_steps as string[]).slice(0, 2).map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-black mt-1">•</span>
                          <span className="line-clamp-1">{step}</span>
                        </li>
                      ))}
                      {(audit.action_steps as string[]).length > 2 && (
                        <li className="text-xs text-black dark:text-black">
                          +{(audit.action_steps as string[]).length - 2} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-black dark:text-black">
                    Created {new Date(audit.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {getFilteredAudits().length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-black mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black dark:text-black mb-2">
            No boundary audits found
          </h3>
          <p className="text-black dark:text-black mb-4">
            Start by creating your first boundary audit to track your personal boundaries.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition"
          >
            Create Your First Audit
          </button>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-black dark:text-black mb-6">
                  {editingAudit ? 'Edit Boundary Audit' : 'New Boundary Audit'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-black mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="e.g., Work-life balance boundaries"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-black mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      >
                        {CATEGORIES.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-black mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      >
                        {PRIORITIES.map(priority => (
                          <option key={priority} value={priority}>
                            {PRIORITY_CONFIG[priority].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-black mb-2">
                      Current Boundary *
                    </label>
                    <textarea
                      value={formData.current_boundary}
                      onChange={(e) => setFormData(prev => ({ ...prev, current_boundary: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      rows={3}
                      placeholder="Describe your current boundary situation..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-black mb-2">
                      Desired Boundary
                    </label>
                    <textarea
                      value={formData.desired_boundary}
                      onChange={(e) => setFormData(prev => ({ ...prev, desired_boundary: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      rows={3}
                      placeholder="What would your ideal boundary look like?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-black mb-2">
                      Action Steps
                    </label>
                    <div className="space-y-2">
                      {formData.action_steps.map((step, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => updateActionStep(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                            placeholder={`Action step ${index + 1}...`}
                          />
                          {formData.action_steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeActionStep(index)}
                              className="px-2 py-2 text-black hover:text-black"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addActionStep}
                        className="text-black hover:text-black text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Action Step
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-black mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>
                          {STATUS_CONFIG[status].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-black dark:text-black rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : editingAudit ? (
                        'Update Audit'
                      ) : (
                        'Create Audit'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}