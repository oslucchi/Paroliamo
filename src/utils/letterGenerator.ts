export function generateLetter(probTable: { [key: string]: number }): string {
  const total = Object.values(probTable).reduce((a, b) => a + b, 0);
  const rand = Math.random() * total;

  let cumulative = 0;
  for (const [letter, prob] of Object.entries(probTable)) {
    cumulative += prob;
    if (rand <= cumulative) return letter;
  }

  // Fallback
  return 'A';
}
