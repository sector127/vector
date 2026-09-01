import React from 'react';
import { translations } from '../i18n/translations';

export default function Footer({ lang }) {
  const t = translations[lang] || translations.ka;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="swiss-footer">
      <div className="container">
        <div className="footer-main-row">
          {/* Brand Info */}
          <div>
            <h2 className="footer-huge-title">VECTOR HUB.</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-secondary)', lineHeight: '1.6', maxWidth: '300px' }}>
              {t.footerDesc}
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <div className="footer-col-head">{t.navDisciplines}</div>
            <div className="footer-list">
              <a href="#disciplines" data-cursor-text="LETTERS">{t.d1Title}</a>
              <a href="#disciplines" data-cursor-text="LIGHTBOXES">{t.d2Title}</a>
              <a href="#disciplines" data-cursor-text="MEGABOARDS">{t.d4Title}</a>
              <a href="#disciplines" data-cursor-text="PRINT">{t.d3Title}</a>
              <a href="#disciplines" data-cursor-text="RIGGING">{t.d5Title}</a>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <div className="footer-col-head">{t.footerNavTitle}</div>
            <div className="footer-list">
              <a href="#workbench" data-cursor-text="STUDIO">{t.navStudio}</a>
              <a href="#tbilisi-network" data-cursor-text="NETWORK">{t.navMedia}</a>
              <a href="#archive" data-cursor-text="ARCHIVE">{t.navArchive}</a>
              <a href="#machinery" data-cursor-text="FACILITY">{t.navFacility}</a>
              <a href="#inquiry" data-cursor-text="INQUIRE">{t.inquireBtn}</a>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <div className="footer-col-head">{t.footerDeskTitle}</div>
            <div className="footer-list">
              <span>+995 32 200 80 80</span>
              <span>desk@vectorhub.ge</span>
              <span>{lang === 'ka' ? 'წერეთლის გამზ. 88, თბილისი' : lang === 'ru' ? 'пр. Церетели 88, Тбилиси' : 'Tsereteli Ave 88, Tbilisi'}</span>
              <button 
                onClick={scrollToTop} 
                style={{ textAlign: 'left', marginTop: '12px', fontFamily: 'var(--font-mono)', fontWeight: '700', textDecoration: 'underline' }}
                data-cursor-text="TOP"
              >
                {lang === 'ka' ? '↑ გვერდის დასაწყისი' : lang === 'ru' ? '↑ В начало страницы' : '↑ Top of Page'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="footer-bottom-line">
          <div>
            © {new Date().getFullYear()} VECTOR HUB LLC — TBILISI, GEORGIA. {t.rights}
          </div>
          <div>
            {t.cert}
          </div>
        </div>
      </div>
    </footer>
  );
}
