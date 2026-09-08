import { neon } from '@neondatabase/serverless';
import type { PreFlightCheckupRecord } from '../types/index.ts';

// Neon Database Connection URL provided by the user
const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_Cu9Mkdbqy8Hs@ep-empty-mouse-aehm9zc8-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(NEON_DATABASE_URL);

/**
 * Initializes the Postgres table in Neon automatically if it does not exist yet.
 */
export async function initNeonTable(): Promise<boolean> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS chequeos_prevuelo (
        id VARCHAR(50) PRIMARY KEY,
        timestamp BIGINT NOT NULL,
        formatted_date VARCHAR(30),
        formatted_time VARCHAR(30),
        nombres VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        grado VARCHAR(50) NOT NULL,
        edad INT NOT NULL,
        reparto VARCHAR(150) NOT NULL,
        escuadron VARCHAR(150) NOT NULL,
        sistolica INT,
        diastolica INT,
        frecuencia_cardiaca INT,
        horas_sueno INT,
        sleep_status VARCHAR(30),
        bp_status VARCHAR(30),
        hr_status VARCHAR(30),
        imsafe_status VARCHAR(20) NOT NULL,
        reflejo_promedio_ms INT NOT NULL,
        reflejo_min_ms INT NOT NULL,
        reflejo_max_ms INT NOT NULL,
        reflejo_mediana_ms INT NOT NULL,
        dictamen_final VARCHAR(30) NOT NULL,
        observaciones TEXT,
        is_random_alcohol_audited BOOLEAN DEFAULT FALSE,
        estacion_id VARCHAR(50),
        operador_nombre VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Try adding newer columns in case table already existed
    try {
      await sql`ALTER TABLE chequeos_prevuelo ADD COLUMN IF NOT EXISTS is_random_alcohol_audited BOOLEAN DEFAULT FALSE;`;
      await sql`ALTER TABLE chequeos_prevuelo ADD COLUMN IF NOT EXISTS horas_sueno INT;`;
      await sql`ALTER TABLE chequeos_prevuelo ADD COLUMN IF NOT EXISTS sleep_status VARCHAR(30);`;
    } catch (e) {}

    console.log('✅ Neon PostgreSQL Table `chequeos_prevuelo` checked/updated successfully.');
    return true;
  } catch (err) {
    console.error('❌ Error initializing Neon table:', err);
    return false;
  }
}

/**
 * Uploads a Pre-Flight Checkup record directly to Neon Cloud Postgres.
 */
export async function uploadRecordToNeon(record: PreFlightCheckupRecord): Promise<boolean> {
  try {
    // Ensure table exists first
    await initNeonTable();

    const obsString = record.observationsList ? record.observationsList.join('; ') : '';

    await sql`
      INSERT INTO chequeos_prevuelo (
        id,
        timestamp,
        formatted_date,
        formatted_time,
        nombres,
        apellidos,
        grado,
        edad,
        reparto,
        escuadron,
        sistolica,
        diastolica,
        frecuencia_cardiaca,
        horas_sueno,
        sleep_status,
        bp_status,
        hr_status,
        imsafe_status,
        reflejo_promedio_ms,
        reflejo_min_ms,
        reflejo_max_ms,
        reflejo_mediana_ms,
        dictamen_final,
        observaciones,
        is_random_alcohol_audited,
        estacion_id,
        operador_nombre
      ) VALUES (
        ${record.id},
        ${record.timestamp},
        ${record.formattedDate},
        ${record.formattedTime},
        ${record.personnel?.nombres || ''},
        ${record.personnel?.apellidos || ''},
        ${record.personnel?.grado || ''},
        ${record.personnel?.edad || 0},
        ${record.personnel?.reparto || ''},
        ${record.personnel?.escuadron || ''},
        ${record.vitalSigns ? record.vitalSigns.sistolica : null},
        ${record.vitalSigns ? record.vitalSigns.diastolica : null},
        ${record.vitalSigns ? record.vitalSigns.frecuenciaCardiaca : null},
        ${record.vitalSigns?.horasSueno ?? null},
        ${record.vitalSigns?.sleepStatus || null},
        ${record.vitalSigns ? record.vitalSigns.bpStatus : 'NORMAL'},
        ${record.vitalSigns ? record.vitalSigns.hrStatus : 'NORMAL'},
        ${record.imSafe?.overallStatus || 'APTO'},
        ${record.reaction?.avgMs || 0},
        ${record.reaction?.minMs || 0},
        ${record.reaction?.maxMs || 0},
        ${record.reaction?.medianMs || 0},
        ${record.finalResult},
        ${obsString},
        ${!!record.isRandomAlcoholAudited},
        ${record.stationId || 'DEA/MEDICINA DE AVIACION'},
        ${record.operatorName || 'MAYOR EDWIN AYALA MEDICO AEROESPACIAL'}
      )
      ON CONFLICT (id) DO UPDATE SET
        dictamen_final = EXCLUDED.dictamen_final,
        observaciones = EXCLUDED.observaciones,
        is_random_alcohol_audited = EXCLUDED.is_random_alcohol_audited,
        horas_sueno = EXCLUDED.horas_sueno,
        sleep_status = EXCLUDED.sleep_status;
    `;
    console.log(`☁️ Record ${record.id} uploaded successfully to Neon Postgres!`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to upload record ${record.id} to Neon Postgres:`, err);
    return false;
  }
}

/**
 * Fetches total count of records stored in Neon Cloud Postgres.
 */
export async function getNeonRecordCount(): Promise<number> {
  try {
    const res = await sql`SELECT COUNT(*) as count FROM chequeos_prevuelo`;
    return Number(res[0]?.count || 0);
  } catch (err) {
    console.error('Error fetching Neon record count:', err);
    return 0;
  }
}
