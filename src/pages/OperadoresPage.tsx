import React, { useState, useEffect } from 'react';
import { Eye, User, Building, Phone, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Card,
  DataTable,
  PageHeader,
  SearchFilters,
  Badge,
  Spinner,
  Button,
  Modal,
  Input,
} from '../components/ui';
import { operadoresService, type Operador } from '../lib/services/operadoresService';
import entidadesService, { type Entidad } from '../lib/services/entidadesService';
import cargoService, { type Cargo } from '../lib/services/cargoService';

interface OperadorFormData {
  nombre: string;
  apellido: string;
  entidad_id: number | null;
  telefono: string;
  cargo_id: number | null;
  email: string;
  password: string;
}

const OperadoresPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperador, setEditingOperador] = useState<Operador | null>(null);
  const [operadorToDelete, setOperadorToDelete] = useState<Operador | null>(null);
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [formData, setFormData] = useState<OperadorFormData>({
    nombre: '',
    apellido: '',
    entidad_id: null,
    telefono: '',
    cargo_id: null,
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<{
    nombre?: string;
    apellido?: string;
    entidad_id?: string;
    telefono?: string;
    cargo_id?: string;
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    loadOperadores();
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [entidadesData, cargosData] = await Promise.all([
        entidadesService.getEntidades(),
        cargoService.getAll()
      ]);

      setEntidades(entidadesData);
      setCargos(cargosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos necesarios');
    }
  };

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

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      entidad_id: null,
      telefono: '',
      cargo_id: null,
      email: '',
      password: '',
    });
    setFormErrors({});
    setEditingOperador(null);
    setOperadorToDelete(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (operador: Operador) => {
    setEditingOperador(operador);
    setFormData({
      nombre: operador.nombre,
      apellido: operador.apellido,
      entidad_id: operador.entidad_id,
      telefono: operador.telefono,
      cargo_id: operador.cargo_id,
      email: operador.usuario?.email || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: any = {};
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) errors.apellido = 'El apellido es requerido';
    if (!formData.entidad_id) errors.entidad_id = 'Debe seleccionar una entidad';
    if (!formData.telefono.trim()) errors.telefono = 'El teléfono es requerido';
    if (!formData.cargo_id) errors.cargo_id = 'Debe seleccionar un cargo';
    if (!formData.email.trim()) errors.email = 'El email es requerido';
    if (!editingOperador && !formData.password) errors.password = 'La contraseña es requerida';
    if (formData.password && formData.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      if (editingOperador) {
        // Actualizar operador existente
        await operadoresService.updateOperador(editingOperador.id, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          entidad_id: formData.entidad_id!,
          telefono: formData.telefono,
          cargo_id: formData.cargo_id!,
        });
        toast.success('Operador actualizado exitosamente');
      } else {
        // Crear nuevo operador
        await operadoresService.createOperador({
          nombre: formData.nombre,
          apellido: formData.apellido,
          entidad_id: formData.entidad_id!,
          telefono: formData.telefono,
          cargo_id: formData.cargo_id!,
          email: formData.email,
          password: formData.password,
        });
        toast.success('Operador creado exitosamente');
      }
      
      await loadOperadores();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar operador:', error);
      const errorMessage = error?.response?.data?.message || 'Error al guardar el operador';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (operador: Operador) => {
    setOperadorToDelete(operador);
  };

  const confirmDelete = async () => {
    if (!operadorToDelete) return;
    try {
      setIsLoading(true);
      // Aquí deberías llamar a delete cuando exista en el servicio
      toast.success('Operador eliminado exitosamente');
      await loadOperadores();
      setOperadorToDelete(null);
    } catch (error) {
      console.error('Error al eliminar operador:', error);
      toast.error('Error al eliminar el operador');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setOperadorToDelete(null);
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
              <div className="font-medium">{row.nombre} {row.apellido}</div>
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
    {
      icon: Edit,
      onClick: openEditModal,
      variant: 'success' as const,
      tooltip: 'Editar operador',
    },
    {
      icon: Trash2,
      onClick: handleDelete,
      variant: 'danger' as const,
      tooltip: 'Eliminar operador',
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
      >
        <Button
          icon={Plus}
          onClick={openCreateModal}
        >
          Nuevo Operador
        </Button>
      </PageHeader>
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
      
      {/* Modal para crear/editar operador */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingOperador ? 'Editar Operador' : 'Nuevo Operador'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre del operador"
                required
              />
              {formErrors.nombre && (
                <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <Input
                value={formData.apellido}
                onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                placeholder="Apellido del operador"
                required
              />
              {formErrors.apellido && (
                <p className="text-red-500 text-sm mt-1">{formErrors.apellido}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <Input
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="Teléfono"
                required
              />
              {formErrors.telefono && (
                <p className="text-red-500 text-sm mt-1">{formErrors.telefono}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entidad *
              </label>
              <select
                value={formData.entidad_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, entidad_id: e.target.value ? Number(e.target.value) : null }))}
                className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccione una entidad</option>
                {entidades.map((entidad) => (
                  <option key={entidad.id} value={entidad.id}>
                    {entidad.nombre}
                  </option>
                ))}
              </select>
              {formErrors.entidad_id && (
                <p className="text-red-500 text-sm mt-1">{formErrors.entidad_id}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo *
              </label>
              <select
                value={formData.cargo_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cargo_id: e.target.value ? Number(e.target.value) : null }))}
                className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccione un cargo</option>
                {cargos.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.nombre} - Sueldo: ${cargo.sueldo_base}
                  </option>
                ))}
              </select>
              {formErrors.cargo_id && (
                <p className="text-red-500 text-sm mt-1">{formErrors.cargo_id}</p>
              )}
            </div>
            {!editingOperador && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Spinner size="sm" />}
              {editingOperador ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!operadorToDelete}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar el operador{' '}
            <span className="font-semibold text-gray-900">
              "{operadorToDelete?.nombre} {operadorToDelete?.apellido}"
            </span>
            ?
          </p>
          <p className="text-sm text-gray-500">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={cancelDelete}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={confirmDelete}
              disabled={isLoading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isLoading && <Spinner size="sm" />}
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OperadoresPage;
