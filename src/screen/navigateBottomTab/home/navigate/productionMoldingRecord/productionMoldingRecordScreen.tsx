import {
  DrawerActions,
  NavigationProp,
  useIsFocused,
} from '@react-navigation/native';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import baseAction from '../../../../base/saga/action';
import MyTitleHome from '../../../../share/base/component/myStatusBar/MyTitleHome';
import { IError } from '../../../../share/commonVadilate/validate';
import { IDropdown, ITimeSlot } from '../productionRecord/types/types';
import Svg, { Path } from 'react-native-svg';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import SelectBaseVer2 from '../../../../share/base/component/selectBase/selectBaseVer2';
import ModalBase from '../../../../share/base/component/modal/modalBase';
import AddErrorMoldingModal from './component/addErrorModal';
import AddLostTimeMoldingModal from './component/addLostTimeModal';
import { IListErr, IProductionMolding } from './types/types';
import CommonBase from '../../../../share/network/axios';
import {
  ApiCommon,
  ApiMoldingRecord,
  ResponseService,
} from '../../../../share/app/constantsApi';
import {
  TypeWorkcenterMobile,
  WorkByTypeEnumMobile,
} from '../productionRecord/types/enum/productionRecord';
import { Action, AnyAction, Dispatch, bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

interface MoldingRecordProps {
  navigation: NavigationProp<any, any>;
  baseAction: typeof baseAction;
}

const ProductionMoldingRecordScreen: React.FC<MoldingRecordProps> = ({
  navigation,
  baseAction,
}) => {
  let localTime = new Date();
  let date = moment(localTime).format('DD/MM/YYYY');

  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const [timeSlot, setTimeSlot] = useState<ITimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [errors, setErrors] = useState<IError[]>([]);
  const [isDayBefore, setIsDayBefore] = useState<boolean>(false);
  const [isInProgress, setIsInProgress] = useState<boolean>(false);
  const [isShowButton, setIsShowButton] = useState<boolean>(true);
  const [isOpenModalAddErr, setIsOpenModalAddErr] = useState<boolean>(false);
  const [isOpenModalAddLostTime, setIsOpenModalAddLostTime] =
    useState<boolean>(false);

  const [dataDropdownWorkCenter, setDataDropdownWorkCenter] = useState<
    IDropdown[]
  >([]);
  const [dataDropdownMaterial, setDataDropdownMaterial] = useState<IDropdown[]>(
    [],
  );
  const [dataDropdownWorkOrder, setDataDropdownWorkOrder] = useState<
    IDropdown[]
  >([]);
  const [timeSlotName, setTimeSlotName] = useState('');
  const [listErrCount, setListErrCount] = useState(0)
  const [dataPageRecordInput, setDataPageRecordInput] =
    useState<IProductionMolding>({
      daterecord: date,
      workcenterid: '',
      workordercode: '',
      timeslotcode: '',
      materialcode: '',
      qtyDone: 0,
      qtyExample: 0,
      qtyDay: 0,
      qtyDayDone: 0,
      qtyDayError: 0,
      qtyError: listErrCount,
      lostTime: 0,
      listError: [
        {
          errorId: '',
          qtyError: 0,
        },
      ],
      listLostTime: [
        {
          lostId: '',
          listError: [],
          qtyLostTime: 0,
        },
      ],
    });

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirmDate = (datePickerChoose: Date) => {
    //let error = validateField(datePickerChoose, Rules, 'DateRecord', errors);
    let dateRecord = moment(datePickerChoose).format('DD/MM/YYYY');
    let now = moment(new Date()).format('YYYY-MM-DD');
    if (
      moment(dateRecord, ['DD/MM/YYYY', 'YYYY-MM-DD']).isSameOrAfter(
        now,
        'day',
      ) == false
      // && isOnCloud == true
    ) {
      setIsDayBefore(true);
    } else {
      setIsDayBefore(false);
    }
    setDataPageRecordInput(prevState => ({
      ...prevState,
      daterecord: moment(datePickerChoose).format('DD/MM/YYYY'),
      workcenterid: '',
      workordercode: '',
      materialcode: '',
      timeslotcode: '',
      qtyDone: 0,
      qtyExample: 0,
      listError: [
        {
          errorId: '',
          qtyError: 0,
        },
      ],
      listLostTime: [
        {
          lostId: '',
          listError: [],
          qtyLostTime: 0,
        },
      ],
    }));
    if (Platform.OS == 'ios') {
      setSelectedDate(datePickerChoose);
      hideDatePicker();
    } else {
      hideDatePicker();
      setSelectedDate(datePickerChoose);
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
    //setErrors([...error]);
    // setErrorOfDataInfo([]);
    // setDataInfo(prevState => ({
    //   ...prevState,
    //   QtyDay: '',
    //   QtyKH: '',
    //   QtyLKStorage: '',
    //   QtyStorage: '',
    //   QtyTatolSX: '',
    // }));
    setIsInProgress(false);
  };

  const getDataDropdownWorkcenter = async () => {
    baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
    let dataDropdown = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_API_COMMON +
      '?type=' +
      WorkByTypeEnumMobile.WorkCenter +
      '&typeWorkcenter=' +
      TypeWorkcenterMobile.DEFAULT,
      null,
    );
    if (
      typeof dataDropdown !== 'string' &&
      dataDropdown != null &&
      dataDropdown.isSuccess === true
    ) {
      let data = {
        list: dataDropdown.data,
      };
      setDataDropdownWorkCenter(data.list);
    }
    baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
  };

  const getListMaterialByWorkcenter = async (workCenter: string) => {
    baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
    let dataDropdown = await CommonBase.getAsync<ResponseService>(
      ApiMoldingRecord.GET_LIST_MATERIAL_BY_WORKCENTER + workCenter,
      null,
    );
    if (
      typeof dataDropdown !== 'string' &&
      dataDropdown != null &&
      dataDropdown.isSuccess === true
    ) {
      let data = {
        list: dataDropdown.data,
      };
      if (data.list.length == 1) {
        setDataPageRecordInput(prevState => ({
          ...prevState,
          materialcode: data.list[0].id,
        }));
        getListWorkOrder(data.list[0].id);
      }
      setDataDropdownMaterial(data.list);
    }
    baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
  };

  const getListWorkOrder = async (materialCode: string) => {
    baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
    if (materialCode != '' && dataPageRecordInput.workcenterid != '') {
      let dataDropdown = await CommonBase.getAsync<ResponseService>(
        ApiMoldingRecord.GET_LIST_WORKORDER +
        '?workcenterid=' +
        dataPageRecordInput.workcenterid +
        '&materialcode=' +
        materialCode,
        null,
      );
      if (
        typeof dataDropdown !== 'string' &&
        dataDropdown != null &&
        dataDropdown.isSuccess === true
      ) {
        let data = {
          list: dataDropdown.data.listWorkorder,
          defaultCode: dataDropdown.data.defaultCode,
        };

        if (data.defaultCode != '' && data.defaultCode != null) {
          setDataPageRecordInput(prevState => ({
            ...prevState,
            workordercode: data.defaultCode,
          }));
        }
        setDataDropdownWorkOrder(data.list);
      }
    }
    baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
  };

  const getDataDropdownTimeSlot = async () => {
    let request = 36;
    let dataTimeSlotResponse = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_API_COMMON + '?type=' + request,
      null,
    );
    if (
      typeof dataTimeSlotResponse !== 'string' &&
      dataTimeSlotResponse != null &&
      dataTimeSlotResponse.isSuccess === true
    ) {
      let data = {
        listTime: dataTimeSlotResponse.data,
      };
      setTimeSlot(data.listTime);
    }
  };

  const getInfoMolding = async (timeSlot: string) => {
    if (
      dataPageRecordInput.materialcode != '' &&
      dataPageRecordInput.workcenterid != '' &&
      dataPageRecordInput.workordercode != ''
    ) {
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiMoldingRecord.GET_INFO_MOLDING_RECORD +
        '?workcenterid=' +
        dataPageRecordInput.workcenterid +
        '&materialcode=' +
        dataPageRecordInput.materialcode +
        '&workordercode=' +
        dataPageRecordInput.workordercode +
        '&daterecord=' +
        dataPageRecordInput.daterecord +
        '&timeslotcode=' +
        timeSlot,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          listError: dataResponse.data.listError,
          listLostTime: dataResponse.data.listLostTime,
          lostTime: dataResponse.data.lostTime,
          qtyDay: dataResponse.data.qtyDay,
          qtyDayDone: dataResponse.data.qtyDayDone,
          qtyDayError: dataResponse.data.qtyDayError,
          qtyDone: dataResponse.data.qtyDone,
          qtyError: dataResponse.data.qtyError,
          qtyExample: dataResponse.data.qtyExample,
        };

        setDataPageRecordInput(prevState => ({
          ...prevState,
          listError: data.listError,
          listLostTime: data.listLostTime,
          lostTime: data.lostTime,
          qtyDay: data.qtyDay,
          qtyDayDone: data.qtyDayDone,
          qtyDayError: data.qtyDayError,
          qtyDone: data.qtyDone,
          qtyError: data.qtyError,
          qtyExample: data.qtyExample,
        }));
      }
    }
  };

  const onPressHandleClose = () => {
    clearData();
    navigation.navigate('HomePageScreen');
  };

  console.log('1111', dataPageRecordInput.listError)

  const clearData = () => {
    setIsInProgress(false);
    setSelectedDate(new Date());
    setDataPageRecordInput({
      daterecord: date,
      workcenterid: '',
      workordercode: '',
      timeslotcode: '',
      materialcode: '',
      qtyDone: 0,
      qtyExample: 0,
      qtyDay: 0,
      qtyDayDone: 0,
      qtyDayError: 0,
      qtyError: 0,
      lostTime: 0,
      listError: [
        {
          errorId: '',
          qtyError: 0,
        },
      ],
      listLostTime: [
        {
          lostId: '',
          listError: [],
          qtyLostTime: 0,
        },
      ],
    });
    setDataDropdownWorkCenter([]);
    setErrors([]);
    setDataDropdownMaterial([]);
    setDataDropdownWorkCenter([]);
    setDataDropdownWorkOrder([]);
    setTimeSlot([]);
    setIsDayBefore(false);
    setTimeSlotName('');
    setListErrCount(0)
  };

  useEffect(() => {
    if (refreshing == true) {
      getDataDropdownWorkcenter();
      getDataDropdownTimeSlot();
      clearData();
    }
  }, [refreshing]);

  useEffect(() => {
    getDataDropdownWorkcenter();
    getDataDropdownTimeSlot();
    clearData();
  }, []);

  useEffect(() => {
    baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
    if (isFocused == true) {
      getDataDropdownWorkcenter();
      getDataDropdownTimeSlot();
    } else {
      clearData();
    }
    baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <LinearGradient
        // start={{x: 0, y: 0}} end={{x: 1, y: 0}}
        colors={['#003350', '#00598C']}
        style={{
          height: Platform.OS == 'ios' ? 100 : 90,
          padding: 10,
          paddingTop: Platform.OS == 'ios' ? 47 : 40,
        }}>
        <MyTitleHome
          navigation={navigation}
          toggleDrawer={() => {
            navigation.dispatch(DrawerActions.toggleDrawer());
          }}
          isShowIconLeft={true}
          component={null}
          title="Ghi nhận sản lượng đúc"
          hidenStatusBar={true}
          isShowIconRight={true}
        />
      </LinearGradient>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.content}>
          <View style={styles.textInputContent}>
            <View style={{ width: 120, justifyContent: 'center' }}>
              <Text style={styles.label}>Ngày ghi nhận:</Text>
            </View>
            <View style={{ width: deviceWidth - 100 - 20 }}>
              <TouchableOpacity onPress={showDatePicker}>
                <Text style={styles.datePickerBox}>
                  {dataPageRecordInput.daterecord ?? selectedDate}
                </Text>
                <Svg
                  style={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 10,
                  }}
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none">
                  <Path
                    d="M9.99999 12.2543C9.81933 12.2543 9.66666 12.192 9.54199 12.0673C9.41666 11.9427 9.35399 11.79 9.35399 11.6093C9.35399 11.4287 9.41666 11.2723 9.54199 11.1403C9.66666 11.0083 9.81933 10.9423 9.99999 10.9423C10.1807 10.9423 10.3333 11.0083 10.458 11.1403C10.5833 11.2723 10.646 11.4217 10.646 11.5883C10.646 11.769 10.5833 11.9253 10.458 12.0573C10.3333 12.1887 10.1807 12.2543 9.99999 12.2543ZM6.74999 12.2543C6.56933 12.2543 6.41666 12.192 6.29199 12.0673C6.16666 11.9427 6.10399 11.79 6.10399 11.6093C6.10399 11.4287 6.16666 11.2723 6.29199 11.1403C6.41666 11.0083 6.56933 10.9423 6.74999 10.9423C6.93066 10.9423 7.08333 11.0083 7.20799 11.1403C7.33333 11.2723 7.39599 11.4217 7.39599 11.5883C7.39599 11.769 7.33333 11.9253 7.20799 12.0573C7.08333 12.1887 6.93066 12.2543 6.74999 12.2543ZM13.25 12.2543C13.0693 12.2543 12.9167 12.192 12.792 12.0673C12.6667 11.9427 12.604 11.79 12.604 11.6093C12.604 11.4287 12.6667 11.2723 12.792 11.1403C12.9167 11.0083 13.0693 10.9423 13.25 10.9423C13.4307 10.9423 13.5833 11.0083 13.708 11.1403C13.8333 11.2723 13.896 11.4217 13.896 11.5883C13.896 11.769 13.8333 11.9253 13.708 12.0573C13.5833 12.1887 13.4307 12.2543 13.25 12.2543ZM9.99999 15.1923C9.81933 15.1923 9.66666 15.1297 9.54199 15.0043C9.41666 14.8797 9.35399 14.727 9.35399 14.5463C9.35399 14.3657 9.41666 14.2093 9.54199 14.0773C9.66666 13.946 9.81933 13.8803 9.99999 13.8803C10.1807 13.8803 10.3333 13.946 10.458 14.0773C10.5833 14.2093 10.646 14.3587 10.646 14.5253C10.646 14.706 10.5833 14.8623 10.458 14.9943C10.3333 15.1263 10.1807 15.1923 9.99999 15.1923ZM6.74999 15.1923C6.56933 15.1923 6.41666 15.1297 6.29199 15.0043C6.16666 14.8797 6.10399 14.727 6.10399 14.5463C6.10399 14.3657 6.16666 14.2093 6.29199 14.0773C6.41666 13.946 6.56933 13.8803 6.74999 13.8803C6.93066 13.8803 7.08333 13.946 7.20799 14.0773C7.33333 14.2093 7.39599 14.3587 7.39599 14.5253C7.39599 14.706 7.33333 14.8623 7.20799 14.9943C7.08333 15.1263 6.93066 15.1923 6.74999 15.1923ZM13.25 15.1923C13.0693 15.1923 12.9167 15.1297 12.792 15.0043C12.6667 14.8797 12.604 14.727 12.604 14.5463C12.604 14.3657 12.6667 14.2093 12.792 14.0773C12.9167 13.946 13.0693 13.8803 13.25 13.8803C13.4307 13.8803 13.5833 13.946 13.708 14.0773C13.8333 14.2093 13.896 14.3587 13.896 14.5253C13.896 14.706 13.8333 14.8623 13.708 14.9943C13.5833 15.1263 13.4307 15.1923 13.25 15.1923ZM4.74999 17.7753C4.37533 17.7753 4.05933 17.6437 3.80199 17.3803C3.54533 17.1163 3.41699 16.8037 3.41699 16.4423V5.94233C3.41699 5.581 3.54533 5.26867 3.80199 5.00533C4.05933 4.74133 4.37533 4.60933 4.74999 4.60933H6.58299V2.50433H7.68799V4.60933H12.333V2.50433H13.417V4.60933H15.25C15.6247 4.60933 15.9407 4.74133 16.198 5.00533C16.4547 5.26867 16.583 5.581 16.583 5.94233V16.4423C16.583 16.8037 16.4547 17.1163 16.198 17.3803C15.9407 17.6437 15.6247 17.7753 15.25 17.7753H4.74999ZM4.74999 16.6923H15.25C15.3053 16.6923 15.361 16.6647 15.417 16.6093C15.4723 16.5533 15.5 16.4977 15.5 16.4423V9.44233H4.49999V16.4423C4.49999 16.4977 4.52766 16.5533 4.58299 16.6093C4.63899 16.6647 4.69466 16.6923 4.74999 16.6923Z"
                    fill="#003350"
                  />
                </Svg>
              </TouchableOpacity>
              {errors && errors.length > 0
                ? errors.map((item, j) => {
                  if (item?.fieldName == 'DateRecord') {
                    return (
                      <Text
                        key={j}
                        style={{
                          width: '100%',
                          height: 20,
                          //paddingLeft: (deviceWidth * 12.5) / 100,
                          paddingLeft: 40,
                          color: 'red',
                          margin: 0,
                          fontSize: 13,
                        }}>
                        {item.mes}
                      </Text>
                    );
                  }
                })
                : null}

              <DateTimePickerModal
                date={selectedDate}
                isVisible={datePickerVisible}
                mode="date"
                maximumDate={new Date()}
                locale={'vi'}
                display="inline"
                confirmTextIOS={'Lưu'}
                cancelTextIOS={'Hủy'}
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
              />
            </View>
          </View>

          {/* day chuyen */}
          <View style={styles.textInputContent}>
            <View style={{ width: 120 }}>
              <Text style={styles.label}>Dây chuyền:</Text>
            </View>
            <View style={{ width: deviceWidth - 100 - 20 }}>
              <SelectBaseVer2
                listData={dataDropdownWorkCenter}
                popupTitle="Dây chuyền"
                title="Chọn dây chuyền"
                styles={styles.inputBox}
                onSelect={(data: any) => {
                  // let error = validateField(
                  //   data[0],
                  //   Rules,
                  //   'Workcenterid',
                  //   errors,
                  // );
                  // setErrors([...error]);
                  // if (data[0] != dataPageRecordInput.Workcenterid) {
                  //   setIsOpenModalPlus(true);
                  // }
                  setDataPageRecordInput(stateOld => ({
                    ...stateOld,
                    workcenterid: data[0],
                    workordercode: '',
                    materialcode: '',
                    timeslotcode: '',
                  }));
                  setErrors([]);
                  getListMaterialByWorkcenter(data);
                }}
                stylesIcon={{
                  position: 'absolute',
                  zIndex: -1,
                  right: 10,
                  top: 15,
                }}
                valueArr={[dataPageRecordInput.workcenterid]}
                isSelectSingle={true}
              />
              {errors && errors.length > 0
                ? errors.map((item, j) => {
                  if (item.fieldName == 'Workcenterid') {
                    return (
                      <Text
                        key={j}
                        style={{
                          width: '100%',
                          height: 20,
                          //paddingLeft: (deviceWidth * 12.5) / 100,
                          paddingLeft: 40,
                          color: 'red',
                          margin: 0,
                          fontSize: 13,
                        }}>
                        {item.mes}
                      </Text>
                    );
                  }
                })
                : null}
            </View>
          </View>

          {/* san pham */}
          <View style={styles.textInputContent}>
            <View style={{ width: 120 }}>
              <Text style={styles.label}>Sản phẩm:</Text>
            </View>
            <View style={{ width: deviceWidth - 100 - 20 }}>
              <SelectBaseVer2
                listData={dataDropdownMaterial}
                popupTitle="Sản phẩm"
                title="Chọn sản phẩm"
                styles={styles.inputBox}
                onSelect={(data: any) => {
                  // let error = validateField(
                  //   data[0],
                  //   Rules,
                  //   'Workcenterid',
                  //   errors,
                  // );
                  // setErrors([...error]);
                  // if (data[0] != dataPageRecordInput.Workcenterid) {
                  //   setIsOpenModalPlus(true);
                  // }
                  setDataPageRecordInput(stateOld => ({
                    ...stateOld,
                    materialcode: data[0],
                    workordercode: '',
                    timeslotcode: '',
                  }));
                  setErrors([]);
                  getListWorkOrder(data);
                }}
                stylesIcon={{
                  position: 'absolute',
                  zIndex: -1,
                  right: 10,
                  top: 15,
                }}
                valueArr={[dataPageRecordInput.materialcode]}
                isSelectSingle={true}
              />
              {errors && errors.length > 0
                ? errors.map((item, j) => {
                  if (item.fieldName == 'Workcenterid') {
                    return (
                      <Text
                        key={j}
                        style={{
                          width: '100%',
                          height: 20,
                          //paddingLeft: (deviceWidth * 12.5) / 100,
                          paddingLeft: 40,
                          color: 'red',
                          margin: 0,
                          fontSize: 13,
                        }}>
                        {item.mes}
                      </Text>
                    );
                  }
                })
                : null}
            </View>
          </View>

          {/* san pham */}
          <View style={styles.textInputContent}>
            <View style={{ width: 120 }}>
              <Text style={styles.label}>Lệnh SX:</Text>
            </View>
            <View style={{ width: deviceWidth - 100 - 20 }}>
              <SelectBaseVer2
                listData={dataDropdownWorkOrder}
                popupTitle="Lệnh sản xuất"
                title="Chọn lệnh sản xuất"
                styles={styles.inputBox}
                onSelect={(data: any) => {
                  // let error = validateField(
                  //   data[0],
                  //   Rules,
                  //   'Workcenterid',
                  //   errors,
                  // );
                  // setErrors([...error]);
                  // if (data[0] != dataPageRecordInput.Workcenterid) {
                  //   setIsOpenModalPlus(true);
                  // }
                  setDataPageRecordInput(stateOld => ({
                    ...stateOld,
                    workordercode: data[0],
                    timeslotcode: '',
                  }));
                  setErrors([]);
                }}
                stylesIcon={{
                  position: 'absolute',
                  zIndex: -1,
                  right: 10,
                  top: 15,
                }}
                valueArr={[dataPageRecordInput.workordercode]}
                isSelectSingle={true}
              />
              {errors && errors.length > 0
                ? errors.map((item, j) => {
                  if (item.fieldName == 'Workcenterid') {
                    return (
                      <Text
                        key={j}
                        style={{
                          width: '100%',
                          height: 20,
                          //paddingLeft: (deviceWidth * 12.5) / 100,
                          paddingLeft: 40,
                          color: 'red',
                          margin: 0,
                          fontSize: 13,
                        }}>
                        {item.mes}
                      </Text>
                    );
                  }
                })
                : null}
            </View>
          </View>

          {/* khung gio */}
          <View style={styles.textInputContent}>
            <View style={{ width: 120 }}>
              <Text style={styles.label}>Ca ghi nhận:</Text>
            </View>
            <View style={{ width: deviceWidth - 100 - 20 }}>
              <SelectBaseVer2
                listData={timeSlot}
                styles={styles.inputBox}
                title="Chọn ca ghi nhận"
                popupTitle="Ca ghi nhận"
                onSelect={(data: any) => {
                  // let error = validateField(
                  //   data[0],
                  //   Rules,
                  //   'TimeSlot',
                  //   errors,
                  // );
                  // setErrors([...error]);
                  //setErrorOfDataInfo([]);
                  setDataPageRecordInput(prevState => ({
                    ...prevState,
                    timeslotcode: data[0],
                  }));
                  getInfoMolding(data[0]);
                  var timeSlotName = timeSlot.find(x => x.id == data[0])?.name;
                  if (timeSlotName != undefined) {
                    setTimeSlotName(timeSlotName);
                  }
                  setIsInProgress(false);
                }}
                stylesIcon={{
                  position: 'absolute',
                  zIndex: -1,
                  right: 10,
                  top: 15,
                }}
                valueArr={[dataPageRecordInput.timeslotcode]}
                isSelectSingle={true}
              />
              {errors && errors.length > 0
                ? errors.map((item, j) => {
                  if (item.fieldName == 'TimeSlot') {
                    return (
                      <Text
                        key={j}
                        style={{
                          width: '100%',
                          height: 20,
                          //paddingLeft: (deviceWidth * 12.5) / 100,
                          paddingLeft: 40,
                          color: 'red',
                          margin: 0,
                          fontSize: 13,
                        }}>
                        {item.mes}
                      </Text>
                    );
                  }
                })
                : null}
            </View>
          </View>

          {/* bat dau sx */}
          {/* <View style={styles.textInputContent}>
            <View style={{width: 120}}>
              <Text style={styles.label}>Bắt đầu sản xuất:</Text>
            </View>
            <View style={{width: deviceWidth - 100 - 20}}></View>
          </View> */}
        </View>

        <View style={styles.header2}></View>
        {timeSlotName != '' ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              padding: 14,
              borderRadius: 8,
            }}>
            <Text style={styles.labelDetail}>
              {'Hôm nay ngày ' + dataPageRecordInput.daterecord ?? selectedDate}
            </Text>
            <Text style={styles.labelDetail}>
              {'Đang ghi nhận cho ca ' +
                timeSlotName +
                ' ngày ' +
                dataPageRecordInput.daterecord ?? selectedDate}
            </Text>
          </View>
        ) : null}

        <View style={styles.header2}></View>

        <View
          style={{
            marginBottom: 16,
          }}>
          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{ width: 120, justifyContent: 'center' }}>
                <Text style={styles.label}>SL đạt:</Text>
              </View>
              <View style={{ width: deviceWidth - 130 }}>
                <Text style={styles.input}>
                  {dataPageRecordInput.qtyDone == null
                    ? 0
                    : dataPageRecordInput.qtyDone}
                </Text>
              </View>
            </View>

            <View style={styles.textInputContent}>
              <View style={{ width: 120, justifyContent: 'center' }}>
                <Text style={styles.label}>SL lỗi:</Text>
              </View>
              <View
                style={{
                  width: (deviceWidth * 60) / 100,
                }}>
                <Text style={styles.input}>
                  {listErrCount}
                </Text>
              </View>
              <View>
                <TouchableOpacity
                  style={styles.addErrorButton}
                  onPress={() => setIsOpenModalAddErr(true)}>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontFamily: 'Mulish-SemiBold',
                      fontSize: 12,
                    }}>
                    Nhập lỗi
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.textInputContent}>
              <View style={{ width: 120, justifyContent: 'center' }}>
                <Text style={styles.label}>QC lấy mẫu:</Text>
              </View>
              <View
                style={{
                  width: deviceWidth - 130,
                }}>
                <Text style={styles.input}>
                  {dataPageRecordInput.qtyExample == null
                    ? 0
                    : dataPageRecordInput.qtyExample}
                </Text>
              </View>
            </View>

            <View style={styles.textInputContent}>
              <View style={{ width: 120, justifyContent: 'center' }}>
                <Text style={styles.label}>Lost time (phút):</Text>
              </View>
              <View
                style={{
                  width: (deviceWidth * 50) / 100,
                }}>
                <Text style={styles.input}>
                  {dataPageRecordInput.lostTime == null
                    ? 0
                    : dataPageRecordInput.lostTime}
                </Text>
              </View>

              <View>
                <TouchableOpacity
                  style={styles.addErrorButton}
                  onPress={() => setIsOpenModalAddLostTime(true)}>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontFamily: 'Mulish-SemiBold',
                      fontSize: 12,
                    }}>
                    Nhập lost time
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            marginBottom: (deviceHeight * 18) / 100,
            backgroundColor: '#FFFFFF',
          }}>
          <View style={styles.contentNumber}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  color: '#1B3A4ECC',
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  width: '33%',
                  textAlign: 'center',
                  paddingBottom: 12,
                }}>
                Tổng SL ngày
              </Text>
              <Text
                style={{
                  color: '#1B3A4ECC',
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  width: '33%',
                  textAlign: 'center',
                  paddingBottom: 12,
                }}>
                Tổng đạt
              </Text>
              <Text
                style={{
                  color: '#1B3A4ECC',
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  width: '33%',
                  textAlign: 'center',
                  paddingLeft: 20,
                  paddingBottom: 12,
                }}>
                Tổng lỗi
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  color: '#008B09',
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  width: '33%',
                  textAlign: 'center',
                  paddingBottom: 12,
                  fontSize: 28,
                }}>
                {dataPageRecordInput.qtyDay == null
                  ? 0
                  : dataPageRecordInput.qtyDay}
              </Text>
              <Text
                style={{
                  color: '#008B09',
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  width: '33%',
                  textAlign: 'center',
                  paddingBottom: 12,
                  fontSize: 28,
                }}>
                {dataPageRecordInput.qtyDayDone == null
                  ? 0
                  : dataPageRecordInput.qtyDayDone}
              </Text>
              <Text
                style={{
                  color: '#008B09',
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  width: '33%',
                  textAlign: 'center',
                  paddingBottom: 12,
                  fontSize: 28,
                }}>
                {dataPageRecordInput.qtyDayError == null
                  ? 0
                  : dataPageRecordInput.qtyDayError}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.submit}>
        <View style={{ height: 40, width: '32%', paddingRight: 20 }}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={onPressHandleClose}>
            <View>
              <Text style={{ color: '#006496', fontFamily: 'Mulish-Bold' }}>
                {' '}
                Hủy{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40, width: '32%', paddingRight: 20 }}>
          {isInProgress == false ? (
            <>
              {isDayBefore == false ? (
                <TouchableOpacity
                  style={styles.submitButton}
                //onPress={checkQty}
                >
                  <View>
                    <Text style={{ color: '#ffffff', fontFamily: 'Mulish-Bold' }}>
                      {' '}
                      Lưu{' '}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.disableButton} disabled={true}>
                  <View>
                    <Text style={{ color: '#AAABAE', fontFamily: 'Mulish-Bold' }}>
                      {' '}
                      Lưu{' '}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <TouchableOpacity style={styles.disableButton} disabled={true}>
              <View>
                <Text style={{ color: '#AAABAE', fontFamily: 'Mulish-Bold' }}>
                  {' '}
                  Lưu{' '}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isOpenModalAddErr ? (
        <ModalBase
          navigation={navigation}
          isOpenModalProps={isOpenModalAddErr}
          title={'Nhập thông tin lỗi'}
          handleSetModal={(isModal: boolean) => {
            setIsOpenModalAddErr(isModal);
          }}
          component={
            <AddErrorMoldingModal
              navigation={navigation}
              handleCancel={() => {
                setIsOpenModalAddErr(false);
              }}
              handleSubmit={(listDataErr: [IListErr]) => {
                dataPageRecordInput.listError.push(...listDataErr);
                setDataPageRecordInput(prevState => ({
                  ...prevState,
                  listError: dataPageRecordInput.listError,
                }));

                setListErrCount(listErrCount + listDataErr[0].qtyError)
                setIsOpenModalAddErr(false);
              }}
            />
          }
        />
      ) : null}

      {isOpenModalAddLostTime ? (
        <ModalBase
          navigation={navigation}
          isOpenModalProps={isOpenModalAddLostTime}
          title={'Nhập thông tin lost time'}
          handleSetModal={(isModal: boolean) => {
            setIsOpenModalAddLostTime(isModal);
          }}
          component={
            <AddLostTimeMoldingModal
              navigation={navigation}
              handleCancel={() => {
                setIsOpenModalAddLostTime(false);
              }}
              handleSubmit={(listDataNote: any) => {
                // setDataPageRecordIOT(prevState => ({
                //   ...prevState,
                //   listBatchRecyclings: listDataNote,
                // }));
                setIsOpenModalAddLostTime(false);
              }}
            />
          }
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F4F4F9',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 8,
    flexDirection: 'column',
  },
  header: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderBottomColor: '#001E31',
    height: 60,
    backgroundColor: '#F4F4F9',
  },
  content: {
    // height: deviceHeight - 5,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },
  contentNumber: {
    alignItems: 'center',
    padding: 16,
  },
  datePickerBox: {
    width: '100%',
    height: 40,
    paddingLeft: 40,
    paddingTop: 12,
    color: '#001E31',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  submit: {
    marginTop: 3,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 100,
    shadowColor: '#00000',
    shadowOpacity: 0.4,
    backgroundColor: '#ffffff',
    paddingRight: 10,
    paddingBottom: 10,
    position: 'absolute',
    bottom: 0,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  textInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 25,
    height: (deviceHeight * 7) / 100,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingVertical: 8,
  },
  label: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
    color: '#1B3A4ECC',
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
    fontWeight: '500',
  },
  labelDetail: {
    color: '#006496',
    fontFamily: 'Mulish-Bold',
    fontWeight: '600',
    textAlign: 'center',
  },
  header2: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderBottomColor: '#001E31',
    height: 16,
    backgroundColor: '#F4F4F9',
  },
  textHeaderLabel: {
    color: '#0D1D2A',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: 16,
    fontStyle: 'normal',
    fontFamily: 'Mulish-Bold',
  },
  inputBox: {
    width: '100%',
    height: 40,
    paddingLeft: 40,
    color: '#001E31',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
  },
  input: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    paddingLeft: 40,
    fontWeight: '600',
    color: '#003858',
    textAlign: 'left',
  },
  addErrorButton: {
    alignItems: 'center',
    backgroundColor: '#006496',
    height: 30,
    justifyContent: 'center',
    borderRadius: 5,
    shadowColor: '#00000',
    shadowOpacity: 0.3,
    elevation: 5,
    padding: 8,
  },
  dropdownBox: {
    width: '100%',
    color: '#001E31',
    fontSize: 12,
    backgroundColor: '#fffffff',
    justifyContent: 'flex-start',
    paddingLeft: 150,
  },
  labelField: {
    width: '40%',
    height: '50%',
    color: '#001E31',
  },
  exitButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 35,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#137DB9',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#004B72',
    height: 35,
    justifyContent: 'center',
  },
  disableButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 35,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#AAABAE',
  },
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  baseAction: bindActionCreators(baseAction, dispatch),
});
export default connect(null, mapDispatchToProps)(ProductionMoldingRecordScreen);
