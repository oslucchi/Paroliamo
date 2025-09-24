const fs = require('fs');
const path = require('path');

// Read the dictionary file
const dictionaryPath = path.join(__dirname, '../android/app/src/main/assets/dictionaries/italiano.txt');
const outputPath = path.join(__dirname, '../src/data/italianDictionary.ts');

try {
  const content = fs.readFileSync(dictionaryPath, 'utf8');
  const words = content.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(Boolean);
  
  console.log(`Converting ${words.length} words to TypeScript module...`);
  
  const tsContent = `// Auto-generated dictionary file
// Do not edit manually - regenerate using scripts/convertDictionary.js

export const italianWords: string[] = [
${words.map(word => `  '${word.replace(/'/g, "\\'")}',`).join('\n')}
];

export default italianWords;
`;

  fs.writeFileSync(outputPath, tsContent, 'utf8');
  console.log(`Dictionary converted successfully to ${outputPath}`);
  console.log(`Total words: ${words.length}`);
} catch (error) {
  console.error('Error converting dictionary:', error);
  process.exit(1);
}