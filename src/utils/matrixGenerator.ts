import { italianAlphabetProbabilities } from '../data/italianAlphabet';
import { generateLetter } from './letterGenerator';

export function generateMatrix(rows = 5, cols = 5): string[][] {
  const matrix: string[][] = [];

  for (let i = 0; i < rows; i++) {
    const row: string[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(generateLetter(italianAlphabetProbabilities));
    }
    matrix.push(row);
  }

  return matrix;
}
