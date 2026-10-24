import React, { useState, useEffect } from 'react';
import LoginScreen from './components/Auth/LoginScreen';
import RoleSelectScreen from './components/Auth/RoleSelectScreen';
import Header from './components/Header';
import GuidedWizard from './components/GuidedWizard/GuidedWizard';
import TabsNav, { TabType } from './components/TabsNav';
import CodeHub from './components/CodeHub/CodeHub';
import TaskBoard from './components/TaskBoard/TaskBoard';
import TeamChat from './components/TeamChat/TeamChat';
import ValidationSuite from './components/ValidationSuite/ValidationSuite';
import PitchBuilder from './components/PitchBuilder/PitchBuilder';
import IntegrationsHub from './components/Integrations/IntegrationsHub';
import AIEvaluatorModal from './components/AIEvaluatorModal';
import { TeamMember, Task, ChatMessage, CodeFile, CodeCommit, MentorFeedback, TeamIntegrations } from './types';
import { fetchAppState } from './services/api';

export default function App() {
  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nexus_auth') === 'true';
  });
  const [activeMember, setActiveMember] = useState<TeamMember | null>(() => {
    const saved = localStorage.getItem('nexus_role');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<TabType>('code');
  const [isAiEvaluatorOpen, setIsAiEvaluatorOpen] = useState(false);

  // App State
  const [activeCheckpointId, setActiveCheckpointId] = useState<number>(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [codeCommits, setCodeCommits] = useState<CodeCommit[]>([]);
  const [mentorFeedbacks, setMentorFeedbacks] = useState<MentorFeedback[]>([]);
  const [integrations, setIntegrations] = useState<TeamIntegrations | null>(null);
  const [loading, setLoading] = useState(true);

  // Load state from Express backend
  const loadState = async () => {
    try {
      const data = await fetchAppState();
      if (data.activeCheckpointId) {
        setActiveCheckpointId(data.activeCheckpointId);
      }
      if (data.teamMembers && data.teamMembers.length > 0) {
        setTeamMembers(data.teamMembers);
      } else {
        setTeamMembers([
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
              'Unificação dos módulos e teste prático na plataforma',
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
              'Garantia de acessibilidade, ética e LGPD no fluxo do usuário',
            ],
          },
        ]);
      }
      setTasks(data.tasks || []);
      setChatMessages(data.chatMessages || []);
      setCodeFiles(data.codeFiles || []);
      setCodeCommits(data.codeCommits || []);
      setMentorFeedbacks(data.mentorFeedbacks || []);
      if (data.integrations) {
        setIntegrations(data.integrations);
      }
    } catch (err) {
      console.error('Error loading app state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();

    // Subscribe to SSE real-time stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'STAGE_UPDATED') {
            setActiveCheckpointId(data.payload.activeCheckpointId);
          } else if (data.type === 'TASK_CREATED' || data.type === 'TASK_UPDATED') {
            loadState();
          } else if (data.type === 'CHAT_MESSAGE') {
            setChatMessages((prev) => [...prev, data.payload]);
          } else if (data.type === 'CODE_SAVED' || data.type === 'CODE_COMMITTED') {
            loadState();
          } else if (data.type === 'FEEDBACK_ADDED') {
            loadState();
          } else if (data.type === 'TEAM_UPDATED') {
            loadState();
          } else if (data.type === 'INTEGRATIONS_UPDATED') {
            setIntegrations(data.payload);
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      eventSource.onerror = () => {
        // Close gracefully if serverless environment doesn't keep persistent stream open
        eventSource?.close();
      };
    } catch (e) {
      console.warn('SSE not supported or failed to connect:', e);
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('nexus_auth', 'true');
  };

  const handleSelectRole = (member: TeamMember) => {
    setActiveMember(member);
    localStorage.setItem('nexus_role', JSON.stringify(member));
  };

  // STEP 1: Passcode Login Gate
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // STEP 2: Role Selection Gate
  if (!activeMember) {
    return (
      <RoleSelectScreen
        teamMembers={teamMembers}
        onSelectRole={handleSelectRole}
        onRefreshState={loadState}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm font-bold text-cyan-400">Carregando Nexus GovTech Command Center...</div>
          <div className="text-xs text-slate-500">Conectando ao servidor em tempo real da equipe Nexus DC Br</div>
        </div>
      </div>
    );
  }

  const pendingTasksCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-12">
      
      {/* Sticky Header with Countdown & Role Selector */}
      <Header
        teamMembers={teamMembers}
        activeMember={activeMember}
        integrations={integrations || undefined}
        onSelectMember={handleSelectRole}
        onOpenAiEvaluator={() => setIsAiEvaluatorOpen(true)}
        onOpenIntegrations={() => setActiveTab('integrations')}
        onReassignRoles={() => {
          localStorage.removeItem('nexus_role');
          setActiveMember(null);
        }}
      />

      {/* Guided Stage Wizard Bar */}
      <GuidedWizard
        activeCheckpointId={activeCheckpointId}
        activeMember={activeMember}
        onRefreshState={loadState}
      />

      {/* Tabs Navigation */}
      <TabsNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Tab Views Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'integrations' && (
          <IntegrationsHub
            integrations={
              integrations || {
                github: {
                  enabled: true,
                  repoUrl: 'https://github.com/Strakona/Sistema-Nexus-Gov',
                  repoName: 'Strakona/Sistema-Nexus-Gov',
                  branch: 'main',
                  status: 'connected',
                },
                googleDrive: {
                  enabled: true,
                  folderUrl: 'https://drive.google.com/drive/folders/nexus-govtech-2026',
                  status: 'connected',
                  sharedDocs: [],
                },
                vercel: {
                  enabled: true,
                  projectName: 'sistema-nexus-gov',
                  deploymentUrl: 'https://sistema-nexus-gov.vercel.app',
                  environment: 'Production',
                  status: 'ready',
                },
              }
            }
            activeMember={activeMember}
            onRefresh={loadState}
          />
        )}

        {activeTab === 'code' && (
          <CodeHub
            codeFiles={codeFiles}
            codeCommits={codeCommits}
            activeMember={activeMember}
            onRefreshState={loadState}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskBoard
            tasks={tasks}
            teamMembers={teamMembers}
            activeMember={activeMember}
            onRefreshState={loadState}
          />
        )}

        {activeTab === 'chat' && (
          <TeamChat
            chatMessages={chatMessages}
            mentorFeedbacks={mentorFeedbacks}
            teamMembers={teamMembers}
            activeMember={activeMember}
            onRefreshState={loadState}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationSuite onRefreshState={loadState} />
        )}

        {activeTab === 'pitch' && (
          <PitchBuilder />
        )}
      </main>

      {/* AI Jury Simulator Modal */}
      <AIEvaluatorModal
        isOpen={isAiEvaluatorOpen}
        onClose={() => setIsAiEvaluatorOpen(false)}
      />

    </div>
  );
}
