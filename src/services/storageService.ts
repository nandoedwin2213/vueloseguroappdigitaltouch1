import { PreFlightCheckupRecord, SystemConfig } from '../types';
import { uploadRecordToNeon } from './neonService';

const STORAGE_KEY_RECORDS = 'vueloseguro_records_v2';
const STORAGE_KEY_CONFIG = 'vueloseguro_config_v2';

export const DEFAULT_CONFIG: SystemConfig = {
  stationId: 'DEA/MEDICINA DE AVIACION',
  operatorName: 'MAYOR EDWIN AYALA MEDICO AEROESPACIAL',
  operatorRole: 'ADMIN',
  cloudSyncEnabled: true,
  cloudEndpointUrl: 'postgresql://neondb_owner:npg_Cu9Mkdbqy8Hs@ep-empty-mouse-aehm9zc8-pooler.c-2.us-east-2.aws.neon.tech/neondb',
  reactionTimeAptoMax: 280,
  reactionTimeObservacionMax: 350,
  reactionTrialsCount: 5,
  autoPrintReceipt: false,
  soundEffectsEnabled: true,
  cloudSyncIntervalSec: 10,
  randomAlcoholAuditEnabled: true,
  randomAlcoholAuditPercent: 12,
};

// Seed initial mock records with Vital Signs
const SEED_RECORDS: PreFlightCheckupRecord[] = [
  {
    id: 'VS-20260902-0001',
    timestamp: Date.now() - 3600000 * 2,
    formattedDate: new Date(Date.now() - 3600000 * 2).toLocaleDateString('es-ES'),
    formattedTime: new Date(Date.now() - 3600000 * 2).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    operatorName: 'MAYOR EDWIN AYALA MEDICO AEROESPACIAL',
    stationId: 'DEA/MEDICINA DE AVIACION',
    personnel: {
      nombres: 'Roberto Carlos',
      apellidos: 'Alvarado Benítez',
      grado: 'Mayor',
      edad: 34,
      reparto: 'Ala de Combate N° 22',
      escuadron: 'Escuadrón 2112',
      dniOrId: 'CAD-9921',
    },
    vitalSigns: {
      sistolica: 118,
      diastolica: 76,
      frecuenciaCardiaca: 68,
      bpStatus: 'NORMAL',
      hrStatus: 'NORMAL',
    },
    imSafe: {
      illness: 'APTO',
      medication: 'APTO',
      stress: 'APTO',
      alcohol: 'APTO',
      fatigue: 'APTO',
      emotionEating: 'APTO',
      overallStatus: 'APTO',
    },
    reaction: {
      trials: [
        { trialIndex: 1, delayMs: 2300, reactionTimeMs: 210, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
        { trialIndex: 2, delayMs: 3100, reactionTimeMs: 195, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
        { trialIndex: 3, delayMs: 1800, reactionTimeMs: 220, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
        { trialIndex: 4, delayMs: 4000, reactionTimeMs: 205, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
        { trialIndex: 5, delayMs: 2500, reactionTimeMs: 198, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
      ],
      totalTrials: 5,
      minMs: 195,
      maxMs: 220,
      avgMs: 206,
      medianMs: 205,
      correctCount: 5,
      incorrectCount: 0,
      anticipatedCount: 0,
      evaluationStatus: 'APTO',
    },
    finalResult: 'APTO',
    observationsList: [],
    cloudSyncStatus: 'SYNCED',
    syncedAt: Date.now() - 3500000,
  },
  {
    id: 'VS-20260902-0002',
    timestamp: Date.now() - 3600000 * 1,
    formattedDate: new Date(Date.now() - 3600000 * 1).toLocaleDateString('es-ES'),
    formattedTime: new Date(Date.now() - 3600000 * 1).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    operatorName: 'MAYOR EDWIN AYALA MEDICO AEROESPACIAL',
    stationId: 'DEA/MEDICINA DE AVIACION',
    personnel: {
      nombres: 'Esteban Andrés',
      apellidos: 'Vargas Silva',
      grado: 'Cadete',
      edad: 21,
      reparto: 'Escuela Superior de Aviación',
      escuadron: 'Escuadrón Cadetes N° 3',
      dniOrId: 'CAD-4412',
    },
    vitalSigns: {
      sistolica: 132,
      diastolica: 86,
      frecuenciaCardiaca: 84,
      bpStatus: 'ELEVADA',
      hrStatus: 'NORMAL',
    },
    imSafe: {
      illness: 'APTO',
      medication: 'APTO',
      stress: 'APTO',
      alcohol: 'APTO',
      fatigue: 'APTO',
      emotionEating: 'APTO',
      overallStatus: 'APTO',
    },
    reaction: {
      trials: [
        { trialIndex: 1, delayMs: 2000, reactionTimeMs: 290, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
        { trialIndex: 2, delayMs: 2700, reactionTimeMs: 310, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
        { trialIndex: 3, delayMs: 3500, reactionTimeMs: 305, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
        { trialIndex: 4, delayMs: 2200, reactionTimeMs: 285, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
        { trialIndex: 5, delayMs: 4100, reactionTimeMs: 295, isAnticipated: false, isCorrect: true, timestamp: Date.now() },
      ],
      totalTrials: 5,
      minMs: 285,
      maxMs: 310,
      avgMs: 297,
      medianMs: 295,
      correctCount: 5,
      incorrectCount: 0,
      anticipatedCount: 0,
      evaluationStatus: 'OBSERVACION',
    },
    finalResult: 'OBSERVACION',
    observationsList: ['Presión Arterial Elevada (132/86 mmHg)', 'Tiempo de Reacción Elevado (297 ms)'],
    cloudSyncStatus: 'SYNCED',
    syncedAt: Date.now() - 3200000,
  },
];

export function getConfig(): SystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    // Always enforce institutional defaults for stationId and operatorName
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      stationId: 'DEA/MEDICINA DE AVIACION',
      operatorName: 'MAYOR EDWIN AYALA MEDICO AEROESPACIAL',
    };
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: SystemConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

export function getRecords(): PreFlightCheckupRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(SEED_RECORDS));
      return SEED_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_RECORDS;
  }
}

export function saveRecord(record: PreFlightCheckupRecord): void {
  try {
    const records = getRecords();
    const updated = [record, ...records];
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
    // Asynchronously sync new record to Neon Postgres
    uploadRecordToNeon(record).then((success) => {
      if (success) {
        const currentRecords = getRecords();
        const synced = currentRecords.map(r => r.id === record.id ? { ...r, cloudSyncStatus: 'SYNCED' as const, syncedAt: Date.now() } : r);
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(synced));
      }
    });
  } catch (e) {
    console.error('Error saving record:', e);
  }
}

export function generateNextId(): string {
  const records = getRecords();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const todayCount = records.filter(r => r.id.includes(dateStr)).length + 1;
  const seq = String(todayCount).padStart(4, '0');
  return `VS-${dateStr}-${seq}`;
}

export async function syncRecordsWithCloud(): Promise<{ syncedCount: number; pendingCount: number }> {
  const records = getRecords();
  let syncedCount = 0;

  for (const record of records) {
    if (record.cloudSyncStatus === 'PENDING') {
      const ok = await uploadRecordToNeon(record);
      if (ok) {
        syncedCount++;
        record.cloudSyncStatus = 'SYNCED';
        record.syncedAt = Date.now();
      }
    }
  }

  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  const pendingCount = records.filter(r => r.cloudSyncStatus === 'PENDING').length;
  return { syncedCount, pendingCount };
}
