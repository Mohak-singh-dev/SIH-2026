import { useState, useEffect, useRef, useCallback } from 'react'
import { Home, RotateCcw, ArrowRight, Trophy, Timer, Target, Brain, ArrowLeft } from 'lucide-react'
import './MemoryMatch.css'

// Simple, familiar emoji set — kept identical across levels so the
// activity always feels recognizable to elderly users.
const ICON_POOL = ['🍎', '🍌', '☕', '🏠', '🌸', '🐶', '🚗', '📚']

// Level configuration: pairs, grid columns and a gentle par time.
const LEVELS = {
  1: { pairs: 2, cols: 2, label: 'Level 1', parSeconds: 20 },
  2: { pairs: 4, cols: 4, label: 'Level 2', parSeconds: 45 },
  3: { pairs: 6, cols: 4, label: 'Level 3', parSeconds: 75 },
}

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(level) {
  const { pairs } = LEVELS[level]
  const icons = ICON_POOL.slice(0, pairs)
  const deck = shuffle([...icons, ...icons]).map((icon, i) => ({
    id: `${level}-${i}-${icon}-${Math.random().toString(36).slice(2, 7)}`,
    icon,
    flipped: false,
    matched: false,
  }))
  return deck
}

function formatTime(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function clampScore(n) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function recommendationFor(score) {
  if (score >= 80) return 'Excellent work! You can try the next level.'
  if (score >= 50) return 'Good work. Try this level again for more practice.'
  return 'Keep practicing at a comfortable pace.'
}

export default function MemoryMatch({ onBack, onBackToGames, backLabel = 'Back to Home' }) {
  const [level, setLevel] = useState(1)
  const [deck, setDeck] = useState(() => buildDeck(1))
  const [flippedIds, setFlippedIds] = useState([])
  const [matchedCount, setMatchedCount] = useState(0)
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const timerRef = useRef(null)

  const startLevel = useCallback((lvl) => {
    setDeck(buildDeck(lvl))
    setFlippedIds([])
    setMatchedCount(0)
    setMoves(0)
    setLocked(false)
    setSeconds(0)
    setRunning(false)
    setFinished(false)
  }, [])

  // Reset the game whenever the level changes.
  useEffect(() => {
    startLevel(level)
  }, [level, startLevel])

  // Timer: runs while the game is active and not yet finished.
  useEffect(() => {
    if (running && !finished) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [running, finished])

  // Clean up any pending flip-back timeout on unmount.
  const flipBackTimeout = useRef(null)
  useEffect(() => {
    return () => {
      if (flipBackTimeout.current) clearTimeout(flipBackTimeout.current)
    }
  }, [])

  const totalPairs = LEVELS[level].pairs

  const handleCardClick = (card) => {
    if (locked || card.flipped || card.matched || finished) return
    if (flippedIds.length === 2) return

    if (!running) setRunning(true)

    const nextDeck = deck.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
    const nextFlipped = [...flippedIds, card.id]
    setDeck(nextDeck)
    setFlippedIds(nextFlipped)

    if (nextFlipped.length === 2) {
      setLocked(true)
      setMoves((m) => m + 1)
      const [firstId, secondId] = nextFlipped
      const first = nextDeck.find((c) => c.id === firstId)
      const second = nextDeck.find((c) => c.id === secondId)

      if (first && second && first.icon === second.icon) {
        // Match found — keep both visible.
        flipBackTimeout.current = setTimeout(() => {
          setDeck((d) =>
            d.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
            )
          )
          setMatchedCount((mc) => {
            const updated = mc + 1
            if (updated === totalPairs) {
              setRunning(false)
              setFinished(true)
            }
            return updated
          })
          setFlippedIds([])
          setLocked(false)
        }, 450)
      } else {
        // No match — flip back after a short, calm delay.
        flipBackTimeout.current = setTimeout(() => {
          setDeck((d) =>
            d.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
            )
          )
          setFlippedIds([])
          setLocked(false)
        }, 900)
      }
    }
  }

  const handleRestart = () => {
    if (flipBackTimeout.current) clearTimeout(flipBackTimeout.current)
    startLevel(level)
  }

  const handleSelectLevel = (lvl) => {
    if (flipBackTimeout.current) clearTimeout(flipBackTimeout.current)
    setLevel(lvl)
  }

  const handleNextLevel = () => {
    if (level < 3) {
      const next = level + 1
      if (flipBackTimeout.current) clearTimeout(flipBackTimeout.current)
      setLevel(next)
    }
  }

  // Performance metrics (safe against NaN / negative values)
  const accuracy = moves > 0 ? clampScore((totalPairs / moves) * 100) : 100
  const parSeconds = LEVELS[level].parSeconds
  const timeEfficiency = clampScore(100 - (Math.max(0, seconds - parSeconds) / parSeconds) * 100)
  const score = finished ? clampScore(accuracy * 0.65 + timeEfficiency * 0.35) : 0
  const recommendation = recommendationFor(score)

  return (
    <div className="memory-match-page">
      <header className="mm-topbar">
        <div className="container mm-topbar-inner">
          <div className="mm-nav-actions">
            {onBackToGames && (
              <button
                type="button"
                className="btn btn-secondary mm-nav-btn"
                onClick={onBackToGames}
                aria-label="Back to Games"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                <span>All Games</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary mm-nav-btn"
              onClick={onBack}
              aria-label={backLabel}
            >
              <Home size={18} aria-hidden="true" />
              <span>{backLabel}</span>
            </button>
          </div>

          <div className="mm-title">
            <span className="icon-bubble teal" aria-hidden="true">
              <Brain size={22} />
            </span>
            <div>
              <h1>Memory Match</h1>
              <p>A gentle visual memory practice activity</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mm-main">
        <section className="mm-controls">
          <div className="mm-levels" role="group" aria-label="Select level">
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
          <button type="button" className="btn btn-secondary mm-restart" onClick={handleRestart}>
            <RotateCcw size={18} aria-hidden="true" />
            <span>Restart Game</span>
          </button>
        </section>

        <section className="mm-stats" aria-label="Game stats">
          <div className="mm-stat-card">
            <span className="icon-bubble violet" aria-hidden="true"><Target size={20} /></span>
            <div>
              <small>Moves</small>
              <strong>{moves}</strong>
            </div>
          </div>
          <div className="mm-stat-card">
            <span className="icon-bubble teal" aria-hidden="true"><Trophy size={20} /></span>
            <div>
              <small>Matched Pairs</small>
              <strong>{matchedCount} / {totalPairs}</strong>
            </div>
          </div>
          <div className="mm-stat-card">
            <span className="icon-bubble amber" aria-hidden="true"><Timer size={20} /></span>
            <div>
              <small>Time</small>
              <strong>{formatTime(seconds)}</strong>
            </div>
          </div>
        </section>

        <p className="mm-instructions">
          Tap two cards to reveal them. Find every matching pair to complete the level.
        </p>

        <section
          className="mm-grid"
          style={{ '--mm-cols': LEVELS[level].cols }}
          aria-label={`Memory match board, ${LEVELS[level].label}`}
        >
          {deck.map((card) => {
            const isVisible = card.flipped || card.matched
            return (
              <button
                key={card.id}
                type="button"
                className={`mm-card ${isVisible ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''}`}
                onClick={() => handleCardClick(card)}
                disabled={card.matched || finished}
                aria-label={isVisible ? `Card showing ${card.icon}` : 'Hidden card, tap to reveal'}
              >
                <div className="mm-card-inner">
                  <div className="mm-card-face mm-card-back" aria-hidden="true">
                    <Brain size={28} />
                  </div>
                  <div className="mm-card-face mm-card-front" aria-hidden="true">
                    <span>{card.icon}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </section>
      </main>

      {finished && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal mm-result-modal">
            <span className="icon-bubble teal mm-result-icon"><Trophy size={30} /></span>
            <h2>{LEVELS[level].label} completed!</h2>
            <p className="mm-result-sub">Here is a look at your cognitive activity session.</p>

            <div className="mm-result-grid">
              <div className="mm-result-item">
                <small>Moves</small>
                <strong>{moves}</strong>
              </div>
              <div className="mm-result-item">
                <small>Accuracy</small>
                <strong>{accuracy}%</strong>
              </div>
              <div className="mm-result-item">
                <small>Time Taken</small>
                <strong>{formatTime(seconds)}</strong>
              </div>
              <div className="mm-result-item">
                <small>Game Performance</small>
                <strong>{score} / 100</strong>
              </div>
            </div>

            <p className="mm-recommendation">{recommendation}</p>

            <div className="mm-result-actions">
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
