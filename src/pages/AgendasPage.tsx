import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Edit, Trash2, Clock, User } from 'lucide-react';
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
import agendaService, { type Agenda, type CrearAgendaData } from '../lib/services/agendaService';
import operadoresService, { type Operador } from '../lib/services/operadoresService';

interface AgendaFormData {
  operador_id: number | null;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

const AgendasPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [agendaToDelete, setAgendaToDelete] = useState<Agenda | null>(null);
  const [formData, setFormData] = useState<AgendaFormData>({
    operador_id: null,
    nombre: '',
    descripcion: '',
    activa: true,
  });
  const [formErrors, setFormErrors] = useState<{
    operador_id?: string;
    nombre?: string;
  }>({});

  useEffect(() => {
    loadAgendas();
    loadOperadores();
  }, []);

  const loadOperadores = async () => {
    try {
      const data = await operadoresService.getAll();
      setOperadores(data);
    } catch (error) {
      console.error('Error al cargar operadores:', error);
      toast.error('Error al cargar la lista de operadores');
    }
  };

  const loadAgendas = async () => {
    try {
      setIsLoading(true);
      const data = await agendaService.getAll();
      setAgendas(data);
    } catch (error) {
      console.error('Error al cargar agendas:', error);
      toast.error('Error al cargar la lista de agendas');
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleView = (agenda: Agenda) => {
    navigate(`/agendas/${agenda.id}/calendario`);
  };

  const resetForm = () => {
    setFormData({
      operador_id: null,
      nombre: '',
      descripcion: '',
      activa: true,
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    const errors: typeof formErrors = {};
    if (!formData.operador_id) errors.operador_id = 'El operador es requerido';
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingAgenda) {
        await agendaService.update(editingAgenda.id, formData as Partial<CrearAgendaData>);
        toast.success('Agenda actualizada correctamente');
      } else {
        await agendaService.create(formData as CrearAgendaData);
        toast.success('Agenda creada correctamente');
      }
      
      setIsModalOpen(false);
      resetForm();
      setEditingAgenda(null);
      loadAgendas();
    } catch (error: any) {
      console.error('Error al guardar agenda:', error);
      toast.error(error.response?.data?.error || 'Error al guardar la agenda');
    }
  };

  const handleEdit = (agenda: Agenda) => {
    setEditingAgenda(agenda);
    setFormData({
      operador_id: agenda.operador_id,
      nombre: agenda.nombre,
      descripcion: agenda.descripcion || '',
      activa: agenda.activa,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!agendaToDelete) return;

    try {
      await agendaService.delete(agendaToDelete.id);
      toast.success('Agenda eliminada correctamente');
      setAgendaToDelete(null);
      loadAgendas();
    } catch (error: any) {
      console.error('Error al eliminar agenda:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar la agenda');
    }
  };

  const filteredAgendas = agendas.filter(agenda =>
    agenda.nombre.toLowerCase().includes(searchValue.toLowerCase()) ||
    agenda.operador?.nombre.toLowerCase().includes(searchValue.toLowerCase()) ||
    agenda.operador?.apellido.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns = [
    {
      key: 'nombre' as keyof Agenda,
      header: 'Nombre',
      render: (_: any, agenda: Agenda) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{agenda.nombre}</span>
        </div>
      ),
    },
    {
      key: 'operador' as keyof Agenda,
      header: 'Operador',
      render: (_: any, agenda: Agenda) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span>{agenda.operador ? `${agenda.operador.nombre} ${agenda.operador.apellido}` : 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'horarios' as keyof Agenda,
      header: 'Horarios',
      render: (_: any, agenda: Agenda) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-500" />
          <span>{agenda.horarios?.length || 0} horarios</span>
        </div>
      ),
    },
    {
      key: 'estado' as keyof Agenda,
      header: 'Estado',
      render: (_: any, agenda: Agenda) => (
        <Badge variant={agenda.activa ? 'success' : 'outline'}>
          {agenda.activa ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      key: 'actions' as keyof Agenda,
      header: 'Acciones',
      render: (_: any, agenda: Agenda) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(agenda)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(agenda)}
            className="text-yellow-600 hover:text-yellow-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAgendaToDelete(agenda)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Agendas"
        subtitle="Administra las agendas de los operadores"
      />

      <Card>
        <div className="flex justify-between items-center mb-6">
          <SearchFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Agenda
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <DataTable
            data={filteredAgendas}
            columns={columns}
            emptyMessage="No se encontraron agendas"
          />
        )}
      </Card>

      {/* Modal para crear/editar agenda */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
          setEditingAgenda(null);
        }}
        title={editingAgenda ? 'Editar Agenda' : 'Nueva Agenda'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operador *
            </label>
            <select
              value={formData.operador_id || ''}
              onChange={(e) => setFormData({ ...formData, operador_id: Number(e.target.value) || null })}
              className={` text-gray-600 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.operador_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar operador</option>
              {operadores.map((operador) => (
                <option key={operador.id} value={operador.id}>
                  {operador.nombre} {operador.apellido}
                </option>
              ))}
            </select>
            {formErrors.operador_id && (
              <p className="text-red-500 text-sm mt-1">{formErrors.operador_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Agenda *
            </label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Agenda de turno matutino"
            />
            {formErrors.nombre && (
              <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción opcional de la agenda"
              rows={3}
              className=" text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activa"
              checked={formData.activa}
              onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activa" className="ml-2 text-sm text-gray-700">
              Agenda activa
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
                setEditingAgenda(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingAgenda ? 'Actualizar' : 'Crear'} Agenda
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!agendaToDelete}
        onClose={() => setAgendaToDelete(null)}
        title="Confirmar eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar la agenda "{agendaToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setAgendaToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgendasPage;
