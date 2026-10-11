import React from 'react';
import { ArrowDownRight, Compass, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

export default function Hero({ lang }) {
  const t = getTranslation(lang);
  const capabilities = t.heroCapabilities || [];

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
              {t.heroCapabilitiesLabel}
            </span>
            <div className="capabilities-chips">
              {capabilities.map((cap, i) => (
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
            <div className="pillar-val">{t.metric1Val}</div>
            <div className="pillar-lbl">{t.heroMetric1Lbl}</div>
          </div>
          <div className="metric-pillar">
            <div className="pillar-val">{t.metric2Val}</div>
            <div className="pillar-lbl">{t.heroMetric2Lbl}</div>
          </div>
          <div className="metric-pillar">
            <div className="pillar-val">{t.metric3Val}</div>
            <div className="pillar-lbl">{t.heroMetric3Lbl}</div>
          </div>
          <div className="metric-pillar">
            <div className="pillar-val">{t.heroMetric4Val}</div>
            <div className="pillar-lbl">{t.heroMetric4Lbl}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
