/**
 * test-offline-first.js
 *
 * MindCare NER — Offline-First Smart Reminders Verification Suite
 *
 * Verifies:
 * 1. Offline storage operations & mutation outbox queue
 * 2. Local scheduling engine operates 100% without internet
 * 3. Offline acknowledgement and local status persistence
 * 4. Offline escalation and caregiver alert generation
 * 5. Reconnection synchronization & deduplication protection
 * 6. Pluggable remote sync adapter extension points
 */

import assert from 'node:assert'
import {
  REMINDER_STATUS,
  REMINDER_TYPES,
  REMINDER_REPEAT,
  ReminderRepository,
  ReminderSyncService,
  reminderRepository,
  reminderSyncService,
  saveReminder,
  deleteReminder,
  acknowledgeReminderById,
  snoozeReminderById,
  deliverReminderById,
  markReminderNotAcknowledgedById,
  loadAllReminders,
  getReminderById,
  getSyncStatus,
  syncPendingMutations,
  setSimulatedOffline,
  isOnline,
  resetRemindersToMock,
  ReminderScheduler,
  createReminder,
  escalateReminderOccurrence,
  loadCaregiverAlerts,
  dismissCaregiverAlert,
} from './src/reminders/index.js'

console.log('=== STARTING OFFLINE-FIRST SMART REMINDERS VERIFICATION ===\n')

// ── Test 1: Connectivity Detection & Simulation ─────────────────────────
console.log('Test 1: Verifying connectivity detection & simulation controls...')
resetRemindersToMock()

assert.strictEqual(typeof isOnline(), 'boolean', 'isOnline() must return boolean')
setSimulatedOffline(true)
assert.strictEqual(isOnline(), false, 'isOnline() must be false when simulated offline')

const offlineStatus = getSyncStatus()
assert.strictEqual(offlineStatus.isOnline, false, 'Sync status must report offline')
console.log('✔ Connectivity detection & offline simulation verified\n')

// ── Test 2: Offline Reminder Creation & Outbox Mutation Queue ───────────
console.log('Test 2: Verifying offline reminder creation & outbox mutation queue...')
setSimulatedOffline(true)

const offlineReminder = saveReminder({
  patientId: 'MC-OFFLINE-TEST',
  type: REMINDER_TYPES.HYDRATION,
  title: 'Offline Hydration Prompt',
  message: 'Drink a glass of water.',
  scheduledTime: new Date(2026, 8, 6, 15, 15, 0).toISOString(),
  repeat: REMINDER_REPEAT.DAILY,
  enabled: true,
})

assert(offlineReminder && offlineReminder.id, 'Reminder must be created and assigned an ID offline')

// Verify it exists in local storage
const storedLocal = getReminderById(offlineReminder.id)
assert(storedLocal, 'Reminder must be immediately accessible in local repository while offline')
assert.strictEqual(storedLocal.title, 'Offline Hydration Prompt')

// Verify mutation outbox queue
const outbox = reminderRepository.getOutbox()
const matchingMutation = outbox.find(m => m.entityId === offlineReminder.id && m.type === 'REMINDER_UPSERT')
assert(matchingMutation, 'An outbox UPSERT mutation must be recorded for future sync')
assert.strictEqual(matchingMutation.status, 'pending')
console.log(`- Outbox recorded mutation ID: ${matchingMutation.id} (type: ${matchingMutation.type})`)
console.log('✔ Offline reminder creation and outbox queuing verified\n')

// ── Test 3: Local Scheduling Engine Operates Without Internet ───────────
console.log('Test 3: Verifying local scheduling engine triggers without network...')
let triggeredReminder = null

const scheduler = new ReminderScheduler({
  patientId: 'MC-OFFLINE-TEST',
  checkIntervalMs: 1000,
  onDue: (rem) => {
    triggeredReminder = rem
  },
})

// Set system reference time to 15:15 (due time)
const triggerTime = new Date(2026, 8, 6, 15, 15, 0)
scheduler.tick(triggerTime)

assert(triggeredReminder, 'Scheduler must trigger due reminder locally without internet')
assert.strictEqual(triggeredReminder.id, offlineReminder.id, 'Triggered reminder must match scheduled item')
assert.strictEqual(triggeredReminder.title, 'Offline Hydration Prompt')
console.log(`- Successfully delivered offline reminder on patient device: "${triggeredReminder.title}"`)
console.log('✔ Zero network dependency for local reminder scheduling verified\n')

// ── Test 4: Offline Patient Acknowledgement & Local Persistence ─────────
console.log('Test 4: Verifying offline patient acknowledgement...')
const ackTime = new Date(2026, 8, 6, 15, 17, 0)

// Patient taps [ ✓ DONE ] while device is offline
const acknowledged = scheduler.acknowledgeActive(ackTime)
assert(acknowledged, 'Active reminder must be acknowledged offline')
assert.strictEqual(acknowledged.status, REMINDER_STATUS.ACKNOWLEDGED, 'Status must be ACKNOWLEDGED')
assert(acknowledged.acknowledgedTime, 'acknowledgedTime must be recorded locally')

// Verify local storage is updated immediately
const updatedLocal = getReminderById(offlineReminder.id)
assert.strictEqual(updatedLocal.status, REMINDER_STATUS.ACKNOWLEDGED)

// Verify outbox queued the acknowledgement mutation
const ackMutation = reminderRepository.getOutbox().find(
  m => m.entityId === offlineReminder.id && m.type === 'REMINDER_ACKNOWLEDGE'
)
assert(ackMutation, 'Acknowledgement mutation must be enqueued in outbox while offline')
console.log(`- Queued offline acknowledgement mutation: ${ackMutation.id}`)
console.log('✔ Offline patient acknowledgement verified\n')

// ── Test 5: Offline Escalation & Caregiver Alert Generation ─────────────
console.log('Test 5: Verifying offline escalation and caregiver alert generation...')
const unackReminder = saveReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.MEDICATION,
  title: 'Afternoon Medicine',
  message: 'Scheduled routine medicine prompt.',
  scheduledTime: new Date(2026, 8, 6, 15, 0, 0).toISOString(),
  enabled: true,
})

// Escalate while still offline
const escalationTime = new Date(2026, 8, 6, 15, 30, 0)
const { reminder: escalated, alert } = escalateReminderOccurrence(unackReminder, escalationTime)

assert.strictEqual(escalated.status, REMINDER_STATUS.NOT_ACKNOWLEDGED, 'Must transition to NOT_ACKNOWLEDGED offline')
assert(alert, 'Caregiver alert must be generated locally while offline')
assert.strictEqual(alert.title, 'Reminder not acknowledged')
assert(alert.message.includes('Medication reminder scheduled for'))
assert(alert.message.includes('has not been acknowledged'))

// Caregiver dismisses alert offline
const dismissed = dismissCaregiverAlert(alert.id)
assert.strictEqual(dismissed, true, 'Caregiver alert must dismiss offline')

const alertDismissMutation = reminderRepository.getOutbox().find(
  m => m.entityId === alert.id && m.type === 'ALERT_DISMISS'
)
assert(alertDismissMutation, 'Alert dismissal mutation must be queued in outbox')
console.log(`- Queued offline alert dismissal mutation: ${alertDismissMutation.id}`)
console.log('✔ Offline escalation and alert handling verified\n')

// ── Test 6: Reconnection, Outbox Synchronization & Zero Duplication ───
console.log('Test 6: Verifying reconnection sync and deduplication guarantee...')

// Check outbox has pending mutations before reconnecting
const pendingBefore = reminderRepository.getOutbox().length
assert(pendingBefore > 0, 'Outbox must have pending mutations from offline session')
console.log(`- Pending mutations before reconnection: ${pendingBefore}`)

// Simulate network returning online
setSimulatedOffline(false)
assert.strictEqual(isOnline(), true, 'Network must be reported online')

// Trigger synchronization
const syncResult = await syncPendingMutations()
assert.strictEqual(syncResult.success, true, 'Sync must succeed upon reconnection')
assert.strictEqual(syncResult.pendingCount, 0, 'Outbox must be flushed and cleared after sync')
assert(syncResult.syncedCount >= pendingBefore, 'All pending mutations must be synced')
console.log(`- Successfully synced ${syncResult.syncedCount} offline mutations to backend sync engine`)

// Test Deduplication: Merge local and remote sets
const localList = loadAllReminders()
const duplicateRemotePayload = [
  ...localList, // Same reminders from server
  {
    id: offlineReminder.id, // Duplicate ID with updated timestamp
    title: 'Offline Hydration Prompt',
    scheduledTime: offlineReminder.scheduledTime,
    lastModifiedAt: new Date(2026, 8, 6, 16, 0, 0).toISOString(),
  },
]

const merged = reminderSyncService.mergeRemindersWithoutDuplicates(localList, duplicateRemotePayload)
assert.strictEqual(
  merged.length,
  localList.length,
  'Deduplication guarantee: merge must never create duplicate reminder records'
)
console.log(`- Total reminders before merge: ${localList.length}, after merge: ${merged.length} (ZERO duplicates)`)
console.log('✔ Reconnection sync and deduplication guarantee verified\n')

// ── Test 7: Pluggable Remote Adapter Extension Point ────────────────────
console.log('Test 7: Verifying pluggable backend adapter integration...')
let adapterPushedMutations = []

reminderSyncService.setRemoteSyncAdapter({
  pushMutations: async (mutations) => {
    adapterPushedMutations = [...mutations]
    return { success: true }
  },
})

// Create another reminder and sync through the adapter
const testAdapterRem = saveReminder({
  patientId: 'MC-2048',
  type: REMINDER_TYPES.COGNITIVE_ACTIVITY,
  title: 'Brain Activity Test',
  scheduledTime: new Date(2026, 8, 6, 17, 0, 0).toISOString(),
})

await syncPendingMutations()
assert(
  adapterPushedMutations.some(m => m.entityId === testAdapterRem.id),
  'Remote backend adapter must receive queued mutations upon sync'
)
console.log(`- Pluggable remote adapter successfully received ${adapterPushedMutations.length} mutations`)

// Clean up adapter & reset
reminderSyncService.setRemoteSyncAdapter(null)
scheduler.destroy()
resetRemindersToMock()

console.log('=== ALL OFFLINE-FIRST SMART REMINDERS TESTS PASSED ===')
