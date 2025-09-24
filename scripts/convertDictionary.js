const fs = require('fs');
const path = require('path');

// Read the dictionary file
const dictionaryPath = path.join(__dirname, '../src/assets/dictionaries/italiano.txt');
const outputPath = path.join(__dirname, '../src/data/italianDictionary.ts');

console.log('Looking for dictionary at:', dictionaryPath);
console.log('Output will be at:', outputPath);

// Ensure the output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Created directory:', outputDir);
}

try {
  if (!fs.existsSync(dictionaryPath)) {
    console.error('❌ Dictionary file not found at:', dictionaryPath);
    console.log('Please ensure the file exists or check the path.');
    process.exit(1);
  }

  const content = fs.readFileSync(dictionaryPath, 'utf8');
  const allWords = content.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(Boolean);
  
  // Function to check if a word is likely a conjugated verb form
  const isConjugatedVerb = (word) => {
    // Common Italian verb conjugation patterns to exclude
    const conjugationPatterns = [
      // Present tense endings
      /o$/, /i$/, /e$/, /iamo$/, /ete$/, /ano$/, /ono$/,
      // Past tense endings (passato prossimo auxiliaries already filtered)
      /ai$/, /asti$/, /ò$/, /ammo$/, /aste$/, /arono$/,
      // Imperfect endings
      /avo$/, /avi$/, /ava$/, /avamo$/, /avate$/, /avano$/,
      /evo$/, /evi$/, /eva$/, /evamo$/, /evate$/, /evano$/,
      /ivo$/, /ivi$/, /iva$/, /ivamo$/, /ivate$/, /ivano$/,
      // Future endings
      /erò$/, /erai$/, /erà$/, /eremo$/, /erete$/, /eranno$/,
      // Conditional endings
      /erei$/, /eresti$/, /erebbe$/, /eremmo$/, /ereste$/, /erebbero$/,
      // Subjunctive patterns (common ones)
      /isca$/, /esca$/, /asca$/, /osca$/,
      // Past participle patterns (but keep some that might be adjectives)
      /ato$/, /uto$/, /ito$/ // These are tricky as they can be adjectives too
    ];
    
    // Don't exclude infinitives (ending in -are, -ere, -ire)
    if (/are$|ere$|ire$/.test(word)) {
      return false;
    }
    
    // Check if word matches conjugation patterns
    return conjugationPatterns.some(pattern => pattern.test(word));
  };

  // Filter words to keep only reasonable lengths and remove conjugated verbs
  const basicFilter = allWords.filter(word => 
    word.length >= 4 && 
    word.length <= 12 && 
    /^[a-zàáâãäåæçèéêëìíîïñòóôõöøùúûüý]+$/i.test(word)
  );

  // Remove conjugated verbs but keep infinitives
  const noConjugations = basicFilter.filter(word => !isConjugatedVerb(word));
  
  // Remove duplicates and sort
  const filteredWords = [...new Set(noConjugations)].sort();
  
  console.log(`Converting ${allWords.length} words to TypeScript module...`);
  console.log(`After filtering: ${filteredWords.length} words (removed ${allWords.length - filteredWords.length})`);
  
  // Split into chunks to avoid stack overflow
  const chunkSize = 5000;
  const chunks = [];
  for (let i = 0; i < filteredWords.length; i += chunkSize) {
    chunks.push(filteredWords.slice(i, i + chunkSize));
  }
  
  const tsContent = `// Auto-generated dictionary file
// Do not edit manually - regenerate using scripts/convertDictionary.js

const wordChunks = [
${chunks.map(chunk => 
  `  [${chunk.map(word => `'${word.replace(/'/g, "\\'")}'`).join(', ')}]`
).join(',\n')}
];

export const italianWords: string[] = wordChunks.flat();

export default italianWords;
`;

  fs.writeFileSync(outputPath, tsContent, 'utf8');
  console.log(`✅ Dictionary converted successfully to ${outputPath}`);
  console.log(`📊 Total words: ${filteredWords.length}`);
  console.log(`📁 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
} catch (error) {
  console.error('❌ Error converting dictionary:', error);
  if (error.code === 'ENOENT') {
    console.log('💡 The dictionary file was not found. Please check if it exists at:');
    console.log('   ', dictionaryPath);
  }
  process.exit(1);
}