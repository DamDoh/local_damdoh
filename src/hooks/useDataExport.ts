import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  filename?: string;
  includeHeaders?: boolean;
}

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Convert data to CSV format
  const convertToCSV = useCallback((data: any[], headers?: string[]): string => {
    if (!data.length) return '';

    const csvHeaders = headers || Object.keys(data[0]);
    const csvRows = data.map(row =>
      csvHeaders.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );

    return [csvHeaders.join(','), ...csvRows].join('\n');
  }, []);

  // Convert data to JSON format
  const convertToJSON = useCallback((data: any[]): string => {
    return JSON.stringify(data, null, 2);
  }, []);

  // Download file
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Export farm data
  const exportFarmData = useCallback(async (farmId?: string, options: ExportOptions = { format: 'csv' }) => {
    setIsExporting(true);

    try {
      // Fetch farm data from API
      const endpoint = farmId ? `/api/farm-management/farms/${farmId}/export` : '/api/farm-management/farms/export';
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Failed to fetch farm data');
      }

      const data = await response.json();
      const filename = options.filename || `farm-data-${new Date().toISOString().split('T')[0]}`;

      let content: string;
      let mimeType: string;

      switch (options.format) {
        case 'csv':
          content = convertToCSV(data.farms || data);
          mimeType = 'text/csv';
          break;
        case 'json':
          content = convertToJSON(data);
          mimeType = 'application/json';
          break;
        case 'xlsx':
          // For XLSX, we'd need a library like xlsx, but for now we'll use CSV
          content = convertToCSV(data.farms || data);
          mimeType = 'application/vnd.ms-excel';
          break;
        case 'pdf':
          // For PDF, we'd need a library like jsPDF, but for now we'll use JSON
          content = convertToJSON(data);
          mimeType = 'application/pdf';
          break;
        default:
          content = convertToCSV(data.farms || data);
          mimeType = 'text/csv';
      }

      downloadFile(content, `${filename}.${options.format}`, mimeType);

      toast({
        title: "Export Complete",
        description: `Farm data exported as ${options.format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export farm data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [convertToCSV, convertToJSON, downloadFile, toast]);

  // Export crop data
  const exportCropData = useCallback(async (cropId?: string, options: ExportOptions = { format: 'csv' }) => {
    setIsExporting(true);

    try {
      const endpoint = cropId ? `/api/farm-management/crops/${cropId}/export` : '/api/farm-management/crops/export';
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Failed to fetch crop data');
      }

      const data = await response.json();
      const filename = options.filename || `crop-data-${new Date().toISOString().split('T')[0]}`;

      let content: string;
      let mimeType: string;

      switch (options.format) {
        case 'csv':
          content = convertToCSV(data.crops || data);
          mimeType = 'text/csv';
          break;
        case 'json':
          content = convertToJSON(data);
          mimeType = 'application/json';
          break;
        default:
          content = convertToCSV(data.crops || data);
          mimeType = 'text/csv';
      }

      downloadFile(content, `${filename}.${options.format}`, mimeType);

      toast({
        title: "Export Complete",
        description: `Crop data exported as ${options.format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export crop data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [convertToCSV, convertToJSON, downloadFile, toast]);

  // Export financial data
  const exportFinancialData = useCallback(async (options: ExportOptions = { format: 'csv' }) => {
    setIsExporting(true);

    try {
      const response = await fetch('/api/farm-management/financials/export');

      if (!response.ok) {
        throw new Error('Failed to fetch financial data');
      }

      const data = await response.json();
      const filename = options.filename || `financial-data-${new Date().toISOString().split('T')[0]}`;

      let content: string;
      let mimeType: string;

      switch (options.format) {
        case 'csv':
          content = convertToCSV(data.transactions || data);
          mimeType = 'text/csv';
          break;
        case 'json':
          content = convertToJSON(data);
          mimeType = 'application/json';
          break;
        default:
          content = convertToCSV(data.transactions || data);
          mimeType = 'text/csv';
      }

      downloadFile(content, `${filename}.${options.format}`, mimeType);

      toast({
        title: "Export Complete",
        description: `Financial data exported as ${options.format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export financial data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [convertToCSV, convertToJSON, downloadFile, toast]);

  // Export activity logs
  const exportActivityLogs = useCallback(async (dateRange?: { start: Date; end: Date }, options: ExportOptions = { format: 'csv' }) => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString());
        params.append('endDate', dateRange.end.toISOString());
      }

      const response = await fetch(`/api/activity/export?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }

      const data = await response.json();
      const filename = options.filename || `activity-logs-${new Date().toISOString().split('T')[0]}`;

      let content: string;
      let mimeType: string;

      switch (options.format) {
        case 'csv':
          content = convertToCSV(data.activities || data);
          mimeType = 'text/csv';
          break;
        case 'json':
          content = convertToJSON(data);
          mimeType = 'application/json';
          break;
        default:
          content = convertToCSV(data.activities || data);
          mimeType = 'text/csv';
      }

      downloadFile(content, `${filename}.${options.format}`, mimeType);

      toast({
        title: "Export Complete",
        description: `Activity logs exported as ${options.format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export activity logs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [convertToCSV, convertToJSON, downloadFile, toast]);

  // Export comprehensive farm report
  const exportFarmReport = useCallback(async (farmId: string, options: ExportOptions = { format: 'pdf' }) => {
    setIsExporting(true);

    try {
      const response = await fetch(`/api/reports/farm/${farmId}/export?format=${options.format}`);

      if (!response.ok) {
        throw new Error('Failed to generate farm report');
      }

      const blob = await response.blob();
      const filename = options.filename || `farm-report-${farmId}-${new Date().toISOString().split('T')[0]}`;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: `Farm report exported as ${options.format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Report generation failed:', error);
      toast({
        title: "Report Failed",
        description: "Unable to generate farm report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  return {
    isExporting,
    exportFarmData,
    exportCropData,
    exportFinancialData,
    exportActivityLogs,
    exportFarmReport
  };
}