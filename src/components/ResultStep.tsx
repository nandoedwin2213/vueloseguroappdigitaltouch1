import React, { useEffect, useState } from 'react';
import { PreFlightCheckupRecord } from '../types';
import { Award, AlertTriangle, XCircle, Home, CheckCircle2, Shield, HeartPulse, Zap, Info, RotateCcw, Clock, ShieldAlert, Radio, Printer, Pause } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThermalTicket } from './ThermalTicket';
import { soundFX } from '../services/soundService';

interface ResultStepProps {
  record: PreFlightCheckupRecord;
  onNewCheckup: () => void;
  onGoHome: () => void;
}

export const ResultStep: React.FC<ResultStepProps> = ({
  record,
  onNewCheckup,
  onGoHome,
}) => {
  const isApto = record.finalResult === 'APTO';
  const isObs = record.finalResult === 'OBSERVACION';
  const isAudited = !!record.isRandomAlcoholAudited;

  // Track if ticket has been printed by user
  const [hasPrintedTicket, setHasPrintedTicket] = useState<boolean>(false);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(isAudited || !isApto);

  // 60-Second Auto-Reset Countdown Timer for Pilot Kiosk
  const [countdown, setCountdown] = useState<number>(60);

  // Radar scanning state for Random Alcohol Audit Lottery
  const [isScanningAudit, setIsScanningAudit] = useState<boolean>(true);

  const handlePrint = () => {
    soundFX.playTap();
    setHasPrintedTicket(true);
  };

  useEffect(() => {
    // Sound FX & Confetti trigger
    if (isApto && !isAudited) {
      soundFX.playSuccess();
      try {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.5 },
        });
      } catch (e) {}
    } else {
      soundFX.playWarning();
    }

    // Simulate 2.2s Radar Scan for Random Alcohol Audit
    const scanTimer = setTimeout(() => {
      setIsScanningAudit(false);
      if (isAudited) {
        soundFX.playWarning();
      }
    }, 2200);

    // Auto-reset timer ONLY runs if timer is not paused AND (ticket has been printed OR normal apto checkup)
    const interval = setInterval(() => {
      if (isTimerPaused) return;

      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onGoHome(); // Reset to Kiosk Welcome Screen automatically!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(scanTimer);
      clearInterval(interval);
    };
  }, [isApto, isAudited, isTimerPaused, onGoHome]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Kiosk Status & Timer Control Banner */}
      <div className="bg-slate-900 border-2 border-emerald-500/80 p-4 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${isTimerPaused ? 'bg-amber-950 border-amber-700 text-amber-400' : 'bg-emerald-950 border-emerald-700 text-emerald-400 animate-pulse'}`}>
            {isTimerPaused ? <Pause size={20} /> : <Clock size={20} />}
          </div>
          <div>
            <div className="text-xs font-black uppercase text-emerald-400">
              {hasPrintedTicket ? '✓ Ticket Impreso Exitosamente' : '🖨️ Impresión de Ticket Requerida'}
            </div>
            <div className="text-sm font-extrabold text-white">
              {isTimerPaused ? (
                <span className="text-amber-400 font-bold">
                  🔒 Temporizador pausado para lectura e impresión.
                </span>
              ) : (
                <span>
                  El kiosko se reiniciará en <span className="font-mono text-emerald-400 text-base font-black">{countdown}s</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Resume Timer Button */}
          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              setIsTimerPaused(!isTimerPaused);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-slate-700"
          >
            {isTimerPaused ? <Clock size={16} className="text-emerald-400" /> : <Pause size={16} className="text-amber-400" />}
            <span>{isTimerPaused ? 'Reanudar Tiempo' : 'Pausar Tiempo'}</span>
          </button>

          <button
            onClick={() => {
              soundFX.playTap();
              onGoHome();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={16} /> Finalizar y Listo 🚀
          </button>
        </div>
      </div>

      {/* RANDOM ALCOHOL AUDIT RADAR SCANNER BANNER (Deterrent Feature) */}
      <div className="bg-slate-900 border-2 border-amber-500/80 p-5 rounded-3xl shadow-2xl relative overflow-hidden">
        {isScanningAudit ? (
          <div className="flex items-center justify-center gap-4 py-3 text-amber-400 animate-pulse">
            <Radio size={32} className="animate-spin text-amber-400" />
            <div>
              <div className="text-xs font-mono font-black uppercase tracking-widest text-slate-400">
                SISTEMA ALEATORIO DE AUDITORÍA FAE (RST-FAE)
              </div>
              <h3 className="text-lg font-black text-amber-400">
                📡 ESCANEANDO SORTEO ALEATORIO DE ALCOHOLEMIA...
              </h3>
            </div>
          </div>
        ) : isAudited ? (
          /* PILOT SELECTED FOR RANDOM ALCOHOL TEST! */
          <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-2 border-rose-500 p-5 rounded-2xl text-white space-y-2 shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-600 rounded-2xl text-white shadow-lg">
                <ShieldAlert size={36} />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest bg-rose-900 px-3 py-0.5 rounded-full border border-rose-400 text-rose-200">
                  🚨 INSPECCIÓN ALEATORIA ACTIVADA
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                  ¡SELECCIONADO PARA PRUEBA DE ALCOHOLEMIA ALEATORIA!
                </h3>
              </div>
            </div>
            <p className="text-sm font-semibold text-rose-100 pl-1">
              Ha sido seleccionado por el algoritmo aleatorio para examen de alcoholemia en aliento y valoración presencial con el <strong className="text-white underline">MAYOR EDWIN AYALA (MÉDICO AEROESPACIAL)</strong> en la estación <strong className="text-white">DEA/MEDICINA DE AVIACIÓN</strong>. Imprima su comprobante a continuación.
            </p>
          </div>
        ) : (
          /* PILOT NOT SELECTED (CLEAR) */
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-950 border border-emerald-700 text-emerald-400 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-emerald-400 uppercase font-black">Inspección Aleatoria de Alcoholemia:</span>
                <div className="text-sm font-extrabold text-white">🟢 LIBERADO / SIN NOVEDAD DE SORTEO</div>
              </div>
            </div>
            <span className="bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-slate-400 text-[11px]">
              Probabilidad Aleatoria Evaluada 1% (1 en 100 sorteos)
            </span>
          </div>
        )}
      </div>

      {/* Main Dictamen WOW Banner Card */}
      <div
        className={`p-8 rounded-3xl border-4 shadow-2xl text-center space-y-4 transition-all transform hover:scale-[1.01] ${
          isApto
            ? 'bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border-emerald-500 shadow-emerald-950/80'
            : isObs
              ? 'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-amber-500 shadow-amber-950/80'
              : 'bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 border-rose-500 shadow-rose-950/80'
        }`}
      >
        <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
          {isApto && <Award size={68} className="text-emerald-400 animate-bounce" />}
          {isObs && <AlertTriangle size={68} className="text-amber-400 animate-pulse" />}
          {!isApto && !isObs && <XCircle size={68} className="text-rose-400" />}
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-300">Dictamen Evaluado</span>
          <h1
            className={`text-4xl sm:text-6xl font-black uppercase tracking-tight ${
              isApto ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : isObs ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-rose-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            }`}
          >
            {isApto && '🟢 APTO PARA EL VUELO'}
            {isObs && '🟡 APTO CON OBSERVACIÓN'}
            {!isApto && !isObs && '🔴 NO APTO PARA EL VUELO'}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto pt-2 leading-relaxed font-medium">
            {isApto && '✨ Evaluación IM SAFE y parámetros fisiológicos dentro de los límites requeridos.'}
            {isObs && '⚠️ El piloto está APTO según la evaluación IM SAFE, pero presenta observaciones registradas en Signos Vitales o Tiempos de Reacción. El ticket adjunta alertas para el Oficial de Turno.'}
            {!isApto && !isObs && '⛔ Restricción de vuelo por evaluación IM SAFE. Notifique inmediatamente al Oficial de Turno.'}
          </p>
        </div>

        {/* Observations Badge Bar if any */}
        {record.observationsList && record.observationsList.length > 0 && (
          <div className="pt-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-amber-950/80 border border-amber-600/80 px-4 py-2 rounded-2xl text-amber-300 text-xs font-bold">
              <Info size={16} />
              <span>Observaciones Adjuntas: {record.observationsList.join(' • ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Column Cards: Military Data, Vital Signs & Reflex Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Datos Militar */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <h3 className="text-base font-black text-white border-b border-slate-800 pb-2.5 flex items-center gap-2">
            <Shield className="text-emerald-400" size={18} /> Datos del Militar 🪪
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Nombre:</span>
              <span className="font-bold text-white">{record.personnel.nombres} {record.personnel.apellidos}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Grado:</span>
              <span className="font-bold text-emerald-400">{record.personnel.grado}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Edad:</span>
              <span className="font-bold text-slate-200">{record.personnel.edad} Años</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Reparto:</span>
              <span className="font-bold text-slate-200">{record.personnel.reparto}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Escuadrón:</span>
              <span className="font-bold text-slate-200">{record.personnel.escuadron}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Signos Vitales */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <h3 className="text-base font-black text-white border-b border-slate-800 pb-2.5 flex items-center gap-2">
            <HeartPulse className="text-rose-500" size={18} /> Signos Vitales 🩺
          </h3>

          {record.vitalSigns ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Presión Arterial:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  {record.vitalSigns.sistolica}/{record.vitalSigns.diastolica} mmHg
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Frecuencia Cardíaca:</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {record.vitalSigns.frecuenciaCardiaca} BPM
                </span>
              </div>
              {record.vitalSigns.horasSueno !== undefined && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Horas de Sueño:</span>
                  <span className={`font-mono font-bold text-sm ${record.vitalSigns.horasSueno < 6 ? 'text-rose-400 font-black' : 'text-indigo-400'}`}>
                    {record.vitalSigns.horasSueno} hrs {record.vitalSigns.horasSueno < 6 ? '🔴 (<6h)' : '🟢 (≥6h)'}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Estado Presión:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  record.vitalSigns.bpStatus === 'NORMAL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {record.vitalSigns.bpStatus === 'NORMAL' ? '🟢 Normal' : '🟡 Elevada (Obs)'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No registrados</p>
          )}
        </div>

        {/* Card 3: IM SAFE & Reflejos */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <h3 className="text-base font-black text-white border-b border-slate-800 pb-2.5 flex items-center gap-2">
            <Zap className="text-amber-400" size={18} /> IM SAFE & Reflejos ⚡
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Evaluación IM SAFE:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                record.imSafe.overallStatus === 'APTO' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-rose-950 text-rose-400 border border-rose-700'
              }`}>
                {record.imSafe.overallStatus}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Promedio Reflejos:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{record.reaction.avgMs} ms</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Rango Mín / Máx:</span>
              <span className="font-mono font-bold text-slate-200">{record.reaction.minMs} ms / {record.reaction.maxMs} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Preview & POS Action Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Ticket Preview */}
        <ThermalTicket record={record} onPrint={handlePrint} />

        {/* POS Next Flow Controls */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3">
            Acciones Finales POS 🚀
          </h3>

          <button
            onClick={onNewCheckup}
            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-950 border border-emerald-400 flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <RotateCcw size={24} />
            <span>NUEVO CHEQUEO</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={20} />
            <span>VOLVER A PANTALLA INICIAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
