import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Edit, Trash2, Clock, User, Search, CalendarDays } from 'lucide-react';
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

  // Estados para consulta de espacios
  const [showEspaciosModal, setShowEspaciosModal] = useState(false);
  const [agendaParaConsultar, setAgendaParaConsultar] = useState<Agenda | null>(null);
  const [fechaConsulta, setFechaConsulta] = useState(new Date().toISOString().split('T')[0]);
  const [espaciosDisponibles, setEspaciosDisponibles] = useState<any>(null);
  const [isLoadingEspacios, setIsLoadingEspacios] = useState(false);

  // Estados para disponibilidad en tiempo real
  const [disponibilidadTiempoReal, setDisponibilidadTiempoReal] = useState<any>(null);
  const [isLoadingDisponibilidad, setIsLoadingDisponibilidad] = useState(false);
  const [fechaDisponibilidad, setFechaDisponibilidad] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadAgendas();
    loadOperadores();
    cargarDisponibilidadTiempoReal();
  }, []);

  // Cargar disponibilidad en tiempo real
  const cargarDisponibilidadTiempoReal = async () => {
    setIsLoadingDisponibilidad(true);
    try {
      const data = await agendaService.obtenerDisponibilidadTiempoReal(fechaDisponibilidad);
      setDisponibilidadTiempoReal(data);
    } catch (error: any) {
      console.error('Error al cargar disponibilidad:', error);
      toast.error(error.response?.data?.error || 'Error al cargar disponibilidad');
    } finally {
      setIsLoadingDisponibilidad(false);
    }
  };

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

  const handleConsultarEspacios = (agenda: Agenda) => {
    setAgendaParaConsultar(agenda);
    setFechaConsulta(new Date().toISOString().split('T')[0]);
    setEspaciosDisponibles(null);
    setShowEspaciosModal(true);
  };

  const consultarEspacios = async () => {
    if (!agendaParaConsultar) return;

    setIsLoadingEspacios(true);
    try {
      const data = await agendaService.consultarEspaciosDisponibles(agendaParaConsultar.id, fechaConsulta);
      setEspaciosDisponibles(data);
    } catch (error: any) {
      console.error('Error al consultar espacios:', error);
      toast.error(error.response?.data?.error || 'Error al consultar espacios disponibles');
    } finally {
      setIsLoadingEspacios(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            onClick={() => handleConsultarEspacios(agenda)}
            className="text-green-600 hover:text-green-700"
          >
            <Search className="w-4 h-4" />
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

      {/* Sección de disponibilidad en tiempo real */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Disponibilidad en Tiempo Real
            </h3>
            <p className="text-sm text-gray-600">
              Consulta los espacios disponibles para agendar citas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={fechaDisponibilidad}
              onChange={(e) => {
                setFechaDisponibilidad(e.target.value);
                cargarDisponibilidadTiempoReal();
              }}
              className="w-auto"
            />
            <Button
              onClick={cargarDisponibilidadTiempoReal}
              disabled={isLoadingDisponibilidad}
              variant="outline"
              size="sm"
            >
              {isLoadingDisponibilidad ? (
                <Spinner size="sm" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Actualizar
            </Button>
          </div>
        </div>

        {isLoadingDisponibilidad ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : disponibilidadTiempoReal ? (
          <div className="space-y-6">
            {/* Resumen general */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {disponibilidadTiempoReal.total_agendas}
                </div>
                <div className="text-sm text-blue-700">Agendas Activas</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {disponibilidadTiempoReal.total_espacios_libres}
                </div>
                <div className="text-sm text-green-700">Espacios Libres</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {disponibilidadTiempoReal.total_espacios_ocupados}
                </div>
                <div className="text-sm text-red-700">Espacios Ocupados</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {formatDate(disponibilidadTiempoReal.fecha_consultada)}
                </div>
                <div className="text-sm text-gray-700">Fecha Consultada</div>
              </div>
            </div>

            {/* Lista de agendas con disponibilidad */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Disponibilidad por Operador</h4>
              {disponibilidadTiempoReal.disponibilidad.map((agenda: any) => (
                <div key={agenda.agenda_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {agenda.operador.nombre} {agenda.operador.apellido}
                      </h5>
                      <p className="text-sm text-gray-600">{agenda.agenda_nombre}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600">
                          {agenda.horarios_libres} libres
                        </span>
                        <span className="text-red-600">
                          {agenda.horarios_ocupados} ocupados
                        </span>
                      </div>
                    </div>
                  </div>

                  {agenda.horarios_disponibles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {agenda.horarios_disponibles.map((horario: any) => (
                        <div
                          key={horario.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            horario.disponible
                              ? 'bg-green-50 border-green-400 hover:bg-green-100 cursor-pointer'
                              : 'bg-red-50 border-red-400'
                          }`}
                          onClick={() => {
                            if (horario.disponible) {
                              // Navegar al calendario para agendar
                              navigate(`/agendas/${agenda.agenda_id}/calendario?fecha=${fechaDisponibilidad}&horario=${horario.id}`);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-medium text-gray-900 text-sm">
                                {horario.titulo}
                              </h6>
                              <p className="text-xs text-gray-600">
                                {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                              </p>
                            </div>
                            <Badge variant={horario.disponible ? 'success' : 'outline'}>
                              {horario.disponible ? 'Disponible' : 'Ocupado'}
                            </Badge>
                          </div>
                          {!horario.disponible && horario.cita_existente && (
                            <div className="mt-2 text-xs text-gray-600">
                              <p>Cliente: {horario.cita_existente.cliente_nombre}</p>
                              <p>Servicio: {horario.cita_existente.servicio}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No hay horarios programados para este día</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay datos de disponibilidad disponibles</p>
          </div>
        )}
      </Card>

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

      {/* Modal para consultar espacios disponibles */}
      <Modal
        isOpen={showEspaciosModal}
        onClose={() => {
          setShowEspaciosModal(false);
          setAgendaParaConsultar(null);
          setEspaciosDisponibles(null);
        }}
        title="Consultar Espacios Disponibles"
        size="lg"
      >
        <div className="space-y-6">
          {agendaParaConsultar && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                {agendaParaConsultar.nombre}
              </h3>
              <p className="text-blue-700 text-sm">
                Operador: {agendaParaConsultar.operador?.nombre} {agendaParaConsultar.operador?.apellido}
              </p>
              {agendaParaConsultar.descripcion && (
                <p className="text-blue-600 text-sm mt-1">
                  {agendaParaConsultar.descripcion}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha a consultar
              </label>
              <div className="flex gap-3">
                <Input
                  type="date"
                  value={fechaConsulta}
                  onChange={(e) => setFechaConsulta(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={consultarEspacios}
                  disabled={isLoadingEspacios}
                  className="flex items-center gap-2"
                >
                  {isLoadingEspacios ? (
                    <Spinner size="sm" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Consultar
                </Button>
              </div>
            </div>

            {espaciosDisponibles && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">
                      Espacios disponibles para {formatDate(espaciosDisponibles.fecha_consultada)}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total de horarios:</span>
                      <span className="font-medium ml-2">{espaciosDisponibles.total_horarios}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Con espacio disponible:</span>
                      <span className="font-medium ml-2">{espaciosDisponibles.horarios_con_espacio}</span>
                    </div>
                  </div>
                </div>

                {espaciosDisponibles.horarios_disponibles.length > 0 ? (
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900">Horarios del día:</h5>
                    <div className="grid gap-3">
                      {espaciosDisponibles.horarios_disponibles.map((horario: any) => (
                        <div
                          key={horario.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          style={{ borderLeftColor: horario.color, borderLeftWidth: '4px' }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h6 className="font-medium text-gray-900 mb-1">
                                {horario.titulo}
                              </h6>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                                </span>
                                <Badge variant={horario.disponible ? 'success' : 'outline'}>
                                  {horario.disponible ? 'Disponible' : 'Ocupado'}
                                </Badge>
                              </div>
                              {horario.notas && (
                                <p className="text-sm text-gray-500 mt-2">
                                  {horario.notas}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-gray-600">Capacidad:</div>
                              <div className="font-medium">{horario.capacidad}</div>
                              <div className="text-gray-600 mt-1">Disponibles:</div>
                              <div className="font-medium text-green-600">{horario.disponibles}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay horarios programados para este día</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgendasPage;
