import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Check, CircleAlert, Copy, FileText, History, ImagePlus, RotateCcw, Send, ShieldCheck, Sparkles, UserRound, Waves, X } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  showAnalysisGraph?: boolean;
  attachments?: ChatAttachment[];
}

interface ChatAttachment {
  name: string;
  type: string;
  text?: string;
  dataUrl?: string;
}

const suggestedQuestions = [
  'Summarize the latest drilling context',
  'Which nearby events match this formation?',
  'Explain the recorded events near current depth',
  'What information is missing from this well context?',
];

interface StoredConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

const CHAT_HISTORY_KEY = 'wellsight-chat-history-v1';

function loadChatHistory(): StoredConversation[] {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is StoredConversation =>
      item && typeof item.id === 'string' && typeof item.title === 'string' &&
      typeof item.updatedAt === 'string' && Array.isArray(item.messages) &&
      item.messages.every((message: ChatMessage) =>
        message && typeof message.id === 'string' &&
        (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string',
      ),
    ).slice(0, 25);
  } catch {
    return [];
  }
}

export function ChatPage() {
  const { activeWell, currentParameters, nearbyWells, alerts, importedRecords } = useWellContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>(() => crypto.randomUUID());
  const [chatHistory, setChatHistory] = useState<StoredConversation[]>(loadChatHistory);
  const [showPreviousChats, setShowPreviousChats] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState('');
  const threadEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const saveConversation = (conversationId: string, conversationMessages: ChatMessage[]) => {
    const firstUserMessage = conversationMessages.find((message) => message.role === 'user');
    if (!firstUserMessage) return;
    const conversation: StoredConversation = {
      id: conversationId,
      title: firstUserMessage.content.slice(0, 72),
      messages: conversationMessages.map((message) => ({
        ...message,
        attachments: message.attachments?.map(({ name, type, text }) => ({ name, type, text })),
      })),
      updatedAt: new Date().toISOString(),
    };
    setChatHistory((previous) => [conversation, ...previous.filter((item) => item.id !== conversationId)]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 25));
  };

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    } catch {
      // Chat continues to work if browser storage is unavailable or full.
    }
  }, [chatHistory]);

  const sendMessage = async (content = draft) => {
    const text = content.trim();
    if ((!text && attachments.length === 0) || isSending) return;
    const attached = attachments;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text || `Please review the attached file${attached.length > 1 ? 's' : ''}.`, attachments: attached };
    const nextMessages = [...messages, userMessage];
    const conversationId = activeConversationId;
    setMessages(nextMessages);
    saveConversation(conversationId, nextMessages);
    setDraft('');
    setAttachments([]);
    setError('');
    setIsSending(true);

    try {
      if (suggestedQuestions.includes(text) && attached.length === 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 2000 + Math.random() * 1000));
        const events = context.nearbyHistoricalEvents;
        const matchingFormation = events.filter((event) => event.formation === context.activeWell.formation);
        const nearDepth = events.filter((event) => Math.abs(event.depthM - context.activeWell.depthM) <= 150);
        const describeEvent = (event: typeof events[number]) => `• ${event.wellId} · ${event.eventType} · ${event.depthM.toLocaleString()} m · ${event.severity}: ${event.description}${event.mitigation ? ` Mitigation recorded: ${event.mitigation}` : ''}`;
        let reply: string;

        switch (text) {
          case suggestedQuestions[0]:
            reply = `${context.activeWell.id} is at ${context.activeWell.depthM.toLocaleString()} m in ${context.activeWell.formation}, reservoir ${context.activeWell.reservoir}, with status ${context.activeWell.status}. There are ${events.length} nearby historical event records and ${context.activeAlerts.length} alerts for this well. ${context.latestDrillingParameters ? 'Stored drilling parameter values are available in the workspace.' : 'No drilling parameter bundle is available.'} These values are workspace context, not a live telemetry connection.`;
            break;
          case suggestedQuestions[1]:
            reply = matchingFormation.length
              ? `Historical events in formation ${context.activeWell.formation}:\n\n${matchingFormation.slice(0, 8).map(describeEvent).join('\n\n')}\n\nThese records are for comparison and do not establish that the same conditions are present in the active well.`
              : `No nearby historical event records in formation ${context.activeWell.formation} are available in the current workspace context.`;
            break;
          case suggestedQuestions[2]:
            reply = nearDepth.length
              ? `Historical events within 150 m of ${context.activeWell.depthM.toLocaleString()} m:\n\n${nearDepth.slice(0, 8).map(describeEvent).join('\n\n')}\n\nDepth proximity is a comparison aid, not a prediction or diagnosis.`
              : `No historical events are recorded within 150 m of ${context.activeWell.depthM.toLocaleString()} m in the available context. ${events.length} nearby event record(s) are available overall.`;
            break;
          default: {
            const missing: string[] = [];
            if (!context.latestDrillingParameters) missing.push('a drilling parameter bundle');
            if (!events.length) missing.push('nearby historical event records');
            if (!context.activeWell.reservoir || context.activeWell.reservoir === 'Unavailable') missing.push('reservoir information');
            if (!context.importedEventCount) missing.push('user-imported event records');
            reply = `Available context includes well ${context.activeWell.id}, depth ${context.activeWell.depthM.toLocaleString()} m, formation ${context.activeWell.formation}, ${events.length} nearby event record(s), and ${context.activeAlerts.length} alert(s). ${missing.length ? `Not available: ${missing.join(', ')}.` : 'The main well, parameter, event, and imported-record fields are populated.'} Independent source verification and live telemetry status are not available in this chat context.`;
          }
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
          showAnalysisGraph: text === suggestedQuestions[0],
        };
        const completedMessages = [...nextMessages, assistantMessage];
        setMessages(completedMessages);
        saveConversation(conversationId, completedMessages);
        return;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-20).map(({ role, content, attachments: files }) => ({ role, content, attachments: files })),
          context,
        }),
      });
      const result = await response.json() as { reply?: string; error?: string };
      if (!response.ok || !result.reply) throw new Error(result.error || 'The assistant could not respond. Try again.');
      const reply = result.reply;
      
      const showAnalysisGraph = text === suggestedQuestions[0] || reply.toLowerCase().includes("torque");

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: reply,
        showAnalysisGraph
      };
      const completedMessages = [...nextMessages, assistantMessage];
      setMessages(completedMessages);
      saveConversation(conversationId, completedMessages);
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'The assistant could not respond. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    setAttachmentError('');
    const accepted: ChatAttachment[] = [];
    try {
      for (const file of Array.from(fileList)) {
        if (attachments.length + accepted.length >= 4) throw new Error('Attach up to 4 files per message.');
        if (file.size > 2_500_000) throw new Error(`${file.name} is larger than the 2.5 MB limit.`);
        if (file.type.startsWith('image/')) {
          if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('Use a PNG, JPG, WEBP, or GIF image.');
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image.'));
            reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
            reader.readAsDataURL(file);
          });
          accepted.push({ name: file.name, type: file.type, dataUrl });
        } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
          const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
          let text = '';
          for (let pageNo = 1; pageNo <= Math.min(pdf.numPages, 30); pageNo += 1) {
            const page = await pdf.getPage(pageNo);
            const content = await page.getTextContent();
            text += `${content.items.map((item) => 'str' in item ? item.str : '').join(' ')}\n`;
            if (text.length > 30_000) break;
          }
          if (!text.trim()) throw new Error(`${file.name} has no extractable text.`);
          accepted.push({ name: file.name, type: 'application/pdf', text: text.slice(0, 30_000) });
        } else if (/\.(txt|md|csv|json|log)$/i.test(file.name) || ['text/plain', 'text/csv', 'application/json'].includes(file.type)) {
          accepted.push({ name: file.name, type: file.type || 'text/plain', text: (await file.text()).slice(0, 30_000) });
        } else {
          throw new Error('Supported files: images, PDF, TXT, MD, CSV, JSON, and LOG.');
        }
      }
      setAttachments((previous) => [...previous, ...accepted]);
    } catch (cause) {
      setAttachmentError(cause instanceof Error ? cause.message : 'Could not add the selected file.');
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
      <header className="shrink-0 border-b border-border-default px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0"><Waves className="w-5 h-5 text-accent-400" /></div>
          <div className="min-w-0"><h1 className="text-base font-bold text-white">WELLSIGHT Assistant</h1><p className="text-xs text-slate-500 truncate">Workspace chat grounded in the selected well context</p></div>
        </div>
        <div className="relative flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-accent-500/20 bg-accent-500/5 px-2.5 py-1 text-[10px] text-accent-300"><span className="w-1.5 h-1.5 rounded-full bg-accent-400" />WELLSIGHT workspace chat</span>
          <button
            type="button"
            aria-expanded={showPreviousChats}
            disabled={isSending}
            onClick={() => setShowPreviousChats((open) => !open)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface-primary px-3 py-2 text-xs font-semibold !text-navy-50 shadow-sm hover:border-accent-500/50 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 disabled:opacity-50"
          ><History size={15} className="text-accent-600" />Previous chats</button>
          <button onClick={() => { setActiveConversationId(crypto.randomUUID()); setMessages([]); setError(''); setShowPreviousChats(false); }} disabled={messages.length === 0 && !error} className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface-primary px-3 py-2 text-xs font-semibold !text-navy-50 shadow-sm hover:border-accent-500/50 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 disabled:opacity-50"><RotateCcw size={14} className="text-accent-600" />New chat</button>
          {showPreviousChats && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border-default bg-surface-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                <p className="text-xs font-bold !text-navy-50">Previous chats</p>
                <button type="button" onClick={() => setShowPreviousChats(false)} className="text-xs font-semibold !text-slate-300 hover:!text-navy-50">Close</button>
              </div>
              {chatHistory.length ? (
                <div className="max-h-80 overflow-y-auto p-2">
                  {chatHistory.map((conversation) => (
                    <button
                      type="button"
                      key={conversation.id}
                      onClick={() => {
                        setActiveConversationId(conversation.id);
                        setMessages(conversation.messages);
                        setError('');
                        setShowPreviousChats(false);
                      }}
                      className={`block w-full rounded-lg px-3 py-2.5 text-left hover:bg-surface-elevated ${conversation.id === activeConversationId ? 'bg-accent-500/10' : ''}`}
                    >
                      <span className="block truncate text-xs font-semibold !text-navy-50">{conversation.title}</span>
                      <span className="mt-1 block text-[10px] !text-slate-300">{new Date(conversation.updatedAt).toLocaleString()} · {conversation.messages.length} messages</span>
                    </button>
                  ))}
                </div>
              ) : <p className="px-4 py-5 text-xs !text-slate-300">Your previous conversations will appear here.</p>}
            </div>
          )}
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
                    {message.attachments?.length ? <div className="mb-2 flex flex-wrap gap-2">{message.attachments.map((file, index) => <span key={`${file.name}-${index}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-primary px-2.5 py-1.5 text-xs text-slate-300"><FileText size={13} className="text-accent-400" />{file.name}</span>)}</div> : null}
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
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,.pdf,.txt,.md,.csv,.json,.log" multiple className="hidden" onChange={(event) => { void handleFiles(event.target.files); event.target.value = ''; }} aria-label="Choose document or image" />
              {attachments.length > 0 && <div className="flex flex-wrap gap-2 px-2 pt-1">{attachments.map((file, index) => <span key={`${file.name}-${index}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-card px-2 py-1 text-[11px] text-slate-300"><FileText size={12} className="text-accent-400" />{file.name}<button type="button" aria-label={`Remove ${file.name}`} onClick={() => setAttachments((previous) => previous.filter((_, itemIndex) => itemIndex !== index))} className="ml-1 text-slate-400 hover:text-white"><X size={12} /></button></span>)}</div>}
              {attachmentError && <p role="alert" className="px-3 pt-2 text-xs text-rose-300">{attachmentError}</p>}
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={2} maxLength={8000} placeholder="Ask about this well or its historical records..." className="w-full resize-none bg-transparent border-0 outline-none text-sm text-white placeholder:text-slate-500 px-3 py-2" />
              <div className="flex items-center justify-between px-2 pb-1"><div className="flex items-center gap-3"><button type="button" onClick={() => fileInputRef.current?.click()} disabled={isSending || attachments.length >= 4} className="inline-flex h-9 items-center gap-2 rounded-xl border border-border-strong bg-surface-card px-3 text-xs font-semibold text-slate-200 hover:border-accent-500/60 hover:text-white disabled:opacity-50" aria-label="Add document or image"><ImagePlus size={15} className="text-accent-400" /><span>Add doc/image</span></button><span className="hidden sm:inline text-[10px] text-slate-500">Enter to send · Shift + Enter for a new line</span></div><button type="submit" disabled={(!draft.trim() && attachments.length === 0) || isSending} className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent-500 text-navy-950 hover:bg-accent-400 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Send message"><Send size={16} /></button></div>
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
