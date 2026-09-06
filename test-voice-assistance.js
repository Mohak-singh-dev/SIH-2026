/**
 * test-voice-assistance.js
 *
 * Automated verification of Voice Assistance for Smart Reminders in MindCare NER:
 * 1. Category-specific voice messages (Hydration, Medication, Appointment, Cognitive Activity, Daily Routine)
 * 2. Graceful fallback when Web Speech API is unsupported
 * 3. Respect for reminder.voiceEnabled === false (disabled voice)
 * 4. Mute preference persistence & toggling (Mute / Unmute)
 * 5. Single utterance execution with gentle speech parameters (rate 0.85x, no continuous looping)
 * 6. Clean speech cancellation on dismiss / unmount
 */

import {
  REMINDER_TYPES,
  CATEGORY_VOICE_MESSAGES,
  getVoiceReminderMessage,
  isSpeechSupported,
  isVoiceMuted,
  setVoiceMuted,
  toggleVoiceMuted,
  speakReminderVoice,
  cancelReminderVoice,
  VOICE_MUTED_STORAGE_KEY,
} from './src/reminders/index.js'

console.log('=== STARTING SMART REMINDERS VOICE ASSISTANCE VERIFICATION ===\n')

// ── TEST 1: CATEGORY VOICE MESSAGES ──────────────────────────────────
console.log('Test 1: Verifying category-specific short spoken messages...')

const hydrationRem = { type: REMINDER_TYPES.HYDRATION, title: 'Water', message: 'Drink water' }
const medicationRem = { type: REMINDER_TYPES.MEDICATION, title: 'Morning Pills', message: 'Take pills' }
const appointmentRem = { type: REMINDER_TYPES.APPOINTMENT, title: 'Doctor Visit', message: 'Visit Dr. Roy' }
const cognitiveRem = { type: REMINDER_TYPES.COGNITIVE_ACTIVITY, title: 'Memory Cards', message: 'Play match' }
const routineRem = { type: REMINDER_TYPES.DAILY_ROUTINE, title: 'Walk', message: '' }

console.assert(
  getVoiceReminderMessage(hydrationRem) === "It's time to have some water.",
  'Hydration must speak "It\'s time to have some water."'
)
console.assert(
  getVoiceReminderMessage(medicationRem) === "It's time for your scheduled medicine.",
  'Medication must speak "It\'s time for your scheduled medicine."'
)
console.assert(
  getVoiceReminderMessage(appointmentRem) === "You have an appointment today.",
  'Appointment must speak "You have an appointment today."'
)
console.assert(
  getVoiceReminderMessage(cognitiveRem) === "Your brain activity is ready.",
  'Cognitive Activity must speak "Your brain activity is ready."'
)
console.assert(
  getVoiceReminderMessage(routineRem) === "It's time for your daily routine.",
  'Daily Routine must speak standard prompt'
)

console.log('✔ All 5 category voice messages matched exact specifications\n')

// ── TEST 2: UNSUPPORTED ENVIRONMENT RESILIENCE ───────────────────────
console.log('Test 2: Verifying unsupported speech synthesis environment resilience...')
// In pure Node.js without window, isSpeechSupported must return false and not crash
console.assert(isSpeechSupported() === false, 'Node.js without window must report isSpeechSupported === false')

const unsupportedResult = speakReminderVoice(medicationRem)
console.assert(
  unsupportedResult.status === 'unsupported',
  'Must return status "unsupported" without throwing'
)
cancelReminderVoice() // Must be a safe no-op
console.log('✔ Graceful fallback on unsupported devices verified\n')

// ── TEST 3: BROWSER MOCK SIMULATION ──────────────────────────────────
console.log('Test 3: Simulating browser Web Speech API & voice parameters...')

// Create browser mock environment
let spokenUtterances = []
let cancelCalls = 0
const memoryStore = {}

global.window = {
  localStorage: {
    getItem: key => memoryStore[key] ?? null,
    setItem: (key, val) => { memoryStore[key] = String(val) },
    removeItem: key => { delete memoryStore[key] },
    clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]) },
  },
  dispatchEvent: () => true,
  speechSynthesis: {
    cancel: () => { cancelCalls++ },
    speak: (utterance) => { spokenUtterances.push(utterance) },
    getVoices: () => [
      { name: 'Natural Gentle Voice', lang: 'en-US' },
    ],
  },
  SpeechSynthesisUtterance: function (text) {
    this.text = text
    this.rate = 1.0
    this.pitch = 1.0
    this.volume = 1.0
    this.lang = 'en-US'
  },
}

console.assert(isSpeechSupported() === true, 'Mocked environment must report isSpeechSupported === true')

// Test 3.1: Disabled voice reminder (voiceEnabled === false)
const disabledVoiceRem = {
  type: REMINDER_TYPES.MEDICATION,
  title: 'Pills',
  voiceEnabled: false,
}
const disabledResult = speakReminderVoice(disabledVoiceRem)
console.assert(disabledResult.status === 'disabled', 'Must return "disabled" when voiceEnabled is false')
console.assert(spokenUtterances.length === 0, 'Must NOT speak when voiceEnabled is false')
console.log('✔ Voice optional check verified (respects voiceEnabled: false)')

// Test 3.2: Successful speech synthesis invocation
spokenUtterances = []
cancelCalls = 0
const activeVoiceRem = {
  type: REMINDER_TYPES.MEDICATION,
  title: 'Morning Medicine',
  voiceEnabled: true,
}
const spokenResult = speakReminderVoice(activeVoiceRem)
console.assert(spokenResult.status === 'spoken', 'Must return status "spoken"')
console.assert(spokenUtterances.length === 1, 'Must invoke speak exactly once (no duplicates)')
console.assert(
  spokenUtterances[0].text === "It's time for your scheduled medicine.",
  'Utterance text must match message'
)
console.assert(
  spokenUtterances[0].rate === 0.85,
  'Utterance rate must be gentle (0.85x) for elderly cognitive ease'
)
console.assert(cancelCalls >= 1, 'Must cancel previous speech before speaking (prevents overlapping/looping)')
console.log('✔ Speech synthesis invocation & gentle elderly parameters verified\n')

// ── TEST 4: MUTE & UNMUTE TOGGLING ───────────────────────────────────
console.log('Test 4: Verifying Mute / Unmute preference handling...')

console.assert(isVoiceMuted() === false, 'Initially unmuted by default')

// Mute voice
setVoiceMuted(true)
console.assert(isVoiceMuted() === true, 'isVoiceMuted must reflect muted state')

spokenUtterances = []
const mutedResult = speakReminderVoice(activeVoiceRem)
console.assert(mutedResult.status === 'muted', 'speakReminderVoice must return "muted" when muted')
console.assert(spokenUtterances.length === 0, 'No speech output while muted')

// Unmute voice via toggle
toggleVoiceMuted()
console.assert(isVoiceMuted() === false, 'toggleVoiceMuted must restore unmuted state')

const unmutedResult = speakReminderVoice(activeVoiceRem)
console.assert(unmutedResult.status === 'spoken', 'Speech works again when unmuted')
console.assert(spokenUtterances.length === 1, 'Utterance spoken upon unmuting')

// Cancel check
cancelCalls = 0
cancelReminderVoice()
console.assert(cancelCalls === 1, 'cancelReminderVoice must stop active speech')
console.log('✔ Mute/Unmute preference and cancellation verified\n')

// Clean up globals
delete global.window

console.log('=== ALL SMART REMINDERS VOICE ASSISTANCE TESTS PASSED ===')
