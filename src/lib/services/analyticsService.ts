import axios from '../axios';

export interface ReportType {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ReportColumn {
  key: string;
  header: string;
}

export interface ReportSummary {
  [key: string]: any;
}

export interface ReportData {
  title: string;
  period: string;
  columns: ReportColumn[];
  data: any[];
  summary: ReportSummary;
}

export interface ExportData {
  filename: string;
  download_url: string;
  file_size: number;
}

class AnalyticsService {
  async getReportTypes(): Promise<ReportType[]> {
    const response = await axios.get('/report-types');
    return response.data.data;
  }

  async generateReport(
    reportType: string,
    startDate?: string,
    endDate?: string,
    filters?: Record<string, any>
  ): Promise<ReportData> {
    const response = await axios.post('/generate-report', {
      report_type: reportType,
      start_date: startDate,
      end_date: endDate,
      filters: filters || {}
    });
    return response.data.data;
  }

  async exportReport(
    reportType: string,
    format: 'excel' | 'csv',
    startDate?: string,
    endDate?: string,
    filters?: Record<string, any>
  ): Promise<void> {
    if (format === 'csv') {
      // Para CSV, hacer descarga directa
      const response = await axios.post('/export-report', {
        report_type: reportType,
        format,
        start_date: startDate,
        end_date: endDate,
        filters: filters || {}
      }, {
        responseType: 'blob'
      });
      
      this.downloadBlob(response.data, `${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      // Para Excel, obtener datos y generar archivo
      const response = await axios.post('/export-report', {
        report_type: reportType,
        format,
        start_date: startDate,
        end_date: endDate,
        filters: filters || {}
      });
      
      const exportData = response.data.data;
      const binaryString = atob(exportData.content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: exportData.mime_type });
      this.downloadBlob(blob, exportData.filename);
    }
  }

  // Método para descargar blob
  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // Método para formatear valores monetarios
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Método para formatear números
  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-CO').format(value);
  }

  // Método para formatear fechas
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CO');
  }
}

export default new AnalyticsService(); 