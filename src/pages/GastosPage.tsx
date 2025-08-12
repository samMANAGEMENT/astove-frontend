import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { 
  PageHeader, 
  Button, 
  Input, 
  Modal, 
  DataTable, 
  Spinner, 
  Card,
  Pagination
} from '../components/ui';
import gastosService, { type Gasto, type CrearGastoData } from '../lib/services/gastosService';
import { toast } from 'react-toastify';

const GastosPage: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentGasto, setCurrentGasto] = useState<Gasto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [isLoadingEstadisticas, setIsLoadingEstadisticas] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState<Gasto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CrearGastoData>({
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load gastos
  const loadGastos = async () => {
    try {
      setIsLoading(true);
      const response = await gastosService.listarGastos({
        page: currentPage,
        per_page: 10,
        search: searchTerm
      });
      setGastos(response.data);
      setTotalPages(response.pagination.total_pages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load estadísticas
  const loadEstadisticas = async () => {
    try {
      setIsLoadingEstadisticas(true);
      const data = await gastosService.obtenerEstadisticas();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoadingEstadisticas(false);
    }
  };

  useEffect(() => {
    loadGastos();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      monto: 0,
      fecha: new Date().toISOString().split('T')[0]
    });
    setErrors({});
    setIsEditMode(false);
    setCurrentGasto(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (gasto: Gasto) => {
    setFormData({
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      fecha: gasto.fecha.split('T')[0]
    });
    setCurrentGasto(gasto);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    if (formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && currentGasto) {
        await gastosService.actualizarGasto(currentGasto.id, formData);
        toast.success('¡Gasto actualizado exitosamente!');
      } else {
        await gastosService.crearGasto(formData);
        toast.success('¡Gasto creado exitosamente!');
      }
      
      closeModal();
      loadGastos();
      loadEstadisticas();
    } catch (error: any) {
      console.error('Error al guardar gasto:', error);
      toast.error(error?.response?.data?.message || 'Error al guardar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (gasto: Gasto) => {
    setGastoToDelete(gasto);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!gastoToDelete) return;

    setIsDeleting(true);
    try {
      await gastosService.eliminarGasto(gastoToDelete.id);
      toast.success('Gasto eliminado correctamente');
      loadGastos();
      loadEstadisticas();
      setDeleteModalOpen(false);
      setGastoToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al eliminar el gasto');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setGastoToDelete(null);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: 'descripcion' as keyof Gasto,
      header: 'Descripción',
      render: (value: any) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'monto' as keyof Gasto,
      header: 'Monto',
      render: (value: any) => (
        <div className="font-semibold text-red-600">
          {formatCurrency(value)}
        </div>
      )
    },
    {
      key: 'fecha' as keyof Gasto,
      header: 'Fecha',
      render: (value: any) => (
        <div className="text-gray-600">{formatDate(value)}</div>
      )
    },
    {
      key: 'created_at' as keyof Gasto,
      header: 'Creado',
      render: (value: any) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('es-CO')}
        </div>
      )
    }
  ];

  const actions = [
    {
      icon: Edit,
      onClick: (gasto: Gasto) => openEditModal(gasto),
      variant: 'primary' as const,
      tooltip: 'Editar'
    },
    {
      icon: Trash2,
      onClick: (gasto: Gasto) => handleDeleteClick(gasto),
      variant: 'danger' as const,
      tooltip: 'Eliminar'
    }
  ];

  const renderEstadisticas = () => {
    if (isLoadingEstadisticas) {
      return (
        <div className="flex justify-center items-center py-8">
          <Spinner size="md" />
        </div>
      );
    }

    if (!estadisticas) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gastos del Mes</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(estadisticas.total_gastos_mes)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gastos del Año</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(estadisticas.total_gastos_anio)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registros</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalItems}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos Operativos"
        subtitle="Gestiona los gastos operativos de tu entidad"
      >
        <Button onClick={openCreateModal} icon={Plus}>
          Agregar Gasto
        </Button>
      </PageHeader>

      {renderEstadisticas()}

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Gastos</h3>
            <div className="flex items-center space-x-4">
              <Input
                type="search"
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                icon={Search}
                className="w-64"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              <DataTable
                data={gastos}
                columns={columns}
                actions={actions}
                emptyMessage="No hay gastos registrados"
              />

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={totalItems}
                    itemsPerPage={10}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Modal para crear/editar gasto */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditMode ? 'Editar Gasto' : 'Agregar Gasto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <Input
              type="text"
              placeholder="Descripción del gasto"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto
            </label>
            <Input
              type="number"
              placeholder="0"
              value={formData.monto.toString()}
              onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              required
            />
            {errors.monto && (
              <p className="text-red-500 text-sm mt-1">{errors.monto}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <Input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
            {errors.fecha && (
              <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')} Gasto
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={handleCancelDelete} 
        title="Confirmar Eliminación" 
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">¿Estás seguro?</h3>
              <p className="text-sm text-red-700">
                Esta acción no se puede deshacer. El gasto será eliminado permanentemente.
              </p>
            </div>
          </div>

          {gastoToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Detalles del gasto:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Descripción:</span> {gastoToDelete.descripcion}</p>
                <p><span className="font-medium">Monto:</span> {formatCurrency(gastoToDelete.monto)}</p>
                <p><span className="font-medium">Fecha:</span> {formatDate(gastoToDelete.fecha)}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GastosPage;
