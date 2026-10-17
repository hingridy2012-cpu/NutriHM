import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DashboardMain } from '../components/DashboardMain';
import { PacientesList } from '../components/PacientesList';
import { PacienteDetail } from '../components/PacienteDetail';
import { PacienteForm } from '../components/PacienteForm';

export const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'pacientes' | 'paciente-detalhe' | 'paciente-novo'>('dashboard');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);

  const handleSelectPaciente = (id: string) => {
    setSelectedPacienteId(id);
    setCurrentView('paciente-detalhe');
  };

  const handleNavigate = (view: 'dashboard' | 'pacientes') => {
    setCurrentView(view);
    setSelectedPacienteId(null);
  };

  const handleNovoPaciente = () => {
    setSelectedPacienteId(null);
    setCurrentView('paciente-novo');
  };

  const handleSuccessNovoPaciente = (newPacienteId: string) => {
    setSelectedPacienteId(newPacienteId);
    setCurrentView('paciente-detalhe');
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col md:flex-row">
      {/* Sidebar Fixo com logo Nutri HM mantido */}
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
            onNovoPaciente={handleNovoPaciente}
          />
        )}

        {currentView === 'paciente-novo' && (
          <PacienteForm
            onSuccess={handleSuccessNovoPaciente}
            onCancel={() => setCurrentView('pacientes')}
          />
        )}

        {currentView === 'paciente-detalhe' && selectedPacienteId && (
          <PacienteDetail
            pacienteId={selectedPacienteId}
            onBack={() => setCurrentView('pacientes')}
          />
        )}
      </main>
    </div>
  );
};

