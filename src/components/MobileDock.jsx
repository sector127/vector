import React from 'react';
import { Phone, MessageSquare, Cpu, ArrowUpRight } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

export default function MobileDock({ lang }) {
  const t = getTranslation(lang);

  return (
    <div className="mobile-dock-wrapper" aria-label="Quick action dock">
      <div className="mobile-dock-inner">
        {/* Hotline Call */}
        <a 
          href="tel:+995322008080" 
          className="mobile-dock-item"
          data-cursor-text="CALL"
        >
          <Phone size={15} />
          <span>{t.dockCall}</span>
        </a>

        {/* Direct WhatsApp */}
        <a 
          href="https://wa.me/995599808080" 
          target="_blank" 
          rel="noreferrer" 
          className="mobile-dock-item highlight-wa"
          data-cursor-text="WHATSAPP"
        >
          <MessageSquare size={15} />
          <span>{t.dockWhatsApp}</span>
        </a>

        {/* Jump to CAD Workbench */}
        <a 
          href="#workbench" 
          className="mobile-dock-item"
          data-cursor-text="STUDIO"
        >
          <Cpu size={15} />
          <span>{t.dockStudio}</span>
        </a>

        {/* Jump to Inquiry Form */}
        <a 
          href="#inquiry" 
          className="mobile-dock-item dock-item-cta"
          data-cursor-text="QUOTE"
        >
          <span>{t.dockQuote}</span>
          <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}
