import {NavigationProp} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import Svg, {Circle, Defs, LinearGradient, Path, Stop} from 'react-native-svg';
import {HeightTitleApp} from '../../../../../share/app/constants/constansHeightApp';
import PopUpBase from '../../../../../share/base/component/popUp/popUpBase';
import {
  IError,
  IRule,
  generateGuid,
  validateField,
  validateForm,
} from '../../../../../share/commonVadilate/validate';
import {IListBatchRecyclings} from '../types/types';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

let heightStatusBar = StatusBar.currentHeight ? StatusBar.currentHeight : 0;
let HeightTitleAppPage = HeightTitleApp.Android;
if (Platform.OS == 'ios') {
  HeightTitleAppPage = HeightTitleApp.Ios;
}

const Rules: IRule[] = [
  {
    field: 'contentRecycling',
    required: true,
    maxLength: 100,
    minLength: 0,
    typeValidate: 0,
    valueCheck: '',
    maxValue: 0,
    messages: {
      required: 'Vui lòng điền nội dung tái chế',
      minLength: '',
      maxLength: '',
      validate: '',
      maxValue: '',
    },
  },
];

export interface RecyclingProps {
  navigation: NavigationProp<any, any>;
  handleCancel: any;
  handleSubmit: Function;
  handleListDataRecycleLength: Function;
  listRecycleProps: IListBatchRecyclings[];
  typeQAQC: number;
}

const RecyclingModal: React.FC<RecyclingProps> = ({
  navigation,
  handleCancel,
  handleSubmit,
  handleListDataRecycleLength,
  listRecycleProps,
  typeQAQC,
}) => {
  const [errors, setErrors] = useState<IError[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [listDataNote, setListDataNote] = useState<IListBatchRecyclings[]>([]);

  const handleAddMoreForm = () => {
    let isCheckVadilate = true;
    if (listDataNote.length > 0) {
      listDataNote.forEach(item => {
        item.listError = validateForm(item, Rules, []);
        if (item.listError.length > 0) {
          isCheckVadilate = false;
        }
      });
    }
    if (isCheckVadilate === true) {
      let data: IListBatchRecyclings = {
        idNote: generateGuid(),
        contentRecycling: '',
        listError: [],
      };
      listDataNote.unshift(data);
    }
    setListDataNote([...listDataNote]);
  };

  const handleRemoveItem = (item: IListBatchRecyclings) => {
    if (listDataNote.length > 0) {
      let index = -1;
      listDataNote.forEach((note, j) => {
        if (note.idNote == item.idNote) {
          index = j;
        }
      });
      if (index >= 0) {
        listDataNote.splice(index, 1);
        setListDataNote([...listDataNote]);
      }
    }
  };

  const handleOnChangeNote = (e: any, index: number) => {
    const value = e.nativeEvent.text;
    listDataNote[index].listError = validateField(
      value,
      Rules,
      'contentRecycling',
      listDataNote[index].listError,
    );
    if (listDataNote.length > 0) {
      listDataNote[index].contentRecycling = value;
    }
    setListDataNote([...listDataNote]);
  };

  const onPressHandleClose = () => {
    if (handleCancel) {
      handleCancel();
    }
  };

  const onPressSubmitModal = () => {
    submit();
    setIsOpenModal(false);
  };

  const onPressSubmit = () => {
    if (listDataNote.length <= 0) {
      Alert.alert('Không thể lưu, vui lòng chọn lỗi!');
      return;
    } else {
      setIsOpenModal(true);
    }
  };

  const submit = async () => {
    if (handleSubmit) {
      let isCheckVadilate = true;
      if (listDataNote.length > 0) {
        listDataNote.forEach(item => {
          item.listError = validateForm(item, Rules, []);
          if (item.listError.length > 0) {
            isCheckVadilate = false;
          }
        });
      }
      if (isCheckVadilate === true) {
        handleListDataRecycleLength(listDataNote.length);
        handleSubmit(listDataNote);
      }
      setListDataNote([...listDataNote]);
    }
  };

  const onPressCloseModal = () => {
    setIsOpenModal(false);
  };

  useEffect(() => {
    setListDataNote([...listRecycleProps]);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textHeaderLabel}>
          Bạn đang yêu cầu tổ may thực hiện tái chế
        </Text>
      </View>
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
              styles.plusButton.marginTop -
              HeightTitleAppPage,
          }}>
          <ScrollView>
            <View>
              {listDataNote && listDataNote.length > 0 ? (
                listDataNote.map((item, j) => {
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
                        style={{
                          width: 30,
                          alignItems: 'center',
                          marginTop: 32,
                        }}>
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
                            <View style={{flex: 1}}>
                              <Text style={styles.label}>Nội dung tái chế</Text>
                            </View>
                          </View>
                          <View
                            style={{
                              width: deviceWidth - 20,
                              height: 90,
                              paddingRight: 16,
                              paddingBottom: 16,
                            }}>
                            <TextInput
                              style={styles.inputBox}
                              onChange={data => handleOnChangeNote(data, j)}
                              placeholder={'Nhập nội dung'}
                              multiline={true}
                              numberOfLines={8}
                              value={item.contentRecycling}
                            />
                            {item?.listError?.length > 0
                              ? item?.listError?.map((err, j) => {
                                  if (err.fieldName == 'contentRecycling') {
                                    return (
                                      <Text
                                        key={j}
                                        style={{
                                          color: 'red',
                                          margin: 0,
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
                  }}>
                  <Text
                    style={{color: '#001E31', fontFamily: 'Mulish-SemiBold'}}>
                    Vui lòng nhấn thêm nội dung tái chế
                  </Text>
                </View>
              )}
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <TouchableOpacity
                style={styles.plusButton}
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
                <Text style={{color: '#003350', fontFamily: 'Mulish-SemiBold'}}>
                  Thêm nội dung tái chế
                </Text>
              </TouchableOpacity>
            </View>
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
                Hủy{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{height: 40, width: '30%'}}>
          <TouchableOpacity
            style={styles.submitButton}
            //onPress={onPressSubmit}
            onPress={() => submit()}>
            <View>
              <Text style={{color: '#ffffff', fontFamily: 'Mulish-SemiBold'}}>
                Lưu
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {isOpenModal ? (
        <Modal
          isVisible={isOpenModal}
          //style={{ backgroundColor: '#ffffff', margin: 0 }}
          onBackdropPress={() => setIsOpenModal(false)}
          statusBarTranslucent={false}
          deviceHeight={deviceHeight}
          deviceWidth={deviceWidth}>
          <PopUpBase
            title={'Xác nhận'}
            content={
              ' Bạn sẽ không thể xem lại danh sách \n tái chế  ở trang này. Bạn muốn lưu ?'
            }
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
    flex: 1,
    // paddingHorizontal: 5
  },
  header: {
    justifyContent: 'center',
    paddingLeft: 18,
    borderBottomColor: '#001E31',
    height: 60,
    backgroundColor: '#F4F4F9',
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingBottom: 16,
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
    width: '50%',
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
    paddingVertical: 8,
    marginBottom: -8,
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
    color: '#1B3A4E',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
  },
  inputBox: {
    color: '#001E31',
    paddingLeft: 16,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-SemiBold',
    borderWidth: 1,
    borderColor: '#eaeaea',
    borderRadius: 4,
    height: Platform.OS == 'ios' ? 90 : 90,
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

export default RecyclingModal;
