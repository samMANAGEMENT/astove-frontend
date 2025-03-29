import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "@/pages/home/home"
import Login from "@/components/auth/login-component"
import NotFound from "./pages/404/404"
import App from "./App"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      { path: "home", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "*", element: <NotFound /> },
    ],
  }
])

export default function Router() {
  return <RouterProvider router={router} />
}
