import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DashboardMain } from '../components/DashboardMain';
import { PacientesList } from '../components/PacientesList';
import { PacienteDetail } from '../components/PacienteDetail';

export const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'pacientes' | 'paciente-detalhe'>('dashboard');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);

  const handleSelectPaciente = (id: string) => {
    setSelectedPacienteId(id);
    setCurrentView('paciente-detalhe');
  };

  const handleNavigate = (view: 'dashboard' | 'pacientes') => {
    setCurrentView(view);
    setSelectedPacienteId(null);
  };


  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col md:flex-row">
      {/* Sidebar Fixo com logo Nutri HM */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto min-h-screen">
        {currentView === 'dashboard' && (
          <DashboardMain
            onSelectPaciente={handleSelectPaciente}
            onNavigateToPacientes={() => handleNavigate('pacientes')}
          />
        )}

        {currentView === 'pacientes' && (
          <PacientesList
            onSelectPaciente={handleSelectPaciente}
          />
        )}

        {currentView === 'paciente-detalhe' && selectedPacienteId && (
          <PacienteDetail
            pacienteId={selectedPacienteId}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>
    </div>
  );
};

