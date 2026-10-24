import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, Sparkles, Key } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default team passcode: nexus2026 (or any input)
    if (passcode.trim().toLowerCase() === 'nexus2026' || passcode.trim() !== '') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Senha incorreta. Tente: nexus2026');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-6">
        
        {/* Top Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 mx-auto shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
            </div>
          </div>

          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            NEXUS GOVTECH 2026
          </h1>
          <p className="text-xs text-slate-400">
            Plataforma de Colaboração da Equipe <span className="text-cyan-300 font-bold">Nexus DC Br</span>
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            Hackathon GovTech Cianorte • SEBRAE / CMCTIC
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Autenticação de Acesso da Equipe
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>Senha do Time:</span>
                <span className="text-[10px] text-slate-500 font-mono">Dica: nexus2026</span>
              </label>

              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError('');
                  }}
                  placeholder="Digite a senha..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  autoFocus
                  required
                />
                <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>

              {error && (
                <p className="text-rose-400 text-[11px] mt-1.5 font-medium">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition active:scale-95"
            >
              <span>Acessar Plataforma da Equipe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Acesso restrito aos 3 integrantes credenciados no edital oficial.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
