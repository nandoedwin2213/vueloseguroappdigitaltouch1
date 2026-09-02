export type MilitaryRank = 
  | 'General'
  | 'Coronel'
  | 'Teniente Coronel'
  | 'Mayor'
  | 'Capitán'
  | 'Teniente'
  | 'Subteniente'
  | 'Cadete'
  | 'Sargento Primero'
  | 'Sargento'
  | 'Cabo'
  | 'Soldado / Aviador';

export type AssessmentStatus = 'APTO' | 'OBSERVACION' | 'NO_APTO';

export interface MilitaryPersonnel {
  nombres: string;
  apellidos: string;
  grado: MilitaryRank;
  edad: number;
  reparto: string;
  escuadron: string;
  dniOrId?: string;
}

export interface VitalSigns {
  sistolica: number;          // mmHg (ej: 120)
  diastolica: number;         // mmHg (ej: 80)
  frecuenciaCardiaca: number; // BPM (ej: 72)
  bpStatus: 'NORMAL' | 'ELEVADA' | 'ALTA';
  hrStatus: 'NORMAL' | 'ELEVADA' | 'BAJA';
  notes?: string;
}

export interface ImSafeFactor {
  code: 'I' | 'M' | 'S' | 'A' | 'F' | 'E';
  name: string;
  labelEs: string;
  description: string;
  status: AssessmentStatus;
  notes?: string;
}

export interface ImSafeEvaluation {
  illness: AssessmentStatus;
  medication: AssessmentStatus;
  stress: AssessmentStatus;
  alcohol: AssessmentStatus;
  fatigue: AssessmentStatus;
  emotionEating: AssessmentStatus;
  overallStatus: AssessmentStatus;
  notes?: string;
}

export interface ReactionTrial {
  trialIndex: number;
  delayMs: number;
  reactionTimeMs: number;
  isAnticipated: boolean;
  isCorrect: boolean;
  timestamp: number;
}

export interface ReactionMetrics {
  trials: ReactionTrial[];
  totalTrials: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  medianMs: number;
  correctCount: number;
  incorrectCount: number;
  anticipatedCount: number;
  evaluationStatus: AssessmentStatus;
}

export interface PreFlightCheckupRecord {
  id: string; // e.g., VS-20260902-0042
  timestamp: number;
  formattedDate: string;
  formattedTime: string;
  operatorName: string;
  stationId: string;
  personnel: MilitaryPersonnel;
  vitalSigns: VitalSigns;
  imSafe: ImSafeEvaluation;
  reaction: ReactionMetrics;
  finalResult: AssessmentStatus;
  observationsList: string[]; // List of specific observation notes (e.g. "Presión arterial elevada", "Tiempo de reacción alterado")
  cloudSyncStatus: 'SYNCED' | 'PENDING';
  syncedAt?: number;
}

export interface SystemConfig {
  stationId: string;
  operatorName: string;
  operatorRole: 'OPERADOR' | 'ADMIN';
  cloudSyncEnabled: boolean;
  cloudEndpointUrl: string;
  // Thresholds (in ms)
  reactionTimeAptoMax: number;       // e.g. < 280ms
  reactionTimeObservacionMax: number;// e.g. 280ms - 350ms
  reactionTrialsCount: number;       // default 5
  autoPrintReceipt: boolean;
  soundEffectsEnabled: boolean;
  cloudSyncIntervalSec: number;
}
