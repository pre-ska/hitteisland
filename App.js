import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Game from './Game';

const FPS = 60;
const DELTA = 1000 / FPS;
const SPEED = 20;
const BALL_WIDTH = 25;

const island = { x: 130, y: 8, w: 127, h: 32 };

const normalizeVector = (vector) => {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Game />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
