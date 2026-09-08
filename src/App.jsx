import { useState, useEffect, useRef } from 'react'
import {
  Brain, HeartHandshake, Menu, X, ArrowRight, Sparkles, Gamepad2, Mic,
  BellRing, MapPin, WifiOff, Languages, ShieldCheck, UsersRound, Activity,
  ChevronRight, Home, Check, Stethoscope, Clock3, Phone, Route, Pill,
  Heart, Lightbulb, Music, LogOut, UserRound, CalendarDays, TrendingUp,
  CircleCheck, AlertCircle, Clock, ChevronDown, Sun, Moon, Eye, EyeOff,
  NotebookPen
} from 'lucide-react'
import heroImage from './assets/mindcare-hero.png'
import GamesHub from './games/GamesHub/GamesHub'
import MemoryMatch from './games/MemoryMatch/MemoryMatch'
import WordRecall from './games/WordRecall/WordRecall'
import DifferentObject from './games/DifferentObject/DifferentObject'
import TakeMeHome from './emergency/TakeMeHome'
import CaregiverEmergencySection from './emergency/CaregiverEmergencySection'
import { getEmergencyContact } from './emergency/emergencyContactService'
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
import { CaregiverRemindersSection } from './reminders/CaregiverRemindersSection'
import { PatientReminderModal } from './reminders/PatientReminderModal'
import { usePatientDueReminder } from './reminders/usePatientDueReminder'
import { LanguageProvider, useTranslation, SUPPORTED_LANGUAGES } from './i18n'
import LanguageSelectorScreen from './components/LanguageSelector/LanguageSelectorScreen'


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
  ['Multilingual Support', Languages, 'Choose from English, Hindi and 8 North-Eastern languages.'],
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
function Navbar({ openLogin, dark, onToggleTheme, onOpenLanguageSelector }) {
  const [open, setOpen] = useState(false)
  const { currentLanguage, t } = useTranslation()

  const navItems = [
    { key: 'home', label: t('nav.home') || 'Home', href: '#home' },
    { key: 'features', label: t('nav.features') || 'Features', href: '#features' },
    { key: 'howItWorks', label: t('nav.howItWorks') || 'How It Works', href: '#how-it-works' },
    { key: 'about', label: t('nav.about') || 'About', href: '#about' },
    { key: 'contact', label: t('nav.contact') || 'Contact', href: '#contact' },
  ]

  return (
    <header className="navbar">
      <a className="skip-to-main" href="#main-content">{t('common.skipToMain') || 'Skip to main content'}</a>
      <div className="container nav-inner">
        <Logo />
        <nav className={open ? 'nav-links show' : 'nav-links'}>
          {navItems.map(item => (
            <a key={item.key} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
          <div className="mobile-actions">
            <button
              type="button"
              className="lang-nav-btn mobile-lang-btn"
              onClick={() => { setOpen(false); onOpenLanguageSelector?.(); }}
              aria-label={`Select language. Currently ${currentLanguage?.name || 'English'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 48,
                padding: '10px 16px',
                borderRadius: 12,
                border: '1.5px solid #157f7a',
                background: '#f0fdfa',
                color: '#0f766e',
                fontWeight: 700,
                fontSize: 15,
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <Languages size={20} />
              <span>🌐 {currentLanguage?.name || 'English'} ({currentLanguage?.nativeName || 'English'})</span>
            </button>
            <Button kind="secondary" onClick={() => openLogin('Patient')}>{t('nav.patientLogin') || 'Patient Login'}</Button>
            <Button onClick={() => openLogin('Caregiver')}>{t('nav.caregiverLogin') || 'Caregiver Login'}</Button>
          </div>
        </nav>
        <div className="desktop-actions">
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
          <button
            type="button"
            className="lang-nav-btn"
            onClick={onOpenLanguageSelector}
            aria-label={`Language selector. Currently ${currentLanguage?.name || 'English'}`}
            title="Choose language"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 48,
              padding: '8px 16px',
              borderRadius: 12,
              border: '1.5px solid #157f7a',
              background: '#f0fdfa',
              color: '#0f766e',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <Languages size={18} />
            <span>🌐 {currentLanguage?.nativeName || 'English'}</span>
          </button>
          <button className="text-button" onClick={() => openLogin('Patient')}>{t('nav.patientLogin') || 'Patient Login'}</button>
          <Button onClick={() => openLogin('Caregiver')}>{t('nav.caregiverLogin') || 'Caregiver Login'}</Button>
        </div>
        <button className="menu" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
function Hero({ openLogin }) {
  const { t } = useTranslation()
  return (
    <section id="home" className="hero">
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> {t('landing.eyebrow') || 'Made with care for North East India'}</div>
          <h1>{t('landing.heroTitle') || 'Empowering elderly minds with AI-powered cognitive care.'}</h1>
          <p>{t('landing.heroSubtitle') || 'An intelligent cognitive assistance and safety platform designed to support elderly individuals with dementia through personalized brain activities, daily assistance and caregiver support.'}</p>
          <div className="hero-actions">
            <Button onClick={() => openLogin('Caregiver')}>{t('landing.getStarted') || 'Get started'} <ArrowRight size={18} /></Button>
            <Button kind="secondary" onClick={() => document.querySelector('#features').scrollIntoView({ behavior: 'smooth' })}>{t('landing.exploreFeatures') || 'Explore features'}</Button>
          </div>
          <div className="trust-row">
            <span><ShieldCheck /> {t('landing.safeAccessible') || 'Safe & accessible'}</span>
            <span><HeartHandshake /> {t('landing.builtForCare') || 'Built for care'}</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-glow" />
          <img src={heroImage} alt="An elderly woman using a tablet with a caregiver and AI cognitive support" />
          <div className="float-card activity-card">
            <span className="icon-bubble violet"><Activity size={18} /></span>
            <div><small>{t('landing.todaysActivity') || "Today's activity"}</small><strong>{t('landing.greatProgress') || 'Great progress!'}</strong></div>
          </div>
          <div className="float-card safe-card">
            <span className="icon-bubble coral"><Heart size={18} fill="currentColor" /></span>
            <div><small>{t('landing.careCircle') || 'Care circle'}</small><strong>{t('landing.connected') || 'Connected'}</strong></div>
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
  const { t } = useTranslation()
  const challengeList = [
    [t('landing.memoryLoss') || 'Memory loss', Brain, t('landing.memoryLossDesc') || 'Remembering familiar people, places and moments.'],
    [t('landing.confusionAnxiety') || 'Confusion & anxiety', Sparkles, t('landing.confusionAnxietyDesc') || 'Feeling disoriented during everyday routines.'],
    [t('landing.medicineSchedules') || 'Medicine schedules', Pill, t('landing.medicineSchedulesDesc') || 'Keeping track of important medications.'],
    [t('landing.dailyActivities') || 'Daily activities', Clock3, t('landing.dailyActivitiesDesc') || 'Managing appointments and simple tasks.'],
    [t('landing.caregiverVisibility') || 'Caregiver visibility', UsersRound, t('landing.caregiverVisibilityDesc') || 'Staying connected from a distance.'],
    [t('landing.limitedConnectivity') || 'Limited connectivity', WifiOff, t('landing.limitedConnectivityDesc') || 'Accessing support in remote locations.'],
    [t('landing.findingWayHome') || 'Finding the way home', Route, t('landing.findingWayHomeDesc') || 'Getting safely back to a saved location.'],
  ]

  return (
    <section className="section soft-section">
      <div className="container">
        <SectionTitle eyebrow={t('landing.understandingTheNeed') || "Understanding the need"} title={t('landing.theChallenge') || "The challenge"} text={t('landing.challengeText') || "Elderly individuals in remote and rural areas often have limited access to specialized cognitive care and continuous healthcare support."} />
        <div className="challenge-grid">
          {challengeList.map(([title, Icon, txt]) => (
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
function Features({ onOpenGames, onOpenTakeMeHome, onOpenLanguageSelector }) {
  const { t } = useTranslation()
  const featureList = [
    [t('landing.cognitiveGames') || 'Cognitive Games', Gamepad2, t('landing.cognitiveGamesDesc') || 'Thoughtful activities for memory, focus, recognition and attention.', 'games'],
    [t('landing.aiPersonalization') || 'AI Personalization', Sparkles, t('landing.aiPersonalizationDesc') || 'Activities adapt gently based on progress and engagement.', null],
    [t('landing.voiceAssistance') || 'Voice Assistance', Mic, t('landing.voiceAssistanceDesc') || 'Simple, voice-enabled guidance made for everyday comfort.', null],
    [t('landing.smartReminders') || 'Smart Reminders', BellRing, t('landing.smartRemindersDesc') || 'Helpful prompts for medicines, hydration and appointments.', null],
    [t('landing.caregiverMonitoring') || 'Caregiver Monitoring', Activity, t('landing.caregiverMonitoringDesc') || 'A clear view of activity, mood and cognitive engagement.', null],
    [t('landing.safeReturnHome') || 'Safe Return Home', MapPin, t('landing.safeReturnHomeDesc') || 'Offline-assisted guidance to a saved home location.', 'safeHome'],
    [t('landing.offlineSupport') || 'Offline Support', WifiOff, t('landing.offlineSupportDesc') || 'Important assistance remains accessible with limited connectivity.', null],
    [t('landing.multilingualSupport') || 'Multilingual Support', Languages, t('landing.multilingualSupportDesc') || 'Choose from English, Hindi and 8 North-Eastern languages.', 'lang'],
  ]

  return (
    <section className="section" id="features">
      <div className="container">
        <SectionTitle eyebrow={t('landing.connectedCareEcosystem') || "A connected care ecosystem"} title={t('landing.onePlatformTitle') || "One platform. Complete cognitive care."} text={t('landing.onePlatformDesc') || "Gentle, practical support that brings patients, caregivers and healthcare workers closer together."} />
        <div className="feature-grid">
          {featureList.map(([title, Icon, text, actionType], i) => {
            const isGames = actionType === 'games'
            const isSafeHome = actionType === 'safeHome'
            const isLang = actionType === 'lang'
            const isClickable = isGames || isSafeHome || isLang
            const handleClick = isGames ? onOpenGames : (isSafeHome ? onOpenTakeMeHome : (isLang ? onOpenLanguageSelector : undefined))

            return (
              <article
                className="feature-card"
                key={title}
                onClick={handleClick}
                style={isClickable ? { cursor: 'pointer' } : undefined}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={isClickable ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleClick?.()
                  }
                } : undefined}
              >
                <span className={`icon-bubble ${['blue', 'violet', 'teal', 'coral'][i % 4]}`}><Icon size={21} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
                {isGames && (
                  <span className="feature-arrow" style={{ color: '#157f7a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t('landing.exploreGames') || 'Explore Games'} <ArrowRight size={17} />
                  </span>
                )}
                {isSafeHome && (
                  <span className="feature-arrow" style={{ color: '#157f7a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t('landing.takeMeHomeSOS') || 'Take Me Home & SOS'} <ArrowRight size={17} />
                  </span>
                )}
                {isLang && (
                  <span className="feature-arrow" style={{ color: '#157f7a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t('landing.selectLanguage') || 'Select Language'} <ArrowRight size={17} />
                  </span>
                )}
                {!isClickable && (
                  <span className="feature-arrow"><ArrowRight size={17} /></span>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    ['01', t('landing.step1Title') || 'Create a Patient Profile', t('landing.step1Desc') || 'A caregiver or health worker creates a simple profile.'],
    ['02', t('landing.step2Title') || 'Daily Cognitive Engagement', t('landing.step2Desc') || 'The elder enjoys clear activities at their own pace.'],
    ['03', t('landing.step3Title') || 'AI Learns & Adapts', t('landing.step3Desc') || 'The system adjusts activities based on engagement.'],
    ['04', t('landing.step4Title') || 'Caregivers Stay Connected', t('landing.step4Desc') || 'See activity, reminders and trends in one place.'],
  ]
  return (
    <section id="how-it-works" className="section how-section">
      <div className="container">
        <SectionTitle eyebrow={t('landing.simpleFromStart') || "Simple from the start"} title={t('landing.howMindCareWorks') || "How MindCare works"} />
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
function SafeHome({ onOpenTakeMeHome }) {
  const { t } = useTranslation()
  const checklist = [
    t('landing.safeCheck1') || 'Large emergency-friendly SOS button',
    t('landing.safeCheck2') || 'Simple voice-guided directions',
    t('landing.safeCheck3') || 'GPS location assistance',
    t('landing.safeCheck4') || 'One-tap call to caregiver or 112',
  ]
  return (
    <section className="section" id="safe-home">
      <div className="container safe-home">
        <div className="home-visual">
          <div className="map-grid" />
          <div className="map-road road-a" />
          <div className="map-road road-b" />
          <div className="pin pin-home"><Home size={21} fill="currentColor" /></div>
          <div className="pin pin-user"><span /></div>
          <button
            type="button"
            className="home-button"
            onClick={onOpenTakeMeHome}
            aria-label="Open Take Me Home & SOS screen"
            style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}
          >
            <MapPin size={20} />
            <span>TAKE ME<br />HOME</span>
          </button>
          <div className="location-note">
            <span className="icon-bubble teal"><Route size={17} /></span>
            <div><small>{t('landing.savedLocation') || 'Saved location'}</small><strong>{t('landing.homeAway') || 'Home • 1.2 km away'}</strong></div>
          </div>
        </div>
        <div className="safe-copy">
          <span className="eyebrow"><MapPin size={14} /> {t('landing.safetyAssistance') || 'Safety & SOS assistance'}</span>
          <h2>{t('landing.lostOrConfused') || 'Lost or confused?'} <em>{t('landing.letUsHelp') || 'Let us help you get home.'}</em></h2>
          <p>{t('landing.safeCopyText') || 'Offline-assisted navigation uses your compass direction and GPS location to guide an elderly user toward their saved home location with instant emergency SOS support.'}</p>
          <div className="safe-list">
            {checklist.map(x => (
              <span key={x}><Check size={16} />{x}</span>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <Button onClick={onOpenTakeMeHome}>
              {t('landing.openTakeMeHome') || 'Open Take Me Home & SOS'} <ArrowRight size={18} />
            </Button>
          </div>
          <p className="disclaimer"><Lightbulb size={16} /> {t('landing.safetyDisclaimer') || 'Navigation and SOS features provide assistance and do not replace caregiver supervision or emergency services.'}</p>
        </div>
      </div>
    </section>
  )
}
function Benefits() {
  const { t } = useTranslation()
  const groups = [
    [t('landing.forElderly') || 'For Elderly Users', Heart, [t('landing.forElderlyItem1') || 'Simple & accessible technology', t('landing.forElderlyItem2') || 'Cognitive engagement', t('landing.forElderlyItem3') || 'Daily routine assistance', t('landing.forElderlyItem4') || 'Greater independence']],
    [t('landing.forCaregivers') || 'For Caregivers', UsersRound, [t('landing.forCaregiversItem1') || 'Activity monitoring', t('landing.forCaregiversItem2') || 'Reminder tracking', t('landing.forCaregiversItem3') || 'Cognitive performance insights', t('landing.forCaregiversItem4') || 'Peace of mind']],
    [t('landing.forHealthcare') || 'For Healthcare Workers', Stethoscope, [t('landing.forHealthcareItem1') || 'Patient activity insights', t('landing.forHealthcareItem2') || 'Cognitive engagement trends', t('landing.forHealthcareItem3') || 'Remote accessibility', t('landing.forHealthcareItem4') || 'Support for rural communities']],
  ]
  return (
    <section className="section soft-section">
      <div className="container">
        <SectionTitle eyebrow={t('landing.careReachesEveryone') || "Care that reaches everyone"} title={t('landing.designedForIndependence') || "Designed for independence and peace of mind"} />
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
  const { t } = useTranslation()
  return (
    <section className="section" id="about">
      <div className="container future-wrap">
        <div>
          <SectionTitle center={false} eyebrow={t('landing.growingEveryNeed') || "Growing with every need"} title={t('landing.platformNext') || "A platform designed for what comes next."} text={t('landing.platformNextDesc') || "MindCare NER begins with a thoughtful foundation and grows alongside the people it serves."} />
          <Button kind="secondary">{t('landing.learnMore') || 'Learn more'} <ArrowRight size={17} /></Button>
        </div>
        <div className="future-grid">
          {future.map(([name, Icon]) => (
            <div className="future-card" key={name}>
              <span className="coming">{t('landing.comingSoon') || 'Coming soon'}</span>
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
  const { t } = useTranslation()
  return (
    <section id="contact" className="cta">
      <div className="container cta-inner">
        <div>
          <span className="eyebrow">MindCare NER</span>
          <h2>{t('landing.ctaTitle') || 'Building a safer and healthier future for elderly care.'}</h2>
          <p>{t('landing.ctaDesc') || 'Technology can help elders stay mentally engaged, connected, independent and safe.'}</p>
        </div>
        <div className="cta-actions">
          <Button onClick={() => openLogin('Caregiver')}>{t('landing.getStarted') || 'Get started'} <ArrowRight size={18} /></Button>
          <Button kind="secondary">{t('landing.learnMore') || 'Learn more'}</Button>
        </div>
      </div>
    </section>
  )
}
function Footer() {
  const { t } = useTranslation()
  const navItems = [
    { key: 'home', label: t('nav.home') || 'Home', href: '#home' },
    { key: 'features', label: t('nav.features') || 'Features', href: '#features' },
    { key: 'howItWorks', label: t('nav.howItWorks') || 'How It Works', href: '#how-it-works' },
    { key: 'about', label: t('nav.about') || 'About', href: '#about' },
  ]
  return (
    <footer>
      <div className="container footer-top">
        <div>
          <Logo />
          <p>{t('landing.footerTagline') || 'AI-powered cognitive care and safety platform.'}</p>
        </div>
        <div className="footer-links">
          {navItems.map(x => (
            <a href={x.href} key={x.key}>{x.label}</a>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <p>{t('landing.copyright') || '© 2026 MindCare NER. Designed with care for North East India.'}</p>
        <p>{t('landing.medicalNotice') || 'MindCare supports cognitive engagement and elderly care. It does not replace professional medical diagnosis or emergency services.'}</p>
      </div>
    </footer>
  )
}
function PatientLoginModal({ onClose, onSignIn }) {
  const { t } = useTranslation()
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
          aria-label={t('common.close') || "Close"}
          onClick={onClose}
          autoFocus
        >
          <X size={20} aria-hidden="true" />
        </button>

        <span className="icon-bubble teal patient-login-icon" aria-hidden="true">
          <Brain size={24} />
        </span>

        <h2 id="patient-login-title" className="patient-login-title">
          {t('auth.patientLogin') || 'Patient Login'}
        </h2>
        <p id="patient-login-desc" className="patient-login-desc">
          {t('auth.patientLoginDesc') || 'Sign in to continue your care journey.'}
        </p>

        <form onSubmit={handleSubmit} className="login-form patient-login-form" noValidate>
          <label htmlFor="patient-email-input" className="patient-field-label">
            <span>{t('auth.emailAddress') || 'Email address'}</span>
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
            <span>{t('auth.password') || 'Password'}</span>
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
                placeholder={t('auth.enterPassword') || "Enter password"}
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
            aria-label={t('auth.signIn') || "Sign In"}
          >
            <span>{t('auth.signIn') || 'Sign In'}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  )
}

function LoginModal({ type, onClose, onLogin, onPatientEnter }) {
  const { t } = useTranslation()
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
    setError(type === 'Caregiver' ? (t('auth.invalidCredentials') || 'Please enter the sample caregiver credentials shown below.') : 'The patient portal is coming soon.')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${type === 'Caregiver' ? 'login-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={e => e.stopPropagation()}>
        <button className="modal-x" aria-label={t('common.close') || "Close"} onClick={onClose} autoFocus><X /></button>
        <span className="icon-bubble blue"><HeartHandshake /></span>
        <h2 id="login-title">{isPatient ? (t('auth.patientLogin') || 'Patient Login') : (t('auth.caregiverLogin') || `${type} login`)}</h2>
        <p>{isPatient
          ? (t('auth.patientExperienceDesc') || 'Enter the patient experience directly. No username, password or OTP is required in this kiosk prototype.')
          : (type === 'Caregiver' ? (t('auth.caregiverLoginDesc') || 'Sign in to view your patient’s care overview.') : `The ${type.toLowerCase()} portal is being prepared for the next phase of MindCare NER.`)}
        </p>
        {type === 'Caregiver' && (
          <form onSubmit={submit} className="login-form">
            <label>{t('auth.emailAddress') || 'Email address'}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </label>
            <label>{t('auth.password') || 'Password'}
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
            </label>
            {error && <p className="login-error"><AlertCircle size={15} />{error}</p>}
            <Button type="submit">{t('auth.signIn') || 'Sign in'} <ArrowRight size={17} /></Button>
            <div className="demo-credentials">
              <strong>{t('auth.sampleCredentials') || 'Sample credentials'}</strong>
              <span>Email: singhmohak360@gmail.com</span>
              <span>Password: Hello@123</span>
            </div>
          </form>
        )}
        {isPatient && (
          <Button onClick={onPatientEnter}>
            {t('auth.enterPatientExperience') || 'Enter Patient Experience'}
          </Button>
        )}
        {type !== 'Caregiver' && !isPatient && (
          <Button onClick={onClose}>
            {t('auth.continueExploring') || 'Continue exploring'}
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
function PatientHeader({ onHome, onHelp, onVoice, onLanguage }) {
  const { currentLanguage, t } = useTranslation()
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
            <span>{t('common.home') || 'Home'}</span>
          </button>
          <button
            type="button"
            className="pd-ctrl-btn pd-ctrl-help"
            onClick={onHelp}
            aria-label="Call for Help"
          >
            <Phone size={28} aria-hidden="true" />
            <span>{t('common.help') || 'Help'}</span>
          </button>
          <button
            type="button"
            className="pd-ctrl-btn pd-ctrl-voice"
            onClick={onVoice}
            aria-label="Activate Voice Control"
          >
            <Mic size={28} aria-hidden="true" />
            <span>{t('patient.voiceGuidance') || 'Voice'}</span>
          </button>
          <button
            type="button"
            className="pd-ctrl-btn pd-ctrl-lang"
            onClick={onLanguage}
            aria-label={`Change language. Currently ${currentLanguage?.nativeName || 'English'}`}
            title="Change language"
          >
            <Languages size={28} aria-hidden="true" />
            <span>{currentLanguage?.code ? currentLanguage.code.toUpperCase() : 'Lang'}</span>
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
  'word-recall':     { id: 'word-recall',     title: 'Word Recall',      subtitle: 'Word recall & memory',       Icon: NotebookPen, colorClass: 'pd-card-violet', placeholder: 'Word recall activity will be available here.' },
  'different-object': { id: 'different-object', title: 'Find the Different Object', subtitle: 'Category odd-one-out', Icon: Sparkles, colorClass: 'pd-card-coral', placeholder: 'Category game will be available here.' },
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
  const { t } = useTranslation()
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
          aria-label={t('common.close') || "Close confirmation dialog and return to dashboard"}
          onClick={onCancel}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="pd-confirm-icon" aria-hidden="true">
          <LogOut size={26} />
        </div>

        <h2 id="logout-confirm-title" className="pd-confirm-title">
          {t('patient.areYouSure') || 'Are you sure?'}
        </h2>

        <p id="logout-confirm-desc" className="pd-confirm-desc">
          {t('patient.leaveDashboardConfirm') || 'Do you want to leave the patient dashboard?'}
        </p>

        <div className="pd-confirm-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="pd-confirm-btn-cancel"
            onClick={onCancel}
            autoFocus
          >
            {t('common.goBack') || 'Go Back'}
          </button>
          <button
            type="button"
            className="pd-confirm-btn-proceed"
            onClick={onConfirm}
          >
            {t('common.continue') || 'Continue'}
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
  const { t } = useTranslation()
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

        const firstElement = focusable[0]
        const lastElement = focusable[focusable.length - 1]

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
      setError(result.error || (t('auth.pinIncorrect') || "That PIN isn't correct. Please try again."))
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
          aria-label={t('common.cancel') || "Cancel and return to dashboard"}
          onClick={onCancel}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="caregiver-pin-icon" aria-hidden="true">
          <ShieldCheck size={26} />
        </div>

        <h2 id="caregiver-pin-title" className="caregiver-pin-title">
          {t('patient.caregiverAuthorization') || 'Caregiver Authorization'}
        </h2>

        <p id="caregiver-pin-desc" className="caregiver-pin-desc">
          {t('patient.enterPinToEnd') || 'Enter caregiver PIN to end this session.'}
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
              {t('patient.caregiverPin') || 'Caregiver PIN'}
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
              aria-label={t('patient.caregiverPin') || "Caregiver numeric PIN"}
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
              aria-label={t('common.clear') || "Clear PIN"}
            >
              {t('common.clear') || 'Clear'}
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
              aria-label={t('common.back') || "Delete last digit"}
            >
              ⌫
            </button>
          </div>

          <div className="caregiver-pin-actions">
            <button type="submit" className="pin-submit-btn">
              {t('common.submit') || 'Submit'}
            </button>
            <button
              type="button"
              className="pin-cancel-btn"
              onClick={onCancel}
            >
              {t('common.cancel') || 'Cancel'}
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
function PatientDashboard({ onHome, onNavigateActivity, onLogout, onOpenTakeMeHome, onOpenLanguageSelector }) {
  // Session — read displayName for the greeting.
  // displayName is null if unavailable; the greeting degrades gracefully to "Good Morning!".
  // Do NOT expose email, password, or sensitive medical info on the dashboard.
  const [session] = usePatientSession()
  const { t } = useTranslation()
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

  // Smart Reminder notification for due reminders
  const { dueReminder, handleDone, handleSnooze } = usePatientDueReminder(session?.patientId || 'MC-2048')

  function handleReminderDone(reminder) {
    handleDone(reminder)
    setAnnouncement('Done. Well done!')
  }

  function handleHelp() {
    if (onOpenTakeMeHome) {
      onOpenTakeMeHome()
    } else {
      setAnnouncement('Help is ready. A caregiver can assist you from here.')
    }
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

      <PatientHeader
        onHome={onHome}
        onHelp={handleHelp}
        onVoice={handleVoice}
        onLanguage={onOpenLanguageSelector}
      />

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
          <p className="pd-welcome-sub">{t('patient.chooseActivity') || "Let's choose an activity for today."}</p>
        </section>

        {/* ── Today's Progress ──────────────────────────────────── */}
        <section className="pd-progress-card" aria-labelledby="pd-progress-heading">
          <div className="pd-progress-content">
            <div className="pd-progress-header">
              <div className="pd-progress-title-wrap">
                <CircleCheck size={26} aria-hidden="true" />
                <h2 id="pd-progress-heading" className="pd-progress-title">{t('patient.todaysProgress') || "Today's Progress"}</h2>
              </div>
              <span className="pd-progress-count" aria-label={`${completedCount} of ${totalTodayActivities} ${t('patient.activitiesCompleted') || 'activities completed'}`}>
                {completedCount} of {totalTodayActivities} {t('common.completed') || 'Completed'}
              </span>
            </div>
            <div
              className="pd-progress-bar-track"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('patient.activityProgress') || "Today's activity progress"}
            >
              <div className="pd-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="pd-progress-sub">{t('patient.greatJob') || "Great job today! You're making gentle, steady progress."}</p>
          </div>
          <div className="pd-progress-badge" aria-hidden="true">
            <Sparkles size={20} />
            <span>{t('patient.keepGoing') || 'Keep Going'}</span>
          </div>
        </section>

        {/* ── Recommended Activity (Featured) ──────────────────── */}
        <section className="pd-today-panel" aria-labelledby="pd-today-heading">
          <div className="pd-today-content">
            <div className="pd-recommended-badge" aria-hidden="true">
              <Sparkles size={14} />
              <span>{t('patient.recommendedActivity') || 'Recommended Activity'}</span>
            </div>
            <p className="pd-today-label">
              <span aria-hidden="true">⭐ </span>{t('patient.featuredForYou') || 'Featured For You'}
            </p>
            <h2 id="pd-today-heading" className="pd-today-title">{t('games.memoryMatch') || TODAY_ACTIVITY.title}</h2>
            <p className="pd-today-desc">{t('games.memoryMatchDesc') || TODAY_ACTIVITY.subtitle}. {t('patient.tryGentleExercise') || "Let's try a gentle memory exercise together."}</p>
          </div>
          <button
            type="button"
            className="pd-start-btn"
            onClick={() => onNavigateActivity(TODAY_ACTIVITY.id)}
            aria-label={`${t('patient.startActivity') || 'Start Activity'}: ${t('games.memoryMatch') || TODAY_ACTIVITY.title}`}
          >
            <span>{t('patient.startActivity') || 'Start Activity'}</span>
            <ArrowRight size={30} aria-hidden="true" />
          </button>
        </section>

        {/* ── Today's Activities ───────────────────────────────── */}
        <section className="pd-activities-section" aria-labelledby="pd-activities-heading">
          <h2 id="pd-activities-heading" className="pd-section-heading">{t('patient.todayActivities') || "Today's Activities"}</h2>
          {/*
            Each card is a <button> so it is:
            • Reachable by Tab key
            • Activatable by Enter or Space
            • Announced as interactive by screen readers
            Each card navigates to its own dedicated placeholder page.
          */}
          <div className="pd-activity-grid">
            {ACTIVITY_CARDS.map(({ id, title, subtitle, Icon, colorClass }) => {
              const localizedTitle = id === 'brain-games' ? (t('patient.brainGames') || title)
                : id === 'memory-activity' ? (t('patient.memoryActivity') || title)
                : id === 'music-memories' ? (t('patient.musicMemories') || title)
                : id === 'talk-recall' ? (t('patient.talkRecall') || title)
                : title
              const localizedSub = id === 'brain-games' ? (t('patient.trainMemory') || subtitle)
                : id === 'memory-activity' ? (t('patient.practiceRemembering') || subtitle)
                : id === 'music-memories' ? (t('patient.listenRemember') || subtitle)
                : id === 'talk-recall' ? (t('patient.talkFamiliar') || subtitle)
                : subtitle

              return (
                <button
                  key={id}
                  type="button"
                  className={`pd-activity-card ${colorClass}`}
                  onClick={() => onNavigateActivity(id)}
                  aria-label={`${localizedTitle} — ${localizedSub}. ${t('patient.tapToOpen') || 'Tap to open.'}`}
                >
                  <div className="pd-card-icon" aria-hidden="true">
                    <Icon size={48} />
                  </div>
                  <div className="pd-card-body" aria-hidden="true">
                    <p className="pd-card-title">{localizedTitle}</p>
                    <p className="pd-card-sub">{localizedSub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Take Me Home & Emergency SOS Section ────────────────── */}
        <section className="pd-safety-section" aria-labelledby="pd-safety-heading" style={{ marginTop: 28, marginBottom: 12 }}>
          <div className="pd-safety-card" style={{
            background: 'linear-gradient(135deg, #edf8f6 0%, #e0f4f1 100%)',
            border: '2px solid #b2dfdb',
            borderRadius: 20,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="icon-bubble teal" style={{ width: 52, height: 52, borderRadius: 14 }}>
                <Home size={28} />
              </span>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#157f7a', textTransform: 'uppercase' }}>
                  {t('patient.safetyAssistance') || 'Safety & Assistance'}
                </span>
                <h3 id="pd-safety-heading" style={{ margin: '3px 0 4px', fontSize: 21, color: '#173944', fontFamily: 'Fraunces, Georgia, serif' }}>
                  {t('patient.takeMeHomeSOS') || 'Take Me Home & SOS'}
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: '#55747a' }}>
                  {t('patient.takeMeHomeDesc') || 'Compass navigation toward home and direct emergency contact support.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenTakeMeHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 16,
                fontWeight: 700,
                padding: '14px 24px',
                minHeight: 52,
                borderRadius: 14,
                boxShadow: '0 6px 18px rgba(21, 127, 122, 0.25)'
              }}
            >
              <span>{t('patient.takeMeHomeSOS') || 'Take Me Home & SOS'}</span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
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
              <span className="pd-danger-tag">{t('patient.deviceSession') || 'Device Session'}</span>
              <h2 id="pd-danger-heading" className="pd-danger-title">{t('patient.dangerZone') || 'Danger Zone'}</h2>
              <p className="pd-danger-desc">{t('patient.dangerZoneDesc') || 'Leaving this device will end the patient session.'}</p>
            </div>
            <button
              type="button"
              className="pd-logout-btn"
              onClick={handleLogoutClick}
              aria-label={t('patient.logoutDevice') || "Log Out. Leaving this device will end the patient session."}
            >
              <LogOut size={18} aria-hidden="true" />
              <span>{t('common.logout') || 'Log Out'}</span>
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

      {/* ── Patient-Facing Smart Reminder Notification ────────────── */}
      {dueReminder && (
        <PatientReminderModal
          reminder={dueReminder}
          onDone={handleReminderDone}
          onSnooze={handleSnooze}
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
function CaregiverDashboard({ onLogout, dark, onToggleTheme, onOpenTakeMeHome, onOpenLanguageSelector }) {
  const { currentLanguage, setLanguage, t } = useTranslation()
  const [langNotice, setLangNotice] = useState('')

  const stats = [
    [t('caregiver.statActivity') || "Today's activity", '42 min', Clock3, 'teal'],
    [t('caregiver.statCognitive') || 'Cognitive score', '72 / 100', TrendingUp, 'violet'],
    [t('caregiver.statMedication') || 'Medication', `2 of 3 ${t('common.completed')?.toLowerCase() || 'taken'}`, Pill, 'coral'],
    [t('caregiver.statNextAppt') || 'Next appointment', '12 Sep', CalendarDays, 'blue']
  ]
  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <Logo />
          <span>{t('caregiver.portal') || 'Caregiver portal'}</span>
        </div>
        <div className="dash-actions">
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
          <button
            type="button"
            className="dash-lang-btn"
            onClick={onOpenLanguageSelector}
            aria-label={`Language selector. Currently ${currentLanguage?.name || 'English'}`}
            title="Change language"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 44,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1.5px solid #157f7a',
              background: '#f0fdfa',
              color: '#0f766e',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <Languages size={18} />
            <span>🌐 {currentLanguage?.nativeName || 'English'}</span>
          </button>
          <button className="notification"><BellRing size={19} /><i /></button>
          <div className="caregiver-name">
            <span>MS</span>
            <div><strong>Mohak Singh</strong><small>{t('caregiver.role') || 'Caregiver'}</small></div>
            <ChevronDown size={15} />
          </div>
          <button className="logout" onClick={onLogout}><LogOut size={17} /> <b>{t('common.logout') || 'Logout'}</b></button>
        </div>
      </header>
      <main className="dash-main">
        <section className="dash-welcome">
          <div>
            <p className="dash-kicker">{t('caregiver.careOverview') || 'CARE OVERVIEW'}</p>
            <h1>{t('caregiver.greeting') || 'Good morning, Mohak.'}</h1>
            <p>{t('caregiver.patientStatus') || 'Here’s how Mr. Ramesh Das is doing today.'}</p>
          </div>
          <div className="sync-status"><CircleCheck size={18} /> {t('caregiver.lastUpdated') || 'Last updated today, 9:42 AM'}</div>
        </section>
        <section className="patient-banner">
          <div className="patient-avatar">RD</div>
          <div className="patient-summary">
            <span>{t('caregiver.yourPatient') || 'YOUR PATIENT'}</span>
            <h2>Mr. Ramesh Das <i>•</i> <small>72 {t('caregiver.yearsOld') || 'years'}</small></h2>
            <p><MapPin size={15} /> Guwahati, Assam <b>•</b> {t('caregiver.patientId') || 'Patient ID'}: MC-2048</p>
          </div>
          <div className="risk-chip">
            <span>{t('caregiver.dementiaLevel') || 'DEMENTIA LEVEL'}</span>
            <strong>{t('caregiver.moderate') || 'Moderate'}</strong>
            <small>{t('caregiver.needsSupport') || 'Needs regular support'}</small>
          </div>
          <button className="view-profile">{t('caregiver.viewProfile') || 'View full profile'} <ArrowRight size={16} /></button>
        </section>
        <section className="stat-grid">
          {stats.map(([name, value, Icon, color]) => (
            <article className="dash-stat" key={name}>
              <span className={`icon-bubble ${color}`}><Icon size={20} /></span>
              <div><p>{name}</p><strong>{value}</strong></div>
            </article>
          ))}
        </section>
        {/* ── Smart Reminders Section ──────────────────────────────── */}
        <CaregiverRemindersSection patientId="MC-2048" />

        {/* ── Emergency & Safety Settings Section ────────────────── */}
        <CaregiverEmergencySection onPreviewTakeMeHome={onOpenTakeMeHome} />

        <section className="dash-grid">
          <div className="dash-card progress-card">
            <div className="card-title">
              <div><p className="dash-kicker">{t('caregiver.cognitiveProgress') || 'COGNITIVE PROGRESS'}</p><h2>{t('caregiver.weeklyEngagement') || 'Weekly engagement'}</h2></div>
              <button>{t('caregiver.thisWeek') || 'This week'} <ChevronDown size={14} /></button>
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
              <span><b>12% improvement</b> {t('caregiver.improvementCompared') || 'in cognitive engagement compared with last week.'}</span>
            </div>
          </div>
          <div className="dash-card routine-card">
            <div className="card-title">
              <div><p className="dash-kicker">{t('caregiver.todaysRoutine') || 'TODAY’S ROUTINE'}</p><h2>{t('caregiver.careTasks') || 'Care tasks'}</h2></div>
              <button className="link-btn">{t('caregiver.viewAll') || 'View all'}</button>
            </div>
            {[
              [t('caregiver.taskMorningMed') || 'Morning medicine', '8:00 AM', t('common.completed') || 'Completed', true],
              [t('caregiver.taskMemoryGame') || 'Memory matching activity', '10:30 AM', t('common.completed') || 'Completed', true],
              [t('caregiver.taskAfternoonMed') || 'Afternoon medicine', '2:00 PM', t('caregiver.upcoming') || 'Upcoming', false],
              [t('caregiver.taskEveningWalk') || 'Evening walk', '5:30 PM', t('caregiver.upcoming') || 'Upcoming', false]
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
              <div><p className="dash-kicker">{t('caregiver.patientDetails') || 'PATIENT DETAILS'}</p><h2>{t('caregiver.healthSnapshot') || 'Health snapshot'}</h2></div>
              <UserRound size={21} />
            </div>
            <div className="detail-list">
              <p><span>{t('caregiver.bloodGroup') || 'Blood group'}</span><b>B+</b></p>
              <p><span>{t('caregiver.primaryLanguage') || 'Primary language'}</span><b>{currentLanguage.name} ({currentLanguage.nativeName})</b></p>
              <p><span>{t('caregiver.emergencyContact') || 'Emergency contact'}</span><b>{getEmergencyContact()?.phone || 'Not set'}</b></p>
              <p><span>{t('caregiver.carePhysician') || 'Care physician'}</span><b>Dr. Ananya Bora</b></p>
            </div>
          </div>
          <div className="dash-card lang-setting-card" style={{ gridColumn: 'span 2' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p className="dash-kicker">{t('caregiver.preferences') || 'PATIENT PREFERENCES'}</p>
                <h2>{t('caregiver.preferredLanguage') || 'Patient Preferred Language'}</h2>
              </div>
              <Languages size={22} style={{ color: '#157f7a' }} />
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-muted, #64748b)' }}>
              {t('caregiver.preferredLanguageDesc') || 'Choose the primary dialect and script for the patient interface, cognitive games, and voice guidance.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <select
                value={currentLanguage.code}
                onChange={(e) => {
                  const newCode = e.target.value
                  setLanguage(newCode)
                  const targetLang = SUPPORTED_LANGUAGES.find((l) => l.code === newCode)
                  setLangNotice(`${t('caregiver.languageUpdatedNotice') || 'Patient language updated to'} ${targetLang?.name || newCode} (${targetLang?.nativeName || ''})`)
                  setTimeout(() => setLangNotice(''), 6000)
                }}
                aria-label={t('caregiver.preferredLanguage') || "Patient Preferred Language"}
                style={{
                  padding: '10px 16px',
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 10,
                  border: '2px solid #157f7a',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--text-primary, #1e293b)',
                  minWidth: 260,
                  cursor: 'pointer',
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} — {lang.nativeName} ({lang.region})
                  </option>
                ))}
              </select>
              {langNotice && (
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0d9488', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CircleCheck size={18} /> {langNotice}
                </span>
              )}
            </div>
          </div>
          <div className="dash-card insights-card">
            <div className="card-title">
              <div><p className="dash-kicker">{t('caregiver.careInsight') || 'CARE INSIGHT'}</p><h2>{t('caregiver.todaysNote') || 'Today’s note'}</h2></div>
              <Sparkles size={21} />
            </div>
            <p>{t('caregiver.insightText') || 'Ramesh showed strong recognition during the family-photo activity and responded well to voice prompts.'}</p>
            <div><Heart size={16} fill="currentColor" /> {t('caregiver.mood') || 'Mood'}: <b>{t('caregiver.calmEngaged') || 'Calm & engaged'}</b></div>
          </div>
        </section>
      </main>
    </div>
  )
}

/* ─── App Root ───────────────────────────────────────────────────── */
function AppRoot() {
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
   *   'games'                — cognitive games hub
   *   'take-me-home'         — safe home navigation and SOS assistance
   *   'language-select'      — accessible language selector screen
   *   'patient-dashboard'    — patient dashboard
   *   'activity:{id}'        — activity page for the given id (memory-match, word-recall, etc.)
   *                            id is a key in ACTIVITY_DATA
   */
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionView = getActiveSessionView()
      const historyView = window.history.state?.view
      // If user has an active session running in this tab, restore exact view
      if (isPatientSessionActive()) {
        if (sessionView && (sessionView === 'patient-dashboard' || sessionView.startsWith('activity:') || sessionView === 'games' || sessionView === 'take-me-home' || sessionView === 'language-select')) {
          return sessionView
        }
        if (historyView && (historyView === 'patient-dashboard' || historyView.startsWith('activity:') || historyView === 'games' || historyView === 'take-me-home' || historyView === 'language-select')) {
          return historyView
        }
        return 'patient-dashboard'
      }
      // If returning via browser history and device setup was completed
      if (historyView && (historyView === 'patient-dashboard' || historyView.startsWith('activity:') || historyView === 'games' || historyView === 'take-me-home' || historyView === 'language-select')) {
        if (isPatientDeviceSetupComplete() || historyView === 'games' || historyView === 'take-me-home' || historyView === 'language-select' || historyView.startsWith('activity:')) {
          return historyView
        }
      }
      if (historyView === 'games' || historyView === 'take-me-home' || historyView === 'language-select' || historyView?.startsWith('activity:')) {
        return historyView
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
    if (nextView === 'patient-dashboard' || nextView.startsWith('activity:') || nextView === 'games' || nextView === 'take-me-home' || nextView === 'language-select') {
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

  /** Navigate to any activity or game page */
  function navigateActivity(activityId) {
    if (activityId === 'games' || activityId === 'brain-games') {
      navigateTo('games')
    } else if (activityId === 'memory-activity') {
      navigateTo('activity:word-recall')
    } else {
      navigateTo(`activity:${activityId}`)
    }
  }

  // ── Take Me Home & SOS View ──────────────────────────────────
  if (view === 'take-me-home') {
    const hasSession = Boolean(activeSession || isPatientSessionActive())
    const handleBackFromSOS = () => {
      if (dashboard) {
        // If caregiver opened it, return to Caregiver Portal
        navigateTo('landing')
      } else if (hasSession) {
        backToDashboard()
      } else {
        backToLanding()
      }
    }
    const backLabel = dashboard
      ? 'Back to Caregiver Portal'
      : (hasSession ? 'Back to Dashboard' : 'Back to Home')

    return (
      <TakeMeHome
        onBack={handleBackFromSOS}
        backLabel={backLabel}
      />
    )
  }

  // ── Language Selector View ──────────────────────────────────
  if (view === 'language-select') {
    const hasSession = Boolean(activeSession || isPatientSessionActive())
    const handleBackFromLang = () => {
      if (dashboard) {
        // Return to Caregiver Portal
        navigateTo('landing')
      } else if (hasSession) {
        backToDashboard()
      } else {
        backToLanding()
      }
    }
    const backLabel = dashboard
      ? 'Back to Caregiver Portal'
      : (hasSession ? 'Back to Dashboard' : 'Back to Home')

    return (
      <LanguageSelectorScreen
        onBack={handleBackFromLang}
        backLabel={backLabel}
      />
    )
  }

  if (dashboard) {
    return (
      <CaregiverDashboard
        onLogout={() => setDashboard(false)}
        dark={dark}
        onToggleTheme={toggleTheme}
        onOpenTakeMeHome={() => navigateTo('take-me-home')}
        onOpenLanguageSelector={() => navigateTo('language-select')}
      />
    )
  }

  // ── Games Hub View (Accessible from landing or dashboard) ─────
  if (view === 'games') {
    const hasSession = Boolean(activeSession || isPatientSessionActive())
    return (
      <GamesHub
        onBack={hasSession ? backToDashboard : backToLanding}
        onOpenGame={(gameId) => {
          navigateTo(`activity:${gameId}`)
        }}
        backLabel={hasSession ? 'Back to Dashboard' : 'Back to Home'}
      />
    )
  }

  // ── Patient experience views ──────────────────────────────────
  const isPatientView =
    view === 'patient-dashboard' || view.startsWith('activity:')

  if (isPatientView) {
    const activityId = view.startsWith('activity:') ? view.slice(9) : null
    const hasSession = Boolean(activeSession || isPatientSessionActive())

    if (activityId === 'memory-match') {
      return (
        <MemoryMatch
          onBack={hasSession ? backToDashboard : backToLanding}
          onBackToGames={() => navigateTo('games')}
          backLabel={hasSession ? 'Back to Dashboard' : 'Back to Home'}
        />
      )
    }

    if (activityId === 'word-recall' || activityId === 'memory-activity') {
      return (
        <WordRecall
          onBack={hasSession ? backToDashboard : backToLanding}
          onBackToGames={() => navigateTo('games')}
          backLabel={hasSession ? 'Back to Dashboard' : 'Back to Home'}
        />
      )
    }

    if (activityId === 'different-object') {
      return (
        <DifferentObject
          onBack={hasSession ? backToDashboard : backToLanding}
          onBackToGames={() => navigateTo('games')}
          backLabel={hasSession ? 'Back to Dashboard' : 'Back to Home'}
        />
      )
    }

    return (
      <PatientSessionProvider initialSession={activeSession ?? {}}>
        {view === 'patient-dashboard'
          ? (
            <PatientDashboard
              onHome={backToLanding}
              onNavigateActivity={navigateActivity}
              onLogout={handlePatientLogout}
              onOpenTakeMeHome={() => navigateTo('take-me-home')}
              onOpenLanguageSelector={() => navigateTo('language-select')}
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
      <Navbar
        openLogin={handleOpenLogin}
        dark={dark}
        onToggleTheme={toggleTheme}
        onOpenLanguageSelector={() => navigateTo('language-select')}
      />
      <main id="main-content" tabIndex={-1}>
        <Hero openLogin={handleOpenLogin} />
        <Challenges />
        <Features
          onOpenGames={() => navigateTo('games')}
          onOpenTakeMeHome={() => navigateTo('take-me-home')}
          onOpenLanguageSelector={() => navigateTo('language-select')}
        />
        <HowItWorks />
        <SafeHome onOpenTakeMeHome={() => navigateTo('take-me-home')} />
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

export default function App() {
  return (
    <LanguageProvider>
      <AppRoot />
    </LanguageProvider>
  )
}
