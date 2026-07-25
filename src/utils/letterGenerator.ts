import { Cell, createCell } from "../types/cell";

export function generateLetter(probTable: { [key: string]: number }, angleRandomly = true): Cell {
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
      cell.baseAngle = angleRandomly ? Math.floor(Math.random() * 4) * 90 : 0;
      return cell;
    }
  }

  // Fallback
  return cell;
}
