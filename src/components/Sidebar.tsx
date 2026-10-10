import React from 'react';
import { Logo } from './Logo';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: 'dashboard' | 'pacientes' | 'paciente-detalhe';
  onNavigate: (view: 'dashboard' | 'pacientes') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-[#fcfaf7] border-r-2 border-[#e6dbcc] flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-30 select-none">
      {/* Top Section / Logo */}
      <div className="p-6">
        <div className="flex items-center justify-start pb-6 border-b border-[#ebdcd0]">
          <Logo size="sm" />
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-serif-retro font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-[#2a556f] text-[#fbf9f5] shadow-md shadow-[#2a556f]/20 border border-[#3e6f8d] translate-x-1'
                : 'text-[#615447] hover:text-[#2a556f] hover:bg-[#f2e9dc]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('pacientes')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-serif-retro font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer ${
              currentView === 'pacientes' || currentView === 'paciente-detalhe'
                ? 'bg-[#2a556f] text-[#fbf9f5] shadow-md shadow-[#2a556f]/20 border border-[#3e6f8d] translate-x-1'
                : 'text-[#615447] hover:text-[#2a556f] hover:bg-[#f2e9dc]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pacientes</span>
          </button>
        </nav>
      </div>

      {/* Bottom User Info & Logout */}
      <div className="p-4 m-4 rounded-2xl bg-[#f4ece1] border border-[#e1d5c5]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#c07a4a] text-[#fbf9f5] font-serif-retro font-black flex items-center justify-center shadow-xs text-sm border border-[#a86538]">
            {user?.name?.charAt(0).toUpperCase() || 'N'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#27211d] truncate font-serif-retro" title={user?.name}>
              {user?.name || 'Nutricionista'}
            </h4>
            <p className="text-[10.5px] text-[#706456] truncate font-sans" title={user?.email}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-[#6d6052] hover:text-[#ba3930] hover:bg-[#fbe9e7] transition-all border border-[#d9cbb8] hover:border-[#f3c5c1] cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
};

