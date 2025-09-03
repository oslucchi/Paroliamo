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
import { Dimensions } from 'react-native';
import KeepAwake from '@sayem314/react-native-keep-awake';
import { Cell } from '../types/cell';
import { TouchableOpacity } from 'react-native';
import { ActivityIndicator, Alert } from 'react-native';
import { chunkedWordSearch} from '../utils/chunkedWordsSearc';
import { Trie } from '../utils/wordFinder';
import RNFS from 'react-native-fs';

type ConfigField = 'rows' | 'cols' | 'duration' | 'rotationInterval' | 'rotateDegrees';

const rotateMatrixBy90 = (matrix: Cell[][]): Cell[][] => {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const rotated: Cell[][] = [];

  for (let col = 0; col < cols; col++) {
    const newRow: Cell[] = [];
    for (let row = rows - 1; row >= 0; row--) {
      newRow.push(matrix[row][col]);
    }
    rotated.push(newRow);
  }

  return rotated;
};

const Paroliamo = () => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [duration, setDuration] = useState(3 * 60 * 1000);

  const [matrix, setMatrix] = useState<Cell[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showSettings, setShowSettings] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [rotationMode, setRotationMode] = useState<'continuous' | 'by90'>('continuous');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [preCountdown, setPreCountdown] = useState<number | null>(null);
  const rotationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [rotationInterval, setRotationInterval] = useState(1); // sec, 0 = no rotation
  const [rotateDegrees, setRotateDegrees] = useState(6); // deg, 0 = no rotation
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [showBestEnabled, setShowBestEnabled] = useState(false);
  const [showBestModal, setShowBestModal] = useState(false);
  const [loadingDictionary, setLoadingDictionary] = useState(true);
  const [dictionaryError, setDictionaryError] = useState<string | null>(null);
  const searchAbortController = useRef<{ aborted: boolean }>({ aborted: false });
  const [trie, setTrie] = useState<Trie | null>(null);
  const [dictLoaded, setDictLoaded] = useState(false);
  
  Sound.setCategory('Playback');
  useEffect(() => {
    (async () => {
      setLoadingDictionary(true);
      setDictionaryError(null);
      try {
        // Adjust path as needed for your platform
        let dictContent = '';
        if (Platform.OS === 'android') {
          dictContent = await RNFS.readFileAssets('dictionaries/italiano.txt', 'utf8');
        } else if (Platform.OS === 'ios') {
          dictContent = await RNFS.readFile(`${RNFS.MainBundlePath}/assets/dictionaries/italiano.txt`, 'utf8');
        } else {
          // fallback for web or other
          dictContent = '';
        }
        const lines = dictContent.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(Boolean);
        const trieObj = new Trie();
        for (const w of lines) trieObj.insert(w);
        setTrie(trieObj);
        setDictLoaded(true);
      } catch (e: any) {
        setDictionaryError('Failed to load dictionary. Please restart the app.');
      } finally {
        setLoadingDictionary(false);
      }
    })();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedRows = await AsyncStorage.getItem('rows');
        const savedCols = await AsyncStorage.getItem('cols');
        const savedDuration = await AsyncStorage.getItem('duration');
        const savedRotation = await AsyncStorage.getItem('rotationInterval');
        const savedRotateDegrees = await AsyncStorage.getItem('rotateDegrees');
        const savedRotationMode = await AsyncStorage.getItem('rotationMode');

        if (savedRows) setRows(Number(savedRows));
        if (savedCols) setCols(Number(savedCols));
        if (savedDuration) setDuration(Number(savedDuration));
        if (savedRotation) setRotationInterval(Number(savedRotation));
        if (savedRotateDegrees) setRotateDegrees(Number(savedRotateDegrees));
        if (savedRotationMode === 'continuous' || savedRotationMode === 'by90') {
          setRotationMode(savedRotationMode);
        }
      } catch (err) {
        console.warn('Failed to load saved settings:', err);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(height >= width ? 'portrait' : 'landscape');
    };

    const subscription = Dimensions.addEventListener('change', updateOrientation);
    updateOrientation(); // initial check

    return () => subscription.remove();
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
    if (isRunning && !isPaused && isRotating && rotationInterval > 0) {
      rotationIntervalRef.current = setInterval(() => {
        if (rotationMode === 'by90') {
          setMatrix(prev => rotateMatrixBy90(prev));
        }
        setRotationAngle(prev => (prev + (rotationMode === 'by90' ? 90 : rotateDegrees)) % 360);
      }, rotationInterval * 1000);
    }

    return () => clearInterval(rotationIntervalRef.current!);
  }, [isRunning, isPaused, isRotating, rotationInterval, rotateDegrees, rotationMode]);

  const handleRotationModeChange = async (mode: 'continuous' | 'by90') => {
    setRotationMode(mode);
    if (mode === 'by90') {
      setRotateDegrees(0);
    }
    try {
      await AsyncStorage.setItem('rotationMode', mode);
    } catch (err) {
      console.warn('Failed to save rotationMode:', err);
    }
  };

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

  const searchWordsInMatrix = (
    matrix: Cell[][],
    onResult: (words: string[]) => void,
    abortSignal: { aborted: boolean }
  ) => {
    if (!trie) return;
    chunkedWordSearch(
      matrix,
      trie,
      (progressWords) => {
        setFoundWords(progressWords);
      },
      (finalWords) => {
        if (!abortSignal.aborted) onResult(finalWords);
      },
      abortSignal
    );
  };

  const handleStart = () => {
    let count = 3;
    setRotationAngle(0);
    setPreCountdown(count);
    setShowBestEnabled(false);
    setFoundWords([]);

    searchAbortController.current.aborted = false;

    const countdownInterval = setInterval(() => {
      playBeep();
      count--;
      if (count === 0) {
        clearInterval(countdownInterval);
        setPreCountdown(null);
        const newMatrix = generateMatrix(rows, cols);
        setMatrix(newMatrix);
        setIsRunning(true);
        setIsPaused(false);
        setTimeLeft(duration);

                // Start background word search
        searchWordsInMatrix(
          newMatrix,
          words => setFoundWords(words),
          searchAbortController.current
        );

      } else {
        setPreCountdown(count);
      }
    }, 1000);
  };
  // --- UI helpers ---
const getLongestWord = () =>
    foundWords.length > 0
      ? foundWords.reduce((a, b) => (b.length > a.length ? b : a), foundWords[0])
      : '';

  useEffect(() => {
    if (timeLeft === 0) {
      setShowBestEnabled(true);
      // Interrupt the background search
      searchAbortController.current.aborted = true;
    }
  }, [timeLeft]);

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

  const renderButtons = () => (
    <>
      {isRunning && !isPaused && <KeepAwake />}

      {!isRunning && timeLeft === duration && (
        <Button title="Start" onPress={handleStart} />
      )}
      {isRunning && !isPaused && (
        <Button title="Stop" onPress={handleStop} />
      )}
      {isPaused && (
        <>
          <Button title="Resume" onPress={handleResume} />
          <View style={{ marginTop: 10 }}>
            <Button title="Shuffle" onPress={handleShuffle} />
          </View>
        </>
      )}
      {!isRunning && timeLeft === 0 && (
        <Button title="Shuffle" onPress={handleShuffle} />
      )}
      <View style={{ marginTop: 20 }}>
        <Button
          title={isRotating ? 'Disable Rotation' : 'Enable Rotation'}
          onPress={() => setIsRotating(prev => !prev)}
        />
      </View>
    </>
  );
  if (loadingDictionary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={{ marginTop: 20, fontSize: 18 }}>Loading dictionary...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (dictionaryError) {
    Alert.alert('Error', dictionaryError);
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'red', fontSize: 18, margin: 20 }}>{dictionaryError}</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            orientation === 'landscape' && styles.landscapeLayout,
          ]}
        >
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
          {/* --- Live word search status --- */}
          {
            isRunning && (
              <View style={styles.statusPanel}>
                <Text style={styles.statusText}>
                  Words found: {foundWords.length}
                </Text>
                <Text style={styles.statusText}>
                  Longest is: {getLongestWord().length || '-'}
                </Text>
              </View>
            )
          }

          <Matrix
            rows={rows}
            cols={cols}
            visible={true}
            matrix={matrix}
            rotationAngle={rotationAngle}
          />
          {orientation === 'portrait' ? (
            <View style={styles.buttonContainer}>
              {renderButtons()}
              {showBestEnabled && (
                <TouchableOpacity
                  style={styles.showBestButton}
                  onPress={() => setShowBestModal(true)}
                >
                  <Text style={styles.showBestButtonText}>Show Best</Text>
                </TouchableOpacity>
              )}

            </View>
          ) : (
            <View style={styles.sideButtons}>
              {renderButtons()}
              {showBestEnabled && (
                <TouchableOpacity
                  style={styles.showBestButton}
                  onPress={() => setShowBestModal(true)}
                >
                  <Text style={styles.showBestButtonText}>Show Best</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showBestModal} animationType="slide" onRequestClose={() => setShowBestModal(false)}>
        <SafeAreaView style={styles.settingsModal}>
          <Text style={styles.settingsTitle}>Best Words</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {foundWords.length === 0 ? (
              <Text>No words found.</Text>
            ) : (
              foundWords
                .sort((a, b) => b.length - a.length)
                .map((word, idx) => (
                  <Text key={idx} style={styles.wordItem}>{word}</Text>
                ))
            )}
          </ScrollView>
          <View style={{marginTop: 20}}>
            <Button title="Close" onPress={() => setShowBestModal(false)} />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={showSettings} animationType="slide">
        <SafeAreaView style={styles.settingsModal}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <SettingsPanel
            rows={rows}
            cols={cols}
            duration={duration}
            rotationInterval={rotationInterval}
            rotateDegrees={rotateDegrees}
            rotationMode={rotationMode}
            onChange={(field, value) => {
              switch (field) {
                case 'rows': setRows(value); break;
                case 'cols': setCols(value); break;
                case 'duration': setDuration(value); break;
                case 'rotationInterval': setRotationInterval(value); break;
                case 'rotateDegrees': setRotateDegrees(value); break;
              }
            }}
            onChangeRotationMode={handleRotationModeChange}
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
  sideButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    gap: 12,
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
  landscapeLayout: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
    showBestButton: {
    marginTop: 20,
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  showBestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  wordItem: {
    fontSize: 18,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPanel: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});


