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
  isRunning?: boolean; // Add isRunning prop to control rotation behavior
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
  isRunning = false,
}) => {
  if (!visible || !Array.isArray(matrix) || matrix.length === 0) {
    return null;
  }

  // Check if any row is null or not an array
  for (let i = 0; i < matrix.length; i++) {
    if (!Array.isArray(matrix[i])) {
      console.error('Matrix row is not an array:', i, matrix[i]);
      return null;
    }
  }

  const screenWidth = Dimensions.get('window').width;
  const totalSpacing = 8 * cols;
  const cellSize = (screenWidth - totalSpacing - 32) / cols;

  // Function to transform coordinates based on rotation angle (for by90 mode)
  const transformCoordinatesByRotation = (row: number, col: number, angle: number, matrixRows: number, matrixCols: number): [number, number] => {
    const normalizedAngle = angle % 360;
    
    switch (normalizedAngle) {
      case 0:
        return [row, col];
      case 90:
        // 90° clockwise: (row, col) -> (col, matrixRows - 1 - row)
        return [col, matrixRows - 1 - row];
      case 180:
        // 180°: (row, col) -> (matrixRows - 1 - row, matrixCols - 1 - col)
        return [matrixRows - 1 - row, matrixCols - 1 - col];
      case 270:
        // 270° clockwise: (row, col) -> (matrixCols - 1 - col, row)
        return [matrixCols - 1 - col, row];
      default:
        return [row, col];
    }
  };

  let renderedMatrix = matrix;

  return (
    <View style={styles.container}>
      {renderedMatrix.map((row, rowIndex) => {
        if (!Array.isArray(row)) {
          console.error('Row is not an array:', rowIndex, row);
          return null;
        }
        return (
        <View style={styles.row} key={`row-${rowIndex}`}>
          {row.map((_, colIndex) => {
            // For by90 mode, get the cell from the transformed coordinates
            let cell;
            if (rotationMode === 'by90') {
              // Transform display coordinates back to original matrix coordinates
              // Use inverse rotation: if display is rotated by +angle, we need -angle to get original
              const inverseAngle = (360 - (rotationAngle % 360)) % 360;
              const [originalRow, originalCol] = transformCoordinatesByRotation(
                rowIndex, colIndex, inverseAngle, matrix.length, matrix[0]?.length || 0
              );
              cell = matrix[originalRow]?.[originalCol];
            } else {
              // For continuous mode, use direct coordinates
              cell = row[colIndex];
            }

            // Ensure cell is valid
            if (!cell || typeof cell !== 'object') {
              console.error('Invalid cell at', rowIndex, colIndex, ':', cell);
              cell = { letter: '', baseAngle: 0 };
            }

            // Animation and highlight logic for each cell
            const safeAnimatingPath = Array.isArray(animatingPath) ? animatingPath : [];
            const safeHighlightPath = Array.isArray(highlightPath) ? highlightPath : [];
            
            const isAnimating = safeAnimatingPath.length > 0 && animatingIndex >= 0;
            const currentAnimatingPath = safeAnimatingPath[animatingIndex];
            const isYellow = isAnimating && 
              Array.isArray(currentAnimatingPath) && 
              currentAnimatingPath.length >= 2 &&
              currentAnimatingPath[0] === rowIndex &&
              currentAnimatingPath[1] === colIndex;

            const isHighlighted = safeHighlightPath.some(path => {
              if (!Array.isArray(path) || path.length < 2) return false;
              const [r, c] = path;
              return r === rowIndex && c === colIndex;
            });

            const cellColor = isYellow
              ? '#ffd600' // yellow
              : isHighlighted
                ? '#1976d2' // blue
                : '#c22200'; // red

            const safeCell = {
              letter: cell?.letter || '',
              baseAngle: cell?.baseAngle || 0
            };

            const getLetterRotation = () => {
              if (rotationMode === 'continuous' && typeof safeCell.baseAngle === 'number' && typeof rotationAngle === 'number') {
                // Continuous mode: individual letter rotation based on baseAngle + rotationAngle
                return [{ rotate: `${(safeCell.baseAngle + rotationAngle) % 360}deg` }];
              } else if (rotationMode === 'by90' && typeof rotationAngle === 'number') {
                // By90 mode: letters also rotate by the same 90-degree increments as the matrix
                return [{ rotate: `${rotationAngle}deg` }];
              }
              return [];
            };

            const textStyle = {
              fontSize: cellSize * 0.6,
              fontWeight: 'bold' as const,
              color: cellColor || '#000',
              transform: getLetterRotation(),
              textDecorationLine:
                safeCell.letter === 'N' || safeCell.letter === 'Z' ? ('underline' as const) : ('none' as const),
            };

            return (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[styles.cell, { width: cellSize, height: cellSize }]}
              >
                <Animated.Text style={textStyle}>
                  {String(safeCell.letter || '')}
                </Animated.Text>
              </View>
            );
          })}
        </View>
        );
      })}
    </View>
  );
};

// Static method to export a matrix of letters only
Matrix.exportLetters = function (matrix: Cell[][]): string[][] {
  if (!Array.isArray(matrix)) {
    console.error('Matrix.exportLetters called with invalid matrix:', matrix);
    return [];
  }
  
  return matrix.map(row => {
    if (!Array.isArray(row)) {
      console.error('Matrix.exportLetters: row is not an array:', row);
      return [];
    }
    return row.map(cell =>
      typeof cell === 'string'
        ? cell
        : (cell?.letter ?? '')
    );
  });
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