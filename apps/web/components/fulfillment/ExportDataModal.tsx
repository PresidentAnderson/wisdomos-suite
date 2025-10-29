'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Calendar, Filter, FileText, FileJson, FileSpreadsheet, Check, Loader2, AlertCircle } from 'lucide-react'
import { FulfillmentExportService, ExportOptions, ExportData } from '@/lib/fulfillment-export'

interface ExportDataModalProps {
  isOpen: boolean
  onClose: () => void
  exportData: ExportData
  availableAreas: Array<{ id: string; name: string; icon?: string }>
  supabaseClient?: any
}

type ExportFormat = 'json' | 'csv' | 'pdf'

export default function ExportDataModal({
  isOpen,
  onClose,
  exportData,
  availableAreas,
  supabaseClient
}: ExportDataModalProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [dateRangeEnabled, setDateRangeEnabled] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [includeHistory, setIncludeHistory] = useState(true)
  const [includeDimensions, setIncludeDimensions] = useState(true)
  const [includeTrends, setIncludeTrends] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [uploadToStorage, setUploadToStorage] = useState(false)

  // Calculate estimated file size
  const estimatedSize = useMemo(() => {
    return FulfillmentExportService.estimateFileSize(exportData, format)
  }, [exportData, format])

  // Reset state when modal closes
  const handleClose = () => {
    if (!isExporting) {
      setExportSuccess(false)
      setExportError(null)
      onClose()
    }
  }

  // Toggle area selection
  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    )
  }

  // Select all areas
  const selectAllAreas = () => {
    setSelectedAreas(availableAreas.map(a => a.id))
  }

  // Deselect all areas
  const deselectAllAreas = () => {
    setSelectedAreas([])
  }

  // Handle export
  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(false)

    try {
      // Build export options
      const options: ExportOptions = {
        format,
        areaIds: selectedAreas.length > 0 ? selectedAreas : undefined,
        dateRange: dateRangeEnabled && startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate)
        } : undefined,
        includeHistory,
        includeDimensions,
        includeTrends
      }

      // Generate export
      const blob = await FulfillmentExportService.export(exportData, options)
      const filename = FulfillmentExportService.generateFilename(format, exportData.userId)

      // Upload to storage if requested and client is available
      if (uploadToStorage && supabaseClient) {
        try {
          const { url, path } = await FulfillmentExportService.uploadToStorage(
            blob,
            filename,
            supabaseClient
          )
          console.log('Uploaded to storage:', url)

          // Also download locally
          FulfillmentExportService.downloadBlob(blob, filename)
        } catch (uploadError: any) {
          console.error('Storage upload failed:', uploadError)
          // Fall back to local download
          FulfillmentExportService.downloadBlob(blob, filename)
        }
      } else {
        // Download locally
        FulfillmentExportService.downloadBlob(blob, filename)
      }

      setExportSuccess(true)

      // Auto-close after success
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (error: any) {
      console.error('Export failed:', error)
      setExportError(error.message || 'Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Validate form
  const isValid = useMemo(() => {
    if (dateRangeEnabled && (!startDate || !endDate)) {
      return false
    }
    if (dateRangeEnabled && new Date(startDate) > new Date(endDate)) {
      return false
    }
    return true
  }, [dateRangeEnabled, startDate, endDate])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-phoenix-gold/10 to-phoenix-orange/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-phoenix-orange rounded-lg">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Export Fulfillment Data</h2>
                    <p className="text-sm text-gray-600">Download your complete fulfillment report</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isExporting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* JSON */}
                  <button
                    onClick={() => setFormat('json')}
                    disabled={isExporting}
                    className={`
                      p-4 border-2 rounded-xl transition-all
                      ${format === 'json'
                        ? 'border-phoenix-orange bg-phoenix-orange/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      disabled:opacity-50
                    `}
                  >
                    <FileJson className={`w-8 h-8 mx-auto mb-2 ${format === 'json' ? 'text-phoenix-orange' : 'text-gray-400'}`} />
                    <div className="text-sm font-medium text-gray-900">JSON</div>
                    <div className="text-xs text-gray-500 mt-1">Complete data dump (compressed)</div>
                  </button>

                  {/* CSV */}
                  <button
                    onClick={() => setFormat('csv')}
                    disabled={isExporting}
                    className={`
                      p-4 border-2 rounded-xl transition-all
                      ${format === 'csv'
                        ? 'border-phoenix-orange bg-phoenix-orange/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      disabled:opacity-50
                    `}
                  >
                    <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${format === 'csv' ? 'text-phoenix-orange' : 'text-gray-400'}`} />
                    <div className="text-sm font-medium text-gray-900">CSV</div>
                    <div className="text-xs text-gray-500 mt-1">Spreadsheet (Excel compatible)</div>
                  </button>

                  {/* PDF */}
                  <button
                    onClick={() => setFormat('pdf')}
                    disabled={isExporting}
                    className={`
                      p-4 border-2 rounded-xl transition-all
                      ${format === 'pdf'
                        ? 'border-phoenix-orange bg-phoenix-orange/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      disabled:opacity-50
                    `}
                  >
                    <FileText className={`w-8 h-8 mx-auto mb-2 ${format === 'pdf' ? 'text-phoenix-orange' : 'text-gray-400'}`} />
                    <div className="text-sm font-medium text-gray-900">PDF</div>
                    <div className="text-xs text-gray-500 mt-1">Formatted report</div>
                  </button>
                </div>
              </div>

              {/* Life Areas Multi-Select */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Life Areas to Include
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={selectAllAreas}
                    disabled={isExporting}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllAreas}
                    disabled={isExporting}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Deselect All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                  {availableAreas.map((area) => (
                    <label
                      key={area.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAreas.includes(area.id) || selectedAreas.length === 0}
                        onChange={() => toggleArea(area.id)}
                        disabled={isExporting}
                        className="rounded border-gray-300 text-phoenix-orange focus:ring-phoenix-orange"
                      />
                      <span className="text-sm text-gray-700">
                        {area.icon && <span className="mr-1">{area.icon}</span>}
                        {area.name}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedAreas.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">All areas will be included</p>
                )}
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={dateRangeEnabled}
                    onChange={(e) => setDateRangeEnabled(e.target.checked)}
                    disabled={isExporting}
                    className="rounded border-gray-300 text-phoenix-orange focus:ring-phoenix-orange"
                  />
                  <span className="text-sm font-medium text-gray-900">Filter by Date Range</span>
                </label>

                {dateRangeEnabled && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isExporting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-phoenix-orange focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isExporting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-phoenix-orange focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Include Options */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Include in Export
                </label>
                <div className="space-y-2 pl-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHistory}
                      onChange={(e) => setIncludeHistory(e.target.checked)}
                      disabled={isExporting}
                      className="rounded border-gray-300 text-phoenix-orange focus:ring-phoenix-orange"
                    />
                    <span className="text-sm text-gray-700">Score History</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDimensions}
                      onChange={(e) => setIncludeDimensions(e.target.checked)}
                      disabled={isExporting}
                      className="rounded border-gray-300 text-phoenix-orange focus:ring-phoenix-orange"
                    />
                    <span className="text-sm text-gray-700">Dimension Breakdown</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTrends}
                      onChange={(e) => setIncludeTrends(e.target.checked)}
                      disabled={isExporting}
                      className="rounded border-gray-300 text-phoenix-orange focus:ring-phoenix-orange"
                    />
                    <span className="text-sm text-gray-700">Trend Analysis</span>
                  </label>
                </div>
              </div>

              {/* Storage Option */}
              {supabaseClient && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadToStorage}
                      onChange={(e) => setUploadToStorage(e.target.checked)}
                      disabled={isExporting}
                      className="rounded border-gray-300 text-phoenix-orange focus:ring-phoenix-orange"
                    />
                    <span className="text-sm text-gray-700">Also upload to cloud storage (7-day expiration)</span>
                  </label>
                </div>
              )}

              {/* Estimated File Size */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Filter className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <div className="font-medium">Estimated file size: {estimatedSize}</div>
                    <div className="text-xs text-blue-700 mt-1">
                      {format === 'json' && 'Compressed with gzip for smaller downloads'}
                      {format === 'csv' && 'Compatible with Excel, Google Sheets, and other spreadsheet software'}
                      {format === 'pdf' && 'Professionally formatted report with Phoenix theme'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {exportSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-green-900">Export Successful!</div>
                      <div className="text-sm text-green-700">Your file has been downloaded.</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {exportError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-medium text-red-900">Export Failed</div>
                      <div className="text-sm text-red-700">{exportError}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleClose}
                  disabled={isExporting}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || !isValid}
                  className="px-5 py-2.5 bg-gradient-to-r from-phoenix-orange to-phoenix-red text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Export {format.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
