
import React, { useState } from 'react';
import { ScanResult, ScanType, Vulnerability } from './types';
import { analyzeSecurity } from './services/geminiService';
import ScanForm from './components/ScanForm';
import Dashboard from './components/Dashboard';
import VulnerabilityModal from './components/VulnerabilityModal';

const App: React.FC = () => {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [view, setView] = useState<'new' | 'dashboard'>('new');
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNewScan = async (target: string, content: string, type: ScanType) => {
    setIsScanning(true);
    setError(null);
    try {
      const partialResult = await analyzeSecurity(target, content, type);
      const fullResult: ScanResult = {
        id: `scan-${Date.now()}`,
        timestamp: new Date().toISOString(),
        target,
        type,
        status: 'Completed',
        vulnerabilities: partialResult.vulnerabilities || [],
        summary: partialResult.summary || 'Scan complete.'
      };
      setResults(prev => [fullResult, ...prev]);
      setView('dashboard');
    } catch (err: any) {
      setError(err.message || "Security core error: Analysis failed.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-emerald-500/10 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="relative">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <i className="fa-solid fa-shield-virus text-2xl text-white"></i>
            </div>
            {isScanning && <div className="absolute inset-0 bg-emerald-400 rounded-lg animate-ping opacity-20"></div>}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">
              VULNABILITY<span className="text-emerald-500 ml-1">AGENT</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-emerald-500/70 font-mono font-medium uppercase tracking-[0.3em]">Neural Security Auditor</p>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setView('new')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'new' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <i className="fa-solid fa-plus-circle text-xs"></i>
            New Audit
          </button>
          <button 
            onClick={() => setView('dashboard')}
            disabled={results.length === 0}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${results.length === 0 ? 'opacity-30 cursor-not-allowed' : ''} ${view === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <i className="fa-solid fa-chart-line text-xs"></i>
            Results
          </button>
        </nav>
      </header>

      {/* Main Analysis Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 relative z-10">
        {error && (
          <div className="mb-8 glass border-red-500/30 text-red-400 p-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {view === 'new' ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 relative">
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase">
                System Initialized // Ready to Scan
              </div>
              <h2 className="text-6xl font-black text-white mb-6 tracking-tight leading-[0.9]">
                Deep Analysis <br/><span className="text-emerald-500 italic">For Modern Infrastructure</span>
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                Deploy the agent to inspect your codebases and architectural designs for exploitable flaws.
              </p>
            </div>
            <ScanForm onScan={handleNewScan} isScanning={isScanning} />
          </div>
        ) : (
          <Dashboard 
            results={results} 
            onSelectVulnerability={(v) => setSelectedVuln(v)} 
          />
        )}
      </main>

      {/* Terminal Footer */}
      <footer className="bg-slate-950/80 border-t border-emerald-500/10 px-8 py-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <p className="text-slate-500 text-xs font-mono mb-2 uppercase tracking-widest">Global Intelligence Network</p>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                NODE_ALPHA: ONLINE
              </span>
              <span className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                ENCRYPTION: AES-256
              </span>
            </div>
          </div>
          <p className="text-slate-600 text-[11px] font-medium tracking-widest uppercase">
            © {new Date().getFullYear()} VULNABILITY AGENT // SECURED BY GEMINI PRO
          </p>
        </div>
      </footer>

      <VulnerabilityModal 
        vulnerability={selectedVuln} 
        onClose={() => setSelectedVuln(null)} 
      />
    </div>
  );
};

export default App;
