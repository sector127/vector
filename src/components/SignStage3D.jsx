import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { Move } from 'lucide-react';
import { loadSignFonts } from './sign3d/signShapes';
import { buildPlan, buildSignGroup, makeGlowTexture, signExtent, disposeObject, LED_COLORS } from './sign3d/signScene';

// The facade photo is 1376×768; the granite panel above the door holds the sign
const IMAGE = { w: 1376, h: 768 };
const SIGN_AREA = { cx: 0.5025, cy: 0.394, w: 0.31, h: 0.112 };
const AREA_WIDTH_M = 4.5; // real width of the sign area, sets the scale of everything else
const IMG_W_M = AREA_WIDTH_M / SIGN_AREA.w;
const IMG_H_M = IMG_W_M * (IMAGE.h / IMAGE.w);
const EYE_V = 0.74; // photographer's eye level in the photo (fraction of image height)
const PHOTO_DIST = IMG_H_M / 2 / Math.tan(THREE.MathUtils.degToRad(21));
const STANDOFF_M = 0.035;
const PHOTO_BLEED = 1.6; // the wall extends past the photo (edge pixels stretched) so side views don't show a void

// Two framings of the same photo. In the close-up the eye sits closer, left and below the sign.
const VIEWS = {
  overview: { zoom: 1.45, cu: SIGN_AREA.cx, cv: 0.47, eyeX: 0, eyeY: 0, dist: PHOTO_DIST, depthBoost: 1.35 },
  close: { zoom: 2.7, cu: SIGN_AREA.cx, cv: SIGN_AREA.cy + 0.01, eyeX: -1.5, eyeY: -1.0, dist: 4.6, depthBoost: 1 },
};

// dragMode 'orbit': the whole facade turns, as if walking past the building (default); release straightens it
const ORBIT_LIMIT = { yaw: THREE.MathUtils.degToRad(38), pitchUp: THREE.MathUtils.degToRad(14), pitchDown: THREE.MathUtils.degToRad(-8) };
const ORBIT_PER_PX = THREE.MathUtils.degToRad(0.2);
// dragMode 'turn': only the sign turns, lifted off the wall, and springs back on release
const TURN_LIMIT = { yaw: THREE.MathUtils.degToRad(85), pitch: THREE.MathUtils.degToRad(40) };
const TURN_PER_PX = THREE.MathUtils.degToRad(0.45);

// Night grade for the photo texture (multiplies the photo, like the CSS night grade did)
const PHOTO_TINT = { day: new THREE.Color(1, 1, 1), night: new THREE.Color(0.4, 0.42, 0.5) };

const signCentre = () => new THREE.Vector3((SIGN_AREA.cx - 0.5) * IMG_W_M, (0.5 - SIGN_AREA.cy) * IMG_H_M, 0);
const photoEyeY = () => (0.5 - EYE_V) * IMG_H_M;

/**
 * Real-time 3D channel letters / lightbox on the facade photo.
 * The photo is a textured wall in the scene, so the whole facade can be seen from the side.
 * ref exposes exportPng(scale) → PNG data URL.
 */
export default function SignStage3D({
  ref, photo, items, logo, sizeScale = 1, signType, depthMm, face, side, boxFinish, gloss = 'matte',
  lighting, ledTemp, night, zoomed, georgianFont = 'sans', dragMode = 'orbit', labels, onMetrics,
}) {
  const hostRef = useRef(null);
  const ctxRef = useRef(null);
  const [fonts, setFonts] = useState(null);
  const [fontError, setFontError] = useState(false);
  const [loadedLogo, setLoadedLogo] = useState(null); // { src, img }

  useEffect(() => {
    let alive = true;
    loadSignFonts(georgianFont)
      .then((f) => { if (alive) { setFonts(f); setFontError(false); } })
      .catch(() => alive && setFontError(true));
    return () => { alive = false; };
  }, [georgianFont]);

  const logoSrc = logo?.kind === 'image' ? logo.imageSrc : null;
  const logoImage = logoSrc && loadedLogo?.src === logoSrc ? loadedLogo.img : null;
  useEffect(() => {
    if (!logoSrc) return undefined;
    let alive = true;
    const img = new Image();
    img.onload = () => alive && setLoadedLogo({ src: logoSrc, img });
    img.src = logoSrc;
    return () => { alive = false; };
  }, [logoSrc]);

  // ---- one-time renderer / scene setup ----
  useEffect(() => {
    const host = hostRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping; // Khronos PBR Neutral: keeps RAL hues true (AgX turns bright reds pastel)
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x06080d, 1);
    renderer.domElement.className = 'sign3d-canvas';
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envs = { day: makeStreetEnv(pmrem, false), night: makeStreetEnv(pmrem, true) };
    const camera = new THREE.PerspectiveCamera();
    const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x5a5048, 1);
    scene.add(hemi);

    // The building: everything attached to the facade turns together around the sign's centre
    const building = new THREE.Group();
    building.position.copy(signCentre());
    building.rotation.order = 'YXZ';
    scene.add(building);
    const local = (v) => v.clone().sub(signCentre()); // facade coords → building-local

    const photoMat = new THREE.MeshBasicMaterial({ color: PHOTO_TINT.day, toneMapped: false });
    const photoGeo = new THREE.PlaneGeometry(IMG_W_M * PHOTO_BLEED, IMG_H_M * PHOTO_BLEED);
    const uv = photoGeo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (uv.getX(i) - 0.5) * PHOTO_BLEED + 0.5, (uv.getY(i) - 0.5) * PHOTO_BLEED + 0.5);
    }
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.copy(local(new THREE.Vector3(0, 0, 0)));
    building.add(photoMesh);

    // Shadow-only layer just in front of the photo
    const shadowWall = new THREE.Mesh(new THREE.PlaneGeometry(IMG_W_M * PHOTO_BLEED, IMG_H_M * PHOTO_BLEED), new THREE.ShadowMaterial({ opacity: 0.45 }));
    shadowWall.position.copy(local(new THREE.Vector3(0, 0, 0.002)));
    shadowWall.receiveShadow = true;
    building.add(shadowWall);

    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.01;
    key.shadow.radius = 4;
    const anchor = new THREE.Object3D();
    key.target = anchor;
    building.add(key, anchor);

    const ctx = {
      renderer, scene, camera, hemi, key, anchor, building, photoMat, shadowWall, envs,
      sign: null, glow: [], size: { w: 1, h: 1 }, target: 'overview', dragMode: 'orbit',
      orbit: { yaw: 0, pitch: 0 }, orbitGoal: { yaw: 0, pitch: 0 },
      turn: { yaw: 0, pitch: 0 }, turnGoal: { yaw: 0, pitch: 0 }, dragging: false, signHalf: { w: 0, h: 0 },
      view: { ...VIEWS.overview }, raf: 0,
    };

    new THREE.TextureLoader().load(photo.src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      photoMat.map = tex;
      photoMat.needsUpdate = true;
      ctx.render();
    });

    const frame = () => {
      ctx.raf = 0;
      const animating = stepView(ctx);
      layout(ctx);
      renderer.render(scene, camera);
      if (animating) ctx.render();
    };
    ctx.render = () => { if (!ctx.raf) ctx.raf = requestAnimationFrame(frame); };
    ctxRef.current = ctx;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      ctx.size = { w: width, h: height };
      renderer.setSize(width, height, false);
      ctx.render();
    });
    ro.observe(host);

    let drag = null;
    const el = renderer.domElement;
    const onDown = (e) => {
      const g = ctx.dragMode === 'turn' ? ctx.turnGoal : ctx.orbitGoal;
      drag = { x: e.clientX, y: e.clientY, yaw: g.yaw, pitch: g.pitch };
      ctx.dragging = true;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (ctx.dragMode === 'turn') {
        ctx.turnGoal.yaw = THREE.MathUtils.clamp(drag.yaw + dx * TURN_PER_PX, -TURN_LIMIT.yaw, TURN_LIMIT.yaw);
        ctx.turnGoal.pitch = THREE.MathUtils.clamp(drag.pitch + dy * TURN_PER_PX, -TURN_LIMIT.pitch, TURN_LIMIT.pitch);
      } else {
        ctx.orbitGoal.yaw = THREE.MathUtils.clamp(drag.yaw + dx * ORBIT_PER_PX, -ORBIT_LIMIT.yaw, ORBIT_LIMIT.yaw);
        ctx.orbitGoal.pitch = THREE.MathUtils.clamp(drag.pitch + dy * ORBIT_PER_PX, ORBIT_LIMIT.pitchDown, ORBIT_LIMIT.pitchUp);
      }
      ctx.render();
    };
    const onUp = () => {
      drag = null;
      ctx.dragging = false;
      // Letting go always eases back to the straight view (the photo's own angle)
      ctx.turnGoal = { yaw: 0, pitch: 0 };
      ctx.orbitGoal = { yaw: 0, pitch: 0 };
      ctx.render();
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(ctx.raf);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      if (ctx.sign) disposeObject(ctx.sign);
      disposeObject(photoMesh);
      disposeObject(shadowWall);
      envs.day.dispose();
      envs.night.dispose();
      pmrem.dispose();
      renderer.dispose();
      el.remove();
      ctxRef.current = null;
    };
    // The photo URL is fixed for this scene
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.dragMode = dragMode;
    ctx.turnGoal = { yaw: 0, pitch: 0 };
    ctx.render();
  }, [dragMode]);

  // ---- framing: overview ↔ close-up ----
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.target = zoomed ? 'close' : 'overview';
    ctx.render();
  }, [zoomed]);

  // ---- rebuild the sign whenever its design changes (items/logo are memoised by the parent) ----
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || !fonts) return;
    const { building } = ctx;

    if (ctx.sign) { building.remove(ctx.sign); disposeObject(ctx.sign); ctx.sign = null; }
    ctx.glow = [];

    const logoSpec = logo
      ? { ...logo, image: logo.kind === 'image' ? logoImage : null, kind: logo.kind === 'image' && !logoImage ? 'default' : logo.kind }
      : null;
    const plan = buildPlan(fonts, { items, logo: logoSpec });
    if (!plan) { ctx.render(); return; }

    // Physical scale: fit the sign into the granite panel of the facade photo
    const areaW = SIGN_AREA.w * IMG_W_M;
    const areaH = SIGN_AREA.h * IMG_H_M;
    const ext = signExtent(plan, signType);
    // Fit the panel, then apply the user's size step (above 1 the sign outgrows the panel)
    const s = Math.min(areaW / ext.x, areaH / ext.y) * sizeScale;
    onMetrics?.({ w: ext.x * s, h: ext.y * s, letterH: plan.capH * s });

    // Returns are drawn a little deeper in the overview so they still read at that distance
    const depth = (depthMm / 1000) * VIEWS[ctx.target].depthBoost;
    const ledHex = LED_COLORS[ledTemp] || LED_COLORS[3000];
    const sign = buildSignGroup(plan, {
      s, depth, standoff: lighting === 'back' ? STANDOFF_M * 1.4 : STANDOFF_M * 0.35,
      signType, face, side, boxFinish, lighting, ledHex, night, gloss,
    });
    sign.rotation.order = 'YXZ';
    ctx.signHalf = { w: (ext.x * s) / 2, h: (ext.y * s) / 2 };

    // Light added onto the photo: halo washes the stone, bloom haloes lit faces
    if (lighting === 'back') {
      const g = makeGlowTexture(plan, s, signType, {
        color: ledHex,
        blurs: [{ radius: 0.045, alpha: 1 }, { radius: 0.15, alpha: 0.9 }, { radius: 0.42, alpha: 0.55 }],
      });
      const halo = glowPlane(g, night ? 1 : 0.6);
      halo.position.z = 0.004;
      sign.add(halo);
      ctx.glow.push(halo);
    }
    if (lighting === 'front') {
      const glowHex = '#' + new THREE.Color(face.hex).lerp(new THREE.Color(ledHex), 0.15).getHexString();
      const g = makeGlowTexture(plan, s, signType, {
        color: glowHex,
        includeBox: false,
        blurs: [{ radius: 0.1, alpha: 0.75 }, { radius: 0.32, alpha: 0.45 }],
      });
      const bloom = glowPlane(g, night ? 0.7 : 0.12);
      bloom.position.z = sign.userData.frontZ + 0.01;
      sign.add(bloom);
      ctx.glow.push(bloom);
    }
    building.add(sign);
    ctx.sign = sign;
    applyTurn(ctx);

    // Lighting rig (attached to the building): evening sky, or night with only the canopy downlight
    const { hemi, key, anchor, renderer, scene } = ctx;
    anchor.position.set(0, 0, 0);
    const span = Math.max(ext.x, ext.y) * s;
    if (night) {
      hemi.color.set(0x8fa3c8); hemi.groundColor.set(0x1a1612); hemi.intensity = 0.14;
      key.color.set(0xffd6a0); key.intensity = 1.2;
      key.position.set(0.2, 2.2, 1.3);
      scene.environment = ctx.envs.night;
      renderer.toneMappingExposure = 1.1;
    } else {
      hemi.color.set(0xe6eeff); hemi.groundColor.set(0x6b5f55); hemi.intensity = 0.9;
      key.color.set(0xfff1df); key.intensity = 2.1;
      key.position.set(-1.6, 3.4, 3.2);
      scene.environment = ctx.envs.day;
      renderer.toneMappingExposure = 1.15;
    }
    scene.environmentIntensity = 1;
    const cam = key.shadow.camera;
    cam.left = cam.bottom = -(span * 0.8 + 0.6);
    cam.right = cam.top = span * 0.8 + 0.6;
    cam.near = 0.1; cam.far = 20;
    cam.updateProjectionMatrix();
    ctx.shadowWall.material.opacity = night ? 0.5 : 0.42;
    ctx.photoMat.color.copy(night ? PHOTO_TINT.night : PHOTO_TINT.day);

    ctx.render();
  }, [fonts, items, logo, sizeScale, logoImage, signType, depthMm, face, side, boxFinish, gloss, lighting, ledTemp, night, onMetrics, zoomed]);

  // ---- export: one 2× WebGL frame (photo, sign and light are all in the scene) ----
  useImperativeHandle(ref, () => ({
    async exportPng(scale = 2) {
      const ctx = ctxRef.current;
      if (!ctx) return null;
      const { w, h } = ctx.size;
      const out = document.createElement('canvas');
      out.width = Math.round(w * scale);
      out.height = Math.round(h * scale);
      const g = out.getContext('2d');

      const prevRatio = ctx.renderer.getPixelRatio();
      ctx.renderer.setPixelRatio(scale);
      ctx.renderer.setSize(w, h, false);
      layout(ctx);
      ctx.renderer.render(ctx.scene, ctx.camera);
      g.drawImage(ctx.renderer.domElement, 0, 0, out.width, out.height);
      ctx.renderer.setPixelRatio(prevRatio);
      ctx.renderer.setSize(w, h, false);
      ctx.render();

      if (night) {
        // Same atmosphere as the .photo-night-ambience-overlay on screen
        const rad = g.createRadialGradient(out.width * 0.35, out.height * 0.25, 0, out.width * 0.35, out.height * 0.25, out.width * 0.6);
        rad.addColorStop(0, 'rgba(0,240,255,0.12)');
        rad.addColorStop(1, 'rgba(0,240,255,0)');
        g.fillStyle = rad;
        g.fillRect(0, 0, out.width, out.height);
        const lin = g.createLinearGradient(0, out.height, 0, out.height * 0.65);
        lin.addColorStop(0, 'rgba(4,7,16,0.65)');
        lin.addColorStop(1, 'rgba(4,7,16,0)');
        g.fillStyle = lin;
        g.fillRect(0, 0, out.width, out.height);
      }
      return out.toDataURL('image/png');
    },
  }), [night]);

  return (
    <div ref={hostRef} className={`sign3d-host ${zoomed ? 'is-close' : ''}`} aria-label={photo.alt} role="img">
      {/* WebGL canvas is inserted first */}
      {night && <div className="photo-night-ambience-overlay" />}
      {!fonts && !fontError && <div className="sign3d-status">{labels?.loading}</div>}
      {fontError && <div className="sign3d-status">{labels?.error}</div>}
      {fonts && (
        <div className="sign3d-hint" title={labels?.dragHint}>
          <Move size={12} />
          <span>{labels?.dragShort}</span>
        </div>
      )}
    </div>
  );
}

// ---------- view & projection ----------

// 'turn' mode: rotates the sign about its centre and pulls it off the wall along the line of sight
function applyTurn(ctx) {
  if (!ctx.sign) return;
  const { yaw, pitch } = ctx.turn;
  ctx.sign.rotation.set(pitch, yaw, 0);
  const lift = ctx.signHalf.w * Math.abs(Math.sin(yaw)) + ctx.signHalf.h * Math.abs(Math.sin(pitch));
  const z = lift > 0.001 ? lift + 0.04 : 0;
  const eyeLocal = ctx.eye ? ctx.building.worldToLocal(ctx.eye.clone()) : new THREE.Vector3(0, 0, VIEWS.overview.dist);
  const t = z / Math.max(eyeLocal.z, 0.1);
  ctx.sign.position.set(eyeLocal.x * t, eyeLocal.y * t, z);
  // Wall light only exists while the sign sits on the wall
  const fade = THREE.MathUtils.clamp(1 - Math.max(Math.abs(yaw), Math.abs(pitch)) / 0.2, 0, 1);
  for (const g of ctx.glow) g.material.opacity = g.userData.opacity * fade;
}

// Eases framing, orbit and turn toward their targets; returns true while still moving
function stepView(ctx) {
  let moving = false;
  const ease = (cur, goal, keys, k) => {
    for (const key of keys) {
      const d = goal[key] - cur[key];
      if (Math.abs(d) > 1e-4) { cur[key] += d * k; moving = true; } else cur[key] = goal[key];
    }
  };
  ease(ctx.turn, ctx.turnGoal, ['yaw', 'pitch'], ctx.dragging ? 0.35 : 0.12);
  ease(ctx.orbit, ctx.orbitGoal, ['yaw', 'pitch'], ctx.dragging ? 0.3 : 0.12);
  ease(ctx.view, VIEWS[ctx.target], ['zoom', 'cu', 'cv', 'eyeX', 'eyeY', 'dist'], 0.16);
  ctx.building.rotation.set(ctx.orbit.pitch, ctx.orbit.yaw, 0);
  applyTurn(ctx);
  return moving;
}

// Part of the photo on screen, in image-normalised units (object-fit: cover, then zoom)
function visibleRect(ctx) {
  const { w, h } = ctx.size;
  const aspect = w / h;
  const imgAspect = IMAGE.w / IMAGE.h;
  const wN = (aspect > imgAspect ? 1 : aspect / imgAspect) / ctx.view.zoom;
  const hN = (aspect > imgAspect ? imgAspect / aspect : 1) / ctx.view.zoom;
  const cu = THREE.MathUtils.clamp(ctx.view.cu, wN / 2, 1 - wN / 2);
  const cv = THREE.MathUtils.clamp(ctx.view.cv, hN / 2, 1 - hN / 2);
  return { u0: cu - wN / 2, v0: cv - hN / 2, wN, hN };
}

function eye(ctx) {
  const c = signCentre();
  const v = ctx.view;
  // Overview eye is the photographer's; the close-up eye is placed relative to the sign
  const blend = THREE.MathUtils.clamp((v.zoom - VIEWS.overview.zoom) / (VIEWS.close.zoom - VIEWS.overview.zoom), 0, 1);
  const baseX = THREE.MathUtils.lerp(0, c.x, blend);
  const baseY = THREE.MathUtils.lerp(photoEyeY(), c.y, blend);
  return new THREE.Vector3(baseX + v.eyeX, baseY + v.eyeY, v.dist);
}

// Off-axis camera at the eye: with no orbit the textured wall fills the frame exactly like the photo crop
function layout(ctx) {
  const r = visibleRect(ctx);
  const x0 = (r.u0 - 0.5) * IMG_W_M;
  const x1 = (r.u0 + r.wN - 0.5) * IMG_W_M;
  const yTop = (0.5 - r.v0) * IMG_H_M;
  const yBot = (0.5 - r.v0 - r.hN) * IMG_H_M;
  const e = eye(ctx);
  ctx.eye = e;

  const { camera } = ctx;
  const near = 0.05;
  const k = near / e.z;
  camera.position.copy(e);
  camera.rotation.set(0, 0, 0);
  camera.updateMatrixWorld();
  camera.projectionMatrix.makePerspective((x0 - e.x) * k, (x1 - e.x) * k, (yTop - e.y) * k, (yBot - e.y) * k, near, e.z + 40);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

function glowPlane({ canvas, width, height }, opacity) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity, depthWrite: false, toneMapped: false,
      blending: THREE.AdditiveBlending, // light adds onto the photo, like LEDs on stone
    })
  );
  mesh.userData.opacity = opacity;
  return mesh;
}

// Reflections for metal: an evening street (sky, facades, pavement), not a white studio
function makeStreetEnv(pmrem, night) {
  const scene = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 48, 24);
  const top = new THREE.Color(night ? 0x26324a : 0xc9d4e8);
  const horizon = new THREE.Color(night ? 0x4a3f34 : 0xb3aba0);
  const ground = new THREE.Color(night ? 0x14110e : 0x4d463e);
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    const c = y > 0 ? horizon.clone().lerp(top, Math.pow(y, 0.6)) : horizon.clone().lerp(ground, Math.pow(-y, 0.5));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  // A soft light source above and in front: the sky by day, the canopy strip by night
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(night ? 8 : 12, night ? 1.4 : 4),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(night ? 0xffcf96 : 0xfff3e2).multiplyScalar(night ? 3 : 2.6), side: THREE.DoubleSide })
  );
  panel.position.set(-1, 6, 5);
  panel.lookAt(0, 0, 0);
  scene.add(panel);

  // The street behind the viewer: what a flat letter face actually mirrors
  const street = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 6),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(night ? 0x8a6a48 : 0xe8d6bb).multiplyScalar(night ? 0.9 : 1.35), side: THREE.DoubleSide })
  );
  street.position.set(0, 0.6, 8);
  street.lookAt(0, 0.6, 0);
  scene.add(street);

  const tex = pmrem.fromScene(scene, 0.03).texture;
  geo.dispose();
  panel.geometry.dispose();
  street.geometry.dispose();
  return tex;
}
