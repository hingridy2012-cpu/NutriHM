import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

interface LoginCardProps {
  onSwitchToRegister: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch {
      setErrorMessage('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-9 bg-[#fbf9f5] rounded-3xl shadow-xl shadow-[#382b22]/5 border-2 border-[#e6dbcc] transition-all relative">
      {/* Decorative Vintage Stamp Corner */}
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#c07a4a]/20 border border-[#c07a4a]/40 flex items-center justify-center pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#c07a4a]" />
      </div>

      <div className="mb-8 text-center">
        <Logo size="lg" subtitle="Acesse o seu painel de atendimento" />
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-[#fdf2f0] border border-[#f3c5c1] text-[#9a342d] text-xs font-semibold flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-[#ba3930] shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#635548] mb-1.5 font-serif-retro">
            E-mail Profissional
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8e8071]">
              <Mail className="w-4 h-4 text-[#2b5870]" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemplo@nutricao.com"
              className="w-full pl-10 pr-4 py-3 bg-[#f5efe6] border border-[#dacdbd] rounded-2xl text-[#2c241e] placeholder-[#9f9181] focus:outline-none focus:ring-2 focus:ring-[#2b5870]/30 focus:border-[#2b5870] focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#635548] mb-1.5 font-serif-retro">
            Senha de Acesso
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8e8071]">
              <Lock className="w-4 h-4 text-[#2b5870]" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="•••••••••"
              className="w-full pl-10 pr-4 py-3 bg-[#f5efe6] border border-[#dacdbd] rounded-2xl text-[#2c241e] placeholder-[#9f9181] focus:outline-none focus:ring-2 focus:ring-[#2b5870]/30 focus:border-[#2b5870] focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-[#2a556f] hover:bg-[#204358] text-[#f7f2ea] font-serif-retro font-bold text-sm tracking-wide rounded-2xl shadow-md shadow-[#2a556f]/20 transition-all duration-200 flex items-center justify-center gap-2 border border-[#3e6f8d] disabled:opacity-70 cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando credenciais...</span>
            </>
          ) : (
            <>
              <span>Entrar no Consultório</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#ebdfd1] text-center">
        <p className="text-xs text-[#706456]">
          Novo no Nutri HM?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#c07a4a] hover:text-[#9e5d33] hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer font-serif-retro text-sm"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
};


