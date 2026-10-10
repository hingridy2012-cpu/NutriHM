import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CalendarDays, 
  UserX, 
  ChevronRight, 
  Bookmark,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { sql } from '../lib/auth';

interface DashboardMainProps {
  onSelectPaciente: (id: string) => void;
  onNavigateToPacientes: () => void;
}

export interface PacienteSemRetorno {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  ultima_consulta: string;
  dias_sem_consulta: number;
}

export const DashboardMain: React.FC<DashboardMainProps> = ({ 
  onSelectPaciente,
  onNavigateToPacientes 
}) => {
  const { user } = useAuth();
  const [totalPacientes, setTotalPacientes] = useState<number>(0);
  const [consultasSemana, setConsultasSemana] = useState<number>(0);
  const [pacientesSemRetorno, setPacientesSemRetorno] = useState<PacienteSemRetorno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardMetrics() {
      if (!user) return;
      try {
        setLoading(true);

        // 1. Total de pacientes cadastrados pelo nutricionista logado
        const totalPacientesRes = await sql`
          SELECT count(*)::int as total
          FROM public.pacientes
          WHERE nutricionista_id = ${user.id}::uuid;
        `;
        const total = totalPacientesRes[0]?.total || 0;
        setTotalPacientes(total);

        // 2. Consultas registradas na semana atual para os pacientes do nutricionista logado
        const consultasSemanaRes = await sql`
          SELECT count(*)::int as total
          FROM public.consultas c
          JOIN public.pacientes p ON p.id = c.paciente_id
          WHERE p.nutricionista_id = ${user.id}::uuid
            AND c.data_consulta >= date_trunc('week', CURRENT_DATE)::date
            AND c.data_consulta <= (date_trunc('week', CURRENT_DATE) + interval '6 days')::date;
        `;
        const consultasCount = consultasSemanaRes[0]?.total || 0;
        setConsultasSemana(consultasCount);

        // 3. Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
        const semRetornoRes = await sql`
          WITH ultimas_consultas AS (
            SELECT 
              c.paciente_id,
              MAX(c.data_consulta) as ultima_data,
              MAX(c.proximo_retorno) as max_proximo_retorno
            FROM public.consultas c
            JOIN public.pacientes p ON p.id = c.paciente_id
            WHERE p.nutricionista_id = ${user.id}::uuid
            GROUP BY c.paciente_id
          )
          SELECT 
            p.id,
            p.nome,
            p.email,
            p.whatsapp,
            uc.ultima_data as ultima_consulta,
            (CURRENT_DATE - uc.ultima_data)::int as dias_sem_consulta
          FROM public.pacientes p
          JOIN ultimas_consultas uc ON uc.paciente_id = p.id
          WHERE p.nutricionista_id = ${user.id}::uuid
            AND uc.ultima_data < (CURRENT_DATE - INTERVAL '30 days')
            AND (uc.max_proximo_retorno IS NULL OR uc.max_proximo_retorno < CURRENT_DATE)
          ORDER BY uc.ultima_data ASC;
        `;

        setPacientesSemRetorno((semRetornoRes || []) as PacienteSemRetorno[]);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardMetrics();
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Vintage Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#2a556f] p-8 sm:p-10 text-[#fbf9f5] shadow-lg border-2 border-[#3d6e8b]">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbf9f5]/15 text-[#f4ece1] text-xs font-serif-retro font-bold border border-[#fbf9f5]/20">
            <Bookmark className="w-3.5 h-3.5 text-[#eac39d]" />
            <span>Caderno Clínico Principal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif-retro font-black tracking-tight text-[#faf7f2]">
            Bem-vindo(a), {user?.name || 'Nutricionista'}!
          </h1>
          <p className="text-[#d8e6ef] text-sm font-normal leading-relaxed">
            Visão geral em tempo real dos seus atendimentos, retornos e prontuários clínicos.
          </p>
        </div>

        {/* Vintage Ornament */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-60 h-60 bg-[#c07a4a]/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Seção dos 3 Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 — Total de pacientes ativos */}
        <div 
          onClick={onNavigateToPacientes}
          className="group relative bg-[#fcfaf7] p-7 rounded-3xl border-2 border-[#e6dbcc] shadow-xs hover:shadow-md hover:border-[#c9bba8] transition-all duration-200 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-2xl bg-[#ede4d8] text-[#2a556f] group-hover:bg-[#2a556f] group-hover:text-[#faf7f2] transition-colors duration-200 border border-[#dacdbd]">
              <Users className="w-6 h-6" />
            </div>
            <span className="p-2 rounded-xl bg-[#f5efe6] text-[#7d7062] group-hover:text-[#2a556f] transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7e7266] font-serif-retro">
              Total de Pacientes Ativos
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-serif-retro font-black text-[#231e1a] tracking-tight">
                {loading ? '...' : totalPacientes}
              </h3>
              <span className="text-xs font-serif-retro font-bold text-[#2a556f]">cadastrados</span>
            </div>
          </div>
        </div>

        {/* Card 2 — Consultas da semana */}
        <div className="relative bg-[#fcfaf7] p-7 rounded-3xl border-2 border-[#e6dbcc] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-2xl bg-[#f5ebd9] text-[#c07a4a] border border-[#e8d5bf]">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-serif-retro font-bold px-2.5 py-1 rounded-full bg-[#f4ece1] text-[#6e5844] border border-[#d8cbba]">
              <Clock className="w-3 h-3" />
              Esta semana
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7e7266] font-serif-retro">
              Consultas da Semana
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-serif-retro font-black text-[#231e1a] tracking-tight">
                {loading ? '...' : consultasSemana}
              </h3>
              <span className="text-xs font-serif-retro font-bold text-[#c07a4a]">atendimentos</span>
            </div>
          </div>
        </div>

        {/* Card 3 — Pacientes sem retorno */}
        <div className="relative bg-[#fcfaf7] p-7 rounded-3xl border-2 border-[#e6dbcc] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-2xl bg-[#fdf2f0] text-[#ba3930] border border-[#f3c5c1]">
              <UserX className="w-6 h-6" />
            </div>
            <span className={`inline-flex items-center gap-1 text-[11px] font-serif-retro font-bold px-2.5 py-1 rounded-full border ${
              pacientesSemRetorno.length > 0 
                ? 'bg-[#fdf2f0] text-[#9a342d] border-[#f3c5c1]' 
                : 'bg-[#eef5ee] text-[#2e6930] border-[#c2dfc4]'
            }`}>
              {pacientesSemRetorno.length > 0 ? 'Atenção' : 'Em dia'}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7e7266] font-serif-retro">
              Pacientes Sem Retorno
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-serif-retro font-black text-[#231e1a] tracking-tight">
                {loading ? '...' : pacientesSemRetorno.length}
              </h3>
              <span className="text-xs font-serif-retro font-bold text-[#ba3930]">&gt; 30 dias sem consulta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3 Detalhado — Lista com o nome dos pacientes sem retorno */}
      <div className="bg-[#fcfaf7] rounded-3xl border-2 border-[#e6dbcc] shadow-xs p-7 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#ebdfd1]">
          <div>
            <h2 className="text-lg font-serif-retro font-bold text-[#231e1a] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c07a4a]" />
              Pacientes Sem Retorno Agendado
            </h2>
            <p className="text-xs text-[#706456] font-medium mt-0.5">
              Pacientes com última consulta há mais de 30 dias e sem próximo retorno agendado
            </p>
          </div>

          <span className="text-xs font-bold text-[#8a7c6f] font-serif-retro uppercase tracking-wider">
            {pacientesSemRetorno.length} {pacientesSemRetorno.length === 1 ? 'paciente' : 'pacientes'}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#c9bba8] border-t-[#2b5870] rounded-full animate-spin mb-2" />
            <span className="text-xs text-[#706456] font-serif-retro font-semibold">Consultando pacientes no Neon...</span>
          </div>
        ) : pacientesSemRetorno.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#eef5ee] text-[#2e6930] border border-[#c2dfc4] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-serif-retro font-bold text-[#27211d]">Nenhum paciente sem retorno no momento</h4>
            <p className="text-xs text-[#706456] max-w-md mx-auto">
              Excelente! Todos os seus pacientes tiveram atendimento recente ou já contam com retorno agendado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#8a7c6f] border-b border-[#ebdfd1] text-[11px] uppercase font-bold font-serif-retro tracking-wider">
                  <th className="pb-3 px-4">Nome do Paciente</th>
                  <th className="pb-3 px-4">Última Consulta</th>
                  <th className="pb-3 px-4">Tempo Decorrido</th>
                  <th className="pb-3 px-4">Contato</th>
                  <th className="pb-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdfd1]/60">
                {pacientesSemRetorno.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectPaciente(item.id)}
                    className="hover:bg-[#f5efe6] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#ede4d8] text-[#5c4a3b] font-serif-retro font-bold flex items-center justify-center text-xs border border-[#dacdbd] group-hover:bg-[#2a556f] group-hover:text-[#fbf9f5] transition-colors">
                          {item.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-serif-retro font-bold text-[#231e1a] group-hover:text-[#2a556f] transition-colors">
                          {item.nome}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#594e44] font-medium">
                      {new Date(item.ultima_consulta).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fdf2f0] text-[#9a342d] border border-[#f3c5c1] text-xs font-bold font-serif-retro">
                        <AlertCircle className="w-3.5 h-3.5 text-[#ba3930]" />
                        {item.dias_sem_consulta} dias atrás
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#706456]">
                      {item.whatsapp || item.email || 'Sem contato'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPaciente(item.id);
                        }}
                        className="text-xs font-serif-retro font-bold text-[#2a556f] hover:text-[#1c3a4d] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                      >
                        <span>Ver Prontuário</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
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

