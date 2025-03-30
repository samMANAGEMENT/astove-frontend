"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Definir la estructura de datos
interface User {
  id: number;
  nombre: string;
  apellido: string;
  telefono: number;
  cargo_id: number;
}

// Definir las columnas correctamente
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: () => "ID",
  },
  {
    accessorKey: "nombre",
    header: () => "Nombre",
  },
  {
    accessorKey: "apellido",
    header: () => "Apellido",
  },
  {
    accessorKey: "telefono",
    header: () => "Telefono",
  },
  {
    accessorKey: "cargo_id",
    header: () => "Cargo",
  },
];

export default function DataTable() {
  const [data, setData] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No se encontró el token en localStorage.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/operadores/listar-operador`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        setData(
          response.data.map((user: any) => ({
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            telefono: user.telefono,
            cargo_id: user.cargo_id,
          }))
        );
        
      } catch (error: any) {
        console.error("❌ Error al obtener los datos:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const filteredData = data.filter((user) =>
    user.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
        <Button onClick={() => alert("Agregar usuario")} disabled={loading}>
          Agregar
        </Button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, index) => (
              <TableRow key={index}>
                {columns.map((col, i) => (
                  <TableCell key={i}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                No se encontraron datos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
