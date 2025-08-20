import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Settings, 
  Edit, 
  Save, 
} from 'lucide-react';
import { Spinner, Card, Badge, Button, Modal } from '../components/ui';
import { useApi } from '../hooks/useApi';

interface User {
  id: number;
  email: string;
  operador?: {
    nombre: string;
    apellido: string;
    entidad?: {
      nombre: string;
    };
  };
  role?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
}

interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  permisos: Permiso[];
}

interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
  modulo: string;
  estado: boolean;
}

const RolesPermissionsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // API hooks
  const usersApi = useApi();
  const rolesApi = useApi();
  const permisosApi = useApi();
  const updateUserRoleApi = useApi();

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          usersApi.get('/roles/usuarios'),
          rolesApi.get('/roles'),
          permisosApi.get('/roles/permisos')
        ]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Actualizar datos cuando cambien las APIs
  useEffect(() => {
    if (usersApi.data) setUsers(usersApi.data);
    if (rolesApi.data) setRoles(rolesApi.data);
    if (permisosApi.data) setPermisos(permisosApi.data);
  }, [usersApi.data, rolesApi.data, permisosApi.data]);

  // Agrupar permisos por módulo
  const permisosPorModulo = Array.isArray(permisos) ? permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {} as Record<string, Permiso[]>) : {};

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role?.id || null);
    setIsModalOpen(true);
  };

  const handleSaveUserRole = async () => {
    if (!selectedUser || !selectedRoleId) return;

    try {
      await updateUserRoleApi.put(`/roles/usuarios/${selectedUser.id}/role`, {
        role_id: selectedRoleId
      });

      // Actualizar la lista de usuarios
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, role: roles.find(r => r.id === selectedRoleId) }
          : u
      ));

      setIsModalOpen(false);
      setSelectedUser(null);
      setSelectedRoleId(null);
    } catch (error) {
      console.error('Error al actualizar rol:', error);
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'operador': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles y Permisos</h1>
        <p className="text-gray-600 mt-2">
          Administra los roles y permisos de los usuarios del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Roles Activos</p>
              <p className="text-2xl font-bold text-gray-900">{roles.filter(r => r.estado).length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Permisos</p>
              <p className="text-2xl font-bold text-gray-900">{permisos.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Usuarios y Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Usuarios */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Usuarios del Sistema</h3>
            <Badge variant="info">{users.length} usuarios</Badge>
          </div>
          
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                        {user.operador ? user.operador.nombre[0] : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.operador ? `${user.operador.nombre} ${user.operador.apellido}` : user.email}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.operador?.entidad && (
                          <div className="text-xs text-gray-400">
                            Entidad: {user.operador.entidad.nombre}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {user.role ? (
                      <Badge className={getRoleColor(user.role.nombre)}>
                        {user.role.nombre}
                      </Badge>
                    ) : (
                      <Badge variant="warning">Sin rol</Badge>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Roles y Permisos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Roles y Permisos</h3>
            <Badge variant="info">{roles.length} roles</Badge>
          </div>
          
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">{role.nombre}</h4>
                    <p className="text-sm text-gray-500">{role.descripcion}</p>
                  </div>
                  <Badge className={getRoleColor(role.nombre)}>
                    {role.permisos.length} permisos
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(permisosPorModulo).map(([modulo]) => {
                    const permisosDelRol = role.permisos.filter(p => p.modulo === modulo);
                    if (permisosDelRol.length === 0) return null;
                    
                    return (
                      <div key={modulo} className="bg-gray-50 rounded p-2">
                        <div className="text-xs font-medium text-gray-700 uppercase mb-1">
                          {modulo}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {permisosDelRol.map((permiso) => (
                            <span key={permiso.id} className="text-xs bg-white px-2 py-1 rounded border">
                              {permiso.nombre.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal para editar rol de usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          setSelectedRoleId(null);
        }}
        title="Asignar Rol al Usuario"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium">
                  {selectedUser.operador ? `${selectedUser.operador.nombre} ${selectedUser.operador.apellido}` : selectedUser.email}
                </div>
                <div className="text-sm text-gray-500">{selectedUser.email}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol Actual
              </label>
              <div className="bg-gray-50 p-3 rounded-lg">
                {selectedUser.role ? (
                  <Badge className={getRoleColor(selectedUser.role.nombre)}>
                    {selectedUser.role.nombre} - {selectedUser.role.descripcion}
                  </Badge>
                ) : (
                  <span className="text-gray-500">Sin rol asignado</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Rol
              </label>
              <select
                value={selectedRoleId || ''}
                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar rol...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nombre} - {role.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                  setSelectedRoleId(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveUserRole}
                disabled={!selectedRoleId || updateUserRoleApi.isLoading}
              >
                {updateUserRoleApi.isLoading ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RolesPermissionsPage; 