import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  Modal,
  Button,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import Matrix from '../components/Matrix';
import SettingsPanel from '../components/SettingsPanel';
import {generateMatrix} from '../utils/matrixGenerator';
import Sound from 'react-native-sound';

type ConfigField = 'rows' | 'cols' | 'duration' | 'rotationInterval' | 'rotateDegrees';

const Paroliamo = () => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [duration, setDuration] = useState(3 * 60 * 1000);

  const [matrix, setMatrix] = useState<string[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showSettings, setShowSettings] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [preCountdown, setPreCountdown] = useState<number | null>(null);
  const rotationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const [rotationInterval, setRotationInterval] = useState(1); // sec, 0 = no rotation
  const [rotateDegrees, setRotateDegrees] = useState(6); // deg, 0 = no rotation

  Sound.setCategory('Playback');
  // load config parms eventually saved
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedRows = await AsyncStorage.getItem('rows');
        const savedCols = await AsyncStorage.getItem('cols');
        const savedDuration = await AsyncStorage.getItem('duration');
        const savedRotation = await AsyncStorage.getItem('rotationInterval');
        const savedRotateDegrees = await AsyncStorage.getItem('rotateDegrees');

        if (savedRows) setRows(Number(savedRows));
        if (savedCols) setCols(Number(savedCols));
        if (savedDuration) setDuration(Number(savedDuration));
        if (savedRotation) setRotationInterval(Number(savedRotation));
        if (savedRotateDegrees) setRotateDegrees(Number(savedRotateDegrees))
      } catch (err) {
        console.warn('Failed to load saved settings:', err);
      }
    };

    loadSettings();
  }, []);

  // Initial empty matrix
  useEffect(() => {
    const emptyMatrix = Array.from({length: rows}, () => Array(cols).fill(''));
    setMatrix(emptyMatrix);
  }, [rows, cols]);

  // Game countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            playBuzzer();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, isPaused]);

  // Cell rotation interval
  useEffect(() => {
    if (isRunning && !isPaused && isRotating && rotationInterval > 0 && rotateDegrees > 0) {
      rotationIntervalRef.current = setInterval(() => {
        setRotationAngle(prev => (prev + rotateDegrees) % 360);
      }, rotationInterval * 1000);
    }
    console.log(`rotate by ${rotationAngle}`);
    return () => clearInterval(rotationIntervalRef.current!);
  }, [isRunning, isPaused, isRotating, rotationInterval, rotateDegrees]);

  const playBeep = () => {
    const beep = new Sound(require('../../assets/sounds/beep.mp3'), error => {
      if (!error) beep.play(() => beep.release());
    });
  };

  const playBuzzer = () => {
    const buzzer = new Sound(
      require('../../assets/sounds/buzzer.mp3'),
      error => {
        if (!error) buzzer.play(() => buzzer.release());
      },
    );
  };

  const handleStart = () => {
    let count = 3;
    setRotationAngle(0);
    setPreCountdown(count);
    const countdownInterval = setInterval(() => {
      playBeep();
      count--;
      if (count === 0) {
        clearInterval(countdownInterval);
        setPreCountdown(null);
        setMatrix(generateMatrix(rows, cols));
        setIsRunning(true);
        setIsPaused(false);
        setTimeLeft(duration);
      } else {
        setPreCountdown(count);
      }
    }, 1000);
  };

  const handleStop = () => {
    setIsPaused(true);
    clearInterval(intervalRef.current!);
  };

  const handleResume = () => setIsPaused(false);

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Appbar.Header>
            <Appbar.Content title="Paroliamo" />
            <Appbar.Action icon="menu" onPress={() => setShowSettings(true)} disabled={isRunning}/>
          </Appbar.Header>

          {preCountdown !== null && (
            <Text style={styles.preCountdown}>{preCountdown}</Text>
          )}

          <Text
            style={[styles.timer, timeLeft <= 10000 && styles.timerWarning]}>
            Time Left: {formatTime(timeLeft)}
          </Text>

          <Matrix
            rows={rows}
            cols={cols}
            visible={true}
            matrix={matrix}
            rotationAngle={rotationAngle}
          />

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

            {/* Rotation toggle */}
            <View style={{marginTop: 20}}>
              <Button
                title={isRotating ? 'Disable Rotation' : 'Enable Rotation'}
                onPress={() => setIsRotating(prev => !prev)}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showSettings} animationType="slide">
        <SafeAreaView style={styles.settingsModal}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <SettingsPanel
            rows={rows}
            cols={cols}
            duration={Math.floor(duration / 60000)}
            rotationInterval={rotationInterval}
            rotateDegrees={rotateDegrees}
            onChange={async (field: ConfigField, value: number) => {
              if (field === 'rows') setRows(value);
              else if (field === 'cols') setCols(value);
              else if (field === 'duration') setDuration(value * 60000);
              else if (field === 'rotationInterval') setRotationInterval(value);
              else if (field === 'rotateDegrees') setRotateDegrees(value);

              // Persist change
              const storageValue = field === 'duration' ? value * 60000 : value;
              await AsyncStorage.setItem(field, storageValue.toString());
            }}
          />
          <View style={{marginTop: 20}}>
            <Button
              title="Close"
              onPress={() => {
                setTimeLeft(duration);
                setShowSettings(false);
              }}
            />
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  timer: {
    fontSize: 48,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  timerWarning: {
    color: '#ff0000',
  },
  buttonContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  preCountdown: {
    fontSize: 72,
    textAlign: 'center',
    marginVertical: 30,
    fontWeight: 'bold',
    color: '#c22200',
  },
});
