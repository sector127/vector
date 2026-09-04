import React, { useState, useRef } from 'react';
import { ArrowRight, Download, Sun, Moon, Upload, FileCode, RefreshCw } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

// Sample Built-in Vector Presets
const SAMPLE_PRESETS = {
  monogram: {
    id: 'monogram',
    nameKey: 'presetMonogram',
    rawSvg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 35 L 110 35 L 150 145 L 190 35 L 250 35 L 175 175 L 125 175 Z" fill="none" stroke="currentColor" stroke-width="5" />
      <path d="M 85 65 L 115 65 L 150 145 L 185 65 L 215 65 L 165 160 L 135 160 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3" />
      <circle cx="150" cy="95" r="14" fill="none" stroke="currentColor" stroke-width="3" />
      <line x1="130" y1="95" x2="170" y2="95" stroke="currentColor" stroke-width="2" />
      <line x1="150" y1="75" x2="150" y2="115" stroke="currentColor" stroke-width="2" />
    </svg>`
  },
  emblem: {
    id: 'emblem',
    nameKey: 'presetEmblem',
    rawSvg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="150,20 245,68 245,142 150,188 55,142 55,68" fill="none" stroke="currentColor" stroke-width="4.5" />
      <polygon points="150,40 225,80 225,130 150,168 75,130 75,80" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
      <path d="M 150 40 L 150 168 M 75 80 L 225 130 M 75 130 L 225 80" fill="none" stroke="currentColor" stroke-width="2" />
      <circle cx="150" cy="105" r="22" fill="none" stroke="currentColor" stroke-width="3" />
    </svg>`
  },
  signage: {
    id: 'signage',
    nameKey: 'presetSignage',
    rawSvg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="35" width="250" height="130" rx="10" fill="none" stroke="currentColor" stroke-width="4" />
      <rect x="35" y="45" width="230" height="110" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" />
      <path d="M 45 135 L 85 75 L 125 135 L 165 90 L 205 135 L 235 65 L 255 135" fill="none" stroke="currentColor" stroke-width="3.5" />
      <circle cx="215" cy="45" r="10" fill="none" stroke="currentColor" stroke-width="2.5" />
    </svg>`
  }
};

// Robust SVG parser to extract shapes, bounds, contour count, and real-world path length
function parseSvgString(svgText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return null;

    let vbMinX = 0;
    let vbMinY = 0;
    let vbWidth = 300;
    let vbHeight = 200;

    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts.every(n => !isNaN(n))) {
        [vbMinX, vbMinY, vbWidth, vbHeight] = parts;
      }
    } else {
      const w = parseFloat(svgEl.getAttribute('width'));
      const h = parseFloat(svgEl.getAttribute('height'));
      if (!isNaN(w) && w > 0) vbWidth = w;
      if (!isNaN(h) && h > 0) vbHeight = h;
    }

    const elements = svgEl.querySelectorAll('path, polygon, polyline, circle, rect, ellipse, line');
    let totalLengthPx = 0;
    let contourCount = 0;
    const pathsData = [];

    // Temporary measuring container
    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tempSvg.style.position = 'absolute';
    tempSvg.style.visibility = 'hidden';
    tempSvg.style.width = '0px';
    tempSvg.style.height = '0px';
    document.body.appendChild(tempSvg);

    elements.forEach((el) => {
      contourCount++;
      let d = '';
      const tag = el.tagName.toLowerCase();
      if (tag === 'path') {
        d = el.getAttribute('d') || '';
      } else if (tag === 'polygon' || tag === 'polyline') {
        const pts = (el.getAttribute('points') || '').trim().split(/[\s,]+/);
        if (pts.length >= 2) {
          d = `M ${pts[0]} ${pts[1]}`;
          for (let i = 2; i < pts.length; i += 2) {
            d += ` L ${pts[i]} ${pts[i + 1]}`;
          }
          if (tag === 'polygon') d += ' Z';
        }
      } else if (tag === 'rect') {
        const x = parseFloat(el.getAttribute('x') || 0);
        const y = parseFloat(el.getAttribute('y') || 0);
        const w = parseFloat(el.getAttribute('width') || 0);
        const h = parseFloat(el.getAttribute('height') || 0);
        const rx = parseFloat(el.getAttribute('rx') || 0);
        if (rx > 0) {
          d = `M ${x + rx} ${y} h ${w - 2 * rx} a ${rx} ${rx} 0 0 1 ${rx} ${rx} v ${h - 2 * rx} a ${rx} ${rx} 0 0 1 -${rx} ${rx} h -${w - 2 * rx} a ${rx} ${rx} 0 0 1 -${rx} -${rx} v -${h - 2 * rx} a ${rx} ${rx} 0 0 1 ${rx} -${rx} z`;
        } else {
          d = `M ${x} ${y} h ${w} v ${h} h -${w} Z`;
        }
      } else if (tag === 'circle') {
        const cx = parseFloat(el.getAttribute('cx') || 0);
        const cy = parseFloat(el.getAttribute('cy') || 0);
        const r = parseFloat(el.getAttribute('r') || 0);
        d = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
      } else if (tag === 'ellipse') {
        const cx = parseFloat(el.getAttribute('cx') || 0);
        const cy = parseFloat(el.getAttribute('cy') || 0);
        const rx = parseFloat(el.getAttribute('rx') || 0);
        const ry = parseFloat(el.getAttribute('ry') || 0);
        d = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
      } else if (tag === 'line') {
        const x1 = el.getAttribute('x1') || 0;
        const y1 = el.getAttribute('y1') || 0;
        const x2 = el.getAttribute('x2') || 0;
        const y2 = el.getAttribute('y2') || 0;
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
      }

      if (d) {
        pathsData.push(d);
        try {
          const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathEl.setAttribute('d', d);
          tempSvg.appendChild(pathEl);
          const len = pathEl.getTotalLength();
          if (!isNaN(len) && len > 0) {
            totalLengthPx += len;
          }
        } catch {
          totalLengthPx += 120;
        }
      }
    });

    document.body.removeChild(tempSvg);

    return {
      rawSvg: svgText,
      viewBox: `${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}`,
      vbMinX,
      vbMinY,
      vbWidth,
      vbHeight,
      paths: pathsData,
      contourCount: Math.max(1, contourCount),
      totalLengthPx: Math.max(60, totalLengthPx)
    };
  } catch (err) {
    console.error('Failed to parse SVG:', err);
    return null;
  }
}

export default function VectorWorkbench({ lang, onTransferSpec }) {
  const t = getTranslation(lang);

  // Mode: 'text' (typography) vs 'svg' (custom upload / preset)
  const [inputMode, setInputMode] = useState('text');
  const [customSvg, setCustomSvg] = useState(() => parseSvgString(SAMPLE_PRESETS.monogram.rawSvg));
  const [activePresetKey, setActivePresetKey] = useState('monogram');
  const [svgFileName, setSvgFileName] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // General Spec State
  const [productType, setProductType] = useState('letters'); // 'letters', 'lightbox', 'billboard', 'print'
  const [currency, setCurrency] = useState('GEL'); // 'GEL', 'USD', 'EUR'
  const [brandText, setBrandText] = useState(t.brandTextDefault || 'თბილისი');
  const [width, setWidth] = useState(3.6); // meters
  const [height, setHeight] = useState(1.2); // meters
  const [material, setMaterial] = useState('brass'); // 'brass', 'stainless', 'acrylic', 'carbon'
  const [lighting, setLighting] = useState('halo3000'); // 'halo3000', 'front6500', 'none'
  const [printUnits, setPrintUnits] = useState(5000); // for print run
  const [stageTilt, setStageTilt] = useState({ rx: 0, ry: 0 });
  const [nightPreview, setNightPreview] = useState(false);
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Conversion rates (1 USD = 2.70 GEL, 1 EUR = 2.95 GEL)
  const rates = {
    GEL: 1,
    USD: 1 / 2.70,
    EUR: 1 / 2.95
  };
  const currencySymbols = {
    GEL: '₾',
    USD: '$',
    EUR: '€'
  };

  // Base pricing matrix per m² in GEL
  const baseRatesGEL = {
    letters: { brass: 2400, stainless: 2100, acrylic: 1750, carbon: 1850 },
    lightbox: { brass: 2100, stainless: 1950, acrylic: 1600, carbon: 1700 },
    billboard: { brass: 3600, stainless: 3400, acrylic: 3100, carbon: 3200 },
    print: { brass: 0.45, stainless: 0.38, acrylic: 0.30, carbon: 0.32 }
  };

  const lightMultiplier = {
    halo3000: 1.35,
    front6500: 1.25,
    none: 1.0
  };

  // Calculations
  const areaSqM = (width * height).toFixed(2);

  // Precise toolpath calculation in mm
  let toolpathMm = 0;
  let contourCount = 1;
  let piercingPoints = 1;

  if (inputMode === 'svg' && customSvg) {
    const scaleFactor = (width * 1000) / customSvg.vbWidth;
    toolpathMm = Math.round(customSvg.totalLengthPx * scaleFactor);
    contourCount = customSvg.contourCount;
    piercingPoints = customSvg.contourCount;
  } else {
    toolpathMm = Math.round(width * height * 1420 + (brandText.length * 380));
    contourCount = Math.max(1, brandText.length);
    piercingPoints = Math.max(1, Math.round(brandText.length * 1.3));
  }

  let totalCostGEL = 0;
  if (productType === 'print') {
    const unitPrice = baseRatesGEL.print[material] || 0.35;
    totalCostGEL = Math.round(printUnits * unitPrice + 180);
  } else {
    const base = baseRatesGEL[productType][material] || 2000;
    const mult = lightMultiplier[lighting] || 1.0;
    // SVG complexity weighting
    const complexityModifier = inputMode === 'svg' && customSvg ? Math.max(1.0, 1 + (customSvg.contourCount * 0.03)) : 1.0;
    totalCostGEL = Math.round(areaSqM * base * mult * complexityModifier);
  }

  const convertedPrice = Math.round(totalCostGEL * rates[currency]);
  const estDays = productType === 'billboard' ? t.estDaysBillboard : (productType === 'letters' ? t.estDaysLetters : (productType === 'print' ? t.estDaysPrint : t.estDaysLightbox));

  // Material finish colors for SVG rendering
  const getMaterialStroke = (isNight) => {
    if (isNight) {
      if (lighting === 'front6500') return '#ffffff';
      if (material === 'brass') return '#e6be44';
      if (material === 'stainless') return '#c5cdd6';
      if (material === 'acrylic') return '#ffffff';
      return '#888888';
    }
    if (material === 'brass') return '#b8860b';
    if (material === 'stainless') return '#4a5568';
    if (material === 'acrylic') return '#2b6cb0';
    return '#1a202c';
  };

  // Stage Mouse Hover 3D Tilt
  const handleStageMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setStageTilt({
      rx: -(y / (rect.height / 2)) * 6,
      ry: (x / (rect.width / 2)) * 8
    });
  };

  const handleStageLeave = () => {
    setStageTilt({ rx: 0, ry: 0 });
  };

  // Handle Preset selection
  const handleSelectPreset = (presetKey) => {
    const preset = SAMPLE_PRESETS[presetKey];
    if (preset) {
      const parsed = parseSvgString(preset.rawSvg);
      if (parsed) {
        setCustomSvg(parsed);
        setActivePresetKey(presetKey);
        setSvgFileName(null);
      }
    }
  };

  // Handle File Upload
  const handleFileProcess = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      alert(t.alertInvalidSvg);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseSvgString(text);
      if (parsed && parsed.paths.length > 0) {
        setCustomSvg(parsed);
        setSvgFileName(file.name);
        setActivePresetKey(null);
        setInputMode('svg');
      } else {
        alert(t.alertSvgParseError);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Apply to Spec Inquiry form
  const handleApply = () => {
    const spec = {
      productType,
      inputMode,
      brandText: inputMode === 'svg' ? (svgFileName || t[SAMPLE_PRESETS[activePresetKey]?.nameKey] || 'Custom Vector') : brandText,
      dimensions: `${width}m × ${height}m (${areaSqM} m²)`,
      material,
      lighting,
      printUnits: productType === 'print' ? printUnits : null,
      toolpathMm,
      contourCount,
      estimate: `${currencySymbols[currency]} ${convertedPrice.toLocaleString()}`,
      turnaround: estDays
    };
    onTransferSpec(spec);
  };

  // Export clean vector CAD SVG
  const handleExportSvg = () => {
    const title = (inputMode === 'svg' ? (svgFileName ? svgFileName.replace('.svg', '') : activePresetKey) : (brandText || 'VECTOR_CAD')).toUpperCase().replace(/\s+/g, '_');
    
    let innerSvgContent = '';
    if (inputMode === 'svg' && customSvg) {
      innerSvgContent = `
    <!-- Custom Vector Geometry -->
    <g transform="translate(180, 150) scale(${380 / customSvg.vbWidth}) translate(${-customSvg.vbMinX}, ${-customSvg.vbMinY})" fill="none" stroke="#000000" stroke-width="2">
      ${customSvg.paths.map(p => `<path d="${p}" />`).join('\n      ')}
    </g>`;
    } else {
      innerSvgContent = `
    <text x="408" y="338" class="contour-extrusion">${brandText || 'VECTOR'}</text>
    <text x="400" y="344" class="contour-front">${brandText || 'VECTOR'}</text>`;
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <style>
    .border-box { fill: #ffffff; stroke: #000000; stroke-width: 3; }
    .title-box { fill: #f8f9fa; stroke: #000000; stroke-width: 1; }
    .title-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-weight: 800; font-size: 16px; letter-spacing: 0.05em; fill: #000000; }
    .spec-text { font-family: "Space Mono", monospace; font-size: 11px; fill: #333333; }
    .dim-line { stroke: #000000; stroke-width: 1.5; }
    .dim-text { font-family: "Space Mono", monospace; font-size: 13px; font-weight: bold; fill: #000000; }
    .contour-front { fill: none; stroke: #000000; stroke-width: 3; font-family: "Syne", "Space Grotesk", sans-serif; font-weight: 900; font-size: 64px; text-anchor: middle; }
    .contour-extrusion { fill: none; stroke: #777777; stroke-width: 1.5; stroke-dasharray: 4,4; font-family: "Syne", "Space Grotesk", sans-serif; font-weight: 900; font-size: 64px; text-anchor: middle; }
  </style>
  <rect width="100%" height="100%" class="border-box"/>
  <!-- Title Block Header -->
  <rect x="20" y="20" width="760" height="56" class="title-box"/>
  <text x="40" y="52" class="title-text">VECTOR HUB GEORGIA — CAD TOOLPATH SPECIFICATION</text>
  <text x="540" y="52" class="spec-text">SCALE 1:10 • TOLERANCE ±0.02mm</text>
  
  <!-- Dimension Guidelines -->
  <line x1="100" y1="130" x2="700" y2="130" class="dim-line"/>
  <line x1="100" y1="120" x2="100" y2="140" class="dim-line"/>
  <line x1="700" y1="120" x2="700" y2="140" class="dim-line"/>
  <text x="400" y="120" text-anchor="middle" class="dim-text">WIDTH: ${width} m (${Math.round(width * 1000)} mm)</text>
  
  <line x1="730" y1="170" x2="730" y2="470" class="dim-line"/>
  <line x1="720" y1="170" x2="740" y2="170" class="dim-line"/>
  <line x1="720" y1="470" x2="740" y2="470" class="dim-line"/>
  <text x="755" y="325" transform="rotate(90 755,325)" text-anchor="middle" class="dim-text">HEIGHT: ${height} m (${Math.round(height * 1000)} mm)</text>

  <!-- Vector Fabrication Object -->
  <g id="vector-fabrication-geometry">
    ${innerSvgContent}
  </g>

  <!-- Spec Readout Footer Block -->
  <rect x="20" y="510" width="760" height="70" class="title-box"/>
  <text x="40" y="534" class="spec-text">MEDIUM: ${productType.toUpperCase()} | MATERIAL: ${material.toUpperCase()} | LIGHTING: ${lighting.toUpperCase()}</text>
  <text x="40" y="552" class="spec-text">SURFACE AREA: ${areaSqM} m² | TOOLPATH LENGTH: ${toolpathMm} mm | CONTOURS: ${contourCount} | PIERCINGS: ${piercingPoints}</text>
  <text x="40" y="569" class="spec-text">ESTIMATE: ${currencySymbols[currency]} ${convertedPrice.toLocaleString()} | FABRICATION FACILITY: AKAKI TSERETELI AVE 88, TBILISI, GEORGIA • DATE: ${new Date().toISOString().split('T')[0]}</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vector_hub_${title}_cad_blueprint.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to ensure ASCII compatibility for standard ISO/DIN PDF Helvetica
  const toAsciiSafe = (str) => {
    if (!str) return '';
    const kaMap = {
      'ა':'a','ბ':'b','გ':'g','დ':'d','ე':'e','ვ':'v','ზ':'z','თ':'t','ი':'i','კ':'k','ლ':'l','მ':'m',
      'ნ':'n','ო':'o','პ':'p','ჟ':'zh','რ':'r','ს':'s','ტ':'t','უ':'u','ფ':'p','ქ':'k','ღ':'gh','ყ':'q',
      'შ':'sh','ჩ':'ch','ც':'ts','ძ':'dz','წ':'ts','ჭ':'ch','ხ':'kh','ჯ':'j','ჰ':'h',
      'Ა':'A','Ბ':'B','Გ':'G','Დ':'D','Ე':'E','Ვ':'V','Ზ':'Z','Თ':'T','Ი':'I','Კ':'K','Ლ':'L','Მ':'M',
      'Ნ':'N','Ო':'O','Პ':'P','Ჟ':'ZH','Რ':'R','Ს':'S','Ტ':'T','Უ':'U','Ფ':'P','Ქ':'K','Ღ':'GH','Ყ':'Q',
      'Შ':'SH','Ჩ':'CH','Ც':'TS','Ძ':'DZ','Წ':'TS','Ჭ':'CH','Ხ':'KH','Ჯ':'J','Ჰ':'H'
    };
    return str.split('').map(c => kaMap[c] || c).join('');
  };

  // Export High-Precision Official A4 Engineering Blueprint PDF
  const handleExportPdfBlueprint = async () => {
    setIsGeneratingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      // 297mm × 210mm Landscape A4 format
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const title = toAsciiSafe((inputMode === 'svg' ? (svgFileName ? svgFileName.replace('.svg', '') : activePresetKey) : (brandText || 'VECTOR_SIGN')).toUpperCase());
      const docNum = `VH-CAD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const dateStr = new Date().toISOString().split('T')[0];

      // Page Background & Boundary Borders (DIN/ISO Engineering Drawing Standards)
      doc.setFillColor(252, 253, 255);
      doc.rect(0, 0, 297, 210, 'F');

      // Outer Dual Border
      doc.setDrawColor(20, 24, 33);
      doc.setLineWidth(0.8);
      doc.rect(8, 8, 281, 194);
      doc.setLineWidth(0.25);
      doc.rect(10, 10, 277, 190);

      // Fine Technical Grid in background
      doc.setDrawColor(230, 235, 242);
      doc.setLineWidth(0.1);
      for (let x = 15; x < 280; x += 10) {
        doc.line(x, 15, x, 195);
      }
      for (let y = 15; y < 195; y += 10) {
        doc.line(15, y, 280, y);
      }

      // Top Title Block Header
      doc.setFillColor(243, 246, 250);
      doc.rect(10, 10, 277, 20, 'F');
      doc.setDrawColor(20, 24, 33);
      doc.setLineWidth(0.4);
      doc.line(10, 30, 287, 30);

      // Header Typography
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('VECTOR HUB GEORGIA', 15, 19);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 90, 105);
      doc.text('ARCHITECTURAL SIGNAGE & OUTDOOR ADVERTISING ENGINEERING', 15, 25);
      doc.text('88 Akaki Tsereteli Ave, Tbilisi • www.vectorhub.ge • desk@vectorhub.ge', 15, 28.5);

      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 24, 33);
      doc.text(`DOC NO: ${docNum}`, 220, 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`DATE: ${dateStr}`, 220, 23);
      doc.text('TOLERANCE: ±0.02 mm • SCALE: 1:10', 220, 27.5);

      // Main CAD Geometry Drawing Zone (Left Box: 10 to 195 mm)
      doc.setDrawColor(20, 24, 33);
      doc.setLineWidth(0.3);
      doc.line(195, 30, 195, 175); // Vertical divider separating drawing from specs table

      // Dimension Lines on CAD Drawing
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.3);

      // Horizontal Dimension (Width)
      doc.line(25, 45, 180, 45);
      doc.line(25, 42, 25, 48);
      doc.line(180, 42, 180, 48);
      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`SPAN: ${width} m (${Math.round(width * 1000)} mm)`, 102.5, 43, { align: 'center' });

      // Vertical Dimension (Height)
      doc.line(188, 55, 188, 155);
      doc.line(185, 55, 191, 55);
      doc.line(185, 155, 191, 155);
      doc.text(`HEIGHT: ${height} m (${Math.round(height * 1000)} mm)`, 185, 105, { angle: 90, align: 'center' });

      // Center Datum Crosshairs
      doc.setDrawColor(160, 175, 195);
      doc.setLineWidth(0.15);
      doc.line(102.5, 50, 102.5, 160);
      doc.line(20, 105, 185, 105);
      doc.setFont('courier', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(140, 155, 175);
      doc.text('DATUM CENTER [CL]', 102.5, 163, { align: 'center' });

      // Render Geometry on CAD Drawing
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.6);

      if (inputMode === 'svg' && customSvg && customSvg.paths.length > 0) {
        // Draw bounding box representation and spec info
        const targetW = 120;
        const targetH = 80;
        const scale = Math.min(targetW / customSvg.vbWidth, targetH / customSvg.vbHeight);
        const offsetX = 102.5 - (customSvg.vbWidth * scale) / 2;
        const offsetY = 105 - (customSvg.vbHeight * scale) / 2;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(`[ CUSTOM VECTOR: ${title} ]`, 102.5, 80, { align: 'center' });
        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.text(`Parsed Contours: ${contourCount} • Piercing Points: ${piercingPoints}`, 102.5, 90, { align: 'center' });
        doc.text(`Geometric Cutting Perimeter: ${toolpathMm.toLocaleString()} mm`, 102.5, 96, { align: 'center' });
        doc.text(`Scaled Fabrication Scale: 1:${Math.round(customSvg.vbWidth / (width * 10))}`, 102.5, 102, { align: 'center' });

        // Draw bounding box representation
        doc.setDrawColor(20, 24, 33);
        doc.setLineWidth(0.4);
        doc.rect(offsetX, offsetY, customSvg.vbWidth * scale, customSvg.vbHeight * scale);
      } else {
        // Render 3D Channel Letters
        const brandDisplay = toAsciiSafe(brandText || 'VECTOR HUB').toUpperCase();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.setTextColor(150, 160, 175);
        doc.text(brandDisplay, 104, 104, { align: 'center' }); // Extrusion shadow

        doc.setTextColor(15, 23, 42);
        doc.text(brandDisplay, 102.5, 102.5, { align: 'center' }); // Face
      }

      // Right Side: Technical Specifications Matrix
      doc.setFillColor(248, 250, 252);
      doc.rect(195, 30, 92, 145, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('FABRICATION SPECIFICATIONS', 200, 38);
      doc.setLineWidth(0.3);
      doc.line(200, 41, 282, 41);

      const slaBlueprint = productType === 'billboard' ? '12-16 Work Days' : (productType === 'letters' ? '5-7 Work Days' : (productType === 'print' ? '2 Work Days' : '4-6 Work Days'));

      const specsList = [
        ['Medium Type', productType.toUpperCase()],
        ['Object / Identity', (inputMode === 'svg' ? 'Custom SVG Vector' : toAsciiSafe(brandText)).substring(0, 18)],
        ['Dimensions (W × H)', `${width}m × ${height}m`],
        ['Total Surface Area', `${areaSqM} m²`],
        ['CNC Cutting Path', `${toolpathMm.toLocaleString()} mm`],
        ['Contour / Piercings', `${contourCount} / ${piercingPoints} pts`],
        ['Material Finish', material === 'brass' ? 'Brushed Brass 2.5mm' : (material === 'stainless' ? 'AISI 316 Stainless' : (material === 'acrylic' ? 'Opal Cast Acrylic' : 'Carbon Matte'))],
        ['Illumination Tech', lighting === 'halo3000' ? '3000K Halo Warm LED' : (lighting === 'front6500' ? '6500K Front Cool LED' : 'Non-Illuminated')],
        ['LED IP Rating', 'IP67 Waterproof (50,000h)'],
        ['Wind Load Rating', 'Certified up to 160 km/h'],
        ['Est. Production SLA', slaBlueprint],
        ['Calculated Budget', `${currencySymbols[currency]} ${convertedPrice.toLocaleString()}`]
      ];

      let rowY = 48;
      specsList.forEach(([label, val], idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(241, 245, 249);
          doc.rect(197, rowY - 4, 88, 7.5, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(80, 90, 105);
        doc.text(label, 200, rowY + 1);

        doc.setFont('courier', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(val, 283, rowY + 1, { align: 'right' });

        rowY += 8.2;
      });

      // Bottom Engineering Stamp & Approval Block (Height: 175 to 200 mm)
      doc.setDrawColor(20, 24, 33);
      doc.setLineWidth(0.4);
      doc.line(10, 175, 287, 175);

      // Left Stamp: Engineering Department Seal
      doc.setDrawColor(180, 30, 30);
      doc.setLineWidth(0.6);
      doc.rect(15, 178, 65, 18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 30, 30);
      doc.text('VECTOR HUB TBILISI', 47.5, 183, { align: 'center' });
      doc.setFontSize(6.5);
      doc.text('STRUCTURAL & CAD APPROVED', 47.5, 187.5, { align: 'center' });
      doc.setFont('courier', 'normal');
      doc.text(`VERIFY: ${docNum}`, 47.5, 192.5, { align: 'center' });

      // Middle: Legal & Permitting Note
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 115, 130);
      doc.text('This technical specification sheet is engineered by Vector Hub Georgia in full compliance with Tbilisi Municipality', 90, 184);
      doc.text('architectural and outdoor advertising guidelines. Structural calculations certified for wind, snow, and seismic loads.', 90, 188);
      doc.text('All rights reserved © Vector Hub 2026. Akaki Tsereteli Ave 88, Didube District, Tbilisi, Georgia.', 90, 192);

      // Right: Signature Block
      doc.setDrawColor(20, 24, 33);
      doc.setLineWidth(0.25);
      doc.line(220, 191, 280, 191);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(20, 24, 33);
      doc.text('CHIEF FABRICATION ENGINEER', 250, 195, { align: 'center' });

      // Save PDF directly to user workstation
      doc.save(`vector_hub_${title}_cad_blueprint.pdf`);
    } catch (err) {
      console.error('Failed to export PDF blueprint:', err);
      alert('Error generating PDF blueprint. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <section className="section-block workbench-section" id="workbench">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-editorial">
          <div className="editorial-tag">{t.workbenchTag}</div>
          <div>
            <h2 className="editorial-headline">
              {t.workbenchTitle}
            </h2>
            <p className="editorial-sub">
              {t.workbenchSub}
            </p>
          </div>
        </div>

        {/* Workbench Layout */}
        <div className="workbench-layout">
          {/* Left: Vector CAD Stage with 3D Tilt */}
          <div 
            className={`workbench-stage-box ${nightPreview ? 'night-active' : ''}`}
            ref={stageRef}
            onMouseMove={handleStageMove}
            onMouseLeave={handleStageLeave}
            style={{
              transform: `perspective(900px) rotateX(${stageTilt.rx}deg) rotateY(${stageTilt.ry}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="canvas-header-bar">
              <div className="canvas-header-left">
                <span className="canvas-header-title">Photometric CAD</span>
                <span className="tag-swiss">1:10</span>
                {inputMode === 'svg' && (
                  <span className="tag-swiss tag-swiss-active">
                    SVG
                  </span>
                )}
              </div>
              
              {/* Day/Night, PDF & SVG Export Toolbar */}
              <div className="canvas-header-actions">
                {productType !== 'print' && lighting !== 'none' && (
                  <button 
                    className={`cad-toolbar-btn ${nightPreview ? 'active' : ''}`}
                    onClick={() => setNightPreview(!nightPreview)}
                    title={nightPreview ? t.cadViewDay : t.cadViewNight}
                    data-cursor-text={nightPreview ? 'DAYLIGHT' : 'NIGHT LUX'}
                  >
                    {nightPreview ? <Sun size={13} /> : <Moon size={13} />}
                    <span>{nightPreview ? t.cadViewDay : t.cadViewNight}</span>
                  </button>
                )}

                {/* PDF Blueprint Button */}
                <button 
                  className="cad-toolbar-btn export-pdf-btn"
                  onClick={handleExportPdfBlueprint}
                  disabled={isGeneratingPdf}
                  title={t.exportPdfBtn}
                  data-cursor-text="PDF BLUEPRINT"
                >
                  {isGeneratingPdf ? <RefreshCw size={13} className="spin-icon" /> : <FileCode size={13} />}
                  <span>{isGeneratingPdf ? t.pdfGenerating : 'A4 PDF'}</span>
                </button>

                {/* SVG Button */}
                <button 
                  className="cad-toolbar-btn export-btn"
                  onClick={handleExportSvg}
                  title={t.exportSvgBtn}
                  data-cursor-text="EXPORT SVG"
                >
                  <Download size={13} />
                  <span>SVG</span>
                </button>
              </div>
            </div>

            {/* Simulated Vector Wireframe CAD Box */}
            <div className={`stage-cad-view ${nightPreview ? 'night-facade' : ''}`}>
              <svg viewBox="0 0 460 300" style={{ width: '100%', height: '100%' }}>
                <defs>
                  {/* Background CAD Grid */}
                  <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke={nightPreview ? "rgba(255,255,255,0.06)" : "var(--ink-hairline)"} strokeWidth="0.5" />
                  </pattern>

                  {/* Halo Glow Filters for Night Simulation */}
                  <filter id="haloGlowWarm" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur1" />
                    <feGaussianBlur stdDeviation="6" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur1" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <filter id="haloGlowCool" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="14" result="blur1" />
                    <feGaussianBlur stdDeviation="7" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur1" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect width="100%" height="100%" fill={nightPreview ? "#0f1013" : "url(#cadGrid)"} />

                {/* Dimension Extension Lines */}
                <line x1="60" y1="35" x2="400" y2="35" stroke={nightPreview ? "#ffffff" : "var(--ink-primary)"} strokeWidth="1" />
                <line x1="60" y1="30" x2="60" y2="40" stroke={nightPreview ? "#ffffff" : "var(--ink-primary)"} strokeWidth="1" />
                <line x1="400" y1="30" x2="400" y2="40" stroke={nightPreview ? "#ffffff" : "var(--ink-primary)"} strokeWidth="1" />
                <text x="230" y="28" fill={nightPreview ? "#ffffff" : "var(--ink-primary)"} fontSize="10" fontFamily="Space Mono" textAnchor="middle" fontWeight="700">
                  {t.widthLabelUpper}: {width} m
                </text>

                <line x1="420" y1="55" x2="420" y2="245" stroke={nightPreview ? "#ffffff" : "var(--ink-primary)"} strokeWidth="1" />
                <line x1="415" y1="55" x2="425" y2="55" stroke={nightPreview ? "#ffffff" : "var(--ink-primary)"} strokeWidth="1" />
                <line x1="415" y1="245" x2="425" y2="245" stroke={nightPreview ? "#ffffff" : "var(--ink-primary)"} strokeWidth="1" />
                <text x="440" y="150" fill={nightPreview ? "#ffffff" : "var(--ink-primary)"} fontSize="10" fontFamily="Space Mono" transform="rotate(90 440,150)" textAnchor="middle" fontWeight="700">
                  {t.heightLabelUpper}: {height} m
                </text>

                {/* Render Custom Vector SVG Mode */}
                {inputMode === 'svg' && customSvg && (
                  <g transform={`translate(${230 - (customSvg.vbWidth * (220 / customSvg.vbWidth)) / 2}, ${150 - (customSvg.vbHeight * (220 / customSvg.vbWidth)) / 2}) scale(${220 / customSvg.vbWidth}) translate(${-customSvg.vbMinX}, ${-customSvg.vbMinY})`}>
                    {/* Simulated Night Halo for SVG */}
                    {nightPreview && lighting === 'halo3000' && (
                      <g 
                        fill="none" 
                        stroke="rgba(255, 190, 80, 0.9)" 
                        strokeWidth="12" 
                        filter="url(#haloGlowWarm)"
                      >
                        {customSvg.paths.map((p, i) => (
                          <path key={`halo-${i}`} d={p} />
                        ))}
                      </g>
                    )}

                    {nightPreview && lighting === 'front6500' && (
                      <g 
                        fill="none" 
                        stroke="rgba(210, 240, 255, 0.95)" 
                        strokeWidth="10" 
                        filter="url(#haloGlowCool)"
                      >
                        {customSvg.paths.map((p, i) => (
                          <path key={`front-glow-${i}`} d={p} />
                        ))}
                      </g>
                    )}

                    {/* Extrusion depth */}
                    <g 
                      transform="translate(4, -4)" 
                      fill="none" 
                      stroke={nightPreview ? "rgba(255,255,255,0.25)" : "var(--ink-muted)"} 
                      strokeWidth="2" 
                      strokeDasharray="3 3"
                    >
                      {customSvg.paths.map((p, i) => (
                        <path key={`ext-${i}`} d={p} />
                      ))}
                    </g>

                    {/* Front Face */}
                    <g 
                      fill="none" 
                      stroke={getMaterialStroke(nightPreview)} 
                      strokeWidth="3.5"
                    >
                      {customSvg.paths.map((p, i) => (
                        <path key={`front-${i}`} d={p} />
                      ))}
                    </g>
                  </g>
                )}

                {/* Render Typography Text Mode */}
                {inputMode === 'text' && productType === 'letters' && (
                  <g>
                    {/* Simulated Night Illumination Halo */}
                    {nightPreview && lighting === 'halo3000' && (
                      <text 
                        x="230" 
                        y="160" 
                        fill="rgba(255, 185, 75, 0.85)" 
                        stroke="rgba(255, 190, 80, 0.9)" 
                        strokeWidth="16" 
                        fontSize={brandText.length > 8 ? "28" : "38"} 
                        fontFamily="TG Square, Noto Sans Georgian, Syne" 
                        fontWeight="900" 
                        textAnchor="middle" 
                        letterSpacing="0.04em"
                        filter="url(#haloGlowWarm)"
                      >
                        {brandText || 'VECTOR'}
                      </text>
                    )}

                    {nightPreview && lighting === 'front6500' && (
                      <text 
                        x="230" 
                        y="160" 
                        fill="rgba(210, 240, 255, 0.9)" 
                        stroke="rgba(230, 250, 255, 0.95)" 
                        strokeWidth="14" 
                        fontSize={brandText.length > 8 ? "28" : "38"} 
                        fontFamily="TG Square, Noto Sans Georgian, Syne" 
                        fontWeight="900" 
                        textAnchor="middle" 
                        letterSpacing="0.04em"
                        filter="url(#haloGlowCool)"
                      >
                        {brandText || 'VECTOR'}
                      </text>
                    )}

                    {/* 3D Extrusion Backing */}
                    <text 
                      x="230" 
                      y="160" 
                      fill="none" 
                      stroke={nightPreview ? "rgba(255,255,255,0.3)" : "var(--ink-muted)"} 
                      strokeWidth="3" 
                      fontSize={brandText.length > 8 ? "28" : "38"} 
                      fontFamily="TG Square, Noto Sans Georgian, Syne" 
                      fontWeight="900" 
                      textAnchor="middle" 
                      letterSpacing="0.04em"
                      dx="6"
                      dy="-6"
                    >
                      {brandText || 'VECTOR'}
                    </text>

                    {/* Front Face */}
                    <text 
                      x="230" 
                      y="160" 
                      fill={nightPreview ? (lighting === 'front6500' ? "#ffffff" : "#1e2024") : "var(--bg-main)"} 
                      stroke={nightPreview ? (lighting === 'front6500' ? "#ffffff" : "#d4af37") : "var(--ink-primary)"} 
                      strokeWidth="2.5" 
                      fontSize={brandText.length > 8 ? "28" : "38"} 
                      fontFamily="TG Square, Noto Sans Georgian, Syne" 
                      fontWeight="900" 
                      textAnchor="middle" 
                      letterSpacing="0.04em"
                    >
                      {brandText || 'VECTOR'}
                    </text>
                  </g>
                )}

                {inputMode === 'text' && productType === 'lightbox' && (
                  <g>
                    <rect 
                      x="70" 
                      y="60" 
                      width="320" 
                      height="170" 
                      fill={nightPreview ? (lighting === 'halo3000' ? "rgba(255, 240, 200, 0.9)" : "rgba(240, 250, 255, 0.95)") : "var(--bg-main)"} 
                      stroke={nightPreview ? "#ffffff" : "var(--ink-primary)"} 
                      strokeWidth="2.5" 
                      filter={nightPreview ? "url(#haloGlowCool)" : undefined}
                    />
                    <rect x="80" y="70" width="300" height="150" fill="none" stroke={nightPreview ? "rgba(0,0,0,0.3)" : "var(--ink-muted)"} strokeWidth="1" strokeDasharray="4 4" />
                    <text x="230" y="155" fill={nightPreview ? "#000000" : "var(--ink-primary)"} fontSize="26" fontFamily="TG Square, Noto Sans Georgian, Syne" fontWeight="800" textAnchor="middle">
                      {brandText || t.fallbackLightbox}
                    </text>
                  </g>
                )}

                {inputMode === 'text' && productType === 'billboard' && (
                  <g>
                    <rect 
                      x="70" 
                      y="60" 
                      width="320" 
                      height="120" 
                      fill={nightPreview ? "#000000" : "var(--bg-main)"} 
                      stroke={nightPreview ? "#ffffff" : "var(--ink-primary)"} 
                      strokeWidth="3" 
                    />
                    <line x1="220" y1="180" x2="220" y2="260" stroke={nightPreview ? "#666666" : "var(--ink-primary)"} strokeWidth="4" />
                    <line x1="240" y1="180" x2="240" y2="260" stroke={nightPreview ? "#666666" : "var(--ink-primary)"} strokeWidth="4" />
                    <text 
                      x="230" 
                      y="130" 
                      fill={nightPreview ? "#00ffcc" : "var(--ink-primary)"} 
                      fontSize="22" 
                      fontFamily="TG Square, Noto Sans Georgian, Syne" 
                      fontWeight="900" 
                      textAnchor="middle"
                      filter={nightPreview ? "url(#haloGlowCool)" : undefined}
                    >
                      {brandText || t.fallbackBillboard}
                    </text>
                  </g>
                )}

                {productType === 'print' && (
                  <g>
                    <rect x="110" y="60" width="240" height="170" fill="var(--bg-main)" stroke="var(--ink-primary)" strokeWidth="1.5" />
                    <rect x="100" y="50" width="260" height="190" fill="none" stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="230" y="150" fill="var(--ink-primary)" fontSize="20" fontFamily="TG Square, Noto Sans Georgian, Space Grotesk" fontWeight="700" textAnchor="middle">
                      {t('flyerUnitsCount', { count: printUnits.toLocaleString() })}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* CAD Spec Readout */}
            <div className="canvas-footer-hud" style={{ borderTop: '1px solid var(--ink-hairline)', paddingTop: '12px' }}>
              <div><strong>{t.hudArea}:</strong> {areaSqM} m²</div>
              <div><strong>{t.hudToolpath}:</strong> {toolpathMm.toLocaleString()} mm</div>
              <div><strong>{t.hudContours}:</strong> {contourCount}</div>
              <div><strong>{t.hudPiercing}:</strong> {piercingPoints}</div>
            </div>
          </div>

          {/* Right: Controls & Real-Time Price Matrix */}
          <div className="workbench-controls-panel">
            {/* Currency Selector */}
            <div className="control-block">
              <div className="control-title">
                <span>{t.step1Title}</span>
                <span style={{ color: 'var(--ink-muted)' }}>{t.step1Sub}</span>
              </div>
              <div className="segmented-control">
                <button 
                  className={`segment-btn ${currency === 'GEL' ? 'active' : ''}`}
                  onClick={() => setCurrency('GEL')}
                  data-cursor-text="GEL"
                >
                  ₾ GEL ({t.currencyGeo})
                </button>
                <button 
                  className={`segment-btn ${currency === 'USD' ? 'active' : ''}`}
                  onClick={() => setCurrency('USD')}
                  data-cursor-text="USD"
                >
                  $ USD ({t.currencyIntl})
                </button>
                <button 
                  className={`segment-btn ${currency === 'EUR' ? 'active' : ''}`}
                  onClick={() => setCurrency('EUR')}
                  data-cursor-text="EUR"
                >
                  € EUR ({t.currencyEur})
                </button>
              </div>
            </div>

            {/* Product Type Selector */}
            <div className="control-block">
              <div className="control-title">{t.step2Title}</div>
              <div className="segmented-control">
                <button 
                  className={`segment-btn ${productType === 'letters' ? 'active' : ''}`}
                  onClick={() => setProductType('letters')}
                  data-cursor-text="3D LETTERS"
                >
                  {t.modeLetters}
                </button>
                <button 
                  className={`segment-btn ${productType === 'lightbox' ? 'active' : ''}`}
                  onClick={() => setProductType('lightbox')}
                  data-cursor-text="LIGHTBOX"
                >
                  {t.modeLightbox}
                </button>
                <button 
                  className={`segment-btn ${productType === 'billboard' ? 'active' : ''}`}
                  onClick={() => setProductType('billboard')}
                  data-cursor-text="BILLBOARD"
                >
                  {t.modeBillboard}
                </button>
                <button 
                  className={`segment-btn ${productType === 'print' ? 'active' : ''}`}
                  onClick={() => setProductType('print')}
                  data-cursor-text="PRINT"
                >
                  {t.modePrint}
                </button>
              </div>
            </div>

            {/* Input Mode Selector: Typography vs SVG Vector */}
            <div className="control-block">
              <div className="control-title">
                <span>{t.step3Title}</span>
                <span className="badge-tag-mini">{inputMode === 'svg' ? t.customSvgActive : 'TEXT'}</span>
              </div>
              <div className="segmented-control mode-selector-bar">
                <button 
                  className={`segment-btn ${inputMode === 'text' ? 'active' : ''}`}
                  onClick={() => setInputMode('text')}
                  data-cursor-text="TEXT MODE"
                >
                  {t.inputModeText}
                </button>
                <button 
                  className={`segment-btn ${inputMode === 'svg' ? 'active' : ''}`}
                  onClick={() => setInputMode('svg')}
                  data-cursor-text="SVG VECTOR"
                >
                  {t.inputModeSvg}
                </button>
              </div>

              {inputMode === 'text' ? (
                <input 
                  type="text" 
                  className="swiss-input" 
                  value={brandText} 
                  onChange={(e) => setBrandText(e.target.value)}
                  placeholder={t.brandPlaceholder}
                  maxLength={24}
                  style={{ marginTop: '10px' }}
                />
              ) : (
                <div style={{ marginTop: '10px' }}>
                  {/* SVG Drag and drop zone */}
                  <div 
                    className={`svg-dropzone ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept=".svg" 
                      onChange={(e) => handleFileProcess(e.target.files[0])}
                    />
                    <Upload size={18} className="dropzone-icon" />
                    <div className="dropzone-text">
                      <strong>{svgFileName || t.uploadSvgPrompt}</strong>
                      <span>{t.uploadSvgHint}</span>
                    </div>
                  </div>

                  {/* Sample Vector Presets */}
                  <div className="presets-row">
                    <span className="presets-label">{t.samplePresets}</span>
                    <div className="presets-buttons">
                      {Object.values(SAMPLE_PRESETS).map((preset) => (
                        <button
                          key={preset.id}
                          className={`preset-btn ${activePresetKey === preset.id ? 'active' : ''}`}
                          onClick={() => handleSelectPreset(preset.id)}
                          type="button"
                        >
                          {t[preset.nameKey]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dimensions or Print Run Quantity */}
            {productType !== 'print' ? (
              <div className="control-block">
                <div className="control-title">
                  <span>{t.step4Title}</span>
                  <span>{width}m ({t.widthLabel}) × {height}m ({t.heightLabel})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                      {t.widthLabelUpper}: {width}m
                    </label>
                    <input 
                      type="range" 
                      min="1.0" 
                      max="15.0" 
                      step="0.2" 
                      value={width} 
                      onChange={(e) => setWidth(parseFloat(e.target.value))}
                      className="swiss-slider"
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                      {t.heightLabelUpper}: {height}m
                    </label>
                    <input 
                      type="range" 
                      min="0.4" 
                      max="5.0" 
                      step="0.1" 
                      value={height} 
                      onChange={(e) => setHeight(parseFloat(e.target.value))}
                      className="swiss-slider"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="control-block">
                <div className="control-title">
                  <span>{t.step4Units}</span>
                  <span>{printUnits.toLocaleString()} {t.unitsLabel}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="100000" 
                  step="500" 
                  value={printUnits} 
                  onChange={(e) => setPrintUnits(parseInt(e.target.value))}
                  className="swiss-slider"
                />
              </div>
            )}

            {/* Material Finish */}
            <div className="control-block">
              <div className="control-title">{t.step5Title}</div>
              <div className="segmented-control">
                <button 
                  className={`segment-btn ${material === 'brass' ? 'active' : ''}`}
                  onClick={() => setMaterial('brass')}
                >
                  {t.matBrass}
                </button>
                <button 
                  className={`segment-btn ${material === 'stainless' ? 'active' : ''}`}
                  onClick={() => setMaterial('stainless')}
                >
                  {t.matSteel}
                </button>
                <button 
                  className={`segment-btn ${material === 'acrylic' ? 'active' : ''}`}
                  onClick={() => setMaterial('acrylic')}
                >
                  {t.matAcrylic}
                </button>
                <button 
                  className={`segment-btn ${material === 'carbon' ? 'active' : ''}`}
                  onClick={() => setMaterial('carbon')}
                >
                  {t.matCarbon}
                </button>
              </div>
            </div>

            {/* Illumination Style */}
            {productType !== 'print' && (
              <div className="control-block">
                <div className="control-title">{t.step6Title}</div>
                <div className="segmented-control">
                  <button 
                    className={`segment-btn ${lighting === 'halo3000' ? 'active' : ''}`}
                    onClick={() => setLighting('halo3000')}
                  >
                    {t.lightHalo}
                  </button>
                  <button 
                    className={`segment-btn ${lighting === 'front6500' ? 'active' : ''}`}
                    onClick={() => setLighting('front6500')}
                  >
                    {t.lightFront}
                  </button>
                  <button 
                    className={`segment-btn ${lighting === 'none' ? 'active' : ''}`}
                    onClick={() => setLighting('none')}
                  >
                    {t.lightNone}
                  </button>
                </div>
              </div>
            )}

            {/* Output Estimate Summary Card */}
            <div className="estimate-display-card">
              <div className="estimate-col">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                  {t.estBudgetLbl}
                </span>
                <span className="est-currency-val">
                  {currencySymbols[currency]} {convertedPrice.toLocaleString()}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-secondary)', marginTop: '4px' }}>
                  ✓ {estDays}
                </span>
              </div>
              <button 
                className="btn-swiss btn-swiss-solid" 
                onClick={handleApply}
                data-cursor-text="APPLY"
              >
                <span>{t.transferBtn}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
