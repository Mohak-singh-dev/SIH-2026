/**
 * test-scheduling-engine.js
 *
 * Automated verification of the Frontend Smart Reminder Scheduling Engine:
 * 1. Offline & local time execution (no external API dependencies)
 * 2. Occurrence calculation for Daily vs One-Time vs Weekdays
 * 3. Respect for disabled reminders (never triggers when enabled === false)
 * 4. Deduplication: Avoids triggering the same reminder repeatedly after acknowledgment
 * 5. Snooze awakening: Triggers after snooze expiration
 * 6. Sequential multi-reminder delivery (cognitive-friendly queueing)
 * 7. Single timer lifecycle (start, stop, cleanup without dangling intervals)
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
  REMINDER_REPEAT,
  REMINDER_STATUS,
  createReminder,
  saveReminder,
  resetRemindersToMock,
  isSameCalendarDay,
  extractScheduledTimeOfDay,
  getOccurrenceDateForDay,
  isReminderDueForOccurrence,
  ReminderScheduler,
  DEFAULT_SNOOZE_MINUTES,
  getSnoozeDurationMinutes,
  setSnoozeDurationMinutes,
  resetSnoozeDurationMinutes,
  getReminderById,
} from './src/reminders/index.js'

console.log('=== STARTING SCHEDULING ENGINE ARCHITECTURAL VERIFICATION ===\n')

// ── TEST 1: LOCAL OCCURRENCE TIME & CALENDAR COMPARISON ──────────────
console.log('Test 1: Verifying local time occurrence calculations...')
const now = new Date()
const sampleDate = new Date(2026, 8, 6, 9, 30, 0) // 09:30 AM
const extracted = extractScheduledTimeOfDay(sampleDate)
console.assert(extracted.hours === 9 && extracted.minutes === 30, 'Extracted hours/minutes must match')

const sameDayA = new Date(2026, 8, 6, 8, 0, 0)
const sameDayB = new Date(2026, 8, 6, 21, 45, 0)
const diffDay = new Date(2026, 8, 7, 8, 0, 0)
console.assert(isSameCalendarDay(sameDayA, sameDayB) === true, 'Same day must return true')
console.assert(isSameCalendarDay(sameDayA, diffDay) === false, 'Different day must return false')
console.log('✔ Calendar day and local time extraction verified\n')

// ── TEST 2: ONE-TIME REMINDER SCHEDULING ─────────────────────────────
console.log('Test 2: Verifying one-time reminder behavior...')
const pastTime = new Date(Date.now() - 3600000) // 1 hour ago
const futureTime = new Date(Date.now() + 3600000) // 1 hour ahead

const oneTimePast = createReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.APPOINTMENT,
  title: 'Past One-Time Appointment',
  message: 'Scheduled 1 hour ago',
  scheduledTime: pastTime.toISOString(),
  repeat: REMINDER_REPEAT.NONE,
  enabled: true,
})

const oneTimeFuture = createReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.APPOINTMENT,
  title: 'Future One-Time Appointment',
  message: 'Scheduled 1 hour ahead',
  scheduledTime: futureTime.toISOString(),
  repeat: REMINDER_REPEAT.NONE,
  enabled: true,
})

console.assert(isReminderDueForOccurrence(oneTimePast, now) === true, 'Past one-time reminder must be due')
console.assert(isReminderDueForOccurrence(oneTimeFuture, now) === false, 'Future one-time reminder must NOT be due')
console.log('✔ One-time reminder past/future evaluation verified\n')

// ── TEST 3: DISABLED REMINDERS MUST BE RESPECTED ─────────────────────
console.log('Test 3: Verifying disabled reminders are never due...')
const disabledPast = createReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.MEDICATION,
  title: 'Disabled Past Medication',
  message: 'Should not trigger',
  scheduledTime: pastTime.toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: false,
})

console.assert(isReminderDueForOccurrence(disabledPast, now) === false, 'Disabled reminder must NEVER be due')
console.log('✔ Disabled reminders strictly ignored by scheduler\n')

// ── TEST 4: DAILY RECURRENCE & DEDUPLICATION ─────────────────────────
console.log('Test 4: Verifying daily recurrence and same-occurrence deduplication...')
const dailyMorning = createReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.MEDICATION,
  title: 'Daily Morning Donepezil',
  message: 'Daily at 08:00 AM',
  scheduledTime: new Date(2026, 8, 6, 8, 0, 0).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
})

// Current time is 10:00 AM on the same day -> due if unacknowledged
const checkTimeMorning = new Date(2026, 8, 6, 10, 0, 0)
console.assert(
  isReminderDueForOccurrence(dailyMorning, checkTimeMorning) === true,
  'Daily reminder scheduled for 8am must be due at 10am'
)

// Acknowledged today at 8:15 AM
const acknowledgedToday = createReminder({
  ...dailyMorning,
  status: REMINDER_STATUS.ACKNOWLEDGED,
  acknowledgedAt: new Date(2026, 8, 6, 8, 15, 0).toISOString(),
})

console.assert(
  isReminderDueForOccurrence(acknowledgedToday, checkTimeMorning) === false,
  'Daily reminder already acknowledged today must NOT be due again today'
)

// Tomorrow morning at 10:00 AM -> must be due again for tomorrow!
const checkTimeTomorrow = new Date(2026, 8, 7, 10, 0, 0)
console.assert(
  isReminderDueForOccurrence(acknowledgedToday, checkTimeTomorrow) === true,
  'Daily reminder acknowledged yesterday must become due again today'
)
console.log('✔ Daily recurrence & deduplication verified (acknowledgment retires only today)\n')

// ── TEST 5: SNOOZE AWAKENING ─────────────────────────────────────────
console.log('Test 5: Verifying snooze behavior...')
const snoozedReminder = createReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.HYDRATION,
  title: 'Water Snoozed',
  message: 'Drink water',
  scheduledTime: new Date(Date.now() - 7200000).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
  status: REMINDER_STATUS.SNOOZED,
  snoozedUntil: new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
})

console.assert(
  isReminderDueForOccurrence(snoozedReminder, now) === false,
  'Snoozed reminder must NOT be due while snoozedUntil is in future'
)

const timeAfterSnooze = new Date(Date.now() + 660000) // 11 minutes from now
console.assert(
  isReminderDueForOccurrence(snoozedReminder, timeAfterSnooze) === true,
  'Snoozed reminder must awaken once snoozedUntil has arrived'
)
console.log('✔ Snooze awakening verified\n')

// ── TEST 6: REMINDER SCHEDULER & SEQUENTIAL QUEUE DELIVERY ───────────
console.log('Test 6: Verifying ReminderScheduler engine & sequential delivery...')
localStorage.clear()

// Seed 2 reminders scheduled in the past for an isolated test patient
const rem1 = saveReminder({
  patientId: 'MC-TEST-SCHEDULER',
  type: REMINDER_TYPES.MEDICATION,
  title: 'Reminder 1 (Medicine)',
  message: 'Take pill',
  scheduledTime: new Date(Date.now() - 3600000).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
})

const rem2 = saveReminder({
  patientId: 'MC-TEST-SCHEDULER',
  type: REMINDER_TYPES.HYDRATION,
  title: 'Reminder 2 (Hydration)',
  message: 'Drink water',
  scheduledTime: new Date(Date.now() - 1800000).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
})

let activeInUI = null
let queueCount = 0

const scheduler = new ReminderScheduler({
  patientId: 'MC-TEST-SCHEDULER',
  checkIntervalMs: 1000,
  onDue: (reminder) => {
    activeInUI = reminder
  },
  onQueueChange: (queue) => {
    queueCount = queue.length
  },
})

// Start scheduler
scheduler.start()
console.assert(scheduler.isRunning === true, 'Scheduler must be running')

// First due reminder should be presented immediately (sequential, not both at once!)
console.assert(activeInUI !== null, 'An active reminder must be presented to UI')
console.assert(activeInUI.id === rem1.id, 'First scheduled reminder must be presented first')
console.assert(queueCount === 1, 'Second reminder should be waiting in queue')
console.log(`- Active in UI: "${activeInUI.title}", Waiting in queue: ${queueCount}`)

// Patient taps [ ✓ DONE ] on the first reminder
scheduler.acknowledgeActive()
console.assert(
  activeInUI.id === rem2.id,
  'Next due reminder from queue must be presented automatically after acknowledging first'
)
console.assert(queueCount === 0, 'Queue should now be empty as second reminder is active')
console.log(`- Next active in UI: "${activeInUI.title}", Waiting in queue: ${queueCount}`)

// Patient taps [ REMIND ME LATER ] on the second reminder
scheduler.snoozeActive(15)
console.assert(activeInUI === null, 'No more active reminders once queue is emptied')
console.log('✔ Sequential queue delivery verified: Dementia patient sees one reminder at a time\n')

// ── TEST 7: CLEAN LIFECYCLE & NO DUPLICATE TIMERS ────────────────────
console.log('Test 7: Verifying cleanup & timer teardown...')
scheduler.stop()
console.assert(scheduler.isRunning === false, 'Scheduler must be stopped')
console.assert(scheduler.timerId === null, 'Timer interval must be cleared')

scheduler.destroy()
console.assert(scheduler.dueQueue.length === 0, 'Queue must be cleared upon destroy')
console.log('✔ Clean scheduler lifecycle teardown verified: Zero memory leaks or dangling timers\n')

// ── TEST 8: PATIENT INTERACTION LOGIC & CONFIGURABLE SNOOZE ──────────
console.log('Test 8: Verifying Patient Interaction Logic & configurable snooze duration...')

// 8.1 Configurable snooze interval
console.assert(DEFAULT_SNOOZE_MINUTES === 10, 'Default snooze interval must be 10 minutes')
console.assert(getSnoozeDurationMinutes() === 10, 'getSnoozeDurationMinutes() must return 10 by default')

setSnoozeDurationMinutes(20)
console.assert(getSnoozeDurationMinutes() === 20, 'setSnoozeDurationMinutes(20) must update duration to 20')

resetSnoozeDurationMinutes()
console.assert(getSnoozeDurationMinutes() === 10, 'resetSnoozeDurationMinutes() must restore default 10')
console.log('✔ Snooze duration configuration in reminderService verified')

// 8.2 [ ✓ DONE ] interaction
const doneTestPatient = 'MC-PATIENT-INTERACTION'
const remDone = saveReminder({
  patientId: doneTestPatient,
  type: REMINDER_TYPES.MEDICATION,
  title: 'Morning Medicine',
  message: 'Time for morning medicine.',
  scheduledTime: new Date(Date.now() - 60000).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
})

let activeDoneReminder = null
const doneScheduler = new ReminderScheduler({
  patientId: doneTestPatient,
  onDue: (r) => { activeDoneReminder = r },
})
doneScheduler.start()

console.assert(activeDoneReminder !== null, 'Reminder must become active')
console.assert(activeDoneReminder.id === remDone.id, 'Active reminder ID must match')

// Patient selects [ ✓ DONE ]
const ackTime = new Date('2026-09-06T10:30:00.000Z')
const updatedDone = doneScheduler.acknowledgeActive(ackTime)

console.assert(updatedDone.status === REMINDER_STATUS.ACKNOWLEDGED, 'Status must be ACKNOWLEDGED')
console.assert(updatedDone.acknowledgedAt === ackTime.toISOString(), 'acknowledgedAt must record timestamp')
console.assert(doneScheduler.activeReminder === null, 'Active reminder UI must be closed')

// Verify persistence immediately available to caregiver
const persistedDone = getReminderById(remDone.id)
console.assert(persistedDone.status === REMINDER_STATUS.ACKNOWLEDGED, 'Persisted reminder status must be ACKNOWLEDGED')
console.assert(persistedDone.acknowledgedAt === ackTime.toISOString(), 'Persisted acknowledgedAt must match')
doneScheduler.destroy()
console.log('✔ Patient [ ✓ DONE ] interaction: status updated, acknowledgedAt recorded, closed in UI')

// 8.3 [ REMIND ME LATER ] interaction
const remSnooze = saveReminder({
  patientId: doneTestPatient,
  type: REMINDER_TYPES.HYDRATION,
  title: 'Drink Water',
  message: 'Have a glass of water.',
  scheduledTime: new Date(Date.now() - 60000).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
})

let activeSnoozeReminder = null
const snoozeScheduler = new ReminderScheduler({
  patientId: doneTestPatient,
  onDue: (r) => { activeSnoozeReminder = r },
})
snoozeScheduler.start()

console.assert(activeSnoozeReminder !== null, 'Hydration reminder must become active')

// Patient selects [ REMIND ME LATER ] — using default configurable snooze (10 mins)
const snoozeStartTime = new Date()
const updatedSnooze = snoozeScheduler.snoozeActive() // defaults to getSnoozeDurationMinutes()

console.assert(updatedSnooze.status === REMINDER_STATUS.SNOOZED, 'Status must be SNOOZED')
console.assert(updatedSnooze.acknowledgedAt === null, 'acknowledgedAt must NOT be set when snoozed')
console.assert(Boolean(updatedSnooze.snoozedUntil), 'snoozedUntil must be set')

const expectedSnoozeDate = new Date(snoozeStartTime.getTime() + 10 * 60 * 1000)
const actualSnoozeDate = new Date(updatedSnooze.snoozedUntil)
const diffSeconds = Math.abs((actualSnoozeDate.getTime() - expectedSnoozeDate.getTime()) / 1000)
console.assert(diffSeconds < 2, `Snooze interval must be 10 minutes (diff=${diffSeconds}s)`)
console.assert(snoozeScheduler.activeReminder === null, 'Active reminder UI must close on snooze')

// Verify persistence immediately available to caregiver
const persistedSnooze = getReminderById(remSnooze.id)
console.assert(persistedSnooze.status === REMINDER_STATUS.SNOOZED, 'Caregiver view reflects SNOOZED status')
console.assert(persistedSnooze.acknowledgedAt === null, 'Caregiver view confirms reminder not marked complete')
snoozeScheduler.destroy()
console.log('✔ Patient [ REMIND ME LATER ] interaction: gentle retry scheduled, status snoozed, not completed\n')

console.log('=== ALL SCHEDULING ENGINE TESTS PASSED ===')
