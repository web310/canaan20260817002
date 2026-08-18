import React, { useState } from 'react';
import { Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import parkingCorrectMapImg from '../assets/images/church_parking_correct_map_1786787812880.jpg';
import { Car, Navigation, Map, Compass, ZoomIn, X, Info, Layers, ExternalLink, ArrowUp } from 'lucide-react';

interface ParkingMapGuideProps {
  lang: Language;
}

export const ParkingMapGuide: React.FC<ParkingMapGuideProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'schematic' | 'satellite' | 'google'>('schematic');
  const [showModal, setShowModal] = useState(false);

  const parkingMapsUrl = "https://maps.google.com/?q=W+253rd+St+%26+S+Western+Ave,+Harbor+City,+CA+90710";

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Header with Switcher Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Car className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{lang === 'zh' ? '交通導航與專屬停車場' : 'Parking & Navigation Guide'}</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 font-medium">
                {lang === 'zh' ? '免費停車' : 'Free Parking'}
              </span>
            </div>
            <div className="text-[11px] text-amber-400/90 font-medium">
              {lang === 'zh' ? '⭐ 入口請由 W 253rd St 轉入' : '⭐ Entrance on W 253rd St'}
            </div>
          </div>
        </div>

        {/* 3-Way Mode Switcher */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('schematic')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
              activeTab === 'schematic'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '動線圖解' : 'Route Diagram'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('satellite')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
              activeTab === 'satellite'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '衛星空照' : 'Aerial View'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
              activeTab === 'google'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? 'Google 地圖' : 'Google Map'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-200">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-300">
            {lang === 'zh' ? '🚗 特別注意：停車場入口在 W 253rd St' : '🚗 Important Notice: Parking Entrance on W 253rd St'}
          </div>
          <div className="text-[11px] text-slate-300 leading-relaxed">
            {lang === 'zh'
              ? '教會正門面向 S. Western Ave，但專屬免費停車場位於教會後方（北側）。開車請由 Western Ave 轉進 W 253rd St（東向），經過教會主堂後右轉進入車道即可直達停車場。'
              : 'The church faces S. Western Ave, but the dedicated free parking lot is located behind (North of) the building. Turn from Western Ave onto W 253rd St, pass the church, and turn into the driveway.'}
          </div>
        </div>
      </div>

      {/* Map View Canvas Area */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-slate-950 overflow-hidden relative border border-slate-700 shadow-inner group">
        
        {/* TAB 1: Precision Schematic SVG Map */}
        {activeTab === 'schematic' && (
          <div className="relative w-full h-full bg-slate-950 flex items-center justify-center p-2 cursor-pointer" onClick={() => setShowModal(true)}>
            <svg
              viewBox="0 0 800 480"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}
            >
              {/* Background Ground */}
              <rect width="800" height="480" fill="#0f172a" />
              
              {/* Surrounding Residential Areas (Subtle Gray Blocks) */}
              <rect x="20" y="20" width="130" height="340" fill="#1e293b" rx="6" opacity="0.6" />
              <rect x="520" y="20" width="260" height="340" fill="#1e293b" rx="6" opacity="0.6" />
              <rect x="20" y="440" width="760" height="30" fill="#1e293b" rx="4" opacity="0.4" />

              {/* S. Western Ave (Vertical Road on the Left - Running North/South) */}
              <rect x="160" y="0" width="100" height="480" fill="#334155" />
              {/* Center dashed line for S Western Ave */}
              <line x1="210" y1="0" x2="210" y2="480" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="12 8" opacity="0.75" />
              
              {/* W. 253rd St (Horizontal Road along the Bottom - Running East/West) */}
              <rect x="0" y="370" width="800" height="70" fill="#334155" />
              {/* Center dashed line for W 253rd St */}
              <line x1="0" y1="405" x2="800" y2="405" stroke="#f59e0b" strokeWidth="2" strokeDasharray="10 8" opacity="0.75" />

              {/* Intersection Box */}
              <rect x="160" y="370" width="100" height="70" fill="#334155" />
              {/* Crosswalk markings */}
              <line x1="165" y1="373" x2="255" y2="373" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="165" y1="437" x2="255" y2="437" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="163" y1="375" x2="163" y2="435" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="257" y1="375" x2="257" y2="435" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />

              {/* Church Property Area */}
              <rect x="270" y="40" width="240" height="320" fill="#0f2338" rx="8" stroke="#1e3a5f" strokeWidth="2" />

              {/* CHURCH PARKING LOT (North / Above Church Building) */}
              <g>
                <rect x="280" y="50" width="220" height="150" fill="#1e293b" rx="6" stroke="#475569" strokeWidth="1.5" />
                {/* Parking Stall Lines (Top Row) */}
                <line x1="290" y1="50" x2="290" y2="90" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 0" />
                <line x1="315" y1="50" x2="315" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="340" y1="50" x2="340" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="365" y1="50" x2="365" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="390" y1="50" x2="390" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="415" y1="50" x2="415" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="440" y1="50" x2="440" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                
                {/* Parking Stall Lines (Bottom Row) */}
                <line x1="290" y1="160" x2="290" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="315" y1="160" x2="315" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="340" y1="160" x2="340" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="365" y1="160" x2="365" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="390" y1="160" x2="390" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="415" y1="160" x2="415" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="440" y1="160" x2="440" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Parking Lot Label Badge */}
                <rect x="290" y="105" width="165" height="38" rx="6" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
                <text x="372" y="122" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                  🅿️ 免費專屬停車場
                </text>
                <text x="372" y="136" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Church Free Parking
                </text>
              </g>

              {/* MAIN CHURCH BUILDING (South / Corner of Western & 253rd) */}
              <g>
                <rect x="280" y="215" width="170" height="140" fill="#451a03" rx="8" stroke="#d97706" strokeWidth="2" />
                {/* Cross symbol */}
                <rect x="360" y="235" width="10" height="32" fill="#fbbf24" rx="2" />
                <rect x="350" y="243" width="30" height="10" fill="#fbbf24" rx="2" />
                
                {/* Church Building Name */}
                <text x="365" y="292" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                  加南新生基督教會
                </text>
                <text x="365" y="308" fill="#fde68a" fontSize="10" textAnchor="middle">
                  Canaan Shin Sheng Church
                </text>
                <text x="365" y="324" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">
                  25226 S. Western Ave
                </text>
              </g>

              {/* Dedicated Driveway on the East (Right) Side of Church */}
              <rect x="455" y="180" width="55" height="190" fill="#334155" stroke="#475569" strokeWidth="1" />
              <text x="482" y="275" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle" transform="rotate(90 482 275)">
                停車場專用車道 (Driveway)
              </text>

              {/* DEFINING THE ARROW MARKER */}
              <defs>
                <marker id="red-arrowhead" markerWidth="10" markerHeight="8" refX="7" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#ef4444" />
                </marker>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* RED NAVIGATION ROUTE LINE (Matching user reference) */}
              {/* 1. Starts along W 253rd St heading East */}
              {/* 2. Turns NORTH (UP) into East Driveway */}
              {/* 3. Curves into the Parking Lot stalls */}
              <path
                d="M 230,418 L 482,418 Q 488,418 488,405 L 488,140 Q 488,125 470,125 L 450,125"
                fill="none"
                stroke="#ef4444"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                markerEnd="url(#red-arrowhead)"
              />

              {/* Animated pulses along the red path */}
              <circle cx="250" cy="418" r="5" fill="#fef08a">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="488" cy="340" r="5" fill="#fef08a">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="460" cy="125" r="5" fill="#fef08a">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
              </circle>

              {/* Step Badges along the path */}
              <g transform="translate(240, 426)">
                <rect x="-10" y="0" width="130" height="24" rx="12" fill="#ef4444" />
                <text x="55" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ① 沿 W 253rd St 前行
                </text>
              </g>

              <g transform="translate(496, 320)">
                <rect x="0" y="-12" width="120" height="24" rx="12" fill="#ef4444" />
                <text x="60" y="4" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ② 轉入專用車道
                </text>
              </g>

              {/* ROAD LABELS */}
              {/* S. Western Ave Label */}
              <g transform="translate(210, 80)">
                <rect x="-70" y="-14" width="140" height="28" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                <text x="0" y="5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                  S. Western Ave (213)
                </text>
              </g>
              {/* North Arrow icon near Western Ave */}
              <g transform="translate(210, 25)">
                <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                <path d="M 0,-8 L -5,4 L 0,1 L 5,4 Z" fill="#f59e0b" />
                <text x="0" y="18" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">N</text>
              </g>

              {/* W. 253rd St Label */}
              <g transform="translate(80, 395)">
                <rect x="-65" y="-13" width="130" height="26" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                <text x="0" y="4" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                  W. 253rd St
                </text>
              </g>

              <g transform="translate(680, 395)">
                <rect x="-65" y="-13" width="130" height="26" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                <text x="0" y="4" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                  W. 253rd St
                </text>
              </g>
            </svg>

            {/* Click to enlarge tag */}
            <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-amber-300 flex items-center space-x-1">
              <ZoomIn className="w-3 h-3 text-amber-400" />
              <span>{lang === 'zh' ? '點擊放大圖解' : 'Click to Enlarge'}</span>
            </div>
          </div>
        )}

        {/* TAB 2: Satellite Aerial Image */}
        {activeTab === 'satellite' && (
          <div className="relative w-full h-full cursor-pointer" onClick={() => setShowModal(true)}>
            <img
              src={parkingCorrectMapImg}
              alt="Canaan Church Parking Lot Satellite Aerial View"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlay Tag */}
            <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-amber-500/40 text-[11px] text-amber-300 font-semibold flex items-center space-x-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{lang === 'zh' ? '📍 北方朝上：車道由 W 253rd St 轉入後方停車場' : '📍 North is UP: Turn onto W 253rd St'}</span>
            </div>
            <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white text-xs font-bold backdrop-blur-[1px]">
              <ZoomIn className="w-4 h-4 text-amber-400" />
              <span>{lang === 'zh' ? '點擊放大衛星空照圖' : 'Click to Enlarge Aerial Photo'}</span>
            </div>
          </div>
        )}

        {/* TAB 3: Google Maps Live Embedded */}
        {activeTab === 'google' && (
          <iframe
            title="Church Location Map"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            src="https://maps.google.com/maps?q=25226+S+Western+Ave,+Harbor+City,+CA+90710&t=k&z=19&ie=UTF8&iwloc=&output=embed"
          />
        )}
      </div>

      {/* 3-Step Clear Driving Route Guide */}
      <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2 text-xs">
        <div className="text-[11px] font-bold text-amber-300 flex items-center space-x-1.5">
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'zh' ? '正確行車動線導引（北方朝上）：' : 'Driving Route Guide (North Oriented Up):'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 flex items-start space-x-2">
            <span className="bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0">1</span>
            <span className="text-slate-300">
              {lang === 'zh' ? '沿 S Western Ave 行駛，於路口轉入 W 253rd St（往東）' : 'Turn from S. Western Ave onto W 253rd St heading east'}
            </span>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 flex items-start space-x-2">
            <span className="bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0">2</span>
            <span className="text-slate-300">
              {lang === 'zh' ? '沿 W 253rd St 前行過教會建築，轉入東側專用車道' : 'Drive along W 253rd St past church, turn into east driveway'}
            </span>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 flex items-start space-x-2">
            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0">3</span>
            <span className="text-slate-300">
              {lang === 'zh' ? '順著車道往北直行，即可駛入教會後方免費停車場' : 'Follow driveway North into the dedicated rear parking lot'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <a
          href={parkingMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{lang === 'zh' ? 'Google 導航至 W 253rd St 入口' : 'Navigate to W 253rd St Entrance'}</span>
        </a>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
        >
          <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'zh' ? '放大完整路線圖解' : 'Enlarge Route Diagram'}</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center space-x-2">
                <Car className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-serif font-bold text-white text-base sm:text-lg">
                    {lang === 'zh' ? '加南新生基督教會 停車場入口指引圖（北方朝上）' : 'Canaan Church Parking Lot Map (North Up)'}
                  </h4>
                  <p className="text-xs text-amber-300">
                    {lang === 'zh' ? '📍 停車場位於教會後方北側，入口由 W 253rd St 轉入' : '📍 Dedicated Lot is North of building, entrance from W 253rd St'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 sm:p-6 bg-slate-950 flex-1 overflow-auto flex items-center justify-center">
              {activeTab === 'schematic' ? (
                <div className="w-full max-w-3xl">
                  <svg
                    viewBox="0 0 800 480"
                    className="w-full h-auto select-none rounded-xl"
                  >
                    <rect width="800" height="480" fill="#0f172a" />
                    <rect x="20" y="20" width="130" height="340" fill="#1e293b" rx="6" opacity="0.6" />
                    <rect x="520" y="20" width="260" height="340" fill="#1e293b" rx="6" opacity="0.6" />
                    <rect x="20" y="440" width="760" height="30" fill="#1e293b" rx="4" opacity="0.4" />

                    <rect x="160" y="0" width="100" height="480" fill="#334155" />
                    <line x1="210" y1="0" x2="210" y2="480" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="12 8" opacity="0.75" />
                    
                    <rect x="0" y="370" width="800" height="70" fill="#334155" />
                    <line x1="0" y1="405" x2="800" y2="405" stroke="#f59e0b" strokeWidth="2" strokeDasharray="10 8" opacity="0.75" />

                    <rect x="160" y="370" width="100" height="70" fill="#334155" />
                    <line x1="165" y1="373" x2="255" y2="373" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="165" y1="437" x2="255" y2="437" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />

                    <rect x="270" y="40" width="240" height="320" fill="#0f2338" rx="8" stroke="#1e3a5f" strokeWidth="2" />

                    <g>
                      <rect x="280" y="50" width="220" height="150" fill="#1e293b" rx="6" stroke="#475569" strokeWidth="1.5" />
                      <line x1="290" y1="50" x2="290" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="315" y1="50" x2="315" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="340" y1="50" x2="340" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="365" y1="50" x2="365" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="390" y1="50" x2="390" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="415" y1="50" x2="415" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="440" y1="50" x2="440" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
                      
                      <line x1="290" y1="160" x2="290" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="315" y1="160" x2="315" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="340" y1="160" x2="340" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="365" y1="160" x2="365" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="390" y1="160" x2="390" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="415" y1="160" x2="415" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="440" y1="160" x2="440" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />

                      <rect x="290" y="105" width="165" height="38" rx="6" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
                      <text x="372" y="122" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                        🅿️ 免費專屬停車場
                      </text>
                      <text x="372" y="136" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle">
                        Church Free Parking
                      </text>
                    </g>

                    <g>
                      <rect x="280" y="215" width="170" height="140" fill="#451a03" rx="8" stroke="#d97706" strokeWidth="2" />
                      <rect x="360" y="235" width="10" height="32" fill="#fbbf24" rx="2" />
                      <rect x="350" y="243" width="30" height="10" fill="#fbbf24" rx="2" />
                      
                      <text x="365" y="292" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                        加南新生基督教會
                      </text>
                      <text x="365" y="308" fill="#fde68a" fontSize="10" textAnchor="middle">
                        Canaan Shin Sheng Church
                      </text>
                      <text x="365" y="324" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">
                        25226 S. Western Ave
                      </text>
                    </g>

                    <rect x="455" y="180" width="55" height="190" fill="#334155" stroke="#475569" strokeWidth="1" />
                    <text x="482" y="275" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle" transform="rotate(90 482 275)">
                      停車場專用車道 (Driveway)
                    </text>

                    <defs>
                      <marker id="modal-red-arrow" markerWidth="10" markerHeight="8" refX="7" refY="4" orient="auto">
                        <polygon points="0 0, 10 4, 0 8" fill="#ef4444" />
                      </marker>
                    </defs>

                    <path
                      d="M 230,418 L 482,418 Q 488,418 488,405 L 488,140 Q 488,125 470,125 L 450,125"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd="url(#modal-red-arrow)"
                    />

                    <g transform="translate(240, 426)">
                      <rect x="-10" y="0" width="130" height="24" rx="12" fill="#ef4444" />
                      <text x="55" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                        ① 沿 W 253rd St 前行
                      </text>
                    </g>

                    <g transform="translate(496, 320)">
                      <rect x="0" y="-12" width="120" height="24" rx="12" fill="#ef4444" />
                      <text x="60" y="4" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                        ② 轉入專用車道
                      </text>
                    </g>

                    <g transform="translate(210, 80)">
                      <rect x="-70" y="-14" width="140" height="28" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                      <text x="0" y="5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                        S. Western Ave (213)
                      </text>
                    </g>
                    <g transform="translate(210, 25)">
                      <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                      <path d="M 0,-8 L -5,4 L 0,1 L 5,4 Z" fill="#f59e0b" />
                      <text x="0" y="18" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">N</text>
                    </g>

                    <g transform="translate(80, 395)">
                      <rect x="-65" y="-13" width="130" height="26" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                      <text x="0" y="4" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                        W. 253rd St
                      </text>
                    </g>
                    <g transform="translate(680, 395)">
                      <rect x="-65" y="-13" width="130" height="26" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                      <text x="0" y="4" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                        W. 253rd St
                      </text>
                    </g>
                  </svg>
                </div>
              ) : (
                <img
                  src={parkingCorrectMapImg}
                  alt="Detailed Church Parking Lot Map on W 253rd St"
                  referrerPolicy="no-referrer"
                  className="max-h-[65vh] w-auto object-contain rounded-2xl border border-slate-800 shadow-xl"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-300">
                <span className="font-bold text-white">{CHURCH_INFO.nameZh}：</span>
                <span>25226 S. Western Ave, Harbor City, CA 90710</span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <a
                  href={parkingMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '開啟 Google 導航' : 'Navigate in Google Maps'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  {lang === 'zh' ? '關閉' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
