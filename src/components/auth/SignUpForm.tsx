import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import axios from "../../lib/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SignUpCredentials {
  fname: string;
  lname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [credentials, setCredentials] = useState<SignUpCredentials>({
    fname: "",
    lname: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const registrarse = async (): Promise<void> => {
    if (credentials.password !== credentials.passwordConfirmation) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const { fname, lname, email, password, passwordConfirmation } = credentials;
      const name = `${fname} ${lname}`;

      const response = await axios.post("/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation, // 👈 Aquí está el cambio clave
      });

      const token = response.data.token;
      const user = response.data.user.name;
      const userEmail = response.data.user.email;

      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      localStorage.setItem("email", userEmail);

      navigate("/");
      toast.success("Registro exitoso");
    } catch (error) {
      toast.error("Ocurrió un error");
      console.error("Error al registrarse:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Registrarse
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¡Ingresa tu correo electrónico y contraseña para registrarte!
            </p>
          </div>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                registrarse();
              }}
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      Nombre<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Ingresa tu nombre"
                      value={credentials.fname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Apellido<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      placeholder="Ingresa tu apellido"
                      value={credentials.lname}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <Label>
                    Correo electrónico<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={credentials.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>
                    Contraseña<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Ingresa tu contraseña"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
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
                <div>
                  <Label>
                    Repite tu contraseña<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Ingresa tu contraseña"
                      type={showPassword ? "text" : "password"}
                      name="passwordConfirmation"
                      value={credentials.passwordConfirmation}
                      onChange={handleChange}
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
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    Al crear una cuenta, aceptas los{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Términos y Condiciones,
                    </span>{" "}
                    y nuestra{" "}
                    <span className="text-gray-800 dark:text-white">
                      Política de Privacidad
                    </span>
                  </p>
                </div>
                <div>
                  <button
                    type="submit"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-emerald-600 shadow-theme-xs hover:bg-brand-600"
                  >
                    Registrarse
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  to="/signin"
                  className="text-emerald-600 hover:text-brand-600 dark:text-brand-400"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
