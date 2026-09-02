import React, { useState } from 'react';
import { Delete, CornerDownLeft, X } from 'lucide-react';
import { soundFX } from '../services/soundService';

interface TouchKeyboardProps {
  visible: boolean;
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
  title?: string;
}

export const TouchKeyboard: React.FC<TouchKeyboardProps> = ({
  visible,
  value,
  onChange,
  onClose,
  title = 'Teclado Táctil Integrado',
}) => {
  const [isUppercase, setIsUppercase] = useState(true);

  if (!visible) return null;

  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  const handleKeyPress = (char: string) => {
    soundFX.playTap();
    const nextChar = isUppercase ? char.toUpperCase() : char.toLowerCase();
    onChange(value + nextChar);
  };

  const handleBackspace = () => {
    soundFX.playTap();
    onChange(value.slice(0, -1));
  };

  const handleSpace = () => {
    soundFX.playTap();
    onChange(value + ' ');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end justify-center p-4 select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-3xl w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-black text-xl text-white">
            <span>⌨️ {title}</span>
          </div>
          <button
            onClick={() => {
              soundFX.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X size={26} />
          </button>
        </div>

        {/* Live Input Display */}
        <div className="relative">
          <input
            type="text"
            value={value}
            readOnly
            className="w-full bg-slate-950 text-emerald-400 font-mono text-3xl font-bold p-4 rounded-2xl border-2 border-slate-700 shadow-inner tracking-wider"
            placeholder="Escriba aquí..."
          />
        </div>

        {/* Touch Keys Layout */}
        <div className="space-y-2 pt-1">
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-2">
              {rIdx === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setIsUppercase(!isUppercase);
                  }}
                  className={`px-3 sm:px-5 py-3.5 rounded-xl font-black text-sm transition-all border cursor-pointer active:scale-95 ${
                    isUppercase ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  ⇧ MAYÚS
                </button>
              )}

              {row.map((char) => (
                <button
                  type="button"
                  key={char}
                  onClick={() => handleKeyPress(char)}
                  className="flex-1 max-w-[58px] h-14 bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 border border-slate-700 rounded-xl text-white text-2xl font-black shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  {isUppercase ? char : char.toLowerCase()}
                </button>
              ))}

              {rIdx === 2 && (
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="px-3 sm:px-5 py-3.5 bg-rose-900/90 hover:bg-rose-800 border border-rose-700 text-rose-200 font-black text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Delete size={20} /> BORRAR
                </button>
              )}
            </div>
          ))}

          {/* Bottom Control Row */}
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSpace}
              className="flex-1 max-w-md h-14 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-base font-black rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              ESPACIO
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playTap();
                onClose();
              }}
              className="px-8 h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-xl shadow-xl shadow-emerald-950 border border-emerald-400 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <CornerDownLeft size={22} /> LISTO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
