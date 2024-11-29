import {PermissionsAndroid} from 'react-native';

const getPermissions = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permiso de ubicación',
          message: 'La aplicación necesita acceso a la ubicación.',
          buttonNeutral: 'Preguntar más tarde',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          const granted2 = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Permiso de ubicación',
              message: 'La aplicación necesita acceso a la ubicación.',
              buttonNeutral: 'Preguntar más tarde',
              buttonNegative: 'Cancelar',
              buttonPositive: 'Aceptar',
            },
          );

          if (granted2 === PermissionsAndroid.RESULTS.GRANTED) {
          } else {
            reject('no volver a preguntar');
          }
        }
      }
    } catch (error) {
      console.error('Error al solicitar permiso de ubicacion:', error);
    }
  });
};

export {getPermissions};
