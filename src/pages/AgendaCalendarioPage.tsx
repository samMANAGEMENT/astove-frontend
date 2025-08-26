import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Trash2,
  Grid3X3,
  CalendarDays,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Card,
  PageHeader,
  Badge,
  Button,
  Modal,
  Input,
  Spinner,
} from '../components/ui';
import agendaService, { type CrearCitaData } from '../lib/services/agendaService';

interface Horario {
  id: number;
  titulo: string;
  hora_inicio: string;
  hora_fin: string;
  color: string;
  notas?: string;
  disponible: boolean;
  cita?: {
    id: number;
    cliente_nombre: string;
    cliente_telefono?: string;
    servicio: string;
    estado: string;
    notas?: string;
  };
}

interface DiaCalendario {
  dia: number;
  fecha: string;
  dia_semana: string;
  es_hoy: boolean;
  es_pasado: boolean;
  horarios: Horario[];
}

interface CalendarioData {
  agenda: {
    id: number;
    nombre: string;
    descripcion?: string;
    operador?: {
      id: number;
      nombre: string;
      apellido: string;
    };
  };
  mes: number;
  anio: number;
  nombre_mes: string;
  calendario: DiaCalendario[];
}

type VistaCalendario = 'mes' | 'semana' | 'dia';

const AgendaCalendarioPage: React.FC = () => {
  const { agendaId } = useParams<{ agendaId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [calendarioData, setCalendarioData] = useState<CalendarioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [vistaActual, setVistaActual] = useState<VistaCalendario>('mes');
  
  // Estados para modal de cita
  const [showCitaModal, setShowCitaModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<{
    horario: Horario;
    fecha: string;
  } | null>(null);
  const [citaData, setCitaData] = useState<Partial<CrearCitaData>>({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: '',
    servicio: '',
    notas: '',
    estado: 'pendiente'
  });
  const [isSavingCita, setIsSavingCita] = useState(false);

  useEffect(() => {
    if (agendaId) {
      // Verificar si hay parámetros en la URL para selección automática
      const fechaParam = searchParams.get('fecha');
      const horarioParam = searchParams.get('horario');
      
      if (fechaParam) {
        const fecha = new Date(fechaParam);
        setMesActual(fecha.getMonth() + 1);
        setAnioActual(fecha.getFullYear());
      }
      
      cargarCalendario().then(() => {
        // Si hay parámetros de URL, seleccionar automáticamente el horario
        if (fechaParam && horarioParam) {
          setTimeout(() => {
            seleccionarHorarioAutomaticamente(fechaParam, parseInt(horarioParam));
          }, 500);
        }
      });
    }
  }, [agendaId, mesActual, anioActual]);

  const seleccionarHorarioAutomaticamente = (fecha: string, horarioId: number) => {
    if (!calendarioData) return;
    
    const diaEncontrado = calendarioData.calendario.find(dia => dia.fecha === fecha);
    if (diaEncontrado) {
      const horarioEncontrado = diaEncontrado.horarios.find(h => h.id === horarioId);
      if (horarioEncontrado && horarioEncontrado.disponible) {
        abrirModalCita(horarioEncontrado, fecha);
        // Limpiar los parámetros de URL después de la selección
        setSearchParams({});
      }
    }
  };

  const cargarCalendario = async () => {
    if (!agendaId) return;
    
    setIsLoading(true);
    try {
      const data = await agendaService.obtenerCalendarioAgenda(
        parseInt(agendaId), 
        mesActual, 
        anioActual
      );
      setCalendarioData(data);
    } catch (error: any) {
      console.error('Error al cargar calendario:', error);
      toast.error(error.response?.data?.error || 'Error al cargar el calendario');
    } finally {
      setIsLoading(false);
    }
  };

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    if (direccion === 'anterior') {
      if (mesActual === 1) {
        setMesActual(12);
        setAnioActual(anioActual - 1);
      } else {
        setMesActual(mesActual - 1);
      }
    } else {
      if (mesActual === 12) {
        setMesActual(1);
        setAnioActual(anioActual + 1);
      } else {
        setMesActual(mesActual + 1);
      }
    }
  };

  const cambiarVista = (vista: VistaCalendario) => {
    setVistaActual(vista);
  };

  const abrirModalCita = (horario: Horario, fecha: string) => {
    if (!horario.disponible) {
      // Si ya hay una cita, mostrar detalles
      setCitaSeleccionada({ horario, fecha });
      setCitaData({
        cliente_nombre: horario.cita?.cliente_nombre || '',
        cliente_telefono: horario.cita?.cliente_telefono || '',
        servicio: horario.cita?.servicio || '',
        notas: horario.cita?.notas || '',
        estado: horario.cita?.estado as any || 'pendiente'
      });
    } else {
      // Si está disponible, crear nueva cita
      setCitaSeleccionada({ horario, fecha });
      setCitaData({
        cliente_nombre: '',
        cliente_telefono: '',
        cliente_email: '',
        servicio: '',
        notas: '',
        estado: 'pendiente'
      });
    }
    setShowCitaModal(true);
  };

  const guardarCita = async () => {
    if (!agendaId || !citaSeleccionada) return;

    setIsSavingCita(true);
    try {
      const data: CrearCitaData = {
        agenda_id: parseInt(agendaId),
        horario_id: citaSeleccionada.horario.id,
        cliente_nombre: citaData.cliente_nombre!,
        cliente_telefono: citaData.cliente_telefono,
        cliente_email: citaData.cliente_email,
        servicio: citaData.servicio!,
        fecha: citaSeleccionada.fecha,
        hora_inicio: citaSeleccionada.horario.hora_inicio,
        hora_fin: citaSeleccionada.horario.hora_fin,
        estado: citaData.estado!,
        notas: citaData.notas
      };

      await agendaService.crearCita(data);
      toast.success('Cita agendada correctamente');
      setShowCitaModal(false);
      // Recargar el calendario para actualizar el estado
      await cargarCalendario();
    } catch (error: any) {
      console.error('Error al guardar cita:', error);
      toast.error(error.response?.data?.error || 'Error al agendar la cita');
    } finally {
      setIsSavingCita(false);
    }
  };

  const eliminarCita = async () => {
    if (!citaSeleccionada?.horario.cita?.id) return;

    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;

    try {
      await agendaService.eliminarCita(citaSeleccionada.horario.cita.id);
      toast.success('Cita eliminada correctamente');
      setShowCitaModal(false);
      // Recargar el calendario para actualizar el estado
      await cargarCalendario();
    } catch (error: any) {
      console.error('Error al eliminar cita:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar la cita');
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      confirmada: 'success' as const,
      pendiente: 'warning' as const,
      cancelada: 'danger' as const,
      completada: 'info' as const
    };
    return <Badge variant={variants[estado as keyof typeof variants]}>{estado.toUpperCase()}</Badge>;
  };

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!calendarioData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudo cargar el calendario</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 agenda-calendar">
      <PageHeader
        title={`Calendario - ${calendarioData.agenda.nombre}`}
        subtitle={`Operador: ${calendarioData.agenda.operador?.nombre} ${calendarioData.agenda.operador?.apellido}`}
      />

      {/* Información de la agenda */}
      <div className="agenda-info">
        <div className="agenda-title">{calendarioData.agenda.nombre}</div>
        <div className="agenda-operator">
          Operador: {calendarioData.agenda.operador?.nombre} {calendarioData.agenda.operador?.apellido}
        </div>
        {calendarioData.agenda.descripcion && (
          <div className="agenda-description">{calendarioData.agenda.descripcion}</div>
        )}
      </div>

      <Card>
        <div className="p-6">
          {/* Header del calendario */}
          <div className="calendar-navigation">
            <Button
              variant="outline"
              onClick={() => navigate('/agendas')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </Button>

            <div className="flex items-center gap-4">
              <button
                className="nav-button"
                onClick={() => cambiarMes('anterior')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="current-month">
                {calendarioData.nombre_mes} {calendarioData.anio}
              </div>
              
              <button
                className="nav-button"
                onClick={() => cambiarMes('siguiente')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Filtros de vista */}
            <div className="flex items-center gap-2">
              <Button
                variant={vistaActual === 'mes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => cambiarVista('mes')}
                className="flex items-center gap-1"
              >
                <Grid3X3 className="w-4 h-4" />
                Mes
              </Button>
              <Button
                variant={vistaActual === 'semana' ? 'default' : 'outline'}
                size="sm"
                onClick={() => cambiarVista('semana')}
                className="flex items-center gap-1"
              >
                <CalendarDays className="w-4 h-4" />
                Semana
              </Button>
              <Button
                variant={vistaActual === 'dia' ? 'default' : 'outline'}
                size="sm"
                onClick={() => cambiarVista('dia')}
                className="flex items-center gap-1"
              >
                <Clock className="w-4 h-4" />
                Día
              </Button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="calendar-grid">
            {diasSemana.map((dia) => (
              <div key={dia} className="calendar-header">
                {dia}
              </div>
            ))}
          </div>

          {/* Calendario */}
          <div className="calendar-grid">
            {calendarioData.calendario.map((dia) => (
              <div
                key={dia.fecha}
                className={`calendar-day ${
                  dia.es_hoy ? 'today' : 
                  dia.es_pasado ? 'past' : ''
                }`}
              >
                <div className={`day-number ${
                  dia.es_hoy ? 'today' : 
                  dia.es_pasado ? 'past' : ''
                }`}>
                  {dia.dia}
                </div>
                
                <div className="space-y-1">
                  {dia.horarios.map((horario) => (
                    <div
                      key={horario.id}
                      className={`time-slot ${
                        horario.disponible 
                          ? 'available' 
                          : 'occupied'
                      }`}
                      onClick={() => abrirModalCita(horario, dia.fecha)}
                      style={{ borderLeftColor: horario.color }}
                    >
                      <div className="time-slot-title">{horario.titulo}</div>
                      <div className="time-slot-time">
                        {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                      </div>
                      {!horario.disponible && (
                        <div className="time-slot-client">
                          {horario.cita?.cliente_nombre}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Modal para crear/ver cita */}
      <Modal
        isOpen={showCitaModal}
        onClose={() => setShowCitaModal(false)}
        title={citaSeleccionada?.horario.disponible ? 'Agendar Cita' : 'Detalles de Cita'}
        size="md"
      >
        <div className="cita-modal">
        <div className="space-y-4">
          {citaSeleccionada && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                {citaSeleccionada.horario.titulo}
              </h3>
              <p className="text-blue-700 text-sm">
                {formatTime(citaSeleccionada.horario.hora_inicio)} - {formatTime(citaSeleccionada.horario.hora_fin)}
              </p>
              <p className="text-blue-600 text-sm">
                {new Date(citaSeleccionada.fecha).toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {citaSeleccionada?.horario.disponible ? (
            // Formulario para nueva cita
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente *
                </label>
                <Input
                  value={citaData.cliente_nombre}
                  onChange={(e) => setCitaData({ ...citaData, cliente_nombre: e.target.value })}
                  placeholder="Nombre completo del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <Input
                  value={citaData.cliente_telefono}
                  onChange={(e) => setCitaData({ ...citaData, cliente_telefono: e.target.value })}
                  placeholder="Número de teléfono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={citaData.cliente_email}
                  onChange={(e) => setCitaData({ ...citaData, cliente_email: e.target.value })}
                  placeholder="Email del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio *
                </label>
                <Input
                  value={citaData.servicio}
                  onChange={(e) => setCitaData({ ...citaData, servicio: e.target.value })}
                  placeholder="Tipo de servicio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={citaData.notas}
                  onChange={(e) => setCitaData({ ...citaData, notas: e.target.value })}
                  placeholder="Notas adicionales"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowCitaModal(false)}
                  disabled={isSavingCita}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={guardarCita}
                  disabled={isSavingCita || !citaData.cliente_nombre || !citaData.servicio}
                >
                  {isSavingCita ? <Spinner size="sm" className="mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Agendar Cita
                </Button>
              </div>
            </div>
          ) : (
            // Mostrar detalles de cita existente
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{citaData.cliente_nombre}</span>
                </div>
                
                {citaData.cliente_telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{citaData.cliente_telefono}</span>
                  </div>
                )}
                
                {citaData.cliente_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{citaData.cliente_email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{citaData.servicio}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {getEstadoBadge(citaData.estado!)}
                </div>
                
                {citaData.notas && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{citaData.notas}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowCitaModal(false)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="danger"
                  onClick={eliminarCita}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Cita
                </Button>
              </div>
            </div>
          )}
        </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgendaCalendarioPage;
