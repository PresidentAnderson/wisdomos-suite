// Fulfillment Data Export Service
// Supports JSON, CSV, and PDF exports with date range and area filtering

import { gzip } from 'pako'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf'
  dateRange?: {
    start: Date
    end: Date
  }
  areaIds?: string[]
  includeHistory?: boolean
  includeTrends?: boolean
  includeDimensions?: boolean
}

export interface LifeAreaData {
  id: string
  name: string
  phoenixName?: string
  status: 'thriving' | 'attention' | 'collapsed' | 'THRIVING' | 'ATTENTION' | 'BREAKDOWN'
  score: number
  icon?: string
  description?: string
  lastAudit?: Date
  notes?: string
  commitments?: CommitmentData[]
  dimensions?: DimensionData[]
  history?: HistoryEntry[]
}

export interface CommitmentData {
  id: string
  title: string
  description?: string
  areaId: string
  relatedPeople?: string[]
  status: 'active' | 'completed' | 'pending'
  size: 'small' | 'medium' | 'large'
  createdAt: Date
  completedAt?: Date
}

export interface DimensionData {
  name: string
  score: number
  weight: number
  description?: string
}

export interface HistoryEntry {
  date: Date
  score: number
  status: 'thriving' | 'attention' | 'collapsed'
  note?: string
  event?: string
}

export interface ExportData {
  exportDate: Date
  userId: string
  globalFulfillmentScore: number
  lifeAreas: LifeAreaData[]
  summary: {
    totalAreas: number
    thrivingCount: number
    attentionCount: number
    collapsedCount: number
    totalCommitments: number
    activeCommitments: number
    completedCommitments: number
  }
}

export class FulfillmentExportService {

  /**
   * Export fulfillment data in the specified format
   */
  static async export(data: ExportData, options: ExportOptions): Promise<Blob> {
    // Filter data based on options
    const filteredData = this.filterData(data, options)

    switch (options.format) {
      case 'json':
        return this.exportJSON(filteredData, options)
      case 'csv':
        return this.exportCSV(filteredData, options)
      case 'pdf':
        return this.exportPDF(filteredData, options)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  /**
   * Filter data based on date range and area selection
   */
  private static filterData(data: ExportData, options: ExportOptions): ExportData {
    let filteredAreas = data.lifeAreas

    // Filter by area IDs
    if (options.areaIds && options.areaIds.length > 0) {
      filteredAreas = filteredAreas.filter(area => options.areaIds!.includes(area.id))
    }

    // Filter history by date range
    if (options.dateRange && options.includeHistory) {
      filteredAreas = filteredAreas.map(area => ({
        ...area,
        history: area.history?.filter(entry => {
          const entryDate = new Date(entry.date)
          return entryDate >= options.dateRange!.start && entryDate <= options.dateRange!.end
        })
      }))
    }

    // Remove optional fields if not requested
    if (!options.includeHistory) {
      filteredAreas = filteredAreas.map(area => {
        const { history, ...rest } = area
        return rest
      })
    }

    if (!options.includeDimensions) {
      filteredAreas = filteredAreas.map(area => {
        const { dimensions, ...rest } = area
        return rest
      })
    }

    // Recalculate summary
    const summary = this.calculateSummary(filteredAreas)

    return {
      ...data,
      lifeAreas: filteredAreas,
      summary
    }
  }

  /**
   * Calculate summary statistics
   */
  private static calculateSummary(areas: LifeAreaData[]) {
    const normalizeStatus = (status: string) => status.toLowerCase()

    return {
      totalAreas: areas.length,
      thrivingCount: areas.filter(a => normalizeStatus(a.status) === 'thriving').length,
      attentionCount: areas.filter(a => normalizeStatus(a.status) === 'attention').length,
      collapsedCount: areas.filter(a => normalizeStatus(a.status) === 'collapsed' || normalizeStatus(a.status) === 'breakdown').length,
      totalCommitments: areas.reduce((sum, a) => sum + (a.commitments?.length || 0), 0),
      activeCommitments: areas.reduce((sum, a) =>
        sum + (a.commitments?.filter(c => c.status === 'active').length || 0), 0),
      completedCommitments: areas.reduce((sum, a) =>
        sum + (a.commitments?.filter(c => c.status === 'completed').length || 0), 0)
    }
  }

  /**
   * Export as JSON (compressed with gzip)
   */
  private static async exportJSON(data: ExportData, options: ExportOptions): Promise<Blob> {
    const jsonString = JSON.stringify(data, null, 2)

    // Compress with gzip
    const compressed = gzip(jsonString)

    return new Blob([compressed], { type: 'application/gzip' })
  }

  /**
   * Export as CSV (tabular format for Excel)
   */
  private static async exportCSV(data: ExportData, options: ExportOptions): Promise<Blob> {
    const csvParts: string[] = []

    // Summary section
    csvParts.push('FULFILLMENT DATA EXPORT')
    csvParts.push(`Export Date,${data.exportDate.toISOString()}`)
    csvParts.push(`User ID,${data.userId}`)
    csvParts.push(`Global Fulfillment Score,${data.globalFulfillmentScore}`)
    csvParts.push('')

    // Summary statistics
    csvParts.push('SUMMARY STATISTICS')
    csvParts.push(`Total Life Areas,${data.summary.totalAreas}`)
    csvParts.push(`Thriving Areas,${data.summary.thrivingCount}`)
    csvParts.push(`Attention Areas,${data.summary.attentionCount}`)
    csvParts.push(`Collapsed Areas,${data.summary.collapsedCount}`)
    csvParts.push(`Total Commitments,${data.summary.totalCommitments}`)
    csvParts.push(`Active Commitments,${data.summary.activeCommitments}`)
    csvParts.push(`Completed Commitments,${data.summary.completedCommitments}`)
    csvParts.push('')

    // Life areas table
    csvParts.push('LIFE AREAS')
    const areaHeaders = ['ID', 'Name', 'Phoenix Name', 'Status', 'Score', 'Commitments', 'Notes']
    csvParts.push(areaHeaders.join(','))

    data.lifeAreas.forEach(area => {
      const row = [
        this.escapeCsv(area.id),
        this.escapeCsv(area.name),
        this.escapeCsv(area.phoenixName || ''),
        this.escapeCsv(area.status),
        area.score.toString(),
        (area.commitments?.length || 0).toString(),
        this.escapeCsv(area.notes || '')
      ]
      csvParts.push(row.join(','))
    })
    csvParts.push('')

    // Commitments table
    if (options.includeHistory !== false) {
      csvParts.push('COMMITMENTS')
      const commitmentHeaders = ['Area', 'Title', 'Description', 'Status', 'Size', 'Created', 'Completed']
      csvParts.push(commitmentHeaders.join(','))

      data.lifeAreas.forEach(area => {
        area.commitments?.forEach(commitment => {
          const row = [
            this.escapeCsv(area.name),
            this.escapeCsv(commitment.title),
            this.escapeCsv(commitment.description || ''),
            this.escapeCsv(commitment.status),
            this.escapeCsv(commitment.size),
            commitment.createdAt.toISOString(),
            commitment.completedAt?.toISOString() || ''
          ]
          csvParts.push(row.join(','))
        })
      })
      csvParts.push('')
    }

    // Dimensions table
    if (options.includeDimensions) {
      csvParts.push('DIMENSIONS')
      const dimensionHeaders = ['Area', 'Dimension', 'Score', 'Weight', 'Description']
      csvParts.push(dimensionHeaders.join(','))

      data.lifeAreas.forEach(area => {
        area.dimensions?.forEach(dimension => {
          const row = [
            this.escapeCsv(area.name),
            this.escapeCsv(dimension.name),
            dimension.score.toString(),
            dimension.weight.toString(),
            this.escapeCsv(dimension.description || '')
          ]
          csvParts.push(row.join(','))
        })
      })
      csvParts.push('')
    }

    // History table
    if (options.includeHistory) {
      csvParts.push('HISTORY')
      const historyHeaders = ['Area', 'Date', 'Score', 'Status', 'Event', 'Note']
      csvParts.push(historyHeaders.join(','))

      data.lifeAreas.forEach(area => {
        area.history?.forEach(entry => {
          const row = [
            this.escapeCsv(area.name),
            entry.date.toISOString(),
            entry.score.toString(),
            this.escapeCsv(entry.status),
            this.escapeCsv(entry.event || ''),
            this.escapeCsv(entry.note || '')
          ]
          csvParts.push(row.join(','))
        })
      })
    }

    const csvContent = csvParts.join('\n')
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  }

  /**
   * Export as PDF (formatted report)
   */
  private static async exportPDF(data: ExportData, options: ExportOptions): Promise<Blob> {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20

    // Phoenix theme colors
    const colors = {
      phoenixGold: [218, 165, 32],
      phoenixOrange: [255, 140, 0],
      phoenixRed: [220, 20, 60],
      phoenixIndigo: [75, 0, 130],
      green: [34, 197, 94],
      yellow: [234, 179, 8],
      red: [239, 68, 68],
      gray: [107, 114, 128]
    }

    // Helper to add a new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - 20) {
        doc.addPage()
        yPos = 20
        return true
      }
      return false
    }

    // COVER PAGE
    // Phoenix gradient header
    doc.setFillColor(...colors.phoenixOrange)
    doc.rect(0, 0, pageWidth, 60, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('Fulfillment Report', pageWidth / 2, 30, { align: 'center' })

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Phoenix Transformation System', pageWidth / 2, 45, { align: 'center' })

    // Global Fulfillment Score
    yPos = 80
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Global Fulfillment Score', pageWidth / 2, yPos, { align: 'center' })

    yPos += 15
    doc.setFontSize(48)
    const scoreColor = data.globalFulfillmentScore >= 80 ? colors.green :
                       data.globalFulfillmentScore >= 60 ? colors.yellow : colors.red
    doc.setTextColor(...scoreColor)
    doc.text(data.globalFulfillmentScore.toString(), pageWidth / 2, yPos, { align: 'center' })

    yPos += 5
    doc.setFontSize(12)
    doc.setTextColor(...colors.gray)
    doc.text('out of 100', pageWidth / 2, yPos, { align: 'center' })

    // Summary statistics
    yPos += 25
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary Statistics', 20, yPos)

    yPos += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const summaryData = [
      ['Total Life Areas', data.summary.totalAreas],
      ['Thriving Areas', data.summary.thrivingCount],
      ['Needs Attention', data.summary.attentionCount],
      ['Collapsed Areas', data.summary.collapsedCount],
      ['Active Commitments', data.summary.activeCommitments],
      ['Completed Commitments', data.summary.completedCommitments]
    ]

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: summaryData,
      theme: 'plain',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { halign: 'right', cellWidth: 30 }
      },
      margin: { left: 20, right: 20 }
    })

    // Export metadata
    yPos = (doc as any).lastAutoTable.finalY + 20
    doc.setFontSize(10)
    doc.setTextColor(...colors.gray)
    doc.text(`Export Date: ${data.exportDate.toLocaleString()}`, 20, yPos)
    yPos += 6
    doc.text(`User ID: ${data.userId}`, 20, yPos)

    if (options.dateRange) {
      yPos += 6
      doc.text(
        `Date Range: ${options.dateRange.start.toLocaleDateString()} - ${options.dateRange.end.toLocaleDateString()}`,
        20,
        yPos
      )
    }

    // LIFE AREAS PAGES
    data.lifeAreas.forEach((area, index) => {
      doc.addPage()
      yPos = 20

      // Area header with colored bar
      const statusColor = area.status.toLowerCase() === 'thriving' ? colors.green :
                         area.status.toLowerCase() === 'attention' ? colors.yellow : colors.red

      doc.setFillColor(...statusColor)
      doc.rect(0, 0, pageWidth, 40, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(`${area.icon || ''} ${area.name}`, 20, 20)

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(area.phoenixName || '', 20, 32)

      // Score and status
      yPos = 55
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Current Status', 20, yPos)

      yPos += 10
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Score: ${area.score}/100`, 20, yPos)

      yPos += 6
      doc.text(`Status: ${area.status}`, 20, yPos)

      // Description
      if (area.description) {
        yPos += 10
        doc.setFontSize(10)
        doc.setTextColor(...colors.gray)
        const descLines = doc.splitTextToSize(area.description, pageWidth - 40)
        doc.text(descLines, 20, yPos)
        yPos += descLines.length * 5
      }

      // Dimensions breakdown
      if (options.includeDimensions && area.dimensions && area.dimensions.length > 0) {
        checkPageBreak(50)
        yPos += 15
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Dimension Breakdown', 20, yPos)

        yPos += 5
        const dimensionData = area.dimensions.map(dim => [
          dim.name,
          dim.score.toString(),
          dim.weight.toString(),
          dim.description || ''
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Dimension', 'Score', 'Weight', 'Description']],
          body: dimensionData,
          theme: 'striped',
          headStyles: { fillColor: colors.phoenixOrange },
          margin: { left: 20, right: 20 }
        })

        yPos = (doc as any).lastAutoTable.finalY + 10
      }

      // Commitments
      if (area.commitments && area.commitments.length > 0) {
        checkPageBreak(50)
        yPos += 10
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Commitments', 20, yPos)

        yPos += 5
        const commitmentData = area.commitments.map(c => [
          c.title,
          c.status,
          c.size,
          c.createdAt.toLocaleDateString()
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Title', 'Status', 'Size', 'Created']],
          body: commitmentData,
          theme: 'striped',
          headStyles: { fillColor: colors.phoenixGold },
          margin: { left: 20, right: 20 }
        })

        yPos = (doc as any).lastAutoTable.finalY + 10
      }

      // Score history graph (simplified text-based for now)
      if (options.includeHistory && area.history && area.history.length > 0) {
        checkPageBreak(80)
        yPos += 10
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Score History', 20, yPos)

        yPos += 5
        const historyData = area.history
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-10) // Last 10 entries
          .map(h => [
            new Date(h.date).toLocaleDateString(),
            h.score.toString(),
            h.status,
            h.event || h.note || ''
          ])

        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Score', 'Status', 'Event/Note']],
          body: historyData,
          theme: 'striped',
          headStyles: { fillColor: colors.phoenixIndigo },
          margin: { left: 20, right: 20 }
        })

        yPos = (doc as any).lastAutoTable.finalY + 10
      }

      // Notes
      if (area.notes) {
        checkPageBreak(30)
        yPos += 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Notes', 20, yPos)

        yPos += 7
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...colors.gray)
        const noteLines = doc.splitTextToSize(area.notes, pageWidth - 40)
        doc.text(noteLines, 20, yPos)
      }

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(...colors.gray)
      doc.text(
        `Page ${index + 2} of ${data.lifeAreas.length + 1}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    })

    // Generate blob
    return doc.output('blob')
  }

  /**
   * Escape CSV values
   */
  private static escapeCsv(value: string): string {
    if (!value) return ''
    const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n')
    if (needsQuotes) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  /**
   * Generate filename with timestamp
   */
  static generateFilename(format: 'json' | 'csv' | 'pdf', userId: string = 'user'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const extension = format === 'json' ? 'json.gz' : format
    return `fulfillment-export_${userId}_${timestamp}.${extension}`
  }

  /**
   * Trigger download in browser
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Upload to Supabase storage
   */
  static async uploadToStorage(
    blob: Blob,
    filename: string,
    supabaseClient: any
  ): Promise<{ url: string; path: string }> {
    const path = `exports/${filename}`

    const { data, error } = await supabaseClient.storage
      .from('exports')
      .upload(path, blob, {
        cacheControl: '604800', // 7 days
        upsert: false
      })

    if (error) {
      throw new Error(`Failed to upload to storage: ${error.message}`)
    }

    const { data: urlData } = supabaseClient.storage
      .from('exports')
      .getPublicUrl(path)

    return {
      url: urlData.publicUrl,
      path: data.path
    }
  }

  /**
   * Estimate file size
   */
  static estimateFileSize(data: ExportData, format: 'json' | 'csv' | 'pdf'): string {
    const areasCount = data.lifeAreas.length
    const commitmentsCount = data.summary.totalCommitments
    const historyEntries = data.lifeAreas.reduce(
      (sum, area) => sum + (area.history?.length || 0),
      0
    )

    let estimatedBytes = 0

    switch (format) {
      case 'json':
        // Rough estimate: 1KB base + 500 bytes per area + 200 bytes per commitment + 150 bytes per history entry
        // Then compressed to ~30% size
        estimatedBytes = (1024 + (areasCount * 500) + (commitmentsCount * 200) + (historyEntries * 150)) * 0.3
        break
      case 'csv':
        // Rough estimate: 2KB base + 200 bytes per area + 150 bytes per commitment + 100 bytes per history entry
        estimatedBytes = 2048 + (areasCount * 200) + (commitmentsCount * 150) + (historyEntries * 100)
        break
      case 'pdf':
        // Rough estimate: 50KB base + 20KB per area (includes tables and formatting)
        estimatedBytes = 51200 + (areasCount * 20480)
        break
    }

    // Format as human-readable
    if (estimatedBytes < 1024) {
      return `${Math.round(estimatedBytes)} bytes`
    } else if (estimatedBytes < 1024 * 1024) {
      return `${Math.round(estimatedBytes / 1024)} KB`
    } else {
      return `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`
    }
  }
}
