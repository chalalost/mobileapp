import {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  IDataPageDeliverySemiFinishProduct,
  IDataQty,
  IDropdown,
  ListFilterDeliveryBTP,
} from './types/deliverySemiFinishProductTypes';
import {
  CommonActions,
  DrawerActions,
  NavigationProp,
  useIsFocused,
} from '@react-navigation/native';
import moment from 'moment';
import Modal from 'react-native-modal';
import Svg, {Path} from 'react-native-svg';
import SelectBaseVer2 from '../../../../share/base/component/selectBase/selectBaseVer2';
import LinearGradient from 'react-native-linear-gradient';
import MyTitleHome from '../../../../share/base/component/myStatusBar/MyTitleHome';
import baseAction from '../../../../base/saga/action';
import CommonBase from '../../../../share/network/axios';
import {
  ApiDeliveryBTP,
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
import PopUpBase from '../../../../share/base/component/popUp/popUpBase';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {connect} from 'react-redux';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import Storage from '../../../../share/storage/storage';
import {Token} from '../qualityControl/QAScreen';
import jwt_decode from 'jwt-decode';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

export interface DeliverySemiFinishProductProps {
  navigation: NavigationProp<any, any>;
  baseAction: typeof baseAction;
  // dataPageDelivery: IDataPageDeliverySemiFinishProduct,
  // dataDropdown: IDropdown[]
}

const Rules: IRule[] = [
  {
    field: 'qtyNow',
    required: true,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_integer,
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
  // {
  //     field: 'mainProductCode',
  //     required: true,
  //     maxLength: 255,
  //     minLength: 0,
  //     typeValidate: 0,
  //     valueCheck: false,
  //     maxValue: 0,
  //     messages: {
  //         required: 'Mã hàng không được bỏ trống',
  //         minLength: '',
  //         maxLength: '',
  //         validate: '',
  //         maxValue: ''
  //     }
  // },
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
      required: 'Kích cỡ không được bỏ trống',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
];
let localTime = new Date();
let date = moment(localTime).format('DD/MM/YYYY');

const DeliverySemiFinishProductScreen: React.FC<
  DeliverySemiFinishProductProps
> = ({
  navigation,
  baseAction,
  // dataPageDelivery,
  // dataDropdown
}) => {
  const isFocused = useIsFocused();
  const [isInProgress, setIsInProgress] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [dataPageInput, setdataPageInput] =
    useState<IDataPageDeliverySemiFinishProduct>({
      dateRecord: date,
      workCenterId: '',
      mainProductCode: '',
      colorCode: '',
      workOrderCode: '',
      sizeCode: '',
      qtyNow: '',
    });
  const [dataQty, setDataQty] = useState<IDataQty>({
    QtyKH: 0,
    EsQtyLK: 0,
    QtyLK: 0,
    QtyLKCut: 0,
  });
  const [isCreate, setCheckIsCreate] = useState<boolean>(true);
  const [errors, setErrors] = useState<IError[]>([]);
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
  const [dataDropdownSize, setDataDropdownSize] = useState<IDropdown[]>([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [isOnCloud, setIsOnCLoud] = useState<boolean>(false);
  const [isDayBefore, setIsDayBefore] = useState<boolean>(false);

  const [dataShowColor, setDataShowColor] = useState('');

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const [dataQtyCheck, setDataQtyCheck] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getDataDropdownWorkCenter = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiDeliveryBTP.LIST_FILTER +
        '?Type=' +
        ListFilterDeliveryBTP.Workcenterid,
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
      workOrderCode: '',
      sizeCode: '',
      qtyNow: '',
    }));
    setDataQty({
      QtyKH: 0,
      EsQtyLK: 0,
      QtyLK: 0,
      QtyLKCut: 0,
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
    setCheckIsCreate(true);
    setDataShowColor('');
    setIsInProgress(false);
  };

  const getDataDropDownByFilterCloud = async (
    workCenterId: string,
    workOrderCode: string,
    mainCodeProduct: string,
    colorCode: string,
  ) => {
    setErrors([]);
    setDataQty({
      QtyKH: 0,
      EsQtyLK: 0,
      QtyLK: 0,
      QtyLKCut: 0,
    });

    // lay lenh sx
    if (
      workCenterId != '' &&
      workOrderCode == '' &&
      mainCodeProduct == '' &&
      colorCode == ''
    ) {
      //api lay lenh sx
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryBTP.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryBTP.Workordercode +
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
          WorkOrderCodeData: dataResponse.data,
        };
        setDataDropdownWorkOrderCode(data.WorkOrderCodeData);
        if (data.WorkOrderCodeData.length == 1) {
          // auto fill lenh sx
          let dataDropdownWorkOrderCodeData = data.WorkOrderCodeData;
          setdataPageInput(prevState => ({
            ...prevState,
            workOrderCode: dataDropdownWorkOrderCodeData[0].id,
          }));

          // api lay ma hang
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryBTP.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryBTP.Maincodeproduct +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              dataDropdownWorkOrderCodeData[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              mainCodeData: dataResponse.data,
            };
            if (data.mainCodeData.length > 0) {
              // auto ma hang
              let dataDropdownMainCode = data.mainCodeData;
              setdataPageInput(prevState => ({
                ...prevState,
                mainProductCode: dataDropdownMainCode[0].id,
              }));

              //api lay mau
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryBTP.LIST_FILTER +
                  '?Type=' +
                  ListFilterDeliveryBTP.Colorcode +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  dataDropdownWorkOrderCodeData[0].id +
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
                setDataDropdownColor(data.colorCodeData);
                if (data.colorCodeData.length == 1) {
                  // auto fill mau
                  let dataDropdownColorCode = data.colorCodeData;

                  setDataShowColor(dataDropdownColorCode[0].name);
                  setdataPageInput(prevState => ({
                    ...prevState,
                    colorCode: dataDropdownColorCode[0].id,
                  }));

                  //api lay size
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiDeliveryBTP.LIST_FILTER +
                      '?Type=' +
                      ListFilterDeliveryBTP.Sizecode +
                      '&Workcenterid=' +
                      workCenterId +
                      '&Workordercode=' +
                      dataDropdownWorkOrderCodeData[0].id +
                      '&Mainproductcode=' +
                      dataDropdownMainCode[0].id +
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

    // lay ma hang
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct == '' &&
      colorCode == ''
    ) {
      // api lay ma hang
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryBTP.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryBTP.Maincodeproduct +
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
          mainCodeData: dataResponse.data,
        };
        if (data.mainCodeData.length > 0) {
          // auto ma hang
          let dataDropdownMainCode = data.mainCodeData;
          setdataPageInput(prevState => ({
            ...prevState,
            mainProductCode: dataDropdownMainCode[0].id,
          }));

          //api lay mau
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryBTP.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryBTP.Colorcode +
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
            setDataDropdownColor(data.colorCodeData);
            if (data.colorCodeData.length == 1) {
              // auto fill mau
              let dataDropdownColorCode = data.colorCodeData;

              setDataShowColor(dataDropdownColorCode[0].name);
              setdataPageInput(prevState => ({
                ...prevState,
                colorCode: dataDropdownColorCode[0].id,
              }));

              //api lay size
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryBTP.LIST_FILTER +
                  '?Type=' +
                  ListFilterDeliveryBTP.Sizecode +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  workOrderCode +
                  '&Mainproductcode=' +
                  dataDropdownMainCode[0].id +
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

    // lay mau
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      colorCode == ''
    ) {
      //api lay mau
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryBTP.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryBTP.Colorcode +
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
          colorCodeData: dataResponse.data,
        };
        setDataDropdownColor(data.colorCodeData);
        if (data.colorCodeData.length == 1) {
          // auto fill mau
          let dataDropdownColorCode = data.colorCodeData;
          setDataShowColor(dataDropdownColorCode[0].name);
          setdataPageInput(prevState => ({
            ...prevState,
            colorCode: dataDropdownColorCode[0].id,
          }));

          //api lay size
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryBTP.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryBTP.Sizecode +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              mainCodeProduct +
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
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      colorCode != ''
    ) {
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryBTP.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryBTP.Sizecode +
          '&Workcenterid=' +
          workCenterId +
          '&Workordercode=' +
          workOrderCode +
          '&Mainproductcode=' +
          mainCodeProduct +
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
  const getDataDropDownByFilter = async (
    workCenterId: string,
    workOrderCode: string,
    mainCodeProduct: string,
    colorCode: string,
  ) => {
    setErrors([]);
    setDataQty({
      QtyKH: 0,
      EsQtyLK: 0,
      QtyLK: 0,
      QtyLKCut: 0,
    });

    // lay lenh sx
    if (
      workCenterId != '' &&
      workOrderCode == '' &&
      mainCodeProduct == '' &&
      colorCode == ''
    ) {
      //api lay lenh sx
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryBTP.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryBTP.Workordercode +
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
          WorkOrderCodeData: dataResponse.data,
        };
        setDataDropdownWorkOrderCode(data.WorkOrderCodeData);
        if (data.WorkOrderCodeData.length == 1) {
          // auto fill lenh sx
          let dataDropdownWorkOrderCodeData = data.WorkOrderCodeData;
          setdataPageInput(prevState => ({
            ...prevState,
            workOrderCode: dataDropdownWorkOrderCodeData[0].id,
          }));

          // api lay ma hang
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryBTP.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryBTP.Maincodeproduct +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              dataDropdownWorkOrderCodeData[0].id,
            null,
          );
          if (
            typeof dataResponse !== 'string' &&
            dataResponse != null &&
            dataResponse.isSuccess === true
          ) {
            let data = {
              mainCodeData: dataResponse.data,
            };
            setDataDropdownColor(data.mainCodeData);
            if (data.mainCodeData.length > 0) {
              // auto ma hang
              let dataDropdownMainCode = data.mainCodeData;
              setdataPageInput(prevState => ({
                ...prevState,
                mainProductCode: dataDropdownMainCode[0].id,
              }));

              //api lay mau
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryBTP.LIST_FILTER +
                  '?Type=' +
                  ListFilterDeliveryBTP.Colorcode +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  dataDropdownWorkOrderCodeData[0].id +
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
                setDataDropdownColor(data.colorCodeData);
                if (data.colorCodeData.length > 0) {
                  // auto fill mau
                  let dataDropdownColorCode = data.colorCodeData;

                  setDataShowColor(dataDropdownColorCode[0].name);
                  setdataPageInput(prevState => ({
                    ...prevState,
                    colorCode: dataDropdownColorCode[0].id,
                  }));

                  //api lay size
                  let dataResponse = await CommonBase.getAsync<ResponseService>(
                    ApiDeliveryBTP.LIST_FILTER +
                      '?Type=' +
                      ListFilterDeliveryBTP.Sizecode +
                      '&Workcenterid=' +
                      workCenterId +
                      '&Workordercode=' +
                      dataDropdownWorkOrderCodeData[0].id +
                      '&Mainproductcode=' +
                      dataDropdownMainCode[0].id +
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

    // lay ma hang
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct == '' &&
      colorCode == ''
    ) {
      // api lay ma hang
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryBTP.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryBTP.Maincodeproduct +
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
          mainCodeData: dataResponse.data,
        };
        setDataDropdownColor(data.mainCodeData);
        if (data.mainCodeData.length > 0) {
          // auto ma hang
          let dataDropdownMainCode = data.mainCodeData;
          setdataPageInput(prevState => ({
            ...prevState,
            mainProductCode: dataDropdownMainCode[0].id,
          }));

          //api lay mau
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryBTP.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryBTP.Colorcode +
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
            setDataDropdownColor(data.colorCodeData);
            if (data.colorCodeData.length > 0) {
              // auto fill mau
              let dataDropdownColorCode = data.colorCodeData;

              setDataShowColor(dataDropdownColorCode[0].name);
              setdataPageInput(prevState => ({
                ...prevState,
                colorCode: dataDropdownColorCode[0].id,
              }));

              //api lay size
              let dataResponse = await CommonBase.getAsync<ResponseService>(
                ApiDeliveryBTP.LIST_FILTER +
                  '?Type=' +
                  ListFilterDeliveryBTP.Sizecode +
                  '&Workcenterid=' +
                  workCenterId +
                  '&Workordercode=' +
                  workOrderCode +
                  '&Mainproductcode=' +
                  dataDropdownMainCode[0].id +
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

    // lay mau
    if (
      workCenterId != '' &&
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      colorCode == ''
    ) {
      //api lay mau
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryBTP.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryBTP.Colorcode +
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
          colorCodeData: dataResponse.data,
        };
        setDataDropdownColor(data.colorCodeData);
        if (data.colorCodeData.length > 0) {
          // auto fill mau
          let dataDropdownColorCode = data.colorCodeData;

          setDataShowColor(dataDropdownColorCode[0].name);
          setdataPageInput(prevState => ({
            ...prevState,
            colorCode: dataDropdownColorCode[0].id,
          }));

          //api lay size
          let dataResponse = await CommonBase.getAsync<ResponseService>(
            ApiDeliveryBTP.LIST_FILTER +
              '?Type=' +
              ListFilterDeliveryBTP.Sizecode +
              '&Workcenterid=' +
              workCenterId +
              '&Workordercode=' +
              workOrderCode +
              '&Mainproductcode=' +
              mainCodeProduct +
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
      workOrderCode != '' &&
      mainCodeProduct != '' &&
      colorCode != ''
    ) {
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryBTP.LIST_FILTER +
          '?Type=' +
          ListFilterDeliveryBTP.Sizecode +
          '&Workcenterid=' +
          workCenterId +
          '&Mainproductcode=' +
          mainCodeProduct +
          '&Colorcode=' +
          colorCode +
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

  const getDataQty = async (value: string) => {
    if (
      dataPageInput.dateRecord &&
      dataPageInput.workCenterId &&
      dataPageInput.mainProductCode &&
      dataPageInput.colorCode &&
      dataPageInput.workOrderCode
    ) {
      baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiDeliveryBTP.GET_INFO_DELIVERY_BTP +
          '?DateRecord=' +
          dataPageInput.dateRecord +
          '&Workcenterid=' +
          dataPageInput.workCenterId +
          '&Mainproductcode=' +
          dataPageInput.mainProductCode +
          '&Colorcode=' +
          dataPageInput.colorCode +
          '&Workordercode=' +
          dataPageInput.workOrderCode +
          '&Sizecode=' +
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
          QtyLK: dataResponse.data.QtyLK,
          EsQtyLK: dataResponse.data.EsQtyLK,
          QtyNow: dataResponse.data.QtyNow,
          QtyLKCut: dataResponse.data.QtyLKCut,
        };

        setDataQty(prevState => ({
          ...prevState,
          QtyKH: data.QtyKH,
          QtyLK: data.QtyLK,
          EsQtyLK: data.EsQtyLK,
          QtyLKCut: data.QtyLKCut,
        }));
        setDataQtyCheck(data.EsQtyLK);
        if (data.QtyNow == null) {
          setdataPageInput(prevState => ({
            ...prevState,
            qtyNow: '',
          }));
          setCheckIsCreate(true);
        } else {
          setdataPageInput(prevState => ({
            ...prevState,
            qtyNow: data.QtyNow,
          }));
          setIsInProgress(true);
          setCheckIsCreate(false);
        }
      }
      baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
    }
  };

  const handleOnChangeQtyNow = (event: any) => {
    const value = event.nativeEvent.text;
    let error = validateField(value, Rules, 'qtyNow', errors);
    setErrors([...error]);
    dataQty.EsQtyLK = dataQty.EsQtyLK - +dataPageInput.qtyNow + +value;
    if (isNaN(dataQty.EsQtyLK) == true) {
      dataQty.EsQtyLK = dataQtyCheck;
    }
    setdataPageInput(prevState => ({
      ...prevState,
      qtyNow: value,
    }));
    setIsInProgress(false);
  };

  const onPressHandleSubmit = async () => {
    setIsInProgress(true);
    let error = validateForm(dataPageInput, Rules, []);
    if (error && error.length > 0) {
      setErrors([...error]);
      return;
    }
    if (+dataPageInput.qtyNow > dataQty.QtyKH) {
      let msg = 'Vượt số lượng lệnh sản xuất!';
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
      Workordercode: dataPageInput.workOrderCode,
      Sizecode: dataPageInput.sizeCode,
      QtyNow: dataPageInput.qtyNow,
    };
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiDeliveryBTP.RECORD_DELIVERY_BTP,
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
    setCheckIsCreate(false);
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const clearData = () => {
    setIsInProgress(false);
    setSelectedDate(new Date());
    setdataPageInput({
      dateRecord: date,
      workCenterId: '',
      mainProductCode: '',
      colorCode: '',
      workOrderCode: '',
      sizeCode: '',
      qtyNow: '',
    });
    setDataQty({
      QtyKH: 0,
      EsQtyLK: 0,
      QtyLK: 0,
      QtyLKCut: 0,
    });
    setCheckIsCreate(true);
    setErrors([]);
    setDataDropdownMainCode([]);
    setDataDropdownColor([]);
    setDataDropdownWorkOrderCode([]);
    setDataDropdownSize([]);
    setDataShowColor('');
    setIsDayBefore(false);
  };

  const onPressHandleClose = () => {
    clearData();
    navigation.navigate('HomePageScreen');
  };

  const onPressHandleDelete = async () => {
    let error = validateForm(dataPageInput, Rules, []);
    if (error && error.length > 0) {
      setErrors([...error]);
      return;
    }
    setIsOpenModal(true);
  };

  const onPressCloseModal = () => {
    setIsOpenModal(false);
    setIsInProgress(false);
  };

  const onPressSubmitModal = async () => {
    let request = {
      DateRecord: dataPageInput.dateRecord,
      Workcenterid: dataPageInput.workCenterId,
      Mainproductcode: dataPageInput.mainProductCode,
      Colorcode: dataPageInput.colorCode,
      Workordercode: dataPageInput.workOrderCode,
      Sizecode: dataPageInput.sizeCode,
    };
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiDeliveryBTP.DELETE_DELIVERY_BTP,
      request,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      setIsInProgress(false);
      await getDataQty(dataPageInput.sizeCode);
      setIsOpenModal(false);
      setCheckIsCreate(true);
    }

    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  useEffect(() => {
    if (dataPageInput.sizeCode) {
      async function handleChangeSizeCode() {
        await getDataQty(dataPageInput.sizeCode);
      }
      handleChangeSizeCode();
    }
  }, [dataPageInput.sizeCode]);

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
          component={null}
          title="Giao nhận BTP ra chuyền"
          hidenStatusBar={true}
          isShowIconRight={true}
          isShowIconLeft={true}
        />
      </LinearGradient>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* <View style={styles.header}>
                    <Text style={styles.textHeaderLabel}>
                        Thông tin phiếu giao nhận
                    </Text>
                </View> */}
        <View
          style={{
            height:
              deviceHeight -
              styles.header.height -
              (deviceHeight - (deviceHeight * 50) / 100),
            // shadowColor: '#00000',
            // shadowOpacity: 0.8,
            // elevation: 8,
          }}>
          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Ngày tạo phiếu:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TouchableOpacity onPress={showDatePicker}>
                  <Text style={styles.datePickerBox}>
                    {dataPageInput.dateRecord ?? selectedDate}
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
                      mainProductCode: '',
                      colorCode: '',
                      workOrderCode: '',
                      sizeCode: '',
                      qtyNow: '',
                    }));
                    setCheckIsCreate(true);
                    setDataDropdownMainCode([]);
                    setDataDropdownColor([]);
                    setDataDropdownWorkOrderCode([]);
                    setDataDropdownSize([]);
                    setDataShowColor('');
                    setIsInProgress(false);
                    let inputFilter = {
                      workCenterId: data[0],
                      mainCodeProduct: '',
                      colorCode: '',
                      workOrderCode: '',
                    };
                    //setCheckIsCreate(false)
                    if (isOnCloud == true) {
                      getDataDropDownByFilterCloud(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.colorCode,
                      );
                    } else {
                      getDataDropDownByFilter(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.colorCode,
                      );
                    }
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

            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Lệnh SX:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownWorkOrderCode}
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
                      sizeCode: '',
                      qtyNow: '',
                    }));
                    let inputFilter = {
                      workCenterId: dataPageInput.workCenterId,
                      workOrderCode: data[0],
                      mainCodeProduct: '',
                      colorCode: '',
                    };
                    setIsInProgress(false);
                    if (isOnCloud == true) {
                      getDataDropDownByFilterCloud(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.colorCode,
                      );
                    } else {
                      getDataDropDownByFilter(
                        inputFilter.workCenterId,
                        inputFilter.workOrderCode,
                        inputFilter.mainCodeProduct,
                        inputFilter.colorCode,
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
                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Màu:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <SelectBaseVer2
                      listData={dataDropdownColor}
                      popupTitle="Mã màu"
                      styles={styles.inputBox}
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
                          sizeCode: '',
                          qtyNow: '',
                        }));
                        let inputFilter = {
                          workCenterId: dataPageInput.workCenterId,
                          workOrderCode: dataPageInput.workOrderCode,
                          mainCodeProduct: dataPageInput.mainProductCode,
                          colorCode: data[0],
                        };
                        if (isOnCloud == true) {
                          getDataDropDownByFilterCloud(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.colorCode,
                          );
                        } else {
                          getDataDropDownByFilter(
                            inputFilter.workCenterId,
                            inputFilter.workOrderCode,
                            inputFilter.mainCodeProduct,
                            inputFilter.colorCode,
                          );
                        }
                      }}
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
              </>
            ) : (
              <>
                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Màu:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <Text style={styles.input}>{dataShowColor ?? ''}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.textInputContent}>
              <View style={{width: 120, justifyContent: 'center'}}>
                <Text style={styles.label}>Kích cỡ:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownSize}
                  popupTitle="Mã Size"
                  title="Chọn mã size"
                  styles={styles.inputBox}
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
                      qtyNow: '',
                    }));
                    setIsInProgress(false);
                    // getDataQty(data[0])
                  }}
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
                <Text style={styles.label}>Số lượng giao:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={dataPageInput.qtyNow + ''}
                  onChange={handleOnChangeQtyNow}
                  placeholder={'Nhập số lượng'}
                  placeholderTextColor={'#AAABAE'}
                  editable={isDayBefore == true ? false : true}
                  style={styles.inputBox}
                  keyboardType="numeric"
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item?.fieldName == 'qtyNow') {
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
        {/* 380 */}
        <View
          style={{
            height:
              deviceHeight -
              styles.submit.height -
              (deviceHeight - (deviceHeight * 57) / 100),
            // shadowColor: '#00000',
            // shadowOpacity: 0.4,
            // elevation: 5,
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
                <Text style={styles.label}>Sản lượng cắt:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={dataQty.QtyLKCut + ''}
                  style={styles.disableInputBox}
                  editable={false}
                />
              </View>
            </View>
            <View style={styles.textInputContent}>
              <View style={{width: 150, paddingLeft: 10}}>
                <Text style={styles.label}>Tổng đã giao:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={dataQty.QtyLK + ''}
                  style={styles.disableInputBox}
                  editable={false}
                />
              </View>
            </View>
            <View style={styles.textInputContent}>
              <View style={{width: 150, paddingLeft: 10}}>
                <Text style={styles.label}>Tổng dự kiến:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TextInput
                  value={dataQty.EsQtyLK + ''}
                  style={styles.disableInputBox}
                  editable={false}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.submit}>
        <View style={{height: 40, width: '25%', paddingRight: 30}}>
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
        {isCreate == true ? (
          <View style={{height: 40, width: '40%', paddingRight: 30}}>
            <TouchableOpacity
              style={styles.disableButton}
              disabled
              onPress={onPressHandleDelete}>
              <View>
                <Text style={{color: '#AAABAE', fontFamily: 'Mulish-SemiBold'}}>
                  {' '}
                  Xoá số lượng{' '}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{height: 40, width: '40%', paddingRight: 30}}>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={onPressHandleDelete}>
              <View>
                <Text style={{color: '#006496', fontFamily: 'Mulish-SemiBold'}}>
                  {' '}
                  Xoá số lượng{' '}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        <View style={{height: 40, width: '30%'}}>
          {isInProgress == false ? (
            <>
              {isDayBefore == false ? (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={onPressHandleSubmit}>
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
            title={'Xoá số lượng'}
            content={'Bạn muốn xoá số lượng ?'}
            handleClose={onPressCloseModal}
            handleConfirm={onPressSubmitModal}
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
  disableButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 35,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#AAABAE',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#004B72',
    height: 35,
    justifyContent: 'center',
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
    fontFamily: 'Mulish',
  },
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  baseAction: bindActionCreators(baseAction, dispatch),
});

export default connect(
  null,
  mapDispatchToProps,
)(DeliverySemiFinishProductScreen);
