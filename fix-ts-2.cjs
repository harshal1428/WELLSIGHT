const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'src/components/knowledge/HistoricalCaseDrawer.tsx',
    regex: /, ExternalLink/,
    replacement: ""
  },
  {
    file: 'src/components/knowledge/HistoricalCaseDrawer.tsx',
    regex: /, ArrowRight/,
    replacement: ""
  },
  {
    file: 'src/components/knowledge/KnowledgeFilters.tsx',
    regex: /import { useState } from 'react';\r?\n/,
    replacement: ""
  },
  {
    file: 'src/components/knowledge/KnowledgeFilters.tsx',
    regex: /, Search/,
    replacement: ""
  },
  {
    file: 'src/components/map/WellIntelligencePanel.tsx',
    regex: /, RiskBadge/,
    replacement: ""
  },
  {
    file: 'src/components/map/WellMap.tsx',
    regex: /, useRef/,
    replacement: ""
  },
  {
    file: 'src/components/map/WellMap.tsx',
    regex: /const selectedWellId = activeWell\.id;\r?\n/,
    replacement: ""
  },
  {
    file: 'src/components/risk/RiskDetailDrawer.tsx',
    regex: /const { activeWell } = useWellContext\(\);\r?\n/,
    replacement: ""
  },
  {
    file: 'src/components/risk/RiskMatrix.tsx',
    regex: /const gridY = 10 - y;\r?\n/,
    replacement: ""
  },
  {
    file: 'src/components/risk/RiskMatrix.tsx',
    regex: /const gridX = x;\r?\n/,
    replacement: ""
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /, useEffect/,
    replacement: ""
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /, Layers/,
    replacement: ""
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /, Target/,
    replacement: ""
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /, ZoomIn/,
    replacement: ""
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /, ZoomOut/,
    replacement: ""
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /import type { Well } from '\.\.\/types';\r?\n/,
    replacement: ""
  },
  {
    file: 'src/pages/KnowledgePage.tsx',
    regex: /, Target/,
    replacement: ""
  },
  {
    file: 'src/pages/KnowledgePage.tsx',
    regex: /const searchQuery = searchParams\.get\('q'\) \|\| '';\r?\n/,
    replacement: ""
  },
  {
    file: 'src/pages/NearbyWellsPage.tsx',
    regex: /import type { Well } from '\.\.\/types';\r?\n/,
    replacement: ""
  },
  {
    file: 'src/pages/OverviewPage.tsx',
    regex: /, acknowledgeAlert/,
    replacement: ""
  },
  {
    file: 'src/pages/RiskIntelligencePage.tsx',
    regex: /import type { CalculatedRisk } from '\.\.\/utils\/riskScoring';\r?\n/,
    replacement: ""
  },
  {
    file: 'src/utils/alertGeneration.ts',
    regex: /, AlertPriority/,
    replacement: ""
  },
  {
    file: 'src/utils/alertGeneration.ts',
    regex: /import type { CalculatedRisk } from '\.\/riskScoring';\r?\n/,
    replacement: ""
  },
  {
    file: 'src/utils/riskScoring.ts',
    regex: /, RiskAssessment/,
    replacement: ""
  },
  {
    file: 'src/utils/riskScoring.ts',
    regex: /import { nearbyWells } from '\.\.\/data\/mockData';\r?\n/,
    replacement: ""
  },
  {
    file: 'src/utils/riskScoring.ts',
    regex: /const currentReservoir = activeWell\.reservoir;\r?\n/,
    replacement: ""
  }
];

replacements.forEach(({ file, regex, replacement }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
    console.log(`Replaced in ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
