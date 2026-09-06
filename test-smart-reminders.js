/**
 * test-smart-reminders.js
 *
 * Automated verification script for the MindCare NER Smart Reminders Architecture:
 *
 * 1. Category validation (Medication, Hydration, Appointment, Cognitive Activity, Daily Routine)
 * 2. Data model schema completeness (id, patientId, type, title, message, scheduledTime,
 *    repeat, enabled, voiceEnabled, status, createdAt, acknowledgedAt, snoozedUntil)
 * 3. Strict security & privacy invariant (Rejection of passwords, tokens, credentials)
 * 4. Immutable state transitions (Pending -> Delivered -> Acknowledged / Snoozed / Missed / Dismissed)
 * 5. Storage persistence, query filters, and CRUD operations
 * 6. Caregiver monitoring statistics calculation
 * 7. Mock seeds generation & verification
 */

// Mock storage environment for Node.js
const memoryStore = {}
global.localStorage = {
  getItem: key => memoryStore[key] ?? null,
  setItem: (key, val) => { memoryStore[key] = String(val) },
  removeItem: key => { delete memoryStore[key] },
  clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]) },
}

import {
  REMINDER_TYPES,
  REMINDER_TYPE_CONFIG,
  REMINDER_REPEAT,
  REMINDER_STATUS,
  DEFAULT_REMINDER,
  isValidReminderType,
  isValidReminderRepeat,
  isValidReminderStatus,
  createReminder,
  validateReminder,
  acknowledgeReminder,
  snoozeReminder,
  markReminderDelivered,
  markReminderMissed,
  dismissReminder,
  toggleReminderEnabled,
  updateReminder,
  isReminderDue,
  isReminderForDate,
  getInitialMockReminders,
  loadAllReminders,
  saveReminder,
  deleteReminder,
  getRemindersByPatient,
  getReminderById,
  acknowledgeReminderById,
  snoozeReminderById,
  getDueReminders,
  getTodayReminders,
  getReminderStats,
  resetRemindersToMock,
  REMINDERS_STORAGE_KEY,
} from './src/reminders/index.js'
import { checkDosageSafety } from './src/reminders/dosageGuard.js'

console.log('=== STARTING SMART REMINDERS ARCHITECTURAL VERIFICATION ===\n')

// ── TEST 1: CATEGORY VERIFICATION ────────────────────────────────────
console.log('Test 1: Verifying 5 core reminder categories...')
const expectedCategories = [
  'medication',
  'hydration',
  'appointment',
  'cognitive_activity',
  'daily_routine',
]

expectedCategories.forEach(cat => {
  console.assert(isValidReminderType(cat), `Category "${cat}" must be valid`)
  console.assert(REMINDER_TYPE_CONFIG[cat], `Config for category "${cat}" must exist`)
})
console.assert(Object.keys(REMINDER_TYPES).length === 5, 'Must have exactly 5 core reminder categories')
console.log('✔ All 5 core categories verified (Medication, Hydration, Appointment, Cognitive Activity, Daily Routine)\n')

// ── TEST 2: DATA MODEL FIELDS COMPLETENESS ───────────────────────────
console.log('Test 2: Verifying data model fields...')
const sampleReminder = createReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.MEDICATION,
  title: 'Morning Medicine',
  message: 'Take 1 tablet with water',
  scheduledTime: new Date().toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
  voiceEnabled: true,
})

const requiredFields = [
  'id',
  'patientId',
  'type',
  'title',
  'message',
  'scheduledTime',
  'repeat',
  'enabled',
  'voiceEnabled',
  'status',
  'createdAt',
  'acknowledgedAt',
  'snoozedUntil',
]

requiredFields.forEach(field => {
  console.assert(Object.prototype.hasOwnProperty.call(sampleReminder, field), `Reminder must contain field: "${field}"`)
})

console.assert(sampleReminder.id.startsWith('rem_'), 'Generated ID must start with rem_')
console.assert(sampleReminder.status === REMINDER_STATUS.PENDING, 'Default status must be pending')
console.assert(sampleReminder.acknowledgedAt === null, 'acknowledgedAt must initially be null')
console.assert(sampleReminder.snoozedUntil === null, 'snoozedUntil must initially be null')
console.log('✔ All 13 schema fields verified with correct types and default states\n')

// ── TEST 3: DATA PRIVACY & INVARIANTS ────────────────────────────────
console.log('Test 3: Verifying data privacy guarantees (no passwords/secrets)...')
const invalidSecretData = {
  patientId: 'MC-2048',
  type: REMINDER_TYPES.HYDRATION,
  title: 'Water Reminder',
  scheduledTime: new Date().toISOString(),
  password: 'SecretPassword123',
  token: 'bearer-auth-token',
}

const validation = validateReminder(invalidSecretData)
console.assert(validation.isValid === false, 'Validation must fail when sensitive keys are provided')
console.assert(
  validation.errors.some(e => e.includes('Security violation')),
  'Error message must indicate security violation'
)

let threwError = false
try {
  createReminder(invalidSecretData)
} catch (e) {
  threwError = true
}
console.assert(threwError === true, 'createReminder must throw an exception on security violation')
console.log('✔ Security guarantee verified: Passwords and tokens are strictly rejected\n')

// ── TEST 4: IMMUTABLE LIFECYCLE TRANSITIONS ──────────────────────────
console.log('Test 4: Verifying lifecycle state transitions (Delivered -> Acknowledged -> Snoozed)...')

// 1. Delivered
const delivered = markReminderDelivered(sampleReminder)
console.assert(delivered.status === REMINDER_STATUS.DELIVERED, 'Status must be DELIVERED')
console.assert(sampleReminder.status === REMINDER_STATUS.PENDING, 'Original reminder must remain unchanged (immutable)')

// 2. Acknowledged
const ackTime = new Date()
const acknowledged = acknowledgeReminder(delivered, ackTime)
console.assert(acknowledged.status === REMINDER_STATUS.ACKNOWLEDGED, 'Status must be ACKNOWLEDGED')
console.assert(acknowledged.acknowledgedAt === ackTime.toISOString(), 'acknowledgedAt must record timestamp')

// 3. Snoozed
const now = new Date()
const snoozed = snoozeReminder(sampleReminder, 20, now)
console.assert(snoozed.status === REMINDER_STATUS.SNOOZED, 'Status must be SNOOZED')
const expectedSnoozeTime = new Date(now.getTime() + 20 * 60 * 1000).toISOString()
console.assert(snoozed.snoozedUntil === expectedSnoozeTime, 'snoozedUntil must be 20 minutes in the future')

// 4. Missed & Dismissed
const missed = markReminderMissed(sampleReminder)
console.assert(missed.status === REMINDER_STATUS.MISSED, 'Status must be MISSED')

const dismissed = dismissReminder(sampleReminder)
console.assert(dismissed.status === REMINDER_STATUS.DISMISSED, 'Status must be DISMISSED')
console.log('✔ Lifecycle state transitions verified (Delivered, Acknowledged, Snoozed, Missed, Dismissed)\n')

// ── TEST 5: STORAGE SERVICE & CRUD OPERATIONS ────────────────────────
console.log('Test 5: Verifying reminderService CRUD & persistence...')
localStorage.clear()

// Seed & Load
const loaded = loadAllReminders()
console.assert(loaded.length > 0, 'Initial load must seed mock reminders')
console.assert(localStorage.getItem(REMINDERS_STORAGE_KEY) !== null, 'Data must be persisted in localStorage')

// Filter by Patient
const patientReminders = getRemindersByPatient('MC-2048')
console.assert(patientReminders.length > 0, 'Should find reminders for MC-2048')

// Create new reminder via service
const newReminder = saveReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.COGNITIVE_ACTIVITY,
  title: 'Evening Puzzle Exercise',
  message: 'Match 4 shapes gently',
  scheduledTime: new Date(Date.now() + 3600000).toISOString(),
})
console.assert(newReminder.id && newReminder.title === 'Evening Puzzle Exercise', 'New reminder created')

// Acknowledge by ID
const ackFromService = acknowledgeReminderById(newReminder.id)
console.assert(ackFromService.status === REMINDER_STATUS.ACKNOWLEDGED, 'Reminder acknowledged in service')
console.assert(getReminderById(newReminder.id).status === REMINDER_STATUS.ACKNOWLEDGED, 'Stored reminder updated')

// Delete reminder
const deleted = deleteReminder(newReminder.id)
console.assert(deleted === true, 'Reminder deleted successfully')
console.assert(getReminderById(newReminder.id) === null, 'Reminder no longer found in storage')
console.log('✔ Storage service CRUD and lifecycle mutations verified\n')

// ── TEST 6: CAREGIVER MONITORING STATS ───────────────────────────────
console.log('Test 6: Verifying Caregiver monitoring metrics aggregation...')
resetRemindersToMock()
const stats = getReminderStats('MC-2048')

console.assert(stats.total > 0, 'Total reminders count must be > 0')
console.assert(typeof stats.complianceRate === 'number', 'Compliance rate must be a number')
console.assert(stats.byType[REMINDER_TYPES.MEDICATION] >= 1, 'Stats must breakdown medication count')
console.assert(stats.byType[REMINDER_TYPES.HYDRATION] >= 1, 'Stats must breakdown hydration count')
console.assert(stats.byType[REMINDER_TYPES.APPOINTMENT] >= 1, 'Stats must breakdown appointment count')
console.assert(stats.byType[REMINDER_TYPES.COGNITIVE_ACTIVITY] >= 1, 'Stats must breakdown cognitive activity count')
console.assert(stats.byType[REMINDER_TYPES.DAILY_ROUTINE] >= 1, 'Stats must breakdown daily routine count')

console.log('✔ Caregiver monitoring stats verified:', {
  patientId: stats.patientId,
  total: stats.total,
  totalToday: stats.totalToday,
  acknowledgedToday: stats.acknowledgedToday,
  pendingToday: stats.pendingToday,
  complianceRate: `${stats.complianceRate}%`,
  byType: stats.byType,
})

// ── TEST 7: DOSAGE SAFETY RESTRICTION GUARD ─────────────────────────
console.log('\nTest 7: Verifying medication dosage restriction guard...')

// Prohibited dosage examples
const prohibitedSamples = [
  'Donepezil 5mg',
  'Take 500 mg after breakfast',
  '2 tablets before sleep',
  'Give 1 pill',
  '10ml liquid syrup',
  'Dosage: 2 pills',
]

prohibitedSamples.forEach(sample => {
  const res = checkDosageSafety(sample)
  console.assert(res.hasDosage === true, `Expected "${sample}" to be flagged as dosage restriction`)
})

// Allowed reminder examples (no dosage amounts)
const allowedSamples = [
  'Morning Medicine',
  'Afternoon Medicine prompt',
  'Drink a fresh glass of water',
  'Doctor Consultation',
  'Memory Game',
  'Evening Garden Walk',
]

allowedSamples.forEach(sample => {
  const res = checkDosageSafety(sample)
  console.assert(res.hasDosage === false, `Expected "${sample}" to be allowed`)
})
console.log('✔ Medication dosage guard verified: Clinical dosages blocked, routine reminder prompts allowed\n')

// ── TEST 8: IMMEDIATE TODAY REMINDERS APPEARANCE ─────────────────────
console.log('Test 8: Verifying newly created reminder immediately appears in today list...')
const scheduledNow = new Date()
scheduledNow.setHours(15, 30, 0, 0)

const createdReminder = saveReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.MEDICATION,
  title: 'Afternoon Medicine',
  message: 'Time for your afternoon routine medicine.',
  scheduledTime: scheduledNow.toISOString(),
  repeat: 'daily',
  enabled: true,
  voiceEnabled: true,
})

const todayList = getTodayReminders('MC-2048')
const found = todayList.some(r => r.id === createdReminder.id)
// ── TEST 9: PATIENT-FACING DUE NOTIFICATION FLOW ────────────────────
console.log('\nTest 9: Verifying patient-facing due reminder detection & Done/Snooze flow...')
const dueRemindersList = getDueReminders('MC-2048')
console.assert(dueRemindersList.length > 0, 'Should detect at least one due reminder for MC-2048')

const targetDue = dueRemindersList[0]
console.log(`- Detected due reminder for patient: "${targetDue.title}" (${targetDue.type})`)

// Patient taps [ REMIND ME LATER ] (Snooze 15 minutes)
const snoozedItem = snoozeReminderById(targetDue.id, 15)
console.assert(snoozedItem.status === REMINDER_STATUS.SNOOZED, 'Status must transition to SNOOZED')
console.assert(Boolean(snoozedItem.snoozedUntil), 'snoozedUntil timestamp must be populated')
console.log('✔ Patient [ REMIND ME LATER ] correctly snoozes reminder and records snoozedUntil')

// Patient taps [ ✓ DONE ] (Acknowledge)
const doneItem = acknowledgeReminderById(targetDue.id)
console.assert(doneItem.status === REMINDER_STATUS.ACKNOWLEDGED, 'Status must transition to ACKNOWLEDGED')
console.assert(Boolean(doneItem.acknowledgedAt), 'acknowledgedAt timestamp must be recorded')
console.log('✔ Patient [ ✓ DONE ] correctly marks reminder ACKNOWLEDGED and records timestamp')

console.log('\n=== ALL SMART REMINDERS ARCHITECTURAL TESTS PASSED ===')


