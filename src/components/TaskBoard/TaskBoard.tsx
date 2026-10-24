import React, { useState } from 'react';
import { Task, TaskStatus, RoleType, TeamMember, CheckpointInfo } from '../../types';
import { createTask, updateTask } from '../../services/api';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  Tag,
  AlertCircle,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  activeMember: TeamMember;
  onRefreshState: () => void;
}

const CHECKPOINTS: CheckpointInfo[] = [
  {
    id: 1,
    name: 'Check-Point 1: Persona e Problema',
    timeRange: '10h30 - 10h40',
    description: 'Apresentar público afetado e relevância da dor.',
    deliverable: 'Mapeamento das dores e perfil de servidores/munícipes',
    relatedCriteria: ['Critério 1: Persona e Problema'],
    isCompleted: true,
  },
  {
    id: 2,
    name: 'Check-Point 2: Validação do Problema',
    timeRange: '11h20 - 11h30',
    description: 'Apresentar evidências e dados da dor investigada com mentores.',
    deliverable: 'Relatório de entrevistas e dados quantitativos de tempo/custo',
    relatedCriteria: ['Critério 2: Validação do Problema'],
    isCompleted: true,
  },
  {
    id: 3,
    name: 'Check-Point 3: Proposta de Valor',
    timeRange: '12h10 - 12h20',
    description: 'Apresentar a promessa da solução e valor gerado para Cianorte.',
    deliverable: 'Declaração formal de Proposta de Valor e economia estimada',
    relatedCriteria: ['Critério 3: Proposta de Valor'],
    isCompleted: true,
  },
  {
    id: 4,
    name: 'Check-Point 4: Teste de Interesse',
    timeRange: '12h20 - 13h00',
    description: 'Apresentar adesão, aceitação e intenção de uso real.',
    deliverable: 'Formulário relâmpago rodado com respostas e depoimentos',
    relatedCriteria: ['Critério 4: Teste de Interesse'],
    isCompleted: false,
  },
  {
    id: 5,
    name: 'Check-Point 5: MVP e Validação',
    timeRange: '15h30 - 15h40',
    description: 'Apresentar o protótipo interativo e evidências de teste prático.',
    deliverable: 'Web App funcional com telas, cadastro e fluxo de triagem',
    relatedCriteria: ['Critério 5: MVP e Testagem'],
    isCompleted: false,
  },
  {
    id: 6,
    name: 'Check-Point 6: Modelo de Negócio',
    timeRange: '15h40 - 16h35',
    description: 'Apresentar sustentabilidade e viabilidade via Marco Legal.',
    deliverable: 'Modelagem SaaS Municipal / Economia no Orçamento',
    relatedCriteria: ['Critério 6: Modelo de Negócio'],
    isCompleted: false,
  },
  {
    id: 7,
    name: 'Check-Point 7: Pitch Deck Final',
    timeRange: '17h20 - 17h30',
    description: 'Apresentar a estrutura completa do Pitch Deck para a banca.',
    deliverable: 'Slide Deck final e oratória cronometrada em 3 min',
    relatedCriteria: ['Critério 7: Pitch'],
    isCompleted: false,
  },
];

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog do Edital', color: 'border-slate-700 bg-slate-900/40' },
  { id: 'todo', label: 'A Fazer', color: 'border-amber-500/40 bg-amber-950/10' },
  { id: 'in_progress', label: 'Em Progresso', color: 'border-cyan-500/40 bg-cyan-950/10' },
  { id: 'review', label: 'Em Revisão / Checkpoint', color: 'border-purple-500/40 bg-purple-950/10' },
  { id: 'done', label: 'Concluído', color: 'border-emerald-500/40 bg-emerald-950/10' },
];

export default function TaskBoard({
  tasks,
  teamMembers,
  activeMember,
  onRefreshState,
}: TaskBoardProps) {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<RoleType | 'all'>('all');
  const [selectedCpFilter, setSelectedCpFilter] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskRole, setNewTaskRole] = useState<RoleType>(activeMember.role);
  const [newTaskCp, setNewTaskCp] = useState<number>(5);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask({
      title: newTaskTitle,
      description: newTaskDesc,
      assignedRole: newTaskRole,
      assignedMemberId: teamMembers.find((m) => m.role === newTaskRole)?.id,
      checkpointId: newTaskCp,
      priority: newTaskPriority,
      status: 'todo',
      tags: ['GovTech', `CP${newTaskCp}`],
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsModalOpen(false);
    onRefreshState();
  };

  const handleMoveStatus = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
    onRefreshState();
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedRoleFilter !== 'all' && t.assignedRole !== selectedRoleFilter) return false;
    if (selectedCpFilter !== 'all' && t.checkpointId !== selectedCpFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Official Schedule Timeline */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              <span>Controle de Tarefas & Matriz do Edital GovTech 2026</span>
            </h2>
            <p className="text-xs text-slate-400">
              Distribuição de responsabilidades do trio (Caio / UX / Estrategista) pelos 7 Check-Points obrigatórios.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Tarefa</span>
          </button>
        </div>

        {/* Checkpoints Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Checkpoints do Evento (Cronograma Oficial)
            </span>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              3 / 7 Concluídos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {CHECKPOINTS.map((cp) => (
              <button
                key={cp.id}
                onClick={() => setSelectedCpFilter(selectedCpFilter === cp.id ? 'all' : cp.id)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  selectedCpFilter === cp.id
                    ? 'ring-2 ring-cyan-400 bg-cyan-950 border-cyan-500'
                    : cp.isCompleted
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                  <span>CP {cp.id}</span>
                  <span>{cp.timeRange.split(' - ')[0]}</span>
                </div>
                <div className="text-[11px] font-semibold truncate text-slate-200">
                  {cp.name.split(': ')[1]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filtrar Papel:</span>
          </span>

          <button
            onClick={() => setSelectedRoleFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedRoleFilter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos os 3 Papéis
          </button>

          <button
            onClick={() => setSelectedRoleFilter('tech')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedRoleFilter === 'tech'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tech Lead (Caio)
          </button>

          <button
            onClick={() => setSelectedRoleFilter('ux')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedRoleFilter === 'ux'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Líder Validação / UX
          </button>

          <button
            onClick={() => setSelectedRoleFilter('pitch')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedRoleFilter === 'pitch'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Estrategista / Pitch
          </button>

          {selectedCpFilter !== 'all' && (
            <button
              onClick={() => setSelectedCpFilter('all')}
              className="ml-auto text-xs text-cyan-400 hover:underline"
            >
              Limpar Filtro CP{selectedCpFilter}
            </button>
          )}
        </div>

      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.color} p-3 flex flex-col min-h-[500px] shadow-lg`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {col.label}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="text-center text-[11px] text-slate-500 py-8 border border-dashed border-slate-800 rounded-xl">
                    Sem tarefas nesta coluna
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = teamMembers.find((m) => m.role === task.assignedRole);

                    return (
                      <div
                        key={task.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md hover:border-cyan-500/50 transition space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-100 leading-snug">
                            {task.title}
                          </h4>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              task.priority === 'urgent'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : task.priority === 'high'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                          {task.checkpointId && (
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                              CP {task.checkpointId}
                            </span>
                          )}

                          {assignee && (
                            <div className="flex items-center gap-1.5 ml-auto">
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                              <span className="text-slate-300 font-medium">{assignee.name.split(' ')[0]}</span>
                            </div>
                          )}
                        </div>

                        {/* Status Change Quick Actions */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] opacity-90 group-hover:opacity-100">
                          {col.id !== 'todo' && col.id !== 'backlog' && (
                            <button
                              onClick={() =>
                                handleMoveStatus(
                                  task.id,
                                  col.id === 'done'
                                    ? 'review'
                                    : col.id === 'review'
                                    ? 'in_progress'
                                    : 'todo'
                                )
                              }
                              className="text-slate-400 hover:text-white"
                            >
                              ← Voltar
                            </button>
                          )}

                          {col.id !== 'done' && (
                            <button
                              onClick={() =>
                                handleMoveStatus(
                                  task.id,
                                  col.id === 'backlog' || col.id === 'todo'
                                    ? 'in_progress'
                                    : col.id === 'in_progress'
                                    ? 'review'
                                    : 'done'
                                )
                              }
                              className="ml-auto font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                            >
                              <span>Avançar</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating New Task */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Nova Tarefa do Hackathon</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título da Tarefa:</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Entrevistar mentor do SEBRAE sobre triagem de solicitações"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição / Detalhes:</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Instruções para o colega de equipe..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Responsável / Papel:</label>
                  <select
                    value={newTaskRole}
                    onChange={(e) => setNewTaskRole(e.target.value as RoleType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="tech">Tech Lead (Caio)</option>
                    <option value="ux">Líder Validação / UX</option>
                    <option value="pitch">Estrategista / Pitch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Check-Point Alvo:</label>
                  <select
                    value={newTaskCp}
                    onChange={(e) => setNewTaskCp(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((cpNum) => (
                      <option key={cpNum} value={cpNum}>
                        Check-Point {cpNum}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prioridade:</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente (Bloqueia Checkpoint)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
