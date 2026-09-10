import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  Play,
  LayoutDashboard,
  Crosshair,
  FolderLock,
  Search,
  Share2,
  Coins,
  Bug,
  Globe2,
  KeyRound,
  Clock,
  FileCheck,
  FileText,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onOpenAssistant: () => void;
  onOpenDemo: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

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

  // Compact items (Small & sleek without tall paragraphs)
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
    { id: 'investigations', title: 'Active Cases', icon: FolderLock, badge: 'Cases' },
    { id: 'evidence', title: 'Evidence Vault', icon: FileCheck, badge: 'SHA-256' },
    { id: 'timeline', title: 'Event Timeline', icon: Clock, badge: 'Time' },
    { id: 'reports', title: 'Formal Reports', icon: FileText, badge: 'Legal' }
  ];

  const handleSelect = (pageId: string) => {
    onNavigate(pageId);
    setOpenDropdown(null);
  };

  const isExploreActive = ['search', 'graph'].includes(activePage);
  const isFeedsActive = ['blockchain', 'cti', 'darkweb', 'pgp'].includes(activePage);
  const isCasesActive = ['investigations', 'evidence', 'timeline', 'reports'].includes(activePage);

  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-2xs">
      {/* Brand Identity */}
      <div
        className="flex items-center space-x-3 cursor-pointer shrink-0 group"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight text-slate-900">TRACE-X</span>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              SIH26151
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Threat De-anonymization</p>
        </div>
      </div>

      {/* Streamlined, Compact Navigation Bar with Small Liquid Dropdowns */}
      <nav ref={dropdownRef} className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
        {/* 1. Overview */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 ${
            activePage === 'dashboard'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-blue-600 hover:bg-white/80 font-semibold'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        {/* 2. De-anonymize */}
        <button
          onClick={() => onNavigate('deanonymization')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 ${
            activePage === 'deanonymization'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-blue-700 hover:text-blue-800 hover:bg-blue-50/70 font-bold'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          <span>De-anonymize</span>
          {activePage !== 'deanonymization' && (
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          )}
        </button>

        {/* 3. Explore Dropdown (Small & Flexible) */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'explore' ? null : 'explore')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 ${
              isExploreActive
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-blue-600 hover:bg-white/80 font-semibold'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'explore' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'explore' && (
            <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl border border-blue-200/80 rounded-2xl shadow-xl shadow-blue-500/10 p-1.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
              <div className="space-y-0.5">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all duration-150 ${
                        isItemActive
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'text-slate-700 hover:bg-blue-50/90 hover:text-blue-700 font-semibold'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3.5 h-3.5 ${isItemActive ? 'text-white' : 'text-blue-600'}`} />
                        <span>{item.title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isItemActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. Data Feeds Dropdown (Small & Flexible) */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'feeds' ? null : 'feeds')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 ${
              isFeedsActive
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-blue-600 hover:bg-white/80 font-semibold'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Data Feeds</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'feeds' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'feeds' && (
            <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl border border-blue-200/80 rounded-2xl shadow-xl shadow-blue-500/10 p-1.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
              <div className="space-y-0.5">
                {feedsItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all duration-150 ${
                        isItemActive
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'text-slate-700 hover:bg-blue-50/90 hover:text-blue-700 font-semibold'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3.5 h-3.5 ${isItemActive ? 'text-white' : 'text-blue-600'}`} />
                        <span>{item.title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isItemActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. Case Files Dropdown (Small & Flexible) */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'cases' ? null : 'cases')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 ${
              isCasesActive
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-blue-600 hover:bg-white/80 font-semibold'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5" />
            <span>Case Files</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'cases' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'cases' && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl border border-blue-200/80 rounded-2xl shadow-xl shadow-blue-500/10 p-1.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
              <div className="space-y-0.5">
                {caseItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all duration-150 ${
                        isItemActive
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'text-slate-700 hover:bg-blue-50/90 hover:text-blue-700 font-semibold'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3.5 h-3.5 ${isItemActive ? 'text-white' : 'text-blue-600'}`} />
                        <span>{item.title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isItemActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Action Buttons & Status */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="hidden xl:flex items-center space-x-2 bg-blue-50 border border-blue-200/80 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-[11px] font-mono font-bold text-blue-800">System Ready</span>
        </div>

        {/* Guided Demo Button */}
        <button
          onClick={onOpenDemo}
          className="btn-liquid-secondary px-3 py-1.5 text-xs font-bold"
        >
          <Play className="w-3 h-3 mr-1.5 fill-blue-600/20 text-blue-600" />
          <span>Demo Tour</span>
        </button>

        {/* AI Copilot Button */}
        <button
          onClick={onOpenAssistant}
          className="btn-liquid px-3.5 py-1.5 text-xs font-bold"
        >
          <Sparkles className="w-3 h-3 mr-1.5" />
          <span>AI Copilot</span>
        </button>
      </div>
    </header>
  );
};
