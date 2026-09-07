import assert from 'node:assert'
import fs from 'node:fs'

console.log('=== VERIFYING COGNITIVE GAMES INTEGRATION ===\n')

// 1. Check game files existence
const requiredFiles = [
  'src/games/GamesHub/GamesHub.jsx',
  'src/games/GamesHub/GamesHub.css',
  'src/games/MemoryMatch/MemoryMatch.jsx',
  'src/games/MemoryMatch/MemoryMatch.css',
  'src/games/WordRecall/WordRecall.jsx',
  'src/games/WordRecall/WordRecall.css',
  'src/games/DifferentObject/DifferentObject.jsx',
  'src/games/DifferentObject/DifferentObject.css',
]

for (const file of requiredFiles) {
  assert(fs.existsSync(file), `Required file missing: ${file}`)
  console.log(`✔ File exists: ${file}`)
}

// 2. Check App.jsx integration
const appContent = fs.readFileSync('src/App.jsx', 'utf8')
assert(appContent.includes("import GamesHub from './games/GamesHub/GamesHub'"), 'GamesHub import missing in App.jsx')
assert(appContent.includes("import MemoryMatch from './games/MemoryMatch/MemoryMatch'"), 'MemoryMatch import missing in App.jsx')
assert(appContent.includes("import WordRecall from './games/WordRecall/WordRecall'"), 'WordRecall import missing in App.jsx')
assert(appContent.includes("import DifferentObject from './games/DifferentObject/DifferentObject'"), 'DifferentObject import missing in App.jsx')
assert(appContent.includes("onOpenGames={() => navigateTo('games')}"), 'Features onOpenGames handler missing in App.jsx')
assert(appContent.includes("view === 'games'"), 'Games hub view route missing in App.jsx')
assert(appContent.includes("activityId === 'memory-match'"), 'Memory match route missing in App.jsx')
assert(appContent.includes("activityId === 'word-recall'"), 'Word recall route missing in App.jsx')
assert(appContent.includes("activityId === 'different-object'"), 'Different object route missing in App.jsx')
console.log('✔ App.jsx integration and routes verified')

// 3. Check GamesHub list
const ghContent = fs.readFileSync('src/games/GamesHub/GamesHub.jsx', 'utf8')
assert(ghContent.includes("id: 'memory-match'"), 'Memory match missing in GamesHub')
assert(ghContent.includes("id: 'word-recall'"), 'Word recall missing in GamesHub')
assert(ghContent.includes("id: 'different-object'"), 'Different object missing in GamesHub')
console.log('✔ GamesHub games catalog verified')

// 4. Check Memory Match game configuration
const mmContent = fs.readFileSync('src/games/MemoryMatch/MemoryMatch.jsx', 'utf8')
assert(mmContent.includes("pairs: 2, cols: 2, label: 'Level 1'"), 'Level 1 config missing in MemoryMatch')
assert(mmContent.includes("pairs: 4, cols: 4, label: 'Level 2'"), 'Level 2 config missing in MemoryMatch')
assert(mmContent.includes("pairs: 6, cols: 4, label: 'Level 3'"), 'Level 3 config missing in MemoryMatch')
assert(mmContent.includes("accuracy * 0.65 + timeEfficiency * 0.35"), 'Scoring calculation missing in MemoryMatch')
assert(mmContent.includes("recommendationFor"), 'Recommendations missing in MemoryMatch')
console.log('✔ MemoryMatch levels and scoring logic verified')

// 5. Check Word Recall game configuration
const wrContent = fs.readFileSync('src/games/WordRecall/WordRecall.jsx', 'utf8')
assert(/id:\s*1,\s*difficulty:\s*'Easy'/.test(wrContent), 'Level 1 config missing in WordRecall')
assert(/id:\s*2,\s*difficulty:\s*'Medium'/.test(wrContent), 'Level 2 config missing in WordRecall')
assert(/id:\s*3,\s*difficulty:\s*'Hard'/.test(wrContent), 'Level 3 config missing in WordRecall')
assert(wrContent.includes("learningSeconds: 25"), 'Level 1 timer config missing in WordRecall')
assert(wrContent.includes("learningSeconds: 20"), 'Level 2 timer config missing in WordRecall')
assert(wrContent.includes("learningSeconds: 15"), 'Level 3 timer config missing in WordRecall')
assert(wrContent.includes("DISTRACTION_QUESTIONS"), 'Distraction phase questions missing in WordRecall')
assert(wrContent.includes("goToImmediateRecall"), 'Immediate recall transition missing in WordRecall')
assert(wrContent.includes("handleSubmitDelayed"), 'Delayed recall submission missing in WordRecall')
console.log('✔ WordRecall levels, phases, and distractor logic verified')

// 6. Check Different Object game configuration & requirements
const diffContent = fs.readFileSync('src/games/DifferentObject/DifferentObject.jsx', 'utf8')
assert(diffContent.includes("totalItems: 6"), 'Level 1 totalItems: 6 missing in DifferentObject')
assert(diffContent.includes("totalItems: 8"), 'Level 2 totalItems: 8 missing in DifferentObject')
assert(diffContent.includes("totalItems: 10"), 'Level 3 totalItems: 10 missing in DifferentObject')
assert(diffContent.includes("CATEGORIES = {"), 'CATEGORIES definition missing in DifferentObject')
assert(diffContent.includes("fruits:"), 'Fruits category missing')
assert(diffContent.includes("animals:"), 'Animals category missing')
assert(diffContent.includes("vehicles:"), 'Vehicles category missing')
assert(diffContent.includes("clothes:"), 'Clothes category missing')
assert(diffContent.includes("food:"), 'Food category missing')
assert(diffContent.includes("vegetables:"), 'Vegetables category missing')
assert(diffContent.includes("Correct! 🎉 Well Done"), 'Correct feedback missing')
assert(diffContent.includes("Try Again 😊"), 'Wrong feedback missing')
assert(diffContent.includes("nextWrong >= 3"), '3 wrong attempts hint logic missing')
assert(diffContent.includes("speechSynthesis"), 'Voice read aloud feature missing')
assert(diffContent.includes("questionsCount: 5"), '5 questions per level missing')
console.log('✔ DifferentObject categories, levels, voice, hints, and feedback verified')

// 7. Check CSS theme support
const ghCss = fs.readFileSync('src/games/GamesHub/GamesHub.css', 'utf8')
const mmCss = fs.readFileSync('src/games/MemoryMatch/MemoryMatch.css', 'utf8')
const wrCss = fs.readFileSync('src/games/WordRecall/WordRecall.css', 'utf8')
const diffCss = fs.readFileSync('src/games/DifferentObject/DifferentObject.css', 'utf8')
assert(ghCss.includes('.dark-theme'), 'Dark theme missing in GamesHub.css')
assert(mmCss.includes('.dark-theme'), 'Dark theme missing in MemoryMatch.css')
assert(wrCss.includes('.dark-theme'), 'Dark theme missing in WordRecall.css')
assert(diffCss.includes('.dark-theme'), 'Dark theme missing in DifferentObject.css')
assert(diffCss.includes('.is-hint'), 'is-hint style missing in DifferentObject.css')
assert(diffCss.includes('.is-correct'), 'is-correct style missing in DifferentObject.css')
console.log('✔ Dark theme and UI states verified across all game stylesheets')

console.log('\n=== ALL GAMES INTEGRATION TESTS PASSED ===')
