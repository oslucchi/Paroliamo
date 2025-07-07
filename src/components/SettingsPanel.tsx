import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface SettingsPanelProps {
  rows: number;
  cols: number;
  duration: number; // in minutes
  rotationInterval: number; // in sec
  rotateDegrees: number; 
  onChange: (field: 'rows' | 'cols' | 'duration' | 'rotationInterval' | 'rotateDegrees', value: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  rows,
  cols,
  duration,
  rotationInterval,
  rotateDegrees,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Matrix Rows:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={rows.toString()}
        onChangeText={(text) => onChange('rows', parseInt(text) || 1)}
      />

      <Text style={styles.label}>Matrix Columns:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={cols.toString()}
        onChangeText={(text) => onChange('cols', parseInt(text) || 1)}
      />

      <Text style={styles.label}>Game Duration (min):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={duration.toString()}
        onChangeText={(text) => onChange('duration', parseInt(text) || 1)}
      />

      <Text style={styles.label}>Rotation Interval (sec, 0 = no rotation):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={rotationInterval.toString()}
        onChangeText={(text) => onChange('rotationInterval', parseInt(text) || 0)}
      />

      <Text style={styles.label}>Rotate degrees (deg, 0 = no rotation):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={rotateDegrees.toString()}
        onChangeText={(text) => onChange('rotateDegrees', parseInt(text) || 0)}
      />
    </View>
  );
};

export default SettingsPanel;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    padding: 6,
    marginTop: 4,
  },
});
