import React from 'react';
import DataTable from '../common/DataTable';
import Button from '../ui/button/Button';
import { Pencil } from 'lucide-react';

interface Entidad {
  id: number;
  nombre: string;
  direccion: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

interface EntidadesTableProps {
  data: Entidad[];
  onEdit: (entidad: Entidad) => void;
}

const EntidadesTable: React.FC<EntidadesTableProps> = ({ data, onEdit }) => {
  const columns = [
    {
      header: 'ID',
      accessor: 'id' as keyof Entidad,
    },
    {
      header: 'Nombre',
      accessor: 'nombre' as keyof Entidad,
    },
    {
      header: 'Dirección',
      accessor: 'direccion' as keyof Entidad,
    },
    {
      header: 'Estado',
      accessor: 'estado' as keyof Entidad,
      cellRenderer: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      header: 'Fecha de Creación',
      accessor: 'created_at' as keyof Entidad,
      cellRenderer: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Acciones',
      accessor: 'id' as keyof Entidad,
      cellRenderer: (value: number, row: Entidad) => (
        <Button
          size="xs"
          variant="outline"
          onClick={() => onEdit(row)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
};

export default EntidadesTable; 