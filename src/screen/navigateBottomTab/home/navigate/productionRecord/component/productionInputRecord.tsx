import {
  DrawerActions,
  NavigationProp,
  useIsFocused,
} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Path, Svg} from 'react-native-svg';
import {connect} from 'react-redux';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import {createStructuredSelector} from 'reselect';
import baseAction from '../../../../../base/saga/action';
import {
  ApiCommon,
  ApiProductionRecord,
  RequestService,
  ResponseService,
} from '../../../../../share/app/constantsApi';
import SelectBaseVer2 from '../../../../../share/base/component/selectBase/selectBaseVer2';
import {
  IError,
  IRule,
  typeVadilate,
  validateField,
  validateForm,
} from '../../../../../share/commonVadilate/validate';
import CommonBase from '../../../../../share/network/axios';
import {dataPageRecordSX} from '../saga/productionRecordSelectors';
import {FilterRecord} from '../types/enum/productionRecord';
import MyTitleHome from './../../../../../../../src/screen/share/base/component/myStatusBar/MyTitleHome';
import productionRecordAction from './../saga/productionRecordAction';
import {
  IDataPageRecordInput,
  IRecorDataByUser,
  IUserDefaultCallApi,
} from './../types/productionRecordTypes';
import {IDropdown, ITimeSlot} from '../types/types';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ModalBase from '../../../../../share/base/component/modal/modalBase';
import ProductionSubmitRecordModal from './modalScreen/productionSubmitRecordModal';
import {Regex} from '../../../../../share/app/regex';
import PopUpBase from '../../../../../share/base/component/popUp/popUpBase';
import Modal from 'react-native-modal';
import ProductionInputModal from './modalScreen/productionInputModal';
import Storage from '../../../../../share/storage/storage';
import jwt_decode from 'jwt-decode';

// Import the react-native-sound module
var Sound = require('react-native-sound');

// Enable playback in silence mode
Sound.setCategory('Playback');

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

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
      maxValue: '',
    },
  },
  {
    field: 'Workordercode',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Lệnh không được bỏ trống',
      minLength: '',
      maxLength: '',
      maxValue: '',
      validate: '',
    },
  },
  {
    field: 'Color',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Màu không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'Seasoncode',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Mùa không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'Marketcode',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Thị trường không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'Sizecode',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Size không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'DateRecord',
    required: true,
    maxLength: 10,
    minLength: 10,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Ghi nhận cho ngày không được bỏ trống',
      minLength: 'Giá trị không hợp lệ',
      maxLength: 'Giá trị không hợp lệ',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'TimeSlot',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    maxValue: 0,
    valueCheck: false,
    messages: {
      required: 'Khung giờ không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
];

const RuleOfDataInfo: IRule[] = [
  {
    field: 'Qtydone',
    required: true,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.Number,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: 'Vui lòng kiểm tra lại sản lượng!',
      minLength: '',
      maxLength: '',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    },
  },
  {
    field: 'QtyCutPart',
    required: false,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.Number,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: '',
      minLength: '',
      maxLength: '',
      validate: 'Vui lòng kiểm tra lại đầu cắt part',
      maxValue: '',
    },
  },
  {
    field: 'QtyInputInline',
    required: false,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: '',
      minLength: '',
      maxLength: '',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    },
  },
];

export interface Token {
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
  TenantName: string;
  // whatever else is in the JWT.
}

const StatusCheck = {
  Create: 1,
  Edit: 0,
};

export interface InputProductionRecordScreenProps {
  navigation: NavigationProp<any, any>;
  productionRecordAction: typeof productionRecordAction;
  dataPageRecordSX: IDataPageRecordInput;
  dataDropdown: IDropdown[];
  baseAction: typeof baseAction;
}

const InputProductionRecordScreen: React.FC<
  InputProductionRecordScreenProps
> = ({navigation, productionRecordAction, dataPageRecordSX, baseAction}) => {
  let localTime = new Date();
  let date = moment(localTime).format('DD/MM/YYYY');

  const isFocused = useIsFocused();
  const [errors, setErrors] = useState<IError[]>([]);
  const [errorOfDataInfo, setErrorOfDataInfo] = useState<IError[]>([]);

  const [isInProgress, setIsInProgress] = useState<boolean>(false);
  const [isShowButton, setIsShowButton] = useState<boolean>(false);
  const [isOpenModalPlus, setIsOpenModalPlus] = useState<boolean>(true);
  const [isOpenModalQtyNeed, setIsOpenModalQtyNeed] = useState<boolean>(false);
  const [isOnCloud, setIsOnCLoud] = useState<boolean>(false);
  const [isVisible, setIsvisible] = useState<boolean>();
  const [checkUpdateDataQty, setCheckUpdateDataQty] = useState<boolean>();
  const [isRecordModalOpen, setRecordModalOpen] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isDayBefore, setIsDayBefore] = useState<boolean>(false);
  const [checkData, setCheckData] = useState('');
  const [colorCode, setColorCode] = useState('');
  const [sizeCode, setSizeCode] = useState('');
  const [marketCode, setMarketCode] = useState('');
  const [seasonCode, setSeasonCode] = useState('');
  const [dataShowColor, setDataShowColor] = useState('');
  const [dataShowSeason, setDataShowSeason] = useState('');

  const [dataDropdownWorkCenter, setDataDropdownWorkCenter] = useState<
    IDropdown[]
  >([]);
  const [dataDropdownMainCode, setDataDropdownMainCode] = useState<IDropdown[]>(
    [],
  );
  const [dataDropdownSub, setDataDropdownSub] = useState<IDropdown[]>([]);
  const [dataDropdownColor, setDataDropdownColor] = useState<IDropdown[]>([]);
  const [dataDropdownSeason, setDataDropdownSeason] = useState<IDropdown[]>([]);
  const [dataDropdownWorkordercode, setDataDropdownWorkordercode] = useState<
    IDropdown[]
  >([]);
  const [dataDropdownMarket, setDataDropdownMarket] = useState<IDropdown[]>([]);
  const [dataDropdownSize, setDataDropdownSize] = useState<IDropdown[]>([]);

  const [dataPageRecordInput, setDataPageRecordInput] =
    useState<IDataPageRecordInput>({
      Workcenterid: '',
      Workordercode: '',
      ItemCode: '',
      Color: '',
      subCode: '',
      Maincodeproduct: '',
      Seasoncode: '',
      Marketcode: '',
      Sizecode: '',
      DateRecord: date,
      TimeSlot: '',
    });

  const [dataInfo, setDataInfo] = useState<IUserDefaultCallApi>({
    Stepname: '',
    Workerid: '',
    Workername: '',
    Stepid: '',
    QtyCutPartOld: '',
    QtyCutPartNew: '',
    Qtydone: '',
    QtyInputInline: '',
    QtyNeed: '',
    QtyLK: '',
  });

  const [dataInfoForPlus, setDataInfoForPlus] = useState<IUserDefaultCallApi>({
    Stepname: '',
    Workerid: '',
    Workername: '',
    Stepid: '',
    QtyCutPartOld: '',
    QtyCutPartNew: '',
    Qtydone: '',
    QtyInputInline: '',
    QtyNeed: '',
    QtyLK: '',
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const [getTimeSlot, setTimeSlot] = useState<ITimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [dataSKU, setDataSKU] = useState('');

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirmDate = (datePickerChoose: Date) => {
    let error = validateField(datePickerChoose, Rules, 'DateRecord', errors);
    let dateRecord = moment(datePickerChoose).format('DD/MM/YYYY');
    let now = moment(new Date()).format("YYYY-MM-DD")
    if(moment(dateRecord, ["DD/MM/YYYY", "YYYY-MM-DD"]).isSameOrAfter(now, 'day') == false && isOnCloud == true){
      setIsDayBefore(true);
    }
    else {
      setIsDayBefore(false);
    }
    setDataPageRecordInput(prevState => ({
      ...prevState,
      DateRecord: moment(datePickerChoose).format('DD/MM/YYYY'),
      Workcenterid: '',
      Workcentername: '',
      Workordercode: '',
      ItemCode: '',
      Color: '',
      subCode: '',
      Maincodeproduct: '',
      Seasoncode: '',
      Marketcode: '',
      Sizecode: '',
      TimeSlot: '',
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
    setErrors([...error]);
    setErrorOfDataInfo([]);
    setDataInfo(prevState => ({
      ...prevState,
      QtyInputInline: '',
      QtyCutPartNew: '',
      Qtydone: '',
      QtyNeed: '',
      QtyLK: '',
    }));
    setIsInProgress(false);
    setIsOpenModalPlus(true);
  };

  const onPressCloseModalNeed = () => {
    setIsOpenModalQtyNeed(false);
    setIsInProgress(false);
    setIsOpenModalPlus(false);
  };

  const onPressSubmitModalNeed = () => {
    onPressSubmit();
    setIsOpenModalQtyNeed(false);
    setIsOpenModalPlus(false);
  };

  const getDataInfo = async () => {
    if (dataPageRecordInput.TimeSlot == '') {
      return;
    } else {
      let request = {
        Workordercode: dataPageRecordInput.Workordercode,
        Workerid: dataInfo.Workerid,
        Workcenterid: dataPageRecordInput.Workcenterid,
        Stepid: '',
        Slottimecode: dataPageRecordInput.TimeSlot,
        RecordForDate: dataPageRecordInput.DateRecord,
        Productcode: dataPageRecordInput.ItemCode,
      };
      // return;
      let dataResponse = await CommonBase.postAsync<ResponseService>(
        ApiProductionRecord.GET_INFO_WORKER_RECORD,
        request,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let dataInfo: IUserDefaultCallApi = {
          Stepname: dataResponse.data.Stepname,
          Workerid: dataResponse.data.Workerid,
          Workername: dataResponse.data.Workername,
          Stepid: dataResponse.data.Stepid,
          QtyCutPartOld: dataResponse.data?.QtyCutPartOld
            ? dataResponse.data?.QtyCutPartOld
            : 0,
          QtyCutPartNew: dataResponse.data?.QtyCutPartNew ?? '',
          Qtydone: dataResponse.data?.Qtydone ?? '',
          QtyInputInline: dataResponse.data?.QtyInputInline ?? '',
          QtyNeed: dataResponse.data?.QtyNeed ?? '',
          QtyLK: dataResponse.data?.QtyLK ?? '',
        };
        setIsOpenModalPlus(false);
        if (dataResponse.status == StatusCheck.Create) {
          setCheckUpdateDataQty(true);
        }
        if (dataInfo.Qtydone == '' || dataInfo.Qtydone == null) {
          setCheckData('0');
        } else {
          setCheckData(dataInfo.Qtydone);
        }
        setDataInfo(dataInfo);
        setDataInfoForPlus(dataInfo);
        setIsvisible(true);
      }
    }
  };

  const checkQty = () => {
    let error = validateForm(dataPageRecordInput, Rules, []);
    let errorInfo = validateForm(dataInfo, RuleOfDataInfo, []);
    if (error && error.length > 0 && errorInfo && errorInfo.length > 0) {
      setErrors([...error]);
      setErrorOfDataInfo([...errorInfo]);
      setIsInProgress(true);
      setIsOpenModalPlus(true);
      return;
    }
    if (error && error.length > 0) {
      setErrors([...error]);
      setIsInProgress(true);
      setIsOpenModalPlus(true);
      return;
    }
    if (errorInfo && errorInfo.length > 0) {
      setErrorOfDataInfo([...errorInfo]);
      setIsInProgress(true);
      setIsOpenModalPlus(true);
      return;
    }

    setIsInProgress(true);
    setIsOpenModalPlus(true);
    if (
      parseInt(dataInfo.Qtydone) - parseInt(checkData) >
      parseInt(dataInfo.QtyNeed)
    ) {
      setIsOpenModalQtyNeed(true);
    }
    if (
      parseInt(dataInfo.Qtydone) - parseInt(checkData) <=
      parseInt(dataInfo.QtyNeed)
    ) {
      onPressSubmit();
    }
  };

  const onPressSubmit = async () => {
    let request: IRecorDataByUser = {
      Productcode: dataPageRecordInput.ItemCode,
      Workcenterid: dataPageRecordInput.Workcenterid,
      Workordercode: dataPageRecordInput.Workordercode,
      Workerid: dataInfo.Workerid,
      Stepid: dataInfo.Stepid,
      QtyCutPartNew: dataInfo.QtyCutPartNew,
      Qtydone: dataInfo.Qtydone,
      QtyInputInline: dataInfo.QtyInputInline,
      Slottimecode: dataPageRecordInput.TimeSlot,
      RecordForDate: dataPageRecordInput.DateRecord,
    };
    let dataResponse = await CommonBase.postAsync<RequestService>(
      ApiProductionRecord.CARRY_OUT_PRODUCTION_RECORD,
      request,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      // bắn thông báo ghi nhận thành công=> chuyển hướng đến trang QRScanScreen
      setIsInProgress(false);
      setIsOpenModalPlus(false);
      await getDataInfo();
      let msg = 'Ghi nhận sản lượng thành công !';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
    } else {
      if (Platform.OS === 'android') {
        ToastAndroid.show(
          'Ghi nhận sản lượng không thành công !',
          ToastAndroid.SHORT,
        );
        ToastAndroid.show('Vui lòng kiểm tra lại!', ToastAndroid.LONG);
      } else {
        Alert.alert(
          'Ghi nhận sản lượng không thành công. Vui lòng kiểm tra lại!',
        );
      }
    }
  };

  const getDataDropdownWorkCenter = async () => {
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiProductionRecord.GET_DATA_BY_FILTER +
        '?Type=' +
        FilterRecord.Workcenterid,
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
      setDataDropdownWorkCenter(data.workCenter);
    }
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

  const clearData = () => {
    setIsInProgress(false);
    setIsOpenModalPlus(true);
    setSelectedDate(new Date());
    setDataPageRecordInput({
      Workcenterid: '',
      Workordercode: '',
      ItemCode: '',
      Color: '',
      subCode: '',
      Maincodeproduct: '',
      Seasoncode: '',
      Marketcode: '',
      Sizecode: '',
      DateRecord: date,
      TimeSlot: '',
    });
    setDataInfo({
      Stepname: '',
      Workerid: '',
      Workername: '',
      Stepid: '',
      QtyCutPartOld: '',
      QtyCutPartNew: '',
      Qtydone: '',
      QtyInputInline: '',
      QtyNeed: '',
      QtyLK: '',
    });
    setDataDropdownWorkCenter([]);
    setDataDropdownMainCode([]);
    setDataDropdownSub([]);
    setDataDropdownColor([]);
    setDataDropdownSeason([]);
    setDataDropdownWorkordercode([]);
    setDataDropdownMarket([]);
    setDataDropdownSize([]);
    setErrors([]);
    setIsDayBefore(false);
    setErrorOfDataInfo([]);

    let dataRequestReducer: IDataPageRecordInput = {
      Workcenterid: '',
      Workordercode: '',
      ItemCode: '',
      Color: '',
      subCode: '',
      Maincodeproduct: '',
      Seasoncode: '',
      Marketcode: '',
      Sizecode: '',
      DateRecord: date,
      TimeSlot: '',
    };

    productionRecordAction.setDataPageRecorReducer(dataRequestReducer);
  };

  const getDataSKU = async () => {
    if (
      dataPageRecordInput.Workcenterid &&
      dataPageRecordInput.Maincodeproduct &&
      dataPageRecordInput.subCode &&
      dataPageRecordInput.Color &&
      dataPageRecordInput.Seasoncode &&
      dataPageRecordInput.Workordercode &&
      dataPageRecordInput.Marketcode &&
      dataPageRecordInput.Sizecode
    ) {
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_PRODUCTCODE_BY_SKU +
          '?Mainproductcode=' +
          dataPageRecordInput.Maincodeproduct +
          '&Subproductcode=' +
          dataPageRecordInput.subCode +
          '&Colorcode=' +
          dataPageRecordInput.Color +
          '&Seasoncode=' +
          dataPageRecordInput.Seasoncode +
          '&Workordercode=' +
          dataPageRecordInput.Workordercode +
          '&Marketcode=' +
          dataPageRecordInput.Marketcode +
          '&Sizecode=' +
          dataPageRecordInput.Sizecode,
        null,
      );

      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          dataSKU: dataResponse.data,
        };
        setDataSKU(data.dataSKU);
        setDataPageRecordInput(prevState => ({
          ...prevState,
          ItemCode: data.dataSKU,
        }));
      }
    }
  };

  const getDataDropDownByFilterCloud = async (
    workCenterId: string,
    workOrderCode: string,
    mainCodeProduct: string,
    subCode: string,
    colorCode: string,
    seasonCode: string,
    marketCode: string,
  ) => {
    setErrors([]);
    //api lay lenh sx
    if (
      workCenterId != '' &&
      workOrderCode == '' &&
      mainCodeProduct == '' &&
      subCode == '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == ''
    ) {
      //api lay lênh sx
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.Workordercode +
          '&Workcenterid=' +
          workCenterId,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          workOrderCodeData: dataResponse.data,
        };
        setDataDropdownWorkordercode(data.workOrderCodeData);
        if (data.workOrderCodeData.length == 1) {
          // auto fill lenh sx
          let dataDropdownWorkOrderCode = data.workOrderCodeData;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Workordercode: dataDropdownWorkOrderCode[0].id,
          }));

          // api lay ma hang
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiProductionRecord.GET_DATA_BY_FILTER +
              '?Type=' +
              FilterRecord.Maincodeproduct +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              dataDropdownWorkOrderCode[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              MainCodeData: dataResponse.data,
            };
            setDataDropdownMainCode(data.MainCodeData);
            if (data.MainCodeData.length == 1) {
              // auto fill ma hang
              let dataDropdownMainCodeData = data.MainCodeData;
              setDataPageRecordInput(prevState => ({
                ...prevState,
                Maincodeproduct: dataDropdownMainCodeData[0].id,
              }));

              //api lay ma nho
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiProductionRecord.GET_DATA_BY_FILTER +
                  '?Type=' +
                  FilterRecord.Subcodeproduct +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  dataDropdownWorkOrderCode[0].id +
                  '&Mainproductcode=' +
                  dataDropdownMainCodeData[0].id,
                null,
              );
              if (
                typeof dataResponse !== 'string' &&
                dataResponse != null &&
                dataResponse.isSuccess === true
              ) {
                let data = {
                  subCodeData: dataResponse.data,
                };
                setDataDropdownSub(data.subCodeData);
                if (data.subCodeData.length == 1) {
                  //auto fill ma nho
                  let dataDropdownSubCode = data.subCodeData;
                  setDataPageRecordInput(prevState => ({
                    ...prevState,
                    subCode: dataDropdownSubCode[0].id,
                  }));

                  // api lay ma mau
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiProductionRecord.GET_DATA_BY_FILTER +
                      '?Type=' +
                      FilterRecord.Colorcode +
                      '&Workcenterid=' +
                      workCenterId +
                      '&Workordercode=' +
                      dataDropdownWorkOrderCode[0].id +
                      '&Mainproductcode=' +
                      dataDropdownMainCodeData[0].id +
                      '&Subproductcode=' +
                      dataDropdownSubCode[0].id,
                    null,
                  );
                  if (
                    typeof dataResponse !== 'string' &&
                    dataResponse != null &&
                    dataResponse.isSuccess === true
                  ) {
                    let data = {
                      colorCodeData: dataResponse.data,
                    };
                    setDataDropdownColor(data.colorCodeData);
                    if (data.colorCodeData.length == 1) {
                      // auto fill mau
                      let dataDropdownColorCode = data.colorCodeData;
                      setDataPageRecordInput(prevState => ({
                        ...prevState,
                        Color: dataDropdownColorCode[0].id,
                      }));

                      var colorName = dataDropdownColorCode[0].name;
                      if (colorName != undefined) {
                        setColorCode(colorName);
                      }

                      //api lay mua
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiProductionRecord.GET_DATA_BY_FILTER +
                            '?Type=' +
                            FilterRecord.Seasoncode +
                            '&Workcenterid=' +
                            workCenterId +
                            '&Workordercode=' +
                            dataDropdownWorkOrderCode[0].id +
                            '&Mainproductcode=' +
                            dataDropdownMainCodeData[0].id +
                            '&Subproductcode=' +
                            dataDropdownSubCode[0].id +
                            '&Colorcode=' +
                            dataDropdownColorCode[0].id,
                          null,
                        );
                      if (
                        typeof dataResponse !== 'string' &&
                        dataResponse != null &&
                        dataResponse.isSuccess === true
                      ) {
                        let data = {
                          seasonData: dataResponse.data,
                        };
                        setDataDropdownSeason(data.seasonData);
                        if (data.seasonData.length == 1) {
                          //auto fill mua
                          let dataDropdownSeason = data.seasonData;
                          setDataPageRecordInput(prevState => ({
                            ...prevState,
                            Seasoncode: dataDropdownSeason[0].id,
                          }));

                          //api lay thi truong
                          let dataResponse =
                            await CommonBase.getAsync<ResponseService>(
                              ApiProductionRecord.GET_DATA_BY_FILTER +
                                '?Type=' +
                                FilterRecord.Marketcode +
                                '&Workcenterid=' +
                                workCenterId +
                                '&Workordercode=' +
                                dataDropdownWorkOrderCode[0].id +
                                '&Mainproductcode=' +
                                dataDropdownMainCodeData[0].id +
                                '&Subproductcode=' +
                                dataDropdownSubCode[0].id +
                                '&Colorcode=' +
                                dataDropdownColorCode[0].id +
                                '&Seasoncode=' +
                                dataDropdownSeason[0].id,
                              null,
                            );
                          if (
                            typeof dataResponse !== 'string' &&
                            dataResponse != null &&
                            dataResponse.isSuccess === true
                          ) {
                            let data = {
                              marketCodeData: dataResponse.data,
                            };
                            setDataDropdownMarket(data.marketCodeData);
                            if (data.marketCodeData.length == 1) {
                              // auto fill thi truong
                              let dataDropdownMarketCode = data.marketCodeData;
                              setDataPageRecordInput(prevState => ({
                                ...prevState,
                                Marketcode: dataDropdownMarketCode[0].id,
                              }));

                              var marketCodeName =
                                dataDropdownMarketCode[0].name;
                              if (marketCodeName != undefined) {
                                setMarketCode(marketCodeName);
                              }

                              //api lay size
                              let dataResponse =
                                await CommonBase.getAsync<ResponseService>(
                                  ApiProductionRecord.GET_DATA_BY_FILTER +
                                    '?Type=' +
                                    FilterRecord.SizeCode +
                                    '&Workcenterid=' +
                                    workCenterId +
                                    '&Workordercode=' +
                                    dataDropdownWorkOrderCode[0].id +
                                    '&Mainproductcode=' +
                                    dataDropdownMainCodeData[0].id +
                                    '&Subproductcode=' +
                                    dataDropdownSubCode[0].id +
                                    '&Colorcode=' +
                                    dataDropdownColorCode[0].id +
                                    '&Seasoncode=' +
                                    dataDropdownSeason[0].id +
                                    '&Marketcode=' +
                                    dataDropdownMarketCode[0].id,
                                  null,
                                );
                              if (
                                typeof dataResponse !== 'string' &&
                                dataResponse != null &&
                                dataResponse.isSuccess === true
                              ) {
                                let data = {
                                  sizeCodeData: dataResponse.data,
                                };
                                setDataDropdownSize(data.sizeCodeData);
                                if (data.sizeCodeData.length == 1) {
                                  // auto fill size
                                  let dataDropdownSize = data.sizeCodeData;
                                  setDataPageRecordInput(prevState => ({
                                    ...prevState,
                                    Sizecode: dataDropdownSize[0].id,
                                  }));

                                  var sizeCodeName = dataDropdownSize[0].name;
                                  if (sizeCodeName != undefined) {
                                    setSizeCode(sizeCodeName);
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // lay ma hang
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct == '' &&
      subCode == '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == ''
    ) {
      // api lay ma hang
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.Maincodeproduct +
          '&Workcenterid=' +
          workCenterId +
          '&Workordercode=' +
          workOrderCode,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          MainCodeData: dataResponse.data,
        };
        setDataDropdownMainCode(data.MainCodeData);
        if (data.MainCodeData.length == 1) {
          // auto fill ma hang
          let dataDropdownMainCodeData = data.MainCodeData;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Maincodeproduct: dataDropdownMainCodeData[0].id,
          }));

          //api lay ma nho
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiProductionRecord.GET_DATA_BY_FILTER +
              '?Type=' +
              FilterRecord.Subcodeproduct +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              dataDropdownMainCodeData[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              subCodeData: dataResponse.data,
            };
            setDataDropdownSub(data.subCodeData);
            if (data.subCodeData.length == 1) {
              //auto fill ma nho
              let dataDropdownSubCode = data.subCodeData;
              setDataPageRecordInput(prevState => ({
                ...prevState,
                subCode: dataDropdownSubCode[0].id,
              }));

              // api lay ma mau
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiProductionRecord.GET_DATA_BY_FILTER +
                  '?Type=' +
                  FilterRecord.Colorcode +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  workOrderCode +
                  '&Mainproductcode=' +
                  dataDropdownMainCodeData[0].id +
                  '&Subproductcode=' +
                  dataDropdownSubCode[0].id,
                null,
              );
              if (
                typeof dataResponse !== 'string' &&
                dataResponse != null &&
                dataResponse.isSuccess === true
              ) {
                let data = {
                  colorCodeData: dataResponse.data,
                };
                setDataDropdownColor(data.colorCodeData);
                if (data.colorCodeData.length == 1) {
                  // auto fill mau
                  let dataDropdownColorCode = data.colorCodeData;
                  setDataPageRecordInput(prevState => ({
                    ...prevState,
                    Color: dataDropdownColorCode[0].id,
                  }));

                  var colorName = dataDropdownColorCode[0].name;
                  if (colorName != undefined) {
                    setColorCode(colorName);
                  }

                  //api lay mua
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiProductionRecord.GET_DATA_BY_FILTER +
                      '?Type=' +
                      FilterRecord.Seasoncode +
                      '&Workcenterid=' +
                      workCenterId +
                      '&Workordercode=' +
                      workOrderCode +
                      '&Mainproductcode=' +
                      dataDropdownMainCodeData[0].id +
                      '&Subproductcode=' +
                      dataDropdownSubCode[0].id +
                      '&Colorcode=' +
                      dataDropdownColorCode[0].id,
                    null,
                  );
                  if (
                    typeof dataResponse !== 'string' &&
                    dataResponse != null &&
                    dataResponse.isSuccess === true
                  ) {
                    let data = {
                      seasonData: dataResponse.data,
                    };
                    setDataDropdownSeason(data.seasonData);
                    if (data.seasonData.length == 1) {
                      //auto fill mua
                      let dataDropdownSeason = data.seasonData;
                      setDataPageRecordInput(prevState => ({
                        ...prevState,
                        Seasoncode: dataDropdownSeason[0].id,
                      }));

                      var seasonName = dataDropdownSeason[0].name;
                      if (seasonName != undefined) {
                        setSeasonCode(seasonName);
                      }

                      //api lay thi truong
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiProductionRecord.GET_DATA_BY_FILTER +
                            '?Type=' +
                            FilterRecord.Marketcode +
                            '&Workcenterid=' +
                            workCenterId +
                            '&Workordercode=' +
                            workOrderCode +
                            '&Mainproductcode=' +
                            dataDropdownMainCodeData[0].id +
                            '&Subproductcode=' +
                            dataDropdownSubCode[0].id +
                            '&Colorcode=' +
                            dataDropdownColorCode[0].id +
                            '&Seasoncode=' +
                            dataDropdownSeason[0].id,
                          null,
                        );
                      if (
                        typeof dataResponse !== 'string' &&
                        dataResponse != null &&
                        dataResponse.isSuccess === true
                      ) {
                        let data = {
                          marketCodeData: dataResponse.data,
                        };
                        setDataDropdownMarket(data.marketCodeData);
                        if (data.marketCodeData.length == 1) {
                          // auto fill thi truong
                          let dataDropdownMarketCode = data.marketCodeData;
                          setDataPageRecordInput(prevState => ({
                            ...prevState,
                            Marketcode: dataDropdownMarketCode[0].id,
                          }));

                          var marketCodeName = dataDropdownMarketCode[0].name;
                          if (marketCodeName != undefined) {
                            setMarketCode(marketCodeName);
                          }

                          //api lay size
                          let dataResponse =
                            await CommonBase.getAsync<ResponseService>(
                              ApiProductionRecord.GET_DATA_BY_FILTER +
                                '?Type=' +
                                FilterRecord.SizeCode +
                                '&Workcenterid=' +
                                workCenterId +
                                '&Workordercode=' +
                                workOrderCode +
                                '&Mainproductcode=' +
                                dataDropdownMainCodeData[0].id +
                                '&Subproductcode=' +
                                dataDropdownSubCode[0].id +
                                '&Colorcode=' +
                                dataDropdownColorCode[0].id +
                                '&Seasoncode=' +
                                dataDropdownSeason[0].id +
                                '&Marketcode=' +
                                dataDropdownMarketCode[0].id,
                              null,
                            );
                          if (
                            typeof dataResponse !== 'string' &&
                            dataResponse != null &&
                            dataResponse.isSuccess === true
                          ) {
                            let data = {
                              sizeCodeData: dataResponse.data,
                            };
                            setDataDropdownSize(data.sizeCodeData);
                            if (data.sizeCodeData.length == 1) {
                              // auto fill size
                              let dataDropdownSize = data.sizeCodeData;
                              setDataPageRecordInput(prevState => ({
                                ...prevState,
                                Sizecode: dataDropdownSize[0].id,
                              }));

                              var sizeCodeName = dataDropdownSize[0].name;
                              if (sizeCodeName != undefined) {
                                setSizeCode(sizeCodeName);
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // lay ma nho
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      subCode == '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == ''
    ) {
      //api lay ma nho
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.Subcodeproduct +
          '&Workcenterid=' +
          workCenterId +
          '&Workordercode=' +
          workOrderCode +
          '&Mainproductcode=' +
          mainCodeProduct,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          subCodeData: dataResponse.data,
        };
        setDataDropdownSub(data.subCodeData);
        if (data.subCodeData.length == 1) {
          //auto fill ma nho
          let dataDropdownSubCode = data.subCodeData;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            subCode: dataDropdownSubCode[0].id,
          }));

          // api lay ma mau
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiProductionRecord.GET_DATA_BY_FILTER +
              '?Type=' +
              FilterRecord.Colorcode +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              mainCodeProduct +
              '&Subproductcode=' +
              dataDropdownSubCode[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              colorCodeData: dataResponse.data,
            };
            setDataDropdownColor(data.colorCodeData);
            if (data.colorCodeData.length == 1) {
              // auto fill mau
              let dataDropdownColorCode = data.colorCodeData;
              setDataPageRecordInput(prevState => ({
                ...prevState,
                Color: dataDropdownColorCode[0].id,
              }));

              var colorName = dataDropdownColorCode[0].name;
              if (colorName != undefined) {
                setColorCode(colorName);
              }

              //api lay mua
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiProductionRecord.GET_DATA_BY_FILTER +
                  '?Type=' +
                  FilterRecord.Seasoncode +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  workOrderCode +
                  '&Mainproductcode=' +
                  mainCodeProduct +
                  '&Subproductcode=' +
                  dataDropdownSubCode[0].id +
                  '&Colorcode=' +
                  dataDropdownColorCode[0].id,
                null,
              );
              if (
                typeof dataResponse !== 'string' &&
                dataResponse != null &&
                dataResponse.isSuccess === true
              ) {
                let data = {
                  seasonData: dataResponse.data,
                };
                setDataDropdownSeason(data.seasonData);
                if (data.seasonData.length == 1) {
                  //auto fill mua
                  let dataDropdownSeason = data.seasonData;
                  setDataPageRecordInput(prevState => ({
                    ...prevState,
                    Seasoncode: dataDropdownSeason[0].id,
                  }));

                  var seasonName = dataDropdownSeason[0].name;
                  if (seasonName != undefined) {
                    setSeasonCode(seasonName);
                  }

                  //api lay thi truong
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiProductionRecord.GET_DATA_BY_FILTER +
                      '?Type=' +
                      FilterRecord.Marketcode +
                      '&Workcenterid=' +
                      workCenterId +
                      '&Workordercode=' +
                      workOrderCode +
                      '&Mainproductcode=' +
                      mainCodeProduct +
                      '&Subproductcode=' +
                      dataDropdownSubCode[0].id +
                      '&Colorcode=' +
                      dataDropdownColorCode[0].id +
                      '&Seasoncode=' +
                      dataDropdownSeason[0].id,
                    null,
                  );
                  if (
                    typeof dataResponse !== 'string' &&
                    dataResponse != null &&
                    dataResponse.isSuccess === true
                  ) {
                    let data = {
                      marketCodeData: dataResponse.data,
                    };
                    setDataDropdownMarket(data.marketCodeData);
                    if (data.marketCodeData.length == 1) {
                      // auto fill thi truong
                      let dataDropdownMarketCode = data.marketCodeData;
                      setDataPageRecordInput(prevState => ({
                        ...prevState,
                        marketcode: dataDropdownMarketCode[0].id,
                      }));

                      var marketCodeName = dataDropdownMarketCode[0].name;
                      if (marketCodeName != undefined) {
                        setMarketCode(marketCodeName);
                      }

                      //api lay size
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiProductionRecord.GET_DATA_BY_FILTER +
                            '?Type=' +
                            FilterRecord.SizeCode +
                            '&Workcenterid=' +
                            workCenterId +
                            '&Workordercode=' +
                            workOrderCode +
                            '&Mainproductcode=' +
                            mainCodeProduct +
                            '&Subproductcode=' +
                            dataDropdownSubCode[0].id +
                            '&Colorcode=' +
                            dataDropdownColorCode[0].id +
                            '&Seasoncode=' +
                            dataDropdownSeason[0].id +
                            '&Marketcode=' +
                            dataDropdownMarketCode[0].id,
                          null,
                        );
                      if (
                        typeof dataResponse !== 'string' &&
                        dataResponse != null &&
                        dataResponse.isSuccess === true
                      ) {
                        let data = {
                          sizeCodeData: dataResponse.data,
                        };
                        setDataDropdownSize(data.sizeCodeData);
                        if (data.sizeCodeData.length == 1) {
                          // auto fill size
                          let dataDropdownSize = data.sizeCodeData;
                          setDataPageRecordInput(prevState => ({
                            ...prevState,
                            Sizecode: dataDropdownSize[0].id,
                          }));

                          var sizeCodeName = dataDropdownSize[0].name;
                          if (sizeCodeName != undefined) {
                            setSizeCode(sizeCodeName);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    // lay ma mau
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      subCode != '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == ''
    ) {
      // api lay ma mau
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.Colorcode +
          '&Workcenterid=' +
          workCenterId +
          '&Workordercode=' +
          workOrderCode +
          '&Mainproductcode=' +
          mainCodeProduct +
          '&Subproductcode=' +
          subCode,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          colorCodeData: dataResponse.data,
        };
        setDataDropdownColor(data.colorCodeData);
        if (data.colorCodeData.length == 1) {
          // auto fill mau
          let dataDropdownColorCode = data.colorCodeData;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Color: dataDropdownColorCode[0].id,
          }));

          var colorName = dataDropdownColorCode[0].name;
          if (colorName != undefined) {
            setColorCode(colorName);
          }

          //api lay mua
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiProductionRecord.GET_DATA_BY_FILTER +
              '?Type=' +
              FilterRecord.Seasoncode +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              mainCodeProduct +
              '&Subproductcode=' +
              subCode +
              '&Colorcode=' +
              dataDropdownColorCode[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              seasonData: dataResponse.data,
            };
            setDataDropdownSeason(data.seasonData);
            if (data.seasonData.length == 1) {
              //auto fill mua
              let dataDropdownSeason = data.seasonData;
              setDataPageRecordInput(prevState => ({
                ...prevState,
                Seasoncode: dataDropdownSeason[0].id,
              }));

              var seasonName = dataDropdownSeason[0].name;
              if (seasonName != undefined) {
                setSeasonCode(seasonName);
              }

              //api lay thi truong
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiProductionRecord.GET_DATA_BY_FILTER +
                  '?Type=' +
                  FilterRecord.Marketcode +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  workOrderCode +
                  '&Mainproductcode=' +
                  mainCodeProduct +
                  '&Subproductcode=' +
                  subCode +
                  '&Colorcode=' +
                  dataDropdownColorCode[0].id +
                  '&Seasoncode=' +
                  dataDropdownSeason[0].id,
                null,
              );
              if (
                typeof dataResponse !== 'string' &&
                dataResponse != null &&
                dataResponse.isSuccess === true
              ) {
                let data = {
                  marketCodeData: dataResponse.data,
                };
                setDataDropdownMarket(data.marketCodeData);
                if (data.marketCodeData.length == 1) {
                  // auto fill thi truong
                  let dataDropdownMarketCode = data.marketCodeData;
                  setDataPageRecordInput(prevState => ({
                    ...prevState,
                    Marketcode: dataDropdownMarketCode[0].id,
                  }));

                  var marketCodeName = dataDropdownMarketCode[0].name;
                  if (marketCodeName != undefined) {
                    setMarketCode(marketCodeName);
                  }

                  //api lay size
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiProductionRecord.GET_DATA_BY_FILTER +
                      '?Type=' +
                      FilterRecord.SizeCode +
                      '&Workcenterid=' +
                      workCenterId +
                      '&Workordercode=' +
                      workOrderCode +
                      '&Mainproductcode=' +
                      mainCodeProduct +
                      '&Subproductcode=' +
                      subCode +
                      '&Colorcode=' +
                      dataDropdownColorCode[0].id +
                      '&Seasoncode=' +
                      dataDropdownSeason[0].id +
                      '&Marketcode=' +
                      dataDropdownMarketCode[0].id,
                    null,
                  );
                  if (
                    typeof dataResponse !== 'string' &&
                    dataResponse != null &&
                    dataResponse.isSuccess === true
                  ) {
                    let data = {
                      sizeCodeData: dataResponse.data,
                    };
                    setDataDropdownSize(data.sizeCodeData);
                    if (data.sizeCodeData.length == 1) {
                      // auto fill size
                      let dataDropdownSize = data.sizeCodeData;
                      setDataPageRecordInput(prevState => ({
                        ...prevState,
                        Sizecode: dataDropdownSize[0].id,
                      }));

                      var sizeCodeName = dataDropdownSize[0].name;
                      if (sizeCodeName != undefined) {
                        setSizeCode(sizeCodeName);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    // lay mua
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      subCode != '' &&
      colorCode != '' &&
      seasonCode == '' &&
      marketCode == ''
    ) {
      //api lay mua
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.Seasoncode +
          '&Workcenterid=' +
          workCenterId +
          '&Workordercode=' +
          workOrderCode +
          '&Mainproductcode=' +
          mainCodeProduct +
          '&Subproductcode=' +
          subCode +
          '&Colorcode=' +
          colorCode,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          seasonData: dataResponse.data,
        };
        setDataDropdownSeason(data.seasonData);
        if (data.seasonData.length == 1) {
          //auto fill mua
          let dataDropdownSeason = data.seasonData;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Seasoncode: dataDropdownSeason[0].id,
          }));

          var seasonName = dataDropdownSeason[0].name;
          if (seasonName != undefined) {
            setSeasonCode(seasonName);
          }

          //api lay thi truong
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiProductionRecord.GET_DATA_BY_FILTER +
              '?Type=' +
              FilterRecord.Marketcode +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              mainCodeProduct +
              '&Subproductcode=' +
              subCode +
              '&Colorcode=' +
              colorCode +
              '&Seasoncode=' +
              dataDropdownSeason[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              marketCodeData: dataResponse.data,
            };
            setDataDropdownMarket(data.marketCodeData);
            if (data.marketCodeData.length == 1) {
              // auto fill thi truong
              let dataDropdownMarketCode = data.marketCodeData;
              setDataPageRecordInput(prevState => ({
                ...prevState,
                Marketcode: dataDropdownMarketCode[0].id,
              }));

              var marketCodeName = dataDropdownMarketCode[0].name;
              if (marketCodeName != undefined) {
                setMarketCode(marketCodeName);
              }

              //api lay size
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiProductionRecord.GET_DATA_BY_FILTER +
                  '?Type=' +
                  FilterRecord.SizeCode +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  workOrderCode +
                  '&Mainproductcode=' +
                  mainCodeProduct +
                  '&Subproductcode=' +
                  subCode +
                  '&Colorcode=' +
                  colorCode +
                  '&Seasoncode=' +
                  dataDropdownSeason[0].id +
                  '&Marketcode=' +
                  dataDropdownMarketCode[0].id,
                null,
              );
              if (
                typeof dataResponse !== 'string' &&
                dataResponse != null &&
                dataResponse.isSuccess === true
              ) {
                let data = {
                  sizeCodeData: dataResponse.data,
                };
                setDataDropdownSize(data.sizeCodeData);
                if (data.sizeCodeData.length == 1) {
                  // auto fill size
                  let dataDropdownSize = data.sizeCodeData;
                  setDataPageRecordInput(prevState => ({
                    ...prevState,
                    Sizecode: dataDropdownSize[0].id,
                  }));

                  var sizeCodeName = dataDropdownSize[0].name;
                  if (sizeCodeName != undefined) {
                    setSizeCode(sizeCodeName);
                  }
                }
              }
            }
          }
        }
      }
    }
    // thi truong
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      subCode != '' &&
      colorCode != '' &&
      seasonCode != '' &&
      marketCode == ''
    ) {
      //api lay thi truong
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.Marketcode +
          '&Workcenterid=' +
          workCenterId +
          '&Workordercode=' +
          workOrderCode +
          '&Mainproductcode=' +
          mainCodeProduct +
          '&Subproductcode=' +
          subCode +
          '&Colorcode=' +
          colorCode +
          '&Seasoncode=' +
          seasonCode,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          marketCodeData: dataResponse.data,
        };
        setDataDropdownMarket(data.marketCodeData);
        if (data.marketCodeData.length == 1) {
          // auto fill thi truong
          let dataDropdownMarketCode = data.marketCodeData;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Marketcode: dataDropdownMarketCode[0].id,
          }));

          var marketCodeName = dataDropdownMarketCode[0].name;
          if (marketCodeName != undefined) {
            setMarketCode(marketCodeName);
          }

          //api lay size
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiProductionRecord.GET_DATA_BY_FILTER +
              '?Type=' +
              FilterRecord.SizeCode +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              mainCodeProduct +
              '&Subproductcode=' +
              subCode +
              '&Colorcode=' +
              colorCode +
              '&Seasoncode=' +
              seasonCode +
              '&Marketcode=' +
              dataDropdownMarketCode[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              sizeCodeData: dataResponse.data,
            };
            setDataDropdownSize(data.sizeCodeData);
            if (data.sizeCodeData.length == 1) {
              // auto fill size
              let dataDropdownSize = data.sizeCodeData;
              setDataPageRecordInput(prevState => ({
                ...prevState,
                Sizecode: dataDropdownSize[0].id,
              }));

              var sizeCodeName = dataDropdownSize[0].name;
              if (sizeCodeName != undefined) {
                setSizeCode(sizeCodeName);
              }
            }
          }
        }
      }
    }
    // lay size
    if (
      workCenterId != '' &&
      mainCodeProduct != '' &&
      colorCode != '' &&
      subCode != '' &&
      marketCode != '' &&
      seasonCode != '' &&
      workOrderCode != ''
    ) {
      // api lay size
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.SizeCode +
          '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              mainCodeProduct +
              '&Subproductcode=' +
              subCode +
              '&Colorcode=' +
              colorCode +
              '&Seasoncode=' +
              seasonCode +
              '&Marketcode=' +
              marketCode,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          SizeCode: dataResponse.data,
        };
        setDataDropdownSize(data.SizeCode);
        if (data.SizeCode.length == 1) {
          // auto fill size
          let dataDropdownSize = data.SizeCode;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Sizecode: dataDropdownSize[0].id,
            qtyNow: '',
          }));

          var sizeCodeName = dataDropdownSize[0].name;
          if (sizeCodeName != undefined) {
            setSizeCode(sizeCodeName);
          }
        }
      }
    }
  };

  const getDataDropDownByFilter = async (
    workCenterId: string,
    workOrderCode: string,
    mainCodeProduct: string,
    subCode: string,
    colorCode: string,
    seasonCode: string,
    marketCode: string,
  ) => {
    setErrors([]);
    // lay lệnh sx
    if (
      workCenterId != '' &&
      workOrderCode == '' &&
      mainCodeProduct == '' &&
      subCode == '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == ''
    ) {
      //api lay lenh sx
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.Workordercode +
          '&Workcenterid=' +
          workCenterId,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          Workordercode: dataResponse.data,
        };
        setDataDropdownWorkordercode(data.Workordercode);
        if (data.Workordercode.length == 1) {
          // auto fill lenh sx
          let dataDropdownWorkordercode = data.Workordercode;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Workordercode: dataDropdownWorkordercode[0].id,
          }));

          //api lay ma hang
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiProductionRecord.GET_DATA_BY_FILTER +
              '?Type=' +
              FilterRecord.Maincodeproduct +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              dataDropdownWorkordercode[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              mainProductCodeData: dataResponse.data,
            };
            if (data.mainProductCodeData.length > 0) {
              // auto fill ma hang
              let dataDropdownMainCode = data.mainProductCodeData;
              setDataPageRecordInput(prevState => ({
                ...prevState,
                Maincodeproduct: dataDropdownMainCode[0].id,
              }));

              //api lay ma nho
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiProductionRecord.GET_DATA_BY_FILTER +
                  '?Type=' +
                  FilterRecord.Subcodeproduct +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  dataDropdownWorkordercode[0].id +
                  '&Mainproductcode=' +
                  dataDropdownMainCode[0].id,
                null,
              );
              if (
                typeof dataResponse !== 'string' &&
                dataResponse != null &&
                dataResponse.isSuccess === true
              ) {
                let data = {
                  subCodeData: dataResponse.data,
                };
                if (data.subCodeData.length > 0) {
                  // auto fill ma nho
                  let dataDropdownSub = data.subCodeData;
                  setDataShowColor(dataDropdownSub[0].name);
                  setDataPageRecordInput(prevState => ({
                    ...prevState,
                    subCode: dataDropdownSub[0].id,
                  }));

                  //api lay mau
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiProductionRecord.GET_DATA_BY_FILTER +
                      '?Type=' +
                      FilterRecord.Colorcode +
                      '&Workcenterid=' +
                      workCenterId +
                      '&Workordercode=' +
                      dataDropdownWorkordercode[0].id +
                      '&Mainproductcode=' +
                      dataDropdownMainCode[0].id,
                    null,
                  );
                  if (
                    typeof dataResponse !== 'string' &&
                    dataResponse != null &&
                    dataResponse.isSuccess === true
                  ) {
                    let data = {
                      colorCodeData: dataResponse.data,
                    };
                    if (data.colorCodeData.length > 0) {
                      // auto fill mau
                      let dataDropdownColor = data.colorCodeData;
                      setDataShowColor(dataDropdownColor[0].name);
                      setDataPageRecordInput(prevState => ({
                        ...prevState,
                        Color: dataDropdownColor[0].id,
                      }));

                      //api lay mua
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiProductionRecord.GET_DATA_BY_FILTER +
                            '?Type=' +
                            FilterRecord.Seasoncode +
                            '&Workcenterid=' +
                            workCenterId +
                            '&Workordercode=' +
                            dataDropdownWorkordercode[0].id +
                            '&Mainproductcode=' +
                            dataDropdownMainCode[0].id +
                            '&Subproductcode=' +
                            dataDropdownSub[0].id +
                            '&Colorcode=' +
                            dataDropdownColor[0].id,
                          null,
                        );
                      if (
                        typeof dataResponse !== 'string' &&
                        dataResponse != null &&
                        dataResponse.isSuccess === true
                      ) {
                        let data = {
                          seasonCodeData: dataResponse.data,
                        };
                        if (data.seasonCodeData.length > 0) {
                          // auto fill mua
                          let dataDropdownSeasonCode = data.seasonCodeData;
                          setDataShowSeason(dataDropdownSeasonCode[0].name);
                          setDataPageRecordInput(prevState => ({
                            ...prevState,
                            Seasoncode: dataDropdownSeasonCode[0].id,
                          }));

                          //api lay thi truong
                          let dataResponse =
                            await CommonBase.getAsync<ResponseService>(
                              ApiProductionRecord.GET_DATA_BY_FILTER +
                                '?Type=' +
                                FilterRecord.Marketcode +
                                '&Workcenterid=' +
                                workCenterId +
                                '&Workordercode=' +
                                dataDropdownWorkordercode[0].id +
                                '&Mainproductcode=' +
                                dataDropdownMainCode[0].id +
                                '&Subproductcode=' +
                                dataDropdownSub[0].id +
                                '&Colorcode=' +
                                dataDropdownColor[0].id +
                                '&Seasoncode=' +
                                dataDropdownSeasonCode[0].id,
                              null,
                            );
                          if (
                            typeof dataResponse !== 'string' &&
                            dataResponse != null &&
                            dataResponse.isSuccess === true
                          ) {
                            let data = {
                              marketCodeData: dataResponse.data,
                            };
                            setDataDropdownMarket(data.marketCodeData);
                            if (data.marketCodeData.length == 1) {
                              // auto fill thi truong
                              let dataDropdownMarket = data.marketCodeData;
                              setDataPageRecordInput(prevState => ({
                                ...prevState,
                                Marketcode: dataDropdownMarket[0].id,
                              }));

                              //api lay size
                              let dataResponse =
                                await CommonBase.getAsync<ResponseService>(
                                  ApiProductionRecord.GET_DATA_BY_FILTER +
                                    '?Type=' +
                                    FilterRecord.SizeCode +
                                    '&Workcenterid=' +
                                    workCenterId +
                                    '&Workordercode=' +
                                    dataDropdownWorkordercode[0].id +
                                    '&Mainproductcode=' +
                                    dataDropdownMainCode[0].id +
                                    '&Subproductcode=' +
                                    dataDropdownSub[0].id +
                                    '&Colorcode=' +
                                    dataDropdownColor[0].id +
                                    '&Seasoncode=' +
                                    dataDropdownSeasonCode[0].id +
                                    '&Marketcode=' +
                                    dataDropdownMarket[0].id,
                                  null,
                                );
                              if (
                                typeof dataResponse !== 'string' &&
                                dataResponse != null &&
                                dataResponse.isSuccess === true
                              ) {
                                let data = {
                                  sizeCodeData: dataResponse.data,
                                };
                                setDataDropdownSize(data.sizeCodeData);
                                if (data.sizeCodeData.length == 1) {
                                  // auto fill size
                                  let dataDropdownSize = data.sizeCodeData;
                                  setDataPageRecordInput(prevState => ({
                                    ...prevState,
                                    Sizecode: dataDropdownSize[0].id,
                                  }));
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // lay mau + mua + thi truong
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct == '' &&
      subCode == '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == ''
    ) {
      //api lay ma hang
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.Maincodeproduct +
          '&Workcenterid=' +
          workCenterId +
          '&Workordercode=' +
          workOrderCode,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          mainProductCodeData: dataResponse.data,
        };
        if (data.mainProductCodeData.length == 1) {
          // auto fill ma hang
          let dataDropdownMainCode = data.mainProductCodeData;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Maincodeproduct: dataDropdownMainCode[0].id,
          }));

          //api lay ma nho
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiProductionRecord.GET_DATA_BY_FILTER +
              '?Type=' +
              FilterRecord.Subcodeproduct +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              dataDropdownMainCode[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              subCodeData: dataResponse.data,
            };
            if (data.subCodeData.length > 0) {
              // auto fill ma nho
              let dataDropdownSub = data.subCodeData;
              setDataPageRecordInput(prevState => ({
                ...prevState,
                subCode: dataDropdownSub[0].id,
              }));

              //api lay mau
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiProductionRecord.GET_DATA_BY_FILTER +
                  '?Type=' +
                  FilterRecord.Colorcode +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  workOrderCode +
                  '&Mainproductcode=' +
                  dataDropdownMainCode[0].id,
                null,
              );
              if (
                typeof dataResponse !== 'string' &&
                dataResponse != null &&
                dataResponse.isSuccess === true
              ) {
                let data = {
                  colorCodeData: dataResponse.data,
                };
                if (data.colorCodeData.length > 0) {
                  // auto fill mau
                  let dataDropdownColor = data.colorCodeData;
                  setDataShowColor(dataDropdownColor[0].name);
                  setDataPageRecordInput(prevState => ({
                    ...prevState,
                    Color: dataDropdownColor[0].id,
                  }));

                  //api lay mua
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiProductionRecord.GET_DATA_BY_FILTER +
                      '?Type=' +
                      FilterRecord.Seasoncode +
                      '&Workcenterid=' +
                      workCenterId +
                      '&Workordercode=' +
                      workOrderCode +
                      '&Mainproductcode=' +
                      dataDropdownMainCode[0].id +
                      '&Subproductcode=' +
                      dataDropdownSub[0].id +
                      '&Colorcode=' +
                      dataDropdownColor[0].id,
                    null,
                  );
                  if (
                    typeof dataResponse !== 'string' &&
                    dataResponse != null &&
                    dataResponse.isSuccess === true
                  ) {
                    let data = {
                      seasonCodeData: dataResponse.data,
                    };

                    if (data.seasonCodeData.length > 0) {
                      // auto fill mua
                      let dataDropdownSeasonCode = data.seasonCodeData;
                      setDataShowSeason(dataDropdownSeasonCode[0].name);
                      setDataPageRecordInput(prevState => ({
                        ...prevState,
                        Seasoncode: dataDropdownSeasonCode[0].id,
                      }));

                      //api lay thi truong
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiProductionRecord.GET_DATA_BY_FILTER +
                            '?Type=' +
                            FilterRecord.Marketcode +
                            '&Workcenterid=' +
                            workCenterId +
                            '&Workordercode=' +
                            workOrderCode +
                            '&Mainproductcode=' +
                            dataDropdownMainCode[0].id +
                            '&Subproductcode=' +
                            dataDropdownSub[0].id +
                            '&Colorcode=' +
                            dataDropdownColor[0].id +
                            '&Seasoncode=' +
                            dataDropdownSeasonCode[0].id,
                          null,
                        );
                      if (
                        typeof dataResponse !== 'string' &&
                        dataResponse != null &&
                        dataResponse.isSuccess === true
                      ) {
                        let data = {
                          marketCodeData: dataResponse.data,
                        };
                        setDataDropdownMarket(data.marketCodeData);
                        if (data.marketCodeData.length == 1) {
                          // auto fill thi truong
                          let dataDropdownMarket = data.marketCodeData;
                          setDataPageRecordInput(prevState => ({
                            ...prevState,
                            Marketcode: dataDropdownMarket[0].id,
                          }));

                          //api lay size
                          let dataResponse =
                            await CommonBase.getAsync<ResponseService>(
                              ApiProductionRecord.GET_DATA_BY_FILTER +
                                '?Type=' +
                                FilterRecord.SizeCode +
                                '&Workcenterid=' +
                                workCenterId +
                                '&Workordercode=' +
                                workOrderCode +
                                '&Mainproductcode=' +
                                dataDropdownMainCode[0].id +
                                '&Subproductcode=' +
                                dataDropdownSub[0].id +
                                '&Colorcode=' +
                                dataDropdownColor[0].id +
                                '&Seasoncode=' +
                                dataDropdownSeasonCode[0].id +
                                '&Marketcode=' +
                                dataDropdownMarket[0].id,
                              null,
                            );
                          if (
                            typeof dataResponse !== 'string' &&
                            dataResponse != null &&
                            dataResponse.isSuccess === true
                          ) {
                            let data = {
                              sizeCodeData: dataResponse.data,
                            };
                            setDataDropdownSize(data.sizeCodeData);
                            if (data.sizeCodeData.length == 1) {
                              // auto fill size
                              let dataDropdownSize = data.sizeCodeData;
                              setDataPageRecordInput(prevState => ({
                                ...prevState,
                                Sizecode: dataDropdownSize[0].id,
                              }));
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // lay thi truong
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      subCode != '' &&
      colorCode != '' &&
      seasonCode != '' &&
      marketCode == ''
    ) {
      //api lay thi truong
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.Marketcode +
          '&Workcenterid=' +
          workCenterId +
          '&Workordercode=' +
          workOrderCode +
          '&Mainproductcode=' +
          mainCodeProduct +
          '&Subproductcode=' +
          subCode +
          '&Colorcode=' +
          colorCode +
          '&Seasoncode=' +
          seasonCode,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          marketCodeData: dataResponse.data,
        };
        setDataDropdownMarket(data.marketCodeData);
        if (data.marketCodeData.length == 1) {
          // auto fill thi truong
          let dataDropdownMarket = data.marketCodeData;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Marketcode: dataDropdownMarket[0].id,
          }));

          //api lay size
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiProductionRecord.GET_DATA_BY_FILTER +
              '?Type=' +
              FilterRecord.SizeCode +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              mainCodeProduct +
              '&Subproductcode=' +
              subCode +
              '&Colorcode=' +
              colorCode +
              '&Seasoncode=' +
              seasonCode +
              '&Marketcode=' +
              dataDropdownMarket[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              sizeCodeData: dataResponse.data,
            };
            setDataDropdownSize(data.sizeCodeData);
            if (data.sizeCodeData.length == 1) {
              // auto fill size
              let dataDropdownSize = data.sizeCodeData;
              setDataPageRecordInput(prevState => ({
                ...prevState,
                Sizecode: dataDropdownSize[0].id,
              }));
            }
          }
        }
      }
    }

    // lay mua
    if (
      workCenterId != '' &&
      mainCodeProduct != '' &&
      subCode != '' &&
      colorCode != '' &&
      seasonCode != '' &&
      workOrderCode != '' &&
      marketCode != ''
    ) {
      //api lay size
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionRecord.GET_DATA_BY_FILTER +
          '?Type=' +
          FilterRecord.SizeCode +
          '&Workcenterid=' +
          workCenterId +
          '&Workordercode=' +
          workOrderCode +
          '&Mainproductcode=' +
          mainCodeProduct +
          '&Subproductcode=' +
          subCode +
          '&Colorcode=' +
          colorCode +
          '&Seasoncode=' +
          seasonCode +
          '&Marketcode=' +
          marketCode,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          sizeCodeData: dataResponse.data,
        };
        setDataDropdownSize(data.sizeCodeData);
        if (data.sizeCodeData.length == 1) {
          // auto fill size
          let dataDropdownSize = data.sizeCodeData;
          setDataPageRecordInput(prevState => ({
            ...prevState,
            Sizecode: dataDropdownSize[0].id,
          }));
        }
      }
    }
  };

  const onPressHandleClose = () => {
    clearData();
    navigation.navigate('HomePageScreen');
  };

  const handleOnchangeQty = (event: any) => {
    const value = event.nativeEvent.text;
    let error = validateField(
      value,
      RuleOfDataInfo,
      'QtyCutPart',
      errorOfDataInfo,
    );
    setErrorOfDataInfo([...error]);
    setDataInfo(prevState => ({
      ...prevState,
      QtyCutPartNew: value,
    }));
    setIsInProgress(false);
    //setIsOpenModalPlus(true)
  };

  const handleOnchangeQtySL = (event: any) => {
    const value = event.nativeEvent.text;
    let error = validateField(
      value,
      RuleOfDataInfo,
      'Qtydone',
      errorOfDataInfo,
    );
    setErrorOfDataInfo([...error]);
    setDataInfo(prevState => ({
      ...prevState,
      Qtydone: value,
    }));
    setIsInProgress(false);
    //setIsOpenModalPlus(true)
  };

  const handleOnchangeQtyInputInline = (event: any) => {
    const value = event.nativeEvent.text;
    let error = validateField(
      value,
      RuleOfDataInfo,
      'QtyInputInline',
      errorOfDataInfo,
    );
    setErrorOfDataInfo([...error]);
    setDataInfo(prevState => ({
      ...prevState,
      QtyInputInline: value,
    }));
    setIsInProgress(false);
    //setIsOpenModalPlus(true)
  };

  const HandleShowErrorText = () => {
    return (
      <>
        <View
          style={{
            backgroundColor: '#E7F2FF',
            flexDirection: 'row',
            padding: 10,
            width: '100%',
            marginTop: 20,
            paddingTop: 8,
            paddingLeft: 12,
            paddingRight: 12,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path
              d="M10 11.075C10.2167 11.075 10.396 11.004 10.538 10.862C10.6793 10.7207 10.75 10.5417 10.75 10.325V5.8C10.75 5.6 10.6793 5.429 10.538 5.287C10.396 5.14567 10.2167 5.075 10 5.075C9.78333 5.075 9.60433 5.14567 9.463 5.287C9.321 5.429 9.25 5.60833 9.25 5.825V10.35C9.25 10.55 9.321 10.7207 9.463 10.862C9.60433 11.004 9.78333 11.075 10 11.075ZM10 14.725C10.2333 14.725 10.425 14.65 10.575 14.5C10.725 14.35 10.8 14.1583 10.8 13.925C10.8 13.6917 10.725 13.5 10.575 13.35C10.425 13.2 10.2333 13.125 10 13.125C9.76667 13.125 9.575 13.2 9.425 13.35C9.275 13.5 9.2 13.6917 9.2 13.925C9.2 14.1583 9.275 14.35 9.425 14.5C9.575 14.65 9.76667 14.725 10 14.725ZM10 19.5C8.68333 19.5 7.446 19.25 6.288 18.75C5.12933 18.25 4.125 17.575 3.275 16.725C2.425 15.875 1.75 14.8707 1.25 13.712C0.75 12.554 0.5 11.3167 0.5 10C0.5 8.68333 0.75 7.44567 1.25 6.287C1.75 5.129 2.425 4.125 3.275 3.275C4.125 2.425 5.12933 1.75 6.288 1.25C7.446 0.75 8.68333 0.5 10 0.5C11.3167 0.5 12.5543 0.75 13.713 1.25C14.871 1.75 15.875 2.425 16.725 3.275C17.575 4.125 18.25 5.129 18.75 6.287C19.25 7.44567 19.5 8.68333 19.5 10C19.5 11.3167 19.25 12.554 18.75 13.712C18.25 14.8707 17.575 15.875 16.725 16.725C15.875 17.575 14.871 18.25 13.713 18.75C12.5543 19.25 11.3167 19.5 10 19.5ZM10 18C12.2167 18 14.1043 17.221 15.663 15.663C17.221 14.1043 18 12.2167 18 10C18 7.78333 17.221 5.89567 15.663 4.337C14.1043 2.779 12.2167 2 10 2C7.78333 2 5.896 2.779 4.338 4.337C2.77933 5.89567 2 7.78333 2 10C2 12.2167 2.77933 14.1043 4.338 15.663C5.896 17.221 7.78333 18 10 18Z"
              fill="#004B72"
            />
          </Svg>
          <Text
            style={{
              color: '#004B72',
              paddingLeft: 5,
              fontFamily: 'Mulish-Bold',
              fontSize: 14,
            }}>
            Đầu cắt part gần nhất đang là: {dataInfo.QtyCutPartOld}
          </Text>
        </View>
      </>
    );
  };

  useEffect(() => {
    const getData = async () => {
      const dataToken: any = await Storage.getItem('evomes_token_info');
      if (dataToken != null && dataToken != undefined) {
        const decodedToken = jwt_decode<Token>(JSON.parse(dataToken).token);
        const tennet = decodedToken.TenantName;
        if (tennet != '' && tennet != undefined) {
          setIsShowButton(true);
          setIsOnCLoud(true);
        } else {
          setIsShowButton(false);
          setIsDayBefore(false);
        }
      } else {
        setIsShowButton(false);
        setIsDayBefore(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    getDataInfo();
  }, [isOpenModal]);

  useEffect(() => {
    if (dataPageRecordInput.Sizecode) {
      async function handleSKU() {
        await getDataSKU();
      }
      handleSKU();
    }
  }, [dataPageRecordInput.Sizecode]);

  useEffect(() => {
    getDataInfo();
  }, [dataPageRecordInput.TimeSlot]);

  useEffect(() => {
    if (refreshing == true) {
      getDataDropdownWorkCenter();
      clearData();
    }
  }, [refreshing]);

  useEffect(() => {
    if (isFocused == true) {
      baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
      getDataDropdownTimeSlot();
      setIsOpenModalPlus(true);
      getDataDropdownWorkCenter();
      let dataRequestReducer: IDataPageRecordInput = {
        Workcenterid: '' || dataPageRecordSX.Workcenterid,
        Workordercode: '' || dataPageRecordSX.Workordercode,
        ItemCode: '' || dataPageRecordSX.ItemCode,
        Color: '' || dataPageRecordSX.Color,
        subCode: '' || dataPageRecordSX.subCode,
        Maincodeproduct: '' || dataPageRecordSX.Maincodeproduct,
        Seasoncode: '' || dataPageRecordSX.Seasoncode,
        Marketcode: '' || dataPageRecordSX.Marketcode,
        Sizecode: '' || dataPageRecordSX.Sizecode,
        DateRecord: date,
        TimeSlot: '' || dataPageRecordSX.TimeSlot,
      };
      baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
      //setListWorkordercode(dataDropdown)
      setDataPageRecordInput(dataRequestReducer);
    } else {
      clearData();
      let dataRequestReducer: IDataPageRecordInput = {
        Workcenterid: '' || dataPageRecordSX.Workcenterid,
        Workordercode: '' || dataPageRecordSX.Workordercode,
        ItemCode: '' || dataPageRecordSX.ItemCode,
        Color: '' || dataPageRecordSX.Color,
        subCode: '' || dataPageRecordSX.subCode,
        Maincodeproduct: '' || dataPageRecordSX.Maincodeproduct,
        Seasoncode: '' || dataPageRecordSX.Seasoncode,
        Marketcode: '' || dataPageRecordSX.Marketcode,
        Sizecode: '' || dataPageRecordSX.Sizecode,
        DateRecord: date,
        TimeSlot: '' || dataPageRecordSX.TimeSlot,
      };
      setDataPageRecordInput(dataRequestReducer);
    }
  }, [isFocused]);

  const insets = useSafeAreaInsets();
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
          title="Ghi nhận sản lượng may"
          hidenStatusBar={true}
          isShowIconRight={true}
        />
      </LinearGradient>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* <View style={styles.header}>
                    <Text style={styles.textHeaderLabel}>
                        Nhập số lượng ghi nhận
                    </Text>
                </View> */}

        <View
          style={
            {
              // height:
              //   dataPageRecordInput.TimeSlot != null &&
              //   dataPageRecordInput.TimeSlot == 'CA5'
              //     ? deviceHeight -
              //       styles.header.height -
              //       (deviceHeight - (deviceHeight * 78) / 100)
              //     : deviceHeight -
              //       styles.header.height -
              //       (deviceHeight - (deviceHeight * 71) / 100),
              // shadowColor: '#00000',
              // shadowOpacity: 0.8,
              // elevation: 8,
            }
          }>
          <View style={styles.content}>
            {/* ngay ghi nhan */}
            <View style={styles.textInputContent}>
              <View style={{width: 120, justifyContent: 'center'}}>
                <Text style={styles.label}>Ngày ghi nhận:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TouchableOpacity onPress={showDatePicker}>
                  <Text style={styles.datePickerBox}>
                    {dataPageRecordInput.DateRecord ?? selectedDate}
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

            {/* to sx */}
            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Tổ sản xuất:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownWorkCenter}
                  popupTitle="Tổ sản xuất"
                  title="Chọn tổ sản xuất"
                  styles={styles.inputBox}
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'Workcenterid',
                      errors,
                    );
                    setErrors([...error]);
                    if (data[0] != dataPageRecordInput.Workcenterid) {
                      setIsOpenModalPlus(true);
                    }
                    setDataPageRecordInput(stateOld => ({
                      ...stateOld,
                      Workcenterid: data[0],
                      Workordercode: '',
                      Maincodeproduct: '',
                      subCode: '',
                      Color: '',
                      Seasoncode: '',
                      Marketcode: '',
                      Sizecode: '',
                      TimeSlot: '',
                    }));
                    setErrors([]);
                    setErrorOfDataInfo([]);
                    setDataDropdownMainCode([]);
                    setDataDropdownSub([]);
                    setDataDropdownColor([]);
                    setDataDropdownSeason([]);
                    setDataDropdownWorkordercode([]);
                    setDataDropdownMarket([]);
                    setDataDropdownSize([]);
                    setIsInProgress(false);
                    setDataInfo(prevState => ({
                      ...prevState,
                      QtyInputInline: '',
                      QtyCutPartNew: '',
                      Qtydone: '',
                      QtyNeed: '',
                      QtyLK: '',
                    }));
                    let inputFilter = {
                      workCenterId: data[0],
                      workOrderCode: '',
                      mainCodeProduct: '',
                      subCodeColor: '',
                      colorCode: '',
                      marketCode: '',
                      seasonCode: '',
                      
                    };
                    if (isOnCloud == true) {
                      getDataDropDownByFilterCloud(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.subCodeColor,
                        inputFilter.colorCode,
                        inputFilter.seasonCode,
                        inputFilter.marketCode,
                      );
                    } else {
                      getDataDropDownByFilter(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.subCodeColor,
                        inputFilter.colorCode,
                        inputFilter.seasonCode,
                        inputFilter.marketCode,
                      );
                    }
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageRecordInput.Workcenterid]}
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

            {/* lenh sx */}
            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Lệnh SX:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownWorkordercode}
                  popupTitle="Lệnh sản xuất"
                  title="Chọn lệnh sản xuất"
                  styles={styles.inputBox}
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'Workordercode',
                      errors,
                    );
                    setErrors([...error]);
                    setIsOpenModalPlus(true);
                    setDataPageRecordInput(stateOld => ({
                      ...stateOld,
                      Workordercode: data[0],
                      Maincodeproduct: '',
                      subCode: '',
                      Color: '',
                      Seasoncode: '',
                      Marketcode: '',
                      Sizecode: '',
                      TimeSlot: '',
                    }));
                    setErrors([]);
                    setErrorOfDataInfo([]);
                    setDataDropdownMainCode([]);
                    setDataDropdownSub([]);
                    setDataDropdownColor([]);
                    setDataDropdownSeason([]);
                    setDataDropdownMarket([]);
                    setDataDropdownSize([]);
                    setIsInProgress(false);
                    setDataInfo(prevState => ({
                      ...prevState,
                      QtyInputInline: '',
                      QtyCutPartNew: '',
                      Qtydone: '',
                      QtyNeed: '',
                      QtyLK: '',
                    }));
                    let inputFilter = {
                      workCenterId: dataPageRecordInput.Workcenterid,
                      workOrderCode: data[0],
                      mainCodeProduct: '',
                      subCodeColor: '',
                      colorCode: '',
                      marketCode: '',
                      seasonCode: '',
                      
                    };
                    if (isOnCloud == true) {
                      getDataDropDownByFilterCloud(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.subCodeColor,
                        inputFilter.colorCode,
                        inputFilter.seasonCode,
                        inputFilter.marketCode,
                      );
                    } else {
                      getDataDropDownByFilter(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.subCodeColor,
                        inputFilter.colorCode,
                        inputFilter.seasonCode,
                        inputFilter.marketCode,
                      );
                    }
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageRecordInput.Workordercode]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item.fieldName == 'Workordercode') {
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

            {isOnCloud == false ? (
              <>
                {/* mau */}
                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Màu/ Mùa:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <Text style={styles.input}>
                      {dataShowColor ?? ''}/ {dataShowSeason ?? ''}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* ma hang */}
                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Mã hàng:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <SelectBaseVer2
                      listData={dataDropdownMainCode}
                      popupTitle="Mã hàng"
                      title="Chọn mã hàng"
                      styles={styles.inputBox}
                      onSelect={data => {
                        let error = validateField(
                          data[0],
                          Rules,
                          'Maincodeproduct',
                          errors,
                        );
                        setErrors([...error]);
                        setDataPageRecordInput(stateOld => ({
                          ...stateOld,
                          Maincodeproduct: data[0],
                          subCode: '',
                          Color: '',
                          Seasoncode: '',
                          Marketcode: '',
                          Sizecode: '',
                          TimeSlot: '',
                        }));
                        setErrors([]);
                        setErrorOfDataInfo([]);
                        setDataDropdownSub([]);
                        setDataDropdownColor([]);
                        setDataDropdownSeason([]);
                        setDataDropdownMarket([]);
                        setDataDropdownSize([]);
                        setIsInProgress(false);
                        setDataInfo(prevState => ({
                          ...prevState,
                          QtyInputInline: '',
                          QtyCutPartNew: '',
                          Qtydone: '',
                          QtyNeed: '',
                          QtyLK: '',
                        }));
                        let inputFilter = {
                          workCenterId: dataPageRecordInput.Workcenterid,
                          workOrderCode: dataPageRecordInput.Workordercode,
                          mainCodeProduct: data[0],
                          subCodeColor: '',
                          colorCode: '',
                          marketCode: '',
                          seasonCode: '',
                          
                        };
                        if (isOnCloud == true) {
                          getDataDropDownByFilterCloud(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                          );
                        } else {
                          getDataDropDownByFilter(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                          );
                        }
                      }}
                      stylesIcon={{
                        position: 'absolute',
                        zIndex: -1,
                        right: 10,
                        top: 15,
                      }}
                      valueArr={[dataPageRecordInput.Maincodeproduct]}
                      isSelectSingle={true}
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'Maincodeproduct') {
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

                {/* ma nho */}
                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Mã nhỏ:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <SelectBaseVer2
                      listData={dataDropdownSub}
                      popupTitle="Mã nhỏ"
                      title="Chọn mã nhỏ"
                      styles={styles.inputBox}
                      onSelect={data => {
                        let error = validateField(
                          data[0],
                          Rules,
                          'subCode',
                          errors,
                        );
                        setErrors([...error]);
                        setDataPageRecordInput(stateOld => ({
                          ...stateOld,
                          subCode: data[0],
                          Color: '',
                          Seasoncode: '',
                          Marketcode: '',
                          Sizecode: '',
                          TimeSlot: '',
                        }));
                        setErrors([]);
                        setErrorOfDataInfo([]);
                        setDataDropdownColor([]);
                        setDataDropdownSeason([]);
                        setDataDropdownMarket([]);
                        setDataDropdownSize([]);
                        setIsInProgress(false);
                        setDataInfo(prevState => ({
                          ...prevState,
                          QtyInputInline: '',
                          QtyCutPartNew: '',
                          Qtydone: '',
                          QtyNeed: '',
                          QtyLK: '',
                        }));
                        let inputFilter = {
                          workCenterId: dataPageRecordInput.Workcenterid,
                          workOrderCode: dataPageRecordInput.Workordercode,
                          mainCodeProduct: dataPageRecordInput.Maincodeproduct,
                          subCodeColor: data[0],
                          colorCode: '',
                          marketCode: '',
                          seasonCode: '',
                          
                        };
                        if (isOnCloud == true) {
                          getDataDropDownByFilterCloud(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                          );
                        } else {
                          getDataDropDownByFilter(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                          );
                        }
                      }}
                      stylesIcon={{
                        position: 'absolute',
                        zIndex: -1,
                        right: 10,
                        top: 15,
                      }}
                      valueArr={[dataPageRecordInput.subCode]}
                      isSelectSingle={true}
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'subCode') {
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

                {/* ma mau */}
                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Mã màu:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <SelectBaseVer2
                      listData={dataDropdownColor}
                      popupTitle="Mã màu"
                      title="Chọn mã màu"
                      styles={styles.inputBox}
                      onSelect={data => {
                        let error = validateField(
                          data[0],
                          Rules,
                          'Color',
                          errors,
                        );
                        setErrors([...error]);
                        setDataPageRecordInput(stateOld => ({
                          ...stateOld,
                          Color: data[0],
                          Seasoncode: '',
                          Marketcode: '',
                          Sizecode: '',
                          TimeSlot: '',
                        }));
                        setErrors([]);
                        setErrorOfDataInfo([]);
                        setDataDropdownSeason([]);
                        setDataDropdownMarket([]);
                        setDataDropdownSize([]);
                        setIsInProgress(false);
                        setDataInfo(prevState => ({
                          ...prevState,
                          QtyInputInline: '',
                          QtyCutPartNew: '',
                          Qtydone: '',
                          QtyNeed: '',
                          QtyLK: '',
                        }));
                        let inputFilter = {
                          workCenterId: dataPageRecordInput.Workcenterid,
                          workOrderCode: dataPageRecordInput.Workordercode,
                          mainCodeProduct: dataPageRecordInput.Maincodeproduct,
                          subCodeColor: dataPageRecordInput.subCode,
                          colorCode: data[0],
                          marketCode: '',
                          seasonCode: '',
                          
                        };
                        if (isOnCloud == true) {
                          getDataDropDownByFilterCloud(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                          );
                        } else {
                          getDataDropDownByFilter(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                          );
                        }
                        var colorName = dataDropdownColor.find(
                          x => x.id == data[0],
                        )?.name;
                        if (colorName != undefined) {
                          setColorCode(colorName);
                        }
                      }}
                      stylesIcon={{
                        position: 'absolute',
                        zIndex: -1,
                        right: 10,
                        top: 15,
                      }}
                      valueArr={[dataPageRecordInput.Color]}
                      isSelectSingle={true}
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'Color') {
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

                {/* ma mua */}
                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Mùa:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <SelectBaseVer2
                      listData={dataDropdownSeason}
                      popupTitle="Mã mùa"
                      title="Chọn mã mùa"
                      styles={styles.inputBox}
                      onSelect={data => {
                        let error = validateField(
                          data[0],
                          Rules,
                          'Seasoncode',
                          errors,
                        );
                        setErrors([...error]);
                        setDataPageRecordInput(stateOld => ({
                          ...stateOld,
                          Seasoncode: data[0],
                          Marketcode: '',
                          Sizecode: '',
                          TimeSlot: '',
                        }));
                        setErrors([]);
                        setErrorOfDataInfo([]);
                        setDataDropdownMarket([]);
                        setDataDropdownSize([]);
                        setIsInProgress(false);
                        setDataInfo(prevState => ({
                          ...prevState,
                          QtyInputInline: '',
                          QtyCutPartNew: '',
                          Qtydone: '',
                          QtyNeed: '',
                          QtyLK: '',
                        }));
                        let inputFilter = {
                          workCenterId: dataPageRecordInput.Workcenterid,
                          workOrderCode: dataPageRecordInput.Workordercode,
                          mainCodeProduct: dataPageRecordInput.Maincodeproduct,
                          subCodeColor: dataPageRecordInput.subCode,
                          colorCode: dataPageRecordInput.Color,
                          seasonCode: data[0],
                          marketCode: '',
                          
                        };
                        if (isOnCloud == true) {
                          getDataDropDownByFilterCloud(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                          );
                        } else {
                          getDataDropDownByFilter(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                          );
                        }
                        var seasonName = dataDropdownSeason.find(
                          x => x.id == data[0],
                        )?.name;
                        if (seasonName != undefined) {
                          setSeasonCode(seasonName);
                        }
                      }}
                      stylesIcon={{
                        position: 'absolute',
                        zIndex: -1,
                        right: 10,
                        top: 15,
                      }}
                      valueArr={[dataPageRecordInput.Seasoncode]}
                      isSelectSingle={true}
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'Seasoncode') {
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
              </>
            )}

            {/* thi thuong */}
            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Thị trường:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownMarket}
                  popupTitle="Thị trường"
                  title="Chọn thị trường"
                  styles={styles.inputBox}
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'Marketcode',
                      errors,
                    );
                    setErrors([...error]);
                    setDataPageRecordInput(stateOld => ({
                      ...stateOld,
                      Marketcode: data[0],
                      Sizecode: '',
                      TimeSlot: '',
                    }));
                    var marketCodeName = dataDropdownMarket.find(
                      x => x.id == data[0],
                    )?.name;
                    if (marketCodeName != undefined) {
                      setMarketCode(marketCodeName);
                    }
                    setErrors([]);
                    setErrorOfDataInfo([]);
                    setDataDropdownSize([]);
                    setIsInProgress(false);
                    setIsOpenModalPlus(true);
                    setDataInfo(prevState => ({
                      ...prevState,
                      QtyInputInline: '',
                      QtyCutPartNew: '',
                      Qtydone: '',
                      QtyNeed: '',
                      QtyLK: '',
                    }));
                    let inputFilter = {
                      workCenterId: dataPageRecordInput.Workcenterid,
                      workOrderCode: dataPageRecordInput.Workordercode,
                      mainCodeProduct: dataPageRecordInput.Maincodeproduct,
                      subCodeColor: dataPageRecordInput.subCode,
                      colorCode: dataPageRecordInput.Color,
                      seasonCode: dataPageRecordInput.Seasoncode,
                      marketCode: data[0],
                    };
                    if (isOnCloud == true) {
                      getDataDropDownByFilterCloud(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.subCodeColor,
                        inputFilter.colorCode,
                        inputFilter.seasonCode,
                        inputFilter.marketCode,
                      );
                    } else {
                      getDataDropDownByFilter(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.subCodeColor,
                        inputFilter.colorCode,
                        inputFilter.seasonCode,
                        inputFilter.marketCode,
                      );
                    }
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageRecordInput.Marketcode]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item.fieldName == 'Marketcode') {
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

            {/* size */}
            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Size:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownSize}
                  popupTitle="Size"
                  title="Chọn size"
                  styles={styles.inputBox}
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'Sizecode',
                      errors,
                    );
                    setErrors([...error]);
                    setDataPageRecordInput(stateOld => ({
                      ...stateOld,
                      Sizecode: data[0],
                      TimeSlot: '',
                    }));
                    var sizeCodeName = dataDropdownSize.find(
                      x => x.id == data[0],
                    )?.name;
                    if (sizeCodeName != undefined) {
                      setSizeCode(sizeCodeName);
                    }
                    setErrors([]);
                    setErrorOfDataInfo([]);
                    setIsInProgress(false);
                    setIsOpenModalPlus(true);
                    setDataInfo(prevState => ({
                      ...prevState,
                      QtyInputInline: '',
                      QtyCutPartNew: '',
                      Qtydone: '',
                    }));
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageRecordInput.Sizecode]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item.fieldName == 'Sizecode') {
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

            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Khung giờ:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={getTimeSlot}
                  styles={styles.inputBox}
                  title="Chọn khung giờ"
                  popupTitle="Khung giờ"
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'TimeSlot',
                      errors,
                    );
                    setErrors([...error]);
                    setErrorOfDataInfo([]);
                    setIsInProgress(false);
                    setDataPageRecordInput(stateOld => ({
                      ...stateOld,
                      TimeSlot: data[0],
                    }));
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageRecordInput.TimeSlot]}
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
            {dataPageRecordInput.TimeSlot != null &&
            dataPageRecordInput.TimeSlot == 'CA5' ? (
              <View style={styles.textInputContent}>
                <View style={{width: 120, justifyContent: 'center'}}>
                  <Text style={styles.label}>Vào chuyền trong ngày:</Text>
                </View>
                <View style={{width: deviceWidth - 100 - 20}}>
                  <TextInput
                    onChange={handleOnchangeQtyInputInline}
                    value={dataInfo.QtyInputInline + ''}
                    placeholder="Số lượng cắt part"
                    placeholderTextColor="#AAABAE"
                    keyboardType="numeric"
                    editable={isDayBefore == true ? false : true}
                    style={styles.inputBox}
                  />
                  {errorOfDataInfo && errorOfDataInfo.length > 0
                    ? errorOfDataInfo.map((item, j) => {
                        if (item?.fieldName == 'QtyInputInline') {
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
            ) : null}

            <View style={styles.textInputContent}>
              <View style={{width: 120, justifyContent: 'center'}}>
                <Text style={styles.label}>Đầu cắt part:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  onChange={handleOnchangeQty}
                  value={dataInfo.QtyCutPartNew + ''}
                  placeholder="Số lượng cắt part"
                  placeholderTextColor="#AAABAE"
                  keyboardType="numeric"
                  editable={isDayBefore == true ? false : true}
                  style={styles.inputBox}
                />
                {errorOfDataInfo && errorOfDataInfo.length > 0
                  ? errorOfDataInfo.map((item, j) => {
                      if (item?.fieldName == 'QtyCutPart') {
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

            <View style={styles.textInputContent}>
              <View style={{width: 120, justifyContent: 'center'}}>
                <Text style={styles.label}>Sản lượng:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  onChange={data => {
                    handleOnchangeQtySL(data);
                  }}
                  value={dataInfo?.Qtydone + ''}
                  placeholder="Sản lượng"
                  placeholderTextColor="#AAABAE"
                  keyboardType="numeric"
                  editable={isDayBefore == true ? false : true}
                  style={styles.inputBox}
                />
                {errorOfDataInfo && errorOfDataInfo.length > 0
                  ? errorOfDataInfo.map((item, j) => {
                      if (item?.fieldName == 'Qtydone') {
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
          </View>
        </View>

        <View style={styles.header2}>
          <Text style={styles.textHeaderLabel}>Thông tin tổng hợp</Text>
        </View>

        <View
          style={{
            height:
              deviceHeight -
              styles.submit.height -
              (deviceHeight - (deviceHeight * 52) / 100),
          }}>
          <View style={{...styles.content, paddingBottom: 20}}>
            <View style={styles.textInputContent}>
              <View style={{width: 120, justifyContent: 'center'}}>
                <Text style={styles.label}>SL còn lại trong lệnh SX:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <Text style={styles.input}>{dataInfo.QtyNeed}</Text>
              </View>
            </View>

            <View style={styles.textInputContent}>
              <View style={{width: 120, justifyContent: 'center'}}>
                <Text style={styles.label}>Lũy kế:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <Text style={styles.input}>{dataInfo.QtyLK}</Text>
              </View>
            </View>
            <HandleShowErrorText />
          </View>
        </View>
      </ScrollView>

      <View style={styles.submit}>
        <View style={{height: 40, width: '32%', paddingRight: 20}}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={onPressHandleClose}>
            <View>
              <Text style={{color: '#006496', fontFamily: 'Mulish-SemiBold'}}>
                {' '}
                Hủy{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{height: 40, width: '32%', paddingRight: 20}}>
          {isInProgress == false ? (
            <>
              {isDayBefore == false ? (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={checkQty}>
                  <View>
                    <Text style={{color: '#ffffff', fontFamily: 'Mulish-Bold'}}>
                      {' '}
                      Lưu{' '}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.disableButton} disabled={true}>
                  <View>
                    <Text style={{color: '#AAABAE', fontFamily: 'Mulish-Bold'}}>
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
                <Text style={{color: '#AAABAE', fontFamily: 'Mulish-Bold'}}>
                  {' '}
                  Lưu{' '}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        {isShowButton == true ? (
          <View style={{height: 40, width: '32%'}}>
            {isOpenModalPlus == false ? (
              <>
                {isDayBefore == false ? (
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => setIsOpenModal(true)}>
                    <View>
                      <Text
                        style={{color: '#ffffff', fontFamily: 'Mulish-Bold'}}>
                        Ghi nhận
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.disableButton}
                    disabled={true}>
                    <View>
                      <Text
                        style={{color: '#AAABAE', fontFamily: 'Mulish-Bold'}}>
                        Ghi nhận
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity style={styles.disableButton} disabled={true}>
                <View>
                  <Text style={{color: '#AAABAE', fontFamily: 'Mulish-Bold'}}>
                    Ghi nhận
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>

      {isRecordModalOpen == true ? (
        <ModalBase
          navigation={navigation}
          isOpenModalProps={isRecordModalOpen}
          title={'Ghi nhận sản lượng'}
          handleSetModal={(isModal: boolean) => {
            setRecordModalOpen(isModal);
          }}
          component={
            <ProductionSubmitRecordModal
              navigation={navigation}
              handleCancel={() => {
                setRecordModalOpen(false);
              }}
              handleSubmit={() => {
                getDataDropdownWorkCenter();
                clearData();
                setRecordModalOpen(false);
              }}
            />
          }
        />
      ) : null}

      {isOpenModalQtyNeed ? (
        <Modal
          isVisible={isOpenModalQtyNeed}
          //style={{ backgroundColor: '#ffffff', margin: 0 }}
          statusBarTranslucent={false}
          deviceHeight={deviceHeight}
          deviceWidth={deviceWidth}>
          <PopUpBase
            title={'Thông báo'}
            content={
              'SL đang lớn hơn tổng còn lại trong lệnh\n     Bạn có chắc chắn muốn ghi nhận ? '
            }
            handleClose={onPressCloseModalNeed}
            handleConfirm={onPressSubmitModalNeed}
          />
        </Modal>
      ) : null}

      {isOpenModal == true ? (
        <ModalBase
          navigation={navigation}
          isOpenModalProps={isOpenModal}
          title={'Ghi nhận sản lượng'}
          handleSetModal={(isModal: boolean) => {
            setIsOpenModal(isModal);
          }}
          component={
            <ProductionInputModal
              navigation={navigation}
              dataRecord={dataPageRecordInput}
              dataInfo={dataInfoForPlus}
              colorCode={colorCode}
              marketCode={marketCode}
              sizeCode={sizeCode}
              seasonCode={seasonCode}
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
    shadowOffset: {width: 1, height: 1},
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
  header2: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderBottomColor: '#001E31',
    height: 50,
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 40,
    fontWeight: '600',
    color: '#003858',
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
  productionRecordAction: bindActionCreators(productionRecordAction, dispatch),
  baseAction: bindActionCreators(baseAction, dispatch),
});
const mapStateToProps = createStructuredSelector({
  dataPageRecordSX,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(InputProductionRecordScreen);
