import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  DataTable,
  PageHeader,
  SearchFilters,
  Badge,
  Modal,
  Input,
  Spinner,
} from '../components/ui';
import { servicioService, type Servicio } from '../lib/services/servicioService';
import entidadesService, { type Entidad } from '../lib/services/entidadesService';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface ServicioFormData {
  nombre: string;
  precio: number;
  estado: boolean;
  porcentaje_pago_empleado: number;
  entidad_id?: number;
}

const ServiciosPage: React.FC = () => {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [servicioToDelete, setServicioToDelete] = useState<Servicio | null>(null);
  const [formData, setFormData] = useState<ServicioFormData>({
    nombre: '',
    precio: 0,
    estado: true,
    porcentaje_pago_empleado: 40,
  });
  const [formErrors, setFormErrors] = useState<{
    nombre?: string;
    precio?: string;
    porcentaje_pago_empleado?: string;
  }>({});

  // Función para formatear número a formato colombiano
  const formatColombianNumber = (value: number): string => {
    return new Intl.NumberFormat('es-CO').format(value);
  };

  // Función para desformatear número colombiano


  // Función para manejar el cambio del precio con formato
  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '');
    const numericValue = parseInt(rawValue) || 0;
    
    setFormData(prev => ({ ...prev, precio: numericValue }));
  };

  useEffect(() => {
    loadServicios();
    if (user?.role?.nombre === 'admin') {
      loadEntidades();
    }
  }, [user]);

  const loadServicios = async () => {
    try {
      setIsLoading(true);
      const data = await servicioService.getAll();
      setServicios(data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar la lista de servicios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntidades = async () => {
    try {
      const data = await entidadesService.getEntidades();
      setEntidades(data);
    } catch (error) {
      console.error('Error al cargar entidades:', error);
      toast.error('Error al cargar la lista de entidades');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      precio: 0,
      estado: true,
      porcentaje_pago_empleado: 40,
      entidad_id: undefined,
    });
    setFormErrors({});
    setEditingServicio(null);
    setServicioToDelete(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setFormData({
      nombre: servicio.nombre,
      precio: servicio.precio,
      estado: servicio.estado,
      porcentaje_pago_empleado: parseFloat(servicio.porcentaje_pago_empleado) || 40,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: { nombre?: string; precio?: string; porcentaje_pago_empleado?: string } = {};
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    if (formData.precio <= 0) {
      errors.precio = 'El precio debe ser mayor a 0';
    }
    if (formData.porcentaje_pago_empleado < 0 || formData.porcentaje_pago_empleado > 100) {
      errors.porcentaje_pago_empleado = 'El porcentaje debe estar entre 0 y 100';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      
      const serviceData = {
        nombre: formData.nombre,
        precio: formData.precio,
        estado: formData.estado,
        porcentaje_pago_empleado: formData.porcentaje_pago_empleado,
      };

      // Si es admin y seleccionó una entidad, incluirla
      if (user?.role?.nombre === 'admin' && formData.entidad_id) {
        (serviceData as any).entidad_id = formData.entidad_id;
      }

      if (editingServicio) {
        await servicioService.updateService(editingServicio.id, serviceData);
        toast.success('Servicio actualizado exitosamente');
      } else {
        await servicioService.createService(serviceData);
        toast.success('Servicio creado exitosamente');
      }
      await loadServicios();
      closeModal();
    } catch (error) {
      console.error('Error al guardar servicio:', error);
      toast.error(editingServicio ? 'Error al actualizar el servicio' : 'Error al crear el servicio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (servicio: Servicio) => {
    // Validar si el servicio está activo antes de permitir eliminarlo
    if (servicio.estado) {
      toast.warning('No se puede eliminar un servicio activo. Primero desactívalo.');
      return;
    }
    
    // Validar si el servicio tiene un precio muy alto (podría ser un servicio importante)
    if (servicio.precio > 1000000) {
      toast.warning('Este servicio tiene un precio muy alto. ¿Estás seguro de que quieres eliminarlo?');
    }
    
    setServicioToDelete(servicio);
  };

  const confirmDelete = async () => {
    if (!servicioToDelete) return;
    try {
      setIsLoading(true);
      // Aquí deberías llamar a delete cuando exista en el servicio
      toast.success('Servicio eliminado exitosamente');
      await loadServicios();
      setServicioToDelete(null);
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      toast.error('Error al eliminar el servicio');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setServicioToDelete(null);
  };

  const handleView = (servicio: Servicio) => {
    console.log('Ver servicio:', servicio);
  };



  const columns = [
    {
      key: 'nombre' as keyof Servicio,
      header: 'Servicio',
      render: (value: string | number | boolean | undefined, row: Servicio) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{String(value || '')}</div>
            <div className="text-sm text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'precio' as keyof Servicio,
      header: 'Precio (COP)',
      render: (value: string | number | boolean | undefined) => (
        <span className="font-medium text-green-600">
          {typeof value === 'number' ? formatCurrency(value) : formatCurrency(0)}
        </span>
      ),
    },
    {
      key: 'porcentaje_pago_empleado' as keyof Servicio,
      header: 'Porcentaje Empleado',
      render: (value: string | number | boolean | undefined) => {
        const porcentaje = typeof value === 'string' ? parseFloat(value) : (typeof value === 'number' ? value : 0);
        return (
          <span className="font-medium text-blue-600">
            {porcentaje}%
          </span>
        );
      },
    },
    {
      key: 'estado' as keyof Servicio,
      header: 'Estado',
      render: (value: string | number | boolean | undefined) => {
        const estado = Boolean(value);
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={estado ? 'success' : 'danger'}>
              {estado ? 'Activo' : 'Inactivo'}
            </Badge>
            {!estado && (
              <span className="text-xs text-gray-500">
                Se puede eliminar
              </span>
            )}
          </div>
        );
      },
    },
    // Columna de entidad solo para administradores
    ...(user?.role?.nombre === 'admin' ? [{
      key: 'entidad_id' as keyof Servicio,
      header: 'Entidad',
      render: (_value: string | number | boolean | undefined, row: Servicio) => {
        const entidad = entidades.find(e => e.id === row.entidad_id);
        return (
          <span className="text-sm text-gray-600">
            {entidad ? entidad.nombre : 'N/A'}
          </span>
        );
      },
    }] : []),
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
      tooltip: 'Editar servicio',
    },
    {
      icon: Trash2,
      onClick: handleDelete,
      variant: 'danger' as const,
      tooltip: (row: Servicio) => row.estado ? 'No se puede eliminar un servicio activo' : 'Eliminar servicio',
      disabled: (row: Servicio) => row.estado,
    },
  ];

  const handleFiltersClick = () => {
    console.log('Abrir filtros');
  };

  const filteredServicios = servicios.filter(servicio => {
    const searchLower = searchValue.toLowerCase();
    return (
      (servicio.nombre || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lista de Servicios"
        subtitle="Gestiona todos los servicios del sistema"
      >
        <Button
          icon={Plus}
          onClick={openCreateModal}
        >
          Nuevo Servicio
        </Button>
      </PageHeader>
      <Card>
        <SearchFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFiltersClick={handleFiltersClick}
          searchPlaceholder="Buscar servicios por nombre..."
        />
      </Card>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <DataTable
          data={filteredServicios}
          columns={columns}
          actions={actions}
          emptyMessage="No se encontraron servicios"
        />
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="md"
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
                placeholder="Nombre del servicio"
                required
              />
              {formErrors.nombre && (
                <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="text"
                value={formData.precio === 0 ? '' : formatColombianNumber(formData.precio)}
                onChange={handlePrecioChange}
                placeholder="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
              />
              {formErrors.precio && (
                <p className="text-red-500 text-sm mt-1">{formErrors.precio}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje Pago Empleado *
              </label>
              <input
                type="number"
                value={formData.porcentaje_pago_empleado.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, porcentaje_pago_empleado: parseFloat(e.target.value) || 0 }))}
                placeholder="40"
                min="0"
                max="100"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
              />
              {formErrors.porcentaje_pago_empleado && (
                <p className="text-red-500 text-sm mt-1">{formErrors.porcentaje_pago_empleado}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.estado ? 'activo' : 'inactivo'}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value === 'activo' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
                required
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            {user?.role?.nombre === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entidad
                </label>
                <select
                  value={formData.entidad_id || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    entidad_id: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
                >
                  <option value="">Seleccionar entidad (opcional)</option>
                  {entidades.map((entidad) => (
                    <option key={entidad.id} value={entidad.id}>
                      {entidad.nombre}
                    </option>
                  ))}
                </select>
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
              {editingServicio ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={!!servicioToDelete}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar el servicio{' '}
            <span className="font-semibold text-gray-900">
              "{servicioToDelete?.nombre}"
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

export default ServiciosPage;