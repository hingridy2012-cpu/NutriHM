import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

interface RegisterCardProps {
  onSwitchToLogin: () => void;
}

export const RegisterCard: React.FC<RegisterCardProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nome.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres para garantir sua segurança.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Verifique a confirmação de senha.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(nome.trim(), email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || 'Não foi possível realizar o cadastro. Tente novamente.');
      }
    } catch {
      setErrorMessage('Erro de conexão com o banco de dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-9 bg-white/95 rounded-3xl shadow-2xl shadow-emerald-950/5 border border-emerald-100/80 backdrop-blur-xl transition-all relative">
      {/* Subtle Futuristic Accent Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="mb-6 text-center relative z-10">
        <Logo size="lg" subtitle="Crie sua conta profissional no Nutri HM" />
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900/70 mb-1">
            Nome Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600/70">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Dra. Hingridy Marques"
              className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900/70 mb-1">
            E-mail Profissional
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600/70">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemplo@nutricao.com"
              className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900/70 mb-1">
            Senha <span className="text-[10px] text-emerald-600 font-semibold lowercase font-sans">(mínimo 9 caracteres)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600/70">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={9}
              placeholder="Pelo menos 9 caracteres"
              className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900/70 mb-1">
            Confirmar Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600/70">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={9}
              placeholder="Repita sua senha"
              className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registrando cadastro...</span>
            </>
          ) : (
            <>
              <span>Criar Conta</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-emerald-100/70 text-center relative z-10">
        <p className="text-xs text-slate-500">
          Já possui cadastro?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer text-sm"
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
};


