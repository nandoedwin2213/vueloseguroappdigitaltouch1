import React, { useState } from 'react';
import { PreFlightCheckupRecord } from '../types';
import { Search, Download, Eye, FileSpreadsheet, Cloud, CloudOff, ArrowLeft, X, HeartPulse } from 'lucide-react';
import { exportRecordsToCSV, exportRecordsToJSON } from '../services/exportService';
import { ThermalTicket } from './ThermalTicket';

interface HistoryStepProps {
  records: PreFlightCheckupRecord[];
  onBack: () => void;
}

export const HistoryStep: React.FC<HistoryStepProps> = ({ records, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  
  // Selected record for popup view / re-print
  const [selectedRecord, setSelectedRecord] = useState<PreFlightCheckupRecord | null>(null);

  // Extract unique units for filter dropdown
  const units = Array.from(new Set(records.map(r => r.personnel.reparto)));

  // Filter logic
  const filteredRecords = records.filter((r) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      r.personnel.nombres.toLowerCase().includes(searchLower) ||
      r.personnel.apellidos.toLowerCase().includes(searchLower) ||
      r.personnel.grado.toLowerCase().includes(searchLower) ||
      r.personnel.escuadron.toLowerCase().includes(searchLower) ||
      r.id.toLowerCase().includes(searchLower) ||
      r.formattedDate.includes(searchLower);

    const matchesResult = filterResult === 'ALL' || r.finalResult === filterResult;
    const matchesUnit = filterUnit === 'ALL' || r.personnel.reparto === filterUnit;

    return matchesSearch && matchesResult && matchesUnit;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Search className="text-emerald-400" size={28} /> Historial y Registro de Chequeos 📊
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Búsqueda, reapertura de comprobantes y exportación de datos a Nube / Excel.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportRecordsToCSV(records)}
            className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95"
          >
            <FileSpreadsheet size={16} /> Exportar Excel/CSV 📊
          </button>

          <button
            onClick={() => exportRecordsToJSON(records)}
            className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95"
          >
            <Download size={16} /> Respaldar JSON ☁️
          </button>

          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Regresar 🏠
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search input */}
        <div className="md:col-span-2 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Buscar por Nombre, Apellido, Grado, ID o Escuadrón..."
            className="w-full bg-slate-950 border border-slate-700 text-white font-medium text-sm p-3 pl-10 rounded-xl focus:outline-none focus:border-emerald-500"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
        </div>

        {/* Result Filter */}
        <div>
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-medium text-sm p-3 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todos los Resultados</option>
            <option value="APTO">🟢 Solo APTO</option>
            <option value="OBSERVACION">🟡 Solo OBSERVACIÓN</option>
            <option value="NO_APTO">🔴 Solo NO APTO</option>
          </select>
        </div>

        {/* Unit Filter */}
        <div>
          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-medium text-sm p-3 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todos los Repartos</option>
            {units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">ID / Fecha</th>
                <th className="p-4">Militar / Cadete</th>
                <th className="p-4">Signos Vitales 🩺</th>
                <th className="p-4">Reparto / Escuadrón</th>
                <th className="p-4">Reflejos (ms)</th>
                <th className="p-4">Dictamen</th>
                <th className="p-4">Nube</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                    No se encontraron registros de chequeo con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isApto = r.finalResult === 'APTO';
                  const isObs = r.finalResult === 'OBSERVACION';

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-emerald-400 text-xs">{r.id}</div>
                        <div className="text-[11px] text-slate-400">{r.formattedDate} {r.formattedTime}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white">{r.personnel.nombres} {r.personnel.apellidos}</div>
                        <div className="text-xs text-emerald-400 font-semibold">{r.personnel.grado} ({r.personnel.edad} a)</div>
                      </td>

                      <td className="p-4 text-xs font-mono">
                        {r.vitalSigns ? (
                          <div>
                            <div className="text-blue-400 font-bold">{r.vitalSigns.sistolica}/{r.vitalSigns.diastolica} mmHg</div>
                            <div className="text-rose-400">{r.vitalSigns.frecuenciaCardiaca} BPM</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-slate-300">
                        <div className="font-semibold text-slate-200">{r.personnel.reparto}</div>
                        <div className="text-slate-400">{r.personnel.escuadron}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-mono font-bold text-white text-base">{r.reaction.avgMs} ms</div>
                        <div className="text-[10px] text-slate-400">Mín: {r.reaction.minMs}ms | Máx: {r.reaction.maxMs}ms</div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider border ${
                            isApto
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                              : isObs
                                ? 'bg-amber-950 text-amber-400 border-amber-700'
                                : 'bg-rose-950 text-rose-400 border-rose-700'
                          }`}
                        >
                          {r.finalResult}
                        </span>
                      </td>

                      <td className="p-4 text-xs">
                        {r.cloudSyncStatus === 'SYNCED' ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Cloud size={14} /> OK
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <CloudOff size={14} /> Pend.
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 active:scale-95"
                        >
                          <Eye size={14} /> Ticket 🧾
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Ticket Viewer Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">Comprobante #{selectedRecord.id}</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <ThermalTicket record={selectedRecord} />
          </div>
        </div>
      )}
    </div>
  );
};
