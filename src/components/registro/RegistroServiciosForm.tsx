import React, { useState, useEffect } from "react";
import axios from "../../lib/axios";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";

// Puedes cambiar estos tipos según tu backend
interface Cargo {
  id: number;
  nombre: string;
}

interface Entidad {
  id: number;
  nombre: string;
  estado: boolean;
}

interface OperadorDetalle {
  id: number;
  nombre: string;
  apellido: string;
  entidad_id: number;
  telefono: string;
  cargo_id: number;
  created_at: string;
  updated_at: string;
  cargo: Cargo;
  entidades: Entidad;
}

interface Operador {
  id: number;
  email: string;
  operador_id: number;
  created_at: string;
  operador: OperadorDetalle;
}

interface Servicio {
  id: number;
  nombre: string;
}

interface RegistroServiciosFormProps {
  onRegistroExitoso: () => void;
}

const RegistroServiciosForm: React.FC<RegistroServiciosFormProps> = ({ onRegistroExitoso }) => {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [operadorSeleccionado, setOperadorSeleccionado] = useState<Operador | null>(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<number | null>(null);
  const [busquedaOperador, setBusquedaOperador] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar operadores y servicios al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [operadoresResponse, serviciosResponse] = await Promise.all([
          axios.get('/operadores/listar-operador'),
          axios.get('/servicios/listar-servicio')
        ]);
        
        setOperadores(operadoresResponse.data);
        setServicios(serviciosResponse.data);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operadorSeleccionado || !servicioSeleccionado) return;
    setLoading(true);
    try {
      // TODO: Reemplaza con tu endpoint real
      // await axios.post('/api/registro-servicio', { operador_id: operadorSeleccionado.id, servicio_id: servicioSeleccionado });
      // Simulación de éxito
      onRegistroExitoso();
      setOperadorSeleccionado(null);
      setServicioSeleccionado(null);
      setBusquedaOperador("");
    } catch (err) {
      // Manejo de error
      alert("Error al registrar servicio");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de operadores para el autocomplete
  const operadoresFiltrados = operadores.filter(op =>
    `${op.operador.nombre} ${op.operador.apellido}`.toLowerCase().includes(busquedaOperador.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
      <div>
        <Label>Operador</Label>
        <Input
          type="text"
          placeholder="Buscar operador..."
          value={operadorSeleccionado ? `${operadorSeleccionado.operador.nombre} ${operadorSeleccionado.operador.apellido}` : busquedaOperador}
          onChange={e => {
            setBusquedaOperador(e.target.value);
            setOperadorSeleccionado(null);
          }}
        />
        {busquedaOperador && !operadorSeleccionado && (
          <div className="border rounded bg-white shadow max-h-40 overflow-y-auto absolute z-10">
            {operadoresFiltrados.length === 0 && (
              <div className="p-2 text-gray-500">No hay resultados</div>
            )}
            {operadoresFiltrados.map(op => (
              <div
                key={op.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setOperadorSeleccionado(op);
                  setBusquedaOperador("");
                }}
              >
                {op.operador.nombre} {op.operador.apellido}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <Label>Servicio</Label>
        <select
          className="w-full border rounded px-3 py-2"
          value={servicioSeleccionado ?? ""}
          onChange={e => setServicioSeleccionado(Number(e.target.value))}
        >
          <option value="">Selecciona un servicio</option>
          {servicios.map(servicio => (
            <option key={servicio.id} value={servicio.id}>
              {servicio.nombre}
            </option>
          ))}
        </select>
      </div>
      <Button size="xs" disabled={loading || !operadorSeleccionado || !servicioSeleccionado}>
        {loading ? "Guardando..." : "Registrar Servicio"}
      </Button>
    </form>
  );
};

export default RegistroServiciosForm;
