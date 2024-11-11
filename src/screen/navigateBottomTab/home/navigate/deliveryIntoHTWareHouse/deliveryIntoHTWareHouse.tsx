import {useCallback, useEffect, useState} from 'react';
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
import MyTitleHome from '../../../../share/base/component/myStatusBar/MyTitleHome';
import {
  CommonActions,
  DrawerActions,
  NavigationProp,
  useIsFocused,
} from '@react-navigation/native';
import moment from 'moment';
import Svg, {Path} from 'react-native-svg';
import SelectBaseVer2 from '../../../../share/base/component/selectBase/selectBaseVer2';
import baseAction from '../../../../base/saga/action';
import {
  IDataPageDeliveryHTWareHouse,
  IDataQty,
  IDropdown,
  ListFilterDeliveryHTWareHouse,
} from './types/deliveryIntoHTWareHouseTypes';
import CommonBase from '../../../../share/network/axios';
import {
  ApiDeliveryForWash,
  ApiDeliveryHTWareHouse,
  ApiProductionRecord,
  ResponseService,
} from '../../../../share/app/constantsApi';
import {
  IError,
  IRule,
  typeVadilate,
  validateField,
  validateForm,
} from '../../../../share/commonVadilate/validate';
import {Regex} from '../../../../share/app/regex';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import PopUpBase from '../../../../share/base/component/popUp/popUpBase';
import Modal from 'react-native-modal';
import {FilterRecord} from '../productionRecord/types/enum/productionRecord';
import {connect} from 'react-redux';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import Storage from '../../../../share/storage/storage';
import {Token} from '../qualityControl/QAScreen';
import jwt_decode from 'jwt-decode';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

export interface DeliveryIntoHTWareHouseProps {
  navigation: NavigationProp<any, any>;
  baseAction: typeof baseAction;
  // dataPageDelivery: IDataPageDeliverySemiFinishProduct,
  // dataDropdown: IDropdown[]
}

const Rules: IRule[] = [
  {
    field: 'qtyStorage',
    required: true,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: 'SL chưa được thay đổi',
      minLength: '',
      maxLength: 'Giá trị không vượt quá 10 kí tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    },
  },
  {
    field: 'qtyPlus',
    required: false,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.Number_Negative,
    valueCheck: Regex.Regex_integer_with_negative,
    maxValue: 0,
    messages: {
      required: 'Vui lòng kiểm tra lại số lượng',
      minLength: '',
      maxLength: 'Giá trị không vượt quá 10 kí tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    },
  },
  {
    field: 'dateRecord',
    required: true,
    maxLength: 10,
    minLength: 10,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Ngày tạo phiếu không được bỏ trống',
      minLength: 'Giá trị không hợp lệ',
      maxLength: 'Giá trị không hợp lệ',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'workCenterId',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Tổ SX không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'mainProductCode',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Mã hàng không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'colorCode',
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
    field: 'subProductCode',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Mã nhỏ không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'marketcode',
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
    field: 'seasonCode',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Mã mùa không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'workOrderCode',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Lệnh SX không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
  {
    field: 'sizeCode',
    required: true,
    maxLength: 255,
    minLength: 0,
    typeValidate: 0,
    valueCheck: false,
    maxValue: 0,
    messages: {
      required: 'Mã Size không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
];

let localTime = new Date();
let date = moment(localTime).format('DD/MM/YYYY');

const DeliveryIntoHTWareHouseScreen: React.FC<DeliveryIntoHTWareHouseProps> = ({
  navigation,
  baseAction,
}) => {
  const [isInProgress, setIsInProgress] = useState<boolean>(false);
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  const [errors, setErrors] = useState<IError[]>([]);
  const [dataPageInput, setdataPageInput] =
    useState<IDataPageDeliveryHTWareHouse>({
      dateRecord: date,
      workCenterId: '',
      mainProductCode: '',
      colorCode: '',
      subProductCode: '',
      marketcode: '',
      seasonCode: '',
      workOrderCode: '',
      sizeCode: '',
      qtyStorage: '',
    });
  const [dataQty, setDataQty] = useState<IDataQty>({
    QtyKH: 0,
    QtyLKStorage: 0,
    QtyTatolSX: 0,
  });

  const [isOnCloud, setIsOnCLoud] = useState<boolean>(false);
  const [isDayBefore, setIsDayBefore] = useState<boolean>(false);

  const [checkData, setCheckData] = useState<number>();
  const [dataDropdownWorkCenter, setDataDropdownWorkCenter] = useState<
    IDropdown[]
  >([]);
  const [dataDropdownMainCode, setDataDropdownMainCode] = useState<IDropdown[]>(
    [],
  );
  const [dataDropdownColor, setDataDropdownColor] = useState<IDropdown[]>([]);
  const [dataDropdownWorkOrderCode, setDataDropdownWorkOrderCode] = useState<
    IDropdown[]
  >([]);
  const [dataDropdownSubCode, setDataDropdownSubCode] = useState<IDropdown[]>(
    [],
  );
  const [dataDropdownMarketCode, setDataDropdownMarketCode] = useState<
    IDropdown[]
  >([]);
  const [dataDropdownSeason, setDataDropdownSeason] = useState<IDropdown[]>([]);
  const [dataDropdownSize, setDataDropdownSize] = useState<IDropdown[]>([]);
  const [qtyStorage, setQtyStorage] = useState('');
  const [dataQtyPlus, setDataQtyPlus] = useState('');
  const [qtyInLine, setQtyInLine] = useState('');

  const [checkIsOver, setCheckIsOver] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenCheckQtyTatolSX, setOpenCheckQtyTatolSX] =
    useState<boolean>(false);
  const [isOpenCheckQtyKH, setOpenCheckQtyKH] = useState<boolean>(false);

  const [dataShowColor, setDataShowColor] = useState('');
  const [dataShowSeason, setDataShowSeason] = useState('');

  const onPressCloseQtyKH = () => {
    setOpenCheckQtyKH(false);
    setIsInProgress(false);
  };

  const onPressSubmitQtyKH = () => {
    setOpenCheckQtyKH(false);
    onPressHandleSubmit();
  };

  const onPressCloseQtyTotal = () => {
    setOpenCheckQtyTatolSX(false);
  };

  const onPressSubmitQtyTotal = () => {
    onPressHandleSubmit();
    setOpenCheckQtyTatolSX(false);
  };

  const checkQty = () => {
    let error = validateForm(dataPageInput, Rules, []);
    if (error && error.length > 0) {
      setErrors([...error]);
      setIsInProgress(true);
      return;
    }
    if (checkData != null) {
      if (
        dataQty.QtyLKStorage - checkData + +dataPageInput.qtyStorage >
        dataQty.QtyTatolSX
      ) {
        setOpenCheckQtyTatolSX(true);
      }
      if (
        dataQty.QtyLKStorage - checkData + +dataPageInput.qtyStorage >
        dataQty.QtyKH
      ) {
        setOpenCheckQtyKH(true);
      }
      if (
        dataQty.QtyLKStorage - checkData + +dataPageInput.qtyStorage <=
          dataQty.QtyTatolSX &&
        dataQty.QtyLKStorage - checkData + +dataPageInput.qtyStorage <=
          dataQty.QtyKH
      ) {
        onPressHandleSubmit();
      }
    }
  };

  const getDataDropdownWorkCenter = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiDeliveryHTWareHouse.LIST_FILTER + '?Type=' + FilterRecord.Workcenterid,
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
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (datePickerChoose: Date) => {
    let error = validateField(datePickerChoose, Rules, 'dateRecord', errors);

    let dateRecord = moment(datePickerChoose).format('DD/MM/YYYY');
    let now = moment(new Date()).format("YYYY-MM-DD")
    if(moment(dateRecord, ["DD/MM/YYYY", "YYYY-MM-DD"]).isSameOrAfter(now, 'day') == false && isOnCloud == true){
      setIsDayBefore(true);
    }
    else {
      setIsDayBefore(false);
    }
    setdataPageInput(prevState => ({
      ...prevState,
      dateRecord: moment(datePickerChoose).format('DD/MM/YYYY'),
      workCenterId: '',
      mainProductCode: '',
      colorCode: '',
      subProductCode: '',
      marketcode: '',
      seasonCode: '',
      workOrderCode: '',
      sizeCode: '',
      qtyNow: '',
    }));
    setDataQty({
      QtyKH: 0,
      QtyLKStorage: 0,
      QtyTatolSX: 0,
    });
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
    setDataDropdownMainCode([]);
    setDataDropdownColor([]);
    setDataDropdownWorkOrderCode([]);
    setDataDropdownMarketCode([]);
    setDataDropdownSubCode([]);
    setDataDropdownSeason([]);
    setDataDropdownSize([]);
    setQtyInLine('');
    setQtyStorage('');
    setDataShowColor('');
    setDataShowSeason('');
    setIsInProgress(false);
  };

  const getDataDropDownByFilter = async (
    workCenterId: string,
    workOrderCode: string,
    mainCodeProduct: string,
    subCode: string,
    colorCode: string,
    seasonCode: string,
    marketCode: string,
    sizeCode: string,
  ) => {
    setErrors([]);
    setDataQtyPlus('');
    setQtyStorage('');
    setDataQty({
      QtyKH: 0,
      QtyLKStorage: 0,
      QtyTatolSX: 0,
    });
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
        ApiDeliveryHTWareHouse.LIST_FILTER +
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
        setDataDropdownWorkOrderCode(data.Workordercode);
        if (data.Workordercode.length == 1) {
          // auto fill lenh sx
          let dataDropdownWorkordercode = data.Workordercode;
          setQtyInLine(dataDropdownWorkordercode[0].qtydetailwo);
          setdataPageInput(prevState => ({
            ...prevState,
            workOrderCode: dataDropdownWorkordercode[0].id,
            qtyNow: '',
          }));

          //api lay ma hang
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryHTWareHouse.LIST_FILTER +
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

            console.log('1', data.mainProductCodeData);
            if (data.mainProductCodeData.length == 1) {
              // auto fill ma hang
              let dataDropdownMainCode = data.mainProductCodeData;
              setdataPageInput(prevState => ({
                ...prevState,
                mainProductCode: dataDropdownMainCode[0].id,
              }));

              //api lay ma nho
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryHTWareHouse.LIST_FILTER +
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
                  setdataPageInput(prevState => ({
                    ...prevState,
                    subProductCode: dataDropdownSub[0].id,
                  }));

                  //api lay mau
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiDeliveryHTWareHouse.LIST_FILTER +
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
                      setdataPageInput(prevState => ({
                        ...prevState,
                        colorCode: dataDropdownColor[0].id,
                      }));

                      //api lay mua
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiDeliveryHTWareHouse.LIST_FILTER +
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
                          setdataPageInput(prevState => ({
                            ...prevState,
                            seasonCode: dataDropdownSeasonCode[0].id,
                          }));

                          //api lay thi truong
                          let dataResponse =
                            await CommonBase.getAsync<ResponseService>(
                              ApiDeliveryHTWareHouse.LIST_FILTER +
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
                            setDataDropdownMarketCode(data.marketCodeData);
                            if (data.marketCodeData.length == 1) {
                              // auto fill thi truong
                              let dataDropdownMarket = data.marketCodeData;
                              setdataPageInput(prevState => ({
                                ...prevState,
                                marketcode: dataDropdownMarket[0].id,
                              }));

                              //api lay size
                              let dataResponse =
                                await CommonBase.getAsync<ResponseService>(
                                  ApiDeliveryHTWareHouse.LIST_FILTER +
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
                                  setdataPageInput(prevState => ({
                                    ...prevState,
                                    sizeCode: dataDropdownSize[0].id,
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
      console.log(
        workCenterId,
        workOrderCode,
        mainCodeProduct,
        subCode,
        colorCode,
        seasonCode,
        marketCode,
      );
      //api lay ma hang
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryHTWareHouse.LIST_FILTER +
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
        if (data.mainProductCodeData.length > 0) {
          // auto fill ma hang
          let dataDropdownMainCode = data.mainProductCodeData;
          setdataPageInput(prevState => ({
            ...prevState,
            mainProductCode: dataDropdownMainCode[0].id,
            qtyNow: '',
          }));

          //api lay ma nho
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryHTWareHouse.LIST_FILTER +
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
              setdataPageInput(prevState => ({
                ...prevState,
                subProductCode: dataDropdownSub[0].id,
              }));

              //api lay mau
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryHTWareHouse.LIST_FILTER +
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
                  setdataPageInput(prevState => ({
                    ...prevState,
                    colorCode: dataDropdownColor[0].id,
                  }));

                  //api lay mua
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiDeliveryHTWareHouse.LIST_FILTER +
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
                      setdataPageInput(prevState => ({
                        ...prevState,
                        seasonCode: dataDropdownSeasonCode[0].id,
                      }));

                      //api lay thi truong
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiDeliveryHTWareHouse.LIST_FILTER +
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
                        setDataDropdownMarketCode(data.marketCodeData);
                        if (data.marketCodeData.length == 1) {
                          // auto fill thi truong
                          let dataDropdownMarket = data.marketCodeData;
                          setdataPageInput(prevState => ({
                            ...prevState,
                            marketcode: dataDropdownMarket[0].id,
                          }));

                          //api lay size
                          let dataResponse =
                            await CommonBase.getAsync<ResponseService>(
                              ApiDeliveryHTWareHouse.LIST_FILTER +
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
                              setdataPageInput(prevState => ({
                                ...prevState,
                                sizeCode: dataDropdownSize[0].id,
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
        ApiDeliveryHTWareHouse.LIST_FILTER +
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
        setDataDropdownMarketCode(data.marketCodeData);

        if (data.marketCodeData.length == 1) {
          // auto fill thi truong
          let dataDropdownMarket = data.marketCodeData;
          setdataPageInput(prevState => ({
            ...prevState,
            marketcode: dataDropdownMarket[0].id,
            qtyNow: '',
          }));

          //api lay size
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryHTWareHouse.LIST_FILTER +
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
              setdataPageInput(prevState => ({
                ...prevState,
                sizeCode: dataDropdownSize[0].id,
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
        ApiDeliveryHTWareHouse.LIST_FILTER +
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
          setdataPageInput(prevState => ({
            ...prevState,
            sizeCode: dataDropdownSize[0].id,
            qtyNow: '',
          }));
        }
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
    sizeCode: string,
  ) => {
    setErrors([]);
    setDataQty({
      QtyKH: 0,
      QtyLKStorage: 0,
      QtyTatolSX: 0,
    });
    //api lay lenh sx
    if (
      workCenterId != '' &&
      workOrderCode == '' &&
      mainCodeProduct == '' &&
      subCode == '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == '' &&
      sizeCode == ''
    ) {
      //api lay lênh sx
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryHTWareHouse.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryHTWareHouse.Workordercode +
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
        setDataDropdownWorkOrderCode(data.workOrderCodeData);
        if (data.workOrderCodeData.length == 1) {
          // auto fill lenh sx
          let dataDropdownWorkOrderCode = data.workOrderCodeData;
          setdataPageInput(prevState => ({
            ...prevState,
            workOrderCode: dataDropdownWorkOrderCode[0].id,
            qtyNow: '',
          }));

          // api lay ma hang
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryHTWareHouse.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryHTWareHouse.Maincodeproduct +
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
              setdataPageInput(prevState => ({
                ...prevState,
                mainProductCode: dataDropdownMainCodeData[0].id,
                qtyNow: '',
              }));

              //api lay ma nho
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryHTWareHouse.LIST_FILTER +
                  '?Type=' +
                  ListFilterDeliveryHTWareHouse.Subcodeproduct +
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
                setDataDropdownSubCode(data.subCodeData);
                if (data.subCodeData.length == 1) {
                  //auto fill ma nho
                  let dataDropdownSubCode = data.subCodeData;
                  setdataPageInput(prevState => ({
                    ...prevState,
                    subProductCode: dataDropdownSubCode[0].id,
                    qtyNow: '',
                  }));

                  // api lay ma mau
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiDeliveryHTWareHouse.LIST_FILTER +
                      '?Type=' +
                      ListFilterDeliveryHTWareHouse.Colorcode +
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
                      setdataPageInput(prevState => ({
                        ...prevState,
                        colorCode: dataDropdownColorCode[0].id,
                        qtyNow: '',
                      }));

                      //api lay mua
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiDeliveryHTWareHouse.LIST_FILTER +
                            '?Type=' +
                            ListFilterDeliveryHTWareHouse.Seasoncode +
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
                          setdataPageInput(prevState => ({
                            ...prevState,
                            seasonCode: dataDropdownSeason[0].id,
                            qtyNow: '',
                          }));

                          //api lay thi truong
                          let dataResponse =
                            await CommonBase.getAsync<ResponseService>(
                              ApiDeliveryHTWareHouse.LIST_FILTER +
                                '?Type=' +
                                ListFilterDeliveryHTWareHouse.Marketcode +
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
                            setDataDropdownMarketCode(data.marketCodeData);
                            if (data.marketCodeData.length == 1) {
                              // auto fill thi truong
                              let dataDropdownMarketCode = data.marketCodeData;
                              setdataPageInput(prevState => ({
                                ...prevState,
                                marketcode: dataDropdownMarketCode[0].id,
                                qtyNow: '',
                              }));

                              //api lay size
                              let dataResponse =
                                await CommonBase.getAsync<ResponseService>(
                                  ApiDeliveryHTWareHouse.LIST_FILTER +
                                    '?Type=' +
                                    ListFilterDeliveryHTWareHouse.SizeCode +
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
                                  setdataPageInput(prevState => ({
                                    ...prevState,
                                    sizeCode: dataDropdownSize[0].id,
                                    qtyNow: '',
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
    // lay ma hang
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct == '' &&
      subCode == '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == '' &&
      sizeCode == ''
    ) {
      // api lay ma hang
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryHTWareHouse.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryHTWareHouse.Maincodeproduct +
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
          setdataPageInput(prevState => ({
            ...prevState,
            mainProductCode: dataDropdownMainCodeData[0].id,
            qtyNow: '',
          }));

          //api lay ma nho
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryHTWareHouse.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryHTWareHouse.Subcodeproduct +
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
            console.log('1', data.subCodeData);
            setDataDropdownSubCode(data.subCodeData);
            if (data.subCodeData.length == 1) {
              //auto fill ma nho
              let dataDropdownSubCode = data.subCodeData;
              setdataPageInput(prevState => ({
                ...prevState,
                subProductCode: dataDropdownSubCode[0].id,
                qtyNow: '',
              }));

              // api lay ma mau
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryHTWareHouse.LIST_FILTER +
                  '?Type=' +
                  ListFilterDeliveryHTWareHouse.Colorcode +
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
                  setdataPageInput(prevState => ({
                    ...prevState,
                    colorCode: dataDropdownColorCode[0].id,
                    qtyNow: '',
                  }));

                  //api lay mua
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiDeliveryHTWareHouse.LIST_FILTER +
                      '?Type=' +
                      ListFilterDeliveryHTWareHouse.Seasoncode +
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
                      setdataPageInput(prevState => ({
                        ...prevState,
                        seasonCode: dataDropdownSeason[0].id,
                        qtyNow: '',
                      }));

                      //api lay thi truong
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiDeliveryHTWareHouse.LIST_FILTER +
                            '?Type=' +
                            ListFilterDeliveryHTWareHouse.Marketcode +
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
                        setDataDropdownMarketCode(data.marketCodeData);
                        if (data.marketCodeData.length == 1) {
                          // auto fill thi truong
                          let dataDropdownMarketCode = data.marketCodeData;
                          setdataPageInput(prevState => ({
                            ...prevState,
                            marketcode: dataDropdownMarketCode[0].id,
                            qtyNow: '',
                          }));

                          //api lay size
                          let dataResponse =
                            await CommonBase.getAsync<ResponseService>(
                              ApiDeliveryHTWareHouse.LIST_FILTER +
                                '?Type=' +
                                ListFilterDeliveryHTWareHouse.SizeCode +
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
                              setdataPageInput(prevState => ({
                                ...prevState,
                                sizeCode: dataDropdownSize[0].id,
                                qtyNow: '',
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

    // lay ma nho
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      subCode == '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == '' &&
      sizeCode == ''
    ) {
      //api lay ma nho
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryHTWareHouse.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryHTWareHouse.Subcodeproduct +
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
        setDataDropdownSubCode(data.subCodeData);
        if (data.subCodeData.length == 1) {
          //auto fill ma nho
          let dataDropdownSubCode = data.subCodeData;
          setdataPageInput(prevState => ({
            ...prevState,
            subProductCode: dataDropdownSubCode[0].id,
            qtyNow: '',
          }));

          // api lay ma mau
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryHTWareHouse.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryHTWareHouse.Colorcode +
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
              setdataPageInput(prevState => ({
                ...prevState,
                colorCode: dataDropdownColorCode[0].id,
                qtyNow: '',
              }));

              //api lay mua
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryHTWareHouse.LIST_FILTER +
                  '?Type=' +
                  ListFilterDeliveryHTWareHouse.Seasoncode +
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
                  setdataPageInput(prevState => ({
                    ...prevState,
                    seasonCode: dataDropdownSeason[0].id,
                    qtyNow: '',
                  }));

                  //api lay thi truong
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiDeliveryHTWareHouse.LIST_FILTER +
                      '?Type=' +
                      ListFilterDeliveryHTWareHouse.Marketcode +
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
                    setDataDropdownMarketCode(data.marketCodeData);
                    if (data.marketCodeData.length == 1) {
                      // auto fill thi truong
                      let dataDropdownMarketCode = data.marketCodeData;
                      setdataPageInput(prevState => ({
                        ...prevState,
                        marketcode: dataDropdownMarketCode[0].id,
                        qtyNow: '',
                      }));

                      //api lay size
                      let dataResponse =
                        await CommonBase.getAsync<ResponseService>(
                          ApiDeliveryHTWareHouse.LIST_FILTER +
                            '?Type=' +
                            ListFilterDeliveryHTWareHouse.SizeCode +
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
                          setdataPageInput(prevState => ({
                            ...prevState,
                            sizeCode: dataDropdownSize[0].id,
                            qtyNow: '',
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
    // lay ma mau
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      subCode != '' &&
      colorCode == '' &&
      seasonCode == '' &&
      marketCode == '' &&
      sizeCode == ''
    ) {
      // api lay ma mau
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryHTWareHouse.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryHTWareHouse.Colorcode +
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
          setdataPageInput(prevState => ({
            ...prevState,
            colorCode: dataDropdownColorCode[0].id,
            qtyNow: '',
          }));

          //api lay mua
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryHTWareHouse.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryHTWareHouse.Seasoncode +
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
              setdataPageInput(prevState => ({
                ...prevState,
                seasonCode: dataDropdownSeason[0].id,
                qtyNow: '',
              }));

              //api lay thi truong
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryHTWareHouse.LIST_FILTER +
                  '?Type=' +
                  ListFilterDeliveryHTWareHouse.Marketcode +
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
                setDataDropdownMarketCode(data.marketCodeData);
                if (data.marketCodeData.length == 1) {
                  // auto fill thi truong
                  let dataDropdownMarketCode = data.marketCodeData;
                  setdataPageInput(prevState => ({
                    ...prevState,
                    marketcode: dataDropdownMarketCode[0].id,
                    qtyNow: '',
                  }));

                  //api lay size
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiDeliveryHTWareHouse.LIST_FILTER +
                      '?Type=' +
                      ListFilterDeliveryHTWareHouse.SizeCode +
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
                      setdataPageInput(prevState => ({
                        ...prevState,
                        sizeCode: dataDropdownSize[0].id,
                        qtyNow: '',
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
    // lay mua
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      subCode != '' &&
      colorCode != '' &&
      seasonCode == '' &&
      marketCode == '' &&
      sizeCode == ''
    ) {
      //api lay mua
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryHTWareHouse.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryHTWareHouse.Seasoncode +
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
          setdataPageInput(prevState => ({
            ...prevState,
            seasonCode: dataDropdownSeason[0].id,
            qtyNow: '',
          }));

          //api lay thi truong
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryHTWareHouse.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryHTWareHouse.Marketcode +
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
            setDataDropdownMarketCode(data.marketCodeData);
            if (data.marketCodeData.length == 1) {
              // auto fill thi truong
              let dataDropdownMarketCode = data.marketCodeData;
              setdataPageInput(prevState => ({
                ...prevState,
                marketcode: dataDropdownMarketCode[0].id,
                qtyNow: '',
              }));

              //api lay size
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryHTWareHouse.LIST_FILTER +
                  '?Type=' +
                  ListFilterDeliveryHTWareHouse.SizeCode +
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
                  setdataPageInput(prevState => ({
                    ...prevState,
                    sizeCode: dataDropdownSize[0].id,
                    qtyNow: '',
                  }));
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
      marketCode == '' &&
      sizeCode == ''
    ) {
      //api lay thi truong
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryHTWareHouse.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryHTWareHouse.Marketcode +
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
        setDataDropdownMarketCode(data.marketCodeData);
        if (data.marketCodeData.length == 1) {
          // auto fill thi truong
          let dataDropdownMarketCode = data.marketCodeData;
          setdataPageInput(prevState => ({
            ...prevState,
            marketcode: dataDropdownMarketCode[0].id,
            qtyNow: '',
          }));

          //api lay size
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryHTWareHouse.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryHTWareHouse.SizeCode +
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
              setdataPageInput(prevState => ({
                ...prevState,
                sizeCode: dataDropdownSize[0].id,
                qtyNow: '',
              }));
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
      workOrderCode != '' &&
      sizeCode == ''
    ) {
      // api lay size
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryHTWareHouse.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryHTWareHouse.SizeCode +
          '&Workcenterid=' +
          workCenterId +
          '&Mainproductcode=' +
          mainCodeProduct +
          '&Colorcode=' +
          colorCode +
          '&Subproductcode=' +
          subCode +
          '&Marketcode=' +
          marketCode +
          '&Seasoncode=' +
          seasonCode +
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
          SizeCode: dataResponse.data,
        };
        setErrors([]);
        setDataDropdownSize(data.SizeCode);
        if (data.SizeCode.length == 1) {
          // auto fill size
          let dataDropdownSize = data.SizeCode;
          setdataPageInput(prevState => ({
            ...prevState,
            sizeCode: dataDropdownSize[0].id,
            qtyNow: '',
          }));
        }
      }
    }
  };

  const getDataQty = async (value: string) => {
    if (
      dataPageInput.dateRecord &&
      dataPageInput.workCenterId &&
      dataPageInput.mainProductCode &&
      dataPageInput.colorCode &&
      dataPageInput.subProductCode &&
      dataPageInput.marketcode &&
      dataPageInput.seasonCode &&
      dataPageInput.workOrderCode
    ) {
      baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryHTWareHouse.GET_INFO_DELIVERY_HT +
          '?DateRecord=' +
          dataPageInput.dateRecord +
          '&Workcenterid=' +
          dataPageInput.workCenterId +
          '&Mainproductcode=' +
          dataPageInput.mainProductCode +
          '&Colorcode=' +
          dataPageInput.colorCode +
          '&Subproductcode=' +
          dataPageInput.subProductCode +
          '&Marketcode=' +
          dataPageInput.marketcode +
          '&Seasoncode=' +
          dataPageInput.seasonCode +
          '&Workordercode=' +
          dataPageInput.workOrderCode +
          '&SizeCode=' +
          value,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          QtyKH: dataResponse.data.QtyKH,
          QtyLKStorage: dataResponse.data.QtyLKStorage,
          QtyStorage: dataResponse.data.QtyStorage,
          QtyTatolSX: dataResponse.data.QtyTatolSX,
        };
        setDataQty(prevState => ({
          ...prevState,
          QtyKH: data.QtyKH,
          QtyLKStorage: data.QtyLKStorage,
          QtyTatolSX: data.QtyTatolSX,
        }));
        if (data.QtyStorage == null) {
          setdataPageInput(prevState => ({
            ...prevState,
            qtyStorage: '',
          }));
          setQtyStorage('');
          setCheckData(0);
        } else {
          setdataPageInput(prevState => ({
            ...prevState,
            qtyStorage: data.QtyStorage,
          }));
          setIsInProgress(true);
          setQtyStorage(data.QtyStorage);
          setCheckData(data.QtyStorage);
        }
      }
      baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
    }
  };

  const handleOnChangeQtyStorage = (event: any) => {
    const value = event.nativeEvent.text;
    let error = validateField(value, Rules, 'qtyStorage', errors);
    setErrors([...error]);
    setdataPageInput(prevState => ({
      ...prevState,
      qtyStorage: value,
    }));
    setIsInProgress(false);
  };

  const handleOnChangeQtyPlus = (event: any) => {
    const value = event.nativeEvent.text;
    let errorQtyPlus = validateField(value, Rules, 'qtyPlus', errors);
    setErrors([...errorQtyPlus]);
    // if (errorQtyPlus && errorQtyPlus.length > 0) {
    //     value == ''
    // }
    // else {
    let plusData: string = +value + +qtyStorage + '';
    if (value == '') {
      plusData = +qtyStorage + '';
    }
    setDataQtyPlus(value);
    setdataPageInput(prevState => ({
      ...prevState,
      qtyStorage: plusData,
    }));
    let errorQtySto = validateField(
      dataPageInput.qtyStorage,
      Rules,
      'qtyStorage',
      errors,
    );
    if (errorQtySto && errorQtySto.length > 0) {
      setErrors([]);
    }
    setIsInProgress(false);
    // }
  };

  const checkOverQtyInLine = () => {
    if (parseInt(qtyInLine) < parseInt(dataPageInput.qtyStorage)) {
      setCheckIsOver(true);
    } else {
      setCheckIsOver(false);
    }
  };

  const onPressCloseModal = () => {
    setIsOpenModal(false);
    setIsInProgress(false);
  };

  const onPressSubmitModal = () => {
    onPressHandleSubmit();
  };

  const onPressHandleSubmit = async () => {
    if (dataQtyPlus == '') {
      let msg = 'SL điều chỉnh không thay đổi. Lưu không thành công';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      return;
    }

    let dataRequest = {
      DateRecord: dataPageInput.dateRecord,
      Workcenterid: dataPageInput.workCenterId,
      Mainproductcode: dataPageInput.mainProductCode,
      Colorcode: dataPageInput.colorCode,
      Subproductcode: dataPageInput.subProductCode,
      Marketcode: dataPageInput.marketcode,
      Seasoncode: dataPageInput.seasonCode,
      Workordercode: dataPageInput.workOrderCode,
      SizeCode: dataPageInput.sizeCode,
      QtyStorage: dataPageInput.qtyStorage,
    };
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiDeliveryHTWareHouse.RECORD_DELIVERY_HT,
      dataRequest,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      setIsInProgress(false);
      let msg = 'Cập nhật số lượng thành công';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      await getDataQty(dataPageInput.sizeCode);
    }
    setDataQtyPlus('');
    setIsOpenModal(false);
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const onPressHandleClose = () => {
    clearData();
    navigation.navigate('HomePageScreen');
  };

  const clearData = () => {
    setIsInProgress(false);
    setSelectedDate(new Date());
    setdataPageInput({
      dateRecord: date,
      workCenterId: '',
      mainProductCode: '',
      colorCode: '',
      subProductCode: '',
      marketcode: '',
      seasonCode: '',
      workOrderCode: '',
      sizeCode: '',
      qtyStorage: '',
    });
    setDataQty({
      QtyKH: 0,
      QtyLKStorage: 0,
      QtyTatolSX: 0,
    });
    setDataQtyPlus('');
    setQtyStorage('');
    setQtyInLine('');
    setErrors([]);
    setDataDropdownMainCode([]);
    setDataDropdownColor([]);
    setDataDropdownWorkOrderCode([]);
    setDataDropdownMarketCode([]);
    setDataDropdownSubCode([]);
    setDataDropdownSeason([]);
    setDataShowColor('');
    setDataShowSeason('');
    setIsDayBefore(false);
  };

  useEffect(() => {
    const getData = async () => {
      const dataToken: any = await Storage.getItem('evomes_token_info');
      if (dataToken != null && dataToken != undefined) {
        const decodedToken = jwt_decode<Token>(JSON.parse(dataToken).token);
        const tennet = decodedToken.TenantName;
        console.log('tennet', tennet);
        if (tennet != '' && tennet != undefined) {
          setIsOnCLoud(true);
        } else {
          setIsDayBefore(false);
        }
      } else {
        setIsDayBefore(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (dataPageInput.sizeCode) {
      async function handleChangeSizeCode() {
        await getDataQty(dataPageInput.sizeCode);
      }
      handleChangeSizeCode();
    }
  }, [dataPageInput.sizeCode]);

  useEffect(() => {
    checkOverQtyInLine();
  }, [dataPageInput.qtyStorage]);

  useEffect(() => {
    if (refreshing == true) {
      getDataDropdownWorkCenter();
      clearData();
    }
  }, [refreshing]);

  useEffect(() => {
    if (isFocused == true) {
      getDataDropdownWorkCenter();
    } else {
      clearData();
    }
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
          title="Nhập kho hoàn thiện"
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
                      Thông tin phiếu nhập
                  </Text>
              </View> */}
        {/* 240 */}
        <View
          style={
            {
              // height: deviceHeight - styles.header.height - (deviceHeight - (deviceHeight * 72) / 100)
              // , flex: 1
            }
          }>
          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Ngày tạo phiếu:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TouchableOpacity onPress={showDatePicker}>
                  <Text style={styles.datePickerBox}>
                    {dataPageInput.dateRecord ?? date}
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
                      if (item?.fieldName == 'dateRecord') {
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
                  onConfirm={handleConfirm}
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
                  styles={styles.inputBox}
                  title="Chọn tổ sản xuất"
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'workCenterId',
                      errors,
                    );
                    setErrors([...error]);
                    setdataPageInput(stateOld => ({
                      ...stateOld,
                      workCenterId: data[0],
                      workOrderCode: '',
                      mainProductCode: '',
                      subProductCode: '',
                      colorCode: '',
                      seasonCode: '',
                      marketcode: '',
                      sizeCode: '',
                      qtyStorage: '',
                    }));
                    let inputFilter = {
                      workCenterId: data[0],
                      workOrderCode: '',
                      mainCodeProduct: '',
                      subCodeColor: '',
                      colorCode: '',
                      marketCode: '',
                      seasonCode: '',
                      sizeCode: '',
                    };
                    setErrors([]);
                    setDataDropdownWorkOrderCode([]);
                    setDataDropdownMainCode([]);
                    setDataDropdownSubCode([]);
                    setDataDropdownColor([]);
                    setDataDropdownMarketCode([]);
                    setDataDropdownSeason([]);
                    setDataDropdownSize([]);
                    if (isOnCloud == true) {
                      getDataDropDownByFilterCloud(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.subCodeColor,
                        inputFilter.colorCode,
                        inputFilter.seasonCode,
                        inputFilter.marketCode,
                        inputFilter.sizeCode,
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
                        inputFilter.sizeCode,
                      );
                    }
                    getDataQty(dataPageInput.sizeCode);
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageInput.workCenterId]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item?.fieldName == 'workCenterId') {
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
                  listData={dataDropdownWorkOrderCode}
                  styles={styles.inputBox}
                  popupTitle="Lệnh sản xuất"
                  title="Chọn lệnh sản xuất"
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'workOrderCode',
                      errors,
                    );
                    setErrors([...error]);
                    setdataPageInput(stateOld => ({
                      ...stateOld,
                      workOrderCode: data[0],
                      mainProductCode: '',
                      subProductCode: '',
                      colorCode: '',
                      seasonCode: '',
                      marketcode: '',
                      sizeCode: '',
                      qtyStorage: '',
                    }));
                    let inputFilter = {
                      workCenterId: dataPageInput.workCenterId,
                      workOrderCode: data[0],
                      mainCodeProduct: '',
                      subCodeColor: '',
                      colorCode: '',
                      marketCode: '',
                      seasonCode: '',
                      sizeCode: '',
                    };
                    setDataDropdownMainCode([]);
                    setDataDropdownSubCode([]);
                    setDataDropdownColor([]);
                    setDataDropdownMarketCode([]);
                    setDataDropdownSeason([]);
                    setDataDropdownSize([]);
                    if (isOnCloud == true) {
                      getDataDropDownByFilterCloud(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.subCodeColor,
                        inputFilter.colorCode,
                        inputFilter.seasonCode,
                        inputFilter.marketCode,
                        inputFilter.sizeCode,
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
                        inputFilter.sizeCode,
                      );
                    }
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageInput.workOrderCode]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item?.fieldName == 'workOrderCode') {
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

            {isOnCloud == true ? (
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
                      onSelect={data => {
                        let error = validateField(
                          data[0],
                          Rules,
                          'mainCodeProduct',
                          errors,
                        );
                        setErrors([...error]);
                        setdataPageInput(stateOld => ({
                          ...stateOld,
                          mainProductCode: data[0],
                          subProductCode: '',
                          colorCode: '',
                          seasonCode: '',
                          marketcode: '',
                          sizeCode: '',
                          qtyStorage: '',
                        }));
                        let inputFilter = {
                          workCenterId: dataPageInput.workCenterId,
                          workOrderCode: dataPageInput.workOrderCode,
                          mainCodeProduct: data[0],
                          subCodeColor: '',
                          colorCode: '',
                          marketCode: '',
                          seasonCode: '',
                          sizeCode: '',
                        };
                        setDataDropdownSubCode([]);
                        setDataDropdownColor([]);
                        setDataDropdownMarketCode([]);
                        setDataDropdownSeason([]);
                        setDataDropdownSize([]);
                        if (isOnCloud == true) {
                          getDataDropDownByFilterCloud(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                            inputFilter.sizeCode,
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
                            inputFilter.sizeCode,
                          );
                        }
                      }}
                      styles={styles.inputBox}
                      stylesIcon={{
                        position: 'absolute',
                        zIndex: -1,
                        right: 10,
                        top: 15,
                      }}
                      valueArr={[dataPageInput.mainProductCode]}
                      isSelectSingle={true}
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'mainProductCode') {
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
                      listData={dataDropdownSubCode}
                      popupTitle="Mã nhỏ"
                      title="Chọn mã nhỏ"
                      onSelect={data => {
                        let error = validateField(
                          data[0],
                          Rules,
                          'subCodeColor',
                          errors,
                        );
                        setErrors([...error]);
                        setdataPageInput(stateOld => ({
                          ...stateOld,
                          subProductCode: data[0],
                          colorCode: '',
                          seasonCode: '',
                          marketcode: '',
                          sizeCode: '',
                          qtyStorage: '',
                        }));
                        let inputFilter = {
                          workCenterId: dataPageInput.workCenterId,
                          workOrderCode: dataPageInput.workOrderCode,
                          mainCodeProduct: dataPageInput.mainProductCode,
                          subCodeColor: data[0],
                          colorCode: '',
                          marketCode: '',
                          seasonCode: '',
                          sizeCode: '',
                        };
                        setDataDropdownColor([]);
                        setDataDropdownMarketCode([]);
                        setDataDropdownSeason([]);
                        setDataDropdownSize([]);
                        if (isOnCloud == true) {
                          getDataDropDownByFilterCloud(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                            inputFilter.sizeCode,
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
                            inputFilter.sizeCode,
                          );
                        }
                      }}
                      styles={styles.inputBox}
                      stylesIcon={{
                        position: 'absolute',
                        zIndex: -1,
                        right: 10,
                        top: 15,
                      }}
                      valueArr={[dataPageInput.subProductCode]}
                      isSelectSingle={true}
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'subProductCode') {
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
                      onSelect={data => {
                        let error = validateField(
                          data[0],
                          Rules,
                          'colorCode',
                          errors,
                        );
                        setErrors([...error]);
                        setdataPageInput(stateOld => ({
                          ...stateOld,
                          colorCode: data[0],
                          seasonCode: '',
                          marketcode: '',
                          sizeCode: '',
                          qtyStorage: '',
                        }));
                        let inputFilter = {
                          workCenterId: dataPageInput.workCenterId,
                          workOrderCode: dataPageInput.workOrderCode,
                          mainCodeProduct: dataPageInput.mainProductCode,
                          subCodeColor: dataPageInput.subProductCode,
                          colorCode: data[0],
                          marketCode: '',
                          seasonCode: '',
                          sizeCode: '',
                        };
                        setDataDropdownMarketCode([]);
                        setDataDropdownSeason([]);
                        setDataDropdownSize([]);
                        if (isOnCloud == true) {
                          getDataDropDownByFilterCloud(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                            inputFilter.sizeCode,
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
                            inputFilter.sizeCode,
                          );
                        }
                      }}
                      styles={styles.inputBox}
                      stylesIcon={{
                        position: 'absolute',
                        zIndex: -1,
                        right: 10,
                        top: 15,
                      }}
                      valueArr={[dataPageInput.colorCode]}
                      isSelectSingle={true}
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'colorCode') {
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
                      onSelect={data => {
                        let error = validateField(
                          data[0],
                          Rules,
                          'seasonCode',
                          errors,
                        );
                        setErrors([...error]);
                        setdataPageInput(stateOld => ({
                          ...stateOld,
                          seasonCode: data[0],
                          marketcode: '',
                          sizeCode: '',
                          qtyStorage: '',
                        }));
                        let inputFilter = {
                          workCenterId: dataPageInput.workCenterId,
                          workOrderCode: dataPageInput.workOrderCode,
                          mainCodeProduct: dataPageInput.mainProductCode,
                          subCodeColor: dataPageInput.subProductCode,
                          colorCode: dataPageInput.colorCode,
                          seasonCode: data[0],
                          marketCode: '',
                          sizeCode: '',
                        };
                        setDataDropdownMarketCode([]);
                        setDataDropdownSize([]);
                        if (isOnCloud == true) {
                          getDataDropDownByFilterCloud(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.subCodeColor,
                            inputFilter.colorCode,
                            inputFilter.seasonCode,
                            inputFilter.marketCode,
                            inputFilter.sizeCode,
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
                            inputFilter.sizeCode,
                          );
                        }
                      }}
                      styles={styles.inputBox}
                      stylesIcon={{
                        position: 'absolute',
                        zIndex: -1,
                        right: 10,
                        top: 15,
                      }}
                      valueArr={[dataPageInput.seasonCode]}
                      isSelectSingle={true}
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'seasonCode') {
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
            ) : (
              <>
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
            )}

            {/* thi truong */}
            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Thị trường:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownMarketCode}
                  popupTitle="Thị trường"
                  title="Chọn thị trường"
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'marketcode',
                      errors,
                    );
                    setErrors([...error]);
                    setdataPageInput(stateOld => ({
                      ...stateOld,
                      marketcode: data[0],
                      sizeCode: '',
                      qtyStorage: '',
                    }));
                    let inputFilter = {
                      workCenterId: dataPageInput.workCenterId,
                      workOrderCode: dataPageInput.workOrderCode,
                      mainCodeProduct: dataPageInput.mainProductCode,
                      subCodeColor: dataPageInput.subProductCode,
                      colorCode: dataPageInput.colorCode,
                      seasonCode: dataPageInput.seasonCode,
                      marketCode: data[0],
                      sizeCode: '',
                    };
                    setDataDropdownSize([]);
                    if (isOnCloud == true) {
                      getDataDropDownByFilterCloud(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.subCodeColor,
                        inputFilter.colorCode,
                        inputFilter.seasonCode,
                        inputFilter.marketCode,
                        inputFilter.sizeCode,
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
                        inputFilter.sizeCode,
                      );
                    }
                  }}
                  styles={styles.inputBox}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageInput.marketcode]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item?.fieldName == 'marketcode') {
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
                <Text style={styles.label}>Kích cỡ:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownSize}
                  popupTitle="Mã Size"
                  title="Chọn mã size"
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'sizeCode',
                      errors,
                    );
                    setErrors([...error]);
                    setdataPageInput(stateOld => ({
                      ...stateOld,
                      sizeCode: data[0],
                      qtyStorage: '',
                    }));
                    //getDataQty(data[0])
                  }}
                  styles={styles.inputBox}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageInput.sizeCode]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item?.fieldName == 'sizeCode') {
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
                <Text style={styles.label2} numberOfLines={2}>
                  SL đã nhập hôm nay:
                </Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={qtyStorage + ''}
                  placeholder={'0'}
                  placeholderTextColor={'#AAABAE'}
                  style={styles.inputBoxDisable}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label2} numberOfLines={2}>
                  Điều chỉnh số lượng:
                </Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={dataQtyPlus}
                  onChange={handleOnChangeQtyPlus}
                  placeholder={'Nhập số lượng thêm'}
                  placeholderTextColor={'#AAABAE'}
                  editable={isDayBefore == true ? false : true}
                  style={styles.inputBox}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item?.fieldName == 'qtyPlus') {
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
                <Text style={styles.label2} numberOfLines={2}>
                  Tổng số lượng nhập hôm nay:
                </Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={dataPageInput.qtyStorage + ''}
                  onChange={handleOnChangeQtyStorage}
                  placeholder={'0'}
                  placeholderTextColor={'#AAABAE'}
                  style={styles.inputBoxDisable}
                  editable={false}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item?.fieldName == 'qtyStorage') {
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
        {/* 420 */}
        <View
          style={{
            height:
              deviceHeight -
              styles.submit.height -
              (deviceHeight - (deviceHeight * 50) / 100),
          }}>
          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{width: 150, paddingLeft: 10}}>
                <Text style={styles.label}>Tổng SL trong lệnh:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={dataQty.QtyKH + ''}
                  style={styles.disableInputBox}
                  editable={false}
                />
              </View>
            </View>
            <View style={styles.textInputContent}>
              <View style={{width: 150, paddingLeft: 10}}>
                <Text style={styles.label}>Tổng ra chuyền:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={dataQty.QtyTatolSX + ''}
                  style={styles.disableInputBox}
                  editable={false}
                />
              </View>
            </View>
            <View style={styles.textInputContent}>
              <View style={{width: 150, paddingLeft: 10}}>
                <Text style={styles.label}>Số lượng đã nhận:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={dataQty.QtyLKStorage + ''}
                  style={styles.disableInputBox}
                  editable={false}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.submit}>
        <View style={{height: 40, width: '30%', paddingRight: 30}}>
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
        <View style={{height: 40, width: '30%'}}>
          {isInProgress == false ? (
            <>
              {isDayBefore == false ? (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    checkIsOver == false ? checkQty() : setIsOpenModal(true);
                  }}>
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
      </View>
      {isOpenModal ? (
        <Modal
          isVisible={isOpenModal}
          //style={{ backgroundColor: '#ffffff', margin: 0 }}
          statusBarTranslucent={false}
          deviceHeight={deviceHeight}
          deviceWidth={deviceWidth}>
          <PopUpBase
            title={'Thông báo'}
            content={
              ' Số lượng nhập đang lớn hơn tổng vào chuyền \n   Bạn có chắc chắn muốn ghi nhận ? '
            }
            handleClose={onPressCloseModal}
            handleConfirm={onPressSubmitModal}
          />
        </Modal>
      ) : null}
      {isOpenCheckQtyKH ? (
        <Modal
          isVisible={isOpenCheckQtyKH}
          //style={{ backgroundColor: '#ffffff', margin: 0 }}
          statusBarTranslucent={false}
          deviceHeight={deviceHeight}
          deviceWidth={deviceWidth}> 
          <PopUpBase
            title={'Thông báo'}
            content={
              ' Số lượng đang lớn hơn tổng trong lệnh \n   Bạn có chắc chắn muốn ghi nhận ? '
            }
            handleClose={onPressCloseQtyKH}
            handleConfirm={onPressSubmitQtyKH}
          />
        </Modal>
      ) : null}

      {isOpenCheckQtyTatolSX ? (
        <Modal
          isVisible={isOpenCheckQtyTatolSX}
          //style={{ backgroundColor: '#ffffff', margin: 0 }}
          onBackdropPress={() => setOpenCheckQtyTatolSX(false)}
          statusBarTranslucent={false}
          deviceHeight={deviceHeight}
          deviceWidth={deviceWidth}>
          <PopUpBase
            title={'Thông báo'}
            content={
              ' Số lượng đang lớn hơn tổng ra chuyền \n   Bạn có chắc chắn muốn ghi nhận ? '
            }
            handleClose={onPressCloseQtyTotal}
            handleConfirm={onPressSubmitQtyTotal}
          />
        </Modal>
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
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    flexDirection: 'column',
  },
  header: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderBottomColor: '#001E31',
    height: 60,
    backgroundColor: '#F4F4F9',
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
    bottom: 0,
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
  label2: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    color: '#1B3A4ECC',
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
    fontWeight: '500',
    paddingTop: 3,
    height: (deviceHeight * 6) / 100,
  },
  input: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 40,
    fontWeight: '600',
    color: '#003858',
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
  inputBoxDisable: {
    width: '100%',
    height: 40,
    paddingLeft: 40,
    color: '#006496',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
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
  disableInputBox: {
    width: '100%',
    height: 40,
    paddingLeft: 40,
    color: '#1B3A4ECC',
    fontWeight: '600',
    fontSize: 14,
    fontStyle: 'normal',
    fontFamily: 'Mulish-SemiBold',
  },
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  baseAction: bindActionCreators(baseAction, dispatch),
});
export default connect(null, mapDispatchToProps)(DeliveryIntoHTWareHouseScreen);
