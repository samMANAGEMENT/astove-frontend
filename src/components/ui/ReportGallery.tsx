import React from 'react';
import { Badge } from './index';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Users, DollarSign, TrendingUp, Building2, Info, Zap } from 'lucide-react';

interface ReportType {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface ReportGalleryProps {
  reportTypes: ReportType[];
  onSelectReport: (reportId: string) => void;
  selectedReport?: string;
  className?: string;
}

const ReportGallery: React.FC<ReportGalleryProps> = ({
  reportTypes,
  onSelectReport,
  selectedReport,
  className = ""
}) => {
  const getReportTypeIcon = (category: string): LucideIcon => {
    switch (category) {
      case 'servicios':
        return BarChart3;
      case 'operadores':
        return Users;
      case 'financiero':
        return DollarSign;
      case 'tendencias':
        return TrendingUp;
      case 'entidades':
        return Building2;
      default:
        return BarChart3;
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

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'servicios':
        return 'Análisis de servicios y rendimiento';
      case 'operadores':
        return 'Métricas de personal y productividad';
      case 'financiero':
        return 'Reportes económicos y ganancias';
      case 'tendencias':
        return 'Análisis temporal y patrones';
      case 'entidades':
        return 'Rendimiento por ubicación';
      default:
        return 'Análisis general';
    }
  };

  return (
    <div className={className}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Zap className="w-6 h-6 mr-2 text-blue-600" />
          Tipos de Reportes Disponibles
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Selecciona un reporte para comenzar tu análisis. Cada reporte está diseñado para proporcionar insights específicos sobre diferentes aspectos de tu negocio.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((type) => {
          const Icon = getReportTypeIcon(type.category);
          const isSelected = selectedReport === type.id;
          
          return (
            <div 
              key={type.id} 
              className={`group p-6 cursor-pointer transition-all duration-300 bg-white rounded-xl border-2 hover:shadow-xl ${
                isSelected 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transform hover:scale-105'
              }`}
              onClick={() => onSelectReport(type.id)}
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${getCategoryGradient(type.category)} text-white group-hover:scale-110 transition-transform duration-200 ${
                  isSelected ? 'scale-110' : ''
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg mb-1 transition-colors duration-200 ${
                    isSelected ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'
                  }`}>
                    {type.name}
                  </h3>
                  <Badge variant={getCategoryColor(type.category)} className="text-xs">
                    {type.category}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {type.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  {getCategoryDescription(type.category)}
                </div>
                {isSelected && (
                  <div className="text-blue-600 text-sm font-medium">
                    Seleccionado
                  </div>
                )}
              </div>
              
              <div className={`mt-4 pt-4 border-t transition-colors duration-200 ${
                isSelected ? 'border-blue-200' : 'border-gray-100'
              }`}>
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="w-3 h-3 mr-1" />
                  {isSelected ? 'Reporte activo' : 'Haz clic para seleccionar'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {reportTypes.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes disponibles</h3>
          <p className="text-gray-500">Los reportes se cargarán pronto.</p>
        </div>
      )}
    </div>
  );
};

export default ReportGallery;
