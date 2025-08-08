import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, ShoppingCart, TrendingUp, BarChart3 } from 'lucide-react';
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
  Pagination,
} from '../components/ui';
import { productosService } from '../lib/services/productosService';
import { ventasService } from '../lib/services/ventasService';
import type { Producto, EstadisticasProductos } from '../lib/services/productosService';

interface ProductoFormData {
  nombre: string;
  categoria_id: number;
  precio_unitario: number;
  costo_unitario: number;
  stock: number;
}

const ProductosPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [productoToVender, setProductoToVender] = useState<Producto | null>(null);
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState<EstadisticasProductos | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: '',
    categoria_id: 1, // Por defecto
    precio_unitario: 0,
    costo_unitario: 0,
    stock: 0
  });

  const [formErrors, setFormErrors] = useState<{
    nombre?: string;
    categoria_id?: string;
    precio_unitario?: string;
    costo_unitario?: string;
    stock?: string;
  }>({});

  const [ventaFormData, setVentaFormData] = useState({
    cantidad: 1,
    metodo_pago: 'efectivo' as 'efectivo' | 'transferencia' | 'mixto',
    monto_efectivo: 0,
    monto_transferencia: 0,
    observaciones: ''
  });

  const [ventaFormErrors, setVentaFormErrors] = useState<{
    cantidad?: string;
    metodo_pago?: string;
    monto_efectivo?: string;
    monto_transferencia?: string;
  }>({});

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProductos();
    loadEstadisticas();
  }, [currentPage, searchValue]);

  // Recalcular montos automáticamente cuando cambie la cantidad o el método de pago
  useEffect(() => {
    if (productoToVender && isVentaModalOpen) {
      const totalVenta = calcularTotalVenta();

      // Redondear a 2 decimales
      const totalRedondeado = Math.round(totalVenta * 100) / 100;

      // Solo actualizar si los montos actuales no suman el total correcto
      const totalActual = calcularTotalMontos();
      const totalActualRedondeado = Math.round(totalActual * 100) / 100;

      if (Math.abs(totalRedondeado - totalActualRedondeado) > 0.01) {
        if (ventaFormData.metodo_pago === 'efectivo') {
          setVentaFormData(prev => ({
            ...prev,
            monto_efectivo: totalRedondeado,
            monto_transferencia: 0
          }));
        } else if (ventaFormData.metodo_pago === 'transferencia') {
          setVentaFormData(prev => ({
            ...prev,
            monto_efectivo: 0,
            monto_transferencia: totalRedondeado
          }));
        } else if (ventaFormData.metodo_pago === 'mixto') {
          const mitad = totalRedondeado / 2;
          setVentaFormData(prev => ({
            ...prev,
            monto_efectivo: mitad,
            monto_transferencia: mitad
          }));
        }
      }
    }
  }, [ventaFormData.cantidad, ventaFormData.metodo_pago, productoToVender, isVentaModalOpen]);

  const loadProductos = async () => {
    try {
      setIsLoading(true);
      const response = await productosService.getAll({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchValue
      });
      setProductos(response.data);
      setTotalPages(response.pagination.total_pages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar la lista de productos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const stats = await productosService.getEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria_id: 1,
      precio_unitario: 0,
      costo_unitario: 0,
      stock: 0
    });
    setFormErrors({});
    setEditingProducto(null);
    setProductoToDelete(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      categoria_id: producto.categoria_id,
      precio_unitario: producto.precio_unitario,
      costo_unitario: producto.costo_unitario,
      stock: producto.stock
    });
    setEditingProducto(producto);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: any = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.categoria_id) {
      errors.categoria_id = 'La categoría es requerida';
    }

    if (formData.precio_unitario <= 0) {
      errors.precio_unitario = 'El precio unitario debe ser mayor a 0';
    }

    if (formData.costo_unitario <= 0) {
      errors.costo_unitario = 'El costo unitario debe ser mayor a 0';
    }

    if (formData.costo_unitario <= formData.precio_unitario) {
      errors.costo_unitario = 'El costo unitario debe ser mayor al precio unitario';
    }

    if (formData.stock < 0) {
      errors.stock = 'El stock no puede ser negativo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      if (editingProducto) {
        await productosService.update(editingProducto.id, formData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await productosService.create(formData);
        toast.success('Producto creado exitosamente');
      }

      // Recargar productos y estadísticas
      await loadProductos();
      await loadEstadisticas();

      closeModal();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error(editingProducto ? 'Error al actualizar el producto' : 'Error al crear el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (producto: Producto) => {
    setProductoToDelete(producto);
  };

  const confirmDelete = async () => {
    if (!productoToDelete) return;

    try {
      setIsLoading(true);
      await productosService.delete(productoToDelete.id);
      toast.success('Producto eliminado exitosamente');
      await loadProductos();
      await loadEstadisticas();
      setProductoToDelete(null);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setProductoToDelete(null);
  };

  const closeVentaModal = () => {
    setIsVentaModalOpen(false);
    setProductoToVender(null);
    setVentaFormData({
      cantidad: 1,
      metodo_pago: 'efectivo',
      monto_efectivo: 0,
      monto_transferencia: 0,
      observaciones: ''
    });
    setVentaFormErrors({});
  };

  const validateVentaForm = (): boolean => {
    const errors: any = {};

    if (!productoToVender) return false;

    if (ventaFormData.cantidad <= 0) {
      errors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (ventaFormData.cantidad > productoToVender.stock) {
      errors.cantidad = `Stock insuficiente. Disponible: ${productoToVender.stock}`;
    }

    // Validar que los montos sumen el total correcto
    if (!validarMontos()) {
      const totalVenta = calcularTotalVenta();
      errors.monto_efectivo = `La suma de efectivo y transferencia debe ser igual a ${formatCurrency(totalVenta)}`;
      errors.monto_transferencia = `La suma de efectivo y transferencia debe ser igual a ${formatCurrency(totalVenta)}`;
    }

    if (ventaFormData.metodo_pago === 'efectivo' && ventaFormData.monto_efectivo <= 0) {
      errors.monto_efectivo = 'El monto en efectivo debe ser mayor a 0';
    }

    if (ventaFormData.metodo_pago === 'transferencia' && ventaFormData.monto_transferencia <= 0) {
      errors.monto_transferencia = 'El monto en transferencia debe ser mayor a 0';
    }

    if (ventaFormData.metodo_pago === 'mixto' &&
      (ventaFormData.monto_efectivo <= 0 || ventaFormData.monto_transferencia <= 0)) {
      errors.monto_efectivo = 'Ambos montos deben ser mayores a 0';
      errors.monto_transferencia = 'Ambos montos deben ser mayores a 0';
    }

    setVentaFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVentaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateVentaForm() || !productoToVender) return;

    if (!validarMontos()) {
      const totalVenta = calcularTotalVenta();
      toast.error(`La suma de efectivo y transferencia debe ser igual a ${formatCurrency(totalVenta)}`);
      return;
    }

    try {
      setIsLoading(true);

      const ventaData = {
        producto_id: productoToVender.id,
        cantidad: ventaFormData.cantidad,
        metodo_pago: ventaFormData.metodo_pago,
        monto_efectivo: ventaFormData.metodo_pago === 'efectivo' || ventaFormData.metodo_pago === 'mixto'
          ? ventaFormData.monto_efectivo : 0,
        monto_transferencia: ventaFormData.metodo_pago === 'transferencia' || ventaFormData.metodo_pago === 'mixto'
          ? ventaFormData.monto_transferencia : 0,
        observaciones: ventaFormData.observaciones || undefined
      };

      await ventasService.crearVenta(ventaData);
      toast.success('Venta registrada exitosamente');

      // Recargar productos y estadísticas
      await loadProductos();
      await loadEstadisticas();

      closeVentaModal();
    } catch (error: any) {
      console.error('Error al registrar venta:', error);
      toast.error(error?.response?.data?.error || 'Error al registrar la venta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVenta = (producto: Producto) => {
    setProductoToVender(producto);
    setIsVentaModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$ 0';

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStockBadge = (stock: number) => {
    const numStock = typeof stock === 'string' ? parseInt(stock) : stock;
    if (isNaN(numStock)) return <Badge variant="warning">0</Badge>;

    if (numStock > 10) {
      return <Badge variant="success">{numStock}</Badge>;
    } else if (numStock <= 5) {
      return <Badge variant="danger">{numStock}</Badge>;
    } else {
      return <Badge variant="warning">{numStock}</Badge>;
    }
  };

  const calculateGanancia = (costo: number, precio: number) => {
    const numCosto = typeof costo === 'string' ? parseFloat(costo) : costo;
    const numPrecio = typeof precio === 'string' ? parseFloat(precio) : precio;

    if (isNaN(numCosto) || isNaN(numPrecio)) return 0;
    return numCosto - numPrecio;
  };

  // Función para formatear números para inputs (con separadores de miles)
  const formatNumberForInput = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Función para desformatear número (quitar separadores)
  const unformatNumber = (value: string) => {
    return value.replace(/\./g, '').replace(/,/g, '');
  };

  // Calcular el total de la venta
  const calcularTotalVenta = () => {
    if (!productoToVender) return 0;
    return productoToVender.costo_unitario * ventaFormData.cantidad;
  };

  // Calcular el total de montos (efectivo + transferencia)
  const calcularTotalMontos = () => {
    const efectivo = parseFloat(unformatNumber(ventaFormData.monto_efectivo.toString())) || 0;
    const transferencia = parseFloat(unformatNumber(ventaFormData.monto_transferencia.toString())) || 0;
    return efectivo + transferencia;
  };

  // Validar que los montos sumen el total correcto
  const validarMontos = () => {
    const totalVenta = calcularTotalVenta();
    const totalMontos = calcularTotalMontos();
    return Math.abs(totalVenta - totalMontos) < 0.01;
  };

  const columns = [
    {
      key: 'nombre' as keyof Producto,
      header: 'Nombre',
      render: (value: any, row: Producto) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      key: 'categoria' as keyof Producto,
      header: 'Categoría',
      render: (_value: any, row: Producto) => (
        <div>{row.categoria?.nombre || 'Sin categoría'}</div>
      ),
    },
    {
      key: 'precio_unitario' as keyof Producto,
      header: 'Precio Unitario',
      render: (_value: any, _row: Producto) => (
        <div className="text-gray-600">{formatCurrency(_value)}</div>
      ),
    },
    {
      key: 'costo_unitario' as keyof Producto,
      header: 'Costo Unitario',
      render: (_value: any, _row: Producto) => (
        <div className="text-gray-600">{formatCurrency(_value)}</div>
      ),
    },
    {
      key: 'ganancia' as keyof Producto,
      header: 'Ganancia',
      render: (_value: any, row: Producto) => {
        const ganancia = calculateGanancia(row.costo_unitario, row.precio_unitario);
        return (
          <div className="text-green-600 font-medium">{formatCurrency(ganancia)}</div>
        );
      },
    },
    {
      key: 'stock' as keyof Producto,
      header: 'Stock',
      render: (value: any) => getStockBadge(value),
    },
    {
      key: 'ganancia_total' as keyof Producto,
      header: 'Ganancia Total',
      render: (_value: any, row: Producto) => {
        const ganancia = calculateGanancia(row.costo_unitario, row.precio_unitario);
        const gananciaTotal = ganancia * (typeof row.stock === 'string' ? parseInt(row.stock) : row.stock);
        return (
          <div className="text-green-600 font-medium">{formatCurrency(gananciaTotal)}</div>
        );
      },
    },
  ];

  const actions = [
    {
      icon: ShoppingCart,
      onClick: handleVenta,
      variant: 'primary' as const,
      tooltip: 'Vender producto',
    },
    {
      icon: Edit,
      onClick: openEditModal,
      variant: 'success' as const,
      tooltip: 'Editar',
    },
    {
      icon: Trash2,
      onClick: handleDelete,
      variant: 'danger' as const,
      tooltip: 'Eliminar',
    },
  ];

  const renderEstadisticas = () => {
    if (!estadisticas) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total_productos}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total_stock}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.valor_total_inventario)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ganancia Potencial</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(estadisticas.ganancia_total_potencial)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bajo Stock (≤5)</p>
              <p className="text-2xl font-bold text-red-600">{estadisticas.productos_bajo_stock}</p>
            </div>
            <Badge variant="danger" className="h-8 w-8 flex items-center justify-center">
              !
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Óptimo (&gt;10)</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas.productos_stock_optimo}</p>
            </div>
            <Badge variant="success" className="h-8 w-8 flex items-center justify-center">
              ✓
            </Badge>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Productos"
        subtitle="Administra el inventario de productos y sus ganancias"
      />

      {renderEstadisticas()}

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <SearchFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Buscar productos..."
            showFilters={false}
          />
          <Button onClick={openCreateModal} icon={Plus}>
            Nuevo Producto
          </Button>
        </div>
      </Card>

      {/* Tabla de productos */}
      {isLoading ? (
        <Spinner className="my-16" size="lg" />
      ) : (
        <div className="mt-8">
          <DataTable
            data={productos}
            columns={columns}
            actions={actions}
            emptyMessage="No hay productos disponibles"
            showPagination={false}
          />

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal para crear/editar producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Producto
            </label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ingrese el nombre del producto"
              required
            />
            {formErrors.nombre && (
              <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría ID
            </label>
            <Input
              type="number"
              value={formData.categoria_id.toString()}
              onChange={(e) => setFormData({ ...formData, categoria_id: parseInt(e.target.value) || 1 })}
              placeholder="ID de la categoría"
              required
            />
            {formErrors.categoria_id && (
              <p className="text-red-500 text-sm mt-1">{formErrors.categoria_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.precio_unitario.toString()}
                onChange={(e) => setFormData({ ...formData, precio_unitario: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
              {formErrors.precio_unitario && (
                <p className="text-red-500 text-sm mt-1">{formErrors.precio_unitario}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo Unitario
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.costo_unitario.toString()}
                onChange={(e) => setFormData({ ...formData, costo_unitario: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
              {formErrors.costo_unitario && (
                <p className="text-red-500 text-sm mt-1">{formErrors.costo_unitario}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <Input
              type="number"
              value={formData.stock.toString()}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
            />
            {formErrors.stock && (
              <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
            >
              {isLoading && <Spinner size="sm" className="mr-2" />}
              {editingProducto ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!productoToDelete}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p>
            ¿Estás seguro de que quieres eliminar el producto{' '}
            <strong>{productoToDelete?.nombre}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={cancelDelete}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={confirmDelete} className="text-red-600 border-red-600 hover:bg-red-50">
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para registrar venta */}
      <Modal
        isOpen={isVentaModalOpen}
        onClose={closeVentaModal}
        title="Registrar Venta"
        size="lg"
      >
        {productoToVender && (
          <form onSubmit={handleVentaSubmit} className="space-y-4">
            {/* Información del producto */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Producto a vender</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <p className="font-medium text-gray-600">{productoToVender.nombre}</p>
                </div>
                <div>
                  <span className="text-gray-600">Stock disponible:</span>
                  <p className="font-medium text-gray-600">{productoToVender.stock}</p>
                </div>
                <div>
                  <span className="text-gray-600">Precio de venta:</span>
                  <p className="font-medium text-green-600">{formatCurrency(productoToVender.costo_unitario)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Ganancia unitaria:</span>
                  <p className="font-medium text-green-600">{formatCurrency(calculateGanancia(productoToVender.costo_unitario, productoToVender.precio_unitario))}</p>
                </div>
              </div>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad a vender
              </label>
              <Input
                type="number"
                min="1"
                max={productoToVender.stock.toString()}
                value={ventaFormData.cantidad.toString()}
                onChange={(e) => setVentaFormData({ ...ventaFormData, cantidad: parseInt(e.target.value) || 1 })}
                required
              />
              {ventaFormErrors.cantidad && (
                <p className="text-red-500 text-sm mt-1">{ventaFormErrors.cantidad}</p>
              )}
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Método de Pago</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const totalVenta = calcularTotalVenta();
                    const totalRedondeado = Math.round(totalVenta * 100) / 100;
                    setVentaFormData({
                      ...ventaFormData,
                      metodo_pago: 'efectivo',
                      monto_efectivo: totalRedondeado,
                      monto_transferencia: 0
                    });
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${ventaFormData.metodo_pago === 'efectivo'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-green-300 hover:bg-green-25'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold">💵</div>
                    <div className="text-sm">Efectivo</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const totalVenta = calcularTotalVenta();
                    const totalRedondeado = Math.round(totalVenta * 100) / 100;
                    setVentaFormData({
                      ...ventaFormData,
                      metodo_pago: 'transferencia',
                      monto_efectivo: 0,
                      monto_transferencia: totalRedondeado
                    });
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${ventaFormData.metodo_pago === 'transferencia'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold">🏦</div>
                    <div className="text-sm">Transferencia</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const totalVenta = calcularTotalVenta();
                    const totalRedondeado = Math.round(totalVenta * 100) / 100;
                    const mitad = totalRedondeado / 2;
                    setVentaFormData({
                      ...ventaFormData,
                      metodo_pago: 'mixto',
                      monto_efectivo: mitad,
                      monto_transferencia: mitad
                    });
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${ventaFormData.metodo_pago === 'mixto'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold">💳</div>
                    <div className="text-sm">Mixto</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Montos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto en Efectivo
                </label>
                <Input
                  type="text"
                  value={formatNumberForInput(ventaFormData.monto_efectivo)}
                  onChange={(e) => {
                    const valor = parseFloat(unformatNumber(e.target.value)) || 0;
                    setVentaFormData({ ...ventaFormData, monto_efectivo: valor });
                  }}
                  disabled={ventaFormData.metodo_pago === 'transferencia'}
                  required={ventaFormData.metodo_pago === 'efectivo' || ventaFormData.metodo_pago === 'mixto'}
                  placeholder="0"
                />
                {ventaFormErrors.monto_efectivo && (
                  <p className="text-red-500 text-sm mt-1">{ventaFormErrors.monto_efectivo}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto en Transferencia
                </label>
                <Input
                  type="text"
                  value={formatNumberForInput(ventaFormData.monto_transferencia)}
                  onChange={(e) => {
                    const valor = parseFloat(unformatNumber(e.target.value)) || 0;
                    setVentaFormData({ ...ventaFormData, monto_transferencia: valor });
                  }}
                  disabled={ventaFormData.metodo_pago === 'efectivo'}
                  required={ventaFormData.metodo_pago === 'transferencia' || ventaFormData.metodo_pago === 'mixto'}
                  placeholder="0"
                />
                {ventaFormErrors.monto_transferencia && (
                  <p className="text-red-500 text-sm mt-1">{ventaFormErrors.monto_transferencia}</p>
                )}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones (opcional)
              </label>
              <textarea
                value={ventaFormData.observaciones}
                onChange={(e) => setVentaFormData({ ...ventaFormData, observaciones: e.target.value })}
                placeholder="Observaciones adicionales..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>

            {/* Resumen de la venta */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Resumen de la venta</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calcularTotalVenta())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Ganancia total:</span>
                  <span className="font-medium text-green-600">{formatCurrency(calculateGanancia(productoToVender.costo_unitario, productoToVender.precio_unitario) * ventaFormData.cantidad)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Stock restante:</span>
                  <span className="font-medium">{productoToVender.stock - ventaFormData.cantidad}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeVentaModal}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <Spinner size="sm" className="mr-2" />}
                Registrar Venta
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProductosPage;
