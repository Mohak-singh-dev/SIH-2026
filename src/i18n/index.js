/**
 * src/i18n/index.js
 * 
 * MindCare NER — Offline Multilingual Translation Engine & React Context
 * 100% Bundled & Offline-First across 10 Regional Languages.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE_CODE,
  LANGUAGE_MAP,
  isValidLanguageCode,
  getLanguageMetadata
} from './languages.js'

// Import all 10 translation bundles directly (bundled offline with zero API calls)
import en from './translations/en.json' with { type: 'json' }
import hi from './translations/hi.json' with { type: 'json' }
import as from './translations/as.json' with { type: 'json' }
import bn from './translations/bn.json' with { type: 'json' }
import mni from './translations/mni.json' with { type: 'json' }
import kha from './translations/kha.json' with { type: 'json' }
import lus from './translations/lus.json' with { type: 'json' }
import grt from './translations/grt.json' with { type: 'json' }
import brx from './translations/brx.json' with { type: 'json' }
import trp from './translations/trp.json' with { type: 'json' }

export const TRANSLATION_CATALOG = Object.freeze({
  en,
  hi,
  as,
  bn,
  mni,
  kha,
  lus,
  grt,
  brx,
  trp,
})

export const LANGUAGE_STORAGE_KEY = 'mindcare_preferred_language'

/**
 * Helper to resolve nested key e.g. "games.score" or "sos.callEmergency"
 */
function resolveKey(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current === undefined || current === null) return undefined
    current = current[part]
  }
  return typeof current === 'string' ? current : undefined
}

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  if (typeof localStorage !== 'undefined') return localStorage
  return null
}

/**
 * Retrieve saved language code from localStorage or return default ('en')
 */
export function getSavedLanguageCode() {
  const storage = getStorage()
  if (!storage) return DEFAULT_LANGUAGE_CODE
  try {
    const saved = storage.getItem(LANGUAGE_STORAGE_KEY)
    if (saved && isValidLanguageCode(saved)) {
      return saved.toLowerCase()
    }
  } catch {}
  return DEFAULT_LANGUAGE_CODE
}

/**
 * Persist language code to localStorage
 */
export function saveLanguagePreference(langCode) {
  if (!isValidLanguageCode(langCode)) return false
  const storage = getStorage()
  if (!storage) return false
  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, langCode.toLowerCase())
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = langCode.toLowerCase()
    }
    return true
  } catch {
    return false
  }
}

/**
 * Generate a safe human-readable fallback for missing translation keys.
 * Technical dotted keys (e.g., "patient.todaysProgress") are never rendered.
 */
function createSafeFallback(key, fallback) {
  if (fallback !== undefined && fallback !== null && typeof fallback === 'string' && fallback.trim() !== '') {
    return fallback
  }
  return 'Not available'
}

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE_CODE,
  setLanguage: () => {},
  t: (key, fallback) => createSafeFallback(key, fallback),
  languages: SUPPORTED_LANGUAGES,
  currentLanguage: LANGUAGE_MAP[DEFAULT_LANGUAGE_CODE],
})

export function LanguageProvider({ children, initialLanguage }) {
  const [language, setLanguageState] = useState(() => {
    if (initialLanguage && isValidLanguageCode(initialLanguage)) {
      return initialLanguage.toLowerCase()
    }
    return getSavedLanguageCode()
  })

  const setLanguage = useCallback((code) => {
    if (!isValidLanguageCode(code)) return
    const valid = code.toLowerCase()
    setLanguageState(valid)
    saveLanguagePreference(valid)
  }, [])

  // Sync document lang attribute
  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = language
    }
  }, [language])

  // Translation function t(key, fallback)
  const t = useCallback((key, fallback) => {
    if (!key) return ''
    const currentDict = TRANSLATION_CATALOG[language] || TRANSLATION_CATALOG[DEFAULT_LANGUAGE_CODE]
    const resolved = resolveKey(currentDict, key)
    if (resolved !== undefined) return resolved

    // Fallback to English dictionary if key is missing in active language
    const enResolved = resolveKey(TRANSLATION_CATALOG[DEFAULT_LANGUAGE_CODE], key)
    if (enResolved !== undefined) return enResolved

    // Log missing key in development mode
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn(`[i18n] Missing translation for key: "${key}" in language: "${language}"`)
    }

    return createSafeFallback(key, fallback)
  }, [language])

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,
    currentLanguage: getLanguageMetadata(language),
  }), [language, setLanguage, t])

  return React.createElement(LanguageContext.Provider, { value: contextValue }, children)
}

/**
 * React Hook for using translations in any component
 */
export function useTranslation() {
  return useContext(LanguageContext)
}

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE_CODE,
  LANGUAGE_MAP,
  isValidLanguageCode,
  getLanguageMetadata
}
