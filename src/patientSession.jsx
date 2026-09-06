/**
 * patientSession.jsx
 *
 * Lightweight patient session architecture for MindCare NER.
 *
 * Provides a React context-based session layer that defines the shape of a
 * future patient profile today, without requiring authentication or a backend.
 * All fields default to safe null / false values so the Patient Dashboard
 * works perfectly with no real profile.
 *
 * FUTURE EXTENSION:
 *   When a real profile system is added, change only the provider
 *   initialisation (pass an `initialSession` prop with real data).
 *   No consumer changes needed.
 *
 * EXPORTS:
 *   DEFAULT_SESSION        - frozen object with all fields at safe defaults
 *   PatientSessionContext  - raw React context (rarely needed directly)
 *   PatientSessionProvider - provider component that wraps patient views
 *   usePatientSession      - hook returning [session, setSession]
 */

import { createContext, useContext, useState } from 'react'
import {
  DEFAULT_SESSION,
  DEVICE_SETUP_STORAGE_KEY,
  ACTIVE_SESSION_STORAGE_KEY,
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
} from './sessionState.js'

export {
  DEFAULT_SESSION,
  DEVICE_SETUP_STORAGE_KEY,
  ACTIVE_SESSION_STORAGE_KEY,
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
}

/* -- Context ----------------------------------------------------------------- */

/**
 * PatientSessionContext
 *
 * Raw React context. Prefer usePatientSession() in all components.
 * Exported only for rare advanced patterns (Context.Consumer, HOCs, etc.).
 *
 * Default value is null so usePatientSession() can detect a missing provider
 * and throw a clear, actionable error during development.
 */
export const PatientSessionContext = createContext(null)
PatientSessionContext.displayName = 'PatientSessionContext'

/* -- Provider --------------------------------------------------------------- */

/**
 * PatientSessionProvider
 *
 * Wrap all patient-experience views (dashboard + activity pages) in this
 * single provider so the session persists across navigation.
 */
export function PatientSessionProvider({ children, initialSession }) {
  const safeInitial = initialSession && typeof initialSession === 'object' ? initialSession : {}
  const [session, setSession] = useState(() => ({
    ...DEFAULT_SESSION,
    ...safeInitial,
    // Deep-merge accessibilitySettings so both default and override keys
    // are always present, even when only some overrides are supplied.
    accessibilitySettings: {
      ...DEFAULT_SESSION.accessibilitySettings,
      ...(safeInitial.accessibilitySettings && typeof safeInitial.accessibilitySettings === 'object'
        ? safeInitial.accessibilitySettings
        : {}),
    },
  }))

  return (
    <PatientSessionContext.Provider value={[session, setSession]}>
      {children}
    </PatientSessionContext.Provider>
  )
}

/* -- Hook ------------------------------------------------------------------- */

/**
 * usePatientSession()
 *
 * Returns [session, setSession] - the current patient session and an updater.
 *
 * The updater uses a function to safely produce the next session:
 *
 *   const [session, setSession] = usePatientSession()
 *
 *   // Read:
 *   const name = session.displayName ?? 'Guest'
 *
 *   // Write (future - when real profile loads):
 *   setSession(prev => ({ ...prev, displayName: 'Asha' }))
 *
 *   // Write (update a single accessibility setting):
 *   setSession(prev => ({
 *     ...prev,
 *     accessibilitySettings: {
 *       ...prev.accessibilitySettings,
 *       largeText: true,
 *     },
 *   }))
 *
 * Throws a descriptive Error if called outside <PatientSessionProvider>.
 */
export function usePatientSession() {
  const ctx = useContext(PatientSessionContext)

  if (ctx === null) {
    throw new Error(
      '[MindCare] usePatientSession() must be called inside <PatientSessionProvider>.\n' +
      'Ensure all patient-experience views are wrapped in <PatientSessionProvider> in App.jsx.'
    )
  }

  return ctx
}
