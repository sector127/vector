import React from 'react';
import { getTranslation } from '../i18n/translations';

export default function Machinery({ lang }) {
  const t = getTranslation(lang);
  const machines = t.machineryList || [];

  return (
    <section className="section-block" id="machinery">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-editorial">
          <div className="editorial-tag">{t.machineryTag}</div>
          <div>
            <h2 className="editorial-headline">
              {t.machineryTitle}
            </h2>
            <p className="editorial-sub">
              {t.machinerySub}
            </p>
          </div>
        </div>

        {/* Machinery Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {machines.map((m) => (
            <div key={m.num} className="hairline-box" data-cursor-text={m.name.split(' ')[0]}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink-muted)', marginBottom: '12px' }}>
                {m.num} / {t.machineryToolingLabel}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                {m.name}
              </h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-primary)', fontWeight: '700', marginBottom: '12px' }}>
                ● {m.role}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', lineHeight: '1.5' }}>
                {m.specs}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
