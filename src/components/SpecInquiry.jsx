import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Send } from 'lucide-react';
import { translations } from '../i18n/translations';
import { sendInquiryNotification } from '../services/telegram';

export default function SpecInquiry({ lang, transferredSpec, onShowToast }) {
  const t = translations[lang] || translations.ka;

  const [formData, setFormData] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('vector_hub_inquiry_draft') : null;
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore JSON parse error
    }
    return {
      name: '',
      company: '',
      email: '',
      phone: '',
      city: lang === 'ka' ? 'თბილისი, საქართველო' : lang === 'ru' ? 'Тбилиси, Грузия' : 'Tbilisi, Georgia',
      medium: 'letters',
      notes: ''
    };
  });
  const [fileAttached, setFileAttached] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevSpec, setPrevSpec] = useState(transferredSpec);

  // Sync state when transferredSpec changes without triggering cascading effect renders
  if (transferredSpec && transferredSpec !== prevSpec) {
    setPrevSpec(transferredSpec);
    setFormData(prev => {
      const updated = {
        ...prev,
        medium: transferredSpec.productType,
        notes: lang === 'ka' 
          ? `ვექტორ სტუდიიდან გადმოტანილი პარამეტრები:\n• რეჟიმი: ${transferredSpec.inputMode === 'svg' ? 'მორგებული SVG ვექტორი' : 'ტექსტური წარწერა'}\n• ობიექტი: "${transferredSpec.brandText}"\n• ზომები: ${transferredSpec.dimensions}\n• ჭრის პერიმეტრი (Toolpath): ${transferredSpec.toolpathMm ? transferredSpec.toolpathMm.toLocaleString() + ' მმ' : 'ავტომატური'}\n• კონტურები: ${transferredSpec.contourCount || 1}\n• მასალა: ${transferredSpec.material}\n• განათება: ${transferredSpec.lighting}\n• გამოთვლილი ბიუჯეტი: ${transferredSpec.estimate}\n• დამზადების ვადა: ${transferredSpec.turnaround}`
          : lang === 'ru'
            ? `Перенесено из Vector Studio:\n• Режим: ${transferredSpec.inputMode === 'svg' ? 'Пользовательский SVG вектор' : 'Текстовая вывеска'}\n• Объект: "${transferredSpec.brandText}"\n• Размеры: ${transferredSpec.dimensions}\n• Периметр реза (Toolpath): ${transferredSpec.toolpathMm ? transferredSpec.toolpathMm.toLocaleString() + ' мм' : 'авто'}\n• Контуры: ${transferredSpec.contourCount || 1}\n• Материал: ${transferredSpec.material}\n• Подсветка: ${transferredSpec.lighting}\n• Расчетный бюджет: ${transferredSpec.estimate}\n• Срок производства: ${transferredSpec.turnaround}`
            : `Transferred from Vector Studio:\n• Mode: ${transferredSpec.inputMode === 'svg' ? 'Custom SVG Vector' : 'Typography Text'}\n• Object: "${transferredSpec.brandText}"\n• Scale: ${transferredSpec.dimensions}\n• Cutting Toolpath: ${transferredSpec.toolpathMm ? transferredSpec.toolpathMm.toLocaleString() + ' mm' : 'auto'}\n• Contours: ${transferredSpec.contourCount || 1}\n• Material: ${transferredSpec.material}\n• Illumination: ${transferredSpec.lighting}\n• Calculated Budget: ${transferredSpec.estimate}\n• Estimated Turnaround: ${transferredSpec.turnaround}`
      };
      try {
        localStorage.setItem('vector_hub_inquiry_draft', JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
      return updated;
    });
  }

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    try {
      localStorage.setItem('vector_hub_inquiry_draft', JSON.stringify(updated));
    } catch {
      // ignore storage error
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAttached(file.name);
      onShowToast(lang === 'ka' ? `✓ ფაილი მიმაგრებულია: ${file.name}` : lang === 'ru' ? `✓ Файл прикреплен: ${file.name}` : `✓ Attached: ${file.name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        fileAttached
      };

      const result = await sendInquiryNotification(payload);

      if (result.success) {
        onShowToast(t.telegramSuccess || '⚡ შეკვეთა გადაეცა Vector Hub-ის საინჟინრო განყოფილებას თბილისში.');
        const resetForm = {
          name: '',
          company: '',
          email: '',
          phone: '',
          city: lang === 'ka' ? 'თბილისი, საქართველო' : lang === 'ru' ? 'Тбилиси, Грузия' : 'Tbilisi, Georgia',
          medium: 'letters',
          notes: ''
        };
        setFormData(resetForm);
        setFileAttached(null);
        try {
          localStorage.removeItem('vector_hub_inquiry_draft');
        } catch {
          // ignore
        }
      } else {
        onShowToast(`⚠️ ${result.error || t.telegramError || 'შეტყობინების გაგზავნა ვერ მოხერხდა.'}`);
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      onShowToast(`⚠️ ${err.message || t.telegramError || 'შეტყობინების გაგზავნა ვერ მოხერხდა.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSend = () => {
    const message = 
      lang === 'ka'
        ? `*VECTOR HUB GEORGIA — შეკვეთის სპეციფიკაცია*\n` +
          `----------------------------------------\n` +
          `👤 *კონტაქტი*: ${formData.name || 'N/A'}\n` +
          `🏢 *კომპანია*: ${formData.company || 'N/A'}\n` +
          `📱 *ტელეფონი*: ${formData.phone || 'N/A'}\n` +
          `✉️ *ელ-ფოსტა*: ${formData.email || 'N/A'}\n` +
          `📍 *ლოკაცია*: ${formData.city || 'თბილისი'}\n` +
          `🛠 *მიმართულება*: ${formData.medium.toUpperCase()}\n\n` +
          `📝 *CAD პარამეტრები და შენიშვნები:*\n${formData.notes || 'შენიშვნების გარეშე'}\n` +
          `----------------------------------------\n` +
          `გაგზავნილია Vector Hub-ის პლატფორმიდან`
        : lang === 'ru'
          ? `*VECTOR HUB GEORGIA — СПЕЦИФИКАЦИЯ ЗАКАЗА*\n` +
            `----------------------------------------\n` +
            `👤 *Контакт*: ${formData.name || 'N/A'}\n` +
            `🏢 *Компания*: ${formData.company || 'N/A'}\n` +
            `📱 *Телефон*: ${formData.phone || 'N/A'}\n` +
            `✉️ *Email*: ${formData.email || 'N/A'}\n` +
            `📍 *Локация*: ${formData.city || 'Тбилиси'}\n` +
            `🛠 *Направление*: ${formData.medium.toUpperCase()}\n\n` +
            `📝 *Параметры CAD и детали:*\n${formData.notes || 'Без дополнительных пометок'}\n` +
            `----------------------------------------\n` +
            `Отправлено через платформу Vector Hub`
          : `*VECTOR HUB GEORGIA — SPECIFICATION INQUIRY*\n` +
            `----------------------------------------\n` +
            `👤 *Contact*: ${formData.name || 'N/A'}\n` +
            `🏢 *Company*: ${formData.company || 'N/A'}\n` +
            `📱 *Phone*: ${formData.phone || 'N/A'}\n` +
            `✉️ *Email*: ${formData.email || 'N/A'}\n` +
            `📍 *Location*: ${formData.city || 'Tbilisi'}\n` +
            `🛠 *Discipline*: ${formData.medium.toUpperCase()}\n\n` +
            `📝 *CAD Notes & Parameters:*\n${formData.notes || 'No extra notes specified'}\n` +
            `----------------------------------------\n` +
            `Sent via Vector Hub Precision Platform`;

    window.open(`https://wa.me/995599808080?text=${encodeURIComponent(message)}`, '_blank');
    onShowToast(lang === 'ka' ? '💬 WhatsApp დიალოგი გაიხსნა Vector Hub-ის ინჟინერთან' : lang === 'ru' ? '💬 Открыт диалог в WhatsApp с инженером Vector Hub' : '💬 WhatsApp conversation opened with Vector Hub desk');
  };

  return (
    <section className="section-block" id="inquiry">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-editorial">
          <div className="editorial-tag">{t.inquiryTag}</div>
          <div>
            <h2 className="editorial-headline">
              {t.inquiryTitle}
            </h2>
            <p className="editorial-sub">
              {t.inquirySub}
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="inquiry-grid">
          {/* Left: Swiss Inquiry Form */}
          <form className="inquiry-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group-block">
                <label className="form-label-mono">{t.formName}</label>
                <input 
                  type="text" 
                  name="name" 
                  className="swiss-input" 
                  required 
                  placeholder={lang === 'ka' ? 'მაგ. გიორგი ბერიძე' : lang === 'ru' ? 'напр. Александр Иванов' : 'e.g. Alex Morgan'} 
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-block">
                <label className="form-label-mono">{t.formCompany}</label>
                <input 
                  type="text" 
                  name="company" 
                  className="swiss-input" 
                  required 
                  placeholder={lang === 'ka' ? 'მაგ. ნექსუს ჯორჯია' : lang === 'ru' ? 'напр. Нексус Групп' : 'e.g. Nexus Global'} 
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group-block">
                <label className="form-label-mono">{t.formEmail}</label>
                <input 
                  type="email" 
                  name="email" 
                  className="swiss-input" 
                  required 
                  placeholder="info@company.ge" 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-block">
                <label className="form-label-mono">{t.formPhone}</label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="swiss-input" 
                  required 
                  placeholder="+995 599 00 00 00" 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group-block">
                <label className="form-label-mono">{t.formMedium}</label>
                <select 
                  name="medium" 
                  className="swiss-input" 
                  value={formData.medium} 
                  onChange={handleChange}
                >
                  <option value="letters">{t.d1Title}</option>
                  <option value="lightbox">{t.d2Title}</option>
                  <option value="billboard">{t.d4Title}</option>
                  <option value="print">{t.d3Title}</option>
                  <option value="turnkey">{lang === 'ka' ? 'სრული სარეკლამო პაკეტი (გარე + ბეჭდვა)' : lang === 'ru' ? 'Полный рекламный пакет (наружная реклама + полиграфия)' : 'Full Turnkey Advertising Package'}</option>
                </select>
              </div>

              <div className="form-group-block">
                <label className="form-label-mono">{t.formCity}</label>
                <input 
                  type="text" 
                  name="city" 
                  className="swiss-input" 
                  required 
                  placeholder={lang === 'ka' ? 'მაგ. თბილისი, ბათუმი, ქუთაისი...' : lang === 'ru' ? 'напр. Тбилиси, Батуми, Кутаиси...' : 'e.g. Tbilisi, Batumi, International'} 
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Vector Blueprint File Attachment */}
            <div className="form-group-block">
              <label className="form-label-mono">{t.formFiles}</label>
              <label className="file-dropzone-minimal" data-cursor-text="UPLOAD FILE">
                <input 
                  type="file" 
                  accept=".ai,.dxf,.pdf,.eps,.dwg,.png,.jpg" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                />
                {fileAttached ? (
                  <span style={{ fontWeight: '700' }}>✓ {lang === 'ka' ? 'მიმაგრებულია:' : lang === 'ru' ? 'Прикрепленный файл:' : 'Attached File:'} {fileAttached}</span>
                ) : (
                  <span>{t.dropzoneText}<span className="dropzone-span">{t.dropzoneBrowse}</span></span>
                )}
              </label>
            </div>

            <div className="form-group-block">
              <label className="form-label-mono">{t.formNotes}</label>
              <textarea 
                name="notes" 
                rows="4" 
                className="swiss-input" 
                placeholder={lang === 'ka' ? 'მიუთითეთ ზომები, განათების ტემპერატურა (3000K/6500K), სამონტაჟო სიმაღლე ან სასწრაფო ვადები...' : lang === 'ru' ? 'Укажите размеры, температуру подсветки (3000K/6500K), высоту монтажа или срочные сроки...' : 'Include custom dimensions, lighting kelvins, installation heights, or urgent deadlines...'}
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Dual CTA: Official CAD Dispatch + Direct Instant WhatsApp */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <button 
                type="submit" 
                className="btn-swiss btn-swiss-solid" 
                style={{ padding: '16px' }}
                disabled={isSubmitting}
                data-cursor-text="SEND SPEC"
              >
                <Send size={15} />
                <span>{isSubmitting ? t.submittingBtn : t.submitBtn}</span>
              </button>

              <button 
                type="button" 
                className="btn-swiss whatsapp-cta-btn" 
                style={{ padding: '16px' }}
                onClick={handleWhatsAppSend}
                data-cursor-text="WHATSAPP"
              >
                <MessageSquare size={15} />
                <span>{t.whatsappBtn}</span>
              </button>
            </div>
          </form>

          {/* Right: Direct Studio Desk & Tbilisi Hub */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="hairline-box">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink-muted)', marginBottom: '10px' }}>
                {lang === 'ka' ? 'პირდაპირი კომუნიკაცია' : lang === 'ru' ? 'ПРЯМАЯ СВЯЗЬ' : 'DIRECT COMMUNICATIONS'}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '14px' }}>
                {t.deskTitle}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                {t.deskDesc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone size={16} />
                  <span>{t.hotlineLbl}: <strong>+995 32 200 80 80</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MessageSquare size={16} />
                  <span>{t.whatsappLbl}: <a href="https://wa.me/995599808080" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>+995 599 80 80 80</a></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={16} />
                  <span>{t.emailLbl}: <strong>desk@vectorhub.ge</strong></span>
                </div>
              </div>
            </div>

            <div className="hairline-box" style={{ background: 'var(--bg-subtle)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px' }}>
                {t.addressLbl}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.9rem', color: 'var(--ink-secondary)', lineHeight: '1.5' }}>
                <MapPin size={18} style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>
                  <strong>VECTOR HUB GEORGIA</strong><br />
                  {t.addressVal}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--ink-hairline)', marginTop: '16px', paddingTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                {t.hoursVal}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
