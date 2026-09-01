import React from 'react';
import { ArrowDownRight, Compass, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function Hero({ lang }) {
  const t = translations[lang] || translations.ka;

  const CAPABILITIES = [
    lang === 'ka' ? '3D მოცულობითი თითბერი (Halo 3000K)' : '3D Dimensional Brass (Halo 3000K)',
    lang === 'ka' ? 'მძიმე ფოლადის მეგაკონსტრუქციები' : 'Heavy Steel Structural Rigging',
    lang === 'ka' ? '22მმ ულტრათხელი SEG ლაითბოქსები' : '22mm Ultra-Slim SEG Lightboxes',
    lang === 'ka' ? 'ინდუსტრიული UV ბეჭდვა 5 მეტრამდე' : 'Industrial UV Printing up to 5.0m',
    lang === 'ka' ? 'სიმაღლეზე მონტაჟი 60 მეტრამდე' : 'High-Altitude Mounting up to 60m'
  ];

  return (
    <section className="hero-monolithic-section" id="hero">
      {/* Background Volumetric Depth & Spatial Grid */}
      <div className="hero-depth-ambient-glow"></div>
      <div className="hero-architectural-grid"></div>

      <div className="container hero-monolithic-container">
        {/* Top Architectural Telemetry Bar */}
        <div className="hero-telemetry-header">
          <div className="telemetry-badge">
            <span className="live-pulse-dot"></span>
            <span>{t.heroBadge || 'მასშტაბური წარმოება • თბილისი, საქართველო'}</span>
          </div>

          <div className="telemetry-coordinates">
            <Compass size={12} style={{ display: 'inline', marginRight: '5px' }} />
            <span>TBS [41.7151° N, 44.8271° E] • ELEV: 480m • CNC TOLERANCE: ±0.02mm</span>
          </div>
        </div>

        {/* Main Monolithic Headline */}
        <div className="hero-headline-centerpiece">
          <h1 className="hero-headline-title">
            <span className="headline-line line-1">{t.heroTitleLine1} {t.heroTitleLine2}</span>
            <span className="headline-line line-2">{t.heroTitleLine3} {t.heroTitleLine4}</span>
          </h1>

          <p className="hero-lead-description">
            {t.heroDesc}
          </p>
        </div>

        {/* Primary Action Buttons & Capabilities Strip */}
        <div className="hero-action-ecosystem">
          <div className="hero-buttons-row">
            <a 
              href="#workbench" 
              className="btn-swiss btn-swiss-solid hero-primary-btn" 
              data-cursor-text="CAD STUDIO"
            >
              <span>{t.heroBtnStudio}</span>
              <ArrowDownRight size={18} />
            </a>
            <a 
              href="#mockup-studio" 
              className="btn-swiss hero-secondary-btn" 
              data-cursor-text="3D VISUALIZER"
            >
              <Sparkles size={15} style={{ display: 'inline', marginRight: '6px' }} />
              <span>{t.heroBtnVisualizer}</span>
            </a>
          </div>

          {/* Capabilities Ribbon */}
          <div className="hero-capabilities-ribbon">
            <span className="capabilities-label">
              <Cpu size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {lang === 'ka' ? 'საწარმოო მიმართულებები:' : 'Capabilities:'}
            </span>
            <div className="capabilities-chips">
              {CAPABILITIES.map((cap, i) => (
                <span key={i} className="cap-chip">
                  <CheckCircle2 size={11} className="chip-icon" />
                  <span>{cap}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: 4 Monolithic Metric Pillars */}
        <div className="hero-monolithic-metrics">
          <div className="metric-pillar">
            <div className="pillar-val">2,500 მ²</div>
            <div className="pillar-lbl">{lang === 'ka' ? 'საკუთარი საწარმოო კომპლექსი თბილისში' : 'Heavy Fabrication Complex in Tbilisi'}</div>
          </div>
          <div className="metric-pillar">
            <div className="pillar-val">±0.02 მმ</div>
            <div className="pillar-lbl">{lang === 'ka' ? '5-ღერძიანი ლაზერული CNC სიზუსტე' : '5-Axis Laser CNC Accuracy'}</div>
          </div>
          <div className="metric-pillar">
            <div className="pillar-val">180 კმ/სთ</div>
            <div className="pillar-lbl">{lang === 'ka' ? 'ქარის გათვლილი დამოწმებული გამძლეობა' : 'Wind Load Certified Static Engineering'}</div>
          </div>
          <div className="metric-pillar">
            <div className="pillar-val">5 {lang === 'ka' ? 'წელი' : 'Years'}</div>
            <div className="pillar-lbl">{lang === 'ka' ? 'სრული საინჟინრო და საგარანტიო SLA' : 'Full Engineering & Warranty SLA'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
