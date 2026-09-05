import React, { useState, useRef } from 'react';
import { Download, Sun, Moon, Upload, ArrowRight, Sparkles, Image as ImageIcon, ShieldCheck, Wrench, Layers, Loader2 } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

export default function BillboardMockup({ lang, onBookBillboard, onShowToast }) {
  const t = getTranslation(lang);

  // Selected Location: 'letters', 'rustaveli', 'heroes', 'vake', 'kakheti'
  const [selectedLoc, setSelectedLoc] = useState('letters');
  const [nightMode, setNightMode] = useState(false);
  const [inputMode, setInputMode] = useState('designer'); // 'designer' or 'upload'
  const [isExporting, setIsExporting] = useState(false);

  // Custom Designer State
  const [headline, setHeadline] = useState('VECTOR HUB');
  const [subtext, setSubtext] = useState('ARCHITECTURAL SIGNAGE STUDIO');
  const [activeTheme, setActiveTheme] = useState('gold'); // 'gold', 'white', 'cyan', 'emerald'
  const [activePreset, setActivePreset] = useState('vector');
  const [letterDepth, setLetterDepth] = useState(60); // 30, 60, 100 mm physical extrusion
  const [lightingType, setLightingType] = useState('halo'); // 'halo', 'front', 'dual'

  // Uploaded Image State
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const stageContainerRef = useRef(null);

  // 5 Photorealistic Locations & Fabrication Specs (Trilingual: KA / RU / EN)
  const LOCATIONS = {
    letters: {
      id: 'letters',
      name: t.mockupLocLetters || '3D თითბერის ასოები & Halo',
      shortName: t.mockupLocations?.letters?.shortName || '3D Brass Letters',
      scale: '4.5m × 0.8m',
      spec: t.mockupLocations?.letters?.spec || 'Brushed Brass CuZn37 • 3000K Halo • AISI 316',
      standard: t.mockupLocations?.letters?.standard || 'IP67 Waterproof • AISI 316',
      leadTime: t.mockupLocations?.letters?.leadTime || '7 Work Days • 5-Yr Warranty',
      type: '3D Dimensional Facade Lettering',
      image: '/assets/mockups/letters_facade.jpg',
      is3DLetters: true,
      screenBox: {
        top: '36.2%',
        left: '33.8%',
        width: '32.4%',
        height: '9.6%',
        transform: 'none',
        borderRadius: '0px'
      }
    },
    rustaveli: {
      id: 'rustaveli',
      name: t.mockupLocRustaveli || 'სითილაითის ლაითბოქსი',
      shortName: t.mockupLocations?.rustaveli?.shortName || 'Citylight Lightbox',
      scale: '1.8m × 1.2m (2.16 მ²)',
      spec: t.mockupLocations?.rustaveli?.spec || 'Anodized Aluminum • 8mm Glass • 6500K LED',
      standard: t.mockupLocations?.rustaveli?.standard || 'IP65 Weatherproof • City Hall Standard',
      leadTime: t.mockupLocations?.rustaveli?.leadTime || '5 Work Days • Turnkey Setup',
      type: 'Double-Sided Citylight Lightbox',
      image: '/assets/mockups/rustaveli_citylight.jpg',
      screenBox: {
        top: '26.2%',
        left: '64.0%',
        width: '17.2%',
        height: '48.0%',
        transform: 'perspective(1000px) rotateY(13deg) rotateX(1deg)',
        borderRadius: '4px'
      }
    },
    heroes: {
      id: 'heroes',
      name: t.mockupLocHeroes || 'მომრგვალებული LED მეგაკონსტრუქცია',
      shortName: t.mockupLocations?.heroes?.shortName || 'Curved LED Screen',
      scale: '15.0m × 8.0m (120 მ²)',
      spec: t.mockupLocations?.heroes?.spec || 'Galvanized Steel S355 • P3.91 IP68 LED',
      standard: t.mockupLocations?.heroes?.standard || 'Wind 180 km/h • ISO 9001',
      leadTime: t.mockupLocations?.heroes?.leadTime || '14 Work Days • 5-Yr Warranty',
      type: 'Curved Flyover LED Megastructure',
      image: '/assets/mockups/heroes_square.jpg',
      isCurved: true,
      screenBox: {
        top: '11.0%',
        left: '21.0%',
        width: '28.2%',
        height: '32.5%',
        clipPath: 'url(#heroesCurvedClip)',
        WebkitClipPath: 'url(#heroesCurvedClip)'
      }
    },
    vake: {
      id: 'vake',
      name: t.mockupLocVake || 'ფასადის არქიტექტურული ეკრანი',
      shortName: t.mockupLocations?.vake?.shortName || 'Facade LED Display',
      scale: '9.0m × 5.0m (45 მ²)',
      spec: t.mockupLocations?.vake?.spec || 'Basalt Rigging • P2.5 Ultra-Black • AISI 316',
      standard: t.mockupLocations?.vake?.standard || 'IP65 Frontal Seal • 4,500 Nits',
      leadTime: t.mockupLocations?.vake?.leadTime || '10 Work Days • 5-Yr Warranty',
      type: 'Architectural Facade Display & Signage',
      image: '/assets/mockups/vake_facade.jpg',
      screenBox: {
        top: '18%',
        left: '15%',
        width: '32.5%',
        height: '30%',
        transform: 'perspective(500px) rotateY(40deg) rotateX(-0.5deg) skewY(13deg)',
        borderRadius: '2px'
      }
    },
    kakheti: {
      id: 'kakheti',
      name: t.mockupLocKakheti || 'მაგისტრალური მონოპოლური ბილბორდი',
      shortName: t.mockupLocations?.kakheti?.shortName || 'Highway Monopole',
      scale: '14.0m × 5.0m (70 მ²)',
      spec: t.mockupLocations?.kakheti?.spec || 'Ø 1200mm Steel Column • HDG',
      standard: t.mockupLocations?.kakheti?.standard || '180 km/h Wind Load • Static Certified',
      leadTime: t.mockupLocations?.kakheti?.leadTime || '12 Work Days • Full Engineering',
      type: 'Highway Monopole Steel Structure',
      image: '/assets/mockups/highway_unipole.jpg',
      screenBox: {
        top: '8.8%',
        left: '53.8%',
        width: '38.2%',
        height: '24.9%',
        transform: 'perspective(1000px) rotateY(1deg) rotateX(1.5deg) skewY(-0.5deg)',
        borderRadius: '2px'
      }
    }
  };

  // Color Theme Definitions with Physical 3D Extrusion & Bevel Shaders
  const THEMES = {
    gold: {
      id: 'gold',
      name: t.mockupThemes?.gold || 'Brushed Brass 3000K',
      bg: '#0c0a06',
      primary: '#ffdf78',
      sub: '#fcd34d',
      glowColor: '#ffb700',
      border: '#d4af37',
      faceGradient: 'linear-gradient(180deg, #fffbe6 0%, #fde68a 25%, #d4af37 60%, #92700c 90%, #574005 100%)',
      subGradient: 'linear-gradient(180deg, #fef08a 0%, #eab308 100%)',
      textShadow: '0 -1px 0 rgba(255,255,255,0.95), 0 1px 0 #916c0e, 0 2px 0 #7a5a0a, 0 3px 0 #634807, 0 4px 0 #4c3704, 0 5px 0 #362602, 0 6px 10px rgba(0,0,0,0.85), 0 10px 22px rgba(0,0,0,0.95), 0 0 25px rgba(255, 183, 0, 0.7), 0 0 50px rgba(255, 183, 0, 0.35)',
      subShadow: '0 1px 0 #574005, 0 2px 0 #362602, 0 3px 6px rgba(0,0,0,0.85), 0 0 16px rgba(255, 183, 0, 0.6)'
    },
    white: {
      id: 'white',
      name: t.mockupThemes?.white || 'Titanium White 6500K',
      bg: '#080c14',
      primary: '#ffffff',
      sub: '#e2e8f0',
      glowColor: '#ffffff',
      border: '#ffffff',
      faceGradient: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 30%, #cbd5e1 70%, #64748b 100%)',
      subGradient: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
      textShadow: '0 -1px 0 #ffffff, 0 1px 0 #94a3b8, 0 2px 0 #64748b, 0 3px 0 #475569, 0 4px 0 #334155, 0 5px 0 #1e293b, 0 6px 10px rgba(0,0,0,0.85), 0 10px 22px rgba(0,0,0,0.95), 0 0 25px rgba(255, 255, 255, 0.7), 0 0 50px rgba(255, 255, 255, 0.35)',
      subShadow: '0 1px 0 #334155, 0 2px 0 #1e293b, 0 3px 6px rgba(0,0,0,0.85), 0 0 16px rgba(255, 255, 255, 0.6)'
    },
    cyan: {
      id: 'cyan',
      name: t.mockupThemes?.cyber || 'Cyber Cyan',
      bg: '#04111f',
      primary: '#00f0ff',
      sub: '#67e8f9',
      glowColor: '#00f0ff',
      border: '#00d2e0',
      faceGradient: 'linear-gradient(180deg, #ecfeff 0%, #a5f3fc 30%, #06b6d4 70%, #0e7490 100%)',
      subGradient: 'linear-gradient(180deg, #67e8f9 0%, #0891b2 100%)',
      textShadow: '0 -1px 0 #ffffff, 0 1px 0 #0891b2, 0 2px 0 #0e7490, 0 3px 0 #155e75, 0 4px 0 #164e63, 0 5px 0 #083344, 0 6px 10px rgba(0,0,0,0.85), 0 10px 22px rgba(0,0,0,0.95), 0 0 28px rgba(0, 240, 255, 0.8), 0 0 55px rgba(0, 240, 255, 0.4)',
      subShadow: '0 1px 0 #155e75, 0 2px 0 #083344, 0 3px 6px rgba(0,0,0,0.85), 0 0 18px rgba(0, 240, 255, 0.7)'
    },
    emerald: {
      id: 'emerald',
      name: t.mockupThemes?.emerald || 'Emerald Mint',
      bg: '#03140c',
      primary: '#00ff9d',
      sub: '#6ee7b7',
      glowColor: '#00ff9d',
      border: '#00e68d',
      faceGradient: 'linear-gradient(180deg, #ecfdf5 0%, #a7f3d0 30%, #10b981 70%, #047857 100%)',
      subGradient: 'linear-gradient(180deg, #6ee7b7 0%, #059669 100%)',
      textShadow: '0 -1px 0 #ffffff, 0 1px 0 #059669, 0 2px 0 #047857, 0 3px 0 #065f46, 0 4px 0 #064e3b, 0 5px 0 #022c22, 0 6px 10px rgba(0,0,0,0.85), 0 10px 22px rgba(0,0,0,0.95), 0 0 28px rgba(0, 255, 157, 0.8), 0 0 55px rgba(0, 255, 157, 0.4)',
      subShadow: '0 1px 0 #065f46, 0 2px 0 #022c22, 0 3px 6px rgba(0,0,0,0.85), 0 0 18px rgba(0, 255, 157, 0.7)'
    }
  };

  // Curated Sample Presets
  const PRESETS = [
    {
      id: 'vector',
      name: 'Vector Hub',
      headline: 'VECTOR HUB',
      subtext: 'ARCHITECTURAL SIGNAGE STUDIO',
      theme: 'gold',
      loc: 'letters'
    },
    {
      id: 'watch',
      name: 'AURA Watch',
      headline: 'AURA TIMEPIECES',
      subtext: 'SWISS TOURBILLON PRECISION',
      theme: 'gold',
      loc: 'rustaveli'
    },
    {
      id: 'fintech',
      name: 'Nexus Bank',
      headline: 'NEXUS CAPITAL',
      subtext: 'WEALTH & CARDS INFRASTRUCTURE',
      theme: 'cyan',
      loc: 'heroes'
    }
  ];

  // Dynamic 3D Physical Extrusion & Bevel Engine
  const get3DLetterStyles = (theme, depth, lighting, isNight) => {
    const steps = depth === 100 ? 12 : depth === 30 ? 4 : 8;
    const shadowLayers = [];

    // Top crisp specular edge
    shadowLayers.push(`0 -1.5px 0 ${theme.id === 'white' ? '#ffffff' : 'rgba(255, 255, 255, 0.95)'}`);

    // Directional metallic return side-walls
    for (let i = 1; i <= steps; i++) {
      let sideColor;
      if (theme.id === 'gold') {
        sideColor = `rgb(${Math.max(40, 145 - i * 9)}, ${Math.max(25, 110 - i * 7)}, ${Math.max(5, 20 - i * 2)})`;
      } else if (theme.id === 'white') {
        sideColor = `rgb(${Math.max(25, 150 - i * 10)}, ${Math.max(35, 165 - i * 11)}, ${Math.max(45, 185 - i * 12)})`;
      } else if (theme.id === 'cyan') {
        sideColor = `rgb(0, ${Math.max(40, 180 - i * 12)}, ${Math.max(60, 210 - i * 13)})`;
      } else {
        sideColor = `rgb(0, ${Math.max(40, 170 - i * 12)}, ${Math.max(25, 100 - i * 7)})`;
      }
      shadowLayers.push(`0 ${i}px 0 ${sideColor}`);
    }

    // Physical ambient occlusion & drop shadow on stone wall
    shadowLayers.push(`0 ${steps + 2}px ${steps + 5}px rgba(0, 0, 0, 0.85)`);
    shadowLayers.push(`0 ${steps + 6}px ${steps * 2 + 12}px rgba(0, 0, 0, 0.95)`);

    // Halo dispersion glow
    if (lighting === 'halo' || lighting === 'dual') {
      const mult = isNight ? 1.0 : 0.5;
      shadowLayers.push(`0 0 ${20 * mult}px ${theme.glowColor}`);
      shadowLayers.push(`0 0 ${50 * mult}px ${theme.glowColor}`);
      if (isNight) {
        shadowLayers.push(`0 0 90px ${theme.glowColor}`);
      }
    }

    return {
      textShadow: shadowLayers.join(', '),
      color: theme.primary,
      backgroundImage: lighting === 'front' && isNight
        ? `linear-gradient(180deg, #ffffff 0%, ${theme.primary} 100%)`
        : theme.faceGradient
    };
  };

  const currentLoc = LOCATIONS[selectedLoc] || LOCATIONS.letters;
  const currentTheme = THEMES[activeTheme] || THEMES.gold;

  // Handle Preset Select
  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setHeadline(preset.headline);
    setSubtext(preset.subtext);
    setActiveTheme(preset.theme);
    if (preset.loc && LOCATIONS[preset.loc]) {
      setSelectedLoc(preset.loc);
    }
    setInputMode('designer');
  };

  // Handle Image Upload
  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setInputMode('upload');
      setActivePreset(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  // Export High-Res PNG Mockup with Full Composite Rendering (Base + 3D Letters / Graphic + Atmosphere)
  const handleDownloadMockup = async () => {
    if (!stageContainerRef.current) return;
    setIsExporting(true);

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(stageContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // 2x Retina Clarity for High-Res Presentation
        backgroundColor: '#06080d',
        logging: false,
        onclone: (clonedDoc) => {
          // 1. Flatten 3D perspective wrapper in clone so perspective rotate doesn't distort html2canvas
          const lettersWrapper = clonedDoc.querySelector('.letters-3d-wrapper');
          if (lettersWrapper) {
            lettersWrapper.style.transform = 'none';
          }

          // 2. html2canvas does not support -webkit-background-clip: text with transparent color.
          // In the cloned DOM, explicitly fill the letter face with solid metallic theme color
          // and apply crisp, calibrated 3D extrusion shadows.
          const titleEl = clonedDoc.querySelector('.facade-brand-title');
          if (titleEl) {
            titleEl.style.color = currentTheme.primary;
            titleEl.style.webkitTextFillColor = currentTheme.primary;
            titleEl.style.backgroundImage = 'none';
            titleEl.style.webkitBackgroundClip = 'initial';
            titleEl.style.backgroundClip = 'initial';

            const exportSteps = letterDepth === 100 ? 6 : letterDepth === 30 ? 2 : 4;
            const exportShadows = ['0 -1px 0 rgba(255, 255, 255, 0.95)'];
            for (let i = 1; i <= exportSteps; i++) {
              let sideColor;
              if (currentTheme.id === 'gold') {
                sideColor = `rgb(${Math.max(40, 145 - i * 10)}, ${Math.max(25, 110 - i * 8)}, ${Math.max(5, 20 - i * 2)})`;
              } else if (currentTheme.id === 'white') {
                sideColor = `rgb(${Math.max(25, 150 - i * 11)}, ${Math.max(35, 165 - i * 12)}, ${Math.max(45, 185 - i * 13)})`;
              } else if (currentTheme.id === 'cyan') {
                sideColor = `rgb(0, ${Math.max(40, 180 - i * 13)}, ${Math.max(60, 210 - i * 14)})`;
              } else {
                sideColor = `rgb(0, ${Math.max(40, 170 - i * 13)}, ${Math.max(25, 100 - i * 8)})`;
              }
              exportShadows.push(`0 ${i}px 0 ${sideColor}`);
            }
            exportShadows.push(`0 ${exportSteps + 2}px 6px rgba(0, 0, 0, 0.85)`);
            if (lightingType === 'halo' || lightingType === 'dual') {
              exportShadows.push(`0 0 16px ${currentTheme.glowColor}`);
            }
            titleEl.style.textShadow = exportShadows.join(', ');
          }

          // 3. Subtext formatting in clone
          const subEl = clonedDoc.querySelector('.facade-brand-sub');
          if (subEl) {
            subEl.style.color = currentTheme.sub;
            subEl.style.webkitTextFillColor = currentTheme.sub;
            subEl.style.backgroundImage = 'none';
            subEl.style.webkitBackgroundClip = 'initial';
            subEl.style.backgroundClip = 'initial';
            subEl.style.textShadow = currentTheme.subShadow || 'none';
          }
        }
      });

      const link = document.createElement('a');
      link.download = getVisualizerDownloadName(selectedLoc);
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onShowToast) {
        onShowToast(t.toastVisualizerExported);
      }
    } catch (err) {
      console.error('Visualizer export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Transfer Custom Build Spec to Inquiry Form
  const handleBookBillboard = () => {
    const spec = {
      productType: 'turnkey_structure',
      inputMode: 'visualizer_spec',
      brandText: inputMode === 'upload' ? 'Custom Uploaded Design' : `${headline} (${currentLoc.name})`,
      dimensions: currentLoc.scale,
      material: currentLoc.is3DLetters ? `${currentLoc.spec} • ${letterDepth}mm Return • ${lightingType}` : currentLoc.spec,
      lighting: currentLoc.is3DLetters ? lightingType : 'front6500',
      estimate: t('structureEstimate', { name: currentLoc.name, standard: currentLoc.standard }),
      turnaround: currentLoc.leadTime
    };
    if (onBookBillboard) {
      onBookBillboard(spec);
    }
  };

  return (
    <section className="section-block mockup-section" id="mockup-studio">
      <div className="container">
        {/* Section Editorial Header */}
        <div className="section-header-editorial">
          <div className="editorial-tag">{t.mockupTag}</div>
          <div>
            <h2 className="editorial-headline">
              {t.mockupTitle}
            </h2>
            <p className="editorial-sub">
              {t.mockupSub}
            </p>
          </div>
        </div>

        {/* Clean Segmented Location Bar with Full Text Visibility */}
        <div className="visualizer-tabs-bar">
          {Object.values(LOCATIONS).map((loc) => (
            <button
              key={loc.id}
              className={`visualizer-tab-btn ${selectedLoc === loc.id ? 'active' : ''}`}
              onClick={() => setSelectedLoc(loc.id)}
              type="button"
              data-cursor-text={loc.id.toUpperCase()}
            >
              <span className="tab-status-dot"></span>
              <span className="tab-loc-title">{loc.shortName || loc.name}</span>
              <span className="tab-loc-dimension">({loc.scale.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        {/* Studio Workspace Layout */}
        <div className="mockup-studio-layout">
          {/* Left: Photorealistic Architectural Stage */}
          <div className={`mockup-stage-box ${nightMode ? 'night-env' : 'day-env'}`}>
            {/* Top Toolbar */}
            <div className="mockup-stage-header">
              <div className="stage-header-info">
                <span className="live-badge">● LIVE CAD VIEW</span>
                <span className="tag-swiss">{currentLoc.name}</span>
              </div>
              <div className="stage-header-actions">
                <button
                  className={`cad-toolbar-btn ${nightMode ? 'active' : ''}`}
                  onClick={() => setNightMode(!nightMode)}
                  title={nightMode ? t.mockupDay : t.mockupNight}
                  data-cursor-text={nightMode ? 'DAYLIGHT' : 'NIGHT LUX'}
                  type="button"
                >
                  {nightMode ? <Sun size={13} /> : <Moon size={13} />}
                  <span>{nightMode ? t.mockupDay : t.mockupNight}</span>
                </button>
                <button
                  className="cad-toolbar-btn export-btn"
                  onClick={handleDownloadMockup}
                  disabled={isExporting}
                  title={t.mockupDownloadBtn}
                  data-cursor-text="HD MOCKUP"
                  type="button"
                >
                  {isExporting ? <Loader2 size={13} className="spin-icon" /> : <Download size={13} />}
                  <span>{isExporting ? 'EXPORTING...' : 'HD PNG'}</span>
                </button>
              </div>
            </div>

            {/* PHOTOREALISTIC PHOTO VIEWPORT WITH LIVE PROJECTION */}
            <div className="mockup-photo-stage" ref={stageContainerRef}>
              {/* Hidden SVG Definitions for Curved Clip-Paths */}
              <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
                <defs>
                  <clipPath id="heroesCurvedClip" clipPathUnits="objectBoundingBox">
                    <path d="M 0,0 Q 0.50,0.16 1,0.28 L 1,0.99 Q 0.50,0.98 0,0.89 Z" />
                  </clipPath>
                </defs>
              </svg>

              {/* Background High-Resolution Tbilisi Architectural Scene Photo */}
              <img
                src={currentLoc.image}
                alt={currentLoc.name}
                className={`mockup-city-photo ${nightMode ? 'photo-night-grade' : 'photo-day-grade'}`}
              />

              {/* Day/Night Volumetric Atmosphere Overlay */}
              {nightMode && <div className="photo-night-ambience-overlay"></div>}

              {/* PERSPECTIVE PROJECTED DISPLAY / 3D LETTERS SIGNAGE */}
              <div
                className={`billboard-perspective-screen ${currentLoc.isCurved ? 'screen-curved-megaboard' : ''} ${currentLoc.is3DLetters ? 'screen-3d-letters-mode' : ''} ${nightMode ? 'screen-night-glow' : 'screen-day-glare'}`}
                style={{
                  top: currentLoc.screenBox.top,
                  left: currentLoc.screenBox.left,
                  width: currentLoc.screenBox.width,
                  height: currentLoc.screenBox.height,
                  transform: currentLoc.screenBox.transform,
                  borderRadius: currentLoc.screenBox.borderRadius,
                  clipPath: currentLoc.screenBox.clipPath,
                  WebkitClipPath: currentLoc.screenBox.WebkitClipPath
                }}
              >
                {/* 1. Creative: 3D Facade Letters with Physical Return Walls & Halo Wall Wash */}
                {currentLoc.is3DLetters ? (
                  <div className="facade-letters-container">
                    {/* Layer 1: Ambient Halo Light Wash on Granite Wall */}
                    {(lightingType === 'halo' || lightingType === 'dual') && (
                      <div
                        className="letters-wall-wash"
                        style={{
                          background: `radial-gradient(ellipse at 50% 50%, ${currentTheme.glowColor} 0%, transparent 70%)`,
                          opacity: nightMode ? 0.85 : 0.4
                        }}
                      />
                    )}

                    {/* Layer 2: True 3D Physical Extruded Letters */}
                    <div
                      className="letters-3d-wrapper"
                      style={{
                        transform: `perspective(800px) rotateX(3deg) translateZ(${letterDepth / 5}px)`
                      }}
                    >
                      <div
                        className="facade-brand-title"
                        style={get3DLetterStyles(currentTheme, letterDepth, lightingType, nightMode)}
                      >
                        {headline || 'VECTOR HUB'}
                      </div>
                      <div
                        className="facade-brand-sub"
                        style={{
                          color: currentTheme.sub,
                          backgroundImage: currentTheme.subGradient,
                          textShadow: currentTheme.subShadow
                        }}
                      >
                        {subtext || 'ARCHITECTURAL SIGNAGE STUDIO'}
                      </div>
                    </div>
                  </div>
                ) : inputMode === 'upload' && uploadedImage ? (
                  <div
                    className="screen-content-wrapper"
                    style={{
                      backgroundImage: `url(${uploadedImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                ) : currentLoc.isCurved ? (
                  /* TRUE 3D CURVED VECTOR TEXT & BORDER ENGINE */
                  <svg
                    viewBox="0 0 500 280"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  >
                    <defs>
                      <path id="heroesHeadlineArc" d="M 30,140 Q 250,205 470,175" fill="none" />
                      <path id="heroesSubtextArc" d="M 30,190 Q 250,245 470,220" fill="none" />
                    </defs>

                    <path
                      d="M 15,0 Q 245,80 485,80 L 485,280 Q 250,300 15,245 Z"
                      fill={currentTheme.bg}
                    />

                    <path
                      d="M 30,28 Q 250,94 470,100 L 470,260 Q 250,280 30,230 Z"
                      fill="none"
                      stroke={currentTheme.border}
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      opacity="0.8"
                    />

                    <g transform="translate(250, 95)">
                      <circle cx="0" cy="30" r="16" fill="none" stroke={currentTheme.primary} strokeWidth="2" />
                      <text x="0" y="35" fill={currentTheme.primary} fontSize="13" fontFamily="Syne, sans-serif" fontWeight="900" textAnchor="middle">V</text>
                    </g>

                    <text>
                      <textPath
                        href="#heroesHeadlineArc"
                        startOffset="50%"
                        textAnchor="middle"
                        fill={currentTheme.primary}
                        fontSize={headline.length > 14 ? '20' : '26'}
                        fontFamily="TG Square, Noto Sans Georgian, Syne, sans-serif"
                        fontWeight="900"
                        letterSpacing="0.04em"
                      >
                        {headline || 'VECTOR HUB'}
                      </textPath>
                    </text>

                    <text>
                      <textPath
                        href="#heroesSubtextArc"
                        startOffset="50%"
                        textAnchor="middle"
                        fill={currentTheme.sub}
                        fontSize="11"
                        fontFamily="Space Mono, monospace"
                        fontWeight="700"
                        letterSpacing="0.08em"
                      >
                        {subtext || 'PRECISION ARCHITECTURAL ADVERTISING'}
                      </textPath>
                    </text>
                  </svg>
                ) : (
                  <div
                    className="screen-content-wrapper"
                    style={{
                      background: currentTheme.bg,
                      color: currentTheme.primary,
                      border: `1px solid ${currentTheme.border}`
                    }}
                  >
                    <div
                      className="screen-inner-border"
                      style={{ borderColor: currentTheme.border }}
                    />
                    <div
                      className="screen-brand-crest"
                      style={{ borderColor: currentTheme.primary, color: currentTheme.primary }}
                    >
                      V
                    </div>
                    <div
                      className="screen-headline-text"
                      style={{ color: currentTheme.primary }}
                    >
                      {headline || 'VECTOR HUB'}
                    </div>
                    <div
                      className="screen-subtext-text"
                      style={{ color: currentTheme.sub }}
                    >
                      {subtext || 'OUTDOOR PRECISION'}
                    </div>
                  </div>
                )}

                {/* Cylindrical Curvature 3D Depth Shader */}
                {currentLoc.isCurved && <div className="screen-cylindrical-depth-shader" />}

                {/* LED Subpixel Matrix Overlay */}
                {!currentLoc.is3DLetters && <div className="screen-led-matrix-overlay" />}

                {/* Photometric Glass Specular Reflection */}
                {!currentLoc.is3DLetters && (
                  <div className={`screen-glass-reflection ${nightMode ? 'reflection-night' : 'reflection-day'}`} />
                )}
              </div>
            </div>

            {/* Streamlined Stage Footer Metrics */}
            <div className="mockup-stage-footer">
              <div className="stage-foot-item"><ShieldCheck size={12} className="foot-icon" /><span><strong>{t.footStandard}:</strong> {currentLoc.standard}</span></div>
              <div className="stage-foot-item"><Layers size={12} className="foot-icon" /><span><strong>{t.footScale}:</strong> {currentLoc.scale}</span></div>
              <div className="stage-foot-item"><Wrench size={12} className="foot-icon" /><span><strong>{t.footMaterial}:</strong> {currentLoc.spec}</span></div>
            </div>
          </div>

          {/* Right: Clean Visualizer Controls & Booking */}
          <div className="mockup-controls-panel">
            {/* Input Mode Selector */}
            <div className="control-block">
              <div className="control-title">
                <span>{t.designModeStep}</span>
                <span className="badge-tag-mini">{inputMode === 'upload' ? 'LOGO UPLOAD' : 'LIVE DESIGNER'}</span>
              </div>
              <div className="segmented-control mode-selector-bar">
                <button
                  className={`segment-btn ${inputMode === 'designer' ? 'active' : ''}`}
                  onClick={() => setInputMode('designer')}
                  data-cursor-text="DESIGNER"
                  type="button"
                >
                  <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {t.mockupModeDesigner}
                </button>
                <button
                  className={`segment-btn ${inputMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setInputMode('upload')}
                  data-cursor-text="UPLOAD"
                  type="button"
                >
                  <Upload size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {t.mockupModeUpload}
                </button>
              </div>
            </div>

            {/* If Upload Mode: Dropzone */}
            {inputMode === 'upload' ? (
              <div className="control-block">
                <div
                  className={`svg-dropzone ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,.svg"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                  />
                  <ImageIcon size={20} className="dropzone-icon" />
                  <div className="dropzone-text">
                    <strong>{uploadedImage ? t.fileLoadedChange : t.mockupUploadPrompt}</strong>
                    <span>{t.autoProjectionSub}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* If Designer Mode: Live Text & Themes */
              <>
                {/* Brand Headline */}
                <div className="control-block">
                  <div className="control-title">{t.mockupBrandInput}</div>
                  <input
                    type="text"
                    className="swiss-input"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="BRAND OR SIGNAGE TEXT..."
                    maxLength={30}
                  />
                </div>

                {/* Subtext */}
                <div className="control-block">
                  <div className="control-title">{t.mockupTaglineInput}</div>
                  <input
                    type="text"
                    className="swiss-input"
                    value={subtext}
                    onChange={(e) => setSubtext(e.target.value)}
                    placeholder="SUBTITLE OR TAGLINE..."
                    maxLength={40}
                  />
                </div>

                {/* Curated Material / Color Styles */}
                <div className="control-block">
                  <div className="control-title">{t.mockupTheme}</div>
                  <div className="color-themes-grid">
                    {Object.values(THEMES).map((th) => (
                      <button
                        key={th.id}
                        className={`theme-chip-btn ${activeTheme === th.id ? 'active' : ''}`}
                        onClick={() => setActiveTheme(th.id)}
                        type="button"
                      >
                        <span className="theme-color-swatch" style={{ background: th.primary, borderColor: th.border }}></span>
                        <span>{th.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Dimensional Channel Letters Customization */}
                {selectedLoc === 'letters' && (
                  <>
                    {/* Depth Extrusion Selector */}
                    <div className="control-block">
                      <div className="control-title">
                        <span>{t.depthTitle}</span>
                        <span className="badge-tag-mini">{letterDepth} MM</span>
                      </div>
                      <div className="segmented-control">
                        {[
                          { val: 30, label: t.depth30 },
                          { val: 60, label: t.depth60 },
                          { val: 100, label: t.depth100 }
                        ].map((d) => (
                          <button
                            key={d.val}
                            className={`segment-btn ${letterDepth === d.val ? 'active' : ''}`}
                            onClick={() => setLetterDepth(d.val)}
                            type="button"
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lighting System Selector */}
                    <div className="control-block">
                      <div className="control-title">
                        <span>{t.lightingTitle}</span>
                      </div>
                      <div className="segmented-control">
                        {[
                          { val: 'halo', label: t.lightingHalo },
                          { val: 'front', label: t.lightingFront },
                          { val: 'dual', label: t.lightingDual }
                        ].map((l) => (
                          <button
                            key={l.val}
                            className={`segment-btn ${lightingType === l.val ? 'active' : ''}`}
                            onClick={() => setLightingType(l.val)}
                            type="button"
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Sample Presets */}
                <div className="control-block">
                  <div className="presets-row">
                    <span className="presets-label">{t.mockupPresetLabel}</span>
                    <div className="presets-buttons">
                      {PRESETS.map((p) => (
                        <button
                          key={p.id}
                          className={`preset-btn ${activePreset === p.id ? 'active' : ''}`}
                          onClick={() => handleSelectPreset(p)}
                          type="button"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Direct Fabrication Spec Inquiry Handoff */}
            <div className="visualizer-cta-container">
              <div className="visualizer-cta-meta">
                <div className="cta-structure-badge">
                  <span className="cta-dot"></span>
                  <span>{currentLoc.name}</span>
                </div>
                <div className="cta-spec-line">
                  🛠️ {currentLoc.spec} • {currentLoc.leadTime}
                </div>
              </div>

              <button
                className="btn-swiss btn-swiss-solid visualizer-submit-btn"
                onClick={handleBookBillboard}
                data-cursor-text="INQUIRE BUILD"
                type="button"
              >
                <span>{t.mockupBookBtn || 'კონსტრუქციის დამზადება & მონტაჟი →'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getVisualizerDownloadName(selectedLoc) {
  return `vector_hub_${selectedLoc}_visualizer_${Date.now()}.png`;
}
