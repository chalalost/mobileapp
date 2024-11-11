import {
  DrawerActions,
  NavigationProp,
  useIsFocused,
} from '@react-navigation/native';
import moment from 'moment';
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
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Svg, {Path} from 'react-native-svg';
import {connect} from 'react-redux';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import {createStructuredSelector} from 'reselect';
import baseAction from '../../../../base/saga/action';
import {listActionForMenuSelected} from '../../../../base/saga/selectors';
import {IActionMenu} from '../../../../base/typeBase/type';
import {
  ApiCommon,
  ApiHistoryQuality,
  DropDownType,
  ResponseService,
  TypeWorkcenterMobile,
} from '../../../../share/app/constantsApi';
import {Regex} from '../../../../share/app/regex';
import ModalBase from '../../../../share/base/component/modal/modalBase';
import MyTitleHome from '../../../../share/base/component/myStatusBar/MyTitleHome';
import SelectBaseVer2 from '../../../../share/base/component/selectBase/selectBaseVer2';
import {
  IError,
  IRule,
  typeVadilate,
  validateField,
} from '../../../../share/commonVadilate/validate';
import CommonBase from '../../../../share/network/axios';
import DetailHistoryCheckModal from './component/detailHistoryCheckModal';
import {IDataLot, IDropdown, IRequestListLot} from './types/types';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

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

export interface HistoryQualityCheckProps {
  navigation: NavigationProp<any, any>;
  listActionForMenuSelected: IActionMenu[] | [];
  baseAction: typeof baseAction;
}

let localTime = new Date();
let date = moment(localTime).format('DD/MM/YYYY');

const HistoryQualityCheckScreen: React.FC<HistoryQualityCheckProps> = ({
  navigation,
  listActionForMenuSelected,
  baseAction,
}) => {
  const isFocused = useIsFocused();
  const [errors, setErrors] = useState<IError[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const [dataDropdownWorkCenter, setDataDropdownWorkCenter] = useState<
    IDropdown[]
  >([]);
  const [requestListData, setRequestListData] = useState<IRequestListLot>({
    date: date,
    workcenterid: '',
  });
  const [dataLot, setDataLot] = useState<IDataLot[]>([]);

  const [lotCodeKey, setLotCodeKey] = useState('');
  const [tittleName, setTittleName] = useState('');
  const [timeCheck, setTimeCheck] = useState('');

  const [dataDetail, setDataDetail] = useState<IDataLot>({
    CanEdit: false,
    Date: '',
    EnterEachResult: false,
    Lotcode: '',
    Note: '',
    QtyCommit: 0,
    QtyError: 0,
    QtyInLot: 0,
    QtyOK: 0,
    QtyTC: 0,
    TestTypeName: '',
    Workordercode: '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };
  const handleConfirm = (datePickerChoose: Date) => {
    let error = validateField(datePickerChoose, Rules, 'dateRecord', errors);
    setRequestListData(prevState => ({
      ...prevState,
      date: moment(datePickerChoose).format('DD/MM/YYYY'),
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
    // setCheckIsCreate(true)
    // setDataShowColor('')
  };

  const getDataDropdownWorkCenter = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_API_COMMON +
        '?type=' +
        DropDownType.WorkCenterAll +
        '&typeWorkcenter=' +
        TypeWorkcenterMobile.May,
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

  const getListDataLot = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    if (requestListData.workcenterid != '') {
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiHistoryQuality.GET_LIST_DATA_LOT +
          '?Date=' +
          requestListData.date +
          '&Workcenterid=' +
          requestListData.workcenterid,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data = {
          listDataLot: dataResponse.data,
        };
        setDataLot(data.listDataLot);
      }
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const clearData = () => {
    setSelectedDate(new Date());
    setRequestListData({
      date: date,
      workcenterid: '',
    });
    setDataLot([]);
    setDataDetail({
      CanEdit: false,
      Date: '',
      EnterEachResult: false,
      Lotcode: '',
      Note: '',
      QtyCommit: 0,
      QtyError: 0,
      QtyInLot: 0,
      QtyOK: 0,
      QtyTC: 0,
      TestTypeName: '',
      Workordercode: '',
    });
    setLotCodeKey('');
    setTittleName('');
  };

  useEffect(() => {
    getListDataLot();
  }, [isOpenModal]);

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

  useEffect(() => {
    getListDataLot();
  }, [requestListData]);

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
          title="Lịch sử kiểm tra chất lượng"
          hidenStatusBar={true}
          isShowIconRight={true}
          isShowIconLeft={true}
        />
      </LinearGradient>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View
          style={{
            height:
              deviceHeight -
              styles.header.height -
              (deviceHeight - (deviceHeight * 23) / 100),
            // shadowColor: '#00000',
            // shadowOpacity: 0.8,
            // elevation: 8,
          }}>
          <View style={styles.content}>
            <View style={styles.textInputContent}>
              <View style={{width: 120}}>
                <Text style={styles.label}>Ngày kiểm tra:</Text>
              </View>
              <View style={{width: deviceWidth - 100 - 20}}>
                <TouchableOpacity onPress={showDatePicker}>
                  <Text style={styles.datePickerBox}>
                    {requestListData.date ?? selectedDate}
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
                    setRequestListData(stateOld => ({
                      ...stateOld,
                      workcenterid: data[0],
                    }));
                  }}
                  stylesIcon={{
                    position: 'absolute',
                    zIndex: -1,
                    right: 10,
                    top: 15,
                  }}
                  valueArr={[requestListData.workcenterid]}
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
          </View>
        </View>
        {dataLot &&
        dataLot.filter(x => x.Date == '').length > 1 &&
        dataLot.length > 0 ? (
          <View style={styles.header2}>
            <Text style={styles.textHeaderLabel}>Thông tin kiểm tra</Text>
          </View>
        ) : null}

        <View
          style={{
            height:
              dataLot.length != 0 && dataLot.length > 3
                ? deviceHeight -
                  styles.header.height -
                  (deviceHeight -
                    (deviceHeight * 36 * (dataLot.length + 0.25)) / 100)
                : deviceHeight -
                  styles.header.height -
                  (deviceHeight -
                    (deviceHeight * 40 * (dataLot.length + 0.2)) / 100) +
                  40,
            // shadowColor: '#00000',
            // shadowOpacity: 0.8,
            // elevation: 8,
          }}>
          {dataLot && dataLot.length > 0 ? (
            dataLot.map((item, j) => {
              if (item.Date == '') {
                return null;
              } else {
                return (
                  <TouchableOpacity
                    style={styles.contentInfoCheckHistory}
                    key={j}
                    onPress={() => {
                      baseAction.setSpinnerReducer({
                        isSpinner: true,
                        textSpinner: '',
                      });
                      setLotCodeKey(item.Lotcode);
                      setTittleName(item.TestTypeName);
                      setTimeCheck(item.Date);
                      setDataDetail({
                        CanEdit: item.CanEdit,
                        Date: item.Date,
                        EnterEachResult: item.EnterEachResult,
                        Lotcode: item.Lotcode,
                        Note: item.Note,
                        QtyCommit: item.QtyCommit,
                        QtyError: item.QtyError,
                        QtyInLot: item.QtyInLot,
                        QtyOK: item.QtyOK,
                        QtyTC: item.QtyTC,
                        TestTypeName: item.TestTypeName,
                        Workordercode: item.Workordercode,
                      });
                      console.log('loadng item trong touchopacity', item);
                      baseAction.setSpinnerReducer({
                        isSpinner: false,
                        textSpinner: '',
                      });
                      setIsOpenModal(true);
                    }}>
                    <View style={{paddingTop: 20, width: '100%'}}>
                      <Text
                        style={{
                          color: '#1B3A4ECC',
                          fontFamily: 'Mulish-Bold',
                          fontWeight: '500',
                          fontSize: 14,
                          textAlign: 'left',
                        }}>
                        {item.Date}
                      </Text>
                    </View>

                    <View style={{flexDirection: 'row', paddingTop: 20}}>
                      <Text style={styles.labelContent}>
                        {item.TestTypeName}
                      </Text>
                      <Text
                        style={{
                          width: '40%',
                          fontFamily: 'Mulish-Bold',
                          color: '#000000',
                          paddingLeft: 20,
                        }}>
                        {/* W0000000312 */}
                        {item.Lotcode}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.labelContent}>Lệnh sản xuất:</Text>
                      <Text
                        style={{
                          width: '40%',
                          fontFamily: 'Mulish-Bold',
                          color: '#000000',
                          paddingLeft: 20,
                        }}>
                        {item.Workordercode}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.labelContent}>Số lượng Lot:</Text>
                      <Text
                        style={{
                          width: '40%',
                          fontFamily: 'Mulish-Bold',
                          color: '#000000',
                          paddingLeft: 20,
                        }}>
                        {item.QtyInLot}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.labelContent}>Cam kết:</Text>
                      <Text
                        style={{
                          width: '40%',
                          fontFamily: 'Mulish-Bold',
                          color: '#000000',
                          paddingLeft: 20,
                        }}>
                        {item.QtyCommit}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.lastLabel}>Tái chế:</Text>
                      <Text
                        style={{
                          width: '40%',
                          fontFamily: 'Mulish-Bold',
                          color: '#000000',
                          paddingLeft: 20,
                        }}>
                        {item.QtyTC}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }
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
                paddingTop: 20,
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
          )}
        </View>
      </ScrollView>
      {isOpenModal ? (
        <ModalBase
          navigation={navigation}
          isOpenModalProps={isOpenModal}
          title={'Lịch sử kiểm tra chi tiết'}
          handleSetModal={(isModal: boolean) => {
            setIsOpenModal(isModal);
          }}
          component={
            <DetailHistoryCheckModal
              navigation={navigation}
              handleCancel={() => {
                //goi lai list data 1 lan nua
                getListDataLot();
                setIsOpenModal(false);
              }}
              handleSubmit={() => {
                //goi lai list data 1 lan nua
                getListDataLot();
                setIsOpenModal(false);
              }}
              timeCheck={timeCheck}
              dataDetail={dataDetail}
              listActionForMenuSelected={listActionForMenuSelected}
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
    height: 30,
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
  labelContent: {
    color: '#1B3A4ECC',
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
    fontWeight: '400',
    width: '60%',
    height: (deviceHeight * 5) / 100,
    paddingBottom: 6,
    borderColor: '#D9D9D9',
    borderRightWidth: 1,
  },
  lastLabel: {
    color: '#1B3A4ECC',
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
    fontWeight: '400',
    width: '60%',
    height: (deviceHeight * 4) / 100,
    borderColor: '#D9D9D9',
    marginBottom: 20,
    borderRightWidth: 1,
  },
  content: {
    // height: deviceHeight - 5,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },

  contentInfoCheckHistory: {
    // height: deviceHeight - 5,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    marginTop: 16,
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
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  baseAction: bindActionCreators(baseAction, dispatch),
});

const mapStateToProps = createStructuredSelector({
  listActionForMenuSelected,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HistoryQualityCheckScreen);
