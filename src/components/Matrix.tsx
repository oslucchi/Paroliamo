import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

interface MatrixProps {
  rows?: number;
  cols?: number;
  visible: boolean;
  matrix: string[][];
  rotationAngle?: number;
  rotationMode?: 'continuous' | 'by90';
}

const Matrix: React.FC<MatrixProps> = ({
  rows = 5,
  cols = 5,
  visible,
  matrix,
  rotationAngle = 0,
  rotationMode = 'continuous',
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
          {row.map((letter, colIndex) => (
            <View
              key={`cell-${rowIndex}-${colIndex}`}
              style={[styles.cell, { width: cellSize, height: cellSize }]}
            >
              <Animated.Text
                style={{
                  fontSize: cellSize * 0.6,
                  fontWeight: 'bold',
                  color: '#c22200',
                  transform:
                    rotationMode === 'continuous'
                      ? [{ rotate: `${rotationAngle}deg` }]
                      : undefined,
                  textDecorationLine: letter === 'N' || letter === 'Z' ? 'underline' : 'none',
                }}
              >
                {letter}
              </Animated.Text>
            </View>
          ))}
        </View>
      ))}
    </View>
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
