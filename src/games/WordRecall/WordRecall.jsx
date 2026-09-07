import { useState, useEffect, useRef, useCallback } from 'react'
import { Home, RotateCcw, ArrowRight, NotebookPen, Clock3, Sparkles, Star, ArrowLeft } from 'lucide-react'
import './WordRecall.css'

// Level 1 (Easy) word pool — everyday familiar items for elderly users.
const WORD_BANK = [
  { word: 'Mango', emoji: '🥭' },
  { word: 'Bus', emoji: '🚌' },
  { word: 'Dog', emoji: '🐕' },
  { word: 'Flower', emoji: '🌸' },
  { word: 'Chair', emoji: '🪑' },
  { word: 'Book', emoji: '📚' },
  { word: 'Umbrella', emoji: '☂️' },
]

// Distractor words used only as text options during recall
const DISTRACTOR_BANK = ['Cat', 'Apple', 'Train', 'Table', 'Shoe', 'Bird', 'Clock', 'Ball']

// Level configuration
const LEVELS = {
  1: {
    id: 1,
    difficulty: 'Easy',
    label: 'Level 1 — Easy',
    tagline: '5 simple words, plenty of time to look.',
    learningSeconds: 25,
    mode: 'random',
    count: 5,
    distractorCount: 3,
  },
  2: {
    id: 2,
    difficulty: 'Medium',
    label: 'Level 2 — Medium',
    tagline: '5 words, a little less time, more choices.',
    learningSeconds: 20,
    mode: 'fixed',
    words: [
      { word: 'Apple', emoji: '🍎' },
      { word: 'Train', emoji: '🚂' },
      { word: 'Key', emoji: '🔑' },
      { word: 'Flower', emoji: '🌸' },
      { word: 'Cup', emoji: '☕' },
    ],
    distractorWords: ['Bus', 'Dog', 'Chair', 'Mango', 'Book'],
  },
  3: {
    id: 3,
    difficulty: 'Hard',
    label: 'Level 3 — Hard',
    tagline: '7 words, shorter viewing time, more choices.',
    learningSeconds: 15,
    mode: 'fixed',
    words: [
      { word: 'Bottle', emoji: '🧴' },
      { word: 'Garden', emoji: '🌳' },
      { word: 'Clock', emoji: '🕐' },
      { word: 'Banana', emoji: '🍌' },
      { word: 'Doctor', emoji: '🩺' },
      { word: 'Window', emoji: '🪟' },
      { word: 'Bicycle', emoji: '🚲' },
    ],
    distractorWords: ['Table', 'Mirror', 'Basket', 'Ladder', 'Bench', 'Cupboard'],
  },
}

// Low-stakes distraction questions between immediate and delayed recall
const DISTRACTION_QUESTIONS = [
  { prompt: 'What color is the sky?', options: ['Blue', 'Green', 'Purple'] },
  { prompt: 'What comes after 2?', options: ['1', '3', '5'] },
  { prompt: 'Which one is a fruit?', options: ['Banana', 'Chair', 'Bus'] },
  { prompt: 'What is 1 + 1?', options: ['1', '2', '3'] },
]

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildOptions(targetWords, distractorPool, distractorCount) {
  const distractors = shuffle(distractorPool).slice(0, distractorCount)
  return shuffle([...targetWords, ...distractors])
}

function scoreSelection(selected, targetWords) {
  const correct = targetWords.filter((w) => selected.includes(w))
  const incorrect = selected.filter((w) => !targetWords.includes(w))
  const missed = targetWords.filter((w) => !selected.includes(w))
  const accuracy = targetWords.length
    ? Math.round((correct.length / targetWords.length) * 100)
    : 0
  return { correct, incorrect, missed, accuracy }
}

function encouragement() {
  const messages = [
    'Great effort! Let’s continue.',
    'Well done taking part today.',
    'Nice work! Every bit of practice helps.',
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export default function WordRecall({ onBack, onBackToGames, backLabel = 'Back to Home' }) {
  const [level, setLevel] = useState(1)

  // step: levelSelect | intro | learning | immediate | distraction | delayed | result
  const [step, setStep] = useState('levelSelect')
  const [targetWords, setTargetWords] = useState([])
  const [secondsLeft, setSecondsLeft] = useState(LEVELS[1].learningSeconds)

  const [immediateOptions, setImmediateOptions] = useState([])
  const [immediateSelected, setImmediateSelected] = useState([])
  const [immediateResult, setImmediateResult] = useState(null)

  const [distractionIndex, setDistractionIndex] = useState(0)

  const [delayedOptions, setDelayedOptions] = useState([])
  const [delayedSelected, setDelayedSelected] = useState([])
  const [delayedResult, setDelayedResult] = useState(null)

  const stepStartRef = useRef(Date.now())
  const timerRef = useRef(null)
  const targetWordsPlain = useRef([])

  const setupGame = useCallback((levelId) => {
    const cfg = LEVELS[levelId]
    let wordObjs
    let distractorPool
    let distractorCount

    if (cfg.mode === 'random') {
      wordObjs = shuffle(WORD_BANK).slice(0, cfg.count)
      const chosen = wordObjs.map((w) => w.word)
      const leftover = WORD_BANK.map((w) => w.word).filter((w) => !chosen.includes(w))
      distractorPool = [...leftover, ...DISTRACTOR_BANK]
      distractorCount = cfg.distractorCount
    } else {
      wordObjs = cfg.words
      distractorPool = cfg.distractorWords
      distractorCount = cfg.distractorWords.length
    }

    const targets = wordObjs.map((w) => w.word)
    setTargetWords(wordObjs.map((w) => `${w.emoji} ${w.word}`))
    setImmediateOptions(buildOptions(targets, distractorPool, distractorCount))
    setDelayedOptions(buildOptions(targets, distractorPool, distractorCount))
    setImmediateSelected([])
    setDelayedSelected([])
    setImmediateResult(null)
    setDelayedResult(null)
    setDistractionIndex(0)
    setSecondsLeft(cfg.learningSeconds)
    return targets
  }, [])

  const handleSelectLevel = (levelId) => {
    setLevel(levelId)
    setStep('intro')
  }

  const handleStart = () => {
    targetWordsPlain.current = setupGame(level)
    setStep('learning')
  }

  // Learning-phase countdown
  useEffect(() => {
    if (step !== 'learning') return undefined
    if (secondsLeft <= 0) {
      goToImmediateRecall()
      return undefined
    }
    timerRef.current = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, secondsLeft])

  function goToImmediateRecall() {
    stepStartRef.current = Date.now()
    setStep('immediate')
  }

  function toggleWord(list, setList, word) {
    setList(list.includes(word) ? list.filter((w) => w !== word) : [...list, word])
  }

  function handleSubmitImmediate() {
    const responseTime = Math.max(1, Math.round((Date.now() - stepStartRef.current) / 1000))
    const result = { ...scoreSelection(immediateSelected, targetWordsPlain.current), responseTime }
    setImmediateResult(result)
    setStep('distraction')
  }

  function handleContinueToDelayed() {
    stepStartRef.current = Date.now()
    setStep('delayed')
  }

  function handleDistractionAnswer() {
    if (distractionIndex + 1 >= DISTRACTION_QUESTIONS.length) {
      handleContinueToDelayed()
    } else {
      setDistractionIndex((i) => i + 1)
    }
  }

  function handleSubmitDelayed() {
    const responseTime = Math.max(1, Math.round((Date.now() - stepStartRef.current) / 1000))
    const result = { ...scoreSelection(delayedSelected, targetWordsPlain.current), responseTime }
    setDelayedResult(result)

    const record = {
      gameName: 'Word Recall & Delayed Recall',
      dateTime: new Date().toISOString(),
      level,
      difficulty: LEVELS[level].difficulty,
      wordsShown: targetWordsPlain.current,
      immediateCorrect: immediateResult?.correct.length ?? 0,
      delayedCorrect: result.correct.length,
      delayedAccuracy: result.accuracy,
    }
    // Log result for patient analytics if connected
    console.log('Word Recall session result:', record)

    setStep('result')
  }

  function handlePlayAgain() {
    targetWordsPlain.current = setupGame(level)
    setStep('intro')
  }

  function handleNextLevel() {
    const next = level + 1
    if (!LEVELS[next]) return
    setLevel(next)
    targetWordsPlain.current = setupGame(next)
    setStep('intro')
  }

  const learningSeconds = LEVELS[level].learningSeconds
  const progressPct = Math.round(((learningSeconds - secondsLeft) / learningSeconds) * 100)

  return (
    <div className="word-recall-page">
      <header className="wr-topbar">
        <div className="container wr-topbar-inner">
          <div className="wr-nav-actions">
            {onBackToGames && (
              <button
                type="button"
                className="btn btn-secondary wr-nav-btn"
                onClick={onBackToGames}
                aria-label="Back to Games"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                <span>All Games</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary wr-nav-btn"
              onClick={onBack}
              aria-label={backLabel}
            >
              <Home size={18} aria-hidden="true" />
              <span>{backLabel}</span>
            </button>
          </div>

          <div className="wr-title">
            <span className="icon-bubble violet" aria-hidden="true">
              <NotebookPen size={22} />
            </span>
            <div>
              <h1>Word Recall & Memory</h1>
              <p>
                {step === 'levelSelect'
                  ? 'A gentle memory recall exercise'
                  : `Memory recall activity — ${LEVELS[level].label}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container wr-main">
        {step === 'levelSelect' && (
          <section className="wr-panel wr-center" aria-label="Select difficulty level">
            <span className="icon-bubble violet wr-big-icon" aria-hidden="true">
              <NotebookPen size={32} />
            </span>
            <h2>Choose Difficulty</h2>
            <p className="wr-lead">Pick how you would like to play today. Take all the time you need.</p>
            <div className="wr-level-grid">
              {[1, 2, 3].map((id) => (
                <button
                  key={id}
                  type="button"
                  className="wr-level-card"
                  onClick={() => handleSelectLevel(id)}
                  aria-label={`${LEVELS[id].label}: ${LEVELS[id].tagline}`}
                >
                  <div className="wr-level-card-top">
                    <strong>{LEVELS[id].label}</strong>
                    <span className="wr-level-difficulty">{LEVELS[id].difficulty}</span>
                  </div>
                  <span>{LEVELS[id].tagline}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 'intro' && (
          <section className="wr-panel wr-center" aria-label="Game introduction">
            <span className="icon-bubble violet wr-big-icon" aria-hidden="true">
              <NotebookPen size={32} />
            </span>
            <h2>{LEVELS[level].label}</h2>
            <p className="wr-lead">
              A list of familiar words will appear on screen. Look at them and try to remember as many as you can.
              We will ask you about them in a little bit!
            </p>
            <div className="wr-actions-row">
              <button
                type="button"
                className="btn btn-secondary wr-btn-back"
                onClick={() => setStep('levelSelect')}
              >
                Change Level
              </button>
              <button
                type="button"
                className="btn btn-primary wr-start"
                onClick={handleStart}
              >
                <span>Start Game</span>
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {step === 'learning' && (
          <section className="wr-panel wr-center" aria-label="Learning phase">
            <p className="wr-instructions">Take your time to look at and remember these words:</p>
            <div className="wr-word-grid">
              {targetWords.map((w) => (
                <div className="wr-word-card" key={w}>
                  {w}
                </div>
              ))}
            </div>
            <div className="wr-timer-indicator">
              <Clock3 size={18} aria-hidden="true" />
              <span>Viewing time remaining: <strong>{secondsLeft}s</strong></span>
            </div>
            <div className="wr-progress-track" aria-hidden="true">
              <div className="wr-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <button
              type="button"
              className="btn btn-primary wr-ready"
              onClick={goToImmediateRecall}
              aria-label="I'm ready to proceed to recall"
            >
              <span>I’m Ready</span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </section>
        )}

        {step === 'immediate' && (
          <section className="wr-panel wr-center" aria-label="Immediate recall">
            <p className="wr-instructions">Which words do you remember from the list?</p>
            <p className="wr-sub-instructions">Tap each word you saw to select it:</p>
            <div className="wr-options-grid">
              {immediateOptions.map((word) => (
                <button
                  key={word}
                  type="button"
                  className={`wr-option ${immediateSelected.includes(word) ? 'is-selected' : ''}`}
                  onClick={() => toggleWord(immediateSelected, setImmediateSelected, word)}
                  aria-pressed={immediateSelected.includes(word)}
                >
                  {word}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary wr-submit"
              onClick={handleSubmitImmediate}
            >
              Submit Answers
            </button>
          </section>
        )}

        {step === 'distraction' && (
          <section className="wr-panel wr-center" aria-label="Gentle brain break">
            <span className="icon-bubble amber wr-big-icon" aria-hidden="true">
              <Sparkles size={30} />
            </span>
            <h2>Quick Question Break</h2>
            <p className="wr-distraction-prompt">{DISTRACTION_QUESTIONS[distractionIndex].prompt}</p>
            <div className="wr-options-grid wr-distraction-grid">
              {DISTRACTION_QUESTIONS[distractionIndex].options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="wr-option wr-distraction-option"
                  onClick={handleDistractionAnswer}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="wr-skip-link"
              onClick={handleContinueToDelayed}
            >
              Skip to Delayed Recall →
            </button>
          </section>
        )}

        {step === 'delayed' && (
          <section className="wr-panel wr-center" aria-label="Delayed recall">
            <p className="wr-instructions">Now, can you recall the words from earlier?</p>
            <p className="wr-sub-instructions">Tap every word you remember seeing initially:</p>
            <div className="wr-options-grid">
              {delayedOptions.map((word) => (
                <button
                  key={word}
                  type="button"
                  className={`wr-option ${delayedSelected.includes(word) ? 'is-selected' : ''}`}
                  onClick={() => toggleWord(delayedSelected, setDelayedSelected, word)}
                  aria-pressed={delayedSelected.includes(word)}
                >
                  {word}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary wr-submit"
              onClick={handleSubmitDelayed}
            >
              Submit Final Answers
            </button>
          </section>
        )}

        {step === 'result' && immediateResult && delayedResult && (
          <section className="wr-panel wr-center" aria-label="Session summary">
            <span className="icon-bubble teal wr-big-icon" aria-hidden="true">
              <Clock3 size={32} />
            </span>
            <h2>Level Completed!</h2>
            <p className="wr-lead" style={{ marginBottom: 20 }}>{LEVELS[level].label}</p>

            <div className="wr-result-grid">
              <div className="wr-result-item">
                <small>Immediate Recall</small>
                <strong>{immediateResult.correct.length} / {targetWordsPlain.current.length}</strong>
                <span>{immediateResult.accuracy}% accurate</span>
              </div>
              <div className="wr-result-item">
                <small>Delayed Recall</small>
                <strong>{delayedResult.correct.length} / {targetWordsPlain.current.length}</strong>
                <span>{delayedResult.accuracy}% accurate</span>
              </div>
            </div>

            <div className="wr-recommendation">
              {LEVELS[level + 1] ? (
                <p>{encouragement()}</p>
              ) : (
                <p>
                  <Star size={18} style={{ verticalAlign: '-3px', marginRight: 8, color: '#e5a100' }} />
                  Outstanding! You have finished all three levels!
                </p>
              )}
            </div>

            <div className="wr-result-actions">
              <button type="button" className="btn btn-secondary" onClick={handlePlayAgain}>
                <RotateCcw size={18} aria-hidden="true" /> Play Again
              </button>
              {LEVELS[level + 1] && (
                <button type="button" className="btn btn-primary" onClick={handleNextLevel}>
                  Next Level ({LEVELS[level + 1].difficulty}) <ArrowRight size={18} aria-hidden="true" />
                </button>
              )}
              {onBackToGames && (
                <button type="button" className="btn btn-secondary" onClick={onBackToGames}>
                  Back to Games
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
