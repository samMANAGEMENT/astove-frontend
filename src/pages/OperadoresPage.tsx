import React, { useState, useEffect } from 'react';
import { Eye, User, Building, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Card,
  DataTable,
  PageHeader,
  SearchFilters,
  Badge,
  Spinner,
} from '../components/ui';
import { operadoresService, type Operador } from '../lib/services/operadoresService';

const OperadoresPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOperadores();
  }, []);

  const loadOperadores = async () => {
    try {
      setIsLoading(true);
      const data = await operadoresService.getAll();
      setOperadores(data);
    } catch (error) {
      console.error('Error al cargar operadores:', error);
      toast.error('Error al cargar la lista de operadores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (operador: Operador) => {
    console.log('Ver operador:', operador);
  };

  const columns = [
    {
      key: 'nombre' as keyof Operador,
      header: 'Operador',
      render: (_value: any, row: Operador) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.nombre} {row.apellido}
            </div>
            <div className="text-sm text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'entidades' as keyof Operador,
      header: 'Entidad',
      render: (_value: any, row: Operador) => (
        <div className="flex items-center">
          <Building className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-700">
            {row.entidades?.nombre || 'Sin entidad'}
          </span>
        </div>
      ),
    },
    {
      key: 'cargo' as keyof Operador,
      header: 'Cargo',
      render: (_value: any, row: Operador) => (
        <Badge variant="info">
          {row.cargo?.nombre || 'Sin cargo'}
        </Badge>
      ),
    },
    {
      key: 'telefono' as keyof Operador,
      header: 'Teléfono',
      render: (_value: any, row: Operador) => (
        <div className="flex items-center">
          <Phone className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-700">
            {row.telefono || 'Sin teléfono'}
          </span>
        </div>
      ),
    },
    {
      key: 'usuario' as keyof Operador,
      header: 'Usuario',
      render: (_value: any, row: Operador) => (
        <div className="text-sm text-gray-700">
          {row.usuario ? (
            <div>
              <div className="font-medium">{row.usuario.name}</div>
              <div className="text-gray-500">{row.usuario.email}</div>
            </div>
          ) : (
            <span className="text-gray-400">Sin usuario</span>
          )}
        </div>
      ),
    },
  ];

  const actions = [
    {
      icon: Eye,
      onClick: handleView,
      variant: 'primary' as const,
      tooltip: 'Ver detalles',
    },
  ];

  const handleFiltersClick = () => {
    console.log('Abrir filtros');
  };

  const filteredOperadores = operadores.filter(operador => {
    const searchLower = searchValue.toLowerCase();
    return (
      (operador.nombre || '').toLowerCase().includes(searchLower) ||
      (operador.apellido || '').toLowerCase().includes(searchLower) ||
      (operador.entidades?.nombre || '').toLowerCase().includes(searchLower) ||
      (operador.cargo?.nombre || '').toLowerCase().includes(searchLower) ||
      (operador.telefono || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lista de Operadores"
        subtitle="Gestiona todos los operadores del sistema"
      />
      <Card>
        <SearchFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFiltersClick={handleFiltersClick}
          searchPlaceholder="Buscar operadores por nombre, entidad, cargo..."
        />
      </Card>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <DataTable
          data={filteredOperadores}
          columns={columns}
          actions={actions}
          emptyMessage="No se encontraron operadores"
        />
      )}
    </div>
  );
};

export default OperadoresPage;
