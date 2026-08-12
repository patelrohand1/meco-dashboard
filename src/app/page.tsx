"use client";

import { useState } from 'react';
import { RefreshCw, Activity, TrendingUp, Zap, ServerCrash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Insight {
  title: string;
  description: string;
}

interface NewsletterAnalysis {
  score: number;
  tldr: string;
  insights: Insight[];
}

interface ProcessedNewsletter {
  id: number;
  subject: string;
  sender: string;
  date: string;
  analysis: NewsletterAnalysis;
}

export default function Home() {
  const [newsletters, setNewsletters] = useState<ProcessedNewsletter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasScanned, setHasScanned] = useState(false);

  const triggerScan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/scan');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to scan newsletters');
      
      setNewsletters(data.data || []);
      setHasScanned(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6 sm:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="text-blue-500" /> Market Intelligence
            </h1>
            <p className="text-neutral-400 mt-1 text-sm">Automated alpha generation from your newsletter inbox.</p>
          </div>
          <button 
            onClick={triggerScan}
            disabled={loading}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-yellow-300" />}
            {loading ? 'Scanning Inbox...' : 'Trigger Scan'}
          </button>
        </header>

        {/* Content */}
        <main>
          {error && (
            <div className="p-4 rounded-lg bg-red-950/50 border border-red-900/50 text-red-200 flex items-start gap-3">
              <ServerCrash className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <div>
                <h3 className="font-medium text-red-300">Scan Error</h3>
                <p className="text-sm opacity-90">{error}</p>
                <p className="text-xs mt-2 opacity-75">Ensure GEMINI_API_KEY is set in your .env.local file, and that you have run 'node meco-login.mjs' to authenticate.</p>
              </div>
            </div>
          )}

          {!loading && !error && hasScanned && newsletters.length === 0 && (
            <div className="text-center py-20 text-neutral-500 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No new newsletters found.</p>
            </div>
          )}

          {!hasScanned && !loading && !error && (
             <div className="text-center py-20 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
              <p className="text-neutral-400 mb-2">Ready to discover alpha.</p>
              <p className="text-sm text-neutral-600">Click Trigger Scan to process your unread emails.</p>
           </div>
          )}

          <div className="grid gap-6">
            {newsletters.map((nl) => (
              <article key={nl.id} className="relative group overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all shadow-lg shadow-black/20">
                {/* Score Badge */}
                <div className="absolute top-0 right-0 m-4 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-900/80 to-blue-950 border border-blue-500/20 shadow-inner">
                  <span className="text-xs text-blue-300/70 font-semibold mb-[-2px]">SCORE</span>
                  <span className="text-xl font-black text-white">{nl.analysis.score}</span>
                </div>

                <div className="p-6 sm:p-8 pr-24">
                  <div className="flex items-center gap-3 mb-4 text-sm text-neutral-400">
                    <span className="truncate max-w-[200px] text-blue-400 font-medium">{nl.sender}</span>
                    <span>•</span>
                    <time>{new Date(nl.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 pr-4">{nl.subject}</h2>
                  
                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30 text-blue-50 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1 block">TL;DR</span>
                    <p className="text-sm leading-relaxed">{nl.analysis.tldr}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Key Market Insights
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {nl.analysis.insights.map((insight, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/50 hover:bg-neutral-800/50 transition-colors">
                          <h4 className="font-semibold text-neutral-200 mb-2">{insight.title}</h4>
                          <p className="text-sm text-neutral-400 leading-relaxed">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
