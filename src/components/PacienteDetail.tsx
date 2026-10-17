import React, { useEffect, useState } from 'react';
import { sql } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Phone, Mail, Calendar, Weight, Activity } from 'lucide-react';

interface PacienteDetailProps {
  pacienteId: string;
  onBack: () => void;
}

export const PacienteDetail: React.FC<PacienteDetailProps> = ({ pacienteId, onBack }) => {
  const { user } = useAuth();
  const [paciente, setPaciente] = useState<any | null>(null);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user || !pacienteId) return;
      try {
        setLoading(true);
        const pacienteRows = await sql`
          SELECT * FROM public.pacientes
          WHERE id = ${pacienteId}::uuid AND nutricionista_id = ${user.id}::uuid
          LIMIT 1;
        `;

        if (pacienteRows && pacienteRows.length > 0) {
          setPaciente(pacienteRows[0]);
          const consultRows = await sql`
            SELECT * FROM public.consultas
            WHERE paciente_id = ${pacienteId}::uuid
            ORDER BY data_consulta DESC;
          `;
          setConsultas(consultRows || []);
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes do paciente:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [pacienteId, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#c9bba8] border-t-[#2b5870] rounded-full animate-spin mb-3" />
        <p className="text-sm font-serif-retro font-semibold text-[#706456]">Carregando prontuário clínico...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[#706456] font-medium font-serif-retro">Prontuário não localizado no arquivo clínico.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2a556f] text-[#fbf9f5] rounded-xl text-xs font-serif-retro font-bold border border-[#3e6f8d] cursor-pointer"
        >
          Retornar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-white border border-emerald-100 hover:bg-emerald-50 text-slate-700 transition-all shadow-xs cursor-pointer"
          title="Voltar para Pacientes"
        >
          <ArrowLeft className="w-5 h-5 text-emerald-700" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{paciente.nome}</h1>
          <p className="text-xs text-slate-500 font-medium">Prontuário & Histórico Clínico do Paciente</p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Dados Pessoais */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Dados Pessoais</h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{paciente.whatsapp || 'Telefone não informado'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{paciente.email || 'E-mail não informado'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {paciente.data_nascimento 
                  ? `${new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')} ${paciente.sexo ? `(${paciente.sexo})` : ''}` 
                  : (paciente.sexo || 'Nascimento não informado')}
              </span>
            </div>
          </div>
        </div>

        {/* Card Antropometria */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <Weight className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Medidas Iniciais</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Peso Inicial</span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : '-'}
              </p>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Altura</span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {paciente.altura ? `${paciente.altura > 3 ? (paciente.altura/100).toFixed(2) : paciente.altura} m` : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Card Hábitos & Estilo de Vida */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Rotina & Hábitos</h3>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <p>
              <span className="font-bold text-slate-800">Objetivo:</span>{' '}
              {paciente.objetivo_texto || (Array.isArray(paciente.objetivos) && paciente.objetivos.length > 0 ? paciente.objetivos.join(', ') : 'Não informado')}
            </p>
            <p>
              <span className="font-bold text-slate-800">Atividade Física:</span>{' '}
              {paciente.atividade_fisica ? `Sim (${paciente.atividade_fisica_descricao || 'Não detalhada'})` : 'Não'}
            </p>
            <p>
              <span className="font-bold text-slate-800">Água Diária:</span>{' '}
              {paciente.litros_agua ? `${paciente.litros_agua} litros` : 'Não informado'}
            </p>
            {(paciente.horario_acorda || paciente.horario_dorme) && (
              <p>
                <span className="font-bold text-slate-800">Sono:</span>{' '}
                Acorda {paciente.horario_acorda || '-'} | Dorme {paciente.horario_dorme || '-'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Condições Clínicas / Alergias / Medicamentos */}
      {(
        (Array.isArray(paciente.patologias) && paciente.patologias.length > 0) ||
        (Array.isArray(paciente.restricoes_alimentares) && paciente.restricoes_alimentares.length > 0) ||
        (Array.isArray(paciente.alergias) && paciente.alergias.length > 0) ||
        paciente.medicamentos ||
        paciente.suplementos ||
        paciente.observacoes
      ) && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Quadro Clínico & Observações</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {Array.isArray(paciente.patologias) && paciente.patologias.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700">Patologias / Condições:</span>
                <p className="text-slate-600">{paciente.patologias.join(', ')}</p>
              </div>
            )}
            {Array.isArray(paciente.restricoes_alimentares) && paciente.restricoes_alimentares.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700">Restrições Alimentares:</span>
                <p className="text-slate-600">{paciente.restricoes_alimentares.join(', ')}</p>
              </div>
            )}
            {Array.isArray(paciente.alergias) && paciente.alergias.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
                <span className="font-bold text-rose-800">Alergias Alimentares:</span>
                <p className="text-rose-700">{paciente.alergias.join(', ')}</p>
              </div>
            )}
            {paciente.medicamentos && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700">Medicamentos:</span>
                <p className="text-slate-600">{paciente.medicamentos}</p>
              </div>
            )}
            {paciente.suplementos && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700">Suplementos:</span>
                <p className="text-slate-600">{paciente.suplementos}</p>
              </div>
            )}
            {paciente.observacoes && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 md:col-span-3">
                <span className="font-bold text-slate-700">Observações Gerais:</span>
                <p className="text-slate-600 whitespace-pre-line">{paciente.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Histórico de Consultas */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-7 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Histórico de Atendimentos</h3>
        {consultas.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">Nenhuma consulta registrada para este prontuário ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-emerald-100 text-[11px] uppercase font-bold text-left">
                  <th className="pb-3 px-4">Data Consulta</th>
                  <th className="pb-3 px-4">Peso</th>
                  <th className="pb-3 px-4">Cintura</th>
                  <th className="pb-3 px-4">Quadril</th>
                  <th className="pb-3 px-4">Próximo Retorno</th>
                  <th className="pb-3 px-4">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {consultas.map((c) => (
                  <tr key={c.id} className="hover:bg-emerald-50/30">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.data_consulta ? new Date(c.data_consulta).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{c.peso ? `${c.peso} kg` : '-'}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{c.cintura ? `${c.cintura} cm` : '-'}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{c.quadril ? `${c.quadril} cm` : '-'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700 text-xs">
                      {c.proximo_retorno ? new Date(c.proximo_retorno).toLocaleDateString('pt-BR') : 'Sem retorno'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate">{c.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

