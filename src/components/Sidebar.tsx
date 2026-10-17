import React from 'react';
import { Logo } from './Logo';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: 'dashboard' | 'pacientes' | 'paciente-detalhe' | 'paciente-novo';
  onNavigate: (view: 'dashboard' | 'pacientes') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-emerald-100 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-30 select-none">
      {/* Top Section / Logo */}
      <div className="p-6">
        <div className="flex items-center justify-start pb-6 border-b border-emerald-100/80">
          <Logo size="sm" />
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 translate-x-1'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('pacientes')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer ${
              currentView === 'pacientes' || currentView === 'paciente-detalhe' || currentView === 'paciente-novo'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 translate-x-1'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pacientes</span>
          </button>
        </nav>
      </div>

      {/* Bottom User Info & Logout */}
      <div className="p-4 m-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shadow-sm text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'N'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 truncate" title={user?.name}>
              {user?.name || 'Nutricionista'}
            </h4>
            <p className="text-[10.5px] text-slate-500 truncate font-sans" title={user?.email}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all border border-emerald-200/60 hover:border-rose-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
};

