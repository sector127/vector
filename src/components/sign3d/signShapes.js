// Turns sign text and logos into THREE.Shape outlines (y-up, 1 unit = 1 em)
// so they can be extruded into real channel-letter geometry.
import * as THREE from 'three';
import opentype from 'opentype.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const LATIN_URL = '/fonts/sign/NotoSans-Bold-sign.ttf';

// Georgian sign fonts. Text is set in Mtavruli (capitals) so every letter sits
// between two lines, with no ascenders or descenders, as on real channel letters.
export const GEORGIAN_FONTS = {
  sans: '/fonts/sign/NotoSansGeorgian-Bold-sign.ttf',
  square: '/fonts/TG-Square-Regular.ttf',
  serif: '/fonts/sign/NotoSerifGeorgian-Bold-sign.ttf',
};

const fontCache = new Map();

function loadFont(url) {
  if (!fontCache.has(url)) {
    const p = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Sign font failed to load: ${url}`);
        return res.arrayBuffer();
      })
      .then((buf) => opentype.parse(buf))
      .catch((err) => {
        fontCache.delete(url);
        throw err;
      });
    fontCache.set(url, p);
  }
  return fontCache.get(url);
}

// Each font loads once per page and is shared by every sign rebuild
export async function loadSignFonts(georgianId = 'sans') {
  const [georgian, latin] = await Promise.all([
    loadFont(GEORGIAN_FONTS[georgianId] || GEORGIAN_FONTS.sans),
    loadFont(LATIN_URL),
  ]);
  return { georgian, latin };
}

// Mkhedruli → Mtavruli: same letters, capital forms (U+10D0 → U+1C90)
function toMtavruli(ch) {
  const c = ch.codePointAt(0);
  if ((c >= 0x10d0 && c <= 0x10fa) || (c >= 0x10fd && c <= 0x10ff)) return String.fromCodePoint(c + 0xbc0);
  return ch;
}

const isGeorgian = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x10a0 && c <= 0x10ff) || (c >= 0x1c90 && c <= 0x1cbf) || (c >= 0x2d00 && c <= 0x2d2f);
};

function pickFont(fonts, ch) {
  const order = isGeorgian(ch) ? [fonts.georgian, fonts.latin] : [fonts.latin, fonts.georgian];
  // Prefer the capital form; fall back to the original letter if a font lacks it
  const candidates = isGeorgian(ch) ? [toMtavruli(ch), ch] : [ch];
  for (const c of candidates) {
    for (const font of order) {
      const glyph = font.charToGlyph(c);
      if (glyph && glyph.index > 0) return { font, glyph };
    }
  }
  return null;
}

// Converts one opentype path (y-down) into a ShapePath (y-up)
function toShapePath(path) {
  const sp = new THREE.ShapePath();
  for (const cmd of path.commands) {
    switch (cmd.type) {
      case 'M': sp.moveTo(cmd.x, -cmd.y); break;
      case 'L': sp.lineTo(cmd.x, -cmd.y); break;
      case 'Q': sp.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y); break;
      case 'C': sp.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y); break;
      default: break;
    }
  }
  return sp;
}

/**
 * Lays out one line of text at 1 em, mixing the Georgian and Latin fonts per glyph.
 * Returns shapes plus metrics: width, cap top and baseline (y = 0).
 */
export function layoutLine(fonts, text, tracking = 0.02) {
  const shapes = [];
  let x = 0;
  let prev = null;
  let top = 0;
  let bottom = 0;

  for (const ch of Array.from(text)) {
    if (ch === ' ') {
      x += 0.28 + tracking;
      prev = null;
      continue;
    }
    const hit = pickFont(fonts, ch);
    if (!hit) continue;
    const { font, glyph } = hit;
    const scale = 1 / font.unitsPerEm;
    if (prev && prev.font === font) {
      x += font.getKerningValue(prev.glyph, glyph) * scale;
    }
    const path = glyph.getPath(x, 0, 1);
    const bb = path.getBoundingBox();
    if (Number.isFinite(bb.y1)) {
      top = Math.max(top, -bb.y1);
      bottom = Math.min(bottom, -bb.y2);
    }
    // Built per glyph; ShapePath resolves counters by containment, so TrueType and CFF both work
    shapes.push(...toShapePath(path).toShapes());
    x += glyph.advanceWidth * scale + tracking;
    prev = hit;
  }

  const width = Math.max(0, x - tracking);
  return { shapes, width, top, bottom };
}

// Default logo: Vector Hub mark, a ring around a chevron, 1 em tall centred on origin
export function defaultLogoShapes() {
  const r = 0.5;
  const ring = new THREE.Shape();
  ring.absarc(0, 0, r, 0, Math.PI * 2, false);
  const inner = new THREE.Path();
  inner.absarc(0, 0, r * 0.82, 0, Math.PI * 2, true);
  ring.holes.push(inner);

  const v = new THREE.Shape();
  const w = 0.56;
  const h = 0.5;
  const t = 0.13;
  v.moveTo(-w / 2, h / 2);
  v.lineTo(-w / 2 + t * 1.15, h / 2);
  v.lineTo(0, -h / 2 + t * 2.1);
  v.lineTo(w / 2 - t * 1.15, h / 2);
  v.lineTo(w / 2, h / 2);
  v.lineTo(t * 0.55, -h / 2);
  v.lineTo(-t * 0.55, -h / 2);
  v.closePath();
  return { groups: [{ shapes: [ring, v], color: null }], aspect: 1, norm: { sx: 1, sy: 1, dx: 0, dy: 0 } };
}

/**
 * Parses an SVG into filled shape groups, normalised to 1 em height and centred.
 * Each group keeps the SVG fill so a brand logo keeps its own colours.
 */
export function svgLogoShapes(svgText) {
  const data = new SVGLoader().parse(svgText);
  const groups = [];
  const box = new THREE.Box2();

  for (const path of data.paths) {
    const fill = path.userData?.style?.fill;
    if (fill === 'none' || fill === 'transparent') continue;
    const shapes = SVGLoader.createShapes(path);
    if (!shapes.length) continue;
    for (const s of shapes) {
      for (const p of s.getPoints(4)) box.expandByPoint(p);
    }
    let color = null;
    if (fill && fill !== 'currentColor' && !fill.startsWith('url(')) {
      try { color = new THREE.Color().setStyle(fill).getHexString(); } catch { color = null; }
    }
    groups.push({ shapes, color });
  }
  if (!groups.length || box.isEmpty()) return null;

  // SVG is y-down: the caller flips, scales to 1 em tall and centres with this transform
  const size = box.getSize(new THREE.Vector2());
  const centre = box.getCenter(new THREE.Vector2());
  const k = 1 / Math.max(size.y, 1e-6);
  return {
    groups,
    aspect: size.x / Math.max(size.y, 1e-6),
    norm: { sx: k, sy: -k, dx: -centre.x * k, dy: centre.y * k },
  };
}

export function shapesBounds(shapes, target = new THREE.Box2()) {
  for (const s of shapes) {
    for (const p of s.getPoints(6)) target.expandByPoint(p);
  }
  return target;
}

export function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// Fills shapes on a 2D canvas: used to paint halo and glow silhouettes
export function drawShapes(ctx, shapes, toPx) {
  ctx.beginPath();
  const trace = (pts) => {
    pts.forEach((p, i) => {
      const [x, y] = toPx(p.x, p.y);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
  };
  for (const s of shapes) {
    const { shape, holes } = s.extractPoints(6);
    trace(shape);
    holes.forEach(trace);
  }
  ctx.fill('evenodd');
}
