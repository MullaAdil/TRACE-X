import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Info,
  Layers,
  Search,
  Sparkles,
  Compass,
  RotateCcw,
  Eye,
  ExternalLink,
  Shield,
  Coins,
  Bug,
  Globe2,
  KeyRound,
  X,
  ArrowRight
} from 'lucide-react';
import { GraphData, GraphNode, GraphEdge } from '../../types';

interface GraphViewerProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onEdgeClick: (edge: GraphEdge) => void;
  onFocusNode?: (nodeId: string) => void;
}

export const GraphViewer: React.FC<GraphViewerProps> = ({
  data,
  onNodeClick,
  onEdgeClick,
  onFocusNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [activeLayout, setActiveLayout] = useState<'concentric' | 'spacious' | 'hierarchy'>('concentric');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  const getNodeColor = (type: string, isSynthetic?: boolean) => {
    if (isSynthetic) return '#0284C7';
    switch (type.toLowerCase()) {
      case 'threat_actor': return '#E11D48';
      case 'wallet': return '#7C3AED';
      case 'transaction': return '#4F46E5';
      case 'domain': return '#0284C7';
      case 'ip': return '#2563EB';
      case 'hash': return '#D97706';
      case 'pgp_fingerprint': return '#059669';
      case 'email': return '#059669';
      case 'darkweb_thread': return '#0D9488';
      default: return '#64748B';
    }
  };

  const getNodeSize = (type: string) => {
    switch (type.toLowerCase()) {
      case 'threat_actor': return 46;
      case 'wallet': return 34;
      case 'ip': return 34;
      case 'domain': return 32;
      case 'pgp_fingerprint': return 30;
      default: return 26;
    }
  };

  const getLayoutConfig = (layoutName: 'concentric' | 'spacious' | 'hierarchy') => {
    if (layoutName === 'concentric') {
      return {
        name: 'concentric',
        animate: true,
        animationDuration: 600,
        concentric: (node: any) => {
          const type = node.data('type');
          if (type === 'threat_actor') return 12;
          if (type === 'ip' || type === 'wallet') return 8;
          if (type === 'domain') return 5;
          if (type === 'pgp_fingerprint') return 4;
          return 1;
        },
        levelWidth: () => 2.5,
        padding: 60,
        minNodeSpacing: 80,
        avoidOverlap: true
      };
    }

    if (layoutName === 'hierarchy') {
      return {
        name: 'breadthfirst',
        directed: true,
        animate: true,
        animationDuration: 600,
        padding: 60,
        spacingFactor: 1.8,
        avoidOverlap: true
      };
    }

    // Ultra-spacious physics layout with huge repulsion to eliminate clumping
    return {
      name: 'cose',
      animate: false,
      randomize: false,
      componentSpacing: 280,
      nodeOverlap: 60,
      nodeRepulsion: () => 15000000, // Massive repulsion prevents hairballs
      idealEdgeLength: () => 220,   // Wide breathing room between nodes
      edgeElasticity: () => 24,     // Very soft tension
      nestingFactor: 1.0,
      gravity: 8,                   // Minimal gravitational collapse
      numIter: 1000,
      initialTemp: 400,
      coolingFactor: 0.95,
      minTemp: 1.0,
      padding: 80
    };
  };

  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return;

    // Filter nodes if category filter is active
    const filteredNodes = selectedFilter === 'ALL'
      ? data.nodes
      : data.nodes.filter((n) => n.type.toLowerCase() === selectedFilter.toLowerCase());

    const allowedNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = data.edges.filter(
      (e) => allowedNodeIds.has(e.source) && allowedNodeIds.has(e.target)
    );

    const elements = [
      ...filteredNodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label.length > 22 ? n.label.slice(0, 20) + '...' : n.label,
          fullName: n.label,
          type: n.type,
          color: getNodeColor(n.type, n.is_synthetic),
          size: getNodeSize(n.type),
          riskScore: n.risk_score || 0.75,
          rawNode: n
        }
      })),
      ...filteredEdges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.relationship,
          confidence: e.confidence,
          rawEdge: e
        }
      }))
    ];

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        // Clean Apple Style Node
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#0F172A',
            'font-size': '11px',
            'font-weight': 'bold',
            'font-family': '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'width': 'data(size)',
            'height': 'data(size)',
            'border-width': 3,
            'border-color': '#FFFFFF',
            'border-opacity': 0.95,
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'transition-property': 'background-color, width, height, border-color, opacity',
            'transition-duration': 0.2
          }
        },
        // Threat Actor Anchor (Distinctive Crown Glow)
        {
          selector: 'node[type = "threat_actor"]',
          style: {
            'border-color': '#FFE4E6',
            'border-width': 5,
            'font-size': '13px',
            'text-margin-y': 10
          }
        },
        // Node Hover & Selected State
        {
          selector: 'node:selected, node.hovered',
          style: {
            'border-color': '#2563EB',
            'border-width': 5,
            'width': 52,
            'height': 52,
            'z-index': 999,
            'font-size': '13px',
            'text-background-opacity': 1,
            'text-background-color': '#EFF6FF',
            'color': '#1E40AF'
          }
        },
        // Dimmed Nodes when focus is active
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.12
          }
        },
        // Clean Uncluttered Curved Edges
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94A3B8',
            'line-opacity': 0.4,
            'target-arrow-color': '#94A3B8',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.85,
            'curve-style': 'bezier',
            'label': '', // Hidden by default to eliminate text collision!
            'font-size': '10px',
            'font-family': '-apple-system, BlinkMacSystemFont, "SF Pro Text", monospace',
            'font-weight': 'bold',
            'color': '#1E293B',
            'text-rotation': 'autorotate',
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.95,
            'text-background-padding': '4px',
            'text-border-color': '#CBD5E1',
            'text-border-width': 1,
            'transition-property': 'line-color, width, line-opacity',
            'transition-duration': 0.2
          }
        },
        // Highlighted / Active Edge
        {
          selector: 'edge:selected, edge.highlighted',
          style: {
            'width': 4,
            'line-color': '#2563EB',
            'line-opacity': 1,
            'target-arrow-color': '#2563EB',
            'label': 'data(label)',
            'color': '#1D4ED8',
            'z-index': 998
          }
        },
        {
          selector: 'edge.dimmed',
          style: {
            'line-opacity': 0.04
          }
        }
      ],
      layout: getLayoutConfig(activeLayout)
    });

    // Click on node: opens side inspector
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const rawNode = node.data('rawNode');
      const connectedEdges = node.connectedEdges();
      const connectedNodes = node.neighborhood().nodes();

      setSelectedNodeData({
        id: node.data('id'),
        label: node.data('fullName'),
        type: node.data('type'),
        color: node.data('color'),
        riskScore: node.data('riskScore'),
        connectedCount: connectedNodes.length,
        rawNode: rawNode,
        neighbors: connectedNodes.map((n: any) => ({
          id: n.data('id'),
          label: n.data('fullName'),
          type: n.data('type')
        }))
      });

      // Highlight neighborhood
      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass('dimmed');
      neighborhood.removeClass('dimmed');
      node.addClass('hovered');
      node.connectedEdges().addClass('highlighted');
    });

    // Click on canvas (background) resets focus
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('dimmed hovered highlighted');
        setSelectedNodeData(null);
      }
    });

    // Click on edge
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      const rawEdge = edge.data('rawEdge');
      if (rawEdge) {
        onEdgeClick(rawEdge);
      }
    });

    // Hover preview
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      setHoveredInfo(`${node.data('type').toUpperCase()}: ${node.data('fullName')}`);
    });

    cy.on('mouseout', 'node', () => {
      setHoveredInfo(null);
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data, selectedFilter, activeLayout]);

  // Search inside graph
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    if (!searchTerm.trim()) {
      cy.elements().removeClass('dimmed hovered');
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const matched = cy.nodes().filter((n) => {
      const fullName = (n.data('fullName') || '').toLowerCase();
      const type = (n.data('type') || '').toLowerCase();
      return fullName.includes(term) || type.includes(term);
    });

    if (matched.length > 0) {
      cy.elements().addClass('dimmed');
      matched.removeClass('dimmed').addClass('hovered');
      matched.connectedEdges().removeClass('dimmed').addClass('highlighted');
    } else {
      cy.elements().removeClass('dimmed hovered highlighted');
    }
  }, [searchTerm]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.3);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.75);
  const handleFit = () => cyRef.current?.fit(undefined, 60);
  const handleResetLayout = () => {
    if (!cyRef.current) return;
    cyRef.current.layout(getLayoutConfig(activeLayout)).run();
    cyRef.current.fit(undefined, 60);
  };

  const filters = [
    { id: 'ALL', label: 'All Entities' },
    { id: 'threat_actor', label: 'Threat Actors' },
    { id: 'ip', label: 'Servers & IPs' },
    { id: 'wallet', label: 'Crypto Wallets' },
    { id: 'domain', label: 'Domains' },
    { id: 'hash', label: 'File Hashes' },
    { id: 'pgp_fingerprint', label: 'Digital Keys' }
  ];

  return (
    <div className="relative w-full h-full min-h-[680px] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
      {/* Top Floating Control Toolbar (Apple Island Style) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Category Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-white/95 p-1.5 rounded-2xl border border-slate-200 shadow-md backdrop-blur-md">
            <Filter className="w-3.5 h-3.5 text-blue-600 ml-1.5 mr-0.5" />
            <div className="flex flex-wrap items-center gap-1">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === f.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center bg-white/95 rounded-2xl border border-slate-200 shadow-md backdrop-blur-md px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find clue in map..."
              className="bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-32 md:w-44 font-medium"
            />
          </div>
        </div>

        {/* Right: Layout Switcher & Zoom */}
        <div className="flex items-center space-x-2">
          {/* Layout Modes */}
          <div className="flex items-center bg-white/95 p-1 rounded-2xl border border-slate-200 shadow-md backdrop-blur-md text-xs font-bold">
            <button
              onClick={() => setActiveLayout('concentric')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeLayout === 'concentric'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Clean concentric circles around central target (Recommended)"
            >
              Concentric Rings
            </button>
            <button
              onClick={() => setActiveLayout('spacious')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeLayout === 'spacious'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ultra-spread force layout with massive separation"
            >
              Spread Force
            </button>
            <button
              onClick={() => setActiveLayout('hierarchy')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeLayout === 'hierarchy'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Top-down hierarchy tree"
            >
              Tree Flow
            </button>
          </div>

          {/* Viewport Buttons */}
          <div className="flex items-center space-x-1 bg-white/95 p-1 rounded-2xl border border-slate-200 shadow-md backdrop-blur-md">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFit}
              title="Fit to Screen"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetLayout}
              title="Re-spread Layout"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Hover Info Pill */}
      {hoveredInfo && !selectedNodeData && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 text-white px-4 py-2 rounded-2xl text-xs font-mono font-semibold shadow-lg backdrop-blur pointer-events-none transition-all">
          {hoveredInfo}
        </div>
      )}

      {/* Cytoscape Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing bg-radial from-white via-slate-50 to-slate-100"
      />

      {/* Selected Node Floating Side Inspector (Apple Card Style) */}
      {selectedNodeData && (
        <div className="absolute top-20 right-6 z-30 w-80 bg-white/95 border border-slate-200 rounded-3xl shadow-2xl p-5 space-y-4 backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: selectedNodeData.color }}
              ></span>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {selectedNodeData.type}
                </span>
                <h4 className="text-sm font-black text-slate-900 truncate max-w-[180px]">
                  {selectedNodeData.label}
                </h4>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedNodeData(null);
                cyRef.current?.elements().removeClass('dimmed hovered highlighted');
              }}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Connected Links</span>
              <span className="text-sm font-extrabold text-blue-600 font-mono">
                {selectedNodeData.connectedCount} nodes
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Risk Assessment</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {Math.round(selectedNodeData.riskScore * 100)}% Risk
              </span>
            </div>
          </div>

          {selectedNodeData.neighbors.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Direct Connections:
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
                {selectedNodeData.neighbors.slice(0, 6).map((n: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]"
                  >
                    <span className="font-mono text-slate-800 font-bold truncate max-w-[160px]">
                      {n.label}
                    </span>
                    <span className="text-[9px] uppercase font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {n.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
            <button
              onClick={() => onNodeClick(selectedNodeData.rawNode)}
              className="flex-1 btn-liquid py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <span>Open Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Horizontal Legend Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-white/95 border border-slate-200 p-3 rounded-2xl text-xs text-slate-600 shadow-md backdrop-blur pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#E11D48] shadow-2xs"></span>
            <span className="font-bold text-slate-800">Threat Actor</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2563EB] shadow-2xs"></span>
            <span className="font-bold text-slate-800">Server IP</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#7C3AED] shadow-2xs"></span>
            <span className="font-bold text-slate-800">Crypto Wallet</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#0284C7] shadow-2xs"></span>
            <span className="font-bold text-slate-800">Domain</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#D97706] shadow-2xs"></span>
            <span className="font-bold text-slate-800">Payload Hash</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#059669] shadow-2xs"></span>
            <span className="font-bold text-slate-800">PGP Key</span>
          </div>
        </div>

        <div className="bg-white/95 border border-slate-200 px-4 py-2 rounded-2xl text-xs text-slate-500 shadow-md backdrop-blur pointer-events-auto flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Click any circle to open its inspector card • Click any line for connection proof</span>
        </div>
      </div>
    </div>
  );
};
