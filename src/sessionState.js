/**
 * src/sessionState.js
 *
 * MindCare NER — Patient Authentication & Session State Architecture
 *
 * This module separates two distinct concepts:
 * 1. Device Setup State: Has patient first-time setup/login completed on this device?
 * 2. Active Session State: Is there an active patient session currently running?
 *
 * DATA PRIVACY GUARANTEE:
 * Neither the persistent device record nor the in-memory active session stores:
 * - passwords
 * - medical diagnoses
 * - MMSE results
 * - sensitive health data
 *
 * PREPARED FOR BACKEND AUTHENTICATION:
 * This lightweight frontend architecture is designed to be replaced by a secure
 * backend authentication service (Node.js/Express with HTTPS, session cookies, JWT).
 * Key integration points are flagged with TODO comments below.
 */

/* ── Concept 2: Active Session Schema ──────────────────────────────── */

/**
 * DEFAULT_SESSION defines the non-sensitive presentation shape of an active session.
 */
export const DEFAULT_SESSION = Object.freeze({
  // Non-sensitive identity (used in UI greeting & activity tracking)
  patientId:   null, // string | null (e.g. 'MC-2048')
  displayName: null, // string | null (e.g. 'Ramesh')

  // Localisation
  preferredLanguage: 'en', // 'en' | 'hi' | future ISO codes

  // Accessibility overrides
  accessibilitySettings: Object.freeze({
    largeText:     false,
    highContrast:  false,
    reducedMotion: false,
    screenReader:  false,
  }),

  // Concept 1 status: Was setup completed on this device?
  deviceSetupCompleted: false,

  // Concept 2 status: Is this session currently active?
  isSessionActive: false,
  isAuthenticated: false,

  // Session lifecycle timestamps
  sessionStartedAt: null, // ISO string when active session started
  sessionCreatedAt: null, // Compatibility Date
})

/* ── Concept 1: Device Setup State Persistence ───────────────────────
 * Remembers that this physical device/browser has completed first-time setup.
 * Stores ONLY minimal, non-sensitive identity metadata for device recognition.
 *
 * TODO: In production, replace localStorage device pairing with secure
 * backend device enrollment (e.g. POST /api/v1/devices/enroll with device fingerprint,
 * WebAuthn / Passkeys, or mTLS client certificates).
 */
export const DEVICE_SETUP_STORAGE_KEY = 'mindcare-patient-device-setup'

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage
  }
  return null
}

/**
 * Checks whether patient setup/login has already completed on this device/browser.
 *
 * @returns {boolean} true if this device has completed setup
 */
export function isPatientDeviceSetupComplete() {
  try {
    const storage = getStorage()
    if (!storage) return false
    const raw = storage.getItem(DEVICE_SETUP_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.deviceSetupComplete === true) {
      return true
    }
    // Corrupted record: clean up gracefully without exposing technical error
    storage.removeItem(DEVICE_SETUP_STORAGE_KEY)
    return false
  } catch {
    try {
      getStorage()?.removeItem(DEVICE_SETUP_STORAGE_KEY)
    } catch {}
    return false
  }
}

/**
 * Retrieves the device setup profile stored on this device.
 * Contains only non-sensitive identity metadata (e.g. patientId, displayName).
 * Gracefully handles invalid/corrupted storage.
 *
 * @returns {{ deviceSetupComplete: boolean, patientId: string, displayName: string, preferredLanguage: string } | null}
 */
export function getDeviceSetupProfile() {
  try {
    const storage = getStorage()
    if (!storage) return null
    const raw = storage.getItem(DEVICE_SETUP_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.deviceSetupComplete === true) {
      return {
        deviceSetupComplete: true,
        patientId: typeof parsed.patientId === 'string' && parsed.patientId.trim() ? parsed.patientId : 'MC-2048',
        displayName: typeof parsed.displayName === 'string' && parsed.displayName.trim() ? parsed.displayName : 'Ramesh',
        preferredLanguage: typeof parsed.preferredLanguage === 'string' && parsed.preferredLanguage.trim() ? parsed.preferredLanguage : 'en',
        setupCompletedAt: typeof parsed.setupCompletedAt === 'string' ? parsed.setupCompletedAt : new Date().toISOString(),
      }
    }
    // Corrupted/malformed data: remove safely
    storage.removeItem(DEVICE_SETUP_STORAGE_KEY)
    return null
  } catch {
    try {
      getStorage()?.removeItem(DEVICE_SETUP_STORAGE_KEY)
    } catch {}
    return null
  }
}

/**
 * Marks device setup as complete and persists minimal non-sensitive profile.
 * Strictly avoids storing passwords, medical diagnoses, MMSE scores, or health data.
 *
 * TODO: In production, enroll this device with the backend identity provider:
 * POST /api/v1/patient/devices/register
 *
 * @param {object} profile - { patientId, displayName, preferredLanguage }
 * @returns {object} The saved non-sensitive device profile record
 */
export function saveDeviceSetup(profile) {
  const safeProfile = profile && typeof profile === 'object' ? profile : {}
  const record = {
    deviceSetupComplete: true,
    patientId: typeof safeProfile.patientId === 'string' && safeProfile.patientId.trim() ? safeProfile.patientId : 'MC-2048',
    displayName: typeof safeProfile.displayName === 'string' && safeProfile.displayName.trim() ? safeProfile.displayName : 'Ramesh',
    preferredLanguage: typeof safeProfile.preferredLanguage === 'string' && safeProfile.preferredLanguage.trim() ? safeProfile.preferredLanguage : 'en',
    setupCompletedAt: new Date().toISOString(),
  }
  try {
    const storage = getStorage()
    if (storage) {
      storage.setItem(DEVICE_SETUP_STORAGE_KEY, JSON.stringify(record))
    }
  } catch (err) {
    // Fail silently without exposing technical errors
  }
  return record
}

/**
 * Clears the device setup state (for testing, de-provisioning, or future device unlinking).
 */
export function clearDeviceSetup() {
  try {
    const storage = getStorage()
    if (storage) {
      storage.removeItem(DEVICE_SETUP_STORAGE_KEY)
    }
  } catch {
    // Ignore in non-browser environments
  }
}

/* ── Concept 2: Active Session Lifecycle Architecture ────────────────
 * Manages the in-memory and per-tab active patient session state.
 *
 * Distinguishes between:
 * 1. Persistent device setup (Concept 1 in localStorage - survives logout & browser restarts)
 * 2. Active session state (Concept 2 in sessionStorage & React memory - cleared upon logout)
 *
 * TODO: In production, replace client-side session creation with
 * backend authentication token exchange (e.g. HttpOnly secure session cookies
 * or signed JWT) and validate against GET /api/v1/patient/session.
 */
export const ACTIVE_SESSION_STORAGE_KEY = 'mindcare-patient-active-session'

function getSessionStorage() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage
  }
  if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
    return globalThis.sessionStorage
  }
  return null
}

/**
 * Checks if a patient session is currently active in this browser tab.
 *
 * @returns {boolean} true if an active session exists
 */
export function isPatientSessionActive() {
  try {
    const storage = getSessionStorage()
    if (!storage) return false
    const raw = storage.getItem(ACTIVE_SESSION_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.isSessionActive === true) {
      return true
    }
    // Invalid structure: clean up corrupted session
    storage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    return false
  } catch {
    try {
      getSessionStorage()?.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    } catch {}
    return false
  }
}

/**
 * Persists the active session state for the current tab to survive browser refreshes.
 * Stores strictly non-sensitive identity metadata and the current patient view.
 * Never stores passwords or medical health data.
 *
 * @param {object} session
 * @param {string} [currentView='patient-dashboard']
 * @returns {object} The active session record
 */
export function saveActivePatientSession(session, currentView = 'patient-dashboard') {
  if (!session) return null
  const safeSession = session && typeof session === 'object' ? session : {}
  const record = {
    isSessionActive: true,
    patientId: typeof safeSession.patientId === 'string' && safeSession.patientId ? safeSession.patientId : 'MC-2048',
    displayName: typeof safeSession.displayName === 'string' && safeSession.displayName ? safeSession.displayName : 'Ramesh',
    preferredLanguage: typeof safeSession.preferredLanguage === 'string' && safeSession.preferredLanguage ? safeSession.preferredLanguage : 'en',
    currentView: typeof currentView === 'string' && currentView ? currentView : 'patient-dashboard',
    sessionStartedAt: typeof safeSession.sessionStartedAt === 'string' ? safeSession.sessionStartedAt : new Date().toISOString(),
  }
  try {
    const storage = getSessionStorage()
    if (storage) {
      storage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(record))
    }
  } catch (err) {
    // Fail silently without exposing technical errors
  }
  return record
}

/**
 * Retrieves the persisted current view of the active patient session (e.g. 'patient-dashboard', 'activity:memory-match').
 *
 * @returns {string | null}
 */
export function getActiveSessionView() {
  try {
    const storage = getSessionStorage()
    if (!storage) return null
    const raw = storage.getItem(ACTIVE_SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.isSessionActive === true) {
      return typeof parsed.currentView === 'string' && parsed.currentView ? parsed.currentView : 'patient-dashboard'
    }
    return null
  } catch {
    return null
  }
}

/**
 * Clears the CURRENT active patient session (called on caregiver-authorized logout).
 *
 * IMPORTANT:
 * Strictly preserves the device's "patient setup completed" record (Concept 1) in localStorage.
 * Does NOT delete patient setup configuration.
 * Does NOT delete patient activity history.
 * Does NOT expose credentials.
 */
export function clearActivePatientSession() {
  try {
    const storage = getSessionStorage()
    if (storage) {
      storage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    }
  } catch {
    // Ignore in non-browser environments
  }
}

/**
 * Creates and starts a fresh active session from a verified non-sensitive profile.
 *
 * @param {object} profile - { patientId, displayName, preferredLanguage }
 * @returns {object} Active patient session object conforming to DEFAULT_SESSION
 */
export function createActivePatientSession(profile) {
  // TODO: In production, populate session claims from validated backend token
  const safeProfile = profile && typeof profile === 'object' ? profile : {}
  return {
    ...DEFAULT_SESSION,
    patientId: typeof safeProfile.patientId === 'string' && safeProfile.patientId ? safeProfile.patientId : 'MC-2048',
    displayName: typeof safeProfile.displayName === 'string' && safeProfile.displayName ? safeProfile.displayName : 'Ramesh',
    preferredLanguage: typeof safeProfile.preferredLanguage === 'string' && safeProfile.preferredLanguage ? safeProfile.preferredLanguage : 'en',
    accessibilitySettings: {
      ...DEFAULT_SESSION.accessibilitySettings,
      ...(safeProfile.accessibilitySettings && typeof safeProfile.accessibilitySettings === 'object'
        ? safeProfile.accessibilitySettings
        : {}),
    },
    deviceSetupCompleted: true,
    isSessionActive: true,
    isAuthenticated: true,
    sessionStartedAt: typeof safeProfile.sessionStartedAt === 'string' ? safeProfile.sessionStartedAt : new Date().toISOString(),
    sessionCreatedAt: new Date(),
  }
}

/**
 * Restores/starts an active session for a returning patient if setup has completed on this device.
 * If an active session was already running in this tab, restores that tab's session.
 * Otherwise, creates a fresh active session from the persistent device profile.
 *
 * Gracefully recovers from invalid or corrupted storage without exposing any technical errors.
 *
 * TODO: In production, verify active session token with backend (e.g. GET /api/v1/auth/verify)
 *
 * @returns {object | null} Active session if device setup exists, or null
 */
export function restoreActivePatientSession() {
  const deviceProfile = getDeviceSetupProfile()

  // 1. Try to read active tab session first (e.g. on browser refresh)
  try {
    const sessionStorage = getSessionStorage()
    if (sessionStorage) {
      const raw = sessionStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && parsed.isSessionActive === true) {
          const baseProfile = deviceProfile || {
            patientId: typeof parsed.patientId === 'string' && parsed.patientId ? parsed.patientId : 'MC-2048',
            displayName: typeof parsed.displayName === 'string' && parsed.displayName ? parsed.displayName : 'Ramesh',
            preferredLanguage: typeof parsed.preferredLanguage === 'string' && parsed.preferredLanguage ? parsed.preferredLanguage : 'en',
          }
          return createActivePatientSession({
            ...baseProfile,
            ...parsed,
          })
        } else {
          // Invalid payload: clean up corrupted session quietly
          sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
        }
      }
    }
  } catch {
    try {
      getSessionStorage()?.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    } catch {}
  }

  // 2. Fall back to creating a fresh active session from persistent device setup
  if (deviceProfile && deviceProfile.deviceSetupComplete) {
    return createActivePatientSession(deviceProfile)
  }

  return null
}
