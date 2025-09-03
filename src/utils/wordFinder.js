// word-finder.js
// Finds real words in an n x n matrix of characters using DFS with backtracking.
// - Neighbors: 8-directional (N, NE, E, SE, S, SW, W, NW)
// - Minimum word length: 4 (configurable)
// - Records the path (row,col) for each found word
// - Uses a Trie to prune paths that aren't prefixes of any word

const fs = require("fs");

// ---------- Trie (for fast "isWord" + "hasPrefix") ----------
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isWord = true;
  }
  hasWord(word) {
    let node = this.root;
    for (const ch of word) {
      node = node.children.get(ch);
      if (!node) return false;
    }
    return node.isWord === true;
  }
  hasPrefix(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return false;
    }
    return true;
  }
}

// // ---------- Dictionary loader ----------
// /**
//  * Load words (one per line) into a Trie.
//  * @param {string} filePath path to a text file with one word per line
//  * @param {object} [opts]
//  * @param {number} [opts.minLength=1] ignore words shorter than this
//  * @returns {{ trie: Trie, size: number }}
//  */
// function loadDictionary(filePath, { minLength = 1 } = {}) {
//   const content = fs.readFileSync(filePath, "utf8");
//   const trie = new Trie();
//   let count = 0;

//   for (const line of content.split(/\r?\n/)) {
//     const w = line.trim().toLowerCase();
//     if (!w || w.length < minLength) continue;
//     trie.insert(w);
//     count++;
//   }
//   return { trie, size: count };
// }

/**
 * Find all words in a character matrix.
 * @param {string[][]} matrix n x n array of single-character strings
 * @param {Trie} trie dictionary with hasWord()/hasPrefix()
 * @param {object} [opts]
 * @param {number} [opts.minWordLen=4] minimal accepted word length
 * @param {boolean} [opts.diagonals=true] include diagonals as neighbors
 * @returns {{ word: string, path: Array<[number,number]> }[]}
 */
function findWordsInMatrix(matrix, trie, { minWordLen = 4, diagonals = true } = {}) {
  if (!Array.isArray(matrix) || matrix.length === 0) return [];
  const n = matrix.length;

  // Normalize to lowercase and verify sizes
  const board = matrix.map(row => row.map(ch => String(ch).toLowerCase()));
  for (const row of board) {
    if (!Array.isArray(row) || row.length !== n) {
      throw new Error("Matrix must be square (n x n).");
    }
  }

  // Directions (8-way by default)
  const dirs = diagonals
    ? [
        [-1, -1], [-1, 0], [-1, +1],
        [ 0, -1],          [ 0, +1],
        [+1, -1], [+1, 0], [+1, +1],
      ]
    : [
        [-1, 0],
        [ 0, -1],        [ 0, +1],
        [+1, 0],
      ];

  const inBounds = (r, c) => r >= 0 && r < n && c >= 0 && c < n;

  const visited = Array.from({ length: n }, () => Array(n).fill(false));
  const results = [];
  const seenPaths = new Set(); // dedupe by word+path (path string of "r,c|r,c|...")
  const foundWords = new Set();

  function dfs(r, c, current, path) {
    // Append current cell
    const nextWord = current + board[r][c];

    // Prune if no dictionary word starts with this prefix
    if (!trie.hasPrefix(nextWord)) return;

    // If it's a valid word of sufficient length, record it
    if (
      nextWord.length >= minWordLen &&
      trie.hasWord(nextWord) &&
      !foundWords.has(nextWord)
    ) {
      foundWords.add(nextWord);
      results.push({ word: nextWord, path: [...path] });
    }

    // Continue exploring neighbors
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && !visited[nr][nc]) {
        visited[nr][nc] = true;
        path.push([nr, nc]);
        dfs(nr, nc, nextWord, path);
        path.pop();
        visited[nr][nc] = false;
      }
    }
  }

  // Start DFS from every cell
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      visited[r][c] = true;
      dfs(r, c, "", [[r, c]]);
      visited[r][c] = false;
    }
  }
  results.sort((a, b) => b.word.length - a.word.length);
  console.log(results.map(r => r.word));
  return results;
}

module.exports = {
  Trie,
  findWordsInMatrix,
};
