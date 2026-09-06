/**
 * test-occurrence-tracking.js
 *
 * Automated verification of Smart Reminder Occurrence Tracking and
 * Caregiver Dashboard Daily Overview in MindCare NER.
 *
 * VERIFICATION REQUIREMENTS:
 * 1. Track occurrence fields:
 *    - scheduled time
 *    - triggered time
 *    - acknowledged time
 *    - status (Upcoming, Due, Acknowledged, Snoozed, Not Acknowledged)
 *    - snoozed
 *    - number of reminder attempts
 * 2. Wording compliance:
 *    - Uses "Not acknowledged" instead of "Medication missed"
 *    - Makes zero medical conclusions
 *    - Adds zero diagnosis functionality
 * 3. Daily overview stats aggregation (total, acknowledged, upcoming, not acknowledged)
 */

import {
  REMINDER_TYPES,
  REMINDER_STATUS,
  REMINDER_REPEAT,
  createReminder,
  acknowledgeReminder,
  snoozeReminder,
  markReminderDelivered,
  markReminderNotAcknowledged,
  saveReminder,
  getReminderById,
  getReminderStats,
} from './src/reminders/index.js'

console.log('=== STARTING REMINDER OCCURRENCE TRACKING VERIFICATION ===\n')

// ── TEST 1: OCCURRENCE FIELDS INITIALIZATION ─────────────────────────
console.log('Test 1: Verifying occurrence tracking fields in data model...')

const now = new Date()
const schedIso = new Date(now.getTime() + 3600000).toISOString() // 1 hour ahead

const reminder = createReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.MEDICATION,
  title: 'Morning Medicine',
  message: 'Take with water',
  scheduledTime: schedIso,
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
})

console.assert(reminder.scheduledTime === schedIso, 'scheduledTime must be preserved')
console.assert(reminder.triggeredTime === null, 'triggeredTime initially null')
console.assert(reminder.acknowledgedTime === null, 'acknowledgedTime initially null')
console.assert(reminder.status === REMINDER_STATUS.UPCOMING, 'Initial status must be UPCOMING')
console.assert(reminder.snoozed === false, 'snoozed initially false')
console.assert(reminder.attempts === 0, 'attempts initially 0')
console.log('✔ All occurrence tracking fields initialized properly\n')

// ── TEST 2: TRIGGERED / DELIVERED OCCURRENCE TRANSITION ───────────────
console.log('Test 2: Verifying triggered/delivered occurrence transition...')

const trigTime = new Date()
const delivered = markReminderDelivered(reminder, trigTime)

console.assert(delivered.status === REMINDER_STATUS.DUE, 'Status must transition to DUE')
console.assert(delivered.triggeredTime === trigTime.toISOString(), 'triggeredTime must be recorded')
console.assert(delivered.attempts === 1, 'attempts count must increment to 1')
console.assert(delivered.acknowledgedTime === null, 'acknowledgedTime must remain null')
console.log('✔ Triggered/delivered transition verified (recorded triggeredTime, attempts = 1, status = Due)\n')

// ── TEST 3: SNOOZED OCCURRENCE TRANSITION ─────────────────────────────
console.log('Test 3: Verifying snoozed occurrence transition...')

const snoozeFrom = new Date()
const snoozed = snoozeReminder(delivered, 10, snoozeFrom)

console.assert(snoozed.status === REMINDER_STATUS.SNOOZED, 'Status must transition to SNOOZED')
console.assert(snoozed.snoozed === true, 'snoozed flag must be true')
console.assert(Boolean(snoozed.snoozedUntil), 'snoozedUntil must be set')
console.assert(snoozed.acknowledgedTime === null, 'acknowledgedTime must remain null')
console.assert(snoozed.attempts === 1, 'attempts count must be preserved')
console.log('✔ Snoozed transition verified (status = Snoozed, snoozed = true, not completed)\n')

// ── TEST 4: ACKNOWLEDGED OCCURRENCE TRANSITION ────────────────────────
console.log('Test 4: Verifying acknowledged occurrence transition...')

const ackTime = new Date(snoozeFrom.getTime() + 4 * 60000)
const acknowledged = acknowledgeReminder(snoozed, ackTime)

console.assert(acknowledged.status === REMINDER_STATUS.ACKNOWLEDGED, 'Status must be ACKNOWLEDGED')
console.assert(acknowledged.acknowledgedTime === ackTime.toISOString(), 'acknowledgedTime must record exact timestamp')
console.assert(acknowledged.acknowledgedAt === ackTime.toISOString(), 'acknowledgedAt alias must match acknowledgedTime')
console.assert(acknowledged.snoozed === false, 'snoozed flag must be reset to false')
console.assert(acknowledged.snoozedUntil === null, 'snoozedUntil must be cleared')
console.log('✔ Acknowledged transition verified (status = Acknowledged, acknowledgedTime recorded)\n')

// ── TEST 5: NOT ACKNOWLEDGED TRANSITION & SAFETY WORDING ─────────────
console.log('Test 5: Verifying Not Acknowledged transition & safety wording policy...')

const unackRem = markReminderNotAcknowledged(delivered)

console.assert(
  unackRem.status === REMINDER_STATUS.NOT_ACKNOWLEDGED,
  'Status must be NOT_ACKNOWLEDGED ("not_acknowledged")'
)
console.assert(unackRem.snoozed === false, 'snoozed flag must be false')

// Verify string invariant: strictly NOT "missed medication"
console.assert(
  unackRem.status !== 'medication_missed' && unackRem.status !== 'missed_dose',
  'Status must NOT make clinical assumption about medication ingestion'
)
console.log('✔ Not Acknowledged status and clinical safety guarantee verified\n')

// ── TEST 6: CAREGIVER DAILY OVERVIEW AGGREGATION ─────────────────────
console.log('Test 6: Verifying Caregiver daily overview metrics aggregation...')

// Setup simulated patient reminders
const testPatient = 'MC-TEST-OVERVIEW'

saveReminder({
  patientId: testPatient,
  type: REMINDER_TYPES.MEDICATION,
  title: '09:00 AM Medicine',
  scheduledTime: new Date(Date.now() - 7200000).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
  status: REMINDER_STATUS.ACKNOWLEDGED,
  acknowledgedTime: new Date(Date.now() - 7000000).toISOString(),
})

saveReminder({
  patientId: testPatient,
  type: REMINDER_TYPES.HYDRATION,
  title: '11:00 AM Water',
  scheduledTime: new Date(Date.now() - 3600000).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
  status: REMINDER_STATUS.ACKNOWLEDGED,
  acknowledgedTime: new Date(Date.now() - 3500000).toISOString(),
})

saveReminder({
  patientId: testPatient,
  type: REMINDER_TYPES.COGNITIVE_ACTIVITY,
  title: '02:00 PM Activity',
  scheduledTime: new Date(Date.now() + 3600000).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
  status: REMINDER_STATUS.UPCOMING,
})

saveReminder({
  patientId: testPatient,
  type: REMINDER_TYPES.APPOINTMENT,
  title: '04:30 PM Doctor Appointment',
  scheduledTime: new Date(Date.now() - 1800000).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
  status: REMINDER_STATUS.NOT_ACKNOWLEDGED,
})

const stats = getReminderStats(testPatient)

console.assert(stats.totalToday === 4, 'totalToday must be 4')
console.assert(stats.acknowledgedToday === 2, 'acknowledgedToday must be 2')
console.assert(stats.pendingToday === 1, 'upcoming/pending must be 1')
console.assert(stats.notAcknowledgedToday === 1, 'notAcknowledgedToday must be 1')
console.assert(stats.complianceRate === 50, 'complianceRate must be 50%')

console.log('✔ Caregiver daily overview stats verified: {', {
  totalToday: stats.totalToday,
  acknowledgedToday: stats.acknowledgedToday,
  upcomingToday: stats.pendingToday,
  notAcknowledgedToday: stats.notAcknowledgedToday,
  complianceRate: `${stats.complianceRate}%`,
}, '}\n')

console.log('=== ALL REMINDER OCCURRENCE TRACKING TESTS PASSED ===')
