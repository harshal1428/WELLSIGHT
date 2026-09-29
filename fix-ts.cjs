const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'src/components/knowledge/HistoricalCaseDrawer.tsx',
    regex: /import \{ X, Calendar, MapPin, CheckCircle2, ChevronRight, ExternalLink, ArrowRight, BookOpen \} from 'lucide-react';/,
    replacement: "import { X, Calendar, MapPin, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';"
  },
  {
    file: 'src/components/knowledge/KnowledgeFilters.tsx',
    regex: /import \{ useState \} from 'react';\r?\nimport \{ Filter, Search, Layers \} from 'lucide-react';/,
    replacement: "import { Filter, Layers } from 'lucide-react';"
  },
  {
    file: 'src/components/map/WellIntelligencePanel.tsx',
    regex: /import \{ StatusBadge, RiskBadge \} from '\.\.\/ui\/Badges';/,
    replacement: "import { StatusBadge } from '../ui/Badges';"
  },
  {
    file: 'src/components/map/WellMap.tsx',
    regex: /import \{ useEffect, useRef, useState \} from 'react';/,
    replacement: "import { useEffect, useState } from 'react';"
  },
  {
    file: 'src/components/map/WellMap.tsx',
    regex: /const selectedWellId = activeWell\.id;\r?\n\s*\r?\n\s*\/\/ Draw connections/,
    replacement: "// Draw connections"
  },
  {
    file: 'src/components/risk/RiskDetailDrawer.tsx',
    regex: /const \{ activeWell \} = useWellContext\(\);/,
    replacement: ""
  },
  {
    file: 'src/components/risk/RiskMatrix.tsx',
    regex: /const gridY = 10 - y;\r?\n\s*const gridX = x;/,
    replacement: ""
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /import \{ useState, useMemo, useEffect \} from 'react';/,
    replacement: "import { useState, useMemo } from 'react';"
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /import \{ ChevronRight, Info, AlertTriangle, Layers, MapPin, Target, ArrowRight, BookOpen, Clock, AlertCircle, Maximize2, ZoomIn, ZoomOut, CheckCircle2 \} from 'lucide-react';/,
    replacement: "import { ChevronRight, Info, AlertTriangle, MapPin, ArrowRight, BookOpen, Clock, AlertCircle, Maximize2, CheckCircle2 } from 'lucide-react';"
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /import type \{ Well \} from '\.\.\/types';/,
    replacement: ""
  },
  {
    file: 'src/pages/KnowledgePage.tsx',
    regex: /import \{ BookOpen, Search, Filter, ArrowUpRight, ArrowDownRight, Activity, MapPin, Target, AlertTriangle \} from 'lucide-react';/,
    replacement: "import { BookOpen, Search, Filter, ArrowUpRight, ArrowDownRight, Activity, MapPin, AlertTriangle } from 'lucide-react';"
  },
  {
    file: 'src/pages/KnowledgePage.tsx',
    regex: /const searchQuery = searchParams\.get\('q'\) \|\| '';/,
    replacement: ""
  },
  {
    file: 'src/pages/NearbyWellsPage.tsx',
    regex: /import type \{ Well \} from '\.\.\/types';/,
    replacement: ""
  },
  {
    file: 'src/pages/OverviewPage.tsx',
    regex: /const \{ activeWell, currentParameters, risks, alerts, nearbyWells, acknowledgeAlert \} = useWellContext\(\);/,
    replacement: "const { activeWell, currentParameters, risks, alerts, nearbyWells } = useWellContext();"
  },
  {
    file: 'src/pages/RiskIntelligencePage.tsx',
    regex: /import type \{ CalculatedRisk \} from '\.\.\/utils\/riskScoring';/,
    replacement: ""
  },
  {
    file: 'src/utils/alertGeneration.ts',
    regex: /import type \{ Well, Alert, AlertPriority \} from '\.\.\/types';/,
    replacement: "import type { Well, Alert } from '../types';"
  },
  {
    file: 'src/utils/alertGeneration.ts',
    regex: /import type \{ CalculatedRisk \} from '\.\/riskScoring';/,
    replacement: ""
  },
  {
    file: 'src/utils/riskScoring.ts',
    regex: /import type \{ Well, DrillingEvent, RiskAssessment, RiskLevel, EventType \} from '\.\.\/types';/,
    replacement: "import type { Well, DrillingEvent, RiskLevel, EventType } from '../types';"
  },
  {
    file: 'src/utils/riskScoring.ts',
    regex: /import \{ nearbyWells \} from '\.\.\/data\/mockData';/,
    replacement: ""
  },
  {
    file: 'src/utils/riskScoring.ts',
    regex: /const currentReservoir = activeWell\.reservoir;/,
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
