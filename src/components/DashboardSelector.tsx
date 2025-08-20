import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardPage from '../pages/DashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import OperadorDashboardPage from '../pages/OperadorDashboardPage';

const DashboardSelector: React.FC = () => {
  const { user } = useAuth();

  // Si el usuario es admin, mostrar dashboard de administrador
  if (user?.role?.nombre === 'admin') {
    return <AdminDashboardPage />;
  }

  // Si el usuario es supervisor, mostrar dashboard completo (filtrado por entidad)
  if (user?.role?.nombre === 'supervisor') {
    return <DashboardPage />;
  }

  // Si es operador, mostrar dashboard específico
  if (user?.role?.nombre === 'operador') {
    return <OperadorDashboardPage />;
  }

  // Por defecto, mostrar dashboard de operador
  return <OperadorDashboardPage />;
};

export default DashboardSelector; 