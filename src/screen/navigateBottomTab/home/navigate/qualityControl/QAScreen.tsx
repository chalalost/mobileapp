import {
  DrawerActions,
  NavigationProp,
  useIsFocused,
} from '@react-navigation/native';
import jwt_decode from 'jwt-decode';
import React, {useCallback, useEffect, useState} from 'react';
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
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import LinearGradient from 'react-native-linear-gradient';
import {connect} from 'react-redux';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import baseAction from '../../../../base/saga/action';
import {NavigateHome} from '../../../../share/app/constants/homeConst';
import {
  ApiCommon,
  ApiProductionRecord,
  ApiQC,
  DropDownType,
  ResponseService,
} from '../../../../share/app/constantsApi';
import ModalBase from '../../../../share/base/component/modal/modalBase';
import MyTitleHome from '../../../../share/base/component/myStatusBar/MyTitleHome';
import SelectBaseVer2 from '../../../../share/base/component/selectBase/selectBaseVer2';
import {
  IError,
  IRule,
  validateField,
  validateForm,
} from '../../../../share/commonVadilate/validate';
import CommonBase from '../../../../share/network/axios';
import Storage from '../../../../share/storage/storage';
import {IDropdown} from '../home/types/types';
import {
  FilterRecord,
  TypeWorkcenterMobile,
  WorkByTypeEnumMobile,
} from '../productionRecord/types/enum/productionRecord';
import CheckPercentAfterKCSModal from './component/checkPercentAfterKCSModal';
import {
  ICheckPercentAfterKCS,
  ICheckRecycleOrBypo,
  ICreateIOT,
  typeQAQC,
} from './types/types';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

export interface QAScreenProps {
  navigation: NavigationProp<any, any>;
  baseAction: typeof baseAction;
}

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

const QAScreen: React.FC<QAScreenProps> = ({navigation, baseAction}) => {
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  const [errors, setErrors] = useState<IError[]>([]);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [dataDropdownTypeCheck, setDataDropdownTypeCheck] = useState<
    IDropdown[]
  >([]);
  const [dataDropdownWorkCenter, setDataDropdownWorkCenter] = useState<
    IDropdown[]
  >([]);
  const [dataDropdownWorkOrderCode, setDataDropdownWorkOrderCode] = useState<
    IDropdown[]
  >([]);
  const [dataDropdownOrderCode, setDataDropdownOrderCode] = useState<
    IDropdown[]
  >([]);

  const [dataCheckPointList, setDataCheckPointList] =
    useState<ICheckPercentAfterKCS>({
      workcenterid: '',
      maincodeproduct: '',
      workordercode: '',
      checklistcode: '',
      testtypeid: '',
      timeslotcode: '',
      checkpointlist: [
        {
          checkpointCode: '',
          checkpointName: '',
          detailedDescription: '',
          isCheckEqual: false,
          isCheckInRange: false,
          isNonCheck: false,
          partId: '',
          partName: '',
          qtyLower: 0,
          qtyUpper: 0,
          value: '',
          dataChecked: false,
          listError: [],
        },
      ],
    });

  const [errorPart, setErrorPart] = useState('');

  const [dataPageQC, setDataPageQC] = useState<ICreateIOT>({
    workcenterid: '',
    maincodeproduct: '',
    workordercode: '',
    checklistcode: '',
    ordercode: '',
    testtypeid: '',
    timeslotcode: '',
    typeQAQC: typeQAQC.QA,
  });

  const [isCheckRecycleOrBypo, setIsCheckRecycleOrBypo] = useState('');
  const [nameTypeCheck, setNameTypeCheck] = useState('');
  const [isAbleTickOrderCode, setIsAbleTickOrderCode] =
    useState<boolean>(false);
  const [isShowCheckBox, setIsShowCheckBox] = useState<boolean>(false);
  const [isAllowRecordingWithoutButton, setIsAllowRecordingWithoutButton] =
    useState<boolean>(true);

  const Rules: IRule[] = [
    {
      field: 'testtypeid',
      required: true,
      maxLength: 255,
      minLength: 0,
      typeValidate: 0,
      valueCheck: false,
      maxValue: 0,
      messages: {
        required: 'Loại kiểm tra không được bỏ trống',
        minLength: '',
        maxLength: '',
        validate: '',
        maxValue: '',
      },
    },
    {
      field: 'workcenterid',
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
      field: 'workordercode',
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
        maxValue: '',
        validate: '',
      },
    },
    {
      field: 'ordercode',
      required: isAbleTickOrderCode,
      maxLength: 255,
      minLength: 0,
      typeValidate: 0,
      maxValue: 0,
      valueCheck: false,
      messages: {
        required: 'Đơn hàng không được bỏ trống',
        minLength: '',
        maxLength: '',
        validate: '',
        maxValue: '',
      },
    },
  ];

  const getDataDropdownTypeCheck = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_API_COMMON_2 +
        '?type=' +
        DropDownType.TypeCheck +
        '&typeQAQC=' +
        typeQAQC.QA,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data = {
        typeCheck: dataResponse.data,
      };
      setDataDropdownTypeCheck(data.typeCheck);
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
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

  const getDataDropDownByFilter = async (
    workCenterId: string,
    workOrderCode: string,
  ) => {
    if (workCenterId != '' && workOrderCode == '') {
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
        setDataDropdownWorkOrderCode(data.Workordercode);
        if (data.Workordercode.length == 1) {
          // auto fill lenh sx
          let dataDropdownWorkordercode = data.Workordercode;
          setDataPageQC(prevState => ({
            ...prevState,
            workordercode: dataDropdownWorkordercode[0].id,
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
              setDataPageQC(prevState => ({
                ...prevState,
                maincodeproduct: dataDropdownMainCode[0].id,
              }));
              // api lay orderCode
              let dataOrderCode = await CommonBase.getAsync<ResponseService>(
                ApiCommon.GET_API_COMMON +
                  '?type=' +
                  WorkByTypeEnumMobile.Ordercode +
                  '&code=' +
                  dataDropdownMainCode[0].id +
                  '&typeWorkcenter=' +
                  TypeWorkcenterMobile.May,
                null,
              );
              if (
                typeof dataOrderCode !== 'string' &&
                dataOrderCode != null &&
                dataOrderCode.isSuccess === true
              ) {
                let data = {
                  dataOrderCodeData: dataOrderCode.data,
                };
                setDataDropdownOrderCode(data.dataOrderCodeData);
              }
            }
          }
        }
      }
    }
    if (workCenterId != '' && workOrderCode != '') {
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
        if (data.mainProductCodeData.length > 0) {
          // auto fill ma hang
          let dataDropdownMainCode = data.mainProductCodeData;
          setDataPageQC(prevState => ({
            ...prevState,
            maincodeproduct: dataDropdownMainCode[0].id,
          }));
          // api lay orderCode
          let dataOrderCode = await CommonBase.getAsync<ResponseService>(
            ApiCommon.GET_API_COMMON +
              '?type=' +
              WorkByTypeEnumMobile.Ordercode +
              '&code=' +
              dataDropdownMainCode[0].id +
              '&typeWorkcenter=' +
              TypeWorkcenterMobile.May,
            null,
          );
          if (
            typeof dataOrderCode !== 'string' &&
            dataOrderCode != null &&
            dataOrderCode.isSuccess === true
          ) {
            let data = {
              dataOrderCodeData: dataOrderCode.data,
            };
            setDataDropdownOrderCode(data.dataOrderCodeData);
          }
        }
      }
    }
  };

  const getDataInfoPartError = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataPartError = await CommonBase.getAsync<ResponseService>(
      ApiQC.GET_INFO_PART_ERROR +
        '?typeQAQC=' +
        typeQAQC.QA +
        '&testTypeId=' +
        dataPageQC.testtypeid +
        '&checklistcode=' +
        dataPageQC.checklistcode +
        '&workcenterid=' +
        dataPageQC.workcenterid +
        '&maincodeproduct=' +
        dataPageQC.maincodeproduct +
        '&workordercode=' +
        dataPageQC.workordercode +
        '&ordercode=' +
        dataPageQC.ordercode,
      null,
    );
    if (
      typeof dataPartError !== 'string' &&
      dataPartError != null &&
      dataPartError.isSuccess === true
    ) {
      let data = {
        partError: dataPartError.data,
      };
      setErrorPart(data.partError);
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const getDataCreateIOT = async () => {
    let dataCreateIOT = await CommonBase.getAsync<ResponseService>(
      ApiQC.GET_INFO_CREATE_IOT +
        '?typeQAQC=' +
        typeQAQC.QA +
        '&testTypeId=' +
        dataPageQC.testtypeid +
        '&checklistcode=' +
        dataPageQC.checklistcode +
        '&workcenterid=' +
        dataPageQC.workcenterid +
        '&maincodeproduct=' +
        dataPageQC.maincodeproduct +
        '&workordercode=' +
        dataPageQC.workordercode +
        '&ordercode=' +
        dataPageQC.ordercode,
      null,
    );
    if (
      typeof dataCreateIOT !== 'string' &&
      dataCreateIOT != null &&
      dataCreateIOT.isSuccess === true
    ) {
      let data = {
        createIOT: dataCreateIOT.data,
      };
      setDataCheckPointList(data.createIOT);
    }
  };

  const onPressHandleClose = () => {
    clearData();
    navigation.navigate(NavigateHome.HomePageScreen);
  };

  const onPressSubmitNextPage = () => {
    let error = validateForm(dataPageQC, Rules, []);
    if (error && error.length > 0) {
      setErrors([...error]);
      return;
    }
    setIsOpenModal(true);
  };

  const clearData = () => {
    setDataPageQC({
      workcenterid: '',
      maincodeproduct: '',
      workordercode: '',
      checklistcode: '',
      ordercode: '',
      testtypeid: '',
      timeslotcode: '',
      typeQAQC: typeQAQC.QA,
    });
    setErrors([]);
    setErrorPart('');
    setDataDropdownWorkOrderCode([]);
    setDataDropdownWorkCenter([]);
    setDataDropdownTypeCheck([]);
    setDataDropdownOrderCode([]);
    if (isShowCheckBox == true) {
      setIsAllowRecordingWithoutButton(true);
    } else {
      setIsAllowRecordingWithoutButton(false);
    }
    setIsAbleTickOrderCode(false);
  };

  const checkRecycleOrCheckBypo = async (e: string) => {
    var ObjToJson: ICheckRecycleOrBypo = JSON.parse(e);
    setIsAbleTickOrderCode(true);
    if (ObjToJson.Checkbypo == false) {
      // let msg = 'Sản phẩm không được đánh tái chế!'
      // if (Platform.OS === 'android') {
      //     ToastAndroid.show(msg, ToastAndroid.LONG)
      // } else {
      //     Alert.alert(msg)
      // }
      setIsAbleTickOrderCode(false);
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
          console.log('111111');
          setIsAllowRecordingWithoutButton(true);
          setIsShowCheckBox(true);
        }
      } else {
        setIsAllowRecordingWithoutButton(false);
        setIsShowCheckBox(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    getDataInfoPartError();
    getDataCreateIOT();
  }, [dataPageQC.maincodeproduct]);

  useEffect(() => {
    getDataInfoPartError();
    getDataCreateIOT();
  }, [dataPageQC.ordercode]);

  useEffect(() => {
    if (refreshing == true) {
      getDataDropdownTypeCheck();
      getDataDropdownWorkCenter();
      clearData();
    }
  }, [refreshing]);

  useEffect(() => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    if (isFocused == true) {
      getDataDropdownTypeCheck();
      getDataDropdownWorkCenter();
      setIsAllowRecordingWithoutButton(true);
    } else {
      clearData();
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  }, [isFocused]);

  console.log('is', isAllowRecordingWithoutButton);

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
          title="Kiểm tra chất lượng"
          hidenStatusBar={true}
          isShowIconRight={true}
        />
      </LinearGradient>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View
          style={
            {
              // height:
              //   isAbleTickOrderCode == true
              //     ? deviceHeight -
              //       styles.header.height -
              //       (deviceHeight - (deviceHeight * 44) / 100)
              //     : deviceHeight -
              //       styles.header.height -
              //       (deviceHeight - (deviceHeight * 36) / 100),
            }
          }>
          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Loại kiểm tra:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownTypeCheck}
                  styles={styles.inputBox}
                  title="Chọn loại kiểm tra"
                  popupTitle="Loại kiểm tra"
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'testtypeid',
                      errors,
                    );
                    let checkStringRecycle = dataDropdownTypeCheck.filter(
                      x => x.id == data[0],
                    )[0].code;
                    let nameTypeCheck = dataDropdownTypeCheck.filter(
                      x => x.id == data[0],
                    )[0].name;
                    setIsCheckRecycleOrBypo(checkStringRecycle);
                    checkRecycleOrCheckBypo(checkStringRecycle);
                    setNameTypeCheck(nameTypeCheck);
                    setErrors([...error]);
                    setDataPageQC(stateOld => ({
                      ...stateOld,
                      testtypeid: data[0],
                      workcenterid: '',
                      workordercode: '',
                      maincodeproduct: '',
                      checklistcode: '',
                      timeslotcode: '',
                      typeQAQC: typeQAQC.QA,
                      ordercode: '',
                    }));
                    setErrors([]);
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageQC.testtypeid]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item.fieldName == 'testtypeid') {
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
                <Text style={styles.label}>Tổ may:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <SelectBaseVer2
                  listData={dataDropdownWorkCenter}
                  styles={styles.inputBox}
                  title="Chọn tổ may"
                  popupTitle="Tổ may"
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'workcenterid',
                      errors,
                    );
                    setErrors([...error]);

                    setDataPageQC(stateOld => ({
                      ...stateOld,
                      workcenterid: data[0],
                      workordercode: '',
                      maincodeproduct: '',
                      checklistcode: '',
                      timeslotcode: '',
                      typeQAQC: typeQAQC.QA,
                      ordercode: '',
                    }));

                    setErrors([]);
                    setDataDropdownWorkOrderCode([]);
                    let inputFilter = {
                      workCenterId: data[0],
                      workOrderCode: '',
                    };
                    getDataDropDownByFilter(
                      inputFilter.workCenterId,
                      inputFilter.workOrderCode,
                    );
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageQC.workcenterid]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item.fieldName == 'workcenterid') {
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
                  styles={styles.inputBox}
                  title="Chọn lệnh SX"
                  popupTitle="Lệnh Sản xuất"
                  onSelect={data => {
                    let error = validateField(
                      data[0],
                      Rules,
                      'workordercode',
                      errors,
                    );
                    setErrors([...error]);

                    setDataPageQC(stateOld => ({
                      ...stateOld,
                      workordercode: data[0],
                      maincodeproduct: '',
                      checklistcode: '',
                      timeslotcode: '',
                      typeQAQC: typeQAQC.QA,
                      ordercode: '',
                    }));
                    setErrors([]);
                    let inputFilter = {
                      workCenterId: dataPageQC.workcenterid,
                      workOrderCode: data[0],
                    };
                    getDataDropDownByFilter(
                      inputFilter.workCenterId,
                      inputFilter.workOrderCode,
                    );
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[dataPageQC.workordercode]}
                  isSelectSingle={true}
                />
                {errors && errors.length > 0
                  ? errors.map((item, j) => {
                      if (item.fieldName == 'workordercode') {
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

            {isAbleTickOrderCode == true ? (
              <View style={styles.textInputContent}>
                <View style={{width: 120}}>
                  <Text style={styles.label}>Đơn hàng:</Text>
                </View>
                <View style={{width: deviceWidth - 100 - 20}}>
                  <SelectBaseVer2
                    listData={dataDropdownOrderCode}
                    styles={styles.inputBox}
                    title="Chọn đơn hàng"
                    popupTitle="Đơn hàng"
                    onSelect={data => {
                      let error = validateField(
                        data[0],
                        Rules,
                        'ordercode',
                        errors,
                      );
                      setErrors([...error]);

                      setDataPageQC(stateOld => ({
                        ...stateOld,
                        ordercode: data[0],
                        checklistcode: '',
                        typeQAQC: typeQAQC.QA,
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
                    valueArr={[dataPageQC.ordercode]}
                    isSelectSingle={true}
                  />
                  {errors && errors.length > 0
                    ? errors.map((item, j) => {
                        if (item.fieldName == 'ordercode') {
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

            {isShowCheckBox == true ? (
              <View style={styles.textInputContent}>
                <View style={{width: 120}}>
                  <Text style={styles.label}>Nhập lỗi từng theo sản phẩm:</Text>
                </View>
                <View style={{width: deviceWidth - 100 - 20}}>
                  <View style={styles.checkBox}>
                    <BouncyCheckbox
                      onPress={data => setIsAllowRecordingWithoutButton(data)}
                      fillColor={'#006496'}
                      size={20}
                      isChecked={
                        isAllowRecordingWithoutButton
                      }></BouncyCheckbox>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.header2}>
          <Text style={styles.textHeaderLabel}></Text>
        </View>

        <View
          style={{
            height:
              deviceHeight -
              styles.header.height -
              (deviceHeight - (deviceHeight * 31) / 100),
            // shadowColor: '#00000',
            // shadowOpacity: 0.8,
            // elevation: 8,
          }}>
          {errorPart && errorPart !== '' ? (
            <View style={styles.content}>
              <View style={styles.textInputContent}>
                <View style={{width: 120}}>
                  <Text style={styles.label}>Bộ phận đã xảy ra lỗi:</Text>
                </View>
                <View style={{width: deviceWidth - 100 - 20}}>
                  <Text style={styles.input}>{errorPart + ''}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.textInputContent}>
                <View style={{width: 120}}>
                  <Text style={styles.label}>Bộ phận đã xảy ra lỗi:</Text>
                </View>
                <View style={{width: deviceWidth - 100 - 20}}>
                  <Text style={styles.input}>Không có bộ phận nào lỗi </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.submit}>
        <View style={{height: 40, width: '33%', paddingRight: 30}}>
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
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => onPressSubmitNextPage()}>
            <View>
              <Text style={{color: '#ffffff', fontFamily: 'Mulish-SemiBold'}}>
                {' '}
                Bắt đầu{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {isOpenModal ? (
        <ModalBase
          navigation={navigation}
          isOpenModalProps={isOpenModal}
          title={'Loại KT: ' + nameTypeCheck}
          handleSetModal={(isModal: boolean) => {
            setIsOpenModal(isModal);
          }}
          component={
            <CheckPercentAfterKCSModal
              navigation={navigation}
              listCheckPoint={dataCheckPointList}
              handleCancel={() => {
                setIsOpenModal(false);
              }}
              handleSubmit={() => {
                setIsOpenModal(false);
              }}
              slotTimeCode={dataPageQC.timeslotcode}
              orderCode={dataPageQC.ordercode}
              checkIsRecycleOrCheckBypo={isCheckRecycleOrBypo}
              typeQAQC={typeQAQC.QA}
              isAllowRecordingWithoutButton={isAllowRecordingWithoutButton}
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 40,
    fontWeight: '600',
    color: '#003858',
  },
  checkBox: {
    paddingLeft: 70,
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
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  baseAction: bindActionCreators(baseAction, dispatch),
});

export default connect(null, mapDispatchToProps)(QAScreen);
