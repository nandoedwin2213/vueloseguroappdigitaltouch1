import React from 'react';
import { PreFlightCheckupRecord } from '../types';
import { Printer } from 'lucide-react';

interface ThermalTicketProps {
  record: PreFlightCheckupRecord;
  onPrint?: () => void;
}

export const ThermalTicket: React.FC<ThermalTicketProps> = ({ record, onPrint }) => {
  const handleTriggerPrint = () => {
    if (onPrint) onPrint();
    window.print();
  };

  const isApto = record.finalResult === 'APTO';
  const isObs = record.finalResult === 'OBSERVACION';

  const stationName = 'DEA/MEDICINA DE AVIACION';
  const operatorName = 'MAYOR EDWIN AYALA MEDICO AEROESPACIAL';

  return (
    <div className="space-y-4 select-none">
      {/* CSS Styles specialized for 80mm ESC/POS Thermal Receipt Printers */}
      <style>{`
        @media print {
          @page {
            margin: 0mm !important;
            size: 80mm auto !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            font-family: 'Courier New', Courier, monospace, sans-serif !important;
            -webkit-font-smoothing: none !important;
            font-weight: 900 !important;
            text-rendering: optimizeSpeed !important;
          }
          /* Hide non-print UI elements */
          .print\\:hidden, header, footer, button, nav {
            display: none !important;
          }
          /* High contrast thermal ticket print box */
          .thermal-ticket-box {
            width: 76mm !important;
            max-width: 76mm !important;
            margin: 0 auto !important;
            padding: 1mm 1mm 2mm 1mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            font-weight: 900 !important;
          }
          .thermal-ticket-box * {
            color: #000000 !important;
            border-color: #000000 !important;
            text-shadow: none !important;
            font-weight: 900 !important;
          }
        }
      `}</style>

      {/* On-screen Print Action Button */}
      <button
        onClick={handleTriggerPrint}
        className="w-full py-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-emerald-400 font-black text-lg rounded-2xl border-2 border-emerald-600/80 shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer print:hidden"
      >
        <Printer size={24} />
        <span>🖨️ IMPRIMIR COMPROBANTE TÉRMICO (80mm)</span>
      </button>

      {/* High-Contrast 80mm ESC/POS Thermal Paper Ticket */}
      <div className="thermal-ticket-box bg-white text-black font-mono text-xs p-4 rounded-xl shadow-2xl max-w-[360px] mx-auto border-2 border-slate-900 select-text font-black">
        
        {/* Header - Ultra Sharp High Contrast */}
        <div className="text-center space-y-1 border-b-2 border-dashed border-black pb-2">
          <div className="font-black text-base uppercase tracking-tight text-black">FUERZA AÉREA ECUATORIANA 🇪🇨</div>
          <div className="font-black text-xs uppercase text-black">SISTEMA VUELOSEGURO POS 9.0</div>
          <div className="font-black text-xs underline text-black">EVALUACIÓN FISIOLÓGICA PRE-VUELO</div>
        </div>

        {/* Checkup Metadata */}
        <div className="py-2 space-y-1 text-xs border-b-2 border-dashed border-black font-black text-black">
          <div className="flex justify-between"><strong className="font-black">ID CHEQUEO:</strong> <span className="font-black">{record.id}</span></div>
          <div className="flex justify-between"><strong className="font-black">FECHA/HORA:</strong> <span className="font-black">{record.formattedDate} {record.formattedTime}</span></div>
          <div className="flex justify-between"><strong className="font-black">ESTACIÓN:</strong> <span className="font-black">{stationName}</span></div>
          <div className="flex justify-between"><strong className="font-black">MÉDICO AEROESPACIAL:</strong> <span className="font-black">{operatorName}</span></div>
        </div>

        {/* Personnel Info */}
        <div className="py-2 space-y-1 text-xs border-b-2 border-dashed border-black text-black font-black">
          <div className="font-black text-xs uppercase text-center tracking-wider pb-1">=== MILITAR / CADETE ===</div>
          <div><strong className="font-black">PILOTO:</strong> <span className="font-black">{record.personnel.nombres} {record.personnel.apellidos}</span></div>
          <div className="flex justify-between"><strong className="font-black">GRADO MILITAR:</strong> <span className="font-black">{record.personnel.grado}</span></div>
          <div className="flex justify-between"><strong className="font-black">EDAD REGISTRADA:</strong> <span className="font-black">{record.personnel.edad} AÑOS</span></div>
          <div><strong className="font-black">REPARTO:</strong> <span className="font-black">{record.personnel.reparto}</span></div>
          <div><strong className="font-black">ESCUADRÓN:</strong> <span className="font-black">{record.personnel.escuadron}</span></div>
        </div>

        {/* Vital Signs Section */}
        {record.vitalSigns && (
          <div className="py-2 space-y-1 text-xs border-b-2 border-dashed border-black text-black font-black">
            <div className="font-black text-xs uppercase text-center tracking-wider pb-1">=== SIGNOS VITALES 🩺 ===</div>
            <div className="flex justify-between font-black">
              <strong className="font-black">PRESIÓN ARTERIAL:</strong> 
              <span className="font-black text-sm">{record.vitalSigns.sistolica}/{record.vitalSigns.diastolica} mmHg</span>
            </div>
            <div className="flex justify-between font-black">
              <strong className="font-black">FRECUENCIA CARDÍACA:</strong> 
              <span className="font-black text-sm">{record.vitalSigns.frecuenciaCardiaca} BPM</span>
            </div>
            <div className="flex justify-between text-xs font-black pt-0.5">
              <strong className="font-black">ESTADO PRESIÓN:</strong> 
              <span className="font-black">{record.vitalSigns.bpStatus}</span>
            </div>
          </div>
        )}

        {/* IM SAFE Metrics */}
        <div className="py-2 space-y-1 text-xs border-b-2 border-dashed border-black text-black font-black">
          <div className="font-black text-xs uppercase text-center tracking-wider pb-1">=== EVALUACIÓN IM SAFE 📋 ===</div>
          <div className="flex justify-between"><strong className="font-black">Illness (Enfermedad):</strong> <span className="font-black">{record.imSafe.illness}</span></div>
          <div className="flex justify-between"><strong className="font-black">Medication (Medicación):</strong> <span className="font-black">{record.imSafe.medication}</span></div>
          <div className="flex justify-between"><strong className="font-black">Stress (Estrés):</strong> <span className="font-black">{record.imSafe.stress}</span></div>
          <div className="flex justify-between"><strong className="font-black">Alcohol / Sustancias:</strong> <span className="font-black">{record.imSafe.alcohol}</span></div>
          <div className="flex justify-between"><strong className="font-black">Fatigue (Fatiga/Sueño):</strong> <span className="font-black">{record.imSafe.fatigue}</span></div>
          <div className="flex justify-between"><strong className="font-black">Emotion/Eating:</strong> <span className="font-black">{record.imSafe.emotionEating}</span></div>
          <div className="pt-1 font-black flex justify-between text-xs border-t-2 border-black">
            <strong className="font-black">DICTAMEN IM SAFE:</strong>
            <span className="font-black">{record.imSafe.overallStatus}</span>
          </div>
        </div>

        {/* Reaction Metrics */}
        <div className="py-2 space-y-1 text-xs border-b-2 border-dashed border-black text-black font-black">
          <div className="font-black text-xs uppercase text-center tracking-wider pb-1">=== REFLEJO CEREBRO-MANO ⚡ ===</div>
          <div className="flex justify-between font-black"><strong className="font-black">TIEMPO PROMEDIO:</strong> <span className="font-black text-sm">{record.reaction.avgMs} ms</span></div>
          <div className="flex justify-between"><strong className="font-black">MEJOR TIEMPO:</strong> <span className="font-black">{record.reaction.minMs} ms</span></div>
          <div className="flex justify-between"><strong className="font-black">PEOR TIEMPO:</strong> <span className="font-black">{record.reaction.maxMs} ms</span></div>
          <div className="flex justify-between"><strong className="font-black">ENSAYOS VÁLIDOS:</strong> <span className="font-black">{record.reaction.correctCount} / {record.reaction.totalTrials}</span></div>
        </div>

        {/* Observations List (if any) */}
        {record.observationsList && record.observationsList.length > 0 && (
          <div className="py-2 space-y-1 text-xs border-b-2 border-dashed border-black text-black font-black">
            <div className="font-black text-xs uppercase text-center pb-0.5">OBSERVACIONES REGISTRADAS:</div>
            {record.observationsList.map((obs, idx) => (
              <div key={idx} className="font-black text-xs">* {obs}</div>
            ))}
          </div>
        )}

        {/* Final Fitness Result Box - Thick Ultra Contrast Border */}
        <div className="py-2.5 text-center border-b-2 border-dashed border-black space-y-1">
          <div className="text-xs uppercase font-black text-black">RESULTADO EVALUADO PRE-VUELO</div>
          <div className="text-base font-black uppercase p-2 border-4 border-black inline-block w-full text-black bg-white">
            {isApto && '*** APTO PARA EL VUELO ***'}
            {isObs && '*** APTO CON OBSERVACIÓN ***'}
            {!isApto && !isObs && '*** NO APTO PARA VUELO ***'}
          </div>
        </div>

        {/* Validation Footer & Signature Line */}
        <div className="pt-3 text-center space-y-3 text-black font-black">
          <div className="font-black text-xs uppercase tracking-wider">VALIDACIÓN PRE-VUELO MILITAR</div>
          
          <div className="pt-6">
            <div className="w-52 mx-auto border-b-2 border-black"></div>
            <div className="text-xs mt-1 uppercase font-black text-black">{operatorName}</div>
            <div className="text-[10px] font-black text-black">MÉDICO AEROESPACIAL / RESPONSABLE</div>
          </div>

          <div className="text-[10px] font-mono font-black text-black pt-1 pb-0 mb-0">
            VueloSeguro POS • ID: {record.id}
          </div>
        </div>

      </div>
    </div>
  );
};
