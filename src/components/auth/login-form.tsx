import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const navigate = useNavigate()

  const API_URL = import.meta.env.VITE_API_URL

  const ingresar = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password })

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        navigate("/home")
      } else {
        setErrors({ general: "No se recibió un token en la respuesta del servidor." })
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          const validationErrors = error.response.data.errors || {}
          setErrors({
            email: validationErrors.email?.[0] || "",
            password: validationErrors.password?.[0] || "",
            general: error.response.data.message || ""
          })
        } else {
          setErrors({ general: "Error al conectar con el servidor." })
        }
      } else {
        setErrors({ general: "Ocurrió un error inesperado." })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-bold">¡Ingresa a tu cuenta ahora mismo!</h1>
      </div>

      {/* Mensaje de error general */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Campo de Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-red-500" : ""}
          />
        </div>

        {/* Campo de Contraseña */}
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              ¿Olvidaste la contraseña?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? "border-red-500" : ""}
          />
        </div>

        {/* Botón de Ingresar */}
        <Button
          type="submit"
          onClick={ingresar}
          className="w-full"
          disabled={loading}
        >
          {loading ? "Procesando..." : "Ingresar"}
        </Button>
      </div>
      <div className="text-center text-sm">
        ¿Aún no tienes cuenta?{" "}
        <a href="#" className="underline underline-offset-4">
          Ingresa ahora
        </a>
      </div>
    </form>
  )
}