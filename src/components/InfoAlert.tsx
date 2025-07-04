import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, TouchableOpacity, Animated} from 'react-native';
import {Button, Dialog, Text, Portal} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setObjInfoAlert} from '../redux/slices/infoAlertSlice';

export const InfoAlert = () => {
  const dispatch = useAppDispatch();

  const objShowInfoAlert = useAppSelector(
    store => store.infoAlert.objInfoAlert,
  );

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (objShowInfoAlert.visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [objShowInfoAlert.visible]);
  const {type} = objShowInfoAlert;

  const hideDialog = () => {
    dispatch(
      setObjInfoAlert({
        ...objShowInfoAlert,
        visible: false,
      }),
    );
  };

  const titleAlert = () => {
    type type = 'error' | 'success' | 'info';

    const {type}: {type: type} = objShowInfoAlert;

    switch (type) {
      case 'success':
        return '¡Bien hecho!';

      case 'error':
        return 'Algo salió mal :(';

      case 'info':
        return '¡Atención!';

      default:
        return '¡Atención!';
    }
  };

  const contentAlert = () => {
    const {description} = objShowInfoAlert;
    return description;
  };

  const textButton = () => {
    type type = 'error' | 'success' | 'info';

    const {type}: {type: type} = objShowInfoAlert;

    switch (type) {
      case 'error':
      case 'info':
        return 'Aceptar';

      case 'success':
        return 'Continuar';

      default:
        break;
    }
  };

  const styles = StyleSheet.create({
    textButton: {
      color: '#fff',
      paddingHorizontal: 6,
    },
    buttonStyle: {
      backgroundColor: type == 'error' ? '#DE3A45' : '#092254',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      marginTop: 5,

      paddingVertical: 5,
    },
    headContainer: {
      backgroundColor: '#092254',
      width: '100%',
      padding: 10,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      marginTop: 0,
      zIndex: 2,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#fff',
      flex: 1,
    },
    iconClose: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    dialogContent: {
      marginTop: 70,
    },
    dialog: {
      backgroundColor: '#fff',
      borderRadius: 10,
      zIndex: 2,
      height: 'auto',
      width: '85%',
      transform: [
        {
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
      opacity: animation,
    },
  });

  return (
    <Portal>
      <Dialog
        visible={objShowInfoAlert.visible}
        onDismiss={hideDialog}
        style={styles.dialog}>
        <View style={styles.headContainer}>
          <Text style={styles.title}>{titleAlert()}</Text>
          <TouchableOpacity onPress={hideDialog} style={styles.iconClose}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        <Dialog.Content style={styles.dialogContent}>
          <Text
            allowFontScaling={false}
            style={{fontSize: 15}}
            variant="bodyMedium">
            {contentAlert()}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button style={styles.buttonStyle} onPress={hideDialog}>
            <Text allowFontScaling={false} style={styles.textButton}>
              {textButton()}
            </Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
