/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BarChart3, Download, Layers, ShieldCheck, FileSpreadsheet, Sparkles, Database } from 'lucide-react';
import { Story } from '../types';

interface InsightsDashboardProps {
  stories: Story[];
  onSelectCategoryFilter: (category: string) => void;
  onSelectTagFilter: (tag: string) => void;
}

export default function InsightsDashboard({ stories, onSelectCategoryFilter, onSelectTagFilter }: InsightsDashboardProps) {
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Compute stats based on stories
  const totalVolume = stories.length;
  
  // Average severity
  const avgSeverity = totalVolume > 0
    ? (stories.reduce((acc, curr) => acc + curr.severityIndex, 0) / totalVolume).toFixed(1)
    : '0';

  // Category splits
  const categoryCounts: Record<string, number> = {};
  stories.forEach((st) => {
    categoryCounts[st.category] = (categoryCounts[st.category] || 0) + 1;
  });

  const categories = [
    { id: 'Managerial Gaslighting', label: 'Managerial Gaslighting', color: 'bg-[#df4b30]' },
    { id: 'Teammate Mobbing & Isolation', label: 'Teammate Mobbing & Isolation', color: 'bg-amber-500/80' },
    { id: 'Systemic Corporate Retaliation', label: 'Systemic Corporate Retaliation', color: 'bg-neutral-300' },
    { id: 'Discrimination via Algorithms', label: 'Discrimination via Algorithms', color: 'bg-zinc-500' },
    { id: 'AI-Enabled Workplace Bullying', label: 'AI-Enabled Workplace Bullying', color: 'bg-indigo-500' },
  ];

  // Pattern cloud compilation
  const patternsSet = new Set<string>();
  stories.forEach((s) => {
    s.extractedPatterns?.forEach((p) => patternsSet.add(p));
  });
  const uniquePatterns = Array.from(patternsSet);

  // Company Accountability Scores
  const companyStats: Record<string, { count: number, totalSeverity: number }> = {};
  stories.forEach((st) => {
    if (st.companyName) {
      if (!companyStats[st.companyName]) {
        companyStats[st.companyName] = { count: 0, totalSeverity: 0 };
      }
      companyStats[st.companyName].count += 1;
      companyStats[st.companyName].totalSeverity += st.severityIndex;
    }
  });

  const companyScores = Object.entries(companyStats).map(([name, stats]) => ({
    name,
    count: stats.count,
    avgSeverity: (stats.totalSeverity / stats.count).toFixed(1)
  })).sort((a, b) => b.count - a.count || parseFloat(b.avgSeverity) - parseFloat(a.avgSeverity));

  // Export JSON dossier to download for Journalists / NGOs
  const handleExportJson = () => {
    const sanitizedSelection = stories.map((s) => ({
      referenceId: s.id,
      title: s.title,
      anonymizedText: s.anonymizedText,
      alias: s.alias,
      role: s.sharePreference === 'completely-anonymous' ? 'Censored' : s.role,
      industry: s.industry,
      assignedCategory: s.category,
      aiInfractionPatterns: s.extractedPatterns,
      severityIndex: s.severityIndex,
      humanImpact: s.humanImpact,
      managementExcuse: s.managementExcuse,
      evidenceSubmissionDate: s.dateSubmitted,
    }));

    const fileData = JSON.stringify({
      archiveTitle: 'The AI Collateral - Audited Workforce Harms Dataset',
      exportTimestamp: new Date().toISOString(),
      auditorSafetyDeclaration: 'Anonymized dataset. All personally identifiable features deleted to protect witness livelihoods.',
      recordCount: sanitizedSelection.length,
      records: sanitizedSelection,
    }, null, 2);

    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-collateral-dossier-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccessMessage('JSON Ledger Dossier compiled and downloaded successfully.');
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  // Export Markdown Press dossier
  const handleExportMarkdown = () => {
    let mdContent = `# THE AI COLLATERAL - PUBLIC AUDIT DOSSIER\n`;
    mdContent += `*Compiled dynamically on ${new Date().toLocaleDateString()}*\n`;
    mdContent += `*This dataset compiles anonymized digital-surveillance and labor automation harms to support NGO and journalistic investigations.*\n\n`;
    mdContent += `---\n\n`;

    stories.forEach((s, idx) => {
      mdContent += `## RECORD #${idx + 1}: ${s.title.toUpperCase()}\n`;
      mdContent += `- **Category**: ${s.category}\n`;
      mdContent += `- **Filer / Industry**: ${s.alias} | ${s.industry || 'Undocumented'}\n`;
      mdContent += `- **Livelihood Severity Index**: ${s.severityIndex}/5\n`;
      mdContent += `- **Ascribed Tech Infractions**: ${s.extractedPatterns?.join(', ') || 'N/A'}\n\n`;
      mdContent += `### Human Toll:\n> "${s.humanImpact}"\n\n`;
      mdContent += `### Management Excuse:\n> "${s.managementExcuse}"\n\n`;
      mdContent += `### Anonymized Witness Testimony:\n${s.anonymizedText}\n\n`;
      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-collateral-press-briefing-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccessMessage('Press Markdown document downloaded successfully.');
    setTimeout(() => setDownloadSuccessMessage(null), 4500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      
      {/* Overview Headings */}
      <div>
        <h2 className="text-2xl font-light text-white tracking-tight">Analytic Insight Ledger</h2>
        <p className="mt-1 text-xs text-white/40 font-light leading-relaxed">
          Transforming separate worker testimonies into structured systemic trends and actionable dossier reports.
        </p>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white/[0.01]/80 rounded-sm border border-white/5 p-6 flex items-center justify-between shadow-md">
          <div>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-white/40">Total Audited Cases</span>
            <span className="block text-3xl font-mono text-white mt-1">{totalVolume}</span>
            <span className="block text-[9px] text-emerald-400 font-mono mt-0.5 uppercase tracking-wider">● 100% Cryptographically Clean</span>
          </div>
          <div className="p-3 bg-white/5 rounded-sm text-white">
            <Database className="h-6 w-6 font-light" />
          </div>
        </div>

        <div className="bg-white/[0.01]/80 rounded-sm border border-white/5 p-6 flex items-center justify-between shadow-md">
          <div>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-white/40">Average Livelihood Severity</span>
            <span className="block text-3xl font-mono text-white mt-1">{avgSeverity} <span className="text-xs text-white/30">/ 5</span></span>
            <span className="block text-[10px] text-white/40 font-mono mt-0.5">Reflecting systematic lock-outs</span>
          </div>
          <div className="p-3 bg-white/5 rounded-sm text-white">
            <BarChart3 className="h-6 w-6 font-light" />
          </div>
        </div>

        <div className="bg-white/[0.01]/80 rounded-sm border border-white/5 p-6 flex items-center justify-between shadow-md">
          <div>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-white/40">Core Infraction Vectors</span>
            <span className="block text-3xl font-mono text-white mt-1">{uniquePatterns.length}</span>
            <span className="block text-[10px] text-white/40 font-mono mt-0.5">Isolated algorithmic dynamics</span>
          </div>
          <div className="p-3 bg-white/5 rounded-sm text-white">
            <Layers className="h-6 w-6 font-light" />
          </div>
        </div>

      </div>

      {/* Dynamic Visual Custom SVG Chart */}
      <div className="bg-white/[0.01] rounded-sm border border-white/5 p-6 shadow-md space-y-6">
        <div>
          <h3 className="text-lg font-light text-white">Workplace AI Harm Distribution</h3>
          <p className="text-xs text-white/40 mt-1 font-light leading-relaxed">
            Distribution of reports by labor hazard category. Click any bar to instantly filter the testimony archive.
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const percentage = totalVolume > 0 ? (count / totalVolume) * 100 : 0;
            return (
              <div 
                key={cat.id} 
                onClick={() => onSelectCategoryFilter(cat.id)}
                className="group cursor-pointer rounded-sm p-4 border border-white/5 bg-white/[0.005] hover:border-white/20 hover:bg-white/[0.02] transition duration-150"
              >
                <div className="flex items-center justify-between text-xs font-medium text-white/80 mb-1.5 transition">
                  <span className="group-hover:text-white font-sans">{cat.label}</span>
                  <span className="font-mono bg-white/5 px-2 py-0.5 rounded-sm text-white/60 text-[9px] uppercase tracking-widest group-hover:bg-white/10 group-hover:text-white transition-all">{count} reports ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-sm overflow-hidden">
                  <div 
                    className={`h-full rounded-sm transition-all duration-500 ${cat.color}`} 
                    style={{ width: `${Math.max(percentage, 2.5)}%` }} // Ensure visible minimal width if percentage is small
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Company Accountability Scores Section */}
      <div className="bg-white/[0.01] rounded-sm border border-white/5 p-6 shadow-md space-y-6">
        <div>
          <h3 className="text-xl font-light text-white flex items-center gap-2">
            Dummy Company Accountability Leaderboard
          </h3>
          <p className="text-xs text-white/40 mt-1 font-light leading-relaxed">
            Ranking companies by total incidents of human-to-human mobbing and algorithmic abuse, ordered by severity.
          </p>
        </div>
        
        {/* LEGAL CAVEAT */}
        <div className="bg-amber-950/20 border border-amber-900/30 p-3 rounded-sm text-[10px] text-amber-400/80 font-mono leading-relaxed">
          <strong>LEGAL DISCLAIMER:</strong> This leaderboard is algorithmically generated from unverified, anonymous third-party submissions. The data represents subjective user allegations of workplace experiences and does not constitute proven legal facts or the official opinions of this platform. It currently operates with test/dummy data until verification processes are fully deployed.
        </div>

        {companyScores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] uppercase tracking-wider text-white/40 font-mono">
                  <th className="pb-3 font-medium">Company / Platform</th>
                  <th className="pb-3 font-medium">Recorded Incidents</th>
                  <th className="pb-3 font-medium">Avg. Severity Score (1-5)</th>
                </tr>
              </thead>
              <tbody className="text-xs font-light text-white/80">
                {companyScores.map((c, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition">
                    <td className="py-4 font-medium text-white">{c.name}</td>
                    <td className="py-4">
                      <span className="bg-white/10 px-2 py-0.5 rounded-sm font-mono text-[10px]">{c.count}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px]">{c.avgSeverity}</span>
                        <div className="w-24 h-1.5 bg-white/5 rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-red-400"
                            style={{ width: `${(parseFloat(c.avgSeverity) / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center border border-white/5 border-dashed rounded-sm">
            <p className="text-xs text-white/40">No company data has been recorded yet.</p>
          </div>
        )}
      </div>

      {/* Double Column Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Identified Surveillance Tech Infraction Profile */}
        <div className="bg-white/[0.01] rounded-sm border border-white/5 p-6 shadow-md space-y-4">
          <div>
            <h3 className="text-base font-light text-white">Identified Surveillance Infractions</h3>
            <p className="text-xs text-white/40 mt-1 font-light leading-relaxed">
              Recurring technical algorithms utilized by platforms to monitor and manage human operatives. Select to view related testimonies.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {uniquePatterns.map((pt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectTagFilter(pt)}
                className="text-[10px] font-mono px-3 py-1.5 rounded-sm border border-white/5 hover:border-white/20 bg-white/5 hover:bg-white text-white/70 hover:text-black uppercase tracking-wider transition-all cursor-pointer"
              >
                #{pt}
              </button>
            ))}
            {uniquePatterns.length === 0 && (
              <p className="text-xs text-white/30 italic font-mono">No patterns compiled yet. Stories must be analyzed to compile indexes.</p>
            )}
          </div>
        </div>

        {/* Investigative Press & NGO Dossier Hub */}
        <div className="bg-white/[0.01] rounded-sm border border-white/5 p-6 shadow-md space-y-4">
          <div>
            <div className="border border-white/10 text-white/50 bg-[#0f0f0f] px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded-sm inline-flex">
              <Sparkles className="h-3 w-3 mr-1 self-center" />
              <span>Advocacy & Press Utility</span>
            </div>
            <h3 className="text-base font-light text-white mt-2">Investigative Evidence Export</h3>
            <p className="text-xs text-white/40 mt-1 font-light leading-relaxed">
              Download audited datasets directly to support legal representation, human rights lobbying, and press investigations.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportJson}
              className="w-full flex items-center justify-between p-4 border border-white/5 hover:border-white/20 bg-white/[0.005]/60 hover:bg-white/[0.02] rounded-sm transition duration-150 text-left font-sans cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-5 w-5 text-white/70" />
                <div>
                  <span className="block text-xs font-semibold text-white leading-normal">JSON Audited Dataset</span>
                  <span className="block text-[10px] text-white/40 mt-0.5">Clean database mapping category trends, infraction tags.</span>
                </div>
              </div>
              <Download className="h-4.5 w-4.5 text-white/30 group-hover:text-white transition" />
            </button>

            <button
              onClick={handleExportMarkdown}
              className="w-full flex items-center justify-between p-4 border border-white/5 hover:border-white/20 bg-white/[0.005]/60 hover:bg-white/[0.02] rounded-sm transition duration-150 text-left font-sans cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 text-white/70" />
                <div>
                  <span className="block text-xs font-semibold text-white leading-normal">Markdown Press Briefing Dossier</span>
                  <span className="block text-[10px] text-white/40 mt-0.5">Compiled long-form readouts for direct quote references.</span>
                </div>
              </div>
              <Download className="h-4.5 w-4.5 text-white/30 group-hover:text-white transition" />
            </button>
          </div>

          {downloadSuccessMessage && (
            <div className="text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 font-mono text-[10px] uppercase tracking-wider p-2.5 rounded-sm text-center animate-fadeIn">
              {downloadSuccessMessage}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
