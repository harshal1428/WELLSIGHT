import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { WellProvider } from './hooks/useWellContext';
import { AppLayout } from './components/layout/AppLayout';

const OverviewPage = lazy(() => import('./pages/OverviewPage').then(({ OverviewPage }) => ({ default: OverviewPage })));
const LiveWellPage = lazy(() => import('./pages/LiveWellPage').then(({ LiveWellPage }) => ({ default: LiveWellPage })));
const NearbyWellsPage = lazy(() => import('./pages/NearbyWellsPage').then(({ NearbyWellsPage }) => ({ default: NearbyWellsPage })));
const CorrelationPage = lazy(() => import('./pages/CorrelationPage').then(({ CorrelationPage }) => ({ default: CorrelationPage })));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage').then(({ KnowledgePage }) => ({ default: KnowledgePage })));
const RiskIntelligencePage = lazy(() => import('./pages/RiskIntelligencePage').then(({ RiskIntelligencePage }) => ({ default: RiskIntelligencePage })));
const AlertsPage = lazy(() => import('./pages/AlertsPage').then(({ AlertsPage }) => ({ default: AlertsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(({ ReportsPage }) => ({ default: ReportsPage })));
const DataImportPage = lazy(() => import('./pages/DataImportPage').then(({ DataImportPage }) => ({ default: DataImportPage })));
const IntelligencePage = lazy(() => import('./pages/IntelligencePage').then(({ IntelligencePage }) => ({ default: IntelligencePage })));
const OffsetIntelligencePage = lazy(() => import('./pages/intelligence/OffsetIntelligencePage').then(({ OffsetIntelligencePage }) => ({ default: OffsetIntelligencePage })));
const HistoricalTimelinePage = lazy(() => import('./pages/intelligence/HistoricalTimelinePage').then(({ HistoricalTimelinePage }) => ({ default: HistoricalTimelinePage })));
const EvidenceChainPage = lazy(() => import('./pages/intelligence/EvidenceChainPage').then(({ EvidenceChainPage }) => ({ default: EvidenceChainPage })));
const DataQualityPage = lazy(() => import('./pages/intelligence/DataQualityPage').then(({ DataQualityPage }) => ({ default: DataQualityPage })));
const EngineerFeedbackPage = lazy(() => import('./pages/intelligence/EngineerFeedbackPage').then(({ EngineerFeedbackPage }) => ({ default: EngineerFeedbackPage })));
const CaseFingerprintPage = lazy(() => import('./pages/intelligence/CaseFingerprintPage').then(({ CaseFingerprintPage }) => ({ default: CaseFingerprintPage })));
const ShadowWellPage = lazy(() => import('./pages/intelligence/ShadowWellPage').then(({ ShadowWellPage }) => ({ default: ShadowWellPage })));
const KnowledgeGraphPage = lazy(() => import('./pages/intelligence/KnowledgeGraphPage').then(({ KnowledgeGraphPage }) => ({ default: KnowledgeGraphPage })));
const EarlyWarningPage = lazy(() => import('./pages/intelligence/EarlyWarningPage').then(({ EarlyWarningPage }) => ({ default: EarlyWarningPage })));
const CounterfactualPage = lazy(() => import('./pages/intelligence/CounterfactualPage').then(({ CounterfactualPage }) => ({ default: CounterfactualPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(({ ChatPage }) => ({ default: ChatPage })));
const DrillHealthPage = lazy(() => import('./pages/DrillHealthPage').then((module) => ({ default: module.DrillHealthPage })));

export default function App() {
  return (
    <BrowserRouter>
      <WellProvider>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading WELLSIGHT…</div>}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/live-well" element={<LiveWellPage />} />
            <Route path="/nearby-wells" element={<NearbyWellsPage />} />
            <Route path="/correlation" element={<CorrelationPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/risk" element={<RiskIntelligencePage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/import" element={<DataImportPage />} />
            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/intelligence/offsets" element={<OffsetIntelligencePage />} />
            <Route path="/intelligence/timeline" element={<HistoricalTimelinePage />} />
            <Route path="/intelligence/evidence" element={<EvidenceChainPage />} />
            <Route path="/intelligence/quality" element={<DataQualityPage />} />
            <Route path="/intelligence/feedback" element={<EngineerFeedbackPage />} />
            <Route path="/intelligence/fingerprint" element={<CaseFingerprintPage />} />
            <Route path="/intelligence/shadow-well" element={<ShadowWellPage />} />
            <Route path="/intelligence/graph" element={<KnowledgeGraphPage />} />
            <Route path="/intelligence/warnings" element={<EarlyWarningPage />} />
            <Route path="/intelligence/counterfactual" element={<CounterfactualPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/drilling/3d-health" element={<Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading Drill Health…</div>}><DrillHealthPage /></Suspense>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </Suspense>
      </WellProvider>
    </BrowserRouter>
  );
}

function NotFoundPage() {
  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center"><p className="text-xs font-semibold uppercase tracking-widest text-accent-500">Page not found</p><h1 className="mt-2 text-2xl font-bold text-white">This page isn’t available</h1><p className="mt-2 text-sm text-slate-400">The address may be incorrect or the page may have moved.</p><Link to="/" className="mt-5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-500">Return to overview</Link></main>;
}
