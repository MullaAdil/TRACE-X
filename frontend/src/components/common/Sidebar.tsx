import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
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
  Crosshair,
  ArrowDownToLine,
  ArrowUpFromLine,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isDockedDown: boolean;
  onToggleDock: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isDockedDown,
  onToggleDock
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sections = [
    {
      title: "Core Workbenches",
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'deanonymization', label: 'De-anonymize', icon: Crosshair, highlight: true }
      ]
    },
    {
      title: "Discovery & Map",
      items: [
        { id: 'search', label: 'Universal Search', icon: Search },
        { id: 'graph', label: 'Interactive Map', icon: Share2 }
      ]
    },
    {
      title: "Connected Data Feeds",
      items: [
        { id: 'blockchain', label: 'Crypto Wallets', icon: Coins },
        { id: 'darkweb', label: 'Dark Web Posts', icon: Globe2 },
        { id: 'cti', label: 'Malware & C2', icon: Bug },
        { id: 'pgp', label: 'PGP Keys', icon: KeyRound }
      ]
    },
    {
      title: "Case Management",
      items: [
        { id: 'investigations', label: 'Active Cases', icon: FolderLock },
        { id: 'timeline', label: 'Event Timeline', icon: Clock },
        { id: 'evidence', label: 'Evidence Vault', icon: FileCheck },
        { id: 'reports', label: 'Formal Reports', icon: FileText }
      ]
    }
  ];

  // 5 Essential Core Actions for the compact dock
  const primaryTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'deanonymization', label: 'De-anonymize', icon: Crosshair, isHot: true },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'graph', label: 'Map', icon: Share2 },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const secondaryTabs = [
    { id: 'blockchain', label: 'Crypto Wallets', icon: Coins },
    { id: 'darkweb', label: 'Dark Web Posts', icon: Globe2 },
    { id: 'cti', label: 'Malware & C2', icon: Bug },
    { id: 'pgp', label: 'PGP Signatures', icon: KeyRound },
    { id: 'investigations', label: 'Active Cases', icon: FolderLock },
    { id: 'timeline', label: 'Event Timeline', icon: Clock },
    { id: 'evidence', label: 'Evidence Vault', icon: FileCheck }
  ];

  const isSecondaryActive = secondaryTabs.some(t => t.id === activePage);

  return (
    <>
      {/* 1. Desktop Left Sidebar (Active when NOT docked down) */}
      {!isDockedDown && (
        <aside
          className={`hidden md:flex flex-col justify-between border-r border-slate-200/90 bg-white/95 backdrop-blur-xl transition-all duration-300 shrink-0 shadow-2xs overflow-y-auto h-full min-h-full self-stretch ${
            isCollapsed ? 'w-16 p-2' : 'w-64 p-4'
          }`}
        >
          <div className="space-y-4">
            {/* Header: Title + Collapse + Dock Down Button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              {!isCollapsed && (
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Navigation
                </span>
              )}
              <div className="flex items-center space-x-1 ml-auto">
                <button
                  onClick={onToggleDock}
                  title="Dock to bottom bar"
                  className="flex items-center space-x-1 px-1.5 py-1 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition text-[11px] font-medium"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  {!isCollapsed && <span className="text-[10px] font-semibold text-blue-600">Dock</span>}
                </button>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nav Sections */}
            {sections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {sec.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center ${
                          isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                        } rounded-2xl text-xs transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/25'
                            : item.highlight
                            ? 'text-blue-700 hover:text-blue-900 hover:bg-blue-50/70 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                              isActive
                                ? 'text-white'
                                : item.highlight
                                ? 'text-blue-600'
                                : 'text-slate-400 group-hover:text-slate-700'
                            }`}
                          />
                          {!isCollapsed && <span className="tracking-tight">{item.label}</span>}
                        </div>
                        {!isCollapsed && item.highlight && !isActive && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
                            HOT
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Notice */}
          {!isCollapsed && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs text-slate-600 space-y-1 mt-4">
              <div className="flex items-center space-x-2 text-blue-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Court-Admissible</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500 font-normal">
                Every clue cryptographically sealed with SHA-256 for judicial scrutiny.
              </p>
            </div>
          )}
        </aside>
      )}

      {/* 2. Compact Bottom Dock Bar (Shown on Mobile OR when Desktop User clicks "Dock") */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 select-none ${
          isDockedDown ? 'flex' : 'flex md:hidden'
        }`}
      >
        {/* "More" Mini Popover */}
        {isMoreOpen && (
          <div
            ref={moreRef}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 w-72 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl shadow-blue-900/15 rounded-3xl p-3 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 ring-1 ring-black/[0.04]"
          >
            <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Feeds & Case Files
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {secondaryTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center space-x-2 px-2.5 py-2 rounded-2xl text-xs transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 font-medium'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate tracking-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Small & Simple Pill Bar */}
        <nav
          aria-label="Compact Floating Dock"
          className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 rounded-full transition-all ring-1 ring-black/[0.03]"
        >
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMoreOpen(false);
                }}
                className={`group relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} />
                <span className="tracking-tight text-[12px]">{item.label}</span>
                {item.isHot && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

          {/* More Feeds Button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            title="More intelligence feeds"
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs transition-all ${
              isMoreOpen || isSecondaryActive
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            <ChevronUp className={`w-3 h-3 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Undock Button to return to left sidebar (Desktop only) */}
          {isDockedDown && (
            <>
              <div className="hidden md:block h-4 w-[1px] bg-slate-200 mx-0.5" />
              <button
                onClick={onToggleDock}
                title="Undock back to left sidebar"
                className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 transition"
              >
                <ArrowUpFromLine className="w-3.5 h-3.5" />
                <span className="text-[11px]">Undock</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </>
  );
};
