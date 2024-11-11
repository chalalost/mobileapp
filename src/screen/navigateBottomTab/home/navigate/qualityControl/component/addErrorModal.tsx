import { NavigationProp } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Svg, { Circle, Path } from 'react-native-svg';
import { HeightTitleApp } from '../../../../../share/app/constants/constansHeightApp';
import { ApiQC, ResponseService } from '../../../../../share/app/constantsApi';
import SelectBaseVer2 from '../../../../../share/base/component/selectBase/selectBaseVer2';
import {
  IRule,
  validateForm,
} from '../../../../../share/commonVadilate/validate';
import CommonBase from '../../../../../share/network/axios';
import {
  ICheckPercentAfterKCS,
  IDropdown,
  IListCheckPoint,
  IListCheckpointItem,
  IListItemErrors,
} from '../types/types';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

let heightStatusBar = StatusBar.currentHeight ? StatusBar.currentHeight : 0;
let HeightTitleAppPage = HeightTitleApp.Android;
if (Platform.OS == 'ios') {
  HeightTitleAppPage = HeightTitleApp.Ios;
}

const Rules: IRule[] = [];

export interface AddErrorProps {
  navigation: NavigationProp<any, any>;
  handleCancel: any;
  handleSubmit: Function;
  listCheckPointData: ICheckPercentAfterKCS;
  listErrorCheckPoint: IListItemErrors[];
  handleListDataErrorLength: Function;
  handleListDataConfirmLength: Function;
  handleListErrorCheckPointLength: Function;
  typeQAQC: number;
}

const AddErrorModal: React.FC<AddErrorProps> = ({
  navigation,
  handleCancel,
  handleSubmit,
  listCheckPointData,
  listErrorCheckPoint,
  handleListErrorCheckPointLength,
  handleListDataErrorLength,
  handleListDataConfirmLength,
  typeQAQC,
}) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [listDataErr, setListDataErr] = useState<IListCheckPoint[]>([]);
  const [dataCommit, setDataCommit] = useState<IListCheckpointItem[]>([]);
  const [dataDropdown, setDataDropdown] = useState<IDropdown[]>([
    {
      id: '',
      name: '',
      code: '',
      isNonCheck: false,
      isCheckInRange: false,
      isCheckEqual: false,
      qtyLower: 0,
      qtyUpper: 0,
      value: '',
      partName: '',
      detailedDescription: '',
    },
  ]);

  const [dataListError, setDataListError] = useState<IListItemErrors[]>([
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
  ]);

  const handleSetUpDataDropdown = () => {
    if (listCheckPointData.checkpointlist.length > 0) {
      var listData: IDropdown[] = [];
      for (var i = 0; i < listCheckPointData.checkpointlist.length; i++) {
        listData.push({
          id: listCheckPointData.checkpointlist[i].checkpointCode,
          name: listCheckPointData.checkpointlist[i].checkpointName,
          code: listCheckPointData.checkpointlist[i].partId,
          isNonCheck: listCheckPointData.checkpointlist[i].isNonCheck,
          isCheckInRange: listCheckPointData.checkpointlist[i].isCheckInRange,
          isCheckEqual: listCheckPointData.checkpointlist[i].isCheckEqual,
          qtyLower: listCheckPointData.checkpointlist[i].qtyLower,
          qtyUpper: listCheckPointData.checkpointlist[i].qtyUpper,
          value: listCheckPointData.checkpointlist[i].value,
          partName: listCheckPointData.checkpointlist[i].partName,
          detailedDescription:
            listCheckPointData.checkpointlist[i].detailedDescription,
        });
      }
      setDataDropdown([...listData]);
    }
  };

  const onChangeValue = (value: string, checkPointCode: string) => {
    listDataErr.map(x => {
      if (x.checkpointCode == checkPointCode) {
        x.value = value;
      }
    });

    setListDataErr(listDataErr);
  };

  const getNumberRemind = async (dataRequest: IDropdown) => {
    let request = {
      maincodeproduct: listCheckPointData.maincodeproduct,
      workcenterid: listCheckPointData.workcenterid,
      typeQAQC: typeQAQC,
      checkpointcode: dataRequest.id,
      checklistcode: listCheckPointData.checklistcode,
    };
    //baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' })
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiQC.GET_NUMBER_REMIND +
        '?maincodeproduct=' +
        request.maincodeproduct +
        '&workcenterid=' +
        request.workcenterid +
        '&typeQAQC=' +
        request.typeQAQC +
        '&checkpointcode=' +
        request.checkpointcode +
        '&checklistcode=' +
        request.checklistcode,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data = {
        remindNumber: dataResponse.data,
      };
      onChangeValue(data.remindNumber, dataRequest.id);
      //setDataDropdownTypeCheck(data.typeCheck)
    }
    //baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' })
  };

  const handleAddMoreForm = (dataPlus: IDropdown) => {
    let isCheckVadilate = true;
    if (listDataErr.length > 0) {
      listDataErr.forEach(item => {
        item.listError = validateForm(item, Rules, []);
        if (item.listError.length > 0) {
          isCheckVadilate = false;
        }
      });
    }
    if (isCheckVadilate === true) {
      let data: IListCheckPoint = {
        checkpointCode: dataPlus.id,
        checkpointName: dataPlus.name,
        isNonCheck: dataPlus.isNonCheck,
        isCheckInRange: dataPlus.isCheckInRange,
        isCheckEqual: dataPlus.isCheckEqual,
        qtyLower: dataPlus.qtyLower,
        qtyUpper: dataPlus.qtyUpper,
        value: dataPlus.value,
        partName: dataPlus.partName,
        partId: dataPlus.code,
        detailedDescription: dataPlus.detailedDescription,
        listError: [],
        dataChecked: false,
      };
      listDataErr.push(data);
    }
    setListDataErr([...listDataErr]);
    updateDropdown();
  };

  const handleRemoveItem = (item: IListCheckPoint) => {
    if (listDataErr.length > 0) {
      let index = -1;
      listDataErr.forEach((data, j) => {
        if (data.checkpointCode == item.checkpointCode) {
          index = j;
        }
      });
      if (index >= 0) {
        listDataErr.splice(index, 1);
        setListDataErr([...listDataErr]);
        dataDropdown.push({
          id: item.checkpointCode,
          name: item.checkpointName,
          code: item.partId,
          isNonCheck: item.isNonCheck,
          isCheckInRange: item.isCheckInRange,
          isCheckEqual: item.isCheckEqual,
          qtyLower: item.qtyLower,
          qtyUpper: item.qtyUpper,
          value: item.value,
          partName: item.partName,
          detailedDescription: item.detailedDescription,
        });
        setDataDropdown([...dataDropdown]);
      }
    }
  };

  const updateDropdown = () => {
    if (dataDropdown && dataDropdown.length > 0) {
      let listShowNew: IDropdown[] = [];
      if (listDataErr && listDataErr.length > 0) {
        dataDropdown.forEach(item => {
          let findItem = listDataErr.find(x => x.checkpointCode == item.id);
          if (findItem == undefined) {
            listShowNew.push(item);
          }
        });
        setDataDropdown(listShowNew);
      } else {
        setDataDropdown(dataDropdown);
      }
    }
  };

  const handleSubmitDataError = () => {
    if (listDataErr.length <= 0) {
      return;
    } else {
      var dataErr: [IListCheckpointItem] = [
        {
          checkpointcode: listDataErr[0].checkpointCode,
          iscommit: listDataErr[0].dataChecked,
          commitperson: '',
          numberofreminder: parseInt(listDataErr[0].value) + 1,
        },
      ];
      for (var i = 1; i < listDataErr.length; i++) {
        dataErr.push({
          checkpointcode: listDataErr[i].checkpointCode,
          iscommit: listDataErr[i].dataChecked,
          commitperson: '',
          numberofreminder: parseInt(listDataErr[i].value) + 1,
        });
      }
      let localTime = new Date();
      let date = dayjs(localTime).format('DD/MM/YYYY HH:mm:ss.SSS');
      setDataListError([
        {
          id: date.toString(),
          listCheckpointItem: dataErr,
        },
      ]);
    }
  };

  const handleOnChangeCheckBox = (
    checkPointCode: string,
    isChecked: boolean,
  ) => {
    listDataErr.map(x => {
      if (x.checkpointCode == checkPointCode) {
        x.dataChecked = isChecked;
      }
    });
    setListDataErr(listDataErr);
    handleSubmitDataError();
  };

  const onPressCloseModal = () => {
    setIsOpenModal(false);
  };

  const onPressSubmit = () => {
    if (listDataErr.length <= 0) {
      Alert.alert('Không thể lưu, vui lòng chọn lỗi!');
      return;
    } else {
      setIsOpenModal(true);
    }
  };

  const onPressHandleClose = () => {
    if (handleCancel) {
      handleCancel();
    }
  };

  const submit = async () => {
    if (handleSubmit) {
      handleSubmit(dataListError);
      handleListDataErrorLength(dataListError.length);
      // let dataError = listDataErr.filter(x => x.checkpointCode != '').length
      // let dataConfirm = listDataErr.filter(x => x.dataChecked == true).length
      // let Arr: IListCheckpointItem[] = []
      // if (listErrorCheckPoint !== null) {
      //     for (var i = 0; i < listErrorCheckPoint.length; i++) {
      //         Arr = Arr.concat(listErrorCheckPoint[i].listCheckpointItem)
      //     }
      // }
      // console.log('Arr sau nhan', Arr)

      // var checkErrorDuplicateArr: string[] = []
      // var checkDuplicateArr: string[] = []
      // var checkErrorString: string
      // var checkString: string
      // const checkErrorDuplicate = Arr.forEach(x => {
      //     if (x.checkpointcode != '') {
      //         checkErrorString = x.checkpointcode
      //     }
      //     checkErrorDuplicateArr.push(checkErrorString)
      // })
      // console.log('dataError ben nhan', dataError)
      // for (var i = 0; i < checkErrorDuplicateArr.length; i++) {
      //     if (listDataErr.filter(x => x.checkpointCode == checkErrorDuplicateArr[i]).length == 1) {
      //         console.log('checkErrorDuplicateArr[i]', checkErrorDuplicateArr[i])
      //         dataError = dataError - 1
      //     }
      // }
      // handleListErrorCheckPointLength(dataError)

      // const checkDuplicateFunc = Arr.forEach(x => {
      //     if (x.iscommit == true) {
      //         checkString = x.checkpointcode
      //     }
      //     checkDuplicateArr.push(checkString)
      // })
      // for (var i = 0; i < checkDuplicateArr.length; i++) {
      //     if (listDataErr.filter(x => x.checkpointCode == checkDuplicateArr[i]).length == 1) {
      //         dataConfirm = dataConfirm - 1
      //     }
      // }
      // handleListDataConfirmLength(dataConfirm)
    }
  };

  const onPressSubmitModal = () => {
    if (listDataErr.length <= 0) {
      Alert.alert('Không thể lưu, vui lòng chọn lỗi!');
      return;
    } else {
      handleSubmitDataError();
      submit();
      setIsOpenModal(false);
    }
  };

  useEffect(() => {
    handleSetUpDataDropdown();
  }, []);

  useEffect(() => {
    handleSubmitDataError();
  }, [listDataErr]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={{
            shadowColor: '#00000',
            shadowOpacity: 0.3,
            elevation: 5,
            borderRadius: 5,
            backgroundColor: '#FFFFFF',
          }}>
          <SelectBaseVer2
            listData={dataDropdown}
            styles={styles.selectBox}
            title="Thêm loại lỗi"
            popupTitle="Loại lỗi"
            onSelect={data => {
              let dataSelect: IDropdown = dataDropdown.filter(
                x => x.id == data,
              )[0];
              getNumberRemind(dataSelect);
              handleAddMoreForm(dataSelect);
            }}
            stylesIcon={{position: 'absolute', zIndex: -1, right: 10, top: 15}}
            valueArr={['']}
            isSelectSingle={true}
          />
        </View>
      </View>
      <View
        // style={{ flex: 1 }}
        style={{
          height:
            deviceHeight -
            styles.header.height -
            styles.submit.height -
            heightStatusBar -
            styles.plusButton.height -
            styles.plusButton.marginTop -
            HeightTitleAppPage,
        }}>
        <ScrollView>
          <View>
            {listDataErr && listDataErr.length > 0 ? (
              listDataErr.map((item, j) => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      backgroundColor: '#ffffff',
                      marginBottom: 15,
                    }}
                    key={j}>
                    <View
                      style={{width: 30, alignItems: 'center', marginTop: 32}}>
                      <TouchableOpacity
                        onPress={() => {
                          handleRemoveItem(item);
                        }}>
                        <Svg
                          width="24"
                          height="25"
                          viewBox="0 0 24 25"
                          fill="none">
                          <Circle cx="12" cy="12.1923" r="9" fill="#CCE5FF" />
                          <Path
                            d="M7 12.1923H17"
                            stroke="#003350"
                            stroke-width="2"
                            stroke-linecap="round"
                          />
                        </Svg>
                      </TouchableOpacity>
                    </View>

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
                              {item.checkpointName}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {item.detailedDescription != '' &&
                      item.detailedDescription != null ? (
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
                                {item.detailedDescription}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ) : null}
                      {item.qtyLower != null && item.qtyUpper != null ? (
                        <View style={styles.content}>
                          <View style={styles.textInputContent}>
                            <View style={{width: 100}}>
                              <Text style={styles.label}>Cận dưới:</Text>
                            </View>
                            <View style={{width: 120, height: '80%'}}>
                              <Text style={styles.inputBoxWith2Line}>
                                {item.qtyLower}
                              </Text>
                            </View>

                            <View style={{width: 100}}>
                              <Text style={styles.label}>Cận trên:</Text>
                            </View>
                            <View style={{width: 100, height: '80%'}}>
                              <Text style={styles.inputBoxWith2Line}>
                                {item.qtyUpper}
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
                              {item.value ?? 0}
                            </Text>
                          </View>

                          <View style={{width: 100}}>
                            <Text style={styles.label}>Cam kết</Text>
                          </View>
                          <View style={{width: 100, height: '80%'}}>
                            <View style={styles.checkBox}>
                              <BouncyCheckbox
                                onPress={data =>
                                  handleOnChangeCheckBox(
                                    item.checkpointCode,
                                    data,
                                  )
                                }
                                fillColor={'#006496'}
                                size={20}
                                isChecked={false}></BouncyCheckbox>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
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
                  Vui lòng thêm lỗi
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      <View style={styles.submit}>
        <View style={{height: 40, width: '30%', paddingRight: 20}}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={onPressHandleClose}>
            <View>
              <Text style={{color: '#006496', fontFamily: 'Mulish-SemiBold'}}>
                Hủy{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{height: 40, width: '30%'}}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => onPressSubmitModal()}>
            <View>
              <Text style={{color: '#ffffff', fontFamily: 'Mulish-SemiBold'}}>
                Lưu
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* {
                isOpenModal ? (
                    <Modal
                        isVisible={isOpenModal}
                        //style={{ backgroundColor: '#ffffff', margin: 0 }}
                        onBackdropPress={() => setIsOpenModal(false)}
                        statusBarTranslucent={false}
                        deviceHeight={deviceHeight}
                        deviceWidth={deviceWidth}
                    >
                        <PopUpBase
                            title={'Xác nhận'}
                            content={'     Sau khi lưu, bạn sẽ không thể xem lại \ndanh sách lỗi ở trang này. Bạn muốn lưu ?'}
                            handleClose={onPressCloseModal}
                            handleConfirm={onPressSubmitModal}
                        />
                    </Modal>
                )
                    : null
            } */}
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
    paddingLeft: 8,
    paddingRight: 8,
    height: 60,
    backgroundColor: '#F4F4F9',
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
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
  textInputContent: {
    flexDirection: 'row',
    height: 90,
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
  textHeaderLabel: {
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Mulish-SemiBold',
    color: '#001E31',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
    color: '#1B3A4E',
    paddingBottom: 2,
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
  selectBox: {
    color: '#001E31',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
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
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#004B72',
    height: 35,
    justifyContent: 'center',
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

export default AddErrorModal;
