import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Share2,
  Coins,
  Bug,
  Globe2,
  KeyRound,
  Clock,
  FileCheck,
  FileText,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Play
} from 'lucide-react';

interface NavbarProps {
  onOpenAssistant: () => void;
  onOpenDemo: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

// Pixel-perfect SVG Curly Braces matching the screenshot
const LeftBrace: React.FC = () => (
  <svg
    className="w-4 h-9 md:w-5 md:h-11 text-slate-800 shrink-0 select-none mr-1.5 transition-transform duration-200 hover:scale-105"
    viewBox="0 0 24 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 6 C10 6 10 21 10 27 C10 30.5 4 32 2 32 C4 32 10 33.5 10 37 C10 43 10 58 19 58" />
  </svg>
);

const RightBrace: React.FC = () => (
  <svg
    className="w-4 h-9 md:w-5 md:h-11 text-slate-800 shrink-0 select-none ml-1.5 transition-transform duration-200 hover:scale-105"
    viewBox="0 0 24 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 6 C14 6 14 21 14 27 C14 30.5 20 32 22 32 C20 32 14 33.5 14 37 C14 43 14 58 5 58" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAssistant,
  onOpenDemo,
  onNavigate,
  activePage
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exploreItems = [
    { id: 'search', title: 'Universal Search', icon: Search, badge: 'All clues' },
    { id: 'graph', title: 'Interactive Map', icon: Share2, badge: 'Visual' }
  ];

  const feedsItems = [
    { id: 'blockchain', title: 'Crypto Wallets', icon: Coins, badge: 'ETH' },
    { id: 'darkweb', title: 'Dark Web Posts', icon: Globe2, badge: 'Tor' },
    { id: 'cti', title: 'Malware & C2', icon: Bug, badge: 'MISP' },
    { id: 'pgp', title: 'Digital Keys', icon: KeyRound, badge: 'PGP' }
  ];

  const caseItems = [
    { id: 'investigations', title: 'Active Cases', icon: FolderLockIcon, badge: 'Cases' },
    { id: 'evidence', title: 'Evidence Vault', icon: FileCheck, badge: 'SHA-256' },
    { id: 'timeline', title: 'Event Timeline', icon: Clock, badge: 'Time' },
    { id: 'reports', title: 'Formal Reports', icon: FileText, badge: 'Legal' }
  ];

  function FolderLockIcon(props: any) {
    return <FileText {...props} />;
  }

  const handleSelect = (pageId: string) => {
    onNavigate(pageId);
    setOpenDropdown(null);
  };

  const isExploreActive = ['search', 'graph'].includes(activePage);
  const isFeedsActive = ['blockchain', 'cti', 'darkweb', 'pgp'].includes(activePage);
  const isCasesActive = ['investigations', 'evidence', 'timeline', 'reports'].includes(activePage);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-3 md:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Section: Left Brace "{" + Brand Wordmark */}
        <div className="flex items-center">
          <LeftBrace />

          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer group select-none ml-0.5 md:ml-1"
          >
            <div className="flex items-baseline space-x-1.5">
              <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-950 font-sans group-hover:text-blue-600 transition-colors">
                TRACE-X
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                PRO
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] font-medium text-slate-500 tracking-tight leading-none mt-0.5">
              Threat Attribution Engine
            </p>
          </div>
        </div>

        {/* Center Section: Sleek Pill Nav Links (Identical to screenshot style) */}
        <nav ref={dropdownRef} className="hidden lg:flex items-center space-x-1 font-sans">
          {/* 1. Overview (Home pill style) */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-4 py-1.5 rounded-full text-[13px] transition-all duration-150 ${
              activePage === 'dashboard'
                ? 'bg-slate-100 text-slate-950 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-medium'
            }`}
          >
            Overview
          </button>

          {/* 2. De-anonymize */}
          <button
            onClick={() => onNavigate('deanonymization')}
            className={`px-4 py-1.5 rounded-full text-[13px] transition-all duration-150 flex items-center space-x-1.5 ${
              activePage === 'deanonymization'
                ? 'bg-slate-100 text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-medium'
            }`}
          >
            <span>De-anonymize</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          </button>

          {/* 3. Explore Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'explore' ? null : 'explore')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] transition-all duration-150 flex items-center space-x-1 ${
                isExploreActive
                  ? 'bg-slate-100 text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-medium'
              }`}
            >
              <span>Explore</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdown === 'explore' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'explore' && (
              <div className="absolute left-0 mt-2 w-56 bg-white/98 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        isItemActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3.5 h-3.5 ${isItemActive ? 'text-white' : 'text-blue-600'}`} />
                        <span>{item.title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isItemActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Feeds Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'feeds' ? null : 'feeds')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] transition-all duration-150 flex items-center space-x-1 ${
                isFeedsActive
                  ? 'bg-slate-100 text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-medium'
              }`}
            >
              <span>Services</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdown === 'feeds' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'feeds' && (
              <div className="absolute left-0 mt-2 w-56 bg-white/98 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {feedsItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        isItemActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3.5 h-3.5 ${isItemActive ? 'text-white' : 'text-blue-600'}`} />
                        <span>{item.title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isItemActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Case Dossier Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'cases' ? null : 'cases')}
              className={`px-3.5 py-1.5 rounded-full text-[13px] transition-all duration-150 flex items-center space-x-1 ${
                isCasesActive
                  ? 'bg-slate-100 text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-medium'
              }`}
            >
              <span>Activity Vault</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdown === 'cases' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'cases' && (
              <div className="absolute right-0 mt-2 w-56 bg-white/98 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {caseItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        isItemActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3.5 h-3.5 ${isItemActive ? 'text-white' : 'text-blue-600'}`} />
                        <span>{item.title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isItemActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Status Pill + Demo Action + Get Started CTA + Right Brace "}" */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Status Pill (matching screenshot "● Theme ▾" button) */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 transition text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Alchemy Live</span>
          </div>

          {/* Guided Tour Link */}
          <button
            onClick={onOpenDemo}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition"
          >
            <Play className="w-3 h-3 text-blue-600 fill-blue-600" />
            <span>Tour</span>
          </button>

          {/* Dark "Get Started →" CTA button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center space-x-2 px-4 md:px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs md:text-[13px] font-bold shadow-md shadow-slate-900/15 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>AI Copilot</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/80" />
          </button>

          {/* Right Brace "}" */}
          <RightBrace />
        </div>

      </div>
    </header>
  );
};
