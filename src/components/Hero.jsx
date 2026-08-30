import React, { useState, useRef } from 'react';
import { ArrowDownRight, Compass, Sparkles, Sliders } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function Hero({ lang, onOpenInquiry }) {
  const t = translations[lang] || translations.ka;

  // Interactive Vector Node State for live Bezier manipulation
  const [nodes, setNodes] = useState([
    { x: 70, y: 310, id: 1 },
    { x: 180, y: 60, id: 2 },
    { x: 300, y: 60, id: 3 },
    { x: 410, y: 310, id: 4 }
  ]);
  const [activePreset, setActivePreset] = useState('letters'); // 'letters', 'billboard', 'lightbox'
  const [draggingNode, setDraggingNode] = useState(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const cardRef = useRef(null);
  const svgRef = useRef(null);

  const presets = {
    letters: [
      { x: 70, y: 310 },
      { x: 180, y: 60 },
      { x: 300, y: 60 },
      { x: 410, y: 310 }
    ],
    billboard: [
      { x: 60, y: 120 },
      { x: 420, y: 120 },
      { x: 420, y: 280 },
      { x: 60, y: 280 }
    ],
    lightbox: [
      { x: 90, y: 80 },
      { x: 390, y: 80 },
      { x: 390, y: 310 },
      { x: 90, y: 310 }
    ]
  };

  const setPreset = (name) => {
    setActivePreset(name);
    setNodes(presets[name].map((p, i) => ({ ...p, id: i + 1 })));
  };

  // 3D Perspective Tilt on Mouse Movement
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rx = -(y / (rect.height / 2)) * 8;
    const ry = (x / (rect.width / 2)) * 10;
    setTilt({ rx, ry });

    if (draggingNode && svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const scaleX = 480 / svgRect.width;
      const scaleY = 380 / svgRect.height;
      const nodeX = Math.max(30, Math.min(450, (e.clientX - svgRect.left) * scaleX));
      const nodeY = Math.max(30, Math.min(350, (e.clientY - svgRect.top) * scaleY));
      setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x: nodeX, y: nodeY } : n));
    }
  };

  const handleTouchMove = (e) => {
    if (draggingNode && svgRef.current && e.touches.length > 0) {
      const touch = e.touches[0];
      const svgRect = svgRef.current.getBoundingClientRect();
      const scaleX = 480 / svgRect.width;
      const scaleY = 380 / svgRect.height;
      const nodeX = Math.max(30, Math.min(450, (touch.clientX - svgRect.left) * scaleX));
      const nodeY = Math.max(30, Math.min(350, (touch.clientY - svgRect.top) * scaleY));
      setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x: nodeX, y: nodeY } : n));
    }
  };

  const handleCardMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setDraggingNode(null);
  };

  const handleMouseDown = (id) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingNode(id);
  };

  const handleTouchStart = (id) => (e) => {
    e.stopPropagation();
    setDraggingNode(id);
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  // Calculate curve or polygon path
  const pathD = `M ${nodes[0].x} ${nodes[0].y} C ${nodes[1].x} ${nodes[1].y}, ${nodes[2].x} ${nodes[2].y}, ${nodes[3].x} ${nodes[3].y}`;
  const straightD = `M ${nodes[0].x} ${nodes[0].y} L ${nodes[1].x} ${nodes[1].y} L ${nodes[2].x} ${nodes[2].y} L ${nodes[3].x} ${nodes[3].y} Z`;

  return (
    <section className="hero-editorial" id="hero" onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
      <div className="container hero-main-grid">
        {/* Left Column: Bold Typographic Statement */}
        <div className="hero-statement-col">
          <div>
            <div className="hero-meta-bar">
              <span className="live-dot-indicator"></span>
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="hero-headline-massive">
              {t.heroTitleLine1}<br />
              {t.heroTitleLine2}<br />
              {t.heroTitleLine3}<br />
              {t.heroTitleLine4}
            </h1>

            <p className="hero-subparagraph">
              {t.heroDesc}
            </p>

            <div className="hero-cta-strip">
              <a href="#workbench" className="btn-swiss btn-swiss-solid" data-cursor-text={t.heroBtnStudio.toUpperCase()}>
                <span>{t.heroBtnStudio}</span>
                <ArrowDownRight size={16} />
              </a>
              <a href="#tbilisi-network" className="btn-swiss" data-cursor-text={t.heroBtnMedia.toUpperCase()}>
                <span>{t.heroBtnMedia}</span>
              </a>
            </div>
          </div>

          {/* Metric Summary Strip */}
          <div className="hero-metrics-grid">
            <div className="hero-metric-cell">
              <span className="metric-val">{t.metric1Val}</span>
              <span className="metric-lbl">{t.metric1Lbl}</span>
            </div>
            <div className="hero-metric-cell">
              <span className="metric-val">{t.metric2Val}</span>
              <span className="metric-lbl">{t.metric2Lbl}</span>
            </div>
            <div className="hero-metric-cell">
              <span className="metric-val">{t.metric3Val}</span>
              <span className="metric-lbl">{t.metric3Lbl}</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Tilting Interactive Vector Canvas */}
        <div 
          className="hero-canvas-card"
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          onTouchMove={handleTouchMove}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: draggingNode ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="canvas-header-bar">
            <span style={{ fontWeight: '700' }}>{t.toolpathTitle}</span>
            <div className="canvas-mode-pills">
              <button 
                className={`mode-pill-btn ${activePreset === 'letters' ? 'active' : ''}`}
                onClick={() => setPreset('letters')}
                data-cursor-text={t.modeLetters.toUpperCase()}
              >
                {t.modeLetters}
              </button>
              <button 
                className={`mode-pill-btn ${activePreset === 'billboard' ? 'active' : ''}`}
                onClick={() => setPreset('billboard')}
                data-cursor-text={t.modeBillboard.toUpperCase()}
              >
                {t.modeBillboard}
              </button>
              <button 
                className={`mode-pill-btn ${activePreset === 'lightbox' ? 'active' : ''}`}
                onClick={() => setPreset('lightbox')}
                data-cursor-text={t.modeLightbox.toUpperCase()}
              >
                {t.modeLightbox}
              </button>
            </div>
          </div>

          <div 
            className="canvas-interactive-area" 
            ref={svgRef}
          >
            <svg viewBox="0 0 480 380" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Construction Reference Grid */}
              <line x1="0" y1="190" x2="480" y2="190" stroke="var(--ink-hairline)" strokeDasharray="3 3" />
              <line x1="240" y1="0" x2="240" y2="380" stroke="var(--ink-hairline)" strokeDasharray="3 3" />

              {/* Tangent Guide Lines */}
              <line x1={nodes[0].x} y1={nodes[0].y} x2={nodes[1].x} y2={nodes[1].y} stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1={nodes[3].x} y1={nodes[3].y} x2={nodes[2].x} y2={nodes[2].y} stroke="var(--ink-hairline)" strokeWidth="1" strokeDasharray="2 2" />

              {/* Extruded Isometric Depth Vectors */}
              <path 
                d={`M ${nodes[0].x + 22} ${nodes[0].y - 22} L ${nodes[1].x + 22} ${nodes[1].y - 22} L ${nodes[2].x + 22} ${nodes[2].y - 22} L ${nodes[3].x + 22} ${nodes[3].y - 22}`} 
                fill="none" 
                stroke="var(--ink-muted)" 
                strokeWidth="1.2" 
                strokeDasharray="4 4" 
              />
              <line x1={nodes[0].x} y1={nodes[0].y} x2={nodes[0].x + 22} y2={nodes[0].y - 22} stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1={nodes[1].x} y1={nodes[1].y} x2={nodes[1].x + 22} y2={nodes[1].y - 22} stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1={nodes[2].x} y1={nodes[2].y} x2={nodes[2].x + 22} y2={nodes[2].y - 22} stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1={nodes[3].x} y1={nodes[3].y} x2={nodes[3].x + 22} y2={nodes[3].y - 22} stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="2 2" />

              {/* Primary Rendered Vector Toolpath */}
              <path 
                d={activePreset === 'letters' ? pathD : straightD} 
                fill={activePreset === 'lightbox' ? "rgba(0,0,0,0.03)" : "none"} 
                stroke="var(--ink-primary)" 
                strokeWidth="3" 
              />

              {/* Interactive Draggable Anchor Nodes */}
              {nodes.map((node, i) => (
                <g 
                  key={node.id} 
                  onMouseDown={handleMouseDown(node.id)} 
                  onTouchStart={handleTouchStart(node.id)}
                  style={{ cursor: 'grab', touchAction: 'none' }}
                  data-cursor-text={`P${i+1}`}
                >
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r="12" 
                    fill="var(--bg-main)" 
                    stroke="var(--ink-primary)" 
                    strokeWidth="2.5" 
                  />
                  <circle cx={node.x} cy={node.y} r="4" fill="var(--ink-primary)" />
                  <text 
                    x={node.x + 16} 
                    y={node.y - 8} 
                    fill="var(--ink-secondary)" 
                    fontSize="11" 
                    fontFamily="Space Mono"
                    fontWeight="700"
                  >
                    P{i+1}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="canvas-footer-hud">
            <div><strong>{t.toolpathHudMode}:</strong> {activePreset.toUpperCase()}</div>
            <div><strong>{t.toolpathHudPrecision}:</strong> CAD</div>
            <div><strong>{t.toolpathHudStatus}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}
