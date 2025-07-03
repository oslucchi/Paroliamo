import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  Modal,
  Button,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import Matrix from '../components/Matrix';
import SettingsPanel from '../components/SettingsPanel';
import {generateMatrix} from '../utils/matrixGenerator';

type ConfigField = 'rows' | 'cols' | 'duration';

const Paroliamo = () => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [duration, setDuration] = useState(3 * 60 * 1000); // in ms

  const [matrix, setMatrix] = useState<string[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<number | null>(null);

  // Initialize with empty matrix
  useEffect(() => {
    const emptyMatrix = Array.from({length: rows}, () => Array(cols).fill(''));
    setMatrix(emptyMatrix);
  }, [rows, cols]);

  // Countdown handler
  useEffect(() => {
    if (isRunning && timeLeft > 0 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, isPaused]);

  const handleStart = () => {
    setMatrix(generateMatrix(rows, cols));
    setIsRunning(true);
    setIsPaused(false);
    setTimeLeft(duration);
  };

  const handleStop = () => {
    setIsPaused(true);
    clearInterval(intervalRef.current!);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleShuffle = () => {
    const emptyMatrix = Array.from({length: rows}, () => Array(cols).fill(''));
    setMatrix(emptyMatrix);
    setIsRunning(false);
    setIsPaused(false);
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
      <Appbar.Header>
        <Appbar.Content title="Paroliamo" />
        <Appbar.Action icon="menu" onPress={() => setShowSettings(true)} />
      </Appbar.Header>

      {/* Timer */}
      <Text style={styles.timer}>Time Left: {formatTime(timeLeft)}</Text>

      {/* Matrix */}
      <Matrix rows={rows} cols={cols} visible={true} matrix={matrix} />
      
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {!isRunning && timeLeft === duration && (
          <Button title="Start" onPress={handleStart} />
        )}

        {isRunning && !isPaused && (
          <Button title="Stop" onPress={handleStop} />
        )}

        {isPaused && (
          <>
            <Button title="Resume" onPress={handleResume} />
            <View style={{marginTop: 10}}>
              <Button title="Shuffle" onPress={handleShuffle} />
            </View>
          </>
        )}

        {!isRunning && timeLeft === 0 && (
          <Button title="Shuffle" onPress={handleShuffle} />
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
          <View style={{marginTop: 20}}>
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
