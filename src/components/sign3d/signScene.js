// Builds the extruded sign (letters or lightbox + optional logo) as a THREE.Group.
// Layout units: 1 unit = 1 em of the main line. World units: metres.
import * as THREE from 'three';
import { layoutLine, defaultLogoShapes, svgLogoShapes, shapesBounds, roundedRectShape, drawShapes } from './signShapes';

export const LED_COLORS = { 3000: '#ffc98a', 4000: '#ffe3bf', 6500: '#e8f1ff' };

const ITEM_GAP = 0.42; // space between text and logo, in em
const LOGO_SCALE = 1.45; // logo height relative to the letters' cap height
const BOX_PAD = 0.34;

/**
 * One-row sign layout in em units, centred on the origin.
 * items: [{ kind: 'text', text } | { kind: 'logo' }], e.g. Georgian · logo · English.
 * logo: { kind: 'default' | 'svg' | 'image', svgText?, image? } used for every logo item.
 * Returns { parts, box, capH } where capH is the letter height (em) used for the size readout.
 */
export function buildPlan(fonts, { items, logo }) {
  const laid = items
    .map((it) => (it.kind === 'text' ? { ...it, text: it.text.trim() } : it))
    .filter((it) => it.kind === 'logo' || it.text)
    .map((it) => (it.kind === 'text' ? { ...it, ...layoutLine(fonts, it.text) } : it));
  if (!laid.length) return null;

  // Letters share a baseline; the logo is centred on the letters' middle
  const texts = laid.filter((it) => it.kind === 'text');
  const capH = texts.length ? Math.max(...texts.map((t) => Math.max(t.top, 0.55))) : 0.72;
  const logoH = capH * LOGO_SCALE;
  const logoSrc = laid.some((it) => it.kind === 'logo') ? resolveLogo(logo, logoH) : null;

  const parts = [];
  let x = 0;
  laid.forEach((it, i) => {
    if (i > 0) x += ITEM_GAP;
    if (it.kind === 'text') {
      parts.push({ kind: 'shapes', shapes: it.shapes, sx: 1, sy: 1, dx: x, dy: 0, lit: true });
      x += it.width;
    } else if (logoSrc) {
      const cx = x + logoSrc.w / 2;
      for (const p of logoSrc.parts) parts.push({ ...p, dx: p.dx + cx, dy: p.dy + capH / 2 });
      x += logoSrc.w;
    }
  });

  // Centre everything on the origin
  const box = planBounds(parts);
  if (box.isEmpty()) return null;
  const c = box.getCenter(new THREE.Vector2());
  for (const p of parts) { p.dx -= c.x; p.dy -= c.y; }
  box.translate(c.negate());
  return { parts, box, capH };
}

// Logo parts centred on their own origin, logoH tall
function resolveLogo(logo, logoH) {
  if (logo?.kind === 'image' && logo.image) {
    const w = logoH * (logo.image.naturalWidth / Math.max(logo.image.naturalHeight, 1));
    return { w, parts: [{ kind: 'image', image: logo.image, w, h: logoH, sx: 1, sy: 1, dx: 0, dy: 0, lit: true }] };
  }
  const src = (logo?.kind === 'svg' && logo.svgText && svgLogoShapes(logo.svgText)) || defaultLogoShapes();
  const { sx, sy, dx, dy } = src.norm;
  return {
    w: logoH * src.aspect,
    parts: src.groups.map((g) => ({
      kind: 'shapes', shapes: g.shapes, color: g.color,
      sx: sx * logoH, sy: sy * logoH, dx: dx * logoH, dy: dy * logoH, lit: true,
    })),
  };
}

function planBounds(parts) {
  const box = new THREE.Box2();
  const tmp = new THREE.Box2();
  for (const p of parts) {
    if (p.kind === 'image') {
      box.expandByPoint(new THREE.Vector2(p.dx - p.w / 2, p.dy - p.h / 2));
      box.expandByPoint(new THREE.Vector2(p.dx + p.w / 2, p.dy + p.h / 2));
      continue;
    }
    tmp.makeEmpty();
    shapesBounds(p.shapes, tmp);
    if (tmp.isEmpty()) continue;
    const xs = [tmp.min.x * p.sx + p.dx, tmp.max.x * p.sx + p.dx];
    const ys = [tmp.min.y * p.sy + p.dy, tmp.max.y * p.sy + p.dy];
    box.expandByPoint(new THREE.Vector2(Math.min(...xs), Math.min(...ys)));
    box.expandByPoint(new THREE.Vector2(Math.max(...xs), Math.max(...ys)));
  }
  return box;
}

export function signExtent(plan, signType) {
  const size = plan.box.getSize(new THREE.Vector2());
  if (signType === 'box') size.addScalar(BOX_PAD * 2);
  return size;
}

// ---------- materials ----------

let brushedTex = null;

// Fine horizontal streaks: drives roughness so brushed metal shows its grain
function brushedTexture() {
  if (brushedTex) return brushedTex;
  const w = 512;
  const h = 128;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = 'rgb(150,150,150)';
  g.fillRect(0, 0, w, h);
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) {
    const v = Math.floor(95 + rand() * 120);
    g.fillStyle = `rgba(${v},${v},${v},${0.25 + rand() * 0.45})`;
    g.fillRect(rand() * w - 60, rand() * h, 40 + rand() * 260, rand() < 0.8 ? 1 : 2);
  }
  brushedTex = new THREE.CanvasTexture(c);
  brushedTex.wrapS = brushedTex.wrapT = THREE.RepeatWrapping;
  brushedTex.repeat.set(1.5, 6);
  return brushedTex;
}

/**
 * finish: { hex, metal, roughness, brushed }
 * gloss: 'matte' | 'gloss' for painted (RAL) surfaces
 */
export function makeMaterial(finish, { emissive = null, emissiveIntensity = 0, gloss = 'matte' } = {}) {
  const mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(finish.hex) });
  if (finish.metal) {
    mat.metalness = 1;
    mat.roughness = finish.roughness ?? 0.32;
    if (finish.brushed) {
      mat.roughnessMap = brushedTexture();
      mat.anisotropy = 0.75;
    }
  } else if (gloss === 'gloss') {
    mat.metalness = 0;
    mat.roughness = 0.28;
    mat.clearcoat = 0.9;
    mat.clearcoatRoughness = 0.08;
  } else {
    mat.metalness = 0;
    mat.roughness = 0.72;
  }
  if (emissive) {
    mat.emissive = new THREE.Color(emissive);
    mat.emissiveIntensity = emissiveIntensity;
    // A lit acrylic face scatters light: no mirror finish, no grain
    mat.metalness = 0;
    mat.roughness = 0.55;
    mat.roughnessMap = null;
    mat.anisotropy = 0;
    mat.clearcoat = 0.3;
  }
  return mat;
}

const tint = (hex, led, amount) => '#' + new THREE.Color(hex).lerp(new THREE.Color(led), amount).getHexString();

/**
 * Builds the physical sign.
 * opts: { s (m per unit), depth (m), standoff (m), signType, face, side, boxFinish, lighting, ledHex, night }
 */
export function buildSignGroup(plan, opts) {
  const { s, depth, standoff, signType, face, side, boxFinish, lighting, ledHex, night, gloss } = opts;
  const group = new THREE.Group();
  const bevel = Math.min(0.0025, depth * 0.08);
  const frontLit = lighting === 'front';
  const faceGlow = frontLit ? (night ? 0.85 : 0.3) : 0;

  let lettersZ = standoff;
  let letterDepth = depth;

  if (signType === 'box') {
    const ext = signExtent(plan, 'box');
    const boxDepth = depth + 0.06;
    const geo = new THREE.ExtrudeGeometry(
      roundedRectShape(ext.x * s, ext.y * s, Math.min(ext.x, ext.y) * s * 0.08),
      { depth: boxDepth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10 }
    );
    // A translucent face only glows in its own colour, so dark RAL boxes stay dark
    const capMat = makeMaterial(boxFinish, frontLit ? { emissive: boxFinish.hex, emissiveIntensity: faceGlow * 0.3, gloss } : { gloss });
    const sideMat = makeMaterial(boxFinish, { gloss });
    const mesh = new THREE.Mesh(geo, [capMat, sideMat]);
    mesh.position.z = standoff * 0.4 + bevel;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.role = 'box';
    group.add(mesh);
    lettersZ = mesh.position.z + boxDepth - bevel;
    letterDepth = 0.015;
  }

  const letterBevel = Math.min(0.0018, letterDepth * 0.12);
  const faceMat = makeMaterial(face, frontLit ? { emissive: tint(face.hex, ledHex, 0.1), emissiveIntensity: faceGlow, gloss } : { gloss });
  const sideMat = makeMaterial(side, { gloss });
  const owned = [faceMat, sideMat];

  for (const p of plan.parts) {
    if (p.kind === 'image') {
      group.add(buildImageSlab(p, s, letterDepth, lettersZ, side, frontLit ? faceGlow : 0));
      continue;
    }
    const k = s * Math.abs(p.sx);
    const geo = new THREE.ExtrudeGeometry(p.shapes, {
      depth: Math.max(letterDepth - letterBevel * 2, 0.001),
      bevelEnabled: true,
      bevelThickness: letterBevel,
      bevelSize: letterBevel / k,
      bevelOffset: 0,
      bevelSegments: 2,
      curveSegments: 8,
    });
    let mats = [faceMat, sideMat];
    if (p.color) {
      const own = { hex: '#' + p.color, metal: false };
      const f = makeMaterial(own, frontLit ? { emissive: '#' + p.color, emissiveIntensity: faceGlow, gloss } : { gloss });
      const sd = makeMaterial(own, { gloss });
      owned.push(f, sd);
      mats = [f, sd];
    }
    const mesh = new THREE.Mesh(geo, mats);
    mesh.scale.set(s * p.sx, s * p.sy, 1);
    mesh.position.set(s * p.dx, s * p.dy, lettersZ + letterBevel);
    mesh.castShadow = true;
    mesh.receiveShadow = signType === 'box';
    group.add(mesh);
  }

  group.userData.frontZ = lettersZ + letterDepth;
  return group;
}

// Raster logos become a cut slab: printed face plus stacked layers for the edge
function buildImageSlab(p, s, depth, z, side, glow) {
  const slab = new THREE.Group();
  const w = p.w * s;
  const h = p.h * s;
  const geo = new THREE.PlaneGeometry(w, h);
  const faceTex = new THREE.Texture(p.image);
  faceTex.colorSpace = THREE.SRGBColorSpace;
  faceTex.needsUpdate = true;
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, alphaTest: 0.5, roughness: 0.5, side: THREE.DoubleSide });
  if (glow) {
    faceMat.emissiveMap = faceTex;
    faceMat.emissive = new THREE.Color('#ffffff');
    faceMat.emissiveIntensity = glow * 0.8;
  }

  const edgeCanvas = document.createElement('canvas');
  const scale = Math.min(1, 512 / Math.max(p.image.naturalWidth, p.image.naturalHeight));
  edgeCanvas.width = Math.max(1, Math.round(p.image.naturalWidth * scale));
  edgeCanvas.height = Math.max(1, Math.round(p.image.naturalHeight * scale));
  const ctx = edgeCanvas.getContext('2d');
  ctx.drawImage(p.image, 0, 0, edgeCanvas.width, edgeCanvas.height);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = side.hex;
  ctx.fillRect(0, 0, edgeCanvas.width, edgeCanvas.height);
  const edgeTex = new THREE.CanvasTexture(edgeCanvas);
  edgeTex.colorSpace = THREE.SRGBColorSpace;
  const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTex, alphaTest: 0.5, roughness: 0.6, side: THREE.DoubleSide });

  const layers = Math.max(4, Math.round(depth / 0.004));
  for (let i = 0; i < layers; i++) {
    const m = new THREE.Mesh(geo, edgeMat);
    m.position.z = z + (depth * i) / layers;
    m.castShadow = i === 0;
    slab.add(m);
  }
  const front = new THREE.Mesh(geo, faceMat);
  front.position.z = z + depth;
  front.castShadow = true;
  slab.add(front);
  slab.position.set(s * p.dx, s * p.dy, 0);
  return slab;
}

// ---------- light silhouettes (halo wash on the wall, bloom in front of lit faces) ----------

/**
 * Paints the sign outline, blurred, into a 2D canvas that is laid over the photo
 * with screen blending. Returns { canvas, width, height } (metres covered, centred on the sign).
 */
export function makeGlowTexture(plan, s, signType, { blurs, color, includeBox = true }) {
  const ext = signExtent(plan, signType);
  const margin = Math.max(ext.x, ext.y) * 0.18 + 0.6;
  const wU = ext.x + margin * 2;
  const hU = ext.y + margin * 2;
  const px = 1024 / Math.max(wU, hU);
  const cw = Math.ceil(wU * px);
  const ch = Math.ceil(hU * px);

  // Sharp silhouette first, then layered blurs of it
  const mask = document.createElement('canvas');
  mask.width = cw;
  mask.height = ch;
  const mctx = mask.getContext('2d');
  mctx.fillStyle = '#fff';
  const toPx = (p) => (x, y) => [cw / 2 + (x * p.sx + p.dx) * px, ch / 2 - (y * p.sy + p.dy) * px];

  if (signType === 'box' && includeBox) {
    const r = roundedRectShape(ext.x, ext.y, Math.min(ext.x, ext.y) * 0.08);
    drawShapes(mctx, [r], toPx({ sx: 1, sy: 1, dx: 0, dy: 0 }));
  } else {
    for (const p of plan.parts) {
      if (p.kind === 'image') {
        const tmp = document.createElement('canvas');
        tmp.width = Math.max(1, Math.round(p.w * px));
        tmp.height = Math.max(1, Math.round(p.h * px));
        const t = tmp.getContext('2d');
        t.drawImage(p.image, 0, 0, tmp.width, tmp.height);
        t.globalCompositeOperation = 'source-in';
        t.fillStyle = '#fff';
        t.fillRect(0, 0, tmp.width, tmp.height);
        mctx.drawImage(tmp, cw / 2 + (p.dx - p.w / 2) * px, ch / 2 - (p.dy + p.h / 2) * px);
      } else {
        drawShapes(mctx, p.shapes, toPx(p));
      }
    }
  }

  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const ctx = out.getContext('2d');
  // shadowBlur works in every browser, unlike ctx.filter
  for (const { radius, alpha } of blurs) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = radius * px;
    ctx.shadowOffsetX = cw * 2;
    ctx.drawImage(mask, -cw * 2, 0);
    ctx.restore();
  }

  return { canvas: out, width: wU * s, height: hU * s };
}

export function disposeObject(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      for (const key of ['map', 'emissiveMap', 'alphaMap']) m[key]?.dispose();
      // roughnessMap is the shared brushed texture and outlives every sign
      m.dispose();
    }
  });
}
