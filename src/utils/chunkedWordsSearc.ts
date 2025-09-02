import { Cell } from '../types/cell';

export function chunkedWordSearch(
  matrix: Cell[][],
  dictionary: string[],
  onProgress: (foundWords: string[]) => void,
  onDone: (foundWords: string[]) => void,
  abortSignal: { aborted: boolean }
) {
  const found = new Set<string>();
  const dictSet = new Set(dictionary);
  let row = 0;
  const ROWS_PER_CHUNK = 2; // Tune this for your needs

  function processNextRows() {
    if (abortSignal.aborted) return;
    let processed = 0;
    while (row < matrix.length && processed < ROWS_PER_CHUNK) {
      let word = '';
      for (let col = 0; col < matrix[row].length; col++) {
        const letter = typeof matrix[row][col] === 'string'
          ? matrix[row][col]
          : (matrix[row][col]?.letter ?? '');
        word += letter;
        if (word.length >= 3 && dictSet.has(word.toLowerCase())) {
          found.add(word.toLowerCase());
        }
      }
      row++;
      processed++;
    }
    onProgress(Array.from(found));
    if (row < matrix.length) {
      setTimeout(processNextRows, 16); // Yield to event loop (~1 frame at 60fps)
    } else {
      onDone(Array.from(found));
    }
  }

  processNextRows();
}