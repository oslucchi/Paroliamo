import { Cell, createCell } from "../types/cell";

export function generateLetter(probTable: { [key: string]: number }): Cell {
  const total = Object.values(probTable).reduce((a, b) => a + b, 0);
  const rand = Math.random() * total;

  var cell: Cell = createCell();
  cell.letter = "A";
  cell.baseAngle = 0;
  
  let cumulative = 0;
  for (const [letter, prob] of Object.entries(probTable)) {
    cumulative += prob;
    if (rand <= cumulative) 
    {
      cell.letter = letter;
      cell.baseAngle = Math.floor(Math.random() * 3) * 90; 
      return cell;
    }
  }

  // Fallback
  return cell;
}
