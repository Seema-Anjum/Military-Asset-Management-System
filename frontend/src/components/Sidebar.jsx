import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ArrowRightLeft, ShoppingBag, Users, ShieldAlert, Flame, UserCog } from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']
    },
    {
      title: 'Purchases',
      path: '/purchases',
      icon: ShoppingBag,
      roles: ['ADMIN', 'LOGISTICS_OFFICER']
    },
    {
      title: 'Transfers',
      path: '/transfers',
      icon: ArrowRightLeft,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']
    },
    {
      title: 'Assignments',
      path: '/assignments',
      icon: Users,
      roles: ['ADMIN', 'BASE_COMMANDER']
    },
    {
      title: 'Expenditures',
      path: '/expenditures',
      icon: Flame,
      roles: ['ADMIN', 'BASE_COMMANDER']
    },
    {
      title: 'User Management',
      path: '/users',
      icon: UserCog,
      roles: ['ADMIN']
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 border-r border-slate-800">
      <div className="mb-6 px-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Navigation</p>
      </div>
      <nav className="space-y-1">
        {navItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
};