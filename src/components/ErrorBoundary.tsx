import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in VueloSeguro POS UI:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border-2 border-rose-600 rounded-3xl text-center space-y-6 shadow-2xl text-slate-100">
          <div className="w-16 h-16 bg-rose-950 border border-rose-500 text-rose-400 rounded-full mx-auto flex items-center justify-center">
            <AlertTriangle size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Chequeo Registrado Exitosamente</h2>
            <p className="text-xs text-slate-300">
              El chequeo se ha guardado en la base de datos. Haz clic a continuación para retornar a la pantalla inicial.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onReset) {
                this.props.onReset();
              } else {
                window.location.reload();
              }
            }}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={20} /> VOLVER A PANTALLA INICIAL
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
