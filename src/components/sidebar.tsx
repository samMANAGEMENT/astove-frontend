import { useState } from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Menu, ChevronDown, ChevronRight, Home, LogIn, X, Briefcase } from "lucide-react"

const menuItems = [
  {
    label: "Inicio",
    icon: <Home className="w-5 h-5" />,
    path: "/home",
  },
  {
    label: "Empleados",
    icon: <Briefcase className="w-5 h-5" />,
    children: [
      { label: "Gestionar Empleados", path: "/empleados" },
    ],
  },
  {
    label: "Autenticación",
    icon: <LogIn className="w-5 h-5" />,
    children: [
      { label: "Login", path: "/login" },
      { label: "Registro", path: "/register" },
    ],
  },
]

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <>
      {/* Botón para abrir/cerrar el menú en móviles */}
      <button
        className="fixed top-4 left-4 z-50 p-2 text-white rounded-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 text-white p-4 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:min-h-screen"
        )}
      >
        <div className="flex items-center space-x-2">
          <Menu className="w-6 h-6" />
          <img src="/icon.svg" alt="aSTOVE ICON" className="w-10 h-10" />
          <h1 className="text-xl font-semibold">aSTOVE</h1>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <div key={item.label} className="mb-2">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {openMenus[item.label] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {openMenus[item.label] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            cn(
                              "block px-3 py-2 text-sm rounded-md",
                              isActive ? "bg-gray-700" : "hover:bg-gray-800"
                            )
                          }
                          onClick={() => setIsOpen(false)} // Cerrar en móviles
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 space-x-2 rounded-md",
                      isActive ? "bg-gray-700" : "hover:bg-gray-800"
                    )
                  }
                  onClick={() => setIsOpen(false)} // Cerrar en móviles
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Overlay para cerrar el menú en móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
