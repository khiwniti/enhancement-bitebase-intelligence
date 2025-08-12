/**
 * Advanced Export Service for BiteBase Intelligence
 * Handles PDF, Excel, CSV, and image exports with professional formatting
 */

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'png' | 'svg'
  filename?: string
  includeCharts?: boolean
  includeMetadata?: boolean
  dateRange?: {
    start: string
    end: string
  }
  filters?: Record<string, any>
}

interface ReportData {
  title: string
  subtitle?: string
  data: any[]
  charts?: Array<{
    type: 'line' | 'bar' | 'pie' | 'heatmap'
    title: string
    data: any[]
    config?: any
  }>
  metadata?: {
    generated_at: string
    generated_by: string
    restaurant_id: string
    report_type: string
  }
}

class ExportService {
  private static instance: ExportService
  
  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService()
    }
    return ExportService.instance
  }

  // Export dashboard data to various formats
  async exportDashboard(
    reportData: ReportData, 
    options: ExportOptions
  ): Promise<void> {
    try {
      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(reportData, options)
          break
        case 'excel':
          await this.exportToExcel(reportData, options)
          break
        case 'csv':
          await this.exportToCSV(reportData, options)
          break
        case 'png':
          await this.exportToPNG(reportData, options)
          break
        case 'svg':
          await this.exportToSVG(reportData, options)
          break
        default:
          throw new Error(`Unsupported export format: ${options.format}`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }

  // PDF Export with professional formatting
  private async exportToPDF(reportData: ReportData, options: ExportOptions): Promise<void> {
    // In production, would use jsPDF or similar library
    console.log('Generating PDF report...')
    
    const pdfContent = this.generatePDFContent(reportData, options)
    const blob = new Blob([pdfContent], { type: 'application/pdf' })
    
    this.downloadFile(blob, options.filename || 'bitebase-report.pdf')
  }

  // Excel Export with multiple sheets
  private async exportToExcel(reportData: ReportData, options: ExportOptions): Promise<void> {
    // In production, would use SheetJS or similar library
    console.log('Generating Excel report...')
    
    const excelData = this.generateExcelData(reportData, options)
    const csvContent = this.convertToCSV(excelData)
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' })
    
    this.downloadFile(blob, options.filename || 'bitebase-report.xlsx')
  }

  // CSV Export
  private async exportToCSV(reportData: ReportData, options: ExportOptions): Promise<void> {
    console.log('Generating CSV export...')
    
    const csvContent = this.convertToCSV(reportData.data)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    
    this.downloadFile(blob, options.filename || 'bitebase-data.csv')
  }

  // PNG Export (for charts and visualizations)
  private async exportToPNG(reportData: ReportData, options: ExportOptions): Promise<void> {
    console.log('Generating PNG export...')
    
    // In production, would capture canvas or SVG and convert to PNG
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 800
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Draw report content to canvas
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = '#000000'
      ctx.font = '24px Arial'
      ctx.fillText(reportData.title, 50, 50)
      
      ctx.font = '16px Arial'
      ctx.fillText('BiteBase Intelligence Report', 50, 80)
      ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 50, 110)
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        this.downloadFile(blob, options.filename || 'bitebase-chart.png')
      }
    }, 'image/png')
  }

  // SVG Export
  private async exportToSVG(reportData: ReportData, options: ExportOptions): Promise<void> {
    console.log('Generating SVG export...')
    
    const svgContent = this.generateSVGContent(reportData, options)
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    
    this.downloadFile(blob, options.filename || 'bitebase-chart.svg')
  }

  // Generate PDF content
  private generatePDFContent(reportData: ReportData, options: ExportOptions): string {
    // Mock PDF content - in production would use proper PDF library
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
50 750 Td
(${reportData.title}) Tj
0 -20 Td
(BiteBase Intelligence Report) Tj
0 -20 Td
(Generated: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
356
%%EOF`
  }

  // Generate Excel data structure
  private generateExcelData(reportData: ReportData, options: ExportOptions): any[] {
    const sheets = []
    
    // Summary sheet
    sheets.push({
      name: 'Summary',
      data: [
        ['Report Title', reportData.title],
        ['Generated', new Date().toLocaleDateString()],
        ['Restaurant ID', reportData.metadata?.restaurant_id || 'N/A'],
        ['Report Type', reportData.metadata?.report_type || 'Dashboard'],
        [''],
        ['Key Metrics'],
        ...this.extractKeyMetrics(reportData.data)
      ]
    })
    
    // Data sheet
    sheets.push({
      name: 'Data',
      data: [
        Object.keys(reportData.data[0] || {}),
        ...reportData.data.map(row => Object.values(row))
      ]
    })
    
    // Charts sheet (if included)
    if (options.includeCharts && reportData.charts) {
      sheets.push({
        name: 'Charts',
        data: reportData.charts.map(chart => [
          chart.title,
          chart.type,
          JSON.stringify(chart.data)
        ])
      })
    }
    
    return sheets
  }

  // Convert data to CSV format
  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ]
    
    return csvRows.join('\n')
  }

  // Generate SVG content
  private generateSVGContent(reportData: ReportData, options: ExportOptions): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  
  <!-- Title -->
  <text x="50" y="50" font-family="Arial" font-size="24" font-weight="bold" fill="black">
    ${reportData.title}
  </text>
  
  <!-- Subtitle -->
  <text x="50" y="80" font-family="Arial" font-size="16" fill="gray">
    BiteBase Intelligence Report
  </text>
  
  <!-- Generated date -->
  <text x="50" y="110" font-family="Arial" font-size="14" fill="gray">
    Generated: ${new Date().toLocaleDateString()}
  </text>
  
  <!-- Sample chart area -->
  <rect x="50" y="150" width="700" height="400" fill="none" stroke="gray" stroke-width="1"/>
  <text x="400" y="350" font-family="Arial" font-size="16" text-anchor="middle" fill="gray">
    Chart visualization would be rendered here
  </text>
</svg>`
  }

  // Extract key metrics from data
  private extractKeyMetrics(data: any[]): any[][] {
    if (!data || data.length === 0) return []

    const metrics: any[][] = []
    const numericFields = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number'
    )
    
    numericFields.forEach(field => {
      const values = data.map(row => row[field]).filter(val => typeof val === 'number')
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0)
        const avg = sum / values.length
        const max = Math.max(...values)
        const min = Math.min(...values)
        
        metrics.push([`${field} - Total`, sum.toFixed(2)])
        metrics.push([`${field} - Average`, avg.toFixed(2)])
        metrics.push([`${field} - Maximum`, max.toFixed(2)])
        metrics.push([`${field} - Minimum`, min.toFixed(2)])
        metrics.push([''])
      }
    })
    
    return metrics
  }

  // Download file helper
  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Generate report from dashboard data
  generateReportData(
    title: string,
    dashboardData: any,
    restaurantId: string,
    reportType: string
  ): ReportData {
    return {
      title,
      subtitle: 'Comprehensive Business Intelligence Report',
      data: Array.isArray(dashboardData) ? dashboardData : [dashboardData],
      metadata: {
        generated_at: new Date().toISOString(),
        generated_by: 'BiteBase Intelligence',
        restaurant_id: restaurantId,
        report_type: reportType
      }
    }
  }

  // Quick export methods for common use cases
  async exportMenuEngineering(data: any[], restaurantId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<void> {
    const reportData = this.generateReportData(
      'Menu Engineering Analysis',
      data,
      restaurantId,
      'menu_engineering'
    )
    
    await this.exportDashboard(reportData, {
      format,
      filename: `menu-engineering-${restaurantId}-${new Date().toISOString().split('T')[0]}.${format}`,
      includeCharts: true,
      includeMetadata: true
    })
  }

  async exportRevenueForecasting(data: any[], restaurantId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<void> {
    const reportData = this.generateReportData(
      'Revenue Forecasting Report',
      data,
      restaurantId,
      'revenue_forecasting'
    )
    
    await this.exportDashboard(reportData, {
      format,
      filename: `revenue-forecast-${restaurantId}-${new Date().toISOString().split('T')[0]}.${format}`,
      includeCharts: true,
      includeMetadata: true
    })
  }

  async exportCustomerSegmentation(data: any[], restaurantId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<void> {
    const reportData = this.generateReportData(
      'Customer Segmentation Analysis',
      data,
      restaurantId,
      'customer_segmentation'
    )
    
    await this.exportDashboard(reportData, {
      format,
      filename: `customer-segments-${restaurantId}-${new Date().toISOString().split('T')[0]}.${format}`,
      includeCharts: true,
      includeMetadata: true
    })
  }
}

export const exportService = ExportService.getInstance()
export type { ExportOptions, ReportData }
