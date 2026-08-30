import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Disciplines from './components/Disciplines';
import VectorWorkbench from './components/VectorWorkbench';
import TbilisiNetwork from './components/TbilisiNetwork';
import Archive from './components/Archive';
import Machinery from './components/Machinery';
import SpecInquiry from './components/SpecInquiry';
import Footer from './components/Footer';
import VectorCursor from './components/VectorCursor';
import VectorFieldCanvas from './components/VectorFieldCanvas';

export default function App() {
  const [theme, setTheme] = useState('light'); // 'light' (pure crisp white default) or 'dark'
  const [lang, setLang] = useState('ka'); // 'ka' (Georgian default) or 'en'
  const [gridActive, setGridActive] = useState(true);
  const [transferredSpec, setTransferredSpec] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    showToast(lang === 'ka' ? `თემა შეიცვალა: ${nextTheme === 'dark' ? 'მუქი' : 'ნათელი'}` : `Theme switched to ${nextTheme.toUpperCase()}`);
  };

  const toggleLang = () => {
    const nextLang = lang === 'ka' ? 'en' : 'ka';
    setLang(nextLang);
    document.documentElement.setAttribute('lang', nextLang);
    showToast(nextLang === 'ka' ? 'ენა გადაირთო: ქართული' : 'Language switched to: ENGLISH');
  };

  const toggleGrid = () => {
    setGridActive(!gridActive);
    showToast(lang === 'ka' ? `ვექტორული ბადე: ${!gridActive ? 'ჩართულია' : 'გამორთულია'}` : `Vector grid ${!gridActive ? 'ENABLED' : 'DISABLED'}`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleTransferSpec = (spec) => {
    setTransferredSpec(spec);
    showToast(lang === 'ka' ? '✨ CAD პარამეტრები გადატანილია შეკვეთის ფორმაში.' : '✨ CAD Specification transferred to Inquiry Form.');
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
        <Hero 
          lang={lang}
          onOpenInquiry={() => {
            document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
          }} 
        />

        <Disciplines 
          lang={lang}
          onSelectDiscipline={(discCode) => {
            document.getElementById('workbench')?.scrollIntoView({ behavior: 'smooth' });
          }} 
        />

        <VectorWorkbench 
          lang={lang}
          onTransferSpec={handleTransferSpec} 
        />

        <TbilisiNetwork lang={lang} />

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

      {/* Minimalist Toast */}
      {toastMessage && (
        <div className="minimal-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
