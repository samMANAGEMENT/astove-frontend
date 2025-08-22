import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Plus, ArrowLeft, User } from 'lucide-react';
import { toast } from 'react-toastify';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import {
  Card,
  Badge,
  Spinner,
  Button,
  Modal,
  Input,
} from '../components/ui';
import agendaService, { type Agenda, type Horario, type CrearHorarioData } from '../lib/services/agendaService';

interface HorarioFormData {
  titulo: string;
  hora_inicio: string;
  hora_fin: string;
  dia_semana: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  color: string;
  notas: string;
  activo: boolean;
}

const AgendaCalendarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  const [horarioToDelete, setHorarioToDelete] = useState<Horario | null>(null);
  
  // Estados de carga específicos
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState<HorarioFormData>({
    titulo: '',
    hora_inicio: '',
    hora_fin: '',
    dia_semana: 'lunes',
    color: '#93C5FD',
    notas: '',
    activo: true,
  });
  const [formErrors, setFormErrors] = useState<{
    titulo?: string;
    hora_inicio?: string;
    hora_fin?: string;
  }>({});
  const [showInactive, setShowInactive] = useState(false);

  const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' },
  ];

  const colores = [
    { value: '#93C5FD', label: 'Azul' }, // blue-300
    { value: '#6EE7B7', label: 'Verde' }, // green-300
    { value: '#FCD34D', label: 'Amarillo' }, // yellow-300
    { value: '#FCA5A5', label: 'Rojo' }, // red-300
    { value: '#C4B5FD', label: 'Púrpura' }, // purple-300
    { value: '#FDBA74', label: 'Naranja' }, // orange-300
    { value: '#67E8F9', label: 'Cian' }, // cyan-300
    { value: '#BEF264', label: 'Lima' }, // lime-300
  ];

  useEffect(() => {
    if (id) {
      loadAgenda();
      loadHorarios();
    }
  }, [id]);

  const loadAgenda = async () => {
    try {
      const data = await agendaService.getById(Number(id));
      setAgenda(data);
    } catch (error) {
      console.error('Error al cargar agenda:', error);
      toast.error('Error al cargar la agenda');
      navigate('/agendas');
    }
  };

  const loadHorarios = async () => {
    try {
      const data = await agendaService.getHorariosByAgenda(Number(id));
      setHorarios(data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      toast.error('Error al cargar los horarios');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      hora_inicio: '',
      hora_fin: '',
      dia_semana: 'lunes',
      color: '#93C5FD',
      notas: '',
      activo: true,
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    const errors: typeof formErrors = {};
    if (!formData.titulo.trim()) errors.titulo = 'El título es requerido';
    if (!formData.hora_inicio) errors.hora_inicio = 'La hora de inicio es requerida';
    if (!formData.hora_fin) errors.hora_fin = 'La hora de fin es requerida';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingHorario) {
        setIsUpdating(true);
      } else {
        setIsCreating(true);
      }

      const horarioData: CrearHorarioData = {
        agenda_id: Number(id),
        ...formData,
      };

      if (editingHorario) {
        await agendaService.updateHorario(editingHorario.id, horarioData);
        toast.success('Horario actualizado correctamente');
      } else {
        await agendaService.createHorario(horarioData);
        toast.success('Horario creado correctamente');
      }
      
      setIsModalOpen(false);
      resetForm();
      setEditingHorario(null);
      setIsLoading(true);
      await loadHorarios();
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error al guardar horario:', error);
      toast.error(error.response?.data?.error || 'Error al guardar el horario');
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  };

  const handleEdit = (horario: Horario) => {
    setEditingHorario(horario);
    setFormData({
      titulo: horario.titulo,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      dia_semana: horario.dia_semana,
      color: horario.color,
      notas: horario.notas || '',
      activo: horario.activo,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!horarioToDelete) return;

    try {
      setIsDeleting(true);
      await agendaService.deleteHorario(horarioToDelete.id);
      toast.success('Horario eliminado correctamente');
      setHorarioToDelete(null);
      setIsLoading(true);
      await loadHorarios();
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error al eliminar horario:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar el horario');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredHorarios = showInactive ? horarios : horarios.filter(h => h.activo);
  
  const calendarEvents = filteredHorarios.map(horario => ({
    id: horario.id.toString(),
    title: `${horario.titulo} (${horario.hora_inicio} - ${horario.hora_fin})`,
    start: `${getCurrentWeekDate(horario.dia_semana)}T${horario.hora_inicio}`,
    end: `${getCurrentWeekDate(horario.dia_semana)}T${horario.hora_fin}`,
    backgroundColor: horario.color,
    borderColor: horario.color,
    extendedProps: {
      horario,
    },
    tooltip: {
      title: horario.titulo,
      text: `${horario.hora_inicio} - ${horario.hora_fin}${horario.notas ? ` | ${horario.notas}` : ''}`,
    },
  }));

  function getCurrentWeekDate(diaSemana: string): string {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const hoy = new Date();
    const diaActual = hoy.getDay();
    const diaObjetivo = dias.indexOf(diaSemana);
    const diferencia = diaObjetivo - diaActual;
    const fechaObjetivo = new Date(hoy);
    fechaObjetivo.setDate(hoy.getDate() + diferencia);
    return fechaObjetivo.toISOString().split('T')[0];
  }

  const handleEventClick = (info: any) => {
    const horario = info.event.extendedProps.horario;
    handleEdit(horario);
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!agenda) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Agenda no encontrada</p>
        <Button onClick={() => navigate('/agendas')} className="mt-4">
          Volver a Agendas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/agendas')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              {agenda.nombre}
            </h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <User className="w-4 h-4" />
              {agenda.operador ? `${agenda.operador.nombre} ${agenda.operador.apellido}` : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={agenda.activa ? 'success' : 'outline'}>
            {agenda.activa ? 'Activa' : 'Inactiva'}
          </Badge>
          <Button onClick={() => setIsModalOpen(true)} disabled={isInitialLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Horario
          </Button>
        </div>
      </div>

      {agenda.descripcion && (
        <Card>
          <p className="text-gray-700">{agenda.descripcion}</p>
        </Card>
      )}



      <Card>
        <div className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Calendario de Horarios</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Horarios activos</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Mostrar horarios inactivos
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-gray-600"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </Button>
            </div>
          </div>
          
          <style>
            {`
              /* Estilo para los encabezados de días */
              .fc-col-header-cell {
                color: #4B5563 !important; /* gray-600 */
                font-weight: 600 !important;
                background-color: #F9FAFB !important; /* gray-50 */
                border-color: #E5E7EB !important; /* gray-200 */
              }
              
              /* Estilo para las etiquetas de horas */
              .fc-timegrid-slot-label {
                color: #4B5563 !important; /* gray-600 */
                font-weight: 500 !important;
              }
              
              /* Estilo para el texto de los días */
              .fc-col-header-cell-cushion {
                color: #4B5563 !important; /* gray-600 */
                text-decoration: none !important;
              }
              
              /* Estilo para las líneas de tiempo */
              .fc-timegrid-axis-cushion {
                color: #4B5563 !important; /* gray-600 */
              }
              
              /* Estilo para los eventos */
              .fc-event {
                font-weight: 600 !important;
                border: 1px solid rgba(0,0,0,0.1) !important;
                text-shadow: 0 1px 2px rgba(255,255,255,0.8) !important;
              }
              
              /* Estilo para el título del evento */
              .fc-event-title {
                color: #374151 !important; /* gray-700 */
              }
              
              /* Estilo para las líneas de cuadrícula */
              .fc-scrollgrid-section > * {
                border-color: #E5E7EB !important; /* gray-200 */
              }
              
              /* Estilo para las celdas de tiempo */
              .fc-timegrid-slot {
                border-color: #F3F4F6 !important; /* gray-100 */
              }
              
              /* Estilo para el fondo de las celdas de tiempo */
              .fc-timegrid-col-bg .fc-non-business {
                background-color: #FEFEFE !important;
              }
            `}
          </style>
          <div className="relative">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale={esLocale}
              events={calendarEvents}
              eventClick={handleEventClick}
              height="600px"
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              slotDuration="00:30:00"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              dayHeaderFormat={{
                weekday: 'long',
                day: 'numeric',
                month: 'short'
              }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              eventDisplay="block"
              eventColor="transparent"
              eventTextColor="#000"
              eventBorderColor="transparent"
              eventDidMount={(info) => {
                // Personalizar el estilo de los eventos
                info.el.style.backgroundColor = info.event.backgroundColor;
                info.el.style.borderColor = info.event.borderColor;
                info.el.style.color = '#374151'; // gray-700 para mejor contraste
                info.el.style.fontWeight = '600';
                info.el.style.borderRadius = '6px';
                info.el.style.padding = '4px 6px';
                info.el.style.fontSize = '11px';
                info.el.style.textShadow = '0 1px 2px rgba(255,255,255,0.8)';
                info.el.style.border = '1px solid rgba(0,0,0,0.1)';
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <Spinner />
                  <p className="text-sm text-gray-600">Actualizando horarios...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal para crear/editar horario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
          setEditingHorario(null);
        }}
        title={editingHorario ? 'Editar Horario' : 'Nuevo Horario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='text-gray-600'>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ej: Turno matutino"
            />
            {formErrors.titulo && (
              <p className="text-red-500 text-sm mt-1">{formErrors.titulo}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio *
              </label>
              <input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                className={` text-gray-600  w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.hora_inicio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.hora_inicio && (
                <p className="text-red-500 text-sm mt-1">{formErrors.hora_inicio}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Fin *
              </label>
              <input
                type="time"
                value={formData.hora_fin}
                onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                className={` text-gray-600  w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.hora_fin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.hora_fin && (
                <p className="text-red-500 text-sm mt-1">{formErrors.hora_fin}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Día de la Semana
            </label>
            <select
              value={formData.dia_semana}
              onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value as any })}
              className=" text-gray-600   w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {diasSemana.map((dia) => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colores.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-full h-10 rounded-md border-2 ${
                    formData.color === color.value ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Notas adicionales del horario"
              rows={3}
              className=" text-gray-600  w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
              Horario activo
            </label>
          </div>

                     <div className="flex justify-end gap-3 pt-4">
             {editingHorario && (
               <Button
                 type="button"
                 variant="danger"
                 onClick={() => {
                   setHorarioToDelete(editingHorario);
                   setIsModalOpen(false);
                 }}
                 disabled={isCreating || isUpdating}
               >
                 Eliminar Horario
               </Button>
             )}
             <Button
               type="button"
               variant="secondary"
               onClick={() => {
                 setIsModalOpen(false);
                 resetForm();
                 setEditingHorario(null);
               }}
               disabled={isCreating || isUpdating}
             >
               Cancelar
             </Button>
             <Button type="submit" disabled={isCreating || isUpdating}>
               {isCreating || isUpdating ? (
                 <Spinner size="sm" />
               ) : (
                 `${editingHorario ? 'Actualizar' : 'Crear'} Horario`
               )}
             </Button>
           </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!horarioToDelete}
        onClose={() => setHorarioToDelete(null)}
        title="Confirmar eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres eliminar el horario "{horarioToDelete?.titulo}"?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setHorarioToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner size="sm" /> : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Tabla de resumen de horarios por día */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Horarios por Día</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Día</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Horarios</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Horas Totales</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {diasSemana.map((dia) => {
                  const horariosDelDia = filteredHorarios.filter(h => h.dia_semana === dia.value);
                  const horasTotales = horariosDelDia.reduce((total, h) => {
                    const inicio = new Date(`2000-01-01T${h.hora_inicio}`);
                    const fin = new Date(`2000-01-01T${h.hora_fin}`);
                    return total + (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                  }, 0);
                  
                  return (
                    <tr key={dia.value} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-900">{dia.label}</td>
                      <td className="py-3 px-3">
                        {horariosDelDia.length > 0 ? (
                          <div className="space-y-1">
                            {horariosDelDia.map((horario) => (
                              <div
                                key={horario.id}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-2 mb-1 border"
                                style={{
                                  backgroundColor: horario.color,
                                  color: '#374151', // gray-700
                                  borderColor: 'rgba(0,0,0,0.1)',
                                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                                }}
                              >
                                {horario.titulo} ({horario.hora_inicio} - {horario.hora_fin})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin horarios</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {horasTotales > 0 ? `${horasTotales.toFixed(1)}h` : '-'}
                      </td>
                      <td className="py-3 px-3">
                        {horariosDelDia.length > 0 ? (
                          <Badge variant={horariosDelDia.every(h => h.activo) ? 'success' : 'warning'}>
                            {horariosDelDia.every(h => h.activo) ? 'Activo' : 'Parcial'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inactivo</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AgendaCalendarPage;
