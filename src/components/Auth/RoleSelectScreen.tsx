import React, { useState, useEffect } from 'react';
import { TeamMember } from '../../types';
import { updateTeamMembers } from '../../services/api';
import { Users, CheckCircle2, ArrowRight, Code, Search, Presentation, UserCheck, Shield } from 'lucide-react';

interface RoleSelectScreenProps {
  teamMembers: TeamMember[];
  onSelectRole: (member: TeamMember) => void;
  onRefreshState: () => void;
}

const DEFAULT_ROLES: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Caio',
    role: 'tech',
    roleTitle: 'Tech Lead / Builder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    activeTask: 'Desenvolvimento do MVP e protótipo interativo',
    responsibilities: [
      'Prototipagem rápida em código React/TypeScript',
      'Estruturação da base de dados sintéticos LGPD',
      'Unificação dos módulos e teste prático no executor',
    ],
  },
  {
    id: 'member-2',
    name: 'Bruna',
    role: 'ux',
    roleTitle: 'Líder de Validação / UX',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    activeTask: 'Entrevistas com mentores e pesquisa de campo',
    responsibilities: [
      'Entrevistas com mentores e servidores em Cianorte',
      'Aplicação do formulário relâmpago de validação',
      'Garantia de acessibilidade, ética e LGPD no fluxo do cidadão',
    ],
  },
  {
    id: 'member-3',
    name: 'Douglas',
    role: 'pitch',
    roleTitle: 'Estrategista / Orador',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    activeTask: 'Estruturação da proposta de valor e Marco Legal',
    responsibilities: [
      'Modelagem SaaS Municipal e viabilidade financeira',
      'Enquadramento no Marco Legal das Startups (LC 182/2021)',
      'Construção do Pitch Deck e apresentação no palco para a banca',
    ],
  },
];

const TEAM_NAMES = ['Caio', 'Douglas', 'Bruna'];

export default function RoleSelectScreen({
  teamMembers,
  onSelectRole,
  onRefreshState,
}: RoleSelectScreenProps) {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    return teamMembers && teamMembers.length > 0 ? teamMembers : DEFAULT_ROLES;
  });

  useEffect(() => {
    if (teamMembers && teamMembers.length > 0) {
      setMembers(teamMembers);
    }
  }, [teamMembers]);

  const handleAssignMember = async (roleId: string, assignedName: string) => {
    const updated = members.map((m) => (m.id === roleId ? { ...m, name: assignedName } : m));
    setMembers(updated);
    try {
      await updateTeamMembers(updated);
      onRefreshState();
    } catch (e) {
      console.error('Error updating member:', e);
    }
  };

  const handleConfirmRole = async (member: TeamMember) => {
    try {
      await updateTeamMembers(members);
      onRefreshState();
    } catch (e) {
      console.error('Error saving role selection:', e);
    }
    onSelectRole(member);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 selection:bg-cyan-500 selection:text-slate-950">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>PASSO 2 DE 2 • ATRIBUIÇÃO DE FUNÇÕES DA EQUIPE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Funções do Trio no Hackathon GovTech 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Selecione no Dropdown em frente a cada função qual integrante (<span className="text-cyan-300 font-bold">Caio, Douglas ou Bruna</span>) assumirá cada papel, e depois clique no botão para entrar na sua área de trabalho:
          </p>
        </div>

        {/* 3 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map((member) => {
            const isTech = member.role === 'tech';
            const isUx = member.role === 'ux';
            const Icon = isTech ? Code : isUx ? Search : Presentation;

            const functionTitle = isTech
              ? 'Engenharia de Produto & Prototipagem'
              : isUx
              ? 'Pesquisa, Validação e Persona'
              : 'Estratégia GovTech, Negócios e Pitch';

            const functionSubtitle = isTech
              ? 'Tech Lead / Builder'
              : isUx
              ? 'Líder de Validação / UX'
              : 'Estrategista de Negócios / Orador';

            return (
              <div
                key={member.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl hover:border-cyan-500/60 transition-all duration-200 flex flex-col justify-between group space-y-5"
              >
                <div className="space-y-4">
                  
                  {/* Top Role Badge & Function Icon */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                      {functionSubtitle}
                    </span>

                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-500/40 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Function Title (Primary Heading) */}
                  <div>
                    <h2 className="text-base font-extrabold text-slate-100 leading-snug">
                      {functionTitle}
                    </h2>
                    <p className="text-[11px] text-cyan-400 font-medium mt-1">
                      Função Oficial: {functionSubtitle}
                    </p>
                  </div>

                  {/* Dropdown Selector: Escolher Integrante */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 space-y-2">
                    <label className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                        <span>Integrante Responsável:</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Dropdown</span>
                    </label>

                    <div className="relative">
                      <select
                        value={member.name}
                        onChange={(e) => handleAssignMember(member.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 hover:border-cyan-500 focus:border-cyan-400 text-white font-semibold text-xs rounded-xl px-3.5 py-2.5 appearance-none cursor-pointer focus:outline-none transition"
                      >
                        <option value="">Selecione o integrante...</option>
                        {TEAM_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400">Atribuído a:</span>
                      <span className="font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                        {member.name || 'Pendente de Escolha'}
                      </span>
                    </div>
                  </div>

                  {/* Responsibilities Checklist */}
                  <div className="space-y-2 text-xs pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Escopo do Papel no Edital:
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {member.responsibilities?.map((resp, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Enter Role Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleConfirmRole(member)}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/40 transition active:scale-95"
                  >
                    <span>Entrar como {functionSubtitle.split('/')[0].trim()} ({member.name || 'Integrante'})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
