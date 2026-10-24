import React, { useState } from 'react';
import { askAiCopilot, saveCodeFile } from '../../services/api';
import {
  ClipboardCheck,
  Sparkles,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Copy,
  Check,
  BarChart2,
  Plus,
} from 'lucide-react';

export default function ValidationSuite({ onRefreshState }: { onRefreshState: () => void }) {
  const [topic, setTopic] = useState('Atendimento ao cidadão e triagem de solicitações na Prefeitura de Cianorte');
  const [targetAudience, setTargetAudience] = useState('servidores');
  const [generatedSurvey, setGeneratedSurvey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Field Data metrics
  const [lostHours, setLostHours] = useState('14 horas/semana por servidor');
  const [paperVolume, setPaperVolume] = useState('1.200 processos físicos/mês');
  const [citizenSatisfaction, setCitizenSatisfaction] = useState('32% de aprovação no modelo atual');

  // Synthetic LGPD Data Generator
  const [synthData, setSynthData] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerateSurvey = async () => {
    setIsGenerating(true);
    try {
      const response = await askAiCopilot(
        `Gere um formulário relâmpago de validação (5 perguntas objetivas com opções e escala de 1 a 5) focado em: ${topic}. Público alvo: ${targetAudience}. Esse formulário servirá para comprovar o Teste de Interesse e Validação do Problema no Hackathon GovTech Cianorte.`,
        'survey'
      );
      setGeneratedSurvey(response.text || 'Erro ao gerar pesquisa.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLGPDDataset = async () => {
    setIsGenerating(true);
    try {
      const response = await askAiCopilot(
        `Gere uma base de dados sintéticos anonimizada em formato JSON válido contendo 5 solicitações fictícias de munícipes de Cianorte (sem CPF real, nomes sintéticos ex: Cidadão #101, bairros de Cianorte como Zona de Armazém, Centro, Vila Operária). Isso comprova compliance LGPD para o Tech Lead.`,
        'code'
      );

      // Extract JSON string
      const jsonMatch = response.text.match(/```(?:json)?\n([\s\S]*?)```/);
      const jsonText = jsonMatch ? jsonMatch[1].trim() : response.text;
      setSynthData(jsonText);

      // Save as file in Code Hub
      await saveCodeFile({
        path: 'src/data/dadosSinteticosLGPD.json',
        content: jsonText,
        language: 'json',
        modifiedBy: 'Líder de UX',
      });
      onRefreshState();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Suíte de Validação & UX (Líder de Validação)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Critérios 1, 2 e 4
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Ferramentas para colher evidências da dor, formular pesquisas relâmpago e alimentar o Tech Lead com dados LGPD.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FLASH FORM GENERATOR */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Gerador de Form/Pesquisa Relâmpago</span>
            </h3>
            <span className="text-[10px] text-slate-500">Teste de Interesse</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tópico Central da Pesquisa:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Público Alvo:</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="servidores">Servidores Públicos da Prefeitura</option>
                <option value="municipes">Munícipes / Cidadãos de Cianorte</option>
                <option value="mentores">Mentores e Especialistas SEBRAE</option>
              </select>
            </div>

            <button
              onClick={handleGenerateSurvey}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>{isGenerating ? 'Gerando Pesquisa...' : 'Gerar Questionário de Validação'}</span>
            </button>
          </div>

          {generatedSurvey && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-400">Questionário Gerado:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSurvey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Textos'}</span>
                </button>
              </div>
              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[250px] overflow-y-auto">
                {generatedSurvey}
              </div>
            </div>
          )}
        </div>

        {/* FIELD EVIDENCE & LGPD DATASET */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
          
          {/* Field Evidence Metrics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Mapeamento Quantitativo da Dor em Cianorte</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Horas Perdidas</span>
                <input
                  type="text"
                  value={lostHours}
                  onChange={(e) => setLostHours(e.target.value)}
                  className="w-full bg-transparent font-bold text-cyan-300 mt-1 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Volume em Papel</span>
                <input
                  type="text"
                  value={paperVolume}
                  onChange={(e) => setPaperVolume(e.target.value)}
                  className="w-full bg-transparent font-bold text-amber-300 mt-1 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Aprovação Atual</span>
                <input
                  type="text"
                  value={citizenSatisfaction}
                  onChange={(e) => setCitizenSatisfaction(e.target.value)}
                  className="w-full bg-transparent font-bold text-rose-400 mt-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Synthetic LGPD Dataset Generator */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Base Sintética Anonimizada (LGPD)</span>
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Gere um conjunto de dados sintéticos para o Tech Lead incluir na aplicação sem infringir dados sensíveis.
            </p>

            <button
              onClick={handleGenerateLGPDDataset}
              disabled={isGenerating}
              className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold border border-emerald-800 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isGenerating ? 'Gerando JSON...' : 'Gerar Dataset Sintético & Salvar no Code Hub'}</span>
            </button>

            {synthData && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 max-h-[180px] overflow-y-auto">
                <pre>{synthData}</pre>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
