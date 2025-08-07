import React from "react";
import { DataTable } from "../components/ui";
import { Eye } from "lucide-react";
import type { Column } from "../components/ui/DataTable";

interface Usuario {
    id: number;
    name: string;
    email: string;
    telefono: number;
}

const PruebaTable: React.FC = () => {

    const UsuarioInfo: Usuario[] = [
        {
            id: 3576,
            name: 'juan',
            email: 'ss',
            telefono: 30303030,
        }
    ];

    const columns: Column<Usuario>[] = [
        {
            key: 'id',
            header: 'ID'
        },
        {
            key: 'name',
            header: 'Nombre'
        },
    ];

    const actions = [
    {
        icon: Eye,
        onClick: handleView,
        variant: 'primary' as const,
        tooltip: 'Ver detalles',
    },

    ];

    return (
        <div>
            <DataTable<Usuario>
                data={UsuarioInfo}
                columns={columns}
                actions={actions}
                emptyMessage="No se encontraron usuarios"
                className="mt-4"
            />
        </div>
    )
};

    const handleView = (usuario: Usuario) => {
    console.log('Ver Usuario:', usuario);
    }

export default PruebaTable;