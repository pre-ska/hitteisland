import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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

  const { height, width } = useWindowDimensions();

  const player = { x: width / 4, y: height - 100, w: width / 2, h: 32 };

  useEffect(() => {
    const interval = setInterval(update, DELTA);

    return () => clearInterval(interval);
  }, []);

  const update = () => {
    let nextPosition = getNextPosition(direction.value);
    let newDirection = direction.value;

    // wall detection
    if (nextPosition.y < 0 || nextPosition.y > height - BALL_WIDTH) {
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

    // island detection
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

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {},
    onActive: () => {},
    onEnd: () => {},
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ball, ballAnimatedStyles]} />

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
      <View
        style={{
          top: player.y,
          left: player.x,
          position: 'absolute',
          width: player.w,
          height: player.h,
          backgroundColor: 'black',
          borderRadius: 14,
        }}
      />

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <View
          style={{
            width: '100%',
            height: 50,
            backgroundColor: 'red',
            position: 'absolute',
            bottom: 95,
            opacity: 0.4,
          }}
        ></View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'pink',
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
});
