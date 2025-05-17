import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DataTable from "../../components/common/DataTable";

// Tipo de dato esperado para un técnico
interface Tecnico {
  id: number;
  nombre: string;
  especialidad: string;
  telefono: string;
}

// Columnas para el DataTable
const columnasTecnicos = [
  {
    header: "ID",
    accessor: "id" as keyof Tecnico,
  },
  {
    header: "Nombre",
    accessor: "nombre" as keyof Tecnico,
  },
  {
    header: "Especialidad",
    accessor: "especialidad" as keyof Tecnico,
  },
  {
    header: "Teléfono",
    accessor: "telefono" as keyof Tecnico,
  },
];

export default function Tecnicos() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const response = await axios.get("/api/tecnicos");
        setTecnicos(response.data);
      } catch (err: any) {
        console.error("Error al obtener técnicos:", err);
        setError("No se pudieron cargar los técnicos.");
      } finally {
        setLoading(false);
      }
    };

    fetchTecnicos();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Técnicos" />
      <div className="space-y-6">
        <ComponentCard title="Gestionar Técnicos">
          <div className="flex flex-col gap-4">
            {loading ? (
              <span className="text-gray-500">Cargando técnicos...</span>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : (
              <DataTable columns={columnasTecnicos} data={tecnicos} />
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
