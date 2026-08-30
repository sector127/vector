import React, { useState } from 'react';
import { ArrowUpRight, X, FileText, Layers, ShieldCheck } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function Archive({ lang }) {
  const t = translations[lang] || translations.ka;
  const [filter, setFilter] = useState('all');
  const [activeProject, setActiveProject] = useState(null);

  const projects = [
    {
      id: 1,
      title: lang === 'ka' ? 'Aura Luxury Flagship — ჭავჭავაძის გამზირი' : 'Aura Luxury Flagship — Chavchavadze Ave',
      category: 'letters',
      categoryName: lang === 'ka' ? '3D თითბერის ასოები' : '3D Brass Letters',
      client: 'Aura Haute Horlogerie & Jewelry',
      location: lang === 'ka' ? 'ვაკე, თბილისი' : 'Vake, Tbilisi',
      year: '2025',
      summary: lang === 'ka' 
        ? '3D დავარცხნილი თითბერის მოცულობითი ასოები ბაზალტის არქიტექტურულ ფასადზე 3000K თბილი Samsung LED განათებით.'
        : '3D brushed brass halo-lit channel letters mounted on dark basalt architectural facade with 3000K Samsung LEDs.',
      specs: {
        dimensions: '4.6m × 1.1m (Letter height: 680mm)',
        material: 'Brushed Brass 2.5mm + Grade 316 Base',
        illumination: 'Samsung SMD2835 3000K Warm Halo-Lit',
        windRating: 'Certified for 140 km/h gusts',
        turnaround: lang === 'ka' ? '6 სამუშაო დღე' : '6 Business Days'
      },
      schematic: (
        <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
          <text x="140" y="85" fill="var(--bg-main)" stroke="var(--ink-primary)" strokeWidth="2" fontSize="34" fontFamily="Syne" fontWeight="900" textAnchor="middle">
            AURA
          </text>
          <line x1="30" y1="120" x2="250" y2="120" stroke="var(--ink-hairline)" strokeWidth="1" />
          <line x1="30" y1="115" x2="30" y2="125" stroke="var(--ink-primary)" strokeWidth="1" />
          <line x1="250" y1="115" x2="250" y2="125" stroke="var(--ink-primary)" strokeWidth="1" />
          <text x="140" y="138" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono" textAnchor="middle">Span 4600mm • Brass 2.5mm</text>
        </svg>
      )
    },
    {
      id: 2,
      title: lang === 'ka' ? 'Nexus გმირთა მოედნის მომრგვალებული მეგაბორდი' : 'Nexus Heroes Square Curved Megaboard',
      category: 'billboard',
      categoryName: lang === 'ka' ? 'ციფრული LED ბილბორდი' : 'Digital Billboard',
      client: 'Nexus Financial & Media',
      location: lang === 'ka' ? 'გმირთა მოედანი, თბილისი' : 'Heroes Square, Tbilisi',
      year: '2025',
      summary: lang === 'ka'
        ? '120მ² მომრგვალებული გარე ციფრული LED ეკრანი 8,500 nits სიკაშკაშითა და სინათლის ავტომატური სენსორული მართვით.'
        : '120m² curved outdoor digital LED megaboard with 8,500 nits daylight visibility and automatic ambient lux dimming.',
      specs: {
        dimensions: '15.0m × 8.0m Curved Radius',
        material: 'Aircraft Aluminum Cabinet + P3.9 LED',
        illumination: 'High-Contrast P3.91mm Outdoor LED',
        windRating: 'Civil Certified up to 180 km/h',
        turnaround: lang === 'ka' ? '14 სამუშაო დღე' : '14 Business Days Turnkey'
      },
      schematic: (
        <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
          <path d="M 40 40 Q 140 20, 240 40 L 240 100 Q 140 80, 40 100 Z" fill="none" stroke="var(--ink-primary)" strokeWidth="2" />
          <line x1="140" y1="100" x2="140" y2="145" stroke="var(--ink-primary)" strokeWidth="3" />
          <text x="140" y="70" fill="var(--ink-primary)" fontSize="16" fontFamily="Space Grotesk" fontWeight="700" textAnchor="middle">120 m² Curved LED</text>
          <text x="140" y="152" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono" textAnchor="middle">P3.9 LED • 8500 Nits</text>
        </svg>
      )
    },
    {
      id: 3,
      title: lang === 'ka' ? 'Tbilisi Silk მოდის ატელიეს ვიტრინის ლაითბოქსი' : 'Tbilisi Silk Fashion Storefront Lightbox',
      category: 'lightbox',
      categoryName: lang === 'ka' ? 'SEG ლაითბოქსი' : 'SEG Lightbox',
      client: 'Tbilisi Silk & Fashion Atelier',
      location: lang === 'ka' ? 'რუსთაველის გამზ., თბილისი' : 'Rustaveli Ave, Tbilisi',
      year: '2026',
      summary: lang === 'ka'
        ? '22მმ ულტრა-თხელი უჩარჩოო ტექსტილის ლაითბოქსი მაღალი CRI 98 განათებით სეზონური კოლექციების გამოსაფენად.'
        : 'Ultra-slim 22mm frameless edge-lit fabric lightbox with high-CRI 98 backlighting for vibrant seasonal campaign graphic swaps.',
      specs: {
        dimensions: '3.2m × 2.4m Single Panel',
        material: 'Anodized Champagne Aluminum + SEG Fabric',
        illumination: 'High-CRI 98 5500K True-Daylight',
        windRating: 'Indoor / Semi-Outdoor Shopfront',
        turnaround: lang === 'ka' ? '4 სამუშაო დღე' : '4 Business Days'
      },
      schematic: (
        <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
          <rect x="50" y="25" width="180" height="100" fill="none" stroke="var(--ink-primary)" strokeWidth="2" />
          <rect x="58" y="33" width="164" height="84" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="140" y="80" fill="var(--ink-primary)" fontSize="14" fontFamily="Space Mono" textAnchor="middle">22mm Profile</text>
          <text x="140" y="145" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono" textAnchor="middle">SEG Fabric • 5500K</text>
        </svg>
      )
    },
    {
      id: 4,
      title: lang === 'ka' ? 'Aethelred SkyTower სახურავის მონუმენტური ლოგო' : 'Aethelred SkyTower Monumental Crest',
      category: 'letters',
      categoryName: lang === 'ka' ? 'სახურავის 3D აბრა' : '3D Rooftop Signage',
      client: 'Aethelred Capital Georgia',
      location: lang === 'ka' ? 'საბურთალო, მაღლივი კორპუსი' : 'Saburtalo High-Rise Tower',
      year: '2024',
      summary: lang === 'ka'
        ? '16-მეტრიანი მონუმენტური უჟანგავი ფოლადის კონსტრუქცია ორმაგი წინა და ჰალო თეთრი განათებით.'
        : 'Monumental 16-meter rooftop architectural signage fabricated in stainless steel with dual front & halo white illumination.',
      specs: {
        dimensions: '16.2m × 3.8m Structural Truss',
        material: 'Structural Steel Truss + Mirror Stainless',
        illumination: 'Dual-circuit 6500K Crisp High-Lumen',
        windRating: 'High-Altitude 200 km/h Hurricane Tested',
        turnaround: lang === 'ka' ? '18 სამუშაო დღე' : '18 Business Days'
      },
      schematic: (
        <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
          <text x="140" y="70" fill="var(--bg-main)" stroke="var(--ink-primary)" strokeWidth="2" fontSize="22" fontFamily="Syne" fontWeight="900" textAnchor="middle">
            AETHELRED
          </text>
          <line x1="30" y1="85" x2="250" y2="85" stroke="var(--ink-primary)" strokeWidth="2" />
          <line x1="50" y1="85" x2="70" y2="135" stroke="var(--ink-hairline)" strokeWidth="1" />
          <line x1="140" y1="85" x2="140" y2="135" stroke="var(--ink-hairline)" strokeWidth="1" />
          <line x1="230" y1="85" x2="210" y2="135" stroke="var(--ink-hairline)" strokeWidth="1" />
          <text x="140" y="150" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono" textAnchor="middle">Elevation +90m • Crane Lift</text>
        </svg>
      )
    },
    {
      id: 5,
      title: lang === 'ka' ? 'Aurum Creative პრემიუმ პოლიგრაფიული ნაკრები' : 'Aurum Creative Luxury Print Suite',
      category: 'print',
      categoryName: lang === 'ka' ? 'ფლაერები და პოლიგრაფია' : 'Flyers & Brand Collateral',
      client: 'Aurum Creative Group',
      location: lang === 'ka' ? 'თბილისი და ექსპორტი' : 'Tbilisi & International Dispatch',
      year: '2026',
      summary: lang === 'ka'
        ? 'ოქროს ფოლგით ჭედური ფლაერები, ბუკლეტები და Soft-Touch შავი მქრქალი სავიზიტო ბარათები.'
        : 'Embossed gold foil stamped luxury flyers, tri-fold brochures, and soft-touch black silk marketing cards.',
      specs: {
        dimensions: 'A5, A4, DL and Custom Die-Cut Sizes',
        material: '450gsm Imperial Velvet Touch + Hot Gold Foil',
        illumination: 'Reflective Metallic Lustre & Spot UV',
        windRating: 'Indoor & Direct Campaign Collateral',
        turnaround: lang === 'ka' ? '48 საათი' : '48-Hour Rapid Run'
      },
      schematic: (
        <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
          <rect x="60" y="25" width="160" height="100" fill="none" stroke="var(--ink-primary)" strokeWidth="1.5" />
          <line x1="140" y1="25" x2="140" y2="125" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="140" cy="75" r="16" fill="none" stroke="var(--ink-primary)" strokeWidth="1" />
          <text x="140" y="145" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono" textAnchor="middle">450 GSM • Gold Foil Stamp</text>
        </svg>
      )
    },
    {
      id: 6,
      title: lang === 'ka' ? 'კახეთის გზატკეცილის მაგისტრალური ბილბორდი' : 'East-Point Kakheti Highway Megaboard',
      category: 'billboard',
      categoryName: lang === 'ka' ? 'მაგისტრალური ბილბორდი' : 'Highway Megaboard',
      client: 'Airport Corridor Commercial Group',
      location: lang === 'ka' ? 'კახეთის გზატკეცილი, თბილისი' : 'Kakheti Highway, Tbilisi',
      year: '2025',
      summary: lang === 'ka'
        ? 'ორმხრივი მოთუთიებული ფოლადის უნიპოლარი მაღალი დაჭიმვის ბანერითა და ღამის LED განათებით.'
        : 'Heavy galvanized unipolar static billboard with high-tension front-lit vinyl and automated night floodlighting.',
      specs: {
        dimensions: '14.0m × 5.0m Double Sided',
        material: 'Galvanized Structural Steel Column',
        illumination: 'High-Lumen Philips Optical LED Floodlights',
        windRating: 'Civil Foundation 180 km/h Tested',
        turnaround: lang === 'ka' ? '10 სამუშაო დღე' : '10 Business Days'
      },
      schematic: (
        <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
          <rect x="40" y="30" width="200" height="70" fill="none" stroke="var(--ink-primary)" strokeWidth="2" />
          <line x1="140" y1="100" x2="140" y2="145" stroke="var(--ink-primary)" strokeWidth="4" />
          <text x="140" y="70" fill="var(--ink-primary)" fontSize="14" fontFamily="Space Grotesk" fontWeight="700" textAnchor="middle">14m × 5m Unipolar</text>
          <text x="140" y="152" fill="var(--ink-muted)" fontSize="9" fontFamily="Space Mono" textAnchor="middle">Highway • Airport Route</text>
        </svg>
      )
    }
  ];

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
            {lang === 'ka' ? 'პოლიგრაფია' : 'Print & Flyers'}
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
                {lang === 'ka' ? 'დამკვეთი:' : 'Client:'} <strong>{activeProject.client}</strong> • {lang === 'ka' ? 'ლოკაცია:' : 'Location:'} <strong>{activeProject.location}</strong>
              </div>

              <div style={{ height: '180px', background: 'var(--bg-subtle)', border: '1px solid var(--ink-hairline)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeProject.schematic}
              </div>

              <p style={{ fontSize: '1rem', color: 'var(--ink-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                {activeProject.summary}
              </p>

              <div style={{ border: '1px solid var(--ink-primary)', padding: '20px', background: 'var(--bg-subtle)', marginBottom: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>
                  {lang === 'ka' ? 'ტექნიკური და საინჟინრო პარამეტრები' : 'Technical & Structural Data'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                  <div><span style={{ color: 'var(--ink-muted)' }}>{lang === 'ka' ? 'ზომები:' : 'Dimensions:'}</span><br /><strong>{activeProject.specs.dimensions}</strong></div>
                  <div><span style={{ color: 'var(--ink-muted)' }}>{lang === 'ka' ? 'მასალები:' : 'Materials:'}</span><br /><strong>{activeProject.specs.material}</strong></div>
                  <div><span style={{ color: 'var(--ink-muted)' }}>{lang === 'ka' ? 'განათება:' : 'Illumination:'}</span><br /><strong>{activeProject.specs.illumination}</strong></div>
                  <div><span style={{ color: 'var(--ink-muted)' }}>{lang === 'ka' ? 'ქარის გამძლეობა:' : 'Wind-Load:'}</span><br /><strong>{activeProject.specs.windRating}</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                  {lang === 'ka' ? 'დამზადების დრო:' : 'Turnaround:'} {activeProject.specs.turnaround}
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
