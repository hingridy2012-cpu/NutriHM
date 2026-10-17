import React, { useEffect, useState } from 'react';
import { sql } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { Users, Search, ChevronRight, UserPlus, Calendar, Target } from 'lucide-react';

interface PacienteItem {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  objetivos: string[] | null;
  objetivo_texto: string | null;
  created_at: string;
  ultima_consulta: string | null;
}

interface PacientesListProps {
  onSelectPaciente: (id: string) => void;
  onNovoPaciente: () => void;
}

export const PacientesList: React.FC<PacientesListProps> = ({ 
  onSelectPaciente, 
  onNovoPaciente 
}) => {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<PacienteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPacientes() {
      if (!user) return;
      try {
        setLoading(true);
        // Busca todos os pacientes da nutricionista logada junto com a data da última consulta
        const res = await sql`
          SELECT 
            p.id,
            p.nome,
            p.email,
            p.whatsapp,
            p.objetivos,
            p.objetivo_texto,
            p.created_at,
            (
              SELECT MAX(c.data_consulta)
              FROM public.consultas c
              WHERE c.paciente_id = p.id
            ) as ultima_consulta
          FROM public.pacientes p
          WHERE p.nutricionista_id = ${user.id}::uuid
          ORDER BY p.nome ASC;
        `;
        setPacientes((res || []) as PacienteItem[]);
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPacientes();
  }, [user]);

  // Filtro de busca por nome
  const filteredPacientes = pacientes.filter((p) =>
    p.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pacientes</h1>
          <p className="text-xs text-slate-500 font-medium">
            Gerenciamento e prontuários dos pacientes cadastrados
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão Novo Paciente */}
          <button
            type="button"
            onClick={onNovoPaciente}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Paciente</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca por Nome */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar paciente por nome..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-100 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
        />
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-2" />
            <span className="text-xs text-slate-500 font-semibold">Carregando pacientes...</span>
          </div>
        ) : filteredPacientes.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            {pacientes.length === 0 ? (
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">Nenhum paciente cadastrado ainda</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Clique no botão "Novo Paciente" para cadastrar seu primeiro atendimento clínico.
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={onNovoPaciente}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Cadastrar Primeiro Paciente</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">Nenhum paciente encontrado</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Nenhum paciente com o nome "{searchTerm}" foi localizado na sua lista.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-50/50 border-b border-emerald-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Nome do Paciente</th>
                  <th className="py-3.5 px-6">Objetivo</th>
                  <th className="py-3.5 px-6">Última Consulta</th>
                  <th className="py-3.5 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {filteredPacientes.map((p) => {
                  const objetivoExibido = p.objetivo_texto || (Array.isArray(p.objetivos) && p.objetivos.length > 0 ? p.objetivos.join(', ') : 'Geral');

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectPaciente(p.id)}
                      className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                    >
                      {/* Nome */}
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200/60 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {p.nome?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {p.nome}
                          </span>
                          {p.whatsapp && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              {p.whatsapp}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Objetivo */}
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-100/80 max-w-xs truncate">
                          <Target className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{objetivoExibido}</span>
                        </span>
                      </td>

                      {/* Data da Última Consulta */}
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {p.ultima_consulta
                              ? new Date(p.ultima_consulta).toLocaleDateString('pt-BR')
                              : 'Nenhuma realizada'}
                          </span>
                        </div>
                      </td>

                      {/* Ação */}
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPaciente(p.id);
                          }}
                          className="text-emerald-700 hover:text-emerald-900 font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                        >
                          <span>Ver Perfil</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

