import React, { useState } from 'react';
import { Delete, CornerDownLeft, X } from 'lucide-react';

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
    const nextChar = isUppercase ? char.toUpperCase() : char.toLowerCase();
    onChange(value + nextChar);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleSpace = () => {
    onChange(value + ' ');
  };

  return (
    <div className="touch-keyboard-overlay">
      <div className="touch-keyboard-card">
        <div className="touch-keyboard-header">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-200">
            <span>⌨️ {title}</span>
          </div>
          <button onClick={onClose} className="touch-btn-close">
            <X size={24} />
          </button>
        </div>

        <div className="touch-keyboard-display">
          <input
            type="text"
            value={value}
            readOnly
            className="w-full bg-slate-950 text-emerald-400 font-mono text-2xl p-4 rounded-xl border border-slate-700 shadow-inner"
            placeholder="Escriba aquí..."
          />
        </div>

        <div className="touch-keyboard-keys">
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-2 my-1.5">
              {rIdx === 2 && (
                <button
                  type="button"
                  onClick={() => setIsUppercase(!isUppercase)}
                  className={`touch-key ${isUppercase ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300'}`}
                >
                  ⇧ MAYÚS
                </button>
              )}

              {row.map((char) => (
                <button
                  type="button"
                  key={char}
                  onClick={() => handleKeyPress(char)}
                  className="touch-key bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 text-white text-xl font-semibold shadow-md active:scale-95 transition-all"
                >
                  {isUppercase ? char : char.toLowerCase()}
                </button>
              ))}

              {rIdx === 2 && (
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="touch-key bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold flex items-center justify-center gap-1"
                >
                  <Delete size={20} /> BORRAR
                </button>
              )}
            </div>
          ))}

          {/* Bottom Control Row */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={handleSpace}
              className="touch-key flex-1 max-w-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-lg font-bold"
            >
              ESPACIO
            </button>
            <button
              type="button"
              onClick={onClose}
              className="touch-key bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg px-8 flex items-center gap-2"
            >
              <CornerDownLeft size={22} /> LISTO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
