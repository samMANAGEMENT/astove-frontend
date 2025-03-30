import DataTable from "@/components/empleados/DataTable";

export default function empleadosPage() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Empleados</h1>
      <DataTable />
    </main>
  );
}
