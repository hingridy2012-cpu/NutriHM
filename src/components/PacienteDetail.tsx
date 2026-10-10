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
          className="p-2.5 rounded-2xl bg-[#fcfaf7] border-2 border-[#e6dbcc] hover:bg-[#ede4d8] text-[#5c4a3b] transition-all shadow-xs cursor-pointer"
          title="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-serif-retro font-black text-[#231e1a]">{paciente.nome}</h1>
          <p className="text-xs text-[#706456] font-medium">Prontuário & Histórico de Avaliações Clínicas</p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Dados Pessoais */}
        <div className="bg-[#fcfaf7] p-6 rounded-3xl border-2 border-[#e6dbcc] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ede4d8] text-[#2a556f] border border-[#dacdbd]">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-serif-retro font-bold text-[#231e1a] text-sm">Dados Cadastrais</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-[#594e44]">
              <Phone className="w-4 h-4 text-[#8e8071] shrink-0" />
              <span>{paciente.whatsapp || 'WhatsApp não informado'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#594e44]">
              <Mail className="w-4 h-4 text-[#8e8071] shrink-0" />
              <span className="truncate">{paciente.email || 'Email não informado'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#594e44]">
              <Calendar className="w-4 h-4 text-[#8e8071] shrink-0" />
              <span>Nascimento: {paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}</span>
            </div>
          </div>
        </div>

        {/* Card Antropometria */}
        <div className="bg-[#fcfaf7] p-6 rounded-3xl border-2 border-[#e6dbcc] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#f5ebd9] text-[#c07a4a] border border-[#e8d5bf]">
              <Weight className="w-5 h-5" />
            </div>
            <h3 className="font-serif-retro font-bold text-[#231e1a] text-sm">Medidas Iniciais</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#f5efe6] rounded-2xl border border-[#dacdbd]">
              <span className="text-[10px] font-serif-retro font-bold text-[#8a7c6f] uppercase">Peso Inicial</span>
              <p className="text-base font-serif-retro font-black text-[#231e1a] mt-0.5">{paciente.peso_inicial ? `${paciente.peso_inicial} kg` : '-'}</p>
            </div>
            <div className="p-3 bg-[#f5efe6] rounded-2xl border border-[#dacdbd]">
              <span className="text-[10px] font-serif-retro font-bold text-[#8a7c6f] uppercase">Estatura</span>
              <p className="text-base font-serif-retro font-black text-[#231e1a] mt-0.5">{paciente.altura ? `${paciente.altura} m` : '-'}</p>
            </div>
          </div>
        </div>

        {/* Card Hábitos & Estilo de Vida */}
        <div className="bg-[#fcfaf7] p-6 rounded-3xl border-2 border-[#e6dbcc] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ede4d8] text-[#2a556f] border border-[#dacdbd]">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-serif-retro font-bold text-[#231e1a] text-sm">Estilo de Vida</h3>
          </div>

          <div className="space-y-1.5 text-xs text-[#594e44]">
            <p><span className="font-serif-retro font-bold text-[#231e1a]">Objetivo:</span> {paciente.objetivo_texto || (Array.isArray(paciente.objetivos) ? paciente.objetivos.join(', ') : 'Não informado')}</p>
            <p><span className="font-serif-retro font-bold text-[#231e1a]">Atividade Física:</span> {paciente.atividade_fisica ? 'Sim' : 'Não'}</p>
            <p><span className="font-serif-retro font-bold text-[#231e1a]">Água Diária:</span> {paciente.litros_agua ? `${paciente.litros_agua} L/dia` : '-'}</p>
          </div>
        </div>
      </div>

      {/* Histórico de Consultas */}
      <div className="bg-[#fcfaf7] rounded-3xl border-2 border-[#e6dbcc] p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="font-serif-retro font-bold text-[#231e1a] text-base">Registro Histórico de Atendimentos</h3>
        {consultas.length === 0 ? (
          <p className="text-xs text-[#706456] py-4">Nenhuma consulta registrada para este prontuário ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#8a7c6f] border-b border-[#ebdfd1] text-[11px] uppercase font-serif-retro font-bold text-left">
                  <th className="pb-3 px-4">Data Consulta</th>
                  <th className="pb-3 px-4">Peso</th>
                  <th className="pb-3 px-4">Cintura</th>
                  <th className="pb-3 px-4">Quadril</th>
                  <th className="pb-3 px-4">Próximo Retorno</th>
                  <th className="pb-3 px-4">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdfd1]/60">
                {consultas.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f5efe6]">
                    <td className="py-3 px-4 font-serif-retro font-bold text-[#231e1a]">
                      {c.data_consulta ? new Date(c.data_consulta).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4 text-[#594e44] text-xs">{c.peso ? `${c.peso} kg` : '-'}</td>
                    <td className="py-3 px-4 text-[#594e44] text-xs">{c.cintura ? `${c.cintura} cm` : '-'}</td>
                    <td className="py-3 px-4 text-[#594e44] text-xs">{c.quadril ? `${c.quadril} cm` : '-'}</td>
                    <td className="py-3 px-4 font-serif-retro font-bold text-[#2a556f] text-xs">
                      {c.proximo_retorno ? new Date(c.proximo_retorno).toLocaleDateString('pt-BR') : 'Sem retorno'}
                    </td>
                    <td className="py-3 px-4 text-[#706456] text-xs max-w-xs truncate">{c.observacoes || '-'}</td>
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

