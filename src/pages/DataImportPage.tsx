import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, FileJson, Eye, Edit2, X, Check, File } from 'lucide-react';
import { SectionHeader } from '../components/ui';
import { useWellContext } from '../hooks/useWellContext';
import type { DrillingEvent, EventType, EventSeverity, FormationId } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ReviewStatus = 'Selected' | 'Processing' | 'Needs Review' | 'Approved' | 'Rejected' | 'Failed';

interface PendingRecord {
  tempId: string;
  status: ReviewStatus;
  filename: string;
  extractionMethod: 'CSV' | 'JSON' | 'PDF Text' | 'Sample Data';
  extractedText: string;
  errorMessage?: string;
  data: Partial<DrillingEvent>;
}

export function DataImportPage() {
  const { addImportedRecords, importedRecords, clearImportedRecords } = useWellContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const createTempId = () => Math.random().toString(36).substr(2, 9);

  const processFile = async (file: File) => {
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const isJSON = file.name.toLowerCase().endsWith('.json');
    const isCSV = file.name.toLowerCase().endsWith('.csv');

    if (!isPDF && !isJSON && !isCSV) {
      alert("Unsupported file type. Please upload a .pdf, .csv, or .json file.");
      return;
    }

    try {
      if (isPDF) {
        await processPDF(file);
      } else if (isJSON) {
        await processJSON(file);
      } else if (isCSV) {
        await processCSV(file);
      }
    } catch (err: any) {
      console.error(err);
      // Create a failed record
      setPendingRecords(prev => [...prev, {
        tempId: createTempId(),
        status: 'Failed',
        filename: file.name,
        extractionMethod: isPDF ? 'PDF Text' : isJSON ? 'JSON' : 'CSV',
        extractedText: '',
        errorMessage: err.message || 'Failed to process file.',
        data: {}
      }]);
    }
  };

  const processPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error("No readable text found in PDF. Scanned-document OCR is not supported in this prototype.");
    }

    setPendingRecords(prev => [...prev, {
      tempId: createTempId(),
      status: 'Needs Review',
      filename: file.name,
      extractionMethod: 'PDF Text',
      extractedText: fullText.trim(),
      data: {}
    }]);
  };

  const processJSON = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("JSON file must contain an array of records.");
    
    const newRecords = data.map((row: any) => {
      const { isValid, errors } = validateRowData(row);
      return {
        tempId: createTempId(),
        status: (isValid ? 'Needs Review' : 'Rejected') as ReviewStatus,
        filename: file.name,
        extractionMethod: 'JSON' as const,
        extractedText: JSON.stringify(row, null, 2),
        errorMessage: isValid ? undefined : errors.join(', '),
        data: row
      };
    });

    setPendingRecords(prev => [...prev, ...newRecords]);
  };

  const processCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
    const headers = lines[0].split(',').map(h => h.trim());
    
    if (headers.includes('run_id') || headers.includes('start_depth_m') || headers.includes('end_depth_m')) {
      throw new Error("This file appears to contain drilling-run/interval data rather than historical incidents. Please map fields to the historical-event schema (Requires id, wellId, eventType, depth, severity).");
    }
    
    const newRecords: PendingRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const row: any = {};
      headers.forEach((header, index) => {
        let val = values[index] ? values[index].trim() : '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        if (header === 'depth' || header === 'durationHours') {
          row[header] = val ? Number(val) : undefined;
        } else {
          row[header] = val;
        }
      });
      
      const { isValid, errors } = validateRowData(row);
      newRecords.push({
        tempId: createTempId(),
        status: (isValid ? 'Needs Review' : 'Rejected') as ReviewStatus,
        filename: file.name,
        extractionMethod: 'CSV',
        extractedText: JSON.stringify(row, null, 2),
        errorMessage: isValid ? undefined : errors.join(', '),
        data: row
      });
    }

    setPendingRecords(prev => [...prev, ...newRecords]);
  };

  const validateRowData = (row: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!row.id) errors.push("Missing ID");
    if (!row.wellId) errors.push("Missing Well ID");
    if (!['Mud Loss', 'Stuck Pipe', 'Kick', 'Torque Spike', 'Cementing Issue', 'Fishing', 'NPT'].includes(row.eventType)) errors.push("Invalid eventType");
    if (typeof row.depth !== 'number' || isNaN(row.depth)) errors.push("Invalid depth");
    if (!['F1', 'F2', 'F3', 'F4', 'F5'].includes(row.formation)) errors.push("Invalid formation");
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(row.severity)) errors.push("Invalid severity");
    if (!row.description) errors.push("Missing description");
    if (!row.timestamp || isNaN(Date.parse(row.timestamp))) errors.push("Invalid timestamp");
    return { isValid: errors.length === 0, errors };
  };

  const handleApprove = (tempId: string) => {
    const record = pendingRecords.find(r => r.tempId === tempId);
    if (!record) return;

    const { isValid, errors } = validateRowData(record.data);
    if (!isValid) {
      alert("Cannot approve invalid record: " + errors.join(', '));
      return;
    }

    const eventToApprove: DrillingEvent = {
      id: record.data.id!,
      wellId: record.data.wellId!,
      eventType: record.data.eventType as EventType,
      depth: record.data.depth!,
      formation: record.data.formation as FormationId,
      severity: record.data.severity as EventSeverity,
      description: record.data.description!,
      mitigation: record.data.mitigation || '',
      sourceDocument: record.data.sourceDocument || record.filename,
      timestamp: record.data.timestamp!,
      durationHours: record.data.durationHours,
      sourceMetadata: {
        filename: record.filename,
        extractedText: record.extractedText.substring(0, 500) + (record.extractedText.length > 500 ? '...' : ''),
        extractionMethod: record.extractionMethod,
        importTimestamp: new Date().toISOString()
      }
    };

    addImportedRecords([eventToApprove]);
    
    setPendingRecords(prev => prev.map(r => 
      r.tempId === tempId ? { ...r, status: 'Approved' } : r
    ));
    setSelectedRecordId(null);
  };

  const handleReject = (tempId: string) => {
    setPendingRecords(prev => prev.map(r => 
      r.tempId === tempId ? { ...r, status: 'Rejected', errorMessage: 'Manually rejected by user' } : r
    ));
    setSelectedRecordId(null);
  };

  const updateRecordData = (tempId: string, field: string, value: any) => {
    setPendingRecords(prev => prev.map(r => {
      if (r.tempId === tempId) {
        return { ...r, data: { ...r.data, [field]: value } };
      }
      return r;
    }));
  };

  const loadSampleData = () => {
    const sampleRecord: PendingRecord = {
      tempId: createTempId(),
      status: 'Needs Review',
      filename: 'SampleData.json',
      extractionMethod: 'Sample Data',
      extractedText: '{"id": "EV-SAMPLE", "eventType": "Torque Spike"}',
      data: {
        id: "EV-SAMPLE-01",
        wellId: "OFFSET-1",
        eventType: "Torque Spike",
        depth: 3500,
        formation: "F4",
        severity: "MEDIUM",
        description: "Unexpected torque spike during drilling.",
        mitigation: "Reduced WOB and circulated.",
        sourceDocument: "DOC-2023-01",
        timestamp: "2023-01-15T08:00:00Z",
        durationHours: 2
      }
    };
    setPendingRecords(prev => [...prev, sampleRecord]);
  };

  const handleClearRecords = () => {
    if (confirm("Are you sure you want to clear all imported records? This will permanently delete your session imports without affecting the seeded dataset.")) {
      clearImportedRecords();
    }
  };

  const selectedRecord = pendingRecords.find(r => r.tempId === selectedRecordId);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10 flex">
      <div className="flex-1 space-y-6">
        <SectionHeader 
          title="Historical Records Studio" 
          subtitle="Import, parse, and review historical well records (CSV, JSON, PDF). Browser-based prototype." 
          icon={Upload} 
        />

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-400 text-center flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          <span><strong>Browser-based prototype.</strong> Files are processed locally for demonstration. No records are sent to OIL systems or a backend.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upload */}
          <div className="space-y-6">
            <div className="bg-surface-card border border-border-default rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Upload size={16} className="text-accent-400" /> Upload File
              </h3>

              <div 
                className="border-2 border-dashed border-border-subtle hover:border-accent-500/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center bg-navy-900/50 cursor-pointer mb-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText size={32} className="text-slate-500 mb-3" />
                <p className="text-sm text-white font-medium mb-1">Click to select a file</p>
                <p className="text-xs text-slate-500">Supports .csv, .json, and text-based .pdf</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".csv,.json,application/json,text/csv,application/pdf" 
                  onChange={handleFileChange}
                />
              </div>

              <button 
                onClick={loadSampleData}
                className="w-full py-2 bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs rounded border border-border-subtle transition-colors mb-2"
              >
                Load Built-in Sample Record
              </button>

              <button 
                onClick={handleClearRecords}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30 transition-colors"
              >
                Clear All Approved Demo Records
              </button>
            </div>

            <div className="bg-surface-card border border-border-default rounded-xl p-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Approved Records</h4>
              <div className="text-3xl font-bold text-white mb-2">{importedRecords.length}</div>
              <p className="text-xs text-slate-500">Available in Knowledge Search & Correlation</p>
            </div>
          </div>

          {/* Right Column: Processing Queue */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-card border border-border-default rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Processing Queue</h3>

              {pendingRecords.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border-subtle rounded-xl bg-navy-900/30">
                  <p className="text-sm text-slate-500">No records imported yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRecords.map(record => (
                    <div 
                      key={record.tempId} 
                      className={`p-3 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedRecordId === record.tempId ? 'bg-navy-800 border-accent-500' : 'bg-navy-900 border-border-subtle hover:border-slate-500'
                      }`}
                      onClick={() => setSelectedRecordId(record.tempId)}
                    >
                      <div className="flex items-center gap-3">
                        {record.extractionMethod === 'PDF Text' ? <File size={16} className="text-slate-400"/> : <FileJson size={16} className="text-slate-400"/>}
                        <div>
                          <p className="text-sm text-white font-medium">{record.filename}</p>
                          <p className="text-[10px] text-slate-500">{record.extractionMethod} • {record.data.eventType || 'Unknown Event'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={record.status} />
                        <ArrowRight size={14} className="text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Drawer */}
      {selectedRecord && (
        <div className="w-[400px] shrink-0 bg-surface-secondary border-l border-border-default h-[calc(100vh-80px)] overflow-y-auto fixed right-0 top-[80px] p-5 shadow-2xl z-40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 size={18} className="text-accent-400" /> Review Record
            </h2>
            <button onClick={() => setSelectedRecordId(null)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
             <StatusBadge status={selectedRecord.status} />
             {selectedRecord.errorMessage && (
               <p className="text-xs text-red-400 mt-2 bg-red-500/10 p-2 rounded">{selectedRecord.errorMessage}</p>
             )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Event ID *</label>
                <input 
                  type="text" 
                  value={selectedRecord.data.id || ''} 
                  onChange={(e) => updateRecordData(selectedRecord.tempId, 'id', e.target.value)}
                  className="w-full bg-navy-900 border border-border-subtle rounded p-2 text-sm text-white focus:outline-none focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Well ID *</label>
                <input 
                  type="text" 
                  value={selectedRecord.data.wellId || ''} 
                  onChange={(e) => updateRecordData(selectedRecord.tempId, 'wellId', e.target.value)}
                  className="w-full bg-navy-900 border border-border-subtle rounded p-2 text-sm text-white focus:outline-none focus:border-accent-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Event Type *</label>
              <select 
                value={selectedRecord.data.eventType || ''} 
                onChange={(e) => updateRecordData(selectedRecord.tempId, 'eventType', e.target.value)}
                className="w-full bg-navy-900 border border-border-subtle rounded p-2 text-sm text-white focus:outline-none focus:border-accent-500"
              >
                <option value="">Select...</option>
                {['Mud Loss', 'Stuck Pipe', 'Kick', 'Torque Spike', 'Cementing Issue', 'Fishing', 'NPT'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Depth (m) *</label>
                <input 
                  type="number" 
                  value={selectedRecord.data.depth || ''} 
                  onChange={(e) => updateRecordData(selectedRecord.tempId, 'depth', Number(e.target.value))}
                  className="w-full bg-navy-900 border border-border-subtle rounded p-2 text-sm text-white focus:outline-none focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Severity *</label>
                <select 
                  value={selectedRecord.data.severity || ''} 
                  onChange={(e) => updateRecordData(selectedRecord.tempId, 'severity', e.target.value)}
                  className="w-full bg-navy-900 border border-border-subtle rounded p-2 text-sm text-white focus:outline-none focus:border-accent-500"
                >
                  <option value="">Select...</option>
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Formation *</label>
                <select 
                  value={selectedRecord.data.formation || ''} 
                  onChange={(e) => updateRecordData(selectedRecord.tempId, 'formation', e.target.value)}
                  className="w-full bg-navy-900 border border-border-subtle rounded p-2 text-sm text-white focus:outline-none focus:border-accent-500"
                >
                  <option value="">Select...</option>
                  {['F1', 'F2', 'F3', 'F4', 'F5'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Timestamp *</label>
                <input 
                  type="text" 
                  placeholder="YYYY-MM-DD..."
                  value={selectedRecord.data.timestamp || ''} 
                  onChange={(e) => updateRecordData(selectedRecord.tempId, 'timestamp', e.target.value)}
                  className="w-full bg-navy-900 border border-border-subtle rounded p-2 text-sm text-white focus:outline-none focus:border-accent-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Description *</label>
              <textarea 
                rows={3}
                value={selectedRecord.data.description || ''} 
                onChange={(e) => updateRecordData(selectedRecord.tempId, 'description', e.target.value)}
                className="w-full bg-navy-900 border border-border-subtle rounded p-2 text-sm text-white focus:outline-none focus:border-accent-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Mitigation</label>
              <textarea 
                rows={2}
                value={selectedRecord.data.mitigation || ''} 
                onChange={(e) => updateRecordData(selectedRecord.tempId, 'mitigation', e.target.value)}
                className="w-full bg-navy-900 border border-border-subtle rounded p-2 text-sm text-white focus:outline-none focus:border-accent-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-8">
             <button 
               onClick={() => handleApprove(selectedRecord.tempId)}
               disabled={selectedRecord.status === 'Approved'}
               className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
             >
               <Check size={16} /> Approve
             </button>
             <button 
               onClick={() => handleReject(selectedRecord.tempId)}
               disabled={selectedRecord.status === 'Approved' || selectedRecord.status === 'Rejected'}
               className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 font-bold rounded flex items-center justify-center gap-2 transition-colors"
             >
               <X size={16} /> Reject
             </button>
          </div>

          <div className="border-t border-border-subtle pt-6">
             <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
               <Eye size={16} className="text-accent-400" /> View Source
             </h3>
             <p className="text-[10px] text-slate-500 mb-3">Extracted from: {selectedRecord.filename} ({selectedRecord.extractionMethod})</p>
             <div className="bg-navy-950 p-3 rounded border border-border-subtle text-xs text-slate-300 font-mono h-48 overflow-y-auto whitespace-pre-wrap">
               {selectedRecord.extractedText || "No text could be extracted."}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  let color = 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  if (status === 'Approved') color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (status === 'Rejected' || status === 'Failed') color = 'bg-red-500/20 text-red-400 border-red-500/30';
  if (status === 'Needs Review') color = 'bg-amber-500/20 text-amber-400 border-amber-500/30';

  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {status}
    </span>
  );
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );
}
