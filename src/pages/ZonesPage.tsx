import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import {
    Button,
    Card,
    DataTable,
    PageHeader,
    SearchFilters,
    Modal,
    Input,
} from '../components/ui';
import { ZoneService } from '../lib/services/zonesService';
import type { Zone } from '../lib/services/zonesService';
import { toast } from 'react-toastify';
import { clientService } from '../lib/services/clientService';
import type { Client } from '../lib/services/clientService';


interface ZoneFormData {
    name: string;
    description: string;
    client_id: string;
}

const ZonasPage: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [zones, setZones] = useState<Zone[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [formData, setFormData] = useState<ZoneFormData>({
        name: '',
        description: '',
        client_id: '',
    });
    const [formErrors, setFormErrors] = useState<Partial<ZoneFormData>>({});

    useEffect(() => {
        loadZones();
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await clientService.getAllClients();
            setClients(data);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            toast.error('Error al cargar los clientes');
        }
    };

    const loadZones = async () => {
        try {
            setIsLoading(true);
            const data = await ZoneService.getAllZones();
            setZones(data);
        } catch (error) {
            console.error('Error al cargar zonas:', error);
            toast.error('Error al cargar las zonas');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', client_id: '' });
        setFormErrors({});
        setEditingZone(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (zone: Zone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name || '',
            description: zone.description || '',
            client_id: zone.client_id || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const validateForm = (): boolean => {
        const errors: Partial<ZoneFormData> = {};
        if (!formData.name.trim()) errors.name = 'El nombre es requerido';
        if (!formData.description.trim()) errors.description = 'La descripción es requerida';
        if (!formData.client_id.trim()) errors.client_id = 'El ID del cliente es requerido'
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            if (editingZone) {
                await ZoneService.updateZone(editingZone.id, formData);
                toast.success('Zona actualizada correctamente');
            } else {
                await ZoneService.createZone(formData);
                toast.success('Zona creada exitosamente');
            }

            await loadZones();
            closeModal();
        } catch (error) {
            console.error('Error al guardar zona:', error);
            toast.error('Error al guardar la zona');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (zone: Zone) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la zona "${zone.name}"?`)) {
            try {
                setIsLoading(true);
                await ZoneService.deleteZone(zone.id);
                toast.success('Zona eliminada correctamente');
                await loadZones();
            } catch (error) {
                console.error('Error al eliminar zona:', error);
                toast.error('Error al eliminar la zona');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const columns = [
        {
            key: 'name' as keyof Zone,
            header: 'Nombre',
            render: (value: string | undefined, _row: Zone) => (
                <span className="font-medium text-gray-900">{value}</span>
            ),
        },
        {
            key: 'description' as keyof Zone,
            header: 'Descripción',
            render: (value: string | undefined, _row: Zone) => (
                <span className="text-gray-800">{value}</span>
            ),
        },
        {
            key: 'created_at' as keyof Zone,
            header: 'Fecha de Creación',
            render: (value: string | undefined, _row: Zone) => (
                <span className="text-sm text-gray-500">
                    {value ? new Date(value).toLocaleDateString('es-ES') : 'Sin fecha'}
                </span>
            ),
        },
    ];




    const actions = [
        { icon: Eye, onClick: (zone: Zone) => console.log(zone), variant: 'primary' as const, tooltip: 'Ver' },
        { icon: Edit, onClick: openEditModal, variant: 'success' as const, tooltip: 'Editar' },
        { icon: Trash2, onClick: handleDelete, variant: 'danger' as const, tooltip: 'Eliminar' },
    ];

    const filteredZones = zones.filter(zone =>
        zone.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        zone.description.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Zonas"
                subtitle="Administra las zonas geográficas"
            >
                <Button icon={Plus} onClick={openCreateModal}>
                    Nueva Zona
                </Button>
            </PageHeader>

            <Card>
                <SearchFilters
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    onFiltersClick={() => { }}
                    searchPlaceholder="Buscar zonas..."
                />
            </Card>

            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <DataTable
                    data={filteredZones}
                    columns={columns}
                    actions={actions}
                    emptyMessage="No hay zonas registradas"
                />
            )}

            {/* Modal de creación/edición */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingZone ? 'Editar Zona' : 'Nueva Zona'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        {formErrors.name && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                        )}
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                    <select
                        value={formData.client_id}
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccione un cliente</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>



                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción *
                        </label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                        {formErrors.description && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" type="button" onClick={closeModal} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingZone ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ZonasPage;
