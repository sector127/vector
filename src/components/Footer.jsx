import React from 'react';
import { getTranslation } from '../i18n/translations';
import { PHONE_DISPLAY, PHONE_TEL, EMAIL } from '../config/contact';

export default function Footer({ lang }) {
  const t = getTranslation(lang);

  const scrollToTop = () => {
    // 'auto' defers to the CSS scroll-behavior, which honours prefers-reduced-motion
    window.scrollTo({ top: 0 });
  };

  return (
    <footer className="swiss-footer">
      <div className="container">
        <div className="footer-main-row">
          {/* Brand Info */}
          <div>
            <h2 className="footer-huge-title">VECTOR HUB.</h2>
            <p className="footer-desc">
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
              <a href="#mockup-studio" data-cursor-text="VISUALIZER">{t.navMockup}</a>
              <a href="#archive" data-cursor-text="ARCHIVE">{t.navArchive}</a>
              <a href="#machinery" data-cursor-text="FACILITY">{t.navFacility}</a>
              <a href="#inquiry" data-cursor-text="INQUIRE">{t.inquireBtn}</a>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <div className="footer-col-head">{t.footerDeskTitle}</div>
            <div className="footer-list">
              <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <span>{t.addressValShort}</span>
              <button 
                onClick={scrollToTop} 
                className="footer-top-btn"
                data-cursor-text="TOP"
              >
                {t.backToTop}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="footer-bottom-line">
          <div>
            © {new Date().getFullYear()} {t.companyLegal} — {t.companyCity}. {t.rights}
          </div>
        </div>
      </div>
    </footer>
  );
}
