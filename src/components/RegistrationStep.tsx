import React, { useState } from 'react';
import { MilitaryPersonnel, MilitaryRank, PreFlightCheckupRecord } from '../types';
import { User, Shield, Building2, Users, Calendar, ArrowRight, Keyboard, ChevronDown, Check, Search, X, UserCheck } from 'lucide-react';
import { TouchKeyboard } from './TouchKeyboard';
import { soundFX } from '../services/soundService';
import { getRegisteredPersonnel } from '../services/storageService';

interface RegistrationStepProps {
  initialData?: Partial<MilitaryPersonnel>;
  records?: PreFlightCheckupRecord[];
  onSubmit: (personnel: MilitaryPersonnel) => void;
  onCancel: () => void;
}

const MILITARY_RANKS: MilitaryRank[] = [
  'Cadete',
  'Subteniente',
  'Teniente',
  'Capitán',
  'Mayor',
  'Teniente Coronel',
  'Coronel',
  'General',
  'Sargento',
  'Cabo',
  'Soldado / Aviador',
];

// Estructura oficial de Repartos y Escuadrones FAE
interface RepartoOption {
  id: string;
  name: string;
  location: string;
  squadrons: string[];
}

const FAE_REPARTOS: RepartoOption[] = [
  {
    id: 'ESMA',
    name: 'Escuela Superior de Aviación "Cosme Rennella" (ESMA)',
    location: 'Salinas',
    squadrons: [
      'Escuadrón "Halcones" (Aeronaves DA-20 Katana)',
      'Escuadrón "Linces" (Aeronaves Grob G-120TP)',
      'Escuadrón Cadetes / Vuelo Inicial',
      'Escuadrón Entrenador Primario',
    ],
  },
  {
    id: 'ALA21',
    name: 'Ala de Combate N° 21',
    location: 'Taura',
    squadrons: [
      'Escuadrón de Combate 2112 "Cheetah"',
      'Escuadrón de Combate 2113',
      'Escuadrón de Defensa Aérea 2110',
    ],
  },
  {
    id: 'ALA22',
    name: 'Ala de Combate N° 22',
    location: 'Guayaquil',
    squadrons: [
      'Escuadrón 2211 "Rescate y Combate (H145 / TH-57)"',
      'Escuadrón 2212 "Operaciones Especiales"',
      'Escuadrón Evacuación Aeromédica',
    ],
  },
  {
    id: 'ALA23',
    name: 'Ala de Combate N° 23',
    location: 'Manta',
    squadrons: [
      'Escuadrón de Combate 2311 "Super Tucano A-29"',
      'Escuadrón de Combate 2312',
      'Escuadrón de Reconocimiento y Vigilancia',
    ],
  },
  {
    id: 'ALA11',
    name: 'Ala de Transportes N° 11',
    location: 'Latacunga / Quito',
    squadrons: [
      'Escuadrón de Transporte 1111 (C-130 Hercules / L-100)',
      'Escuadrón de Transporte 1112 (CASA C295M)',
      'Escuadrón de Transporte 1113 (Twin Otter / Sabreliner)',
    ],
  },
  {
    id: 'ETFA',
    name: 'Escuela de Alumnos Técnicos (ETFA)',
    location: 'Latacunga',
    squadrons: [
      'Escuadrón de Alumnos Técnicos (EAT)',
      'Escuadrón Mantenimiento Aeronáutico',
    ],
  },
  {
    id: 'COAD',
    name: 'Comando de Operaciones Aéreas y Defensa (COAD)',
    location: 'Quito / Bases',
    squadrons: [
      'Escuadrón Vigilancia y Control del Espacio Aéreo',
      'Escuadrón Operaciones Tácticas Aéreas',
    ],
  },
  {
    id: 'CAAM',
    name: 'Centro de Adiestramiento de Aviación Militar (CAAM)',
    location: 'Base Aérea',
    squadrons: [
      'Escuadrón Instructores de Vuelo',
      'Escuadrón Simuladores de Vuelo',
    ],
  },
  {
    id: 'OTRO',
    name: 'Otro Reparto / Unidad Militar...',
    location: 'General',
    squadrons: [
      'Escuadrón General de Vuelo',
      'Escuadrón Servicios de Apoyo',
    ],
  },
];

export const RegistrationStep: React.FC<RegistrationStepProps> = ({
  initialData,
  records = [],
  onSubmit,
  onCancel,
}) => {
  const [nombres, setNombres] = useState(initialData?.nombres || '');
  const [apellidos, setApellidos] = useState(initialData?.apellidos || '');
  const [grado, setGrado] = useState<MilitaryRank>(initialData?.grado || 'Cadete');
  const [edad, setEdad] = useState<number>(initialData?.edad || 24);

  // Selected Reparto & Squad state
  const [selectedRepartoObj, setSelectedRepartoObj] = useState<RepartoOption>(FAE_REPARTOS[0]);
  const [reparto, setReparto] = useState(initialData?.reparto || FAE_REPARTOS[0].name);
  const [escuadron, setEscuadron] = useState(initialData?.escuadron || FAE_REPARTOS[0].squadrons[0]);

  // Dropdown open states for centered touch modal
  const [isRepartoDropdownOpen, setIsRepartoDropdownOpen] = useState(false);
  const [isEscuadronDropdownOpen, setIsEscuadronDropdownOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [lookupSearchTerm, setLookupSearchTerm] = useState('');

  // Touch keyboard popup control
  const [activeKeyboardField, setActiveKeyboardField] = useState<'nombres' | 'apellidos' | 'reparto' | 'escuadron' | null>(null);

  // Extract unique previously registered personnel & pre-loaded ESMA catalog
  const catalogPersonnel = getRegisteredPersonnel();
  const recordPersonnel = records ? records.map(r => r.personnel) : [];
  
  const uniqueRegisteredPersonnel: MilitaryPersonnel[] = Array.from(
    new Map([...catalogPersonnel, ...recordPersonnel].map(p => [`${p.nombres.toLowerCase().trim()}-${p.apellidos.toLowerCase().trim()}`, p])).values()
  );

  const filteredLookupPersonnel = uniqueRegisteredPersonnel.filter(p => {
    const term = lookupSearchTerm.toLowerCase();
    return (
      p.nombres.toLowerCase().includes(term) ||
      p.apellidos.toLowerCase().includes(term) ||
      p.grado.toLowerCase().includes(term) ||
      p.escuadron.toLowerCase().includes(term)
    );
  });

  const handleSelectReparto = (rep: RepartoOption) => {
    soundFX.playTap();
    setSelectedRepartoObj(rep);
    setReparto(rep.name);
    setEscuadron(rep.squadrons[0]);
    setIsRepartoDropdownOpen(false);
  };

  const handleSelectEscuadron = (squad: string) => {
    soundFX.playTap();
    setEscuadron(squad);
    setIsEscuadronDropdownOpen(false);
  };

  const handleSelectExistingPersonnel = (p: MilitaryPersonnel) => {
    soundFX.playSuccess();
    setNombres(p.nombres);
    setApellidos(p.apellidos);
    setGrado(p.grado);
    setEdad(p.edad);
    
    // Find matching reparto object or fallback
    const matchedRep = FAE_REPARTOS.find(r => r.name === p.reparto) || FAE_REPARTOS[0];
    setSelectedRepartoObj(matchedRep);
    setReparto(p.reparto);
    setEscuadron(p.escuadron);

    setIsLookupModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playTap();
    if (!nombres.trim() || !apellidos.trim()) {
      soundFX.playWarning();
      alert('Por favor ingrese Nombres y Apellidos del personal militar.');
      return;
    }
    onSubmit({
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      grado,
      edad: Number(edad),
      reparto: reparto.trim(),
      escuadron: escuadron.trim(),
    });
  };

  const currentKeyboardValue = 
    activeKeyboardField === 'nombres' ? nombres :
    activeKeyboardField === 'apellidos' ? apellidos :
    activeKeyboardField === 'reparto' ? reparto :
    activeKeyboardField === 'escuadron' ? escuadron : '';

  const handleKeyboardChange = (val: string) => {
    if (activeKeyboardField === 'nombres') setNombres(val);
    else if (activeKeyboardField === 'apellidos') setApellidos(val);
    else if (activeKeyboardField === 'reparto') setReparto(val);
    else if (activeKeyboardField === 'escuadron') setEscuadron(val);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Header Banner with Quick Lookup Button */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Paso 1 de 5 🪪</span>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <User className="text-emerald-400" size={28} /> Registro de Personal Militar y Cadetes
          </h2>
          <p className="text-slate-400 text-xs mt-1">Seleccione el Reparto FAE y su Escuadrón correspondiente.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Lookup Button for Previously Registered Personnel */}
          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              setIsLookupModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-700 rounded-xl text-xs font-extrabold flex items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <UserCheck size={18} />
            <span>BUSCAR MILITAR REGISTRADO 🔍</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playTap();
              onCancel();
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
          >
            Cancelar ❌
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Main Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          
          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombres */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider">
                Nombres <span className="text-emerald-400">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  onClick={() => {
                    soundFX.playTap();
                    setActiveKeyboardField('nombres');
                  }}
                  onFocus={() => {
                    soundFX.playTap();
                    setActiveKeyboardField('nombres');
                  }}
                  placeholder="Ej. Carlos Eduardo"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 text-white font-semibold text-lg p-3.5 pl-4 pr-12 rounded-xl focus:outline-none transition-all cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setActiveKeyboardField('nombres');
                  }}
                  className="absolute right-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
                  title="Abrir Teclado Táctil ⌨️"
                >
                  <Keyboard size={20} />
                </button>
              </div>
            </div>

            {/* Apellidos */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider">
                Apellidos <span className="text-emerald-400">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  onClick={() => {
                    soundFX.playTap();
                    setActiveKeyboardField('apellidos');
                  }}
                  onFocus={() => {
                    soundFX.playTap();
                    setActiveKeyboardField('apellidos');
                  }}
                  placeholder="Ej. Mendoza Ruiz"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 text-white font-semibold text-lg p-3.5 pl-4 pr-12 rounded-xl focus:outline-none transition-all cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setActiveKeyboardField('apellidos');
                  }}
                  className="absolute right-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
                  title="Abrir Teclado Táctil ⌨️"
                >
                  <Keyboard size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Grado Militar Touch Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <Shield size={16} className="text-emerald-400" /> Grado Militar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {MILITARY_RANKS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => {
                    soundFX.playTap();
                    setGrado(r);
                  }}
                  className={`p-3 rounded-xl font-bold text-sm text-left transition-all border cursor-pointer ${
                    grado === r
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950 scale-102'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Edad POS Numpad Stepper & Symmetrical 4x2 Presets Grid */}
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <label className="text-xs font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <Calendar size={18} className="text-emerald-400" /> Selección de Edad (Años)
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700">
                {edad} Años Seleccionados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left Column: Touch Stepper (4 cols) */}
              <div className="md:col-span-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setEdad(Math.max(18, edad - 1));
                  }}
                  className="w-14 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-3xl rounded-2xl border border-slate-700 flex items-center justify-center shadow-lg cursor-pointer"
                >
                  -
                </button>
                <div className="flex-1 bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-3 text-center text-3xl font-mono font-black text-emerald-400 shadow-inner">
                  {edad}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setEdad(Math.min(75, edad + 1));
                  }}
                  className="w-14 h-14 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-3xl rounded-2xl border border-slate-700 flex items-center justify-center shadow-lg cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Right Column: Symmetrical 4x2 Presets Grid (7 cols) */}
              <div className="md:col-span-7 space-y-1.5">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                  Presets Rápidos:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[19, 21, 24, 27, 30, 35, 40, 45].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => {
                        soundFX.playTap();
                        setEdad(preset);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all border text-center cursor-pointer active:scale-95 ${
                        edad === preset
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950 scale-102'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {preset} años
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reparto & Escuadrón (Single Touch Button Dropdowns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Field 1: REPARTO / BASE (Single Big Touch Button) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <Building2 size={18} className="text-emerald-400" /> Reparto / Base FAE
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setIsRepartoDropdownOpen(true);
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-850 border-2 border-emerald-600/80 focus:border-emerald-400 text-white font-black text-left text-base p-4 rounded-2xl shadow-lg flex items-center justify-between transition-all active:scale-98 cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-semibold text-emerald-400 block uppercase">
                      Unidad / Base: ({selectedRepartoObj.location})
                    </span>
                    <span>{reparto}</span>
                  </div>
                  <ChevronDown size={24} className="text-emerald-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setActiveKeyboardField('reparto');
                  }}
                  className="bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white p-4 rounded-2xl transition-colors shadow-md shrink-0 cursor-pointer"
                  title="Abrir Teclado Manual ⌨️"
                >
                  <Keyboard size={22} />
                </button>
              </div>
            </div>

            {/* Field 2: ESCUADRÓN (Dynamic Squadrons filtered by selected Reparto) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <Users size={18} className="text-emerald-400" /> Escuadrón (Filtrado por Reparto)
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setIsEscuadronDropdownOpen(true);
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-850 border-2 border-emerald-600/80 focus:border-emerald-400 text-white font-black text-left text-base p-4 rounded-2xl shadow-lg flex items-center justify-between transition-all active:scale-98 cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-semibold text-emerald-400 block uppercase">
                      Escuadrón Asignado:
                    </span>
                    <span>{escuadron}</span>
                  </div>
                  <ChevronDown size={24} className="text-emerald-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setActiveKeyboardField('escuadron');
                  }}
                  className="bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white p-4 rounded-2xl transition-colors shadow-md shrink-0 cursor-pointer"
                  title="Abrir Teclado Manual ⌨️"
                >
                  <Keyboard size={22} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Big Action Button: CONTINUAR */}
        <button
          type="submit"
          className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-950 border border-emerald-400 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <span>CONTINUAR A SIGNOS VITALES 🩺</span>
          <ArrowRight size={28} />
        </button>
      </form>

      {/* REPARTO TOUCH MODAL SELECTOR */}
      {isRepartoDropdownOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-black text-white">Seleccione Reparto / Base FAE 🇪🇨</h3>
                <p className="text-xs text-slate-400">Toque la unidad correspondiente</p>
              </div>
              <button
                onClick={() => {
                  soundFX.playTap();
                  setIsRepartoDropdownOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {FAE_REPARTOS.map((rep) => {
                const isSelected = reparto === rep.name;
                return (
                  <button
                    type="button"
                    key={rep.id}
                    onClick={() => handleSelectReparto(rep)}
                    className={`w-full text-left p-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all active:scale-98 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-lg border border-emerald-400'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-black text-base">{rep.name}</div>
                      <div className="text-xs text-slate-400 font-medium">Base: {rep.location}</div>
                    </div>
                    {isSelected && <Check size={22} className="text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ESCUADRÓN TOUCH MODAL SELECTOR */}
      {isEscuadronDropdownOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-black text-white">Escuadrones de {selectedRepartoObj.name}</h3>
                <p className="text-xs text-slate-400">Seleccione el escuadrón asignado</p>
              </div>
              <button
                onClick={() => {
                  soundFX.playTap();
                  setIsEscuadronDropdownOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {selectedRepartoObj.squadrons.map((sq) => {
                const isSelected = escuadron === sq;
                return (
                  <button
                    type="button"
                    key={sq}
                    onClick={() => handleSelectEscuadron(sq)}
                    className={`w-full text-left p-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all active:scale-98 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-lg border border-emerald-400'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span className="font-extrabold text-base">{sq}</span>
                    {isSelected && <Check size={22} className="text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PREVIOUSLY REGISTERED MILITARY PERSONNEL LOOKUP MODAL */}
      {isLookupModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="text-emerald-400" size={24} />
                <div>
                  <h3 className="text-xl font-black text-white">Seleccionar Militar Ya Registrado</h3>
                  <p className="text-xs text-slate-400">Autocompleta los datos en 1 solo toque</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFX.playTap();
                  setIsLookupModalOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Filter Input */}
            <div className="relative">
              <input
                type="text"
                value={lookupSearchTerm}
                onChange={(e) => setLookupSearchTerm(e.target.value)}
                placeholder="🔍 Escriba Nombre, Apellido, Grado o Escuadrón..."
                className="w-full bg-slate-950 border border-slate-700 text-white font-medium p-3 pl-10 rounded-xl focus:outline-none focus:border-emerald-500 text-sm"
              />
              <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>

            {/* List of Registered Pilots */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {filteredLookupPersonnel.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">
                  No hay militares registrados previamente con ese criterio.
                </div>
              ) : (
                filteredLookupPersonnel.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectExistingPersonnel(p)}
                    className="w-full text-left p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500 rounded-2xl transition-all active:scale-98 space-y-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-white text-base">
                        {p.nombres} {p.apellidos}
                      </div>
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {p.grado}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {p.reparto} • {p.escuadron} ({p.edad} años)
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Integrated Touch Keyboard Popup */}
      <TouchKeyboard
        visible={activeKeyboardField !== null}
        value={currentKeyboardValue}
        onChange={handleKeyboardChange}
        onClose={() => setActiveKeyboardField(null)}
        title={`Ingrese ${
          activeKeyboardField === 'nombres' ? 'Nombres' :
          activeKeyboardField === 'apellidos' ? 'Apellidos' :
          activeKeyboardField === 'reparto' ? 'Reparto' : 'Escuadrón'
        }`}
      />
    </div>
  );
};
