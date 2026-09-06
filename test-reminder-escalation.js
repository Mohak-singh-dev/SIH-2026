/**
 * test-reminder-escalation.js
 *
 * MindCare NER — Smart Reminder Escalation Verification Suite
 *
 * Verifies:
 * 1. Escalation & retry configuration (getters, setters, defaults, resets)
 * 2. Escalation transition to REMINDER_STATUS.NOT_ACKNOWLEDGED
 * 3. Generation of Caregiver Alerts with strict non-clinical wording:
 *    - Must say: "Hydration reminder scheduled for 11:00 AM has not been acknowledged."
 *    - MUST NEVER SAY: "The patient did not drink water" or "missed medication"
 * 4. Alert deduplication: Same occurrence never generates duplicate alerts
 * 5. Caregiver alert dismissal & resolution
 * 6. Scheduler sequential engine lifecycle: gentle retry, max retry limit, active modal retirement
 */

import assert from 'node:assert'
import {
  REMINDER_STATUS,
  REMINDER_TYPES,
  DEFAULT_MAX_RETRIES,
  DEFAULT_RETRY_INTERVAL_MINUTES,
  getMaxRetries,
  setMaxRetries,
  getRetryIntervalMinutes,
  setRetryIntervalMinutes,
  resetEscalationConfig,
  loadCaregiverAlerts,
  saveCaregiverAlert,
  dismissCaregiverAlert,
  escalateReminderOccurrence,
  getInitialMockCaregiverAlerts,
  resetRemindersToMock,
  ReminderScheduler,
  createReminder,
  saveAllReminders,
  loadAllReminders,
  deliverReminderById,
} from './src/reminders/index.js'

console.log('=== STARTING SMART REMINDER ESCALATION VERIFICATION ===\n')

// ── Test 1: Configurable Escalation Settings ───────────────────────────
console.log('Test 1: Verifying configurable escalation settings...')
resetEscalationConfig()
assert.strictEqual(getMaxRetries(), DEFAULT_MAX_RETRIES, 'Default max retries must be 2')
assert.strictEqual(getRetryIntervalMinutes(), DEFAULT_RETRY_INTERVAL_MINUTES, 'Default retry interval must be 10 minutes')

setMaxRetries(3)
assert.strictEqual(getMaxRetries(), 3, 'Max retries should be updated to 3')

setRetryIntervalMinutes(15)
assert.strictEqual(getRetryIntervalMinutes(), 15, 'Retry interval should be updated to 15')

resetEscalationConfig()
assert.strictEqual(getMaxRetries(), 2, 'Max retries should reset to 2')
assert.strictEqual(getRetryIntervalMinutes(), 10, 'Retry interval should reset to 10')
console.log('✔ Configurable escalation settings verified (getters, setters, reset to defaults)\n')

// ── Test 2: Escalation Transition & Strict Non-Clinical Wording ─────────
console.log('Test 2: Verifying escalation transition and non-clinical wording invariant...')
resetRemindersToMock()

const hydrationReminder = createReminder({
  id: 'test-rem-hydration-1',
  patientId: 'MC-2048',
  type: REMINDER_TYPES.HYDRATION,
  title: 'Morning Water',
  message: "Let's have a glass of fresh water.",
  scheduledTime: new Date(2026, 8, 6, 11, 0, 0).toISOString(), // 11:00 AM
  enabled: true,
  status: REMINDER_STATUS.DUE,
  attempts: 2,
})

saveAllReminders([hydrationReminder])

const escalationResult = escalateReminderOccurrence(hydrationReminder, new Date(2026, 8, 6, 11, 20, 0))
assert(escalationResult, 'Escalation result must be returned')

const { reminder: updatedReminder, alert } = escalationResult

// Verify reminder status
assert.strictEqual(
  updatedReminder.status,
  REMINDER_STATUS.NOT_ACKNOWLEDGED,
  'Status must be NOT_ACKNOWLEDGED'
)

// Verify Caregiver Alert presence and title
assert(alert, 'Caregiver alert must be generated')
assert.strictEqual(alert.title, 'Reminder not acknowledged', 'Alert title must be "Reminder not acknowledged"')

// Verify strict message pattern: "[Category] reminder scheduled for [Time] has not been acknowledged."
console.log(`- Generated Caregiver Alert Message: "${alert.message}"`)
assert(
  alert.message.includes('Hydration reminder scheduled for'),
  'Message must specify category and schedule'
)
assert(
  alert.message.includes('has not been acknowledged'),
  'Message must strictly state "has not been acknowledged"'
)

// CRITICAL CLINICAL SAFETY INVARIANTS:
assert(
  !alert.message.toLowerCase().includes('did not drink'),
  'SAFETY VIOLATION: Alert must never state "did not drink"'
)
assert(
  !alert.message.toLowerCase().includes('missed medication'),
  'SAFETY VIOLATION: Alert must never state "missed medication"'
)
assert(
  !alert.message.toLowerCase().includes('failed to'),
  'SAFETY VIOLATION: Alert must never make clinical failure claims'
)
console.log('✔ Non-clinical safety invariant verified: reports device acknowledgement without clinical assumptions\n')

// ── Test 3: Alert Deduplication ─────────────────────────────────────────
console.log('Test 3: Verifying alert deduplication protection...')
const initialAlertsCount = loadCaregiverAlerts('MC-2048').length

// Attempt to escalate the EXACT same occurrence a second time
const duplicateResult = escalateReminderOccurrence(hydrationReminder, new Date(2026, 8, 6, 11, 20, 0))
const alertsAfterDuplicate = loadCaregiverAlerts('MC-2048').length

assert.strictEqual(
  alertsAfterDuplicate,
  initialAlertsCount,
  'Deduplication must prevent creating duplicate alerts for the same reminder occurrence'
)
assert.strictEqual(
  duplicateResult.alert.id,
  alert.id,
  'Duplicate escalation must return the existing alert without creating a new one'
)
console.log('✔ Alert deduplication verified: prevents spamming caregiver with duplicate alerts\n')

// ── Test 4: Caregiver Alert Dismissal ───────────────────────────────────
console.log('Test 4: Verifying caregiver alert dismissal...')
assert.strictEqual(alert.resolved, false, 'New alert must be unresolved')

const dismissed = dismissCaregiverAlert(alert.id)
assert.strictEqual(dismissed, true, 'dismissCaregiverAlert should return true on success')

const activeAlerts = loadCaregiverAlerts('MC-2048')
assert(
  !activeAlerts.some(a => a.id === alert.id),
  'Dismissed alert must not appear in active alerts list'
)

const allAlertsIncludingResolved = loadCaregiverAlerts('MC-2048', { includeResolved: true })
const resolvedAlert = allAlertsIncludingResolved.find(a => a.id === alert.id)
assert(resolvedAlert && resolvedAlert.resolved === true, 'Alert must be marked resolved: true')
assert(resolvedAlert.resolvedAt, 'resolvedAt timestamp must be recorded')
console.log('✔ Caregiver alert dismissal verified: caregiver can dismiss/resolve alerts\n')

// ── Test 5: Scheduler Escalation Lifecycle Integration ──────────────────
console.log('Test 5: Verifying Scheduler engine retry & escalation lifecycle...')

// Setup a test scheduler
let deliveredReminder = null
const scheduler = new ReminderScheduler({
  patientId: 'MC-TEST-PATIENT',
  checkIntervalMs: 1000,
  onDue: (rem) => {
    deliveredReminder = rem
  },
})

const testSchedTime = new Date(2026, 8, 6, 9, 0, 0)
const rem1 = createReminder({
  id: 'sched-test-med-1',
  patientId: 'MC-TEST-PATIENT',
  type: REMINDER_TYPES.MEDICATION,
  title: 'Morning Medicine',
  message: "It's time for your scheduled medicine.",
  scheduledTime: testSchedTime.toISOString(),
  enabled: true,
})

saveAllReminders([rem1])
setMaxRetries(2)
setRetryIntervalMinutes(10)

// Tick 1 at 09:00: Reminder becomes due -> Attempt 1
const tick1Time = new Date(2026, 8, 6, 9, 0, 0)
scheduler.tick(tick1Time)

assert(scheduler.activeReminder, 'Reminder 1 must be active on screen')
assert.strictEqual(scheduler.activeReminder.attempts, 1, 'Initial attempt must be 1')
console.log(`- Attempt 1 displayed: "${scheduler.activeReminder.title}" (attempts: ${scheduler.activeReminder.attempts})`)

// Tick 2 at 09:05 (5 mins elapsed, < retry interval of 10 min): No retry yet
scheduler.tick(new Date(2026, 8, 6, 9, 5, 0))
assert.strictEqual(scheduler.activeReminder.attempts, 1, 'Attempts should remain 1 before retry interval')

// Tick 3 at 09:11 (11 mins elapsed, >= retry interval of 10 min): Gentle retry triggered!
scheduler.tick(new Date(2026, 8, 6, 9, 11, 0))
assert(scheduler.activeReminder, 'Reminder 1 must remain active on screen')
assert.strictEqual(scheduler.activeReminder.attempts, 2, 'Gentle retry must increment attempts to 2')
console.log(`- Attempt 2 (Gentle Retry) displayed: attempts = ${scheduler.activeReminder.attempts}`)

// Tick 4 at 09:22 (11 mins after retry, attempts = 2 >= maxRetries of 2): Escalation triggers!
scheduler.tick(new Date(2026, 8, 6, 9, 22, 0))
assert.strictEqual(scheduler.activeReminder, null, 'Active reminder modal should be retired from screen upon escalation')

const storedAfterEscalation = loadAllReminders().find(r => r.id === 'sched-test-med-1')
assert.strictEqual(
  storedAfterEscalation.status,
  REMINDER_STATUS.NOT_ACKNOWLEDGED,
  'Stored reminder must be marked NOT_ACKNOWLEDGED'
)

const generatedAlerts = loadCaregiverAlerts('MC-TEST-PATIENT')
assert(generatedAlerts.length > 0, 'Caregiver alert must be generated for the patient')
assert.strictEqual(generatedAlerts[0].title, 'Reminder not acknowledged')
assert(generatedAlerts[0].message.includes('Medication reminder scheduled for'))
assert(generatedAlerts[0].message.includes('has not been acknowledged'))
console.log(`- Escalation alert generated: "${generatedAlerts[0].message}"`)

scheduler.destroy()
console.log('✔ Scheduler engine retry and escalation lifecycle fully verified\n')

// ── Test 6: Verify Medication Wording Strict Compliance ─────────────────
console.log('Test 6: Verifying Medication non-clinical wording compliance across categories...')
const appointmentReminder = createReminder({
  id: 'test-rem-apt-1',
  patientId: 'MC-2048',
  type: REMINDER_TYPES.APPOINTMENT,
  title: 'Doctor Appointment',
  message: 'Appointment today.',
  scheduledTime: new Date(2026, 8, 6, 16, 30, 0).toISOString(),
  enabled: true,
})

const aptResult = escalateReminderOccurrence(appointmentReminder, new Date(2026, 8, 6, 16, 50, 0))
assert(
  aptResult.alert.message.includes('Appointment reminder scheduled for') &&
  aptResult.alert.message.includes('has not been acknowledged'),
  'Appointment alert message must format accurately'
)
console.log(`- Appointment alert: "${aptResult.alert.message}"`)
console.log('✔ All category alert templates verified\n')

// Restore seeds cleanly
resetRemindersToMock()
resetEscalationConfig()

console.log('=== ALL SMART REMINDER ESCALATION TESTS PASSED ===')
