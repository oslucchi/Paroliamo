export type Cell = {
  letter: string;
  baseAngle: number;
};

export function createCell(): Cell {
  return {
    letter: "",
    baseAngle: 0
  }
}