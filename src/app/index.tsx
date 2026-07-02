import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useGlobalRecording,
  getMicrophonePermissionStatus,
  requestMicrophonePermission,
  startGlobalRecording,
  stopGlobalRecording,
} from 'react-native-nitro-screen-recorder';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

function RecordButton({
  onPress,
  label,
  variant = 'primary',
}: {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'danger';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'danger' ? styles.buttonDanger : styles.buttonPrimary,
        pressed && styles.buttonPressed,
      ]}>
      <ThemedText
        type="smallBold"
        style={variant === 'danger' ? styles.buttonTextDanger : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [micGranted, setMicGranted] = useState(false);

  useEffect(() => {
    setMicGranted(getMicrophonePermissionStatus() === 'granted');
  }, []);

  const { isRecording } = useGlobalRecording({
    onRecordingStarted: () => {
      Alert.alert('Recording started');
    },
    onRecordingFinished: async (file) => {
      if (file) {
        Alert.alert(
          'Recording Complete',
          `Saved: ${file.name}\nDuration: ${file.duration}s\nSize: ${file.size} bytes`
        );
      } else {
        Alert.alert('Recording Complete', 'Failed to retrieve the file.');
      }
    },
    settledTimeMs: 700,
  });

  const handleStartRecording = async () => {
    let granted = micGranted;
    if (!granted) {
      const response = await requestMicrophonePermission();
      granted = response.granted;
      setMicGranted(granted);
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone permission is needed for audio recording');
        return;
      }
    }
    startGlobalRecording({
      options: { enableMic: true },
      onRecordingError: (error) => {
        Alert.alert('Recording error', error.message);
      },
    });
  };

  const handleStopRecording = async () => {
    const file = await stopGlobalRecording({ settledTimeMs: 1000 });
    if (file) {
      console.log('Stopped and retrieved file:', file);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.hero}>
          <ThemedView
            type="backgroundElement"
            style={[styles.statusDot, isRecording && styles.statusDotActive]}
          />
          <ThemedText type="subtitle" style={styles.title}>
            Screen Recorder
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {isRecording ? 'Recording is active…' : 'Tap Start to begin recording'}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Mic permission</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {micGranted ? 'Granted' : 'Not granted'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <RecordButton label="Start Recording" onPress={handleStartRecording} />
          <RecordButton label="Stop Recording" onPress={handleStopRecording} variant="danger" />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: Spacing.two,
  },
  statusDotActive: {
    backgroundColor: '#e53935',
  },
  card: {
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#3c87f7',
  },
  buttonDanger: {
    backgroundColor: '#e53935',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonTextDanger: {
    color: '#ffffff',
  },
});
