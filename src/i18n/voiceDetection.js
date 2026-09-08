/**
 * src/i18n/voiceDetection.js
 * 
 * Native Web Speech API Voice Detector & Matcher
 * Inspects `window.speechSynthesis.getVoices()` for real installed voices.
 * NEVER fakes voice support.
 */

import { getLanguageMetadata } from './languages.js'

/**
 * Find the most suitable installed voice for a given language code
 * 
 * @param {string} langCode - Language code (e.g. 'en', 'hi', 'as', 'bn', etc.)
 * @returns {{ hasVoice: boolean, voice: SpeechSynthesisVoice | null, notice: string }}
 */
export function detectLanguageVoice(langCode) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return {
      hasVoice: false,
      available: false,
      voice: null,
      notice: 'Speech synthesis is not supported in this browser.',
    }
  }

  const meta = getLanguageMetadata(langCode)
  const targetBcp47List = meta.bcp47 || [langCode]

  try {
    const voices = window.speechSynthesis.getVoices()
    if (!Array.isArray(voices) || voices.length === 0) {
      return {
        hasVoice: false,
        voice: null,
        notice: `Voice is not available for ${meta.name} on this device.`,
      }
    }

    // Attempt exact match on BCP-47 tags
    let matchedVoice = null
    for (const tag of targetBcp47List) {
      const lowerTag = tag.toLowerCase()
      matchedVoice = voices.find(v => {
        const vLang = (v.lang || '').toLowerCase()
        return vLang === lowerTag || vLang.startsWith(`${lowerTag}-`) || vLang.startsWith(`${lowerTag}_`)
      })
      if (matchedVoice) break
    }

    // Also check voice name for language mention if lang tag was generic
    if (!matchedVoice) {
      const langNameLower = meta.name.toLowerCase()
      matchedVoice = voices.find(v => (v.name || '').toLowerCase().includes(langNameLower))
    }

    if (matchedVoice) {
      return {
        hasVoice: true,
        available: true,
        voice: matchedVoice,
        notice: `Voice assistance is active in ${meta.nativeName}.`,
      }
    }

    return {
      hasVoice: false,
      available: false,
      voice: null,
      notice: `Voice is not available for ${meta.name} on this device.`,
    }
  } catch (err) {
    return {
      hasVoice: false,
      available: false,
      voice: null,
      notice: `Voice is not available for ${meta.name} on this device.`,
    }
  }
}

/**
 * Speak text in the target language if a matching voice exists, or gracefully notify.
 *
 * @param {string} text
 * @param {string} langCode
 * @param {object} options - { rate: 0.85, onStart, onEnd, onError }
 * @returns {{ spoken: boolean, reason?: string }}
 */
export function speakInLanguage(text, langCode, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { spoken: false, reason: 'unsupported' }
  }

  const { hasVoice, voice, notice } = detectLanguageVoice(langCode)
  if (!hasVoice || !voice) {
    if (typeof options.onError === 'function') {
      options.onError(new Error(notice))
    }
    return { spoken: false, reason: 'no_voice_for_language', notice }
  }

  try {
    window.speechSynthesis.cancel()
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = voice.lang || getLanguageMetadata(langCode).bcp47[0]
    utterance.rate = options.rate || 0.85 // Dementia-friendly slow, gentle cadence
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume || 1.0

    if (options.onStart) utterance.onstart = options.onStart
    if (options.onEnd) utterance.onend = options.onEnd
    if (options.onError) utterance.onerror = options.onError

    window.speechSynthesis.speak(utterance)
    return { spoken: true }
  } catch (err) {
    return { spoken: false, reason: err.message }
  }
}
