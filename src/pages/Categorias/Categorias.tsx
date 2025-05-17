import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable, { Column } from "../../components/common/DataTable";

interface Categoria {
    id: number;
    nombre: string;
    created_at: string;
}

const columnasCategorias: Column<Categoria>[] = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Creado", accessor: "created_at" },
];

const Categorias = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get("/categorias");
                console.log("Response data:", response.data);

                if (Array.isArray(response.data)) {
                    setCategorias(response.data);
                } else {
                    console.error("La respuesta no es un array:", response.data);
                    setCategorias([]);
                }
            } catch (error) {
                console.error("Error al obtener las categorías:", error);
                setCategorias([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategorias();
    }, []);

    return (
        <div>
            <PageBreadcrumb pageTitle="Categorias" />
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 space-y-6 order-1 xl:order-1">
                    <ComponentCard title="Categorias">
                        {loading ? (
                            <p>Cargando categorías...</p>
                        ) : (
                            <DataTable columns={columnasCategorias} data={categorias} />
                        )}
                    </ComponentCard>
                </div>
            </div>
        </div>
    );
};

export default Categorias;
