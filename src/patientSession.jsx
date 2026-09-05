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

/* -- Session shape & defaults ----------------------------------------------- */

/**
 * DEFAULT_SESSION defines every field a real patient profile will contain.
 *
 * All fields are null or false - the dashboard renders correctly with these
 * values and degrades gracefully in every component.
 *
 * Security note: Do NOT store sensitive medical data (diagnoses, medications,
 * test results) in this object, even in the future. This session lives in
 * React state (client memory only) and is not persisted anywhere.
 */
export const DEFAULT_SESSION = Object.freeze({

  // -- Identity ---------------------------------------------------------------
  // Set by a real auth / profile system when one is integrated.
  patientId:   null, // string | null  - unique patient identifier
  displayName: null, // string | null  - first name used in greeting

  // -- Localisation -----------------------------------------------------------
  // Defaults to English. Expand with Hindi and North-Eastern language codes.
  preferredLanguage: 'en', // 'en' | 'hi' | future ISO 639-1 codes

  // -- Accessibility overrides ------------------------------------------------
  // These supplement OS-level settings (e.g. prefers-reduced-motion).
  // Stored per-patient once a real profile backend exists.
  accessibilitySettings: Object.freeze({
    largeText:     false, // future: bump base font size beyond CSS defaults
    highContrast:  false, // future: switch to high-contrast colour tokens
    reducedMotion: false, // future: force reduced motion regardless of OS
    screenReader:  false, // future: enable extra AT-friendly live regions
  }),

  // -- Prototype metadata -----------------------------------------------------
  isAuthenticated:  false, // Always false in prototype - do not set to true here
  sessionCreatedAt: null,  // Date | null - populated when a real session starts

})

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
 *
 * Props:
 *   children        - patient view components to render
 *   initialSession  - optional partial session merged over DEFAULT_SESSION.
 *                     Pass a real profile here when auth is implemented.
 *                     Defaults to {} (prototype / no-profile mode).
 *
 * Prototype usage (current):
 *   <PatientSessionProvider>
 *     <PatientDashboard ... />
 *   </PatientSessionProvider>
 *
 * Future usage (real profile after login):
 *   <PatientSessionProvider
 *     initialSession={{
 *       patientId:         'p-abc-123',
 *       displayName:       'Asha',
 *       preferredLanguage: 'hi',
 *       accessibilitySettings: { largeText: true },
 *       isAuthenticated:   true,
 *       sessionCreatedAt:  new Date(),
 *     }}
 *   >
 *     <PatientDashboard ... />
 *   </PatientSessionProvider>
 */
export function PatientSessionProvider({ children, initialSession = {} }) {
  const [session, setSession] = useState(() => ({
    ...DEFAULT_SESSION,
    ...initialSession,
    // Deep-merge accessibilitySettings so both default and override keys
    // are always present, even when only some overrides are supplied.
    accessibilitySettings: {
      ...DEFAULT_SESSION.accessibilitySettings,
      ...(initialSession.accessibilitySettings ?? {}),
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
