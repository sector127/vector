// One-row sign compositions, left to right. 'logo' is the logo slot; the others are text slots.
// Split layouts (ka · logo · ka) use separate left/right fields.
export const SIGN_LAYOUTS = [
  { id: 'ka_logo_en', slots: ['ka', 'logo', 'en'] },
  { id: 'ka_logo_ka', slots: ['kaL', 'logo', 'kaR'] },
  { id: 'en_logo_en', slots: ['enL', 'logo', 'enR'] },
  { id: 'logo_ka', slots: ['logo', 'ka'] },
  { id: 'ka', slots: ['ka'] },
  { id: 'en', slots: ['en'] },
];

export const DEFAULT_SIGN_TEXTS = {
  ka: 'ვექტორ ჰაბი',
  en: 'VECTOR HUB',
  kaL: 'ვექტორ',
  kaR: 'ჰაბი',
  enL: 'VECTOR',
  enR: 'HUB',
};

export const slotLang = (slot) => (slot === 'logo' ? 'logo' : slot.startsWith('ka') ? 'ka' : 'en');

export const SIGN_FONTS = [
  { id: 'sans', label: 'Noto Sans Bold', full: 'Noto Sans Georgian Bold' },
  { id: 'square', label: 'TG Square', full: 'TG Square' },
  { id: 'serif', label: 'Noto Serif Bold', full: 'Noto Serif Georgian Bold' },
];

// Physical letter height in cm (cap height of the letters)
export const LETTER_HEIGHT = { default: 20, min: 5, max: 150, step: 1 };

// Physical lightbox size in cm, used once the customer sets it by hand
export const BOX_SIZE = { w: { min: 20, max: 2000 }, h: { min: 10, max: 500 }, step: 5 };

// Lightbox corner radius in cm; the upper limit is half of the box's short side
export const BOX_RADIUS = { default: 4, min: 0, step: 1 };
