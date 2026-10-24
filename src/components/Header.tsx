import React, { useState, useEffect } from 'react';
import { TeamMember, RoleType, TeamIntegrations } from '../types';
import { ShieldCheck, Clock, Users, Sparkles, Award, ExternalLink, Activity, Github, HardDrive, Triangle, Share2 } from 'lucide-react';

interface HeaderProps {
  teamMembers: TeamMember[];
  activeMember: TeamMember;
  integrations?: TeamIntegrations;
  onSelectMember: (member: TeamMember) => void;
  onOpenAiEvaluator: () => void;
  onOpenIntegrations?: () => void;
  onReassignRoles?: () => void;
}

export default function Header({
  teamMembers,
  activeMember,
  integrations,
  onSelectMember,
  onOpenAiEvaluator,
  onOpenIntegrations,
  onReassignRoles,
}: HeaderProps) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('pt-BR'));
  
  // Target pitch presentation time: 18:30 (from hackathon schedule)
  const pitchTargetTime = new Date();
  pitchTargetTime.setHours(18, 30, 0, 0);

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR'));

      const diff = pitchTargetTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('HORA DO PITCH!');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Event Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  NEXUS GOVTECH
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 border border-cyan-800 text-cyan-300 tracking-wider">
                  EQUIPE: NEXUS DC BR
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Hackathon GovTech 2026</span>
                <span className="text-slate-600">•</span>
                <span>SEBRAE Cianorte / CMCTIC</span>
              </p>
            </div>
          </div>

          {/* Schedule Countdown & Event Status */}
          <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-medium">Contagem para Pitch (18h30)</span>
                <span className="font-mono text-sm font-bold text-amber-300">{timeLeft || '03:29:15'}</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-medium">Fase Atual</span>
                <span className="font-semibold text-slate-200">MVP e Testagem / Prototipagem</span>
              </div>
            </div>
          </div>

          {/* Quick Team Hub Connectors */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={onOpenIntegrations}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800 text-[11px] text-slate-300 transition"
              title="Ver repositório GitHub da equipe"
            >
              <Github className="w-3.5 h-3.5 text-white" />
              <span className="font-mono text-[10px] text-cyan-300 font-bold truncate max-w-[110px]">
                {integrations?.github?.repoName?.split('/')[1] || 'Sistema-Nexus-Gov'}
              </span>
            </button>

            <span className="text-slate-700">•</span>

            <button
              onClick={onOpenIntegrations}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800 text-[11px] text-slate-300 transition"
              title="Ver arquivos do Google Drive da equipe"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-amber-200 font-semibold">Drive ({integrations?.googleDrive?.sharedDocs?.length || 4})</span>
            </button>

            <span className="text-slate-700">•</span>

            <button
              onClick={onOpenIntegrations}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800 text-[11px] text-slate-300 transition"
              title="Ver deploy em produção na Vercel"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <Triangle className="w-3 h-3 text-white fill-white" />
              <span className="text-[10px] text-emerald-300 font-semibold">Vercel</span>
            </button>
          </div>

          {/* User Selector & AI Evaluator Button */}
          <div className="flex items-center gap-3">
            {/* AI Evaluator Button */}
            <button
              onClick={onOpenAiEvaluator}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-lg shadow-cyan-900/30 transition border border-cyan-400/30 active:scale-95"
              title="Avaliar projeto com IA baseado nos 7 critérios do edital"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-bounce" />
              <span>Simulador Banca IA (70 pts)</span>
            </button>

            {/* Profile Picker */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition">
                <img
                  src={activeMember.avatar}
                  alt={activeMember.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-cyan-500/50"
                />
                <div className="text-left hidden lg:block">
                  <span className="block text-xs font-semibold text-slate-200 leading-none">{activeMember.name}</span>
                  <span className="text-[10px] text-cyan-400">{activeMember.roleTitle}</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Alternar Papel na Equipe (3 Integrantes)
                </div>
                {teamMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onSelectMember(m)}
                    className={`w-full text-left flex items-center gap-2.5 p-2 rounded-lg text-xs transition ${
                      activeMember.id === m.id
                        ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800/60'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <div className="font-medium text-slate-100">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.roleTitle}</div>
                    </div>
                  </button>
                ))}
                {onReassignRoles && (
                  <button
                    onClick={onReassignRoles}
                    className="w-full text-left p-2 mt-1 border-t border-slate-800 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Configurar / Reatribuir Funções</span>
                    <span className="text-[10px]">⚙️</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
