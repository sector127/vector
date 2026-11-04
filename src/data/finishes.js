import { RAL_CLASSIC } from './ralClassic';

// Fabrication finishes that are not paint: offered next to the RAL catalogue
export const METAL_FINISHES = [
  { type: 'metal', id: 'brass', name: 'Brushed brass', hex: '#D6B15C', metal: true, roughness: 0.3, brushed: true },
  { type: 'metal', id: 'steel', name: 'Brushed stainless', hex: '#C3C7CC', metal: true, roughness: 0.3, brushed: true },
  { type: 'metal', id: 'copper', name: 'Brushed copper', hex: '#C27A52', metal: true, roughness: 0.34, brushed: true },
];

const BY_CODE = new Map(RAL_CLASSIC.map(([code, name, hex]) => [code, { type: 'ral', code, name, hex, metal: false }]));

export function ralColor(code) {
  return BY_CODE.get(code);
}

export function metalFinish(id) {
  return METAL_FINISHES.find((f) => f.id === id);
}

export function finishLabel(f) {
  return f.type === 'ral' ? `RAL ${f.code} ${f.name}` : f.name;
}
