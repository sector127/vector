import ka from './locales/ka.js';
import en from './locales/en.js';
import ru from './locales/ru.js';

export const translations = { ka, en, ru };

/**
 * Enhanced Translation Accessor
 * Returns a Proxy supporting both:
 * 1. Property access: `t.brandTagline` with automatic fallback: `lang` -> `ka` -> `en`
 * 2. Function call interpolation: `t('toastFileAttached', { name: 'file.dxf' })`
 */
export function getTranslation(lang) {
  const currentLang = (lang && translations[lang]) ? lang : 'ka';
  const primary = translations[currentLang] || translations.ka;
  const fallbackKa = translations.ka;
  const fallbackEn = translations.en;

  const tFunc = function (key, params) {
    let val = primary[key] ?? fallbackKa[key] ?? fallbackEn[key] ?? key;
    if (typeof val === 'string' && params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return val;
  };

  return new Proxy(tFunc, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop === 'symbol') return target[prop];
      const val = primary[prop] ?? fallbackKa[prop] ?? fallbackEn[prop];
      return val;
    }
  });
}

/**
 * Format transferred CAD parameters into a localized multi-line string
 */
export function formatTransferredNotes(lang, spec) {
  const isKa = lang === 'ka';
  const isRu = lang === 'ru';
  const depthStrKa = spec.returnDepth ? `• ბორტის სიღრმე: ${spec.returnDepth}\n` : '';
  const depthStrRu = spec.returnDepth ? `• Глубина борта: ${spec.returnDepth}\n` : '';
  const depthStrEn = spec.returnDepth ? `• Return Depth: ${spec.returnDepth}\n` : '';
  const structStr = spec.structure ? `• ${spec.structure}\n` : '';

  if (isKa) {
    return `ვექტორ სტუდიიდან გადმოტანილი პარამეტრები:\n` +
      `• რეჟიმი: ${spec.inputMode === 'svg' ? 'მორგებული SVG ვექტორი' : 'ტექსტური წარწერა'}\n` +
      `• ობიექტი: "${spec.brandText}"\n` +
      `• ზომები: ${spec.dimensions}\n` +
      depthStrKa +
      `• ჭრის პერიმეტრი (Toolpath): ${spec.toolpathMm ? spec.toolpathMm.toLocaleString() + ' მმ' : 'ავტომატური'}\n` +
      `• კონტურები: ${spec.contourCount || 1}\n` +
      `• მასალა: ${spec.material}\n` +
      `• განათება: ${spec.lighting}\n` +
      structStr +
      `• ფასი: ინჟინრის დაანგარიშებით\n` +
      `• დამზადების ვადა: ${spec.turnaround}`;
  } else if (isRu) {
    return `Перенесено из Vector Studio:\n` +
      `• Режим: ${spec.inputMode === 'svg' ? 'Пользовательский SVG вектор' : 'Текстовая вывеска'}\n` +
      `• Объект: "${spec.brandText}"\n` +
      `• Размеры: ${spec.dimensions}\n` +
      depthStrRu +
      `• Периметр реза (Toolpath): ${spec.toolpathMm ? spec.toolpathMm.toLocaleString() + ' мм' : 'авто'}\n` +
      `• Контуры: ${spec.contourCount || 1}\n` +
      `• Материал: ${spec.material}\n` +
      `• Подсветка: ${spec.lighting}\n` +
      structStr +
      `• Цена: по расчёту инженера\n` +
      `• Срок производства: ${spec.turnaround}`;
  } else {
    return `Transferred from Vector Studio:\n` +
      `• Mode: ${spec.inputMode === 'svg' ? 'Custom SVG Vector' : 'Typography Text'}\n` +
      `• Object: "${spec.brandText}"\n` +
      `• Scale: ${spec.dimensions}\n` +
      depthStrEn +
      `• Cutting Toolpath: ${spec.toolpathMm ? spec.toolpathMm.toLocaleString() + ' mm' : 'auto'}\n` +
      `• Contours: ${spec.contourCount || 1}\n` +
      `• Material: ${spec.material}\n` +
      `• Illumination: ${spec.lighting}\n` +
      structStr +
      `• Price: quoted by engineer\n` +
      `• Estimated Turnaround: ${spec.turnaround}`;
  }
}

/**
 * Format inquiry submission into a localized WhatsApp markdown message
 */
export function formatWaMessage(lang, formData) {
  const isKa = lang === 'ka';
  const isRu = lang === 'ru';
  if (isKa) {
    return `*VECTOR HUB GEORGIA — შეკვეთის სპეციფიკაცია*\n` +
      `----------------------------------------\n` +
      `👤 *კონტაქტი*: ${formData.name || 'N/A'}\n` +
      `🏢 *კომპანია*: ${formData.company || 'N/A'}\n` +
      `📱 *ტელეფონი*: ${formData.phone || 'N/A'}\n` +
      `✉️ *ელ-ფოსტა*: ${formData.email || 'N/A'}\n` +
      `📍 *ლოკაცია*: ${formData.city || 'თბილისი'}\n` +
      `🛠 *მიმართულება*: ${(formData.medium || '').toUpperCase()}\n\n` +
      `📝 *CAD პარამეტრები და შენიშვნები:*\n${formData.notes || 'შენიშვნების გარეშე'}\n` +
      `----------------------------------------\n` +
      `გაგზავნილია Vector Hub-ის პლატფორმიდან`;
  } else if (isRu) {
    return `*VECTOR HUB GEORGIA — СПЕЦИФИКАЦИЯ ЗАКАЗА*\n` +
      `----------------------------------------\n` +
      `👤 *Контакт*: ${formData.name || 'N/A'}\n` +
      `🏢 *Компания*: ${formData.company || 'N/A'}\n` +
      `📱 *Телефон*: ${formData.phone || 'N/A'}\n` +
      `✉️ *Email*: ${formData.email || 'N/A'}\n` +
      `📍 *Локация*: ${formData.city || 'Тбилиси'}\n` +
      `🛠 *Направление*: ${(formData.medium || '').toUpperCase()}\n\n` +
      `📝 *Параметры CAD и детали:*\n${formData.notes || 'Без дополнительных пометок'}\n` +
      `----------------------------------------\n` +
      `Отправлено через платформу Vector Hub`;
  } else {
    return `*VECTOR HUB GEORGIA — SPECIFICATION INQUIRY*\n` +
      `----------------------------------------\n` +
      `👤 *Contact*: ${formData.name || 'N/A'}\n` +
      `🏢 *Company*: ${formData.company || 'N/A'}\n` +
      `📱 *Phone*: ${formData.phone || 'N/A'}\n` +
      `✉️ *Email*: ${formData.email || 'N/A'}\n` +
      `📍 *Location*: ${formData.city || 'Tbilisi'}\n` +
      `🛠 *Discipline*: ${(formData.medium || '').toUpperCase()}\n\n` +
      `📝 *CAD Notes & Parameters:*\n${formData.notes || 'No extra notes specified'}\n` +
      `----------------------------------------\n` +
      `Sent via Vector Hub Precision Platform`;
  }
}
