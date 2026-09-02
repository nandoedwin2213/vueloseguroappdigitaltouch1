import React from 'react';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { soundFX } from '../services/soundService';

interface MainDashboardProps {
  onStartNewCheckup: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onStartNewCheckup }) => {
  const handleStart = () => {
    soundFX.playTap();
    onStartNewCheckup();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 select-none flex flex-col items-center justify-center min-h-[82vh]">
      
      {/* Central Visual: Pulsing Cybernetic Neural Brain */}
      <div className="relative group flex items-center justify-center cursor-pointer" onClick={handleStart}>
        {/* Glowing HUD Backlight Pulse */}
        <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-cyan-500/40 rounded-full blur-3xl opacity-80 group-hover:opacity-100 animate-pulse transition-opacity duration-1000"></div>
        
        {/* Holographic Ring Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full p-2.5 bg-slate-900/90 border-4 border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.5)] flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105 active:scale-95">
          <img
            src="/neural_brain.jpg"
            alt="Cerebro Neuronal POS"
            className="w-full h-full object-cover rounded-full filter brightness-110 contrast-110"
          />
          
          {/* Animated Scanning Beam Line Effect */}
          <div className="absolute inset-x-0 h-1 bg-emerald-400/80 shadow-[0_0_15px_#10b981] animate-pulse pointer-events-none top-1/2"></div>
        </div>
      </div>

      {/* Futuristic Welcome Header */}
      <div className="text-center space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-600 text-emerald-400 text-xs font-black uppercase tracking-widest shadow-xl">
          <ShieldCheck size={16} /> Estación Operativa de Control Pre-Vuelo 🇪🇨
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
          ¡BIENVENIDO! 🫡
        </h1>

        <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
          Chequeo rápido pre-vuelo: <strong className="text-emerald-400">Signos Vitales 🩺</strong>, <strong className="text-emerald-400">IM SAFE 📋</strong> y <strong className="text-emerald-400">Reflejos Cerebro-Mano ⚡</strong>.
        </p>
      </div>

      {/* Massive Single Primary Action Button */}
      <div className="w-full max-w-md pt-2">
        <button
          onClick={handleStart}
          className="w-full py-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-2xl sm:text-3xl rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.6)] border-2 border-emerald-300 flex items-center justify-center gap-4 transition-all cursor-pointer group"
        >
          <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform">
            <UserPlus size={36} />
          </div>
          <div className="text-left">
            <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold">En un clic 🚀</div>
            <div>INICIAR CHEQUEO</div>
          </div>
        </button>
      </div>

      {/* Minimal Footer Badge */}
      <div className="text-xs text-slate-500 font-mono pt-4">
        🔒 Acceso restringido para Pilotos y Cadetes • Datos enviados a la Nube
      </div>
    </div>
  );
};
