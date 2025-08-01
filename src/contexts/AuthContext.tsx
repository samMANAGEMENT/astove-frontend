import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

interface User {
  id: string;
  email: string;
  name: string;
  type: string;
  entity_id: string;
  role?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  operador?: {
    id: number;
    nombre: string;
    apellido: string;
    entidad_id: number;
    entidad?: {
      id: number;
      nombre: string;
    };
    cargo?: {
      id: number;
      nombre: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isPostLoginLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostLoginLoading, setIsPostLoginLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        
        // Configurar el token en axios para futuras peticiones
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (error) {
        console.error('Error al cargar datos de autenticación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await api.post('/login', {
        email,
        password
      });

      const { access_token, user: userData } = response.data;
      const newToken = access_token;

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.operador ? `${userData.operador.nombre} ${userData.operador.apellido}` : userData.email,
        type: userData.role?.nombre || '',
        entity_id: userData.operador?.entidad_id?.toString() || '',
        role: userData.role,
        operador: userData.operador
      };

      // Guardar en localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Actualizar estado
      setToken(newToken);
      setUser(user);

      // Configurar token en axios
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Activar loading post-login
      setIsPostLoginLoading(true);
      
      // Simular tiempo de carga para mostrar el spinner
      setTimeout(() => {
        setIsPostLoginLoading(false);
        // Redirigir al dashboard
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiar estado
    setToken(null);
    setUser(null);
    setIsPostLoginLoading(false);
    
    // Limpiar headers de axios
    delete api.defaults.headers.common['Authorization'];
    
    // Redirigir al login
    navigate('/');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isPostLoginLoading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 