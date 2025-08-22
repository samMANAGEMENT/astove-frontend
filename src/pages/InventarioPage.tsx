import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, TrendingUp, BarChart3, Minus, Plus as PlusIcon, Clock, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Button,
  DataTable,
  PageHeader,
  SearchFilters,
  Badge,
  Modal,
  Input,
  Spinner,
  Pagination,
} from '../components/ui';
import { inventarioService } from '../lib/services/inventarioService';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';
import type { Inventario, EstadisticasInventario, InventarioMovimiento } from '../lib/services/inventarioService';

interface InventarioFormData {
  nombre: string;
  cantidad: number;
  costo_unitario: number;
  estado: 'activo' | 'inactivo' | 'agotado';
  entidad_id?: number;
}

interface StockFormData {
  cantidad: number;
  tipo: 'agregar' | 'reducir';
}

const InventarioPage: React.FC = () => {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingInventario, setEditingInventario] = useState<Inventario | null>(null);
  const [inventarioToDelete, setInventarioToDelete] = useState<Inventario | null>(null);
  const [inventarioToStock, setInventarioToStock] = useState<Inventario | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasInventario | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Estados para movimientos
  const [viewMode, setViewMode] = useState<'inventario' | 'movimientos'>('inventario');
  const [selectedInventario, setSelectedInventario] = useState<Inventario | null>(null);
  const [movimientos, setMovimientos] = useState<InventarioMovimiento[]>([]);
  const [isLoadingMovimientos, setIsLoadingMovimientos] = useState(false);
  const [currentPageMovimientos, setCurrentPageMovimientos] = useState(1);
  const [totalPagesMovimientos, setTotalPagesMovimientos] = useState(1);
  const [totalItemsMovimientos, setTotalItemsMovimientos] = useState(0);

  const [formData, setFormData] = useState<InventarioFormData>({
    nombre: '',
    cantidad: 0,
    costo_unitario: 0,
    estado: 'activo'
  });

  const [stockFormData, setStockFormData] = useState<StockFormData>({
    cantidad: 1,
    tipo: 'agregar'
  });

  const [formErrors, setFormErrors] = useState<{
    nombre?: string;
    cantidad?: string;
    costo_unitario?: string;
    estado?: string;
  }>({});

  const [stockFormErrors, setStockFormErrors] = useState<{
    cantidad?: string;
  }>({});

  // Cargar inventario al montar el componente
  useEffect(() => {
    loadInventario();
    loadEstadisticas();
  }, [currentPage, searchValue]);

  // Cargar movimientos cuando cambie la página
  useEffect(() => {
    if (viewMode === 'movimientos' && selectedInventario) {
      loadMovimientos(selectedInventario.id);
    }
  }, [currentPageMovimientos]);

  const loadInventario = async () => {
    try {
      setIsLoading(true);
      const response = await inventarioService.getAll({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchValue
      });
      setInventario(response.data);
      setTotalPages(Number(response.pagination.total_pages));
      setTotalItems(Number(response.pagination.total));
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      toast.error('Error al cargar el inventario');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      setIsLoadingStats(true);
      const data = await inventarioService.getEstadisticas();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadMovimientos = async (inventarioId: number) => {
    try {
      setIsLoadingMovimientos(true);
      const response = await inventarioService.getMovimientos(inventarioId, {
        page: currentPageMovimientos,
        per_page: itemsPerPage
      });
      setMovimientos(response.data);
      setTotalPagesMovimientos(Number(response.pagination.total_pages));
      setTotalItemsMovimientos(Number(response.pagination.total));
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      toast.error('Error al cargar el historial de movimientos');
    } finally {
      setIsLoadingMovimientos(false);
    }
  };

  const handleViewMovimientos = async (inventario: Inventario) => {
    setSelectedInventario(inventario);
    setViewMode('movimientos');
    setCurrentPageMovimientos(1);
    await loadMovimientos(inventario.id);
  };

  const handleBackToInventario = () => {
    setViewMode('inventario');
    setSelectedInventario(null);
    setMovimientos([]);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      cantidad: 0,
      costo_unitario: 0,
      estado: 'activo'
    });
    setFormErrors({});
  };

  const resetStockForm = () => {
    setStockFormData({
      cantidad: 1,
      tipo: 'agregar'
    });
    setStockFormErrors({});
  };

  const openCreateModal = () => {
    setEditingInventario(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: Inventario) => {
    setEditingInventario(item);
    setFormData({
      nombre: item.nombre,
      cantidad: item.cantidad,
      costo_unitario: item.costo_unitario,
      estado: item.estado
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // const openStockModal = (item: Inventario) => {
  //   setInventarioToStock(item);
  //   resetStockForm();
  //   setIsStockModalOpen(true);
  // };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInventario(null);
    resetForm();
  };

  const closeStockModal = () => {
    setIsStockModalOpen(false);
    setInventarioToStock(null);
    resetStockForm();
  };

  const validateForm = (): boolean => {
    const errors: any = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (formData.cantidad < 0) {
      errors.cantidad = 'La cantidad no puede ser negativa';
    }

    if (formData.costo_unitario < 0) {
      errors.costo_unitario = 'El costo unitario no puede ser negativo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStockForm = (): boolean => {
    const errors: any = {};

    if (stockFormData.cantidad <= 0) {
      errors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (stockFormData.tipo === 'reducir' && inventarioToStock && stockFormData.cantidad > inventarioToStock.cantidad) {
      errors.cantidad = `No hay suficiente stock. Disponible: ${inventarioToStock.cantidad}`;
    }

    setStockFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingInventario) {
        setIsUpdating(true);
      } else {
        setIsCreating(true);
      }

      // Preparar los datos del formulario
      const inventarioData = { ...formData };

      if (editingInventario) {
        await inventarioService.update(editingInventario.id, inventarioData);
        toast.success('Artículo de inventario actualizado exitosamente');
      } else {
        // Al crear un nuevo artículo, incluir automáticamente la entidad del usuario
        if (user?.operador?.entidad_id) {
          inventarioData.entidad_id = user.operador.entidad_id;
        }
        await inventarioService.create(inventarioData);
        toast.success('Artículo de inventario creado exitosamente');
      }

      // Recargar inventario y estadísticas
      await loadInventario();
      await loadEstadisticas();

      closeModal();
    } catch (error) {
      console.error('Error al guardar inventario:', error);
      toast.error(editingInventario ? 'Error al actualizar el artículo' : 'Error al crear el artículo');
    } finally {
      setIsUpdating(false);
      setIsCreating(false);
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStockForm() || !inventarioToStock) return;

    try {
      setIsUpdatingStock(true);

      await inventarioService.actualizarStock(
        inventarioToStock.id,
        stockFormData.cantidad,
        stockFormData.tipo
      );

      toast.success(`Stock ${stockFormData.tipo === 'agregar' ? 'agregado' : 'reducido'} exitosamente`);
      
      // Recargar inventario y estadísticas
      await loadInventario();
      await loadEstadisticas();

      closeStockModal();
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      toast.error('Error al actualizar el stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleDelete = async (item: Inventario) => {
    setInventarioToDelete(item);
  };

  const confirmDelete = async () => {
    if (!inventarioToDelete) return;

    try {
      setIsDeleting(true);
      await inventarioService.delete(inventarioToDelete.id);
      toast.success('Artículo de inventario eliminado exitosamente');
      await loadInventario();
      await loadEstadisticas();
      setInventarioToDelete(null);
    } catch (error) {
      console.error('Error al eliminar inventario:', error);
      toast.error('Error al eliminar el artículo');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setInventarioToDelete(null);
  };

  const getEstadoBadge = (estado: string) => {
    const estados = {
      'activo': { label: 'Activo', variant: 'success' as const },
      'inactivo': { label: 'Inactivo', variant: 'warning' as const },
      'agotado': { label: 'Agotado', variant: 'danger' as const }
    };

    const estadoInfo = estados[estado as keyof typeof estados] || estados.inactivo;
    return <Badge variant={estadoInfo.variant}>{estadoInfo.label}</Badge>;
  };

  const getStockBadge = (cantidad: number) => {
    if (cantidad <= 0) {
      return <Badge variant="danger">Sin Stock</Badge>;
    } else if (cantidad <= 5) {
      return <Badge variant="warning">Bajo Stock</Badge>;
    } else {
      return <Badge variant="success">En Stock</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    if (tipo === 'entrada') {
      return <Badge variant="success">Entrada</Badge>;
    } else {
      return <Badge variant="danger">Salida</Badge>;
    }
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo === 'entrada') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
  };

  const formatNumberForInput = (value: number) => {
    return value.toString();
  };

  const unformatNumber = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersClick = () => {
    // Implementar filtros avanzados si es necesario
  };

  const renderEstadisticas = () => {
    if (isLoadingStats) {
      return (
        <div className="flex justify-center items-center py-16">
          <Spinner size="lg" />
        </div>
      );
    }

    if (!estadisticas) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Artículos</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total_articulos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cantidad</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total_cantidad}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.valor_total_inventario)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Artículos Agotados</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.articulos_agotados}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    {
      key: 'nombre' as keyof Inventario,
      header: 'Nombre',
      render: (value: any) => <span className="font-medium">{value}</span>
    },
    {
      key: 'cantidad' as keyof Inventario,
      header: 'Cantidad',
      render: (value: any, _row: Inventario) => (
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{value}</span>
          {getStockBadge(value)}
        </div>
      )
    },
    {
      key: 'costo_unitario' as keyof Inventario,
      header: 'Costo Unitario',
      render: (value: any) => <span className="text-gray-700">{formatCurrency(value)}</span>
    },
    {
      key: 'valor_total' as keyof Inventario,
      header: 'Valor Total',
      render: (value: any) => <span className="font-semibold text-green-600">{formatCurrency(value)}</span>
    },
    {
      key: 'estado' as keyof Inventario,
      header: 'Estado',
      render: (value: any) => getEstadoBadge(value)
    },
    {
      key: 'created_at' as keyof Inventario,
      header: 'Creado',
      render: (value: any) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('es-CO')}
        </span>
      )
    }
  ];

  const movimientosColumns = [
    {
      key: 'tipo' as keyof InventarioMovimiento,
      header: 'Tipo',
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          {getTipoIcon(value)}
          {getTipoBadge(value)}
        </div>
      )
    },
    {
      key: 'cantidad_movimiento' as keyof InventarioMovimiento,
      header: 'Cantidad Movida',
      render: (value: any) => (
        <span className="font-semibold text-lg">{value}</span>
      )
    },
    {
      key: 'cantidad_anterior' as keyof InventarioMovimiento,
      header: 'Stock Anterior',
      render: (value: any) => (
        <span className="text-gray-600">{value}</span>
      )
    },
    {
      key: 'cantidad_nueva' as keyof InventarioMovimiento,
      header: 'Stock Nuevo',
      render: (value: any) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'usuario' as keyof InventarioMovimiento,
      header: 'Usuario',
      render: (value: any) => (
        <span className="text-sm text-gray-700">{value.email}</span>
      )
    },
    {
      key: 'created_at' as keyof InventarioMovimiento,
      header: 'Fecha',
      render: (value: any) => (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {new Date(value).toLocaleString('es-CO')}
          </span>
        </div>
      )
    }
  ];

  const actions = [
    {
      icon: PlusIcon,
      onClick: (row: Inventario) => {
        setInventarioToStock(row);
        setStockFormData({ cantidad: 1, tipo: 'agregar' });
        setIsStockModalOpen(true);
      },
      variant: 'success' as const,
      tooltip: 'Agregar Stock'
    },
    {
      icon: Minus,
      onClick: (row: Inventario) => {
        setInventarioToStock(row);
        setStockFormData({ cantidad: 1, tipo: 'reducir' });
        setIsStockModalOpen(true);
      },
      variant: 'warning' as const,
      tooltip: 'Reducir Stock'
    },
    {
      icon: Clock,
      onClick: (row: Inventario) => handleViewMovimientos(row),
      variant: 'primary' as const,
      tooltip: 'Ver Historial'
    },
    {
      icon: Edit,
      onClick: (row: Inventario) => openEditModal(row),
      variant: 'primary' as const,
      tooltip: 'Editar'
    },
    {
      icon: Trash2,
      onClick: (row: Inventario) => handleDelete(row),
      variant: 'danger' as const,
      tooltip: 'Eliminar'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={viewMode === 'inventario' ? "Inventario Interno" : "Historial de Movimientos"}
        subtitle={
          viewMode === 'inventario' 
            ? "Gestión de artículos del inventario interno de la empresa"
            : `Movimientos del artículo: ${selectedInventario?.nombre}`
        }
      >
        {viewMode === 'inventario' ? (
          <Button onClick={openCreateModal} icon={Plus} disabled={isInitialLoading}>
            Agregar Artículo
          </Button>
        ) : (
          <Button onClick={handleBackToInventario} icon={Package} variant="outline">
            Volver al Inventario
          </Button>
        )}
      </PageHeader>

      {viewMode === 'inventario' ? (
        // Vista de Inventario
        <>
          {!isInitialLoading && renderEstadisticas()}

          <SearchFilters
            searchValue={searchValue}
            onSearchChange={handleSearch}
            onFiltersClick={handleFiltersClick}
            searchPlaceholder="Buscar por nombre..."
          />

          {/* Tabla de inventario con estado de carga */}
          {isInitialLoading || isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <DataTable
                data={inventario}
                columns={columns}
                actions={actions}
                emptyMessage="No hay artículos en el inventario"
                showPagination={false}
              />

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        // Vista de Movimientos
        <>
          {selectedInventario && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Información del Artículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Nombre:</span>
                  <p className="text-gray-600 font-medium">{selectedInventario.nombre}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Stock Actual:</span>
                  <p className="text-gray-600 font-medium">{selectedInventario.cantidad}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Costo Unitario:</span>
                  <p className="text-gray-600 font-medium">{formatCurrency(selectedInventario.costo_unitario)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de movimientos */}
          {isLoadingMovimientos ? (
            <div className="flex justify-center items-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <DataTable
                data={movimientos}
                columns={movimientosColumns}
                emptyMessage="No hay movimientos registrados"
                showPagination={false}
              />

              {totalPagesMovimientos > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPageMovimientos}
                    totalPages={totalPagesMovimientos}
                    onPageChange={setCurrentPageMovimientos}
                    totalItems={totalItemsMovimientos}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal para crear/editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingInventario ? 'Editar Artículo' : 'Agregar Artículo'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Artículo *
            </label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Papel A4, Tinta de Impresora..."
            />
            {formErrors.nombre && (
              <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad *
              </label>
              <Input
                type="number"
                value={formatNumberForInput(formData.cantidad)}
                onChange={(e) => setFormData({ ...formData, cantidad: unformatNumber(e.target.value) })}
                placeholder="0"
                min="0"
              />
              {formErrors.cantidad && (
                <p className="text-red-500 text-sm mt-1">{formErrors.cantidad}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo Unitario *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.costo_unitario.toString()}
                onChange={(e) => setFormData({ ...formData, costo_unitario: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
              {formErrors.costo_unitario && (
                <p className="text-red-500 text-sm mt-1">{formErrors.costo_unitario}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isCreating || isUpdating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? (
                <Spinner size="sm" />
              ) : editingInventario ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal para gestionar stock */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={closeStockModal}
        title={`${stockFormData.tipo === 'agregar' ? 'Agregar' : 'Reducir'} Stock`}
        size="sm"
      >
        {inventarioToStock && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Artículo: <span className="font-medium">{inventarioToStock.nombre}</span></p>
            <p className="text-sm text-gray-600">Stock actual: <span className="font-medium">{inventarioToStock.cantidad}</span></p>
          </div>
        )}

        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad *
            </label>
            <Input
              type="number"
              value={stockFormData.cantidad.toString()}
              onChange={(e) => setStockFormData({ ...stockFormData, cantidad: parseInt(e.target.value) || 1 })}
              placeholder="1"
              min="1"
              max={stockFormData.tipo === 'reducir' ? inventarioToStock?.cantidad?.toString() : undefined}
            />
            {stockFormErrors.cantidad && (
              <p className="text-red-500 text-sm mt-1">{stockFormErrors.cantidad}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeStockModal} disabled={isUpdatingStock}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdatingStock}>
              {isUpdatingStock ? <Spinner size="sm" /> : 'Confirmar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!inventarioToDelete}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que quieres eliminar el artículo <strong>{inventarioToDelete?.nombre}</strong>?
          </p>
          <p className="text-sm text-red-600">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Spinner size="sm" /> : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventarioPage;
