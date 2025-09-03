import Matrix from '../components/Matrix';
import { Cell } from '../types/cell';
import {Trie, findWordsInMatrix } from '../utils/wordFinder'

export function chunkedWordSearch(
  matrix: Cell[][],
  dictionary: Trie,
  onProgress: (foundWords: string[]) => void,
  onDone: (foundWords: string[]) => void,
  abortSignal: { aborted: boolean }
) {
  if (typeof Matrix.exportLetters !== 'function') {
    throw new Error('Matrix.exportLetters is undefined');
  }
  const letterMatrix = Matrix.exportLetters(matrix);
  const allResults = findWordsInMatrix(letterMatrix, dictionary, { minWordLen: 4, diagonals: true });

  // Chunked reporting for UI responsiveness
  let idx = 0;
  const CHUNK_SIZE = 20;

  function processChunk() {
    if (abortSignal.aborted) return;
    const end = Math.min(idx + CHUNK_SIZE, allResults.length);
    onProgress(allResults.slice(0, end).map(result => result.word));
    idx = end;
    if (idx < allResults.length) {
      setTimeout(processChunk, 16); // Yield to event loop
    } else {
      onDone(allResults.map(result => result.word));
    }
  }

  processChunk();
}