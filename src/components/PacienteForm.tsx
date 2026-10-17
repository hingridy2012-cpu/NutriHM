import React, { useState } from 'react';
import { sql } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Activity, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';

interface PacienteFormProps {
  onSuccess: (newPacienteId: string) => void;
  onCancel: () => void;
}

export const PacienteForm: React.FC<PacienteFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Aba 1 — Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Aba 2 — Clínico
  const [pesoAtual, setPesoAtual] = useState<string>('');
  const [alturaCm, setAlturaCm] = useState<string>('');
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([]);
  const [objetivoTexto, setObjetivoTexto] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');

  const [patologiasSelecionadas, setPatologiasSelecionadas] = useState<string[]>([]);
  const [patologiaLivre, setPatologiaLivre] = useState('');
  
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<string[]>([]);
  const [restricaoLivre, setRestricaoLivre] = useState('');

  const [alergiasSelecionadas, setAlergiasSelecionadas] = useState<string[]>([]);
  const [alergiaLivre, setAlergiaLivre] = useState('');

  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // Aba 3 — Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('');
  const [horarioAcorda, setHorarioAcorda] = useState('');
  const [horarioDorme, setHorarioDorme] = useState('');
  const [quantidadeAgua, setQuantidadeAgua] = useState<string>('');
  const [praticaAtividade, setPraticaAtividade] = useState<boolean | null>(null);
  const [atividadeDescricao, setAtividadeDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Cálculo de Idade
  const calcularIdade = (dataStr: string): number | null => {
    if (!dataStr) return null;
    const birth = new Date(dataStr);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const idadeCalculada = calcularIdade(dataNascimento);

  // Formatação de Telefone / WhatsApp
  const formatarTelefone = (valor: string): string => {
    const limpo = valor.replace(/\D/g, '');
    if (!limpo) return '';
    if (limpo.length <= 10) {
      // (XX) XXXX-XXXX
      return limpo.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    // (XX) XXXXX-XXXX
    return limpo.slice(0, 11).replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  // Conversão inteligente de Horário (ex: 6 -> 06:00, 630 -> 06:30, 23 -> 23:00)
  const formatarHorario = (input: string): string => {
    const limpo = input.replace(/\D/g, '');
    if (!limpo) return '';
    if (limpo.length === 1 || limpo.length === 2) {
      let h = parseInt(limpo, 10);
      if (h > 23) h = 23;
      return `${String(h).padStart(2, '0')}:00`;
    }
    if (limpo.length === 3) {
      let h = parseInt(limpo.slice(0, 1), 10);
      let m = parseInt(limpo.slice(1), 10);
      if (m > 59) m = 59;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    if (limpo.length >= 4) {
      let h = parseInt(limpo.slice(0, 2), 10);
      let m = parseInt(limpo.slice(2, 4), 10);
      if (h > 23) h = 23;
      if (m > 59) m = 59;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return input;
  };

  // Cálculo de IMC (altura em cm -> m)
  const calcularIMC = (): { valor: number; classificacao: string } | null => {
    const p = parseFloat(pesoAtual.replace(',', '.'));
    const a = parseFloat(alturaCm.replace(',', '.'));
    if (!p || !a || a <= 0 || p <= 0) return null;
    const alturaMetros = a > 3 ? a / 100 : a; // Se digitou cm (ex 170) converte pra 1.70
    const imc = p / (alturaMetros * alturaMetros);
    let classificacao = 'Normal';
    if (imc < 18.5) classificacao = 'Abaixo do peso';
    else if (imc < 25) classificacao = 'Peso adequado';
    else if (imc < 30) classificacao = 'Sobrepeso';
    else if (imc < 35) classificacao = 'Obesidade Grau I';
    else if (imc < 40) classificacao = 'Obesidade Grau II';
    else classificacao = 'Obesidade Grau III';

    return { valor: parseFloat(imc.toFixed(1)), classificacao };
  };

  const imcCalculado = calcularIMC();

  // Opções de Múltipla Escolha
  const OPCOES_OBJETIVOS = [
    'Emagrecer',
    'Ganhar massa',
    'Controlar diabetes',
    'Saúde geral',
    'Performance esportiva',
    'Reeducação alimentar'
  ];

  const NIVEIS_ATIVIDADE = [
    'Sedentário',
    'Levemente ativo',
    'Moderadamente ativo',
    'Muito ativo',
    'Extremamente ativo'
  ];

  const OPCOES_PATOLOGIAS = [
    'Diabetes',
    'Hipertensão',
    'Hipotireoidismo',
    'Hipertireoidismo',
    'Síndrome do ovário policístico',
    'Doença celíaca',
    'Colesterol alto'
  ];

  const OPCOES_RESTRICOES = [
    'Lactose',
    'Glúten',
    'Açúcar',
    'Carne vermelha',
    'Frutos do mar'
  ];

  const OPCOES_ALERGIAS = [
    'Amendoim',
    'Leite',
    'Ovo',
    'Soja',
    'Trigo',
    'Frutos do mar'
  ];

  const toggleItemLista = (
    lista: string[],
    setLista: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (item === 'Nenhum') {
      if (lista.includes('Nenhum')) {
        setLista([]);
      } else {
        setLista(['Nenhum']);
      }
      return;
    }

    const semNenhum = lista.filter((i) => i !== 'Nenhum');
    if (semNenhum.includes(item)) {
      setLista(semNenhum.filter((i) => i !== item));
    } else {
      setLista([...semNenhum, item]);
    }
  };

  const adicionarItemLivre = (
    item: string,
    setItem: React.Dispatch<React.SetStateAction<string>>,
    lista: string[],
    setLista: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const texto = item.trim();
    if (!texto) return;
    const semNenhum = lista.filter((i) => i !== 'Nenhum');
    if (!semNenhum.includes(texto)) {
      setLista([...semNenhum, texto]);
    }
    setItem('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user) {
      setErrorMessage('Você precisa estar logado para cadastrar um paciente.');
      return;
    }

    if (!nome.trim()) {
      setActiveTab('pessoal');
      setErrorMessage('O campo Nome Completo é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const pesoNum = pesoAtual ? parseFloat(pesoAtual.replace(',', '.')) : null;
      let alturaNum = alturaCm ? parseFloat(alturaCm.replace(',', '.')) : null;
      // Converter para metros se foi inserido em cm
      if (alturaNum && alturaNum > 3) {
        alturaNum = parseFloat((alturaNum / 100).toFixed(2));
      }

      const aguaNum = quantidadeAgua ? parseFloat(quantidadeAgua.replace(',', '.')) : null;
      const refeicoesNum = refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null;

      const dataNascVal = dataNascimento ? dataNascimento : null;

      const inserted = await sql`
        INSERT INTO public.pacientes (
          nutricionista_id,
          nome,
          data_nascimento,
          sexo,
          whatsapp,
          email,
          peso_inicial,
          altura,
          objetivos,
          objetivo_texto,
          nivel_atividade,
          patologias,
          restricoes_alimentares,
          alergias,
          medicamentos,
          suplementos,
          refeicoes_por_dia,
          horario_acorda,
          horario_dorme,
          litros_agua,
          atividade_fisica,
          atividade_fisica_descricao,
          observacoes
        )
        VALUES (
          ${user.id}::uuid,
          ${nome.trim()},
          ${dataNascVal},
          ${sexo || null},
          ${whatsapp || telefone || null},
          ${email.trim().toLowerCase() || null},
          ${pesoNum},
          ${alturaNum},
          ${objetivosSelecionados},
          ${objetivoTexto || null},
          ${nivelAtividade || null},
          ${patologiasSelecionadas},
          ${restricoesSelecionadas},
          ${alergiasSelecionadas},
          ${medicamentos || null},
          ${suplementos || null},
          ${refeicoesNum},
          ${horarioAcorda || null},
          ${horarioDorme || null},
          ${aguaNum},
          ${praticaAtividade},
          ${atividadeDescricao || null},
          ${observacoes || null}
        )
        RETURNING id, nome;
      `;

      if (inserted && inserted.length > 0) {
        setSuccessMessage('Paciente cadastrado com sucesso!');
        setTimeout(() => {
          onSuccess(inserted[0].id);
        }, 600);
      } else {
        setErrorMessage('Não foi possível salvar os dados do paciente.');
      }
    } catch (err: any) {
      console.error('Erro ao cadastrar paciente:', err);
      setErrorMessage(err.message || 'Erro ao registrar paciente no banco Neon.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 rounded-2xl bg-white border border-emerald-100 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 shadow-xs transition-all cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Novo Paciente</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Preencha as informações clínicas e hábitos para criar o novo prontuário
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 bg-emerald-50/60 p-1.5 rounded-2xl border border-emerald-100 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('pessoal')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pessoal'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-white/80'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>1. Pessoal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clinico')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'clinico'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-white/80'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>2. Clínico</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('habitos')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'habitos'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-white/80'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>3. Hábitos</span>
        </button>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* ABA 1 — PESSOAL */}
        {activeTab === 'pessoal' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-emerald-100/70">
              <h3 className="text-base font-bold text-slate-900">Informações Pessoais</h3>
              <p className="text-xs text-slate-500">Dados cadastrais básicos para identificação e contato</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nome Completo (Obrigatório) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nome Completo <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="ex: Maria Silva Oliveira"
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                {idadeCalculada !== null && (
                  <p className="text-xs font-bold text-emerald-700 mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Idade calculada: {idadeCalculada} {idadeCalculada === 1 ? 'ano' : 'anos'}
                  </p>
                )}
              </div>

              {/* Sexo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Sexo
                </label>
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value="">Selecione o sexo...</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                  placeholder="(00) 0000-0000"
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatarTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@exemplo.com"
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('clinico')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Próximo: Dados Clínicos →
              </button>
            </div>
          </div>
        )}

        {/* ABA 2 — CLÍNICO */}
        {activeTab === 'clinico' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-emerald-100/70">
              <h3 className="text-base font-bold text-slate-900">Avaliação Clínica & Antropometria</h3>
              <p className="text-xs text-slate-500">Medidas corpóreas, objetivos, histórico patológico e alergias</p>
            </div>

            {/* Medidas Iniciais e IMC */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Peso Atual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={pesoAtual}
                    onChange={(e) => setPesoAtual(e.target.value)}
                    placeholder="ex: 68.5"
                    className="w-full pl-4 pr-12 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 pointer-events-none">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Altura
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={alturaCm}
                    onChange={(e) => setAlturaCm(e.target.value)}
                    placeholder="ex: 172"
                    className="w-full pl-4 pr-12 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 pointer-events-none">
                    cm
                  </span>
                </div>
              </div>

              {/* IMC Calculado */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  IMC (Calculado)
                </label>
                <div className="px-4 py-2 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl h-[42px] flex items-center justify-between">
                  <span className="text-base font-black text-emerald-800">
                    {imcCalculado ? imcCalculado.valor : '--'}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-200/60 text-emerald-800">
                    {imcCalculado ? imcCalculado.classificacao : 'Aguardando medidas'}
                  </span>
                </div>
              </div>
            </div>

            {/* Objetivos */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Objetivo do Paciente (Múltipla Escolha)
              </label>
              <div className="flex flex-wrap gap-2">
                {OPCOES_OBJETIVOS.map((obj) => {
                  const isChecked = objetivosSelecionados.includes(obj);
                  return (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => toggleItemLista(objetivosSelecionados, setObjetivosSelecionados, obj)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                          : 'bg-emerald-50/40 text-slate-600 border-emerald-100 hover:border-emerald-300'
                      }`}
                    >
                      {obj}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={objetivoTexto}
                onChange={(e) => setObjetivoTexto(e.target.value)}
                placeholder="Objetivo detalhado adicional (opcional)..."
                className="w-full px-4 py-2 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Nível de Atividade Física */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Nível de Atividade Física
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {NIVEIS_ATIVIDADE.map((nivel) => (
                  <button
                    key={nivel}
                    type="button"
                    onClick={() => setNivelAtividade(nivel)}
                    className={`p-2.5 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      nivelAtividade === nivel
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50/30 text-slate-600 border-emerald-100 hover:border-emerald-300'
                    }`}
                  >
                    {nivel}
                  </button>
                ))}
              </div>
            </div>

            {/* Patologias ou Condições de Saúde */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Patologias ou Condições de Saúde
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleItemLista(patologiasSelecionadas, setPatologiasSelecionadas, 'Nenhum')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    patologiasSelecionadas.includes('Nenhum')
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-emerald-50/40 text-slate-600 border-emerald-100 hover:border-emerald-300'
                  }`}
                >
                  Nenhum
                </button>
                {OPCOES_PATOLOGIAS.map((pat) => {
                  const isChecked = patologiasSelecionadas.includes(pat);
                  return (
                    <button
                      key={pat}
                      type="button"
                      onClick={() => toggleItemLista(patologiasSelecionadas, setPatologiasSelecionadas, pat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                          : 'bg-emerald-50/40 text-slate-600 border-emerald-100 hover:border-emerald-300'
                      }`}
                    >
                      {pat}
                    </button>
                  );
                })}
              </div>

              {/* Tags customizadas adicionadas */}
              {patologiasSelecionadas.filter(p => !OPCOES_PATOLOGIAS.includes(p) && p !== 'Nenhum').length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {patologiasSelecionadas.filter(p => !OPCOES_PATOLOGIAS.includes(p) && p !== 'Nenhum').map((custom) => (
                    <span key={custom} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {custom}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-rose-600" 
                        onClick={() => setPatologiasSelecionadas(patologiasSelecionadas.filter(p => p !== custom))}
                      />
                    </span>
                  ))}
                </div>
              )}

              {/* Campo para adicionar livremente */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={patologiaLivre}
                  onChange={(e) => setPatologiaLivre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      adicionarItemLivre(patologiaLivre, setPatologiaLivre, patologiasSelecionadas, setPatologiasSelecionadas);
                    }
                  }}
                  placeholder="Adicionar outra patologia..."
                  className="flex-1 px-4 py-2 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => adicionarItemLivre(patologiaLivre, setPatologiaLivre, patologiasSelecionadas, setPatologiasSelecionadas)}
                  className="px-3.5 py-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Restrições Alimentares */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Restrições Alimentares
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleItemLista(restricoesSelecionadas, setRestricoesSelecionadas, 'Nenhum')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    restricoesSelecionadas.includes('Nenhum')
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-emerald-50/40 text-slate-600 border-emerald-100 hover:border-emerald-300'
                  }`}
                >
                  Nenhum
                </button>
                {OPCOES_RESTRICOES.map((res) => {
                  const isChecked = restricoesSelecionadas.includes(res);
                  return (
                    <button
                      key={res}
                      type="button"
                      onClick={() => toggleItemLista(restricoesSelecionadas, setRestricoesSelecionadas, res)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                          : 'bg-emerald-50/40 text-slate-600 border-emerald-100 hover:border-emerald-300'
                      }`}
                    >
                      {res}
                    </button>
                  );
                })}
              </div>

              {/* Tags customizadas */}
              {restricoesSelecionadas.filter(r => !OPCOES_RESTRICOES.includes(r) && r !== 'Nenhum').length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {restricoesSelecionadas.filter(r => !OPCOES_RESTRICOES.includes(r) && r !== 'Nenhum').map((custom) => (
                    <span key={custom} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {custom}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-rose-600" 
                        onClick={() => setRestricoesSelecionadas(restricoesSelecionadas.filter(r => r !== custom))}
                      />
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={restricaoLivre}
                  onChange={(e) => setRestricaoLivre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      adicionarItemLivre(restricaoLivre, setRestricaoLivre, restricoesSelecionadas, setRestricoesSelecionadas);
                    }
                  }}
                  placeholder="Adicionar outra restrição..."
                  className="flex-1 px-4 py-2 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => adicionarItemLivre(restricaoLivre, setRestricaoLivre, restricoesSelecionadas, setRestricoesSelecionadas)}
                  className="px-3.5 py-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Alergias Alimentares */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Alergias Alimentares
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleItemLista(alergiasSelecionadas, setAlergiasSelecionadas, 'Nenhum')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    alergiasSelecionadas.includes('Nenhum')
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-emerald-50/40 text-slate-600 border-emerald-100 hover:border-emerald-300'
                  }`}
                >
                  Nenhum
                </button>
                {OPCOES_ALERGIAS.map((ale) => {
                  const isChecked = alergiasSelecionadas.includes(ale);
                  return (
                    <button
                      key={ale}
                      type="button"
                      onClick={() => toggleItemLista(alergiasSelecionadas, setAlergiasSelecionadas, ale)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                          : 'bg-emerald-50/40 text-slate-600 border-emerald-100 hover:border-emerald-300'
                      }`}
                    >
                      {ale}
                    </button>
                  );
                })}
              </div>

              {/* Tags customizadas */}
              {alergiasSelecionadas.filter(a => !OPCOES_ALERGIAS.includes(a) && a !== 'Nenhum').length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {alergiasSelecionadas.filter(a => !OPCOES_ALERGIAS.includes(a) && a !== 'Nenhum').map((custom) => (
                    <span key={custom} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {custom}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-rose-600" 
                        onClick={() => setAlergiasSelecionadas(alergiasSelecionadas.filter(a => a !== custom))}
                      />
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={alergiaLivre}
                  onChange={(e) => setAlergiaLivre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      adicionarItemLivre(alergiaLivre, setAlergiaLivre, alergiasSelecionadas, setAlergiasSelecionadas);
                    }
                  }}
                  placeholder="Adicionar outra alergia..."
                  className="flex-1 px-4 py-2 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => adicionarItemLivre(alergiaLivre, setAlergiaLivre, alergiasSelecionadas, setAlergiasSelecionadas)}
                  className="px-3.5 py-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Medicamentos e Suplementos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Medicamentos Contínuos
                </label>
                <textarea
                  rows={2}
                  value={medicamentos}
                  onChange={(e) => setMedicamentos(e.target.value)}
                  placeholder="ex: Losartana 50mg pela manhã..."
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Suplementos em Uso
                </label>
                <textarea
                  rows={2}
                  value={suplementos}
                  onChange={(e) => setSuplementos(e.target.value)}
                  placeholder="ex: Creatina 5g, Vitamina D 2000UI..."
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('pessoal')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                ← Voltar para Pessoal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('habitos')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Próximo: Hábitos Diários →
              </button>
            </div>
          </div>
        )}

        {/* ABA 3 — HÁBITOS */}
        {activeTab === 'habitos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-emerald-100/70">
              <h3 className="text-base font-bold text-slate-900">Rotina e Hábitos Diários</h3>
              <p className="text-xs text-slate-500">Horários de sono, refeições, hidratação e atividades físicas</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Refeições por Dia */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Refeições por dia
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={refeicoesPorDia}
                  onChange={(e) => setRefeicoesPorDia(e.target.value)}
                  placeholder="ex: 4"
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Horário que Acorda */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Horário que Acorda
                </label>
                <input
                  type="text"
                  value={horarioAcorda}
                  onChange={(e) => setHorarioAcorda(e.target.value)}
                  onBlur={(e) => setHorarioAcorda(formatarHorario(e.target.value))}
                  placeholder="ex: 6 ou 06:30"
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Digitar "6" vira "06:00"</span>
              </div>

              {/* Horário que Dorme */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Horário que Dorme
                </label>
                <input
                  type="text"
                  value={horarioDorme}
                  onChange={(e) => setHorarioDorme(e.target.value)}
                  onBlur={(e) => setHorarioDorme(formatarHorario(e.target.value))}
                  placeholder="ex: 23 ou 23:00"
                  className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Digitar "23" vira "23:00"</span>
              </div>

              {/* Quantidade de Água */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Água por dia
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={quantidadeAgua}
                    onChange={(e) => setQuantidadeAgua(e.target.value)}
                    placeholder="ex: 2.5"
                    className="w-full pl-4 pr-16 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 pointer-events-none">
                    litros
                  </span>
                </div>
              </div>
            </div>

            {/* Pratica Atividade Física */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pratica Atividade Física?
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPraticaAtividade(true)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    praticaAtividade === true
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50/30 text-slate-600 border-emerald-100 hover:border-emerald-300'
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPraticaAtividade(false);
                    setAtividadeDescricao('');
                  }}
                  className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    praticaAtividade === false
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-emerald-50/30 text-slate-600 border-emerald-100 hover:border-emerald-300'
                  }`}
                >
                  Não
                </button>
              </div>

              {/* Se sim, abre campo de texto */}
              {praticaAtividade === true && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Qual atividade e frequência semanal?
                  </label>
                  <input
                    type="text"
                    value={atividadeDescricao}
                    onChange={(e) => setAtividadeDescricao(e.target.value)}
                    placeholder="ex: Musculação 4x na semana, corrida aos sábados"
                    className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              )}
            </div>

            {/* Observações Gerais */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Observações Gerais
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Anotações clínicas adicionais, preferências, histórico familiar, metas específicas..."
                className="w-full px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-emerald-100/70">
              <button
                type="button"
                onClick={() => setActiveTab('clinico')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                ← Voltar para Clínico
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando Prontuário no Neon...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar Paciente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
