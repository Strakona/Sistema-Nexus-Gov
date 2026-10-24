import React, { useState } from 'react';
import { GuidedStage, TeamMember } from '../../types';
import { updateCheckpointStage } from '../../services/api';
import {
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Award,
  ListTodo,
  AlertCircle,
} from 'lucide-react';

interface GuidedWizardProps {
  activeCheckpointId: number;
  activeMember: TeamMember;
  onRefreshState: () => void;
}

const GUIDED_STAGES: GuidedStage[] = [
  {
    checkpointId: 1,
    title: 'Check-Point 1: Persona e Problema',
    timeRange: '09h50 - 10h30',
    durationMinutes: 40,
    objective: 'Identificar com clareza o público afetado na Prefeitura de Cianorte e mapear a relevância da dor.',
    mandatoryDeliverable: 'Apresentação no Checkpoint 1 dos dados da persona e volume da dor.',
    mentorTip: 'Entreviste os mentores e representantes da prefeitura presentes no SEBRAE para extrair a rotina real dos servidores.',
    checklists: [
      {
        role: 'ux',
        roleTitle: 'Líder de Validação / UX',
        tasks: [
          'Conduzir entrevistas com mentores no SEBRAE',
          'Mapear horas perdidas e volume de processos em papel',
          'Registrar depoimentos dos servidores sobre a rotina',
        ],
      },
      {
        role: 'tech',
        roleTitle: 'Tech Lead / Builder (Caio)',
        tasks: [
          'Rascunhar o fluxo de telas (jornada do usuário)',
          'Definir a arquitetura técnica inicial da solução',
          'Estruturar o schema de dados sintéticos para cumprir a LGPD',
        ],
      },
      {
        role: 'pitch',
        roleTitle: 'Estrategista / Orador',
        tasks: [
          'Definir a promessa central da solução (o "porquê")',
          'Mapear os ganhos financeiros e operacionais da dor',
          'Iniciar o rascunho dos Slides 1 e 2 do Pitch Deck',
        ],
      },
    ],
  },
  {
    checkpointId: 2,
    title: 'Check-Point 2: Validação do Problema',
    timeRange: '10h40 - 11h20',
    durationMinutes: 40,
    objective: 'Apresentar evidências concretas de que o problema existe e foi investigado.',
    mandatoryDeliverable: 'Evidências quantitativas da dor levantadas em campo.',
    mentorTip: 'Mostre dados numéricos específicos de Cianorte (ex: tempo em filas, chamados telefônicos repetitivos).',
    checklists: [
      {
        role: 'ux',
        roleTitle: 'Líder de Validação / UX',
        tasks: [
          'Compilar os dados quantitativos coletados na primeira rodada',
          'Preparar o rascunho do formulário relâmpago de validação',
          'Validar diretrizes de ética, acessibilidade e inclusão',
        ],
      },
      {
        role: 'tech',
        roleTitle: 'Tech Lead / Builder (Caio)',
        tasks: [
          'Criar os primeiros arquivos de código no Code Hub',
          'Gerar a base de dados sintéticos anonimizada em JSON',
          'Commitar a estrutura base do projeto',
        ],
      },
      {
        role: 'pitch',
        roleTitle: 'Estrategista / Orador',
        tasks: [
          'Desenhar a proposta de valor conectando dor e benefício',
          'Estruturar a justificativa para a Administração Pública',
          'Alimentar o Slide 2 com gráficos/dados da validação',
        ],
      },
    ],
  },
  {
    checkpointId: 3,
    title: 'Check-Point 3: Proposta de Valor',
    timeRange: '11h30 - 12h10',
    durationMinutes: 40,
    objective: 'Demonstrar clareza sobre o valor gerado para o município de Cianorte e para o cidadão.',
    mandatoryDeliverable: 'Apresentar a declaração de valor e economia estimada.',
    mentorTip: 'Foque no valor público: transparência, velocidade de resposta e economia para os cofres municipais.',
    checklists: [
      {
        role: 'ux',
        roleTitle: 'Líder de Validação / UX',
        tasks: [
          'Ajustar os fluxos de usabilidade do cidadão e servidor',
          'Testar protótipos de tela com um colega de equipe',
          'Preparar perguntas finais do formulário relâmpago',
        ],
      },
      {
        role: 'tech',
        roleTitle: 'Tech Lead / Builder (Caio)',
        tasks: [
          'Desenvolver os componentes principais de interface',
          'Conectar a lógica de triagem e protocolo com a API',
          'Executar a primeira simulação no Executor de Protótipo',
        ],
      },
      {
        role: 'pitch',
        roleTitle: 'Estrategista / Orador',
        tasks: [
          'Finalizar a redação da Proposta de Valor no Slide 3',
          'Estimar a redução percentual de chamados e filas',
          'Avançar na estruturação dos slides 3 e 4',
        ],
      },
    ],
  },
  {
    checkpointId: 4,
    title: 'Check-Point 4: Teste de Interesse',
    timeRange: '12h20 - 13h00',
    durationMinutes: 40,
    objective: 'Apresentar evidências de adesão ou intenção de uso real da solução.',
    mandatoryDeliverable: 'Formulário relâmpago aplicado com depoimentos ou assinaturas.',
    mentorTip: 'Aproveite o intervalo para disparar o formulário relâmpago para mentores e participantes.',
    checklists: [
      {
        role: 'ux',
        roleTitle: 'Líder de Validação / UX',
        tasks: [
          'Disparar o formulário relâmpago de validação',
          'Colher intenções de uso e depoimentos no SEBRAE',
          'Consolidar o gráfico de adesão dos servidores',
        ],
      },
      {
        role: 'tech',
        roleTitle: 'Tech Lead / Builder (Caio)',
        tasks: [
          'Refinar o código da aplicação e telas de atendimento',
          'Salvar o progresso e realizar os commits do módulo',
          'Testar o fluxo de registro de solicitações',
        ],
      },
      {
        role: 'pitch',
        roleTitle: 'Estrategista / Orador',
        tasks: [
          'Incluir a métrica de intenção de uso no Slide 4',
          'Organizar as fotos/prints do teste de interesse',
          'Revisar o alinhamento com os 7 critérios do edital',
        ],
      },
    ],
  },
  {
    checkpointId: 5,
    title: 'Check-Point 5: MVP e Validação (Hora do MVP)',
    timeRange: '14h30 - 15h30',
    durationMinutes: 60,
    objective: 'Desenvolver o protótipo interativo e colher evidências de teste prático ao vivo.',
    mandatoryDeliverable: 'Protótipo web funcional testado em código e com dados anonimizados.',
    mentorTip: 'Coloque o protótipo na mão dos colegas e mentores para testar, gravando tempo de execução.',
    checklists: [
      {
        role: 'ux',
        roleTitle: 'Líder de Validação / UX',
        tasks: [
          'Colocar o protótipo na mão de um mentor para testar',
          'Registrar prints e vídeos de evidência para o Pitch',
          'Anotar feedbacks de melhorias de interface',
        ],
      },
      {
        role: 'tech',
        roleTitle: 'Tech Lead / Builder (Caio)',
        tasks: [
          'Concluir o desenvolvimento do MVP interativo',
          'Unificar os módulos ("Juntando as partes") no Code Hub',
          'Verificar se não há erros ou travamentos no protótipo',
        ],
      },
      {
        role: 'pitch',
        roleTitle: 'Estrategista / Orador',
        tasks: [
          'Capturar imagens do MVP rodando para o Slide 5',
          'Preparar a demonstração ao vivo para a banca',
          'Iniciar a modelagem de viabilidade do Marco Legal',
        ],
      },
    ],
  },
  {
    checkpointId: 6,
    title: 'Check-Point 6: Modelo de Negócio GovTech',
    timeRange: '15h40 - 16h25',
    durationMinutes: 45,
    objective: 'Apresentar a sustentabilidade, viabilidade financeira e contratação pelo poder público.',
    mandatoryDeliverable: 'Modelagem SaaS Municipal e ROI de economia orçamentária.',
    mentorTip: 'Mencione o Marco Legal das Startups (Lei Complementar 182/2021) para viabilizar contratação direta sem licitação demorada.',
    checklists: [
      {
        role: 'ux',
        roleTitle: 'Líder de Validação / UX',
        tasks: [
          'Auxiliar na coleta de feedbacks finais do protótipo',
          'Conferir a adesão aos critérios de usabilidade e LGPD',
          'Preparar o apoio visual para as perguntas da banca',
        ],
      },
      {
        role: 'tech',
        roleTitle: 'Tech Lead / Builder (Caio)',
        tasks: [
          'Realizar ajustes finais de estilo e detalhes visuais',
          'Exportar o bundle final do projeto e código-fonte',
          'Garantir a estabilidade da simulação',
        ],
      },
      {
        role: 'pitch',
        roleTitle: 'Estrategista / Orador',
        tasks: [
          'Calcular o ROI e economia orçamentária para Cianorte',
          'Estruturar o modelo SaaS e contratação via Marco Legal',
          'Finalizar todos os 7 slides do Pitch Deck',
        ],
      },
    ],
  },
  {
    checkpointId: 7,
    title: 'Check-Point 7: Pitch Deck Final & Treino',
    timeRange: '16h35 - 17h20',
    durationMinutes: 45,
    objective: 'Ajustar os últimos detalhes do Pitch Deck e realizar o treino cronometrado da fala.',
    mandatoryDeliverable: 'Apresentação completa pronta para o palco e perguntas da banca.',
    mentorTip: 'Treine a oratória em 3 minutos exatos. Alinhe quem responde cada tipo de pergunta da banca.',
    checklists: [
      {
        role: 'ux',
        roleTitle: 'Líder de Validação / UX',
        tasks: [
          'Fazer papel de jurado e fazer perguntas difíceis ao orador',
          'Apoiar no controle do tempo e slides',
          'Estar pronto para defender a validação na banca',
        ],
      },
      {
        role: 'tech',
        roleTitle: 'Tech Lead / Builder (Caio)',
        tasks: [
          'Deixar o protótipo aberto no navegador para demonstração',
          'Apoiar no suporte técnico durante as perguntas',
          'Revisar a nota no Simulador de Banca IA',
        ],
      },
      {
        role: 'pitch',
        roleTitle: 'Estrategista / Orador',
        tasks: [
          'Treinar a fala no cronômetro do Pitch de 3 minutos',
          'Alinhar as respostas para perguntas sobre custos e LGPD',
          'Subir ao palco com a equipe e apresentar!',
        ],
      },
    ],
  },
];

export default function GuidedWizard({
  activeCheckpointId,
  activeMember,
  onRefreshState,
}: GuidedWizardProps) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [viewCpId, setViewCpId] = useState(activeCheckpointId);

  const currentStage = GUIDED_STAGES.find((s) => s.checkpointId === viewCpId) || GUIDED_STAGES[0];

  const handleAdvanceStage = async () => {
    const nextCp = activeCheckpointId < 7 ? activeCheckpointId + 1 : 7;
    await updateCheckpointStage(nextCp);
    setViewCpId(nextCp);
    onRefreshState();
  };

  return (
    <>
      {/* Top Banner Guide Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/80 to-slate-900 border-b border-cyan-800/60 text-white px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300">
              <Compass className="w-4 h-4 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-cyan-300 uppercase tracking-wider">
                  GUIA DAS ETAPAS:
                </span>
                <span className="font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 text-[11px]">
                  {GUIDED_STAGES.find((s) => s.checkpointId === activeCheckpointId)?.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                {GUIDED_STAGES.find((s) => s.checkpointId === activeCheckpointId)?.objective}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setViewCpId(activeCheckpointId);
                setIsOpenModal(true);
              }}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md flex items-center gap-1.5 transition text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Abrir Guia da Etapa ({activeMember.roleTitle.split(' ')[0]})</span>
            </button>
          </div>

        </div>
      </div>

      {/* Guided Stage Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto text-slate-100">
            
            {/* Modal Header & CP Navigation */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">
                      Passo a Passo das 7 Etapas
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      CP {currentStage.checkpointId} de 7
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-slate-100">{currentStage.title}</h2>
                </div>
              </div>

              <button
                onClick={() => setIsOpenModal(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checkpoint Navigation Controls */}
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewCpId(Math.max(1, viewCpId - 1))}
                disabled={viewCpId === 1}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 font-medium flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Etapa Anterior</span>
              </button>

              <div className="font-mono text-xs text-amber-300 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Horário Previsto: {currentStage.timeRange} ({currentStage.durationMinutes} min)</span>
              </div>

              <button
                onClick={() => setViewCpId(Math.min(7, viewCpId + 1))}
                disabled={viewCpId === 7}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 font-medium flex items-center gap-1"
              >
                <span>Próxima Etapa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Objective & Deliverables Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-cyan-950/40 border border-cyan-800/60 rounded-2xl space-y-1.5 text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase text-[10px]">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Objetivo Central da Etapa:</span>
                </span>
                <p className="text-slate-200 leading-relaxed">{currentStage.objective}</p>
              </div>

              <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl space-y-1.5 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase text-[10px]">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Entregável Obrigatório do Checkpoint:</span>
                </span>
                <p className="text-slate-200 leading-relaxed">{currentStage.mandatoryDeliverable}</p>
              </div>
            </div>

            {/* Mentor Advice Box */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-300">Dica dos Mentores & Regulamento: </span>
                <span>{currentStage.mentorTip}</span>
              </div>
            </div>

            {/* Checklist per Role for this Stage */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-cyan-400" />
                <span>O que cada um deve fazer agora (Checklist do Trio):</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentStage.checklists.map((chk) => {
                  const isUserRole = activeMember.role === chk.role;

                  return (
                    <div
                      key={chk.role}
                      className={`p-4 rounded-2xl border space-y-3 text-xs ${
                        isUserRole
                          ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-100 ring-2 ring-cyan-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-slate-100">{chk.roleTitle}</span>
                        {isUserRole && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] uppercase border border-cyan-500/40">
                            Seu Papel
                          </span>
                        )}
                      </div>

                      <ul className="space-y-2">
                        {chk.tasks.map((taskItem, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isUserRole ? 'text-cyan-400' : 'text-slate-500'}`} />
                            <span>{taskItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Sincronizado ao vivo com todos os integrantes da equipe.
              </span>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsOpenModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs"
                >
                  Fechar Guia
                </button>

                <button
                  onClick={() => {
                    handleAdvanceStage();
                    setIsOpenModal(false);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir Etapa & Avançar CP</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
