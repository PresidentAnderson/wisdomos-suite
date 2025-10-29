'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Database, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Package,
  Clock,
  FileJson,
  FileText as FileCsv,
  Image,
  Share2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/lib/database';
import { format } from 'date-fns';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  fileExtension: string;
  mimeType: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'json',
    name: 'JSON Complete',
    description: 'Full data export with all metadata and relationships',
    icon: <FileJson className="w-5 h-5 text-black" />,
    fileExtension: 'json',
    mimeType: 'application/json'
  },
  {
    id: 'csv',
    name: 'CSV Data',
    description: 'Spreadsheet-compatible format for analysis',
    icon: <FileCsv className="w-5 h-5 text-black" />,
    fileExtension: 'csv',
    mimeType: 'text/csv'
  },
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Formatted report with insights and visualizations',
    icon: <FileText className="w-5 h-5 text-black" />,
    fileExtension: 'pdf',
    mimeType: 'application/pdf'
  }
];

interface ExportOptions {
  includePersonalData: boolean;
  includeAnalytics: boolean;
  includeMedia: boolean;
  dateRange: 'all' | 'year' | 'month' | 'week';
  anonymize: boolean;
}

export default function DataExportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includePersonalData: true,
    includeAnalytics: true,
    includeMedia: false,
    dateRange: 'all',
    anonymize: false
  });
  const [lastExport, setLastExport] = useState<Date | null>(null);
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  const handleExport = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user data based on options
      const data = await analyticsApi.exportUserData(user.id);
      
      // Apply filters based on options
      let filteredData = data;
      
      if (exportOptions.dateRange !== 'all') {
        const cutoffDate = new Date();
        switch (exportOptions.dateRange) {
          case 'week':
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            break;
          case 'year':
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
            break;
        }
        
        // Filter data by date range
        Object.keys(filteredData.data).forEach(key => {
          if (Array.isArray(filteredData.data[key])) {
            filteredData.data[key] = filteredData.data[key].filter((item: any) => 
              new Date(item.created_at) >= cutoffDate
            );
          }
        });
      }

      // Remove personal data if anonymization is requested
      if (exportOptions.anonymize || !exportOptions.includePersonalData) {
        // Anonymize or remove personal identifiers
        filteredData.userId = 'anonymized';
        Object.keys(filteredData.data).forEach(key => {
          if (Array.isArray(filteredData.data[key])) {
            filteredData.data[key] = filteredData.data[key].map((item: any) => ({
              ...item,
              user_id: 'anonymized',
              // Remove any other PII fields
            }));
          }
        });
      }

      // Generate filename
      const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
      const filename = `wisdomos-export-${timestamp}.${exportFormats.find(f => f.id === selectedFormat)?.fileExtension}`;

      // Create and download file based on format
      let content: string;
      let mimeType: string;

      switch (selectedFormat) {
        case 'json':
          content = JSON.stringify(filteredData, null, 2);
          mimeType = 'application/json';
          break;
          
        case 'csv':
          content = convertToCSV(filteredData);
          mimeType = 'text/csv';
          break;
          
        case 'pdf':
          content = await generatePDFContent(filteredData);
          mimeType = 'application/pdf';
          break;
          
        default:
          content = JSON.stringify(filteredData, null, 2);
          mimeType = 'application/json';
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update export history
      const exportRecord = {
        id: crypto.randomUUID(),
        date: new Date(),
        format: selectedFormat,
        filename,
        size: blob.size,
        options: exportOptions
      };
      
      setExportHistory(prev => [exportRecord, ...prev.slice(0, 9)]); // Keep last 10
      setLastExport(new Date());

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion for boundary audits
    const boundaryAudits = data.data.boundaryAudits || [];
    const headers = ['Date', 'Title', 'Category', 'Status', 'Priority'];
    const rows = boundaryAudits.map((audit: any) => [
      format(new Date(audit.created_at), 'yyyy-MM-dd'),
      audit.title,
      audit.category,
      audit.status,
      audit.priority
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generatePDFContent = async (data: any): Promise<string> => {
    // For demo purposes, return JSON. In reality, you'd use a PDF library
    return JSON.stringify(data, null, 2);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-black mb-2">
            Export Your Data
          </h1>
          <p className="text-black dark:text-black">
            Download your wisdom journey data in various formats for backup or analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Export Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                Choose Export Format
              </h3>
              <div className="space-y-3">
                {exportFormats.map((format) => (
                  <motion.div
                    key={format.id}
                    whileHover={{ scale: 1.01 }}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all
                      ${selectedFormat === format.id
                        ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {format.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-black dark:text-black">
                            {format.name}
                          </h4>
                          {selectedFormat === format.id && (
                            <CheckCircle className="w-4 h-4 text-black" />
                          )}
                        </div>
                        <p className="text-sm text-black dark:text-black mt-1">
                          {format.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                Export Options
              </h3>
              
              {/* What to Include */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-black dark:text-black mb-3">
                    What to include:
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includePersonalData}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          includePersonalData: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-black focus:ring-purple-500"
                      />
                      <span className="text-sm text-black dark:text-black">
                        Personal data and content
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeAnalytics}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          includeAnalytics: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-black focus:ring-purple-500"
                      />
                      <span className="text-sm text-black dark:text-black">
                        Analytics and statistics
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMedia}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          includeMedia: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-black focus:ring-purple-500"
                      />
                      <span className="text-sm text-black dark:text-black">
                        Media files and attachments
                      </span>
                    </label>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h4 className="font-medium text-black dark:text-black mb-3">
                    Date range:
                  </h4>
                  <select
                    value={exportOptions.dateRange}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: e.target.value as any
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-black"
                  >
                    <option value="all">All time</option>
                    <option value="year">Last year</option>
                    <option value="month">Last month</option>
                    <option value="week">Last week</option>
                  </select>
                </div>

                {/* Privacy Options */}
                <div>
                  <h4 className="font-medium text-black dark:text-black mb-3">
                    Privacy:
                  </h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.anonymize}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        anonymize: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-black focus:ring-purple-500"
                    />
                    <span className="text-sm text-black dark:text-black">
                      Anonymize personal identifiers
                    </span>
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleExport}
                  disabled={loading || !user}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-black rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {loading ? 'Exporting...' : 'Export Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Export Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                Export Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-sm font-medium text-black dark:text-black">
                      Data Ready
                    </p>
                    <p className="text-xs text-black dark:text-black">
                      All your data is available for export
                    </p>
                  </div>
                </div>
                {lastExport && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Clock className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-sm font-medium text-black dark:text-black">
                        Last Export
                      </p>
                      <p className="text-xs text-black dark:text-black">
                        {format(lastExport, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                Your Data Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-black dark:text-black">Boundary Audits:</span>
                  <span className="font-medium text-black dark:text-black">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black dark:text-black">Upset Docs:</span>
                  <span className="font-medium text-black dark:text-black">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black dark:text-black">Fulfillment Displays:</span>
                  <span className="font-medium text-black dark:text-black">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black dark:text-black">Autobiography Entries:</span>
                  <span className="font-medium text-black dark:text-black">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black dark:text-black">Achievements:</span>
                  <span className="font-medium text-black dark:text-black">0</span>
                </div>
              </div>
            </div>

            {/* Export History */}
            {exportHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                  Recent Exports
                </h3>
                <div className="space-y-2">
                  {exportHistory.slice(0, 5).map((export_) => (
                    <div
                      key={export_.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Package className="w-4 h-4 text-black" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black dark:text-black truncate">
                          {export_.filename}
                        </p>
                        <p className="text-xs text-black dark:text-black">
                          {format(export_.date, 'MMM dd, HH:mm')} • {formatFileSize(export_.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-black mt-0.5" />
                <div>
                  <h4 className="font-medium text-black dark:text-black mb-2">
                    About Data Export
                  </h4>
                  <ul className="text-sm text-black dark:text-black space-y-1">
                    <li>• Your data remains private and secure</li>
                    <li>• Exports include only your personal content</li>
                    <li>• Files are generated locally in your browser</li>
                    <li>• No data is sent to external servers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}