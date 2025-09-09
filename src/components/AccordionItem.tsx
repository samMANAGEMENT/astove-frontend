import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "../components/ui"; // ajusta el import según tu proyecto

const AccordionItem = ({ agenda, fechaDisponibilidad, navigate, formatTime }: any) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-w-[18rem] sm:min-w-[20rem] border rounded-lg">
            {/* Header del acordeón */}
            <button
                className="w-full p-3 border-b bg-gray-50 flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <div className="font-medium text-gray-900 truncate max-w-[12rem]">
                        {agenda.operador.nombre} {agenda.operador.apellido}
                    </div>
                    <div className="text-xs text-gray-600 truncate max-w-[12rem]">
                        {agenda.agenda_nombre}
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="text-green-600">{agenda.horarios_libres} libres</div>
                    <div className="text-red-600">{agenda.horarios_ocupados} ocupados</div>
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
            </button>

            {/* Contenido expandible */}
            {isOpen && (
                <div className="p-3 space-y-2">
                    {agenda.horarios_disponibles.length > 0 ? (
                        agenda.horarios_disponibles.map((horario: any) => (
                            <div
                                key={horario.id}
                                className={`p-2 rounded border-l-4 ${horario.disponible
                                        ? "bg-green-50 border-green-400 hover:bg-green-100 cursor-pointer"
                                        : "bg-red-50 border-red-400"
                                    }`}
                                onClick={() => {
                                    if (horario.disponible) {
                                        navigate(
                                            `/agendas/${agenda.agenda_id}/calendario?fecha=${fechaDisponibilidad}&horario=${horario.id}`
                                        );
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {horario.titulo}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                                        </div>
                                    </div>
                                    <Badge variant={horario.disponible ? "success" : "outline"}>
                                        {horario.disponible ? "Disponible" : "Ocupado"}
                                    </Badge>
                                </div>
                                {!horario.disponible && horario.cita_existente && (
                                    <div className="mt-1 text-[11px] text-gray-600">
                                        <div>Cliente: {horario.cita_existente.cliente_nombre}</div>
                                        <div>Servicio: {horario.cita_existente.servicio}</div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">Sin horarios</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AccordionItem;
