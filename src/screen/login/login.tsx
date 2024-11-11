import { NavigationProp } from '@react-navigation/native';
import jwt_decode from 'jwt-decode';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputChangeEventData,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
import Modal from 'react-native-modal';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuProvider,
  MenuTrigger,
} from 'react-native-popup-menu';
// import { clockRunning } from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';
import { connect } from 'react-redux';
import { Action, AnyAction, Dispatch, bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { IGateway } from '../share/app/gateway';
import {
  IError,
  IRule,
  typeVadilate,
  validateField,
  validateForm,
} from '../share/commonVadilate/validate';
import CommonBase from '../share/network/axios';
import { HeightNavigatorTitle } from './../share/app/constants/constansHeightApp';
import {
  ApiLogin,
  ResponseDataAuthen,
  ResponseService,
} from './../share/app/constantsApi';
import Storage from './../share/storage/storage';
import InputModal from './modal/inputModal';
import loginAction from './saga/loginAction';
import { isAuthSelector } from './saga/loginSelectors';

const dimension = Dimensions.get('window');

type HandleNewGateway = (gateways: IGateway[]) => IGateway[];

// luu vao local storage tren app
const syncReactToLocal = async (handleNewGateway: HandleNewGateway) => {
  const gatewaysString = await Storage.getItem('gateways');
  const gatewayObj: IGateway[] = JSON.parse(gatewaysString || '[]');
  const newGatewayObj = handleNewGateway(gatewayObj);
  Storage.setItem('gateways', newGatewayObj);
};

interface dataLogin {
  UserName: string | '';
  Password: string | '';
}
interface UpTokenData {
  userId: string | '';
  TokenMobile: string | null | undefined;
}

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
  // whatever else is in the JWT.
}

export interface LoginScreenProps {
  navigation: NavigationProp<any, any>;
  loginAction: typeof loginAction;
}

const Rules: IRule[] = [
  {
    field: 'userName',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: typeVadilate.Email,
    valueCheck: '',
    maxValue: 4,
    messages: {
      required: 'Vui lòng nhập tên đăng nhập!',
      minLength: '',
      maxLength: 'Tên đăng nhập không được vượt quá 255 kí tự',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'password',
    required: true,
    maxLength: 255,
    minLength: 6,
    typeValidate: 0,
    valueCheck: '',
    maxValue: 4,
    messages: {
      required: 'Vui lòng nhập mật khẩu!',
      minLength: 'Vui lòng nhập tối thiểu 6 ký tự',
      maxLength: 'Mật khẩu không được vượt quá 255 kí tự',
      validate: '',
      maxValue: '',
    },
  },
];

const deviceHeight = Dimensions.get('screen').height;
const deviceWidth = Dimensions.get('screen').width;

const Login: React.FC<LoginScreenProps> = ({navigation, loginAction}) => {
  const [spinner, setSpinner] = useState<boolean>(false);
  const [isOpen, setOpen] = useState<boolean>(false);
  const [gateways, setGateways] = useState<IGateway[]>([]);
  const [currentGateway, setCurrentGateway] = useState<IGateway | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hidePass, setHidePass] = useState(true);
  const [errors, setErrors] = useState<IError[]>([]);

  const onChangeInputUser = (
    event: NativeSyntheticEvent<TextInputChangeEventData>,
  ) => {
    const value = event.nativeEvent.text;

    let error = validateField(value, Rules, 'userName', errors);
    setErrors([...error]);

    setUserName(value);
  };

  const onChangeInputPassword = (
    event: NativeSyntheticEvent<TextInputChangeEventData>,
  ) => {
    const value = event.nativeEvent.text;

    let error = validateField(value, Rules, 'password', errors);
    setErrors([...error]);

    setPassword(value);
  };

  const handleSubmit = async () => {
    const defaultGateway = gateways.filter(
      gateway => gateway.isDefault == true,
    );
    let data: dataLogin = {
      UserName: userName, //"admin@gmail.com",
      Password: password, //"evomes!@#"
    };
    let error = validateForm({userName, password}, Rules, []);
    if (error && error.length > 0) {
      setErrors([...error]);
      return;
    }
    setSpinner(true);
    let dataResponse = await CommonBase.postAsync<ResponseDataAuthen>(
      ApiLogin.AUTHEN,
      data,
    );
    if (
      dataResponse != undefined &&
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.Success == true
    ) {
      loginAction.loginAuthenReducer(dataResponse.Data);
      setSpinner(false);
      // save token to storage
      Storage.setItem('evomes_token_info', dataResponse.Data);
      // set token axios
      CommonBase.setAuthHeader(dataResponse.Data.token);
      // set user login
      Storage.setItem('userLogin', data);
      Storage.setItem('token', dataResponse.Data.token);
      const decodedToken = jwt_decode<Token>(dataResponse.Data.token);
      console.log(decodedToken);
      
      const userId = decodedToken.sub;
      // api send token
      if (userId != null) {
        uploadToken(userId);
      }
    } else {
      Alert.alert('Email hoặc mật khẩu không đúng');
      setSpinner(false);
    }
  };

  const uploadToken = async (userId: string) => {
    const fcmToken = await Storage.getItem('fcmtoken');
    //#region custom token string
    let removeFirstCharacter = fcmToken?.replace('"', '');
    let finalToken = removeFirstCharacter?.replace('"', '');
    //#endregion
    let uploadTokendata: UpTokenData = {
      userId: userId,
      TokenMobile: finalToken,
    };
    console.log('fcmToken', uploadTokendata);
    let uploadTokenMobileRes = await CommonBase.postAsync<ResponseService>(
      ApiLogin.AUTHEN_GET_TOKEN,
      uploadTokendata,
    );
    console.log('uploadTokenMobileRes', uploadTokenMobileRes);
    if (
      uploadTokenMobileRes != undefined &&
      typeof uploadTokenMobileRes !== 'string' &&
      uploadTokenMobileRes != null &&
      uploadTokenMobileRes.isSuccess == true
    ) {
    }
  };

  const defaultGateway = gateways.filter(gateway => gateway.isDefault == true);
  const notDefaultGateway = gateways.filter(
    gateway => gateway.isDefault == false,
  );

  const addGateway = (name: string, port: string, TenantName: string) => {
    const checkedName = gateways.filter(gateway => gateway.name == name);
    const checkedUrl = gateways.filter(url => url.port == port);
    const checkedTenent = gateways.filter(url => url.TenantName == TenantName);
    if (checkedName.length > 0) {
      return Alert.alert('Tên nhà máy bị trùng, vui lòng nhập lại');
    }
    if (checkedUrl.length > 0) {
      return Alert.alert('Url nhà máy bị trùng, vui lòng nhập lại');
    } else {
      if (defaultGateway.length > 0) {
        const gateway: IGateway = {
          id: new Date().toISOString(),
          name,
          port,
          TenantName,
          isDefault: false,
        };
        setGateways((prev: any) => [...prev, gateway]);
        syncReactToLocal((gatewaysObj: IGateway[]) => [
          ...gatewaysObj,
          gateway,
        ]);
        setOpen(isOpen == false);
      } else {
        const gateway: IGateway = {
          id: new Date().toISOString(),
          name,
          port,
          TenantName,
          isDefault: true,
        };
        setGateways((prev: any) => [...prev, gateway]);
        syncReactToLocal((gatewaysObj: IGateway[]) => [
          ...gatewaysObj,
          gateway,
        ]);
        setOpen(isOpen == false);
      }
    }
  };

  const editGatewayName = (name: string) => {
    setCurrentGateway(prev => {
      if (prev) return {...prev, name};
      return null;
    });
  };

  const editGatewayPort = (port: string) => {
    setCurrentGateway(prev => {
      if (prev) return {...prev, port};
      return null;
    });
  };

  const editGatewayTenent = (TenantName: string) => {
    setCurrentGateway(prev => {
      if (prev) return {...prev, TenantName};
      return null;
    });
  };

  const handleSetDefault = (id: string, isDefault: boolean) => {
    const handler = (prev: IGateway[]) => {
      return prev.map(gateway => {
        if (gateway.id === id) {
          return {...gateway, isDefault};
        }
        return gateway;
      });
    };
    setGateways(handler);
    syncReactToLocal(handler);
  };

  const onChangeCheckbox = (id: string, checked: boolean) => {
    handleSetDefault(id, checked);
  };

  const startEditGateway = (id: string) => {
    const findedGateway = gateways.find(gateway => gateway.id === id);
    if (findedGateway) {
      setOpen(!isOpen);
      setCurrentGateway(findedGateway);
    }
  };

  const finishEditGateway = () => {
    const handler = (gateway: IGateway[]) => {
      return gateway.map(gateway => {
        if (gateway.id === (currentGateway as IGateway).id) {
          return currentGateway as IGateway;
        }
        return gateway;
      });
    };
    setOpen(isOpen == false);
    setGateways(handler);
    setCurrentGateway(null);
    syncReactToLocal(handler);
  };

  const deleteGateway = (id: string) => {
    if (currentGateway) {
      setCurrentGateway(null);
    }
    const handler = (gateway: IGateway[]) => {
      const findedIndexGateway = gateway.findIndex(
        gateway => gateway.id === id,
      );
      if (findedIndexGateway > -1) {
        const result = [...gateway];
        result.splice(findedIndexGateway, 1);
        return result;
      }
      return gateway;
    };
    setGateways(handler);
    syncReactToLocal(handler);
  };

  const openModal = () => {
    setOpen(!isOpen);
  };

  const getDataLogin = async () => {
    const dataLogin: any = await Storage.getItem('userLogin');
    if (dataLogin != '' && dataLogin != null && dataLogin != undefined) {
      const dataObj: dataLogin = JSON.parse(dataLogin);
      setUserName(dataObj.UserName);
      setPassword(dataObj.Password);
    }
  };

  const setDefaultGateway = async () => {
    const gatewaysString = await Storage.getItem('gateways');
    const gatewayObj: IGateway[] = JSON.parse(gatewaysString || '[]');
    // if (gatewayObj.length == 0) {
    //     let defaultData: IGateway = {
    //         id: new Date().toISOString(),
    //         name: "NguyenNgoc",
    //         port: "https://api-gateway.evomes.vn",
    //         TenantName: 'test_db_1',#
    //         isDefault: true,
    //     };
    //     setGateways((prev: any) => [...prev, defaultData])
    //     syncReactToLocal((gatewaysObj: IGateway[]) => [...gatewaysObj, defaultData])
    // }
  };
  const scheduleAlert = () => {
    Alert.alert('Alert Title', 'My Alert Msg', [
      {
        text: 'Ask me later',
        onPress: () => console.log('Ask me later pressed'),
      },
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  };

  useEffect(() => {
    // Storage.removeItem('gateways');
    //scheduleAlert();
    setDefaultGateway();
  }, []);

  useEffect(() => {
    getDataLogin();
  }, []);

  useEffect(() => {
    const getData = async () => {
      const gatewaysString = await Storage.getItem('gateways');
      const gatewayObj: IGateway[] = JSON.parse(gatewaysString || '[]');
      setGateways(gatewayObj);
    };
    getData();
  }, []);

  const DefaultFactory = () => {
    return (
      <>
        {/* {defaultGateway == [] && defaultGateway != null ?
                    ( */}
        {defaultGateway.map(item => (
          <MenuOption key={item.id} disabled>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <BouncyCheckbox
                onPress={(checked: boolean) =>
                  onChangeCheckbox(item.id, checked)
                }
                fillColor={'#001E31'}
                size={12}
                style={{
                  width: '10%',
                }}
                isChecked={item.isDefault}></BouncyCheckbox>
              {/* <Image
                                    style={{
                                        width: '10%',
                                        height: 20,
                                        paddingRight: 10,
                                    }}
                                    source={require('../../images/login/company-info-icon.png')} /> */}
              <Text
                style={{
                  flex: 1,
                  width: '80%',
                  paddingLeft: 10,
                  color: '#001E31',
                }}>
                {item.name}
              </Text>
              <View
                style={{
                  width: '30%',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity onPress={() => startEditGateway(item.id)}>
                    <Image
                      style={{
                        width: 25,
                        height: 25,
                      }}
                      source={require('../../images/login/edit.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteGateway(item.id)}>
                    <Image
                      style={{
                        width: 25,
                        height: 25,
                      }}
                      source={require('../../images/login/delete.png')}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </MenuOption>
        ))}
      </>
    );
  };

  const NotDefaultFactory = () => {
    return (
      <>
        {notDefaultGateway != null ? (
          notDefaultGateway.map(item => (
            <MenuOption key={item.id} disabled>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                {defaultGateway.length > 0 ? (
                  <BouncyCheckbox
                    onPress={(checked: boolean) =>
                      onChangeCheckbox(item.id, checked)
                    }
                    fillColor={'#001E31'}
                    size={12}
                    style={{
                      width: '10%',
                    }}
                    isChecked={item.isDefault}
                    disabled></BouncyCheckbox>
                ) : (
                  <BouncyCheckbox
                    onPress={(checked: boolean) =>
                      onChangeCheckbox(item.id, checked)
                    }
                    fillColor={'#000000'}
                    size={12}
                    style={{
                      width: '10%',
                    }}
                    isChecked={item.isDefault}></BouncyCheckbox>
                )}
                {/* <Image
                                        style={{
                                            width: '10%',
                                            height: 20,
                                            paddingRight: 10,
                                        }}
                                        source={require('../../images/login/company-info-icon.png')} /> */}
                <Text
                  style={{
                    flex: 1,
                    width: '80%',
                    paddingLeft: 10,
                    color: '#001E31',
                  }}>
                  {item.name}
                </Text>
                <View
                  style={{
                    width: '30%',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity onPress={() => startEditGateway(item.id)}>
                      <Image
                        style={{
                          width: 25,
                          height: 25,
                        }}
                        source={require('../../images/login/edit.png')}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteGateway(item.id)}>
                      <Image
                        style={{
                          width: 25,
                          height: 25,
                        }}
                        source={require('../../images/login/delete.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </MenuOption>
          ))
        ) : (
          <MenuOption
            style={{
              height: '20%',
            }}
            disabled>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Text style={{fontWeight: '500', color: '#001E31'}}>
                Không có dữ liệu
              </Text>
            </View>
          </MenuOption>
        )}
      </>
    );
  };

  return (
    <LinearGradient
      colors={['#003350', '#00598C']}
      style={styles.linearGradient}>
      {/* <StatusBar
                translucent
                animated={true}
                backgroundColor="#ffffff00"
                barStyle={'light-content'}
                showHideTransition={"slide"}
                hidden={false}
            /> */}
      <KeyboardAwareScrollView
        // style={{ backgroundColor: '#003350' }}
        // keyboardShouldPersistTaps="always"
        // contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}>
        <Spinner
          visible={spinner}
          // textContent={'login...'}
          textStyle={styles.spinnerTextStyle}
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

        <MenuProvider
          style={{
            marginTop: Platform.OS === 'ios' ? HeightNavigatorTitle.Height : 30,
          }}>
          <View style={{justifyContent: 'center', alignItems: 'flex-end'}}>
            <Menu>
              <MenuTrigger style={{padding: 12}}>
                <Svg width="28" height="28">
                  <Path
                    d="M10.9354 25.2L10.4896 21.616C10.2481 21.5227 10.0208 21.4107 9.80757 21.28C9.5936 21.1493 9.38446 21.0093 9.18015 20.86L5.86473 22.26L2.80005 16.94L5.6697 14.756C5.65113 14.6253 5.64184 14.4991 5.64184 14.3774V13.6214C5.64184 13.5005 5.65113 13.3747 5.6697 13.244L2.80005 11.06L5.86473 5.73999L9.18015 7.13999C9.38446 6.99065 9.59806 6.85065 9.82095 6.71999C10.0438 6.58932 10.2667 6.47732 10.4896 6.38399L10.9354 2.79999H17.0647L17.5105 6.38399C17.752 6.47732 17.9797 6.58932 18.1936 6.71999C18.4069 6.85065 18.6156 6.99065 18.82 7.13999L22.1354 5.73999L25.2001 11.06L22.3304 13.244C22.349 13.3747 22.3583 13.5005 22.3583 13.6214V14.3774C22.3583 14.4991 22.3397 14.6253 22.3025 14.756L25.1722 16.94L22.1075 22.26L18.82 20.86C18.6156 21.0093 18.402 21.1493 18.1792 21.28C17.9563 21.4107 17.7334 21.5227 17.5105 21.616L17.0647 25.2H10.9354ZM14.0558 17.92C15.1331 17.92 16.0525 17.5373 16.814 16.772C17.5755 16.0067 17.9563 15.0827 17.9563 14C17.9563 12.9173 17.5755 11.9933 16.814 11.228C16.0525 10.4627 15.1331 10.08 14.0558 10.08C12.9599 10.08 12.0357 10.4627 11.2831 11.228C10.5312 11.9933 10.1553 12.9173 10.1553 14C10.1553 15.0827 10.5312 16.0067 11.2831 16.772C12.0357 17.5373 12.9599 17.92 14.0558 17.92Z"
                    fill={'#B8C8D9'}
                  />
                </Svg>
              </MenuTrigger>

              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    marginTop: 40,
                    width: '60%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 4,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: '#EDEDED',
                    height: 240,
                    borderLeftWidth: 4,
                    justifyContent: 'flex-start',
                  },
                }}>
                <SafeAreaView>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}>
                    <MenuOption
                      customStyles={{
                        optionText: {},
                      }}
                      onSelect={() => openModal()}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Image
                          style={{
                            width: '10%',
                            height: 20,
                            paddingRight: 10,
                          }}
                          source={require('../../images/login/add-company-icon.png')}
                        />
                        <Text
                          style={{
                            flex: 1,
                            width: '90%',
                            paddingLeft: 10,
                            color: '#001E31',
                          }}>
                          Tạo mới
                        </Text>
                      </View>
                    </MenuOption>
                    <Text
                      style={{padding: 5, fontWeight: '900', color: '#001E31'}}
                      disabled={true}>
                      Nhà máy mặc định
                    </Text>
                    <DefaultFactory />
                    <Text
                      style={{padding: 5, fontWeight: '900', color: '#001E31'}}
                      disabled={true}>
                      Nhà máy đang có
                    </Text>
                    <NotDefaultFactory />
                  </ScrollView>
                </SafeAreaView>
              </MenuOptions>
            </Menu>
          </View>

          <View
            style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
            <Image
              resizeMode="contain"
              style={{
                width: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../images/login/Logo.png')}
            />
          </View>
          <View style={{flex: 3}}>
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{width: '90%'}}>
                <Text style={styles.textLable}>Tên đăng nhập</Text>
                <TextInput
                  placeholder="Điền tên đăng nhập, số điện thoại"
                  placeholderTextColor={'#486581'}
                  style={styles.emailInput}
                  value={userName}
                  onChange={onChangeInputUser}
                />

                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item.fieldName == 'userName') {
                        return (
                          <Text
                            key={j}
                            style={{color: 'red', padding: 0, marginTop: 5}}>
                            {item.mes}
                          </Text>
                        );
                      }
                    })
                  : null}
              </View>
              <View style={{width: '90%', marginTop: 30}}>
                <Text style={styles.textLable}>Mật khẩu</Text>
                <TextInput
                  placeholder="Điền mật khẩu"
                  placeholderTextColor={'#486581'}
                  style={styles.emailInput}
                  value={password}
                  onChange={onChangeInputPassword}
                  secureTextEntry={hidePass ? true : false}
                  //autoComplete='password'
                  importantForAccessibility="yes"
                />
                <TouchableOpacity
                  style={{
                    zIndex: 1,
                    top: -30,
                    marginLeft: deviceWidth - (deviceWidth * 20) / 100,
                    height: 1,
                    position: 'relative',
                  }}
                  onPress={() => setHidePass(!hidePass)}>
                  <Svg width="27" height="27" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M11.9999 15.7751C13.0495 15.7751 13.9411 15.4083 14.6747 14.6747C15.4083 13.9411 15.7751 13.0495 15.7751 11.9999C15.7751 10.9503 15.4083 10.0587 14.6747 9.32509C13.9411 8.59149 13.0495 8.22469 11.9999 8.22469C10.9503 8.22469 10.0587 8.59149 9.32511 9.32509C8.59151 10.0587 8.22471 10.9503 8.22471 11.9999C8.22471 13.0495 8.59151 13.9411 9.32511 14.6747C10.0587 15.4083 10.9503 15.7751 11.9999 15.7751V15.7751ZM11.9999 14.3999C11.3335 14.3999 10.7667 14.1667 10.2995 13.7003C9.83311 13.2331 9.59991 12.6663 9.59991 11.9999C9.59991 11.3335 9.83311 10.7667 10.2995 10.2995C10.7667 9.83309 11.3335 9.59989 11.9999 9.59989C12.6663 9.59989 13.2331 9.83309 13.7003 10.2995C14.1667 10.7667 14.3999 11.3335 14.3999 11.9999C14.3999 12.6663 14.1667 13.2331 13.7003 13.7003C13.2331 14.1667 12.6663 14.3999 11.9999 14.3999ZM11.9999 18.6995C9.75031 18.6995 7.70431 18.0911 5.86191 16.8743C4.02031 15.6583 2.64951 14.0335 1.74951 11.9999C2.64951 9.96629 4.02031 8.34149 5.86191 7.12549C7.70431 5.90869 9.75031 5.30029 11.9999 5.30029C14.2495 5.30029 16.2955 5.90869 18.1379 7.12549C19.9795 8.34149 21.3503 9.96629 22.2503 11.9999C21.3503 14.0335 19.9795 15.6583 18.1379 16.8743C16.2955 18.0911 14.2495 18.6995 11.9999 18.6995V18.6995Z"
                      fill="white"
                    />
                  </Svg>
                </TouchableOpacity>
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item.fieldName == 'password') {
                        return (
                          <Text
                            key={j}
                            style={{color: 'red', padding: 0, marginTop: 5}}>
                            {item.mes}
                          </Text>
                        );
                      }
                    })
                  : null}
              </View>

              <TouchableHighlight onPress={handleSubmit} style={styles.button}>
                <Text
                  style={{
                    ...styles.buttonText,
                    fontWeight: Platform.OS == 'ios' ? '700' : '600',
                    fontFamily: Platform.OS == 'ios' ? 'Mulish' : 'Mulish-Bold',
                  }}>
                  Đăng nhập
                </Text>
              </TouchableHighlight>
              {/* <TouchableHighlight onPress={handlloken} style={styles.button}>
                                <Text style={styles.buttonText}>token</Text>
                            </TouchableHighlight> */}
            </View>
          </View>
        </MenuProvider>

        <Modal
          isVisible={isOpen}
          onBackdropPress={() => setOpen(false)}
          statusBarTranslucent
          useNativeDriver
          deviceHeight={1000}>
          <InputModal
            addNew={addGateway}
            currentDefault={currentGateway}
            editCurrentName={editGatewayName}
            editCurrentPort={editGatewayPort}
            editCurrentTenent={editGatewayTenent}
            finishEdit={finishEditGateway}
          />
        </Modal>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  textLable: {
    width: '90%',
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 15,
    fontFamily: 'Mulish-Bold',
  },
  emailInput: {
    width: '100%',
    height: 30,
    borderRadius: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    padding: 2,
    color: 'white',
    fontSize: 20,
    fontWeight: 'normal',
    fontFamily: 'Mulish-Bold',
  },
  button: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 1,
    marginTop: 50,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1A1C1E',
    fontSize: 20,
    fontWeight: 'normal',
  },
  error: {
    color: 'red',
    alignSelf: 'center',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  loginAction: bindActionCreators(loginAction, dispatch),
});
const mapStateToProps = createStructuredSelector({
  isAuthSelector,
});
export default connect(mapStateToProps, mapDispatchToProps)(Login);
