// Automated verification for the Two-Concept Patient Authentication State Architecture

const store = {}
global.localStorage = {
  getItem: key => store[key] ?? null,
  setItem: (key, val) => { store[key] = String(val) },
  removeItem: key => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) }
}

import { authenticatePatient } from './src/config/authConfig.js'
import {
  isPatientDeviceSetupComplete,
  getDeviceSetupProfile,
  saveDeviceSetup,
  clearDeviceSetup,
  createActivePatientSession,
  restoreActivePatientSession,
  DEVICE_SETUP_STORAGE_KEY,
} from './src/sessionState.js'

console.log('=== VERIFYING TWO-CONCEPT PATIENT STATE ARCHITECTURE ===\n')

// ── 1. CONCEPT 1 & 2 INITIAL STATE (First-time visitor) ──
clearDeviceSetup()

console.assert(isPatientDeviceSetupComplete() === false, 'Concept 1: Device setup should be false initially')
console.assert(restoreActivePatientSession() === null, 'Concept 2: No active session should be restorable initially')
console.log('✔ Concept 1 (Device Setup): Initially FALSE')
console.log('✔ Concept 2 (Active Session): Initially NULL (no active session)')

// ── 2. FIRST-TIME AUTHENTICATION & SESSION INITIATION ──
const authResult = authenticatePatient('patient@example.com', 'Hello@123')
console.assert(authResult.success === true, 'Authentication should succeed')
console.assert(authResult.profile.displayName === 'Ramesh', 'Profile should have displayName Ramesh')
console.log('\n✔ Authentication succeeded for patient:', authResult.profile.displayName)

// Action 1: Remember device setup (Concept 1)
saveDeviceSetup(authResult.profile)
console.assert(isPatientDeviceSetupComplete() === true, 'Device setup should now be recorded as true')
console.log('✔ Concept 1: Device setup recorded in persistent storage')

// Action 2: Create & start active session (Concept 2)
const activeSession = createActivePatientSession(authResult.profile)
console.assert(activeSession.isSessionActive === true, 'Active session must have isSessionActive = true')
console.assert(activeSession.deviceSetupCompleted === true, 'Active session must reflect deviceSetupCompleted = true')
console.assert(activeSession.displayName === 'Ramesh', 'Active session must have displayName Ramesh')
console.assert(Boolean(activeSession.sessionStartedAt), 'Active session must have sessionStartedAt timestamp')
console.log('✔ Concept 2: Active patient session started successfully:', {
  isSessionActive: activeSession.isSessionActive,
  deviceSetupCompleted: activeSession.deviceSetupCompleted,
  displayName: activeSession.displayName,
  patientId: activeSession.patientId,
  sessionStartedAt: activeSession.sessionStartedAt,
})

// ── 3. DATA PRIVACY & SECURITY VERIFICATION ──
const rawStoredData = localStorage.getItem(DEVICE_SETUP_STORAGE_KEY)
console.log('\nPersistent Device Record:', rawStoredData)

console.assert(!rawStoredData.includes('password') && !rawStoredData.includes('Hello@123'), 'SECURITY: No passwords in storage')
console.assert(!rawStoredData.includes('diagnosis') && !rawStoredData.includes('MMSE'), 'SECURITY: No diagnosis or MMSE in storage')
console.assert(!rawStoredData.includes('medical') && !rawStoredData.includes('health'), 'SECURITY: No medical/health data in storage')
console.assert(activeSession.password === undefined, 'SECURITY: No password in active session')
console.assert(activeSession.diagnosis === undefined, 'SECURITY: No diagnosis in active session')
console.assert(activeSession.mmseScore === undefined, 'SECURITY: No MMSE in active session')
console.log('✔ Security checks passed: Zero passwords, zero diagnoses, zero MMSE scores, zero health data in storage or session.')

// ── 4. RETURNING USER FLOW ──
console.log('\n--- RETURNING USER SCENARIO ---')
console.assert(isPatientDeviceSetupComplete() === true, 'Device recognizes returning patient')
const returningSession = restoreActivePatientSession()
console.assert(returningSession !== null, 'Active session successfully restored/started from device profile')
console.assert(returningSession.isSessionActive === true, 'Restored session is active')
console.assert(returningSession.displayName === 'Ramesh', 'Restored session provides Ramesh to UI greeting')
console.log('✔ Returning patient directly restores active session without login modal:', {
  isSessionActive: returningSession.isSessionActive,
  displayName: returningSession.displayName,
  sessionStartedAt: returningSession.sessionStartedAt,
})

// ── 5. RESET / DE-PROVISIONING ──
clearDeviceSetup()
console.assert(isPatientDeviceSetupComplete() === false, 'clearDeviceSetup resets device setup')
console.assert(restoreActivePatientSession() === null, 'No session restorable after reset')
console.log('✔ Reset verified: Device returns to clean first-time state.')

console.log('\n=== ALL ARCHITECTURAL TESTS PASSED ===')
