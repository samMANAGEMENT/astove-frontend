import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import RespuestaDetalle from "./RespuestaDetalle";
import RespuestaEditor from "./RespuestaEditor";
import { HiClipboardList, HiPencilAlt, HiExternalLink } from "react-icons/hi";

interface Respuesta {
    id: number;
    name: string;
    created_at: string;
}

const Respuestas = () => {
    const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedRespuestaId, setSelectedRespuestaId] = useState<number | null>(null);
    const [editingRespuestaId, setEditingRespuestaId] = useState<number | null>(null);

    useEffect(() => {
        const fetchRespuestas = async () => {
            try {
                const response = await axios.get("/templates");
                setRespuestas(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error al obtener las respuestas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRespuestas();
    }, []);

    return (
        <div>
            <PageBreadcrumb pageTitle="Formularios" />
            <div className="flex flex-wrap gap-6">
                {loading ? (
                    <p>Cargando respuestas...</p>
                ) : (
                    respuestas.map((respuesta) => (
                        <div
                            key={respuesta.id}
                            onClick={() => setSelectedRespuestaId(respuesta.id)}
                            className="relative cursor-pointer w-full sm:w-[250px] bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-center text-center border border-gray-200"
                        >
                            {/* Icono de editar */}
                            <HiPencilAlt
                                className="absolute top-2 right-2 text-yellow-500 hover:text-yellow-600 text-xl cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation(); // Previene que se abra el detalle
                                    setEditingRespuestaId(respuesta.id);
                                }}
                            />

                            <a
                                href={`https://service.quar.com.co/ver-formulario?id=${respuesta.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-2 left-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <HiExternalLink className="text-green-500 hover:text-green-600 text-xl" />
                            </a>



                            <HiClipboardList className="text-blue-400 text-6xl mb-4 hover:text-blue-600" />
                            <h3 className="text-xl font-semibold">Formulario #{respuesta.id}</h3>
                            <p className="text-gray-500 mt-1 text-sm">{respuesta.name}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de detalle */}
            {selectedRespuestaId && (
                <RespuestaDetalle
                    respuestaId={selectedRespuestaId}
                    onClose={() => setSelectedRespuestaId(null)}
                />
            )}

            {/* Modal de edición */}
            {editingRespuestaId && (
                <RespuestaEditor
                    respuestaId={editingRespuestaId}
                    onClose={() => setEditingRespuestaId(null)}
                />
            )}
        </div>
    );
};

export default Respuestas;
