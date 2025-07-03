import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  Modal,
  Button,
} from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import Matrix from '../components/Matrix';
import SettingsPanel from '../components/SettingsPanel';
import { generateMatrix } from '../utils/matrixGenerator';

type ConfigField = 'rows' | 'cols' | 'duration';

const Paroliamo = () => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [duration, setDuration] = useState(3 * 60 * 1000); // in ms

  const [matrix, setMatrix] = useState<string[][]>([]);
  const [visible, setVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showSettings, setShowSettings] = useState(false);

  // Create an empty matrix initially and on size change
  useEffect(() => {
    const emptyMatrix = Array.from({ length: rows }, () =>
      Array(cols).fill('')
    );
    setMatrix(emptyMatrix);
  }, [rows, cols]);

  // Handle timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1000);
      }, 1000);
    } else if (isRunning && timeLeft <= 0) {
      setIsRunning(false);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    setMatrix(generateMatrix(rows, cols));
    setVisible(true);
    setIsRunning(true);
    setTimeLeft(duration);
  };

  const handleShuffle = () => {
    const emptyMatrix = Array.from({ length: rows }, () =>
      Array(cols).fill('')
    );
    setMatrix(emptyMatrix);
    setVisible(false);
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const formatTime = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${min}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <Appbar.Header>
        <Appbar.Content title="Paroliamo" />
        <Appbar.Action icon="menu" onPress={() => setShowSettings(true)} />
      </Appbar.Header>

      {/* Timer */}
      {visible && (
        <Text style={styles.timer}>Time Left: {formatTime(timeLeft)}</Text>
      )}

      {/* Matrix */}
      <Matrix rows={rows} cols={cols} visible={visible} matrix={matrix} />

      {/* Start / Shuffle Button */}
      <View style={styles.buttonContainer}>
        {!isRunning && (
          <Button
            title={visible ? 'Shuffle' : 'Start'}
            onPress={visible ? handleShuffle : handleStart}
          />
        )}
      </View>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide">
        <SafeAreaView style={styles.settingsModal}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <SettingsPanel
            rows={rows}
            cols={cols}
            duration={Math.floor(duration / 60000)}
            onChange={(field: ConfigField, value: number) => {
              if (field === 'rows') setRows(value);
              else if (field === 'cols') setCols(value);
              else if (field === 'duration') setDuration(value * 60000);
            }}
          />
          <View style={{ marginTop: 20 }}>
            <Button title="Close" onPress={() => setShowSettings(false)} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default Paroliamo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timer: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  settingsModal: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
