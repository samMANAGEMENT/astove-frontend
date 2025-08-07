import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Eye } from 'lucide-react';
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
import { productService } from '../lib/services/productsService';
import type { Product } from '../lib/services/productsService';

interface ProductFormData {
  code: string;
  name: string;
  description: string;
  price: number;
  min_quantity: number;
  multiple: number;
  category: string;
  brand: string;
  unit: string;
  weight: number;
  dimensions: string;
  sku: string;
  barcode: string;
  status: string;
  image?: File;
}

const ProductsPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    code: '',
    name: '',
    description: '',
    price: 0,
    min_quantity: 1,
    multiple: 1,
    category: '',
    brand: '',
    unit: '',
    weight: 0,
    dimensions: '',
    sku: '',
    barcode: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState<{
    code?: string;
    name?: string;
    description?: string;
    price?: string;
    min_quantity?: string;
    multiple?: string;
    category?: string;
    brand?: string;
    unit?: string;
    weight?: string;
    dimensions?: string;
    sku?: string;
    barcode?: string;
  }>({});

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar la lista de productos');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      price: 0,
      min_quantity: 1,
      multiple: 1,
      category: '',
      brand: '',
      unit: '',
      weight: 0,
      dimensions: '',
      sku: '',
      barcode: '',
      status: 'active',
    });
    setFormErrors({});
    setEditingProduct(null);
    setProductToDelete(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price,
      min_quantity: product.min_quantity,
      multiple: product.multiple,
      category: product.category,
      brand: product.brand,
      unit: product.unit,
      weight: product.weight,
      dimensions: product.dimensions,
      sku: product.sku,
      barcode: product.barcode,
      status: product.status.trim(),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: {
      code?: string;
      name?: string;
      description?: string;
      price?: string;
      min_quantity?: string;
      multiple?: string;
      category?: string;
      brand?: string;
      unit?: string;
      weight?: string;
      dimensions?: string;
      sku?: string;
      barcode?: string;
    } = {};

    if (!formData.code.trim()) {
      errors.code = 'El código es requerido';
    }
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    if (!formData.description.trim()) {
      errors.description = 'La descripción es requerida';
    }
    if (formData.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }
    if (formData.min_quantity <= 0) {
      errors.min_quantity = 'La cantidad mínima debe ser mayor a 0';
    }
    if (formData.multiple <= 0) {
      errors.multiple = 'El múltiplo debe ser mayor a 0';
    }
    if (!formData.category.trim()) {
      errors.category = 'La categoría es requerida';
    }
    if (!formData.brand.trim()) {
      errors.brand = 'La marca es requerida';
    }
    if (!formData.unit.trim()) {
      errors.unit = 'La unidad es requerida';
    }
    if (formData.weight <= 0) {
      errors.weight = 'El peso debe ser mayor a 0';
    }
    if (!formData.dimensions.trim()) {
      errors.dimensions = 'Las dimensiones son requeridas';
    }
    if (!formData.sku.trim()) {
      errors.sku = 'El SKU es requerido';
    }
    if (!formData.barcode.trim()) {
      errors.barcode = 'El código de barras es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await productService.create(formData);
        toast.success('Producto creado exitosamente');
      }

      // Recargar productos
      await loadProducts();
      
      closeModal();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error(editingProduct ? 'Error al actualizar el producto' : 'Error al crear el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      setIsLoading(true);
      await productService.delete(productToDelete.id);
      toast.success('Producto eliminado exitosamente');
      await loadProducts();
      setProductToDelete(null);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setProductToDelete(null);
  };

  const handleView = (product: Product) => {
    console.log('Ver producto:', product);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'name' as keyof Product,
      header: 'Producto',
      render: (value: string | number | undefined, row: Product) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{String(value || '')}</div>
            <div className="text-sm text-gray-500">{row.code} • {row.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'brand' as keyof Product,
      header: 'Marca',
      render: (value: string | number | undefined) => (
        <span className="font-medium text-gray-900">{String(value || '')}</span>
      ),
    },
    {
      key: 'price' as keyof Product,
      header: 'Precio',
      render: (value: string | number | undefined) => (
        <span className="font-medium text-green-600">
          {typeof value === 'number' ? formatCurrency(value) : '$0'}
        </span>
      ),
    },
    {
      key: 'status' as keyof Product,
      header: 'Estado',
      render: (value: string | number | undefined) => {
        const status = String(value || '').trim();
        return (
          <Badge 
            variant={status === 'active' ? 'success' : 'danger'}
          >
            {status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
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
      tooltip: 'Editar producto',
    },
    {
      icon: Trash2,
      onClick: handleDelete,
      variant: 'danger' as const,
      tooltip: 'Eliminar producto',
    },
  ];

  const handleFiltersClick = () => {
    console.log('Abrir filtros');
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchValue.toLowerCase();
    
    return (
      (product.name || '').toLowerCase().includes(searchLower) ||
      (product.code || '').toLowerCase().includes(searchLower) ||
      (product.category || '').toLowerCase().includes(searchLower) ||
      (product.brand || '').toLowerCase().includes(searchLower) ||
      (product.sku || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Lista de Productos"
        subtitle="Gestiona todos los productos del sistema"
      >
        <Button
          icon={Plus}
          onClick={openCreateModal}
        >
          Nuevo Producto
        </Button>
      </PageHeader>

      {/* Filters and Search */}
      <Card>
        <SearchFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFiltersClick={handleFiltersClick}
          searchPlaceholder="Buscar productos por nombre, código, categoría, marca o SKU..."
        />
      </Card>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <DataTable
          data={filteredProducts}
          columns={columns}
          actions={actions}
          emptyMessage="No se encontraron productos"
        />
      )}

      {/* Modal para crear/editar producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="P001"
                required
              />
              {formErrors.code && (
                <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del producto"
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del producto"
                required
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                value={formData.price.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
              />
              {formErrors.price && (
                <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Computadoras"
                required
              />
              {formErrors.category && (
                <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Gaming Pro"
                required
              />
              {formErrors.brand && (
                <p className="text-red-500 text-sm mt-1">{formErrors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad *
              </label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="unidad"
                required
              />
              {formErrors.unit && (
                <p className="text-red-500 text-sm mt-1">{formErrors.unit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad Mínima *
              </label>
              <input
                type="number"
                value={formData.min_quantity.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, min_quantity: parseInt(e.target.value) || 1 }))}
                placeholder="1"
                min="1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
              />
              {formErrors.min_quantity && (
                <p className="text-red-500 text-sm mt-1">{formErrors.min_quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Múltiplos *
              </label>
              <input
                type="number"
                value={formData.multiple.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, multiple: parseInt(e.target.value) || 1 }))}
                placeholder="1"
                min="1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
              />
              {formErrors.multiple && (
                <p className="text-red-500 text-sm mt-1">{formErrors.multiple}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg) *
              </label>
              <input
                type="number"
                value={formData.weight.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                placeholder="2.8"
                min="0"
                step="0.1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
              />
              {formErrors.weight && (
                <p className="text-red-500 text-sm mt-1">{formErrors.weight}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensiones *
              </label>
              <Input
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="35x25x2"
                required
              />
              {formErrors.dimensions && (
                <p className="text-red-500 text-sm mt-1">{formErrors.dimensions}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="LAP001"
                required
              />
              {formErrors.sku && (
                <p className="text-red-500 text-sm mt-1">{formErrors.sku}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras *
              </label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                placeholder="9876543210987"
                required
              />
              {formErrors.barcode && (
                <p className="text-red-500 text-sm mt-1">{formErrors.barcode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
                required
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, image: file }));
                  }
                }}
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
              />
            </div>
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
              {editingProduct ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={!!productToDelete}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar el producto{' '}
            <span className="font-semibold text-gray-900">
              "{productToDelete?.name}"
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

export default ProductsPage;

