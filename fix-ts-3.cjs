const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'src/components/knowledge/KnowledgeFilters.tsx',
    regex: /Search, /,
    replacement: ""
  },
  {
    file: 'src/components/map/WellMap.tsx',
    regex: /const selectedWellId = activeWell\.id;/,
    replacement: ""
  },
  {
    file: 'src/components/risk/RiskDetailDrawer.tsx',
    regex: /const \{ activeWell \} = useWellContext\(\);/,
    replacement: ""
  },
  {
    file: 'src/components/risk/RiskMatrix.tsx',
    regex: /const gridY = 10 - y;/,
    replacement: ""
  },
  {
    file: 'src/components/risk/RiskMatrix.tsx',
    regex: /const gridX = x;/,
    replacement: ""
  },
  {
    file: 'src/pages/CorrelationPage.tsx',
    regex: /import type \{ Well \} from '\.\.\/types';/,
    replacement: ""
  },
  {
    file: 'src/pages/KnowledgePage.tsx',
    regex: /const searchQuery = searchParams\.get\('q'\) \|\| '';/,
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
