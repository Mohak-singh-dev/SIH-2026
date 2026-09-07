/**
 * src/games/WordRecall/wordBanks.js
 * 
 * Curated multilingual word lists for Word Recall across all 10 supported languages:
 * 1. English (en)
 * 2. Hindi (hi)
 * 3. Assamese (as)
 * 4. Bengali (bn)
 * 5. Meitei / Manipuri (mni)
 * 6. Khasi (kha)
 * 7. Mizo (lus)
 * 8. Garo (grt)
 * 9. Bodo (brx)
 * 10. Kokborok (trp)
 * 
 * Each language has familiar, recognizable everyday nouns (fruits, animals, objects)
 * appropriate for elderly cognitive recall exercises.
 */

export const WORD_BANKS = {
  en: {
    pool: [
      { word: 'Mango', emoji: '🥭' },
      { word: 'Bus', emoji: '🚌' },
      { word: 'Dog', emoji: '🐕' },
      { word: 'Flower', emoji: '🌸' },
      { word: 'Chair', emoji: '🪑' },
      { word: 'Book', emoji: '📚' },
      { word: 'Umbrella', emoji: '☂️' },
    ],
    distractors: ['Cat', 'Apple', 'Train', 'Table', 'Shoe', 'Bird', 'Clock', 'Ball'],
    levels: {
      2: [
        { word: 'Apple', emoji: '🍎' },
        { word: 'Train', emoji: '🚂' },
        { word: 'Key', emoji: '🔑' },
        { word: 'Flower', emoji: '🌸' },
        { word: 'Cup', emoji: '☕' },
      ],
      3: [
        { word: 'Bottle', emoji: '🧴' },
        { word: 'Garden', emoji: '🌳' },
        { word: 'Clock', emoji: '🕐' },
        { word: 'Banana', emoji: '🍌' },
        { word: 'Doctor', emoji: '🩺' },
        { word: 'Window', emoji: '🪟' },
        { word: 'Bicycle', emoji: '🚲' },
      ],
    },
  },

  hi: {
    pool: [
      { word: 'आम', emoji: '🥭' },
      { word: 'बस', emoji: '🚌' },
      { word: 'कुत्ता', emoji: '🐕' },
      { word: 'फूल', emoji: '🌸' },
      { word: 'कुर्सी', emoji: '🪑' },
      { word: 'किताब', emoji: '📚' },
      { word: 'छाता', emoji: '☂️' },
    ],
    distractors: ['बिल्ली', 'सेब', 'रेल', 'मेज', 'जूता', 'चिड़िया', 'घड़ी', 'गेंद'],
    levels: {
      2: [
        { word: 'सेब', emoji: '🍎' },
        { word: 'रेल', emoji: '🚂' },
        { word: 'चाबी', emoji: '🔑' },
        { word: 'फूल', emoji: '🌸' },
        { word: 'चाय', emoji: '☕' },
      ],
      3: [
        { word: 'बोतल', emoji: '🧴' },
        { word: 'बगीचा', emoji: '🌳' },
        { word: 'घड़ी', emoji: '🕐' },
        { word: 'केला', emoji: '🍌' },
        { word: 'डॉक्टर', emoji: '🩺' },
        { word: 'खिड़की', emoji: '🪟' },
        { word: 'साइकिल', emoji: '🚲' },
      ],
    },
  },

  as: {
    pool: [
      { word: 'আম', emoji: '🥭' },
      { word: 'বাছ', emoji: '🚌' },
      { word: 'কুকুৰ', emoji: '🐕' },
      { word: 'ফুল', emoji: '🌸' },
      { word: 'চকী', emoji: '🪑' },
      { word: 'কিতাপ', emoji: '📚' },
      { word: 'ছাতি', emoji: '☂️' },
    ],
    distractors: ['মেকুৰী', 'আপেল', 'ৰে’ল', 'মেজ', 'জোতা', 'চৰাই', 'ঘড়ী', 'বল'],
    levels: {
      2: [
        { word: 'আপেল', emoji: '🍎' },
        { word: 'ৰে’ল', emoji: '🚂' },
        { word: 'চাবি', emoji: '🔑' },
        { word: 'ফুল', emoji: '🌸' },
        { word: 'চাহ', emoji: '☕' },
      ],
      3: [
        { word: 'বটল', emoji: '🧴' },
        { word: 'বাগান', emoji: '🌳' },
        { word: 'ঘড়ী', emoji: '🕐' },
        { word: 'কল', emoji: '🍌' },
        { word: 'চিকিৎসক', emoji: '🩺' },
        { word: 'খিৰিকী', emoji: '🪟' },
        { word: 'চাইকেল', emoji: '🚲' },
      ],
    },
  },

  bn: {
    pool: [
      { word: 'আম', emoji: '🥭' },
      { word: 'বাস', emoji: '🚌' },
      { word: 'কুকুর', emoji: '🐕' },
      { word: 'ফুল', emoji: '🌸' },
      { word: 'চেয়ার', emoji: '🪑' },
      { word: 'বই', emoji: '📚' },
      { word: 'ছাতা', emoji: '☂️' },
    ],
    distractors: ['বিড়াল', 'আপেল', 'ট্রেন', 'টেবিল', 'জুতো', 'পাখি', 'ঘড়ি', 'বল'],
    levels: {
      2: [
        { word: 'আপেল', emoji: '🍎' },
        { word: 'ট্রেন', emoji: '🚂' },
        { word: 'চাবি', emoji: '🔑' },
        { word: 'ফুল', emoji: '🌸' },
        { word: 'চা', emoji: '☕' },
      ],
      3: [
        { word: 'বোতল', emoji: '🧴' },
        { word: 'বাগান', emoji: '🌳' },
        { word: 'ঘড়ি', emoji: '🕐' },
        { word: 'কলা', emoji: '🍌' },
        { word: 'ডাক্তার', emoji: '🩺' },
        { word: 'জানালা', emoji: '🪟' },
        { word: 'সাইকেল', emoji: '🚲' },
      ],
    },
  },

  mni: {
    pool: [
      { word: 'হেইনোউ', emoji: '🥭' },
      { word: 'গারি', emoji: '🚌' },
      { word: 'হুই', emoji: '🐕' },
      { word: 'লৈ', emoji: '🌸' },
      { word: 'চৌকি', emoji: '🪑' },
      { word: 'লাইরিক', emoji: '📚' },
      { word: 'সেকপিন', emoji: '☂️' },
    ],
    distractors: ['হৌদোং', 'সেও', 'রেল', 'মেজ', 'খোংউপ', 'উচেক', 'পুং', 'বল'],
    levels: {
      2: [
        { word: 'সেও', emoji: '🍎' },
        { word: 'রেল', emoji: '🚂' },
        { word: 'সোবি', emoji: '🔑' },
        { word: 'লৈ', emoji: '🌸' },
        { word: 'চা', emoji: '☕' },
      ],
      3: [
        { word: 'বোতল', emoji: '🧴' },
        { word: 'লৈকোল', emoji: '🌳' },
        { word: 'পুং', emoji: '🕐' },
        { word: 'লাফোই', emoji: '🍌' },
        { word: 'দাক্তর', emoji: '🩺' },
        { word: 'থোংনাও', emoji: '🪟' },
        { word: 'সাইকল', emoji: '🚲' },
      ],
    },
  },

  kha: {
    pool: [
      { word: 'Sohrmon', emoji: '🥭' },
      { word: 'Kali', emoji: '🚌' },
      { word: 'Ksew', emoji: '🐕' },
      { word: 'Syntiew', emoji: '🌸' },
      { word: 'Shuki', emoji: '🪑' },
      { word: 'Kot', emoji: '📚' },
      { word: 'Shatri', emoji: '☂️' },
    ],
    distractors: ['Miaw', 'Sohopil', 'Rel', 'Miej', 'Juti', 'Sim', 'Baje', 'Bol'],
    levels: {
      2: [
        { word: 'Sohopil', emoji: '🍎' },
        { word: 'Rel', emoji: '🚂' },
        { word: 'Chabi', emoji: '🔑' },
        { word: 'Syntiew', emoji: '🌸' },
        { word: 'Sha', emoji: '☕' },
      ],
      3: [
        { word: 'Bitor', emoji: '🧴' },
        { word: 'Kper', emoji: '🌳' },
        { word: 'Baje', emoji: '🕐' },
        { word: 'Sohkait', emoji: '🍌' },
        { word: 'Doktor', emoji: '🩺' },
        { word: 'Iit-khmat', emoji: '🪟' },
        { word: 'Saisikil', emoji: '🚲' },
      ],
    },
  },

  lus: {
    pool: [
      { word: 'Theihai', emoji: '🥭' },
      { word: 'Bus', emoji: '🚌' },
      { word: 'Ui', emoji: '🐕' },
      { word: 'Pangpar', emoji: '🌸' },
      { word: 'Ṭhutthleng', emoji: '🪑' },
      { word: 'Lehkhabu', emoji: '📚' },
      { word: 'Nihliap', emoji: '☂️' },
    ],
    distractors: ['Zawhte', 'Epol', 'Rel', 'Dawhkan', 'Pheikhawk', 'Sava', 'Sana', 'Ball'],
    levels: {
      2: [
        { word: 'Epol', emoji: '🍎' },
        { word: 'Rel', emoji: '🚂' },
        { word: 'Chabi', emoji: '🔑' },
        { word: 'Pangpar', emoji: '🌸' },
        { word: 'Thingpui', emoji: '☕' },
      ],
      3: [
        { word: 'Bur', emoji: '🧴' },
        { word: 'Huan', emoji: '🌳' },
        { word: 'Sana', emoji: '🕐' },
        { word: 'Bawrhsal', emoji: '🍌' },
        { word: 'Doctor', emoji: '🩺' },
        { word: 'Tukverh', emoji: '🪟' },
        { word: 'Bicycle', emoji: '🚲' },
      ],
    },
  },

  grt: {
    pool: [
      { word: 'Te·gatchu', emoji: '🥭' },
      { word: 'Gari', emoji: '🚌' },
      { word: 'Achak', emoji: '🐕' },
      { word: 'Bibal', emoji: '🌸' },
      { word: 'Asongchakani', emoji: '🪑' },
      { word: 'Ki·tap', emoji: '📚' },
      { word: 'Chhatri', emoji: '☂️' },
    ],
    distractors: ['Menggo', 'Komla', 'Rel', 'Tebil', 'Juta', 'Do·o', 'Ghari', 'Bol'],
    levels: {
      2: [
        { word: 'Komla', emoji: '🍎' },
        { word: 'Rel', emoji: '🚂' },
        { word: 'Chabi', emoji: '🔑' },
        { word: 'Bibal', emoji: '🌸' },
        { word: 'Cha', emoji: '☕' },
      ],
      3: [
        { word: 'Botol', emoji: '🧴' },
        { word: 'Bagicha', emoji: '🌳' },
        { word: 'Ghari', emoji: '🕐' },
        { word: 'Te·rek', emoji: '🍌' },
        { word: 'Daktar', emoji: '🩺' },
        { word: 'Kelki', emoji: '🪟' },
        { word: 'Sikel', emoji: '🚲' },
      ],
    },
  },

  brx: {
    pool: [
      { word: 'थायजौ', emoji: '🥭' },
      { word: 'बास', emoji: '🚌' },
      { word: 'सेमा', emoji: '🐕' },
      { word: 'बबार', emoji: '🌸' },
      { word: 'सिरा', emoji: '🪑' },
      { word: 'बिजाब', emoji: '📚' },
      { word: 'साथा', emoji: '☂️' },
    ],
    distractors: ['मावजि', 'सेओ', 'रेल', 'मेज', 'जुथा', 'दाव', 'घोरि', 'बल'],
    levels: {
      2: [
        { word: 'सेओ', emoji: '🍎' },
        { word: 'रेल', emoji: '🚂' },
        { word: 'साबि', emoji: '🔑' },
        { word: 'बबार', emoji: '🌸' },
        { word: 'साहा', emoji: '☕' },
      ],
      3: [
        { word: 'बथल', emoji: '🧴' },
        { word: 'बागान', emoji: '🌳' },
        { word: 'घोरि', emoji: '🕐' },
        { word: 'थालाइ', emoji: '🍌' },
        { word: 'दाक्थोर', emoji: '🩺' },
        { word: 'खिरखि', emoji: '🪟' },
        { word: 'साइकल', emoji: '🚲' },
      ],
    },
  },

  trp: {
    pool: [
      { word: 'Thaychu', emoji: '🥭' },
      { word: 'Bos', emoji: '🚌' },
      { word: 'Achuk', emoji: '🐕' },
      { word: 'Khumpui', emoji: '🌸' },
      { word: 'Choki', emoji: '🪑' },
      { word: 'Rwchapmung', emoji: '📚' },
      { word: 'Chhata', emoji: '☂️' },
    ],
    distractors: ['Mwi', 'Appel', 'Rel', 'Tebil', 'Juta', 'Toksa', 'Ghari', 'Bol'],
    levels: {
      2: [
        { word: 'Appel', emoji: '🍎' },
        { word: 'Rel', emoji: '🚂' },
        { word: 'Chabi', emoji: '🔑' },
        { word: 'Khumpui', emoji: '🌸' },
        { word: 'Cha', emoji: '☕' },
      ],
      3: [
        { word: 'Botol', emoji: '🧴' },
        { word: 'Bagan', emoji: '🌳' },
        { word: 'Ghari', emoji: '🕐' },
        { word: 'Thaichu', emoji: '🍌' },
        { word: 'Daktar', emoji: '🩺' },
        { word: 'Khirkhi', emoji: '🪟' },
        { word: 'Saikel', emoji: '🚲' },
      ],
    },
  },
}

export function getWordBankForLanguage(langCode = 'en') {
  return WORD_BANKS[langCode] || WORD_BANKS.en
}
