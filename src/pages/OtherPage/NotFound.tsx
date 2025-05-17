import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">

      <div className="z-10 max-w-md text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-800 dark:text-white">404</h1>
        <h2 className="mt-2 text-xl font-medium text-gray-600 dark:text-gray-300">
          Página no encontrada
        </h2>

        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Lo sentimos, no pudimos encontrar la página que buscas.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-white shadow hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-all"
        >
          <span>Volver al inicio</span>
        </Link>
      </div>

      <footer className="absolute bottom-6 text-sm text-gray-500 dark:text-gray-400">
        &copy; {currentYear} - aStove
      </footer>
    </div>
  );
}
