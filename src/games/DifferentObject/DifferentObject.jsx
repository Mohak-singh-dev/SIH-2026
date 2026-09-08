import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Home, RotateCcw, ArrowRight, Trophy, Timer, Target, Sparkles,
  ArrowLeft, Volume2, HelpCircle, CheckCircle2, AlertCircle, Eye
} from 'lucide-react'
import { useTranslation } from '../../i18n'
import { speakInLanguage } from '../../i18n/voiceDetection'
import './DifferentObject.css'

// Comprehensive category pools with everyday recognizable items for elderly users
const CATEGORIES = {
  fruits: {
    name: 'Fruits',
    singular: 'fruit',
    items: [
      { name: 'Apple', emoji: '🍎' },
      { name: 'Banana', emoji: '🍌' },
      { name: 'Orange', emoji: '🍊' },
      { name: 'Grapes', emoji: '🍇' },
      { name: 'Mango', emoji: '🥭' },
      { name: 'Strawberry', emoji: '🍓' },
      { name: 'Watermelon', emoji: '🍉' },
      { name: 'Pineapple', emoji: '🍍' },
      { name: 'Pear', emoji: '🍐' },
      { name: 'Peach', emoji: '🍑' },
      { name: 'Cherry', emoji: '🍒' },
    ],
  },
  animals: {
    name: 'Animals',
    singular: 'animal',
    items: [
      { name: 'Dog', emoji: '🐶' },
      { name: 'Cat', emoji: '🐱' },
      { name: 'Elephant', emoji: '🐘' },
      { name: 'Lion', emoji: '🦁' },
      { name: 'Rabbit', emoji: '🐰' },
      { name: 'Panda', emoji: '🐼' },
      { name: 'Monkey', emoji: '🐵' },
      { name: 'Cow', emoji: '🐮' },
      { name: 'Horse', emoji: '🐴' },
      { name: 'Bear', emoji: '🐻' },
      { name: 'Sheep', emoji: '🐑' },
    ],
  },
  vehicles: {
    name: 'Vehicles',
    singular: 'vehicle',
    items: [
      { name: 'Car', emoji: '🚗' },
      { name: 'Bus', emoji: '🚌' },
      { name: 'Train', emoji: '🚂' },
      { name: 'Airplane', emoji: '✈️' },
      { name: 'Ship', emoji: '🚢' },
      { name: 'Bicycle', emoji: '🚲' },
      { name: 'Helicopter', emoji: '🚁' },
      { name: 'Ambulance', emoji: '🚑' },
      { name: 'Tractor', emoji: '🚜' },
      { name: 'Scooter', emoji: '🛵' },
    ],
  },
  clothes: {
    name: 'Clothes',
    singular: 'clothing item',
    items: [
      { name: 'Shirt', emoji: '👕' },
      { name: 'Pants', emoji: '👖' },
      { name: 'Dress', emoji: '👗' },
      { name: 'Shoe', emoji: '👟' },
      { name: 'Cap', emoji: '🧢' },
      { name: 'Coat', emoji: '🧥' },
      { name: 'Scarf', emoji: '🧣' },
      { name: 'Gloves', emoji: '🧤' },
      { name: 'Socks', emoji: '🧦' },
      { name: 'Hat', emoji: '👒' },
    ],
  },
  food: {
    name: 'Prepared Food',
    singular: 'food item',
    items: [
      { name: 'Pizza', emoji: '🍕' },
      { name: 'Burger', emoji: '🍔' },
      { name: 'Bread', emoji: '🍞' },
      { name: 'Noodles', emoji: '🍜' },
      { name: 'Rice Bowl', emoji: '🍚' },
      { name: 'Sandwich', emoji: '🥪' },
      { name: 'Pancake', emoji: '🥞' },
      { name: 'Warm Soup', emoji: '🍲' },
      { name: 'Cheese', emoji: '🧀' },
      { name: 'Boiled Egg', emoji: '🍳' },
    ],
  },
  vegetables: {
    name: 'Vegetables',
    singular: 'vegetable',
    items: [
      { name: 'Carrot', emoji: '🥕' },
      { name: 'Broccoli', emoji: '🥦' },
      { name: 'Corn', emoji: '🌽' },
      { name: 'Potato', emoji: '🥔' },
      { name: 'Tomato', emoji: '🍅' },
      { name: 'Cucumber', emoji: '🥒' },
      { name: 'Eggplant', emoji: '🍆' },
      { name: 'Onion', emoji: '🧅' },
      { name: 'Garlic', emoji: '🧄' },
      { name: 'Peas', emoji: '🥬' },
    ],
  },
}

const CATEGORY_KEYS = Object.keys(CATEGORIES)

// Level Configurations
const LEVELS = {
  1: {
    id: 1,
    label: 'Level 1 — Easy',
    subtitle: '6 objects to choose from',
    totalItems: 6, // 5 common + 1 odd
    questionsCount: 5,
  },
  2: {
    id: 2,
    label: 'Level 2 — Medium',
    subtitle: '8 objects to choose from',
    totalItems: 8, // 7 common + 1 odd
    questionsCount: 5,
  },
  3: {
    id: 3,
    label: 'Level 3 — Hard',
    subtitle: '10 objects to choose from',
    totalItems: 10, // 9 common + 1 odd
    questionsCount: 5,
  },
}

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Generate a random question data structure
function generateQuestion(totalItems, previousCommonCategory = null) {
  // Pick common category (avoid picking the exact same as previous question if possible)
  const availableCategories = CATEGORY_KEYS.filter((k) => k !== previousCommonCategory)
  const commonKey = availableCategories[Math.floor(Math.random() * availableCategories.length)]
  const commonCat = CATEGORIES[commonKey]

  // Pick odd category
  const otherKeys = CATEGORY_KEYS.filter((k) => k !== commonKey)
  const oddKey = otherKeys[Math.floor(Math.random() * otherKeys.length)]
  const oddCat = CATEGORIES[oddKey]

  // Pick (totalItems - 1) unique items from common category
  const commonPool = shuffle(commonCat.items)
  const selectedCommon = commonPool.slice(0, totalItems - 1).map((item) => ({
    ...item,
    categoryKey: commonKey,
    categoryName: commonCat.name,
    isOdd: false,
    id: `${item.name}-${Math.random().toString(36).slice(2, 7)}`,
  }))

  // Pick 1 odd item from odd category
  const oddPool = shuffle(oddCat.items)
  const selectedOdd = {
    ...oddPool[0],
    categoryKey: oddKey,
    categoryName: oddCat.name,
    isOdd: true,
    id: `${oddPool[0].name}-${Math.random().toString(36).slice(2, 7)}`,
  }

  // Combine and shuffle objects so the odd object position is completely random
  const objects = shuffle([...selectedCommon, selectedOdd])

  return {
    commonCategory: commonCat.name,
    commonSingular: commonCat.singular,
    oddCategory: oddCat.name,
    oddSingular: oddCat.singular,
    oddItem: selectedOdd,
    objects,
  }
}

function formatTime(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function DifferentObject({ onBack, onBackToGames, backLabel = 'Back to Home' }) {
  const { currentLanguage, t } = useTranslation()
  const [level, setLevel] = useState(1)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Current question states
  const [selectedId, setSelectedId] = useState(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [totalWrongAttempts, setTotalWrongAttempts] = useState(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'correct' | 'wrong' | 'hint', text: string }
  const [showHint, setShowHint] = useState(false)

  // Level statistics
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const timerRef = useRef(null)

  // Initialize questions for the level
  const initLevel = useCallback((lvl) => {
    const config = LEVELS[lvl]
    const generated = []
    let lastCategory = null

    for (let i = 0; i < config.questionsCount; i++) {
      const q = generateQuestion(config.totalItems, lastCategory)
      generated.push(q)
      lastCategory = q.commonCategory
    }

    setQuestions(generated)
    setCurrentIndex(0)
    setSelectedId(null)
    setWrongAttempts(0)
    setTotalWrongAttempts(0)
    setIsAnswered(false)
    setFeedback(null)
    setShowHint(false)
    setScore(0)
    setSeconds(0)
    setRunning(false)
    setFinished(false)
  }, [])

  useEffect(() => {
    initLevel(level)
  }, [level, initLevel])

  // Timer
  useEffect(() => {
    if (running && !finished) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [running, finished])

  // Current question data
  const currentQuestion = questions[currentIndex]

  // Optional Voice Instruction button
  const speakInstruction = () => {
    const text = t('games.findDifferentInstruction') || 'Find the object that is different from the others.'
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speakInLanguage(text, currentLanguage?.code || 'en', { rate: 0.85 })
    }
  }

  // Handle tapping an object
  const handleObjectClick = (item) => {
    if (isAnswered) return
    if (!running) setRunning(true)

    setSelectedId(item.id)

    if (item.isOdd) {
      // Correct!
      setIsAnswered(true)
      setFeedback({
        type: 'correct',
        title: 'Correct! 🎉 Well Done',
        text: `That's right! ${item.emoji} ${item.name} is an ${item.categoryName.toLowerCase()}, while all the other items are ${currentQuestion.commonCategory.toLowerCase()}.`,
      })
      setScore((s) => s + 1)
    } else {
      // Wrong!
      const nextWrong = wrongAttempts + 1
      setWrongAttempts(nextWrong)
      setTotalWrongAttempts((t) => t + 1)

      if (nextWrong >= 3) {
        // Visual hint after 3 wrong attempts
        setShowHint(true)
        setFeedback({
          type: 'hint',
          title: 'Here is a gentle hint 💡',
          text: `Most of these items are ${currentQuestion.commonCategory.toLowerCase()}. Look for the ${currentQuestion.oddItem.name} ${currentQuestion.oddItem.emoji}!`,
        })
      } else {
        setFeedback({
          type: 'wrong',
          title: 'Try Again 😊',
          text: `Take another look at the items and see which one belongs to a different group.`,
        })
      }
    }
  }

  // Move to next question or finish level
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
      setSelectedId(null)
      setWrongAttempts(0)
      setIsAnswered(false)
      setFeedback(null)
      setShowHint(false)
    } else {
      setRunning(false)
      setFinished(true)
    }
  }

  const handleRestart = () => {
    initLevel(level)
  }

  const handleSelectLevel = (lvl) => {
    setLevel(lvl)
  }

  const handleNextLevel = () => {
    if (level < 3) {
      setLevel(level + 1)
    }
  }

  // Accuracy calculation: correct / (correct + wrongAttempts) * 100
  const totalAttempts = score + totalWrongAttempts
  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 100

  return (
    <div className="diff-obj-page">
      {/* Top navigation bar */}
      <header className="diff-topbar">
        <div className="container diff-topbar-inner">
          <div className="diff-nav-actions">
            {onBackToGames && (
              <button
                type="button"
                className="btn btn-secondary diff-nav-btn"
                onClick={onBackToGames}
                aria-label="Back to Games"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                <span>All Games</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary diff-nav-btn"
              onClick={onBack}
              aria-label={backLabel}
            >
              <Home size={18} aria-hidden="true" />
              <span>{backLabel}</span>
            </button>
          </div>

          <div className="diff-title">
            <span className="icon-bubble teal" aria-hidden="true">
              <Sparkles size={22} />
            </span>
            <div>
              <h1>{t('games.findDifferentTitle') || 'Find the Different Object'}</h1>
              <p>{t('games.findDifferentInstruction') || 'A gentle category recognition game'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container diff-main">
        {/* Level selection and restart controls */}
        <section className="diff-controls">
          <div className="diff-levels" role="group" aria-label="Select difficulty level">
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`btn ${level === lvl ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleSelectLevel(lvl)}
                aria-pressed={level === lvl}
              >
                {LEVELS[lvl].label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-secondary diff-restart-btn"
            onClick={handleRestart}
          >
            <RotateCcw size={18} aria-hidden="true" />
            <span>{t('games.retry') || 'Restart'}</span>
          </button>
        </section>

        {/* Stats strip */}
        <section className="diff-stats" aria-label="Game progress">
          <div className="diff-stat-card">
            <span className="icon-bubble violet" aria-hidden="true"><Target size={20} /></span>
            <div>
              <small>Question</small>
              <strong>{currentIndex + 1} / {LEVELS[level].questionsCount}</strong>
            </div>
          </div>
          <div className="diff-stat-card">
            <span className="icon-bubble teal" aria-hidden="true"><Trophy size={20} /></span>
            <div>
              <small>{t('games.score') || 'Correct'}</small>
              <strong>{score}</strong>
            </div>
          </div>
          <div className="diff-stat-card">
            <span className="icon-bubble amber" aria-hidden="true"><Timer size={20} /></span>
            <div>
              <small>{t('games.timeTaken') || 'Time'}</small>
              <strong>{formatTime(seconds)}</strong>
            </div>
          </div>
        </section>

        {/* Instruction and Voice Read-Aloud */}
        <section className="diff-instruction-box">
          <p className="diff-instruction-text">
            {t('games.findDifferentInstruction') || 'Find the object that is different from the others.'}
          </p>
          <button
            type="button"
            className="diff-voice-btn"
            onClick={speakInstruction}
            aria-label={t('games.readAloud') || 'Read Aloud'}
            title={t('games.readAloud') || 'Read Aloud'}
          >
            <Volume2 size={20} aria-hidden="true" />
            <span>{t('games.readAloud') || 'Read Aloud'}</span>
          </button>
        </section>

        {/* Objects Grid */}
        {currentQuestion && (
          <section
            className={`diff-grid diff-grid-${level}`}
            aria-label="Items choices"
          >
            {currentQuestion.objects.map((item) => {
              const isSelected = selectedId === item.id
              const isHintItem = showHint && item.isOdd
              const isCorrectRevealed = isAnswered && item.isOdd

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`diff-card ${isSelected ? 'is-selected' : ''} ${isHintItem ? 'is-hint' : ''} ${isCorrectRevealed ? 'is-correct' : ''}`}
                  onClick={() => handleObjectClick(item)}
                  disabled={isAnswered}
                  aria-label={`${item.name}, tap to choose`}
                >
                  <span className="diff-emoji" aria-hidden="true">{item.emoji}</span>
                  <span className="diff-label">{item.name}</span>
                </button>
              )
            })}
          </section>
        )}

        {/* Feedback message banner */}
        {feedback && (
          <div className={`diff-feedback-banner ${feedback.type}`} role="alert">
            <div className="diff-feedback-header">
              {feedback.type === 'correct' && <CheckCircle2 size={24} aria-hidden="true" />}
              {feedback.type === 'wrong' && <AlertCircle size={24} aria-hidden="true" />}
              {feedback.type === 'hint' && <HelpCircle size={24} aria-hidden="true" />}
              <h3>{feedback.title}</h3>
            </div>
            <p>{feedback.text}</p>
          </div>
        )}

        {/* Next Question action button */}
        {isAnswered && (
          <div className="diff-next-wrapper">
            <button
              type="button"
              className="btn btn-primary diff-next-btn"
              onClick={handleNextQuestion}
              autoFocus
            >
              <span>{currentIndex + 1 < questions.length ? (t('games.next') || 'Next Question') : (t('games.completed') || 'View Results')}</span>
              <ArrowRight size={22} aria-hidden="true" />
            </button>
          </div>
        )}
      </main>

      {/* Completion Modal */}
      {finished && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal diff-result-modal">
            <span className="icon-bubble teal diff-result-icon"><Trophy size={32} /></span>
            <h2>{LEVELS[level].label} Completed!</h2>
            <p className="diff-result-sub">Wonderful effort practicing your category recognition!</p>

            <div className="diff-result-grid">
              <div className="diff-result-item">
                <small>Correct Answers</small>
                <strong>{score} / {LEVELS[level].questionsCount}</strong>
              </div>
              <div className="diff-result-item">
                <small>Wrong Attempts</small>
                <strong>{totalWrongAttempts}</strong>
              </div>
              <div className="diff-result-item">
                <small>Accuracy</small>
                <strong>{accuracy}%</strong>
              </div>
              <div className="diff-result-item">
                <small>Time Taken</small>
                <strong>{formatTime(seconds)}</strong>
              </div>
            </div>

            <p className="diff-recommendation">
              {score >= 4
                ? 'Excellent work! Your recognition is sharp today.'
                : 'Great participation! Repeating this level helps strengthen everyday recognition.'}
            </p>

            <div className="diff-result-actions">
              <button type="button" className="btn btn-secondary" onClick={handleRestart}>
                <RotateCcw size={18} aria-hidden="true" /> Play Again
              </button>
              {level < 3 && (
                <button type="button" className="btn btn-primary" onClick={handleNextLevel}>
                  Next Level <ArrowRight size={18} aria-hidden="true" />
                </button>
              )}
              {onBackToGames && (
                <button type="button" className="btn btn-secondary" onClick={onBackToGames}>
                  Back to Games
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
