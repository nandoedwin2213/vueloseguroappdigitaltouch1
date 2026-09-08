import React, { useState } from 'react';
import { VitalSigns } from '../types';
import { HeartPulse, Activity, Gauge, Moon, ArrowRight, ArrowLeft, Info, AlertTriangle } from 'lucide-react';
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
  const [horasSueno, setHorasSueno] = useState<number>(initialData?.horasSueno ?? 7);

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

  // Compute Sleep Status (Minimum 6 hours required)
  const sleepStatus: 'SUFICIENTE' | 'INSUFICIENTE' = horasSueno >= 6 ? 'SUFICIENTE' : 'INSUFICIENTE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playTap();
    onSubmit({
      sistolica: Number(sistolica),
      diastolica: Number(diastolica),
      frecuenciaCardiaca: Number(frecuenciaCardiaca),
      horasSueno: Number(horasSueno),
      bpStatus,
      hrStatus,
      sleepStatus,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Header Banner with Emojis */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Paso 2 de 5 🩺</span>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <HeartPulse className="text-rose-500 animate-pulse" size={32} />
            <span>Signos Vitales y Horas de Sueño 💓🌙</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Ingrese los parámetros del tensiómetro, pulso y las horas de descanso continuo (mínimo 6h).
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Input Grid - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Presión Arterial (Sistólica / Diastólica) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Gauge className="text-blue-400" size={22} />
                  <h3 className="text-base font-black text-white">Presión Arterial 🩸</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    bpStatus === 'NORMAL'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                      : bpStatus === 'ELEVADA'
                        ? 'bg-amber-950 text-amber-400 border-amber-700'
                        : 'bg-rose-950 text-rose-400 border-rose-700'
                  }`}
                >
                  {bpStatus === 'NORMAL' && '🟢 Normal'}
                  {bpStatus === 'ELEVADA' && '🟡 Elevada'}
                  {bpStatus === 'ALTA' && '🔴 Alta (Obs)'}
                </span>
              </div>

              {/* Sistólica Stepper */}
              <div className="space-y-1.5 mb-4">
                <label className="block text-[11px] font-bold uppercase text-slate-300">
                  Sistólica (mmHg)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setSistolica(Math.max(80, sistolica - 2));
                    }}
                    className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-xl rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-slate-950 border border-blue-900/80 rounded-xl p-2 text-center text-2xl font-mono font-black text-blue-400">
                    {sistolica} <span className="text-xs text-slate-500">mmHg</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setSistolica(Math.min(200, sistolica + 2));
                    }}
                    className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-xl rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Diastólica Stepper */}
              <div className="space-y-1.5 mb-4">
                <label className="block text-[11px] font-bold uppercase text-slate-300">
                  Diastólica (mmHg)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setDiastolica(Math.max(50, diastolica - 2));
                    }}
                    className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-xl rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-slate-950 border border-blue-900/80 rounded-xl p-2 text-center text-2xl font-mono font-black text-blue-400">
                    {diastolica} <span className="text-xs text-slate-500">mmHg</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setDiastolica(Math.min(130, diastolica + 2));
                    }}
                    className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-xl rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Touch Presets */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Presets Presión:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { s: 115, d: 75, label: '115/75 Óptima' },
                  { s: 120, d: 80, label: '120/80 Normal' },
                  { s: 130, d: 85, label: '130/85 Elevada' },
                  { s: 145, d: 95, label: '145/95 Alta' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => {
                      soundFX.playTap();
                      setSistolica(p.s);
                      setDiastolica(p.d);
                    }}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 text-center active:scale-95 cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Frecuencia Cardíaca / Pulso (BPM) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="text-rose-500" size={22} />
                  <h3 className="text-base font-black text-white">Pulso (BPM) 💓</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    hrStatus === 'NORMAL'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                      : hrStatus === 'ELEVADA'
                        ? 'bg-amber-950 text-amber-400 border-amber-700'
                        : 'bg-blue-950 text-blue-400 border-blue-700'
                  }`}
                >
                  {hrStatus === 'NORMAL' && '🟢 Normal'}
                  {hrStatus === 'ELEVADA' && '🟡 Elevado'}
                  {hrStatus === 'BAJA' && '🔵 Atleta'}
                </span>
              </div>

              {/* Frecuencia Cardíaca Stepper */}
              <div className="space-y-1.5 mb-4">
                <label className="block text-[11px] font-bold uppercase text-slate-300">
                  Latidos por minuto
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setFrecuenciaCardiaca(Math.max(40, frecuenciaCardiaca - 2));
                    }}
                    className="w-12 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-slate-950 border border-rose-900/80 rounded-xl p-3 text-center text-3xl font-mono font-black text-rose-400 flex items-center justify-center gap-1">
                    <span>{frecuenciaCardiaca}</span>
                    <span className="text-xs text-slate-500">BPM</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setFrecuenciaCardiaca(Math.min(180, frecuenciaCardiaca + 2));
                    }}
                    className="w-12 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Pulse Presets */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Presets Pulso:</span>
              <div className="flex flex-wrap gap-1.5">
                {[58, 65, 72, 80, 88, 96, 105].map((bpm) => (
                  <button
                    type="button"
                    key={bpm}
                    onClick={() => {
                      soundFX.playTap();
                      setFrecuenciaCardiaca(bpm);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      frecuenciaCardiaca === bpm
                        ? 'bg-rose-600 text-white border-rose-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {bpm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Horas de Sueño / Descanso Continuo 🌙 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Moon className="text-indigo-400" size={22} />
                  <h3 className="text-base font-black text-white">Horas de Sueño 🌙</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    sleepStatus === 'SUFICIENTE'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                      : 'bg-rose-950 text-rose-400 border-rose-700 animate-pulse'
                  }`}
                >
                  {sleepStatus === 'SUFICIENTE' ? '🟢 ≥6h Suficiente' : '🔴 <6h Insuficiente'}
                </span>
              </div>

              {/* Horas de Sueño Stepper */}
              <div className="space-y-1.5 mb-4">
                <label className="block text-[11px] font-bold uppercase text-slate-300">
                  Descanso Previo al Vuelo (Mín: 6h)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setHorasSueno(Math.max(1, Math.round((horasSueno - 0.5) * 10) / 10));
                    }}
                    className="w-12 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <div className={`flex-1 bg-slate-950 border rounded-xl p-3 text-center text-3xl font-mono font-black flex items-center justify-center gap-1 ${
                    horasSueno < 6 ? 'border-rose-700 text-rose-400' : 'border-indigo-900/80 text-indigo-400'
                  }`}>
                    <span>{horasSueno}</span>
                    <span className="text-xs text-slate-500">hrs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setHorasSueno(Math.min(14, Math.round((horasSueno + 0.5) * 10) / 10));
                    }}
                    className="w-12 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-2xl rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Sleep Presets */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Presets Sueño:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { h: 4, label: '4h (Alerta)' },
                  { h: 5, label: '5h (Riesgo)' },
                  { h: 6, label: '6h (Mínimo)' },
                  { h: 7, label: '7h (Normal)' },
                  { h: 8, label: '8h (Óptimo)' },
                  { h: 9, label: '9h (Excelente)' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.h}
                    onClick={() => {
                      soundFX.playTap();
                      setHorasSueno(p.h);
                    }}
                    className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all text-center cursor-pointer ${
                      horasSueno === p.h
                        ? p.h < 6
                          ? 'bg-rose-600 text-white border-rose-400'
                          : 'bg-indigo-600 text-white border-indigo-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Informative Warning Card for Low Sleep Hours */}
        {horasSueno < 6 && (
          <div className="bg-rose-950/80 border border-rose-700 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-200">
            <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300 font-bold block text-sm">⚠️ ALERTA DE SEGURIDAD OPERACIONAL: Sueño menor a 6 horas</strong>
              <span>
                El Reglamento de Medicina de Aviación exige un descanso mínimo de <strong>6 horas continuas</strong> previo a la misión. Registar menos de 6 horas generará automáticamente una <strong>OBSERVACIÓN POR FATIGA (F) 🟡</strong> en el chequeo final.
              </span>
            </div>
          </div>
        )}

        {/* Policy Info Note */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-400">
          <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <span>
            💡 <strong>Nota Operativa:</strong> Los parámetros de Presión Arterial, Pulso y Sueño son validados electrónicamente. Si alguno está fuera de rango, el médico de aviación revisará la observación en el reporte final.
          </span>
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
