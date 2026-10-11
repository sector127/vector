import React, { useState, useEffect, useRef } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Send, X } from 'lucide-react';
import { translations, getTranslation, formatTransferredNotes, formatWaMessage } from '../i18n/translations';
import { sendInquiryNotification } from '../services/telegram';
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_NUMBER, EMAIL } from '../config/contact';

// An untouched city field holds some language's default — show it in the current language instead
const DEFAULT_CITIES = Object.values(translations).map(l => l.defaultCity);

export default function SpecInquiry({ lang, transferredSpec, onShowToast }) {
  const t = getTranslation(lang);

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
      city: t.defaultCity,
      medium: 'letters',
      notes: ''
    };
  });
  const fileInputRef = useRef(null);
  const localizedForm = DEFAULT_CITIES.includes(formData.city) ? { ...formData, city: t.defaultCity } : formData;
  const [attachedFile, setAttachedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state cleanly when transferredSpec changes
  useEffect(() => {
    if (!transferredSpec) return;

    const timer = setTimeout(() => {
      setFormData(prev => {
        const updated = {
          ...prev,
          medium: transferredSpec.productType || prev.medium,
          notes: formatTransferredNotes(lang, transferredSpec)
        };
        try {
          localStorage.setItem('vector_hub_inquiry_draft', JSON.stringify(updated));
        } catch {
          // ignore storage error
        }
        return updated;
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [transferredSpec, lang]);

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
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Must match MAX_FILE_BASE64_LENGTH in api/inquiry.js (Vercel 4.5 MB body cap)
    const MAX_SIZE_MB = 3;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onShowToast(`⚠️ ${t.fileTooLarge}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fileInfo = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        base64: reader.result
      };
      setAttachedFile(fileInfo);
      onShowToast(t('toastFileAttached', { name: file.name }));
    };
    reader.onerror = () => {
      onShowToast('⚠️ ფაილის წაკითხვა ვერ მოხერხდა.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearFile = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...localizedForm,
        fileAttached: attachedFile ? attachedFile.name : null,
        fileName: attachedFile ? attachedFile.name : null,
        fileType: attachedFile ? attachedFile.type : null,
        fileData: attachedFile ? attachedFile.base64 : null
      };

      const result = await sendInquiryNotification(payload);

      if (result.success) {
        if (result.simulated) {
          onShowToast(t.toastOrderSimulated);
        } else {
          onShowToast(t.telegramSuccess || '⚡ შეკვეთა გადაეცა Vector Hub-ის საინჟინრო განყოფილებას თბილისში.');
        }

        const resetForm = {
          name: '',
          company: '',
          email: '',
          phone: '',
          city: t.defaultCity,
          medium: 'letters',
          notes: ''
        };
        setFormData(resetForm);
        setAttachedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        try {
          localStorage.removeItem('vector_hub_inquiry_draft');
        } catch {
          // ignore
        }
      } else {
        // Keep the draft intact so the client can resend or switch to WhatsApp without retyping
        onShowToast(result.code === 'file_too_large' ? `⚠️ ${t.fileTooLarge}` : t.telegramError);
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      onShowToast(t.telegramError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSend = () => {
    const message = formatWaMessage(lang, localizedForm);

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    onShowToast(t.toastWaOpened);
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
            {/* Honeypot — invisible to people, bots fill it and the API discards the request */}
            <input
              type="text"
              name="website"
              className="form-honeypot"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={formData.website || ''}
              onChange={handleChange}
            />
            <div className="form-row-2">
              <div className="form-group-block">
                <label className="form-label-mono" htmlFor="inquiry-name">{t.formName}</label>
                <input
                  id="inquiry-name"
                  type="text"
                  name="name"
                  className="swiss-input"
                  required
                  placeholder={t.placeholderName}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-block">
                <label className="form-label-mono" htmlFor="inquiry-company">{t.formCompany}</label>
                <input
                  id="inquiry-company"
                  type="text"
                  name="company"
                  className="swiss-input"
                  required
                  placeholder={t.placeholderCompany}
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group-block">
                <label className="form-label-mono" htmlFor="inquiry-email">{t.formEmail}</label>
                <input
                  id="inquiry-email"
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
                <label className="form-label-mono" htmlFor="inquiry-phone">{t.formPhone}</label>
                <input
                  id="inquiry-phone"
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

            <div className="form-row-2">
              <div className="form-group-block">
                <label className="form-label-mono" htmlFor="inquiry-medium">{t.formMedium}</label>
                <select
                  id="inquiry-medium"
                  name="medium"
                  className="swiss-input"
                  value={formData.medium}
                  onChange={handleChange}
                >
                  <option value="letters">{t.d1Title}</option>
                  <option value="lightbox">{t.d2Title}</option>
                  <option value="billboard">{t.d4Title}</option>
                  <option value="print">{t.d3Title}</option>
                  <option value="turnkey">{t.optionTurnkey}</option>
                </select>
              </div>

              <div className="form-group-block">
                <label className="form-label-mono" htmlFor="inquiry-city">{t.formCity}</label>
                <input
                  id="inquiry-city"
                  type="text"
                  name="city"
                  className="swiss-input"
                  required
                  placeholder={t.placeholderCity}
                  value={localizedForm.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Vector Blueprint File Attachment */}
            <div className="form-group-block">
              <label className="form-label-mono" htmlFor="inquiry-file-upload">{t.formFiles}</label>
              <label className="file-dropzone-minimal" data-cursor-text="UPLOAD FILE" htmlFor="inquiry-file-upload">
                <input
                  id="inquiry-file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".ai,.dxf,.pdf,.eps,.dwg,.png,.jpg,.jpeg,.svg,.zip"
                  hidden
                  onChange={handleFileUpload}
                />
                {attachedFile ? (
                  <div className="file-attached-pill">
                    <span className="file-attached-name">
                      {t.fileAttachedBadge} {attachedFile.name} ({(attachedFile.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                      type="button"
                      className="file-clear-btn"
                      onClick={handleClearFile}
                      title={t.removeFileBtn || 'Remove file'}
                      data-cursor-text="REMOVE"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <span>{t.dropzoneText}<span className="dropzone-span">{t.dropzoneBrowse}</span></span>
                )}
              </label>
            </div>

            <div className="form-group-block">
              <label className="form-label-mono" htmlFor="inquiry-notes">{t.formNotes}</label>
              <textarea
                id="inquiry-notes"
                name="notes"
                rows="4"
                className="swiss-input"
                placeholder={t.placeholderNotes}
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Dual CTA: Official CAD Dispatch + Direct Instant WhatsApp */}
            <div className="form-cta-row">
              <button
                type="submit"
                className="btn-swiss btn-swiss-solid"
                disabled={isSubmitting}
                data-cursor-text="SEND SPEC"
              >
                <Send size={15} />
                <span>{isSubmitting ? t.submittingBtn : t.submitBtn}</span>
              </button>

              <button
                type="button"
                className="btn-swiss whatsapp-cta-btn"
                onClick={handleWhatsAppSend}
                data-cursor-text="WHATSAPP"
              >
                <MessageSquare size={15} />
                <span>{t.whatsappBtn}</span>
              </button>
            </div>
          </form>

          {/* Right: Direct Studio Desk & Tbilisi Hub */}
          <div className="desk-column">
            <div className="hairline-box">
              <div className="desk-eyebrow">
                {t.directCommTitle}
              </div>
              <h3 className="desk-title">
                {t.deskTitle}
              </h3>
              <p className="desk-desc">
                {t.deskDesc}
              </p>

              <div className="desk-contacts">
                <div className="desk-contact-row">
                  <Phone size={16} />
                  <span>{t.hotlineLbl}: <a href={`tel:${PHONE_TEL}`} className="desk-link">{PHONE_DISPLAY}</a></span>
                </div>
                <div className="desk-contact-row">
                  <MessageSquare size={16} />
                  <span>{t.whatsappLbl}: <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="desk-link">{PHONE_DISPLAY}</a></span>
                </div>
                <div className="desk-contact-row">
                  <Mail size={16} />
                  <span>{t.emailLbl}: <a href={`mailto:${EMAIL}`} className="desk-link">{EMAIL}</a></span>
                </div>
              </div>
            </div>

            <div className="hairline-box desk-address-box">
              <div className="desk-address-label">
                {t.addressLbl}
              </div>
              <div className="desk-address">
                <MapPin size={18} className="desk-address-icon" />
                <span>
                  <strong>VECTOR HUB GEORGIA</strong><br />
                  {t.addressVal}
                </span>
              </div>
              <div className="desk-hours">
                {t.hoursVal}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
