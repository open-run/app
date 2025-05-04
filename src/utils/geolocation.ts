import {Platform} from 'react-native';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

type Location = {
  lat: number;
  lng: number;
};

export async function requestGeolocation(): Promise<Location | null> {
  return new Promise(async (resolve, reject) => {
    let granted = false;

    if (Platform.OS === 'android') {
      // Android 권한 요청
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      granted = result === RESULTS.GRANTED;
    } else {
      // iOS 권한 요청
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      granted = result === RESULTS.GRANTED;
    }

    if (!granted) {
      reject(null);
    }

    // 위치 정보 요청
    Geolocation.getCurrentPosition(
      (pos: any) => {
        const {latitude, longitude} = pos.coords;
        resolve({
          lat: latitude,
          lng: longitude,
        });
      },
      () => {
        reject(null);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });
}
