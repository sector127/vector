import React, { useState } from 'react';
import { translations } from '../i18n/translations';

export default function TbilisiNetwork({ lang }) {
  const t = translations[lang] || translations.ka;
  const [activeLoc, setActiveLoc] = useState(1);

  const locations = [
    {
      id: 1,
      name: t.loc1Name,
      district: t.loc1Dist,
      type: t.loc1Type,
      traffic: t.loc1Traffic,
      specs: t.loc1Specs,
      status: lang === 'ka' ? 'მაღალი გამტარობა • აქტიური' : lang === 'ru' ? 'Высокий трафик • Активен' : 'High-Density Active Hub',
      mapPos: { x: 140, y: 180 }
    },
    {
      id: 2,
      name: t.loc2Name,
      district: t.loc2Dist,
      type: t.loc2Type,
      traffic: t.loc2Traffic,
      specs: t.loc2Specs,
      status: lang === 'ka' ? '100% LED ქსელი აქტიურია' : lang === 'ru' ? '100% LED сеть активна' : '100% LED Network Live',
      mapPos: { x: 180, y: 130 }
    },
    {
      id: 3,
      name: t.loc3Name,
      district: t.loc3Dist,
      type: t.loc3Type,
      traffic: t.loc3Traffic,
      specs: t.loc3Specs,
      status: lang === 'ka' ? 'ცენტრალური ზონა' : lang === 'ru' ? 'Центральная зона' : 'Prime Architectural Zone',
      mapPos: { x: 260, y: 220 }
    },
    {
      id: 4,
      name: t.loc4Name,
      district: t.loc4Dist,
      type: t.loc4Type,
      traffic: t.loc4Traffic,
      specs: t.loc4Specs,
      status: lang === 'ka' ? 'ქალაქის მთავარი კვანძი' : lang === 'ru' ? 'Главный транспортный узел' : 'Dominant Urban Landmark',
      mapPos: { x: 210, y: 170 }
    },
    {
      id: 5,
      name: t.loc5Name,
      district: t.loc5Dist,
      type: t.loc5Type,
      traffic: t.loc5Traffic,
      specs: t.loc5Specs,
      status: lang === 'ka' ? 'ქარის სერტიფიკატი (180 კმ/სთ)' : lang === 'ru' ? 'Ветроустойчивость (180 км/ч)' : 'Gale Wind Certified (180 km/h)',
      mapPos: { x: 390, y: 250 }
    },
    {
      id: 6,
      name: t.loc6Name,
      district: t.loc6Dist,
      type: t.loc6Type,
      traffic: t.loc6Traffic,
      specs: t.loc6Specs,
      status: lang === 'ka' ? 'რეგიონული დაფარვა' : lang === 'ru' ? 'Региональный охват' : 'Regional Arterial Reach',
      mapPos: { x: 100, y: 80 }
    }
  ];

  const current = locations.find(l => l.id === activeLoc) || locations[0];

  return (
    <section className="section-block" id="tbilisi-network">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-editorial">
          <div className="editorial-tag">{t.networkTag}</div>
          <div>
            <h2 className="editorial-headline">
              {t.networkTitle}
            </h2>
            <p className="editorial-sub">
              {t.networkSub}
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="tbilisi-grid-layout">
          {/* Left: Vector Map of Tbilisi */}
          <div className="tbilisi-map-svg-card">
            <svg viewBox="0 0 480 360" style={{ width: '100%', height: '100%' }}>
              {/* Stylized Vector Mtkvari River & Arterial Road Grid */}
              <path 
                d="M 60 40 Q 180 120, 240 180 T 360 280 T 440 330" 
                fill="none" 
                stroke="var(--ink-hairline)" 
                strokeWidth="12" 
              />
              <path 
                d="M 60 40 Q 180 120, 240 180 T 360 280 T 440 330" 
                fill="none" 
                stroke="var(--bg-main)" 
                strokeWidth="8" 
              />
              <text x="320" y="270" fill="var(--ink-muted)" fontSize="9" fontFamily="TG Square, Noto Sans Georgian, Space Mono" transform="rotate(35 320,270)" letterSpacing="0.1em">
                {lang === 'ka' ? 'მდ. მტკვარი' : lang === 'ru' ? 'РЕКА КУРА (МТКВАРИ)' : 'MTKVARI RIVER'}
              </text>

              {/* Major Vector Arterial Highway Lines */}
              <line x1="30" y1="180" x2="440" y2="180" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="180" y1="30" x2="180" y2="330" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="280" y1="30" x2="280" y2="330" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Vector Location Nodes */}
              {locations.map((loc) => {
                const isSelected = loc.id === activeLoc;
                return (
                  <g 
                    key={loc.id} 
                    onClick={() => setActiveLoc(loc.id)} 
                    style={{ cursor: 'pointer' }}
                    data-cursor-text={loc.district.toUpperCase()}
                  >
                    {isSelected && (
                      <circle 
                        cx={loc.mapPos.x} 
                        cy={loc.mapPos.y} 
                        r="18" 
                        fill="none" 
                        stroke="var(--ink-primary)" 
                        strokeWidth="1.2" 
                        strokeDasharray="3 3" 
                      />
                    )}
                    <circle 
                      cx={loc.mapPos.x} 
                      cy={loc.mapPos.y} 
                      r={isSelected ? "7" : "4.5"} 
                      fill={isSelected ? "var(--ink-primary)" : "var(--bg-main)"} 
                      stroke="var(--ink-primary)" 
                      strokeWidth="2" 
                    />
                    <text 
                      x={loc.mapPos.x + 12} 
                      y={loc.mapPos.y + 4} 
                      fill={isSelected ? "var(--ink-primary)" : "var(--ink-muted)"} 
                      fontSize="10" 
                      fontFamily="TG Square, Noto Sans Georgian, Space Mono"
                      fontWeight={isSelected ? "700" : "400"}
                    >
                      {loc.district}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right: Interactive Location Inspector List */}
          <div className="tbilisi-locations-list">
            {locations.map((loc) => (
              <div 
                key={loc.id} 
                className={`location-item ${loc.id === activeLoc ? 'active' : ''}`}
                onClick={() => setActiveLoc(loc.id)}
                data-cursor-text={loc.district.toUpperCase()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '700', color: loc.id === activeLoc ? 'var(--ink-primary)' : 'var(--ink-muted)' }}>
                    0{loc.id}
                  </div>
                  <div>
                    <div className="loc-name">{loc.name}</div>
                    <div className="loc-specs">{loc.type}</div>
                  </div>
                </div>
                <span className="tag-swiss">{loc.status}</span>
              </div>
            ))}

            {/* Detailed Metadata Callout for selected location */}
            <div className="hairline-box" style={{ marginTop: '12px', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: '700' }}>
                  {lang === 'ka' ? 'ლოკაციის მონაცემები:' : lang === 'ru' ? 'Данные локации:' : 'Site Dossier:'} {current.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  {current.district}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', marginBottom: '12px' }}>
                <strong>{lang === 'ka' ? 'ტექნიკური მახასიათებლები:' : lang === 'ru' ? 'Технические характеристики:' : 'Technical Specs:'}</strong> {current.specs}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', borderTop: '1px solid var(--ink-hairline)', paddingTop: '8px' }}>
                <span>{lang === 'ka' ? 'გამტარობა / ტრაფიკი:' : lang === 'ru' ? 'Трафик:' : 'Traffic Flow:'} <strong>{current.traffic}</strong></span>
                <span>✓ {lang === 'ka' ? 'ნებართვა: თბილისის მერია' : lang === 'ru' ? 'Разрешение: Мэрия Тбилиси' : 'Permitted: Tbilisi City Hall'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
