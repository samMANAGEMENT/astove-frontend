import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    Shield,
    CircleDollarSign,
    Share,
    ShoppingCart,
    Workflow,
    Users,
    ChartScatter,
    Package,
    PlusCircle,
} from 'lucide-react';
import logo from '../assets/suitpress-logo.png';
import { useAuth } from '../contexts/AuthContext';

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: SidebarItem[];
}

interface SidebarProps {
    isExpanded: boolean;
    onToggle: () => void;
}

const getSidebarItems = (userRole?: string): SidebarItem[] => {
    const baseItems: SidebarItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: '/dashboard'
        }
    ];

    // Items para todos los roles
    const commonItems: SidebarItem[] = [
        {
            id: 'services',
            label: 'Servicios',
            icon: <Share className="w-5 h-5" />,
            href: '/servicios/registrar'
        },
        {
            id: 'productos',
            label: 'Productos',
            icon: <Package className="w-5 h-5" />,
            href: '/productos'
        },
        {
            id: 'ingresos-adicionales',
            label: 'Ingresos Adicionales',
            icon: <PlusCircle className="w-5 h-5" />,
            href: '/ingresos-adicionales'
        },
    ];

    // Items solo para admin y supervisor
    const adminItems: SidebarItem[] = [
        {
            id: 'shops',
            label: 'Pagos',
            icon: <CircleDollarSign className="w-5 h-5" />,
            href: '/pagos/registrar'
        },
        {
            id: 'reportes',
            label: 'Reportes',
            icon: <BarChart3 className="w-5 h-5" />,
            children: [
                {
                    id: 'analytics',
                    label: 'Analytics',
                    icon: <ChartScatter className="w-4 h-4" />,
                    href: '/reportes/analytics'
                }
            ]
        },
        {
            id: 'admin',
            label: 'Administración',
            icon: <Settings className="w-5 h-5" />,
            children: [
                {
                    id: 'lista-services',
                    label: 'Lista de Servicios',
                    icon: <ShoppingCart className="w-5 h-5" />,
                    href: '/servicios/lista'
                },
                {
                    id: 'lista-operadores',
                    label: 'Lista de Operadores',
                    icon: <Users className="w-4 h-4" />,
                    href: '/operadores/lista'
                },
                {
                    id: 'roles',
                    label: 'Roles y Permisos',
                    icon: <Shield className="w-4 h-4" />,
                    href: '/roles-permisos'
                },
                {
                    id: 'integrations',
                    label: 'Integraciones',
                    icon: <Workflow className="w-4 h-4" />,
                    href: '/usuarios/roles'
                }
            ]
        }
    ];

    // Si es admin o supervisor, mostrar todos los items
    if (userRole === 'admin' || userRole === 'supervisor') {
        return [...baseItems, ...commonItems, ...adminItems];
    }

    // Si es operador, mostrar solo items básicos
    return [...baseItems, ...commonItems];
};

const SidebarItem: React.FC<{
    item: SidebarItem;
    isExpanded: boolean;
    expandedItems: string[];
    onToggle: (id: string) => void;
    onNavigate: (href: string) => void;
    currentPath: string;
}> = ({ item, isExpanded, expandedItems, onToggle, onNavigate, currentPath }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemExpanded = expandedItems.includes(item.id);
    const isActive = item.href === currentPath;

    const handleClick = () => {
        if (hasChildren) {
            onToggle(item.id);
        } else if (item.href) {
            onNavigate(item.href);
        }
    };

    return (
        <div className="space-y-1">
            <div
                className={`
          flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-black
          ${isActive
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : hasChildren
                            ? 'hover:bg-blue-50 hover:text-blue-600'
                            : 'hover:bg-gray-100 hover:text-gray-700'
                    }
          ${isExpanded ? 'w-full' : 'w-12 justify-center'}
        `}
                onClick={handleClick}
            >
                <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-blue-600' : 'text-gray-600'}>{item.icon}</span>
                    {isExpanded && (
                        <span className="font-medium text-sm">{item.label}</span>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <span className="text-gray-400">
                        {isItemExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                )}
            </div>

            {hasChildren && isExpanded && isItemExpanded && (
                <div className="ml-6 space-y-1">
                    {item.children!.map((child) => {
                        const isChildActive = child.href === currentPath;
                        return (
                            <div
                                key={child.id}
                                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-black
                  ${isChildActive
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'hover:bg-gray-50 hover:text-gray-700'
                                    }
                `}
                                onClick={() => child.href && onNavigate(child.href)}
                            >
                                <span className={isChildActive ? 'text-blue-600' : 'text-gray-500'}>{child.icon}</span>
                                <span className="font-medium text-sm">{child.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleNavigate = (href: string) => {
        navigate(href);
    };

    const sidebarItems = getSidebarItems(user?.role?.nombre);

    return (
        <div className={`
      bg-white shadow-lg transition-all duration-300 ease-in-out
      ${isExpanded ? 'w-64' : 'w-20'}
    `}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {isExpanded && (
                    <img src={logo} alt="Logo Invarserapis" className='w-auto h-10 mx-auto' />
                )}
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-black"
                >
                    {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {sidebarItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        item={item}
                        isExpanded={isExpanded}
                        expandedItems={expandedItems}
                        onToggle={toggleItem}
                        onNavigate={handleNavigate}
                        currentPath={location.pathname}
                    />
                ))}
            </nav>
        </div>
    );
};

export default Sidebar; 