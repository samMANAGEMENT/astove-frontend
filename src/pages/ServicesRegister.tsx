import { useEffect, useState } from 'react';
import Modal from '../components/ui/Modal';
import Autocomplete from '../components/ui/Autocomplete';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useApi } from '../hooks/useApi';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';
import { DataTable, PageHeader, SearchFilters, Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import servicioService from '../lib/services/servicioService';
import { Trash2, AlertTriangle } from 'lucide-react';

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
  descuento_porcentaje: number;
  monto_descuento: number;
  total_con_descuento: number;
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
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mixto'>('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serviciosRealizados, setServiciosRealizados] = useState<ServicioRealizado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [servicioToDelete, setServicioToDelete] = useState<ServicioRealizado | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hooks para API
  const apiServicios = useApi();
  const apiOperadores = useApi();
  const apiAsignar = useApi();

  // Función helper para formatear moneda en formato colombiano
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Función para formatear número para input (sin símbolo de moneda)
  const formatNumberForInput = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Función para desformatear número (quitar separadores)
  const unformatNumber = (value: string) => {
    return value.replace(/\./g, '').replace(/,/g, '');
  };

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

  // Recalcular montos automáticamente cuando cambie la cantidad, descuento o el método de pago
  useEffect(() => {
    if (cantidad && selectedServicio && modalOpen) {
      const totalConDescuento = calcularTotalConDescuento();
      
      // Redondear a 2 decimales
      const totalRedondeado = Math.round(totalConDescuento * 100) / 100;
      
      // Solo actualizar si los montos actuales no suman el total correcto
      const totalActual = calcularTotalMontos();
      const totalActualRedondeado = Math.round(totalActual * 100) / 100;
      
      if (Math.abs(totalRedondeado - totalActualRedondeado) > 0.01) {
        if (metodoPago === 'efectivo') {
          setMontoEfectivo(formatNumberForInput(totalRedondeado));
          setMontoTransferencia('0');
        } else if (metodoPago === 'transferencia') {
          setMontoEfectivo('0');
          setMontoTransferencia(formatNumberForInput(totalRedondeado));
        } else if (metodoPago === 'mixto') {
          const mitad = totalRedondeado / 2;
          setMontoEfectivo(formatNumberForInput(mitad));
          setMontoTransferencia(formatNumberForInput(mitad));
        }
      }
    }
  }, [cantidad, selectedServicio, metodoPago, modalOpen, descuentoPorcentaje]);

  // Abrir modal y setear servicio seleccionado
  const handleOpenModal = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setSelectedOperador(null);
    setCantidad('');
    setDescuentoPorcentaje('');
    setMetodoPago('efectivo');
    setMontoEfectivo('');
    setMontoTransferencia('');
    setModalOpen(true);
    setSuccessMsg('');
  };

  // Cerrar modal y resetear formulario
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedServicio(null);
    setSelectedOperador(null);
    setCantidad('');
    setDescuentoPorcentaje('');
    setMetodoPago('efectivo');
    setMontoEfectivo('');
    setMontoTransferencia('');
  };

  // Calcular total del servicio (sin descuento)
  const calcularTotal = () => {
    if (!selectedServicio || !cantidad) return 0;
    return selectedServicio.precio * Number(cantidad);
  };

  // Calcular total con descuento aplicado
  const calcularTotalConDescuento = () => {
    const total = calcularTotal();
    const descuento = Number(descuentoPorcentaje) || 0;
    const montoDescuento = total * (descuento / 100);
    return total - montoDescuento;
  };

  // Calcular total de los montos ingresados
  const calcularTotalMontos = () => {
    const efectivo = parseFloat(unformatNumber(montoEfectivo)) || 0;
    const transferencia = parseFloat(unformatNumber(montoTransferencia)) || 0;
    return efectivo + transferencia;
  };

  // Validar que los montos sumen el total con descuento
  const validarMontos = () => {
    const totalConDescuento = calcularTotalConDescuento();
    const totalMontos = calcularTotalMontos();
    
    // Redondear a 2 decimales para evitar problemas de precisión
    const totalConDescuentoRedondeado = Math.round(totalConDescuento * 100) / 100;
    const totalMontosRedondeado = Math.round(totalMontos * 100) / 100;
    
    return Math.abs(totalConDescuentoRedondeado - totalMontosRedondeado) < 0.01;
  };

  // Actualizar montos automáticamente según método de pago
  const handleMetodoPagoChange = (nuevoMetodo: 'efectivo' | 'transferencia' | 'mixto') => {
    setMetodoPago(nuevoMetodo);
    const totalConDescuento = calcularTotalConDescuento();
    
    // Redondear a 2 decimales
    const totalRedondeado = Math.round(totalConDescuento * 100) / 100;
    
    if (nuevoMetodo === 'efectivo') {
      setMontoEfectivo(formatNumberForInput(totalRedondeado));
      setMontoTransferencia('0');
    } else if (nuevoMetodo === 'transferencia') {
      setMontoEfectivo('0');
      setMontoTransferencia(formatNumberForInput(totalRedondeado));
    } else {
      // Mixto - dividir 50/50 automáticamente
      const mitad = totalRedondeado / 2;
      setMontoEfectivo(formatNumberForInput(mitad));
      setMontoTransferencia(formatNumberForInput(mitad));
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
      toast.error('La suma de efectivo y transferencia debe ser igual al total del servicio con descuento aplicado');
      return;
    }

    try {
      await apiAsignar.post('/servicios/servicio-realizado', {
        servicio_id: selectedServicio.id,
        empleado_id: selectedOperador.id,
        cantidad: Number(cantidad),
        fecha: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        metodo_pago: metodoPago === 'mixto' ? 'efectivo' : metodoPago,
        monto_efectivo: parseFloat(unformatNumber(montoEfectivo)) || 0,
        monto_transferencia: parseFloat(unformatNumber(montoTransferencia)) || 0,
        total_servicio: calcularTotal(), // Enviar el precio original (sin descuento)
        descuento_porcentaje: Number(descuentoPorcentaje) || 0
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

  // Funciones para eliminar servicio realizado
  const handleDeleteClick = (servicio: ServicioRealizado) => {
    setServicioToDelete(servicio);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!servicioToDelete) return;

    setIsDeleting(true);
    try {
      await servicioService.deleteServicioRealizado(servicioToDelete.id);
      toast.success('Servicio eliminado correctamente');
      cargarServiciosRealizados(); // Recargar la lista
      setDeleteModalOpen(false);
      setServicioToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al eliminar el servicio');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setServicioToDelete(null);
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
                        {formatCurrency(servicio.precio)}
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
                        {formatCurrency(selectedServicio.precio)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-semibold text-blue-700">
                        {formatCurrency(calcularTotalConDescuento())}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1 text-gray-500">Empleado/Operador</label>
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
                  <label className="block text-sm font-medium mb-1 text-gray-500">Cantidad</label>
                  <Input
                    type="number"
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value)}
                    placeholder="Cantidad"
                    className="flex-1 h-full"
                  />
                </div>
              </div>

              {/* Campo de descuento */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-500">Descuento (%)</label>
                <Input
                  type="number"
                  value={descuentoPorcentaje}
                  onChange={e => setDescuentoPorcentaje(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
                {Number(descuentoPorcentaje) > 0 && (
                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-orange-700">Precio original:</span>
                      <span className="font-semibold text-orange-800">
                        {formatCurrency(calcularTotal())}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-orange-700">Descuento ({descuentoPorcentaje}%):</span>
                      <span className="font-semibold text-orange-800">
                        -{formatCurrency(calcularTotal() * (Number(descuentoPorcentaje) / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-t border-orange-200 pt-2 mt-2">
                      <span className="text-orange-700">Total con descuento:</span>
                      <span className="text-orange-800">
                        {formatCurrency(calcularTotalConDescuento())}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-600">Método de Pago</label>
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
                  <label className="block text-sm font-medium mb-1 text-gray-600">Monto en Efectivo</label>
                  <Input
                    type="text"
                    value={montoEfectivo}
                    onChange={e => {
                      const rawValue = unformatNumber(e.target.value);
                      const numValue = parseFloat(rawValue) || 0;
                      setMontoEfectivo(formatNumberForInput(numValue));
                    }}
                    placeholder="0"
                    disabled={metodoPago === 'transferencia'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Monto en Transferencia</label>
                  <Input
                    type="text"
                    value={montoTransferencia}
                    onChange={e => {
                      const rawValue = unformatNumber(e.target.value);
                      const numValue = parseFloat(rawValue) || 0;
                      setMontoTransferencia(formatNumberForInput(numValue));
                    }}
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
                      {formatCurrency(calcularTotalMontos())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`font-medium ${validarMontos() ? 'text-green-700' : 'text-orange-800'}`}>
                      Total requerido:
                    </span>
                    <span className={`font-bold text-lg ${
                      validarMontos() ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {formatCurrency(calcularTotalConDescuento())}
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
                    <span className="text-green-700 font-semibold">{formatCurrency(row.servicio.precio)}</span>
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
                  key: 'descuento_porcentaje',
                  header: 'Descuento',
                  render: (_: any, row: ServicioRealizado) => {
                    if (row.descuento_porcentaje > 0) {
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-700">
                            {row.descuento_porcentaje}%
                          </span>
                          <div className="text-xs text-gray-600">
                            <div>Original: {formatCurrency(row.total_servicio)}</div>
                            <div>Final: {formatCurrency(row.total_con_descuento)}</div>
                          </div>
                        </div>
                      );
                    }
                    return <span className="text-gray-400">Sin descuento</span>;
                  },
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
                            <div>💵 {formatCurrency(row.monto_efectivo)}</div>
                            <div>🏦 {formatCurrency(row.monto_transferencia)}</div>
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                // Columna de acciones solo para admin y supervisor
                ...(user?.role?.nombre === 'admin' || user?.role?.nombre === 'supervisor' ? [{
                  key: 'id' as keyof ServicioRealizado,
                  header: 'Acciones',
                  render: (_: any, row: ServicioRealizado) => (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteClick(row)}
                        className="px-2 py-1 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ),
                }] : []),
              ]}
              emptyMessage={user?.role?.nombre === 'operador' 
                ? "No has realizado servicios aún." 
                : "No hay servicios realizados aún."
              }
            />
          </div>

          {/* Modal de confirmación de eliminación */}
          <Modal 
            isOpen={deleteModalOpen} 
            onClose={handleCancelDelete} 
            title="Confirmar Eliminación" 
            size="md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">¿Estás seguro?</h3>
                  <p className="text-sm text-red-700">
                    Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
                  </p>
                </div>
              </div>

              {servicioToDelete && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Detalles del servicio:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Servicio:</span> {servicioToDelete.servicio.nombre}</p>
                    <p><span className="font-medium">Empleado:</span> {servicioToDelete.empleado.nombre} {servicioToDelete.empleado.apellido}</p>
                    <p><span className="font-medium">Fecha:</span> {new Date(servicioToDelete.fecha).toLocaleDateString('es-CO')}</p>
                    <p><span className="font-medium">Total:</span> {formatCurrency(servicioToDelete.total_con_descuento)}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}