const fs = require('fs');

function fixFile(file, search, replacement) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(search, replacement);
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  } catch (e) {
    console.log('Error', file, e.message);
  }
}

fixFile('src/components/knowledge/KnowledgeFilters.tsx', 'Search, ', '');
fixFile('src/pages/CorrelationPage.tsx', "import type { Well } from '../types';", '');
fixFile('src/pages/KnowledgePage.tsx', "const searchQuery = searchParams.get('q') || '';", '');
