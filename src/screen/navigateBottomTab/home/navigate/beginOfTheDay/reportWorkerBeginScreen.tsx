import { DrawerActions, NavigationProp, useIsFocused } from '@react-navigation/native';
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';

import Svg, { Path } from 'react-native-svg';
import { connect } from 'react-redux';
import { Action, AnyAction, Dispatch, bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import baseAction from '../../../../base/saga/action';
import { NavigateHome } from '../../../../share/app/constants/homeConst';
import { ApiCommon, ApiWorkerBegin, ResponseService } from '../../../../share/app/constantsApi';
import { Regex } from '../../../../share/app/regex';
import ModalBase from '../../../../share/base/component/modal/modalBase';
import SelectBaseVer2 from '../../../../share/base/component/selectBase/selectBaseVer2';
import { IError, IRule, typeVadilate, validateField, validateForm } from '../../../../share/commonVadilate/validate';
import CommonBase from '../../../../share/network/axios';
import RecordSupportDateWorkerScreen from '../endOfTheDay/component/modalScreen/recordSupportDateWorker';
import { ISupportWorker, IWorkerSupportOther } from '../endOfTheDay/types/recordWorkerDataTypes';
import { TypeWorkcenterMobile, WorkByTypeEnumMobile } from '../productionRecord/types/enum/productionRecord';
import MyTitleHome from './../../../../../../src/screen/share/base/component/myStatusBar/MyTitleHome';
import AbsenseWorkerModal from './component/modalScreen/absenseWorkerModal';
import SupportToAnotherWorkCenterModal from './component/modalScreen/supportToAnotherWorkCenterModal';
import { IWorker } from './types/reportWorkerTypes';
import LinearGradient from 'react-native-linear-gradient';
import { HeightNavigatorBottom } from './../../../../share/app/constants/constansHeightApp';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Rules: IRule[] = [
  {
    field: 'Workcenterid',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Tổ sản xuất không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: ''
    }
  },
  {
    field: 'Productivitylabor',
    required: true,
    maxLength: 100,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_Decimal_v2,
    maxValue: 0,
    messages: {
      required: 'Năng suất không được bỏ trống',
      minLength: '',
      maxLength: 'Số năng suất không được vượt quá 100 ký tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: ''
    }
  },
  {
    field: 'Eatinglabor',
    required: true,
    maxLength: 100,
    minLength: 0,
    typeValidate: typeVadilate.Number,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: 'Báo ăn không được bỏ trống',
      minLength: '',
      maxLength: 'Số báo ăn không được vượt quá 100 ký tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    }
  },
  {
    field: 'Eatinglaborsupport',
    required: false,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.Number,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: 'Báo ăn BS/HT không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ'

    }
  },
  {
    field: 'Notelaborsupport',
    required: false,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: '',
    maxValue: 0,
    messages: {
      required: 'Vui lòng nhập ghi chú',
      minLength: '',
      maxLength: 'Ghi chú không được vượt quá 255 kí tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: '',
    }
  },
  {
    field: 'Studentlabor',
    required: false,
    maxLength: 100,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: '',
      minLength: '',
      maxLength: 'Học sinh không được vượt quá 100 ký tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: ''
    }
  },
  {
    field: 'Seasonallabor',
    required: false,
    maxLength: 255,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: '',
      minLength: '',
      maxLength: '',
      validate: 'Giá trị không hợp lệ',
      maxValue: ''
    }
  },
]

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;
const window = Dimensions.get('window');
const widthNew = window.width * window.scale;
const heightNew = window.height * window.scale;

interface IWorkCenterLabor {
  Workcenterid: string | '',
  Date: string | '',
  Totallabor: string | '',
  Seasonallabor: string | '',
  Studentlabor: string | '',
  Eatinglabor: string | '',
  Eatinglaborsupport: string | '',
  Notelaborsupport: string | '',
  Productivitylabor: string | '',
  ListWorker: IWorker[],
  ListWorkerSupport: ISupportWorker[],
  ListWorkerSupportOther: IWorkerSupportOther[]
}

interface IDropdownWorkCenter {
  id: string | '',
  name: string | '',
  code: string | null
}

export interface ReportWorkerProps {
  navigation: NavigationProp<any, any>,
  baseAction: typeof baseAction,
}

let localTime = new Date();
let date = dayjs(localTime).format('YYYY-MM-DD');

const ReportWorkerBeginScreen: React.FC<ReportWorkerProps> = ({ navigation, baseAction }) => {
  const isFocused = useIsFocused();

  const [errors, setErrors] = useState<IError[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false)
    }, 2000);
  }, []);

  // datapage
  const [reportWorkerBeginPage, setReportWorkerBeginPage] = useState<IWorkCenterLabor>({
    Workcenterid: '',
    Date: date,
    Eatinglabor: '',
    Productivitylabor: '',
    Seasonallabor: '',
    Studentlabor: '',
    Eatinglaborsupport: '',
    Notelaborsupport: '',
    Totallabor: '',
    ListWorker: [],
    ListWorkerSupport: [],
    ListWorkerSupportOther: []
  });
  const [dropdownWorkCenter, setDropdownWorkCenter] = useState<IDropdownWorkCenter[]>([]);
  const [isOpen, setOpen] = useState<boolean>(false);
  const [isSupportOpen, setSupportOpen] = useState<boolean>(false);
  const [isSupportAnotherOpen, setSupportAnotherOpen] = useState<boolean>(false);
  //lấy data workCenter theo phân quyền user
  const getWorkCenterDefault = async () => {
    let dataWorkCenterLabor = await CommonBase.getAsync<ResponseService>(ApiWorkerBegin.GET_INFO_WORKCENTER_BY_USERID, null);

    if (typeof dataWorkCenterLabor !== 'string' && dataWorkCenterLabor != null && dataWorkCenterLabor.isSuccess === true) {
      let data = {
        DataRes: dataWorkCenterLabor.data
      }
      setReportWorkerBeginPage(prevState => ({
        ...prevState,
        Workcenterid: data.DataRes,
      }))
      getDataByWorkCenterId(data.DataRes)
    }
  }

  const getDataDropdownWorkcenter = async () => {
    baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' })
    let dataDropdown = await CommonBase.getAsync<ResponseService>(ApiCommon.GET_API_COMMON + '?type=' + WorkByTypeEnumMobile.WorkCenter + '&typeWorkcenter=' + TypeWorkcenterMobile.May, null);
    if (typeof dataDropdown !== 'string' && dataDropdown != null && dataDropdown.isSuccess === true) {
      let data = {
        list: dataDropdown.data
      }
      setDropdownWorkCenter(data.list)
    }
    baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' })
  }

  const getDataByWorkCenterId = async (value: string) => {
    baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' })
    let dataResponse = await CommonBase.getAsync<ResponseService>(ApiWorkerBegin.GET_INFO_WORKCENTER_BY_WORKCENTER_ID + '/' + value + '/' + date, null);
    if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
      let data = {
        Workcenterid: dataResponse.data.Workcenterid,
        Date: dataResponse.data.Date,
        Totallabor: dataResponse.data.Totallabor,
        Seasonallabor: dataResponse.data.Seasonallabor,
        Studentlabor: dataResponse.data.Studentlabor,
        Eatinglabor: dataResponse.data.Eatinglabor,
        Productivitylabor: dataResponse.data.Productivitylabor,
        ListWorker: dataResponse.data.ListWorker,
        ListWorkerSupport: dataResponse.data.ListWorkerSupport,
        Eatinglaborsupport: dataResponse.data.Eatinglaborsupport,
        Notelaborsupport: dataResponse.data.Notelaborsupport,
        ListWorkerSupportOther: dataResponse.data.ListWorkerSupportOther
      }
      setReportWorkerBeginPage({ ...data })
      setErrors([]);
    }
    baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' })
  }

  const handleChangeInput = (e: any, fieldName: string) => {
    let value = e.nativeEvent.text;
    let inputValue = value.replace(",", ".")
    let error = validateField(value, Rules, fieldName, errors)
    setErrors([...error])
    setReportWorkerBeginPage(prevState => ({ ...prevState, [fieldName]: inputValue }))

  }

  const onPressHandleClose = () => {
    setReportWorkerBeginPage({
      Date: date,
      Eatinglabor: '',
      Productivitylabor: '',
      Seasonallabor: '',
      Studentlabor: '',
      Totallabor: '',
      Eatinglaborsupport: '',
      Notelaborsupport: '',
      Workcenterid: '',
      ListWorker: [],
      ListWorkerSupport: [],
      ListWorkerSupportOther: []
    })
    navigation.navigate(NavigateHome.HomePageScreen);
  }

  const onPressHandleSubmit = async () => {
    let listError = validateForm(reportWorkerBeginPage, Rules, errors);
    if (listError && listError.length > 0) {
      setErrors(listError);
      return;
    }
    let dataRequest = reportWorkerBeginPage;
    baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
    let dataSave = await CommonBase.postAsync<ResponseService>(ApiWorkerBegin.CREATE_REPORT_LINE_LABOR_IN_DAY, dataRequest);
    if (typeof dataSave !== 'string' && dataSave != null && dataSave.isSuccess === true) {

      let msg = 'Gửi báo cáo thành công'
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT)
      } else {
        Alert.alert(msg)
      }
    }
    baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
  }

  const handleOnPress = () => {
    if (reportWorkerBeginPage.Workcenterid == null || reportWorkerBeginPage.Workcenterid == '') {

      let msg = 'Vui lòng chọn tổ sản xuất'
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT)
        setOpen(false)
        return;
      } else {
        Alert.alert(msg)
        setOpen(false)
        return;
      }
    }
    setOpen(true)
  }

  const handleOnPressSupport = () => {

    if (reportWorkerBeginPage.Workcenterid == null || reportWorkerBeginPage.Workcenterid == '') {

      let msg = 'Vui lòng chọn tổ sản xuất'
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT)
        setSupportOpen(false)
        return;
      } else {
        Alert.alert(msg)
        setSupportOpen(false)
        return;
      }
    }
    setSupportOpen(true);
  }

  const handleOnPressAnotherSupport = () => {
    if (reportWorkerBeginPage.Workcenterid == null || reportWorkerBeginPage.Workcenterid == '') {

      let msg = 'Vui lòng chọn tổ sản xuất'
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT)
        setSupportAnotherOpen(false)
        return;
      } else {
        Alert.alert(msg)
        setSupportAnotherOpen(false)
        return;
      }
    }
    setSupportAnotherOpen(true);
  }

  useEffect(() => {
    return () => {
      let dataNew: IWorkCenterLabor = {
        Date: '',
        Eatinglabor: '',
        Productivitylabor: '',
        Seasonallabor: '',
        Studentlabor: '',
        Totallabor: '',
        Workcenterid: '',
        Eatinglaborsupport: '',
        Notelaborsupport: '',
        ListWorker: [],
        ListWorkerSupport: [],
        ListWorkerSupportOther: []
      }
      setReportWorkerBeginPage({ ...dataNew })
      setErrors([]);
    }
  }, [])

  useEffect(() => {
    if (refreshing == true) {
      getDataDropdownWorkcenter()
      //getWorkCenterDefault()
      let dataNew: IWorkCenterLabor = {
        Date: '',
        Eatinglabor: '',
        Productivitylabor: '',
        Seasonallabor: '',
        Studentlabor: '',
        Totallabor: '',
        Eatinglaborsupport: '',
        Notelaborsupport: '',
        Workcenterid: '',
        ListWorker: [],
        ListWorkerSupport: [],
        ListWorkerSupportOther: []
      }
      setReportWorkerBeginPage({ ...dataNew });
      setErrors([]);
      setDropdownWorkCenter([]);
    }
  }, [refreshing])


  useEffect(() => {
    // Call only when screen open or when back on screen 
    if (isFocused == true) {
      getDataDropdownWorkcenter()
      //getWorkCenterDefault()
    } else {
      let dataNew: IWorkCenterLabor = {
        Date: '',
        Eatinglabor: '',
        Productivitylabor: '',
        Seasonallabor: '',
        Studentlabor: '',
        Totallabor: '',
        Eatinglaborsupport: '',
        Notelaborsupport: '',
        Workcenterid: '',
        ListWorker: [],
        ListWorkerSupport: [],
        ListWorkerSupportOther: []
      }
      setReportWorkerBeginPage({ ...dataNew });
      setErrors([]);
      setDropdownWorkCenter([]);

    }
  }, [isFocused]);

  const insets = useSafeAreaInsets();
  const STATUSBAR_HEIGHT = StatusBar.currentHeight ?? 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        // start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
        colors={['#003350', '#00598C']} style={{
          height: 90, padding: 10,
          paddingTop: 40
        }}>


        <MyTitleHome
          navigation={navigation}
          toggleDrawer={() => {
            navigation.dispatch(DrawerActions.toggleDrawer());
          }}
          isShowIconLeft={true}
          component={null}
          title="Báo công lao động"
          hidenStatusBar={true}
          isShowIconRight={true}

        />
      </LinearGradient>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={{
          // height: deviceHeight - styles.header.height - 280 ,
          marginBottom: styles.submit.height + HeightNavigatorBottom.Height
        }}>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Báo cáo ngày:</Text>
              </View>
              <View style={{ width: deviceWidth - 120 - 20 }}>
                <TextInput
                  defaultValue={dayjs(new Date(date)).format('DD/MM/YYYY')}
                  placeholder='Vui lòng nhập số lượng'
                  placeholderTextColor={'#AAABAE'}
                  style={{ ...styles.inputBox2 }}
                  editable={false}
                />
                <Svg style={{ position: 'absolute', zIndex: -1, right: 10, top: 10 }} width="20" height="21" viewBox="0 0 20 21" fill="none">
                  <Path d="M9.99999 12.2543C9.81933 12.2543 9.66666 12.192 9.54199 12.0673C9.41666 11.9427 9.35399 11.79 9.35399 11.6093C9.35399 11.4287 9.41666 11.2723 9.54199 11.1403C9.66666 11.0083 9.81933 10.9423 9.99999 10.9423C10.1807 10.9423 10.3333 11.0083 10.458 11.1403C10.5833 11.2723 10.646 11.4217 10.646 11.5883C10.646 11.769 10.5833 11.9253 10.458 12.0573C10.3333 12.1887 10.1807 12.2543 9.99999 12.2543ZM6.74999 12.2543C6.56933 12.2543 6.41666 12.192 6.29199 12.0673C6.16666 11.9427 6.10399 11.79 6.10399 11.6093C6.10399 11.4287 6.16666 11.2723 6.29199 11.1403C6.41666 11.0083 6.56933 10.9423 6.74999 10.9423C6.93066 10.9423 7.08333 11.0083 7.20799 11.1403C7.33333 11.2723 7.39599 11.4217 7.39599 11.5883C7.39599 11.769 7.33333 11.9253 7.20799 12.0573C7.08333 12.1887 6.93066 12.2543 6.74999 12.2543ZM13.25 12.2543C13.0693 12.2543 12.9167 12.192 12.792 12.0673C12.6667 11.9427 12.604 11.79 12.604 11.6093C12.604 11.4287 12.6667 11.2723 12.792 11.1403C12.9167 11.0083 13.0693 10.9423 13.25 10.9423C13.4307 10.9423 13.5833 11.0083 13.708 11.1403C13.8333 11.2723 13.896 11.4217 13.896 11.5883C13.896 11.769 13.8333 11.9253 13.708 12.0573C13.5833 12.1887 13.4307 12.2543 13.25 12.2543ZM9.99999 15.1923C9.81933 15.1923 9.66666 15.1297 9.54199 15.0043C9.41666 14.8797 9.35399 14.727 9.35399 14.5463C9.35399 14.3657 9.41666 14.2093 9.54199 14.0773C9.66666 13.946 9.81933 13.8803 9.99999 13.8803C10.1807 13.8803 10.3333 13.946 10.458 14.0773C10.5833 14.2093 10.646 14.3587 10.646 14.5253C10.646 14.706 10.5833 14.8623 10.458 14.9943C10.3333 15.1263 10.1807 15.1923 9.99999 15.1923ZM6.74999 15.1923C6.56933 15.1923 6.41666 15.1297 6.29199 15.0043C6.16666 14.8797 6.10399 14.727 6.10399 14.5463C6.10399 14.3657 6.16666 14.2093 6.29199 14.0773C6.41666 13.946 6.56933 13.8803 6.74999 13.8803C6.93066 13.8803 7.08333 13.946 7.20799 14.0773C7.33333 14.2093 7.39599 14.3587 7.39599 14.5253C7.39599 14.706 7.33333 14.8623 7.20799 14.9943C7.08333 15.1263 6.93066 15.1923 6.74999 15.1923ZM13.25 15.1923C13.0693 15.1923 12.9167 15.1297 12.792 15.0043C12.6667 14.8797 12.604 14.727 12.604 14.5463C12.604 14.3657 12.6667 14.2093 12.792 14.0773C12.9167 13.946 13.0693 13.8803 13.25 13.8803C13.4307 13.8803 13.5833 13.946 13.708 14.0773C13.8333 14.2093 13.896 14.3587 13.896 14.5253C13.896 14.706 13.8333 14.8623 13.708 14.9943C13.5833 15.1263 13.4307 15.1923 13.25 15.1923ZM4.74999 17.7753C4.37533 17.7753 4.05933 17.6437 3.80199 17.3803C3.54533 17.1163 3.41699 16.8037 3.41699 16.4423V5.94233C3.41699 5.581 3.54533 5.26867 3.80199 5.00533C4.05933 4.74133 4.37533 4.60933 4.74999 4.60933H6.58299V2.50433H7.68799V4.60933H12.333V2.50433H13.417V4.60933H15.25C15.6247 4.60933 15.9407 4.74133 16.198 5.00533C16.4547 5.26867 16.583 5.581 16.583 5.94233V16.4423C16.583 16.8037 16.4547 17.1163 16.198 17.3803C15.9407 17.6437 15.6247 17.7753 15.25 17.7753H4.74999ZM4.74999 16.6923H15.25C15.3053 16.6923 15.361 16.6647 15.417 16.6093C15.4723 16.5533 15.5 16.4977 15.5 16.4423V9.44233H4.49999V16.4423C4.49999 16.4977 4.52766 16.5533 4.58299 16.6093C4.63899 16.6647 4.69466 16.6923 4.74999 16.6923Z" fill="#003350" />
                </Svg>
                {
                  errors && errors.length > 0
                    ?
                    (errors.map((item, j) => {
                      if (item.fieldName == 'Date') {
                        return (
                          <Text key={j} style={{ color: 'red', paddingLeft: 35, margin: 0 }}>{item.mes}</Text>
                        )
                      }
                    }))
                    :
                    null
                }
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Tổ sản xuất:
                </Text>
              </View>
              <View style={{ width: deviceWidth - 120 - 20 }}>
                <SelectBaseVer2
                  listData={dropdownWorkCenter}
                  popupTitle='Tổ sản xuất'
                  title='Chọn tổ sản xuất'
                  onSelect={(data) => {
                    let error = validateField(data[0], Rules, "Workcenterid", errors);
                    setErrors([...error])
                    setReportWorkerBeginPage((stateOld) => ({
                      ...stateOld,
                      Workcenterid: data[0],
                    }))
                    setErrors([]);
                    getDataByWorkCenterId(data[0])
                  }}
                  styles={styles.inputBox}
                  stylesIcon={{ position: 'absolute', zIndex: -1, right: 10, top: 15 }}
                  valueArr={[reportWorkerBeginPage.Workcenterid]}
                  isSelectSingle={true}
                />

                {
                  errors && errors.length > 0
                    ?
                    (errors.map((item, j) => {
                      if (item.fieldName == 'Workcenterid') {
                        return (
                          <Text key={j} style={{ color: 'red', paddingLeft: 35, margin: 0 }}>{item.mes}</Text>
                        )
                      }
                    }))
                    :
                    null
                }
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Tổng lao động định biên:</Text>
              </View>
              <View style={{ width: deviceWidth - 120 - 20 }}>
                <TextInput
                  defaultValue={reportWorkerBeginPage.Totallabor?.toString()}
                  placeholderTextColor='#AAABAE'
                  style={{ ...styles.disableInputBox }}
                  editable={false}
                />
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Học sinh đào tạo:</Text>
              </View>
              <View style={{ width: deviceWidth - 120 - 20 }}>
                <TextInput
                  value={reportWorkerBeginPage.Studentlabor?.toString()}
                  placeholder='Vui lòng nhập số lượng'
                  placeholderTextColor='#AAABAE'
                  style={styles.inputBox}
                  keyboardType='numeric'
                  onChange={(e) => {
                    handleChangeInput(e, 'Studentlabor')
                  }}
                />
                {
                  errors && errors.length > 0
                    ?
                    (errors.map((item, j) => {
                      if (item.fieldName == 'Studentlabor') {
                        return (
                          <Text key={j} style={{ color: 'red', paddingLeft: 35, margin: 0, fontSize: 11 }}>{item.mes}</Text>
                        )
                      }
                    }))
                    :
                    null
                }
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Thời vụ:</Text>
              </View>
              <View style={{ width: deviceWidth - 120 - 20 }}>
                <TextInput
                  value={reportWorkerBeginPage.Seasonallabor?.toString()}
                  placeholder='Vui lòng nhập số lượng'
                  placeholderTextColor='#AAABAE'
                  style={styles.inputBox}
                  keyboardType='numeric'
                  onChange={(e) => {
                    handleChangeInput(e, 'Seasonallabor')
                  }}
                />
                {
                  errors && errors.length > 0
                    ?
                    (errors.map((item, j) => {
                      if (item.fieldName == 'Seasonallabor') {
                        return (
                          <Text key={j} style={{ color: 'red', paddingLeft: 35, margin: 0 }}>{item.mes}</Text>
                        )
                      }
                    }))
                    :
                    null
                }
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Lao động tính năng suất:
                </Text>
              </View>
              <View style={{ width: deviceWidth - 120 - 20 }}>
                <TextInput
                  keyboardType='numeric'
                  placeholder='Vui lòng nhập số lượng'
                  maxLength={5}
                  placeholderTextColor='#AAABAE'
                  onChange={(e) => {
                    handleChangeInput(e, 'Productivitylabor')
                  }}
                  value={reportWorkerBeginPage.Productivitylabor?.toString()}
                  style={styles.inputBox}
                />
                {
                  errors && errors.length > 0
                    ?
                    (errors.map((item, j) => {
                      if (item.fieldName == 'Productivitylabor') {
                        return (
                          <Text key={j} style={{ color: 'red', paddingLeft: 35, margin: 0 }}>{item.mes}</Text>
                        )
                      }
                    }))
                    :
                    null
                }
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Báo ăn:
                </Text>
              </View>
              <View style={{ width: deviceWidth - 120 - 20 }}>
                <TextInput
                  placeholder='Vui lòng nhập số lượng'
                  placeholderTextColor='#AAABAE'
                  onChange={(e) => {
                    handleChangeInput(e, 'Eatinglabor')
                  }}
                  value={reportWorkerBeginPage.Eatinglabor?.toString()}
                  style={styles.inputBox}
                  keyboardType='numeric'

                />
                {
                  errors && errors.length > 0
                    ?
                    (errors.map((item, j) => {
                      if (item.fieldName == 'Eatinglabor') {
                        return (
                          <Text key={j} style={{ color: 'red', paddingLeft: 35, margin: 0 }}>{item.mes}</Text>
                        )
                      }
                    }))
                    :
                    null
                }
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Báo ăn BS/HT:</Text>
              </View>
              <View style={{ width: deviceWidth - 120 - 20 }}>
                <TextInput
                  placeholder='Vui lòng nhập số lượng'
                  placeholderTextColor='#AAABAE'
                  onChange={(e) => {
                    handleChangeInput(e, 'Eatinglaborsupport')
                  }}
                  value={reportWorkerBeginPage.Eatinglaborsupport?.toString()}
                  style={styles.inputBox}
                  keyboardType='numeric'

                />
                {
                  errors && errors.length > 0
                    ?
                    (errors.map((item, j) => {
                      if (item.fieldName == 'Eatinglaborsupport') {
                        return (
                          <Text key={j} style={{ color: 'red', paddingLeft: 35, margin: 0 }}>{item.mes}</Text>
                        )
                      }
                    }))
                    :
                    null
                }
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Ghi chú:</Text>
              </View>
              <View style={{ width: deviceWidth - 120 - 20 }}>
                <TextInput
                  placeholder='Nhập ghi chú ...'
                  placeholderTextColor='#AAABAE'
                  onChange={(e) => {
                    handleChangeInput(e, 'Notelaborsupport')
                  }}
                  value={reportWorkerBeginPage.Notelaborsupport?.toString()}
                  style={styles.inputBox}
                />
                {
                  errors && errors.length > 0
                    ?
                    (errors.map((item, j) => {
                      if (item.fieldName == 'Notelaborsupport') {
                        return (
                          <Text key={j} style={{ color: 'red', paddingLeft: 35, margin: 0 }}>{item.mes}</Text>
                        )
                      }
                    }))
                    :
                    null
                }
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Công nhân nghỉ:</Text>
              </View>
              <View style={{ width: deviceWidth - 260, }}>
                <TextInput
                  defaultValue={reportWorkerBeginPage?.ListWorker?.length ? reportWorkerBeginPage?.ListWorker?.length + '' : '0'}
                  placeholder='Không có dữ liệu'
                  placeholderTextColor='#AAABAE'
                  style={{ ...styles.inputBox2 }}
                  editable={false}
                  keyboardType='numeric'
                />
              </View>
              <TouchableOpacity onPress={handleOnPress}>
                <Text style={{ color: '#006496', textDecorationLine: 'underline', fontFamily: 'Mulish-SemiBold', fontSize: 13 }}>Báo công nhân nghỉ</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Công nhân hỗ trợ:</Text>
              </View>
              <View style={{ width: deviceWidth - 270, }}>
                <TextInput
                  defaultValue={reportWorkerBeginPage?.ListWorkerSupport?.length ? reportWorkerBeginPage?.ListWorkerSupport?.length + '' : '0'}
                  placeholder='Vui lòng nhập số lượng'
                  placeholderTextColor='#AAABAE'
                  style={{ ...styles.inputBox2 }}
                  editable={false}
                  keyboardType='numeric'
                />
              </View>
              <TouchableOpacity onPress={handleOnPressSupport}>
                <Text style={{ color: '#006496', textDecorationLine: 'underline', fontFamily: 'Mulish-SemiBold', fontSize: 13 }}>Báo công nhân hỗ trợ</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120 }}>
                <Text style={styles.label}>Công nhân đi hỗ trợ:</Text>
              </View>
              <View style={{ width: deviceWidth - 285, }}>
                <TextInput
                  defaultValue={reportWorkerBeginPage?.ListWorkerSupportOther?.length ? reportWorkerBeginPage?.ListWorkerSupportOther?.length + '' : '0'}
                  placeholder='Vui lòng nhập số lượng'
                  placeholderTextColor='#AAABAE'
                  style={{ ...styles.inputBox2 }}
                  editable={false}
                  keyboardType='numeric'
                />
              </View>
              <TouchableOpacity onPress={handleOnPressAnotherSupport}>
                <Text style={{ color: '#006496', textDecorationLine: 'underline', fontFamily: 'Mulish-SemiBold', fontSize: 13 }}>Báo công nhân đi hỗ trợ</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      <View style={styles.submit}>
        <View style={{ height: 40, width: '30%', paddingRight: 20 }}>
          <TouchableOpacity style={styles.exitButton} onPress={onPressHandleClose} >
            <View>
              <Text style={{ color: '#006496', fontFamily: 'Mulish-SemiBold' }}>Hủy </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40, width: '30%' }}>
          <TouchableOpacity style={styles.submitButton} onPress={onPressHandleSubmit}>
            <View>
              <Text style={{ color: '#ffffff', fontFamily: 'Mulish-SemiBold' }}>Gửi báo cáo</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {
        isOpen == true ?
          <ModalBase
            navigation={navigation}
            isOpenModalProps={isOpen}
            title={'Báo công nhân nghỉ'}
            handleSetModal={(isModal: boolean) => { setOpen(isModal) }}
            component={(
              <AbsenseWorkerModal
                workcenterid={reportWorkerBeginPage.Workcenterid}
                listAbsenseWorkerProps={reportWorkerBeginPage.ListWorker}
                navigation={navigation}
                handleCancel={() => { setOpen(false) }}
                handleSubmit={(listWorker: IWorker[]) => {
                  setReportWorkerBeginPage(prevState => ({ ...prevState, ListWorker: listWorker }))
                  setOpen(false)
                }}
              />
            )}
          />
          : null
      }
      {
        isSupportOpen == true ?
          <ModalBase
            navigation={navigation}
            isOpenModalProps={isSupportOpen}
            title={'Báo công nhân hỗ trợ'}
            handleSetModal={(isModal: boolean) => { setSupportOpen(isModal) }}
            component={(
              <RecordSupportDateWorkerScreen
                workcenterid={reportWorkerBeginPage.Workcenterid}
                listSupportWorkerProps={reportWorkerBeginPage.ListWorkerSupport}
                navigation={navigation}
                handleCancel={() => { setSupportOpen(false) }}
                handleSubmit={(ListWorkerSupport: ISupportWorker[]) => {
                  setReportWorkerBeginPage(prevState => ({ ...prevState, ListWorkerSupport: ListWorkerSupport }))
                  setSupportOpen(false)
                }}
              />
            )}
          />
          : null
      }
      {
        isSupportAnotherOpen == true ?
          <ModalBase
            navigation={navigation}
            isOpenModalProps={isSupportAnotherOpen}
            title={'Báo công nhân đi hỗ trợ'}
            handleSetModal={(isModal: boolean) => { setSupportAnotherOpen(isModal) }}
            component={(
              <SupportToAnotherWorkCenterModal
                workcenterid={reportWorkerBeginPage.Workcenterid}
                listSupportOtherWorkerProps={reportWorkerBeginPage.ListWorkerSupportOther}
                navigation={navigation}
                handleCancel={() => { setSupportAnotherOpen(false) }}
                handleSubmit={(ListWorkerSupport: IWorkerSupportOther[]) => {
                  setReportWorkerBeginPage(prevState => ({ ...prevState, ListWorkerSupportOther: ListWorkerSupport }))
                  setSupportAnotherOpen(false)
                }}
              />
            )}
          />
          : null
      }

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F4F4F9',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    flexDirection: 'column'
  },
  content: {
    // height: deviceHeight - 5,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },
  submit: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 100,
    shadowColor: '#00000',
    shadowOpacity: 0.4,
    elevation: 8,
    backgroundColor: '#ffffff',
    paddingRight: 10,
    paddingBottom: 10,
    position: 'absolute',
    bottom: 0

  },
  textInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingVertical: 8,

  },
  textHeaderLabel: {
    fontWeight: '700',
    fontSize: 16,
    //fontFamily: 'Mulish-SemiBold',
    lineHeight: 20,
    color: '#001E31'
  },
  label: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
    color: '#1B3A4ECC',
    paddingBottom: 2,
    fontFamily: 'Mulish-SemiBold'

  },
  disableInputBox: {
    width: '100%',
    height: 40,
    paddingLeft: 35,
    color: '#1B3A4ECC',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold'
  },
  inputBox: {
    width: '100%',
    height: 40,
    paddingLeft: 35,
    color: '#001E31',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold'
  },
  inputBox2: {
    width: '100%',
    height: 40,
    paddingLeft: 35,
    color: '#001E31',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold'
  },
  dropdownBox: {
    width: '100%',
    color: '#001E31',
    fontSize: 12,
    backgroundColor: '#fffffff',
    justifyContent: 'flex-start',
    paddingLeft: 150
  },
  labelField: {
    width: '40%',
    height: '50%',
    color: '#001E31',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#004B72',
    height: 35,
    justifyContent: 'center'
  },
  exitButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 35,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#137DB9'
  },
})
const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  //reportWorkerBeginAction: bindActionCreators(reportWorkerBeginAction, dispatch),
  baseAction: bindActionCreators(baseAction, dispatch),
})
const mapStateToProps = createStructuredSelector({
  // reportWorkerPage
})


export default connect(
  null,
  mapDispatchToProps
)(ReportWorkerBeginScreen);

