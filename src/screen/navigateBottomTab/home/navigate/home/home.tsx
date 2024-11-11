import messaging from '@react-native-firebase/messaging';
import {useIsFocused} from '@react-navigation/native';
import dayjs from 'dayjs';
import {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import LinearGradientLayout from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Path, Svg} from 'react-native-svg';
import {connect} from 'react-redux';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import {createStructuredSelector} from 'reselect';
import baseAction from '../../../../base/saga/action';
import {listActionForMenuSelected} from '../../../../base/saga/selectors';
import {IActionMenu} from '../../../../base/typeBase/type';
import {
  ApiCommon,
  ApiHomeReport,
  ResponseService,
} from '../../../../share/app/constantsApi';
import SelectBaseWithoutIcon from '../../../../share/base/component/selectBase/selectBaseWithoutIcon';
import CommonBase from '../../../../share/network/axios';
import MyTitleHome from './../../../../../../src/screen/share/base/component/myStatusBar/MyTitleHome';
import HomeAction from './saga/homeAction';
import {
  getDataHomeSelector,
  getDateTimeSelector,
  getErrorSelector,
  getStatusSelector,
} from './saga/homeSelectors';
import {
  HomeState,
  IDataReportProgress,
  IDropdownData,
  IPopupReport,
  IRequestData,
} from './types/types';

import CircularProgress from 'react-native-circular-progress-indicator';
import Modal from 'react-native-modal';
import {
  TypeWorkcenterMobile,
  WorkByTypeEnumMobile,
} from '../productionRecord/types/enum/productionRecord';
import InfomationProgressModal from './components/infomationProgressModal';

// import LaborReportDetail from './components/reportChart/detailChart/LaborReportDetail';
// import SaleReportDetail from './components/reportChart/detailChart/SaleReportDetail';

import Spinner from 'react-native-loading-spinner-overlay';
import {ScreenBottomTab} from '../../../../share/app/constants/constants';
import LaborChart from './components/reportChart/LaborChart';
import QuantityChart from './components/reportChart/QuantityChart';
import SaleReportByCustomer from './components/reportChart/SaleChartByCustomer';
import SaleReport from './components/reportChart/SaleReport';
import WorkerInfor from './components/reportChart/WorkerInfor';
//import * as ScreenOrientation from 'expo-screen-orientation';

// khai bao kieu cua props
type HomeProps = {
  navigation: any;
  // DrawerNavigation: DrawerNavigationProp<any, any>
  HomeAction: typeof HomeAction;
  getDataHomeSelector: HomeState['getDataHomeSelector'];
  getErrorSelector: HomeState['getErrorSelector'];
  getStatusSelector: HomeState['getStatusSelector'];
  getDateTimeSelector: HomeState['getDateTimeSelector'];
  baseAction: typeof baseAction;
  listActionForMenuSelected: IActionMenu[] | [];
  isSpinner: boolean | false;
};

interface IitemFilter {
  Id: number | '';
  title: string | '';
}

const DATAFILTER = [
  {
    Id: 1,
    title: ' Báo cáo doanh thu tổ ',
  },
  {
    Id: 2,
    title: 'Báo cáo doanh thu khách hàng',
  },
  {
    Id: 3,
    title: ' Báo cáo lao động ',
  },
];

const marginVertical = 0;
const width = Dimensions.get('window').width;

const Home: React.FC<HomeProps> = ({
  listActionForMenuSelected,
  baseAction,
  navigation,
  HomeAction,
  getDateTimeSelector,
  isSpinner,
}) => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const isDarkMode = useColorScheme() === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [filterId, setTabId] = useState<number>(1);

  const [requestData, setRequestData] = useState<IRequestData>({
    workCenter: '',
    date: getDateTimeSelector,
  });

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenDetailChart, setIsOpenDetailChart] = useState<boolean>(false);
  const [isShowComponent, setIsShowComponent] = useState<boolean>(true);
  const onPressCloseModal = () => {
    setIsOpenModal(false);
    setDataPopupShow([
      {
        Workcenterid: '',
        Workcentername: '',
        Maincodeproduct: '',
        Color: '',
        Percent: '',
        PercentColor: '',
        QtyAfterWash: 0,
        QtyFinishedWarehouse: 0,
        QtyInline: 0,
        QtyLaundry: 0,
        QtyOutputBond: 0,
        QtyOuputGarment: 0,
        QtyLKOuputGarment: 0,
        QtyKH: 0,
      },
    ]);
  };

  const [dataReportProgress, setDataReportProgress] = useState<
    IDataReportProgress[]
  >([]);

  const [dataPopupReport, setDataPopupReport] = useState<IPopupReport[]>([]);
  const [dataPopupShow, setDataPopupShow] = useState<IPopupReport[]>([]);
  const [dataDropdownWorkcenter, setDataDropdownWorkCenter] = useState<
    IDropdownData[]
  >([]);
  const [dataDropdownWorkOrderCode, setDataDropdownWorkOrderCode] = useState<
    IDropdownData[]
  >([]);

  const getWorkCenterByUser = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_WORKCENTER_INFO_BY_USER,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data = {
        workCenter: dataResponse.data,
      };
      getDataDropdownWorkOrderCode(data.workCenter.Workcenterid);
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const getDataDropdownWorkOrderCode = async (workCenter: string) => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_API_COMMON +
        '?type=' +
        WorkByTypeEnumMobile.Workorder +
        '&code=' +
        workCenter +
        '&typeWorkcenter=1',
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data = {
        list: dataResponse.data,
      };
      setDataDropdownWorkOrderCode(data.list);
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const getDataDropdownWorkcenter = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_API_COMMON +
        '?type=' +
        WorkByTypeEnumMobile.WorkCenter +
        '&typeWorkcenter=' +
        TypeWorkcenterMobile.May,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data = {
        list: dataResponse.data,
      };
      setDataDropdownWorkCenter(data.list);
      // if(data.list[0].id != null && data.list[0].id != undefined){
      //   setRequestData(prevState => ({
      //     ...prevState,
      //     workCenter: data.list[0].id,
      //   }));
      // }
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const getDataReportProgress = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiHomeReport.PRODUCTION_REPORT_PROGRESS + '/' + getDateTimeSelector,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data = {
        listReportProgress: dataResponse.data,
      };
      setDataReportProgress(data.listReportProgress);
      setDataPopup();
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const setDataPopup = () => {
    if (dataReportProgress && dataReportProgress.length > 0) {
      var listData: IPopupReport[] = [];
      for (var i = 0; i < dataReportProgress.length; i++) {
        let percent = 0;
        if (
          dataReportProgress[i].QtyKH != 0 &&
          dataReportProgress[i].QtyLKOuputGarment != 0
        ) {
          percent =
            (dataReportProgress[i].QtyLKOuputGarment /
              dataReportProgress[i].QtyKH) *
            100;
        }
        let color = '';
        let percentColor = '';
        if (percent < 80) {
          color = '#F66F51';
          percentColor = '#9F0AC4';
        }
        if (percent >= 80 && percent < 90) {
          (color = '#FFBF00'), (percentColor = '#FD4206');
        }
        if (percent >= 90) {
          (color = '#137DB9'), (percentColor = '#008B09');
        }
        listData.push({
          Workcenterid: dataReportProgress[i].Workcenterid,
          Workcentername: dataReportProgress[i].Workcentername,
          Maincodeproduct: dataReportProgress[i].Maincodeproduct,
          QtyAfterWash: dataReportProgress[i].QtyAfterWash,
          QtyFinishedWarehouse: dataReportProgress[i].QtyFinishedWarehouse,
          QtyInline: dataReportProgress[i].QtyInline,
          QtyKH: dataReportProgress[i].QtyKH,
          QtyLaundry: dataReportProgress[i].QtyLaundry,
          QtyOuputGarment: dataReportProgress[i].QtyOuputGarment,
          QtyLKOuputGarment: dataReportProgress[i].QtyLKOuputGarment,
          QtyOutputBond: dataReportProgress[i].QtyOutputBond,
          Color: color,
          PercentColor: percentColor,
          Percent: percent.toString(),
        });
      }
      setDataPopupReport([...listData]);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (datePickerChoose: Date) => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    if (Platform.OS == 'ios') {
      HomeAction.setDateTimeReducer(
        dayjs(datePickerChoose).format('YYYY-MM-DD'),
      );
      hideDatePicker();
    } else {
      hideDatePicker();
      HomeAction.setDateTimeReducer(
        dayjs(datePickerChoose).format('YYYY-MM-DD'),
      );
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
  };

  const renderfilter = (item: IitemFilter, index: number) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (filterId === item.Id) {
            return;
          }

          if (item.Id) {
            setTabId(item.Id);
          }

          switch (item.Id) {
            case 1:
              setTimeout(() => {
                setRefreshing(false);
              }, 2000);
              break;

            case 2:
              break;
            default:
              break;
          }
        }}
        key={index}
        style={{
          padding: 6,
          borderRadius: 6,
          marginRight: 8,
          marginBottom: 8,
          backgroundColor: filterId === item.Id ? '#003350' : '#E7F2FF',
        }}>
        <Text
          style={{
            fontWeight: '600',
            color: filterId === item.Id ? '#F4F4F9' : '#394856',
            fontFamily: 'Mulish-Bold',
            fontSize: 12,
            marginLeft: 4,
          }}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItemReportProgress = (item: IPopupReport, index: number) => {
    return (
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={{
            width: 190,
            height: 90,
            backgroundColor: '#ffffff',
            marginLeft: 2,
            marginRight: 8,
            marginTop: 5,
            marginBottom: 5,
            borderRadius: 10,
            padding: 12,
            flexDirection: 'row',
            shadowColor: '#00000',
            shadowOpacity: 0.4,
            elevation: 4,
          }}
          activeOpacity={0.88}
          onPress={() => {
            setIsOpenModal(true);
            setDataPopupShow([
              {
                Workcenterid: item.Workcenterid,
                Workcentername: item.Workcentername,
                Maincodeproduct: item.Maincodeproduct,
                Color: item.Color,
                Percent: item.Percent,
                PercentColor: item.PercentColor,
                QtyAfterWash: item.QtyAfterWash,
                QtyKH: item.QtyKH,
                QtyFinishedWarehouse: item.QtyFinishedWarehouse,
                QtyInline: item.QtyInline,
                QtyLaundry: item.QtyLaundry,
                QtyOutputBond: item.QtyOutputBond,
                QtyOuputGarment: item.QtyOuputGarment,
                QtyLKOuputGarment: item.QtyLKOuputGarment,
              },
            ]);
          }}
          key={index}>
          <View
            style={{
              width: '50%',
              flexDirection: 'column',
              display: 'flex',
              justifyContent: 'center',
            }}>
            <Text style={{color: '#697988', fontFamily: 'Mulish-Bold'}}>
              {item.Workcentername}
            </Text>
            <Text
              style={{
                color: 'rgba(0, 0, 0, 1)',
                fontWeight: '600',
                fontSize: 20,
                marginTop: 5,
                fontFamily: 'Mulish-Bold',
              }}>
              {item.QtyLKOuputGarment}
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}>
              {item.Color == '#FFBF00' || item.Color == '#F66F51' ? (
                <Svg
                  style={{position: 'relative', top: 3}}
                  width="10"
                  height="11"
                  viewBox="0 0 10 11"
                  fill="none">
                  <Path
                    id="Vector"
                    d="M5 0.5C3.67392 0.5 2.40215 1.02678 1.46447 1.96447C0.526784 2.90215 2.76522e-07 4.17392 2.18557e-07 5.5C1.60592e-07 6.82608 0.526784 8.09785 1.46447 9.03553C2.40215 9.97322 3.67392 10.5 5 10.5C6.32608 10.5 7.59785 9.97322 8.53553 9.03553C9.47322 8.09785 10 6.82608 10 5.5C10 4.17392 9.47322 2.90215 8.53553 1.96447C7.59785 1.02678 6.32608 0.5 5 0.5ZM3.24812 4.19C3.21828 4.16117 3.19447 4.12669 3.17809 4.08856C3.16172 4.05044 3.1531 4.00943 3.15273 3.96794C3.15237 3.92644 3.16028 3.88529 3.17599 3.84689C3.19171 3.80848 3.21491 3.77359 3.24425 3.74425C3.27359 3.71491 3.30848 3.69171 3.34689 3.67599C3.3853 3.66028 3.42644 3.65237 3.46794 3.65273C3.50943 3.65309 3.55044 3.66172 3.58856 3.67809C3.62669 3.69447 3.66117 3.71828 3.69 3.74812L6.25 6.30812L6.25 4.57812C6.25 4.49524 6.28292 4.41576 6.34153 4.35715C6.40013 4.29855 6.47962 4.26562 6.5625 4.26562C6.64538 4.26562 6.72487 4.29855 6.78347 4.35715C6.84208 4.41576 6.875 4.49524 6.875 4.57812L6.875 7.0625C6.875 7.14538 6.84208 7.22487 6.78347 7.28347C6.72487 7.34208 6.64538 7.375 6.5625 7.375L4.07813 7.375C3.99524 7.375 3.91576 7.34208 3.85715 7.28347C3.79855 7.22487 3.76563 7.14538 3.76563 7.0625C3.76563 6.97962 3.79855 6.90013 3.85715 6.84153C3.91576 6.78292 3.99524 6.75 4.07813 6.75L5.80813 6.75L3.24812 4.19Z"
                    fill={item.Color}
                  />
                </Svg>
              ) : (
                <Svg
                  style={{position: 'relative', top: 3}}
                  width="10"
                  height="11"
                  viewBox="0 0 10 11"
                  fill="none">
                  <Path
                    id="Vector"
                    d="M5 10.6924C3.67392 10.6924 2.40215 10.1656 1.46447 9.22792C0.526784 8.29023 -2.76522e-07 7.01847 -2.18557e-07 5.69238C-1.60592e-07 4.3663 0.526784 3.09453 1.46447 2.15685C2.40215 1.21917 3.67392 0.692383 5 0.692383C6.32608 0.692383 7.59785 1.21917 8.53553 2.15685C9.47322 3.09453 10 4.3663 10 5.69238C10 7.01847 9.47322 8.29024 8.53553 9.22792C7.59785 10.1656 6.32608 10.6924 5 10.6924ZM3.24812 7.00238C3.21828 7.03121 3.19447 7.06569 3.17809 7.10382C3.16172 7.14195 3.15309 7.18295 3.15273 7.22445C3.15237 7.26594 3.16028 7.30709 3.17599 7.34549C3.19171 7.3839 3.21491 7.41879 3.24425 7.44813C3.27359 7.47747 3.30848 7.50068 3.34689 7.51639C3.38529 7.5321 3.42644 7.54001 3.46794 7.53965C3.50943 7.53929 3.55044 7.53067 3.58856 7.51429C3.62669 7.49791 3.66117 7.4741 3.69 7.44426L6.25 4.88426L6.25 6.61426C6.25 6.69714 6.28292 6.77662 6.34153 6.83523C6.40013 6.89383 6.47962 6.92676 6.5625 6.92676C6.64538 6.92676 6.72487 6.89383 6.78347 6.83523C6.84208 6.77662 6.875 6.69714 6.875 6.61426L6.875 4.12988C6.875 4.047 6.84208 3.96752 6.78347 3.90891C6.72487 3.85031 6.64538 3.81738 6.5625 3.81738L4.07812 3.81738C3.99524 3.81738 3.91576 3.85031 3.85715 3.90891C3.79855 3.96752 3.76562 4.047 3.76562 4.12988C3.76562 4.21276 3.79855 4.29225 3.85715 4.35085C3.91576 4.40946 3.99524 4.44238 4.07812 4.44238L5.80812 4.44238L3.24812 7.00238Z"
                    fill={item.Color}
                  />
                </Svg>
              )}
              {item.QtyOutputBond ? (
                <Text style={{...styles.percent, color: item.Color}}>
                  {parseFloat(item.QtyOutputBond.toFixed(2))}
                </Text>
              ) : (
                <Text style={{...styles.percent, color: item.Color}}>0</Text>
              )}
            </View>
          </View>

          <View
            style={{
              width: '10%',
              justifyContent: 'center',
              paddingLeft: 10,
            }}>
            <CircularProgress
              value={+item.Percent}
              valueSuffix={'%'}
              radius={33}
              duration={0}
              activeStrokeWidth={6}
              activeStrokeColor={item.Color}
              progressValueColor={item.PercentColor}
              inActiveStrokeColor={'#d2d2dd'}
              inActiveStrokeOpacity={0.2}
              inActiveStrokeWidth={6}
              titleColor={'white'}
              progressValueStyle={{
                fontFamily: 'Mulish-Bold',
                fontSize: 16,
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const clearData = () => {
    HomeAction.setDateTimeReducer(dayjs(new Date()).format('YYYY-MM-DD'));
    getDataReportProgress();
    getDataDropdownWorkcenter();
    getWorkCenterByUser();
  };

  useEffect(() => {
    HomeAction.setDateTimeReducer(dayjs(new Date()).format('YYYY-MM-DD'));
    // try {
    //     messaging().onNotificationOpenedApp(remoteMes => {
    //       console.log('open notifi', JSON.stringify(remoteMes));
    //       navigation.navigate(ScreenBottomTab.NotificationScreen)
    //       // navigation.dispatch(
    //       //   CommonActions.reset({
    //       //       routes: [{ name: 'NotificationScreen' }],
    //       //   })
    //       // );

    //     });
    //   } catch (error) {
    //     console.log(error);
    //   }

    //   void messaging()
    //       .getInitialNotification()
    //       .then(remoteMessage => {
    //         if (remoteMessage) {
    //           console.log('Notification caused app to open from quit state:', remoteMessage);
    //         }
    //       });

    //   const unSub = messaging().onMessage(async (remoteMes: any) => {
    //     //Alert.alert(JSON.stringify(remoteMes));
    //   });
    //   return unSub;
  }, []);

  useEffect(() => {
    if (getDateTimeSelector != '') {
      getDataReportProgress();
    }
  }, [getDateTimeSelector]);

  useEffect(() => {
    setDataPopup();
  }, [dataReportProgress]);

  useEffect(() => {
    if (refreshing == true) {
      clearData();
    }
  }, [refreshing]);

  useEffect(() => {
    if (isFocused == true) {
      getDataDropdownWorkcenter();
      getWorkCenterByUser();
      getDataReportProgress();
    } else {
      clearData();
    }
  }, [isFocused]);

  const deviceWidth = Dimensions.get('screen').width;
  const deviceHeight = Dimensions.get('screen').height;

  return (
    <View style={{flex: 1, backgroundColor: '#F4F4F9'}}>
      <Spinner
        visible={isSpinner}
        // textContent={'login...'}\
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
      <LinearGradientLayout
        colors={['#003350', '#00598C']}
        style={{
          height: 90,
          padding: 10,
          paddingTop: 40,
        }}>
        <MyTitleHome
          navigation={navigation}
          toggleDrawer={() => {
            navigation.toggleDrawer();
          }}
          isShowIconLeft={true}
          component={null}
          title="Trang chủ"
          hidenStatusBar={true}
          isShowIconRight={false}
        />
      </LinearGradientLayout>
      {isShowComponent == true ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {/* Báo cáo theo ngay */}
          <View
            style={{
              marginBottom: 10,
              marginTop: 10,
              backgroundColor: '#FFFFFF',
              padding: 12,
              paddingLeft: 16,
              //flexDirection: 'row'
            }}>
            <Text
              style={{
                fontFamily: 'Mulish-Bold',
                fontSize: 14,
                fontStyle: 'normal',
                fontWeight: '600',
                color: '#003350',
                lineHeight: 16,
                marginBottom: 8,
              }}>
              Báo cáo theo ngày{' '}
            </Text>

            <TouchableOpacity
              style={{
                shadowColor: '#00000',
                shadowOpacity: 0.3,
                elevation: 5,
                borderRadius: 5,
                backgroundColor: '#FFFFFF',
                width: 120,
                marginBottom: 8,
              }}
              onPress={showDatePicker}>
              <View
                style={{
                  padding: 6,
                  display: 'flex',
                }}>
                <Text
                  style={{
                    fontFamily: 'Mulish-Bold',
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#003350',
                    paddingRight: 4,
                  }}>
                  {dayjs(new Date(getDateTimeSelector)).format('DD/MM/YYYY')}
                </Text>
                <Svg
                  style={{position: 'absolute', right: 2, top: 4}}
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none">
                  <Path
                    d="M9.99999 12.2543C9.81933 12.2543 9.66666 12.192 9.54199 12.0673C9.41666 11.9427 9.35399 11.79 9.35399 11.6093C9.35399 11.4287 9.41666 11.2723 9.54199 11.1403C9.66666 11.0083 9.81933 10.9423 9.99999 10.9423C10.1807 10.9423 10.3333 11.0083 10.458 11.1403C10.5833 11.2723 10.646 11.4217 10.646 11.5883C10.646 11.769 10.5833 11.9253 10.458 12.0573C10.3333 12.1887 10.1807 12.2543 9.99999 12.2543ZM6.74999 12.2543C6.56933 12.2543 6.41666 12.192 6.29199 12.0673C6.16666 11.9427 6.10399 11.79 6.10399 11.6093C6.10399 11.4287 6.16666 11.2723 6.29199 11.1403C6.41666 11.0083 6.56933 10.9423 6.74999 10.9423C6.93066 10.9423 7.08333 11.0083 7.20799 11.1403C7.33333 11.2723 7.39599 11.4217 7.39599 11.5883C7.39599 11.769 7.33333 11.9253 7.20799 12.0573C7.08333 12.1887 6.93066 12.2543 6.74999 12.2543ZM13.25 12.2543C13.0693 12.2543 12.9167 12.192 12.792 12.0673C12.6667 11.9427 12.604 11.79 12.604 11.6093C12.604 11.4287 12.6667 11.2723 12.792 11.1403C12.9167 11.0083 13.0693 10.9423 13.25 10.9423C13.4307 10.9423 13.5833 11.0083 13.708 11.1403C13.8333 11.2723 13.896 11.4217 13.896 11.5883C13.896 11.769 13.8333 11.9253 13.708 12.0573C13.5833 12.1887 13.4307 12.2543 13.25 12.2543ZM9.99999 15.1923C9.81933 15.1923 9.66666 15.1297 9.54199 15.0043C9.41666 14.8797 9.35399 14.727 9.35399 14.5463C9.35399 14.3657 9.41666 14.2093 9.54199 14.0773C9.66666 13.946 9.81933 13.8803 9.99999 13.8803C10.1807 13.8803 10.3333 13.946 10.458 14.0773C10.5833 14.2093 10.646 14.3587 10.646 14.5253C10.646 14.706 10.5833 14.8623 10.458 14.9943C10.3333 15.1263 10.1807 15.1923 9.99999 15.1923ZM6.74999 15.1923C6.56933 15.1923 6.41666 15.1297 6.29199 15.0043C6.16666 14.8797 6.10399 14.727 6.10399 14.5463C6.10399 14.3657 6.16666 14.2093 6.29199 14.0773C6.41666 13.946 6.56933 13.8803 6.74999 13.8803C6.93066 13.8803 7.08333 13.946 7.20799 14.0773C7.33333 14.2093 7.39599 14.3587 7.39599 14.5253C7.39599 14.706 7.33333 14.8623 7.20799 14.9943C7.08333 15.1263 6.93066 15.1923 6.74999 15.1923ZM13.25 15.1923C13.0693 15.1923 12.9167 15.1297 12.792 15.0043C12.6667 14.8797 12.604 14.727 12.604 14.5463C12.604 14.3657 12.6667 14.2093 12.792 14.0773C12.9167 13.946 13.0693 13.8803 13.25 13.8803C13.4307 13.8803 13.5833 13.946 13.708 14.0773C13.8333 14.2093 13.896 14.3587 13.896 14.5253C13.896 14.706 13.8333 14.8623 13.708 14.9943C13.5833 15.1263 13.4307 15.1923 13.25 15.1923ZM4.74999 17.7753C4.37533 17.7753 4.05933 17.6437 3.80199 17.3803C3.54533 17.1163 3.41699 16.8037 3.41699 16.4423V5.94233C3.41699 5.581 3.54533 5.26867 3.80199 5.00533C4.05933 4.74133 4.37533 4.60933 4.74999 4.60933H6.58299V2.50433H7.68799V4.60933H12.333V2.50433H13.417V4.60933H15.25C15.6247 4.60933 15.9407 4.74133 16.198 5.00533C16.4547 5.26867 16.583 5.581 16.583 5.94233V16.4423C16.583 16.8037 16.4547 17.1163 16.198 17.3803C15.9407 17.6437 15.6247 17.7753 15.25 17.7753H4.74999ZM4.74999 16.6923H15.25C15.3053 16.6923 15.361 16.6647 15.417 16.6093C15.4723 16.5533 15.5 16.4977 15.5 16.4423V9.44233H4.49999V16.4423C4.49999 16.4977 4.52766 16.5533 4.58299 16.6093C4.63899 16.6647 4.69466 16.6923 4.74999 16.6923Z"
                    fill="#003350"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
            <DateTimePickerModal
              date={new Date(getDateTimeSelector)}
              isVisible={datePickerVisible}
              mode="date"
              maximumDate={new Date()}
              locale={'vi'}
              display="inline"
              confirmTextIOS={'Lưu'}
              cancelTextIOS={'Hủy'}
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
          </View>

          {/* bao cao tien do */}
          {listActionForMenuSelected.findIndex(
            x => x.ActionName == 'bao_cao_tien_do',
          ) != -1 ? (
            <View
              style={{
                marginBottom: 20,
                marginTop: 10,
                backgroundColor: '#FFFFFF',
                padding: 16,
              }}>
              <Text
                style={{
                  fontFamily: 'Mulish-Bold',
                  fontSize: 14,
                  fontStyle: 'normal',
                  fontWeight: '600',
                  color: '#003350',
                  lineHeight: 16,
                  marginBottom: 8,
                }}>
                Báo cáo tiến độ
              </Text>

              <FlatList
                data={dataPopupReport}
                extraData={[...dataReportProgress]}
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index, separators}) =>
                  renderItemReportProgress(item, index)
                }
                keyExtractor={item => item.Workcenterid.toString()}
                horizontal={true}
              />
            </View>
          ) : null}
          {/* báo cáo chênh lệch sản lượng */}
          {listActionForMenuSelected.findIndex(
            x => x.ActionName == 'bao_cao_chenh_lech_san_luong',
          ) != -1 ? (
            <View style={{flex: 4, marginBottom: 10, marginTop: 10}}>
              <View style={{flex: 2, backgroundColor: '#FFFFFF', padding: 16}}>
                <Text
                  style={{
                    color: '#003350',
                    fontWeight: '600',
                    fontSize: 14,
                    fontFamily: 'Mulish-Bold',
                    lineHeight: 16,
                    marginBottom: 12,
                  }}>
                  Báo cáo chênh lệch sản lượng
                </Text>

                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      shadowColor: '#00000',
                      shadowOpacity: 0.3,
                      elevation: 5,
                      borderRadius: 5,
                      backgroundColor: '#FFFFFF',
                      width: 120,
                      height: 35,
                      marginBottom: 8,
                    }}>
                    <View
                      style={{
                        paddingBottom: 8,
                        paddingRight: 4,
                      }}>
                      <SelectBaseWithoutIcon
                        listData={dataDropdownWorkcenter}
                        popupTitle="Tổ sản xuất"
                        styles={{
                          fontFamily: 'Mulish-Bold',
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#003350',
                        }}
                        onSelect={data => {
                          // let error = validateField(data[0], Rules, "Workcenterid", errors);
                          // setErrors([...error]);
                          setRequestData(prevState => ({
                            ...prevState,
                            workCenter: data[0],
                          }));
                          //setErrors([])
                        }}
                        valueArr={[requestData.workCenter]}
                        isSelectSingle={true}
                      />
                    </View>
                    <Svg
                      style={{position: 'absolute', right: 3, top: 10}}
                      width="25"
                      height="25"
                      viewBox="0 0 20 21"
                      fill="none">
                      <Path
                        id="Vector"
                        d="M9.99999 12.9844L5.29199 8.25438L6.06199 7.48438L9.99999 11.4214L13.938 7.48438L14.708 8.25438L9.99999 12.9844Z"
                        fill="#003350"
                      />
                    </Svg>
                  </View>
                </View>

                <QuantityChart workCenter={requestData.workCenter} isRefreshing={refreshing} />
              </View>
            </View>
          ) : null}

          {/* bao cao doanh thu + lao dong + OEE */}

          <View
            style={{
              flex: 4,
              marginBottom: 10,
              marginTop: 10,
              backgroundColor: '#FFFFFF',
            }}>
            <View
              style={{
                flex: 2,
                backgroundColor: '#FFFFFF',
                padding: 16,
                marginBottom: 20,
              }}>
              <FlatList
                data={DATAFILTER}
                renderItem={({item, index, separators}) =>
                  renderfilter(item, index)
                }
                keyExtractor={item => item.Id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              />
              {/* </View> */}

              {/*  báo cao doanh thu */}
              {filterId &&
              filterId == 1 &&
              listActionForMenuSelected.findIndex(
                x => x.ActionName == 'bao_cao_doanh_thu_theo_to',
              ) != -1 ? (
                <>
                  <SaleReport isShow={true} isRefreshing={refreshing} />
                </>
              ) : null}

              {/* bao cao OEE */}
              {filterId &&
              filterId == 2 &&
              listActionForMenuSelected.findIndex(
                x => x.ActionName == 'bao_cao_doanh_thu_khach_hang',
              ) != -1 ? (
                <>
                  <SaleReportByCustomer isShow={true} />
                </>
              ) : null}

              {/* bao cao lao dong */}
              {filterId &&
              filterId == 3 &&
              listActionForMenuSelected.findIndex(
                x => x.ActionName == 'bao_cao_lao_dong',
              ) != -1 ? (
                <>
                  <LaborChart isShow={true} isRefreshing={refreshing} />
                </>
              ) : null}
            </View>
          </View>

          {/* thong tin sx */}
          {/* {
                            listActionForMenuSelected.findIndex(x => x.ActionName == 'thong_tin_san_xuat') != -1 ?
                                <View style={{
                                    marginBottom: 10,
                                    marginTop: 10,
                                    backgroundColor: '#FFFFFF',
                                    padding: 16
                                }}>
                                    <Text style={{
                                        fontFamily: 'Mulish-Bold',
                                        fontSize: 14,
                                        fontStyle: 'normal',
                                        fontWeight: '600',
                                        color: '#003350',
                                        lineHeight: 16,
                                        marginBottom: 8
                                    }}>Thông tin sản xuất </Text>
                                    <View style={{
                                        shadowColor: '#00000',
                                        shadowOpacity: 0.3,
                                        elevation: 5,
                                        borderRadius: 5,
                                        backgroundColor: '#FFFFFF',
                                        width: 180,
                                        height: 35,
                                        marginBottom: 8,
                                    }}
                                    >
                                        <View style={{
                                            paddingBottom: 8,
                                            paddingRight: 4,
                                        }}>
                                            <SelectBaseWithoutIcon
                                                listData={dataDropdownWorkOrderCode}
                                                popupTitle='Lệnh sản xuất'
                                                styles={{
                                                    fontFamily: 'Mulish-Bold',
                                                    fontSize: 12,
                                                    fontWeight: '600',
                                                    color: '#003350',
                                                }}
                                                onSelect={(data) => {
                                                    // let error = validateField(data[0], Rules, "Workcenterid", errors);
                                                    // setErrors([...error]);
                                                    setRequestDataWorkOrder(data[0])
                                                    //setErrors([])
                                                }}
                                                valueArr={[requestDataWorkOrder]}
                                                isSelectSingle={true}
                                            />
                                        </View>
                                        <Svg style={{ position: 'absolute', right: 3, top: 10 }} width="25" height="25" viewBox="0 0 20 21" fill="none" >
                                            <Path id="Vector" d="M9.99999 12.9844L5.29199 8.25438L6.06199 7.48438L9.99999 11.4214L13.938 7.48438L14.708 8.25438L9.99999 12.9844Z" fill="#003350" />
                                        </Svg>
                                    </View>
                                    <ProductionInfo
                                        workOrderCode={requestDataWorkOrder}
                                    />
                                </View>
                                :
                                <View style={[styles.gridThird]}>
                                    <Text style={{
                                        color: '#003350',
                                        fontFamily: 'Mulish-SemiBold',
                                        fontStyle: 'normal',
                                        fontWeight: '600',
                                        fontSize: 16,
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                        paddingTop: 26,
                                        height: 60
                                    }}>
                                        Không có dữ liệu
                                    </Text>
                                </View>
                        } */}

          {/* thong tin lao dong */}
          {listActionForMenuSelected.findIndex(
            x => x.ActionName == 'thong_tin_lao_dong',
          ) != -1 ? (
            <View
              style={{
                marginBottom: 40,
                marginTop: 10,
                backgroundColor: '#FFFFFF',
                padding: 16,
              }}>
              <Text
                style={{
                  fontFamily: 'Mulish-Bold',
                  fontSize: 14,
                  fontStyle: 'normal',
                  fontWeight: '600',
                  color: '#003350',
                  lineHeight: 16,
                  marginBottom: 16,
                }}>
                Thông tin lao động
              </Text>
              <WorkerInfor isShow={true} isRereshing={refreshing} />
            </View>
          ) : (
            <View style={[styles.gridThird]}>
              <Text
                style={{
                  color: '#003350',
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '600',
                  fontSize: 16,
                  alignContent: 'center',
                  justifyContent: 'center',
                  paddingTop: 26,
                  height: 60,
                }}>
                Không có dữ liệu
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={{flex: 1, backgroundColor: '#F4F4F9'}}>
          <View style={[styles.gridThird]}>
            <Text
              style={{
                color: '#003350',
                fontFamily: 'Mulish-SemiBold',
                fontStyle: 'normal',
                fontWeight: '600',
                fontSize: 18,
                alignContent: 'center',
                justifyContent: 'center',
                paddingTop: 26,
                height: 60,
              }}>
              Vin Global
            </Text>
          </View>
        </View>
      )}

      {isOpenModal ? (
        <Modal
          isVisible={isOpenModal}
          //style={{ backgroundColor: '#ffffff', margin: 0 }}
          onBackdropPress={() => onPressCloseModal()}
          statusBarTranslucent={false}
          deviceHeight={deviceHeight}
          deviceWidth={deviceWidth}>
          <InfomationProgressModal
            workCenterName={dataPopupShow[0].Workcentername}
            maincodeproduct={dataPopupShow[0].Maincodeproduct}
            qtyInline={dataPopupShow[0].QtyInline.toString()}
            qtyOutputGarment={dataPopupShow[0].QtyOuputGarment.toString()}
            qtyLaundry={dataPopupShow[0].QtyLaundry.toString()}
            qtyAfterWash={dataPopupShow[0].QtyAfterWash.toString()}
            qtyFinishedWarehouse={dataPopupShow[0].QtyFinishedWarehouse.toString()}
            handleClose={onPressCloseModal}
          />
        </Modal>
      ) : null}
      {/* {
                isOpenDetailChart && filterId == 1 ? (
                    <ModalBase
                        navigation={navigation}
                        isOpenModalProps={isOpenDetailChart}
                        title={'Thông tin chi tiết'}
                        handleSetModal={(isModal: boolean) => { setIsOpenDetailChart(isModal) }}
                        component={(
                            <SaleReportDetail
                            />
                        )}
                    />
                )
                    : null
            }
            {
                isOpenDetailChart && filterId == 2 ? (
                    <ModalBase
                        navigation={navigation}
                        isOpenModalProps={isOpenDetailChart}
                        title={'Thông tin chi tiết'}
                        handleSetModal={(isModal: boolean) => { setIsOpenDetailChart(isModal) }}
                        component={(
                            <LaborReportDetail
                            />
                        )}
                    />
                )
                    : null
            } */}
    </View>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    //flex: 1,
    padding: 10,
    // paddingTop: insets.top,
    // margin: 0,
    // width: '100%',
    // height: '100%'
  },
  // container: { alignItems: 'center', justifyContent: 'center', height: 1050 },
  gauge: {
    position: 'absolute',
    width: 100,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeText: {
    backgroundColor: 'transparent',
    color: '#000',
    fontSize: 24,
  },
  sectionContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: marginVertical,
    marginBottom: marginVertical,
  },
  chart: {
    justifyContent: 'center',
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 8,
    paddingRight: 8,
  },
  gridSecond: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 24,
    paddingRight: 24,
  },
  gridThird: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  paginationLabel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 12,
  },
  content: {
    paddingLeft: 8,
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
    fontWeight: '500',
  },
  labelContent: {
    color: '#454749',
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
    fontWeight: '400',
    width: '70%',
    paddingBottom: 6,
    borderColor: '#D9D9D9',
    borderRightWidth: 1,
  },
  lastLabel: {
    color: '#454749',
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
    fontWeight: '400',
    width: '70%',
    borderColor: '#D9D9D9',
    borderRightWidth: 1,
  },
  text: {
    fontFamily: 'Mulish-Bold',
    fontSize: 12,
    color: '#003350',
    paddingLeft: 8,
  },
  text2: {
    fontFamily: 'Mulish-Bold',
    fontSize: 13,
    color: '#003350',
    paddingLeft: 8,
  },
  label: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  label2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    paddingRight: 15,
  },
  percent: {
    fontSize: 12,
    fontFamily: 'Mulish-Bold',
    paddingLeft: 5,
  },
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  HomeAction: bindActionCreators(HomeAction, dispatch),
  baseAction: bindActionCreators(baseAction, dispatch),
});
const mapStateToProps = createStructuredSelector({
  getDataHomeSelector,
  getStatusSelector,
  getErrorSelector,
  getDateTimeSelector,
  listActionForMenuSelected,
});
export default connect(mapStateToProps, mapDispatchToProps)(Home);
