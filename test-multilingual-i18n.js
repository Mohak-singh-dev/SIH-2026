// test-multilingual-i18n.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('\n--- 1. Testing Translation Files & Key Completeness ---')

const REQUIRED_LANGUAGES = [
  'en', 'hi', 'as', 'bn', 'mni', 'kha', 'lus', 'grt', 'brx', 'trp'
]

const translationsDir = path.join(__dirname, 'src', 'i18n', 'translations')
const enPath = path.join(translationsDir, 'en.json')

if (!fs.existsSync(enPath)) {
  console.error('FAIL: en.json does not exist')
  process.exit(1)
}

const enDict = JSON.parse(fs.readFileSync(enPath, 'utf-8'))

function extractKeys(obj, prefix = '') {
  let keys = []
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(extractKeys(v, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

const masterKeys = extractKeys(enDict).sort()
console.log(`Master 'en.json' has ${masterKeys.length} translation keys.`)

let allValid = true

for (const lang of REQUIRED_LANGUAGES) {
  const filePath = path.join(translationsDir, `${lang}.json`)
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing dictionary file for ${lang}: ${filePath}`)
    allValid = false
    continue
  }

  let content
  try {
    content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (err) {
    console.error(`FAIL: JSON syntax error in ${lang}.json:`, err.message)
    allValid = false
    continue
  }

  const langKeys = extractKeys(content).sort()
  const missingKeys = masterKeys.filter(k => !langKeys.includes(k))
  if (missingKeys.length > 0) {
    console.error(`FAIL: ${lang}.json is missing ${missingKeys.length} keys:`, missingKeys.slice(0, 5))
    allValid = false
  } else {
    console.log(`PASS: ${lang}.json is complete (${langKeys.length} keys matching master).`)
  }

  // Safety check: Ensure emergency number '112' is present in safety/sos strings
  if (content.sos && content.sos.callEmergency && !content.sos.callEmergency.includes('112')) {
    console.error(`FAIL: ${lang}.json sos.callEmergency does not contain '112'! Found: "${content.sos.callEmergency}"`)
    allValid = false
  }
  if (content.sos && content.sos.safetyNotice && !content.sos.safetyNotice.includes('112')) {
    console.error(`FAIL: ${lang}.json sos.safetyNotice does not contain '112'! Found: "${content.sos.safetyNotice}"`)
    allValid = false
  }
}

console.log('\n--- 2. Testing Configuration & Exports ---')
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE_CODE } from './src/i18n/languages.js'

if (!Array.isArray(SUPPORTED_LANGUAGES) || SUPPORTED_LANGUAGES.length !== 10) {
  console.error(`FAIL: Expected 10 SUPPORTED_LANGUAGES, found ${SUPPORTED_LANGUAGES?.length}`)
  allValid = false
} else {
  console.log(`PASS: SUPPORTED_LANGUAGES contains ${SUPPORTED_LANGUAGES.length} entries.`)
}

for (const lang of SUPPORTED_LANGUAGES) {
  if (!lang.code || !lang.name || !lang.nativeName || !lang.bcp47 || !lang.region) {
    console.error(`FAIL: Language entry missing required fields:`, lang)
    allValid = false
  }
}

console.log('\n--- 3. Testing LocalStorage Persistence Logic ---')
// Mock localStorage
const mockStorage = {}
global.localStorage = {
  getItem: (key) => mockStorage[key] ?? null,
  setItem: (key, val) => { mockStorage[key] = String(val) },
  removeItem: (key) => { delete mockStorage[key] }
}

import { saveLanguagePreference, getSavedLanguageCode } from './src/i18n/index.js'

saveLanguagePreference('hi')
if (getSavedLanguageCode() !== 'hi') {
  console.error('FAIL: saveLanguagePreference("hi") did not persist to localStorage')
  allValid = false
} else {
  console.log('PASS: saveLanguagePreference correctly saves and reads "hi".')
}

saveLanguagePreference('mni')
if (getSavedLanguageCode() !== 'mni') {
  console.error('FAIL: saveLanguagePreference("mni") failed')
  allValid = false
} else {
  console.log('PASS: saveLanguagePreference correctly saves and reads "mni".')
}

// Invalid fallback test: simulate corrupted/invalid code in storage
mockStorage['mindcare_preferred_language'] = 'invalid_code_xyz'
if (getSavedLanguageCode() !== 'en') {
  console.error('FAIL: getSavedLanguageCode should fall back to "en" for invalid codes')
  allValid = false
} else {
  console.log('PASS: Invalid language code in storage gracefully falls back to "en".')
}

console.log('\n--- 4. Testing Web Speech Voice Detection Fallback ---')
import { detectLanguageVoice } from './src/i18n/voiceDetection.js'

// In Node environment without window.speechSynthesis
const resultWithoutSpeech = detectLanguageVoice('hi')
if (resultWithoutSpeech.available !== false) {
  console.error('FAIL: detectLanguageVoice should report available=false when speechSynthesis is absent')
  allValid = false
} else {
  console.log('PASS: detectLanguageVoice handles absent speechSynthesis gracefully without error.')
}

if (!allValid) {
  console.error('\n❌ MULTILINGUAL TESTS FAILED');
  process.exit(1)
}

console.log('\n✅ ALL MULTILINGUAL SYSTEM TESTS PASSED!')
