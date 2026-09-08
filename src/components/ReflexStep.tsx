import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ReactionMetrics, ReactionTrial, SystemConfig, AssessmentStatus } from '../types';
import { Zap, Timer, CheckCircle, RotateCcw, ArrowRight, ArrowLeft, ShieldAlert, Sparkles, Info } from 'lucide-react';
import { soundFX } from '../services/soundService';
import { getReactionInterpretation } from '../services/storageService';

interface ReflexStepProps {
  config: SystemConfig;
  onSubmit: (metrics: ReactionMetrics) => void;
  onBack: () => void;
}

type TestState = 'INSTRUCTIONS' | 'WAITING' | 'STIMULUS' | 'ANTICIPATED_ERROR' | 'TRIAL_FINISHED' | 'ALL_FINISHED';

export const ReflexStep: React.FC<ReflexStepProps> = ({
  config,
  onSubmit,
  onBack,
}) => {
  const totalRequiredTrials = config.reactionTrialsCount || 5;

  const [testState, setTestState] = useState<TestState>('INSTRUCTIONS');
  const [currentTrialIndex, setCurrentTrialIndex] = useState<number>(1);
  const [trials, setTrials] = useState<ReactionTrial[]>([]);
  const [lastTrialMs, setLastTrialMs] = useState<number | null>(null);

  // High-precision timing refs
  const stimulusStartTimeRef = useRef<number>(0);
  const waitingStartTimeRef = useRef<number>(0);
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start trial cycle
  const startNextTrial = useCallback(() => {
    setLastTrialMs(null);
    setTestState('WAITING');
    waitingStartTimeRef.current = performance.now();

    // Random delay between 1800ms and 4000ms for unpredictability
    const randomDelay = Math.floor(Math.random() * 2200) + 1800;

    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);

    timerTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        stimulusStartTimeRef.current = performance.now();
        setTestState('STIMULUS');
        soundFX.playCue();
      });
    }, randomDelay);
  }, []);

  // Handle user interaction (Touch, Click, Spacebar)
  const handleInteraction = useCallback((e?: React.SyntheticEvent | KeyboardEvent) => {
    if (e) {
      if ('preventDefault' in e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
    }

    const now = performance.now();

    // STATE: WAITING
    if (testState === 'WAITING') {
      // Grace period: ignore touches within 400ms of starting waiting state (prevents tap bleed from previous buttons)
      if (now - waitingStartTimeRef.current < 400) {
        return;
      }

      // Early touch detected (Anticipation)
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
      soundFX.playWarning();
      setTestState('ANTICIPATED_ERROR');

      const newTrial: ReactionTrial = {
        trialIndex: currentTrialIndex,
        delayMs: 0,
        reactionTimeMs: 0,
        isAnticipated: true,
        isCorrect: false,
        timestamp: Date.now(),
      };

      setTrials((prev) => [...prev, newTrial]);
      return;
    }

    // STATE: STIMULUS
    if (testState === 'STIMULUS') {
      soundFX.playTap();
      const reactionTimeMs = Math.round(now - stimulusStartTimeRef.current);
      setLastTrialMs(reactionTimeMs);

      const newTrial: ReactionTrial = {
        trialIndex: currentTrialIndex,
        delayMs: Math.round(stimulusStartTimeRef.current),
        reactionTimeMs,
        isAnticipated: false,
        isCorrect: reactionTimeMs >= 120,
        timestamp: Date.now(),
      };

      const updatedTrials = [...trials, newTrial];
      setTrials(updatedTrials);

      if (currentTrialIndex >= totalRequiredTrials) {
        setTestState('ALL_FINISHED');
      } else {
        setTestState('TRIAL_FINISHED');
      }
    }
  }, [testState, currentTrialIndex, totalRequiredTrials, trials]);

  // Keyboard shortcut listener (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (testState === 'WAITING' || testState === 'STIMULUS') {
          handleInteraction(e);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [testState, handleInteraction]);

  // Reset entire test
  const resetEntireTest = () => {
    soundFX.playTap();
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    setTrials([]);
    setCurrentTrialIndex(1);
    setLastTrialMs(null);
    setTestState('INSTRUCTIONS');
  };

  // Compute final statistics
  const validTrials = trials.filter((t) => !t.isAnticipated && t.reactionTimeMs > 0);
  const validTimes = validTrials.map((t) => t.reactionTimeMs);

  const minMs = validTimes.length > 0 ? Math.min(...validTimes) : 0;
  const maxMs = validTimes.length > 0 ? Math.max(...validTimes) : 0;
  const avgMs = validTimes.length > 0 ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length) : 0;

  let medianMs = 0;
  if (validTimes.length > 0) {
    const sorted = [...validTimes].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianMs = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }

  const correctCount = validTrials.length;
  const anticipatedCount = trials.filter((t) => t.isAnticipated).length;
  const incorrectCount = trials.length - correctCount - anticipatedCount;

  // Evaluation status rule
  let evaluationStatus: AssessmentStatus = 'APTO';
  if (avgMs > config.reactionTimeObservacionMax || anticipatedCount >= 3) {
    evaluationStatus = 'NO_APTO';
  } else if (avgMs > config.reactionTimeAptoMax || anticipatedCount >= 1) {
    evaluationStatus = 'OBSERVACION';
  }

  const handleFinish = () => {
    soundFX.playTap();
    const interp = getReactionInterpretation(avgMs);
    onSubmit({
      trials,
      totalTrials: trials.length,
      minMs,
      maxMs,
      avgMs,
      medianMs,
      correctCount,
      incorrectCount,
      anticipatedCount,
      evaluationStatus,
      qualitativeLabel: interp.label,
    });
  };

  useEffect(() => {
    return () => {
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Paso 4 de 5 ⚡</span>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Zap className="text-emerald-400" size={28} /> Prueba de Reflejo Cerebro-Mano
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Medición de tiempo de reacción psicométrica en milisegundos (`performance.now()`).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFX.playTap();
            onBack();
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={16} /> Atrás
        </button>
      </div>

      {/* STATE 1: INSTRUCTIONS */}
      {testState === 'INSTRUCTIONS' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 text-center">
          <div className="w-20 h-20 bg-emerald-950 border-2 border-emerald-500 text-emerald-400 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-950">
            <Timer size={48} />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h3 className="text-2xl font-black text-white">Instrucciones de la Prueba</h3>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              1. Mantenga su dedo cerca de la pantalla (o mano sobre el ratón / tecla <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-emerald-400 font-mono">ESPACIO</kbd>).<br />
              2. La pantalla estará en color gris con el mensaje <strong className="text-amber-400">"ESPERE SEÑAL"</strong> durante un tiempo aleatorio.<br />
              3. En cuanto la pantalla cambie a <strong className="text-emerald-400">VERDE RADIANTE 🟢</strong>, toque lo más rápido posible.<br />
              4. Se realizarán <strong className="text-white">{totalRequiredTrials} repeticiones</strong>. No toque antes de tiempo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              startNextTrial();
            }}
            className="w-full max-w-md mx-auto py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-950 border border-emerald-400 flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <span>INICIAR PRUEBA DE REFLEJOS ⚡</span>
            <Zap size={24} />
          </button>
        </div>
      )}

      {/* STATE 2 & 3: TOUCH INTERACTIVE ZONE (WAITING or STIMULUS) */}
      {(testState === 'WAITING' || testState === 'STIMULUS') && (
        <div
          onPointerDown={handleInteraction}
          className={`w-full min-h-[420px] rounded-3xl border-4 flex flex-col items-center justify-center p-8 text-center cursor-pointer touch-none select-none transition-colors duration-75 shadow-2xl ${
            testState === 'WAITING'
              ? 'bg-slate-900 border-slate-700 hover:bg-slate-850'
              : 'bg-emerald-500 border-emerald-300 shadow-emerald-500/50 scale-101 animate-pulse'
          }`}
        >
          {testState === 'WAITING' && (
            <div className="space-y-4 pointer-events-none">
              <div className="w-24 h-24 bg-slate-800 border border-slate-600 rounded-full mx-auto flex items-center justify-center text-amber-400 animate-pulse">
                <Timer size={48} />
              </div>
              <h3 className="text-3xl font-black text-amber-400 uppercase tracking-wider">
                ¡ESPERE SEÑAL VERDE!
              </h3>
              <p className="text-slate-400 text-sm font-semibold">
                Ensayo {currentTrialIndex} de {totalRequiredTrials} • No toque la pantalla aún...
              </p>
              <p className="text-xs text-slate-500 italic">
                (Puedes tocar la pantalla o presionar ESPACIO al ver el color verde)
              </p>
            </div>
          )}

          {testState === 'STIMULUS' && (
            <div className="space-y-4 pointer-events-none">
              <div className="w-32 h-32 bg-white text-emerald-900 rounded-full mx-auto flex items-center justify-center font-black text-3xl shadow-2xl animate-bounce">
                ¡TOQUE YA!
              </div>
              <h3 className="text-4xl font-black text-white uppercase tracking-widest">
                ¡TOQUE LA PANTALLA AHORA!
              </h3>
            </div>
          )}
        </div>
      )}

      {/* STATE 4: ANTICIPATED TOUCH ERROR */}
      {testState === 'ANTICIPATED_ERROR' && (
        <div className="bg-slate-900 border-2 border-rose-600 p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-rose-950 border-2 border-rose-500 text-rose-400 rounded-full mx-auto flex items-center justify-center">
            <ShieldAlert size={48} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-black text-rose-400">⚠️ RESPUESTA ANTICIPADA</h3>
            <p className="text-slate-300 text-sm">
              Has tocado antes de la aparición de la señal verde. Mantén la calma y espera el color verde.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              setTimeout(() => {
                startNextTrial();
              }, 250);
            }}
            className="w-full max-w-sm mx-auto py-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw size={20} /> REPETIR ENSAYO
          </button>
        </div>
      )}

      {/* STATE 5: INTERMEDIATE TRIAL FINISHED */}
      {testState === 'TRIAL_FINISHED' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-950 border-2 border-emerald-500 text-emerald-400 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-950">
            <CheckCircle size={48} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ensayo {currentTrialIndex} de {totalRequiredTrials} Completado
            </span>
            <div className="text-5xl font-black font-mono text-emerald-400 flex items-center justify-center gap-2">
              {lastTrialMs} <span className="text-2xl text-slate-400">ms</span>
            </div>
            <p className="text-xs text-slate-400">
              {lastTrialMs && lastTrialMs < 250 ? '⚡ Reflejo Excelente (Piloto)' : '✅ Tiempo de reacción registrado.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              setCurrentTrialIndex((prev) => prev + 1);
              setTimeout(() => {
                startNextTrial();
              }, 250);
            }}
            className="w-full max-w-sm mx-auto py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>SIGUIENTE ENSAYO ({currentTrialIndex + 1}/{totalRequiredTrials}) ⚡</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}

      {/* STATE 6: ALL FINISHED - METRICS BREAKDOWN */}
      {testState === 'ALL_FINISHED' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Resultado de Reflejos</span>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                Resumen de Tiempos de Reacción <Sparkles className="text-emerald-400" size={22} />
              </h3>
            </div>

            <button
              type="button"
              onClick={resetEntireTest}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} /> Repetir Prueba
            </button>
          </div>

          {/* Primary Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Avg */}
            <div className="bg-slate-950 border-2 border-emerald-600/80 p-4 rounded-xl space-y-1">
              <div className="text-xs font-bold text-emerald-400 uppercase">Tiempo Promedio</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">{avgMs} <span className="text-sm text-slate-400">ms</span></div>
              <div className="text-xs text-slate-500">Media de aciertos</div>
            </div>

            {/* Min */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="text-xs font-bold text-blue-400 uppercase">Mejor Tiempo (Mín)</div>
              <div className="text-3xl font-black text-blue-400 font-mono">{minMs} <span className="text-sm text-slate-400">ms</span></div>
              <div className="text-xs text-slate-500">Reflejo más rápido</div>
            </div>

            {/* Max */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="text-xs font-bold text-purple-400 uppercase">Peor Tiempo (Máx)</div>
              <div className="text-3xl font-black text-purple-400 font-mono">{maxMs} <span className="text-sm text-slate-400">ms</span></div>
              <div className="text-xs text-slate-500">Reflejo más lento</div>
            </div>

            {/* Median */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="text-xs font-bold text-amber-400 uppercase">Mediana</div>
              <div className="text-3xl font-black text-amber-400 font-mono">{medianMs} <span className="text-sm text-slate-400">ms</span></div>
              <div className="text-xs text-slate-500">Valor central</div>
            </div>
          </div>

          {/* Clinical & Technical Reference Table */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-300">
            <div className="font-bold text-slate-200 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-black">
                <Info size={16} /> Interpretación Psicométrica Orientativa:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getReactionInterpretation(avgMs).badgeBg}`}>
                {getReactionInterpretation(avgMs).label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] font-mono text-center">
              <div className={`p-2 rounded border ${avgMs < 220 ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                <strong className="block text-xs">&lt; 220 ms</strong>
                <span>Muy rápido / excelente</span>
              </div>
              <div className={`p-2 rounded border ${avgMs >= 220 && avgMs <= 250 ? 'bg-teal-950 border-teal-500 text-teal-300 font-bold ring-2 ring-teal-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                <strong className="block text-xs">220–250 ms</strong>
                <span>Normal - bueno</span>
              </div>
              <div className={`p-2 rounded border ${avgMs > 250 && avgMs <= 280 ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold ring-2 ring-blue-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                <strong className="block text-xs">250–280 ms</strong>
                <span>Normal - lento (Vigilar)</span>
              </div>
              <div className={`p-2 rounded border ${avgMs > 280 && avgMs <= 350 ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold ring-2 ring-amber-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                <strong className="block text-xs">280–350 ms</strong>
                <span>Lentificación relevante</span>
              </div>
              <div className={`p-2 rounded border ${avgMs > 350 ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold ring-2 ring-rose-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                <strong className="block text-xs">&gt; 350 ms</strong>
                <span>Marcadamente lento</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-slate-900">
              💡 <strong>Nota sobre Pantallas Táctiles & Dispositivos:</strong> El tiempo de reacción depende de la edad, fatiga, horas de sueño y dispositivo utilizado. En pruebas PVT con <strong>pantallas táctiles</strong>, la latencia de respuesta del hardware añade una media aproximada de <strong>~68.5 ms</strong>.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleFinish}
            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-950 border border-emerald-400 flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <span>GENERAR APTITUD FINAL 🏆</span>
            <ArrowRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
};
