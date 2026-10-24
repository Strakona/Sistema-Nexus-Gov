import React, { useState, useEffect } from 'react';
import { CriteriaEvaluation } from '../types';
import { evaluateProjectWithAi } from '../services/api';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface AIEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIEvaluatorModal({ isOpen, onClose }: AIEvaluatorModalProps) {
  const [evaluation, setEvaluation] = useState<CriteriaEvaluation | null>(null);
  const [loading, setLoading] = useState(false);

  const runEvaluation = async () => {
    setLoading(true);
    try {
      const result = await evaluateProjectWithAi({
        problemText: 'Servidores municipais de Cianorte gastam 14h/semana em triagem manual de processos em papel.',
        validationText: 'Entrevistas realizadas no SEBRAE comprovam que 68% dos chamados são dúvidas de status.',
        valuePropText: 'Redução de 65% no tempo de atendimento e economia de R$ 240 mil/ano via plataforma digital.',
        interestText: 'Pesquisa relâmpago com 92% de intenção de adesão imediata.',
        mvpDescription: 'Aplicação Web desenvolvida em React/TypeScript com triagem automática e conformidade LGPD.',
        businessModelText: 'Modelo SaaS Municipal e contratação direta via Marco Legal das Startups (LC 182/2021).',
        pitchSummary: 'Pitch Deck de 7 slides estruturado e ensaiado em 3 minutos.',
      });

      if (result.success && result.evaluation) {
        setEvaluation(result.evaluation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !evaluation) {
      runEvaluation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <span>Simulador da Banca Avaliadora IA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Edital Regulamento GovTech
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Auditoria automática baseada nos 7 critérios do Anexo I (Nota Máxima: 70 pontos).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-200">
              A Banca Avaliadora IA está analisando os 7 critérios do Regulamento...
            </div>
            <p className="text-xs text-slate-400">
              Avaliando Persona, Validação, Proposta de Valor, Teste de Interesse, MVP, Modelo de Negócio e Pitch.
            </p>
          </div>
        ) : evaluation ? (
          <div className="space-y-6">
            
            {/* Total Score & Summary Banner */}
            <div className="p-5 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 border border-cyan-800/60 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center justify-center md:justify-start gap-1">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>Pontuação Projetada da Equipe</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                  {evaluation.summary}
                </p>
              </div>

              <div className="text-center bg-slate-950 px-6 py-3 rounded-2xl border border-cyan-500/40 shadow-inner">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Nota Final</span>
                <span className="font-mono text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                  {evaluation.totalScore}
                </span>
                <span className="text-xs text-slate-400 font-bold"> / 70.0</span>
              </div>
            </div>

            {/* Strengths & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl space-y-2 text-xs">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pontos Fortes Principais:</span>
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {evaluation.topStrengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-2xl space-y-2 text-xs">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5 uppercase text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Ajustes Recomendados para o Palco:</span>
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {evaluation.keyRisks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Criteria Breakdowns */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Detalhamento por Critério (0 a 10 pontos cada)
              </h3>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {evaluation.criteria.map((c) => (
                  <div key={c.criterionNumber} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">
                        {c.criterionNumber}. {c.title}
                      </span>
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        {c.score} / 10
                      </span>
                    </div>

                    <p className="text-slate-400 leading-relaxed">{c.feedback}</p>

                    {c.recommendations && c.recommendations.length > 0 && (
                      <div className="text-[11px] text-cyan-300 pt-1 border-t border-slate-900">
                        <span className="font-semibold text-slate-500">Dica: </span>
                        {c.recommendations.join(' ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Re-run button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={runEvaluation}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reavaliar com Dados Atualizados</span>
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
