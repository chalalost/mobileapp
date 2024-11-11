import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import Storage from '../screen/share/storage/storage';
import {Alert, PermissionsAndroid} from 'react-native';
import firebase from '@react-native-firebase/app';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ScreenBottomTab } from '../screen/share/app/constants/constants';

export async function RequestUserPermission() {
  await messaging().registerDeviceForRemoteMessages();
  try {
    const enable = await CheckPermission();
    if (!enable) {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        GetFCMToken();
        console.log('Authorization status:', authStatus);
      } else {
        console.log('Authorization status enabled:', authStatus);
      }
    }
  } catch (error) {
    console.log('Authorization error', error);
    Alert.alert('Thiết bị này không thể nhận thông báo');
  }
}

async function CheckPermission() {
    console.log('CheckPermission')
  const authStatus = await firebase.messaging().hasPermission();
  if (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }
  return false;
}

async function GetFCMToken() {
  let token = '';
  try {
    console.log('GetFCMToken')
    const hasPermission = await CheckPermission();
    if (hasPermission) {
      token = await messaging().getToken();
    } else {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status 11111:', authStatus);
        token = await messaging().getToken();
      } else {
        console.log('Authorization status not enabled 11111:', authStatus);
      }
    }
  } catch (error) {
    console.log(error, 'GET_FCM_ERROR');
  }
  await Storage.setItem('fcmtoken', token);
  return token;
}

const notificationHandler = async () => {
  await RequestUserPermission();
};

export {GetFCMToken, CheckPermission, notificationHandler};
