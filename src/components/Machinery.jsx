import React from 'react';
import { translations } from '../i18n/translations';

export default function Machinery({ lang }) {
  const t = translations[lang] || translations.ka;

  const machines = [
    {
      num: '01',
      name: lang === 'ka' ? '6kW ინდუსტრიული ბოჭკოვანი ლაზერი' : '6kW Industrial Fiber Laser Cutter',
      role: lang === 'ka' ? 'თითბერისა და ფოლადის მაღალი სიზუსტის ჭრა' : 'Heavy Metal & Brass Contouring',
      specs: lang === 'ka' ? '0.02მმ სიზუსტე • ჭრის 25მმ-მდე უჟანგავ ფოლადსა და მასიურ თითბერს' : '0.02mm Tolerance • Cuts up to 25mm Stainless Steel & Solid Brass'
    },
    {
      num: '02',
      name: lang === 'ka' ? '5-ღერძიანი მძიმე CNC ფრეზი' : '5-Axis Heavy CNC Milling Center',
      role: lang === 'ka' ? '3D მოცულობითი დამუშავება და აკრილი' : '3D Subtractive Sculpting & Acrylics',
      specs: lang === 'ka' ? '3000მმ × 2000მმ სამუშაო მაგიდა • ოპტიკური კიდეების პოლირება' : '3000mm × 2000mm Bed • High-Speed Optical Edge Polishing'
    },
    {
      num: '03',
      name: lang === 'ka' ? 'ავტომატური AccuBend ასოების მოსახრევი' : 'Automatic AccuBend Channel Bender',
      role: lang === 'ka' ? '3D ასოების გვერდების ზუსტი მოხრა' : 'Precision 3D Letter Return Bending',
      specs: lang === 'ka' ? 'ავტომატური ნაჭდევები • უნაკერო 90° და ბეზიეს რადიუსები' : 'Flange & Notch Vector Forming • Seamless 90° & Bezier Radii'
    },
    {
      num: '04',
      name: lang === 'ka' ? 'შვეიცარიული UV Flatbed პრინტერი' : 'Swiss UV Flatbed & Roll-to-Roll Printer',
      role: lang === 'ka' ? 'დიდი ფორმატის პირდაპირი ბეჭდვა' : 'Large Format & Direct Substrate Print',
      specs: lang === 'ka' ? '1200 DPI მაღალი სიმკვრივის თეთრი და ლაქი • 3.2მ სიგანე' : '1200 DPI High-Density White & Varnish Ink • 3.2m Width'
    }
  ];

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
                {m.num} / {lang === 'ka' ? 'დანადგარი' : 'TOOLING'}
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
