import React from 'react';
import { getTranslation } from '../i18n/translations';

export default function Disciplines({ lang }) {
  const t = getTranslation(lang);

  const disciplines = [
    {
      num: '01',
      title: t.d1Title,
      category: t.d1Cat,
      desc: t.d1Desc,
      specs: t.d1Specs,
      svg: (
        <svg viewBox="0 0 300 160" style={{ width: '100%', height: '100%' }}>
          <line x1="80" y1="30" x2="150" y2="130" stroke="var(--ink-primary)" strokeWidth="2.5" />
          <line x1="150" y1="130" x2="220" y2="30" stroke="var(--ink-primary)" strokeWidth="2.5" />
          <line x1="100" y1="30" x2="150" y2="105" stroke="var(--ink-primary)" strokeWidth="2.5" />
          <line x1="150" y1="105" x2="200" y2="30" stroke="var(--ink-primary)" strokeWidth="2.5" />
          <line x1="80" y1="30" x2="95" y2="20" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="220" y1="30" x2="235" y2="20" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="150" y1="130" x2="165" y2="120" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="130" r="14" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="80" cy="30" r="14" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="220" cy="30" r="14" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="2 2" />
          <text x="15" y="150" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono">Extrusion 80mm • Warm 3000K Halo</text>
        </svg>
      )
    },
    {
      num: '02',
      title: t.d2Title,
      category: t.d2Cat,
      desc: t.d2Desc,
      specs: t.d2Specs,
      svg: (
        <svg viewBox="0 0 300 160" style={{ width: '100%', height: '100%' }}>
          <rect x="40" y="25" width="220" height="110" fill="none" stroke="var(--ink-primary)" strokeWidth="2.5" />
          <rect x="52" y="37" width="196" height="86" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="46" y1="35" x2="46" y2="125" stroke="var(--ink-primary)" strokeWidth="3" />
          <line x1="254" y1="35" x2="254" y2="125" stroke="var(--ink-primary)" strokeWidth="3" />
          <line x1="50" y1="50" x2="150" y2="80" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="50" y1="110" x2="150" y2="80" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="250" y1="50" x2="150" y2="80" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="250" y1="110" x2="150" y2="80" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
          <text x="15" y="150" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono">SEG Profile • 22mm Slim • CRI 95+</text>
        </svg>
      )
    },
    {
      num: '03',
      title: t.d3Title,
      category: t.d3Cat,
      desc: t.d3Desc,
      specs: t.d3Specs,
      svg: (
        <svg viewBox="0 0 300 160" style={{ width: '100%', height: '100%' }}>
          <rect x="50" y="25" width="200" height="110" fill="none" stroke="var(--ink-primary)" strokeWidth="1.5" />
          <rect x="42" y="17" width="216" height="126" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="150" y1="25" x2="150" y2="135" stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="35" y1="25" x2="48" y2="25" stroke="var(--ink-primary)" strokeWidth="1" />
          <line x1="50" y1="10" x2="50" y2="23" stroke="var(--ink-primary)" strokeWidth="1" />
          <line x1="252" y1="25" x2="265" y2="25" stroke="var(--ink-primary)" strokeWidth="1" />
          <line x1="250" y1="10" x2="250" y2="23" stroke="var(--ink-primary)" strokeWidth="1" />
          <circle cx="150" cy="80" r="10" fill="none" stroke="var(--ink-primary)" strokeWidth="1" />
          <line x1="135" y1="80" x2="165" y2="80" stroke="var(--ink-primary)" strokeWidth="1" />
          <line x1="150" y1="65" x2="150" y2="95" stroke="var(--ink-primary)" strokeWidth="1" />
          <text x="15" y="152" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono">3mm Bleed • Heidelberg Offset • Foil</text>
        </svg>
      )
    },
    {
      num: '04',
      title: t.d4Title,
      category: t.d4Cat,
      desc: t.d4Desc,
      specs: t.d4Specs,
      svg: (
        <svg viewBox="0 0 300 160" style={{ width: '100%', height: '100%' }}>
          <rect x="40" y="20" width="220" height="90" fill="none" stroke="var(--ink-primary)" strokeWidth="2.5" />
          <line x1="140" y1="110" x2="140" y2="155" stroke="var(--ink-primary)" strokeWidth="3" />
          <line x1="160" y1="110" x2="160" y2="155" stroke="var(--ink-primary)" strokeWidth="3" />
          <line x1="40" y1="20" x2="150" y2="110" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="260" y1="20" x2="150" y2="110" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40" y1="110" x2="150" y2="20" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="260" y1="110" x2="150" y2="20" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="15" y="152" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono">Unipolar Truss • P3.9 LED • 8500 Nits</text>
        </svg>
      )
    },
    {
      num: '05',
      title: t.d5Title,
      category: t.d5Cat,
      desc: t.d5Desc,
      specs: t.d5Specs,
      svg: (
        <svg viewBox="0 0 300 160" style={{ width: '100%', height: '100%' }}>
          <line x1="30" y1="140" x2="270" y2="140" stroke="var(--ink-primary)" strokeWidth="2" />
          <rect x="70" y="50" width="160" height="90" fill="none" stroke="var(--ink-primary)" strokeWidth="1.5" />
          <line x1="30" y1="140" x2="70" y2="20" stroke="var(--ink-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="70" y1="20" x2="150" y2="20" stroke="var(--ink-primary)" strokeWidth="2" />
          <line x1="150" y1="20" x2="150" y2="70" stroke="var(--ink-primary)" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="130" y="70" width="40" height="20" fill="none" stroke="var(--ink-primary)" strokeWidth="1.5" />
          <text x="15" y="152" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono">Municipal Permits • 60m Crane • CAD Certified</text>
        </svg>
      )
    }
  ];

  return (
    <section className="section-block" id="disciplines">
      <div className="container">
        {/* Editorial Section Header */}
        <div className="section-header-editorial">
          <div className="editorial-tag">{t.disciplinesTag}</div>
          <div>
            <h2 className="editorial-headline">
              {t.disciplinesTitle}
            </h2>
            <p className="editorial-sub">
              {t.disciplinesSub}
            </p>
          </div>
        </div>

        {/* Disciplines Grid */}
        <div className="disciplines-grid">
          {disciplines.map((disc, idx) => (
            <div 
              key={disc.num} 
              className={`discipline-card ${idx === 4 ? 'discipline-card-wide' : ''}`}
              data-cursor-text={disc.category.toUpperCase()}
            >
              <div className="discipline-card-header">
                <div>
                  <span className="d-code">{disc.num} / {t.disciplineProductionLabel}</span>
                  <h3 className="d-title">{disc.title}</h3>
                </div>
                <span className="tag-swiss">{disc.category}</span>
              </div>

              <div className="discipline-svg-preview">
                {disc.svg}
              </div>

              <div className="discipline-card-body">
                <p className="d-desc">{disc.desc}</p>
                <div className="d-specs-table">
                  {disc.specs.map((s, i) => (
                    <div key={i} className="d-spec-row">
                      <span className="k">{s.k}</span>
                      <span className="v">{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
