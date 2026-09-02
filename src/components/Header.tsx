import React, { useState, useEffect } from 'react';
import { Plane, Lock, Clock, ShieldCheck, Check, Download } from 'lucide-react';
import { SystemConfig } from '../types';
import { soundFX } from '../services/soundService';

interface HeaderProps {
  currentStep: number;
  config: SystemConfig;
  isAdminUnlocked: boolean;
  onOpenAdminPin: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  config,
  isAdminUnlocked,
  onOpenAdminPin,
  onNavigateHome,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    // Listen for PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    soundFX.playTap();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const steps = [
    { num: 1, label: 'DATOS 🪪' },
    { num: 2, label: 'VITALES 🩺' },
    { num: 3, label: 'IM SAFE 📋' },
    { num: 4, label: 'REFLEJOS ⚡' },
    { num: 5, label: 'RESULTADO & TICKET 🏆' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800/80 shadow-xl sticky top-0 z-40 select-none">
      {/* Kiosk Clean Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-300">
        
        {/* Brand & Logo (Clickable to return to Pilot Welcome Launcher) */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-900/50 flex items-center justify-center">
            <Plane size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-white tracking-wider flex items-center gap-2">
              VUELOSEGURO <span className="bg-emerald-900/80 text-emerald-400 border border-emerald-700 px-2 py-0.5 rounded text-xs font-mono">POS 9.7 ✈️</span>
            </h1>
            <p className="text-slate-400 text-[11px] hidden sm:block">Estación Fisiológica Pre-Vuelo Militar</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {/* PWA Install Button (If PWA prompt available) */}
          {deferredPrompt && (
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400 text-xs font-black shadow-lg shadow-emerald-950 animate-pulse active:scale-95 transition-all cursor-pointer"
              title="Instalar VueloSeguro POS en el escritorio"
            >
              <Download size={15} />
              <span>Instalar App 💻</span>
            </button>
          )}

          {/* Station ID */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400 text-xs">
            <ShieldCheck size={14} className="text-blue-400" />
            <span>{config.stationId}</span>
          </div>

          {/* Live Clock */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-emerald-400 text-xs sm:text-sm">
            <Clock size={14} />
            <span>{timeStr}</span>
          </div>

          {/* Discreet Admin Lock Button (PIN required) */}
          <button
            onClick={() => {
              soundFX.playTap();
              onOpenAdminPin();
            }}
            className={`touch-icon-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              isAdminUnlocked
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 hover:bg-amber-900'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Acceso restringido Administrador (PIN: 1234)"
          >
            <Lock size={15} className={isAdminUnlocked ? 'text-amber-400' : 'text-slate-500'} />
            <span className="hidden md:inline">{isAdminUnlocked ? 'Admin Bloquear' : 'Admin PIN'}</span>
          </button>
        </div>
      </div>

      {/* POS Touch Step Navigation Progress Bar */}
      {currentStep > 0 && (
        <div className="bg-slate-950/90 border-t border-slate-800/80 px-3 py-2.5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {steps.map((step) => {
              const isActive = currentStep === step.num;
              const isPassed = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-black text-xs transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-950/80 scale-102'
                      : isPassed
                        ? 'bg-slate-900 border-emerald-700/60 text-emerald-400'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-900 shadow-md'
                        : isPassed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isPassed ? <Check size={12} strokeWidth={3} /> : step.num}
                  </span>
                  <span className="truncate tracking-wide">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
