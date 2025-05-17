import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import axios from "../../lib/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SignInCredentials {
  email: string;
  password: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [credentials, setCredentials] = useState<SignInCredentials>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const iniciarSesion = async (): Promise<void> => {
    try {
      const response = await axios.post("/login", credentials);
      const token = response.data.token;
      const user = response.data.user;
      const email = response.data.email;

      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      localStorage.setItem("email", email);

      navigate("/");
      toast.success("Inicio de sesión exitoso");
    } catch (error) {
      toast.error("Ocurrió un error");
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <ToastContainer />
      <div className="w-full max-w-md pt-10 mx-auto" />
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¡Ingresa tu correo electrónico y contraseña para iniciar sesión!
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-6">
              <div>
                <Label>
                  Correo Electrónico <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="info@gmail.com"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Mantenerme conectado
                  </span>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-emerald-600 hover:text-brand-600 dark:text-brand-400"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div>
                <Button onClick={iniciarSesion} className="w-full" size="sm">
                  Iniciar sesión
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/signup"
                className="text-emerald-600 hover:text-brand-600 dark:text-brand-400"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
