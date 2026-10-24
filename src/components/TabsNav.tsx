import React from 'react';
import { Code2, CheckSquare, MessageSquare, ClipboardCheck, Presentation, Layers, Share2 } from 'lucide-react';

export type TabType = 'code' | 'tasks' | 'chat' | 'validation' | 'pitch' | 'integrations';

interface TabsNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadChatCount?: number;
  pendingTasksCount?: number;
}

export default function TabsNav({
  activeTab,
  onChangeTab,
  unreadChatCount = 0,
  pendingTasksCount = 0,
}: TabsNavProps) {
  const tabs = [
    {
      id: 'integrations' as TabType,
      label: 'Conexões & Deploy',
      subtitle: 'GitHub, Google Drive & Vercel',
      icon: Share2,
      badge: 'Hub Equipe',
    },
    {
      id: 'code' as TabType,
      label: 'Code Hub & Versionamento',
      subtitle: 'Editor Live, Commit Diff & Juntar Partes',
      icon: Code2,
      badge: 'Live Sync',
    },
    {
      id: 'tasks' as TabType,
      label: 'Tarefas & Checkpoints 1–7',
      subtitle: 'Cronograma Edital GovTech 2026',
      icon: CheckSquare,
      badge: pendingTasksCount ? `${pendingTasksCount}` : undefined,
    },
    {
      id: 'chat' as TabType,
      label: 'Comunicação & Mentoria',
      subtitle: 'Chat da Equipe & Diário de Mentores',
      icon: MessageSquare,
      badge: unreadChatCount ? `${unreadChatCount}` : undefined,
    },
    {
      id: 'validation' as TabType,
      label: 'Validação & Pesquisa UX',
      subtitle: 'Formulário Relâmpago & Dados LGPD',
      icon: ClipboardCheck,
    },
    {
      id: 'pitch' as TabType,
      label: 'Pitch & Marco Legal',
      subtitle: 'Business Model SaaS & Slide Deck',
      icon: Presentation,
    },
  ];

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-[61px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-950/40 font-semibold'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold uppercase ${
                          tab.id === 'code'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal hidden lg:block">
                    {tab.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
