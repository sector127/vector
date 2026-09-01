import React, { useEffect, useState } from 'react';

export default function VectorCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const [visible, setVisible] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(() => {
    return typeof window !== 'undefined' && window.matchMedia 
      ? window.matchMedia('(pointer: fine)').matches 
      : true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(pointer: fine)');
    const handler = (e) => setIsPointerFine(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isPointerFine) return;

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);

      // Check if hovering over interactive element
      const target = e.target.closest('button, a, input, [data-interactive="true"], .interactive-node');
      if (target) {
        setIsHovered(true);
        const customText = target.getAttribute('data-cursor-text') || '';
        setHoverText(customText);
      } else {
        setIsHovered(false);
        setHoverText('');
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [visible, isPointerFine]);

  // Smooth lerp for outer reticle
  useEffect(() => {
    let animationFrame;
    const updateTrailing = () => {
      setTrailingPos(prev => ({
        x: prev.x + (pos.x - prev.x) * 0.22,
        y: prev.y + (pos.y - prev.y) * 0.22
      }));
      animationFrame = requestAnimationFrame(updateTrailing);
    };
    animationFrame = requestAnimationFrame(updateTrailing);
    return () => cancelAnimationFrame(animationFrame);
  }, [pos]);

  if (!visible || !isPointerFine) return null;

  return (
    <div className="vector-cursor-container" style={{ pointerEvents: 'none' }}>
      {/* Precision Core Crosshair Point */}
      <div 
        className="vector-cursor-dot"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${isClicked ? 0.7 : 1})`,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" className="cursor-cross-svg">
          <line x1="9" y1="0" x2="9" y2="18" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1" />
          <circle cx="9" cy="9" r="2" fill="currentColor" />
        </svg>
      </div>

      {/* Floating Geometric Vector Reticle */}
      <div 
        className="vector-cursor-reticle-wrapper"
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`,
        }}
      >
        <div className={`vector-cursor-reticle ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}>
          <svg width="64" height="64" viewBox="0 0 64 64" className="reticle-svg">
            {/* Corner brackets */}
            <path d="M 16 22 L 16 16 L 22 16" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 48 22 L 48 16 L 42 16" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 16 42 L 16 48 L 22 48" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 48 42 L 48 48 L 42 48" fill="none" stroke="currentColor" strokeWidth="1.2" />
            
            {isHovered && (
              <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" className="spin-circle" />
            )}
          </svg>

          {/* Dynamic Coordinate Readout */}
          <div className="cursor-coords-tag">
            {hoverText ? hoverText : `X:${Math.round(pos.x)} Y:${Math.round(pos.y)}`}
          </div>
        </div>
      </div>
    </div>
  );
}
