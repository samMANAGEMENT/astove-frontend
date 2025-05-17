import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useEffect, useState } from "react";



interface Activo {
    idActivo: string;
    NombreActivo: string;
    Codigo: string;
    TipoPc: string;
    Procesador: string | null;
    FechaUltimoMantenimiento: string;
    ProximoMantenimiento: string;
    Estado: string;
    Marca: string | null;
    Modelo: string | null;
    Serial: string | null;
    Url: string | null
}

export default function ComputersTable() {
    const [activos, setActivos] = useState<Activo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://quar.com.co/api/tabla", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: localStorage.getItem("id"),
                        IdSede: null
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();

                // Transformar los datos de activos
                const activosTransformados = data.activo.map((activo: any) => ({
                    idActivo: activo.idActivo,
                    NombreActivo: activo.NombreActivo || "Sin nombre",
                    Codigo: activo.Codigo || "Sin código",
                    TipoPc: activo.idTipoPc === "1" ? "Portátil" :
                        activo.idTipoPc === "2" ? "Escritorio" :
                            activo.idTipoPc === "3" ? "All in One" : "Desconocido",
                    Procesador: activo.Procesador,
                    FechaUltimoMantenimiento: activo.FechaUltimoMantenimiento || "No registrado",
                    ProximoMantenimiento: activo.ProximoMantenimiento || "No programado",
                    Estado: activo.Estado || "Activo",
                    Marca: activo.Marca,
                    Modelo: activo.Modelo,
                    Serial: activo.Serial,
                    Url: `http://app.quar.com.co/editar/computador/` + activo.Codigo 

                }));

                setActivos(activosTransformados);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-4 text-center">Cargando activos...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">Error: {error}</div>;
    }

    if (activos.length === 0) {
        return <div className="p-4 text-center">No hay activos registrados</div>;
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Código
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Nombre
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tipo
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Marca/Modelo
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Último Mantenimiento
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Próximo Mantenimiento
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Estado
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Sistema
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {activos.map((activo) => (
                            <TableRow key={activo.idActivo}>
                                <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-gray-800 dark:text-white/90">
                                    {activo.Codigo}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {activo.NombreActivo}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {activo.TipoPc}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <div>
                                        {activo.Marca && <span>{activo.Marca}</span>}
                                        {activo.Modelo && <span> / {activo.Modelo}</span>}
                                        {!activo.Marca && !activo.Modelo && <span>No especificado</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {activo.FechaUltimoMantenimiento}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {activo.ProximoMantenimiento}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <Badge
                                        size="sm"
                                        color={
                                            activo.Estado === "Activo"
                                                ? "success"
                                                : activo.Estado === "En mantenimiento"
                                                    ? "warning"
                                                    : "error"
                                        }
                                    >
                                        {activo.Estado}
                                    </Badge>
                                </TableCell>

                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <a
                                        href={activo.Url || ""}  // Use the Url property directly
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block hover:opacity-80 transition-opacity"
                                    >
                                        <Badge
                                            size="sm"
                                            color={
                                                'warning'
                                            }
                                        >
                                            {activo.Url}
                                        </Badge>
                                    </a>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}