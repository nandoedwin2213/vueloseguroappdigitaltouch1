import { PreFlightCheckupRecord } from '../types';

export function exportRecordsToCSV(records: PreFlightCheckupRecord[]) {
  const headers = [
    'ID Chequeo',
    'Fecha',
    'Hora',
    'Operador',
    'Estacion ID',
    'Nombres',
    'Apellidos',
    'Grado',
    'Edad',
    'Reparto / Base',
    'Escuadron',
    'Presion Sistolica (mmHg)',
    'Presion Diastolica (mmHg)',
    'Estado Presion',
    'Frecuencia Cardiaca (BPM)',
    'Estado Pulso',
    'IM SAFE Illness',
    'IM SAFE Medication',
    'IM SAFE Stress',
    'IM SAFE Alcohol',
    'IM SAFE Fatigue',
    'IM SAFE Emotion/Eating',
    'IM SAFE Dictamen',
    'Reflejos Promedio (ms)',
    'Reflejos Mejor (ms)',
    'Reflejos Peor (ms)',
    'Reflejos Mediana (ms)',
    'Reflejos Correctas',
    'Reflejos Anticipadas',
    'Observaciones Adjuntas',
    'Dictamen Final',
    'Estado Nube'
  ];

  const rows = records.map(r => [
    `"${r.id}"`,
    `"${r.formattedDate}"`,
    `"${r.formattedTime}"`,
    `"${r.operatorName}"`,
    `"${r.stationId}"`,
    `"${r.personnel.nombres}"`,
    `"${r.personnel.apellidos}"`,
    `"${r.personnel.grado}"`,
    r.personnel.edad,
    `"${r.personnel.reparto}"`,
    `"${r.personnel.escuadron}"`,
    r.vitalSigns?.sistolica || 120,
    r.vitalSigns?.diastolica || 80,
    `"${r.vitalSigns?.bpStatus || 'NORMAL'}"`,
    r.vitalSigns?.frecuenciaCardiaca || 72,
    `"${r.vitalSigns?.hrStatus || 'NORMAL'}"`,
    `"${r.imSafe.illness}"`,
    `"${r.imSafe.medication}"`,
    `"${r.imSafe.stress}"`,
    `"${r.imSafe.alcohol}"`,
    `"${r.imSafe.fatigue}"`,
    `"${r.imSafe.emotionEating}"`,
    `"${r.imSafe.overallStatus}"`,
    r.reaction.avgMs,
    r.reaction.minMs,
    r.reaction.maxMs,
    r.reaction.medianMs,
    r.reaction.correctCount,
    r.reaction.anticipatedCount,
    `"${(r.observationsList || []).join('; ')}"`,
    `"${r.finalResult}"`,
    `"${r.cloudSyncStatus}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `VueloSeguro_Chequeos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportRecordsToJSON(records: PreFlightCheckupRecord[]) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `VueloSeguro_CloudBackup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
