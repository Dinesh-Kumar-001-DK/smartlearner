import React, { useState, useRef } from 'react';

const GlowCard = ({ children, className = '', glowColor = 'violet' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const colorMap = {
    violet: { rgb: '155, 109, 255', border: 'rgba(155, 109, 255, 0.3)' },
    teal: { rgb: '0, 212, 180', border: 'rgba(0, 212, 180, 0.3)' },
    gold: { rgb: '240, 192, 64', border: 'rgba(240, 192, 64, 0.3)' }
  };

  const colors = colorMap[glowColor] || colorMap.violet;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 50, y: 50 });
      }}
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(26, 31, 42, 0.95), rgba(10, 13, 20, 0.98))',
        border: `1px solid ${colors.border}`
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(${colors.rgb}, 0.2) 0%, transparent 60%)`
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlowCard;
