import ComponentCard from "../../components/common/ComponentCard";
import { useEffect } from "react";
import { useNavigate } from "react-router";



export default function Home() {
  const navigate = useNavigate();
  const isLoading = true;
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6">  {/* Cambiar el grid por flex */}
        <div className="flex-1 space-y-6">
          {/* Componente Dashboard */}
          {isLoading ? (
            <div className="flex flex-col space-y-4">
              {/* Skeleton Card - Simulando la carga */}
              <div className="bg-white animate-pulse p-6 rounded-lg dark:bg-gray-900">
                <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="w-full h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <ComponentCard title="Dashboard">
              <div className="space-y-4" />
            </ComponentCard >
          )}

          {/* Componente Loaders */}
          {isLoading ? (
            <div className="bg-white animate-pulse p-6 rounded-lg dark:bg-gray-900">
              <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
              <div className="w-full h-48 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div>
              <ComponentCard title="Loaders">
                <div className="space-y-4" />
              </ComponentCard >
            </div>
          )}
        </div>
      </div>
    </>
  );
}
