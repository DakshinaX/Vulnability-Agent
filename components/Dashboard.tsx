
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area } from 'recharts';
import { ScanResult, Severity } from '../types';
import VulnerabilityCard from './VulnerabilityCard';
import { SEVERITY_ORDER } from '../constants';

interface Props {
  results: ScanResult[];
  onSelectVulnerability: (v: any) => void;
}

const Dashboard: React.FC<Props> = ({ results, onSelectVulnerability }) => {
  if (results.length === 0) return null;

  const latestResult = results[0];
  const vulns = latestResult.vulnerabilities;
  
  // Latest scan distribution
  const severityData = [
    { name: 'Low', value: vulns.filter(v => v.severity === Severity.LOW).length, color: '#3b82f6' },
    { name: 'Medium', value: vulns.filter(v => v.severity === Severity.MEDIUM).length, color: '#eab308' },
    { name: 'High', value: vulns.filter(v => v.severity === Severity.HIGH).length, color: '#f97316' },
    { name: 'Critical', value: vulns.filter(v => v.severity === Severity.CRITICAL).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Historical trend aggregation (reverse to show chronological order)
  const trendData = results.slice().reverse().map((res, index) => ({
    name: `Scan ${results.length - index}`,
    target: res.target,
    critical: res.vulnerabilities.filter(v => v.severity === Severity.CRITICAL).length,
    high: res.vulnerabilities.filter(v => v.severity === Severity.HIGH).length,
    medium: res.vulnerabilities.filter(v => v.severity === Severity.MEDIUM).length,
    low: res.vulnerabilities.filter(v => v.severity === Severity.LOW).length,
    total: res.vulnerabilities.length,
    timestamp: new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  const sortedVulns = [...vulns].sort((a, b) => 
    SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER] - SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER]
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass border-emerald-500/10 p-6 rounded-2xl text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 font-mono">Total Identified</p>
          <p className="text-4xl font-black text-white">{vulns.length}</p>
        </div>
        <div className="glass border-red-500/20 p-6 rounded-2xl text-center shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
          <p className="text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 font-mono">Critical Threats</p>
          <p className="text-4xl font-black text-red-500">{vulns.filter(v => v.severity === Severity.CRITICAL).length}</p>
        </div>
        <div className="glass border-emerald-500/10 p-6 rounded-2xl text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 font-mono">Audit Confidence</p>
          <p className="text-4xl font-black text-white">
            {Math.round(vulns.reduce((acc, v) => acc + v.confidenceScore, 0) / (vulns.length || 1))}%
          </p>
        </div>
        <div className="glass border-emerald-500/10 p-6 rounded-2xl text-center">
          <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 font-mono">Current Target</p>
          <p className="text-lg font-black text-white truncate px-2 leading-tight mt-2">{latestResult.target}</p>
        </div>
      </div>

      {/* Historical Trend Section */}
      {results.length > 1 && (
        <div className="glass border-emerald-500/10 p-8 rounded-[2rem] overflow-hidden relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <i className="fa-solid fa-wave-square text-emerald-500"></i>
                SECURITY TRENDLINE
              </h3>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Cross-Audit Vulnerability Trajectory</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> CRITICAL
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> HIGH
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> TOTAL
               </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #10b98133', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ padding: '2px 0' }}
                  cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="high" stroke="#f97316" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribution Section */}
        <div className="lg:col-span-1 glass border-emerald-500/10 p-8 rounded-[2rem]">
          <h3 className="text-lg font-black text-white mb-8 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-emerald-500"></i>
            THREAT MIX
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#020617', border: '1px solid #10b98133', borderRadius: '12px' }}
                   itemStyle={{ color: '#f8fafc', fontSize: '12px', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white leading-none">{vulns.length}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Found</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {severityData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs font-bold font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }}></div>
                  <span className="text-slate-400 uppercase tracking-widest">{d.name}</span>
                </div>
                <span className="text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="lg:col-span-2 glass border-emerald-500/10 p-8 rounded-[2rem]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <i className="fa-solid fa-terminal text-emerald-500"></i>
                EXECUTIVE INTELLIGENCE
            </h3>
            <span className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">Auth: SYSTEM_ROOT</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-sm font-medium bg-slate-900/30 p-6 rounded-2xl border border-white/5">
            {latestResult.summary}
          </p>
          <div className="mt-10">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Priority Findings // Top-4</h4>
                <div className="h-px flex-1 bg-emerald-500/10 mx-6"></div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {sortedVulns.slice(0, 4).map((v) => (
                 <VulnerabilityCard key={v.id} vulnerability={v} onClick={onSelectVulnerability} />
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Full Findings List */}
      <div className="glass border-emerald-500/10 p-8 rounded-[2rem]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter">FORENSIC FINDINGS</h3>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Complete vulnerability breakdown for {latestResult.target}</p>
          </div>
          <button className="bg-white/5 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            <i className="fa-solid fa-file-export mr-2"></i>
            Generate Forensic Report
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedVulns.map((v) => (
            <VulnerabilityCard key={v.id} vulnerability={v} onClick={onSelectVulnerability} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
