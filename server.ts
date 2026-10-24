import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Active Hackathon Checkpoint Stage State
let activeCheckpointId = 1; // 1 to 7

// Default Mock In-Memory Data for Hackathon Nexus DC Br
let teamMembers = [
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

let tasks = [
  {
    id: 'task-1',
    title: 'Mapear Persona e Dores dos Servidores Municipais',
    description: 'Entrevistar mentores da Prefeitura de Cianorte para quantificar horas perdidas em processos manuais.',
    assignedRole: 'ux',
    assignedMemberId: 'member-2',
    checkpointId: 1,
    criterionId: 1,
    status: 'done',
    priority: 'high',
    createdAt: new Date().toISOString(),
    tags: ['UX', 'Persona', 'Cianorte'],
  },
  {
    id: 'task-2',
    title: 'Formulário Relâmpago de Teste de Interesse',
    description: 'Criar e disparar formulário com servidores para colher intenção de uso real da solução GovTech.',
    assignedRole: 'ux',
    assignedMemberId: 'member-2',
    checkpointId: 4,
    criterionId: 4,
    status: 'in_progress',
    priority: 'urgent',
    createdAt: new Date().toISOString(),
    tags: ['Validação', 'Pesquisa', 'LGPD'],
  },
  {
    id: 'task-3',
    title: 'Estruturar Arquitetura de Código e Schema de Dados Synth',
    description: 'Criar base de dados anonimizada em JSON/SQLite sintético para cumprir LGPD sem expor dados reais.',
    assignedRole: 'tech',
    assignedMemberId: 'member-1',
    checkpointId: 2,
    criterionId: 5,
    status: 'done',
    priority: 'high',
    createdAt: new Date().toISOString(),
    tags: ['Tech', 'LGPD', 'Schema'],
  },
  {
    id: 'task-4',
    title: 'Construir Protótipo Funcional da Solução (Hora do MVP)',
    description: 'Desenvolver a interface Web interativa com fluxo completo de atendimento ao cidadão e painel do servidor.',
    assignedRole: 'tech',
    assignedMemberId: 'member-1',
    checkpointId: 5,
    criterionId: 5,
    status: 'in_progress',
    priority: 'urgent',
    createdAt: new Date().toISOString(),
    tags: ['MVP', 'Código', 'React'],
  },
  {
    id: 'task-5',
    title: 'Desenhar Modelo de Negócio GovTech (Marco Legal)',
    description: 'Modelar contratação direta via Marco Legal das Startups (Lei Complementar 182/2021) e ROI para o município.',
    assignedRole: 'pitch',
    assignedMemberId: 'member-3',
    checkpointId: 6,
    criterionId: 6,
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date().toISOString(),
    tags: ['Marco Legal', 'SaaS', 'Finanças'],
  },
  {
    id: 'task-6',
    title: 'Montar e Treinar Pitch Deck de 3 Minutos',
    description: 'Elaborar os 8 slides cobrindo do problema até a viabilidade financeira e treinar com cronômetro para a banca.',
    assignedRole: 'pitch',
    assignedMemberId: 'member-3',
    checkpointId: 7,
    criterionId: 7,
    status: 'todo',
    priority: 'urgent',
    createdAt: new Date().toISOString(),
    tags: ['Pitch', 'Banca', 'Apresentação'],
  },
];

let chatMessages = [
  {
    id: 'msg-1',
    channel: 'geral',
    authorId: 'member-2',
    authorName: 'Líder de UX',
    authorRole: 'ux',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    content: 'Galera, terminei a primeira rodada de conversas com o mentor do SEBRAE! Mapeamos que 68% do tempo da Secretaria de Obras é gasto em triagem manual de requerimentos.',
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'msg-2',
    channel: 'geral',
    authorId: 'member-1',
    authorName: 'Caio Costa',
    authorRole: 'tech',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Excelente! Já criei o módulo de triagem automática e o formulário de requisição com dados sintéticos anonimizados. Subi o commit no Code Hub!',
    codeSnippet: 'const classifyRequest = (text: string) => {\n  if (text.includes("iluminação")) return "SEOSP_ILUM";\n  if (text.includes("asfalto")) return "SEOSP_PAV";\n  return "SEOSP_GERAL";\n};',
    timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

let codeFiles = [
  {
    id: 'file-1',
    path: 'src/modules/GovTechPortal.tsx',
    language: 'typescript' as const,
    content: `// Módulo Principal GovTech Cianorte - Nexus DC Br
import React, { useState } from 'react';

export default function GovTechPortal() {
  const [protocol, setProtocol] = useState('');
  const [description, setDescription] = useState('');
  const [requests, setRequests] = useState([
    { id: 'PROT-2026-001', service: 'Remendo de Asfalto - Zona de Armazém', status: 'Em Análise IA', priority: 'Alta' },
    { id: 'PROT-2026-002', service: 'Troca de Lâmpada LED - Av. Goiás', status: 'Deferido', priority: 'Média' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const newId = \`PROT-2026-00\${requests.length + 1}\`;
    setRequests([{ id: newId, service: description, status: 'Triagem Automática', priority: 'Média' }, ...requests]);
    setDescription('');
    setProtocol(newId);
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-cyan-400">Portal Cidadão GovTech Cianorte</h2>
          <p className="text-xs text-slate-400">Plataforma Digital de Serviços Públicos Municipais</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs rounded-full font-mono">
          ● LGPD Certificada
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">Descreva a solicitação ou problema no município:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Buraco no asfalto em frente à Av. Goiás, nº 1055"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 px-5 py-2 rounded-lg text-sm font-semibold transition">
            Registrar Protocolo
          </button>
        </div>
      </form>

      {protocol && (
        <div className="p-3 mb-4 bg-cyan-950/60 border border-cyan-800/50 rounded-lg text-xs text-cyan-200">
          ✓ Protocolo <span className="font-mono font-bold">{protocol}</span> gerado com sucesso com triagem via Inteligência Artificial!
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Protocolos Recentes da Equipe</h3>
        <div className="space-y-2">
          {requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 text-xs">
              <div>
                <span className="font-mono text-cyan-400 font-bold mr-2">{req.id}</span>
                <span className="text-slate-200">{req.service}</span>
              </div>
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded text-[11px]">
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
    lastModifiedBy: 'Caio Costa (Tech Lead)',
    lastModifiedAt: new Date().toISOString(),
  },
];

let codeCommits = [
  {
    id: 'commit-1',
    fileId: 'file-1',
    filePath: 'src/modules/GovTechPortal.tsx',
    authorId: 'member-1',
    authorName: 'Caio Costa',
    message: 'Initial MVP structure for GovTech Protocol Submission portal',
    content: codeFiles[0].content,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

let mentorFeedbacks = [
  {
    id: 'feedback-1',
    checkpointId: 1,
    mentorName: 'Mentor SEBRAE (Inovação)',
    area: 'Validação & Impacto',
    feedback: 'A ideia de automação de protocolos atinge diretamente a dor da prefeitura. Certifiquem-se de mostrar no Pitch como o cidadão acompanha o status sem ligar para a prefeitura.',
    actionItems: ['Incluir notificação SMS/WhatsApp no fluxo', 'Destacar redução de chamados telefônicos no Slide 4'],
    timestamp: new Date(Date.now() - 2500000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

// Local Git Commit Reader for Team GitHub Hub
function getLocalGitCommits() {
  try {
    const raw = execSync('git log -n 5 --pretty=format:"%h||%s||%an||%ad"', {
      cwd: __dirname,
      encoding: 'utf-8',
      timeout: 3000,
    });
    const lines = raw.trim().split('\n').filter(Boolean);
    const commits = lines.map((line) => {
      const parts = line.split('||');
      return {
        hash: parts[0]?.trim() || '',
        message: parts[1]?.trim() || '',
        author: parts[2]?.trim() || '',
        date: parts[3]?.trim() || '',
      };
    });
    if (commits.length > 0) return commits;
  } catch (e) {
    // Fallback if git binary not in direct path
  }
  return [
    {
      hash: 'ace58be',
      message: 'feat: initial commit - Nexus GovTech platform',
      author: 'Strakona',
      date: new Date().toISOString(),
    },
  ];
}

const initialGitCommits = getLocalGitCommits();
const INTEGRATIONS_FILE = path.join(__dirname, 'data', 'integrations.json');

let teamIntegrations: any = {
  github: {
    enabled: true,
    repoUrl: 'https://github.com/Strakona/Sistema-Nexus-Gov',
    repoName: 'Strakona/Sistema-Nexus-Gov',
    branch: 'main',
    status: 'connected',
    lastSyncedAt: new Date().toISOString(),
    latestCommit: initialGitCommits[0] || {
      hash: 'ace58be',
      message: 'feat: initial commit - Nexus GovTech platform',
      author: 'Strakona',
      date: new Date().toISOString(),
    },
    starsCount: 1,
    openIssuesCount: 0,
    recentCommits: initialGitCommits,
  },
  googleDrive: {
    enabled: true,
    folderUrl: 'https://drive.google.com/drive/folders/1r0UAE3NtBsjPr89_ImYTw_fd_8EodsFa?usp=sharing',
    status: 'connected',
    sharedDocs: [
      {
        id: 'doc-1',
        title: 'Pitch Deck Oficial - 3 Minutos (GovTech 2026)',
        type: 'presentation',
        url: 'https://slides.new',
        description: 'Apresentação de slides alinhados aos 7 critérios do edital SEBRAE/CMCTIC',
        category: 'pitch',
        addedBy: 'Bruna (UX)',
        updatedAt: 'Hoje',
      },
      {
        id: 'doc-2',
        title: 'Pesquisa com Cidadãos & Servidores (Cianorte)',
        type: 'spreadsheet',
        url: 'https://sheets.new',
        description: 'Planilha com dados quantitativos e respostas do formulário relâmpago',
        category: 'validation',
        addedBy: 'Bruna (UX)',
        updatedAt: 'Hoje',
      },
      {
        id: 'doc-3',
        title: 'Pasta Principal da Equipe no Google Drive',
        type: 'folder',
        url: 'https://drive.google.com/drive/folders/1r0UAE3NtBsjPr89_ImYTw_fd_8EodsFa?usp=sharing',
        description: 'Pasta oficial compartilhada de ativos, logos, diagramas e fotos de entrevistas',
        category: 'general',
        addedBy: 'Equipe',
        updatedAt: 'Hoje',
      },
      {
        id: 'doc-4',
        title: 'Regulamento Oficial & Critérios de Avaliação.pdf',
        type: 'pdf',
        url: '/assets/aistudio/Regulamento_Hackathon_-_GovTech.docx__1__276b651d.pdf',
        description: 'Regras da banca avaliadora, pesos de notas e tempo de apresentação',
        category: 'regulation',
        addedBy: 'Sistema',
        updatedAt: 'Hoje',
      },
    ],
  },
  vercel: {
    enabled: true,
    projectName: 'sistema-nexus-gov',
    deploymentUrl: 'https://sistema-nexus-gov.vercel.app',
    previewUrl: 'https://sistema-nexus-gov.vercel.app',
    environment: 'Production',
    status: 'ready',
    branch: 'main',
    commitHash: initialGitCommits[0]?.hash || 'ace58be',
    lastDeployedAt: new Date().toISOString(),
  },
  lastUpdatedBy: 'Sistema Nexus',
  lastUpdatedAt: new Date().toISOString(),
};

// Carregar dados salvos em disco se existirem
if (fs.existsSync(INTEGRATIONS_FILE)) {
  try {
    const rawData = fs.readFileSync(INTEGRATIONS_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    teamIntegrations = {
      ...teamIntegrations,
      ...parsed,
      github: { ...teamIntegrations.github, ...(parsed.github || {}) },
      googleDrive: { ...teamIntegrations.googleDrive, ...(parsed.googleDrive || {}) },
      vercel: { ...teamIntegrations.vercel, ...(parsed.vercel || {}) },
    };
  } catch (err) {
    console.error('Error loading integrations file:', err);
  }
}

function saveIntegrationsToDisk() {
  try {
    const dataDir = path.dirname(INTEGRATIONS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(INTEGRATIONS_FILE, JSON.stringify(teamIntegrations, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving integrations:', err);
  }
}

// SSE Clients for Real-Time Sync
const sseClients: Response[] = [];

function broadcastStateUpdate(type: string, payload: any) {
  const data = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  sseClients.forEach((client) => {
    client.write(`data: ${data}\n\n`);
  });
}

// REST Endpoints
app.get('/api/state', (req: Request, res: Response) => {
  res.json({
    activeCheckpointId,
    teamMembers,
    tasks,
    chatMessages,
    codeFiles,
    codeCommits,
    mentorFeedbacks,
    integrations: teamIntegrations,
  });
});

// Integrations Endpoints
app.get('/api/integrations', (req: Request, res: Response) => {
  res.json(teamIntegrations);
});

app.put('/api/integrations', (req: Request, res: Response) => {
  const { github, googleDrive, vercel, updatedBy } = req.body;
  if (github) teamIntegrations.github = { ...teamIntegrations.github, ...github };
  if (googleDrive) teamIntegrations.googleDrive = { ...teamIntegrations.googleDrive, ...googleDrive };
  if (vercel) teamIntegrations.vercel = { ...teamIntegrations.vercel, ...vercel };
  if (updatedBy) teamIntegrations.lastUpdatedBy = updatedBy;
  teamIntegrations.lastUpdatedAt = new Date().toISOString();

  saveIntegrationsToDisk();
  broadcastStateUpdate('INTEGRATIONS_UPDATED', teamIntegrations);
  res.json({ success: true, integrations: teamIntegrations });
});

app.post('/api/integrations/sync-git', (req: Request, res: Response) => {
  const commits = getLocalGitCommits();
  teamIntegrations.github.recentCommits = commits;
  if (commits.length > 0) {
    teamIntegrations.github.latestCommit = commits[0];
    teamIntegrations.github.status = 'connected';
    teamIntegrations.vercel.commitHash = commits[0].hash;
  }
  teamIntegrations.github.lastSyncedAt = new Date().toISOString();
  saveIntegrationsToDisk();
  broadcastStateUpdate('INTEGRATIONS_UPDATED', teamIntegrations);
  res.json({ success: true, integrations: teamIntegrations });
});

app.post('/api/integrations/drive/docs', (req: Request, res: Response) => {
  const { title, type, url, description, category, addedBy } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Título e URL são obrigatórios' });
  }
  const newDoc = {
    id: `doc-${Date.now()}`,
    title,
    type: type || 'link',
    url,
    description: description || '',
    category: category || 'general',
    addedBy: addedBy || 'Equipe',
    updatedAt: new Date().toLocaleDateString('pt-BR'),
  };
  teamIntegrations.googleDrive.sharedDocs.unshift(newDoc);
  saveIntegrationsToDisk();
  broadcastStateUpdate('INTEGRATIONS_UPDATED', teamIntegrations);
  res.json({ success: true, doc: newDoc, integrations: teamIntegrations });
});

app.delete('/api/integrations/drive/docs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  teamIntegrations.googleDrive.sharedDocs = teamIntegrations.googleDrive.sharedDocs.filter((d: any) => d.id !== id);
  saveIntegrationsToDisk();
  broadcastStateUpdate('INTEGRATIONS_UPDATED', teamIntegrations);
  res.json({ success: true, integrations: teamIntegrations });
});

app.post('/api/integrations/vercel/ping', async (req: Request, res: Response) => {
  const targetUrl = req.body.url || teamIntegrations.vercel.deploymentUrl;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const start = Date.now();
    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);
    const latency = Date.now() - start;
    teamIntegrations.vercel.status = response.ok ? 'ready' : 'error';
    teamIntegrations.vercel.lastDeployedAt = new Date().toISOString();
    saveIntegrationsToDisk();
    broadcastStateUpdate('INTEGRATIONS_UPDATED', teamIntegrations);
    res.json({ success: true, ok: response.ok, status: response.status, latency });
  } catch (err: any) {
    res.json({ success: false, error: err.message || 'Host indisponível no momento' });
  }
});

// Team members update endpoint
app.post('/api/team/members', (req: Request, res: Response) => {
  const { updatedMembers } = req.body;
  if (Array.isArray(updatedMembers)) {
    teamMembers = updatedMembers;
    broadcastStateUpdate('TEAM_UPDATED', { teamMembers });
    res.json({ success: true, teamMembers });
  } else {
    res.status(400).json({ error: 'Invalid members list' });
  }
});

// Stage update endpoint
app.post('/api/stage', (req: Request, res: Response) => {
  const { checkpointId } = req.body;
  if (typeof checkpointId === 'number' && checkpointId >= 1 && checkpointId <= 7) {
    activeCheckpointId = checkpointId;
    broadcastStateUpdate('STAGE_UPDATED', { activeCheckpointId });
    res.json({ success: true, activeCheckpointId });
  } else {
    res.status(400).json({ error: 'Invalid checkpoint ID' });
  }
});

// SSE Real-time stream
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Task Actions
app.post('/api/tasks', (req: Request, res: Response) => {
  const newTask = {
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'todo' as const,
    priority: 'medium' as const,
    tags: ['GovTech'],
    ...req.body,
  };
  tasks.unshift(newTask);
  broadcastStateUpdate('TASK_CREATED', newTask);
  res.json({ success: true, task: newTask });
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...req.body };
    broadcastStateUpdate('TASK_UPDATED', tasks[index]);
    res.json({ success: true, task: tasks[index] });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Chat Actions
app.post('/api/chat', (req: Request, res: Response) => {
  const newMsg = {
    id: `msg-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...req.body,
  };
  chatMessages.push(newMsg);
  broadcastStateUpdate('CHAT_MESSAGE', newMsg);
  res.json({ success: true, message: newMsg });
});

// Mentor Feedback Action
app.post('/api/mentors/feedback', (req: Request, res: Response) => {
  const feedback = {
    id: `fb-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...req.body,
  };
  mentorFeedbacks.unshift(feedback);
  broadcastStateUpdate('FEEDBACK_ADDED', feedback);
  res.json({ success: true, feedback });
});

// Code Hub & Commit Actions
app.post('/api/code/save-file', (req: Request, res: Response) => {
  const { fileId, path: filePath, content, language, modifiedBy } = req.body;
  
  let existingIndex = codeFiles.findIndex((f) => f.id === fileId || f.path === filePath);
  let updatedFile;

  if (existingIndex !== -1) {
    codeFiles[existingIndex] = {
      ...codeFiles[existingIndex],
      content,
      lastModifiedBy: modifiedBy || 'Tech Lead',
      lastModifiedAt: new Date().toISOString(),
    };
    updatedFile = codeFiles[existingIndex];
  } else {
    updatedFile = {
      id: `file-${Date.now()}`,
      path: filePath || `src/modules/Module_${Date.now()}.tsx`,
      language: language || 'typescript',
      content: content || '',
      lastModifiedBy: modifiedBy || 'Tech Lead',
      lastModifiedAt: new Date().toISOString(),
    };
    codeFiles.push(updatedFile);
  }

  broadcastStateUpdate('CODE_SAVED', updatedFile);
  res.json({ success: true, file: updatedFile });
});

app.post('/api/code/commit', (req: Request, res: Response) => {
  const { fileId, authorId, authorName, message, content } = req.body;
  const file = codeFiles.find((f) => f.id === fileId);

  if (!file) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const previousContent = file.content;
  file.content = content;
  file.lastModifiedBy = authorName;
  file.lastModifiedAt = new Date().toISOString();

  const commit = {
    id: `commit-${Date.now()}`,
    fileId: file.id,
    filePath: file.path,
    authorId,
    authorName,
    message: message || 'Update code module',
    content,
    previousContent,
    timestamp: new Date().toISOString(),
  };

  codeCommits.unshift(commit);
  broadcastStateUpdate('CODE_COMMITTED', { file, commit });
  res.json({ success: true, commit, file });
});

// Code Assembly Synthesizer endpoint
app.post('/api/code/merge-modules', (req: Request, res: Response) => {
  const { fileIds, mergedFileName } = req.body;
  const selectedFiles = codeFiles.filter((f) => fileIds.includes(f.id));

  const mergedContent = selectedFiles.map((f) => `// ==============================\n// Module: ${f.path}\n// ==============================\n${f.content}`).join('\n\n');

  const newFile = {
    id: `file-${Date.now()}`,
    path: mergedFileName || `src/build/UnifiedBundle.tsx`,
    language: 'typescript' as const,
    content: mergedContent,
    lastModifiedBy: 'Nexus Assembler',
    lastModifiedAt: new Date().toISOString(),
  };

  codeFiles.push(newFile);
  broadcastStateUpdate('CODE_SAVED', newFile);
  res.json({ success: true, file: newFile });
});

// AI Copilot Endpoint (Gemini 3.8 Flash)
app.post('/api/ai/copilot', async (req: Request, res: Response) => {
  try {
    const { prompt, contextType } = req.body;

    let systemInstruction = 'Você é o assistente oficial de IA da equipe Nexus DC Br no Hackathon GovTech 2026 em Cianorte - PR. Responda em português de forma direta, clara e prática com foco nos 7 critérios de avaliação do edital.';

    if (contextType === 'survey') {
      systemInstruction += ' Ajude a formular perguntas de pesquisa e formulários relâmpago de validação com cidadãos e servidores públicos.';
    } else if (contextType === 'code') {
      systemInstruction += ' Você é um especialista em React, TypeScript e Tailwind CSS para soluções de Governo Digital (GovTech). Forneça código limpo, funcional e com suporte a LGPD.';
    } else if (contextType === 'pitch') {
      systemInstruction += ' Você é um especialista em Pitch GovTech e Marco Legal das Startups (LC 182/2021). Ajude com estimativas de ROI, viabilidade e argumentos para a banca avaliadora.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ success: true, text: response.text || 'Nenhuma resposta gerada.' });
  } catch (error: any) {
    console.error('Gemini Copilot Error:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar requisição com Gemini' });
  }
});

// AI Evaluator based on 7 Regulamento Criteria
app.post('/api/ai/evaluate-govtech', async (req: Request, res: Response) => {
  try {
    const { problemText, validationText, valuePropText, interestText, mvpDescription, businessModelText, pitchSummary } = req.body;

    const prompt = `
Avalie a solução da equipe Nexus DC Br para o HACKATHON GOVTECH 2026 da Prefeitura de Cianorte / SEBRAE.
Com base nos 7 critérios de avaliação do Regulamento Oficial (cada critério vale de 0 a 10 pontos, total máximo 70 pontos):

1. PERSONA E PROBLEMA: ${problemText || 'Clareza do público afetado e relevância da dor na administração pública.'}
2. VALIDAÇÃO DO PROBLEMA: ${validationText || 'Evidências e pesquisas com servidores/mentores do SEBRAE.'}
3. PROPOSTA DE VALOR: ${valuePropText || 'Clareza da solução e economia/valor gerado para Cianorte.'}
4. TESTE DE INTERESSE: ${interestText || 'Formulário relâmpago, intenção de uso e adesão.'}
5. MVP E TESTAGEM: ${mvpDescription || 'Protótipo interativo em código com fluxos reais.'}
6. MODELO DE NEGÓCIO: ${businessModelText || 'Contratação via Marco Legal das Startups, SaaS municipal ou economia de orçamento.'}
7. PITCH: ${pitchSummary || 'Apresentação clara, objetiva e cronometrada em 3 minutos.'}

Sua resposta DEVE ser um objeto JSON no formato exato:
{
  "totalScore": number, // soma dos 7 critérios (0 a 70)
  "summary": "visão geral inspiradora e analítica para a banca",
  "topStrengths": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "keyRisks": ["risco 1 para ajustar antes da banca", "risco 2"],
  "criteria": [
    {
      "criterionNumber": 1,
      "title": "PERSONA E PROBLEMA",
      "score": number,
      "feedback": "análise técnica",
      "recommendations": ["dica 1", "dica 2"]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            topStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterionNumber: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                  recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['criterionNumber', 'title', 'score', 'feedback', 'recommendations'],
              },
            },
          },
          required: ['totalScore', 'summary', 'topStrengths', 'keyRisks', 'criteria'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, evaluation: parsedData });
  } catch (error: any) {
    console.error('AI Evaluation Error:', error);
    res.status(500).json({ error: error.message || 'Erro ao realizar avaliação do projeto' });
  }
});

// Serve Vite frontend in dev mode, static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Nexus GovTech Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}

