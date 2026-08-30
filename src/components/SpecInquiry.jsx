import React, { useState } from 'react';
import { Send, UploadCloud, CheckCircle2, Phone, MessageSquare, Mail, MapPin } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function SpecInquiry({ lang, transferredSpec, onShowToast }) {
  const t = translations[lang] || translations.ka;

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    city: lang === 'ka' ? 'თბილისი, საქართველო' : 'Tbilisi, Georgia',
    medium: 'letters',
    notes: ''
  });
  const [fileAttached, setFileAttached] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync transferred spec if present
  React.useEffect(() => {
    if (transferredSpec) {
      setFormData(prev => ({
        ...prev,
        medium: transferredSpec.productType,
        notes: lang === 'ka' 
          ? `ვექტორ სტუდიიდან გადმოტანილი პარამეტრები:\n• ობიექტი: "${transferredSpec.brandText}"\n• ზომები: ${transferredSpec.dimensions}\n• მასალა: ${transferredSpec.material}\n• განათება: ${transferredSpec.lighting}\n• გამოთვლილი ბიუჯეტი: ${transferredSpec.estimate}\n• დამზადების ვადა: ${transferredSpec.turnaround}`
          : `Transferred from Vector Studio:\n• Object: "${transferredSpec.brandText}"\n• Scale: ${transferredSpec.dimensions}\n• Material: ${transferredSpec.material}\n• Illumination: ${transferredSpec.lighting}\n• Calculated Budget: ${transferredSpec.estimate}\n• Estimated Turnaround: ${transferredSpec.turnaround}`
      }));
    }
  }, [transferredSpec, lang]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAttached(file.name);
      onShowToast(lang === 'ka' ? `✓ ფაილი მიმაგრებულია: ${file.name}` : `✓ Attached: ${file.name}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onShowToast(lang === 'ka' ? '⚡ შეკვეთა გადაეცა Vector Hub-ის საინჟინრო განყოფილებას თბილისში.' : '⚡ Specification transmitted to Vector Hub engineers in Tbilisi.');
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        city: lang === 'ka' ? 'თბილისი, საქართველო' : 'Tbilisi, Georgia',
        medium: 'letters',
        notes: ''
      });
      setFileAttached(null);
    }, 1000);
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
                  placeholder={lang === 'ka' ? 'მაგ. გიორგი ბერიძე' : 'e.g. Alex Morgan'} 
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
                  placeholder={lang === 'ka' ? 'მაგ. ნექსუს ჯორჯია' : 'e.g. Nexus Global'} 
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
                  <option value="turnkey">{lang === 'ka' ? 'სრული სარეკლამო პაკეტი (გარე + ბეჭდვა)' : 'Full Turnkey Advertising Package'}</option>
                </select>
              </div>

              <div className="form-group-block">
                <label className="form-label-mono">{t.formCity}</label>
                <input 
                  type="text" 
                  name="city" 
                  className="swiss-input" 
                  required 
                  placeholder={lang === 'ka' ? 'მაგ. თბილისი, ბათუმი, ქუთაისი...' : 'e.g. Tbilisi, Batumi, International'} 
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
                  <span style={{ fontWeight: '700' }}>✓ {lang === 'ka' ? 'მიმაგრებულია:' : 'Attached File:'} {fileAttached}</span>
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
                placeholder={lang === 'ka' ? 'მიუთითეთ ზომები, განათების ტემპერატურა (3000K/6500K), სამონტაჟო სიმაღლე ან სასწრაფო ვადები...' : 'Include custom dimensions, lighting kelvins, installation heights, or urgent deadlines...'}
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn-swiss btn-swiss-solid" 
              style={{ width: '100%', padding: '16px' }}
              disabled={isSubmitting}
              data-cursor-text="SEND SPEC"
            >
              {isSubmitting ? t.submittingBtn : t.submitBtn}
            </button>
          </form>

          {/* Right: Direct Studio Desk & Tbilisi Hub */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="hairline-box">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink-muted)', marginBottom: '10px' }}>
                DIRECT COMMUNICATIONS
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
                  <span>{t.whatsappLbl}: <a href="https://wa.me/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>+995 599 80 80 80</a></span>
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
