import React, { useEffect, useState } from 'react';
import { Share2, RefreshCw, Layers, ShieldAlert, ArrowRight, Target, Coins, Globe2, Compass } from 'lucide-react';
import { api } from '../services/api';
import { GraphData, GraphNode, GraphEdge } from '../types';
import { GraphViewer } from '../components/graph/GraphViewer';
import { EdgeRationaleModal } from '../components/common/EdgeRationaleModal';

interface GraphPageProps {
  onSelectEntity: (entityId: number) => void;
  onSelectEvidence: (evidenceId: string) => void;
}

export const GraphPage: React.FC<GraphPageProps> = ({ onSelectEntity, onSelectEvidence }) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [viewPreset, setViewPreset] = useState<'packrat' | 'wallets' | 'all'>('packrat');

  const loadGraph = (preset = viewPreset) => {
    setLoading(true);
    const limit = preset === 'packrat' ? 45 : preset === 'wallets' ? 35 : 180;
    api.getGraphData(limit)
      .then(setGraphData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGraph(viewPreset);
  }, [viewPreset]);

  const handleNodeClick = (node: GraphNode) => {
    const numId = parseInt(node.id, 10);
    if (!isNaN(numId)) {
      onSelectEntity(numId);
    }
  };

  const handleEdgeClick = (edge: GraphEdge) => {
    setSelectedEdge(edge);
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-6 flex flex-col space-y-4">
      {/* Top Header Bar & Investigation Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Share2 className="w-3.5 h-3.5" />
            <span>Relationship Map</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Interactive Evidence Map. Clean, separated connections.
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Select an investigation target to explore clean, un-cluttered relationship rings. Click any circle for instant profile details or click any link for matching proof.
          </p>
        </div>

        {/* Investigation Focus Presets */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="card-slide-stack-sm mr-2 mb-2 flex items-center p-1 text-xs font-bold">
            <button
              onClick={() => setViewPreset('packrat')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                viewPreset === 'packrat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Packrat Campaign (Focused)</span>
            </button>

            <button
              onClick={() => setViewPreset('wallets')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                viewPreset === 'wallets'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Crypto Trail</span>
            </button>

            <button
              onClick={() => setViewPreset('all')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                viewPreset === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Macro Network</span>
            </button>
          </div>

          <div className="card-slide-stack-sm mr-2 mb-2 text-xs font-mono text-slate-600 px-3.5 py-2 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span><strong className="text-blue-700 font-bold">{graphData.nodes.length}</strong> clues</span>
            <span className="text-slate-300">•</span>
            <span><strong className="text-blue-700 font-bold">{graphData.edges.length}</strong> links</span>
          </div>

          <button
            onClick={() => loadGraph()}
            className="btn-liquid-secondary p-2.5 rounded-2xl"
            title="Reload Network"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Visualizer Canvas */}
      <div className="flex-1 min-h-0 card-slide-stack mr-3 mb-4 overflow-hidden">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-blue-600 text-xs font-mono font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping mr-2.5"></span>
            <span>Synthesizing relationship network...</span>
          </div>
        ) : (
          <GraphViewer
            data={graphData}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
          />
        )}
      </div>

      {/* Edge Rationale Modal */}
      <EdgeRationaleModal
        edge={selectedEdge}
        onClose={() => setSelectedEdge(null)}
        onSelectEvidence={onSelectEvidence}
      />
    </div>
  );
};
