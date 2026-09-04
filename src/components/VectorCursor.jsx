import React, { useEffect, useState, useRef } from 'react';

export default function VectorCursor() {
  const dotRef = useRef(null);
  const reticleWrapperRef = useRef(null);
  const coordsRef = useRef(null);

  const posRef = useRef({ x: -100, y: -100 });
  const trailingPosRef = useRef({ x: -100, y: -100 });

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

    let isVisible = false;

    const handleMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      if (!isVisible) {
        isVisible = true;
        setVisible(true);
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

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
    const handleMouseLeave = () => {
      isVisible = false;
      setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPointerFine]);

  // Smooth lerp for outer reticle without re-rendering React
  useEffect(() => {
    if (!isPointerFine) return;

    let animationFrame;
    const updateTrailing = () => {
      const target = posRef.current;
      const current = trailingPosRef.current;

      const nextX = current.x + (target.x - current.x) * 0.22;
      const nextY = current.y + (target.y - current.y) * 0.22;
      trailingPosRef.current = { x: nextX, y: nextY };

      if (reticleWrapperRef.current) {
        reticleWrapperRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
      }

      if (coordsRef.current && !hoverText) {
        coordsRef.current.textContent = `X:${Math.round(target.x)} Y:${Math.round(target.y)}`;
      }

      animationFrame = requestAnimationFrame(updateTrailing);
    };

    animationFrame = requestAnimationFrame(updateTrailing);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPointerFine, hoverText]);

  useEffect(() => {
    if (dotRef.current) {
      const { x, y } = posRef.current;
      dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${isClicked ? 0.7 : 1})`;
    }
  }, [isClicked]);

  if (!visible || !isPointerFine) return null;

  return (
    <div className="vector-cursor-container" style={{ pointerEvents: 'none' }}>
      {/* Precision Core Crosshair Point */}
      <div 
        ref={dotRef}
        className={`vector-cursor-dot ${isClicked ? 'clicked' : ''}`}
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" className="cursor-cross-svg">
          <line x1="9" y1="0" x2="9" y2="18" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1" />
          <circle cx="9" cy="9" r="2" fill="currentColor" />
        </svg>
      </div>

      {/* Floating Geometric Vector Reticle */}
      <div 
        ref={reticleWrapperRef}
        className="vector-cursor-reticle-wrapper"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
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
          <div ref={coordsRef} className="cursor-coords-tag">
            {hoverText}
          </div>
        </div>
      </div>
    </div>
  );
}

