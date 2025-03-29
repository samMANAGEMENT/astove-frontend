import { Outlet } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center justify-center min-h-svh">
        <Outlet />
      </div>
    </ThemeProvider>
  )
}

export default App
