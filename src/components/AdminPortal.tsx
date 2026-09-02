import React, { useState } from 'react';
import { PreFlightCheckupRecord, SystemConfig } from '../types';
import { ShieldCheck, History, Settings, FileSpreadsheet, Download, Activity, Cloud, Lock, ArrowLeft, Search, Filter } from 'lucide-react';
import { HistoryStep } from './HistoryStep';
import { ConfigStep } from './ConfigStep';
import { exportRecordsToCSV, exportRecordsToJSON } from '../services/exportService';

interface AdminPortalProps {
  records: PreFlightCheckupRecord[];
  config: SystemConfig;
  onUpdateConfig: (newConfig: SystemConfig) => void;
  onLockAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  records,
  config,
  onUpdateConfig,
  onLockAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'HISTORY' | 'CONFIG'>('DASHBOARD');

  // Compute analytics
  const total = records.length;
  const aptoCount = records.filter((r) => r.finalResult === 'APTO').length;
  const obsCount = records.filter((r) => r.finalResult === 'OBSERVACION').length;
  const noAptoCount = records.filter((r) => r.finalResult === 'NO_APTO').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Admin Portal Header Bar */}
      <div className="bg-slate-900 border-2 border-amber-500/80 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-950/80 border border-amber-600 text-amber-400 rounded-2xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-950 text-amber-400 border border-amber-700 text-xs px-2.5 py-0.5 rounded-full font-black uppercase">
                PORTAL ADMINISTRATIVO RESTRINGIDO
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Gestión de Datos y Configuración Institucional
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Consola para comandantes y oficiales médicos. Toda la data y analítica centralizada.
            </p>
          </div>
        </div>

        {/* Lock Admin Portal Action */}
        <button
          onClick={onLockAdmin}
          className="px-5 py-3 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg"
        >
          <Lock size={18} />
          <span>SALIR Y BLOQUEAR KIOSKO 🔒</span>
        </button>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'DASHBOARD'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity size={18} />
          <span>Analítica Central 📊</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <History size={18} />
          <span>Historial de Registros 🧾</span>
        </button>

        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'CONFIG'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings size={18} />
          <span>Umbrales & Nube ⚙️</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase">Total Chequeos Acumulados</div>
              <div className="text-4xl font-black text-white font-mono">{total}</div>
              <div className="text-xs text-slate-500">Registros en base de datos</div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-900 p-5 rounded-2xl space-y-1">
              <div className="text-xs font-bold text-emerald-400 uppercase">Dictamen APTO 🟢</div>
              <div className="text-4xl font-black text-emerald-400 font-mono">{aptoCount}</div>
              <div className="text-xs text-emerald-500">
                {total > 0 ? Math.round((aptoCount / total) * 100) : 0}% del total
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-900 p-5 rounded-2xl space-y-1">
              <div className="text-xs font-bold text-amber-400 uppercase">Con Observaciones 🟡</div>
              <div className="text-4xl font-black text-amber-400 font-mono">{obsCount}</div>
              <div className="text-xs text-amber-500">Presión / Reflejos observados</div>
            </div>

            <div className="bg-rose-950/40 border border-rose-900 p-5 rounded-2xl space-y-1">
              <div className="text-xs font-bold text-rose-400 uppercase">No Aptos 🔴</div>
              <div className="text-4xl font-black text-rose-400 font-mono">{noAptoCount}</div>
              <div className="text-xs text-rose-500">Restricción por IM SAFE</div>
            </div>
          </div>

          {/* Export Actions Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Download size={22} className="text-emerald-400" /> Descarga Directa de Base de Datos Nube
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Descargue la base de datos completa de personal militar para interpretación o procesamiento externo.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => exportRecordsToCSV(records)}
                className="flex-1 md:flex-initial px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <FileSpreadsheet size={20} /> Exportar Excel / CSV 📊
              </button>

              <button
                onClick={() => exportRecordsToJSON(records)}
                className="flex-1 md:flex-initial px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Cloud size={20} /> Respaldar JSON ☁️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === 'HISTORY' && (
        <HistoryStep records={records} onBack={() => setActiveTab('DASHBOARD')} />
      )}

      {/* TAB 3: CONFIG */}
      {activeTab === 'CONFIG' && (
        <ConfigStep config={config} onSave={onUpdateConfig} onBack={() => setActiveTab('DASHBOARD')} />
      )}
    </div>
  );
};
