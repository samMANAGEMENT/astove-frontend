import { useEffect, useState } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-toastify';
import { DataTable, PageHeader, SearchFilters, Card } from '../components/ui';
import Autocomplete from '../components/ui/Autocomplete';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import ingresosAdicionalesService from '../lib/services/ingresosAdicionalesService';
import { Trash2 } from 'lucide-react';
import { formatDateForAPI } from '../lib/dateConfig';
import type {
  IngresoAdicional,
  CrearIngresoAdicionalData,
  TotalesIngresosAdicionales
} from '../lib/services/ingresosAdicionalesService';

export default function IngresosAdicionalesPage() {
  const { user } = useAuth();

  // Estados para el formulario
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mixto'>('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [tipo, setTipo] = useState<'accesorio' | 'servicio_ocasional' | 'otro'>('accesorio');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [ingresosAdicionales, setIngresosAdicionales] = useState<IngresoAdicional[]>([]);
  const [totales, setTotales] = useState<TotalesIngresosAdicionales | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ingresoToDelete, setIngresoToDelete] = useState<IngresoAdicional | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Estados para operadores
  const [operadores, setOperadores] = useState<{id: string, name: string}[]>([]);
  const [selectedOperador, setSelectedOperador] = useState<{id: string, name: string} | null>(null);

  // Hooks para API
  const apiOperadores = useApi();

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

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar operadores cuando se abre el modal
  useEffect(() => {
    if (modalOpen) {
      apiOperadores.get('/operadores/listar-operador')
        .then((data) => {
          const operadoresMapeados = (Array.isArray(data) ? data : []).map((op: any) => ({
            id: op.id,
            name: `${op.nombre} ${op.apellido}`
          }));
          setOperadores(operadoresMapeados);
        })
        .catch((error) => {
          console.error('Error cargando operadores:', error);
          setOperadores([]);
        });
    }
  }, [modalOpen]);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [ingresosData, totalesData] = await Promise.all([
        ingresosAdicionalesService.listarIngresosAdicionales(),
        ingresosAdicionalesService.totalIngresosAdicionales()
      ]);
      setIngresosAdicionales(ingresosData);
      setTotales(totalesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Recalcular montos automáticamente cuando cambie el método de pago
  useEffect(() => {
    if (monto && modalOpen) {
      const montoNum = parseFloat(unformatNumber(monto)) || 0;

      if (metodoPago === 'efectivo') {
        setMontoEfectivo(formatNumberForInput(montoNum));
        setMontoTransferencia('0');
      } else if (metodoPago === 'transferencia') {
        setMontoEfectivo('0');
        setMontoTransferencia(formatNumberForInput(montoNum));
      } else if (metodoPago === 'mixto') {
        const mitad = montoNum / 2;
        setMontoEfectivo(formatNumberForInput(mitad));
        setMontoTransferencia(formatNumberForInput(mitad));
      }
    }
  }, [monto, metodoPago, modalOpen]);

  // Abrir modal
  const handleOpenModal = () => {
    setModalOpen(true);
    resetForm();
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  // Resetear formulario
  const resetForm = () => {
    setConcepto('');
    setMonto('');
    setMetodoPago('efectivo');
    setMontoEfectivo('');
    setMontoTransferencia('');
    setTipo('accesorio');
    setCategoria('');
    setDescripcion('');
    setSelectedOperador(null);
  };

  // Calcular total de los montos ingresados
  const calcularTotalMontos = () => {
    const efectivo = parseFloat(unformatNumber(montoEfectivo)) || 0;
    const transferencia = parseFloat(unformatNumber(montoTransferencia)) || 0;
    return efectivo + transferencia;
  };

  // Validar que los montos sumen el total
  const validarMontos = () => {
    const montoTotal = parseFloat(unformatNumber(monto)) || 0;
    const totalMontos = calcularTotalMontos();

    return Math.abs(montoTotal - totalMontos) < 0.01;
  };

  // Actualizar montos automáticamente según método de pago
  const handleMetodoPagoChange = (nuevoMetodo: 'efectivo' | 'transferencia' | 'mixto') => {
    setMetodoPago(nuevoMetodo);
    const montoTotal = parseFloat(unformatNumber(monto)) || 0;

    if (nuevoMetodo === 'efectivo') {
      setMontoEfectivo(formatNumberForInput(montoTotal));
      setMontoTransferencia('0');
    } else if (nuevoMetodo === 'transferencia') {
      setMontoEfectivo('0');
      setMontoTransferencia(formatNumberForInput(montoTotal));
    } else {
      const mitad = montoTotal / 2;
      setMontoEfectivo(formatNumberForInput(mitad));
      setMontoTransferencia(formatNumberForInput(mitad));
    }
  };

  // Crear ingreso adicional
  const handleCrearIngreso = async () => {
    if (!concepto || !monto) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (tipo === 'servicio_ocasional' && !selectedOperador) {
      toast.error('Por favor selecciona un operador para el servicio ocasional');
      return;
    }

    if (!validarMontos()) {
      toast.error('La suma de efectivo y transferencia debe ser igual al monto total');
      return;
    }

    setIsCreating(true);
    try {
      const data: CrearIngresoAdicionalData = {
        concepto,
        monto: parseFloat(unformatNumber(monto)),
        metodo_pago: metodoPago,
        monto_efectivo: parseFloat(unformatNumber(montoEfectivo)) || 0,
        monto_transferencia: parseFloat(unformatNumber(montoTransferencia)) || 0,
        tipo,
        categoria: categoria || undefined,
        descripcion: descripcion || undefined,
        empleado_id: user?.operador?.id,
        operador_id: selectedOperador?.id ? parseInt(selectedOperador.id) : undefined,
        fecha: formatDateForAPI(new Date())
      };

      await ingresosAdicionalesService.crearIngresoAdicional(data);
      toast.success('¡Ingreso adicional registrado exitosamente!');
      cargarDatos();
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (error: any) {
      toast.error(error?.response?.data || 'Error al registrar el ingreso adicional');
    } finally {
      setIsCreating(false);
    }
  };

  // Filtrar ingresos por concepto
  const filteredIngresos = ingresosAdicionales.filter(ingreso => {
    const searchLower = searchValue.toLowerCase();
    return ingreso.concepto.toLowerCase().includes(searchLower) ||
      (ingreso.categoria && ingreso.categoria.toLowerCase().includes(searchLower));
  });

  const handleFiltersClick = () => {
    console.log('Abrir filtros avanzados');
  };

  const handleDeleteIngreso = async (ingreso: IngresoAdicional) => {
    setIngresoToDelete(ingreso);
    setConfirmDelete(true);
  };

  const confirmDeleteIngreso = async () => {
    if (!ingresoToDelete) return;

    setIsDeleting(true);
    try {
      await ingresosAdicionalesService.eliminarIngresoAdicional(ingresoToDelete.id);
      toast.success('¡Ingreso adicional eliminado exitosamente!');
      cargarDatos();
      setConfirmDelete(false);
      setIngresoToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data || 'Error al eliminar el ingreso adicional');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setIngresoToDelete(null);
  };

  return (
    <div className="container mx-auto py-8 px-2">
      <PageHeader
        title="Ingresos Adicionales"
        subtitle="Registra ventas esporádicas de accesorios, servicios ocasionales y otros ingresos"
      />

      {isLoading ? (
        <Spinner className="my-16" size="lg" />
      ) : (
        <>
          {/* Tarjetas de resumen */}
          {totales && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Total General</h3>
                  <p className="text-3xl font-bold">{formatCurrency(totales.total_general)}</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Efectivo</h3>
                  <p className="text-3xl font-bold">{formatCurrency(totales.efectivo)}</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Transferencia</h3>
                  <p className="text-3xl font-bold">{formatCurrency(totales.transferencia)}</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Accesorios</h3>
                  <p className="text-3xl font-bold">{formatCurrency(totales.por_tipo.accesorios)}</p>
                </div>
              </Card>
            </div>
          )}

          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <SearchFilters
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onFiltersClick={handleFiltersClick}
                searchPlaceholder="Buscar ingresos por concepto o categoría..."
              />
              <Button onClick={handleOpenModal} className="w-full sm:w-auto">
                + Registrar Ingreso Adicional
              </Button>
            </div>
          </Card>

          {/* Tabla de ingresos adicionales */}
          <div className="mt-8">
            <DataTable
              data={filteredIngresos}
              actions={[
                {
                  icon: Trash2,
                  onClick: handleDeleteIngreso,
                  variant: 'danger',
                  tooltip: 'Eliminar ingreso adicional'
                }
              ]}
              columns={[
                {
                  key: 'concepto',
                  header: 'Concepto',
                  render: (value) => (
                    <span className="font-medium text-blue-700">{String(value)}</span>
                  ),
                },
                {
                  key: 'tipo',
                  header: 'Tipo',
                  render: (value) => {
                    const tipos = {
                      accesorio: { label: 'Accesorio', class: 'bg-blue-100 text-blue-700' },
                      servicio_ocasional: { label: 'Servicio Ocasional', class: 'bg-green-100 text-green-700' },
                      otro: { label: 'Otro', class: 'bg-gray-100 text-gray-700' }
                    };
                    const tipo = tipos[value as keyof typeof tipos];
                    return (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${tipo.class}`}>
                        {tipo.label}
                      </span>
                    );
                  },
                },
                {
                  key: 'categoria',
                  header: 'Categoría',
                  render: (value) => (
                    <span className="text-gray-600">{value ? String(value) : 'Sin categoría'}</span>
                  ),
                },
                {
                  key: 'monto',
                  header: 'Monto',
                  render: (value) => (
                    <span className="text-green-700 font-semibold">{formatCurrency(Number(value))}</span>
                  ),
                },
                {
                  key: 'metodo_pago',
                  header: 'Método de Pago',
                  render: (_: any, row: IngresoAdicional) => {
                    const isMixto = row.monto_efectivo > 0 && row.monto_transferencia > 0;
                    return (
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isMixto ? 'bg-purple-100 text-purple-700' :
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
                {
                  key: 'fecha',
                  header: 'Fecha',
                  render: (value) => (
                    <span className="text-gray-600">{new Date(String(value)).toLocaleDateString('es-CO')}</span>
                  ),
                },
                {
                  key: 'empleado',
                  header: 'Registrado por',
                  render: (_: any, row: IngresoAdicional) => {
                    if (!row.empleado) return <span className="text-gray-600">Sistema</span>;
                    return (
                      <span className="text-gray-600">
                        {`${row.empleado.nombre} ${row.empleado.apellido}`}
                      </span>
                    );
                  },
                },
                {
                  key: 'operador',
                  header: 'Operador',
                  render: (_: any, row: IngresoAdicional) => {
                    if (row.tipo === 'servicio_ocasional' && row.operador) {
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="text-blue-700 font-medium">
                            {`${row.operador.nombre} ${row.operador.apellido}`}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            💰 {formatCurrency(row.monto * 0.4)} (40%)
                          </span>
                        </div>
                      );
                    }
                    return <span className="text-gray-400">-</span>;
                  },
                },
              ]}
              emptyMessage="No hay ingresos adicionales registrados aún."
            />
          </div>

          {/* Modal para crear ingreso adicional */}
          <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Registrar Ingreso Adicional" size="lg">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Concepto *</label>
                  <Input
                    value={concepto}
                    onChange={e => setConcepto(e.target.value)}
                    placeholder="Ej: Venta de pinzas, Servicio extra..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Monto Total *</label>
                  <Input
                    type="text"
                    value={monto}
                    onChange={e => {
                      const rawValue = unformatNumber(e.target.value);
                      const numValue = parseFloat(rawValue) || 0;
                      setMonto(formatNumberForInput(numValue));
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Tipo *</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600"
                  >
                    <option value="accesorio">Accesorio</option>
                    <option value="servicio_ocasional">Servicio Ocasional</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Categoría</label>
                  <Input
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    placeholder="Ej: Herramientas, Productos..."
                  />
                </div>
              </div>

              {/* Selector de operador para servicios ocasionales */}
              {tipo === 'servicio_ocasional' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Operador *</label>
                  <Autocomplete
                    options={operadores}
                    value={selectedOperador}
                    onChange={setSelectedOperador}
                    placeholder="Selecciona un operador"
                    loading={apiOperadores.isLoading}
                  />
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-700">
                      <span className="mr-2">💡</span>
                      <span>El operador recibirá el 40% del monto como ganancia</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Descripción adicional (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-600"
                  rows={3}
                />
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-600">Método de Pago</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleMetodoPagoChange('efectivo')}
                    className={`p-3 rounded-lg border-2 transition-all ${metodoPago === 'efectivo'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-green-300 hover:bg-green-25'
                      }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">💵</div>
                      <div className="text-sm">Efectivo</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMetodoPagoChange('transferencia')}
                    className={`p-3 rounded-lg border-2 transition-all ${metodoPago === 'transferencia'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">🏦</div>
                      <div className="text-sm">Transferencia</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMetodoPagoChange('mixto')}
                    className={`p-3 rounded-lg border-2 transition-all ${metodoPago === 'mixto'
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
              {monto && (
                <div className={`p-4 rounded-lg border-2 ${validarMontos() ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'
                  }`}>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className={`font-medium ${validarMontos() ? 'text-green-700' : 'text-orange-800'}`}>
                      Total ingresado:
                    </span>
                    <span className={`font-bold text-lg ${validarMontos() ? 'text-green-700' : 'text-orange-800'
                      }`}>
                      {formatCurrency(calcularTotalMontos())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`font-medium ${validarMontos() ? 'text-green-700' : 'text-orange-800'}`}>
                      Total requerido:
                    </span>
                    <span className={`font-bold text-lg ${validarMontos() ? 'text-green-700' : 'text-blue-700'
                      }`}>
                      {formatCurrency(parseFloat(unformatNumber(monto)) || 0)}
                    </span>
                  </div>
                  {!validarMontos() && (
                    <div className="text-orange-800 text-xs mt-3 font-medium flex items-center">
                      <span className="mr-1">⚠️</span>
                      Los montos deben sumar exactamente el total
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
                onClick={handleCrearIngreso}
                disabled={!concepto || !monto || !validarMontos() || isCreating || (tipo === 'servicio_ocasional' && !selectedOperador)}
                className="w-full"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Registrando...
                  </div>
                ) : (
                  tipo === 'servicio_ocasional' ? 'Registrar Servicio Ocasional' : 'Registrar Ingreso Adicional'
                )}
              </Button>
            </div>
          </Modal>

          {/* Modal de confirmación de eliminación */}
          {confirmDelete && ingresoToDelete && (
            <Modal
              isOpen={confirmDelete}
              onClose={cancelDelete}
              title="Confirmar eliminación"
              size="sm"
            >
              <div className="text-center py-6">
                <p className="text-lg font-medium mb-4 text-gray-600">
                  ¿Estás seguro de que quieres eliminar este ingreso adicional?
                </p>
                <p className="text-sm text-gray-600">
                  Concepto: {ingresoToDelete.concepto}
                </p>
                <p className="text-sm text-gray-600">
                  Monto: {formatCurrency(ingresoToDelete.monto)}
                </p>
                <p className="text-sm text-gray-600">
                  Fecha: {new Date(ingresoToDelete.fecha).toLocaleDateString('es-CO')}
                </p>
              </div>
                             <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
                   Cancelar
                 </Button>
                 <Button 
                   variant="secondary" 
                   onClick={confirmDeleteIngreso} 
                   className="bg-red-600 hover:bg-red-700 text-white"
                   disabled={isDeleting}
                 >
                   {isDeleting ? (
                     <div className="flex items-center justify-center">
                       <Spinner size="sm" className="mr-2" />
                       Eliminando...
                     </div>
                   ) : (
                     'Eliminar'
                   )}
                 </Button>
               </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
} 