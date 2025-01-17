import Geolocation from '@react-native-community/geolocation';

/* utils */
import {checkInternetConnection} from '.';

const getUbication = async () => {
  return new Promise<{latitude: string; longitude: string}>(
    async (resolve, reject) => {
      const isConectedToInternet = await checkInternetConnection();

      if (isConectedToInternet) {
        Geolocation.getCurrentPosition(
          async position => {
            const latitude = position.coords.latitude.toString();
            const longitude = position.coords.longitude.toString();
            resolve({latitude, longitude});
          },
          error => {
            //console.error(error);
            reject(error);
            //resolve({latitude: '', longitude: ''});
          },
          {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
        );
      } else {
        resolve({latitude: '', longitude: ''});
      }
    },
  );
};
export {getUbication};
