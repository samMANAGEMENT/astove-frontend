import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  DataTable,
  PageHeader,
  SearchFilters,
  Modal,
  Input,
  Spinner,
} from '../components/ui';
import { clientService } from '../lib/services/clientService';
import type { Client } from '../lib/services/clientService';

interface ClientFormData {
  name: string;
  business_name: string;
  nit: string;
  address: string;
  phone: string;
  order_start_date: number;
  order_end_date: number;
  email?: string;
  password?: string;
}

const ClientesPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    business_name: '',
    nit: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    order_start_date: 0,
    order_end_date: 0,
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    business_name?: string;
    nit?: string;
    address?: string;
    phone?: string;
    email?: string;
    password?: string;
    order_start_date?: string;
    order_end_date?: string;
  }>({});

  // Cargar todos los clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar la lista de clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      business_name: '',
      nit: '',
      address: '',
      phone: '',
      email: '',
      password: '',
      order_start_date: 0,
      order_end_date: 0,
    });
    setFormErrors({});
    setEditingClient(null);
    setClientToDelete(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      business_name: client.business_name || '',
      nit: client.nit || '',
      address: client.address || '',
      phone: client.phone || '',
      order_start_date: client.order_start_date || 0,
      order_end_date: client.order_end_date || 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      business_name?: string;
      nit?: string;
      address?: string;
      phone?: string;
      email?: string;
      password?: string;
      order_start_date?: string;
      order_end_date?: string;
    } = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    if (!formData.business_name.trim()) {
      errors.business_name = 'El nombre comercial es requerido';
    }
    if (!formData.nit.trim()) {
      errors.nit = 'El NIT es requerido';
    }
    if (!formData.address.trim()) {
      errors.address = 'La dirección es requerida';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es requerido';
    }
    
    if (editingClient) {
      if (formData.order_start_date < 0 || formData.order_start_date > 6) {
        errors.order_start_date = 'El día debe estar entre 0 (Domingo) y 6 (Sábado)';
      }
      if (formData.order_end_date < 0 || formData.order_end_date > 6) {
        errors.order_end_date = 'El día debe estar entre 0 (Domingo) y 6 (Sábado)';
      }
    }

    // Solo validar email y contraseña si no estamos editando
    if (!editingClient) {
      if (!formData.email || !formData.email.trim()) {
        errors.email = 'El email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'El email no es válido';
      }
      if (!formData.password || !formData.password.trim()) {
        errors.password = 'La contraseña es requerida';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      if (editingClient) {
        const { email, password, ...updateData } = formData;
        await clientService.updateClient(editingClient.id, updateData);
        toast.success('Cliente actualizado exitosamente');
      } else {
        await clientService.createClient(formData as Required<ClientFormData>);
        toast.success(
          'Cliente creado exitosamente. Las credenciales de acceso han sido enviadas al correo electrónico registrado.',
          {
            autoClose: 6000,
            position: "top-right"
          }
        );
      }

      // Recargar todos los clientes
      await loadClients();
      
      closeModal();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      toast.error(editingClient ? 'Error al actualizar el cliente' : 'Error al crear el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      setIsLoading(true);
      await clientService.deleteClient(clientToDelete.id);
      toast.success('Cliente eliminado exitosamente');
      await loadClients();
      setClientToDelete(null);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast.error('Error al eliminar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setClientToDelete(null);
  };

  const handleView = (client: Client) => {
    console.log('Ver cliente:', client);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    client.business_name.toLowerCase().includes(searchValue.toLowerCase()) ||
    client.nit.includes(searchValue)
  );

  const columns = [
    {
      key: 'name' as keyof Client,
      header: 'Nombre',
      render: (value: string | number, row: Client) => (
        <div>
          <div className="font-medium text-gray-900">{String(value)}</div>
          <div className="text-sm text-gray-500">{row.business_name}</div>
        </div>
      ),
    },
    {
      key: 'nit' as keyof Client,
      header: 'NIT',
      render: (value: string | number) => (
        <span className="font-mono text-sm">{String(value)}</span>
      ),
    },
    {
      key: 'phone' as keyof Client,
      header: 'Teléfono',
      render: (value: string | number) => (
        <span className="text-sm">{String(value)}</span>
      ),
    },
    {
      key: 'created_at' as keyof Client,
      header: 'Fecha de Creación',
      render: (value: string | number) => (
        <span className="text-sm text-gray-500">
          {new Date(String(value)).toLocaleDateString('es-ES')}
        </span>
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
      tooltip: 'Editar',
    },
    {
      icon: Trash2,
      onClick: handleDelete,
      variant: 'danger' as const,
      tooltip: 'Eliminar',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Clientes"
        subtitle="Administra los clientes de tu empresa"
      >
        <Button
          icon={Plus}
          onClick={openCreateModal}
        >
          Nuevo Cliente
        </Button>
      </PageHeader>

      <Card>
        <SearchFilters
          searchValue={searchValue}
          onSearchChange={handleSearch}
          onFiltersClick={() => {}}
          searchPlaceholder="Buscar clientes..."
        />
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <DataTable
          data={filteredClients}
          columns={columns}
          actions={actions}
          emptyMessage="No hay clientes registrados"
        />
      )}

      {/* Modal para crear/editar cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Comercial *
              </label>
              <Input
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                required
              />
              {formErrors.business_name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.business_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIT *
              </label>
              <Input
                value={formData.nit}
                onChange={(e) => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                required
              />
              {formErrors.nit && (
                <p className="text-red-500 text-xs mt-1">{formErrors.nit}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
              {formErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
              {formErrors.address && (
                <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
              )}
            </div>

            {editingClient && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día de Inicio de Pedido *
                  </label>
                  <input
                    type="number"
                    value={String(formData.order_start_date)}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_start_date: Number(e.target.value) }))}
                    min="0"
                    max="6"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
                  />
                  {formErrors.order_start_date && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.order_start_date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día de Fin de Pedido *
                  </label>
                  <input
                    type="number"
                    value={String(formData.order_end_date)}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_end_date: Number(e.target.value) }))}
                    min="0"
                    max="6"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
                  />
                  {formErrors.order_end_date && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.order_end_date}</p>
                  )}
                </div>
              </>
            )}
            {!editingClient && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Spinner size="sm" />}
              {editingClient ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={!!clientToDelete}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar el cliente{' '}
            <span className="font-semibold text-gray-900">
              "{clientToDelete?.name}"
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

export default ClientesPage; 