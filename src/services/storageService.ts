import { MilitaryPersonnel, PreFlightCheckupRecord, SystemConfig } from '../types';
import { uploadRecordToNeon } from './neonService';

const STORAGE_KEY_RECORDS = 'vueloseguro_records_v2';
const STORAGE_KEY_CONFIG = 'vueloseguro_config_v2';
const STORAGE_KEY_REGISTERED_PERSONNEL = 'vueloseguro_registered_personnel_v1';

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
  randomAlcoholAuditPercent: 1, // 1% probability (1 out of 100 checkups - max 1-2 per day)
};

// Base de Datos Oficial de Pilotos y Cadetes de la ESMA (Escuela Superior Militar de Aviación)
export const DEFAULT_ESMA_PERSONNEL: MilitaryPersonnel[] = [
  { nombres: 'Santiago', apellidos: 'Galarza', grado: 'Coronel', edad: 45, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Luis N.', apellidos: 'Méndez', grado: 'Coronel', edad: 47, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Carlos', apellidos: 'Altamirano', grado: 'Teniente Coronel', edad: 42, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Jorge CH.', apellidos: 'Salazar', grado: 'Teniente Coronel', edad: 41, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Ochoa', apellidos: 'Pérez', grado: 'Teniente Coronel', edad: 40, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Tamayo', apellidos: 'Moncayo', grado: 'Teniente Coronel', edad: 43, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Edwin', apellidos: 'Ayala', grado: 'Mayor', edad: 38, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón Medicina de Aviación' },
  { nombres: 'Gonzalo', apellidos: 'Benítez', grado: 'Mayor', edad: 39, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Vladimir', apellidos: 'Freire', grado: 'Mayor', edad: 37, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Guillermo', apellidos: 'Navarrete', grado: 'Mayor', edad: 38, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Edgar', apellidos: 'Asqui', grado: 'Capitán', edad: 33, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Bermeo', apellidos: 'Salazar', grado: 'Capitán', edad: 32, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Canales', apellidos: 'Suárez', grado: 'Capitán', edad: 34, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Walter', apellidos: 'Castillo', grado: 'Capitán', edad: 33, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Changuan', apellidos: 'Morales', grado: 'Capitán', edad: 31, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Shuberth', apellidos: 'Espinosa', grado: 'Capitán', edad: 35, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Francisco R.', apellidos: 'Estrella', grado: 'Capitán', edad: 34, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Edison', apellidos: 'González', grado: 'Capitán', edad: 32, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Paola', apellidos: 'Gualoto', grado: 'Capitán', edad: 30, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Juan', apellidos: 'Negrete', grado: 'Capitán', edad: 33, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Eduardo', apellidos: 'Novillo', grado: 'Capitán', edad: 34, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'David', apellidos: 'Reyes', grado: 'Capitán', edad: 32, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Rivadeneira', apellidos: 'Ortiz', grado: 'Capitán', edad: 31, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Elvis', apellidos: 'Rodríguez', grado: 'Capitán', edad: 33, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Pedro', apellidos: 'Rodríguez', grado: 'Capitán', edad: 35, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Marcia', apellidos: 'Santamaría', grado: 'Capitán', edad: 31, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Kennedy', apellidos: 'Tamayo', grado: 'Capitán', edad: 32, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Tigselema', apellidos: 'Guamán', grado: 'Capitán', edad: 33, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Stephanie', apellidos: 'Torres', grado: 'Capitán', edad: 30, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Ignacio', apellidos: 'Tuatez', grado: 'Capitán', edad: 34, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Mario', apellidos: 'Vásquez', grado: 'Capitán', edad: 33, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Vera', apellidos: 'Mendoza', grado: 'Capitán', edad: 32, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Acuña', apellidos: 'Torres', grado: 'Teniente', edad: 28, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Luis T.', apellidos: 'Aldás', grado: 'Teniente', edad: 27, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Anaguano', apellidos: 'López', grado: 'Teniente', edad: 29, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Marlon', apellidos: 'Arcentales', grado: 'Teniente', edad: 28, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Santiago', apellidos: 'Castro', grado: 'Teniente', edad: 27, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Clavijo', apellidos: 'Salazar', grado: 'Teniente', edad: 28, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Christian A.', apellidos: 'Coral', grado: 'Teniente', edad: 29, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Antony', apellidos: 'España', grado: 'Teniente', edad: 27, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'García', apellidos: 'Mendoza', grado: 'Teniente', edad: 28, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Iglesias', apellidos: 'Pérez', grado: 'Teniente', edad: 27, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Martínez Cueva', apellidos: 'Sánchez', grado: 'Teniente', edad: 28, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Bryan', apellidos: 'Moreira', grado: 'Teniente', edad: 27, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Jimmy', apellidos: 'Orozco', grado: 'Teniente', edad: 28, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Ortiz', apellidos: 'Zambrano', grado: 'Teniente', edad: 27, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Israel', apellidos: 'Pacheco', grado: 'Teniente', edad: 28, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Allison', apellidos: 'Albuja', grado: 'Subteniente', edad: 25, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Alex', apellidos: 'Allauca', grado: 'Subteniente', edad: 24, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Víctor', apellidos: 'Hermosa', grado: 'Subteniente', edad: 25, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Marcelo', apellidos: 'Pico', grado: 'Subteniente', edad: 24, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Vuelo ESMA' },
  { nombres: 'Kdt. Jaramillo', apellidos: 'Vaca', grado: 'Cadete', edad: 21, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Cadetes ESMA' },
  { nombres: 'Kdt. Naranjo', apellidos: 'García', grado: 'Cadete', edad: 22, reparto: 'ESMA - Escuela Superior Militar de Aviación', escuadron: 'Escuadrón de Cadetes ESMA' },
];

// Seed initial mock records
const SEED_RECORDS: PreFlightCheckupRecord[] = [
  {
    id: 'VS-20260902-0001',
    timestamp: Date.now() - 3600000 * 2,
    formattedDate: new Date(Date.now() - 3600000 * 2).toLocaleDateString('es-ES'),
    formattedTime: new Date(Date.now() - 3600000 * 2).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    operatorName: 'MAYOR EDWIN AYALA MEDICO AEROESPACIAL',
    stationId: 'DEA/MEDICINA DE AVIACION',
    personnel: {
      nombres: 'Santiago',
      apellidos: 'Galarza',
      grado: 'Coronel',
      edad: 45,
      reparto: 'ESMA - Escuela Superior Militar de Aviación',
      escuadron: 'Escuadrón de Vuelo ESMA',
    },
    vitalSigns: {
      sistolica: 118,
      diastolica: 76,
      frecuenciaCardiaca: 68,
      horasSueno: 8,
      bpStatus: 'NORMAL',
      hrStatus: 'NORMAL',
      sleepStatus: 'SUFICIENTE',
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
];

export function getConfig(): SystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
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

// Registered personnel database functions for 1-tap auto-complete lookup
export function getRegisteredPersonnel(): MilitaryPersonnel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_PERSONNEL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REGISTERED_PERSONNEL, JSON.stringify(DEFAULT_ESMA_PERSONNEL));
      return DEFAULT_ESMA_PERSONNEL;
    }
    const stored: MilitaryPersonnel[] = JSON.parse(raw);
    
    // Merge stored personnel with DEFAULT_ESMA_PERSONNEL to guarantee ESMA roster is always available
    const existingKeys = new Set(stored.map(p => `${p.nombres.toLowerCase()}_${p.apellidos.toLowerCase()}`));
    const merged = [...stored];
    for (const p of DEFAULT_ESMA_PERSONNEL) {
      const key = `${p.nombres.toLowerCase()}_${p.apellidos.toLowerCase()}`;
      if (!existingKeys.has(key)) {
        merged.push(p);
      }
    }
    return merged;
  } catch (e) {
    return DEFAULT_ESMA_PERSONNEL;
  }
}

export function saveRegisteredPersonnel(person: MilitaryPersonnel): void {
  try {
    const list = getRegisteredPersonnel();
    const key = `${person.nombres.trim().toLowerCase()}_${person.apellidos.trim().toLowerCase()}`;
    const exists = list.some(p => `${p.nombres.trim().toLowerCase()}_${p.apellidos.trim().toLowerCase()}` === key);
    
    if (!exists) {
      const updated = [person, ...list];
      localStorage.setItem(STORAGE_KEY_REGISTERED_PERSONNEL, JSON.stringify(updated));
      console.log(`👤 New military personnel registered & saved to catalog: ${person.nombres} ${person.apellidos}`);
    }
  } catch (e) {
    console.error('Error saving registered personnel:', e);
  }
}

export function saveRecord(record: PreFlightCheckupRecord): void {
  try {
    // Auto-save military personnel to catalog if not present!
    if (record.personnel) {
      saveRegisteredPersonnel(record.personnel);
    }

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
