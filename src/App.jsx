import { useState, useEffect, useRef } from 'react'
import {
  Brain, HeartHandshake, Menu, X, ArrowRight, Sparkles, Gamepad2, Mic,
  BellRing, MapPin, WifiOff, Languages, ShieldCheck, UsersRound, Activity,
  ChevronRight, Home, Check, Stethoscope, Clock3, Phone, Route, Pill,
  Heart, Lightbulb, Music, LogOut, UserRound, CalendarDays, TrendingUp,
  CircleCheck, AlertCircle, Clock, ChevronDown, Sun, Moon, Eye, EyeOff
} from 'lucide-react'
import heroImage from './assets/mindcare-hero.png'
import {
  PatientSessionProvider,
  usePatientSession,
  isPatientDeviceSetupComplete,
  saveDeviceSetup,
  clearDeviceSetup,
  isPatientSessionActive,
  saveActivePatientSession,
  clearActivePatientSession,
  getActiveSessionView,
  createActivePatientSession,
  restoreActivePatientSession,
} from './patientSession'
import { authenticatePatient, validateCaregiverPin } from './config/authConfig'


/* ─── Landing Page Data ─────────────────────────────────────────── */
const nav = ['Home', 'Features', 'How It Works', 'About', 'Contact']
const challenges = [
  ['Memory loss', Brain, 'Remembering familiar people, places and moments.'],
  ['Confusion & anxiety', Sparkles, 'Feeling disoriented during everyday routines.'],
  ['Medicine schedules', Pill, 'Keeping track of important medications.'],
  ['Daily activities', Clock3, 'Managing appointments and simple tasks.'],
  ['Caregiver visibility', UsersRound, 'Staying connected from a distance.'],
  ['Limited connectivity', WifiOff, 'Accessing support in remote locations.'],
  ['Finding the way home', Route, 'Getting safely back to a saved location.'],
]
const features = [
  ['Cognitive Games', Gamepad2, 'Thoughtful activities for memory, focus, recognition and attention.'],
  ['AI Personalization', Sparkles, 'Activities adapt gently based on progress and engagement.'],
  ['Voice Assistance', Mic, 'Simple, voice-enabled guidance made for everyday comfort.'],
  ['Smart Reminders', BellRing, 'Helpful prompts for medicines, hydration and appointments.'],
  ['Caregiver Monitoring', Activity, 'A clear view of activity, mood and cognitive engagement.'],
  ['Safe Return Home', MapPin, 'Offline-assisted guidance to a saved home location.'],
  ['Offline Support', WifiOff, 'Important assistance remains accessible with limited connectivity.'],
  ['Multilingual Support', Languages, 'English, Hindi and future North-Eastern languages.'],
]
const future = [
  ['Memory Games', Gamepad2], ['Cognitive Analytics', Activity], ['AI Voice Assistant', Mic],
  ['Medicine Reminders', Pill], ['Caregiver Dashboard', UsersRound], ['Offline Safe Navigation', MapPin],
  ['Offline Sync', WifiOff], ['Regional Languages', Languages], ['Emergency Alerts', BellRing],
]
/* ─── Shared Primitives ─────────────────────────────────────────── */
function Button({ children, kind = 'primary', className = '', ...props }) {
  return (
    <button className={`btn ${kind === 'primary' ? 'btn-primary' : 'btn-secondary'} ${className}`} {...props}>
      {children}
    </button>
  )
}
function Logo({ onClick }) {
  return (
    <a href="#home" className="logo" onClick={onClick}>
      <span className="logo-mark">
        <Brain size={22} />
        <Heart size={10} fill="currentColor" />
      </span>
      <span>MindCare <b>NER</b></span>
    </a>
  )
}

function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
      <span>{dark ? 'Light' : 'Dark'}</span>
    </button>
  )
}

/* ─── Landing Page Components ───────────────────────────────────── */
function Navbar({ openLogin, dark, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="navbar">
      <a className="skip-to-main" href="#main-content">Skip to main content</a>
      <div className="container nav-inner">
        <Logo />
        <nav className={open ? 'nav-links show' : 'nav-links'}>
          {nav.map(x => (
            <a key={x} href={`#${x.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setOpen(false)}>{x}</a>
          ))}
          <div className="mobile-actions">
            <Button kind="secondary" onClick={() => openLogin('Patient')}>Patient Login</Button>
            <Button onClick={() => openLogin('Caregiver')}>Caregiver Login</Button>
          </div>
        </nav>
        <div className="desktop-actions">
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
          <button className="text-button" onClick={() => openLogin('Patient')}>Patient Login</button>
          <Button onClick={() => openLogin('Caregiver')}>Caregiver Login</Button>
        </div>
        <button className="menu" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
function Hero({ openLogin }) {
  return (
    <section id="home" className="hero">
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> Made with care for North East India</div>
          <h1>Empowering elderly minds with <em>AI-powered</em> cognitive care.</h1>
          <p>An intelligent cognitive assistance and safety platform designed to support elderly individuals with dementia through personalized brain activities, daily assistance and caregiver support.</p>
          <div className="hero-actions">
            <Button onClick={() => openLogin('Caregiver')}>Get started <ArrowRight size={18} /></Button>
            <Button kind="secondary" onClick={() => document.querySelector('#features').scrollIntoView({ behavior: 'smooth' })}>Explore features</Button>
          </div>
          <div className="trust-row">
            <span><ShieldCheck /> Safe &amp; accessible</span>
            <span><HeartHandshake /> Built for care</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-glow" />
          <img src={heroImage} alt="An elderly woman using a tablet with a caregiver and AI cognitive support" />
          <div className="float-card activity-card">
            <span className="icon-bubble violet"><Activity size={18} /></span>
            <div><small>Today's activity</small><strong>Great progress!</strong></div>
          </div>
          <div className="float-card safe-card">
            <span className="icon-bubble coral"><Heart size={18} fill="currentColor" /></span>
            <div><small>Care circle</small><strong>Connected</strong></div>
          </div>
        </div>
      </div>
    </section>
  )
}
function SectionTitle({ eyebrow, title, text, center = true }) {
  return (
    <div className={`section-title ${center ? 'center' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}
function Challenges() {
  return (
    <section className="section soft-section">
      <div className="container">
        <SectionTitle eyebrow="Understanding the need" title="The challenge" text="Elderly individuals in remote and rural areas often have limited access to specialized cognitive care and continuous healthcare support." />
        <div className="challenge-grid">
          {challenges.map(([title, Icon, txt]) => (
            <article className="challenge-card" key={title}>
              <span className="icon-bubble amber"><Icon size={22} /></span>
              <h3>{title}</h3>
              <p>{txt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <SectionTitle eyebrow="A connected care ecosystem" title="One platform. Complete cognitive care." text="Gentle, practical support that brings patients, caregivers and healthcare workers closer together." />
        <div className="feature-grid">
          {features.map(([title, Icon, text], i) => (
            <article className="feature-card" key={title}>
              <span className={`icon-bubble ${['blue', 'violet', 'teal', 'coral'][i % 4]}`}><Icon size={21} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="feature-arrow"><ArrowRight size={17} /></span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
function HowItWorks() {
  const steps = [
    ['01', 'Create a Patient Profile', 'A caregiver or health worker creates a simple profile.'],
    ['02', 'Daily Cognitive Engagement', 'The elder enjoys clear activities at their own pace.'],
    ['03', 'AI Learns & Adapts', 'The system adjusts activities based on engagement.'],
    ['04', 'Caregivers Stay Connected', 'See activity, reminders and trends in one place.'],
  ]
  return (
    <section id="how-it-works" className="section how-section">
      <div className="container">
        <SectionTitle eyebrow="Simple from the start" title="How MindCare works" />
        <div className="steps">
          {steps.map(([no, title, text], i) => (
            <div className="step" key={no}>
              <div className="step-number">{no}</div>
              {i < 3 && <div className="step-line"><ChevronRight /></div>}
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
function SafeHome() {
  return (
    <section className="section" id="safe-home">
      <div className="container safe-home">
        <div className="home-visual">
          <div className="map-grid" />
          <div className="map-road road-a" />
          <div className="map-road road-b" />
          <div className="pin pin-home"><Home size={21} fill="currentColor" /></div>
          <div className="pin pin-user"><span /></div>
          <div className="home-button"><MapPin size={20} /><span>TAKE ME<br />HOME</span></div>
          <div className="location-note">
            <span className="icon-bubble teal"><Route size={17} /></span>
            <div><small>Saved location</small><strong>Home • 1.2 km away</strong></div>
          </div>
        </div>
        <div className="safe-copy">
          <span className="eyebrow"><MapPin size={14} /> Future safety feature</span>
          <h2>Lost or confused? <em>Let us help you get home.</em></h2>
          <p>Offline-assisted navigation will use pre-downloaded map information and GPS location to guide an elderly user toward their saved home location.</p>
          <div className="safe-list">
            {['Large emergency-friendly button', 'Simple voice-guided directions', 'GPS location assistance', 'Option to contact caregivers'].map(x => (
              <span key={x}><Check size={16} />{x}</span>
            ))}
          </div>
          <p className="disclaimer"><Lightbulb size={16} /> This feature assists users and caregivers; it does not replace supervision or emergency services.</p>
        </div>
      </div>
    </section>
  )
}
function Benefits() {
  const groups = [
    ['For Elderly Users', Heart, ['Simple & accessible technology', 'Cognitive engagement', 'Daily routine assistance', 'Greater independence']],
    ['For Caregivers', UsersRound, ['Activity monitoring', 'Reminder tracking', 'Cognitive performance insights', 'Peace of mind']],
    ['For Healthcare Workers', Stethoscope, ['Patient activity insights', 'Cognitive engagement trends', 'Remote accessibility', 'Support for rural communities']],
  ]
  return (
    <section className="section soft-section">
      <div className="container">
        <SectionTitle eyebrow="Care that reaches everyone" title="Designed for independence and peace of mind" />
        <div className="benefit-grid">
          {groups.map(([title, Icon, items], i) => (
            <article className={`benefit-card b-${i}`} key={title}>
              <span className="icon-bubble"><Icon size={22} /></span>
              <h3>{title}</h3>
              {items.map(x => <p key={x}><Check size={16} />{x}</p>)}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
function Future() {
  return (
    <section className="section" id="about">
      <div className="container future-wrap">
        <div>
          <SectionTitle center={false} eyebrow="Growing with every need" title="A platform designed for what comes next." text="MindCare NER begins with a thoughtful foundation and grows alongside the people it serves." />
          <Button kind="secondary">Learn more <ArrowRight size={17} /></Button>
        </div>
        <div className="future-grid">
          {future.map(([name, Icon]) => (
            <div className="future-card" key={name}>
              <span className="coming">Coming soon</span>
              <Icon size={22} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
function CTA({ openLogin }) {
  return (
    <section id="contact" className="cta">
      <div className="container cta-inner">
        <div>
          <span className="eyebrow">MindCare NER</span>
          <h2>Building a safer and healthier future for elderly care.</h2>
          <p>Technology can help elders stay mentally engaged, connected, independent and safe.</p>
        </div>
        <div className="cta-actions">
          <Button onClick={() => openLogin('Caregiver')}>Get started <ArrowRight size={18} /></Button>
          <Button kind="secondary">Learn more</Button>
        </div>
      </div>
    </section>
  )
}
function Footer() {
  return (
    <footer>
      <div className="container footer-top">
        <div>
          <Logo />
          <p>AI-powered cognitive care and safety platform.</p>
        </div>
        <div className="footer-links">
          {nav.slice(0, 4).map(x => (
            <a href={`#${x.toLowerCase().replaceAll(' ', '-')}`} key={x}>{x}</a>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© 2026 MindCare NER. Designed with care for North East India.</p>
        <p>MindCare supports cognitive engagement and elderly care. It does not replace professional medical diagnosis or emergency services.</p>
      </div>
    </footer>
  )
}
function PatientLoginModal({ onClose, onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const modalRef = useRef(null)

  useEffect(() => {
    const previousActiveElement = document.activeElement

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus()
      }
    }
  }, [onClose])

  const handleSubmit = e => {
    e.preventDefault()
    setError('')

    // Validate inputs & authenticate against the isolated prototype account
    const result = authenticatePatient(email, password)

    if (result.success) {
      // Concept 1: Remember that device setup has completed on this device
      saveDeviceSetup(result.profile)

      // Concept 2: Create and start the active patient session
      const session = createActivePatientSession(result.profile)
      saveActivePatientSession(session)

      if (onSignIn) {
        onSignIn(session)
      }
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="modal login-modal patient-login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-login-title"
        aria-describedby="patient-login-desc"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-x"
          aria-label="Close login dialog"
          onClick={onClose}
          autoFocus
        >
          <X size={20} aria-hidden="true" />
        </button>

        <span className="icon-bubble teal patient-login-icon" aria-hidden="true">
          <Brain size={24} />
        </span>

        <h2 id="patient-login-title" className="patient-login-title">
          Patient Login
        </h2>
        <p id="patient-login-desc" className="patient-login-desc">
          Sign in to continue your care journey.
        </p>

        <form onSubmit={handleSubmit} className="login-form patient-login-form" noValidate>
          <label htmlFor="patient-email-input" className="patient-field-label">
            <span>Email address</span>
            <input
              id="patient-email-input"
              name="email"
              type="email"
              className="patient-input"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor="patient-password-input" className="patient-field-label">
            <span>Password</span>
            <div className="patient-password-wrapper">
              <input
                id="patient-password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="patient-input patient-input-password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="patient-password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={19} aria-hidden="true" />
                ) : (
                  <Eye size={19} aria-hidden="true" />
                )}
              </button>
            </div>
          </label>

          {error && (
            <div
              className="patient-login-error"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle size={17} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="patient-submit-btn"
            aria-label="Sign In"
          >
            <span>Sign In</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  )
}

function LoginModal({ type, onClose, onLogin, onPatientEnter }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!type) return null
  const isPatient = type === 'Patient'

  const submit = e => {
    e.preventDefault()
    if (type === 'Caregiver' && email === 'singhmohak360@gmail.com' && password === 'Hello@123') {
      onLogin()
      return
    }
    setError(type === 'Caregiver' ? 'Please enter the sample caregiver credentials shown below.' : 'The patient portal is coming soon.')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${type === 'Caregiver' ? 'login-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={e => e.stopPropagation()}>
        <button className="modal-x" aria-label="Close login dialog" onClick={onClose} autoFocus><X /></button>
        <span className="icon-bubble blue"><HeartHandshake /></span>
        <h2 id="login-title">{isPatient ? 'Patient Login' : `${type} login`}</h2>
        <p>{isPatient
          ? 'Enter the patient experience directly. No username, password or OTP is required in this kiosk prototype.'
          : (type === 'Caregiver' ? 'Sign in to view your patient’s care overview.' : `The ${type.toLowerCase()} portal is being prepared for the next phase of MindCare NER.`)}
        </p>
        {type === 'Caregiver' && (
          <form onSubmit={submit} className="login-form">
            <label>Email address
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </label>
            <label>Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
            </label>
            {error && <p className="login-error"><AlertCircle size={15} />{error}</p>}
            <Button type="submit">Sign in <ArrowRight size={17} /></Button>
            <div className="demo-credentials">
              <strong>Sample credentials</strong>
              <span>Email: singhmohak360@gmail.com</span>
              <span>Password: Hello@123</span>
            </div>
          </form>
        )}
        {isPatient && (
          <Button onClick={onPatientEnter}>
            Enter Patient Experience
          </Button>
        )}
        {type !== 'Caregiver' && !isPatient && (
          <Button onClick={onClose}>
            Continue exploring
          </Button>
        )}
      </div>
    </div>
  )
}

/* ─── Patient Experience ─────────────────────────────────────────── */

/**
 * PatientHeader
 * Large, high-contrast header with brand + three oversized control buttons.
 * No hamburger menu. All navigation visible at all times.
 */
function PatientHeader({ onHome, onHelp, onVoice }) {
  return (
    <header className="pd-header" role="banner">
      <div className="pd-header-inner">
        {/* Brand — purely visual/informational, no link needed on patient screen */}
        <div className="pd-brand" aria-label="MindCare NER application">
          <span className="pd-brand-mark" aria-hidden="true">
            <Brain size={28} />
            <Heart size={12} fill="currentColor" />
          </span>
          <span className="pd-brand-name">
            MindCare <strong>NER</strong>
          </span>
        </div>

        {/* Controls — always visible, no hamburger menu, no swipe needed.
            Each button has: large icon (aria-hidden) + visible text label.
            aria-label provides an action-oriented description for screen readers. */}
        <nav className="pd-controls" aria-label="Main controls">
          <button
            type="button"
            className="pd-ctrl-btn pd-ctrl-home"
            onClick={onHome}
            aria-label="Go to Home screen"
          >
            <Home size={28} aria-hidden="true" />
            <span>Home</span>
          </button>
          <button
            type="button"
            className="pd-ctrl-btn pd-ctrl-help"
            onClick={onHelp}
            aria-label="Call for Help"
          >
            <Phone size={28} aria-hidden="true" />
            <span>Help</span>
          </button>
          <button
            type="button"
            className="pd-ctrl-btn pd-ctrl-voice"
            onClick={onVoice}
            aria-label="Activate Voice Control"
          >
            <Mic size={28} aria-hidden="true" />
            <span>Voice</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

/**
 * getTimeGreeting()
 *
 * Returns a time-appropriate greeting phrase based on the device's current
 * local time (via Date().getHours()). No arguments — pure, side-effect-free.
 *
 * Ranges (24-hour local time):
 *   05:00 – 11:59  →  "Good Morning"
 *   12:00 – 16:59  →  "Good Afternoon"
 *   17:00 – 20:59  →  "Good Evening"
 *   21:00 – 04:59  →  "Good Night"
 *
 * @returns {string}  Greeting phrase without trailing punctuation.
 */
function getTimeGreeting() {
  const hour = new Date().getHours() // 0–23, device local time
  if (hour >= 5  && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 17) return 'Good Afternoon'
  if (hour >= 17 && hour < 21) return 'Good Evening'
  return 'Good Night'               // 21:00–23:59 and 00:00–04:59
}

/**
 * getLocalDate()
 *
 * Returns the device's current local date as a human-readable string.
 * Format: "Friday, September 4"  (weekday, month day — no year, no time zone)
 *
 * Uses the browser's built-in Intl.DateTimeFormat so the output respects
 * the user's locale. No month arrays, no hardcoding.
 *
 * @returns {string}  e.g. "Friday, September 4"
 */
function getLocalDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long', // "Friday"
    month:   'long', // "September"
    day:     'numeric', // "4"
  })
}

/**
 * ACTIVITY_DATA — single source of truth for every activity.
 * Used by: the dashboard grid cards AND ActivityPlaceholder (dynamic render).
 */
const ACTIVITY_DATA = {
  'brain-games':     { id: 'brain-games',     title: 'Brain Games',      subtitle: 'Train your memory',          Icon: Gamepad2, colorClass: 'pd-card-blue',   placeholder: 'Brain activities will be available here.'          },
  'memory-activity': { id: 'memory-activity', title: 'Memory Activity',  subtitle: 'Practice remembering',       Icon: Brain,    colorClass: 'pd-card-teal',   placeholder: 'Memory exercises will be available here.'          },
  'music-memories':  { id: 'music-memories',  title: 'Music & Memories', subtitle: 'Listen and remember',        Icon: Music,    colorClass: 'pd-card-violet', placeholder: 'Music and memory activities will be available here.' },
  'talk-recall':     { id: 'talk-recall',     title: 'Talk & Recall',    subtitle: 'Talk about familiar things', Icon: Mic,      colorClass: 'pd-card-coral',  placeholder: 'Talking activities will be available here.'         },
  // Today's featured activity (START ACTIVITY button)
  'memory-match':    { id: 'memory-match',    title: 'Memory Match',     subtitle: 'A simple memory activity',   Icon: Brain,    colorClass: 'pd-card-teal',   placeholder: 'The memory matching activity will be available here.' },
}


/** Grid cards shown on the dashboard (excludes the today's-panel featured activity) */
const ACTIVITY_CARDS = [
  ACTIVITY_DATA['brain-games'],
  ACTIVITY_DATA['memory-activity'],
  ACTIVITY_DATA['music-memories'],
  ACTIVITY_DATA['talk-recall'],
]

/** Today's featured activity, shown in the panel at the bottom of the dashboard */
const TODAY_ACTIVITY = ACTIVITY_DATA['memory-match']



/**
 * PatientLogoutConfirmModal
 *
 * Safe logout confirmation dialog designed specifically for patients with cognitive needs:
 * - Clear heading: "Are you sure?"
 * - Calming supportive body: "Do you want to leave the patient dashboard?"
 * - Safest/default action is "Go Back" (large primary teal button, initially focused)
 * - Logout action is "Continue" (subtle, secondary outline button, NOT visually dominant)
 * - Full accessibility: role="dialog", aria-modal="true", keyboard focus trap & Escape key support
 * - No accidental logout, no swipe gestures, no timeout-based automatic confirmation
 */
function PatientLogoutConfirmModal({ onCancel, onConfirm }) {
  const modalRef = useRef(null)
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    // Preserve previously active element to restore focus on unmount
    const previousActiveElement = document.activeElement

    // Initial focus on the safest default option: "Go Back"
    cancelButtonRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
        return
      }

      if (e.key === 'Tab') {
        // Accessible keyboard focus trap
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus()
      }
    }
  }, [onCancel])

  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        ref={modalRef}
        className="modal pd-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        aria-describedby="logout-confirm-desc"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-x"
          aria-label="Close confirmation dialog and return to dashboard"
          onClick={onCancel}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="pd-confirm-icon" aria-hidden="true">
          <LogOut size={26} />
        </div>

        <h2 id="logout-confirm-title" className="pd-confirm-title">
          Are you sure?
        </h2>

        <p id="logout-confirm-desc" className="pd-confirm-desc">
          Do you want to leave the patient dashboard?
        </p>

        <div className="pd-confirm-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="pd-confirm-btn-cancel"
            onClick={onCancel}
            autoFocus
          >
            Go Back
          </button>
          <button
            type="button"
            className="pd-confirm-btn-proceed"
            onClick={onConfirm}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * CaregiverPinModal
 *
 * Caregiver PIN authorization dialog for Patient Logout.
 * Prevents elderly or cognitively-impaired patients from inadvertently
 * terminating the kiosk session without caregiver supervision.
 *
 * Requirements:
 * - Large, touch-accessible controls
 * - PIN input (direct keyboard support + on-screen numeric keypad)
 * - Error message: "That PIN isn't correct. Please try again."
 * - Does not reveal the correct PIN
 * - Submit and Cancel actions
 * - Accessible focus management and keyboard traps (Escape to cancel)
 * - Safe prototype PIN validation isolated in authConfig
 */
function CaregiverPinModal({ onCancel, onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const modalRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const previousActiveElement = document.activeElement
    inputRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
        return
      }

      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus()
      }
    }
  }, [onCancel])

  function handleKeypadPress(val) {
    setError('')
    if (val === 'clear') {
      setPin('')
      inputRef.current?.focus()
      return
    }
    if (val === 'backspace') {
      setPin(prev => prev.slice(0, -1))
      inputRef.current?.focus()
      return
    }
    if (pin.length < 8) {
      setPin(prev => prev + val)
      inputRef.current?.focus()
    }
  }

  function handleInputChange(e) {
    // Only accept numeric digits
    const val = e.target.value.replace(/\D/g, '')
    if (val.length <= 8) {
      setPin(val)
      setError('')
    }
  }

  function handleSubmit(e) {
    if (e) e.preventDefault()
    setError('')

    const result = validateCaregiverPin(pin)
    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || "That PIN isn't correct. Please try again.")
      setPin('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        ref={modalRef}
        className="modal caregiver-pin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="caregiver-pin-title"
        aria-describedby="caregiver-pin-desc"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-x"
          aria-label="Cancel and return to dashboard"
          onClick={onCancel}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="caregiver-pin-icon" aria-hidden="true">
          <ShieldCheck size={26} />
        </div>

        <h2 id="caregiver-pin-title" className="caregiver-pin-title">
          Caregiver Authorization
        </h2>

        <p id="caregiver-pin-desc" className="caregiver-pin-desc">
          Enter caregiver PIN to end this session.
        </p>

        {error && (
          <div className="caregiver-pin-error" role="alert" aria-live="assertive">
            <AlertCircle size={17} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="pin-input-wrap">
            <label htmlFor="caregiver-pin-input" className="sr-only">
              Caregiver PIN
            </label>
            <input
              id="caregiver-pin-input"
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              autoComplete="off"
              value={pin}
              onChange={handleInputChange}
              placeholder="••••"
              className="caregiver-pin-input"
              aria-label="Caregiver numeric PIN"
              aria-invalid={Boolean(error)}
            />
          </div>

          {/* On-screen numeric keypad for touch/kiosk accessibility */}
          <div className="caregiver-pin-keypad" role="group" aria-label="PIN keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                className="pin-key"
                onClick={() => handleKeypadPress(num)}
                aria-label={`Digit ${num}`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              className="pin-key pin-key-util"
              onClick={() => handleKeypadPress('clear')}
              aria-label="Clear PIN"
            >
              Clear
            </button>
            <button
              type="button"
              className="pin-key"
              onClick={() => handleKeypadPress('0')}
              aria-label="Digit 0"
            >
              0
            </button>
            <button
              type="button"
              className="pin-key pin-key-util"
              onClick={() => handleKeypadPress('backspace')}
              aria-label="Delete last digit"
            >
              ⌫
            </button>
          </div>

          <div className="caregiver-pin-actions">
            <button type="submit" className="pin-submit-btn">
              Submit
            </button>
            <button
              type="button"
              className="pin-cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * PatientDashboard
 * Full elder-friendly dashboard:
 * header → skip link → breadcrumb → welcome → activity grid → today's activity panel
 *
 * Props:
 *   onHome             — go to landing page
 *   onNavigateActivity — go to an activity placeholder page (receives activityId)
 *   onLogout           — optional logout handler to terminate active session & navigate to landing
 *
 * Reads from PatientSessionContext:
 *   session.displayName — personalises the greeting; falls back gracefully when null
 */
function PatientDashboard({ onHome, onNavigateActivity, onLogout }) {
  // Session — read displayName for the greeting.
  // displayName is null if unavailable; the greeting degrades gracefully to "Good Morning!".
  // Do NOT expose email, password, or sensitive medical info on the dashboard.
  const [session] = usePatientSession()
  const base = getTimeGreeting()                   // e.g. "Good Morning"
  const displayName = session?.displayName || null
  const localDate = getLocalDate()                 // e.g. "Friday, September 4"

  // Today's progress status for the prototype (1 of 3 activities completed)
  // TODO: In production, fetch daily patient activity progress from backend:
  // GET /api/v1/patient/activities/today-progress
  const completedCount = 1
  const totalTodayActivities = 3
  const progressPercent = Math.round((completedCount / totalTodayActivities) * 100)

  const [announcement, setAnnouncement] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)

  function handleHelp() {
    setAnnouncement('Help is ready. A caregiver can assist you from here.')
  }
  function handleVoice() {
    setAnnouncement('Voice support is ready for the next prototype step.')
  }
  function handleLogoutClick() {
    setShowLogoutConfirm(true)
  }
  function handleCancelLogout() {
    setShowLogoutConfirm(false)
  }
  function handleConfirmLogout() {
    setShowLogoutConfirm(false)
    setShowPinModal(true)
  }
  function handleCancelPin() {
    setShowPinModal(false)
  }
  function handlePinSuccess() {
    setShowPinModal(false)
    if (onLogout) {
      onLogout()
    } else {
      onHome()
    }
  }

  return (
    <div className="pd-app">
      {/* Skip link — visible only on keyboard focus, lets users bypass the sticky header */}
      <a className="pd-skip-link" href="#pd-main-content">
        Skip to main content
      </a>

      <PatientHeader onHome={onHome} onHelp={handleHelp} onVoice={handleVoice} />

      {/* tabIndex={-1} so the skip link can programmatically focus this element */}
      <main className="pd-main" id="pd-main-content" tabIndex={-1}>

        {/* ── Breadcrumb ────────────────────────────────────────── */}
        <nav className="pd-breadcrumb" aria-label="You are here">
          <ol>
            <li>
              <button type="button" className="pd-breadcrumb-link" onClick={onHome}>
                <Home size={16} aria-hidden="true" />
                Home
              </button>
            </li>
            <li aria-hidden="true" className="pd-breadcrumb-sep">›</li>
            <li aria-current="page" className="pd-breadcrumb-current">
              Patient Dashboard
            </li>
          </ol>
        </nav>

        {/* ── Live region for announcements (Help / Voice feedback) ── */}
        {announcement && (
          <div
            className="pd-announcement"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>{announcement}</span>
            <button
              type="button"
              className="pd-dismiss"
              aria-label="Dismiss this message"
              onClick={() => setAnnouncement('')}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ── Welcome & Patient Display Name ────────────────────── */}
        {/*
          Greeting degrades gracefully:
          If displayName exists:
            Good Morning!
            [DisplayName]
            Let's choose an activity for today.
          If displayName is unavailable:
            Good Morning!
            Let's choose an activity for today.
        */}
        <section className="pd-welcome" aria-labelledby="pd-welcome-heading">
          <h1 id="pd-welcome-heading" className="pd-welcome-title">
            {base}!
            {displayName && (
              <span className="pd-welcome-patient-name">{displayName}</span>
            )}
          </h1>
          <p className="pd-welcome-date" aria-hidden="true">{localDate}</p>
          <p className="pd-welcome-sub">Let's choose an activity for today.</p>
        </section>

        {/* ── Today's Progress ──────────────────────────────────── */}
        <section className="pd-progress-card" aria-labelledby="pd-progress-heading">
          <div className="pd-progress-content">
            <div className="pd-progress-header">
              <div className="pd-progress-title-wrap">
                <CircleCheck size={26} aria-hidden="true" />
                <h2 id="pd-progress-heading" className="pd-progress-title">Today's Progress</h2>
              </div>
              <span className="pd-progress-count" aria-label={`${completedCount} of ${totalTodayActivities} activities completed`}>
                {completedCount} of {totalTodayActivities} Completed
              </span>
            </div>
            <div
              className="pd-progress-bar-track"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Today's activity progress"
            >
              <div className="pd-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="pd-progress-sub">Great job today! You're making gentle, steady progress.</p>
          </div>
          <div className="pd-progress-badge" aria-hidden="true">
            <Sparkles size={20} />
            <span>Keep Going</span>
          </div>
        </section>

        {/* ── Recommended Activity (Featured) ──────────────────── */}
        <section className="pd-today-panel" aria-labelledby="pd-today-heading">
          <div className="pd-today-content">
            <div className="pd-recommended-badge" aria-hidden="true">
              <Sparkles size={14} />
              <span>Recommended Activity</span>
            </div>
            <p className="pd-today-label">
              <span aria-hidden="true">⭐ </span>Featured For You
            </p>
            <h2 id="pd-today-heading" className="pd-today-title">{TODAY_ACTIVITY.title}</h2>
            <p className="pd-today-desc">{TODAY_ACTIVITY.subtitle}. Let's try a gentle memory exercise together.</p>
          </div>
          <button
            type="button"
            className="pd-start-btn"
            onClick={() => onNavigateActivity(TODAY_ACTIVITY.id)}
            aria-label={`Start recommended activity: ${TODAY_ACTIVITY.title}`}
          >
            <span>Start Activity</span>
            <ArrowRight size={30} aria-hidden="true" />
          </button>
        </section>

        {/* ── Today's Activities ───────────────────────────────── */}
        <section className="pd-activities-section" aria-labelledby="pd-activities-heading">
          <h2 id="pd-activities-heading" className="pd-section-heading">Today's Activities</h2>
          {/*
            Each card is a <button> so it is:
            • Reachable by Tab key
            • Activatable by Enter or Space
            • Announced as interactive by screen readers
            Each card navigates to its own dedicated placeholder page.
          */}
          <div className="pd-activity-grid">
            {ACTIVITY_CARDS.map(({ id, title, subtitle, Icon, colorClass }) => (
              <button
                key={id}
                type="button"
                className={`pd-activity-card ${colorClass}`}
                onClick={() => onNavigateActivity(id)}
                aria-label={`${title} — ${subtitle}. Tap to open.`}
              >
                <div className="pd-card-icon" aria-hidden="true">
                  <Icon size={48} />
                </div>
                <div className="pd-card-body" aria-hidden="true">
                  <p className="pd-card-title">{title}</p>
                  <p className="pd-card-sub">{subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Danger Zone Divider & Section ──────────────────────
          Separated from normal activity cards at the bottom of the dashboard.
          Protects patients with cognitive difficulties from accidental logouts.
          - Visually distinct and secondary
          - Not styled as a primary CTA
          - No alarming or flashing animations
          - Logout logic is intentionally deferred to upcoming milestone
        */}
        <hr className="pd-danger-divider" aria-hidden="true" />

        <section className="pd-danger-section" aria-labelledby="pd-danger-heading">
          <div className="pd-danger-card">
            <div className="pd-danger-info">
              <span className="pd-danger-tag">Device Session</span>
              <h2 id="pd-danger-heading" className="pd-danger-title">Danger Zone</h2>
              <p className="pd-danger-desc">Leaving this device will end the patient session.</p>
            </div>
            {/*
              TODO: Implement full logout confirmation and session termination
              in the next milestone.
            */}
            <button
              type="button"
              className="pd-logout-btn"
              onClick={handleLogoutClick}
              aria-label="Log Out. Leaving this device will end the patient session."
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Log Out</span>
            </button>
          </div>
        </section>

      </main>

      {/* ── Safe Logout Confirmation Dialog ────────────────────────── */}
      {showLogoutConfirm && (
        <PatientLogoutConfirmModal
          onCancel={handleCancelLogout}
          onConfirm={handleConfirmLogout}
        />
      )}

      {/* ── Caregiver PIN Authorization Dialog ─────────────────────── */}
      {showPinModal && (
        <CaregiverPinModal
          onCancel={handleCancelPin}
          onSuccess={handlePinSuccess}
        />
      )}
    </div>
  )
}

/**
 * ActivityPlaceholder
 * Generic placeholder for any activity page.
 * Renders dynamically from ACTIVITY_DATA based on activityId.
 *
 * Props:
 *   activityId — key into ACTIVITY_DATA (e.g. 'brain-games', 'memory-match')
 *   onHome     — go to landing page
 *   onDashboard— go back to Patient Dashboard
 */
function ActivityPlaceholder({ activityId, onHome, onDashboard }) {
  // Look up activity data; fall back gracefully if id is unrecognised
  const activity = ACTIVITY_DATA[activityId] ?? ACTIVITY_DATA['memory-match']
  const { title, subtitle, Icon, colorClass, placeholder } = activity

  return (
    <div className="pd-app">
      {/* Skip link — visible only on keyboard focus */}
      <a className="pd-skip-link" href="#pd-main-content">
        Skip to main content
      </a>

      <PatientHeader
        onHome={onHome}
        onHelp={() => {}}
        onVoice={() => {}}
      />

      {/* tabIndex={-1} so the skip link can programmatically focus this element */}
      <main className="pd-main" id="pd-main-content" tabIndex={-1}>

        {/* ── Breadcrumb — shows real activity name ────────────── */}
        <nav className="pd-breadcrumb" aria-label="You are here">
          <ol>
            <li>
              <button type="button" className="pd-breadcrumb-link" onClick={onHome}>
                <Home size={16} aria-hidden="true" />
                Home
              </button>
            </li>
            <li aria-hidden="true" className="pd-breadcrumb-sep">›</li>
            <li>
              <button type="button" className="pd-breadcrumb-link" onClick={onDashboard}>
                Patient Dashboard
              </button>
            </li>
            <li aria-hidden="true" className="pd-breadcrumb-sep">›</li>
            <li aria-current="page" className="pd-breadcrumb-current">{title}</li>
          </ol>
        </nav>

        {/* ── Activity placeholder ───────────────────────────────── */}
        <section
          className="pd-placeholder-section"
          aria-labelledby="pd-placeholder-heading"
        >
          <div
            className={`pd-placeholder-icon ${colorClass}`}
            aria-hidden="true"
          >
            <Icon size={64} />
          </div>

          <p className="pd-placeholder-badge">Coming Soon</p>

          <h1 id="pd-placeholder-heading" className="pd-placeholder-title">
            {title}
          </h1>

          <p className="pd-placeholder-desc">
            {placeholder}
          </p>


          {/*
            BACK button:
            — Uses ArrowRight rotated (static transform, not an animation)
            — Plain English label, no text-arrow character
            — min-height 64 px touch target
          */}
          <button
            type="button"
            className="pd-back-btn"
            onClick={onDashboard}
          >
            <ArrowRight
              size={22}
              aria-hidden="true"
              style={{ transform: 'rotate(180deg)', flexShrink: 0 }}
            />
            Back to Dashboard
          </button>
        </section>

      </main>
    </div>
  )
}

/* ─── Caregiver Dashboard ────────────────────────────────────────── */
function CaregiverDashboard({ onLogout, dark, onToggleTheme }) {
  const stats = [
    ['Today’s activity', '42 min', Clock3, 'teal'],
    ['Cognitive score', '72 / 100', TrendingUp, 'violet'],
    ['Medication', '2 of 3 taken', Pill, 'coral'],
    ['Next appointment', '12 Sep', CalendarDays, 'blue']
  ]
  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <Logo />
          <span>Caregiver portal</span>
        </div>
        <div className="dash-actions">
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
          <button className="notification"><BellRing size={19} /><i /></button>
          <div className="caregiver-name">
            <span>MS</span>
            <div><strong>Mohak Singh</strong><small>Caregiver</small></div>
            <ChevronDown size={15} />
          </div>
          <button className="logout" onClick={onLogout}><LogOut size={17} /> <b>Logout</b></button>
        </div>
      </header>
      <main className="dash-main">
        <section className="dash-welcome">
          <div>
            <p className="dash-kicker">CARE OVERVIEW</p>
            <h1>Good morning, Mohak.</h1>
            <p>Here’s how Mr. Ramesh Das is doing today.</p>
          </div>
          <div className="sync-status"><CircleCheck size={18} /> Last updated today, 9:42 AM</div>
        </section>
        <section className="patient-banner">
          <div className="patient-avatar">RD</div>
          <div className="patient-summary">
            <span>YOUR PATIENT</span>
            <h2>Mr. Ramesh Das <i>•</i> <small>72 years</small></h2>
            <p><MapPin size={15} /> Guwahati, Assam <b>•</b> Patient ID: MC-2048</p>
          </div>
          <div className="risk-chip">
            <span>DEMENTIA LEVEL</span>
            <strong>Moderate</strong>
            <small>Needs regular support</small>
          </div>
          <button className="view-profile">View full profile <ArrowRight size={16} /></button>
        </section>
        <section className="stat-grid">
          {stats.map(([name, value, Icon, color]) => (
            <article className="dash-stat" key={name}>
              <span className={`icon-bubble ${color}`}><Icon size={20} /></span>
              <div><p>{name}</p><strong>{value}</strong></div>
            </article>
          ))}
        </section>
        <section className="dash-grid">
          <div className="dash-card progress-card">
            <div className="card-title">
              <div><p className="dash-kicker">COGNITIVE PROGRESS</p><h2>Weekly engagement</h2></div>
              <button>This week <ChevronDown size={14} /></button>
            </div>
            <div className="chart">
              <div className="chart-labels"><span>100</span><span>75</span><span>50</span><span>25</span></div>
              <div className="chart-bars">
                {[['Mon', 58], ['Tue', 71], ['Wed', 64], ['Thu', 82], ['Fri', 76], ['Sat', 88], ['Sun', 72]].map(([day, height]) => (
                  <div className="bar-wrap" key={day}>
                    <div className="bar-value">{height}</div>
                    <div className="bar" style={{ height: `${height}%` }} />
                    <span>{day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="progress-note">
              <TrendingUp size={18} />
              <span><b>12% improvement</b> in cognitive engagement compared with last week.</span>
            </div>
          </div>
          <div className="dash-card routine-card">
            <div className="card-title">
              <div><p className="dash-kicker">TODAY’S ROUTINE</p><h2>Care tasks</h2></div>
              <button className="link-btn">View all</button>
            </div>
            {[
              ['Morning medicine', '8:00 AM', 'Completed', true],
              ['Memory matching activity', '10:30 AM', 'Completed', true],
              ['Afternoon medicine', '2:00 PM', 'Upcoming', false],
              ['Evening walk', '5:30 PM', 'Upcoming', false]
            ].map(([task, time, state, done]) => (
              <div className="task-row" key={task}>
                <span className={done ? 'task-check done' : 'task-check'}>
                  {done ? <Check size={15} /> : <Clock size={15} />}
                </span>
                <div><strong>{task}</strong><small>{time}</small></div>
                <em className={done ? 'completed' : 'upcoming'}>{state}</em>
              </div>
            ))}
          </div>
          <div className="dash-card details-card">
            <div className="card-title">
              <div><p className="dash-kicker">PATIENT DETAILS</p><h2>Health snapshot</h2></div>
              <UserRound size={21} />
            </div>
            <div className="detail-list">
              <p><span>Blood group</span><b>B+</b></p>
              <p><span>Primary language</span><b>Assamese, Hindi</b></p>
              <p><span>Emergency contact</span><b>+91 98765 43210</b></p>
              <p><span>Care physician</span><b>Dr. Ananya Bora</b></p>
            </div>
          </div>
          <div className="dash-card insights-card">
            <div className="card-title">
              <div><p className="dash-kicker">CARE INSIGHT</p><h2>Today’s note</h2></div>
              <Sparkles size={21} />
            </div>
            <p>Ramesh showed strong recognition during the family-photo activity and responded well to voice prompts.</p>
            <div><Heart size={16} fill="currentColor" /> Mood: <b>Calm &amp; engaged</b></div>
          </div>
        </section>
      </main>
    </div>
  )
}

/* ─── App Root ───────────────────────────────────────────────────── */
export default function App() {
  const [login, setLogin] = useState(null)
  const [dashboard, setDashboard] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('mindcare-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', dark)
    localStorage.setItem('mindcare-theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleTheme = () => setDark(value => !value)

  /**
   * view:
   *   'landing'              — landing page
   *   'patient-dashboard'    — patient dashboard
   *   'activity:{id}'        — activity placeholder for the given id
   *                            id is a key in ACTIVITY_DATA
   */
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionView = getActiveSessionView()
      const historyView = window.history.state?.view
      // If user has an active session running in this tab, restore exact view
      if (isPatientSessionActive()) {
        if (sessionView && (sessionView === 'patient-dashboard' || sessionView.startsWith('activity:'))) {
          return sessionView
        }
        if (historyView && (historyView === 'patient-dashboard' || historyView.startsWith('activity:'))) {
          return historyView
        }
        return 'patient-dashboard'
      }
      // If returning via browser history and device setup was completed
      if (historyView && (historyView === 'patient-dashboard' || historyView.startsWith('activity:'))) {
        if (isPatientDeviceSetupComplete()) {
          return historyView
        }
      }
    }
    return 'landing'
  })

  /* ── Browser history support ──────────────────────────────────
   * pushState on every navigation so the browser's Back button
   * returns the user to the previous screen — essential for elderly
   * users who instinctively reach for the device's back button.
   *
   * Each state object stores { view } so the popstate handler can
   * restore exactly the right screen.
   */
  useEffect(() => {
    window.history.replaceState({ view }, '')

    function onPopState(e) {
      if (e.state?.view) {
        setView(e.state.view)
      } else {
        setView('landing')
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  /** Push a new view to browser history and update React state */
  function navigateTo(nextView) {
    setView(nextView)
    window.history.pushState({ view: nextView }, '')
    if (nextView === 'patient-dashboard' || nextView.startsWith('activity:')) {
      const current = activeSession || restoreActivePatientSession()
      if (current) {
        saveActivePatientSession(current, nextView)
      }
    }
  }

  // ── Patient State Architecture ──────────────────────────────
  // Concept 2: Active patient session.
  // Restores seamlessly on browser refresh if session was active or returning.
  const [activeSession, setActiveSession] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionView = getActiveSessionView()
      const historyView = window.history.state?.view
      if (
        isPatientSessionActive() ||
        (historyView && (historyView === 'patient-dashboard' || historyView.startsWith('activity:')))
      ) {
        const session = restoreActivePatientSession()
        if (session) {
          const targetView = sessionView || historyView || 'patient-dashboard'
          saveActivePatientSession(session, targetView)
          return session
        }
      }
    }
    return null
  })

  function enterPatientDashboard(sessionData) {
    // Activate the provided session or restore an active session from device setup
    const sessionToActivate = sessionData || activeSession || restoreActivePatientSession()
    if (sessionToActivate) {
      setActiveSession(sessionToActivate)
      saveActivePatientSession(sessionToActivate, 'patient-dashboard')
    }
    setLogin(null)
    navigateTo('patient-dashboard')
  }

  function handleOpenLogin(type) {
    if (type === 'Patient') {
      // 2. While the patient session is active:
      // Patient Login -> Patient Dashboard directly
      if (isPatientSessionActive()) {
        const session = activeSession || restoreActivePatientSession()
        enterPatientDashboard(session)
        return
      }
      // 1. First-time login, or 4. After logout:
      // Show Email + Password login modal
      setLogin('Patient')
      return
    }
    setLogin(type)
  }

  function backToLanding() {
    navigateTo('landing')
    window.requestAnimationFrame(() =>
      document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' })
    )
  }

  function handlePatientLogout() {
    // 1. Clear the CURRENT active patient session (in tab storage & React state)
    clearActivePatientSession()
    setActiveSession(null)
    // 2. Clear/reset the persistent "patient setup/login completed" state
    clearDeviceSetup()
    // 3. Return to Landing Page
    backToLanding()
  }

  function backToDashboard() {
    navigateTo('patient-dashboard')
  }

  /** Navigate to any activity placeholder page */
  function navigateActivity(activityId) {
    navigateTo(`activity:${activityId}`)
  }

  if (dashboard) {
    return (
      <CaregiverDashboard
        onLogout={() => setDashboard(false)}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
    )
  }

  // ── Patient experience views ──────────────────────────────────
  const isPatientView =
    view === 'patient-dashboard' || view.startsWith('activity:')

  if (isPatientView) {
    const activityId = view.startsWith('activity:') ? view.slice(9) : null

    return (
      <PatientSessionProvider initialSession={activeSession ?? {}}>
        {view === 'patient-dashboard'
          ? (
            <PatientDashboard
              onHome={backToLanding}
              onNavigateActivity={navigateActivity}
              onLogout={handlePatientLogout}
            />
          ) : (
            <ActivityPlaceholder
              activityId={activityId}
              onHome={backToLanding}
              onDashboard={backToDashboard}
            />
          )
        }
      </PatientSessionProvider>
    )
  }

  // ── Landing page (default) ───────────────────────────────────
  return (
    <>
      <Navbar openLogin={handleOpenLogin} dark={dark} onToggleTheme={toggleTheme} />
      <main id="main-content" tabIndex={-1}>
        <Hero openLogin={handleOpenLogin} />
        <Challenges />
        <Features />
        <HowItWorks />
        <SafeHome />
        <Benefits />
        <Future />
        <CTA openLogin={handleOpenLogin} />
      </main>
      <Footer />
      {login === 'Patient' ? (
        <PatientLoginModal
          onClose={() => setLogin(null)}
          onSignIn={enterPatientDashboard}
        />
      ) : (
        <LoginModal
          type={login}
          onClose={() => setLogin(null)}
          onLogin={() => {
            setLogin(null)
            setDashboard(true)
          }}
          onPatientEnter={enterPatientDashboard}
        />
      )}
    </>
  )
}
