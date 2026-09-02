import React, { useState } from 'react';
import { 
  MilitaryPersonnel, 
  VitalSigns,
  ImSafeEvaluation, 
  ReactionMetrics, 
  PreFlightCheckupRecord, 
  SystemConfig, 
  AssessmentStatus 
} from './types';
import { getConfig, saveConfig, getRecords, saveRecord, generateNextId, syncRecordsWithCloud } from './services/storageService';
import { Header } from './components/Header';
import { MainDashboard } from './components/MainDashboard';
import { RegistrationStep } from './components/RegistrationStep';
import { VitalSignsStep } from './components/VitalSignsStep';
import { ImSafeStep } from './components/ImSafeStep';
import { ReflexStep } from './components/ReflexStep';
import { ResultStep } from './components/ResultStep';
import { AdminPortal } from './components/AdminPortal';
import { AdminPinModal } from './components/AdminPinModal';
import { soundFX } from './services/soundService';

export const App: React.FC = () => {
  // Navigation State: 'DASHBOARD' | 'STEP1' | 'STEP2' | 'STEP3' | 'STEP4' | 'STEP5' | 'ADMIN_PORTAL'
  const [view, setView] = useState<'DASHBOARD' | 'STEP1' | 'STEP2' | 'STEP3' | 'STEP4' | 'STEP5' | 'ADMIN_PORTAL'>('DASHBOARD');

  // Restricted Admin Portal unlock state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState<boolean>(false);

  // Persistence States
  const [config, setConfigState] = useState<SystemConfig>(getConfig());
  const [records, setRecordsState] = useState<PreFlightCheckupRecord[]>(getRecords());

  // Current Active Checkup Draft
  const [draftPersonnel, setDraftPersonnel] = useState<MilitaryPersonnel | null>(null);
  const [draftVitalSigns, setDraftVitalSigns] = useState<VitalSigns | null>(null);
  const [draftImSafe, setDraftImSafe] = useState<ImSafeEvaluation | null>(null);
  const [draftReaction, setDraftReaction] = useState<ReactionMetrics | null>(null);
  const [completedRecord, setCompletedRecord] = useState<PreFlightCheckupRecord | null>(null);

  const handleUpdateConfig = (newConfig: SystemConfig) => {
    saveConfig(newConfig);
    setConfigState(newConfig);
  };

  // Step 1: Start New Checkup
  const handleStartNewCheckup = () => {
    soundFX.playTap();
    setDraftPersonnel(null);
    setDraftVitalSigns(null);
    setDraftImSafe(null);
    setDraftReaction(null);
    setCompletedRecord(null);
    setView('STEP1');
  };

  // Step 1 Submit -> Proceed to Vital Signs
  const handleRegistrationSubmit = (personnel: MilitaryPersonnel) => {
    soundFX.playTap();
    setDraftPersonnel(personnel);
    setView('STEP2');
  };

  // Step 2 Submit -> Proceed to IM SAFE
  const handleVitalSignsSubmit = (vitalSigns: VitalSigns) => {
    soundFX.playTap();
    setDraftVitalSigns(vitalSigns);
    setView('STEP3');
  };

  // Step 3 Submit -> Proceed to Reflexes
  const handleImSafeSubmit = (imSafe: ImSafeEvaluation) => {
    soundFX.playTap();
    setDraftImSafe(imSafe);
    setView('STEP4');
  };

  // Step 4 Submit -> Compute Final Fitness Result & Save
  const handleReflexSubmit = (reaction: ReactionMetrics) => {
    setDraftReaction(reaction);

    if (!draftPersonnel || !draftVitalSigns || !draftImSafe) {
      alert('Error en el flujo de datos del chequeo. Reiniciando...');
      setView('DASHBOARD');
      return;
    }

    // REGULA DE APTITUD INSTITUCIONAL:
    // 1. La Aptitud Primaria la dicta SOLAMENTE la prueba IM SAFE.
    // 2. La presión arterial y velocidad de reacción alterada generan OBSERVACIÓN (alerta), NO inhabilitación directa.

    let finalResult: AssessmentStatus = draftImSafe.overallStatus;
    const observationsList: string[] = [];

    // Vital Signs Observations
    if (draftVitalSigns.bpStatus === 'ELEVADA') {
      observationsList.push(`Presión Arterial Elevada (${draftVitalSigns.sistolica}/${draftVitalSigns.diastolica} mmHg)`);
    } else if (draftVitalSigns.bpStatus === 'ALTA') {
      observationsList.push(`Presión Arterial Alta (${draftVitalSigns.sistolica}/${draftVitalSigns.diastolica} mmHg)`);
    }

    if (draftVitalSigns.hrStatus === 'ELEVADA') {
      observationsList.push(`Frecuencia Cardíaca Elevada (${draftVitalSigns.frecuenciaCardiaca} BPM)`);
    }

    // Reaction Time Observations
    if (reaction.evaluationStatus !== 'APTO') {
      observationsList.push(`Tiempo de Reacción Alterado (${reaction.avgMs} ms)`);
    }

    // IM SAFE Notes
    if (draftImSafe.notes) {
      observationsList.push(`IM SAFE: ${draftImSafe.notes}`);
    }

    // If IM SAFE was APTO, but there are vital signs or reaction observations, final status becomes 'OBSERVACION'!
    if (finalResult === 'APTO' && observationsList.length > 0) {
      finalResult = 'OBSERVACION';
    }

    // Random Alcohol Breathalyzer Audit Lottery
    const isRandomAlcoholAudited = config.randomAlcoholAuditEnabled
      ? (Math.random() * 100 < (config.randomAlcoholAuditPercent || 12))
      : false;

    const now = new Date();
    const newRecord: PreFlightCheckupRecord = {
      id: generateNextId(),
      timestamp: now.getTime(),
      formattedDate: now.toLocaleDateString('es-ES'),
      formattedTime: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      operatorName: config.operatorName,
      stationId: config.stationId,
      personnel: draftPersonnel,
      vitalSigns: draftVitalSigns,
      imSafe: draftImSafe,
      reaction,
      finalResult,
      observationsList,
      isRandomAlcoholAudited,
      cloudSyncStatus: config.cloudSyncEnabled ? 'PENDING' : 'SYNCED',
    };

    // Save to Local DB
    saveRecord(newRecord);
    const updatedRecords = getRecords();
    setRecordsState(updatedRecords);
    setCompletedRecord(newRecord);

    // Trigger Cloud Sync Engine simulation in background
    if (config.cloudSyncEnabled) {
      syncRecordsWithCloud().then(() => {
        setRecordsState(getRecords());
      });
    }

    setView('STEP5');
  };

  // Open / Close Admin Lock
  const handleOpenAdminPin = () => {
    if (isAdminUnlocked) {
      // Lock admin portal
      setIsAdminUnlocked(false);
      setView('DASHBOARD');
    } else {
      setIsAdminPinModalOpen(true);
    }
  };

  const handleAdminPinSuccess = () => {
    setIsAdminPinModalOpen(false);
    setIsAdminUnlocked(true);
    setView('ADMIN_PORTAL');
  };

  // Current Step number for Progress Header (1..6)
  const currentStepNum = 
    view === 'STEP1' ? 1 :
    view === 'STEP2' ? 2 :
    view === 'STEP3' ? 3 :
    view === 'STEP4' ? 4 :
    view === 'STEP5' ? 5 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Global POS Header */}
      <Header
        currentStep={currentStepNum}
        config={config}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminPin={handleOpenAdminPin}
        onNavigateHome={() => setView('DASHBOARD')}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {/* PILOT KIOSK MODE (Default Launcher) */}
        {view === 'DASHBOARD' && (
          <MainDashboard
            onStartNewCheckup={handleStartNewCheckup}
            records={records}
            config={config}
          />
        )}

        {view === 'STEP1' && (
          <RegistrationStep
            initialData={draftPersonnel || undefined}
            records={records}
            onSubmit={handleRegistrationSubmit}
            onCancel={() => setView('DASHBOARD')}
          />
        )}

        {view === 'STEP2' && (
          <VitalSignsStep
            initialData={draftVitalSigns || undefined}
            onSubmit={handleVitalSignsSubmit}
            onBack={() => setView('STEP1')}
          />
        )}

        {view === 'STEP3' && (
          <ImSafeStep
            initialData={draftImSafe || undefined}
            onSubmit={handleImSafeSubmit}
            onBack={() => setView('STEP2')}
          />
        )}

        {view === 'STEP4' && (
          <ReflexStep
            config={config}
            onSubmit={handleReflexSubmit}
            onBack={() => setView('STEP3')}
          />
        )}

        {view === 'STEP5' && completedRecord && (
          <ResultStep
            record={completedRecord}
            onNewCheckup={handleStartNewCheckup}
            onGoHome={() => setView('DASHBOARD')}
          />
        )}

        {/* RESTRICTED ADMIN PORTAL MODE */}
        {view === 'ADMIN_PORTAL' && isAdminUnlocked && (
          <AdminPortal
            records={records}
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onLockAdmin={() => {
              setIsAdminUnlocked(false);
              setView('DASHBOARD');
            }}
          />
        )}
      </main>

      {/* PIN Access Unlock Modal */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={handleAdminPinSuccess}
      />

      {/* Kiosk Clean Footer */}
      <footer className="bg-slate-950 border-t border-slate-900/80 py-4 text-center text-xs text-slate-500 font-mono select-none">
        VUELOSEGURO POS 8.8 ✈️ • Estación Kiosko de Piloto • Respaldo Nube Activo ☁️
      </footer>
    </div>
  );
};

export default App;
