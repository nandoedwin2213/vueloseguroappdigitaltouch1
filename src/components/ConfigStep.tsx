import React, { useState } from 'react';
import { SystemConfig } from '../types';
import { Settings, ShieldCheck, Cloud, Sliders, Save, ArrowLeft, RotateCcw } from 'lucide-react';
import { DEFAULT_CONFIG } from '../services/storageService';

interface ConfigStepProps {
  config: SystemConfig;
  onSave: (config: SystemConfig) => void;
  onBack: () => void;
}

export const ConfigStep: React.FC<ConfigStepProps> = ({ config, onSave, onBack }) => {
  const [formData, setFormData] = useState<SystemConfig>(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Configuración de umbrales y sincronización de Nube guardada correctamente.');
    onBack();
  };

  const handleResetDefaults = () => {
    if (confirm('¿Desea restablecer los umbrales por defecto?')) {
      setFormData(DEFAULT_CONFIG);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Panel Administrativo</span>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Settings className="text-amber-400" size={28} /> Configuración de Umbrales y Nube
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Parámetros configurables institucionales para tiempos de reflejos y sincronización.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Atrás
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identificación y Operador */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldCheck className="text-blue-400" size={20} /> Identificación de Estación y Operador
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">ID de Estación POS</label>
              <input
                type="text"
                required
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white font-medium p-3 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">Nombre del Operador de Turno</label>
              <input
                type="text"
                required
                value={formData.operatorName}
                onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white font-medium p-3 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Umbrales de Reflejo Cerebro-Mano */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sliders className="text-emerald-400" size={20} /> Umbrales Institucionales de Reflejos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Max Apto */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-emerald-400 uppercase">
                Límite Máx APTO (ms)
              </label>
              <input
                type="number"
                required
                value={formData.reactionTimeAptoMax}
                onChange={(e) => setFormData({ ...formData, reactionTimeAptoMax: Number(e.target.value) })}
                className="w-full bg-slate-950 border-2 border-emerald-800 text-emerald-400 font-mono font-bold text-lg p-3 rounded-xl focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">Tiempos inferiores a este valor clasifican como APTO.</p>
            </div>

            {/* Max Observacion */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-400 uppercase">
                Límite Máx OBSERVACIÓN (ms)
              </label>
              <input
                type="number"
                required
                value={formData.reactionTimeObservacionMax}
                onChange={(e) => setFormData({ ...formData, reactionTimeObservacionMax: Number(e.target.value) })}
                className="w-full bg-slate-950 border-2 border-amber-800 text-amber-400 font-mono font-bold text-lg p-3 rounded-xl focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">Valores entre APTO y este límite dan OBSERVACIÓN. Superior da NO APTO.</p>
            </div>

            {/* Trial count */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Repeticiones por Prueba
              </label>
              <input
                type="number"
                required
                min={3}
                max={10}
                value={formData.reactionTrialsCount}
                onChange={(e) => setFormData({ ...formData, reactionTrialsCount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-lg p-3 rounded-xl focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">Cantidad de ensayos por militar (Default: 5).</p>
            </div>
          </div>
        </div>

        {/* Card 3: Cloud Synchronization Settings */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Cloud className="text-blue-400" size={20} /> Servidor y Respaldo en la Nube
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="font-bold text-white text-sm">Sincronización Automática con la Nube</div>
                <div className="text-xs text-slate-400">Subir automáticamente cada chequeo al servidor central cuando haya red.</div>
              </div>
              <input
                type="checkbox"
                checked={formData.cloudSyncEnabled}
                onChange={(e) => setFormData({ ...formData, cloudSyncEnabled: e.target.checked })}
                className="w-6 h-6 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">Endpoint del Servidor Nube</label>
              <input
                type="url"
                required
                value={formData.cloudEndpointUrl}
                onChange={(e) => setFormData({ ...formData, cloudEndpointUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-blue-400 font-mono text-xs p-3 rounded-xl focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw size={16} /> Valores por Defecto
          </button>

          <button
            type="submit"
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-lg rounded-xl shadow-xl flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save size={20} /> Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
};
