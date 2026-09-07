import { Home, Brain, NotebookPen, ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react'
import { useTranslation } from '../../i18n'
import './GamesHub.css'

const GAMES = [
  {
    id: 'memory-match',
    icon: Brain,
    color: 'teal',
    title: 'Memory Match',
    subtitle: 'Visual Pair Matching',
    text: 'Match pairs of familiar, everyday pictures to gently practice visual memory and concentration.',
    levels: '3 Levels',
    levelDetails: 'Level 1 (2 pairs) • Level 2 (4 pairs) • Level 3 (6 pairs)',
    badge: 'Popular',
  },
  {
    id: 'word-recall',
    icon: NotebookPen,
    color: 'violet',
    title: 'Word Recall & Delayed Memory',
    subtitle: 'Word Recognition & Recall',
    text: 'Read everyday words, enjoy a gentle distraction activity, and see which words you recall later.',
    levels: '3 Difficulties',
    levelDetails: 'Easy (5 words) • Medium (5 words) • Hard (7 words)',
    badge: 'Recommended',
  },
  {
    id: 'different-object',
    icon: Sparkles,
    color: 'amber',
    title: 'Find the Different Object',
    subtitle: 'Category Odd-One-Out',
    text: 'Spot the object that belongs to a different category than all the others. A fun, stress-free recognition exercise.',
    levels: '3 Levels',
    levelDetails: 'Easy (6 items) • Medium (8 items) • Hard (10 items)',
    badge: 'New',
  },
]

export default function GamesHub({ onBack, onOpenGame, backLabel = 'Back to Home' }) {
  const { t } = useTranslation()
  return (
    <div className="games-hub-page">
      <header className="gh-topbar">
        <div className="container gh-topbar-inner">
          <button
            type="button"
            className="btn btn-secondary gh-back-btn"
            onClick={onBack}
            aria-label={backLabel}
          >
            <Home size={20} aria-hidden="true" />
            <span>{backLabel}</span>
          </button>
          <div className="gh-header-brand">
            <span className="icon-bubble teal" aria-hidden="true">
              <Brain size={24} />
            </span>
            <div>
              <h1 className="gh-header-title">{t('games.catalogTitle') || 'Cognitive Games'}</h1>
              <p className="gh-header-sub">{t('games.catalogSubtitle') || 'Thoughtful activities for memory, focus, and daily engagement'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container gh-main">
        {/* Supportive intro banner for elderly users */}
        <section className="gh-intro-banner" aria-label="About cognitive activities">
          <div className="gh-intro-content">
            <span className="gh-eyebrow">
              <Sparkles size={16} aria-hidden="true" /> Gentle Brain Fitness
            </span>
            <h2>Exercise your mind at your own comfortable pace</h2>
            <p>
              These games are designed specifically for clarity, comfort, and peace of mind.
              Take all the time you need. There is no rush or pressure.
            </p>
          </div>
          <div className="gh-intro-badges">
            <span><ShieldCheck size={18} aria-hidden="true" /> Stress-Free</span>
            <span><Layers size={18} aria-hidden="true" /> Level-Based</span>
          </div>
        </section>

        {/* Game cards grid */}
        <section aria-labelledby="gh-available-games-heading">
          <h2 id="gh-available-games-heading" className="gh-section-heading">Available Activities</h2>

          <div className="gh-grid">
            {GAMES.map(({ id, icon: Icon, color, title, subtitle, text, levels, levelDetails, badge }) => (
              <article
                className="gh-card"
                key={id}
                role="region"
                aria-labelledby={`game-title-${id}`}
              >
                <div className="gh-card-header">
                  <span className={`icon-bubble ${color} gh-card-icon`} aria-hidden="true">
                    <Icon size={28} />
                  </span>
                  <div className="gh-card-title-group">
                    <div className="gh-card-meta">
                      <span className="gh-badge">{badge}</span>
                      <span className="gh-level-pill">{levels}</span>
                    </div>
                    <h3 id={`game-title-${id}`} className="gh-card-title">{title}</h3>
                    <p className="gh-card-sub">{subtitle}</p>
                  </div>
                </div>

                <p className="gh-card-desc">{text}</p>

                <div className="gh-card-levels-info">
                  <Layers size={16} aria-hidden="true" />
                  <span>{levelDetails}</span>
                </div>

                <div className="gh-card-footer">
                  <button
                    type="button"
                    className="btn btn-primary gh-play-btn"
                    onClick={() => onOpenGame(id)}
                    aria-label={`Play ${title}`}
                  >
                    <span>{t('games.playGame') || 'Play Game'}</span>
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
