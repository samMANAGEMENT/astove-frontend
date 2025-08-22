import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Crown, Package, ShoppingBag, Scissors, Users, DollarSign } from 'lucide-react';

interface PremiumModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
}

const moduleInfo = {
  inventario: {
    name: 'Inventario Interno',
    description: 'Gestión completa de inventario interno con auditoría de movimientos',
    icon: Package,
    features: [
      'Control de stock en tiempo real',
      'Auditoría de movimientos',
      'Alertas de stock bajo',
      'Reportes detallados',
      'Gestión de proveedores'
    ],
    price: '$50,000'
  },
  productos: {
    name: 'Gestión de Productos',
    description: 'Venta y control de productos con cálculo de ganancias',
    icon: ShoppingBag,
    features: [
      'Catálogo de productos',
      'Cálculo automático de ganancias',
      'Control de inventario',
      'Reportes de ventas',
      'Gestión de precios'
    ],
    price: '$75,000'
  },
  servicios: {
    name: 'Gestión de Servicios',
    description: 'Administración de servicios y citas',
    icon: Scissors,
    features: [
      'Agenda de citas',
      'Gestión de servicios',
      'Control de empleados',
      'Reportes de servicios',
      'Calendario integrado'
    ],
    price: '$60,000'
  },
  empleados: {
    name: 'Gestión de Empleados',
    description: 'Control de empleados y comisiones',
    icon: Users,
    features: [
      'Gestión de empleados',
      'Control de comisiones',
      'Horarios de trabajo',
      'Reportes de rendimiento',
      'Gestión de permisos'
    ],
    price: '$45,000'
  },
  gastos: {
    name: 'Control de Gastos',
    description: 'Registro y seguimiento de gastos empresariales',
    icon: DollarSign,
    features: [
      'Registro de gastos',
      'Categorización automática',
      'Reportes financieros',
      'Control de presupuesto',
      'Análisis de costos'
    ],
    price: '$35,000'
  }
};

const PremiumModuleModal: React.FC<PremiumModuleModalProps> = ({
  isOpen,
  onClose,
  moduleName
}) => {
  const module = moduleInfo[moduleName as keyof typeof moduleInfo];
  const IconComponent = module?.icon || Package;

  if (!module) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Módulo Premium">
      <div className="space-y-6">
        {/* Header con icono y título */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{module.name}</h2>
          <p className="text-gray-600">{module.description}</p>
        </div>

        {/* Precio */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Módulo Premium</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{module.price}</div>
          <p className="text-sm text-gray-600 mt-1">Pago único</p>
        </div>

        {/* Características */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Características incluidas:</h3>
          <ul className="space-y-2">
            {module.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Beneficios */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">¿Por qué elegir este módulo?</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Acceso completo a todas las funcionalidades</li>
            <li>• Soporte técnico prioritario</li>
            <li>• Actualizaciones automáticas</li>
            <li>• Integración con otros módulos</li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cerrar
          </Button>
          <Button
            onClick={() => {
              // Aquí se podría integrar con un sistema de pagos
              window.open('mailto:contacto@astove.com?subject=Solicitud de módulo premium', '_blank');
            }}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
          >
            Solicitar Acceso
          </Button>
        </div>

        {/* Información adicional */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>¿Necesitas más información? Contacta con nuestro equipo de ventas</p>
          <p className="font-medium">contacto@astove.com</p>
        </div>
      </div>
    </Modal>
  );
};

export default PremiumModuleModal;
