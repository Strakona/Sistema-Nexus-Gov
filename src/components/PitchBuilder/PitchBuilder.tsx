import React, { useState, useEffect } from 'react';
import { PitchSlide } from '../../types';
import { askAiCopilot } from '../../services/api';
import {
  Presentation,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  DollarSign,
  Building2,
  CheckCircle2,
  Edit3,
  Volume2,
} from 'lucide-react';

const INITIAL_SLIDES: PitchSlide[] = [
  {
    id: 1,
    title: 'Nexus GovTech - Cianorte Digital',
    criterionRelated: 'Apresentação & Identidade',
    bulletPoints: [
      'Transformando o atendimento ao cidadão de Cianorte com automação inteligente.',
      'Plataforma integrada de serviços públicos municipais.',
      'Equipe Nexus DC Br: Validação, Engenharia e Estratégia GovTech.',
    ],
    speakerNotes: 'Boa noite jurados! Hoje apresentamos a Nexus GovTech, a solução que desburocratiza Cianorte.',
  },
  {
    id: 2,
    title: 'O Problema: Burocracia & Lote de Papel',
    criterionRelated: 'Critério 1: Persona e Problema',
    bulletPoints: [
      'Servidores perdem até 14h/semana em triagem manual de solicitações.',
      '1.200 processos físicos tramitando por mês na Secretaria de Obras.',
      '68% dos chamados telefônicos são apenas para perguntar status do protocolo.',
    ],
    speakerNotes: 'Entrevistamos servidores no SEBRAE e identificamos que o tempo gasto em papel gera filas e demora.',
  },
  {
    id: 3,
    title: 'Nossa Solução & Proposta de Valor',
    criterionRelated: 'Critério 3: Proposta de Valor',
    bulletPoints: [
      'Triagem algorítmica instantânea de solicitações com direcionamento automático.',
      'Rastreabilidade total do protocolo para o cidadão via WhatsApp/Web.',
      'Redução de 65% no tempo médio de resposta da prefeitura.',
    ],
    speakerNotes: 'A Nexus GovTech faz a triagem em segundos, economizando horas de trabalho do servidor.',
  },
  {
    id: 4,
    title: 'Evidências de Validação & Teste de Interesse',
    criterionRelated: 'Critérios 2 e 4: Validação & Interesse',
    bulletPoints: [
      'Pesquisa relâmpago aplicada durante o Hackathon.',
      '92% dos servidores expressaram intenção de uso imediato.',
      'Validado com mentores do SEBRAE e representantes municipais.',
    ],
    speakerNotes: 'Comprovamos com dados reais de formulário a aceitação imediata pelos servidores de Cianorte.',
  },
  {
    id: 5,
    title: 'MVP Funcional & Compliance LGPD',
    criterionRelated: 'Critério 5: MVP e Testagem',
    bulletPoints: [
      'Aplicação Web construída e testada ao vivo em React/TypeScript.',
      'Base de dados sintéticos anonimizada que garante conformidade com a LGPD.',
      'Integração pronta com banco de dados municipal.',
    ],
    speakerNotes: 'Não apresentamos apenas uma ideia: nosso protótipo está rodando ao vivo e testado com sucesso.',
  },
  {
    id: 6,
    title: 'Modelo de Negócio & Marco Legal das Startups',
    criterionRelated: 'Critério 6: Modelo de Negócio',
    bulletPoints: [
      'Contratação simplificada via Marco Legal das Startups (LC 182/2021).',
      'Modelo SaaS Municipal com custo fixo e economia projetada de R$ 240 mil/ano.',
      'Retorno sobre o investimento (ROI) garantido em menos de 4 meses.',
    ],
    speakerNotes: 'A prefeitura pode contratar legalmente via Marco Legal e economizar centenas de milhares no orçamento.',
  },
  {
    id: 7,
    title: 'Pitch Final & Time Nexus DC Br',
    criterionRelated: 'Critério 7: Pitch & Síntese',
    bulletPoints: [
      'Time multidisciplinar cobrindo 100% dos requisitos do edital.',
      'Caio Costa (Tech Lead), Líder de UX e Estrategista de Negócios.',
      'Juntos por uma Cianorte inovadora, eficiente e transparente!',
    ],
    speakerNotes: 'Agradecemos à banca e ao SEBRAE! Estamos prontos para transformar Cianorte juntos.',
  },
];

export default function PitchBuilder() {
  const [slides, setSlides] = useState<PitchSlide[]>(INITIAL_SLIDES);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isAiWorking, setIsAiWorking] = useState(false);

  // ROI Calculator state
  const [serverCount, setServerCount] = useState(25);
  const [hourlyRate, setHourlyRate] = useState(35); // R$/hora
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState(8);

  // Pitch Timer state (3 minutes = 180 seconds)
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const activeSlide = slides[activeSlideIdx];

  const yearlySavings = Math.round(serverCount * hoursSavedPerWeek * hourlyRate * 48);

  const handleImproveSlideWithAi = async () => {
    setIsAiWorking(true);
    try {
      const response = await askAiCopilot(
        `Otimize o texto e os tópicos deste slide do Pitch GovTech para impressionar a banca em 3 minutos:\nSlide: ${activeSlide.title}\nTópicos Atuais: ${activeSlide.bulletPoints.join(', ')}`,
        'pitch'
      );

      if (response.text) {
        const updatedSlides = [...slides];
        updatedSlides[activeSlideIdx].speakerNotes = response.text;
        setSlides(updatedSlides);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Timer */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Pitch Deck & Estratégia GovTech (Orador)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Critérios 3, 6 e 7
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Construtor de slides progressivo e cronômetro de oratória para o palco final.
            </p>
          </div>
        </div>

        {/* Pitch Timer Box */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Cronômetro do Pitch (3 min)</span>
            <span
              className={`font-mono text-lg font-bold ${
                timerSeconds < 30 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
              }`}
            >
              {Math.floor(timerSeconds / 60)
                .toString()
                .padStart(2, '0')}
              :{(timerSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex gap-1 border-l border-slate-800 pl-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(180);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Slide Selector */}
        <div className="lg:col-span-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            Estrutura dos 7 Slides do Pitch
          </h3>

          <div className="space-y-2">
            {slides.map((slide, idx) => {
              const isSelected = activeSlideIdx === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlideIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition text-xs ${
                    isSelected
                      ? 'bg-amber-950/80 border-amber-500/80 text-amber-200 font-bold shadow-md'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase text-amber-400">Slide {idx + 1}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {slide.criterionRelated.split(':')[0]}
                    </span>
                  </div>
                  <div className="truncate font-semibold text-slate-100">{slide.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center/Right Area: Slide Editor & Speaker Notes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Slide Canvas Preview */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Slide {activeSlideIdx + 1} de {slides.length} • {activeSlide.criterionRelated}
                </span>
                <h3 className="text-lg font-extrabold text-cyan-300">{activeSlide.title}</h3>
              </div>

              <button
                onClick={handleImproveSlideWithAi}
                disabled={isAiWorking}
                className="px-3 py-1.5 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                <span>{isAiWorking ? 'IA Refinando...' : 'Refinar Discurso com IA'}</span>
              </button>
            </div>

            {/* Bullet Points */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pontos Chave do Slide:
              </span>
              <ul className="space-y-2">
                {activeSlide.bulletPoints.map((pt, i) => (
                  <li key={i} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Speaker Script / Roteiro da Fala */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Roteiro de Fala do Orador (3 Minutos):</span>
              </label>
              <textarea
                value={activeSlide.speakerNotes}
                onChange={(e) => {
                  const updated = [...slides];
                  updated[activeSlideIdx].speakerNotes = e.target.value;
                  setSlides(updated);
                }}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-amber-100 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* GovTech Financial ROI Calculator (Marco Legal) */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Calculadora de ROI & Economia para Cianorte (Marco Legal)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nº Servidores Afetados:</label>
                <input
                  type="number"
                  value={serverCount}
                  onChange={(e) => setServerCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Custo Médio/Hora (R$):</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Horas Salvas/Semana/Servidor:</label>
                <input
                  type="number"
                  value={hoursSavedPerWeek}
                  onChange={(e) => setHoursSavedPerWeek(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-950/60 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="block font-bold text-emerald-300">Economia Anual Estimada no Orçamento:</span>
                <span className="text-[11px] text-emerald-200/80">Contratação direta via Marco Legal das Startups</span>
              </div>
              <span className="font-mono text-lg font-extrabold text-emerald-400">
                R$ {yearlySavings.toLocaleString('pt-BR')} / ano
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
