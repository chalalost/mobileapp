import {NavigationProp} from '@react-navigation/native';
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {ApiQC, ResponseService} from '../../../../../share/app/constantsApi';
import {Regex} from '../../../../../share/app/regex';
import ModalBase from '../../../../../share/base/component/modal/modalBase';
import {
  IError,
  IRule,
  typeVadilate,
  validateField,
  validateForm,
} from '../../../../../share/commonVadilate/validate';
import CommonBase from '../../../../../share/network/axios';
import {
  ICheckPercentAfterKCS,
  ICheckRecycleOrBypo,
  IListBatchRecyclings,
  IListItemErrors,
  IRecordIOT,
} from '../types/types';
import AddErrorModal from './addErrorModal';
import RecyclingModal from './recyclingModal';

export interface ICheckPercentKCSProp {
  navigation: NavigationProp<any, any>;
  handleCancel: any;
  handleSubmit: Function;
  listCheckPoint: ICheckPercentAfterKCS;
  slotTimeCode: string;
  orderCode: string;
  checkIsRecycleOrCheckBypo: string;
  typeQAQC: number;
  isAllowRecordingWithoutButton: boolean;
}

const Rules: IRule[] = [
  {
    field: 'qtyInLot',
    required: true,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: 'Vui lòng kiểm tra lại SL Lot',
      minLength: '',
      maxLength: 'Giá trị không vượt quá 10 kí tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    },
  },
  {
    field: 'qtyNeedQAQC',
    required: true,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: 'Vui lòng kiểm tra lại SL cần kiểm tra',
      minLength: '',
      maxLength: 'Giá trị không vượt quá 10 kí tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    },
  },
  {
    field: 'qtyOK',
    required: true,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.Number,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: 'Vui lòng kiểm tra lại SL cần kiểm tra',
      minLength: '',
      maxLength: 'Giá trị không vượt quá 10 kí tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    },
  },
  {
    field: 'listErrorNumber',
    required: false,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: 'Vui lòng kiểm tra lại SL lỗi',
      minLength: '',
      maxLength: 'Giá trị không vượt quá 10 kí tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    },
  },
];

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const CheckPercentAfterKCSModal: React.FC<ICheckPercentKCSProp> = ({
  navigation,
  handleCancel,
  handleSubmit,
  listCheckPoint,
  slotTimeCode,
  orderCode,
  checkIsRecycleOrCheckBypo,
  typeQAQC,
  isAllowRecordingWithoutButton,
}) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenRecyleModal, setIsOpenRecyleModal] = useState<boolean>(false);
  const [isInProgress, setIsInProgress] = useState<boolean>(false);
  const [listErrorNumber, setListErrorNumber] = useState<number>(0);
  const [listErrorPointNumber, setListErrorPointNumber] = useState<number>(0);
  const [listConfirmNumber, setListConfirmNumber] = useState<number>(0);
  const [listRecyclingNumber, setListRecyclingNumber] = useState<number>(0);
  const [errors, setErrors] = useState<IError[]>([]);

  const [listCheckPointCount, setListCheckPointCount] = useState<string[]>([]);
  const [listCommitCount, setListCommitCount] = useState<string[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const [dataPageRecordIOT, setDataPageRecordIOT] = useState<IRecordIOT>({
    workcenterid: '',
    maincodeproduct: '',
    workordercode: '',
    checklistcode: '',
    ordercode: '',
    testtypeid: '',
    timeslotcode: '',
    typeQAQC: 0,
    qtyInLot: '',
    qtyNeedQAQC: '',
    qtyOK: '0',
    qtyAlreadyCheck: '',
    qtyNG: '0',
    listItemErrors: [
      {
        id: '',
        listCheckpointItem: [
          {
            checkpointcode: '',
            numberofreminder: 0,
            iscommit: false,
            commitperson: '',
          },
        ],
      },
    ],
    listBatchRecyclings: [
      {
        idNote: '',
        contentRecycling: '',
        listError: [],
      },
    ],
  });

  const [note, setNote] = useState<string>('');

  const [isAbleToSave, setIsAbleToSave] = useState<boolean>(false);
  const [isAbleToRecycle, setIsAbleToRecycle] = useState<boolean>(false);

  const checkRecycleOrCheckBypo = async (e: string) => {
    var ObjToJson: ICheckRecycleOrBypo = JSON.parse(e);
    setIsAbleToSave(true);
    setIsAbleToRecycle(true);
    if (
      ObjToJson.Isfunctionrecycling == false &&
      (typeQAQC == 2 || typeQAQC == 1)
    ) {
      // let msg = 'Sản phẩm không được đánh tái chế!'
      // if (Platform.OS === 'android') {
      //     ToastAndroid.show(msg, ToastAndroid.LONG)
      // } else {
      //     Alert.alert(msg)
      // }
      setIsAbleToRecycle(false);
    }
    if (
      ObjToJson.Isfunctionrecycling == false &&
      typeQAQC == 1 &&
      orderCode != ''
    ) {
      // let msg = 'Sản phẩm không kiểm tra theo đơn hàng!'
      // if (Platform.OS === 'android') {
      //     ToastAndroid.show(msg, ToastAndroid.LONG)
      // } else {
      //     Alert.alert(msg)
      // }
      setIsAbleToRecycle(false);
    }
    if (ObjToJson.Checkbypo == false && typeQAQC == 1 && orderCode != '') {
      let msg = 'Sản phẩm không kiểm tra theo đơn hàng!';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      setIsAbleToSave(false);
    }

    if (ObjToJson.Checkbypo == true && typeQAQC == 1 && orderCode == '') {
      let msg = 'Sản phẩm kiểm tra theo đơn hàng. Vui lòng quay lại thêm!';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      setIsAbleToSave(false);
    }
    if (
      listCheckPoint.checkpointlist == null &&
      isAllowRecordingWithoutButton == true
    ) {
      let msg = 'Danh sách lỗi của sản phẩm chưa tồn tại trong hệ thống!';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      setIsAbleToRecycle(false);
      setIsAbleToSave(false);
    }
  };

  const handleOnChangeQtyInLot = (e: any) => {
    let value = e.nativeEvent.text;
    let error = validateField(value, Rules, 'qtyInLot', errors);
    setErrors([...error]);
    setDataPageRecordIOT(prevState => ({
      ...prevState,
      qtyInLot: value,
    }));
    setIsInProgress(false);
  };

  const handleOnChangeQtyNeedQAQC = (e: any) => {
    let value = e.nativeEvent.text;
    let error = validateField(value, Rules, 'qtyNeedQAQC', errors);
    setErrors([...error]);
    setDataPageRecordIOT(prevState => ({
      ...prevState,
      qtyNeedQAQC: value,
    }));
    setIsInProgress(false);
  };

  const handleOnChangeQtyAlreadyCheck = (e: any) => {
    let value = e.nativeEvent.text;
    let error = validateField(value, Rules, 'qtyAlreadyCheck', errors);
    setErrors([...error]);
    setDataPageRecordIOT(prevState => ({
      ...prevState,
      qtyAlreadyCheck: value,
    }));
    setIsInProgress(false);
  };

  const handleOnChangeQtyOK = (e: any) => {
    let value = e.nativeEvent.text;
    let error = validateField(value, Rules, 'qtyOK', errors);
    setErrors([...error]);
    setDataPageRecordIOT(prevState => ({
      ...prevState,
      qtyOK: value,
    }));
    if (
      value != '' &&
      (parseInt(value) + listErrorNumber).toString() != 'NaN'
    ) {
      setDataPageRecordIOT(prevState => ({
        ...prevState,
        qtyAlreadyCheck: (parseInt(value) + listErrorNumber).toString(),
      }));
    } else {
      return;
    }
    setIsInProgress(false);
  };

  const handlePlus = () => {
    if (dataPageRecordIOT.qtyOK == '') {
      setDataPageRecordIOT(prevState => ({
        ...prevState,
        qtyOK: '1',
      }));
    } else {
      let dataPlus = (parseInt(dataPageRecordIOT.qtyOK) + 1).toString();
      setDataPageRecordIOT(prevState => ({
        ...prevState,
        qtyOK: dataPlus,
      }));
    }
    setIsInProgress(false);
  };

  const handleMinus = () => {
    if (parseInt(dataPageRecordIOT.qtyOK) == 0) {
      return;
    } else {
      let dataMinus = (parseInt(dataPageRecordIOT.qtyOK) - 1).toString();
      setDataPageRecordIOT(prevState => ({
        ...prevState,
        qtyOK: dataMinus,
      }));
    }
    setIsInProgress(false);
  };

  const handleOnchangeErrorNumb = (e: any) => {
    let value = e.nativeEvent.text;
    let error = validateField(value, Rules, 'listErrorNumber', errors);
    setErrors([...error]);
    if (value == '' || parseInt(value) == undefined) {
      value = '0';
      setListErrorNumber(parseInt(value));
    } else {
      setListErrorNumber(parseInt(value));
    }
    if (dataPageRecordIOT.qtyOK != '') {
      if (
        parseInt(value) + parseInt(dataPageRecordIOT.qtyOK).toString() ==
        'NaN'
      ) {
        setDataPageRecordIOT(prevState => ({
          ...prevState,
          qtyAlreadyCheck: '0',
        }));
      } else {
        setDataPageRecordIOT(prevState => ({
          ...prevState,
          qtyAlreadyCheck: (
            parseInt(value) + parseInt(dataPageRecordIOT.qtyOK)
          ).toString(),
        }));
      }
    } else {
      setDataPageRecordIOT(prevState => ({
        ...prevState,
        qtyAlreadyCheck: value,
      }));
    }
  };

  const handleOnChangeNote = (e: any) => {
    let value = e.nativeEvent.text;
    setNote(value);
    setIsInProgress(false);
  };

  let dataErr: IListItemErrors[] = [];
  let dataNote: IListBatchRecyclings[] = [];
  let dataNoteLength: number = 0;
  dataErr = dataPageRecordIOT.listItemErrors.filter(x => x.id != '');
  dataNote = dataPageRecordIOT.listBatchRecyclings.filter(x => x.idNote != '');
  if (dataNote.length > 0) {
    dataNoteLength = 1;
  }

  const submitData = async () => {
    setIsInProgress(true);
    let error = validateForm(dataPageRecordIOT, Rules, []);
    if (error && error.length > 0) {
      setErrors([...error]);
      return;
    }
    console.log('qtyAlreadyCheck', dataPageRecordIOT.qtyAlreadyCheck);
    console.log('qtyInLot', dataPageRecordIOT.qtyInLot);
    console.log('qtyOK', dataPageRecordIOT.qtyOK);
    console.log('listErrorNumber', listErrorNumber);
    console.log('qtyNeedQAQC', dataPageRecordIOT.qtyNeedQAQC);

    if (
      parseInt(dataPageRecordIOT.qtyAlreadyCheck) >
      parseInt(dataPageRecordIOT.qtyInLot)
    ) {
      let msg = 'SL đã kiểm tra không được vượt SL Lot';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      return;
    }
    if (
      parseInt(dataPageRecordIOT.qtyOK) >
      parseInt(dataPageRecordIOT.qtyAlreadyCheck)
    ) {
      let msg = 'SL đạt không được vượt SL đã kiểm tra';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      return;
    }
    if (dataErr.length > parseInt(dataPageRecordIOT.qtyAlreadyCheck)) {
      let msg = 'SL lỗi không được vượt SL đã kiểm tra';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      return;
    }
    if (
      dataErr.length + parseInt(dataPageRecordIOT.qtyOK) >
      parseInt(dataPageRecordIOT.qtyAlreadyCheck)
    ) {
      let msg = 'SL lỗi và SL đạt hiện tại đang vượt quá SL đã kiểm tra';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      return;
    }

    if (isAllowRecordingWithoutButton == true) {
      if (
        dataErr.length + parseInt(dataPageRecordIOT.qtyOK) <
        parseInt(dataPageRecordIOT.qtyAlreadyCheck)
      ) {
        let msg = 'SL lỗi và SL đạt hiện tại đang không bằng SL đã kiểm tra';
        if (Platform.OS === 'android') {
          ToastAndroid.show(msg, ToastAndroid.LONG);
        } else {
          Alert.alert(msg);
        }
        return;
      }

      if (
        dataErr.length + parseInt(dataPageRecordIOT.qtyOK) <
        parseInt(dataPageRecordIOT.qtyNeedQAQC)
      ) {
        let msg = 'SL đã kiểm tra chưa đủ, vui lòng kiểm tra tiếp';
        if (Platform.OS === 'android') {
          ToastAndroid.show(msg, ToastAndroid.LONG);
        } else {
          Alert.alert(msg);
        }
        return;
      }
    }
    if (
      listErrorNumber + parseInt(dataPageRecordIOT.qtyOK) !=
      parseInt(dataPageRecordIOT.qtyNeedQAQC)
    ) {
      let msg = 'SL đã kiểm tra không bằng SL cần kiểm tra';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      return;
    }
    let qtyNg = dataErr.length;
    if (isAllowRecordingWithoutButton == false) {
      qtyNg = listErrorNumber;
    }

    let request = {
      workcenterid: listCheckPoint.workcenterid,
      maincodeproduct: listCheckPoint.maincodeproduct,
      workordercode: listCheckPoint.workordercode,
      checklistcode: listCheckPoint.checklistcode,
      ordercode: orderCode,
      testtypeid: listCheckPoint.testtypeid,
      timeslotcode: slotTimeCode,
      typeQAQC: typeQAQC,
      qtyInLot: parseInt(dataPageRecordIOT.qtyInLot),
      qtyNeedQAQC: parseInt(dataPageRecordIOT.qtyNeedQAQC),
      qtyOK: parseInt(dataPageRecordIOT.qtyOK),
      qtyNG: qtyNg,
      listItemErrors: dataErr,
      listBatchRecyclings: dataNote,
      enterEachResult: isAllowRecordingWithoutButton,
      note: note,
    };
    console.log('request', request);
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiQC.RECORD_LOT,
      request,
    );
    console.log('dataResponse', dataResponse);
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      setIsInProgress(false);
      let msg = 'Lưu thành công';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      if (handleSubmit) {
        handleSubmit();
      }
    }
  };

  const onPressHandleClose = () => {
    if (handleCancel) {
      handleCancel();
    }
  };

  const onPressHandleSubmit = () => {
    submitData();
  };

  const clearData = () => {
    setIsInProgress(false);
    setListErrorNumber(0);
    setListConfirmNumber(0);
    setListErrorPointNumber(0);
    setListCheckPointCount([]);
    setListCommitCount([]);
    setListRecyclingNumber(0);
    setErrors([]);
    setNote('');
    setDataPageRecordIOT({
      workcenterid: '',
      maincodeproduct: '',
      workordercode: '',
      checklistcode: '',
      ordercode: '',
      testtypeid: '',
      timeslotcode: '',
      typeQAQC: 0,
      qtyInLot: '',
      qtyNeedQAQC: '',
      qtyOK: '0',
      qtyAlreadyCheck: '',
      qtyNG: '0',
      listItemErrors: [
        {
          id: '',
          listCheckpointItem: [
            {
              checkpointcode: '',
              numberofreminder: 0,
              iscommit: false,
              commitperson: '',
            },
          ],
        },
      ],
      listBatchRecyclings: [
        {
          idNote: '',
          contentRecycling: '',
          listError: [],
        },
      ],
    });
  };

  useEffect(() => {
    checkRecycleOrCheckBypo(checkIsRecycleOrCheckBypo);
  }, []);

  useEffect(() => {
    if (refreshing == true) {
      checkRecycleOrCheckBypo(checkIsRecycleOrCheckBypo);
      clearData();
    }
  }, [refreshing]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        scrollToOverflowEnabled
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}>
        <View
          style={{
            // height:
            //   deviceHeight -
            //   styles.header.height -
            //   styles.submit.height -
            //   heightStatusBar -
            //   styles.plusButton.height -
            //   styles.plusButton.marginTop -
            //   HeightTitleAppPage
            //   + 120
            marginBottom: 200,
          }}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View
              style={
                {
                  // height:
                  //   deviceHeight -
                  //   styles.header.height -
                  //   (deviceHeight - (deviceHeight * 43.5) / 100),
                }
              }>
              <View style={styles.content}>
                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>SL Lot:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 25}}>
                    <TextInput
                      onChange={data => {
                        handleOnChangeQtyInLot(data);
                      }}
                      placeholder="Nhập SL Lot"
                      placeholderTextColor="#AAABAE"
                      value={dataPageRecordIOT.qtyInLot + ''}
                      style={styles.inputBox}
                      keyboardType="numeric"
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'qtyInLot') {
                            return (
                              <Text
                                key={j}
                                style={{
                                  width: '100%',
                                  height: 20,
                                  //paddingLeft: (deviceWidth * 12.5) / 100,
                                  paddingLeft: 35,
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
                    <Text style={styles.label}>SL cần kiểm tra:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 25}}>
                    <TextInput
                      onChange={data => {
                        handleOnChangeQtyNeedQAQC(data);
                      }}
                      placeholder="Nhập SL cần kiểm tra"
                      placeholderTextColor="#AAABAE"
                      value={dataPageRecordIOT.qtyNeedQAQC + ''}
                      style={styles.inputBox}
                      keyboardType="numeric"
                    />
                    {errors && errors.length > 0
                      ? errors.map((item, j) => {
                          if (item?.fieldName == 'qtyNeedQAQC') {
                            return (
                              <Text
                                key={j}
                                style={{
                                  width: '100%',
                                  height: 20,
                                  //paddingLeft: (deviceWidth * 12.5) / 100,
                                  paddingLeft: 35,
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
                    <Text style={styles.label}>SL đã kiểm tra:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 25}}>
                    <TextInput
                      onChange={data => {
                        handleOnChangeQtyAlreadyCheck(data);
                      }}
                      placeholder=""
                      value={
                        // dataPageRecordIOT.qtyAlreadyCheck
                        dataPageRecordIOT.qtyOK == ''
                          ? listErrorNumber + ''
                          : listErrorNumber +
                            parseInt(dataPageRecordIOT.qtyOK) +
                            ''
                      }
                      style={styles.disabledInputBox}
                      keyboardType="numeric"
                      editable={false}
                    />
                  </View>
                </View>

                {dataPageRecordIOT.listItemErrors != null &&
                listCheckPoint.checkpointlist != null &&
                isAllowRecordingWithoutButton == true ? (
                  <View style={styles.textInputContent}>
                    <View style={{width: 120}}>
                      <Text style={styles.label}>SL sản phẩm lỗi:</Text>
                    </View>
                    <View style={{width: deviceWidth - 175}}>
                      {/* qtyNG đấy */}
                      <TextInput
                        placeholder="0"
                        placeholderTextColor="#AAABAE"
                        value={listErrorNumber + ''}
                        style={styles.disabledInputBox}
                        keyboardType="numeric"
                        editable={false}
                      />
                    </View>

                    <View style={{width: '25%'}}>
                      <TouchableOpacity
                        style={styles.addErrorButton}
                        onPress={() => setIsOpenModal(true)}>
                        <Text
                          style={{
                            color: '#000000',
                            fontFamily: 'Mulish-SemiBold',
                            fontSize: 12,
                          }}>
                          Thêm SP lỗi
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.textInputContent}>
                    <View style={{width: 120}}>
                      <Text style={styles.label}>SL sản phẩm lỗi:</Text>
                    </View>
                    <View style={{width: deviceWidth - 100 - 25}}>
                      <TextInput
                        placeholder="0"
                        onChange={handleOnchangeErrorNumb}
                        placeholderTextColor="#AAABAE"
                        value={listErrorNumber + ''}
                        style={styles.inputBox}
                        keyboardType="numeric"
                        editable={
                          isAllowRecordingWithoutButton == false ? true : false
                        }
                      />
                      {errors && errors.length > 0
                        ? errors.map((item, j) => {
                            if (item?.fieldName == 'listErrorNumber') {
                              return (
                                <Text
                                  key={j}
                                  style={{
                                    width: '100%',
                                    height: 20,
                                    paddingLeft: (deviceWidth * 8) / 100,
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
                )}

                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>SL sản phẩm đạt:</Text>
                  </View>
                  {isAllowRecordingWithoutButton == true ? (
                    <>
                      <View style={{width: deviceWidth - 175}}>
                        <TextInput
                          onChange={data => {
                            handleOnChangeQtyOK(data);
                          }}
                          placeholderTextColor="#AAABAE"
                          value={dataPageRecordIOT.qtyOK + ''}
                          style={styles.disabledInputBox}
                          keyboardType="numeric"
                          editable={false}
                        />
                        {errors && errors.length > 0
                          ? errors.map((item, j) => {
                              if (item?.fieldName == 'qtyOK') {
                                return (
                                  <Text
                                    key={j}
                                    style={{
                                      width: '100%',
                                      height: 20,
                                      paddingLeft: (deviceWidth * 8) / 100,
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
                      <View style={{width: '25%', flexDirection: 'row'}}>
                        <TouchableOpacity
                          style={styles.plusButton}
                          onPress={handlePlus}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontFamily: 'Mulish-SemiBold',
                              fontSize: 16,
                            }}>
                            +
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.minusButton}
                          onPress={handleMinus}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontFamily: 'Mulish-SemiBold',
                              fontSize: 16,
                            }}>
                            -
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <View style={{width: deviceWidth - 100 - 25}}>
                      <TextInput
                        onChange={data => {
                          handleOnChangeQtyOK(data);
                        }}
                        placeholder="0"
                        placeholderTextColor="#AAABAE"
                        value={dataPageRecordIOT.qtyOK + ''}
                        style={styles.inputBox}
                        keyboardType="numeric"
                        editable={
                          isAllowRecordingWithoutButton == false ? true : false
                        }
                      />
                      {errors && errors.length > 0
                        ? errors.map((item, j) => {
                            if (item?.fieldName == 'qtyOK') {
                              return (
                                <Text
                                  key={j}
                                  style={{
                                    width: '100%',
                                    height: 20,
                                    paddingLeft: (deviceWidth * 8) / 100,
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
                  )}
                </View>
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
                  (deviceHeight - (deviceHeight * 32) / 100),
              }}>
              <View style={styles.content}>
                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Số lượng điểm lỗi:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <Text style={styles.input}>
                      {listCheckPointCount.length + ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Cam kết:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <Text style={styles.input}>
                      {listCommitCount.length + ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.textInputContent}>
                  <View style={{width: 120}}>
                    <Text style={styles.label}>Tái chế:</Text>
                  </View>
                  <View style={{width: deviceWidth - 100 - 20}}>
                    <Text style={styles.input}>{dataNoteLength + ''}</Text>
                  </View>
                </View>
                {/* <View style={styles.submitViewError}>
                            <View style={{ height: 40, width: '32%' }}>
                                <TouchableOpacity style={styles.addErrorButton}
                                //onPress={}
                                >
                                    <Text style={{ color: '#000000', fontFamily: 'Mulish-Bold' }}> Xem lỗi </Text>
                                </TouchableOpacity>
                            </View>
                        </View> */}
              </View>
            </View>

            {isAllowRecordingWithoutButton == false ? (
              <>
                <View style={styles.header2}>
                  <Text style={styles.textHeaderLabel}></Text>
                </View>
                <View
                  style={
                    {
                      // height:
                      //   deviceHeight -
                      //   styles.header.height -
                      //   (deviceHeight - (deviceHeight * 14) / 100),
                    }
                  }>
                  <View
                    style={{
                      padding: 16,
                      backgroundColor: '#FFFFFF',
                    }}>
                    <TextInput
                      style={styles.inputBoxNote}
                      onChange={data => handleOnChangeNote(data)}
                      placeholder={'Nhập nội dung'}
                      placeholderTextColor={'#006496'}
                      multiline={true}
                      numberOfLines={8}
                      value={note}
                    />
                  </View>
                </View>

                <View style={styles.header2}>
                  <Text style={styles.textHeaderLabel}></Text>
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAwareScrollView>

      {/* submit */}
      <View style={styles.submit}>
        {isAbleToRecycle == true ? (
          <View style={{height: 40, width: '32%', paddingRight: 20}}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                setIsOpenRecyleModal(true);
              }}>
              <View>
                <Text style={{color: '#ffffff', fontFamily: 'Mulish-Bold'}}>
                  {' '}
                  Tái chế{' '}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{height: 40, width: '32%', paddingRight: 20}}>
            <TouchableOpacity style={styles.disableButton} disabled>
              <View>
                <Text style={{color: '#AAABAE', fontFamily: 'Mulish-Bold'}}>
                  {' '}
                  Tái chế{' '}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        <View style={{height: 40, width: '30%', paddingRight: 20}}>
          <TouchableOpacity
            style={styles.delinceButton}
            onPress={() => {
              onPressHandleClose();
            }}>
            <View>
              <Text style={{color: '#006496', fontFamily: 'Mulish-Bold'}}>
                {' '}
                Hủy{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {isAbleToSave == true && isInProgress == false ? (
          <View style={{height: 40, width: '30%'}}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => onPressHandleSubmit()}>
              <View>
                <Text style={{color: '#ffffff', fontFamily: 'Mulish-Bold'}}>
                  {' '}
                  Lưu{' '}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{height: 40, width: '30%'}}>
            <TouchableOpacity style={styles.disableButton} disabled>
              <View>
                <Text style={{color: '#AAABAE', fontFamily: 'Mulish-Bold'}}>
                  {' '}
                  Lưu{' '}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isOpenModal ? (
        <ModalBase
          navigation={navigation}
          isOpenModalProps={isOpenModal}
          title={'Thêm sản phẩm lỗi'}
          handleSetModal={(isModal: boolean) => {
            setIsOpenModal(isModal);
          }}
          component={
            <AddErrorModal
              navigation={navigation}
              handleCancel={() => {
                setIsOpenModal(false);
              }}
              listCheckPointData={listCheckPoint}
              handleSubmit={(listDataErr: IListItemErrors[]) => {
                if (listDataErr.length > 0) {
                  listDataErr.forEach(item => {
                    if (item.listCheckpointItem.length > 0) {
                      item.listCheckpointItem.forEach(x => {
                        if (listCheckPointCount.length == 0) {
                          listCheckPointCount.push(x.checkpointcode);
                        } else {
                          if (
                            listCheckPointCount.findIndex(
                              y => y == x.checkpointcode,
                            ) == -1
                          )
                            listCheckPointCount.push(x.checkpointcode);
                        }
                        if (x.iscommit == true) {
                          if (listCommitCount.length == 0) {
                            listCommitCount.push(x.checkpointcode);
                          } else {
                            if (
                              listCommitCount.findIndex(
                                y => y == x.checkpointcode,
                              ) == -1
                            )
                              listCommitCount.push(x.checkpointcode);
                          }
                        }
                      });
                    }
                  });
                }
                setListCheckPointCount(listCheckPointCount);
                setListCommitCount(listCommitCount);
                dataPageRecordIOT.listItemErrors.push(...listDataErr);
                setDataPageRecordIOT(prevState => ({
                  ...prevState,
                  listItemErrors: dataPageRecordIOT.listItemErrors,
                }));
                setIsOpenModal(false);
              }}
              listErrorCheckPoint={dataErr}
              handleListDataErrorLength={(data: number) => {
                setListErrorNumber(data + listErrorNumber);
              }}
              handleListErrorCheckPointLength={(data: number) => {
                setListErrorPointNumber(data + listErrorPointNumber);
              }}
              handleListDataConfirmLength={(data: number) => {
                setListConfirmNumber(data + listConfirmNumber);
              }}
              typeQAQC={typeQAQC}
            />
          }
        />
      ) : null}

      {isOpenRecyleModal ? (
        <ModalBase
          navigation={navigation}
          isOpenModalProps={isOpenRecyleModal}
          title={'Tái chế'}
          handleSetModal={(isModal: boolean) => {
            setIsOpenRecyleModal(isModal);
          }}
          component={
            <RecyclingModal
              navigation={navigation}
              handleCancel={() => {
                setIsOpenRecyleModal(false);
              }}
              listRecycleProps={dataNote}
              handleSubmit={(listDataNote: [IListBatchRecyclings]) => {
                setDataPageRecordIOT(prevState => ({
                  ...prevState,
                  listBatchRecyclings: listDataNote,
                }));
                setIsOpenRecyleModal(false);
              }}
              handleListDataRecycleLength={(data: number) => {
                setListRecyclingNumber(data);
              }}
              typeQAQC={typeQAQC}
            />
          }
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 2,
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
    paddingLeft: 18,
    borderBottomColor: '#001E31',
    height: 60,
    backgroundColor: '#ffffff',
  },
  header2: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderBottomColor: '#001E31',
    height: 16,
    backgroundColor: '#F4F4F9',
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  submit: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 100,
    shadowColor: '#00000',
    shadowOpacity: 0.4,
    backgroundColor: '#ffffff',
    paddingRight: 10,
  },
  submitViewError: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 100,
    shadowColor: '#00000',
    shadowOpacity: 0.4,
    backgroundColor: '#ffffff',
  },
  textHeaderLabel: {
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Mulish-Bold',
    lineHeight: 20,
    color: '#001E31',
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
  imageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  textInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 20,
    paddingBottom: 0,
    height: (deviceHeight * 7) / 100,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingVertical: 8,
  },
  inputBox: {
    width: '80%',
    height: 40,
    paddingLeft: 35,
    color: '#001E31',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-Bold',
  },
  inputBoxNote: {
    color: '#001E31',
    paddingLeft: 16,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
    borderWidth: 1,
    borderColor: '#006496',
    borderRadius: 4,
    height: Platform.OS == 'ios' ? 90 : 90,
  },
  disabledInputBox: {
    width: '80%',
    height: 40,
    paddingLeft: 35,
    color: '#006496',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-Bold',
  },
  inputWithQr: {
    justifyContent: 'center',
    width: '45%',
    height: '80%',
    color: '#001E31',
    fontSize: 12,
  },
  inputDropdown: {
    justifyContent: 'center',
    alignItems: 'center',
    color: '#001E31',
    width: 220,
    paddingLeft: 10,
    fontSize: 12,
    fontFamily: 'Mulish-Bold',
  },
  inputDropdownStepId: {
    justifyContent: 'center',
    alignItems: 'center',
    color: '#001E31',
    width: 260,
    paddingLeft: 10,
    fontFamily: 'Mulish-Bold',
    fontSize: 12,
  },
  input: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingLeft: (deviceWidth * 60) / 100,
    fontWeight: '600',
    color: '#006496',
  },
  labelField: {
    width: '30%',
    color: '#001E31CC',
    fontSize: 14,
    fontFamily: 'Mulish-Bold',
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
  addErrorButton: {
    alignItems: 'center',
    backgroundColor: '#D94949',
    height: 30,
    justifyContent: 'center',
    borderRadius: 5,
    shadowColor: '#00000',
    shadowOpacity: 0.3,
    elevation: 5,
  },
  plusButton: {
    alignItems: 'center',
    backgroundColor: '#006496',
    height: 30,
    width: 30,
    justifyContent: 'center',
    borderRadius: 5,
    shadowColor: '#00000',
    shadowOpacity: 0.3,
    elevation: 5,
    marginLeft: 8,
    marginRight: 8,
  },
  minusButton: {
    alignItems: 'center',
    backgroundColor: '#006496',
    height: 30,
    width: 30,
    justifyContent: 'center',
    borderRadius: 5,
    shadowColor: '#00000',
    shadowOpacity: 0.3,
    elevation: 5,
  },
  delinceButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 35,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#137DB9',
  },
  recycleButton: {
    alignItems: 'center',
    backgroundColor: '#FFE165',
    height: 35,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D94949',
  },
});

export default CheckPercentAfterKCSModal;
