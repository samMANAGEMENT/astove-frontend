import React, { useState, useEffect } from 'react';
import { Card, Button, DataTable, Badge, Spinner } from '../components/ui';
import { 
  Download, 
  FileSpreadsheet, 
  BarChart3, 
  Filter, 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  AlertCircle,
  Zap,
  Target,
  TrendingDown,
  Activity,
  Clock,
  Settings
} from 'lucide-react';
import analyticsService from '../lib/services/analyticsService';
import type { ReportType, ReportData } from '../lib/services/analyticsService';
import entidadesService from '../lib/services/entidadesService';
import type { Entidad } from '../lib/services/entidadesService';

interface ReportFilters {
  entidad_id?: number;
}

const AnalyticsPage: React.FC = () => {
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
  const [showReportInfo, setShowReportInfo] = useState(false);
  const [quickDateRange, setQuickDateRange] = useState<string>('last_month');

  useEffect(() => {
    loadReportTypes();
    loadEntidades();
    setDefaultDates();
  }, []);

  const setDefaultDates = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    setStartDate(lastMonth.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  };

  const setQuickDates = (range: string) => {
    const now = new Date();
    let start: Date;
    
    switch (range) {
      case 'today':
        start = now;
        break;
      case 'yesterday':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last_week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'last_quarter':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last_year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
    setQuickDateRange(range);
  };

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
      setShowReportInfo(true);
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
        return <BarChart3 className="w-5 h-5" />;
      case 'operadores':
        return <Users className="w-5 h-5" />;
      case 'financiero':
        return <DollarSign className="w-5 h-5" />;
      case 'tendencias':
        return <TrendingUp className="w-5 h-5" />;
      case 'entidades':
        return <Building2 className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string): 'success' | 'warning' | 'info' | 'default' => {
    switch (category) {
      case 'servicios':
        return 'info';
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

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'servicios':
        return 'from-blue-500 to-blue-600';
      case 'operadores':
        return 'from-green-500 to-green-600';
      case 'financiero':
        return 'from-yellow-500 to-yellow-600';
      case 'tendencias':
        return 'from-purple-500 to-purple-600';
      case 'entidades':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-blue-500 to-blue-600';
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
      let icon = <DollarSign className="w-5 h-5" />;
      let colorClass = 'text-blue-600';
      
      if (typeof value === 'number') {
        if (key.includes('ingresos') || key.includes('monto') || key.includes('total')) {
          formattedValue = analyticsService.formatCurrency(value);
          icon = <TrendingUp className="w-5 h-5" />;
          colorClass = 'text-green-600';
        } else if (key.includes('gastos') || key.includes('pagos')) {
          formattedValue = analyticsService.formatCurrency(value);
          icon = <TrendingDown className="w-5 h-5" />;
          colorClass = 'text-red-600';
        } else if (key.includes('ganancia')) {
          formattedValue = analyticsService.formatCurrency(value);
          icon = <Target className="w-5 h-5" />;
          colorClass = value >= 0 ? 'text-green-600' : 'text-red-600';
        } else {
          formattedValue = analyticsService.formatNumber(value);
          icon = <Activity className="w-5 h-5" />;
          colorClass = 'text-blue-600';
        }
      }
      
      return { key, label, value: formattedValue, icon, colorClass };
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryItems.map((item) => (
          <Card key={item.key} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-blue-100 ${item.colorClass}`}>
                {item.icon}
              </div>
              <Badge variant="outline" className="text-xs">
                {item.label.split(' ').slice(0, 2).join(' ')}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuickDateButtons = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {[
        { key: 'today', label: 'Hoy' },
        { key: 'yesterday', label: 'Ayer' },
        { key: 'last_week', label: 'Última Semana' },
        { key: 'last_month', label: 'Último Mes' },
        { key: 'last_quarter', label: 'Último Trimestre' },
        { key: 'last_year', label: 'Último Año' }
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setQuickDates(key)}
          className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
            quickDateRange === key
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Mejorado */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📊 Analytics & Reportes</h1>
            <p className="text-blue-100 text-lg">
              Genera reportes detallados y análisis financieros de tu negocio
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-2xl font-bold">{reportTypes.length}</div>
              <div className="text-blue-100">Tipos de Reportes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Configuración Mejorado */}
      <Card className="p-8 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Configuración del Reporte
          </h2>
          <Button
            variant="outline"
            onClick={() => setShowReportInfo(!showReportInfo)}
            className="flex items-center"
          >
            {showReportInfo ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showReportInfo ? 'Ocultar Info' : 'Mostrar Info'}
          </Button>
        </div>

        {/* Información del Reporte Seleccionado */}
        {showReportInfo && selectedReport && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {(() => {
              const reportType = reportTypes.find(rt => rt.id === selectedReport);
              if (!reportType) return null;
              
              return (
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${getCategoryGradient(reportType.category)} text-white`}>
                    {getReportTypeIcon(reportType.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{reportType.name}</h3>
                    <p className="text-gray-600">{reportType.description}</p>
                  </div>
                                  <Badge variant={getCategoryColor(reportType.category)} className="text-sm">
                  {reportType.category}
                </Badge>
                </div>
              );
            })()}
          </div>
        )}

        {/* Selector de Fechas Rápidas */}
        {renderQuickDateButtons()}

        {/* Configuración Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
              Tipo de Reporte
            </label>
            <select
              value={selectedReport || ''}
              onChange={(e) => setSelectedReport(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
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
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-green-600" />
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ${
                startDate 
                  ? 'border-green-300 bg-green-50 text-gray-900' 
                  : 'border-gray-300 bg-gray-50 text-gray-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-red-600" />
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                endDate 
                  ? 'border-red-300 bg-red-50 text-gray-900' 
                  : 'border-gray-300 bg-gray-50 text-gray-500'
              }`}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading || !selectedReport}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filtros y Exportación */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-white hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setDefaultDates();
                setQuickDateRange('last_month');
              }}
              className="flex items-center bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>

          {reportData && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleExportReport('excel')}
                disabled={isExporting}
                className="flex items-center bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
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
                className="flex items-center bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
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

        {/* Filtros Expandibles */}
        {showFilters && (
          <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filtros Avanzados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Entidad (Opcional)
                </label>
                <select
                  value={filters.entidad_id?.toString() || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    entidad_id: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
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

      {/* Mensaje de Error Mejorado */}
      {error && (
        <Card className="p-6 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div className="text-red-800 font-medium">{error}</div>
          </div>
        </Card>
      )}

      {/* Resumen del Reporte Mejorado */}
      {reportData && renderSummaryCards()}

      {/* Tabla de Datos Mejorada */}
      {reportData && (
        <Card className="p-8 shadow-lg border-0">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{reportData.title}</h3>
                <p className="text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Período: {reportData.period}
                </p>
              </div>
              <Badge variant="success" className="text-sm">
                {reportData.data.length} registros
              </Badge>
            </div>
          </div>

          <DataTable
            data={reportData.data}
            columns={reportData.columns.map(col => ({
              key: col.key,
              header: col.header,
              render: (value: any) => formatColumnValue(value, col.key)
            }))}
            emptyMessage={
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay datos disponibles para el período seleccionado</p>
              </div>
            }
          />
        </Card>
      )}

      {/* Galería de Reportes Mejorada */}
      {!reportData && (
        <Card className="p-8 shadow-lg border-0">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">📈 Tipos de Reportes Disponibles</h3>
            <p className="text-gray-600">Selecciona un reporte para comenzar tu análisis</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((type) => (
              <div 
                key={type.id} 
                className="group p-6 cursor-pointer hover:shadow-xl transition-all duration-300 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transform hover:scale-105"
                onClick={() => setSelectedReport(type.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${getCategoryGradient(type.category)} text-white group-hover:scale-110 transition-transform duration-200`}>
                    {getReportTypeIcon(type.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {type.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {type.description}
                    </p>
                    <Badge variant={getCategoryColor(type.category)} className="text-xs">
                      {type.category}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <Info className="w-3 h-3 mr-1" />
                    Haz clic para seleccionar
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