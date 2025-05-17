import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import OperadoresTable from "../../components/operadores/OperadoresTable";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Plus } from 'lucide-react';

interface Operador {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export default function Operadores() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    estado: true
  });

  useEffect(() => {
    const fetchOperadores = async () => {
      try {
        const { data } = await axios.get('/operadores/listar-operador');
        console.log('Respuesta del servidor:', data);
        const operadoresData = Array.isArray(data) ? data : data.data || [];
        setOperadores(operadoresData);
      } catch (err) {
        console.error('Error al obtener operadores:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchOperadores();
  }, []);

  const handleEdit = (operador: Operador) => {
    setSelectedOperador(operador);
    setFormData({
      nombre: operador.nombre,
      apellido: operador.apellido,
      email: operador.email,
      telefono: operador.telefono,
      estado: operador.estado
    });
    openModal();
  };

  const handleAdd = () => {
    setSelectedOperador(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      estado: true
    });
    openModal();
  };

  const handleSubmit = async () => {
    try {
      if (selectedOperador) {
        // Actualizar operador existente
        await axios.put(`/operadores/actualizar/${selectedOperador.id}`, formData);
      } else {
        // Crear nuevo operador
        await axios.post('/operadores/crear-operador', formData);
      }
      
      // Recargar la lista de operadores
      const { data } = await axios.get('/operadores/listar-operador');
      const operadoresData = Array.isArray(data) ? data : data.data || [];
      setOperadores(operadoresData);
      
      closeModal();
    } catch (err) {
      console.error('Error al guardar operador:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Operadores" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Operadores
            </h3>
            <Button onClick={handleAdd} size="xs" startIcon={<Plus className="w-4 h-4" />}>
              Agregar Operador
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <OperadoresTable data={operadores} onEdit={handleEdit} />
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedOperador ? 'Editar Operador' : 'Nuevo Operador'}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {selectedOperador ? 'Modifica los datos del operador.' : 'Ingresa los datos del nuevo operador.'}
            </p>
          </div>

          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Apellido</Label>
                  <Input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Teléfono</Label>
                  <Input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Estado</Label>
                  <select
                    value={formData.estado ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'true' })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSubmit}>
                {selectedOperador ? 'Guardar Cambios' : 'Crear Operador'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
} 