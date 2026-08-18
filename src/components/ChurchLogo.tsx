import React from 'react';
import churchLogoImg from '../assets/images/canaan_church_logo_1787020807712.jpg';

interface ChurchLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'art' | 'vector' | 'badge';
  lightMode?: boolean;
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'art',
  lightMode = false,
}) => {
  // Determine pixel size
  let pxSize = 36;
  if (typeof size === 'number') {
    pxSize = size;
  } else {
    switch (size) {
      case 'sm': pxSize = 28; break;
      case 'md': pxSize = 38; break;
      case 'lg': pxSize = 48; break;
      case 'xl': pxSize = 64; break;
    }
  }

  if (variant === 'art') {
    return (
      <div 
        className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden shadow-sm border ${
          lightMode 
            ? 'bg-white/95 border-amber-900/10' 
            : 'bg-white border-amber-500/20'
        } ${className}`}
        style={{ width: `${pxSize}px`, height: `${pxSize}px` }}
      >
        <img
          src={churchLogoImg}
          alt="Canaan Christian Church Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform scale-105"
        />
      </div>
    );
  }

  // Vector SVG implementation reproducing the artistic red brush-stroke church
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: `${pxSize}px`, height: `${pxSize}px` }}
    >
      <svg
        viewBox="0 0 100 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Subtle geometric mosaic background squares */}
        <g opacity="0.18">
          <rect x="18" y="32" width="10" height="10" fill="#94A3B8" rx="1.5" />
          <rect x="72" y="36" width="9" height="9" fill="#64748B" rx="1.5" />
          <rect x="12" y="70" width="11" height="11" fill="#94A3B8" rx="1.5" />
          <rect x="78" y="65" width="12" height="12" fill="#475569" rx="2" />
          <rect x="22" y="112" width="10" height="10" fill="#64748B" rx="1.5" />
          <rect x="8" y="130" width="10" height="10" fill="#94A3B8" rx="1.5" />
          <rect x="82" y="125" width="10" height="10" fill="#94A3B8" rx="1.5" />
        </g>

        {/* Top Cross - Brush stroke look */}
        <path
          d="M 50 10 L 50 32 M 42 18 L 58 18"
          stroke="#B91C1C"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Steeple Peak & Main Roof Triangle */}
        <path
          d="M 50 30 L 26 112 M 50 30 L 68 110"
          stroke="#B91C1C"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3D Right Steeple Bevel facet */}
        <path
          d="M 50 30 L 80 106 L 68 110"
          stroke="#991B1B"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Church Base Sanctuary Box */}
        <path
          d="M 28 116 L 64 116 L 64 150 L 28 150 Z"
          stroke="#B91C1C"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3D Sanctuary Right Side Depth */}
        <path
          d="M 64 116 L 78 114 L 78 144 L 64 150"
          stroke="#991B1B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Horizontal Hatched Sketch Shading in Sanctuary */}
        <path
          d="M 34 125 L 58 125 M 32 133 L 60 133 M 35 141 L 56 141"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* 3D Side Shading */}
        <path
          d="M 68 123 L 74 122 M 68 131 L 75 130 M 67 139 L 74 138"
          stroke="#B91C1C"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
