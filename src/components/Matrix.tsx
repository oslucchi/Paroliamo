import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {italianAlphabetProbabilities} from '../data/italianAlphabet';
import {generateLetter} from '../utils/letterGenerator';
import {Dimensions} from 'react-native';

interface MatrixProps {
  rows?: number;
  cols?: number;
  visible: boolean;
  matrix: string[][];
}

const Matrix: React.FC<MatrixProps> = ({
  rows = 5,
  cols = 5,
  visible,
  matrix,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const totalSpacing = 8 * cols; // margin between cells
  const cellSize = (screenWidth - totalSpacing - 32) / cols; // 32 for horizontal padding

  if (!visible) return null;

  return (
    <View style={styles.wrapper}>
        <View style={styles.container}>
        {matrix.map((row, rowIndex) => (
            <View style={styles.row} key={`row-${rowIndex}`}>
            {row.map((letter, colIndex) => (
                <View
                style={[styles.cell, {width: cellSize, height: cellSize}]}
                key={`cell-${rowIndex}-${colIndex}`}>
                <Text
                    style={{
                    fontSize: cellSize * 0.6,
                    fontWeight: 'bold',
                    color: '#c22200',
                    }}>
                    {visible ? letter : ' '}
                </Text>
                </View>
            ))}
            </View>
        ))}
        </View>
    </View>
  );
};

export default Matrix;

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: 'center',
  },
});
