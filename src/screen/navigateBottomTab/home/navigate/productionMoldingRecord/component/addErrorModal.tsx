import { NavigationProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
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
import { HeightTitleApp } from '../../../../../share/app/constants/constansHeightApp';
import {
  ApiCommon,
  ResponseService,
} from '../../../../../share/app/constantsApi';
import CommonBase from '../../../../../share/network/axios';
import { WorkByTypeEnumMobile } from '../../productionRecord/types/enum/productionRecord';
import { IDropdownForModal, IListErr } from '../types/types';
import { generateGuid, IRule, typeVadilate, validateField } from '../../../../../share/commonVadilate/validate';
import { Regex } from '../../../../../share/app/regex';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const Rules: IRule[] = [
  {
    field: 'inputValue',
    required: false,
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

let heightStatusBar = StatusBar.currentHeight ? StatusBar.currentHeight : 0;
let HeightTitleAppPage = HeightTitleApp.Android;
if (Platform.OS == 'ios') {
  HeightTitleAppPage = HeightTitleApp.Ios;
}

export interface AddErrorMoldingProps {
  navigation: NavigationProp<any, any>;
  handleCancel: any;
  handleSubmit: Function;
}

const dataTest: IDropdownForModal[] = [
  {
    name: "Lên khuôn",
    id: "1",
    code: "1",
    line: "",
    qtydetailwo: "",
    qty: "",
    listError: []
  },
  {
    name: "Nhựa",
    id: "2",
    code: "2",
    line: "",
    qtydetailwo: "",
    qty: "",
    listError: []
  },
  {
    name: "Bavia",
    id: "3",
    code: "3",
    line: "",
    qtydetailwo: "",
    qty: "",
    listError: []
  }
]

const AddErrorMoldingModal: React.FC<AddErrorMoldingProps> = ({
  navigation,
  handleSubmit,
  handleCancel,
}) => {
  const [dataModal, setDataModal] = useState<IDropdownForModal[]>([]);

  const getErrorList = async () => {
    let dataTimeSlotResponse = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_API_COMMON + '?type=' + WorkByTypeEnumMobile.Error,
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
      setDataModal(data.list);
    }
  };

  const onPressHandleClose = () => {
    if (handleCancel) {
      handleCancel();
    }
  };

  const handleOnChangeData = (e: any, index: number) => {
    const value = e.nativeEvent.text;
    //dataModal[index].listError = validateField(
    dataTest[index].listError = validateField(
      value,
      Rules,
      'inputValue',
      dataTest[index].listError,
    );
    if (dataTest.length > 0) {
      dataTest[index].qty = value;
    }
    setDataModal([...dataTest]);
  }

  const submit = () => {
    let totalSum: number = 0
    for (var i = 0; i < dataModal.length; i++) {
      totalSum += parseInt(dataModal[i].qty == '' ? '0' : dataModal[i].qty);
    }
    let dataPush: IListErr = {
      errorId: generateGuid(),
      qtyError: totalSum
    }
    if (handleSubmit) {
      handleSubmit([dataPush])
    }
  }

  useEffect(() => {
    getErrorList();
  }, []);

  return (
    <View style={styles.container}>
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
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                backgroundColor: '#ffffff',
                marginBottom: 14,
                paddingHorizontal: 14,
              }}>
              <View
                style={{ width: deviceWidth - 30, backgroundColor: '#ffffff' }}>
                {dataTest && dataTest.length > 0
                  ? dataTest.map((item, j) => {
                    return (
                      <View style={styles.content} key={j}>
                        <View style={styles.textInputContent}>
                          <View style={{ width: 100 }}>
                            <Text style={styles.label}>
                              {item.name + ' :'}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: deviceWidth - 100 - 20,
                              height: '80%',
                            }}>
                            <TextInput value={item.qty}
                              style={styles.inputBox}
                              placeholder='Nhập số lượng'
                              placeholderTextColor='#AAABAE'
                              onChange={(data) => handleOnChangeData(data, j)}
                            />
                            {item?.listError?.length > 0
                              ? item?.listError?.map((err, j) => {
                                if (err.fieldName == 'inputValue') {
                                  return (
                                    <Text
                                      key={j}
                                      style={{
                                        color: 'red',
                                        margin: 0,
                                        paddingLeft: 20,
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
                    );
                  })
                  : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.submit}>
        <View style={{ height: 40, width: '30%', paddingRight: 20 }}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={onPressHandleClose}>
            <View>
              <Text style={{ color: '#006496', fontFamily: 'Mulish-Bold' }}>
                Đóng{' '}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40, width: '30%' }}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => submit()}
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 14
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
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingVertical: 8,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Mulish-Bold',
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

export default AddErrorMoldingModal;
