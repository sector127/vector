import React, { useState, useEffect } from 'react';
import { Sun, Moon, Grid, ArrowUpRight, Globe, Menu, X } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

export default function Header({ theme, toggleTheme, gridActive, toggleGrid, lang, toggleLang }) {
  const [tbilisiTime, setTbilisiTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = getTranslation(lang);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Tbilisi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setTbilisiTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="swiss-header">
      <div className="container header-inner">
        {/* Brand Name & Studio */}
        <a href="#hero" className="brand-vector" onClick={closeMenu} data-cursor-text="VECTOR HUB">
          <div className="brand-glyph-box">
            <span>V</span>
          </div>
          <div className="brand-info-col">
            <span className="brand-title">VECTOR HUB</span>
            <span className="brand-location">{t.brandTagline}</span>
          </div>
        </a>

        {/* Desktop Nav - One Single Clean Line */}
        <nav className="header-nav-single-line">
          <a href="#disciplines" className="header-nav-item" data-cursor-text={t.navDisciplines.toUpperCase()}>
            {t.navDisciplines}
          </a>
          <a href="#workbench" className="header-nav-item" data-cursor-text={t.navStudio.toUpperCase()}>
            {t.navStudio}
          </a>
          <a href="#mockup-studio" className="header-nav-item" data-cursor-text={t.navMockup.toUpperCase()}>
            {t.navMockup}
          </a>
          <a href="#archive" className="header-nav-item" data-cursor-text={t.navArchive.toUpperCase()}>
            {t.navArchive}
          </a>
          <a href="#machinery" className="header-nav-item" data-cursor-text={t.navFacility.toUpperCase()}>
            {t.navFacility}
          </a>
        </nav>

        {/* Right HUD Controls */}
        <div className="header-hud">
          {/* Language Switcher (Georgian / English / Russian) */}
          <button 
            className="lang-toggle-btn"
            onClick={() => toggleLang()}
            title={t.switchLangTooltip}
            data-cursor-text={t.switchLangCursor}
          >
            <Globe size={14} />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Live Tbilisi Time (Hidden on small mobile) */}
          <div className="tbilisi-time-badge header-time-desktop" title="Tbilisi Local Production Time">
            <div className="pulse-dot"></div>
            <span className="time-badge-city">{t.tbsClock}</span>
            <span className="time-badge-digits">{tbilisiTime || '19:55:00'}</span>
          </div>

          {/* Grid Toggle */}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleGrid} 
            title="Toggle Vector Grid"
            data-cursor-text="GRID"
          >
            <Grid size={15} strokeWidth={gridActive ? 2.5 : 1.5} />
          </button>

          {/* Theme Inversion */}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            title="Toggle Theme Inversion"
            data-cursor-text="THEME"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Direct CTA (Desktop only) */}
          <a href="#inquiry" className="btn-swiss btn-swiss-sm header-cta-desktop" data-cursor-text={t.inquireBtn.toUpperCase()}>
            <span>{t.inquireBtn}</span>
            <ArrowUpRight size={13} />
          </a>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            data-cursor-text="MENU"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          <a href="#disciplines" className="mobile-nav-link" onClick={closeMenu}>
            <span>01</span>
            <span>{t.navDisciplines}</span>
          </a>
          <a href="#workbench" className="mobile-nav-link" onClick={closeMenu}>
            <span>02</span>
            <span>{t.navStudio}</span>
          </a>
          <a href="#mockup-studio" className="mobile-nav-link" onClick={closeMenu}>
            <span>03</span>
            <span>{t.navMockup}</span>
          </a>
          <a href="#archive" className="mobile-nav-link" onClick={closeMenu}>
            <span>04</span>
            <span>{t.navArchive}</span>
          </a>
          <a href="#machinery" className="mobile-nav-link" onClick={closeMenu}>
            <span>05</span>
            <span>{t.navFacility}</span>
          </a>
          <a href="#inquiry" className="mobile-nav-link cta" onClick={closeMenu}>
            <span>06</span>
            <span>{t.inquireBtn} →</span>
          </a>
        </div>

        <div className="mobile-drawer-footer">
          {/* Mobile Direct Language Selector */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '12px' }}>
            {['ka', 'en', 'ru'].map((l) => (
              <button
                key={l}
                onClick={() => { toggleLang(l); closeMenu(); }}
                className={`btn-swiss btn-swiss-sm ${lang === l ? 'btn-swiss-solid' : ''}`}
                style={{ flex: 1, justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700' }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="tbilisi-time-badge" style={{ width: '100%', justifyContent: 'center' }}>
            <div className="pulse-dot"></div>
            <span className="time-badge-city">{t.tbsClock}</span>
            <span className="time-badge-digits">{tbilisiTime || '19:55:00'}</span>
            <span>• GET: UTC+4</span>
          </div>
        </div>
      </div>
    </header>
  );
}
