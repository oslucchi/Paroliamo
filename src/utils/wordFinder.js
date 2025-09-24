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

function insertSorted(results, entry) {
  let left = 0, right = results.length;
  while (left < right) {
    const mid = (left + right) >> 1;
    if (results[mid].word.length < entry.word.length) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  results.splice(left, 0, entry);
}

/**
 * Find all words in a character matrix.
 * @param {string[][]} matrix n x n array of single-character strings
 * @param {Trie} trie dictionary with hasWord()/hasPrefix()
 * @param {object} [opts]
 * @param {number} [opts.minWordLen=4] minimal accepted word length
 * @param {boolean} [opts.diagonals=true] include diagonals as neighbors
 * @returns {{ results: Array<{ word: string, path: Array<[number,number]> }>, wordStrings: string[] }}
 */
function findWordsInMatrix(matrix, trie, { minWordLen = 4, diagonals = true } = {}) {
  if (!Array.isArray(matrix) || matrix.length === 0) return { results: [], wordStrings: [] };
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
  const foundWords = new Set();

  function dfs(r, c, current, path) {
    const nextWord = current + board[r][c];

    if (!trie.hasPrefix(nextWord)) return;

    if (
      nextWord.length >= minWordLen &&
      trie.hasWord(nextWord) &&
      !foundWords.has(nextWord)
    ) {
      foundWords.add(nextWord);
      insertSorted(results, { word: nextWord, path: [...path] });
    }

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

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      visited[r][c] = true;
      dfs(r, c, "", [[r, c]]);
      visited[r][c] = false;
    }
  }

  const wordStrings = results.map(r => r.word);
  return { results, wordStrings };
}

module.exports = {
  Trie,
  findWordsInMatrix,
};
