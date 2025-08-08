import React, { useState, useEffect } from 'react';
import { Trash2, Eye } from 'lucide-react';
import { ventasService } from '../lib/services/ventasService';
import type { Venta } from '../lib/services/ventasService';
import { Button, Card, DataTable, PageHeader, SearchFilters, Modal, Badge, Spinner } from '../components/ui';

const VentasPage: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [ventaToDelete, setVentaToDelete] = useState<Venta | null>(null);

  useEffect(() => {
    loadVentas();
  }, [currentPage, searchTerm]);

  const loadVentas = async () => {
    setIsLoading(true);
    try {
      const response = await ventasService.listarVentas({
        page: currentPage,
        per_page: 10,
        search: searchTerm
      });
      setVentas(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleView = (venta: Venta) => {
    setSelectedVenta(venta);
    setShowViewModal(true);
  };

  const handleDelete = (venta: Venta) => {
    setVentaToDelete(venta);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!ventaToDelete) return;

    setIsDeleting(true);
    try {
      await ventasService.eliminarVenta(ventaToDelete.id);
      setShowDeleteModal(false);
      setVentaToDelete(null);
      loadVentas();
    } catch (error) {
      console.error('Error al eliminar venta:', error);
    } finally {
      setIsDeleting(false);
    }
  };

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetodoPagoBadge = (metodo: string) => {
    const variants = {
      efectivo: 'success' as const,
      transferencia: 'info' as const,
      mixto: 'warning' as const
    };
    return <Badge variant={variants[metodo as keyof typeof variants]}>{metodo.toUpperCase()}</Badge>;
  };

  const columns = [
    {
      key: 'id' as keyof Venta,
      header: 'ID',
      render: (value: any) => <span className="font-medium">#{value}</span>
    },
    {
      key: 'empleado' as keyof Venta,
      header: 'Empleado',
      render: (value: any) => (
        <div>
          <div className="font-medium">{value?.nombre} {value?.apellido}</div>
          <div className="text-sm text-gray-500">ID: {value?.id}</div>
        </div>
      )
    },
    {
      key: 'productos' as keyof Venta,
      header: 'Productos',
      render: (value: any) => (
        <div className="space-y-1">
          {value?.map((producto: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{producto.nombre}</span>
              <span className="text-gray-500"> x{producto.pivot.cantidad}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'total' as keyof Venta,
      header: 'Total',
      render: (value: any) => (
        <span className="font-medium text-green-600">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'ganancia_total' as keyof Venta,
      header: 'Ganancia',
      render: (value: any) => (
        <span className="font-medium text-blue-600">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'metodo_pago' as keyof Venta,
      header: 'Método Pago',
      render: (value: any) => getMetodoPagoBadge(value)
    },
    {
      key: 'created_at' as keyof Venta,
      header: 'Fecha',
      render: (value: any) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      )
    }
  ];

  const actions = [
    {
      icon: Eye,
      onClick: handleView,
      variant: 'primary' as const,
      tooltip: 'Ver detalles'
    },
    {
      icon: Trash2,
      onClick: handleDelete,
      variant: 'danger' as const,
      tooltip: 'Eliminar venta'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Ventas"
        subtitle="Administra y visualiza todas las ventas registradas"
      />

      <Card>
        <div className="p-6">
          <SearchFilters
            searchValue={searchTerm}
            onSearchChange={handleSearch}
            searchPlaceholder="Buscar por producto o empleado..."
            className="mb-6"
          />

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-500">Cargando ventas...</p>
              </div>
            </div>
          ) : (
            <DataTable
              data={ventas}
              columns={columns}
              actions={actions}
              className="min-h-[400px]"
              emptyMessage="No hay ventas registradas"
              showPagination={true}
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </Card>

      {/* Modal para ver detalles de la venta */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalles de la Venta"
        size="lg"
      >
        {selectedVenta && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Venta
                </label>
                <p className="text-gray-900">#{selectedVenta.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <p className="text-gray-900">{formatDate(selectedVenta.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empleado
                </label>
                <p className="text-gray-900">
                  {selectedVenta.empleado?.nombre} {selectedVenta.empleado?.apellido}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <div className="mt-1">{getMetodoPagoBadge(selectedVenta.metodo_pago)}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Productos Vendidos
              </label>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {selectedVenta.productos?.map((producto, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {producto.pivot.cantidad} | 
                        Precio unitario: {formatCurrency(producto.precio_unitario)}
                      </p>
                    </div>
                    <p className="font-medium text-green-600">
                      {formatCurrency(producto.pivot.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Venta
                </label>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(selectedVenta.total)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ganancia Total
                </label>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(selectedVenta.ganancia_total)}
                </p>
              </div>
            </div>

            {selectedVenta.observaciones && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedVenta.observaciones}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar la venta #{ventaToDelete?.id}?
          </p>
          <p className="text-sm text-gray-500">
            Esta acción restaurará el stock de los productos vendidos y no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Spinner size="sm" className="mr-2" />}
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VentasPage;
