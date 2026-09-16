import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Shield, Sparkles, Award } from 'lucide-react';

export default function CardStage3D({
  archetype = 'bateman',
  format = 'business_card', // 'business_card' | 'flyer'
  stock = 'bone', // 'bone' | 'eggshell' | 'nimbus' | 'offwhite' | 'obsidian'
  finish = 'deboss', // 'deboss' | 'raised' | 'raised_gold' | 'copperplate' | 'gold_foil'
  gsm = 450, // 350 | 450 | 600
  watermark = false,
  isFlipped = false,
  onToggleFlip,
  nightMode = false,
  phone = '212 555 6342',
  company = 'PIERCE & PIERCE',
  division = 'MERGERS AND AQUISITIONS',
  holder = 'PATRICK BATEMAN',
  role = 'VICE PRESIDENT',
  address = '358 Exchange Place New York, N.Y. 10099 FAX 212 555 6390 TELEX 10 4534',
  addressLine2 = '',
  isTwoLineAddress = false,
  flyerHeadline = 'HAUTE TYPOGRAPHY 1987',
  flyerSub = 'EXECUTIVE INVITATION & FABRICATION RETROSPECTIVE',
  flyerDate = 'OCTOBER 24 • TBILISI / MANHATTAN'
}) {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 6, ry: -8, glintX: 45, glintY: 40, isHovered: false });
  const animFrameRef = useRef(null);

  // Smooth mouse tilt tracking for real physical inspection
  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) - 0.5; // -0.5 to 0.5
    const normY = (y / rect.height) - 0.5;

    // Angle bounds: ±24 deg Y, ∓20 deg X
    const targetRy = normX * 24;
    const targetRx = -normY * 20;

    const glintX = Math.max(0, Math.min(100, (normX + 0.5) * 100));
    const glintY = Math.max(0, Math.min(100, (normY + 0.5) * 100));

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      setTilt({
        rx: targetRx,
        ry: targetRy,
        glintX,
        glintY,
        isHovered: true
      });
    });
  };

  const handleMouseLeave = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setTilt({
      rx: 6,
      ry: -8,
      glintX: 45,
      glintY: 40,
      isHovered: false
    });
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Screen-Accurate Paper Stock Palettes & Tactile Properties
  const stockStyles = {
    bone: {
      name: 'Bone',
      bg: '#ede8dd', // Accurate Patrick Bateman warm bone / ivory tone
      textColor: '#26221d',
      edgeColor: '#cfc9bb',
      filterId: 'ap-bone-texture',
      paperClass: 'paper-bone'
    },
    eggshell: {
      name: 'Eggshell',
      bg: '#eae4d5', // Accurate David Van Patten stippled off-white
      textColor: '#1f1a16',
      edgeColor: '#c8c1b0',
      filterId: 'ap-eggshell-texture',
      paperClass: 'paper-eggshell'
    },
    nimbus: {
      name: 'Pale Nimbus White',
      bg: '#e4e7ea', // Accurate Timothy Bryce pale cool nimbus white
      textColor: '#22201e',
      edgeColor: '#c5cace',
      filterId: 'ap-nimbus-texture',
      paperClass: 'paper-nimbus'
    },
    offwhite: {
      name: 'Subtle Off-White',
      bg: '#f1ede3', // Accurate Paul Allen smooth subtle off-white linen
      textColor: '#2d2822',
      edgeColor: '#d5cfc1',
      filterId: 'ap-offwhite-texture',
      paperClass: 'paper-offwhite'
    },
    obsidian: {
      name: 'Obsidian Soft-Touch',
      bg: '#14161a',
      textColor: '#f8fafc',
      edgeColor: '#2b303c',
      filterId: 'ap-bone-texture',
      paperClass: 'paper-obsidian'
    }
  }[stock] || {
    name: 'Bone',
    bg: '#ede8dd',
    textColor: '#26221d',
    edgeColor: '#cfc9bb',
    filterId: 'ap-bone-texture',
    paperClass: 'paper-bone'
  };

  // "Tasteful Thickness" physical layered paper edge shadows
  const getThicknessShadow = () => {
    const isDark = stock === 'obsidian';
    const edge = stockStyles.edgeColor;
    const ambient = nightMode ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.45)';

    if (gsm === 600) {
      // Heavyweight Duplex: 5 layers of crisp return edge
      return `
        1px 1px 0 ${edge},
        2px 2px 0 ${isDark ? '#0b0c0e' : '#b8ae9a'},
        3px 3px 0 ${isDark ? '#ffd700' : '#8c826e'},
        4px 4px 0 ${isDark ? '#0b0c0e' : '#b8ae9a'},
        5px 5px 0 ${edge},
        8px 14px 28px ${ambient},
        16px 30px 60px rgba(0,0,0,0.5)
      `;
    } else if (gsm === 450) {
      // 450 GSM: The Canonical "Tasteful Thickness" (3-layer bevel)
      return `
        1px 1px 0 ${edge},
        2px 2px 0 ${isDark ? '#0b0c0e' : '#bfb6a2'},
        3px 3px 0 ${edge},
        6px 12px 24px ${ambient},
        14px 22px 48px rgba(0,0,0,0.38)
      `;
    } else {
      // 350 GSM: Standard luxury card edge
      return `
        1px 1px 0 ${edge},
        4px 8px 18px ${ambient},
        10px 16px 32px rgba(0,0,0,0.28)
      `;
    }
  };

  // Screen-Accurate Movie Typography & Bevel Shaders
  const getLetteringClass = () => {
    if (archetype === 'bateman') return 'bateman-silian-rail';
    if (archetype === 'van_patten') return 'vanpatten-romalian';
    if (archetype === 'allen') return 'allen-copperplate';
    if (archetype === 'bryce') return 'bryce-raised-lettering';
    return 'vector-bespoke-gold';
  };

  const isBusinessCard = format === 'business_card';
  const showTwoLines = isTwoLineAddress || archetype === 'allen';

  return (
    <div
      className={`card-studio-viewport ${nightMode ? 'night-desk' : 'day-desk'}`}
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hidden Procedural SVG Filters for Authentic Paper Grain Micro-Pits */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          {/* Eggshell Dimpled Cold-Press Texture (Van Patten) */}
          <filter id="ap-eggshell-texture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="1.8" result="light">
              <feDistantLight azimuth="55" elevation="50" />
            </feDiffuseLighting>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.42" />
            </feComponentTransfer>
            <feBlend mode="multiply" in="SourceGraphic" result="blend" />
          </filter>

          {/* Bone Fine Tooth Texture (Patrick Bateman) */}
          <filter id="ap-bone-texture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="1.1" result="light">
              <feDistantLight azimuth="50" elevation="65" />
            </feDiffuseLighting>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.25" />
            </feComponentTransfer>
            <feBlend mode="multiply" in="SourceGraphic" />
          </filter>

          {/* Nimbus Laid Paper Horizontal Fiber Texture (Timothy Bryce) */}
          <filter id="ap-nimbus-texture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.75 0.15" numOctaves="3" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="1.4" result="light">
              <feDistantLight azimuth="60" elevation="55" />
            </feDiffuseLighting>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.32" />
            </feComponentTransfer>
            <feBlend mode="multiply" in="SourceGraphic" />
          </filter>

          {/* Subtle Off-White Smooth Cotton Weave (Paul Allen) */}
          <filter id="ap-offwhite-texture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="0.9" result="light">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.22" />
            </feComponentTransfer>
            <feBlend mode="multiply" in="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      {/* Boardroom Mahogany / Dark Executive Blotter Desk Environment */}
      <div className="desk-surface-texture" />
      <div className="desk-lamp-spotlight" style={{ left: `${tilt.glintX}%`, top: `${tilt.glintY}%` }} />

      {/* 3D Perspective Card Stage */}
      <div className="card-3d-scene-container">
        <div
          className={`card-3d-flipper ${isFlipped ? 'flipped' : ''}`}
          style={{
            transform: `
              perspective(1200px)
              rotateX(${tilt.rx}deg)
              rotateY(${tilt.ry + (isFlipped ? 180 : 0)}deg)
            `,
            transition: tilt.isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* ===================== FRONT FACE (THE SCREEN-ACCURATE CARD) ===================== */}
          <div
            className={`card-body-surface card-front-face ${stockStyles.paperClass} ${isBusinessCard ? 'format-business-card' : 'format-flyer'}`}
            style={{
              backgroundColor: stockStyles.bg,
              boxShadow: getThicknessShadow()
            }}
          >
            {/* Tactile Paper Texture Layer with Physical Grain */}
            <div className={`card-tactile-grain-canvas ${stockStyles.paperClass}-grain`} />

            {/* Translucent Security Watermark ("Oh my God, it even has a watermark...") */}
            {(watermark || archetype === 'allen') && (
              <div
                className="card-watermark-layer"
                style={{
                  opacity: Math.max(0.22, (tilt.glintX / 100) * 0.72)
                }}
              >
                <div className="watermark-crest">
                  <Shield size={isBusinessCard ? 74 : 110} strokeWidth={1.2} />
                  <div className="watermark-monogram">P&P</div>
                  <div className="watermark-seal-sub">MERGERS & ACQUISITIONS</div>
                  <div className="watermark-fine-rings" />
                </div>
              </div>
            )}

            {/* Specular Sheen across Card Surface following mouse cursor */}
            <div
              className="card-specular-glint"
              style={{
                background: `radial-gradient(ellipse at ${tilt.glintX}% ${tilt.glintY}%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`
              }}
            />

            {/* ================= EXACT SCREEN-ACCURATE MOVIE CARD LAYOUT ================= */}
            {isBusinessCard ? (
              <div className={`card-inner-screen-accurate ${getLetteringClass()}`}>
                {/* Top Row: Phone on Left, Firm on Right */}
                <div className="ap-card-top-row">
                  <div className="ap-card-phone">
                    {phone || (archetype === 'allen' ? '212.555.6342' : '212 555 6342')}
                  </div>
                  <div className="ap-card-firm-block">
                    <div className="ap-firm-title">
                      {company || 'PIERCE & PIERCE'}
                    </div>
                    <div className="ap-firm-dept">
                      {division || (archetype === 'bateman' || archetype === 'allen' ? 'MERGERS AND AQUISITIONS' : 'Mergers and Aquisitions')}
                    </div>
                  </div>
                </div>

                {/* Dead Center of the Card: Name & Title (NO EXTRA CRESTS) */}
                <div className="ap-card-center-block">
                  <div className="ap-holder-name">
                    {holder || 'PATRICK BATEMAN'}
                  </div>
                  <div className="ap-holder-role">
                    {role || (archetype === 'bateman' || archetype === 'allen' ? 'VICE PRESIDENT' : 'Vice President')}
                  </div>
                </div>

                {/* Bottom Row: Centered Address & Telex */}
                <div className="ap-card-bottom-block">
                  {showTwoLines ? (
                    <div className="ap-address-two-lines">
                      <div className="ap-address-line1">
                        {address || '358 EXCHANGE PLACE NEW YORK, N.Y. 10099'}
                      </div>
                      <div className="ap-address-line2">
                        {addressLine2 || 'FAX 212 555 6390 TELEX 10 4534'}
                      </div>
                    </div>
                  ) : (
                    <div className="ap-address-single-line">
                      {address || (archetype === 'bateman' 
                        ? '358 Exchange Place New York, N.Y. 10099 FAX 212 555 6390 TELEX 10 4534'
                        : '358 EXCHANGE PLACE NEW YORK, N.Y. 10099 FAX 212 555 6390 TELEX 10 4534')}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card-inner-layout flyer-layout">
                {/* Luxury Flyer / Postcard (A5) */}
                <div className="flyer-top-monogram">
                  <div className="flyer-crest">
                    <Award size={20} />
                  </div>
                  <span className="flyer-firm-tag">
                    {company || 'PIERCE & PIERCE'} • HAUTE IMPRESSIONS
                  </span>
                </div>

                <div className="flyer-headline-block">
                  <div className="flyer-edition-pill">
                    OFFICIAL EDITION • 1987
                  </div>
                  <h3 className="flyer-main-title">
                    {flyerHeadline}
                  </h3>
                  <div className="flyer-accent-divider" />
                  <p className="flyer-sub-desc">
                    {flyerSub}
                  </p>
                </div>

                <div className="flyer-spec-table">
                  <div className="flyer-spec-col">
                    <span className="flyer-spec-label">PAPER STOCK</span>
                    <strong className="flyer-spec-val">{stockStyles.name}</strong>
                  </div>
                  <div className="flyer-spec-col">
                    <span className="flyer-spec-label">THICKNESS</span>
                    <strong className="flyer-spec-val">{gsm} GSM DUPLEX</strong>
                  </div>
                  <div className="flyer-spec-col">
                    <span className="flyer-spec-label">FINISH</span>
                    <strong className="flyer-spec-val">{finish.toUpperCase().replace('_', ' ')}</strong>
                  </div>
                </div>

                <div className="flyer-bottom-block">
                  <div className="flyer-date-venue">
                    {flyerDate}
                  </div>
                  <div className="flyer-signature-row">
                    <span className="flyer-host-name">{holder}</span>
                    <span className="flyer-host-title">{role}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===================== REVERSE BACK FACE ===================== */}
          <div
            className={`card-body-surface card-back-face ${stockStyles.paperClass} ${isBusinessCard ? 'format-business-card' : 'format-flyer'}`}
            style={{
              backgroundColor: stockStyles.bg,
              boxShadow: getThicknessShadow()
            }}
          >
            <div className={`card-tactile-grain-canvas ${stockStyles.paperClass}-grain`} />

            <div className="card-back-center-seal">
              <div className="card-back-monogram-shield">
                <Shield size={34} strokeWidth={1.5} />
                <span className="back-monogram-letters">P&P</span>
              </div>

              <div className="card-back-firm-name">
                {company || 'PIERCE & PIERCE'}
              </div>
              <div className="card-back-motto">
                EST. 1987 • WALL STREET • NEW YORK
              </div>

              {/* Blind Embossed Geometric Watermark Grid */}
              <div className="card-back-geometric-grid">
                <div className="back-grid-line" />
                <span className="back-grid-coords">40°42'28.8"N 74°00'36.0"W</span>
                <div className="back-grid-line" />
              </div>

              <div className="card-back-security-stamp">
                <span>HEIDELBERG OFFSET CERTIFIED • {gsm} GSM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating 3D Flip Quick-Toggle Button */}
      <button
        type="button"
        className="card-stage-flip-btn"
        onClick={onToggleFlip}
        title="3D Card Flip (Front / Reverse)"
        data-cursor-text="FLIP 3D"
      >
        <RotateCw size={14} className={isFlipped ? 'rotated-flip' : ''} />
        <span>{isFlipped ? 'FRONT FACE' : 'REVERSE BACK'}</span>
      </button>

      {/* Interactive Cursor Tracking Hint */}
      <div className="card-stage-tilt-hint">
        <Sparkles size={12} />
        <span>HOVER & MOVE CURSOR TO INSPECT TILT, DEBOSS & SHEEN</span>
      </div>
    </div>
  );
}
