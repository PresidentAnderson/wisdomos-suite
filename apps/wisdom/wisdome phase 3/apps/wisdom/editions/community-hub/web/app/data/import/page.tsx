'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Database, 
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  FileJson,
  FileText as FileCsv,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  boundaryAuditApi, 
  upsetDocumentationApi, 
  fulfillmentDisplayApi,
  autobiographyApi 
} from '@/lib/database';

interface ImportFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  data?: any;
  errors?: string[];
  preview?: any;
}

interface ImportSummary {
  totalRecords: number;
  imported: number;
  skipped: number;
  errors: number;
  duplicates: number;
}

export default function DataImportPage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [importFiles, setImportFiles] = useState<ImportFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: ImportFile[] = acceptedFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      status: 'pending',
      progress: 0
    }));

    setImportFiles(prev => [...prev, ...newFiles]);

    // Process files for preview
    newFiles.forEach(importFile => {
      processFilePreview(importFile);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/csv': ['.csv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const processFilePreview = async (importFile: ImportFile) => {
    try {
      setImportFiles(prev => prev.map(f => 
        f.id === importFile.id ? { ...f, status: 'processing' } : f
      ));

      const text = await importFile.file.text();
      let data;
      let preview;

      if (importFile.file.type === 'application/json') {
        data = JSON.parse(text);
        preview = generateJSONPreview(data);
      } else if (importFile.file.type === 'text/csv' || importFile.file.name.endsWith('.csv')) {
        data = parseCSV(text);
        preview = generateCSVPreview(data);
      }

      setImportFiles(prev => prev.map(f => 
        f.id === importFile.id 
          ? { ...f, status: 'success', data, preview, progress: 100 }
          : f
      ));
    } catch (error) {
      setImportFiles(prev => prev.map(f => 
        f.id === importFile.id 
          ? { 
              ...f, 
              status: 'error', 
              errors: ['Failed to parse file: ' + (error as Error).message] 
            }
          : f
      ));
    }
  };

  const generateJSONPreview = (data: any) => {
    if (data.data) {
      // WisdomOS export format
      return {
        type: 'WisdomOS Export',
        summary: {
          boundaryAudits: data.data.boundaryAudits?.length || 0,
          upsetDocs: data.data.upsetDocumentations?.length || 0,
          fulfillmentDisplays: data.data.fulfillmentDisplays?.length || 0,
          autobiographyEntries: data.data.autobiographyEntries?.length || 0,
          achievements: data.data.achievements?.length || 0
        },
        sampleRecords: {
          boundaryAudits: data.data.boundaryAudits?.slice(0, 3) || [],
          upsetDocs: data.data.upsetDocumentations?.slice(0, 3) || []
        }
      };
    } else {
      // Generic JSON
      return {
        type: 'Generic JSON',
        keys: Object.keys(data).slice(0, 10),
        records: Array.isArray(data) ? data.length : 1
      };
    }
  };

  const generateCSVPreview = (data: any[]) => {
    return {
      type: 'CSV Data',
      records: data.length,
      columns: data.length > 0 ? Object.keys(data[0]) : [],
      sample: data.slice(0, 5)
    };
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      data.push(record);
    }

    return data;
  };

  const handleImport = async () => {
    if (!user) return;

    setImporting(true);
    const summary: ImportSummary = {
      totalRecords: 0,
      imported: 0,
      skipped: 0,
      errors: 0,
      duplicates: 0
    };

    try {
      for (const importFile of importFiles.filter(f => f.status === 'success' && f.data)) {
        setImportFiles(prev => prev.map(f => 
          f.id === importFile.id ? { ...f, status: 'processing', progress: 0 } : f
        ));

        const fileResult = await importFileData(importFile.data, user.id, (progress) => {
          setImportFiles(prev => prev.map(f => 
            f.id === importFile.id ? { ...f, progress } : f
          ));
        });

        summary.totalRecords += fileResult.total;
        summary.imported += fileResult.imported;
        summary.skipped += fileResult.skipped;
        summary.errors += fileResult.errors;
        summary.duplicates += fileResult.duplicates;

        setImportFiles(prev => prev.map(f => 
          f.id === importFile.id ? { ...f, status: 'success', progress: 100 } : f
        ));
      }

      setImportSummary(summary);
      
      addNotification({
        type: 'achievement',
        title: 'Data Import Complete!',
        message: `Successfully imported ${summary.imported} records`,
        icon: 'check',
        priority: 'high',
        actionUrl: '/dashboard',
        actionLabel: 'View Dashboard'
      });

    } catch (error) {
      console.error('Import error:', error);
      addNotification({
        type: 'system',
        title: 'Import Failed',
        message: 'There was an error importing your data. Please try again.',
        icon: 'alert',
        priority: 'high'
      });
    } finally {
      setImporting(false);
    }
  };

  const importFileData = async (data: any, userId: string, onProgress: (progress: number) => void) => {
    const result = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: 0,
      duplicates: 0
    };

    // Import WisdomOS export format
    if (data.data) {
      const datasets = [
        { name: 'boundaryAudits', api: boundaryAuditApi },
        { name: 'upsetDocumentations', api: upsetDocumentationApi },
        { name: 'fulfillmentDisplays', api: fulfillmentDisplayApi },
        { name: 'autobiographyEntries', api: autobiographyApi }
      ];

      let totalItems = 0;
      let processedItems = 0;

      // Count total items
      datasets.forEach(dataset => {
        totalItems += data.data[dataset.name]?.length || 0;
      });

      result.total = totalItems;

      // Import each dataset
      for (const dataset of datasets) {
        const items = data.data[dataset.name] || [];
        
        for (const item of items) {
          try {
            // Remove old IDs and add user ID
            const { id, created_at, updated_at, ...itemData } = item;
            const newItem = { ...itemData, user_id: userId };

            await (dataset.api as any).create(newItem);
            result.imported++;
          } catch (error) {
            result.errors++;
            console.error(`Error importing ${dataset.name} item:`, error);
          }

          processedItems++;
          onProgress(Math.round((processedItems / totalItems) * 100));
        }
      }
    } else {
      // Handle other formats
      result.total = Array.isArray(data) ? data.length : 1;
      result.skipped = result.total; // Skip unknown formats for now
    }

    return result;
  };

  const removeFile = (id: string) => {
    setImportFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setImportFiles([]);
    setImportSummary(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/json') return <FileJson className="w-5 h-5 text-black" />;
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) return <FileCsv className="w-5 h-5 text-black" />;
    return <FileText className="w-5 h-5 text-black" />;
  };

  const getStatusIcon = (status: ImportFile['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-black" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-black" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-black animate-spin" />;
      default: return <RefreshCw className="w-4 h-4 text-black" />;
    }
  };

  const validFiles = importFiles.filter(f => f.status === 'success' && f.data);
  const canImport = validFiles.length > 0 && !importing;

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
            Import Your Data
          </h1>
          <p className="text-black dark:text-black">
            Restore your wisdom journey from exported data files
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Import Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Drop Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                Upload Data Files
              </h3>
              
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                  ${isDragActive 
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-black' : 'text-black'}`} />
                
                {isDragActive ? (
                  <p className="text-black dark:text-black font-medium">
                    Drop your files here...
                  </p>
                ) : (
                  <div>
                    <p className="text-black dark:text-black font-medium mb-2">
                      Drop files here or click to browse
                    </p>
                    <p className="text-sm text-black dark:text-black">
                      Supports JSON, CSV files up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File List */}
            {importFiles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black dark:text-black">
                      Import Files ({importFiles.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-black dark:text-black hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {previewMode ? 'Hide' : 'Preview'}
                      </button>
                      <button
                        onClick={clearAll}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-black dark:text-black hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {importFiles.map((importFile) => (
                    <motion.div
                      key={importFile.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getFileIcon(importFile.file)}
                          <div>
                            <h4 className="font-medium text-black dark:text-black">
                              {importFile.file.name}
                            </h4>
                            <p className="text-sm text-black dark:text-black">
                              {(importFile.file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(importFile.status)}
                          <button
                            onClick={() => removeFile(importFile.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {importFile.status === 'processing' && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${importFile.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Errors */}
                      {importFile.errors && importFile.errors.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-black mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-black dark:text-black">
                                Errors found:
                              </p>
                              <ul className="text-xs text-black dark:text-black mt-1 space-y-1">
                                {importFile.errors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Preview */}
                      {previewMode && importFile.preview && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-2">
                          <h5 className="text-sm font-medium text-black dark:text-black mb-2">
                            Preview: {importFile.preview.type}
                          </h5>
                          
                          {importFile.preview.type === 'WisdomOS Export' && (
                            <div className="space-y-2 text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div>Boundary Audits: {importFile.preview.summary.boundaryAudits}</div>
                                <div>Upset Docs: {importFile.preview.summary.upsetDocs}</div>
                                <div>Fulfillment Displays: {importFile.preview.summary.fulfillmentDisplays}</div>
                                <div>Autobiography Entries: {importFile.preview.summary.autobiographyEntries}</div>
                              </div>
                            </div>
                          )}

                          {importFile.preview.type === 'CSV Data' && (
                            <div className="text-xs space-y-1">
                              <div>Records: {importFile.preview.records}</div>
                              <div>Columns: {importFile.preview.columns.join(', ')}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Import Button */}
                {canImport && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleImport}
                      disabled={!canImport}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-black rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {importing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      {importing ? 'Importing...' : `Import ${validFiles.length} File${validFiles.length !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Import Summary */}
            {importSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-black mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black dark:text-black mb-3">
                      Import Complete!
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-lg text-black dark:text-black">
                          {importSummary.totalRecords}
                        </div>
                        <div className="text-black dark:text-black">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-black dark:text-black">
                          {importSummary.imported}
                        </div>
                        <div className="text-black dark:text-black">Imported</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-black dark:text-black">
                          {importSummary.skipped}
                        </div>
                        <div className="text-black dark:text-black">Skipped</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-black dark:text-black">
                          {importSummary.errors}
                        </div>
                        <div className="text-black dark:text-black">Errors</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-black dark:text-black">
                          {importSummary.duplicates}
                        </div>
                        <div className="text-black dark:text-black">Duplicates</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supported Formats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                Supported Formats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <FileJson className="w-5 h-5 text-black" />
                  <div>
                    <h4 className="font-medium text-black dark:text-black">
                      WisdomOS Export
                    </h4>
                    <p className="text-sm text-black dark:text-black">
                      Complete data with all relationships
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <FileCsv className="w-5 h-5 text-black" />
                  <div>
                    <h4 className="font-medium text-black dark:text-black">
                      CSV Files
                    </h4>
                    <p className="text-sm text-black dark:text-black">
                      Spreadsheet data import
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Import Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-black mt-0.5" />
                <div>
                  <h4 className="font-medium text-black dark:text-black mb-2">
                    Import Guidelines
                  </h4>
                  <ul className="text-sm text-black dark:text-black space-y-1">
                    <li>• Backup your existing data first</li>
                    <li>• Files are processed in order uploaded</li>
                    <li>• Duplicates are automatically skipped</li>
                    <li>• Invalid records will be reported</li>
                    <li>• Import creates new entries only</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <a
                  href="/data/export"
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-black dark:text-black hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Your Data
                </a>
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-black dark:text-black hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Database className="w-4 h-4" />
                  View Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}