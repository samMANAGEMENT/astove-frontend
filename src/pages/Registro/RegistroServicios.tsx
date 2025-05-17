import React, { useEffect, useState } from "react";
import RegistroServiciosForm from "../../components/registro/RegistroServiciosForm";
import DataTable from "../../components/common/DataTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

// Puedes cambiar estos tipos según tu backend
interface Registro {
  id: number;
  operador: { id: number; nombre: string; apellido: string };
  servicio: { id: number; nombre: string };
  fecha: string;
}

export default function RegistroServicios() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroOperador, setFiltroOperador] = useState("");
  const [filtroServicio, setFiltroServicio] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Cargar registros
  const fetchRegistros = async () => {
    setLoading(true);
    try {
      // TODO: Reemplaza con tu endpoint real y parámetros de filtro/paginación
      // const { data } = await axios.get('/api/registro-servicios', { params: { page: pagina, operador: filtroOperador, servicio: filtroServicio } });
      // setRegistros(data.data);
      // setTotalPaginas(data.last_page);
      // Simulación de datos:
      setRegistros([
        {
          id: 1,
          operador: { id: 1, nombre: "Juan", apellido: "Pérez" },
          servicio: { id: 1, nombre: "Lavado" },
          fecha: "2024-06-01T10:00:00Z",
        },
        {
          id: 2,
          operador: { id: 2, nombre: "Ana", apellido: "García" },
          servicio: { id: 2, nombre: "Planchado" },
          fecha: "2024-06-02T11:00:00Z",
        },
      ]);
      setTotalPaginas(1);
    } catch (err) {
      setError("Error al cargar registros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistros();
    // eslint-disable-next-line
  }, [pagina, filtroOperador, filtroServicio]);

  const handleRegistroExitoso = () => {
    fetchRegistros();
  };

  // Columnas para la tabla
  const columns = [
    {
      header: "ID",
      accessor: "id",
    },
    {
      header: "Operador",
      accessor: "operador",
      cellRenderer: (value: any) => `${value.nombre} ${value.apellido}`,
    },
    {
      header: "Servicio",
      accessor: "servicio",
      cellRenderer: (value: any) => value.nombre,
    },
    {
      header: "Fecha",
      accessor: "fecha",
      cellRenderer: (value: string) => new Date(value).toLocaleString(),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Registro de Servicios" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl mb-4">
            Registro de Servicios Realizados
          </h3>
          <RegistroServiciosForm onRegistroExitoso={handleRegistroExitoso} />

          <div className="flex gap-4 mb-4">
            <Input
              type="text"
              placeholder="Filtrar por operador"
              value={filtroOperador}
              onChange={e => setFiltroOperador(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Filtrar por servicio"
              value={filtroServicio}
              onChange={e => setFiltroServicio(e.target.value)}
            />
            <Button size="xs" onClick={() => { setPagina(1); fetchRegistros(); }}>
              Filtrar
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <DataTable columns={columns} data={registros} />
          )}

          {/* Paginación */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              size="xs"
              variant="outline"
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </Button>
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            <Button
              size="xs"
              variant="outline"
              disabled={pagina === totalPaginas}
              onClick={() => setPagina(pagina + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
