import React, { useState, useEffect } from 'react';
import { Card, PageHeader, Button, Input, DataTable, Badge, Modal, Spinner } from '../components/ui';
import { Download, FileSpreadsheet, BarChart3, Calendar, Filter, Building2, Users, TrendingUp, DollarSign } from 'lucide-react';
import analyticsService from '../lib/services/analyticsService';
import type { ReportType, ReportData } from '../lib/services/analyticsService';
import entidadesService from '../lib/services/entidadesService';
import type { Entidad } from '../lib/services/entidadesService';
import { useAuth } from '../contexts/AuthContext';

interface ReportFilters {
  entidad_id?: number;
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadReportTypes();
    loadEntidades();
    // Establecer fechas por defecto (último mes)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    setStartDate(lastMonth.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  }, []);

  const loadReportTypes = async () => {
    try {
      const types = await analyticsService.getReportTypes();
      setReportTypes(types);
    } catch (error) {
      console.error('Error loading report types:', error);
      setError('Error al cargar los tipos de reportes');
    }
  };

  const loadEntidades = async () => {
    try {
      const entidadesData = await entidadesService.getEntidades();
      setEntidades(entidadesData);
    } catch (error) {
      console.error('Error loading entidades:', error);
      // No mostrar error aquí ya que es opcional
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      setError('Por favor selecciona un tipo de reporte');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await analyticsService.generateReport(
        selectedReport,
        startDate,
        endDate,
        filters
      );
      setReportData(data);
    } catch (error: any) {
      console.error('Error generating report:', error);
      setError(error.response?.data?.message || 'Error al generar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (format: 'excel' | 'csv') => {
    if (!selectedReport) {
      setError('Por favor selecciona un tipo de reporte');
      return;
    }

    setIsExporting(true);
    setError('');

    try {
      await analyticsService.exportReport(
        selectedReport,
        format,
        startDate,
        endDate,
        filters
      );
    } catch (error: any) {
      console.error('Error exporting report:', error);
      setError(error.response?.data?.message || 'Error al exportar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  const getReportTypeIcon = (category: string) => {
    switch (category) {
      case 'servicios':
        return <BarChart3 className="w-4 h-4" />;
      case 'operadores':
        return <Users className="w-4 h-4" />;
      case 'financiero':
        return <DollarSign className="w-4 h-4" />;
      case 'tendencias':
        return <TrendingUp className="w-4 h-4" />;
      case 'entidades':
        return <Building2 className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'servicios':
        return 'primary';
      case 'operadores':
        return 'success';
      case 'financiero':
        return 'warning';
      case 'tendencias':
        return 'info';
      case 'entidades':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatColumnValue = (value: any, columnKey: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Formatear valores monetarios
    if (typeof value === 'number' && columnKey.includes('ingresos') || 
        columnKey.includes('monto') || columnKey.includes('total') || 
        columnKey.includes('promedio') || columnKey.includes('pagos')) {
      return analyticsService.formatCurrency(value);
    }
    
    // Formatear números
    if (typeof value === 'number') {
      return analyticsService.formatNumber(value);
    }
    
    // Formatear fechas
    if (columnKey === 'fecha' && typeof value === 'string') {
      return analyticsService.formatDate(value);
    }
    
    return value;
  };

  const renderSummaryCards = () => {
    if (!reportData?.summary) return null;

    const summaryItems = Object.entries(reportData.summary).map(([key, value]) => {
      let label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      let formattedValue = value;
      
      if (typeof value === 'number') {
        if (key.includes('ingresos') || key.includes('monto') || key.includes('total')) {
          formattedValue = analyticsService.formatCurrency(value);
        } else {
          formattedValue = analyticsService.formatNumber(value);
        }
      }
      
      return { key, label, value: formattedValue };
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryItems.map((item) => (
          <Card key={item.key} className="p-4">
            <div className="text-sm text-gray-600 mb-1">{item.label}</div>
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Genera y exporta reportes detallados de tu negocio"
      />

      {/* Configuración del Reporte */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={selectedReport || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedReport(value);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedReport 
                  ? 'border-blue-300 bg-blue-50 text-gray-900' 
                  : 'border-gray-300 bg-gray-50 text-gray-500'
              }`}
            >
              <option value="" className="text-gray-500">Seleccionar reporte...</option>
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id} className="text-gray-900">
                  {type.name}
                </option>
              ))}
            </select>
            {reportTypes.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">Cargando tipos de reportes...</p>
            )}
            {selectedReport && (
              <p className="text-sm text-blue-600 mt-1">
                Seleccionado: {reportTypes.find(t => t.id === selectedReport)?.name || selectedReport}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                startDate 
                  ? 'border-blue-300 bg-blue-50 text-gray-900' 
                  : 'border-gray-300 bg-gray-50 text-gray-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                endDate 
                  ? 'border-blue-300 bg-blue-50 text-gray-900' 
                  : 'border-gray-300 bg-gray-50 text-gray-500'
              }`}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading || !selectedReport}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filtros adicionales */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>

          {reportData && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExportReport('excel')}
                disabled={isExporting}
                className="flex items-center"
              >
                {isExporting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                Exportar Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportReport('csv')}
                disabled={isExporting}
                className="flex items-center"
              >
                {isExporting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Exportar CSV
              </Button>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entidad (Opcional)
                </label>
                <select
                  value={filters.entidad_id?.toString() || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    entidad_id: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    filters.entidad_id 
                      ? 'border-blue-300 bg-blue-50 text-gray-900' 
                      : 'border-gray-300 bg-gray-50 text-gray-500'
                  }`}
                >
                  <option value="" className="text-gray-500">Todas las entidades</option>
                  {entidades.map((entidad) => (
                    <option key={entidad.id} value={entidad.id} className="text-gray-900">
                      {entidad.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Información del Reporte Seleccionado */}
      {selectedReport && (
        <Card className="p-4">
          {(() => {
            const reportType = reportTypes.find(rt => rt.id === selectedReport);
            if (!reportType) return null;
            
            return (
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  {getReportTypeIcon(reportType.category)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{reportType.name}</h3>
                  <p className="text-sm text-gray-600">{reportType.description}</p>
                </div>
                <Badge variant={getCategoryColor(reportType.category) as any}>
                  {reportType.category}
                </Badge>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="text-red-800">{error}</div>
        </Card>
      )}

      {/* Resumen del Reporte */}
      {reportData && renderSummaryCards()}

      {/* Tabla de Datos */}
      {reportData && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{reportData.title}</h3>
            <p className="text-sm text-gray-600">Período: {reportData.period}</p>
          </div>

          <DataTable
            data={reportData.data}
            columns={reportData.columns.map(col => ({
              key: col.key,
              header: col.header,
              render: (value: any) => formatColumnValue(value, col.key)
            }))}
            emptyMessage="No hay datos disponibles para el período seleccionado"
          />
        </Card>
      )}

      {/* Información de Tipos de Reportes */}
      {!reportData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Reportes Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((type) => (
              <div 
                key={type.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                onClick={() => setSelectedReport(type.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    {getReportTypeIcon(type.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    <Badge variant={getCategoryColor(type.category) as any}>
                      {type.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;