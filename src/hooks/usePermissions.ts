import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';

interface Permission {
  id: number;
  nombre: string;
  descripcion: string;
  modulo: string;
  estado: boolean;
}

interface ModulePermissions {
  [moduleName: string]: Permission[];
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermissions>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.role) {
        setIsLoading(false);
        return;
      }

      try {
        // Obtener permisos del rol desde el backend usando axios
        const response = await api.get('/roles/permissions');

        if (response.status === 200) {
          const data = response.data;
          
          // Organizar permisos por módulo
          const modulePermissions: ModulePermissions = {};
          data.forEach((permission: Permission) => {
            if (permission.estado) {
              if (!modulePermissions[permission.modulo]) {
                modulePermissions[permission.modulo] = [];
              }
              modulePermissions[permission.modulo].push(permission);
            }
          });
          
          setPermissions(modulePermissions);
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        // Fallback: usar permisos básicos basados en el rol
        setPermissions(getDefaultPermissions(user.role.nombre));
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [user]);

  const hasPermission = (permissionName: string): boolean => {
    if (!user?.role) return false;
    
    // Admin tiene todos los permisos
    if (user.role.nombre === 'admin') return true;
    
    // Buscar el permiso en todos los módulos
    return Object.values(permissions).some(modulePermissions =>
      modulePermissions.some(permission => 
        permission.nombre === permissionName && permission.estado
      )
    );
  };

  const hasModuleAccess = (moduleName: string): boolean => {
    if (!user?.role) return false;
    
    // Admin tiene acceso a todos los módulos
    if (user.role.nombre === 'admin') {
      return true;
    }
    
    // Verificar si el módulo tiene permisos activos
    const hasAccess = permissions[moduleName]?.some(permission => permission.estado) || false;
    return hasAccess;
  };

  const getModulePermissions = (moduleName: string): Permission[] => {
    return permissions[moduleName] || [];
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    hasModuleAccess,
    getModulePermissions
  };
};

// Permisos por defecto basados en rol (fallback)
const getDefaultPermissions = (roleName: string): ModulePermissions => {
  const defaultPermissions: { [key: string]: ModulePermissions } = {
    admin: {
      dashboard: [],
      servicios: [],
      pagos: [],
      operadores: [],
      gastos: [],
      ingresos_adicionales: [],
      ventas: [],
      productos: [],
      reportes: [],
      entidades: [],
      usuarios: []
    },
    supervisor: {
      dashboard: [],
      servicios: [],
      pagos: [],
      operadores: [],
      gastos: [],
      ingresos_adicionales: [],
      ventas: [],
      productos: [],
      reportes: []
    },
    operador: {
      dashboard: [],
      servicios: []
    }
  };

  return defaultPermissions[roleName] || {};
};
