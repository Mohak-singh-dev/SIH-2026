/**
 * src/components/LanguageSelector/LanguageSelectorScreen.jsx
 * 
 * Dementia & Elderly-Friendly Language Selection Screen
 * Large cards, clear visual radio/check indicators, high readability,
 * and immediate response.
 */

import { useState } from 'react'
import { Check, ArrowLeft, Globe, Volume2, VolumeX, ShieldCheck } from 'lucide-react'
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/index.js'
import { detectLanguageVoice } from '../../i18n/voiceDetection.js'
import './LanguageSelectorScreen.css'

export default function LanguageSelectorScreen({ onBack, onSave, backLabel }) {
  const { language, setLanguage, t } = useTranslation()
  const [selectedCode, setSelectedCode] = useState(language)
  const [voiceNotice, setVoiceNotice] = useState(() => {
    return detectLanguageVoice(language).notice
  })

  const handleSelect = (code) => {
    setSelectedCode(code)
    const voiceStatus = detectLanguageVoice(code)
    setVoiceNotice(voiceStatus.notice)
  }

  const handleConfirm = () => {
    setLanguage(selectedCode)
    if (typeof onSave === 'function') {
      onSave(selectedCode)
    } else if (typeof onBack === 'function') {
      onBack()
    }
  }

  return (
    <div className="lss-page" role="main" aria-labelledby="lss-heading">
      <header className="lss-topbar">
        <div className="container lss-topbar-inner">
          <button
            type="button"
            className="btn btn-secondary lss-back-btn"
            onClick={onBack}
            aria-label={backLabel || t('common.back', 'Back')}
          >
            <ArrowLeft size={20} aria-hidden="true" />
            <span>{backLabel || t('common.back', 'Back')}</span>
          </button>

          <div className="lss-brand">
            <span className="icon-bubble teal" aria-hidden="true">
              <Globe size={24} />
            </span>
            <div>
              <span className="lss-brand-tag">SMRITI CARE</span>
              <span className="lss-brand-sub">{t('common.language', 'Language')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container lss-main">
        <div className="lss-header-area">
          <h1 id="lss-heading" className="lss-title">
            {t('languageSelector.title', 'Choose Your Language')}
          </h1>
          <p className="lss-subtitle">
            {t('languageSelector.subtitle', 'Select the language you are most comfortable with.')}
          </p>
        </div>

        {/* Language Cards Grid */}
        <div
          className="lss-grid"
          role="radiogroup"
          aria-label={t('languageSelector.title', 'Choose Your Language')}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedCode === lang.code
            const hasVoice = detectLanguageVoice(lang.code).hasVoice

            return (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`lss-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                <div className="lss-card-content">
                  <span className="lss-native-name">{lang.nativeName}</span>
                  <span className="lss-english-name">{lang.name}</span>
                  <span className="lss-region-badge">{lang.region}</span>
                </div>

                <div className="lss-indicator-wrap">
                  {isSelected ? (
                    <span className="lss-check-indicator selected" aria-hidden="true">
                      <Check size={22} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="lss-check-indicator" aria-hidden="true" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Voice status info bar */}
        <div className="lss-voice-status" role="status">
          <div className="lss-voice-icon">
            {detectLanguageVoice(selectedCode).hasVoice ? (
              <Volume2 size={20} aria-hidden="true" />
            ) : (
              <VolumeX size={20} aria-hidden="true" />
            )}
          </div>
          <p className="lss-voice-text">{voiceNotice}</p>
        </div>

        {/* Action Buttons */}
        <div className="lss-action-bar">
          <button
            type="button"
            className="btn btn-primary lss-confirm-btn"
            onClick={handleConfirm}
          >
            <ShieldCheck size={22} aria-hidden="true" />
            <span>{t('languageSelector.save', 'Continue in this language')}</span>
          </button>
        </div>
      </main>
    </div>
  )
}
