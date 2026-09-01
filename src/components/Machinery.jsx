import React from 'react';
import { translations } from '../i18n/translations';

export default function Machinery({ lang }) {
  const t = translations[lang] || translations.ka;

  const machines = [
    {
      num: '01',
      name: lang === 'ka' ? '6kW ინდუსტრიული ბოჭკოვანი ლაზერი' : lang === 'ru' ? 'Промышленный оптоволоконный лазер 6 кВт' : '6kW Industrial Fiber Laser Cutter',
      role: lang === 'ka' ? 'თითბერისა და ფოლადის მაღალი სიზუსტის ჭრა' : lang === 'ru' ? 'Высокоточный раскрой латуни и стали' : 'Heavy Metal & Brass Contouring',
      specs: lang === 'ka' ? '0.02 მმ სიზუსტე • ჭრის 25 მმ-მდე უჟანგავ ფოლადსა და მასიურ თითბერს' : lang === 'ru' ? 'Точность 0.02 мм • Раскрой нержавеющей стали и массивной латуни до 25 мм' : '0.02mm Tolerance • Cuts up to 25mm Stainless Steel & Solid Brass'
    },
    {
      num: '02',
      name: lang === 'ka' ? '5-ღერძიანი მძიმე CNC ფრეზი' : lang === 'ru' ? '5-осевой тяжелый фрезерный центр с ЧПУ' : '5-Axis Heavy CNC Milling Center',
      role: lang === 'ka' ? '3D მოცულობითი დამუშავება და აკრილი' : lang === 'ru' ? '3D скульптурная обработка и акрил' : '3D Subtractive Sculpting & Acrylics',
      specs: lang === 'ka' ? '3000 მმ × 2000 მმ სამუშაო მაგიდა • ოპტიკური კიდეების პოლირება' : lang === 'ru' ? 'Рабочий стол 3000 мм × 2000 мм • Высокоскоростная оптическая полировка кромок' : '3000mm × 2000mm Bed • High-Speed Optical Edge Polishing'
    },
    {
      num: '03',
      name: lang === 'ka' ? 'ავტომატური AccuBend ასოების მოსახრევი' : lang === 'ru' ? 'Автоматический трубогиб AccuBend для букв' : 'Automatic AccuBend Channel Bender',
      role: lang === 'ka' ? '3D ასოების გვერდების ზუსტი მოხრა' : lang === 'ru' ? 'Прецизионная гибка бортов 3D-букв' : 'Precision 3D Letter Return Bending',
      specs: lang === 'ka' ? 'ავტომატური ნაჭდევები • უნაკერო 90° და ბეზიეს რადიუსები' : lang === 'ru' ? 'Автоматическая отбортовка и пазы • Бесшовные углы 90° и радиусы Безье' : 'Flange & Notch Vector Forming • Seamless 90° & Bezier Radii'
    },
    {
      num: '04',
      name: lang === 'ka' ? 'შვეიცარიული UV Flatbed პრინტერი' : lang === 'ru' ? 'Швейцарский планшетный и рулонный УФ-принтер' : 'Swiss UV Flatbed & Roll-to-Roll Printer',
      role: lang === 'ka' ? 'დიდი ფორმატის პირდაპირი ბეჭდვა' : lang === 'ru' ? 'Широкоформатная прямая печать' : 'Large Format & Direct Substrate Print',
      specs: lang === 'ka' ? '1200 DPI მაღალი სიმკვრივის თეთრი და ლაქი • 3.2 მ სიგანე' : lang === 'ru' ? '1200 DPI высокая плотность белого и лака • Ширина печати 3.2 м' : '1200 DPI High-Density White & Varnish Ink • 3.2m Width'
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
                {m.num} / {lang === 'ka' ? 'დანადგარი' : lang === 'ru' ? 'ОБОРУДОВАНИЕ' : 'TOOLING'}
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
