import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

interface MatrixProps {
  rows?: number;
  cols?: number;
  visible: boolean;
  matrix: string[][];
  rotationAngle?: number;
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

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {matrix.map((row, rowIndex) => (
        <View style={styles.row} key={`row-${rowIndex}`}>
          {row.map((letter, colIndex) => {
            const animatedValue = new Animated.Value(rotationAngle);
            const rotate = animatedValue.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg'],
            });

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
                    transform: [{ rotate: `${rotationAngle}deg` }],
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
    backgroundColor: '#f5f5dc', // light beige
    borderWidth: 1,
    borderColor: '#d2b48c', // light brown
  },
});
