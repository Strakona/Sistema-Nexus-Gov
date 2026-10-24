import React, { useState } from 'react';
import {
  TeamIntegrations,
  GoogleDriveDoc,
  TeamMember,
} from '../../types';
import {
  updateIntegrations,
  syncGitCommits,
  addDriveDocument,
  deleteDriveDocument,
  pingVercelDeployment,
} from '../../services/api';
import {
  Github,
  HardDrive,
  Triangle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  Presentation,
  Table,
  Folder,
  FileCheck,
  Globe,
  Radio,
  Zap,
  Sparkles,
  Link2,
  CheckCircle2,
  AlertCircle,
  Clock,
  GitBranch,
  GitCommit,
  Share2,
} from 'lucide-react';

interface IntegrationsHubProps {
  integrations: TeamIntegrations;
  activeMember: TeamMember;
  onRefresh: () => void;
}

export default function IntegrationsHub({
  integrations,
  activeMember,
  onRefresh,
}: IntegrationsHubProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSyncingGit, setIsSyncingGit] = useState(false);
  const [isPingingVercel, setIsPingingVercel] = useState(false);
  const [vercelPingResult, setVercelPingResult] = useState<{
    ok?: boolean;
    latency?: number;
    error?: string;
  } | null>(null);

  // Edit modals/forms state
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocType, setNewDocType] = useState<GoogleDriveDoc['type']>('presentation');
  const [newDocCategory, setNewDocCategory] = useState<GoogleDriveDoc['category']>('pitch');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);

  // Edit settings
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [githubRepoUrl, setGithubRepoUrl] = useState(integrations.github?.repoUrl || 'https://github.com/Strakona/Sistema-Nexus-Gov');
  const [githubBranch, setGithubBranch] = useState(integrations.github?.branch || 'main');

  const [isEditingVercel, setIsEditingVercel] = useState(false);
  const [vercelUrl, setVercelUrl] = useState(integrations.vercel?.deploymentUrl || 'https://sistema-nexus-gov.vercel.app');

  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('all');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleSyncGit = async () => {
    setIsSyncingGit(true);
    try {
      await syncGitCommits();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsSyncingGit(false), 600);
    }
  };

  const handleSaveGithub = async () => {
    try {
      await updateIntegrations({
        github: {
          repoUrl: githubRepoUrl,
          branch: githubBranch,
          status: 'connected',
        },
        updatedBy: activeMember.name,
      });
      setIsEditingGithub(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveVercel = async () => {
    try {
      await updateIntegrations({
        vercel: {
          deploymentUrl: vercelUrl,
          previewUrl: vercelUrl,
          status: 'ready',
        },
        updatedBy: activeMember.name,
      });
      setIsEditingVercel(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePingVercel = async () => {
    setIsPingingVercel(true);
    setVercelPingResult(null);
    try {
      const res = await pingVercelDeployment(integrations.vercel?.deploymentUrl);
      if (res.success && res.ok) {
        setVercelPingResult({ ok: true, latency: res.latency });
      } else {
        setVercelPingResult({ ok: false, error: res.error || 'Aguardando publicação' });
      }
      onRefresh();
    } catch (err: any) {
      setVercelPingResult({ ok: false, error: err.message });
    } finally {
      setIsPingingVercel(false);
    }
  };

  const handleAddDriveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocUrl.trim()) return;

    setIsSubmittingDoc(true);
    try {
      await addDriveDocument({
        title: newDocTitle,
        url: newDocUrl,
        type: newDocType,
        category: newDocCategory,
        description: newDocDesc,
        addedBy: `${activeMember.name} (${activeMember.role.toUpperCase()})`,
      });
      setNewDocTitle('');
      setNewDocUrl('');
      setNewDocDesc('');
      setIsAddDocOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleDeleteDriveDoc = async (id: string) => {
    try {
      await deleteDriveDocument(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'presentation':
        return <Presentation className="w-4 h-4 text-amber-400" />;
      case 'spreadsheet':
        return <Table className="w-4 h-4 text-emerald-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'pdf':
        return <FileCheck className="w-4 h-4 text-rose-400" />;
      case 'folder':
        return <Folder className="w-4 h-4 text-cyan-400" />;
      default:
        return <Link2 className="w-4 h-4 text-purple-400" />;
    }
  };

  const filteredDocs = (integrations.googleDrive?.sharedDocs || []).filter((doc) => {
    if (docCategoryFilter === 'all') return true;
    return doc.category === docCategoryFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3">
              <Share2 className="w-3.5 h-3.5" />
              <span>Sincronização em Tempo Real (SSE) Ativa</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Hub de Conexões da Equipe</span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-normal">
                ● 3 Serviços Integrados
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Repositório GitHub, Pasta Central do Google Drive e Deploy Vercel compartilhados para todos os membros da <strong className="text-cyan-300">Nexus DC Br</strong>. Qualquer link adicionado aqui atualiza as telas de toda a equipe instantaneamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSyncGit}
              disabled={isSyncingGit}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGit ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isSyncingGit ? 'Sincronizando...' : 'Sincronizar Git'}</span>
            </button>

            <button
              onClick={() => setIsAddDocOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Compartilhar Link / Doc</span>
            </button>
          </div>
        </div>

        {/* Status Indicators Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="p-2 bg-slate-800 rounded-lg text-white">
              <Github className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase font-bold text-slate-400">GitHub Repo</div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {integrations.github?.repoName || 'Strakona/Sistema-Nexus-Gov'}
              </div>
            </div>
            <span className="ml-auto flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase font-bold text-slate-400">Google Drive</div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {integrations.googleDrive?.sharedDocs?.length || 4} Arquivos Ativos
              </div>
            </div>
            <span className="ml-auto flex h-2 w-2 relative">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="p-2 bg-slate-800 rounded-lg text-white">
              <Triangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase font-bold text-slate-400">Vercel Deploy</div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {integrations.vercel?.status === 'ready' ? 'Online / Pronto' : 'Configurado'}
              </div>
            </div>
            <span className="ml-auto flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </div>
        </div>
      </div>

      {/* Main 3 Service Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. GITHUB INTEGRATION CARD */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-800 rounded-xl text-white">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>GitHub</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                      CONECTADO
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Repositório Oficial do Projeto</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditingGithub(!isEditingGithub)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                {isEditingGithub ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {/* Edit form */}
            {isEditingGithub ? (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">URL do Repositório</label>
                  <input
                    type="text"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Branch Principal</label>
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={handleSaveGithub}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 py-1.5 rounded-lg text-xs font-semibold text-white transition"
                >
                  Salvar para Todos da Equipe
                </button>
              </div>
            ) : (
              /* Repo details */
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
                    <span>Repositório</span>
                    <span className="flex items-center gap-1 font-mono text-cyan-400">
                      <GitBranch className="w-3 h-3" />
                      {integrations.github?.branch || 'main'}
                    </span>
                  </div>
                  <a
                    href={integrations.github?.repoUrl || 'https://github.com/Strakona/Sistema-Nexus-Gov'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 break-all flex items-center gap-1"
                  >
                    <span>{integrations.github?.repoUrl || 'https://github.com/Strakona/Sistema-Nexus-Gov'}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>

                {/* Latest Commit Box */}
                {integrations.github?.latestCommit && (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <GitCommit className="w-3 h-3 text-cyan-400" />
                        Último Commit
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px] font-bold">
                        {integrations.github.latestCommit.hash}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200 line-clamp-2">
                      {integrations.github.latestCommit.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>Autor: {integrations.github.latestCommit.author}</span>
                      <span>{integrations.github.latestCommit.date ? 'Registrado no Git' : ''}</span>
                    </div>
                  </div>
                )}

                {/* Recent Commits Feed */}
                {integrations.github?.recentCommits && integrations.github.recentCommits.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center justify-between">
                      <span>Histórico Recente</span>
                      <button
                        onClick={handleSyncGit}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        Atualizar
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-none">
                      {integrations.github.recentCommits.slice(0, 3).map((commit, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/50 flex items-center justify-between text-xs gap-2"
                        >
                          <div className="truncate">
                            <span className="font-mono text-cyan-400 text-[10px] font-bold mr-1.5">
                              {commit.hash}
                            </span>
                            <span className="text-slate-300 text-[11px]">{commit.message}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">
                            {commit.author}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
            <a
              href={integrations.github?.repoUrl || 'https://github.com/Strakona/Sistema-Nexus-Gov'}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-xs font-semibold text-slate-100 border border-slate-700 transition"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Abrir no GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => copyToClipboard(integrations.github?.repoUrl || 'https://github.com/Strakona/Sistema-Nexus-Gov.git', 'github')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 transition"
              title="Copiar URL de Clone"
            >
              {copiedKey === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'github' ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>
        </div>

        {/* 2. GOOGLE DRIVE CARD */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Google Drive</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-bold">
                      ATIVO
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Slides, Regulamento e Pesquisas</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddDocOpen(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Folder link banner */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Folder className="w-3 h-3 text-amber-400" />
                  Pasta Principal da Equipe
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                  Nexus GovTech 2026 - Repositório Central
                </div>
              </div>
              <a
                href={integrations.googleDrive?.folderUrl || 'https://drive.google.com/drive/folders/nexus-govtech-2026'}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Acessar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'pitch', label: 'Pitch Deck' },
                { id: 'validation', label: 'Validação' },
                { id: 'regulation', label: 'Regulamento' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setDocCategoryFilter(cat.id)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition ${
                    docCategoryFilter === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Document list */}
            <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-none">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 bg-slate-950/60 hover:bg-slate-950/90 rounded-xl border border-slate-800/80 transition group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="mt-0.5 p-1 rounded bg-slate-900 border border-slate-800 flex-shrink-0">
                        {getDocIcon(doc.type)}
                      </div>
                      <div className="min-w-0">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-slate-200 hover:text-cyan-300 transition truncate block"
                        >
                          {doc.title}
                        </a>
                        {doc.description && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                          {doc.addedBy && <span>Por {doc.addedBy}</span>}
                          <span>•</span>
                          <span>{doc.updatedAt || 'Hoje'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition flex-shrink-0">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
                        title="Abrir no Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(doc.url, doc.id)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-300 transition"
                        title="Copiar Link"
                      >
                        {copiedKey === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteDriveDoc(doc.id)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition"
                        title="Remover"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setIsAddDocOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 py-2 rounded-xl text-xs font-semibold text-white shadow-lg shadow-amber-950/30 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Novo Documento / Slide</span>
            </button>
          </div>
        </div>

        {/* 3. VERCEL DEPLOY CARD */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-800 rounded-xl text-white">
                  <Triangle className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Vercel</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ONLINE / READY
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Deploy em Nuvem para a Banca</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditingVercel(!isEditingVercel)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                {isEditingVercel ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {/* Edit form */}
            {isEditingVercel ? (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">URL do Deploy</label>
                  <input
                    type="text"
                    value={vercelUrl}
                    onChange={(e) => setVercelUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={handleSaveVercel}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 py-1.5 rounded-lg text-xs font-semibold text-white transition"
                >
                  Salvar URL de Deploy
                </button>
              </div>
            ) : (
              /* Deployment details */
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
                    <span>Ambiente</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Produção (main)
                    </span>
                  </div>
                  <a
                    href={integrations.vercel?.deploymentUrl || 'https://sistema-nexus-gov.vercel.app'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-cyan-300 hover:text-cyan-200 break-all flex items-center gap-1"
                  >
                    <span>{integrations.vercel?.deploymentUrl || 'https://sistema-nexus-gov.vercel.app'}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>

                {/* Status & Latency Box */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Status do Host
                    </span>
                    <span className="font-semibold text-emerald-400">Ativo & Respondendo</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Último Build Sincronizado</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {integrations.vercel?.commitHash || 'ace58be'}
                    </span>
                  </div>

                  {vercelPingResult && (
                    <div
                      className={`p-2 rounded-lg text-[11px] flex items-center justify-between ${
                        vercelPingResult.ok
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                      }`}
                    >
                      <span>{vercelPingResult.ok ? '✓ Teste HTTP 200 OK' : 'Falha na resposta'}</span>
                      {vercelPingResult.latency && <span>{vercelPingResult.latency}ms</span>}
                      {vercelPingResult.error && <span>{vercelPingResult.error}</span>}
                    </div>
                  )}
                </div>

                {/* Quick Deploy Guide Box */}
                <div className="p-3 bg-gradient-to-br from-slate-950 to-cyan-950/30 rounded-xl border border-cyan-900/30 text-xs">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Conectar à Vercel em 1 Clique</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    No painel da Vercel, clique em <strong>Add New Project</strong>, selecione o repositório <strong>Strakona/Sistema-Nexus-Gov</strong> e configure a variável de ambiente <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">GEMINI_API_KEY</code>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
            <a
              href={integrations.vercel?.deploymentUrl || 'https://sistema-nexus-gov.vercel.app'}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 py-2 rounded-xl text-xs font-semibold text-white shadow-lg shadow-cyan-950/30 transition active:scale-95"
            >
              <span>Abrir Deploy</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handlePingVercel}
              disabled={isPingingVercel}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50"
              title="Testar Conexão / Ping"
            >
              <Zap className={`w-3.5 h-3.5 ${isPingingVercel ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
              <span>{isPingingVercel ? 'Testando...' : 'Ping'}</span>
            </button>

            <button
              onClick={() => copyToClipboard(integrations.vercel?.deploymentUrl || 'https://sistema-nexus-gov.vercel.app', 'vercel')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 transition"
              title="Copiar Link para a Banca"
            >
              {copiedKey === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'vercel' ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: Adicionar Documento / Link do Drive */}
      {isAddDocOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Compartilhar com a Equipe</h3>
                  <p className="text-xs text-slate-400">O link ficará visível em tempo real para todos</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDocOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDriveDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Documento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pitch Deck Oficial SEBRAE 2026"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL (Google Drive, Docs, Sheets, Slides ou Web)</label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/presentation/d/..."
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Arquivo</label>
                  <select
                    value={newDocType}
                    onChange={(e: any) => setNewDocType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="presentation">📊 Google Slides / Apresentação</option>
                    <option value="document">📄 Google Docs / Documento</option>
                    <option value="spreadsheet">📈 Google Sheets / Planilha</option>
                    <option value="folder">📁 Pasta no Google Drive</option>
                    <option value="pdf">📑 PDF / Edital</option>
                    <option value="link">🔗 Link Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={newDocCategory}
                    onChange={(e: any) => setNewDocCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="pitch">Apresentação & Pitch</option>
                    <option value="validation">Validação UX & Pesquisa</option>
                    <option value="regulation">Regulamento & Jurídico</option>
                    <option value="general">Geral / Equipe</option>
                    <option value="design">Design & Protótipo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição Breve (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Versão revisada com orientações da mentoria do SEBRAE"
                  value={newDocDesc}
                  onChange={(e) => setNewDocDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDocOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDoc}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
                >
                  {isSubmittingDoc ? 'Publicando...' : 'Compartilhar com a Equipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
