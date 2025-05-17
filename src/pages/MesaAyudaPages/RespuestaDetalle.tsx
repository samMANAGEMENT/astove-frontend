import React, { useEffect, useRef, useState } from "react";
import axios from "../../lib/axios";
import DataTable, { Column } from "../../components/common/DataTable";
import moment from 'moment';


interface SubmissionEntry {
  label: string;
  value: string;
}

interface SubmissionData {
  id: number;
  ticket_template_id: number;
  submission: SubmissionEntry[];
  created_at: string;
  updated_at: string;
}

interface Props {
  respuestaId: number;
  onClose: () => void;
}

const RespuestaDetalle: React.FC<Props> = ({ respuestaId, onClose }) => {
  const [respuestas, setRespuestas] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRespuesta = async () => {
      try {
        const response = await axios.get(`/submissions/by-template/${respuestaId}`);
        setRespuestas(response.data);
      } catch (error) {
        console.error("Error al obtener detalle:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRespuesta();
  }, [respuestaId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // 🔁 Transforma respuestas a una tabla con headers dinámicos
  const labelsSet = new Set<string>();
  respuestas.forEach((res) =>
    res.submission.forEach((entry) => labelsSet.add(entry.label))
  );

  const labels = Array.from(labelsSet);

  const data = respuestas.map((res) => {
    const row: Record<string, string> = {};
    labels.forEach((label) => {
      const entry = res.submission.find((e) => e.label === label);
      row[label] = entry?.value || "";
    });
    row["Fecha de creación"] = moment(res.created_at).format('DD/MM/YYYY HH:mm');
    return row;
  });

  const columns: Column<Record<string, string>>[] = [
    ...labels.map((label) => ({
      header: label,
      accessor: label,
    })),
    {
      header: "Fecha de creación",
      accessor: "Fecha de creación",
    },
  ];

  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md bg-white/30 z-50">
      <div
        ref={modalRef}
        className="bg-white text-black rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {loading ? (
          <p className="text-center text-lg">Cargando...</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Detalle de las respuestas</h2>
            <DataTable columns={columns} data={data} className="mt-4" />
          </>
        )}

        <div className="mt-6 text-right">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RespuestaDetalle;
