import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { WellProvider } from './hooks/useWellContext';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { LiveWellPage } from './pages/LiveWellPage';
import { NearbyWellsPage } from './pages/NearbyWellsPage';
import { CorrelationPage } from './pages/CorrelationPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { RiskIntelligencePage } from './pages/RiskIntelligencePage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DataImportPage } from './pages/DataImportPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { OffsetIntelligencePage } from './pages/intelligence/OffsetIntelligencePage';
import { HistoricalTimelinePage } from './pages/intelligence/HistoricalTimelinePage';
import { EvidenceChainPage } from './pages/intelligence/EvidenceChainPage';
import { DataQualityPage } from './pages/intelligence/DataQualityPage';
import { EngineerFeedbackPage } from './pages/intelligence/EngineerFeedbackPage';
import { CaseFingerprintPage } from './pages/intelligence/CaseFingerprintPage';
import { ShadowWellPage } from './pages/intelligence/ShadowWellPage';
import { KnowledgeGraphPage } from './pages/intelligence/KnowledgeGraphPage';
import { EarlyWarningPage } from './pages/intelligence/EarlyWarningPage';
import { CounterfactualPage } from './pages/intelligence/CounterfactualPage';

export default function App() {
  return (
    <BrowserRouter>
      <WellProvider>
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
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </WellProvider>
    </BrowserRouter>
  );
}

function NotFoundPage() {
  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center"><p className="text-xs font-semibold uppercase tracking-widest text-accent-500">Page not found</p><h1 className="mt-2 text-2xl font-bold text-white">This page isn’t available</h1><p className="mt-2 text-sm text-slate-400">The address may be incorrect or the page may have moved.</p><Link to="/" className="mt-5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-500">Return to overview</Link></main>;
}
