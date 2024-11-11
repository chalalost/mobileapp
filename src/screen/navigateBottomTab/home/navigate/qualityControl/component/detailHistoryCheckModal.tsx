import {NavigationProp} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Svg, {Circle, Path} from 'react-native-svg';
import {IActionMenu} from '../../../../../base/typeBase/type';
import {HeightTitleApp} from '../../../../../share/app/constants/constansHeightApp';
import {
  ApiHistoryQuality,
  ResponseService,
} from '../../../../../share/app/constantsApi';
import CommonBase from '../../../../../share/network/axios';
import {
  IDataLot,
  IListBatchRecyclingDetail,
  IListCheckpointDetail,
} from '../types/types';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

let heightStatusBar = StatusBar.currentHeight ? StatusBar.currentHeight : 0;
let HeightTitleAppPage = HeightTitleApp.Android;
if (Platform.OS == 'ios') {
  HeightTitleAppPage = HeightTitleApp.Ios;
}

export interface DetailHistoryCheckProps {
  navigation: NavigationProp<any, any>;
  handleCancel: any;
  handleSubmit: Function;
  timeCheck: string;
  dataDetail: IDataLot;
  listActionForMenuSelected: IActionMenu[] | [];
}

export interface IQty {
  qtyOk: string | '';
  qtyErr: string | '';
  Note: string | '';
}

const DetailHistoryCheckModal: React.FC<DetailHistoryCheckProps> = ({
  navigation,
  handleCancel,
  handleSubmit,
  timeCheck,
  dataDetail,
  listActionForMenuSelected,
}) => {
  const [isInProgress, setIsInProgress] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const [qtyPage, setQty] = useState<IQty>({
    qtyOk: '',
    qtyErr: '',
    Note: '',
  });
  const totalQty = dataDetail.QtyOK + dataDetail.QtyError;

  const [dataBatchRecyclingDetail, setDataBatchRecyclingDetail] = useState<
    IListBatchRecyclingDetail[]
  >([
    // {
    //     BatchId: "",
    //     Content: "",
    //     IsDelete: false
    // }
  ]);
  const [dataCheckpointDetail, setDataCheckpointDetail] = useState<
    IListCheckpointDetail[]
  >([
    //     {
    //     Id: "",
    //     ItemId: "",
    //     LotCode: "",
    //     CheckpointCode: "",
    //     CheckpointName: "",
    //     IsNonCheck: false,
    //     IsCheckInRange: false,
    //     IsCheckEqual: false,
    //     QtyLower: 0,
    //     QtyUpper: 0,
    //     Value: '0',
    //     PartName: "",
    //     PartId: "",
    //     DetailedDescription: "",
    //     IsCommit: false,
    //     IsDelete: false,
    // }
  ]);

  const getDataDetailInLot = async () => {
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiHistoryQuality.GET_LIST_DATA_WITH_LOTCODE + dataDetail.Lotcode,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data = {
        listDataBatchRecyclingDetail:
          dataResponse.data.ListBatchRecyclingDetail,
        listCheckpointDetail: dataResponse.data.ListCheckpointDetail,
      };
      setDataBatchRecyclingDetail(data.listDataBatchRecyclingDetail);
      setDataCheckpointDetail(data.listCheckpointDetail);
    }
  };

  const onPressHandleClose = () => {
    if (handleCancel) {
      handleCancel();
    }
  };

  const deleteRecycle = async (batchId: string) => {
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiHistoryQuality.DELETE_BATCH_RECYCLING + batchId,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let msg = 'Xóa nội dung tái chế thành công';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      if (dataBatchRecyclingDetail.length > 0) {
        let index = -1;
        dataBatchRecyclingDetail.forEach((data, j) => {
          if (data.BatchId == batchId) {
            index = j;
          }
        });
        if (index >= 0) {
          dataBatchRecyclingDetail.splice(index, 1);
          setDataBatchRecyclingDetail([...dataBatchRecyclingDetail]);
        }
      }
    } else {
      let msg = 'Tài khoản không có quyền xóa nội dung này';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } else {
        Alert.alert(msg);
      }
      return;
    }
  };

  const deleteErrorProduct = async (id: string) => {
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiHistoryQuality.DELETE_FAULTY_PRODUCT + id,
      id,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let msg = 'Xóa lỗi thành công';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      if (dataCheckpointDetail.length > 0) {
        let index = -1;
        dataCheckpointDetail.forEach((data, j) => {
          if (data.Id == id) {
            index = j;
          }
        });
        if (index >= 0) {
          dataCheckpointDetail.splice(index, 1);
          setDataCheckpointDetail([...dataCheckpointDetail]);
        }
      }
    } else {
      let msg = 'Tài khoản không có quyền xóa lỗi này';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } else {
        Alert.alert(msg);
      }
      return;
    }
  };

  const handleOnChangeNote = (e: any, index: number) => {
    const value = e.nativeEvent.text;
    if (dataBatchRecyclingDetail.length > 0) {
      dataBatchRecyclingDetail[index].Content = value;
    }
    setDataBatchRecyclingDetail([...dataBatchRecyclingDetail]);
  };

  const editRecycle = async (id: string, index: number, recycleDetail: any) => {
    const value = recycleDetail.nativeEvent.text;
    let request = {
      BatchId: id,
      Content: value,
    };
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiHistoryQuality.EDIT_RECYCLE,
      request,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let msg = 'Thay đổi nội dung tái chế thành công';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
    } else {
      let msg = 'Tài khoản không có quyền thay đổi nội dung này';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      getDataDetailInLot();
    }
  };

  const editCommit = async (id: string, isChecked: boolean) => {
    let request = {
      Id: id,
      IsCommit: isChecked,
    };
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiHistoryQuality.EDIT_ERROR_PRODUCT,
      request,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let msg = 'Thay đổi cam kết thành công';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      dataCheckpointDetail.map(x => {
        if (x.Id == id) {
          x.IsCommit == isChecked;
        }
      });
      setDataCheckpointDetail(dataCheckpointDetail);
    } else {
      let msg = 'Tài khoản không có quyền sửa cam kết này';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } else {
        Alert.alert(msg);
      }
      return;
    }
  };

  const updateQtyInLot = async (
    QtyOK: string,
    QtyError: string,
    Note: string,
  ) => {
    if (
      QtyOK == '-' ||
      QtyOK == 'NaN' ||
      QtyError == '-' ||
      QtyError == 'NaN'
    ) {
      let msg = 'Thay đổi không thành công';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } else {
        Alert.alert(msg);
      }
      setQty({
        qtyOk: dataDetail.QtyOK.toString(),
        qtyErr: dataDetail.QtyError.toString(),
        Note: dataDetail.Note,
      });
      return;
    } else {
      let request = {
        Lotcode: dataDetail.Lotcode,
        QtyOK: QtyOK,
        QtyError: QtyError,
        Note: Note,
      };
      console.log(request);
      let dataResponse = await CommonBase.postAsync<ResponseService>(
        ApiHistoryQuality.UPDATE_QTY_IN_LOT,
        request,
      );
      console.log(dataResponse);
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let msg = 'Thay đổi thành công';
        if (Platform.OS === 'android') {
          ToastAndroid.show(msg, ToastAndroid.LONG);
        } else {
          Alert.alert(msg);
        }
      } else {
        let msg = 'Thay đổi không thành công';
        if (Platform.OS === 'android') {
          ToastAndroid.show(msg, ToastAndroid.SHORT);
        } else {
          Alert.alert(msg);
        }
        return;
      }
    }
  };

  const handleChangeQtyOk = (e: any) => {
    const value = e.nativeEvent.text;
    if (totalQty - parseInt(value) < 0 || parseInt(value) < 0) {
      let msg = 'SL lỗi và SL đạt không được vượt quá SL cần kiểm tra';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } else {
        Alert.alert(msg);
      }
      setQty(prevState => ({
        ...prevState,
        qtyOk: dataDetail.QtyOK.toString(),
        qtyErr: dataDetail.QtyError.toString(),
      }));
      return;
    } else {
      if (value != '') {
        setQty(prevState => ({
          ...prevState,
          qtyOk: value,
          qtyErr: (totalQty - parseInt(value)).toString(),
        }));
      } else {
        setQty(prevState => ({
          ...prevState,
          qtyOk: value,
        }));
      }
    }
  };

  const handleChangeQtyErr = (e: any) => {
    const value = e.nativeEvent.text;
    if (totalQty - parseInt(value) < 0 || parseInt(value) < 0) {
      let msg = 'SL lỗi và SL đạt không được vượt quá SL cần kiểm tra';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      setQty(prevState => ({
        ...prevState,
        qtyOk: dataDetail.QtyOK.toString(),
        qtyErr: dataDetail.QtyError.toString(),
      }));
      return;
    } else {
      if (value != '') {
        setQty(prevState => ({
          ...prevState,
          qtyErr: value,
          qtyOk: (totalQty - parseInt(value)).toString(),
        }));
      } else {
        setQty(prevState => ({
          ...prevState,
          qtyErr: value,
        }));
      }
    }
  };

  const handleChangeNoteAndQty = (e: any) => {
    const value = e.nativeEvent.text;
    setQty(prevState => ({
      ...prevState,
      Note: value,
    }));
  };

  const submitSignError = async () => {
    //setIsInProgress(true)
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiHistoryQuality.SIGN_CONFIRM + dataDetail.Lotcode,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      //setIsInProgress(false)
      let msg = 'Xác nhận ký thành công';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      if (handleSubmit) {
        handleSubmit();
      }
    } else {
      let msg = 'Tài khoản này không có quyền ký xác nhận';
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert(msg);
      }
      return;
    }
  };

  useEffect(() => {
    getDataDetailInLot();
    console.log(dataDetail);
    if (
      dataDetail.QtyOK != null ||
      dataDetail.QtyOK != undefined ||
      dataDetail.QtyError != null ||
      dataDetail.QtyError != undefined
    ) {
      setQty({
        qtyOk: dataDetail.QtyOK.toString(),
        qtyErr: dataDetail.QtyError.toString(),
        Note: dataDetail.Note,
      });
    } else {
      return;
    }
    //setIsInProgress(false)
  }, [dataDetail.Lotcode]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        scrollToOverflowEnabled
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}>
        <View style={styles.header}>
          <Text style={styles.textHeaderLabel}>
            Loại Kiểm tra: {dataDetail.TestTypeName}
          </Text>
        </View>

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
          <ScrollView>
            {(dataCheckpointDetail && dataCheckpointDetail.length != 0) ||
            (dataBatchRecyclingDetail &&
              dataBatchRecyclingDetail.length != 0) ||
            dataDetail.EnterEachResult == false ? (
              <View style={styles.header2}>
                <Text style={styles.textHeader}>Thông tin chi tiết</Text>
              </View>
            ) : null}

            {dataDetail.EnterEachResult == false ? (
              <View style={styles.contentSL}>
                <View
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    height: (deviceHeight * 7) / 100,
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    borderBottomColor: '#eaeaea',
                  }}>
                  <Text style={styles.labelContent}>SL sản phẩm đạt:</Text>
                  <TextInput
                    style={{
                      width: '40%',
                      fontFamily: 'Mulish-Bold',
                      color: '#000000',
                      paddingTop: 12,
                      paddingLeft: 24,
                    }}
                    onChange={handleChangeQtyOk}
                    onEndEditing={data =>
                      updateQtyInLot(
                        qtyPage.qtyOk,
                        qtyPage.qtyErr,
                        qtyPage.Note,
                      )
                    }
                    keyboardType="numeric"
                    value={qtyPage.qtyOk}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    height: (deviceHeight * 7) / 100,
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    borderBottomColor: '#eaeaea',
                  }}>
                  <Text style={styles.labelContent}>SL sản phẩm lỗi:</Text>
                  <TextInput
                    style={{
                      width: '40%',
                      fontFamily: 'Mulish-Bold',
                      color: '#000000',
                      paddingTop: 12,
                      paddingLeft: 24,
                    }}
                    onChange={handleChangeQtyErr}
                    onEndEditing={data =>
                      updateQtyInLot(
                        qtyPage.qtyOk,
                        qtyPage.qtyErr,
                        qtyPage.Note,
                      )
                    }
                    value={qtyPage.qtyErr}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ) : null}

            <View>
              {dataBatchRecyclingDetail && dataBatchRecyclingDetail.length > 0
                ? dataBatchRecyclingDetail.map((item, j) => {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          backgroundColor: '#ffffff',
                          marginBottom: 16,
                          marginTop: 16,
                        }}
                        key={j}>
                        {listActionForMenuSelected.findIndex(
                          x => x.ActionName == 'xoa_noi_dung_tai_che',
                        ) != -1 && item.IsDelete == true ? (
                          <View
                            style={{
                              width: 30,
                              alignItems: 'center',
                              marginTop: 32,
                            }}>
                            <TouchableOpacity
                              onPress={() => {
                                deleteRecycle(item.BatchId);
                              }}>
                              <Svg
                                width="24"
                                height="25"
                                viewBox="0 0 24 25"
                                fill="none">
                                <Circle
                                  cx="12"
                                  cy="12.1923"
                                  r="9"
                                  fill="#CCE5FF"
                                />
                                <Path
                                  d="M7 12.1923H17"
                                  stroke="#003350"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                />
                              </Svg>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View
                            style={{
                              width: 30,
                              alignItems: 'center',
                              marginTop: 32,
                            }}>
                            <TouchableOpacity
                              // onPress={() => {
                              //     handleRemoveRecycle(item)
                              //     deleteRecycle(item.BatchId)
                              // }}
                              disabled={true}>
                              <Svg
                                width="24"
                                height="25"
                                viewBox="0 0 24 25"
                                fill="none">
                                <Circle
                                  cx="12"
                                  cy="12.1923"
                                  r="9"
                                  fill="#8F9194"
                                />
                                <Path
                                  d="M7 12.1923H17"
                                  stroke="#FFFFFF"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                />
                              </Svg>
                            </TouchableOpacity>
                          </View>
                        )}

                        <View
                          style={{
                            width: deviceWidth - 30,
                            backgroundColor: '#ffffff',
                          }}>
                          <View style={styles.contentRecycle}>
                            <View style={styles.textInputContentRecycle}>
                              <View style={{flex: 1}}>
                                <Text style={styles.labelRecycle}>
                                  Nội dung tái chế
                                </Text>
                              </View>
                            </View>
                            {listActionForMenuSelected.findIndex(
                              x => x.ActionName == 'xoa_noi_dung_tai_che',
                            ) != -1 && item.IsDelete == true ? (
                              <View
                                style={{
                                  width: deviceWidth - 20,
                                  height: 90,
                                  paddingRight: 16,
                                  paddingBottom: 16,
                                }}>
                                <TextInput
                                  style={styles.inputBoxRecycle}
                                  onChange={data => handleOnChangeNote(data, j)}
                                  onEndEditing={data =>
                                    editRecycle(item.BatchId, j, data)
                                  }
                                  placeholder={'Nhập nội dung'}
                                  placeholderTextColor="#AAABAE"
                                  multiline={true}
                                  numberOfLines={8}
                                  value={item.Content}
                                />
                              </View>
                            ) : (
                              <View
                                style={{
                                  width: deviceWidth - 20,
                                  height: 90,
                                  paddingRight: 16,
                                  paddingBottom: 16,
                                }}>
                                <TextInput
                                  style={styles.inputBoxRecycleDisable}
                                  //onChange={(data) => handleOnChangeNote(data, j)}
                                  placeholder={'Nhập nội dung'}
                                  placeholderTextColor="#AAABAE"
                                  multiline={true}
                                  numberOfLines={8}
                                  value={item.Content}
                                  editable={false}
                                />
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })
                : null}
            </View>

            {dataDetail.EnterEachResult == false ? (
              <View
                style={{
                  marginTop: 16,
                  backgroundColor: '#ffffff',
                  padding: 8,
                  marginBottom: 16,
                }}>
                <View style={styles.contentSL}>
                  <View style={styles.textInputSl}>
                    <View style={{flex: 1}}>
                      <Text style={styles.labelRecycle}>Ghi chú</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      width: deviceWidth - 20,
                      height: 90,
                      paddingRight: 16,
                      paddingBottom: 16,
                      marginLeft: 30,
                    }}>
                    <TextInput
                      style={
                        dataDetail.CanEdit == false
                          ? styles.inputBoxRecycleDisable
                          : styles.inputBoxRecycleEnable
                      }
                      onChange={data => handleChangeNoteAndQty(data)}
                      onEndEditing={data =>
                        updateQtyInLot(
                          qtyPage.qtyOk,
                          qtyPage.qtyErr,
                          qtyPage.Note,
                        )
                      }
                      //placeholder={'Nhập nội dung'}
                      placeholderTextColor="#AAABAE"
                      multiline={true}
                      numberOfLines={8}
                      value={qtyPage.Note}
                      editable={dataDetail.CanEdit}
                    />
                  </View>
                </View>
              </View>
            ) : null}

            <View>
              {dataCheckpointDetail && dataCheckpointDetail.length > 0
                ? dataCheckpointDetail.map((item, j) => {
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          backgroundColor: '#ffffff',
                          marginBottom: 15,
                        }}
                        key={j}>
                        {listActionForMenuSelected.findIndex(
                          x => x.ActionName == 'xoa_loi_san_pham',
                        ) != -1 && item.IsDelete == true ? (
                          <View
                            style={{
                              width: 30,
                              alignItems: 'center',
                              marginTop: 32,
                            }}>
                            <TouchableOpacity
                              onPress={() => {
                                deleteErrorProduct(item.Id);
                              }}>
                              <Svg
                                width="24"
                                height="25"
                                viewBox="0 0 24 25"
                                fill="none">
                                <Circle
                                  cx="12"
                                  cy="12.1923"
                                  r="9"
                                  fill="#CCE5FF"
                                />
                                <Path
                                  d="M7 12.1923H17"
                                  stroke="#003350"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                />
                              </Svg>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View
                            style={{
                              width: 30,
                              alignItems: 'center',
                              marginTop: 32,
                            }}>
                            <TouchableOpacity disabled={true}>
                              <Svg
                                width="24"
                                height="25"
                                viewBox="0 0 24 25"
                                fill="none">
                                <Circle
                                  cx="12"
                                  cy="12.1923"
                                  r="9"
                                  fill="#8F9194"
                                />
                                <Path
                                  d="M7 12.1923H17"
                                  stroke="#FFFFFF"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                />
                              </Svg>
                            </TouchableOpacity>
                          </View>
                        )}

                        <View
                          style={{
                            width: deviceWidth - 30,
                            backgroundColor: '#ffffff',
                          }}>
                          <View style={styles.content}>
                            <View style={styles.textInputContent}>
                              <View style={{width: 100}}>
                                <Text style={styles.label}>Tên lỗi:</Text>
                              </View>
                              <View
                                style={{
                                  width: deviceWidth - 100 - 20,
                                  height: '80%',
                                }}>
                                <Text style={styles.inputBox}>
                                  {item.CheckpointName}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.content}>
                            <View style={styles.textInputContent}>
                              <View style={{width: 100}}>
                                <Text style={styles.label}>Thời gian:</Text>
                              </View>
                              <View
                                style={{
                                  width: deviceWidth - 100 - 20,
                                  height: '80%',
                                }}>
                                <Text style={styles.inputBox}>
                                  {item.ItemId}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {item.DetailedDescription != '' &&
                          item.DetailedDescription != null ? (
                            <View style={styles.content}>
                              <View style={styles.textInputContent}>
                                <View style={{width: 100}}>
                                  <Text style={styles.label}>Mô tả:</Text>
                                </View>
                                <View
                                  style={{
                                    width: deviceWidth - 100 - 20,
                                    height: '80%',
                                  }}>
                                  <Text style={styles.inputBox}>
                                    {item.DetailedDescription}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ) : null}
                          {item.QtyLower != null && item.QtyUpper != null ? (
                            <View style={styles.content}>
                              <View style={styles.textInputContent}>
                                <View style={{width: 100}}>
                                  <Text style={styles.label}>Cận dưới:</Text>
                                </View>
                                <View style={{width: 120, height: '80%'}}>
                                  <Text style={styles.inputBoxWith2Line}>
                                    {item.QtyLower}
                                  </Text>
                                </View>

                                <View style={{width: 100}}>
                                  <Text style={styles.label}>Cận trên:</Text>
                                </View>
                                <View style={{width: 100, height: '80%'}}>
                                  <Text style={styles.inputBoxWith2Line}>
                                    {item.QtyUpper}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ) : null}

                          <View style={styles.content}>
                            <View style={styles.textInputContent}>
                              <View style={{width: 100}}>
                                <Text style={styles.label}>Lần nhắc nhở:</Text>
                              </View>
                              <View style={{width: 110, height: '80%'}}>
                                <Text
                                  style={{
                                    ...styles.inputBoxWith2Line,
                                    paddingLeft: 32,
                                  }}>
                                  {item.numberRemind ?? 0}
                                </Text>
                              </View>
                              {listActionForMenuSelected.findIndex(
                                x => x.ActionName == 'sua_cam_ket',
                              ) != -1 && item.IsDelete == true ? (
                                <>
                                  <View style={{width: 100, paddingLeft: 4}}>
                                    <Text style={styles.label}>Cam kết</Text>
                                  </View>
                                  <View style={{width: 100, height: '80%'}}>
                                    <View style={styles.checkBox}>
                                      <BouncyCheckbox
                                        onPress={data =>
                                          editCommit(item.Id, data)
                                        }
                                        fillColor={'#006496'}
                                        size={20}
                                        isChecked={
                                          item.IsCommit
                                        }></BouncyCheckbox>
                                    </View>
                                  </View>
                                </>
                              ) : (
                                <>
                                  <View style={{width: 100, paddingLeft: 4}}>
                                    <Text style={styles.labelDisable}>
                                      Cam kết
                                    </Text>
                                  </View>
                                  <View style={{width: 100, height: '80%'}}>
                                    <View style={styles.checkBox}>
                                      <BouncyCheckbox
                                        fillColor={'#8F9194'}
                                        size={20}
                                        isChecked={item.IsCommit}
                                        disableBuiltInState={
                                          true
                                        }></BouncyCheckbox>
                                    </View>
                                  </View>
                                </>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })
                : null}
            </View>
            {dataCheckpointDetail &&
            dataCheckpointDetail.length == 0 &&
            dataBatchRecyclingDetail &&
            dataBatchRecyclingDetail.length == 0 &&
            dataDetail.EnterEachResult == true ? (
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  alignItems: 'center',
                  backgroundColor: '#F4F4F9',
                  paddingHorizontal: 15,
                  alignContent: 'center',
                  justifyContent: 'center',
                  paddingTop: 30,
                }}>
                <Text
                  style={{
                    color: '#001E31',
                    fontFamily: 'Mulish-SemiBold',
                    fontSize: 16,
                  }}>
                  Không có dữ liệu
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.submit}>
        <View style={{height: 40, width: '30%', paddingRight: 20}}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={onPressHandleClose}>
            <View>
              <Text style={{color: '#006496', fontFamily: 'Mulish-SemiBold'}}>
                Quay lại{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{height: 40, width: '30%'}}>
          {listActionForMenuSelected.findIndex(
            x => x.ActionName == 'ky_xac_nhan',
          ) != -1 && isInProgress == false ? (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => submitSignError()}>
              <View>
                <Text style={{color: '#ffffff', fontFamily: 'Mulish-SemiBold'}}>
                  Ký xác nhận
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.disableButton}
              //onPress={() => submitSignError()}
              disabled={true}>
              <View>
                <Text style={{color: '#AAABAE', fontFamily: 'Mulish-SemiBold'}}>
                  Ký xác nhận
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    flex: 1,
    // paddingHorizontal: 5
  },
  header: {
    justifyContent: 'center',
    borderBottomColor: '#001E31',
    padding: 8,
    marginTop: 16,
    height: 60,
    backgroundColor: '#FFFFFF',
  },
  header2: {
    justifyContent: 'center',
    padding: 8,
    borderBottomColor: '#001E31',
    height: 60,
    backgroundColor: '#F4F4F9',
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },
  contentSL: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
  },
  contentRecycle: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
  },
  textHeaderLabel: {
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Mulish-SemiBold',
    color: '#1B3A4ECC',
    textAlign: 'left',
    padding: 8,
  },
  textHeader: {
    color: '#0D1D2A',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: 16,
    padding: 8,
    fontStyle: 'normal',
    fontFamily: 'Mulish-Bold',
  },
  textInputContent: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingVertical: 8,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  textInputSl: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: -8,
  },
  textInputContentRecycle: {
    flexDirection: 'row',
    height: 90,
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: -8,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
    color: '#1B3A4E',
    paddingTop: 16,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  labelContent: {
    color: '#1B3A4ECC',
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
    fontWeight: '400',
    width: '55%',
    paddingTop: 12,
    paddingBottom: 12,
  },
  labelDisable: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
    color: '#8F9194',
    paddingTop: 16,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  labelRecycle: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
    color: '#1B3A4E',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  inputBox: {
    color: '#001E31',
    paddingTop: 20,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  inputBoxRecycle: {
    color: '#001E31',
    paddingLeft: 16,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
    borderWidth: 1,
    borderColor: '#137DB9',
    borderRadius: 4,
    height: Platform.OS == 'ios' ? 80 : 80,
  },
  inputBoxRecycleDisable: {
    color: '#001E31',
    paddingLeft: 16,
    fontWeight: '600',
    borderColor: '#eaeaea',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
    borderWidth: 1,
    borderRadius: 4,
    height: Platform.OS == 'ios' ? 80 : 80,
  },
  inputBoxRecycleEnable: {
    color: '#001E31',
    paddingLeft: 16,
    fontWeight: '600',
    borderColor: '#137DB9',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
    borderWidth: 1,
    borderRadius: 4,
    height: Platform.OS == 'ios' ? 80 : 80,
  },
  inputBoxWith2Line: {
    color: '#001E31',
    paddingTop: 20,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  checkBox: {
    color: '#001E31',
    paddingTop: 20,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  submit: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 80,
    backgroundColor: '#FFFFFF',
    paddingRight: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  plusButton: {
    alignContent: 'flex-end',
    flexDirection: 'row',
    backgroundColor: '#E3F0FE',
    borderRadius: 5,
    width: '42%',
    height: 40,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  exitButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 35,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#137DB9',
  },
});

export default DetailHistoryCheckModal;
