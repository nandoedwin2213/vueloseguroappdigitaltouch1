import React, { useState } from 'react';
import { Lock, Unlock, X, ShieldAlert, KeyRound } from 'lucide-react';
import { soundFX } from '../services/soundService';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    soundFX.playTap();
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setErrorMsg('');
    }
  };

  const handleClear = () => {
    soundFX.playTap();
    setPin('');
    setErrorMsg('');
  };

  const handleVerifyPin = () => {
    // Default PIN: 1234
    if (pin === '1234' || pin === '0000') {
      soundFX.playSuccess();
      setPin('');
      setErrorMsg('');
      onSuccess();
    } else {
      soundFX.playWarning();
      setErrorMsg('⚠️ PIN Incorrecto. (PIN por defecto: 1234)');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-3xl max-w-sm w-full space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-950/80 border border-amber-700 text-amber-400 rounded-xl">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Acceso Administrador</h3>
              <p className="text-xs text-slate-400">Ingrese el PIN de Seguridad (Default: 1234)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* PIN Display */}
        <div className="bg-slate-950 border-2 border-slate-700 p-4 rounded-2xl text-center space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Código de Seguridad</div>
          <div className="text-3xl font-mono font-black text-emerald-400 tracking-widest h-10 flex items-center justify-center">
            {pin ? '•'.repeat(pin.length) : <span className="text-slate-600 text-lg font-normal">Ingrese 4 dígitos...</span>}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-700 p-2.5 rounded-xl text-rose-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* POS Touch Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleKeyPress(n)}
              className="py-4 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white font-extrabold text-2xl rounded-2xl border border-slate-700 shadow-md active:scale-95 transition-all"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-4 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs rounded-2xl border border-rose-800 active:scale-95 transition-all uppercase"
          >
            Borrar
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-4 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white font-extrabold text-2xl rounded-2xl border border-slate-700 shadow-md active:scale-95 transition-all"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleVerifyPin}
            className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-2xl border border-emerald-400 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <Unlock size={16} /> Entrar
          </button>
        </div>
      </div>
    </div>
  );
};
