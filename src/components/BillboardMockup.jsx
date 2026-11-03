import React, { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { Download, Sun, Moon, Upload, ArrowRight, Sparkles, Image as ImageIcon, ShieldCheck, Wrench, Layers, Loader2, RotateCw, Quote, ZoomIn, ZoomOut, ChevronDown, X, Minus, Plus } from 'lucide-react';
import { getTranslation } from '../i18n/translations';
import { CARD_STUDIO_ENABLED } from '../config/features';
import RalColorPicker from './RalColorPicker';
import { ralColor, metalFinish, finishLabel } from '../data/finishes';
import { SIGN_LAYOUTS, DEFAULT_SIGN_TEXTS, SIGN_FONTS, SIZE_STEPS, slotLang } from '../data/signLayouts';

// Loaded on demand so the card studio costs nothing while it is switched off
const CardStage3D = lazy(() => import('./CardStage3D'));
// three.js only loads once the 3D letters scene is on screen
const SignStage3D = lazy(() => import('./SignStage3D'));
const CARD_FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@400;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap';

export default function BillboardMockup({ lang, onBookBillboard, onShowToast }) {
  const t = getTranslation(lang);

  // Selected Location: 'letters', 'rustaveli', 'vake', 'kakheti', 'card'
  const [selectedLoc, setSelectedLoc] = useState(CARD_STUDIO_ENABLED ? 'card' : 'letters');
  const [nightMode, setNightMode] = useState(false);
  const [inputMode, setInputMode] = useState('designer'); // 'designer' or 'upload'
  const [isExporting, setIsExporting] = useState(false);

  // Custom Designer State
  const [headline, setHeadline] = useState('ვექტორ ჰაბი');
  const [subtext, setSubtext] = useState('ARCHITECTURAL SIGNAGE STUDIO');
  const [activeTheme, setActiveTheme] = useState('gold'); // 'gold', 'white', 'cyan', 'emerald'
  const [activePreset, setActivePreset] = useState('vector');
  const [letterDepth, setLetterDepth] = useState(60); // 30, 60, 100 mm physical extrusion
  const [lightingType, setLightingType] = useState('front'); // 'front', 'back' (halo), 'off'

  // 3D sign studio (letters scene)
  const [signType, setSignType] = useState('letters'); // 'letters' | 'box'
  const [signLayout, setSignLayout] = useState('ka_logo_en'); // see SIGN_LAYOUTS
  const [signTexts, setSignTexts] = useState(DEFAULT_SIGN_TEXTS);
  const [signScale, setSignScale] = useState(1); // letter size relative to "fits the panel"
  const [georgianFont, setGeorgianFont] = useState('sans'); // Mtavruli: 'sans' | 'square' | 'serif'
  const [faceFinish, setFaceFinish] = useState(() => metalFinish('brass'));
  const [sideFinish, setSideFinish] = useState(() => metalFinish('brass'));
  const [boxFinish, setBoxFinish] = useState(() => ralColor('7016'));
  const [colorTarget, setColorTarget] = useState('face'); // 'face' | 'side' | 'box'
  const [ledTemp, setLedTemp] = useState(3000); // 3000 | 6500
  const [colorOpen, setColorOpen] = useState(false);
  const [paintGloss, setPaintGloss] = useState('matte'); // RAL paint: 'matte' | 'gloss'
  const [signStep, setSignStep] = useState(0);
  const [signMetrics, setSignMetrics] = useState(null); // visualised size in metres
  const signStageRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null); // { kind: 'svg' | 'image', svgText?, imageSrc?, name }
  const [signZoom, setSignZoom] = useState(false); // overview ↔ close-up on the sign
  const logoInputRef = useRef(null);

  // Card Studio State (American Psycho Suite)
  const cardFormat = 'business_card';
  const [cardArchetype, setCardArchetype] = useState('bateman');
  const [cardStock, setCardStock] = useState('bone');
  const [cardFinish, setCardFinish] = useState('deboss');
  const [cardGsm, setCardGsm] = useState(450);
  const [cardWatermark, setCardWatermark] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Card Content Fields (Screen-Accurate American Psycho Props)
  const [cardPhone, setCardPhone] = useState('212 555 6342');
  const [cardHolder, setCardHolder] = useState('PATRICK BATEMAN');
  const [customName, setCustomName] = useState('');
  const [cardRole, setCardRole] = useState('VICE PRESIDENT');
  const [cardDivision, setCardDivision] = useState('MERGERS AND AQUISITIONS');
  const [cardCompany, setCardCompany] = useState('PIERCE & PIERCE');
  const [cardAddress, setCardAddress] = useState('358 Exchange Place New York, N.Y. 10099 FAX 212 555 6390 TELEX 10 4534');
  const [cardAddressLine2, setCardAddressLine2] = useState('');
  const [cardIsTwoLineAddress, setCardIsTwoLineAddress] = useState(false);
  const [cardContact, setCardContact] = useState('FAX 212 555 6390 TELEX 10 4534');
  const [cardQuote, setCardQuote] = useState("That's bone. And the lettering is something called Silian Rail.");

  const AMERICAN_PSYCHO_ARCHETYPES = [
    {
      id: 'bateman',
      name: 'Patrick Bateman',
      tag: 'Bone • Silian Rail',
      holder: 'PATRICK BATEMAN',
      role: 'VICE PRESIDENT',
      division: 'MERGERS AND AQUISITIONS',
      company: 'PIERCE & PIERCE',
      phone: '212 555 6342',
      address: '358 Exchange Place New York, N.Y. 10099 FAX 212 555 6390 TELEX 10 4534',
      addressLine2: '',
      isTwoLine: false,
      stock: 'bone',
      finish: 'deboss',
      gsm: 450,
      watermark: false,
      quote: "That's bone. And the lettering is something called Silian Rail."
    },
    {
      id: 'van_patten',
      name: 'David Van Patten',
      tag: 'Eggshell • Romalian',
      holder: 'DAVID VAN PATTEN',
      role: 'Vice President',
      division: 'Mergers and Aquisitions',
      company: 'PIERCE & PIERCE',
      phone: '212 555 6342',
      address: '358 EXCHANGE PLACE NEW YORK, N.Y. 10099 FAX 212 555 6390 TELEX 10 4534',
      addressLine2: '',
      isTwoLine: false,
      stock: 'eggshell',
      finish: 'deboss',
      gsm: 450,
      watermark: false,
      quote: "That's really nice. Eggshell with Romalian type."
    },
    {
      id: 'allen',
      name: 'Paul Allen',
      tag: 'Off-White • Watermark',
      holder: 'PAUL ALLEN',
      role: 'VICE PRESIDENT',
      division: 'MERGERS AND AQUISITIONS',
      company: 'PIERCE & PIERCE',
      phone: '212.555.6342',
      address: '358 EXCHANGE PLACE NEW YORK, N.Y. 10099',
      addressLine2: 'FAX 212 555 6390 TELEX 10 4534',
      isTwoLine: true,
      stock: 'offwhite',
      finish: 'copperplate',
      gsm: 450,
      watermark: true,
      quote: "Look at that subtle off-white coloring. The tasteful thickness of it. Oh my God, it even has a watermark..."
    },
    {
      id: 'bryce',
      name: 'Timothy Bryce',
      tag: 'Nimbus • Raised Lettering',
      holder: 'TIMOTHY BRYCE',
      role: 'Vice President',
      division: 'Mergers and Aquisitions',
      company: 'PIERCE & PIERCE',
      phone: '212 555 6342',
      address: '358 EXCHANGE PLACE NEW YORK, N.Y. 10099 FAX 212 555 6390 TELEX 10 4534',
      addressLine2: '',
      isTwoLine: false,
      stock: 'nimbus',
      finish: 'raised_gold',
      gsm: 450,
      watermark: false,
      quote: "Raised lettering, pale nimbus white."
    }
  ];

  const handleSelectCardArchetype = (arc) => {
    setCardArchetype(arc.id);
    setCardHolder(customName.trim() ? customName.toUpperCase() : arc.holder);
    setCardRole(arc.role);
    setCardDivision(arc.division);
    setCardCompany(arc.company);
    setCardPhone(arc.phone || '212 555 6342');
    setCardAddress(arc.address);
    setCardAddressLine2(arc.addressLine2 || '');
    setCardIsTwoLineAddress(!!arc.isTwoLine);
    setCardContact(arc.contact || '');
    setCardStock(arc.stock);
    setCardFinish(arc.finish);
    setCardGsm(arc.gsm);
    setCardWatermark(arc.watermark);
    setCardQuote(arc.quote);
    setCardFlipped(false);
  };

  const handleCustomNameChange = (val) => {
    setCustomName(val);
    const currentArc = AMERICAN_PSYCHO_ARCHETYPES.find(a => a.id === cardArchetype) || AMERICAN_PSYCHO_ARCHETYPES[0];
    setCardHolder(val.trim() ? val.toUpperCase() : currentArc.holder);
  };

  const handleResetName = () => {
    setCustomName('');
    const currentArc = AMERICAN_PSYCHO_ARCHETYPES.find(a => a.id === cardArchetype) || AMERICAN_PSYCHO_ARCHETYPES[0];
    setCardHolder(currentArc.holder);
  };

  const handleCycleCard = () => {
    const currentIndex = AMERICAN_PSYCHO_ARCHETYPES.findIndex(a => a.id === cardArchetype);
    const nextIndex = (currentIndex + 1) % AMERICAN_PSYCHO_ARCHETYPES.length;
    handleSelectCardArchetype(AMERICAN_PSYCHO_ARCHETYPES[nextIndex]);
  };

  // Uploaded Image State
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const stageContainerRef = useRef(null);

  // Photorealistic Locations & Fabrication Specs (Trilingual: KA / RU / EN)
  const LOCATIONS = {
    letters: {
      id: 'letters',
      name: t.mockupLocLetters || '3D თითბერის ასოები & Halo',
      shortName: t.mockupLocations?.letters?.shortName || '3D Brass Letters',
      scale: '4.5m × 0.8m',
      spec: t.mockupLocations?.letters?.spec || 'Brushed Brass CuZn37 • 3000K Halo • AISI 316',
      standard: t.mockupLocations?.letters?.standard || 'IP67 Waterproof • AISI 316',
      leadTime: t.mockupLocations?.letters?.leadTime || '7 Work Days • Up to 5-Yr Warranty',
      type: '3D Dimensional Facade Lettering',
      image: '/assets/mockups/letters_facade.webp',
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
      image: '/assets/mockups/rustaveli_citylight.webp',
      screenBox: {
        top: '26.2%',
        left: '64.0%',
        width: '17.2%',
        height: '48.0%',
        transform: 'perspective(1000px) rotateY(13deg) rotateX(1deg)',
        borderRadius: '4px'
      }
    },
    vake: {
      id: 'vake',
      name: t.mockupLocVake || 'ფასადის არქიტექტურული ეკრანი',
      shortName: t.mockupLocations?.vake?.shortName || 'Facade LED Display',
      scale: '9.0m × 5.0m (45 მ²)',
      spec: t.mockupLocations?.vake?.spec || 'Basalt Rigging • P2.5 Ultra-Black • AISI 316',
      standard: t.mockupLocations?.vake?.standard || 'IP65 Frontal Seal • 4,500 Nits',
      leadTime: t.mockupLocations?.vake?.leadTime || '10 Work Days • Up to 5-Yr Warranty',
      type: 'Architectural Facade Display & Signage',
      image: '/assets/mockups/vake_facade.webp',
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
      standard: t.mockupLocations?.kakheti?.standard || 'Site Static Calculation • HDG Anti-Corrosion',
      leadTime: t.mockupLocations?.kakheti?.leadTime || '12 Work Days • Full Engineering',
      type: 'Highway Monopole Steel Structure',
      image: '/assets/mockups/highway_unipole.webp',
      screenBox: {
        top: '8.8%',
        left: '53.8%',
        width: '38.2%',
        height: '24.9%',
        transform: 'perspective(1000px) rotateY(1deg) rotateX(1.5deg) skewY(-0.5deg)',
        borderRadius: '2px'
      }
    },
    card: {
      id: 'card',
      name: t.mockupLocCard || 'Executive Business Card (3D)',
      shortName: t.mockupLocations?.card?.shortName || 'Executive Card (3D)',
      scale: '90×50mm',
      spec: t.mockupLocations?.card?.spec || '450 GSM Cotton Stock • Silian Rail Deboss',
      standard: t.mockupLocations?.card?.standard || 'Heidelberg Offset • Multi-Layer Duplex',
      leadTime: t.mockupLocations?.card?.leadTime || '2-3 Work Days • Luxury Packaging',
      type: 'Executive Business Card Studio (American Psycho)',
      isCardStudio: true
    }
  };
  if (!CARD_STUDIO_ENABLED) delete LOCATIONS.card;

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
      headline: 'ვექტორ ჰაბი',
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
      loc: 'vake'
    }
  ];

  const ts = t.sign3d || {};

  // Lines on the sign: Georgian, Georgian + English underneath, or English only
  // Memoised so the 3D stage only rebuilds geometry when the design really changes
  const layout = SIGN_LAYOUTS.find((l) => l.id === signLayout) || SIGN_LAYOUTS[0];
  const layoutHasLogo = layout.slots.includes('logo');
  const layoutHasKa = layout.slots.some((sl) => slotLang(sl) === 'ka');
  const signItems = useMemo(() => layout.slots.map((sl) => (sl === 'logo'
    ? { kind: 'logo' }
    : { kind: 'text', text: signTexts[sl] || '' })), [layout, signTexts]);
  const signLogo = useMemo(() => (layoutHasLogo
    ? { kind: logoFile?.kind || 'default', svgText: logoFile?.svgText, imageSrc: logoFile?.imageSrc }
    : null), [layoutHasLogo, logoFile]);
  const signTextSummary = layout.slots
    .map((sl) => (sl === 'logo' ? `[${ts.logo}${logoFile ? `: ${logoFile.name}` : ''}]` : signTexts[sl]))
    .filter(Boolean)
    .join(' · ');
  const letterCm = signMetrics?.letterH ? Math.round(signMetrics.letterH * 100) : null;
  const stepScale = (dir) => setSignScale((v) => Math.min(SIZE_STEPS.max, Math.max(SIZE_STEPS.min, Math.round((v + dir * SIZE_STEPS.step) * 10) / 10)));
  const lightingLabel = { front: ts.lightFront, back: ts.lightBack, off: ts.lightOff }[lightingType];
  const usesPaint = [faceFinish, sideFinish, ...(signType === 'box' ? [boxFinish] : [])].some((f) => !f.metal);
  const signSpecLine = [
    signType === 'box' ? ts.typeBox : ts.typeLetters,
    ...(layoutHasKa ? [`${ts.fontShort}: ${SIGN_FONTS.find((f) => f.id === georgianFont)?.full} (Mtavruli)`] : []),
    ...(letterCm ? [`${ts.letterHeight} ≈ ${letterCm} cm`] : []),
    `${ts.face}: ${finishLabel(faceFinish)}`,
    `${ts.sides}: ${finishLabel(sideFinish)}`,
    ...(signType === 'box' ? [`${ts.box}: ${finishLabel(boxFinish)}`] : []),
    ...(usesPaint ? [paintGloss === 'gloss' ? ts.gloss : ts.matte] : []),
    `${letterDepth}mm`,
    lightingType === 'off' ? lightingLabel : `${lightingLabel} ${ledTemp}K`,
  ].join(' • ');

  const handleLogoUpload = (file) => {
    if (!file) return;
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoFile(isSvg
        ? { kind: 'svg', svgText: e.target.result, name: file.name }
        : { kind: 'image', imageSrc: e.target.result, name: file.name });
    };
    if (isSvg) reader.readAsText(file); else reader.readAsDataURL(file);
  };

  const colorValue = { face: faceFinish, side: sideFinish, box: boxFinish }[colorTarget] || faceFinish;
  const signSizeLabel = signMetrics ? `≈ ${signMetrics.w.toFixed(2)} × ${signMetrics.h.toFixed(2)} m` : '—';
  const setColorValue = (f) => {
    if (colorTarget === 'face') {
      setFaceFinish(f);
      // Returns follow the face until they are picked separately
      if (finishLabel(sideFinish) === finishLabel(faceFinish)) setSideFinish(f);
    } else if (colorTarget === 'side') setSideFinish(f);
    else setBoxFinish(f);
  };

  const currentLoc = LOCATIONS[selectedLoc] || LOCATIONS.letters;

  useEffect(() => {
    if (!currentLoc.isCardStudio || document.querySelector('link[data-card-fonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CARD_FONTS_HREF;
    link.dataset.cardFonts = '';
    document.head.appendChild(link);
  }, [currentLoc.isCardStudio]);
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
      let dataUrl = null;
      if (currentLoc.is3DLetters && signStageRef.current) {
        // Composited by the 3D stage itself: 2× WebGL frame + screen-blended light
        dataUrl = await signStageRef.current.exportPng(2);
      } else {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(stageContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // 2x Retina Clarity for High-Res Presentation
        backgroundColor: '#06080d',
        logging: false,
        onclone: (clonedDoc) => {
          // The page may show the 768px variant; the 2x export always uses the full-size photo
          clonedDoc.querySelectorAll('.mockup-city-photo').forEach((img) => {
            img.removeAttribute('srcset');
            img.removeAttribute('loading');
          });
        }
      });
      dataUrl = canvas.toDataURL('image/png', 1.0);
      }
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.download = getVisualizerDownloadName(selectedLoc);
      link.href = dataUrl;
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
    if (selectedLoc === 'card') {
      const spec = {
        productType: 'print',
        inputMode: 'visualizer_spec',
        brandText: `${cardHolder} • ${cardCompany} (${cardFormat === 'flyer' ? (t.cardFormatFlyer || 'Luxury Flyer A5') : (t.cardFormatBusiness || 'Executive Business Card')})`,
        dimensions: cardFormat === 'flyer' ? '148mm × 210mm (A5)' : '90mm × 50mm (Executive)',
        material: `${cardGsm} GSM ${cardStock.toUpperCase()} • ${cardFinish.toUpperCase().replace('_', ' ')} • Watermark: ${cardWatermark ? 'Active' : 'None'}`,
        lighting: 'Executive Studio Illumination',
        structure: `Discipline 03 / Heidelberg Offset: ${cardHolder} (${cardGsm} GSM)`,
        turnaround: currentLoc.leadTime
      };
      if (onBookBillboard) {
        onBookBillboard(spec);
      }
      return;
    }

    const spec = {
      // Must match an <option> value in SpecInquiry's medium select
      productType: { letters: 'letters', rustaveli: 'lightbox', vake: 'billboard', kakheti: 'billboard' }[selectedLoc] || 'turnkey',
      inputMode: 'visualizer_spec',
      brandText: currentLoc.is3DLetters
        ? `${signTextSummary} (${currentLoc.name})`
        : inputMode === 'upload' ? 'Custom Uploaded Design' : `${headline} (${currentLoc.name})`,
      dimensions: currentLoc.is3DLetters ? signSizeLabel : currentLoc.scale,
      material: currentLoc.is3DLetters ? signSpecLine : currentLoc.spec,
      lighting: currentLoc.is3DLetters ? (lightingType === 'off' ? lightingLabel : `${lightingLabel} ${ledTemp}K`) : 'front6500',
      structure: t('structureEstimate', { name: currentLoc.name, standard: currentLoc.standard }),
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
              <span className="tab-loc-dimension">({loc.is3DLetters ? '3D' : loc.scale.split(' ')[0]})</span>
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
                {currentLoc.is3DLetters && (
                  <button
                    className={`cad-toolbar-btn ${signZoom ? 'active' : ''}`}
                    onClick={() => setSignZoom(!signZoom)}
                    title={signZoom ? ts.zoomOut : ts.zoomIn}
                    data-cursor-text={signZoom ? 'FACADE' : 'CLOSE-UP'}
                    type="button"
                  >
                    {signZoom ? <ZoomOut size={13} /> : <ZoomIn size={13} />}
                    <span>{signZoom ? ts.zoomOut : ts.zoomIn}</span>
                  </button>
                )}
                <button
                  className={`cad-toolbar-btn ${nightMode ? 'active' : ''}`}
                  onClick={() => setNightMode(!nightMode)}
                  title={nightMode ? (currentLoc.is3DLetters ? ts.dusk : t.mockupDay) : (currentLoc.is3DLetters ? ts.night : t.mockupNight)}
                  data-cursor-text={nightMode ? 'DAYLIGHT' : 'NIGHT LUX'}
                  type="button"
                >
                  {nightMode ? <Sun size={13} /> : <Moon size={13} />}
                  <span>{nightMode ? (currentLoc.is3DLetters ? ts.dusk : t.mockupDay) : (currentLoc.is3DLetters ? ts.night : t.mockupNight)}</span>
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

            {/* PHOTOREALISTIC PHOTO VIEWPORT WITH LIVE PROJECTION / 3D CARD STUDIO */}
            <div className={`mockup-photo-stage ${currentLoc.isCardStudio ? 'card-studio-mode' : ''}`} ref={stageContainerRef}>
              {currentLoc.isCardStudio ? (
                <Suspense fallback={null}>
                <CardStage3D
                  archetype={cardArchetype}
                  format={cardFormat}
                  stock={cardStock}
                  finish={cardFinish}
                  gsm={cardGsm}
                  watermark={cardWatermark}
                  isFlipped={cardFlipped}
                  onToggleFlip={() => setCardFlipped(!cardFlipped)}
                  nightMode={nightMode}
                  phone={cardPhone}
                  holder={cardHolder}
                  role={cardRole}
                  division={cardDivision}
                  company={cardCompany}
                  address={cardAddress}
                  addressLine2={cardAddressLine2}
                  isTwoLineAddress={cardIsTwoLineAddress}
                  contact={cardContact}
                  flyerHeadline={cardCompany || 'PIERCE & PIERCE'}
                  flyerSub={`${cardDivision} • ${cardRole}`}
                  flyerDate="OCTOBER 24 • TBILISI / MANHATTAN"
                />
                </Suspense>
              ) : (
                <>
                  {/* Background photo (the 3D letters scene renders its own, zoomable copy) */}
                  {!currentLoc.is3DLetters && <img
                    src={currentLoc.image}
                    srcSet={`${currentLoc.image.replace('.webp', '-768.webp')} 768w, ${currentLoc.image} 1376w`}
                    sizes="(max-width: 1024px) 100vw, 720px"
                    width="1376"
                    height="768"
                    loading="lazy"
                    decoding="async"
                    alt={currentLoc.name}
                    className={`mockup-city-photo ${nightMode ? 'photo-night-grade' : 'photo-day-grade'}`}
                  />}

                  {/* Day/Night Volumetric Atmosphere Overlay */}
                  {nightMode && !currentLoc.is3DLetters && <div className="photo-night-ambience-overlay"></div>}

                  {/* REAL-TIME 3D CHANNEL LETTERS / LIGHTBOX (three.js) */}
                  {currentLoc.is3DLetters && (
                    <Suspense fallback={<div className="sign3d-status">{ts.loading}</div>}>
                      <SignStage3D
                        ref={signStageRef}
                        photo={{
                          src: currentLoc.image,
                          srcSet: `${currentLoc.image.replace('.webp', '-768.webp')} 768w, ${currentLoc.image} 1376w`,
                          alt: currentLoc.name,
                        }}
                        items={signItems}
                        logo={signLogo}
                        sizeScale={signScale}
                        signType={signType}
                        depthMm={letterDepth}
                        face={faceFinish}
                        side={sideFinish}
                        boxFinish={boxFinish}
                        lighting={lightingType}
                        ledTemp={ledTemp}
                        night={nightMode}
                        gloss={paintGloss}
                        zoomed={signZoom}
                        georgianFont={georgianFont}
                        onMetrics={setSignMetrics}
                        labels={{ loading: ts.loading, error: ts.fontError, dragHint: ts.dragHint, dragShort: ts.dragShort }}
                      />
                    </Suspense>
                  )}

                  {/* PERSPECTIVE PROJECTED DISPLAY */}
                  {!currentLoc.is3DLetters && (
                  <div
                    className={`billboard-perspective-screen ${nightMode ? 'screen-night-glow' : 'screen-day-glare'}`}
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
                    {inputMode === 'upload' && uploadedImage ? (
                      <div
                        className="screen-content-wrapper"
                        style={{
                          backgroundImage: `url(${uploadedImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
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

                    {/* LED Subpixel Matrix Overlay */}
                    <div className="screen-led-matrix-overlay" />

                    {/* Photometric Glass Specular Reflection */}
                    <div className={`screen-glass-reflection ${nightMode ? 'reflection-night' : 'reflection-day'}`} />
                  </div>
                  )}
                </>
              )}
            </div>

            {/* Streamlined Stage Footer Metrics */}
            <div className="mockup-stage-footer">
              <div className="stage-foot-item"><ShieldCheck size={12} className="foot-icon" /><span><strong>{t.footStandard}:</strong> {currentLoc.standard}</span></div>
              <div className="stage-foot-item"><Layers size={12} className="foot-icon" /><span><strong>{t.footScale}:</strong> {currentLoc.is3DLetters ? signSizeLabel : currentLoc.scale}</span></div>
              <div className="stage-foot-item"><Wrench size={12} className="foot-icon" /><span><strong>{t.footMaterial}:</strong> {currentLoc.is3DLetters ? `${finishLabel(faceFinish)} • ${lightingLabel}` : currentLoc.spec}</span></div>
            </div>
          </div>

          {/* Right: Clean Visualizer Controls & Booking */}
          <div className="mockup-controls-panel">
            {selectedLoc === 'card' ? (
              /* ================= SIMPLIFIED & FUN AMERICAN PSYCHO CONTROLS ================= */
              <>
                {/* 1. Pick a Character (The 4 Movie Cards + Cycle) */}
                <div className="control-block">
                  <div className="control-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t.cardArchetypes || 'SELECT CHARACTER'}</span>
                    <button
                      type="button"
                      onClick={handleCycleCard}
                      className="btn-cycle-card"
                      title="Next character card"
                    >
                      <Sparkles size={11} />
                      <span>{t.cardNextCard || 'NEXT CARD 🎲'}</span>
                    </button>
                  </div>

                  <div className="card-archetypes-simplified-grid">
                    {AMERICAN_PSYCHO_ARCHETYPES.map((arc) => {
                      const isSelected = cardArchetype === arc.id;
                      return (
                        <button
                          key={arc.id}
                          type="button"
                          className={`card-archetype-fun-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => handleSelectCardArchetype(arc)}
                        >
                          <div className="archetype-chip-header">
                            <span className="archetype-chip-name">{arc.name}</span>
                            {isSelected && <span className="archetype-chip-active-dot" />}
                          </div>
                          <span className="archetype-chip-details">
                            {arc.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Iconic Film Quote */}
                <div className="control-block">
                  <div className="ap-film-quote-card">
                    <Quote size={15} className="ap-quote-symbol" />
                    <div className="ap-quote-body">
                      <div className="ap-quote-film-tag">AMERICAN PSYCHO (2000)</div>
                      <p className="ap-quote-dialogue">"{cardQuote}"</p>
                    </div>
                  </div>
                </div>

                {/* 3. Fun Personalization: Put Your Name on the Card */}
                <div className="control-block">
                  <div className="control-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t.cardPutYourName || 'PUT YOUR NAME ON THE CARD'}</span>
                    {customName && (
                      <button
                        type="button"
                        onClick={handleResetName}
                        className="btn-reset-name-mini"
                        title="Restore original character name"
                      >
                        {t.cardResetName || '↺ RESET NAME'}
                      </button>
                    )}
                  </div>
                  <div className="ap-name-input-row">
                    <input
                      type="text"
                      className="swiss-input ap-fun-name-input"
                      value={customName}
                      onChange={(e) => handleCustomNameChange(e.target.value)}
                      placeholder={`TYPE YOUR NAME (e.g. ${cardHolder})...`}
                      maxLength={30}
                    />
                  </div>
                  <span className="ap-name-hint">
                    ⚡ Live preview in {cardStock.toUpperCase()} paper • {cardArchetype === 'bryce' ? 'Raised Thermography' : cardArchetype === 'allen' ? 'Copperplate Gothic' : cardArchetype === 'van_patten' ? 'Romalian' : 'Silian Rail'}
                  </span>
                </div>

                {/* 4. Quick Toggles: Flip 3D & Watermark */}
                <div className="control-block">
                  <div className="ap-quick-actions-row">
                    <button
                      type="button"
                      className={`segment-btn ${cardFlipped ? 'active' : ''}`}
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setCardFlipped(!cardFlipped)}
                    >
                      <RotateCw size={13} style={{ marginRight: '6px' }} className={cardFlipped ? 'rotated-flip' : ''} />
                      {cardFlipped ? (t.cardFront || 'SEE FRONT FACE') : (t.cardBack || 'FLIP TO BACK')}
                    </button>

                    <button
                      type="button"
                      className={`segment-btn ${cardWatermark ? 'active' : ''}`}
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setCardWatermark(!cardWatermark)}
                    >
                      <span>{cardWatermark ? '💧 WATERMARK ON' : '💧 WATERMARK OFF'}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : currentLoc.is3DLetters ? (
              /* ================= 3D SIGN STUDIO: three steps ================= */
              <>
                <div className="sign-steps" role="tablist">
                  {[ts.step1, ts.step2, ts.step3].map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      role="tab"
                      aria-selected={signStep === i}
                      className={`sign-step-btn ${signStep === i ? 'active' : ''}`}
                      onClick={() => setSignStep(i)}
                    >
                      <span className="sign-step-num">{i + 1}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {signStep === 0 && (
                  <>
                    {/* Composition: one row, left to right */}
                    <div className="control-block">
                      <div className="control-title"><span>{ts.layoutTitle}</span></div>
                      <div className="sign-layouts" role="radiogroup" aria-label={ts.layoutTitle}>
                        {SIGN_LAYOUTS.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            role="radio"
                            aria-checked={signLayout === l.id}
                            className={`sign-layout-btn ${signLayout === l.id ? 'active' : ''}`}
                            onClick={() => setSignLayout(l.id)}
                          >
                            {l.slots.map((sl, i) => (
                              <span key={i} className={`sign-layout-token is-${slotLang(sl)}`}>
                                {sl === 'logo' ? '' : slotLang(sl) === 'ka' ? 'ქართ' : 'EN'}
                              </span>
                            ))}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* One field per text slot, in sign order */}
                    <div className="control-block">
                      <div className="control-title"><span>{t.mockupBrandInput}</span></div>
                      {layout.slots.filter((sl) => sl !== 'logo').map((sl) => {
                        const lang = slotLang(sl);
                        const split = sl.length > 2;
                        const label = `${lang === 'ka' ? ts.langKa : ts.langEn}${split ? ` — ${sl.endsWith('L') ? ts.sideLeft : ts.sideRight}` : ''}`;
                        return (
                          <label key={sl} className="sign-text-field">
                            <span className={`sign-text-tag is-${lang}`}>{lang === 'ka' ? 'ქა' : 'EN'}</span>
                            <input
                              type="text"
                              className="swiss-input"
                              value={signTexts[sl]}
                              onChange={(e) => setSignTexts((prev) => ({ ...prev, [sl]: e.target.value }))}
                              placeholder={label}
                              aria-label={label}
                              maxLength={24}
                            />
                          </label>
                        );
                      })}

                      {/* Font and size, right under the text */}
                      <div className="sign-type-row">
                        {layoutHasKa && (
                          <label className="sign-font-select">
                            <select value={georgianFont} onChange={(e) => setGeorgianFont(e.target.value)} aria-label={ts.fontShort}>
                              {SIGN_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                            </select>
                            <ChevronDown size={13} aria-hidden="true" />
                          </label>
                        )}
                        <div className="sign-size-stepper" role="group" aria-label={ts.letterHeight}>
                          <button type="button" onClick={() => stepScale(-1)} disabled={signScale <= SIZE_STEPS.min} aria-label={ts.smaller}>
                            <Minus size={13} />
                          </button>
                          <span className="sign-size-value" title={ts.letterHeight}>
                            {letterCm ? `${letterCm} ${ts.cm}` : '—'}
                          </span>
                          <button type="button" onClick={() => stepScale(1)} disabled={signScale >= SIZE_STEPS.max} aria-label={ts.bigger}>
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                      {layoutHasKa && <span className="sign-hint">{ts.fontHint}</span>}
                    </div>

                    {layoutHasLogo && (
                      <div className="control-block">
                        <div className="control-title"><span>{ts.logo}</span></div>
                        <div className="sign-logo-row">
                          <button type="button" className="sign-logo-upload" onClick={() => logoInputRef.current?.click()}>
                            <Upload size={13} />
                            <span>{logoFile ? logoFile.name : ts.logoUpload}</span>
                          </button>
                          {logoFile && (
                            <button
                              type="button"
                              className="sign-logo-clear"
                              onClick={() => setLogoFile(null)}
                              title={ts.logoReset}
                              aria-label={ts.logoReset}
                            >
                              <X size={13} />
                            </button>
                          )}
                          <input
                            type="file"
                            ref={logoInputRef}
                            hidden
                            accept=".svg,image/svg+xml,image/png,image/webp,image/jpeg"
                            onChange={(e) => { handleLogoUpload(e.target.files?.[0]); e.target.value = ''; }}
                          />
                        </div>
                        <span className="sign-hint">{logoFile?.kind === 'image' ? ts.logoRasterHint : ts.logoHint}</span>
                      </div>
                    )}
                  </>
                )}

                {signStep === 1 && (
                  <>
                    {/* Construction: standalone letters or lightbox */}
                    <div className="control-block">
                      <div className="control-title"><span>{ts.typeTitle}</span></div>
                      <Segmented
                        value={signType}
                        onChange={(v) => {
                          setSignType(v);
                          if (v !== 'box' && colorTarget === 'box') { setColorTarget('face'); setColorOpen(false); }
                        }}
                        options={[{ val: 'letters', label: ts.typeLetters }, { val: 'box', label: ts.typeBox }]}
                      />
                    </div>

                    {/* Colours: compact chips, the RAL catalogue opens on demand */}
                    <div className="control-block">
                      <div className="control-title"><span>{ts.colorTitle}</span></div>
                      <div className="sign-color-targets">
                        {[
                          { val: 'face', label: ts.face, f: faceFinish },
                          { val: 'side', label: ts.sides, f: sideFinish },
                          ...(signType === 'box' ? [{ val: 'box', label: ts.box, f: boxFinish }] : []),
                        ].map((o) => {
                          const isOpen = colorOpen && colorTarget === o.val;
                          return (
                            <button
                              key={o.val}
                              type="button"
                              className={`sign-color-target ${isOpen ? 'active' : ''}`}
                              aria-expanded={isOpen}
                              onClick={() => {
                                setColorTarget(o.val);
                                setColorOpen(!isOpen);
                              }}
                            >
                              <span className={`ral-current-chip ${o.f.metal ? 'is-metal' : ''}`} style={{ '--swatch': o.f.hex }} />
                              <span className="sign-color-target-text">
                                <strong>{o.label}</strong>
                                <span>{o.f.type === 'ral' ? `RAL ${o.f.code}` : o.f.name}</span>
                              </span>
                              <ChevronDown size={13} className={`sign-color-caret ${isOpen ? 'open' : ''}`} />
                            </button>
                          );
                        })}
                      </div>
                      {colorOpen && (
                        <RalColorPicker
                          value={colorValue}
                          onChange={setColorValue}
                          labels={{ metals: ts.metals, metal: ts.metal, popular: ts.popular, search: ts.search, noMatch: ts.noMatch }}
                        />
                      )}
                    </div>

                    {usesPaint && (
                      <div className="control-block">
                        <div className="control-title"><span>{ts.finishTitle}</span></div>
                        <Segmented
                          value={paintGloss}
                          onChange={setPaintGloss}
                          options={[{ val: 'matte', label: ts.matte }, { val: 'gloss', label: ts.gloss }]}
                        />
                      </div>
                    )}

                    {/* Depth */}
                    <div className="control-block">
                      <div className="control-title">
                        <span>{signType === 'box' ? ts.boxDepthTitle : t.depthTitle}</span>
                        <span className="badge-tag-mini">{signType === 'box' ? letterDepth + 60 : letterDepth} MM</span>
                      </div>
                      <Segmented
                        value={letterDepth}
                        onChange={setLetterDepth}
                        options={[{ val: 30, label: t.depth30 }, { val: 60, label: t.depth60 }, { val: 100, label: t.depth100 }]}
                      />
                    </div>
                  </>
                )}

                {signStep === 2 && (
                  <>
                    <div className="control-block">
                      <div className="control-title"><span>{t.lightingTitle}</span></div>
                      <Segmented
                        value={lightingType}
                        onChange={setLightingType}
                        options={[{ val: 'front', label: ts.lightFront }, { val: 'back', label: ts.lightBack }, { val: 'off', label: ts.lightOff }]}
                      />
                      <span className="sign-hint">{{ front: ts.lightFrontHint, back: ts.lightBackHint, off: ts.lightOffHint }[lightingType]}</span>
                    </div>
                    {lightingType !== 'off' && (
                      <div className="control-block">
                        <div className="control-title"><span>{ts.ledTitle}</span></div>
                        <Segmented
                          value={ledTemp}
                          onChange={setLedTemp}
                          options={[{ val: 3000, label: ts.led3000 }, { val: 6500, label: ts.led6500 }]}
                        />
                      </div>
                    )}
                    <div className="control-block">
                      <div className="control-title"><span>{ts.timeTitle}</span></div>
                      <Segmented
                        value={nightMode ? 'night' : 'dusk'}
                        onChange={(v) => setNightMode(v === 'night')}
                        options={[{ val: 'dusk', label: ts.dusk }, { val: 'night', label: ts.night }]}
                      />
                    </div>
                  </>
                )}

                <div className="sign-step-nav">
                  {signStep > 0 ? (
                    <button type="button" className="sign-step-nav-btn" onClick={() => setSignStep(signStep - 1)}>← {ts.back}</button>
                  ) : <span />}
                  {signStep < 2 && (
                    <button type="button" className="sign-step-nav-btn is-next" onClick={() => setSignStep(signStep + 1)}>{ts.next} →</button>
                  )}
                </div>
              </>
            ) : (
              /* ================= EXISTING OUTDOOR BILLBOARD CONTROLS ================= */
              <>
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
                      <Sparkles size={13} className="icon-inline" />
                      {t.mockupModeDesigner}
                    </button>
                    <button
                      className={`segment-btn ${inputMode === 'upload' ? 'active' : ''}`}
                      onClick={() => setInputMode('upload')}
                      data-cursor-text="UPLOAD"
                      type="button"
                    >
                      <Upload size={13} className="icon-inline" />
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
                        hidden
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
                  🛠️ {currentLoc.is3DLetters ? signSpecLine : currentLoc.spec} • {currentLoc.leadTime}
                </div>
              </div>

              <button
                className="btn-swiss btn-swiss-solid visualizer-submit-btn"
                onClick={handleBookBillboard}
                data-cursor-text={selectedLoc === 'card' ? 'PRINT RUN' : 'INQUIRE BUILD'}
                type="button"
              >
                <span>
                  {selectedLoc === 'card'
                    ? (t.cardBookBtn || 'Order Print Run on Heidelberg →')
                    : (t.mockupBookBtn || 'კონსტრუქციის დამზადება & მონტაჟი →')}
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented-control">
      {options.map((o) => (
        <button
          key={o.val}
          className={`segment-btn ${value === o.val ? 'active' : ''}`}
          onClick={() => onChange(o.val)}
          aria-pressed={value === o.val}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function getVisualizerDownloadName(selectedLoc) {
  return `vector_hub_${selectedLoc}_visualizer_${Date.now()}.png`;
}
