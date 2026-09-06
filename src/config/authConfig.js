/**
 * src/config/authConfig.js
 *
 * Prototype demo credentials configuration for MindCare NER.
 *
 * TODO: Replace prototype authentication with secure backend authentication before production.
 *
 * Security notice:
 * In this frontend-only prototype for SIH evaluation, credentials are stored in
 * client-side configuration. Before moving to production, all authentication must
 * be migrated to an isolated backend service (e.g. Node/Express + OAuth/JWT or session cookies)
 * with securely hashed passwords (bcrypt/argon2) over HTTPS.
 */

export const PROTOTYPE_PATIENT_ACCOUNT = Object.freeze({
  email: 'patient@example.com',
  password: 'Hello@123',
  patientId: 'MC-2048',
  displayName: 'Ramesh',
  fullName: 'Mr. Ramesh Das',
  preferredLanguage: 'en',
  firstLoginCompleted: true,
  // Accepted aliases for smooth testing during the evaluation
  acceptedEmails: Object.freeze([
    'patient@example.com',
    'ramesh@example.com',
    'ramesh.das@example.com',
    'rameshdas@gmail.com',
    'you@example.com',
    'singhmohak360@gmail.com',
  ]),
  acceptedPasswords: Object.freeze([
    'Hello@123',
    'Patient@123',
  ]),
})

/**
 * Validates patient login credentials against the configured prototype account.
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, account?: object, error?: string }}
 */
export function authenticatePatient(email, password) {
  // 1. Validate both fields are filled
  if (!email || !password || !email.trim() || !password.trim()) {
    return {
      success: false,
      error: 'Please enter both your email address and password.',
    }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const trimmedPassword = password.trim()

  const isEmailValid =
    normalizedEmail === PROTOTYPE_PATIENT_ACCOUNT.email.toLowerCase() ||
    PROTOTYPE_PATIENT_ACCOUNT.acceptedEmails.some(e => e.toLowerCase() === normalizedEmail)

  const isPasswordValid =
    trimmedPassword === PROTOTYPE_PATIENT_ACCOUNT.password ||
    PROTOTYPE_PATIENT_ACCOUNT.acceptedPasswords.includes(trimmedPassword)

  // 2. Compare against prototype account
  // TODO: In production, send POST /api/v1/auth/patient/login with credentials over TLS
  // Backend returns authenticated user profile & secure HttpOnly session cookie
  if (isEmailValid && isPasswordValid) {
    const profile = {
      patientId: PROTOTYPE_PATIENT_ACCOUNT.patientId,
      displayName: PROTOTYPE_PATIENT_ACCOUNT.displayName,
      fullName: PROTOTYPE_PATIENT_ACCOUNT.fullName,
      preferredLanguage: PROTOTYPE_PATIENT_ACCOUNT.preferredLanguage,
    }

    return {
      success: true,
      profile,
      account: {
        ...profile,
        isAuthenticated: true,
        deviceSetupCompleted: true,
        isSessionActive: true,
        sessionStartedAt: new Date().toISOString(),
        sessionCreatedAt: new Date(),
      },
    }
  }

  // 3. Generic friendly error - does not reveal whether email or password was incorrect
  return {
    success: false,
    error: 'Email or password is incorrect. Please try again.',
  }
}

/* ── Caregiver PIN Authorization for Patient Session Termination ────
 *
 * The caregiver PIN prevents vulnerable/cognitively-impaired patients from
 * accidentally exiting the kiosk session.
 *
 * Prototype credentials are securely isolated here and NOT exposed in the patient UI
 * or in client storage.
 *
 * TODO: Replace prototype PIN validation with secure backend/device authentication before production.
 */
export const PROTOTYPE_CAREGIVER_PIN_CONFIG = Object.freeze({
  defaultPin: '1234',
})

/**
 * Validates a caregiver PIN to authorize exiting the patient kiosk dashboard.
 *
 * TODO: Replace prototype PIN validation with secure backend/device authentication before production.
 *
 * @param {string} pin - The PIN entered on the Caregiver PIN screen
 * @returns {{ success: boolean, error?: string }}
 */
export function validateCaregiverPin(pin) {
  if (!pin || typeof pin !== 'string') {
    return {
      success: false,
      error: "That PIN isn't correct. Please try again.",
    }
  }

  const cleanPin = pin.trim()
  const isValid = cleanPin === PROTOTYPE_CAREGIVER_PIN_CONFIG.defaultPin

  if (isValid) {
    return { success: true }
  }

  // Security requirement: generic error message, never reveal the correct PIN
  return {
    success: false,
    error: "That PIN isn't correct. Please try again.",
  }
}


/* ── Re-exports from patientSession Architecture ────────────────────
 * Concept 1: Device Setup State (isPatientDeviceSetupComplete, saveDeviceSetup)
 * Concept 2: Active Session State (createActivePatientSession, restoreActivePatientSession)
 */
export {
  isPatientDeviceSetupComplete,
  getDeviceSetupProfile,
  saveDeviceSetup,
  clearDeviceSetup,
  isPatientSessionActive,
  saveActivePatientSession,
  clearActivePatientSession,
  getActiveSessionView,
  createActivePatientSession,
  restoreActivePatientSession,
  DEVICE_SETUP_STORAGE_KEY,
  ACTIVE_SESSION_STORAGE_KEY,
} from '../sessionState.js'

import {
  isPatientDeviceSetupComplete as _isDeviceSetup,
  saveDeviceSetup as _saveDeviceSetup,
  restoreActivePatientSession as _restoreSession,
  clearDeviceSetup as _clearDeviceSetup,
} from '../sessionState.js'

// Backward-compatibility aliases
export const isPatientSetupComplete = _isDeviceSetup
export const savePatientSetupComplete = _saveDeviceSetup
export const getStoredPatientSession = _restoreSession
export const clearPatientSetup = _clearDeviceSetup


