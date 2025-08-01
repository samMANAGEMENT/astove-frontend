import React, { useEffect, useState } from 'react';
import Modal from '../components/ui/Modal';
import Autocomplete from '../components/ui/Autocomplete';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useApi } from '../hooks/useApi';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';
import { DataTable, PageHeader, SearchFilters, Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  porcentaje_pago_empleado: string;
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
  metodo_pago: 'efectivo' | 'transferencia';
  monto_efectivo: number;
  monto_transferencia: number;
  total_servicio: number;
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
  const { user } = useAuth();
  
  // Estados para servicios y operadores
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mixto'>('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serviciosRealizados, setServiciosRealizados] = useState<ServicioRealizado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');

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
      // Si el usuario es operador, solo cargar su información
      if (user?.role?.nombre === 'operador' && user?.operador) {
        const operadorActual = {
          id: user.operador.id.toString(),
          name: `${user.operador.nombre} ${user.operador.apellido}`
        };
        setOperadores([operadorActual]);
        setSelectedOperador(operadorActual); // Auto-seleccionar el operador actual
      } else {
        // Si es admin o supervisor, cargar todos los operadores
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
    }
  }, [modalOpen, user]);

  // Recalcular montos automáticamente cuando cambie la cantidad o el método de pago
  useEffect(() => {
    if (cantidad && selectedServicio && modalOpen) {
      const total = calcularTotal();
      
      // Solo actualizar si los montos actuales no suman el total correcto
      const totalActual = calcularTotalMontos();
      if (Math.abs(total - totalActual) > 0.01) {
        if (metodoPago === 'efectivo') {
          setMontoEfectivo(total.toString());
          setMontoTransferencia('0');
        } else if (metodoPago === 'transferencia') {
          setMontoEfectivo('0');
          setMontoTransferencia(total.toString());
        } else if (metodoPago === 'mixto') {
          const mitad = total / 2;
          setMontoEfectivo(mitad.toString());
          setMontoTransferencia(mitad.toString());
        }
      }
    }
  }, [cantidad, selectedServicio, metodoPago, modalOpen]);

  // Abrir modal y setear servicio seleccionado
  const handleOpenModal = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setSelectedOperador(null);
    setCantidad('');
    setMetodoPago('efectivo');
    setMontoEfectivo('');
    setMontoTransferencia('');
    setModalOpen(true);
    setSuccessMsg('');
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedServicio(null);
    setSelectedOperador(null);
    setCantidad('');
    setMetodoPago('efectivo');
    setMontoEfectivo('');
    setMontoTransferencia('');
  };

  // Calcular total del servicio
  const calcularTotal = () => {
    if (!selectedServicio || !cantidad) return 0;
    return selectedServicio.precio * Number(cantidad);
  };

  // Calcular total de los montos ingresados
  const calcularTotalMontos = () => {
    const efectivo = Number(montoEfectivo) || 0;
    const transferencia = Number(montoTransferencia) || 0;
    return efectivo + transferencia;
  };

  // Validar que los montos sumen el total
  const validarMontos = () => {
    const total = calcularTotal();
    const totalMontos = calcularTotalMontos();
    return Math.abs(total - totalMontos) < 0.01; // Tolerancia para decimales
  };

  // Actualizar montos automáticamente según método de pago
  const handleMetodoPagoChange = (nuevoMetodo: 'efectivo' | 'transferencia' | 'mixto') => {
    setMetodoPago(nuevoMetodo);
    const total = calcularTotal();
    
    if (nuevoMetodo === 'efectivo') {
      setMontoEfectivo(total.toString());
      setMontoTransferencia('0');
    } else if (nuevoMetodo === 'transferencia') {
      setMontoEfectivo('0');
      setMontoTransferencia(total.toString());
    } else {
      // Mixto - dividir 50/50 automáticamente
      const mitad = total / 2;
      setMontoEfectivo(mitad.toString());
      setMontoTransferencia(mitad.toString());
    }
  };

  // Asignar servicio realizado
  const handleAsignar = async () => {
    if (!selectedServicio || !selectedOperador || !cantidad) return;
    
    // Validación adicional para operadores
    if (user?.role?.nombre === 'operador') {
      if (selectedOperador.id !== user.operador?.id?.toString()) {
        toast.error('Solo puedes registrar servicios para tu cuenta');
        return;
      }
    }
    
    if (!validarMontos()) {
      toast.error('La suma de efectivo y transferencia debe ser igual al total del servicio');
      return;
    }

    try {
      await apiAsignar.post('/servicios/servicio-realizado', {
        servicio_id: selectedServicio.id,
        empleado_id: selectedOperador.id,
        cantidad: Number(cantidad),
        fecha: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        metodo_pago: metodoPago === 'mixto' ? 'efectivo' : metodoPago,
        monto_efectivo: Number(montoEfectivo) || 0,
        monto_transferencia: Number(montoTransferencia) || 0,
        total_servicio: calcularTotal()
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
      .then((realizadosData) => {
        setServiciosRealizados(realizadosData || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  // Filtrar servicios por nombre
  const filteredServicios = servicios.filter(servicio => {
    const searchLower = searchValue.toLowerCase();
    return servicio.nombre.toLowerCase().includes(searchLower);
  });

  const handleFiltersClick = () => {
    console.log('Abrir filtros avanzados');
  };

  return (
    <div className="container mx-auto py-8 px-2">
      <PageHeader
        title={user?.role?.nombre === 'operador' ? 'Registrar Mi Servicio' : 'Registrar Servicio Realizado'}
        subtitle={user?.role?.nombre === 'operador' 
          ? 'Registra servicios realizados en tu cuenta y consulta tu histórico'
          : 'Asigna servicios a empleados y consulta el histórico de movimientos'
        }
      />
      {isLoading ? (
        <Spinner className="my-16" size="lg" />
      ) : (
        <>
          <Card className="mb-6">
            <SearchFilters
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onFiltersClick={handleFiltersClick}
              searchPlaceholder="Buscar servicios por nombre..."
            />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 pt-2">
            {filteredServicios.map((servicio) => (
              <div 
                key={servicio.id} 
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl" 
                onClick={() => handleOpenModal(servicio)}
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 h-full">
                  {/* Header con gradiente */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <h3 className="text-lg font-semibold text-center leading-tight">
                      {servicio.nombre}
                    </h3>
                  </div>
                  
                  {/* Contenido principal */}
                  <div className="p-6 space-y-4">
                    {/* Precio destacado */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        {new Intl.NumberFormat('es-CO', { 
                          style: 'currency', 
                          currency: 'COP', 
                          minimumFractionDigits: 0 
                        }).format(servicio.precio)}
                      </div>
                      <div className="text-sm text-gray-500">Precio del servicio</div>
                    </div>
                    
                    {/* Porcentaje del empleado */}
                    <div className="flex items-center justify-center">
                      <div className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 self-center">
                        <span className="text-sm font-medium text-blue-700">
                          {servicio.porcentaje_pago_empleado}% para empleado
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer con indicador de acción */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 to-transparent h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xs text-gray-500 font-medium">Click para asignar</span>
                    </div>
                  </div>
                  
                  {/* Indicador de hover */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Modal isOpen={modalOpen} onClose={handleCloseModal} title={selectedServicio ? `Asignar: ${selectedServicio.nombre}` : 'Asignar Servicio'} size="lg">
            <div className="space-y-6">
              {/* Información del servicio */}
              {selectedServicio && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Información del Servicio</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Precio unitario:</span>
                      <span className="ml-2 font-semibold text-green-700">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(selectedServicio.precio)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-semibold text-blue-700">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(calcularTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">Empleado/Operador</label>
                  {user?.role?.nombre === 'operador' ? (
                    // Si es operador, mostrar información fija con altura consistente
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1 flex items-center">
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.operador?.nombre?.[0] || 'O'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-blue-800 text-base">
                            {user.operador ? `${user.operador.nombre} ${user.operador.apellido}` : 'Operador'}
                          </div>
                          <div className="text-xs text-blue-600">Tu cuenta</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Si es admin o supervisor, mostrar selector
                    <Autocomplete
                      options={operadores}
                      value={selectedOperador}
                      onChange={setSelectedOperador}
                      placeholder="Selecciona un operador"
                      loading={apiOperadores.isLoading}
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <Input
                    type="number"
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value)}
                    placeholder="Cantidad"
                    className="flex-1 h-full"
                  />
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium mb-3">Método de Pago</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleMetodoPagoChange('efectivo')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      metodoPago === 'efectivo' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-green-300 hover:bg-green-25'
                    }`}
                  >
                    <div className="text-center mx-auto self-center flex flex-col">
                      <div className="text-lg font-semibold">💵</div>
                      <div className="text-sm">Efectivo</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMetodoPagoChange('transferencia')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      metodoPago === 'transferencia' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <div className="text-center mx-auto self-center flex flex-col">
                      <div className="text-lg font-semibold">🏦</div>
                      <div className="text-sm">Transferencia</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMetodoPagoChange('mixto')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      metodoPago === 'mixto' 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">💳</div>
                      <div className="text-sm">Mixto</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Montos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monto en Efectivo</label>
                  <Input
                    type="number"
                    value={montoEfectivo}
                    onChange={e => setMontoEfectivo(e.target.value)}
                    placeholder="0"
                    disabled={metodoPago === 'transferencia'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Monto en Transferencia</label>
                  <Input
                    type="number"
                    value={montoTransferencia}
                    onChange={e => setMontoTransferencia(e.target.value)}
                    placeholder="0"
                    disabled={metodoPago === 'efectivo'}
                  />
                </div>
              </div>

              {/* Validación de montos */}
              {cantidad && (
                <div className={`p-4 rounded-lg border-2 ${
                  validarMontos() ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'
                }`}>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className={`font-medium ${validarMontos() ? 'text-green-700' : 'text-orange-800'}`}>
                      Total ingresado:
                    </span>
                    <span className={`font-bold text-lg ${
                      validarMontos() ? 'text-green-700' : 'text-orange-800'
                    }`}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(calcularTotalMontos())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`font-medium ${validarMontos() ? 'text-green-700' : 'text-orange-800'}`}>
                      Total requerido:
                    </span>
                    <span className={`font-bold text-lg ${
                      validarMontos() ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(calcularTotal())}
                    </span>
                  </div>
                  {!validarMontos() && (
                    <div className="text-orange-800 text-xs mt-3 font-medium flex items-center">
                      <span className="mr-1">⚠️</span>
                      Los montos deben sumar exactamente el total del servicio
                    </div>
                  )}
                  {validarMontos() && (
                    <div className="text-green-700 text-xs mt-3 font-medium flex items-center">
                      <span className="mr-1">✅</span>
                      Montos correctos
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleAsignar}
                disabled={!selectedOperador || !cantidad || !validarMontos() || apiAsignar.isLoading}
                className="w-full"
              >
                {apiAsignar.isLoading ? 'Asignando...' : user?.role?.nombre === 'operador' ? 'Registrar Mi Servicio' : 'Asignar Servicio'}
              </Button>
              {successMsg && <div className="text-green-600 text-center font-semibold mt-2">{successMsg}</div>}
              {apiAsignar.error && <div className="text-red-500 text-center mt-2">{apiAsignar.error}</div>}
            </div>
          </Modal>



          {/* Tabla de servicios realizados */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 text-black">
              {user?.role?.nombre === 'operador' ? 'Mi Histórico de Servicios' : 'Histórico de Servicios Realizados'}
            </h2>
            <DataTable
              data={user?.role?.nombre === 'operador' 
                ? serviciosRealizados.filter(servicio => 
                    servicio.empleado.id.toString() === user.operador?.id?.toString()
                  )
                : serviciosRealizados
              }
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
                {
                  key: 'metodo_pago',
                  header: 'Método de Pago',
                  render: (_: any, row: ServicioRealizado) => {
                    const isMixto = row.monto_efectivo > 0 && row.monto_transferencia > 0;
                    return (
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          isMixto ? 'bg-purple-100 text-purple-700' :
                          row.metodo_pago === 'efectivo' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isMixto ? 'Mixto' : row.metodo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                        </span>
                        {isMixto && (
                          <div className="text-xs text-gray-600">
                            <div>💵 {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(row.monto_efectivo)}</div>
                            <div>🏦 {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(row.monto_transferencia)}</div>
                          </div>
                        )}
                      </div>
                    );
                  },
                },
              ]}
              emptyMessage={user?.role?.nombre === 'operador' 
                ? "No has realizado servicios aún." 
                : "No hay servicios realizados aún."
              }
            />
          </div>
        </>
      )}
    </div>
  );
}