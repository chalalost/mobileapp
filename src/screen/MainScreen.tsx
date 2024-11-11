import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import { Provider as PaperProvider } from 'react-native-paper';
import { G, Path, Svg } from 'react-native-svg';
import { connect } from 'react-redux';
import { Action, AnyAction, Dispatch, bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import HomeMainScreen from '../screen/navigateBottomTab/home/homeMain';
import HomeMainPlasticScreen from '../screen/navigateBottomTab/home/homeMainPlastic';

// import messaging from '@react-native-firebase/messaging';

import notificationScreen from '../screen/navigateBottomTab/notification/notificationScreen';
import SettingScreen from '../screen/navigateBottomTab/setting/settingScreen';
import baseAction from './base/saga/action';
import { isSpinner, listMenu, textSpinner } from './base/saga/selectors';
import { IMenu, PermissionRequestAction } from './base/typeBase/type';
import LoginScreen from './login/login';
import { isAuthSelector, userInfoSelector } from './login/saga/loginSelectors';

import jwt_decode from 'jwt-decode';
import { ActivityIndicator, Alert } from 'react-native';
import { UserInfoAuthenRequestAction } from './login/types/types';
import { HeightNavigatorBottom } from './share/app/constants/constansHeightApp';
import { ScreenBottomTab } from './share/app/constants/constants';
import { ApiPermission, ResponseDataAuthen } from './share/app/constantsApi';
import CommonBase from './share/network/axios';
import Storage from './share/storage/storage';

import ProductionMoldingRecordScreen from '../screen/navigateBottomTab/home/navigate/productionMoldingRecord/productionMoldingRecordScreen'

const theme = {
  colors: {},
};

interface Token {
  nbf: string;
  exp: string;
  iss: string;
  client_id: string;
  sub: string;
  auth_time: string;
  idp: string;
  jti: string;
  iat: string;
  scope: [string];
  amr: [string];
  CategoryType: string;
  // whatever else is in the JWT.
}

interface stateData {
  data: [state];
}

interface state {
  history: [];
  index: number | 0;
  key: string | '';
  routeNames: string[];
  routes: number[];
  stale: false;
  type: string | '';
}

export interface MainProps {
  // navigation: NavigationProp<any, any> | any,
  isAuthSelector: boolean | false;
  userInfoSelector: UserInfoAuthenRequestAction | null;
  isSpinner: boolean | false;
  baseAction: typeof baseAction;
  textSpinner: string | '';
  listMenu: IMenu[] | [];
}

const MainScreen: React.FC<MainProps> = ({
  isAuthSelector,
  isSpinner,
  textSpinner,
  userInfoSelector,
  baseAction,
  listMenu,
}) => {
  const Stack = createNativeStackNavigator();
  const Tab = createMaterialBottomTabNavigator();
  const [defaultRouteName, setDefaultRouteName] = useState<string>(
    ScreenBottomTab.HomeScreen,
  );
  const [categoryType, setCategoryType] = useState(1);

  const checkPerrmissiion = async () => {
    try {
      if (userInfoSelector?.token) {
        const decodedToken = jwt_decode<Token>(userInfoSelector?.token);
        const userId = decodedToken.sub;
        if (
          decodedToken.CategoryType != '' &&
          decodedToken.CategoryType != null &&
          decodedToken.CategoryType != undefined
        ) {
          setCategoryType(parseInt(decodedToken.CategoryType));
        }
        console.log(userId);
        baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
        let dataResponse = await CommonBase.getAsync<ResponseDataAuthen>(
          ApiPermission.GetPermission + '/' + userId + '/' + 2,
          null,
        );
        if (
          dataResponse != undefined &&
          typeof dataResponse !== 'string' &&
          dataResponse != null &&
          dataResponse.Success == true
        ) {
          let data: PermissionRequestAction = {
            listMenu: dataResponse.Data.listMenu,
            listActionMenu: dataResponse.Data.listActionMenu,
            listConfigSystem: dataResponse.Data.listConfigSystem,
          };
          await Storage.setItem(
            'listConfigSystem',
            data.listConfigSystem[0].configName.toString() != undefined ?
              data.listConfigSystem[0].configName.toString() : 'VND'
            ,
          );

          baseAction.setPermission(data);
        }
        baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
      }
    } catch (error) {
      console.log('err', error)
      Alert.alert('Lỗi lấy thông tin quyền!');
    }
  };
  useEffect(() => {
    if (isAuthSelector == true)
      checkPerrmissiion();
  }, [isAuthSelector]);

  // useEffect(() => {
  //   try {
  //     messaging().onNotificationOpenedApp(remoteMes => {
  //       console.log('open notifi', JSON.stringify(remoteMes));
  //       setDefaultRouteName(ScreenBottomTab.NotificationScreen)
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   void messaging()
  //       .getInitialNotification()
  //       .then(remoteMessage => {
  //         if (remoteMessage) {
  //           console.log('Notification caused app to open from quit state:', remoteMessage);
  //           setDefaultRouteName(ScreenBottomTab.NotificationScreen)
  //         }
  //       });

  //   const unSub = messaging().onMessage(async (remoteMes: any) => {
  //   });
  //   return unSub;
  // }, [])

  console.log('defaultRouteName', defaultRouteName)
  console.log(categoryType)

  return (
    <PaperProvider theme={theme}>
      <Spinner
        visible={isSpinner}
        textContent={textSpinner}
        textStyle={{ color: '#FFF' }}
        animation={'none'}
        overlayColor={'#26343b59'}
        customIndicator={
          <>
            <Svg width="88" height="66" viewBox="0 0 44 33" fill="none">
              <Path
                id="Vector"
                d="M30.1354 0H13.5968C12.0115 0.0225622 10.4987 0.668174 9.38557 1.79724C8.27246 2.92632 7.64844 4.44812 7.64844 6.03363C7.64844 7.61913 8.27246 9.14094 9.38557 10.27C10.4987 11.3991 12.0115 12.0447 13.5968 12.0673H30.1354C31.7207 12.0447 33.2335 11.3991 34.3466 10.27C35.4597 9.14094 36.0837 7.61913 36.0837 6.03363C36.0837 4.44812 35.4597 2.92632 34.3466 1.79724C33.2335 0.668174 31.7207 0.0225622 30.1354 0ZM14.4143 8.94016C13.8391 8.94088 13.2767 8.77097 12.7981 8.45191C12.3195 8.13286 11.9463 7.67901 11.7257 7.14779C11.5052 6.61657 11.4472 6.03187 11.559 5.46766C11.6709 4.90346 11.9476 4.38511 12.3541 3.97823C12.7607 3.57134 13.2788 3.29419 13.8429 3.18186C14.407 3.06953 14.9918 3.12706 15.5232 3.34717C16.0546 3.56729 16.5087 3.94009 16.8282 4.4184C17.1477 4.89672 17.318 5.45905 17.3178 6.03424C17.3172 6.80432 17.0111 7.5427 16.4668 8.08746C15.9225 8.63221 15.1844 8.93886 14.4143 8.94016ZM29.3227 8.94016C28.7475 8.94088 28.1851 8.77097 27.7065 8.45191C27.2279 8.13286 26.8547 7.67901 26.6342 7.14779C26.4136 6.61657 26.3556 6.03187 26.4674 5.46766C26.5793 4.90346 26.856 4.38511 27.2625 3.97823C27.6691 3.57134 28.1872 3.29419 28.7513 3.18186C29.3154 3.06953 29.9002 3.12706 30.4316 3.34717C30.963 3.56729 31.4171 3.94009 31.7366 4.4184C32.0561 4.89672 32.2264 5.45905 32.2262 6.03424C32.2256 6.80516 31.9188 7.54429 31.3735 8.08918C30.8281 8.63408 30.0888 8.94016 29.3178 8.94016H29.3227Z"
                fill="#006699"
              />
              <Path
                id="Vector_2"
                d="M13.1377 25.625C13.5788 27.6112 14.6841 29.3876 16.2711 30.6609C17.858 31.9341 19.8318 32.628 21.8664 32.628C23.9011 32.628 25.8748 31.9341 27.4618 30.6609C29.0488 29.3876 30.1541 27.6112 30.5952 25.625H13.1377Z"
                fill="#006699"
              />
              <Path
                id="Vector_3"
                d="M42.1492 19.7936C41.83 20.2676 41.367 20.6265 40.8284 20.8175C40.2898 21.0086 39.7041 21.0216 39.1576 20.8547C38.6111 20.6878 38.1325 20.3498 37.7926 19.8905C37.4526 19.4312 37.2691 18.8748 37.2691 18.3034C37.2691 17.7319 37.4526 17.1755 37.7926 16.7162C38.1325 16.2569 38.6111 15.9189 39.1576 15.752C39.7041 15.5851 40.2898 15.5982 40.8284 15.7892C41.367 15.9802 41.83 16.3392 42.1492 16.8131L43.7281 15.2966C43.4964 15.0038 43.2315 14.7389 42.9387 14.5072L41.8291 15.0339C41.5382 14.8665 41.2268 14.7376 40.9028 14.6502L40.491 13.4917C40.1195 13.4494 39.7444 13.4494 39.3729 13.4917L38.961 14.6502C38.6374 14.7376 38.3265 14.8666 38.036 15.0339L36.9252 14.5072C36.6324 14.7389 36.3675 15.0038 36.1358 15.2966L36.6625 16.4074C36.5561 16.593 36.4645 16.7867 36.3887 16.9867V16.9622H30.8066V13.8559H12.9263V16.9622H7.34056V16.9867C7.26424 16.7869 7.17273 16.5932 7.06683 16.4074L7.59351 15.2966C7.36181 15.0038 7.0969 14.7389 6.8041 14.5072L5.6933 15.0339C5.4025 14.8663 5.09113 14.7374 4.76702 14.6502L4.35521 13.4917C3.98411 13.4494 3.6094 13.4494 3.2383 13.4917L2.82649 14.6502C2.50246 14.7376 2.19111 14.8665 1.90021 15.0339L0.790635 14.5072C0.497163 14.7386 0.231809 15.0035 0 15.2966L1.5886 16.8131C1.90788 16.3388 2.37106 15.9795 2.90991 15.7883C3.44876 15.597 4.0348 15.5838 4.58168 15.7507C5.12857 15.9177 5.6074 16.2558 5.94762 16.7153C6.28785 17.1749 6.47149 17.7316 6.47149 18.3034C6.47149 18.8752 6.28785 19.4318 5.94762 19.8914C5.6074 20.3509 5.12857 20.6891 4.58168 20.856C4.0348 21.0229 3.44876 21.0097 2.90991 20.8185C2.37106 20.6272 1.90788 20.2679 1.5886 19.7936L0 21.3101C0.231464 21.6039 0.496851 21.8693 0.790635 22.1007L1.90021 21.5679C2.19061 21.7363 2.50209 21.8654 2.82649 21.9516L3.2383 23.1101C3.6094 23.1525 3.98411 23.1525 4.35521 23.1101L4.76702 21.9516C5.09149 21.8656 5.403 21.7365 5.6933 21.5679L6.8041 22.0958C7.09721 21.864 7.36216 21.5987 7.59351 21.3052L7.06683 20.1956C7.1725 20.0097 7.264 19.8161 7.34056 19.6164V19.6396H12.9263V23.682C12.9263 23.8836 12.9337 24.0828 12.9471 24.2808H30.7883C30.8005 24.0828 30.8091 23.8836 30.8091 23.682V19.6445H36.3948V19.6213C36.4709 19.8212 36.5624 20.0149 36.6686 20.2005L36.137 21.3101C36.3684 21.6036 36.6333 21.8689 36.9264 22.1007L38.0372 21.5728C38.3272 21.7412 38.6383 21.8702 38.9623 21.9565L39.3741 23.115C39.7456 23.1574 40.1207 23.1574 40.4922 23.115L40.904 21.9565C41.2284 21.8702 41.5399 21.7412 41.8303 21.5728L42.9399 22.1007C43.233 21.8689 43.4979 21.6036 43.7293 21.3101L42.1492 19.7936ZM24.1858 19.6445C23.9503 20.0517 23.6117 20.3898 23.2042 20.6249C22.7967 20.86 22.3345 20.9837 21.864 20.9837C21.3936 20.9837 20.9314 20.86 20.5239 20.6249C20.1163 20.3898 19.7778 20.0517 19.5422 19.6445C19.3074 19.2365 19.1838 18.7741 19.1838 18.3034C19.1838 17.8326 19.3074 17.3702 19.5422 16.9622C19.9238 16.4003 20.5039 16.0036 21.1659 15.8518C21.828 15.7001 22.523 15.8046 23.1111 16.1444C23.6993 16.4841 24.1371 17.0339 24.3364 17.6832C24.5358 18.3325 24.482 19.0332 24.1858 19.6445Z"
                fill="#006699"
              />
              <Path
                id="Vector_4"
                d="M23.4276 18.304C23.4266 18.649 23.3114 18.984 23.1 19.2567C22.8887 19.5294 22.593 19.7245 22.2591 19.8116C21.9253 19.8987 21.572 19.8728 21.2543 19.7381C20.9367 19.6033 20.6726 19.3673 20.5031 19.0667C20.3337 18.7661 20.2685 18.4179 20.3177 18.0764C20.3669 17.7349 20.5278 17.4193 20.7751 17.1787C21.0225 16.9382 21.3425 16.7863 21.6853 16.7467C22.028 16.7071 22.3743 16.782 22.67 16.9598C22.9019 17.099 23.0936 17.2961 23.2264 17.5318C23.3592 17.7674 23.4286 18.0335 23.4276 18.304Z"
                fill="#006699"
              />
            </Svg>

            <ActivityIndicator size="large" color="#006699" />
          </>
        }
      />
      <NavigationContainer>
        {/* {isAuthSelector == true
          && listMenu.length > 0
          ? (
            <Tab.Navigator
              screenListeners={({ navigation }) => ({
                state: (e: any) => {
                  let stateNavigator = e.data.state;
                  let ScreenName =
                    stateNavigator?.routeNames[stateNavigator.index];
                  baseAction.onPressMenu({ ScreenName: ScreenName, Type: 1 });

                  // Do something with the `navigation` object
                  if (!navigation.canGoBack()) {
                  }
                },
              })}
              initialRouteName={ScreenBottomTab.NotificationScreen}
              barStyle={{
                backgroundColor: '#FFFFFF',
                height: HeightNavigatorBottom.Height,
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderLeftWidth: 1,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                borderColor: '#dddddd',
                marginBottom: 5,
                elevation: 5,
                shadowColor: '#00000',
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 2,
                marginTop: -30,
                paddingTop: 6,
                paddingBottom: 12,
              }}>

              {listMenu.findIndex(
                x => x.MenuTitle == ScreenBottomTab.HomeScreen,
              ) != -1 ? (
                <Tab.Screen
                  name={ScreenBottomTab.HomeScreen}
                  // type = 1: may, type = 2: nhua
                  component={
                    categoryType == 1 ? HomeMainScreen : HomeMainPlasticScreen
                  }
                  options={{
                    title: '',
                    // tabBarLabel: 'Trang chủ',

                    tabBarIcon: ({ focused }) => (
                      // dedault #B8C8D9
                      <Svg width="30" height="30" viewBox="0 0 28 28" fill="none">
                        <Path
                          d="M5.25 23.9162V10.8206L14 4.22937L22.75 10.8206V23.9162H15.6632V16.3632H12.3088V23.9162H5.25Z"
                          fill={focused ? '#003350' : '#B8C8D9'}
                        />
                      </Svg>
                    ),
                  }}
                />
              ) : null}

              {listMenu.findIndex(
                x => x.MenuTitle == ScreenBottomTab.NotificationScreen,
              ) != -1 ? (
                <Tab.Screen
                  name={ScreenBottomTab.NotificationScreen}
                  component={notificationScreen}
                  options={{
                    tabBarBadge: false,
                    title: '',
                    // tabBarLabel: 'Thông báo',
                    tabBarIcon: ({ focused }) => (
                      <Svg width="30" height="30" viewBox="0 0 28 28" fill="none">
                        <Path
                          d="M5.89111 21.5544V20.0368H7.29111V12.7456C7.29111 11.0927 7.81611 9.63949 8.86611 8.38602C9.91611 7.13162 11.2578 6.36816 12.8911 6.09562V4.55002C12.8911 4.23922 12.9984 3.97696 13.2131 3.76322C13.4268 3.54856 13.6891 3.44122 13.9999 3.44122C14.3107 3.44122 14.573 3.54856 14.7867 3.76322C15.0014 3.97696 15.1087 4.23922 15.1087 4.55002V6.09562C16.742 6.36816 18.0837 7.12649 19.1337 8.37062C20.1837 9.61476 20.7087 11.0731 20.7087 12.7456V20.0368H22.1087V21.5544H5.89111ZM13.9999 24.9662C13.4754 24.9662 13.033 24.7866 12.6727 24.4272C12.3134 24.067 12.1337 23.6246 12.1337 23.1H15.8661C15.8661 23.6246 15.6864 24.067 15.3271 24.4272C14.9668 24.7866 14.5244 24.9662 13.9999 24.9662Z"
                          fill={focused ? '#003350' : '#B8C8D9'}
                        />
                      </Svg>
                    ),
                  }}
                />
              ) : null}

              {listMenu.findIndex(
                x => x.MenuTitle == ScreenBottomTab.SettingsScreen,
              ) != -1 ? (
                <Tab.Screen
                  name={ScreenBottomTab.SettingsScreen}
                  component={SettingScreen}
                  options={{
                    title: '',
                    // tabBarLabel: 'Cài đặt',
                    tabBarIcon: ({ focused }) => (
                      <Svg width="30" height="30" viewBox="0 0 28 28" fill="none">
                        <Path
                          d="M10.9354 25.2L10.4896 21.616C10.2481 21.5227 10.0208 21.4107 9.80757 21.28C9.5936 21.1493 9.38446 21.0093 9.18015 20.86L5.86473 22.26L2.80005 16.94L5.6697 14.756C5.65113 14.6253 5.64184 14.4991 5.64184 14.3774V13.6214C5.64184 13.5005 5.65113 13.3747 5.6697 13.244L2.80005 11.06L5.86473 5.73999L9.18015 7.13999C9.38446 6.99065 9.59806 6.85065 9.82095 6.71999C10.0438 6.58932 10.2667 6.47732 10.4896 6.38399L10.9354 2.79999H17.0647L17.5105 6.38399C17.752 6.47732 17.9797 6.58932 18.1936 6.71999C18.4069 6.85065 18.6156 6.99065 18.82 7.13999L22.1354 5.73999L25.2001 11.06L22.3304 13.244C22.349 13.3747 22.3583 13.5005 22.3583 13.6214V14.3774C22.3583 14.4991 22.3397 14.6253 22.3025 14.756L25.1722 16.94L22.1075 22.26L18.82 20.86C18.6156 21.0093 18.402 21.1493 18.1792 21.28C17.9563 21.4107 17.7334 21.5227 17.5105 21.616L17.0647 25.2H10.9354ZM14.0558 17.92C15.1331 17.92 16.0525 17.5373 16.814 16.772C17.5755 16.0067 17.9563 15.0827 17.9563 14C17.9563 12.9173 17.5755 11.9933 16.814 11.228C16.0525 10.4627 15.1331 10.08 14.0558 10.08C12.9599 10.08 12.0357 10.4627 11.2831 11.228C10.5312 11.9933 10.1553 12.9173 10.1553 14C10.1553 15.0827 10.5312 16.0067 11.2831 16.772C12.0357 17.5373 12.9599 17.92 14.0558 17.92Z"
                          fill={focused ? '#003350' : '#B8C8D9'}
                        />
                      </Svg>
                    ),
                  }}
                />
              ) : null}
            </Tab.Navigator>
          ) : ( */}
        <Stack.Navigator>
          {/* <Stack.Screen
            options={{ headerShown: false }}
            name="login"
            component={LoginScreen}
          /> */}
          <Stack.Screen
            options={{ headerShown: false }}
            name="home"
            component={ProductionMoldingRecordScreen}
          />
        </Stack.Navigator>
        {/* )} */}
      </NavigationContainer>
    </PaperProvider>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  baseAction: bindActionCreators(baseAction, dispatch),
});

const mapStateToProps = createStructuredSelector({
  isAuthSelector,
  userInfoSelector,
  isSpinner,
  textSpinner,
  listMenu,
});
export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
