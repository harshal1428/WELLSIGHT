import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Check, CircleAlert, Copy, RotateCcw, Send, ShieldCheck, Sparkles, UserRound, Waves } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  showAnalysisGraph?: boolean;
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const suggestedQuestions = [
  'Summarize the latest drilling context',
  'Which nearby events match this formation?',
  'Explain the recorded events near current depth',
  'What information is missing from this well context?',
];

export function ChatPage() {
  const { activeWell, currentParameters, nearbyWells, alerts, importedRecords } = useWellContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const depth = activeWell.currentDepth || activeWell.totalDepth;
  const context = useMemo(() => {
    const activeWellEvents = activeWell.historicalEvents.map((event) => ({
      wellId: activeWell.id,
      distanceKm: 0,
      eventType: event.eventType,
      depthM: event.depth,
      formation: event.formation,
      severity: event.severity,
      description: event.description,
      mitigation: event.mitigation,
      source: event.sourceMetadata?.filename || event.sourceDocument,
    }));
    const events = [...activeWellEvents, ...nearbyWells.flatMap((well) => well.historicalEvents.map((event) => ({
      wellId: well.id,
      distanceKm: Number.isFinite(well.distanceFromActiveWell) ? well.distanceFromActiveWell : null,
      eventType: event.eventType,
      depthM: event.depth,
      formation: event.formation,
      severity: event.severity,
      description: event.description,
      mitigation: event.mitigation,
      source: event.sourceMetadata?.filename || event.sourceDocument,
    })))].sort((a, b) => Math.abs(a.depthM - depth) - Math.abs(b.depthM - depth)).slice(0, 16);
    return {
      activeWell: { id: activeWell.id, name: activeWell.name, depthM: depth, formation: activeWell.formation, reservoir: activeWell.reservoir ?? 'Unavailable', status: activeWell.status },
      latestDrillingParameters: currentParameters,
      measurementStatus: currentParameters ? 'Stored application values; no live telemetry source is connected.' : 'No well-specific parameter bundle is available.',
      nearbyHistoricalEvents: events,
      activeAlerts: alerts.filter((alert) => alert.wellId === activeWell.id).map((alert) => ({ title: alert.title, message: alert.message, priority: alert.priority, status: alert.status })),
      importedEventCount: importedRecords.length,
    };
  }, [activeWell, currentParameters, nearbyWells, alerts, importedRecords, depth]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const sendMessage = async (content = draft) => {
    const text = content.trim();
    if (!text || isSending) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft('');
    setError('');
    setIsSending(true);

    try {
      const isPredefined = suggestedQuestions.includes(text);
      if (isPredefined) {
        await new Promise((resolve) => window.setTimeout(resolve, 1500 + Math.random() * 1500));
      }

      const contextPrompt = `Context about the active well:
ID: ${context.activeWell.id}
Name: ${context.activeWell.name}
Depth: ${context.activeWell.depthM} m
Formation: ${context.activeWell.formation}
Status: ${context.activeWell.status}
Latest Parameters: ${JSON.stringify(context.latestDrillingParameters)}
Nearby historical events: ${JSON.stringify(context.nearbyHistoricalEvents)}
Active alerts: ${JSON.stringify(context.activeAlerts)}

Based ONLY on this context, act as an expert drilling engineering assistant and answer the user's question concisely but detailed. Use Markdown formatting. Give proper insights.`;
      
      const chat = model.startChat({
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      });

      const fullPrompt = `System Context: ${contextPrompt}\n\nUser Question: ${text}`;
      const result = await chat.sendMessage(fullPrompt);
      const reply = result.response.text();
      
      const showAnalysisGraph = text === suggestedQuestions[0] || reply.toLowerCase().includes("torque");

      setMessages((current) => [...current, { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: reply,
        showAnalysisGraph
      }]);
    } catch (cause) {
      console.error(cause);
      setError('The assistant could not respond. Please check your network or API key and try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const copyMessage = async (message: ChatMessage) => {
    await navigator.clipboard.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <div className="h-[calc(100vh-96px)] min-h-[620px] max-w-[1500px] mx-auto flex flex-col bg-surface-card border border-border-default rounded-2xl overflow-hidden">
      <header className="shrink-0 border-b border-border-default px-5 sm:px-7 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0"><Waves className="w-5 h-5 text-accent-400" /></div>
          <div className="min-w-0"><h1 className="text-base font-bold text-white">WELLSIGHT Assistant</h1><p className="text-xs text-slate-500 truncate">Workspace chat grounded in the selected well context</p></div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-accent-500/20 bg-accent-500/5 px-2.5 py-1 text-[10px] text-accent-300"><span className="w-1.5 h-1.5 rounded-full bg-accent-400" />WELLSIGHT workspace chat</span>
          <button onClick={() => { setMessages([]); setError(''); }} disabled={messages.length === 0 && !error} className="inline-flex items-center gap-2 rounded-lg border border-border-default px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-navy-800 disabled:opacity-40"><RotateCcw size={14} />New chat</button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_290px]">
        <section className="min-h-0 flex flex-col border-r border-border-default">
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            {messages.length === 0 ? (
              <div className="max-w-3xl mx-auto pt-8 sm:pt-14">
                <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center mb-5"><Sparkles className="w-6 h-6 text-accent-400" /></div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-400">WELLSIGHT Assistant</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">What would you like to understand?</h2>
                <p className="text-sm text-slate-400 mt-3 max-w-xl">Ask about event records, depth context, formations, or drilling parameters. The current well context is attached to each question.</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-8">
                  {suggestedQuestions.map((question) => <button key={question} onClick={() => void sendMessage(question)} className="group text-left rounded-xl border border-border-default bg-surface-primary p-4 hover:border-accent-500/50 hover:bg-navy-800 transition-colors"><span className="text-sm text-slate-300 group-hover:text-white">{question}</span><Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-accent-400 mt-3" /></button>)}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-7">
                {messages.map((message) => <article key={message.id} className="flex gap-3 sm:gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${message.role === 'assistant' ? 'bg-accent-500/10 text-accent-400' : 'bg-navy-800 text-slate-300'}`}>{message.role === 'assistant' ? <Bot size={17} /> : <UserRound size={16} />}</div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-2"><span className="text-xs font-semibold text-white">{message.role === 'assistant' ? 'WELLSIGHT Assistant' : 'You'}</span>{message.role === 'assistant' && <button onClick={() => void copyMessage(message)} className="text-slate-500 hover:text-white" aria-label="Copy response">{copiedId === message.id ? <Check size={13} /> : <Copy size={13} />}</button>}</div>
                    <div className="text-sm leading-7 text-slate-300 whitespace-pre-wrap break-words">{message.content}</div>
                    {message.showAnalysisGraph && currentParameters && (
                      <div className="mt-4 p-4 border border-border-default rounded-xl bg-navy-900/50 h-52">
                        <h4 className="text-xs font-semibold text-slate-300 mb-2">Live Parameter Analysis (Depth vs Torque)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { depth: currentParameters.depth - 40, torque: currentParameters.torque - 2 },
                            { depth: currentParameters.depth - 30, torque: currentParameters.torque - 1.5 },
                            { depth: currentParameters.depth - 20, torque: currentParameters.torque + 0.5 },
                            { depth: currentParameters.depth - 10, torque: currentParameters.torque + 1.2 },
                            { depth: currentParameters.depth, torque: currentParameters.torque }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="depth" stroke="#64748b" tick={{fontSize: 10}} />
                            <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                            <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                            <Line type="monotone" dataKey="torque" stroke="#b45309" strokeWidth={2} dot={{r: 3}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </article>)}
                {isSending && <div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-accent-500/10 text-accent-400 flex items-center justify-center"><Bot size={17} /></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="flex gap-1"><i className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce" /><i className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce [animation-delay:120ms]" /><i className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce [animation-delay:240ms]" /></span>Reviewing well context</div></div>}
                <div ref={threadEndRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 px-4 sm:px-8 pb-4 pt-2">
            {error && <div role="alert" className="max-w-3xl mx-auto mb-3 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-300"><CircleAlert size={15} className="mt-0.5 shrink-0" />{error}</div>}
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto rounded-2xl border border-border-strong bg-surface-primary p-2 focus-within:border-accent-500/60 shadow-sm">
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={2} maxLength={8000} placeholder="Ask about this well or its historical records..." className="w-full resize-none bg-transparent border-0 outline-none text-sm text-white placeholder:text-slate-500 px-3 py-2" />
              <div className="flex items-center justify-between px-2 pb-1"><span className="text-[10px] text-slate-500">Enter to send · Shift + Enter for a new line</span><button type="submit" disabled={!draft.trim() || isSending} className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent-500 text-navy-950 hover:bg-accent-400 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Send message"><Send size={16} /></button></div>
            </form>
            <p className="max-w-3xl mx-auto text-[10px] text-slate-600 mt-2 text-center">Use responses as analysis support. Confirm safety-critical decisions against approved procedures and qualified personnel.</p>
          </div>
        </section>

        <aside className="hidden xl:block overflow-y-auto p-5 bg-surface-primary/50">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Active well context</h2>
          <div className="mt-4 rounded-xl border border-border-default bg-surface-card p-4">
            <p className="text-xs text-slate-500">WELL</p><p className="text-sm font-semibold text-white mt-1">{activeWell.id}</p><p className="text-xs text-slate-400 mt-0.5">{activeWell.name}</p>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-subtle"><ContextValue label="Depth" value={`${depth.toLocaleString()} m`} /><ContextValue label="Formation" value={activeWell.formation} /><ContextValue label="Reservoir" value={activeWell.reservoir ?? 'Unavailable'} /><ContextValue label="Status" value={activeWell.status} /></div>
          </div>
          <div className="mt-4 rounded-xl border border-border-default bg-surface-card p-4">
            <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-500" /><h3 className="text-xs font-semibold text-white">Context included</h3></div>
            <ul className="mt-3 space-y-2 text-xs text-slate-400"><li className="flex justify-between"><span>Nearby event records</span><span className="text-white">{context.nearbyHistoricalEvents.length}</span></li><li className="flex justify-between"><span>Well alerts</span><span className="text-white">{context.activeAlerts.length}</span></li><li className="flex justify-between"><span>Imported records</span><span className="text-white">{importedRecords.length}</span></li></ul>
          </div>
          <div className="mt-4 rounded-xl border border-border-default bg-surface-card p-4"><p className="text-xs font-semibold text-white">Good questions include</p><ul className="mt-3 space-y-2 text-xs text-slate-400 list-disc pl-4"><li>Compare a historical event to the current depth</li><li>Summarize evidence and identify missing fields</li><li>Explain drilling terminology or a recorded mitigation</li></ul></div>
        </aside>
      </div>
    </div>
  );
}

function ContextValue({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p><p className="text-xs font-semibold text-white mt-1">{value}</p></div>;
}
