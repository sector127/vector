import React, { useState, useRef } from 'react';
import { ArrowRight, Sliders, CheckCircle2, Layers, Cpu, Compass } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function VectorWorkbench({ lang, onTransferSpec }) {
  const t = translations[lang] || translations.ka;

  // State
  const [productType, setProductType] = useState('letters'); // 'letters', 'lightbox', 'billboard', 'print'
  const [currency, setCurrency] = useState('GEL'); // 'GEL', 'USD', 'EUR'
  const [brandText, setBrandText] = useState(lang === 'ka' ? 'თბილისი' : 'TBILISI');
  const [width, setWidth] = useState(3.6); // meters
  const [height, setHeight] = useState(1.2); // meters
  const [material, setMaterial] = useState('brass'); // 'brass', 'stainless', 'acrylic', 'carbon'
  const [lighting, setLighting] = useState('halo3000'); // 'halo3000', 'front6500', 'none'
  const [printUnits, setPrintUnits] = useState(5000); // for print run
  const [stageTilt, setStageTilt] = useState({ rx: 0, ry: 0 });
  const stageRef = useRef(null);

  // Conversion rates (1 USD = 2.70 GEL, 1 EUR = 2.95 GEL)
  const rates = {
    GEL: 1,
    USD: 1 / 2.70,
    EUR: 1 / 2.95
  };
  const currencySymbols = {
    GEL: '₾',
    USD: '$',
    EUR: '€'
  };

  // Base pricing matrix per m² in GEL
  const baseRatesGEL = {
    letters: { brass: 2400, stainless: 2100, acrylic: 1750, carbon: 1850 },
    lightbox: { brass: 2100, stainless: 1950, acrylic: 1600, carbon: 1700 },
    billboard: { brass: 3600, stainless: 3400, acrylic: 3100, carbon: 3200 },
    print: { brass: 0.45, stainless: 0.38, acrylic: 0.30, carbon: 0.32 }
  };

  const lightMultiplier = {
    halo3000: 1.35,
    front6500: 1.25,
    none: 1.0
  };

  // Calculations
  const areaSqM = (width * height).toFixed(2);
  const toolpathMm = Math.round(width * height * 1420 + (brandText.length * 380));
  
  let totalCostGEL = 0;
  if (productType === 'print') {
    const unitPrice = baseRatesGEL.print[material] || 0.35;
    totalCostGEL = Math.round(printUnits * unitPrice + 180);
  } else {
    const base = baseRatesGEL[productType][material] || 2000;
    const mult = lightMultiplier[lighting] || 1.0;
    totalCostGEL = Math.round(areaSqM * base * mult);
  }

  const convertedPrice = Math.round(totalCostGEL * rates[currency]);
  const estDays = lang === 'ka' 
    ? (productType === 'billboard' ? '12 - 16 სამუშაო დღე' : (productType === 'letters' ? '5 - 7 სამუშაო დღე' : (productType === 'print' ? '2 სამუშაო დღე' : '4 - 6 სამუშაო დღე')))
    : (productType === 'billboard' ? '12 - 16 Business Days' : (productType === 'letters' ? '5 - 7 Business Days' : (productType === 'print' ? '2 Business Days' : '4 - 6 Business Days')));

  // Stage Mouse Hover 3D Tilt
  const handleStageMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setStageTilt({
      rx: -(y / (rect.height / 2)) * 6,
      ry: (x / (rect.width / 2)) * 8
    });
  };

  const handleStageLeave = () => {
    setStageTilt({ rx: 0, ry: 0 });
  };

  const handleApply = () => {
    const spec = {
      productType,
      brandText,
      dimensions: `${width}m × ${height}m (${areaSqM} m²)`,
      material,
      lighting,
      printUnits: productType === 'print' ? printUnits : null,
      estimate: `${currencySymbols[currency]} ${convertedPrice.toLocaleString()}`,
      turnaround: estDays
    };
    onTransferSpec(spec);
  };

  return (
    <section className="section-block workbench-section" id="workbench">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-editorial">
          <div className="editorial-tag">{t.workbenchTag}</div>
          <div>
            <h2 className="editorial-headline">
              {t.workbenchTitle}
            </h2>
            <p className="editorial-sub">
              {t.workbenchSub}
            </p>
          </div>
        </div>

        {/* Workbench Layout */}
        <div className="workbench-layout">
          {/* Left: Vector CAD Stage with 3D Tilt */}
          <div 
            className="workbench-stage-box"
            ref={stageRef}
            onMouseMove={handleStageMove}
            onMouseLeave={handleStageLeave}
            style={{
              transform: `perspective(900px) rotateX(${stageTilt.rx}deg) rotateY(${stageTilt.ry}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="canvas-header-bar">
              <span style={{ fontWeight: '700' }}>Photometric Vector CAD</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="tag-swiss">Scale 1:10</span>
                <span className="tag-swiss">{lang === 'ka' ? 'თბილისის საწარმო' : 'Tbilisi Factory'}</span>
              </div>
            </div>

            {/* Simulated Vector Wireframe CAD Box */}
            <div className="stage-cad-view">
              <svg viewBox="0 0 460 300" style={{ width: '100%', height: '100%' }}>
                {/* Background CAD Grid */}
                <defs>
                  <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--ink-hairline)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cadGrid)" />

                {/* Dimension Extension Lines */}
                <line x1="60" y1="40" x2="400" y2="40" stroke="var(--ink-primary)" strokeWidth="1" />
                <line x1="60" y1="35" x2="60" y2="45" stroke="var(--ink-primary)" strokeWidth="1" />
                <line x1="400" y1="35" x2="400" y2="45" stroke="var(--ink-primary)" strokeWidth="1" />
                <text x="230" y="32" fill="var(--ink-primary)" fontSize="10" fontFamily="Space Mono" textAnchor="middle" fontWeight="700">
                  {lang === 'ka' ? 'სიგანე' : 'WIDTH'}: {width} m
                </text>

                <line x1="420" y1="60" x2="420" y2="240" stroke="var(--ink-primary)" strokeWidth="1" />
                <line x1="415" y1="60" x2="425" y2="60" stroke="var(--ink-primary)" strokeWidth="1" />
                <line x1="415" y1="240" x2="425" y2="240" stroke="var(--ink-primary)" strokeWidth="1" />
                <text x="440" y="155" fill="var(--ink-primary)" fontSize="10" fontFamily="Space Mono" transform="rotate(90 440,155)" textAnchor="middle" fontWeight="700">
                  {lang === 'ka' ? 'სიმაღლე' : 'HEIGHT'}: {height} m
                </text>

                {/* Rendered Object Simulation */}
                {productType === 'letters' && (
                  <g>
                    {/* 3D Extrusion Backing */}
                    <text 
                      x="230" 
                      y="160" 
                      fill="none" 
                      stroke="var(--ink-muted)" 
                      strokeWidth="3" 
                      fontSize={brandText.length > 8 ? "28" : "38"} 
                      fontFamily="TG Square, Noto Sans Georgian, Syne" 
                      fontWeight="900" 
                      textAnchor="middle" 
                      letterSpacing="0.04em"
                      dx="6"
                      dy="-6"
                    >
                      {brandText || 'VECTOR'}
                    </text>
                    {/* Front Face */}
                    <text 
                      x="230" 
                      y="160" 
                      fill="var(--bg-main)" 
                      stroke="var(--ink-primary)" 
                      strokeWidth="2.5" 
                      fontSize={brandText.length > 8 ? "28" : "38"} 
                      fontFamily="TG Square, Noto Sans Georgian, Syne" 
                      fontWeight="900" 
                      textAnchor="middle" 
                      letterSpacing="0.04em"
                    >
                      {brandText || 'VECTOR'}
                    </text>
                    {lighting !== 'none' && (
                      <circle cx="230" cy="150" r="90" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
                    )}
                  </g>
                )}

                {productType === 'lightbox' && (
                  <g>
                    <rect x="70" y="60" width="320" height="170" fill="var(--bg-main)" stroke="var(--ink-primary)" strokeWidth="2.5" />
                    <rect x="80" y="70" width="300" height="150" fill="none" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="230" y="155" fill="var(--ink-primary)" fontSize="26" fontFamily="TG Square, Noto Sans Georgian, Syne" fontWeight="800" textAnchor="middle">
                      {brandText || (lang === 'ka' ? 'ლაითბოქსი' : 'LIGHTBOX')}
                    </text>
                  </g>
                )}

                {productType === 'billboard' && (
                  <g>
                    <rect x="70" y="60" width="320" height="120" fill="var(--bg-main)" stroke="var(--ink-primary)" strokeWidth="3" />
                    <line x1="220" y1="180" x2="220" y2="260" stroke="var(--ink-primary)" strokeWidth="4" />
                    <line x1="240" y1="180" x2="240" y2="260" stroke="var(--ink-primary)" strokeWidth="4" />
                    <text x="230" y="130" fill="var(--ink-primary)" fontSize="22" fontFamily="TG Square, Noto Sans Georgian, Syne" fontWeight="900" textAnchor="middle">
                      {brandText || (lang === 'ka' ? 'LED ბილბორდი' : 'HIGHWAY LED')}
                    </text>
                  </g>
                )}

                {productType === 'print' && (
                  <g>
                    <rect x="110" y="60" width="240" height="170" fill="var(--bg-main)" stroke="var(--ink-primary)" strokeWidth="1.5" />
                    <rect x="100" y="50" width="260" height="190" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="230" y="150" fill="var(--ink-primary)" fontSize="20" fontFamily="TG Square, Noto Sans Georgian, Space Grotesk" fontWeight="700" textAnchor="middle">
                      {printUnits.toLocaleString()} {lang === 'ka' ? 'ცალი ფლაერი' : 'Units • Flyers'}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* CAD Spec Readout */}
            <div className="canvas-footer-hud" style={{ borderTop: '1px solid var(--ink-hairline)', paddingTop: '12px' }}>
              <div><strong>{t.hudArea}:</strong> {areaSqM} m²</div>
              <div><strong>{t.hudToolpath}:</strong> {toolpathMm.toLocaleString()} mm</div>
              <div><strong>{t.hudTolerance}:</strong> ±0.02 mm</div>
            </div>
          </div>

          {/* Right: Controls & Real-Time Price Matrix */}
          <div className="workbench-controls-panel">
            {/* Currency Selector */}
            <div className="control-block">
              <div className="control-title">
                <span>{t.step1Title}</span>
                <span style={{ color: 'var(--ink-muted)' }}>{t.step1Sub}</span>
              </div>
              <div className="segmented-control">
                <button 
                  className={`segment-btn ${currency === 'GEL' ? 'active' : ''}`}
                  onClick={() => setCurrency('GEL')}
                  data-cursor-text="GEL"
                >
                  ₾ GEL ({lang === 'ka' ? 'საქართველო' : 'Georgia'})
                </button>
                <button 
                  className={`segment-btn ${currency === 'USD' ? 'active' : ''}`}
                  onClick={() => setCurrency('USD')}
                  data-cursor-text="USD"
                >
                  $ USD ({lang === 'ka' ? 'საერთაშორისო' : 'Intl'})
                </button>
                <button 
                  className={`segment-btn ${currency === 'EUR' ? 'active' : ''}`}
                  onClick={() => setCurrency('EUR')}
                  data-cursor-text="EUR"
                >
                  € EUR ({lang === 'ka' ? 'ევროპა' : 'Europe'})
                </button>
              </div>
            </div>

            {/* Product Type Selector */}
            <div className="control-block">
              <div className="control-title">{t.step2Title}</div>
              <div className="segmented-control">
                <button 
                  className={`segment-btn ${productType === 'letters' ? 'active' : ''}`}
                  onClick={() => setProductType('letters')}
                  data-cursor-text="3D LETTERS"
                >
                  {t.modeLetters}
                </button>
                <button 
                  className={`segment-btn ${productType === 'lightbox' ? 'active' : ''}`}
                  onClick={() => setProductType('lightbox')}
                  data-cursor-text="LIGHTBOX"
                >
                  {t.modeLightbox}
                </button>
                <button 
                  className={`segment-btn ${productType === 'billboard' ? 'active' : ''}`}
                  onClick={() => setProductType('billboard')}
                  data-cursor-text="BILLBOARD"
                >
                  {t.modeBillboard}
                </button>
                <button 
                  className={`segment-btn ${productType === 'print' ? 'active' : ''}`}
                  onClick={() => setProductType('print')}
                  data-cursor-text="PRINT"
                >
                  {lang === 'ka' ? 'პოლიგრაფია' : 'Print / Flyers'}
                </button>
              </div>
            </div>

            {/* Custom Text */}
            <div className="control-block">
              <div className="control-title">{t.step3Title}</div>
              <input 
                type="text" 
                className="swiss-input" 
                value={brandText} 
                onChange={(e) => setBrandText(e.target.value)}
                placeholder={lang === 'ka' ? 'ჩაწერეთ ბრენდის ან აბრის სახელი...' : 'TYPE BRAND OR SIGNAGE NAME...'}
                maxLength={24}
              />
            </div>

            {/* Dimensions or Print Run Quantity */}
            {productType !== 'print' ? (
              <div className="control-block">
                <div className="control-title">
                  <span>{t.step4Title}</span>
                  <span>{width}m ({lang === 'ka' ? 'სიგანე' : 'Width'}) × {height}m ({lang === 'ka' ? 'სიმაღლე' : 'Height'})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                      {lang === 'ka' ? 'სიგანე' : 'WIDTH'}: {width}m
                    </label>
                    <input 
                      type="range" 
                      min="1.0" 
                      max="15.0" 
                      step="0.2" 
                      value={width} 
                      onChange={(e) => setWidth(parseFloat(e.target.value))}
                      className="swiss-slider"
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                      {lang === 'ka' ? 'სიმაღლე' : 'HEIGHT'}: {height}m
                    </label>
                    <input 
                      type="range" 
                      min="0.4" 
                      max="5.0" 
                      step="0.1" 
                      value={height} 
                      onChange={(e) => setHeight(parseFloat(e.target.value))}
                      className="swiss-slider"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="control-block">
                <div className="control-title">
                  <span>{t.step4Units}</span>
                  <span>{printUnits.toLocaleString()} {lang === 'ka' ? 'ცალი' : 'Units'}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="100000" 
                  step="500" 
                  value={printUnits} 
                  onChange={(e) => setPrintUnits(parseInt(e.target.value))}
                  className="swiss-slider"
                />
              </div>
            )}

            {/* Material Finish */}
            <div className="control-block">
              <div className="control-title">{t.step5Title}</div>
              <div className="segmented-control">
                <button 
                  className={`segment-btn ${material === 'brass' ? 'active' : ''}`}
                  onClick={() => setMaterial('brass')}
                >
                  {t.matBrass}
                </button>
                <button 
                  className={`segment-btn ${material === 'stainless' ? 'active' : ''}`}
                  onClick={() => setMaterial('stainless')}
                >
                  {t.matSteel}
                </button>
                <button 
                  className={`segment-btn ${material === 'acrylic' ? 'active' : ''}`}
                  onClick={() => setMaterial('acrylic')}
                >
                  {t.matAcrylic}
                </button>
                <button 
                  className={`segment-btn ${material === 'carbon' ? 'active' : ''}`}
                  onClick={() => setMaterial('carbon')}
                >
                  {t.matCarbon}
                </button>
              </div>
            </div>

            {/* Illumination Style */}
            {productType !== 'print' && (
              <div className="control-block">
                <div className="control-title">{t.step6Title}</div>
                <div className="segmented-control">
                  <button 
                    className={`segment-btn ${lighting === 'halo3000' ? 'active' : ''}`}
                    onClick={() => setLighting('halo3000')}
                  >
                    {t.lightHalo}
                  </button>
                  <button 
                    className={`segment-btn ${lighting === 'front6500' ? 'active' : ''}`}
                    onClick={() => setLighting('front6500')}
                  >
                    {t.lightFront}
                  </button>
                  <button 
                    className={`segment-btn ${lighting === 'none' ? 'active' : ''}`}
                    onClick={() => setLighting('none')}
                  >
                    {t.lightNone}
                  </button>
                </div>
              </div>
            )}

            {/* Output Estimate Summary Card */}
            <div className="estimate-display-card">
              <div className="estimate-col">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                  {t.estBudgetLbl}
                </span>
                <span className="est-currency-val">
                  {currencySymbols[currency]} {convertedPrice.toLocaleString()}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-secondary)', marginTop: '4px' }}>
                  ✓ {estDays}
                </span>
              </div>
              <button 
                className="btn-swiss btn-swiss-solid" 
                onClick={handleApply}
                data-cursor-text="APPLY"
              >
                <span>{t.transferBtn}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
