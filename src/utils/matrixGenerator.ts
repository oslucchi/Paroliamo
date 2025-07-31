import { italianAlphabetProbabilities } from '../data/italianAlphabet';
import { Cell } from '../types/cell';
import { generateLetter } from './letterGenerator';

export function generateMatrix(rows = 5, cols = 5): Cell[][] {
  const matrix: Cell[][] = [];

  for (let i = 0; i < rows; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(generateLetter(italianAlphabetProbabilities));
    }
    matrix.push(row);
  }

  return matrix;
}
