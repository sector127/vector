import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Disciplines from './components/Disciplines';
import VectorWorkbench from './components/VectorWorkbench';
import BillboardMockup from './components/BillboardMockup';
import Archive from './components/Archive';
import Machinery from './components/Machinery';
import SpecInquiry from './components/SpecInquiry';
import MobileDock from './components/MobileDock';
import Footer from './components/Footer';
import VectorCursor from './components/VectorCursor';
import VectorFieldCanvas from './components/VectorFieldCanvas';
import { getTranslation } from './i18n/translations';

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vector_hub_theme');
      if (saved) return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vector_hub_lang');
      if (saved && ['ka', 'en', 'ru'].includes(saved)) return saved;
    }
    return 'ka';
  });

  const [gridActive, setGridActive] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vector_hub_grid');
      if (saved !== null) return saved !== 'false';
    }
    return true;
  });

  const [transferredSpec, setTransferredSpec] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const t = getTranslation(lang);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('vector_hub_theme', theme);
    } catch { }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    try {
      localStorage.setItem('vector_hub_lang', lang);
    } catch { }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem('vector_hub_grid', String(gridActive));
    } catch { }
  }, [gridActive]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    showToast(nextTheme === 'dark' ? t.toastThemeDark : t.toastThemeLight);
  };

  const toggleLang = (targetLang) => {
    let nextLang;
    if (typeof targetLang === 'string') {
      nextLang = targetLang;
    } else {
      if (lang === 'ka') nextLang = 'en';
      else if (lang === 'en') nextLang = 'ru';
      else nextLang = 'ka';
    }
    setLang(nextLang);
    const nextT = getTranslation(nextLang);
    showToast(nextT.toastLangSwitched);
  };

  const toggleGrid = () => {
    const nextGrid = !gridActive;
    setGridActive(nextGrid);
    showToast(nextGrid ? t.toastGridEnabled : t.toastGridDisabled);
  };

  const showToast = (msg) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 4000);
  };

  const handleTransferSpec = (spec) => {
    setTransferredSpec(spec);
    showToast(t.toastSpecTransferred);
    const el = document.getElementById('inquiry');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-root">
      {/* Interactive Vector Precision Cursor */}
      <VectorCursor />

      {/* Interactive Mathematical Vector Field Background */}
      {gridActive && <VectorFieldCanvas theme={theme} />}

      {/* Global Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        gridActive={gridActive}
        toggleGrid={toggleGrid}
        lang={lang}
        toggleLang={toggleLang}
      />

      {/* Main Content Sections */}
      <main>
        <Hero lang={lang} />

        <Disciplines lang={lang} />

        <VectorWorkbench
          lang={lang}
          onTransferSpec={handleTransferSpec}
          onShowToast={showToast}
        />

        <BillboardMockup
          lang={lang}
          onBookBillboard={handleTransferSpec}
          onShowToast={showToast}
        />

        <Archive lang={lang} />

        <Machinery lang={lang} />

        <SpecInquiry
          lang={lang}
          transferredSpec={transferredSpec}
          onShowToast={showToast}
        />
      </main>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Mobile Quick Action Dock */}
      <MobileDock lang={lang} />

      {/* Minimalist Toast */}
      {toastMessage && (
        <div className="minimal-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
