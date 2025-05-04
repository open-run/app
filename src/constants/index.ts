import {Platform} from 'react-native';

// const HomeURL = 'https://open-run.vercel.app/';
const DevURL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/'
    : 'http://localhost:3000/';
export const URL = DevURL;
