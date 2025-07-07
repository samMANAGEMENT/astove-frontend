import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Panel de control principal' };
      case '/usuarios/lista':
        return { title: 'Lista de Usuarios', subtitle: 'Gestiona todos los usuarios del sistema' };
      case '/usuarios/roles':
        return { title: 'Roles y Permisos', subtitle: 'Administra roles y permisos de usuarios' };
      case '/reportes/generales':
        return { title: 'Reportes Generales', subtitle: 'Genera y visualiza reportes' };
      case '/reportes/analytics':
        return { title: 'Analytics', subtitle: 'Análisis y métricas del sistema' };
      case '/configuracion/general':
        return { title: 'Configuración General', subtitle: 'Configuración del sistema' };
      case '/configuracion/database':
        return { title: 'Base de Datos', subtitle: 'Configuración de la base de datos' };
      default:
        return { title: title || 'Página', subtitle: subtitle || 'Descripción de la página' };
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-end">
        
        <div className="flex items-center space-x-4">
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 