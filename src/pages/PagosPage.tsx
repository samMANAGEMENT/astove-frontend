import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button, Card, DataTable, PageHeader, Modal, Input, Spinner } from '../components/ui';
import Autocomplete from '../components/ui/Autocomplete';
import { pagosService } from '../lib/services/pagosService';
import type { PagoHistorico } from '../lib/services/pagosService';
import { useApi } from '../hooks/useApi';

interface Operador {
  id: string;
  name: string;
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<PagoHistorico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null);
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState('');
  const [estado, setEstado] = useState(true);
  const [formErrors, setFormErrors] = useState<{ empleado_id?: string; monto?: string; fecha?: string }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pagoToDelete, setPagoToDelete] = useState<PagoHistorico | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const apiOperadores = useApi();
  const apiCrearPago = useApi();
  const apiEliminarPago = useApi();

  // Cargar pagos al montar
  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    setIsLoading(true);
    try {
      const data = await pagosService.getAllPagos();
      setPagos(data.sort((a: PagoHistorico, b: PagoHistorico) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
    } catch (e) {
      toast.error('Error al cargar los pagos');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar operadores cuando se abre el modal
  useEffect(() => {
    if (isModalOpen) {
      apiOperadores.get('/operadores/listar-operador')
        .then((data) => {
          const ops = (data || []).map((op: any) => ({
            id: String(op.id),
            name: `${op.nombre} ${op.apellido}`
          }));
          setOperadores(ops);
        })
        .catch(() => setOperadores([]));
    }
  }, [isModalOpen]);

  const openModal = () => {
    setSelectedOperador(null);
    setMonto('');
    setFecha('');
    setEstado(true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOperador(null);
    setMonto('');
    setFecha('');
    setEstado(true);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: { empleado_id?: string; monto?: string; fecha?: string } = {};
    if (!selectedOperador) errors.empleado_id = 'El empleado es requerido';
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) errors.monto = 'El monto debe ser mayor a 0';
    if (!fecha) errors.fecha = 'La fecha es requerida';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await apiCrearPago.post('/pagos/crear-pago', {
        empleado_id: Number(selectedOperador!.id),
        monto: Number(monto),
        fecha,
        estado,
      });
      toast.success('Pago registrado exitosamente');
      closeModal();
      cargarPagos();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al registrar el pago');
    }
  };

  const handleDeletePago = (pago: PagoHistorico) => {
    setPagoToDelete(pago);
    setConfirmDelete(true);
  };

  const confirmDeletePago = async () => {
    if (!pagoToDelete) return;

    setIsDeleting(true);
    try {
      await apiEliminarPago.delete(`/pagos/eliminar-pago/${pagoToDelete.id}`);
      toast.success('Pago eliminado exitosamente');
      cargarPagos();
      setConfirmDelete(false);
      setPagoToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al eliminar el pago');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setPagoToDelete(null);
  };

  const columns = [
    {
      key: 'empleado' as keyof PagoHistorico,
      header: 'Empleado',
      render: (_: any, row: PagoHistorico) => (
        <span className="font-medium text-blue-700">{row.empleado.nombre} {row.empleado.apellido}</span>
      ),
    },
    {
      key: 'monto' as keyof PagoHistorico,
      header: 'Monto',
      render: (value: any, _row: PagoHistorico) => (
        <span className="text-green-700 font-semibold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(value))}</span>
      ),
    },
    {
      key: 'tipo_pago' as keyof PagoHistorico,
      header: 'Tipo',
      render: (value: any, _row: PagoHistorico) => (
        <span className={`font-semibold ${value === 'total' ? 'text-blue-600' : 'text-orange-600'}`}>
          {value === 'total' ? 'Total' : 'Parcial'}
        </span>
      ),
    },
    {
      key: 'fecha' as keyof PagoHistorico,
      header: 'Fecha',
      render: (value: any, _row: PagoHistorico) => (
        <span className="text-black">{new Date(value).toLocaleDateString('es-CO')}</span>
      ),
    },
    {
      key: 'estado' as keyof PagoHistorico,
      header: 'Estado',
      render: (value: any, _row: PagoHistorico) => (
        <span className={`font-semibold ${value ? 'text-green-600' : 'text-red-600'}`}>{value ? 'Pagado' : 'Pendiente'}</span>
      ),
    },
    {
      key: 'id' as keyof PagoHistorico,
      header: 'Acciones',
      render: (_: any, row: PagoHistorico) => (
        <Button
          variant="outline"
          size="sm"
          icon={Trash2}
          onClick={() => handleDeletePago(row)}
          className="px-2 py-1 text-red-600 border-red-300 hover:bg-red-50"
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos a Empleados"
        subtitle="Gestiona y registra pagos realizados a empleados"
      >
        <Button icon={Plus} onClick={openModal}>
          Nuevo Pago
        </Button>
      </PageHeader>

      <Card>
        <DataTable
          data={pagos}
          columns={columns}
          emptyMessage="No se encontraron pagos realizados"
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Registrar Pago" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Empleado</label>
            <Autocomplete
              options={operadores}
              value={selectedOperador}
              onChange={setSelectedOperador}
              placeholder="Selecciona un empleado"
              loading={apiOperadores.isLoading}
            />
            {formErrors.empleado_id && <p className="text-red-500 text-sm mt-1">{formErrors.empleado_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monto</label>
            <Input
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="Monto a pagar"
            />
            {formErrors.monto && <p className="text-red-500 text-sm mt-1">{formErrors.monto}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <Input
              type="text"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              placeholder="DD-MM-YYYY"
            />
            {formErrors.fecha && <p className="text-red-500 text-sm mt-1">{formErrors.fecha}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={estado ? 'true' : 'false'}
              onChange={e => setEstado(e.target.value === 'true')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-black"
            >
              <option value="true">Pagado</option>
              <option value="false">Pendiente</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={closeModal} disabled={apiCrearPago.isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={apiCrearPago.isLoading} className="flex items-center gap-2">
              {apiCrearPago.isLoading && <Spinner size="sm" />}
              Registrar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && pagoToDelete && (
        <Modal
          isOpen={confirmDelete}
          onClose={cancelDelete}
          title="Confirmar eliminación"
          size="sm"
        >
          <div className="text-center py-6">
            <p className="text-lg font-medium mb-4 text-gray-600">
              ¿Estás seguro de que quieres eliminar este pago?
            </p>
            <p className="text-sm text-gray-600">
              Empleado: {pagoToDelete.empleado.nombre} {pagoToDelete.empleado.apellido}
            </p>
            <p className="text-sm text-gray-600">
              Monto: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(pagoToDelete.monto))}
            </p>
            <p className="text-sm text-gray-600">
              Fecha: {new Date(pagoToDelete.fecha).toLocaleDateString('es-CO')}
            </p>
            <p className="text-xs text-red-600 mt-3">
              ⚠️ Esta acción no se puede deshacer
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button 
              variant="secondary" 
              onClick={confirmDeletePago} 
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

      {isLoading && <Spinner className="my-16" size="lg" />}
    </div>
  );
}