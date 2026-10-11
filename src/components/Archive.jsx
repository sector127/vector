import React, { useState, useEffect } from 'react';
import { getTranslation } from '../i18n/translations';

// Architectural Schematic SVGs for Project Blueprints
const SCHEMATICS = {
  0: (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <text x="140" y="85" fill="var(--bg-main)" stroke="var(--ink-primary)" strokeWidth="2" fontSize="30" fontFamily="Oxanium" fontWeight="900" textAnchor="middle">
        BOUTIQUE
      </text>
      <line x1="30" y1="120" x2="250" y2="120" stroke="var(--ink-hairline)" strokeWidth="1" />
      <line x1="30" y1="115" x2="30" y2="125" stroke="var(--ink-primary)" strokeWidth="1" />
      <line x1="250" y1="115" x2="250" y2="125" stroke="var(--ink-primary)" strokeWidth="1" />
      <text x="140" y="138" fill="var(--ink-muted)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">Span 4600mm • Brass 2.5mm</text>
    </svg>
  ),
  1: (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <path d="M 40 40 Q 140 20, 240 40 L 240 100 Q 140 80, 40 100 Z" fill="none" stroke="var(--ink-primary)" strokeWidth="2" />
      <line x1="140" y1="100" x2="140" y2="145" stroke="var(--ink-primary)" strokeWidth="3" />
      <text x="140" y="70" fill="var(--ink-primary)" fontSize="16" fontFamily="Oxanium" fontWeight="700" textAnchor="middle">120 m² Curved LED</text>
      <text x="140" y="152" fill="var(--ink-muted)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">P3.9 LED • 8500 Nits</text>
    </svg>
  ),
  2: (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect x="50" y="25" width="180" height="100" fill="none" stroke="var(--ink-primary)" strokeWidth="2" />
      <rect x="58" y="33" width="164" height="84" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
      <text x="140" y="80" fill="var(--ink-primary)" fontSize="14" fontFamily="JetBrains Mono" textAnchor="middle">22mm Profile</text>
      <text x="140" y="145" fill="var(--ink-muted)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">SEG Fabric • 5500K</text>
    </svg>
  ),
  3: (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <text x="140" y="70" fill="var(--bg-main)" stroke="var(--ink-primary)" strokeWidth="2" fontSize="26" fontFamily="Oxanium" fontWeight="900" textAnchor="middle">
        SKYLINE
      </text>
      <line x1="30" y1="85" x2="250" y2="85" stroke="var(--ink-primary)" strokeWidth="2" />
      <line x1="50" y1="85" x2="70" y2="135" stroke="var(--ink-hairline)" strokeWidth="1" />
      <line x1="140" y1="85" x2="140" y2="135" stroke="var(--ink-hairline)" strokeWidth="1" />
      <line x1="230" y1="85" x2="210" y2="135" stroke="var(--ink-hairline)" strokeWidth="1" />
      <text x="140" y="150" fill="var(--ink-muted)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">Elevation +90m • Crane Lift</text>
    </svg>
  ),
  4: (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect x="60" y="25" width="160" height="100" fill="none" stroke="var(--ink-primary)" strokeWidth="1.5" />
      <line x1="140" y1="25" x2="140" y2="125" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="140" cy="75" r="16" fill="none" stroke="var(--ink-primary)" strokeWidth="1" />
      <text x="140" y="145" fill="var(--ink-muted)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">450 GSM • Gold Foil Stamp</text>
    </svg>
  ),
  5: (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect x="40" y="30" width="200" height="70" fill="none" stroke="var(--ink-primary)" strokeWidth="2" />
      <line x1="140" y1="100" x2="140" y2="145" stroke="var(--ink-primary)" strokeWidth="4" />
      <text x="140" y="70" fill="var(--ink-primary)" fontSize="14" fontFamily="Oxanium" fontWeight="700" textAnchor="middle">14m × 5m Unipolar</text>
      <text x="140" y="152" fill="var(--ink-muted)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">Highway • Airport Route</text>
    </svg>
  )
};

export default function Archive({ lang }) {
  const t = getTranslation(lang);
  const [filter, setFilter] = useState('all');
  const [activeProject, setActiveProject] = useState(null);

  // Handle ESC key and body scroll-locking for blueprint modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeProject) {
        setActiveProject(null);
      }
    };

    if (activeProject) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProject]);

  const rawProjects = t.archiveProjects || [];
  const projects = rawProjects.map((p, idx) => ({
    id: p.id || idx + 1,
    title: p.title,
    category: p.category,
    categoryName: p.categoryName,
    client: p.client,
    location: p.location,
    year: p.year,
    summary: p.summary,
    specs: {
      dimensions: p.dimensions,
      material: p.material,
      illumination: p.illumination,
      windRating: p.windRating,
      turnaround: p.turnaround
    },
    schematic: SCHEMATICS[idx] || SCHEMATICS[0]
  }));

  const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  return (
    <section className="section-block" id="archive">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-editorial">
          <div className="editorial-tag">{t.archiveTag}</div>
          <div>
            <h2 className="editorial-headline">
              {t.archiveTitle}
            </h2>
            <p className="editorial-sub">
              {t.archiveSub}
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="archive-filters">
          <button 
            className={`btn-swiss btn-swiss-sm ${filter === 'all' ? 'btn-swiss-solid' : ''}`}
            onClick={() => setFilter('all')}
            data-cursor-text="ALL"
          >
            {t.allFilter}
          </button>
          <button 
            className={`btn-swiss btn-swiss-sm ${filter === 'letters' ? 'btn-swiss-solid' : ''}`}
            onClick={() => setFilter('letters')}
            data-cursor-text="3D LETTERS"
          >
            {t.modeLetters}
          </button>
          <button 
            className={`btn-swiss btn-swiss-sm ${filter === 'lightbox' ? 'btn-swiss-solid' : ''}`}
            onClick={() => setFilter('lightbox')}
            data-cursor-text="LIGHTBOXES"
          >
            {t.modeLightbox}
          </button>
          <button 
            className={`btn-swiss btn-swiss-sm ${filter === 'billboard' ? 'btn-swiss-solid' : ''}`}
            onClick={() => setFilter('billboard')}
            data-cursor-text="BILLBOARDS"
          >
            {t.modeBillboard}
          </button>
          <button 
            className={`btn-swiss btn-swiss-sm ${filter === 'print' ? 'btn-swiss-solid' : ''}`}
            onClick={() => setFilter('print')}
            data-cursor-text="PRINT"
          >
            {t.modePrint}
          </button>
        </div>

        {/* Projects Grid */}
        <div className="archive-grid">
          {filtered.map((proj) => (
            <div 
              key={proj.id} 
              className="archive-card"
              onClick={() => setActiveProject(proj)}
              data-cursor-text="VIEW"
            >
              <div className="archive-schematic-box">
                {proj.schematic}
              </div>

              <div className="archive-card-content">
                <span className="arch-client">{proj.client} • {proj.year}</span>
                <h3 className="arch-title">{proj.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                  {proj.summary}
                </p>
                <div className="arch-specs">
                  <span>{proj.location}</span>
                  <span style={{ fontWeight: '700' }}>{t.inspectSpec}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Drawer for Detailed Project Blueprint */}
        {activeProject && (
          <div className="blueprint-modal-backdrop" onClick={() => setActiveProject(null)}>
            <div className="blueprint-modal-box" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close-cross" 
                onClick={() => setActiveProject(null)} 
                aria-label="Close Blueprint Modal"
                data-cursor-text="CLOSE"
              >
                ✕
              </button>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '8px' }}>
                {t.blueprintModalTitle} • {activeProject.year}
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                {activeProject.title}
              </h2>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {t.archiveClientLabel} <strong>{activeProject.client}</strong> • {t.archiveLocationLabel} <strong>{activeProject.location}</strong>
              </div>

              <div style={{ height: '180px', background: 'var(--bg-subtle)', border: '1px solid var(--ink-hairline)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeProject.schematic}
              </div>

              <p style={{ fontSize: '1rem', color: 'var(--ink-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                {activeProject.summary}
              </p>

              <div style={{ border: '1px solid var(--ink-primary)', padding: '20px', background: 'var(--bg-subtle)', marginBottom: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>
                  {t.archiveTechDataTitle}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                  <div><span style={{ color: 'var(--ink-muted)' }}>{t.specDimensions}:</span><br /><strong>{activeProject.specs.dimensions}</strong></div>
                  <div><span style={{ color: 'var(--ink-muted)' }}>{t.specMaterial}:</span><br /><strong>{activeProject.specs.material}</strong></div>
                  <div><span style={{ color: 'var(--ink-muted)' }}>{t.specIllumination}:</span><br /><strong>{activeProject.specs.illumination}</strong></div>
                  <div><span style={{ color: 'var(--ink-muted)' }}>{t.specWindRating}:</span><br /><strong>{activeProject.specs.windRating}</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                  {t.specTurnaround}: {activeProject.specs.turnaround}
                </span>
                <a 
                  href="#inquiry" 
                  onClick={() => setActiveProject(null)} 
                  className="btn-swiss btn-swiss-solid"
                  data-cursor-text="INQUIRE"
                >
                  {t.similarBuildBtn}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
