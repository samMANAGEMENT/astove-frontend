import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  DataTable,
  PageHeader,
  SearchFilters,

  Autocomplete,
  Modal,
  Input,
  Spinner,
} from '../components/ui';
import { branchService, clientService } from '../lib/services/branchService';
import type { Branch, Client } from '../lib/services/branchService';

interface BranchFormData {
  name: string;
  address: string;
  city: string;
  budget: number;
  email: string;
  client_id: string;
}

const SucursalesPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: '',
    city: '',
    budget: 0,
    email: '',
    client_id: '',
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    address?: string;
    city?: string;
    budget?: string;
    email?: string;
    client_id?: string;
  }>({});

  // Cargar todas las sucursales y clientes al montar el componente
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingClients(true);
      
      // Cargar sucursales y clientes en paralelo
      const [branchesData, clientsData] = await Promise.all([
        branchService.getAllBranches(),
        clientService.getUserClients()
      ]);
      
      setBranches(branchesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar la lista de sucursales');
    } finally {
      setIsLoading(false);
      setIsLoadingClients(false);
    }
  };

  const loadClients = async (query: string = '') => {
    try {
      setIsLoadingClients(true);
      const data = query 
        ? await clientService.searchUserClients(query)
        : await clientService.getUserClients();
      setClients(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleClientSearch = (query: string) => {
    loadClients(query);
  };

  const handleClientChange = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      setFormData(prev => ({ ...prev, client_id: client.id }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      budget: 0,
      email: '',
      client_id: '',
    });
    setFormErrors({});
    setEditingBranch(null);
    setSelectedClient(null);
    setBranchToDelete(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      budget: branch.budget,
      email: '',
      client_id: branch.client_id,
    });
    // Buscar el cliente correspondiente
    const client = Array.isArray(clients) ? clients.find(c => c.id === branch.client_id) : null;
    if (client) {
      setSelectedClient(client);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      address?: string;
      city?: string;
      budget?: string;
      email?: string;
      client_id?: string;
    } = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    if (!formData.address.trim()) {
      errors.address = 'La dirección es requerida';
    }
    if (!formData.city.trim()) {
      errors.city = 'La ciudad es requerida';
    }
    if (formData.budget <= 0) {
      errors.budget = 'El presupuesto debe ser mayor a 0';
    }
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    if (!formData.client_id) {
      errors.client_id = 'El cliente es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      if (editingBranch) {
        await branchService.updateBranch(editingBranch.id, formData);
        toast.success('Sucursal actualizada exitosamente');
      } else {
        await branchService.createBranch(formData);
        toast.success('Sucursal creada exitosamente');
      }

      // Recargar todas las sucursales
      await loadAllData();
      
      closeModal();
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
      toast.error(editingBranch ? 'Error al actualizar la sucursal' : 'Error al crear la sucursal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    setBranchToDelete(branch);
  };

  const confirmDelete = async () => {
    if (!branchToDelete) return;
    
    try {
      setIsLoading(true);
      await branchService.deleteBranch(branchToDelete.id);
      toast.success('Sucursal eliminada exitosamente');
      await loadAllData();
      setBranchToDelete(null);
    } catch (error) {
      console.error('Error al eliminar sucursal:', error);
      toast.error('Error al eliminar la sucursal');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setBranchToDelete(null);
  };

  const handleView = (branch: Branch) => {
    console.log('Ver sucursal:', branch);
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
      key: 'name' as keyof Branch,
      header: 'Sucursal',
      render: (value: string | number | undefined, row: Branch) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{String(value || '')}</div>
            <div className="text-sm text-gray-500">{row.address}, {row.city}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'client_name' as keyof Branch,
      header: 'Cliente',
      render: (_value: string | number | undefined, row: Branch) => {
        const client = Array.isArray(clients) ? clients.find(c => c.id === row.client_id) : null;
        return client?.name || 'Cliente no encontrado';
      },
    },
    {
      key: 'budget' as keyof Branch,
      header: 'Presupuesto',
      render: (value: string | number | undefined) => (
        <span className="font-medium text-green-600">
          {typeof value === 'number' ? formatCurrency(value) : '$0'}
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
      tooltip: 'Editar sucursal',
    },
    {
      icon: Trash2,
      onClick: handleDelete,
      variant: 'danger' as const,
      tooltip: 'Eliminar sucursal',
    },
  ];

  const handleFiltersClick = () => {
    console.log('Abrir filtros');
  };

  const filteredBranches = branches.filter(branch => {
    const searchLower = searchValue.toLowerCase();
    const client = Array.isArray(clients) ? clients.find(c => c.id === branch.client_id) : null;
    const clientName = client?.name || '';
    
    return (
      (branch.name || '').toLowerCase().includes(searchLower) ||
      (branch.address || '').toLowerCase().includes(searchLower) ||
      (branch.city || '').toLowerCase().includes(searchLower) ||
      clientName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Lista de Sucursales"
        subtitle="Gestiona todas las sucursales de tus clientes"
      >
        <Button
          icon={Plus}
          onClick={openCreateModal}
        >
          Nueva Sucursal
        </Button>
      </PageHeader>

      {/* Filters and Search */}
      <Card>
        <SearchFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFiltersClick={handleFiltersClick}
          searchPlaceholder="Buscar sucursales por nombre, dirección, ciudad o cliente..."
        />
      </Card>

      {/* Branches Table */}
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <DataTable
          data={filteredBranches}
          columns={columns}
          actions={actions}
          emptyMessage="No se encontraron sucursales"
        />
      )}

      {/* Modal para crear/editar sucursal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Sucursal *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la sucursal"
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <Autocomplete
                options={clients}
                value={selectedClient}
                onChange={handleClientChange}
                placeholder="Seleccionar cliente"
                onSearch={handleClientSearch}
                loading={isLoadingClients}
              />
              {formErrors.client_id && (
                <p className="text-red-500 text-sm mt-1">{formErrors.client_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Dirección completa"
                required
              />
              {formErrors.address && (
                <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad *
              </label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Ciudad"
                required
              />
              {formErrors.city && (
                <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto *
              </label>
              <input
                type="number"
                value={formData.budget.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
              />
              {formErrors.budget && (
                <p className="text-red-500 text-sm mt-1">{formErrors.budget}</p>
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
                placeholder="email@sucursal.com"
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
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
              {editingBranch ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={!!branchToDelete}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar la sucursal{' '}
            <span className="font-semibold text-gray-900">
              "{branchToDelete?.name}"
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

export default SucursalesPage;