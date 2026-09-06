/**
 * src/reminders/voiceReminderService.js
 *
 * MindCare NER — Optional Voice Assistance for Smart Reminders
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Native browser/device Web Speech API: Zero external heavy libraries or cloud API dependencies.
 * 2. Dementia & Elderly UX:
 *    - Short, gentle, calming sentences.
 *    - Unhurried speaking rate (0.85x).
 *    - Spoken ONCE on reminder delivery — never loops or continuously repeats.
 * 3. User & Caregiver Control:
 *    - Optional per reminder (governed by reminder.voiceEnabled).
 *    - Instant Mute/Unmute toggle on the patient reminder dialog.
 *    - Persistent mute preference in localStorage.
 * 4. Resilient Fallbacks:
 *    - Gracefully handles environments without speech synthesis (e.g. Node, legacy devices).
 *    - Catches browser autoplay restrictions silently.
 *    - Visual reminder is always 100% available regardless of speech status.
 */

import { REMINDER_TYPES } from './reminderTypes.js'

export const VOICE_MUTED_STORAGE_KEY = 'mindcare-reminders-voice-muted'

/**
 * Standardized gentle short messages by category as specified:
 * - Hydration: "It's time to have some water."
 * - Medication: "It's time for your scheduled medicine."
 * - Appointment: "You have an appointment today."
 * - Cognitive Activity: "Your brain activity is ready."
 * - Daily Routine: "It's time for your daily routine."
 */
export const CATEGORY_VOICE_MESSAGES = {
  [REMINDER_TYPES.HYDRATION]: "It's time to have some water.",
  [REMINDER_TYPES.MEDICATION]: "It's time for your scheduled medicine.",
  [REMINDER_TYPES.APPOINTMENT]: "You have an appointment today.",
  [REMINDER_TYPES.COGNITIVE_ACTIVITY]: "Your brain activity is ready.",
  [REMINDER_TYPES.DAILY_ROUTINE]: "It's time for your daily routine.",
}

/**
 * Checks whether the browser / device supports Web Speech Synthesis.
 *
 * @returns {boolean}
 */
export function isSpeechSupported() {
  if (typeof window === 'undefined') return false
  return (
    'speechSynthesis' in window &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  )
}

/**
 * Resolves the short spoken message for a reminder.
 * Prioritizes standard dementia-friendly category prompts.
 *
 * @param {Object} reminder
 * @returns {string}
 */
export function getVoiceReminderMessage(reminder) {
  if (!reminder) return ''

  if (reminder.type && CATEGORY_VOICE_MESSAGES[reminder.type]) {
    return CATEGORY_VOICE_MESSAGES[reminder.type]
  }

  // Fallback to title or message
  if (reminder.message && reminder.message.trim().length > 0) {
    return reminder.message.trim()
  }

  if (reminder.title && reminder.title.trim().length > 0) {
    return reminder.title.trim()
  }

  return "It's time for your scheduled reminder."
}

/**
 * Checks if voice is currently muted by user/patient preference.
 *
 * @returns {boolean}
 */
export function isVoiceMuted() {
  if (typeof window === 'undefined' || !window.localStorage) return false
  try {
    return window.localStorage.getItem(VOICE_MUTED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Sets the persistent mute preference for voice assistance.
 *
 * @param {boolean} muted
 * @returns {boolean}
 */
export function setVoiceMuted(muted) {
  const isMuted = Boolean(muted)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(VOICE_MUTED_STORAGE_KEY, String(isMuted))
      // Cancel active speech immediately when muting
      if (isMuted && isSpeechSupported()) {
        window.speechSynthesis.cancel()
      }
      // Broadcast update
      window.dispatchEvent(
        new CustomEvent('mindcare:voice-mute-changed', { detail: { isMuted } })
      )
    } catch {
      // Ignore storage errors
    }
  }
  return isMuted
}

/**
 * Toggles the voice mute preference.
 *
 * @returns {boolean}
 */
export function toggleVoiceMuted() {
  return setVoiceMuted(!isVoiceMuted())
}

/**
 * Cancels any active or pending speech synthesis output safely.
 */
export function cancelReminderVoice() {
  if (!isSpeechSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    // Graceful no-op
  }
}

/**
 * Speaks the gentle reminder prompt using the device's Web Speech API.
 *
 * Guarantees:
 * - Checks voiceEnabled flag (skips if false).
 * - Checks mute state (skips unless force === true).
 * - Calming, gentle pitch and unhurried rate (0.85x).
 * - Never repeatedly speaks or loops.
 * - Handles browser autoplay restrictions silently.
 *
 * @param {Object} reminder
 * @param {Object} [options]
 * @param {boolean} [options.force=false] If true, bypasses mute check (e.g. user manually tapped 'Listen')
 * @param {Function} [options.onStart]
 * @param {Function} [options.onEnd]
 * @param {Function} [options.onError]
 * @returns {{ status: 'spoken'|'disabled'|'muted'|'unsupported'|'empty', message?: string }}
 */
export function speakReminderVoice(reminder, options = {}) {
  if (!reminder) return { status: 'empty' }

  // 1. Check if reminder has voice enabled
  if (reminder.voiceEnabled === false) {
    return { status: 'disabled' }
  }

  // 2. Check if voice assistance is supported
  if (!isSpeechSupported()) {
    return { status: 'unsupported' }
  }

  // 3. Check if muted
  if (isVoiceMuted() && !options.force) {
    return { status: 'muted' }
  }

  const textToSpeak = getVoiceReminderMessage(reminder)
  if (!textToSpeak) return { status: 'empty' }

  try {
    // Cancel any previous speech to avoid overlapping
    window.speechSynthesis.cancel()

    const UtteranceConstructor = window.SpeechSynthesisUtterance || SpeechSynthesisUtterance
    const utterance = new UtteranceConstructor(textToSpeak)

    // Dementia-friendly speech parameters:
    // Slower pace (0.85x) to aid cognitive processing and reduce anxiety
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 0.95
    utterance.lang = 'en-US'

    // Choose gentle, clear voice if available
    try {
      const voices = window.speechSynthesis.getVoices()
      if (Array.isArray(voices) && voices.length > 0) {
        // Prefer pleasant natural English voice
        const preferred = voices.find(
          v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Jenny'))
        ) || voices.find(v => v.lang.startsWith('en'))
        if (preferred) {
          utterance.voice = preferred
        }
      }
    } catch {}

    if (typeof options.onStart === 'function') {
      utterance.onstart = options.onStart
    }

    if (typeof options.onEnd === 'function') {
      utterance.onend = options.onEnd
    }

    utterance.onerror = (e) => {
      // Browser autoplay policy or canceled speech
      if (typeof options.onError === 'function') {
        options.onError(e)
      }
    }

    window.speechSynthesis.speak(utterance)
    return { status: 'spoken', message: textToSpeak }
  } catch (err) {
    // Autoplay restrictions or unsupported device error
    if (typeof options.onError === 'function') {
      options.onError(err)
    }
    return { status: 'unsupported' }
  }
}
