import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          </Route>
        </Routes>
      </WellProvider>
    </BrowserRouter>
  );
}
