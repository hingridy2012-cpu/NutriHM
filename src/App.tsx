import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginCard } from './components/LoginCard';
import { RegisterCard } from './components/RegisterCard';
import { Dashboard } from './pages/Dashboard';
import { ShieldCheck, HeartPulse, Bookmark } from 'lucide-react';

export function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5efe6]">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-[#c9bba8] border-t-[#2b5870] rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-[#4a4036] font-serif-retro font-bold text-base tracking-wide">
          Carregando Nutri HM...
        </p>
      </div>
    );
  }

  // Se o usuário já está autenticado, renderiza o dashboard
  if (user) {
    return <Dashboard />;
  }

  // Tela de Autenticação (Login / Cadastro) com estética Retrô Editorial
  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden text-[#2c2523]">
      {/* Background Vintage Texture & Soft Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(#e3d7c7_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2a556f]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#c07a4a]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Side Presentation Info - Retro Editorial */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center pr-4 space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ede4d8] text-[#5c4a3b] font-serif-retro font-bold text-xs tracking-wider uppercase border border-[#d8cbba] w-fit shadow-xs">
            <Bookmark className="w-3.5 h-3.5 text-[#c07a4a]" />
            <span>Caderno & Gestão Clínica</span>
          </div>

          <h1 className="font-serif-retro text-4xl lg:text-5xl font-black text-[#1e1a17] leading-[1.18] tracking-tight">
            A arte e a ciência do atendimento <span className="italic font-normal text-[#2b5870] underline decoration-[#c07a4a]/60 underline-offset-8">nutricional</span>.
          </h1>

          <p className="text-[#594e44] text-base leading-relaxed font-normal">
            Preserve o cuidado individualizado de cada paciente com prontuários detalhados, acompanhamento antropométrico e planos alimentares em um ambiente acolhedor e clássico.
          </p>

          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#f4ece1]/80 border border-[#e1d5c5] shadow-xs">
              <div className="p-2.5 rounded-xl bg-[#2a556f] text-[#f7f2ea]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#2a241f] font-serif-retro">Segurança e Confidencialidade</span>
                <span className="text-xs text-[#706456]">Armazenamento seguro em nuvem com PostgreSQL Neon</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#f4ece1]/80 border border-[#e1d5c5] shadow-xs">
              <div className="p-2.5 rounded-xl bg-[#c07a4a] text-[#f7f2ea]">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#2a241f] font-serif-retro">Acompanhamento e Histórico de Consultas</span>
                <span className="text-xs text-[#706456]">Linha do tempo contínua de evolução clínica e retornos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="lg:col-span-6 flex justify-center">
          {authView === 'login' ? (
            <LoginCard onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterCard onSwitchToLogin={() => setAuthView('login')} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;


