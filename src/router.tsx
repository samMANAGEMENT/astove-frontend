import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "@/pages/home/home"
import Login from "@/components/auth/login-component"
import EmpleadosPage from "./pages/empleados/empleadosPage"
import NotFound from "./pages/404/404"
import App from "./App"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      { path: "home", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "empleados", element: <EmpleadosPage /> },
      { path: "*", element: <NotFound /> },
    ],
  }
])

export default function Router() {
  return <RouterProvider router={router} />
}
