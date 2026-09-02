import React, { useState } from 'react';
import { ImSafeEvaluation, AssessmentStatus } from '../types';
import { HeartPulse, Pill, Brain, Flame, Moon, Utensils, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { soundFX } from '../services/soundService';

interface ImSafeStepProps {
  initialData?: ImSafeEvaluation;
  onSubmit: (evaluation: ImSafeEvaluation) => void;
  onBack: () => void;
}

interface FactorItem {
  key: keyof Omit<ImSafeEvaluation, 'overallStatus' | 'notes'>;
  letter: string;
  nameEs: string;
  nameEn: string;
  desc: string;
  icon: React.ReactNode;
}

const FACTORS: FactorItem[] = [
  {
    key: 'illness',
    letter: 'I',
    nameEs: 'Enfermedad',
    nameEn: 'Illness',
    desc: '¿Siente algún síntoma físico, dolor de cabeza, fiebre, resfriado o malestar?',
    icon: <HeartPulse size={24} />,
  },
  {
    key: 'medication',
    letter: 'M',
    nameEs: 'Medicación',
    nameEn: 'Medication',
    desc: '¿Ha tomado medicamentos prescritos o de venta libre que afecten el estado alerta?',
    icon: <Pill size={24} />,
  },
  {
    key: 'stress',
    letter: 'S',
    nameEs: 'Estrés',
    nameEn: 'Stress',
    desc: '¿Se encuentra bajo niveles de estrés psicológico, familiar o laboral significativo?',
    icon: <Brain size={24} />,
  },
  {
    key: 'alcohol',
    letter: 'A',
    nameEs: 'Alcohol / Sustancias',
    nameEn: 'Alcohol',
    desc: '¿Consumió alcohol en las últimas 24h o sustancias que alteren sus capacidades?',
    icon: <Flame size={24} />,
  },
  {
    key: 'fatigue',
    letter: 'F',
    nameEs: 'Fatiga / Sueño',
    nameEn: 'Fatigue',
    desc: '¿Durmió menos de 7 horas o manifiesta agotamiento por turnos/guardias?',
    icon: <Moon size={24} />,
  },
  {
    key: 'emotionEating',
    letter: 'E',
    nameEs: 'Emoción / Alimentación',
    nameEn: 'Emotion / Eating',
    desc: '¿Está bien nutrido, hidratado y emocionalmente preparado para el vuelo?',
    icon: <Utensils size={24} />,
  },
];

export const ImSafeStep: React.FC<ImSafeStepProps> = ({
  initialData,
  onSubmit,
  onBack,
}) => {
  const [factors, setFactors] = useState<Record<string, AssessmentStatus>>({
    illness: initialData?.illness || 'APTO',
    medication: initialData?.medication || 'APTO',
    stress: initialData?.stress || 'APTO',
    alcohol: initialData?.alcohol || 'APTO',
    fatigue: initialData?.fatigue || 'APTO',
    emotionEating: initialData?.emotionEating || 'APTO',
  });

  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  const handleStatusChange = (key: string, status: AssessmentStatus) => {
    soundFX.playTap();
    setFactors((prev) => ({ ...prev, [key]: status }));
  };

  // Compute Overall IM SAFE status
  const statuses = Object.values(factors);
  let overallStatus: AssessmentStatus = 'APTO';
  if (statuses.includes('NO_APTO')) {
    overallStatus = 'NO_APTO';
  } else if (statuses.includes('OBSERVACION')) {
    overallStatus = 'OBSERVACION';
  }

  const handleNext = () => {
    soundFX.playTap();
    onSubmit({
      illness: factors.illness,
      medication: factors.medication,
      stress: factors.stress,
      alcohol: factors.alcohol,
      fatigue: factors.fatigue,
      emotionEating: factors.emotionEating,
      overallStatus,
      notes: notes.trim(),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Paso 3 de 5 📋</span>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <HeartPulse className="text-emerald-400" size={28} /> Evaluación Fisiológica IM SAFE
          </h2>
          <p className="text-slate-400 text-xs mt-1">Marque la condición de cada uno de los 6 factores antes del vuelo.</p>
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

      {/* 6 Touch Evaluation Factors */}
      <div className="space-y-4">
        {FACTORS.map((item) => {
          const currentStatus = factors[item.key];
          return (
            <div
              key={item.key}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
            >
              {/* Factor Left Icon & Text */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                    currentStatus === 'APTO'
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                      : currentStatus === 'OBSERVACION'
                        ? 'bg-amber-950 border border-amber-700 text-amber-400'
                        : 'bg-rose-950 border border-rose-700 text-rose-400'
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-slate-300 text-xs font-mono font-bold px-2 py-0.5 rounded">
                      [{item.letter}]
                    </span>
                    <h3 className="text-lg font-black text-white">{item.nameEs}</h3>
                    <span className="text-xs text-slate-500 font-mono">({item.nameEn})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">{item.desc}</p>
                </div>
              </div>

              {/* 3 Touch State Buttons */}
              <div className="w-full md:w-auto grid grid-cols-3 gap-2">
                {/* APTO Button */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(item.key, 'APTO')}
                  className={`px-4 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border cursor-pointer ${
                    currentStatus === 'APTO'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950 scale-102'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 size={18} /> APTO
                </button>

                {/* OBSERVACION Button */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(item.key, 'OBSERVACION')}
                  className={`px-4 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border cursor-pointer ${
                    currentStatus === 'OBSERVACION'
                      ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-950 scale-102'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle size={18} /> OBS.
                </button>

                {/* NO APTO Button */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(item.key, 'NO_APTO')}
                  className={`px-4 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border cursor-pointer ${
                    currentStatus === 'NO_APTO'
                      ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-950 scale-102'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <XCircle size={18} /> NO APTO
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumen Diagnóstico IM SAFE</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-bold text-slate-300">Dictamen Parcial:</span>
            <span
              className={`px-4 py-1.5 rounded-xl font-black text-sm uppercase tracking-wider border ${
                overallStatus === 'APTO'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                  : overallStatus === 'OBSERVACION'
                    ? 'bg-amber-950 text-amber-400 border-amber-700'
                    : 'bg-rose-950 text-rose-400 border-rose-700'
              }`}
            >
              {overallStatus === 'APTO' && '🟢 APTO PARA EVALUACIÓN DE REFLEJOS'}
              {overallStatus === 'OBSERVACION' && '🟡 APTO CON OBSERVACIÓN'}
              {overallStatus === 'NO_APTO' && '🔴 RESTRICCIÓN NO APTO'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-full md:w-auto px-8 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-950 border border-emerald-400 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <span>CONTINUAR A REFLEJOS ⚡</span>
          <ArrowRight size={28} />
        </button>
      </div>
    </div>
  );
};
