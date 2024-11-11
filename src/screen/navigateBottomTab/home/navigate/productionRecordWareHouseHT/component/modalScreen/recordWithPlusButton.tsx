import {NavigationProp} from '@react-navigation/native';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import PopUpBase from '../../../../../../share/base/component/popUp/popUpBase';
import Modal from 'react-native-modal';
import {useEffect, useState} from 'react';
import {
  IDataPageRecordInput,
  IUserDefaultCallApi,
} from '../../types/productionRecordHTTypes';
import CommonBase from '../../../../../../share/network/axios';
import {
    ApiCommon,
  ApiProductionHT,
  RequestService,
  ResponseService,
} from '../../../../../../share/app/constantsApi';
import { ITimeSlot } from '../../../productionRecord/types/types';
import moment from 'moment';
import {connect} from 'react-redux';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import {createStructuredSelector} from 'reselect';
import baseAction from '../../../../../../base/saga/action';

// Import the react-native-sound module
var Sound = require('react-native-sound');

// Enable playback in silence mode
Sound.setCategory('Playback');

export interface IRecordHTWareHouseProp {
  navigation: NavigationProp<any, any>;
  dataRecord: IDataPageRecordInput;
  dataInfo: IUserDefaultCallApi;
  sizeCode: string;
  colorCode: string;
  marketCode: string;
  seasonCode: string;
  baseAction: typeof baseAction;
}

export interface ITimeLine {
  Timefrom:"",
  Timeto:""
}

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const RecordHTWareHouseModal: React.FC<IRecordHTWareHouseProp> = ({
  navigation,
  dataRecord,
  dataInfo,
  colorCode,
  marketCode,
  seasonCode,
  sizeCode,
  baseAction
}) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isInProgress, setIsInProgress] = useState<boolean>(false);

  const [dataPage, setDataPage] = useState<IDataPageRecordInput>({
    Workcenterid: dataRecord.Workcenterid,
    Workordercode: dataRecord.Workordercode,
    ItemCode: dataRecord.ItemCode,
    Color: dataRecord.Color,
    Maincodeproduct: dataRecord.Maincodeproduct,
    Seasoncode: dataRecord.Seasoncode,
    Marketcode: dataRecord.Marketcode,
    Sizecode: dataRecord.Sizecode,
    DateRecord: dataRecord.DateRecord,
    TimeSlot: '',
    subCode: dataRecord.subCode,
    QtyStorage: '',
  });

  const [getTimeSlot, setTimeSlot] = useState<ITimeSlot[]>([]);
  const [timeSlotName, setTimeSlotName]= useState('')

  const [dataInfoPlus, setDataInfoPlus] = useState<IUserDefaultCallApi>({
    QtyDay: '',
    QtyKH: '',
    QtyLKStorage: '',
    QtyStorage: '',
    QtyTatolSX: '',
  });

  const handlePlus = async () => {
    if (dataPage.QtyStorage == '' || dataPage.QtyStorage == null) {
      setDataPage(prevState => ({
        ...prevState,
        QtyStorage: '1',
      }));
      onPressSubmit('1');
    } else {
      let dataPlus = (parseInt(dataPage.QtyStorage) + 1).toString();
      setDataPage(prevState => ({
        ...prevState,
        QtyStorage: dataPlus,
      }));
      onPressSubmit(dataPlus);
    }
    var whoosh = new Sound('ting1.mp3', Sound.MAIN_BUNDLE, (error: any) => {
      whoosh.play();
    });
    
  };

  const handleMinus = async () => {
    if (parseInt(dataPage.QtyStorage) == 0) {
      setDataPage(prevState => ({
        ...prevState,
        QtyStorage: '1',
      }));
      onPressSubmit('1');
      return;
    } else {
      let dataMinus = (parseInt(dataPage.QtyStorage) - 1).toString();
      setDataPage(prevState => ({
        ...prevState,
        QtyStorage: dataMinus,
      }));
      onPressSubmit(dataMinus);
    }
  };

  const getDataTimeSlot = async () => {
    let request = 36;
    let dataTimeSlotResponse = await CommonBase.getAsync<ResponseService>(
      ApiCommon.GET_API_COMMON + '?type=' + request,
      null,
    );
    if (
      typeof dataTimeSlotResponse !== 'string' &&
      dataTimeSlotResponse != null &&
      dataTimeSlotResponse.isSuccess === true
    ) {
      let data = {
        listTime: dataTimeSlotResponse.data,
      };
      setTimeSlot(data.listTime);
    }
  };

  const compareTimeSlotWithRealTime = () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let localTime = new Date();
    let dateNow = moment(localTime).format("HH:mm:ss ");
    let dataTimeArr: ITimeLine[] = []

    if(getTimeSlot && getTimeSlot.length > 0){
      let dataTime = getTimeSlot.forEach(item =>{
        if(dataTime == undefined){
          dataTimeArr.push(JSON.parse(item.line))
        }
      })
      if(dataTimeArr.length > 0){
        for(var i = 0; i < dataTimeArr.length; i ++){
          if( dataTimeArr[i].Timefrom <= dateNow && dateNow <= dataTimeArr[i].Timeto)
          {
            var data = getTimeSlot.filter(x => x.line == JSON.stringify(dataTimeArr[i]))[0].id;
            var name = getTimeSlot.filter(x => x.line == JSON.stringify(dataTimeArr[i]))[0].name;
            setTimeSlotName(name)
            getTimeSlot.findIndex(x => x.line == JSON.stringify(dataTimeArr[i]))
            setDataPage(prevState => ({
              ...prevState,
              TimeSlot: data,
            }));
          }
        }
      }
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  }

  const onPressCloseModal = () => {
    setIsOpenModal(false);
  };

  const onPressSubmitModal = () => {
    handleMinus();
    setIsOpenModal(false);
  };
  const getDataInfo = async () => {
    
    if (dataPage.TimeSlot == '') {
      return;
    } else {
      let dataResponse = await CommonBase.getAsync<ResponseService>(
        ApiProductionHT.GET_DATA_INFO +
          '?DateRecord=' +
          dataPage.DateRecord +
          '&Workcenterid=' +
          dataPage.Workcenterid +
          '&Mainproductcode=' +
          dataPage.Maincodeproduct +
          '&Colorcode=' +
          dataPage.Color +
          '&Subproductcode=' +
          dataPage.subCode +
          '&Marketcode=' +
          dataPage.Marketcode +
          '&Seasoncode=' +
          dataPage.Seasoncode +
          '&Workordercode=' +
          dataPage.Workordercode +
          '&Sizecode=' +
          dataPage.Sizecode +
          '&Slotcode=' +
          dataPage.TimeSlot,
        null,
      );
      if (
        typeof dataResponse !== 'string' &&
        dataResponse != null &&
        dataResponse.isSuccess === true
      ) {
        let data: IUserDefaultCallApi = {
          QtyDay: dataResponse.data.QtyDay,
          QtyKH: dataResponse.data.QtyKH,
          QtyLKStorage: dataResponse.data.QtyLKStorage,
          QtyStorage: dataResponse.data.QtyStorage,
          QtyTatolSX: dataResponse.data.QtyTatolSX,
        };
        if (data.QtyStorage != null) {
          setDataPage(prevState => ({
            ...prevState,
            QtyStorage: data.QtyStorage,
          }));
        }
        setDataInfoPlus(prevState => ({
          ...prevState,
          QtyDay: data.QtyDay,
          QtyKH: data.QtyKH,
          QtyLKStorage: data.QtyLKStorage,
          QtyStorage: data.QtyStorage,
          QtyTatolSX: data.QtyTatolSX,
        }));
      }
    }
  };

  const onPressSubmit = async (dataQtyStorage: string) => {
    setIsInProgress(true);
    if (dataQtyStorage != '' && dataQtyStorage != null && parseInt(dataQtyStorage) == 0) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Sản lượng không được bằng 0!', ToastAndroid.LONG);
      } else {
        Alert.alert('Sản lượng không được bằng 0!');
      }
      setIsInProgress(false);
      return;
    } else {
      if(dataQtyStorage != null && dataQtyStorage != ''){
        let request = {
          DateRecord: dataPage.DateRecord,
          Workcenterid: dataPage.Workcenterid,
          Mainproductcode: dataPage.Maincodeproduct,
          Colorcode: dataPage.Color,
          Subproductcode: dataPage.subCode,
          Marketcode: dataPage.Marketcode,
          Seasoncode: dataPage.Seasoncode,
          Workordercode: dataPage.Workordercode,
          Sizecode: dataPage.Sizecode,
          Slotcode: dataPage.TimeSlot,
          QtyStorage: dataQtyStorage,
        };
        let dataResponse = await CommonBase.postAsync<RequestService>(
          ApiProductionHT.RECORD_HT_OUTPUT,
          request,
        );
        if (
          typeof dataResponse !== 'string' &&
          dataResponse != null &&
          dataResponse.isSuccess === true
        ) {
          await getDataInfo();
          setIsInProgress(false);
        } else {
          if (Platform.OS === 'android') {
            ToastAndroid.show('Vui lòng kiểm tra lại!', ToastAndroid.LONG);
          } else {
            Alert.alert(
              'Ghi nhận sản lượng không thành công. Vui lòng kiểm tra lại!',
            );
          }
        }
      }
      else{
        setIsInProgress(false);
        return
      }
    }
  };

  useEffect(() => {
    getDataTimeSlot()
    getDataInfo()
  },[])

  useEffect(() => {
    compareTimeSlotWithRealTime()
  },[getTimeSlot])

  useEffect(() => {
    getDataInfo()
  },[dataPage.TimeSlot])

  // useEffect(() => {
  //   onPressSubmit();
  // }, [dataPage.QtyStorage]);

  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        <ScrollView>
          <View style={{padding: 16}}>
            <View
              style={{
                backgroundColor: '#ffffff',
                marginBottom: 16,
                justifyContent: 'space-between',
              }}>
              <View style={styles.content}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.labelContent}>Ngày</Text>
                  <Text style={styles.infoContent}>{dataPage.DateRecord}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.labelContent}>Lệnh sản xuất</Text>
                  <Text style={styles.infoContent}>
                    {dataPage.Maincodeproduct}
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.labelContent}>Màu</Text>
                  <Text style={styles.infoContent}>{colorCode}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.labelContent}>Mùa</Text>
                  <Text style={styles.infoContent}>{seasonCode}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.labelContent}>Thị trường</Text>
                  <Text style={styles.infoContent}>{marketCode}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.labelContent}>Cỡ</Text>
                  <Text style={styles.infoContent}>{sizeCode}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.labelContent}>Ca</Text>
                  <Text style={styles.infoContent}>{timeSlotName}</Text>
                </View>
              </View>
            </View>

            <View style={{backgroundColor: '#ffffff'}}>
              <View style={styles.content}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      color: '#1B3A4ECC',
                      fontFamily: 'Mulish-SemiBold',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      width: '33%',
                      textAlign: 'center',
                      paddingBottom: 12,
                    }}>
                    Thực hiện ca
                  </Text>
                  <Text
                    style={{
                      color: '#1B3A4ECC',
                      fontFamily: 'Mulish-SemiBold',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      width: '33%',
                      textAlign: 'center',
                      paddingBottom: 12,
                    }}>
                    Thực hiện ngày
                  </Text>
                  <Text
                    style={{
                      color: '#1B3A4ECC',
                      fontFamily: 'Mulish-SemiBold',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      width: '33%',
                      textAlign: 'center',
                      paddingLeft: 20,
                      paddingBottom: 12,
                    }}>
                    Lũy kế
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      color: '#008B09',
                      fontFamily: 'Mulish-SemiBold',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      width: '33%',
                      textAlign: 'center',
                      paddingBottom: 12,
                      fontSize: 28,
                    }}>
                    {dataInfoPlus.QtyStorage == null
                      ? '0'
                      : dataInfoPlus.QtyStorage + ''}
                  </Text>
                  <Text
                    style={{
                      color: '#008B09',
                      fontFamily: 'Mulish-SemiBold',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      width: '33%',
                      textAlign: 'center',
                      paddingBottom: 12,
                      fontSize: 28,
                    }}>
                    {dataInfoPlus.QtyDay == null
                      ? '0'
                      : dataInfoPlus.QtyDay + ''}
                  </Text>
                  <Text
                    style={{
                      color: '#008B09',
                      fontFamily: 'Mulish-SemiBold',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      width: '33%',
                      textAlign: 'center',
                      paddingBottom: 12,
                      fontSize: 28,
                    }}>
                    {dataInfoPlus.QtyLKStorage == null
                      ? '0'
                      : dataInfoPlus.QtyLKStorage}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{padding: 16}}>
            {isInProgress == false ? (
              <TouchableOpacity
                style={{
                  backgroundColor: '#006496',
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
                onPress={handlePlus}>
                <Text
                  style={{
                    fontFamily: 'Mulish-Bold',
                    fontSize: 15,
                    fontStyle: 'normal',
                    fontWeight: '600',
                    color: '#FFF',
                  }}>
                  Thêm một sản phẩm
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  borderColor: '#AAABAE',
                  borderWidth: 1,
                  borderRadius: 2,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
                disabled>
                <Text
                  style={{
                    fontFamily: 'Mulish-Bold',
                    fontSize: 15,
                    fontStyle: 'normal',
                    fontWeight: '600',
                    color: '#AAABAE',
                  }}>
                  Thêm một sản phẩm
                </Text>
              </TouchableOpacity>
            )}

            {dataPage.QtyStorage != '' && parseInt(dataPage.QtyStorage) > 1 ? (
              <TouchableOpacity
                style={{
                  borderColor: '#004B72',
                  borderWidth: 1,
                  borderRadius: 2,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setIsOpenModal(true)}>
                <Text
                  style={{
                    fontFamily: 'Mulish-Bold',
                    fontSize: 15,
                    fontStyle: 'normal',
                    fontWeight: '600',
                    color: '#004B72',
                  }}>
                  Giảm một sản phẩm
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  borderColor: '#AAABAE',
                  borderWidth: 1,
                  borderRadius: 2,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                disabled>
                <Text
                  style={{
                    fontFamily: 'Mulish-Bold',
                    fontSize: 15,
                    fontStyle: 'normal',
                    fontWeight: '600',
                    color: '#AAABAE',
                  }}>
                  Giảm một sản phẩm
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
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
            content={' Bạn đang ghi nhận giảm một sản phẩm '}
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
    flex: 2,
    height: '100%',
    width: '100%',
    backgroundColor: '#F4F4F9',
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 1},
    flexDirection: 'column',
  },
  header: {
    justifyContent: 'center',
    paddingLeft: 18,
    borderBottomColor: '#001E31',
    height: 60,
    backgroundColor: '#ffffff',
  },
  content: {
    alignItems: 'center',
    padding: 16,
  },
  labelContent: {
    color: '#1B3A4ECC',
    fontFamily: 'Mulish-SemiBold',
    fontStyle: 'normal',
    fontWeight: '400',
    width: 150,
    paddingBottom: 12,
  },
  infoContent: {
    width: '40%',
    fontFamily: 'Mulish-Bold',
    color: '#1B3A4ECC',
    paddingBottom: 12,
    paddingLeft: 20,
  },
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  baseAction: bindActionCreators(baseAction, dispatch),
});
export default connect(
  null,
  mapDispatchToProps,
)(RecordHTWareHouseModal);
