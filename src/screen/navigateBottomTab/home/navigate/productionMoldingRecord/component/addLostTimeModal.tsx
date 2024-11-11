import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SelectBaseVer2 from '../../../../../share/base/component/selectBase/selectBaseVer2';
import { HeightTitleApp } from '../../../../../share/app/constants/constansHeightApp';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { NavigationProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { IDropdownForModal, IListLostTime } from '../types/types';
import CommonBase from '../../../../../share/network/axios';
import {
  ApiCommon,
  ResponseService,
} from '../../../../../share/app/constantsApi';
import { WorkByTypeEnumMobile } from '../../productionRecord/types/enum/productionRecord';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { generateGuid, IRule, typeVadilate, validateField, validateForm } from '../../../../../share/commonVadilate/validate';
import { Regex } from '../../../../../share/app/regex';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

let heightStatusBar = StatusBar.currentHeight ? StatusBar.currentHeight : 0;
let HeightTitleAppPage = HeightTitleApp.Android;
if (Platform.OS == 'ios') {
  HeightTitleAppPage = HeightTitleApp.Ios;
}

const Rules: IRule[] = [
  {
    field: 'inputValue',
    required: true,
    maxLength: 10,
    minLength: 0,
    typeValidate: typeVadilate.numberv1,
    valueCheck: Regex.Regex_integer,
    maxValue: 0,
    messages: {
      required: 'Vui lòng kiểm tra lại SL',
      minLength: '',
      maxLength: 'Giá trị không vượt quá 10 kí tự',
      validate: 'Giá trị không hợp lệ',
      maxValue: 'Giá trị không hợp lệ',
    },
  },
];

export interface AddLostTimeMoldingProps {
  navigation: NavigationProp<any, any>;
  handleCancel: any;
  handleSubmit: Function;
}

const AddLostTimeMoldingModal: React.FC<AddLostTimeMoldingProps> = ({
  navigation,
  handleSubmit,
  handleCancel,
}) => {
  const [dataModal, setDataModal] = useState<IListLostTime[]>([]);
  const [dataDropdown, setDataDropdown] = useState<IDropdownForModal[]>([]);

  const getErrorList = async () => {
    let dataTimeSlotResponse = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_API_COMMON + '?type=' + WorkByTypeEnumMobile.LostNote,
      null,
    );
    if (
      typeof dataTimeSlotResponse !== 'string' &&
      dataTimeSlotResponse != null &&
      dataTimeSlotResponse.isSuccess === true
    ) {
      let data = {
        list: dataTimeSlotResponse.data,
      };
      setDataDropdown(data.list);
    }
  };

  const handleChangeLostTime = (e: any, index: number) => {
    const value = e.nativeEvent.text;
    if (dataModal.length > 0) {
      dataModal[index].qtyLostTime = value;
    }
    dataModal[index].listError = validateField(
      value,
      Rules,
      'inputValue',
      dataModal[index].listError,
    );
    setDataModal([...dataModal]);
  };

  const handleChangeLostTimeByDropdown = (e: any, index: number) => {
    if (dataModal.length > 0) {
      dataModal[index].qtyLostTime = e;
    }
    setDataModal([...dataModal]);
  }

  const handleAddMoreForm = () => {
    let isCheckVadilate = true;
    if (dataModal.length > 0) {
      dataModal.forEach(item => {
        item.listError = validateForm(item, Rules, []);
        if (item.listError.length > 0) {
          isCheckVadilate = false;
        }
      })
    }
    if (isCheckVadilate === true) {
      let data: IListLostTime = {
        lostId: generateGuid(),
        qtyLostTime: '',
        listError: [],
      };
      dataModal.push(data);
    }
    setDataModal([...dataModal]);
  };
  const handleRemoveItem = (item: IListLostTime) => {
    if (dataModal.length > 0) {
      let index = -1;
      dataModal.forEach((data, j) => {
        if (data.lostId == item.lostId) {
          index = j;
        }
      });
      if (index >= 0) {
        dataModal.splice(index, 1);
        setDataModal([...dataModal]);
      }
    }
  };

  const submit = () => {
    let totalSum: number = 0
    for (var i = 0; i < dataModal.length; i++) {
      totalSum += parseInt(dataModal[i].qtyLostTime == '' ? '0' : dataModal[i].qtyLostTime);
    }
  }

  const onPressHandleClose = () => {
    if (handleCancel) {
      handleCancel();
    }
  };

  console.log(dataModal)

  useEffect(() => {
    getErrorList();
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}>
        <View
          // style={{ flex: 1 }}
          style={{
            height:
              deviceHeight -
              styles.header.height -
              styles.submit.height -
              heightStatusBar -
              styles.plusButton.height -
              styles.plusButton.marginTop,
          }}>
          <ScrollView>
            {dataModal && dataModal.length > 0 ? (
              dataModal.map((item, j) => {
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
                      style={{ width: 30, alignItems: 'center', marginTop: 32 }}>
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
                          <View style={{ width: 110 }}>
                            <Text style={styles.label}>Tổng lost time:</Text>
                          </View>
                          <View
                            style={{
                              width: deviceWidth - 100 - 20,
                              height: '80%',
                            }}>
                            <TextInput
                              style={styles.inputBox}
                              value={item.qtyLostTime + ''}
                              onChange={(data) => handleChangeLostTime(data, j)}
                            />
                            {item.listError.length > 0
                              ? item.listError.map((err, j) => {
                                if (err.fieldName == 'inputValue') {
                                  return (
                                    <Text
                                      key={j}
                                      style={{
                                        color: 'red',
                                        margin: 0,
                                        paddingLeft: 30,
                                        height: 45,
                                        fontFamily: 'Mulish-SemiBold',
                                        fontSize: 14,
                                      }}>
                                      {err.mes}
                                    </Text>
                                  );
                                }
                              })
                              : null}
                          </View>
                        </View>
                      </View>

                      <View style={styles.content}>
                        <View style={styles.textInputContent}>
                          <View style={{ width: 110 }}>
                            <Text style={styles.label}>Lý do:</Text>
                          </View>
                          <View style={{ width: deviceWidth - 100 - 20 }}>
                            <SelectBaseVer2
                              listData={dataDropdown}
                              popupTitle="Lost time"
                              title="Chọn lost time"
                              styles={styles.inputBox}
                              onSelect={(data: any) => {
                                var qty = dataDropdown.find(
                                  x => x.id == data[0],
                                )?.qty;
                                if (qty != undefined) {
                                  handleChangeLostTimeByDropdown(qty, j);
                                }
                              }}
                              stylesIcon={{
                                position: 'absolute',
                                zIndex: -1,
                                right: 10,
                                top: 15,
                              }}
                              valueArr={[]}
                              isSelectSingle={true}
                            />
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
                  paddingHorizontal: 14,
                  marginTop: 20,
                  alignContent: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#001E31',
                    fontFamily: 'Mulish-SemiBold',
                    fontSize: 15,
                  }}>
                  Vui lòng nhấn thêm lost time
                </Text>
              </View>
            )}
            {dataModal.length == 0 ? (
              <View
                style={{
                  alignItems: 'flex-end',
                  position: 'relative',
                }}>
                <TouchableOpacity
                  style={{ ...styles.plusButton, width: '32%' }}
                  onPress={() => handleAddMoreForm()}>
                  <Svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                    <Circle cx="10" cy="10.1923" r="7.5" fill="#CCE5FF" />
                    <Path
                      d="M9.99935 14.1507C10.1799 14.1507 10.3293 14.0918 10.4477 13.974C10.5655 13.8557 10.6243 13.7062 10.6243 13.5257V10.8173H13.3535C13.5202 10.8173 13.6627 10.7582 13.781 10.6398C13.8988 10.5221 13.9577 10.3729 13.9577 10.1923C13.9577 10.0118 13.8988 9.86234 13.781 9.74401C13.6627 9.62623 13.5132 9.56734 13.3327 9.56734H10.6243V6.83818C10.6243 6.67151 10.5655 6.52929 10.4477 6.41151C10.3293 6.29318 10.1799 6.23401 9.99935 6.23401C9.81879 6.23401 9.66963 6.29318 9.55185 6.41151C9.43352 6.52929 9.37435 6.67845 9.37435 6.85901V9.56734H6.64518C6.47852 9.56734 6.33629 9.62623 6.21852 9.74401C6.10018 9.86234 6.04102 10.0118 6.04102 10.1923C6.04102 10.3729 6.10018 10.5221 6.21852 10.6398C6.33629 10.7582 6.48546 10.8173 6.66602 10.8173H9.37435V13.5465C9.37435 13.7132 9.43352 13.8557 9.55185 13.974C9.66963 14.0918 9.81879 14.1507 9.99935 14.1507Z"
                      fill="url(#paint0_linear_938_3918)"
                    />
                    <Defs>
                      <LinearGradient
                        id="paint0_linear_938_3918"
                        x1="9.99935"
                        y1="6.23401"
                        x2="9.99935"
                        y2="14.1507"
                        gradientUnits="userSpaceOnUse">
                        <Stop stop-color="#003350" />
                        <Stop offset="1" stop-color="#00598C" />
                      </LinearGradient>
                    </Defs>
                  </Svg>
                  <Text
                    style={{ color: '#003350', fontFamily: 'Mulish-SemiBold' }}>
                    Thêm lost time
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>
          {dataModal.length != 0 ? (
            <View
              style={{
                alignItems: 'flex-end',
                position: 'absolute',
                bottom: 10,
                right: 10,
                height: 70,
              }}>
              <TouchableOpacity
                style={{ ...styles.plusButton, width: '66%' }}
                onPress={() => handleAddMoreForm()}>
                <Svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                  <Circle cx="10" cy="10.1923" r="7.5" fill="#CCE5FF" />
                  <Path
                    d="M9.99935 14.1507C10.1799 14.1507 10.3293 14.0918 10.4477 13.974C10.5655 13.8557 10.6243 13.7062 10.6243 13.5257V10.8173H13.3535C13.5202 10.8173 13.6627 10.7582 13.781 10.6398C13.8988 10.5221 13.9577 10.3729 13.9577 10.1923C13.9577 10.0118 13.8988 9.86234 13.781 9.74401C13.6627 9.62623 13.5132 9.56734 13.3327 9.56734H10.6243V6.83818C10.6243 6.67151 10.5655 6.52929 10.4477 6.41151C10.3293 6.29318 10.1799 6.23401 9.99935 6.23401C9.81879 6.23401 9.66963 6.29318 9.55185 6.41151C9.43352 6.52929 9.37435 6.67845 9.37435 6.85901V9.56734H6.64518C6.47852 9.56734 6.33629 9.62623 6.21852 9.74401C6.10018 9.86234 6.04102 10.0118 6.04102 10.1923C6.04102 10.3729 6.10018 10.5221 6.21852 10.6398C6.33629 10.7582 6.48546 10.8173 6.66602 10.8173H9.37435V13.5465C9.37435 13.7132 9.43352 13.8557 9.55185 13.974C9.66963 14.0918 9.81879 14.1507 9.99935 14.1507Z"
                    fill="url(#paint0_linear_938_3918)"
                  />
                  <Defs>
                    <LinearGradient
                      id="paint0_linear_938_3918"
                      x1="9.99935"
                      y1="6.23401"
                      x2="9.99935"
                      y2="14.1507"
                      gradientUnits="userSpaceOnUse">
                      <Stop stop-color="#003350" />
                      <Stop offset="1" stop-color="#00598C" />
                    </LinearGradient>
                  </Defs>
                </Svg>
                <Text style={{ color: '#003350', fontFamily: 'Mulish-SemiBold' }}>
                  Thêm lost time
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.submit}>
        <View style={{ height: 40, width: '30%', paddingRight: 20 }}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={onPressHandleClose}>
            <View>
              <Text style={{ color: '#006496', fontFamily: 'Mulish-SemiBold' }}>
                Hủy{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40, width: '30%' }}>
          <TouchableOpacity
            style={styles.submitButton}
          //onPress={() => submit()}
          >
            <View>
              <Text style={{ color: '#ffffff', fontFamily: 'Mulish-SemiBold' }}>
                Lưu
              </Text>
            </View>
          </TouchableOpacity>
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
    shadowOffset: { width: 1, height: 1 },
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
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  plusButton: {
    alignContent: 'flex-end',
    flexDirection: 'row',
    backgroundColor: '#E3F0FE',
    borderRadius: 5,
    height: 40,
    marginRight: 20,
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
    padding: 20,
    marginLeft: 10,
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

export default AddLostTimeMoldingModal;