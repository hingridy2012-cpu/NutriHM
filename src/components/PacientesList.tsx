import React, { useEffect, useState } from 'react';
import { sql } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { Users, Search, ChevronRight } from 'lucide-react';

interface PacientesListProps {
  onSelectPaciente: (id: string) => void;
}

export const PacientesList: React.FC<PacientesListProps> = ({ onSelectPaciente }) => {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPacientes() {
      if (!user) return;
      try {
        setLoading(true);
        const res = await sql`
          SELECT * FROM public.pacientes
          WHERE nutricionista_id = ${user.id}::uuid
          ORDER BY nome ASC;
        `;
        setPacientes(res || []);
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPacientes();
  }, [user]);

  const filteredPacientes = pacientes.filter((p) =>
    p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.whatsapp?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif-retro font-black text-[#231e1a] tracking-tight">Registro de Pacientes</h1>
          <p className="text-xs text-[#706456] font-medium">Lista de todos os prontuários ativos no consultório</p>
        </div>

        {/* Search Input Retrô */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8071]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou telefone..."
            className="w-full pl-10 pr-4 py-2 bg-[#fbf9f5] border-2 border-[#e6dbcc] rounded-2xl text-xs font-medium text-[#2c241e] placeholder-[#9f9181] focus:outline-none focus:ring-2 focus:ring-[#2b5870]/30 focus:border-[#2b5870] shadow-xs"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-[#fcfaf7] rounded-3xl border-2 border-[#e6dbcc] shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#c9bba8] border-t-[#2b5870] rounded-full animate-spin mb-2" />
            <span className="text-xs text-[#706456] font-serif-retro font-semibold">Buscando registros clínicos...</span>
          </div>
        ) : filteredPacientes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ede4d8] text-[#2a556f] border border-[#dacdbd] flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-serif-retro font-bold text-[#231e1a] text-base">Nenhum paciente localizado</h3>
            <p className="text-xs text-[#706456] max-w-sm mx-auto">
              {searchTerm ? 'Nenhum prontuário corresponde ao termo pesquisado.' : 'Você ainda não possui pacientes cadastrados no banco de dados.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f5efe6] border-b border-[#ebdfd1] text-[#8a7c6f] text-[11px] uppercase font-bold font-serif-retro tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Nome do Paciente</th>
                  <th className="py-3.5 px-6">Contato</th>
                  <th className="py-3.5 px-6">Objetivo Principal</th>
                  <th className="py-3.5 px-6">Cadastro</th>
                  <th className="py-3.5 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdfd1]/60">
                {filteredPacientes.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPaciente(p.id)}
                    className="hover:bg-[#f5efe6] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-bold text-[#231e1a] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#ede4d8] text-[#5c4a3b] font-serif-retro font-bold flex items-center justify-center text-xs border border-[#dacdbd] group-hover:bg-[#2a556f] group-hover:text-[#fbf9f5] transition-colors">
                        {p.nome?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <span className="font-serif-retro text-sm group-hover:text-[#2a556f] transition-colors">{p.nome}</span>
                    </td>
                    <td className="py-4 px-6 text-[#594e44] text-xs">
                      <div>{p.whatsapp || '-'}</div>
                      <div className="text-[#8e8071] text-[11px]">{p.email || ''}</div>
                    </td>
                    <td className="py-4 px-6 text-[#594e44] text-xs">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-[#ede4d8] text-[#5c4a3b] font-serif-retro font-semibold text-[11px] border border-[#dacdbd]">
                        {p.objetivo_texto || (Array.isArray(p.objetivos) && p.objetivos.length > 0 ? p.objetivos[0] : 'Geral')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#8e8071] text-xs font-serif-retro">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-[#2a556f] hover:text-[#1c3a4d] font-serif-retro font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer">
                        <span>Abrir Prontuário</span>
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

