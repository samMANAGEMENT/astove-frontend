import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ServiciosTable from "../../components/servicios/ServiciosTable";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Plus } from 'lucide-react';

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  created_at: string;
  updated_at: string;
}

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: 0
  });

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const { data } = await axios.get('/servicios/listar-servicio');
        console.log('Respuesta del servidor:', data);
        const serviciosData = Array.isArray(data) ? data : data.data || [];
        setServicios(serviciosData);
      } catch (err) {
        console.error('Error al obtener servicios:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  const handleEdit = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setFormData({
      nombre: servicio.nombre,
      precio: servicio.precio
    });
    openModal();
  };

  const handleAdd = () => {
    setSelectedServicio(null);
    setFormData({
      nombre: '',
      precio: 0
    });
    openModal();
  };

  const handleSubmit = async () => {
    try {
      if (selectedServicio) {
        // Actualizar servicio existente
        await axios.put(`/servicios/actualizar/${selectedServicio.id}`, formData);
      } else {
        // Crear nuevo servicio
        await axios.post('/servicios/crear-servicio', formData);
      }
      
      // Recargar la lista de servicios
      const { data } = await axios.get('/servicios/listar-servicio');
      const serviciosData = Array.isArray(data) ? data : data.data || [];
      setServicios(serviciosData);
      
      closeModal();
    } catch (err) {
      console.error('Error al guardar servicio:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Servicios" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Servicios
            </h3>
            <Button onClick={handleAdd} size="xs" startIcon={<Plus className="w-4 h-4" />}>
              Agregar Servicio
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <ServiciosTable data={servicios} onEdit={handleEdit} />
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {selectedServicio ? 'Modifica los datos del servicio.' : 'Ingresa los datos del nuevo servicio.'}
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
                  <Label>Precio</Label>
                  <Input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSubmit}>
                {selectedServicio ? 'Guardar Cambios' : 'Crear Servicio'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
} 