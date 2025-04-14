import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';

interface LoaderProps {
  visible: boolean;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({visible, message}) => {

  const animValues = useRef(
    Array.from({length: 4}, () => new Animated.Value(0.5)),
  ).current;

 
  const startPulse = (anim: Animated.Value, delay: number) => {
    anim.setValue(0.5);
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0.5,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished && visible) {
        startPulse(anim, delay);
      }
    });
  };

  useEffect(() => {
    if (visible) {
      animValues.forEach((anim, i) => startPulse(anim, i * 150));
    } else {
      animValues.forEach(anim => {
        anim.stopAnimation(); 
        anim.setValue(0.5); 
      });
    }
  }, [visible, animValues]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.grid}>
        {animValues.map((av, idx) => (
          <Animated.View
            key={idx}
            style={[styles.square, {transform: [{scale: av}]}]}
          />
        ))}
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  grid: {
    width: 64,
    height: 64,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  square: {
    width: 28,
    height: 28,
    margin: 2,
    backgroundColor: '#092254',
    borderRadius: 4,
  },
  message: {
    marginTop: 12,
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});
