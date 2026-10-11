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
        <div className="machinery-grid">
          {machines.map((m) => (
            <div key={m.num} className="hairline-box" data-cursor-text={m.name.split(' ')[0]}>
              <div className="machine-num">
                {m.num} / {t.machineryToolingLabel}
              </div>
              <h3 className="machine-name">
                {m.name}
              </h3>
              <div className="machine-role">
                ● {m.role}
              </div>
              <p className="machine-specs">
                {m.specs}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
