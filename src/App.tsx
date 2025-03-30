import { Outlet, useLocation } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Sidebar from "./components/sidebar"

export default function App() {
  const location = useLocation()

  // Rutas donde NO se debe mostrar el Sidebar
  const hiddenSidebarRoutes = ["/login", "/register"]

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-screen">
        {/* Renderiza el Sidebar solo si la ruta actual NO está en `hiddenSidebarRoutes` */}
        {!hiddenSidebarRoutes.includes(location.pathname) && <Sidebar />}
        
        {/* Contenido principal */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  )
}
