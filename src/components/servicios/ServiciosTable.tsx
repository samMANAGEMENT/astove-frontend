import React from 'react';
import DataTable from '../common/DataTable';
import Button from '../ui/button/Button';
import { Pencil } from 'lucide-react';

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  created_at: string;
  updated_at: string;
}

interface ServiciosTableProps {
  data: Servicio[];
  onEdit: (servicio: Servicio) => void;
}

const ServiciosTable: React.FC<ServiciosTableProps> = ({ data, onEdit }) => {
  const columns = [
    {
      header: 'ID',
      accessor: 'id' as keyof Servicio,
    },
    {
      header: 'Nombre',
      accessor: 'nombre' as keyof Servicio,
    },
    {
      header: 'Precio',
      accessor: 'precio' as keyof Servicio,
      cellRenderer: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      header: 'Fecha de Creación',
      accessor: 'created_at' as keyof Servicio,
      cellRenderer: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Acciones',
      accessor: 'id' as keyof Servicio,
      cellRenderer: (value: number, row: Servicio) => (
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

export default ServiciosTable; 