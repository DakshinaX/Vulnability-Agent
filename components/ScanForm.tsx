
import React, { useState } from 'react';
import { ScanType } from '../types';

interface Props {
  onScan: (target: string, content: string, type: ScanType) => void;
  isScanning: boolean;
}

const EXAMPLE_CODE = `import sqlite3
from flask import Flask, request

app = Flask(__name__)
# VULNERABILITY: Hardcoded sensitive secret
SECRET_KEY = "awS_sk_12345_67890_EXAMPLETOCKEN" 

@app.route("/profile")
def get_profile():
    user_id = request.args.get('id')
    # VULNERABILITY: SQL Injection (Direct string formatting)
    query = f"SELECT * FROM users WHERE id = {user_id}"
    
    db = sqlite3.connect('app.db')
    result = db.execute(query).fetchone()
    return f"User profile for: {result[1]}"

@app.route("/download")
def download():
    filename = request.args.get('file')
    # VULNERABILITY: Arbitrary File Read / Path Traversal
    with open(f"/var/www/app/data/{filename}", "r") as f:
        return f.read()

if __name__ == "__main__":
    # VULNERABILITY: Running with debug=True in production
    app.run(debug=True, port=5000)`;

const ScanForm: React.FC<Props> = ({ onScan, isScanning }) => {
  const [target, setTarget] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<ScanType>('Code');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || !content) return;
    onScan(target, content, type);
  };

  const loadExample = () => {
    setTarget('Production_Gateway_v2');
    setContent(EXAMPLE_CODE);
    setType('Code');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center px-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] font-mono">Input Terminal // Ready</span>
        <button 
          type="button"
          onClick={loadExample}
          className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-2 transition-all hover:translate-x-1"
        >
          <i className="fa-solid fa-bolt-lightning"></i>
          Inject Security Sample
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="glass border-emerald-500/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        {isScanning && <div className="scanning-line"></div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="relative group">
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">Target Identity</label>
            <input 
              type="text" 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. AUTH_MODULE_v1"
              className="w-full bg-slate-950/50 border border-emerald-500/10 rounded-xl px-5 py-3 text-slate-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">Scan Modality</label>
            <div className="relative">
                <select 
                value={type}
                onChange={(e) => setType(e.target.value as ScanType)}
                className="w-full bg-slate-950/50 border border-emerald-500/10 rounded-xl px-5 py-3 text-slate-100 font-bold text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                >
                <option value="Code">STATIC CODE ANALYSIS</option>
                <option value="Architecture">ARCHITECTURAL REVIEW</option>
                <option value="Endpoint">ENDPOINT AUDIT</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 text-xs pointer-events-none"></i>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">Payload Content</label>
          <div className="relative">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-slate-950/80 border border-emerald-500/10 rounded-2xl px-6 py-5 text-emerald-500/90 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none shadow-inner custom-scrollbar"
              placeholder="// Paste technical specification or code here..."
              required
            />
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-600 uppercase">
              Lines: {content.split('\n').length} // Buffer: {content.length}B
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isScanning}
          className={`w-full py-5 px-8 rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all relative overflow-hidden group ${
            isScanning 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.2)]'
          }`}
        >
          {isScanning ? (
            <>
              <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              PENETRATION SCAN IN PROGRESS...
            </>
          ) : (
            <>
              <i className="fa-solid fa-microchip group-hover:scale-110 transition-transform"></i>
              DEPLOY AGENT ANALYSIS
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ScanForm;
