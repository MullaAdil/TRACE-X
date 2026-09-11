import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { AssistantDrawer } from './components/common/AssistantDrawer';
import { EvidenceDrawer } from './components/common/EvidenceDrawer';
import { DemoWalkthroughModal } from './components/common/DemoWalkthroughModal';

import { DashboardPage } from './pages/DashboardPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { SearchPage } from './pages/SearchPage';
import { EntityProfilePage } from './pages/EntityProfilePage';
import { GraphPage } from './pages/GraphPage';
import { BlockchainPage } from './pages/BlockchainPage';
import { CtiPage } from './pages/CtiPage';
import { DarkWebPage } from './pages/DarkWebPage';
import { PgpPage } from './pages/PgpPage';
import { TimelinePage } from './pages/TimelinePage';
import { EvidencePage } from './pages/EvidencePage';
import { ReportsPage } from './pages/ReportsPage';
import { DeanonymizationPage } from './pages/DeanonymizationPage';

export function App() {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-TRACEX-01');
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isSidebarDockedDown, setIsSidebarDockedDown] = useState(false);

  const handleNavigate = (page: string, params?: any) => {
    setActivePage(page);
    if (params?.entityId) setSelectedEntityId(params.entityId);
    if (params?.caseId) setSelectedCaseId(params.caseId);
    if (params?.q) setSearchInitialQuery(params.q);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEntity = (id: number) => {
    setSelectedEntityId(id);
    setActivePage('entity');
  };

  const handleSelectEvidence = (id: string) => {
    setSelectedEvidenceId(id);
  };

  return (
    <div className="h-screen max-h-screen flex flex-col overflow-hidden bg-slate-100/70 text-slate-900 relative antialiased">


      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Sidebar (with 1-click Dock Down & Undock) */}
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          isDockedDown={isSidebarDockedDown}
          onToggleDock={() => setIsSidebarDockedDown(!isSidebarDockedDown)}
        />

        {/* Dynamic Page Workspace */}
        <main className={`flex-1 min-h-0 h-full overflow-y-auto ${isSidebarDockedDown ? 'pb-20' : 'pb-16 md:pb-6'}`}>
          {activePage === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onSelectEvidence={handleSelectEvidence}
            />
          )}

          {activePage === 'deanonymization' && (
            <DeanonymizationPage
              onNavigateToGraph={() => handleNavigate('graph')}
              onNavigateToEvidence={handleSelectEvidence}
              onNavigateToReports={() => handleNavigate('reports')}
            />
          )}

          {activePage === 'investigations' && (
            <InvestigationsPage onNavigate={handleNavigate} />
          )}

          {activePage === 'search' && (
            <SearchPage
              initialQuery={searchInitialQuery}
              onSelectEntity={handleSelectEntity}
              onSelectEvidence={handleSelectEvidence}
            />
          )}

          {activePage === 'entity' && selectedEntityId && (
            <EntityProfilePage
              entityId={selectedEntityId}
              onBack={() => setActivePage('dashboard')}
              onSelectEntity={handleSelectEntity}
              onSelectEvidence={handleSelectEvidence}
            />
          )}

          {activePage === 'graph' && (
            <GraphPage
              onSelectEntity={handleSelectEntity}
              onSelectEvidence={handleSelectEvidence}
            />
          )}

          {activePage === 'blockchain' && (
            <BlockchainPage onSelectEntity={handleSelectEntity} />
          )}

          {activePage === 'cti' && (
            <CtiPage onSelectEvidence={handleSelectEvidence} />
          )}

          {activePage === 'darkweb' && (
            <DarkWebPage onSelectEvidence={handleSelectEvidence} />
          )}

          {activePage === 'pgp' && (
            <PgpPage onSelectEvidence={handleSelectEvidence} />
          )}

          {activePage === 'timeline' && (
            <TimelinePage onSelectEvidence={handleSelectEvidence} />
          )}

          {activePage === 'evidence' && (
            <EvidencePage onSelectEvidence={handleSelectEvidence} />
          )}

          {activePage === 'reports' && (
            <ReportsPage
              caseId={selectedCaseId}
              onSelectEvidence={handleSelectEvidence}
            />
          )}
        </main>
      </div>

      {/* Slide-out AI Assistant Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectEvidence={handleSelectEvidence}
      />

      {/* Slide-out Evidence Detail & Chain of Custody Drawer */}
      <EvidenceDrawer
        evidenceId={selectedEvidenceId}
        onClose={() => setSelectedEvidenceId(null)}
        onSelectEntity={handleSelectEntity}
      />

      {/* Evaluator Guided Demo Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default App;
