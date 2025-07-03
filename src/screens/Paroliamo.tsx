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
  Animated,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import Matrix from '../components/Matrix';
import SettingsPanel from '../components/SettingsPanel';
import {generateMatrix} from '../utils/matrixGenerator';
import Sound from 'react-native-sound';

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
  const [preCountdown, setPreCountdown] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashAnim = useRef(new Animated.Value(1)).current;

  Sound.setCategory('Playback');

  const buzzerSound = useRef<Sound | null>(null);
  const beepSound = useRef<Sound | null>(null);

  useEffect(() => {
    beepSound.current = new Sound(require('../../assets/sounds/beep.mp3'), Sound.MAIN_BUNDLE, () => {});
    buzzerSound.current = new Sound(require('../../assets/sounds/buzzer.mp3'), Sound.MAIN_BUNDLE, () => {});
    return () => {
      beepSound.current?.release();
      buzzerSound.current?.release();
    };
  }, []);

  useEffect(() => {
    const emptyMatrix = Array.from({length: rows}, () => Array(cols).fill(''));
    setMatrix(emptyMatrix);
  }, [rows, cols]);

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

  useEffect(() => {
    if (isRunning && timeLeft <= 10000 && timeLeft > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      flashAnim.setValue(1); // reset
    }
  }, [timeLeft, isRunning]);

  const playBeep = () => beepSound.current?.play();
  const playBuzzer = () => buzzerSound.current?.play();

  const handleStart = () => {
    let count = 3;
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Appbar.Header>
            <Appbar.Content title="Paroliamo" />
            <Appbar.Action icon="menu" onPress={() => setShowSettings(true)} />
          </Appbar.Header>

          {preCountdown !== null && (
            <Text style={styles.preCountdown}>{preCountdown}</Text>
          )}

          <Animated.Text
            style={[
              styles.timer,
              timeLeft <= 10000 && styles.timerWarning,
              {opacity: timeLeft <= 10000 && isRunning ? flashAnim : 1},
            ]}>
            Time Left: {formatTime(timeLeft)}
          </Animated.Text>

          <Matrix rows={rows} cols={cols} visible={true} matrix={matrix} />

          <View style={styles.buttonContainer}>
            {!isRunning && !isPaused && timeLeft === duration && (
              <Button title="Start" onPress={handleStart} />
            )}
            {isRunning && !isPaused && <Button title="Stop" onPress={handleStop} />}
            {isPaused && (
              <>
                <Button title="Resume" onPress={handleResume} />
                <View style={{marginTop: 10}}>
                  <Button title="Shuffle" onPress={handleShuffle} />
                </View>
              </>
            )}
            {!isRunning && timeLeft === 0 && <Button title="Shuffle" onPress={handleShuffle} />}
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
            onChange={(field: ConfigField, value: number) => {
              if (field === 'rows') setRows(value);
              else if (field === 'cols') setCols(value);
              else if (field === 'duration') {
                setDuration(value * 60000);
                setTimeLeft(value * 60000);
              }
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
