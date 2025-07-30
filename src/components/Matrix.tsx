import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

interface MatrixProps {
  rows?: number;
  cols?: number;
  visible: boolean;
  matrix: string[][];
  rotationAngle?: number; // dynamic angle to apply during runtime
}

const Matrix: React.FC<MatrixProps> = ({
  rows = 5,
  cols = 5,
  visible,
  matrix,
  rotationAngle = 0,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const totalSpacing = 8 * cols;
  const cellSize = (screenWidth - totalSpacing - 32) / cols;

  // Generate a persistent matrix of base angles (0, 90, 180, 270) on first render
  const baseAnglesMatrix = useMemo(() => {
    return matrix.map(row =>
      row.map(() => {
        const angles = [0, 90, 180, 270];
        return angles[Math.floor(Math.random() * angles.length)];
      })
    );
  }, [matrix]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {matrix.map((row, rowIndex) => (
        <View style={styles.row} key={`row-${rowIndex}`}>
          {row.map((letter, colIndex) => {
            const baseAngle = baseAnglesMatrix[rowIndex][colIndex];
            const totalAngle = baseAngle + rotationAngle;

            return (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[styles.cell, { width: cellSize, height: cellSize }]}
              >
                <Animated.Text
                  style={{
                    fontSize: cellSize * 0.6,
                    fontWeight: 'bold',
                    color: '#c22200',
                    transform: [{ rotate: `${totalAngle}deg` }],
                  }}
                >
                  {letter}
                </Animated.Text>
              </View>
            );
          })}
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
