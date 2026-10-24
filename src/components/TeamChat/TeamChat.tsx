import React, { useState } from 'react';
import { ChatMessage, TeamMember, MentorFeedback } from '../../types';
import { sendChatMessage, addMentorFeedback, askAiCopilot } from '../../services/api';
import {
  MessageSquare,
  Send,
  Code,
  UserCheck,
  Sparkles,
  Plus,
  Hash,
  Award,
  ChevronRight,
  Bookmark,
} from 'lucide-react';

interface TeamChatProps {
  chatMessages: ChatMessage[];
  mentorFeedbacks: MentorFeedback[];
  teamMembers: TeamMember[];
  activeMember: TeamMember;
  onRefreshState: () => void;
}

const CHANNELS = [
  { id: 'geral', name: 'geral', description: 'Canal principal da equipe Nexus DC Br' },
  { id: 'codigo-dev', name: 'codigo-dev', description: 'Desenvolvimento, APIs e componentes' },
  { id: 'validacao-ux', name: 'validacao-ux', description: 'Pesquisas, formulários e depoimentos' },
  { id: 'pitch-deck', name: 'pitch-deck', description: 'Slides, argumentos e financeira' },
  { id: 'mentores', name: 'mentores-feedback', description: 'Registros de mentoria nos Checkpoints' },
];

export default function TeamChat({
  chatMessages,
  mentorFeedbacks,
  teamMembers,
  activeMember,
  onRefreshState,
}: TeamChatProps) {
  const [selectedChannel, setSelectedChannel] = useState('geral');
  const [messageText, setMessageText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);

  // Mentor Feedback Form state
  const [isAddingFeedback, setIsAddingFeedback] = useState(false);
  const [fbMentorName, setFbMentorName] = useState('');
  const [fbArea, setFbArea] = useState('Inovação SEBRAE');
  const [fbCp, setFbCp] = useState(1);
  const [fbText, setFbText] = useState('');
  const [fbActions, setFbActions] = useState('');

  const filteredMessages = chatMessages.filter((m) => m.channel === selectedChannel);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !codeSnippet.trim()) return;

    await sendChatMessage({
      channel: selectedChannel,
      authorId: activeMember.id,
      authorName: activeMember.name,
      authorRole: activeMember.role,
      authorAvatar: activeMember.avatar,
      content: messageText,
      codeSnippet: codeSnippet.trim() ? codeSnippet : undefined,
    });

    setMessageText('');
    setCodeSnippet('');
    setShowCodeInput(false);
    onRefreshState();
  };

  const handleAskAiInChat = async () => {
    if (!messageText.trim()) return;
    setAiWorking(true);

    // First send user message
    await sendChatMessage({
      channel: selectedChannel,
      authorId: activeMember.id,
      authorName: activeMember.name,
      authorRole: activeMember.role,
      authorAvatar: activeMember.avatar,
      content: messageText,
    });

    const currentPrompt = messageText;
    setMessageText('');

    try {
      // Call Gemini AI
      const response = await askAiCopilot(
        `Pergunta da equipe no canal #${selectedChannel}: "${currentPrompt}". Responda de forma objetiva para o Hackathon GovTech Cianorte.`,
        selectedChannel === 'validacao-ux' ? 'survey' : selectedChannel === 'codigo-dev' ? 'code' : 'pitch'
      );

      // Send AI response to chat
      if (response.text) {
        await sendChatMessage({
          channel: selectedChannel,
          authorId: 'gemini-bot',
          authorName: 'Gemini Copilot',
          authorRole: 'all',
          authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          content: response.text,
          isAi: true,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiWorking(false);
      onRefreshState();
    }
  };

  const handleCreateFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMentorName.trim() || !fbText.trim()) return;

    const actionList = fbActions
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);

    await addMentorFeedback({
      checkpointId: fbCp,
      mentorName: fbMentorName,
      area: fbArea,
      feedback: fbText,
      actionItems: actionList,
    });

    // Also share a notice in the #mentores-feedback chat channel!
    await sendChatMessage({
      channel: 'mentores',
      authorId: activeMember.id,
      authorName: activeMember.name,
      authorRole: activeMember.role,
      authorAvatar: activeMember.avatar,
      content: `📝 Novo feedback registrado do mentor ${fbMentorName} (CP ${fbCp}): "${fbText.slice(0, 100)}..."`,
    });

    setFbMentorName('');
    setFbText('');
    setFbActions('');
    setIsAddingFeedback(false);
    onRefreshState();
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        
        {/* Left Sidebar: Channels List */}
        <div className="lg:col-span-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Canais de Comunicação</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Equipe Nexus DC Br</p>
          </div>

          <div className="space-y-1.5">
            {CHANNELS.map((ch) => {
              const isSelected = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition flex items-center justify-between border ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-bold shadow-md'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{ch.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Team Presence */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Integrantes Ativos ({teamMembers.length})
            </h4>
            <div className="space-y-2">
              {teamMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-slate-200 text-[11px]">{m.name}</div>
                      <div className="text-[9px] text-cyan-400">{m.roleTitle}</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-950"></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Chat or Mentors Log Area */}
        <div className="lg:col-span-3 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          
          {selectedChannel === 'mentores' ? (
            /* SPECIAL TAB: MENTORSHIP NOTES & FEEDBACK LOGGER */
            <div className="space-y-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">
                      Diário de Mentoria & Orientação dos Checkpoints
                    </h3>
                    <p className="text-xs text-slate-400">
                      Registre conselhos dos mentores do SEBRAE e Prefeitura durante os Checkpoints 1 a 7.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingFeedback(!isAddingFeedback)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Feedback</span>
                </button>
              </div>

              {/* Form to log new feedback */}
              {isAddingFeedback && (
                <form onSubmit={handleCreateFeedbackSubmit} className="p-4 bg-slate-950 rounded-2xl border border-amber-800/60 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Nome do Mentor:</label>
                      <input
                        type="text"
                        value={fbMentorName}
                        onChange={(e) => setFbMentorName(e.target.value)}
                        placeholder="Ex: Carlos (Consultor SEBRAE)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Área do Mentor:</label>
                      <input
                        type="text"
                        value={fbArea}
                        onChange={(e) => setFbArea(e.target.value)}
                        placeholder="Ex: Gestão Pública / Inovação"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Check-Point:</label>
                      <select
                        value={fbCp}
                        onChange={(e) => setFbCp(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <option key={num} value={num}>
                            Check-Point {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Feedback do Mentor:</label>
                    <textarea
                      value={fbText}
                      onChange={(e) => setFbText(e.target.value)}
                      placeholder="O que o mentor sugeriu ajustar no projeto..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Ações Práticas da Equipe (1 por linha):
                    </label>
                    <textarea
                      value={fbActions}
                      onChange={(e) => setFbActions(e.target.value)}
                      placeholder="Ex: Alterar o Slide 4 do Pitch&#10;Adicionar campo de protocolo na API"
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingFeedback(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md"
                    >
                      Salvar Orientação
                    </button>
                  </div>
                </form>
              )}

              {/* Feedbacks List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {mentorFeedbacks.length === 0 ? (
                  <div className="text-center text-xs text-slate-500 py-12 border border-dashed border-slate-800 rounded-xl">
                    Nenhum feedback de mentor registrado ainda. Clique em "Registrar Feedback" acima!
                  </div>
                ) : (
                  mentorFeedbacks.map((fb) => (
                    <div key={fb.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 text-xs">{fb.mentorName}</span>
                          <span className="text-[10px] text-slate-400">({fb.area})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold">
                          Check-Point {fb.checkpointId}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed italic">
                        "{fb.feedback}"
                      </p>

                      {fb.actionItems && fb.actionItems.length > 0 && (
                        <div className="pt-2 border-t border-slate-900 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Ações Práticas:</span>
                          <ul className="space-y-1">
                            {fb.actionItems.map((item, idx) => (
                              <li key={idx} className="text-xs text-cyan-300 flex items-center gap-1.5">
                                <ChevronRight className="w-3 h-3 text-cyan-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* STANDARD CHANNEL CHAT AREA */
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              
              {/* Channel Header */}
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-slate-100">{selectedChannel}</span>
                  <span className="text-xs text-slate-500">
                    — {CHANNELS.find((c) => c.id === selectedChannel)?.description}
                  </span>
                </div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[350px] max-h-[450px]">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border transition space-y-1.5 ${
                      msg.isAi
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-100'
                        : 'bg-slate-950/70 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img src={msg.authorAvatar} alt={msg.authorName} className="w-5 h-5 rounded-full object-cover" />
                        <span className="font-bold text-slate-200">{msg.authorName}</span>
                        {msg.isAi && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono border border-cyan-500/30">
                            AI Copilot
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    </div>

                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {msg.codeSnippet && (
                      <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                        <pre>{msg.codeSnippet}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Form Area */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                {showCodeInput && (
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">Compartilhar Trecho de Código:</span>
                    <textarea
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      placeholder="// Cole o código aqui..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-emerald-300 focus:outline-none"
                    />
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    className={`p-2.5 rounded-xl border transition ${
                      showCodeInput ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Inserir Código"
                  >
                    <Code className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Mensagem no canal #${selectedChannel}...`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />

                  <button
                    type="button"
                    onClick={handleAskAiInChat}
                    disabled={aiWorking || !messageText.trim()}
                    className="px-3 py-2.5 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 font-semibold text-xs rounded-xl flex items-center gap-1 transition disabled:opacity-40"
                    title="Perguntar ao Gemini Copilot"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                    <span className="hidden sm:inline">Copilot</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!messageText.trim() && !codeSnippet.trim()}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
