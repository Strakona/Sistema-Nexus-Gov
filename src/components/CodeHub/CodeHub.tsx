import React, { useState } from 'react';
import { CodeFile, CodeCommit, TeamMember } from '../../types';
import { saveCodeFile, commitCodeChange, mergeCodeModules, askAiCopilot } from '../../services/api';
import {
  Code2,
  GitCommit,
  GitMerge,
  Play,
  Download,
  Plus,
  Save,
  CheckCircle2,
  History,
  FileCode,
  Eye,
  Sparkles,
  Copy,
  Check,
  Split,
  Github,
  ExternalLink,
} from 'lucide-react';

interface CodeHubProps {
  codeFiles: CodeFile[];
  codeCommits: CodeCommit[];
  activeMember: TeamMember;
  onRefreshState: () => void;
}

export default function CodeHub({
  codeFiles,
  codeCommits,
  activeMember,
  onRefreshState,
}: CodeHubProps) {
  const [selectedFileId, setSelectedFileId] = useState<string>(codeFiles[0]?.id || '');
  const [editorContent, setEditorContent] = useState<string>(codeFiles[0]?.content || '');
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'commits' | 'merge' | 'preview'>('editor');
  
  // New File state
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState('src/modules/NovoModulo.tsx');

  // Merge state
  const [selectedMergeFileIds, setSelectedMergeFileIds] = useState<string[]>([]);
  const [mergedFileName, setMergedFileName] = useState('src/build/ModuloUnificado.tsx');

  // Diff state
  const [selectedCommitForDiff, setSelectedCommitForDiff] = useState<CodeCommit | null>(null);

  // Copilot state
  const [aiWorking, setAiWorking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync editor content when file selection changes
  const activeFile = codeFiles.find((f) => f.id === selectedFileId) || codeFiles[0];

  const handleSelectFile = (file: CodeFile) => {
    setSelectedFileId(file.id);
    setEditorContent(file.content);
    setSelectedCommitForDiff(null);
  };

  const handleSaveFile = async () => {
    if (!activeFile) return;
    await saveCodeFile({
      fileId: activeFile.id,
      path: activeFile.path,
      content: editorContent,
      language: activeFile.language,
      modifiedBy: `${activeMember.name} (${activeMember.roleTitle})`,
    });
    onRefreshState();
  };

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFile || !commitMessage.trim()) return;

    await commitCodeChange({
      fileId: activeFile.id,
      authorId: activeMember.id,
      authorName: activeMember.name,
      message: commitMessage,
      content: editorContent,
    });

    setCommitMessage('');
    onRefreshState();
  };

  const handleCreateFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;

    const initialTemplate = `// Módulo criado por ${activeMember.name} (${activeMember.roleTitle})
import React from 'react';

export default function ${newFilePath.split('/').pop()?.replace('.tsx', '') || 'NovoModulo'}() {
  return (
    <div className="p-4 bg-slate-900 text-white rounded-lg border border-slate-800">
      <h3 className="text-sm font-bold text-cyan-400">Novo Módulo GovTech</h3>
      <p className="text-xs text-slate-300">Construído durante o Hackathon GovTech 2026.</p>
    </div>
  );
}`;

    const result = await saveCodeFile({
      path: newFilePath,
      content: initialTemplate,
      language: newFilePath.endsWith('.ts') || newFilePath.endsWith('.tsx') ? 'typescript' : 'javascript',
      modifiedBy: activeMember.name,
    });

    setIsCreatingFile(false);
    onRefreshState();
    if (result.file) {
      setSelectedFileId(result.file.id);
      setEditorContent(result.file.content);
    }
  };

  const handleMergeSubmit = async () => {
    if (selectedMergeFileIds.length < 2) return;
    await mergeCodeModules(selectedMergeFileIds, mergedFileName);
    onRefreshState();
    setActiveSubTab('editor');
  };

  const handleAskAiFix = async () => {
    setAiWorking(true);
    try {
      const response = await askAiCopilot(
        `Revise este código React/TypeScript para a solução GovTech do Hackathon Cianorte. Otimize a usabilidade e garanta que não haja erros de sintaxe:\n\n${editorContent}`,
        'code'
      );
      if (response.text) {
        // Extract code snippet from response if markdown code block exists
        const codeMatch = response.text.match(/```(?:typescript|tsx|javascript|jsx)?\n([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          setEditorContent(codeMatch[1].trim());
        } else {
          setEditorContent(`// Código Otimizado com Gemini AI:\n${response.text}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiWorking(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter commits for active file
  const activeFileCommits = codeCommits.filter((c) => c.fileId === activeFile?.id);

  // Compute simple visual line diff
  const computeDiffLines = () => {
    if (!selectedCommitForDiff) return [];
    const currentLines = editorContent.split('\n');
    const oldLines = (selectedCommitForDiff.previousContent || '').split('\n');

    const diff = [];
    const max = Math.max(currentLines.length, oldLines.length);

    for (let i = 0; i < max; i++) {
      const cur = currentLines[i];
      const old = oldLines[i];

      if (cur === old) {
        diff.push({ type: 'same', text: cur, lineNum: i + 1 });
      } else {
        if (old !== undefined) diff.push({ type: 'removed', text: old, lineNum: i + 1 });
        if (cur !== undefined) diff.push({ type: 'added', text: cur, lineNum: i + 1 });
      }
    }
    return diff;
  };

  return (
    <div className="space-y-6">
      
      {/* Code Hub Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex flex-wrap items-center gap-2">
              <span>Code Hub & Integration Weaver</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Tempo Real Sync
              </span>
              <a
                href="https://github.com/Strakona/Sistema-Nexus-Gov"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 border border-slate-700 transition"
                title="Abrir repositório no GitHub"
              >
                <Github className="w-3 h-3 text-white" />
                <span className="font-mono">Strakona/Sistema-Nexus-Gov</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>
            </h2>
            <p className="text-xs text-slate-400">
              Desenvolva módulos, versione alterações em tempo real e una os componentes da equipe no MVP.
            </p>
          </div>
        </div>

        {/* Sub Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'editor'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Editor Live</span>
          </button>

          <button
            onClick={() => setActiveSubTab('commits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'commits'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Commits & Diff ({activeFileCommits.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('merge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'merge'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Juntar Partes (Merge)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'preview'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Executar Protótipo</span>
          </button>
        </div>
      </div>

      {/* Main Grid: File List Sidebar + Editor / View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Files Tree */}
        <div className="lg:col-span-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Arquivos do Projeto ({codeFiles.length})</span>
            </h3>
            <button
              onClick={() => setIsCreatingFile(true)}
              className="p-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 rounded-lg transition"
              title="Novo Módulo"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Create File Form */}
          {isCreatingFile && (
            <form onSubmit={handleCreateFileSubmit} className="p-3 bg-slate-950 rounded-xl border border-cyan-800/60 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-cyan-400">Novo Módulo (Caminho):</label>
              <input
                type="text"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingFile(false)}
                  className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold rounded-lg"
                >
                  Criar Módulo
                </button>
              </div>
            </form>
          )}

          {/* File Items List */}
          <div className="space-y-1.5">
            {codeFiles.map((file) => {
              const isSelected = file.id === activeFile?.id;
              return (
                <button
                  key={file.id}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between border ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-medium shadow-md'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-mono truncate">{file.path}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {file.lastModifiedBy}
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-800/40 text-xs text-cyan-200 space-y-1">
            <span className="font-bold flex items-center gap-1 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Sincronização em Dupla/Trio:
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Qualquer alteração salva ou commitada aqui é transmitida instantaneamente para todos os 3 colegas de equipe.
            </p>
          </div>
        </div>

        {/* Right Area: Code Editor or Commits or Merge or Preview */}
        <div className="lg:col-span-3 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl min-h-[550px] flex flex-col">
          
          {/* TAB 1: EDITOR LIVE */}
          {activeSubTab === 'editor' && (
            <div className="space-y-4 flex-1 flex flex-col">
              
              {/* File Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-slate-200">{activeFile?.path}</span>
                  <span className="text-[10px] text-slate-500">• Modificado por {activeFile?.lastModifiedBy}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleAskAiFix}
                    disabled={aiWorking}
                    className="px-2.5 py-1 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 rounded-lg text-xs flex items-center gap-1 transition disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                    <span>{aiWorking ? 'IA Analisando...' : 'Otimizar com Gemini'}</span>
                  </button>

                  <button
                    onClick={handleSaveFile}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Rascunho</span>
                  </button>
                </div>
              </div>

              {/* Textarea Code Editor */}
              <div className="relative flex-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-hidden flex">
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full h-full p-4 bg-transparent text-emerald-300 focus:outline-none resize-none leading-relaxed font-mono"
                  spellCheck={false}
                  placeholder="// Digite ou cole o código do seu módulo aqui..."
                />
              </div>

              {/* Commit Creation Form */}
              <form onSubmit={handleCommit} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium whitespace-nowrap">
                  <GitCommit className="w-4 h-4 text-cyan-400" />
                  <span>Nova Versão / Commit:</span>
                </div>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Ex: Implementei o fluxo de protocolo e validação LGPD"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!commitMessage.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Commitar Registro</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: COMMITS & DIFF */}
          {activeSubTab === 'commits' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Histórico de Versionamento - {activeFile?.path}</span>
              </h3>

              {activeFileCommits.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  Nenhum commit registrado ainda para este arquivo. Faça o primeiro na aba "Editor Live"!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Commits List */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {activeFileCommits.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCommitForDiff(c)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                          selectedCommitForDiff?.id === c.id
                            ? 'bg-cyan-950 border-cyan-500/80 text-cyan-200 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-cyan-400">{c.authorName}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-100 mb-1">{c.message}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {c.id}</div>
                      </div>
                    ))}
                  </div>

                  {/* Visual Line Diff Panel */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col font-mono text-[11px] max-h-[400px] overflow-y-auto">
                    <div className="text-xs font-bold text-slate-300 mb-2 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                      <Split className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Comparador Visual (Diff)</span>
                    </div>

                    {!selectedCommitForDiff ? (
                      <div className="text-slate-500 text-center my-auto p-4">
                        Selecione um commit da lista ao lado para ver as alterações comparadas linha a linha.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {computeDiffLines().map((line, idx) => (
                          <div
                            key={idx}
                            className={`px-2 py-0.5 rounded flex items-center gap-2 ${
                              line.type === 'added'
                                ? 'bg-emerald-950/80 text-emerald-300 border-l-2 border-emerald-500'
                                : line.type === 'removed'
                                ? 'bg-rose-950/80 text-rose-300 border-l-2 border-rose-500 line-through'
                                : 'text-slate-400'
                            }`}
                          >
                            <span className="text-[9px] text-slate-600 select-none w-6">{line.lineNum}</span>
                            <span className="whitespace-pre-wrap">{line.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MERGE MODULES ("JUNTANDO AS PARTES") */}
          {activeSubTab === 'merge' && (
            <div className="space-y-5">
              <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl">
                <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2 mb-1">
                  <GitMerge className="w-4 h-4 text-purple-400" />
                  <span>Sintetizador & Unificador de Módulos ("Juntando as Partes")</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Combine os códigos e funções construídos por cada um dos 3 integrantes em um único pacote unificado para o protótipo do Hackathon!
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  1. Selecione os arquivos para unificar:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {codeFiles.map((file) => {
                    const isChecked = selectedMergeFileIds.includes(file.id);
                    return (
                      <label
                        key={file.id}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition text-xs ${
                          isChecked
                            ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMergeFileIds([...selectedMergeFileIds, file.id]);
                            } else {
                              setSelectedMergeFileIds(selectedMergeFileIds.filter((id) => id !== file.id));
                            }
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="truncate">
                          <div className="font-mono font-bold text-slate-200">{file.path}</div>
                          <div className="text-[10px] text-slate-500">Autor: {file.lastModifiedBy}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  2. Nome do arquivo consolidado de saída:
                </label>
                <input
                  type="text"
                  value={mergedFileName}
                  onChange={(e) => setMergedFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleMergeSubmit}
                disabled={selectedMergeFileIds.length < 2}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <GitMerge className="w-4 h-4" />
                <span>Unificar Módulos e Gerar Bundle do Protótipo</span>
              </button>
            </div>
          )}

          {/* TAB 4: PREVIEW / SANDBOX RUNNER */}
          {activeSubTab === 'preview' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Execução do Protótipo GovTech Cianorte (Sandbox)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  ● Status: Ativo
                </span>
              </div>

              {/* Simulated Live Render Screen */}
              <div className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-6">
                <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div>
                    <h3 className="text-base font-extrabold text-cyan-400">
                      Prefeitura Municipal de Cianorte - Atendimento GovTech
                    </h3>
                    <p className="text-xs text-slate-400">
                      Protótipo MVP da Equipe Nexus DC Br para o Hackathon GovTech 2026
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full text-xs font-mono font-bold">
                      Protocolo Digital #2026-NEXUS
                    </span>
                  </div>
                </div>

                {/* Simulated interactive component */}
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Solicitação Rápida de Serviços Públicos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center hover:border-cyan-500/50 cursor-pointer transition">
                      <div className="text-lg mb-1">🚧</div>
                      <div className="text-xs font-bold text-slate-200">Tapa Buraco / Asfalto</div>
                      <div className="text-[10px] text-slate-500">Secretaria de Obras</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center hover:border-cyan-500/50 cursor-pointer transition">
                      <div className="text-lg mb-1">💡</div>
                      <div className="text-xs font-bold text-slate-200">Iluminação LED</div>
                      <div className="text-[10px] text-slate-500">Infraestrutura</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center hover:border-cyan-500/50 cursor-pointer transition">
                      <div className="text-lg mb-1">🌳</div>
                      <div className="text-xs font-bold text-slate-200">Poda e Limpeza</div>
                      <div className="text-[10px] text-slate-500">Meio Ambiente</div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                    <span>✓ Validação LGPD em tempo real & Triagem Algorítmica</span>
                    <span className="font-mono text-[10px]">Tempo Médio de Atendimento: -65%</span>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-500 font-mono pt-4 border-t border-slate-900">
                  Protótipo funcional rodando diretamente com dados anonimizados em compliance com o Edital Cianorte 2026.
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
