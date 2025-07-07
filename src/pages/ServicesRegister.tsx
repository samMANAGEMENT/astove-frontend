import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Autocomplete from '../components/ui/Autocomplete';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useApi } from '../hooks/useApi';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';
import { DataTable, PageHeader } from '../components/ui';

interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
}

interface Operador {
  id: string;
  name: string;
}

interface ServicioRealizado {
  id: number;
  empleado_id: number;
  servicio_id: number;
  cantidad: string;
  fecha: string;
  empleado: {
    id: number;
    nombre: string;
    apellido: string;
  };
  servicio: {
    id: number;
    nombre: string;
    precio: number;
  };
}

export default function ServicesRegister() {
  // Estados para servicios y operadores
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serviciosRealizados, setServiciosRealizados] = useState<ServicioRealizado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks para API
  const apiServicios = useApi();
  const apiOperadores = useApi();
  const apiAsignar = useApi();

  // Obtener servicios al montar
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiServicios.get('/servicios/listar-servicio'),
      apiServicios.get('/servicios/listar-servicios-realizados')
    ])
      .then(([serviciosData, realizadosData]) => {
        setServicios(serviciosData || []);
        setServiciosRealizados(realizadosData || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Obtener operadores cuando se abre el modal
  useEffect(() => {
    if (modalOpen) {
      apiOperadores.get('/operadores/listar-operador')
        .then((data) => {
          // Mapear para mostrar nombre + apellido
          const operadoresMapeados = (data || []).map((op: any) => ({
            id: op.id,
            name: `${op.nombre} ${op.apellido}`
          }));
          setOperadores(operadoresMapeados);
        })
        .catch(() => {});
    }
  }, [modalOpen]);

  // Abrir modal y setear servicio seleccionado
  const handleOpenModal = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setSelectedOperador(null);
    setCantidad('');
    setModalOpen(true);
    setSuccessMsg('');
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedServicio(null);
    setSelectedOperador(null);
    setCantidad('');
  };

  // Asignar servicio realizado
  const handleAsignar = async () => {
    if (!selectedServicio || !selectedOperador || !cantidad) return;
    try {
      await apiAsignar.post('/servicios/servicio-realizado', {
        servicio_id: selectedServicio.id,
        empleado_id: selectedOperador.id,
        cantidad: Number(cantidad),
        fecha: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      });
      toast.success('¡Servicio asignado exitosamente!');
      cargarServiciosRealizados();
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al asignar el servicio');
    }
  };

  // Recargar solo el histórico después de asignar
  const cargarServiciosRealizados = () => {
    setIsLoading(true);
    apiServicios.get('/servicios/listar-servicios-realizados')
      .then((data) => {
        setServiciosRealizados(data || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="container mx-auto py-8 px-2">
      <PageHeader
        title="Registrar Servicio Realizado"
        subtitle="Asigna servicios a empleados y consulta el histórico de movimientos"
      />
      {isLoading ? (
        <Spinner className="my-16" size="lg" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 pt-2">
            {servicios.map((servicio) => (
              <div key={servicio.id} className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleOpenModal(servicio)}>
                <Card>
                  <div className="flex flex-col items-center justify-center h-32">
                    <span className="text-lg font-semibold text-blue-700 mb-2">{servicio.nombre}</span>
                    {servicio.descripcion && <span className="text-gray-500 text-sm text-center">{servicio.descripcion}</span>}
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <Modal isOpen={modalOpen} onClose={handleCloseModal} title={selectedServicio ? `Asignar: ${selectedServicio.nombre}` : 'Asignar Servicio'} size="md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Empleado/Operador</label>
                <Autocomplete
                  options={operadores}
                  value={selectedOperador}
                  onChange={setSelectedOperador}
                  placeholder="Selecciona un operador"
                  loading={apiOperadores.isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad</label>
                <Input
                  type="number"
                  value={cantidad}
                  onChange={e => setCantidad(e.target.value)}
                  placeholder="Cantidad"
                />
              </div>
              <Button
                onClick={handleAsignar}
                disabled={!selectedOperador || !cantidad || apiAsignar.isLoading}
                className="w-full"
              >
                {apiAsignar.isLoading ? 'Asignando...' : 'Asignar'}
              </Button>
              {successMsg && <div className="text-green-600 text-center font-semibold mt-2">{successMsg}</div>}
              {apiAsignar.error && <div className="text-red-500 text-center mt-2">{apiAsignar.error}</div>}
            </div>
          </Modal>

          {/* Tabla de servicios realizados */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 text-black">Histórico de Servicios Realizados</h2>
            <DataTable
              data={serviciosRealizados}
              columns={[
                {
                  key: 'servicio',
                  header: 'Servicio',
                  render: (_: any, row: ServicioRealizado) => (
                    <span className="font-medium text-blue-700">{row.servicio.nombre}</span>
                  ),
                },
                {
                  key: 'empleado',
                  header: 'Empleado',
                  render: (_: any, row: ServicioRealizado) => (
                    <span className="text-black">{row.empleado.nombre} {row.empleado.apellido}</span>
                  ),
                },
                {
                  key: 'servicio_id',
                  header: 'Precio',
                  render: (_: any, row: ServicioRealizado) => (
                    <span className="text-green-700 font-semibold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(row.servicio.precio)}</span>
                  ),
                },
                {
                  key: 'cantidad',
                  header: 'Cantidad',
                  render: (value) => (
                    <span className="text-black">{String(value)}</span>
                  ),
                },
                {
                  key: 'fecha',
                  header: 'Fecha',
                  render: (value) => (
                    <span className="text-black">{new Date(String(value)).toLocaleDateString('es-CO')}</span>
                  ),
                },
              ]}
              emptyMessage="No hay servicios realizados aún."
            />
          </div>
        </>
      )}
    </div>
  );
}