/**
 * src/i18n/languages.js
 * 
 * Centralized Language Metadata Configuration for MindCare NER
 * Supports English, Hindi, and 8 North-Eastern Indian languages.
 */

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    bcp47: ['en-IN', 'en-US', 'en-GB', 'en'],
    dir: 'ltr',
    region: 'International / India',
    speechSupportedByDefault: true,
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    bcp47: ['hi-IN', 'hi'],
    dir: 'ltr',
    region: 'Pan-India',
    speechSupportedByDefault: true,
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    script: 'Bengali-Assamese',
    bcp47: ['as-IN', 'as'],
    dir: 'ltr',
    region: 'Assam',
    speechSupportedByDefault: false,
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    bcp47: ['bn-IN', 'bn-BD', 'bn'],
    dir: 'ltr',
    region: 'Assam / Tripura / Bengal',
    speechSupportedByDefault: true,
  },
  {
    code: 'mni',
    name: 'Meitei / Manipuri',
    nativeName: 'মৈতৈলোন / Manipuri',
    script: 'Bengali / Meetei Mayek',
    bcp47: ['mni-IN', 'mni'],
    dir: 'ltr',
    region: 'Manipur',
    speechSupportedByDefault: false,
  },
  {
    code: 'kha',
    name: 'Khasi',
    nativeName: 'Ka Ktien Khasi',
    script: 'Latin',
    bcp47: ['kha-IN', 'kha'],
    dir: 'ltr',
    region: 'Meghalaya',
    speechSupportedByDefault: false,
  },
  {
    code: 'lus',
    name: 'Mizo',
    nativeName: 'Mizo ṭawng',
    script: 'Latin',
    bcp47: ['lus-IN', 'lus', 'mzo'],
    dir: 'ltr',
    region: 'Mizoram',
    speechSupportedByDefault: false,
  },
  {
    code: 'grt',
    name: 'Garo',
    nativeName: 'A·chik',
    script: 'Latin',
    bcp47: ['grt-IN', 'grt'],
    dir: 'ltr',
    region: 'Meghalaya',
    speechSupportedByDefault: false,
  },
  {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बड़ो',
    script: 'Devanagari',
    bcp47: ['brx-IN', 'brx'],
    dir: 'ltr',
    region: 'Assam (Bodoland)',
    speechSupportedByDefault: false,
  },
  {
    code: 'trp',
    name: 'Kokborok',
    nativeName: 'Kokborok',
    script: 'Latin / Bengali',
    bcp47: ['trp-IN', 'trp'],
    dir: 'ltr',
    region: 'Tripura',
    speechSupportedByDefault: false,
  },
]

export const DEFAULT_LANGUAGE_CODE = 'en'

export const LANGUAGE_MAP = Object.freeze(
  SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang.code] = lang
    return acc
  }, {})
)

/**
 * Helper to check if a code is valid
 */
export function isValidLanguageCode(code) {
  return typeof code === 'string' && Boolean(LANGUAGE_MAP[code.toLowerCase()])
}

/**
 * Get language metadata by code with fallback
 */
export function getLanguageMetadata(code) {
  if (!code || !LANGUAGE_MAP[code.toLowerCase()]) {
    return LANGUAGE_MAP[DEFAULT_LANGUAGE_CODE]
  }
  return LANGUAGE_MAP[code.toLowerCase()]
}
