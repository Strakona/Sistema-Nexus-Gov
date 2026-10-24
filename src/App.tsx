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
import AIEvaluatorModal from './components/AIEvaluatorModal';
import { TeamMember, Task, ChatMessage, CodeFile, CodeCommit, MentorFeedback } from './types';
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
  const [loading, setLoading] = useState(true);

  // Load state from Express backend
  const loadState = async () => {
    try {
      const data = await fetchAppState();
      if (data.activeCheckpointId) {
        setActiveCheckpointId(data.activeCheckpointId);
      }
      setTeamMembers(data.teamMembers || []);
      setTasks(data.tasks || []);
      setChatMessages(data.chatMessages || []);
      setCodeFiles(data.codeFiles || []);
      setCodeCommits(data.codeCommits || []);
      setMentorFeedbacks(data.mentorFeedbacks || []);
    } catch (err) {
      console.error('Error loading app state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();

    // Subscribe to SSE real-time stream
    const eventSource = new EventSource('/api/stream');

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
        }
      } catch (e) {
        console.error('Error parsing SSE event:', e);
      }
    };

    return () => {
      eventSource.close();
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
        onSelectMember={handleSelectRole}
        onOpenAiEvaluator={() => setIsAiEvaluatorOpen(true)}
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
