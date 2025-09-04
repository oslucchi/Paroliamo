import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Cell } from '../types/cell';

interface MatrixProps {
  rows?: number;
  cols?: number;
  visible: boolean;
  matrix: Cell[][];
  rotationAngle?: number;
  rotationMode?: 'continuous' | 'by90';
  highlightPath?: number[][];
  animatingPath?: number[][];
  animatingIndex?: number;
}

const Matrix: React.FC<MatrixProps> & { exportLetters?: (matrix: Cell[][]) => string[][] } = ({
  rows = 5,
  cols = 5,
  visible,
  matrix,
  rotationAngle = 0,
  rotationMode = 'continuous',
  highlightPath = [],
  animatingPath = [],
  animatingIndex = -1,

}) => {
  if (!visible || !Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    return null;
  }

  const screenWidth = Dimensions.get('window').width;
  const totalSpacing = 8 * cols;
  const cellSize = (screenWidth - totalSpacing - 32) / cols;

  const renderedMatrix =
    rotationMode === 'by90'
      ? matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]).reverse())
      : matrix;

  return (
    <View style={styles.container}>
      {renderedMatrix.map((row, rowIndex) => (
        <View style={styles.row} key={`row-${rowIndex}`}>
          {row.map((cell, colIndex) => {
            // Animation and highlight logic for each cell
            const isAnimating = animatingPath.length > 0 && animatingIndex >= 0;
            const isYellow = isAnimating && animatingPath[animatingIndex] &&
              animatingPath[animatingIndex][0] === rowIndex &&
              animatingPath[animatingIndex][1] === colIndex;

            const isHighlighted = highlightPath?.some(([r, c]) => r === rowIndex && c === colIndex);

            const cellColor = isYellow
              ? '#ffd600' // yellow
              : isHighlighted
                ? '#1976d2' // blue
                : '#c22200'; // red

            return (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[styles.cell, { width: cellSize, height: cellSize }]}
              >
                <Animated.Text
                  style={{
                    fontSize: cellSize * 0.6,
                    fontWeight: 'bold',
                    color: cellColor,
                    transform:
                      rotationMode === 'continuous'
                        ? [{ rotate: `${(cell.baseAngle + rotationAngle) % 360}deg` }]
                        : undefined,
                    textDecorationLine:
                      cell.letter === 'N' || cell.letter === 'Z' ? 'underline' : 'none',
                  }}
                >
                  {cell.letter}
                </Animated.Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

// Static method to export a matrix of letters only
Matrix.exportLetters = function (matrix: Cell[][]): string[][] {
  return matrix.map(row =>
    row.map(cell =>
      typeof cell === 'string'
        ? cell
        : (cell?.letter ?? '')
    )
  );
};

export default Matrix;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5dc',
    borderWidth: 1,
    borderColor: '#d2b48c',
  },
});