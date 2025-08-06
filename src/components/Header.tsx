import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();



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