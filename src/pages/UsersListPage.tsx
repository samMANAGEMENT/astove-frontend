import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import {
  Button,
  Card,
  DataTable,
  PageHeader,
  SearchFilters,
  Badge,
} from '../components/ui';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const UsersListPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');

  const users: User[] = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin', status: 'Activo' },
    { id: 2, name: 'María García', email: 'maria@example.com', role: 'Usuario', status: 'Activo' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Editor', status: 'Inactivo' },
    { id: 4, name: 'Ana Martínez', email: 'ana@example.com', role: 'Usuario', status: 'Activo' },
    { id: 5, name: 'Luis Rodríguez', email: 'luis@example.com', role: 'Admin', status: 'Activo' },
  ];

  const columns = [
    {
      key: 'name' as keyof User,
      header: 'Usuario',
      render: (value: string | number, row: User) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{String(value)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email' as keyof User,
      header: 'Email',
    },
    {
      key: 'role' as keyof User,
      header: 'Rol',
      render: (value: string | number) => (
        <Badge
          variant={
            String(value) === 'Admin' ? 'danger' :
            String(value) === 'Editor' ? 'warning' :
            'success'
          }
        >
          {String(value)}
        </Badge>
      ),
    },
    {
      key: 'status' as keyof User,
      header: 'Estado',
      render: (value: string | number) => (
        <Badge variant={String(value) === 'Activo' ? 'success' : 'default'}>
          {String(value)}
        </Badge>
      ),
    },
  ];

  const actions = [
    {
      icon: Eye,
      onClick: (user: User) => console.log('Ver usuario:', user),
      variant: 'primary' as const,
      tooltip: 'Ver detalles',
    },
    {
      icon: Edit,
      onClick: (user: User) => console.log('Editar usuario:', user),
      variant: 'success' as const,
      tooltip: 'Editar usuario',
    },
    {
      icon: Trash2,
      onClick: (user: User) => console.log('Eliminar usuario:', user),
      variant: 'danger' as const,
      tooltip: 'Eliminar usuario',
    },
  ];

  const handleNewUser = () => {
    console.log('Crear nuevo usuario');
  };

  const handleFiltersClick = () => {
    console.log('Abrir filtros');
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Lista de Usuarios"
        subtitle="Gestiona todos los usuarios del sistema"
      >
        <Button
          icon={Plus}
          onClick={handleNewUser}
        >
          Nuevo Usuario
        </Button>
      </PageHeader>

      {/* Filters and Search */}
      <Card>
        <SearchFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFiltersClick={handleFiltersClick}
          searchPlaceholder="Buscar usuarios..."
        />
      </Card>

      {/* Users Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        actions={actions}
        emptyMessage="No se encontraron usuarios"
      />
    </div>
  );
};

export default UsersListPage; 