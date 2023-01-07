import { useEffect, useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';

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

export default function Game() {
  const targetPositionX = useSharedValue(0);
  const targetPositionY = useSharedValue(0);
  const direction = useSharedValue(
    normalizeVector({ x: Math.random() * 100, y: Math.random() * 100 })
  );

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(true);

  const { height, width } = useWindowDimensions();
  const playerPosition = useSharedValue({ x: width / 4, y: height - 100 });

  const player = { x: width / 4, y: height - 100, w: width / 2, h: 32 };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) update();
    }, DELTA);

    return () => clearInterval(interval);
  }, [gameOver]);

  const update = () => {
    let nextPosition = getNextPosition(direction.value);
    let newDirection = direction.value;

    // wall detection
    if (nextPosition.y > height - BALL_WIDTH) {
      setGameOver(true);
    }

    if (nextPosition.y < 0) {
      newDirection = {
        x: direction.value.x,
        y: -direction.value.y,
      };
    }

    if (nextPosition.x < 0 || nextPosition.x > width - BALL_WIDTH) {
      newDirection = {
        x: -direction.value.x,
        y: direction.value.y,
      };
    }

    // island hit detection
    if (
      nextPosition.x < island.x + island.w &&
      nextPosition.x + BALL_WIDTH > island.x &&
      nextPosition.y < island.y + island.h &&
      nextPosition.y + BALL_WIDTH > island.y
    ) {
      if (
        targetPositionX.value < island.x ||
        targetPositionX.value > island.x + island.w
      ) {
        newDirection = {
          x: -direction.value.x,
          y: direction.value.y,
        };
      } else {
        newDirection = {
          x: direction.value.x,
          y: -direction.value.y,
        };
      }

      setScore((score) => score + 1);
    }

    // player hit detection
    if (
      nextPosition.x < playerPosition.value.x + player.w &&
      nextPosition.x + BALL_WIDTH > playerPosition.value.x &&
      nextPosition.y < player.y + player.h &&
      nextPosition.y + BALL_WIDTH > player.y
    ) {
      if (
        targetPositionX.value < playerPosition.value.x ||
        targetPositionX.value > playerPosition.value.x + player.w
      ) {
        newDirection = {
          x: -direction.value.x,
          y: direction.value.y,
        };
      } else {
        newDirection = {
          x: direction.value.x,
          y: -direction.value.y,
        };
      }
    }

    direction.value = newDirection;
    nextPosition = getNextPosition(newDirection);

    targetPositionX.value = withTiming(nextPosition.x, {
      duration: DELTA,
      easing: Easing.linear,
    });

    targetPositionY.value = withTiming(nextPosition.y, {
      duration: DELTA,
      easing: Easing.linear,
    });
  };

  const getNextPosition = (direction) => {
    return {
      x: targetPositionX.value + direction.x * SPEED,
      y: targetPositionY.value + direction.y * SPEED,
    };
  };

  const ballAnimatedStyles = useAnimatedStyle(() => {
    return {
      top: targetPositionY.value,
      left: targetPositionX.value,
    };
  });

  const playerAnimatedStyles = useAnimatedStyle(() => ({
    left: playerPosition.value.x,
  }));

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {},
    onActive: (e) => {
      playerPosition.value = {
        ...playerPosition.value,
        x: e.absoluteX - player.w / 2,
      };
    },
    onEnd: () => {},
  });

  const restartGame = () => {
    targetPositionX.value = width / 2;
    targetPositionY.value = height / 2;
    setScore(0);
    setGameOver(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.score}>{score}</Text>

      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOver}>Game Over</Text>
          <Button title="restart" onPress={restartGame} />
        </View>
      )}

      {!gameOver && <Animated.View style={[styles.ball, ballAnimatedStyles]} />}

      {/* island */}
      <View
        style={{
          top: island.y,
          left: island.x,
          position: 'absolute',
          width: island.w,
          height: island.h,
          backgroundColor: 'black',
          borderRadius: 14,
        }}
      />

      {/* player */}
      <Animated.View
        style={[
          {
            top: playerPosition.value.y,
            position: 'absolute',
            width: player.w,
            height: player.h,
            backgroundColor: 'black',
            borderRadius: 14,
          },
          playerAnimatedStyles,
        ]}
      />

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={{
            width: '100%',
            height: 50,
            // backgroundColor: 'red',
            position: 'absolute',
            bottom: 95,
            opacity: 0.4,
          }}
        ></Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    backgroundColor: 'black',
    width: BALL_WIDTH,
    aspectRatio: 1,
    borderRadius: 25,
    position: 'absolute',
  },
  score: {
    fontSize: 100,
    fontWeight: 'bold',
    color: 'lightgray',
    position: 'absolute',
    top: 250,
  },
  gameOverContainer: {
    position: 'absolute',
    top: 420,
  },
  gameOver: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'red',
  },
});
