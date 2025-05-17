import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import EntidadesTable from "../../components/entidades/EntidadesTable";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Plus } from 'lucide-react';

interface Entidad {
  id: number;
  nombre: string;
  direccion: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export default function Entidades() {
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedEntidad, setSelectedEntidad] = useState<Entidad | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    estado: true
  });

  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        const { data } = await axios.get('/entidad/listar-entidades');
        console.log('Respuesta del servidor:', data);
        const entidadesData = Array.isArray(data) ? data : data.data || [];
        setEntidades(entidadesData);
      } catch (err) {
        console.error('Error al obtener entidades:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEntidades();
  }, []);

  const handleEdit = (entidad: Entidad) => {
    setSelectedEntidad(entidad);
    setFormData({
      nombre: entidad.nombre,
      direccion: entidad.direccion,
      estado: entidad.estado
    });
    openModal();
  };

  const handleAdd = () => {
    setSelectedEntidad(null);
    setFormData({
      nombre: '',
      direccion: '',
      estado: true
    });
    openModal();
  };

  const handleSubmit = async () => {
    try {
      if (selectedEntidad) {
        // Actualizar entidad existente
        await axios.put(`/entidad/actualizar/${selectedEntidad.id}`, formData);
      } else {
        // Crear nueva entidad
        await axios.post('/entidad/crear-entidad', formData);
      }
      
      // Recargar la lista de entidades
      const { data } = await axios.get('/entidad/listar-entidades');
      const entidadesData = Array.isArray(data) ? data : data.data || [];
      setEntidades(entidadesData);
      
      closeModal();
    } catch (err) {
      console.error('Error al guardar entidad:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Entidades" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Entidades
            </h3>
            <Button onClick={handleAdd} size="xs" startIcon={<Plus className="w-4 h-4" />}>
              Agregar Entidad
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <EntidadesTable data={entidades} onEdit={handleEdit} />
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedEntidad ? 'Editar Entidad' : 'Nueva Entidad'}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {selectedEntidad ? 'Modifica los datos de la entidad.' : 'Ingresa los datos de la nueva entidad.'}
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
                  <Label>Dirección</Label>
                  <Input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
                {selectedEntidad ? 'Guardar Cambios' : 'Crear Entidad'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
