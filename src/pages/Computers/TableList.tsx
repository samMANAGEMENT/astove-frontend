import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import ComputersTable from "../../components/tables/BasicTables/ComputersTable";

export default function TableList() {
  return (
    <>
      <PageBreadcrumb pageTitle="Computers" />
      <div className="space-y-6">
        <ComponentCard title="Lista de activos">
          <ComputersTable />
        </ComponentCard>
      </div>
    </>
  );
}
