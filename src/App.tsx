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

  // Tela de Autenticação (Login / Cadastro) com estética Verde + Branco Futurista Clean
  return (
    <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden text-slate-900">
      {/* Background Bio-Tech Grid & Futuristic Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.07] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Side Presentation Info - Clean Health Tech */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center pr-4 space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs tracking-wider uppercase border border-emerald-200/80 w-fit shadow-xs">
            <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistema Clínico Inteligente</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.18] tracking-tight">
            A nova geração do atendimento <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 underline decoration-emerald-300 underline-offset-8">nutricional</span>.
          </h1>

          <p className="text-slate-600 text-base leading-relaxed font-normal">
            Potencialize o acompanhamento de cada paciente com prontuários detalhados, monitoramento antropométrico em tempo real e planos alimentares precisos.
          </p>

          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 border border-emerald-100/90 shadow-sm shadow-emerald-950/5 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">Segurança & Confiabilidade</span>
                <span className="text-xs text-slate-500">Banco de dados em nuvem criptografado com Neon Serverless</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 border border-emerald-100/90 shadow-sm shadow-emerald-950/5 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">Histórico Clínico Contínuo</span>
                <span className="text-xs text-slate-500">Evolução antropométrica, metas e gestão de retornos</span>
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


