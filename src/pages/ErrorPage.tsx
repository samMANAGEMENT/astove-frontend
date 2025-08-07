import React, { useEffect } from "react";
import { Ghost } from "lucide-react";
import { Button } from "../components/ui";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const ErrorPage: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAuth();

    useEffect(() => {
        toast.error('¡La página que intentas visitar no existe!');
    },[]);

    return(
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
            <Ghost className="w-16 h-16 text-red-500 mb-2" />
            <h1 className="text-4xl font-bold mb-2 text-gray-800">¡404!</h1>
            <p className="text-lg text-gray-600 mb-5">Ups..La página que intentas buscar no existe.</p>
            <Button onClick={() => navigate(isAuthenticated ? '/dashboard' : "/")}>
                Volver al inicio
            </Button>
        </div>
    );
};


export default ErrorPage;
