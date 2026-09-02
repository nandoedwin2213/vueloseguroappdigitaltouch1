import React, { useState } from 'react';
import { VitalSigns } from '../types';
import { HeartPulse, Activity, Gauge, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { soundFX } from '../services/soundService';

interface VitalSignsStepProps {
  initialData?: VitalSigns;
  onSubmit: (vitalSigns: VitalSigns) => void;
  onBack: () => void;
}

export const VitalSignsStep: React.FC<VitalSignsStepProps> = ({
  initialData,
  onSubmit,
  onBack,
}) => {
  const [sistolica, setSistolica] = useState<number>(initialData?.sistolica || 120);
  const [diastolica, setDiastolica] = useState<number>(initialData?.diastolica || 80);
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState<number>(initialData?.frecuenciaCardiaca || 72);

  // Compute Blood Pressure Status
  let bpStatus: 'NORMAL' | 'ELEVADA' | 'ALTA' = 'NORMAL';
  if (sistolica >= 140 || diastolica >= 90) {
    bpStatus = 'ALTA';
  } else if (sistolica >= 125 || diastolica >= 83) {
    bpStatus = 'ELEVADA';
  }

  // Compute Heart Rate Status
  let hrStatus: 'NORMAL' | 'ELEVADA' | 'BAJA' = 'NORMAL';
  if (frecuenciaCardiaca > 100) {
    hrStatus = 'ELEVADA';
  } else if (frecuenciaCardiaca < 55) {
    hrStatus = 'BAJA';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playTap();
    onSubmit({
      sistolica: Number(sistolica),
      diastolica: Number(diastolica),
      frecuenciaCardiaca: Number(frecuenciaCardiaca),
      bpStatus,
      hrStatus,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Header Banner with Emojis */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Paso 2 de 5 🩺</span>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <HeartPulse className="text-rose-500 animate-pulse" size={32} />
            <span>Ingreso de Signos Vitales 💓</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Utilice el tensiómetro al lado de la estación POS e ingrese su Presión Arterial y Frecuencia Cardíaca.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFX.playTap();
            onBack();
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Atrás
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Presión Arterial (Sistólica / Diastólica) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Gauge className="text-blue-400" size={24} />
                <h3 className="text-lg font-black text-white">Presión Arterial 🩸</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                  bpStatus === 'NORMAL'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : bpStatus === 'ELEVADA'
                      ? 'bg-amber-950 text-amber-400 border-amber-700'
                      : 'bg-rose-950 text-rose-400 border-rose-700'
                }`}
              >
                {bpStatus === 'NORMAL' && '🟢 Presión Normal'}
                {bpStatus === 'ELEVADA' && '🟡 Presión Elevada (Obs)'}
                {bpStatus === 'ALTA' && '🔴 Presión Alta (Obs)'}
              </span>
            </div>

            {/* Sistólica Stepper */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-300">
                Sistólica (Máxima - mmHg)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setSistolica(Math.max(80, sistolica - 2));
                  }}
                  className="w-14 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center shadow-md"
                >
                  -
                </button>
                <div className="flex-1 bg-slate-950 border-2 border-blue-900 rounded-xl p-3 text-center text-3xl font-mono font-black text-blue-400">
                  {sistolica} <span className="text-sm text-slate-500">mmHg</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setSistolica(Math.min(200, sistolica + 2));
                  }}
                  className="w-14 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center shadow-md"
                >
                  +
                </button>
              </div>
            </div>

            {/* Diastólica Stepper */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-300">
                Diastólica (Mínima - mmHg)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setDiastolica(Math.max(50, diastolica - 2));
                  }}
                  className="w-14 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center shadow-md"
                >
                  -
                </button>
                <div className="flex-1 bg-slate-950 border-2 border-blue-900 rounded-xl p-3 text-center text-3xl font-mono font-black text-blue-400">
                  {diastolica} <span className="text-sm text-slate-500">mmHg</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setDiastolica(Math.min(130, diastolica + 2));
                  }}
                  className="w-14 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center shadow-md"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Touch Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-semibold uppercase">Presets Rápidos Tensiómetro:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { s: 115, d: 75, label: '115/75 (Óptima)' },
                  { s: 120, d: 80, label: '120/80 (Normal)' },
                  { s: 130, d: 85, label: '130/85 (Elevada)' },
                  { s: 138, d: 88, label: '138/88 (Límite)' },
                  { s: 145, d: 95, label: '145/95 (Alta)' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => {
                      soundFX.playTap();
                      setSistolica(p.s);
                      setDiastolica(p.d);
                    }}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 text-center active:scale-95 transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Frecuencia Cardíaca / Pulso (BPM) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="text-rose-500" size={24} />
                <h3 className="text-lg font-black text-white">Frecuencia Cardíaca 💓</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                  hrStatus === 'NORMAL'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : hrStatus === 'ELEVADA'
                      ? 'bg-amber-950 text-amber-400 border-amber-700'
                      : 'bg-blue-950 text-blue-400 border-blue-700'
                }`}
              >
                {hrStatus === 'NORMAL' && '🟢 Pulso Normal'}
                {hrStatus === 'ELEVADA' && '🟡 Pulso Elevado (Obs)'}
                {hrStatus === 'BAJA' && '🔵 Pulso Atleta/Bajo'}
              </span>
            </div>

            {/* Frecuencia Cardíaca Stepper */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-300">
                Pulso en Reposo (BPM - Latidos por minuto)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setFrecuenciaCardiaca(Math.max(40, frecuenciaCardiaca - 2));
                  }}
                  className="w-14 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center shadow-md"
                >
                  -
                </button>
                <div className="flex-1 bg-slate-950 border-2 border-rose-900 rounded-xl p-3 text-center text-4xl font-mono font-black text-rose-400 flex items-center justify-center gap-2">
                  <span>{frecuenciaCardiaca}</span>
                  <span className="text-base text-slate-500">BPM</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setFrecuenciaCardiaca(Math.min(180, frecuenciaCardiaca + 2));
                  }}
                  className="w-14 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center shadow-md"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Pulse Presets */}
            <div className="space-y-2 pt-4 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-semibold uppercase">Presets Rápidos Pulso:</span>
              <div className="flex flex-wrap gap-2">
                {[58, 65, 72, 80, 88, 96, 105].map((bpm) => (
                  <button
                    type="button"
                    key={bpm}
                    onClick={() => {
                      soundFX.playTap();
                      setFrecuenciaCardiaca(bpm);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      frecuenciaCardiaca === bpm
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {bpm} BPM
                  </button>
                ))}
              </div>
            </div>

            {/* Policy Info Note */}
            <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-start gap-2 text-xs text-slate-400">
              <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                💡 <strong>Nota Operativa:</strong> Si la presión arterial o el pulso se encuentran elevados, se generará una <strong>OBSERVACIÓN 🟡</strong> en el comprobante final para revisión del oficial médico, pero no restringirá el vuelo por sí solo a menos que el IM SAFE lo dictamine.
              </span>
            </div>
          </div>
        </div>

        {/* Big Action Button: CONTINUAR */}
        <button
          type="submit"
          className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-950 border border-emerald-400 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <span>CONTINUAR A EVALUACIÓN IM SAFE 📋</span>
          <ArrowRight size={28} />
        </button>
      </form>
    </div>
  );
};
