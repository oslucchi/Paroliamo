import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface SettingsPanelProps {
  rows: number;
  cols: number;
  duration: number; // in minutes
  rotationInterval: number; // in sec
  rotateDegrees: number;
  rotationMode: 'continuous' | 'by90';
  onChange: (
    field: 'rows' | 'cols' | 'duration' | 'rotationInterval' | 'rotateDegrees',
    value: number
  ) => void;
  onChangeRotationMode: (mode: 'continuous' | 'by90') => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  rows,
  cols,
  duration,
  rotationInterval,
  rotateDegrees,
  rotationMode,
  onChange,
  onChangeRotationMode,
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

      <Text style={styles.label}>Rotation Mode:</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => onChangeRotationMode('continuous')}
        >
          <View style={styles.radioCircle}>
            {rotationMode === 'continuous' && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.radioLabel}>Continuous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => {
            onChangeRotationMode('by90');
            onChange('rotateDegrees', 0);
          }}
        >
          <View style={styles.radioCircle}>
            {rotationMode === 'by90' && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.radioLabel}>Rotate by 90°</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Rotate degrees (deg, 0 = no rotation):</Text>
      <TextInput
        style={[
          styles.input,
          rotationMode === 'by90' && styles.disabledInput,
        ]}
        keyboardType="numeric"
        value={rotateDegrees.toString()}
        editable={rotationMode === 'continuous'}
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
  disabledInput: {
    backgroundColor: '#eee',
    color: '#999',
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#444',
  },
  radioLabel: {
    fontSize: 14,
  },
});
