import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Box,
    Monitor,
    BadgeCheck,
    LifeBuoy,
    FileText,
    Settings,
    Puzzle,
    X,
    LogOut,
    Clock,
    MessageCircle,
    Bot
} from "lucide-react";
import classNames from "classnames";
import { useAuth } from "../../auth/context/AuthProvider";
import { useNavigate } from "react-router-dom";
import RoleBasedAccess from "../RoleBasedAccess";

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Employees', path: '/employees', icon: <Users size={18} />, roles: ['admin', 'manager'] },
    { name: 'Assets', path: '/assets', icon: <Box size={18} /> },
    { name: 'Software', path: '/software', icon: <Monitor size={18} /> },
    { name: 'Licenses', path: '/licenses', icon: <BadgeCheck size={18} /> },
    { name: 'Tickets', path: '/tickets', icon: <LifeBuoy size={18} /> },
    { name: 'Wellness AI', path: '/chat', icon: <Bot size={18} /> },
    { name: 'BioMetrics', path: '/biometrics', icon: <Clock size={18} />, roles: ['admin', 'manager'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: <FileText size={18} />, roles: ['admin'] },
    { name: 'Integrations', path: '/integrations', icon: <Puzzle size={18} />, roles: ['admin'] }
];

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            <div
                className={classNames(
                "fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden transition-opacity",
            { hidden: !isOpen }
                )}
                onClick={onClose}
            />

            <aside className={classNames(
                "fixed top-0 left-0 z-40 md:static w-64 bg-white shadow-md h-full p-4 transition-transform transform",
                {
                    "-translate-x-full": !isOpen,
                    "translate-x-0": isOpen,
                    "md:translate-x-0": true
                }
            )}
            >
                
                <div className="md:hidden flex justify-end mb-4">
                    <button onClick={onClose}>
                        <X className="h-6 w-6 text-gray-600" />
                    </button>
                </div>
                
                <div className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">
                    Main Menu
                </div>
                
                <nav>
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <RoleBasedAccess 
                                key={item.name}
                                allowedRoles={item.roles || []}
                                fallback={null}
                            >
                                <li>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => 
                                            `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        {item.icon}
                                        {item.name}
                                    </NavLink>
                                </li>
                            </RoleBasedAccess>
                        ))}
                    </ul>
                </nav>

                <div className="border-t my-4"></div>
                <nav>
                    <ul className="space-y-1">
                        <li>
                            <NavLink
                                to="/settings"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                                    ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`
                                }>
                                <Settings size={18} />
                                Settings
                            </NavLink>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
