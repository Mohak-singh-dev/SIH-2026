/**
 * Automated Verification Script for:
 * 17. SOS & EMERGENCY ASSISTANCE SYSTEM
 * 
 * Verifies:
 * 1. Phone number validation rules
 * 2. Storage CRUD operations for caregiver emergency contact
 * 3. Storage CRUD for home location & emergency helpline configuration (112 default)
 * 4. Haversine distance calculation and compass bearing (100% offline)
 * 5. Free non-paid Maps link generation
 * 6. File structure and component exports
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Polyfill window & localStorage for Node.js test environment
const mockStorage = {}
const storageImpl = {
  getItem: (k) => (k in mockStorage ? mockStorage[k] : null),
  setItem: (k, v) => { mockStorage[k] = String(v) },
  removeItem: (k) => { delete mockStorage[k] },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k]
  }
}
global.localStorage = storageImpl
global.window = { localStorage: storageImpl }

let passed = 0
let failed = 0

function assert(cond, msg) {
  if (cond) {
    console.log(`  PASS: ${msg}`)
    passed++
  } else {
    console.error(`  FAIL: ${msg}`)
    failed++
  }
}

async function runTests() {
  console.log('--- Testing Emergency Contact Service ---')
  const service = await import('./src/emergency/emergencyContactService.js')

  // 1. Phone validation
  console.log('\n1. Phone Number Validation:')
  assert(service.validatePhoneNumber('+919876543210').valid === true, 'Accepts +91 with 10 digits')
  assert(service.validatePhoneNumber('9876543210').valid === true, 'Accepts 10 digits Indian phone')
  assert(service.validatePhoneNumber('+1 (555) 234-5678').valid === true, 'Accepts formatted international phone')
  assert(service.validatePhoneNumber('123').valid === false, 'Rejects too-short number')
  assert(service.validatePhoneNumber('abcd-efgh-ij').valid === false, 'Rejects alphabetic phone')
  assert(service.validatePhoneNumber('').valid === false, 'Rejects empty string')

  // 2. Storage CRUD for Emergency Contact
  console.log('\n2. Caregiver Contact CRUD:')
  global.localStorage.clear()
  const initialContact = service.getEmergencyContact()
  assert(initialContact !== null, 'Returns a default fallback caregiver contact')
  assert(typeof initialContact.phone === 'string', 'Default caregiver has a phone')

  // Save new contact
  const saveRes = service.saveEmergencyContact({
    name: 'Rahul Das',
    relationship: 'Son',
    phone: '+919876543210',
    secondaryPhone: '+919876543211',
  })
  assert(saveRes.success === true, 'Save valid caregiver contact succeeds')
  assert(saveRes.contact?.name === 'Rahul Das', 'Contact name correctly saved')
  
  const fetchedContact = service.getEmergencyContact()
  assert(fetchedContact.name === 'Rahul Das' && fetchedContact.relationship === 'Son', 'Fetched saved contact matches')
  assert(fetchedContact.phone === '+919876543210', 'Primary phone saved')
  assert(fetchedContact.secondaryPhone === '+919876543211', 'Secondary phone saved')

  // Validation rejection on save
  const invalidSave = service.saveEmergencyContact({
    name: 'Test',
    relationship: 'Friend',
    phone: 'invalid-number'
  })
  assert(invalidSave.success === false, 'Save rejects invalid phone number')

  // Delete contact
  service.deleteEmergencyContact()
  assert(service.getEmergencyContact() === null, 'Delete contact clears the contact from storage')

  // 3. Home Location CRUD
  console.log('\n3. Home Location CRUD:')
  const homeLoc = service.getHomeLocation()
  assert(homeLoc.latitude !== undefined && homeLoc.longitude !== undefined, 'Default home location exists')
  assert(homeLoc.address.length > 0, 'Default home location has an address')

  service.saveHomeLocation({
    address: 'Guwahati City Center, Assam',
    latitude: 26.1856,
    longitude: 91.7539,
  })
  const updatedHome = service.getHomeLocation()
  assert(updatedHome.address === 'Guwahati City Center, Assam', 'Home location address updated')
  assert(updatedHome.latitude === 26.1856 && updatedHome.longitude === 91.7539, 'Home coords updated')

  // 4. Emergency Helpline Config (112)
  console.log('\n4. Emergency Helpline Config (Default India 112):')
  const defaultConf = service.getEmergencyConfig()
  assert(defaultConf.emergencyNumber === '112', 'Default emergency helpline is 112')
  assert(defaultConf.country === 'India', 'Default country is India')

  service.saveEmergencyConfig({
    emergencyNumber: '911',
    label: 'Emergency Rescue',
    country: 'USA'
  })
  const customConf = service.getEmergencyConfig()
  assert(customConf.emergencyNumber === '911', 'Helpline number is configurable')

  // Reset to 112
  service.saveEmergencyConfig({
    emergencyNumber: '112',
    label: 'National Emergency Response Support System (ERSS)',
    country: 'India'
  })

  // 5. Haversine Distance & Bearing Math (Offline)
  console.log('\n5. Offline Haversine Distance & Compass Bearing:')
  // Zero distance
  const zeroDist = service.calculateDistanceKm(26.1856, 91.7539, 26.1856, 91.7539)
  assert(zeroDist === 0, 'Distance between identical points is 0 km')

  // Known points: Guwahati (26.1856, 91.7539) to Dispur (26.1433, 91.7898) ~ 5-6 km
  const dist = service.calculateDistanceKm(26.1856, 91.7539, 26.1433, 91.7898)
  assert(dist > 4 && dist < 8, `Haversine distance is accurate: got ${dist.toFixed(2)} km`)

  // Formatted distance strings
  assert(service.formatDistance(0.45) === '450 m', 'Formats meters correctly for < 1km')
  assert(service.formatDistance(2.345) === '2.3 km', 'Formats km correctly for >= 1km')

  // Compass Bearing: Guwahati to North point (27.1856, 91.7539) should be approx 0/360 (North)
  const bearingNorth = service.calculateCompassBearing(26.1856, 91.7539, 27.1856, 91.7539)
  assert(bearingNorth.compassDirection === 'North', `North bearing direction: ${bearingNorth.compassDirection}`)
  assert(bearingNorth.bearingDegrees >= 355 || bearingNorth.bearingDegrees <= 5, `North bearing angle: ${bearingNorth.bearingDegrees}°`)

  // Bearing South (25.1856, 91.7539)
  const bearingSouth = service.calculateCompassBearing(26.1856, 91.7539, 25.1856, 91.7539)
  assert(bearingSouth.compassDirection === 'South', `South bearing direction: ${bearingSouth.compassDirection}`)
  assert(Math.abs(bearingSouth.bearingDegrees - 180) < 5, `South bearing angle ~180°: ${bearingSouth.bearingDegrees}°`)

  // 6. Free Google Maps Link Generation
  console.log('\n6. Free Maps URL Generation:')
  const mapLink = service.generateGoogleMapsUrl(26.1856, 91.7539)
  assert(mapLink === 'https://www.google.com/maps?q=26.1856,91.7539', 'Uses free non-paid maps URL')

  // 7. Component Files Check
  console.log('\n7. Component and Style Files Check:')
  const files = [
    'src/emergency/emergencyContactService.js',
    'src/emergency/TakeMeHome.jsx',
    'src/emergency/TakeMeHome.css',
    'src/emergency/CaregiverEmergencySection.jsx',
    'src/emergency/CaregiverEmergencySection.css',
  ]
  for (const f of files) {
    assert(existsSync(join(process.cwd(), f)), `File exists: ${f}`)
  }

  // 8. App.jsx Integration Check
  console.log('\n8. App.jsx Integration Verification:')
  const appCode = readFileSync(join(process.cwd(), 'src/App.jsx'), 'utf-8')
  assert(appCode.includes("import TakeMeHome from './emergency/TakeMeHome'"), 'TakeMeHome imported in App.jsx')
  assert(appCode.includes("import CaregiverEmergencySection from './emergency/CaregiverEmergencySection'"), 'CaregiverEmergencySection imported in App.jsx')
  assert(appCode.includes("view === 'take-me-home'"), 'take-me-home view branch exists in App.jsx')
  assert(appCode.includes("onOpenTakeMeHome={() => navigateTo('take-me-home')}"), 'onOpenTakeMeHome handlers wired')
  assert(appCode.includes("<CaregiverEmergencySection onPreviewTakeMeHome={onOpenTakeMeHome} />"), 'CaregiverEmergencySection connected in CaregiverDashboard')

  // 9. TakeMeHome.jsx Safety and Accidental Touch Protection Check
  console.log('\n9. Safety Notice & Accidental Call Protection in TakeMeHome.jsx:')
  const tmhCode = readFileSync(join(process.cwd(), 'src/emergency/TakeMeHome.jsx'), 'utf-8')
  assert(tmhCode.includes('callConfirmation'), 'Confirmation state exists for accidental call prevention')
  assert(tmhCode.includes('executeCall'), 'Explicit user confirmation required to trigger tel: calls')
  assert(tmhCode.includes('If you are lost or feel unsafe'), 'Required safety notice text present')
  assert(tmhCode.includes('112'), '112 Helpline option present')
  assert(tmhCode.includes('🆘 SOS'), 'Large 🆘 SOS button present')

  console.log(`\n========================================`)
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`)
  console.log(`========================================`)

  if (failed > 0) process.exit(1)
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err)
  process.exit(1)
})
