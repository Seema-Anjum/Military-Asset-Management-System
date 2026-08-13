import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logoutUser } = useAuth();

  return (
    <header className="bg-slate-900 text-white h-16 px-6 flex items-center justify-between shadow-md border-b border-slate-800">
      <div className="flex items-center space-x-3">
        <Shield className="w-7 h-7 text-emerald-500" />
        <span className="font-bold text-lg tracking-wider text-slate-100">
          MAMS <span className="text-xs font-normal text-slate-400">v1.0</span>
        </span>
      </div>

      {user && (
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-sm bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">
            <User className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-200">{user.username}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              {user.role}
            </span>
          </div>

          <button
            onClick={logoutUser}
            className="flex items-center space-x-1.5 text-sm text-slate-400 hover:text-red-400 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};