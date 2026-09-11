import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  FileCheck,
  Share2,
  Coins,
  Bug,
  Globe2,
  KeyRound,
  Clock,
  FileText,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  if (!isOpen) return null;

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await api.seedDemo();
      setSeeded(true);
    } catch (err: any) {
      console.error("Demo seed error", err);
    } finally {
      setSeeding(false);
    }
  };

  const steps = [
    {
      title: "1. Start the Live Demonstration",
      icon: ShieldCheck,
      desc: "Load the official demonstration scenario: 'Operation Packrat'. This prepares real public intelligence across four data feeds and applies ethical safeguards so no innocent individuals are misidentified.",
      actionLabel: "Load Demo Case",
      action: handleSeedDemo,
      isSeededStep: true
    },
    {
      title: "2. Search Across All Feeds at Once",
      icon: Search,
      desc: "Type any keyword—a threat group name ('packrat'), a server address ('198.12.150.249'), or an Ethereum wallet ('0x51c72848c68a965f66fa7a88855f9f7784502a7f'). TRACE-X queries all datasets simultaneously.",
      actionLabel: "Search 'packrat' Now",
      action: () => {
        onNavigate('search', { q: 'packrat' });
        onClose();
      }
    },
    {
      title: "3. Inspect Tamper-Proof Evidence",
      icon: FileCheck,
      desc: "Every clue collected has an unalterable SHA-256 digital stamp. See where it came from, when it was recorded, and verify that it hasn't been modified.",
      actionLabel: "View Evidence Vault",
      action: () => {
        onNavigate('evidence');
        onClose();
      }
    },
    {
      title: "4. Explore the Interactive Connection Map",
      icon: Share2,
      desc: "See how every clue connects together visually. Click any line between two clues to read a plain-English explanation of why TRACE-X linked them.",
      actionLabel: "Explore Relationship Map",
      action: () => {
        onNavigate('graph');
        onClose();
      }
    },
    {
      title: "5. Follow the Crypto Money Trail",
      icon: Coins,
      desc: "Trace 260 real Ethereum transactions. See which wallets sent funds, who received them, and how digital money flows between suspect accounts.",
      actionLabel: "Inspect Crypto Ledger",
      action: () => {
        onNavigate('blockchain');
        onClose();
      }
    },
    {
      title: "6. Uncover Malware & Phishing Servers",
      icon: Bug,
      desc: "Review documented campaign servers, attack infrastructure, and malicious file hashes from CitizenLab and MISP security feeds.",
      actionLabel: "View Threat Campaign",
      action: () => {
        onNavigate('cti');
        onClose();
      }
    },
    {
      title: "7. Search Dark Web Leaks",
      icon: Globe2,
      desc: "Search underground forum posts discussing stolen databases and breach disclosures, with built-in privacy guardrails that protect against false accusations.",
      actionLabel: "Inspect Forum Discussions",
      action: () => {
        onNavigate('darkweb');
        onClose();
      }
    },
    {
      title: "8. Verify Cryptographic Signatures",
      icon: KeyRound,
      desc: "Check public OpenPGP keyrings and verify digital fingerprints. Confirm whether security bulletins were signed with authentic keys.",
      actionLabel: "View Digital Signatures",
      action: () => {
        onNavigate('pgp');
        onClose();
      }
    },
    {
      title: "9. Review the Master Timeline",
      icon: Clock,
      desc: "Watch the narrative unfold chronologically. Blockchain payments, server registrations, and leak disclosures lined up on a single master timeline.",
      actionLabel: "Open Master Timeline",
      action: () => {
        onNavigate('timeline');
        onClose();
      }
    },
    {
      title: "10. Generate a Court-Ready Report",
      icon: FileText,
      desc: "Generate an official forensic summary report complete with executive findings, confidence scores, and legal attribution disclaimers ready to print or export.",
      actionLabel: "View Final Report",
      action: () => {
        onNavigate('reports', { caseId: 'CASE-TRACEX-01' });
        onClose();
      }
    }
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Interactive Guided Tour</h3>
              <p className="text-[10px] text-slate-400 font-medium">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0 shadow-2xs">
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">{current.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{current.desc}</p>
            </div>
          </div>

          {current.isSeededStep && (
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 space-y-1">
              <div className="flex items-center space-x-2 text-blue-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{seeded ? "Scenario Initialized (Case CASE-TRACEX-01 Active)" : "Ready to initialize demonstration"}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Prepares the case dossier, connects evidence links, and demonstrates responsible attribution boundaries.
              </p>
            </div>
          )}

          {/* Action Trigger Button with Liquid Effect */}
          <div className="pt-2">
            <button
              onClick={current.action}
              disabled={seeding}
              className="w-full btn-liquid py-3 rounded-2xl text-xs font-bold space-x-2"
            >
              <span>{seeding ? "Preparing Case..." : current.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn-liquid-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold disabled:opacity-40 space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'bg-blue-600 w-5' : 'bg-slate-200 w-2'
                }`}
              ></div>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="btn-liquid px-3.5 py-1.5 rounded-xl text-xs font-bold disabled:opacity-40 space-x-1"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
