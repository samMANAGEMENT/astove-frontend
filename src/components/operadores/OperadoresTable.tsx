import React from 'react';
import DataTable from '../common/DataTable';
import Button from '../ui/button/Button';
import { Pencil } from 'lucide-react';

interface Operador {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

interface OperadoresTableProps {
  data: Operador[];
  onEdit: (operador: Operador) => void;
}

const OperadoresTable: React.FC<OperadoresTableProps> = ({ data, onEdit }) => {
  const columns = [
    {
      header: 'ID',
      accessor: 'id' as keyof Operador,
    },
    {
      header: 'Nombre',
      accessor: 'nombre' as keyof Operador,
    },
    {
      header: 'Apellido',
      accessor: 'apellido' as keyof Operador,
    },
    {
      header: 'Email',
      accessor: 'email' as keyof Operador,
    },
    {
      header: 'Teléfono',
      accessor: 'telefono' as keyof Operador,
    },
    {
      header: 'Estado',
      accessor: 'estado' as keyof Operador,
      cellRenderer: (value: boolean) => value ? 'Activo' : 'Inactivo',
    },
    {
      header: 'Fecha de Creación',
      accessor: 'created_at' as keyof Operador,
      cellRenderer: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Acciones',
      accessor: 'id' as keyof Operador,
      cellRenderer: (value: number, row: Operador) => (
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

export default OperadoresTable; 