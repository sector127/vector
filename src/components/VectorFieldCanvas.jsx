import React, { useEffect, useRef } from 'react';

export default function VectorFieldCanvas({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    // Reduced motion: draw the grid once (and on resize) instead of running the loop
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse state
    let mouse = { x: width / 2, y: height / 2, radius: 180, isMoving: false };
    let mouseVelocity = { x: 0, y: 0 };
    let lastMouse = { x: width / 2, y: height / 2 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
      if (reduceMotion) render();
      else wake();
    };

    const handleMouseMove = (e) => {
      mouseVelocity.x = e.clientX - lastMouse.x;
      mouseVelocity.y = e.clientY - lastMouse.y;
      lastMouse.x = e.clientX;
      lastMouse.y = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isMoving = true;
      wake();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Grid of geometric vector anchor points
    let points = [];
    const spacing = 70;

    const initGrid = () => {
      points = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const originX = i * spacing;
          const originY = j * spacing;
          points.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0,
            angle: 0
          });
        }
      }
    };

    initGrid();

    // The loop only runs while something moves: once the cursor rests and every node has
    // sprung back, it stops, and the next mousemove wakes it. Touch devices draw once and idle.
    let running = false;
    const wake = () => {
      if (running || reduceMotion || document.hidden) return;
      running = true;
      animationFrameId = requestAnimationFrame(render);
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      let maxMove = 0;

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const strokeColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
      const activeLineColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.22)';

      // Draw subtle grid points and vector direction arrows
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Distance to mouse
        const dx = mouse.x - p.originX;
        const dy = mouse.y - p.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Vector displacement calculation (magnetic field)
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 22;
          const angle = Math.atan2(dy, dx);
          p.x = p.originX - Math.cos(angle) * force;
          p.y = p.originY - Math.sin(angle) * force;
          p.angle = angle;
        } else {
          // Spring back to origin
          const stepX = (p.originX - p.x) * 0.1;
          const stepY = (p.originY - p.y) * 0.1;
          p.x += stepX;
          p.y += stepY;
          maxMove = Math.max(maxMove, Math.abs(stepX), Math.abs(stepY));
        }

        // Draw crosshair node
        ctx.strokeStyle = dist < mouse.radius ? activeLineColor : strokeColor;
        ctx.lineWidth = dist < mouse.radius ? 1 : 0.6;

        // Draw node tick mark
        const tickSize = dist < mouse.radius ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(p.x - tickSize, p.y);
        ctx.lineTo(p.x + tickSize, p.y);
        ctx.moveTo(p.x, p.y - tickSize);
        ctx.lineTo(p.x, p.y + tickSize);
        ctx.stroke();

        // If near cursor, draw reactive vector directional rays
        if (dist < mouse.radius * 0.8) {
          ctx.strokeStyle = activeLineColor;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.cos(p.angle) * 8, p.y + Math.sin(p.angle) * 8);
          ctx.stroke();
        }
      }

      // Draw interactive laser connection between cursor and closest vector nodes
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 4]);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      const settled = !mouse.isMoving && maxMove < 0.05;
      mouse.isMoving = false;
      if (!document.hidden && !reduceMotion && !settled) {
        running = true;
        animationFrameId = requestAnimationFrame(render);
      } else {
        running = false;
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        cancelAnimationFrame(animationFrameId);
        running = false;
        render();
      }
    };

    render();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="vector-field-canvas" 
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
