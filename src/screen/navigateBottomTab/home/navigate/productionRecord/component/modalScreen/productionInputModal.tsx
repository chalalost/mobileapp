import {NavigationProp} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import {
  ApiCommon,
  ApiProductionRecord,
  RequestService,
  ResponseService,
} from '../../../../../../share/app/constantsApi';
import PopUpBase from '../../../../../../share/base/component/popUp/popUpBase';
import CommonBase from '../../../../../../share/network/axios';
import {
  IDataPageRecordInput,
  IRecorDataByUser,
  IUserDefaultCallApi,
} from '../../types/productionRecordTypes';
import Modal from 'react-native-modal';
import {ITimeSlot} from '../../types/types';
import moment from 'moment';

// Import the react-native-sound module
var Sound = require('react-native-sound');

// Enable playback in silence mode
Sound.setCategory('Playback');

export interface ProductionInputModalProps {
  navigation: NavigationProp<any, any>;
  dataRecord: IDataPageRecordInput;
  dataInfo: IUserDefaultCallApi;
  sizeCode: string;
  colorCode: string;
  marketCode: string;
  seasonCode: string;
}

export interface IProductionPlus {
  Workcenterid: string | '';
  Workordercode: string | '';
  ItemCode: string | '';
  Color: string | '';
  Maincodeproduct: string | '';
  Seasoncode: string | '';
  Marketcode: string | '';
  Sizecode: string | '';
  DateRecord: string | '';
  TimeSlot: string | '';
  QtyNeed: string | '';
  Qtydone: string | '';
  QtyLK: string | '';
}

export interface ITimeLine {
  Timefrom: '';
  Timeto: '';
}

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const ProductionInputModal: React.FC<ProductionInputModalProps> = ({
  navigation,
  dataRecord,
  dataInfo,
  sizeCode,
  colorCode,
  marketCode,
  seasonCode,
}) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isInProgress, setIsInProgress] = useState<boolean>(false);

  const [dataPage, setDataPage] = useState<IProductionPlus>({
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
    QtyNeed: dataInfo.QtyNeed,
    Qtydone: '',
    QtyLK: dataInfo.QtyLK,
  });

  const [getTimeSlot, setTimeSlot] = useState<ITimeSlot[]>([]);
  const [timeSlotName, setTimeSlotName] = useState('');

  const handlePlus = async () => {
    if (dataPage.Qtydone == '') {
      // setDataPage(prevState => ({
      //   ...prevState,
      //   Qtydone: '1',
      // }));
      compareTimeSlotWithRealTime();
      onPressSubmit('1');
    } else {
      let dataPlus = (parseInt(dataPage.Qtydone) + 1).toString();
      // setDataPage(prevState => ({
      //   ...prevState,
      //   Qtydone: dataPlus,
      // }));
      compareTimeSlotWithRealTime();
      onPressSubmit(dataPlus);
    }
    var whoosh = new Sound('ting1.mp3', Sound.MAIN_BUNDLE, (error: any) => {
      whoosh.play();
    });
    
  };

  const handleMinus = async () => {
    if (parseInt(dataPage.Qtydone) == 0) {
      return;
    } else {
      let dataMinus = (parseInt(dataPage.Qtydone) - 1).toString();
      // setDataPage(prevState => ({
      //   ...prevState,
      //   Qtydone: dataMinus,
      // }));
      compareTimeSlotWithRealTime();
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
    let localTime = new Date();
    let dateNow = moment(localTime).format('HH:mm:ss ');
    let dataTimeArr: ITimeLine[] = [];

    if (getTimeSlot && getTimeSlot.length > 0) {
      let dataTime = getTimeSlot.forEach(item => {
        if (dataTime == undefined) {
          dataTimeArr.push(JSON.parse(item.line));
        }
      });
      if (dataTimeArr.length > 0) {
        for (var i = 0; i < dataTimeArr.length; i++) {
          if (
            dataTimeArr[i].Timefrom <= dateNow &&
            dateNow <= dataTimeArr[i].Timeto
          ) {
            var data = getTimeSlot.filter(
              x => x.line == JSON.stringify(dataTimeArr[i]),
            )[0].id;
            var name = getTimeSlot.filter(
              x => x.line == JSON.stringify(dataTimeArr[i]),
            )[0].name;
            setTimeSlotName(name);
            getTimeSlot.findIndex(
              x => x.line == JSON.stringify(dataTimeArr[i]),
            );
            setDataPage(prevState => ({
              ...prevState,
              TimeSlot: data,
            }));
          }
        }
      }
    }
  };

  const getDataInfo = async () => {
    let request = {
      Workordercode: dataPage.Workordercode,
      Workerid: dataInfo.Workerid,
      Workcenterid: dataPage.Workcenterid,
      Stepid: '',
      Slottimecode: dataPage.TimeSlot,
      RecordForDate: dataPage.DateRecord,
      Productcode: dataPage.ItemCode,
    };
    // return;
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiProductionRecord.GET_INFO_WORKER_RECORD,
      request,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data: IUserDefaultCallApi = {
        Stepname: dataResponse.data.Stepname,
        Workerid: dataResponse.data.Workerid,
        Workername: dataResponse.data.Workername,
        Stepid: dataResponse.data.Stepid,
        QtyCutPartOld: dataResponse.data?.QtyCutPartOld
          ? dataResponse.data?.QtyCutPartOld
          : 0,
        QtyCutPartNew: dataResponse.data?.QtyCutPartNew ?? '',
        Qtydone: dataResponse.data?.Qtydone ?? '',
        QtyInputInline: dataResponse.data?.QtyInputInline ?? '',
        QtyNeed: dataResponse.data?.QtyNeed ?? '',
        QtyLK: dataResponse.data?.QtyLK ?? '',
      };
      if (data.Qtydone != null) {
        setDataPage(prevState => ({
          ...prevState,
          Qtydone: data.Qtydone,
        }));
      }
      setDataPage(prevState => ({
        ...prevState,
        QtyLK: data.QtyLK,
        QtyNeed: data.QtyNeed,
      }));
    }
  };

  const onPressSubmit = async (dataQtyDone: string) => {
    setIsInProgress(true);
    if(dataQtyDone != null && dataQtyDone != ''){
      let request: IRecorDataByUser = {
        Productcode: dataPage.ItemCode,
        Workcenterid: dataPage.Workcenterid,
        Workordercode: dataPage.Workordercode,
        Workerid: dataInfo.Workerid,
        Stepid: dataInfo.Stepid,
        QtyCutPartNew: dataInfo.QtyCutPartNew,
        Qtydone: dataQtyDone,
        QtyInputInline: dataInfo.QtyInputInline,
        Slottimecode: dataPage.TimeSlot,
        RecordForDate: dataPage.DateRecord,
      };
      let dataResponse = await CommonBase.postAsync<RequestService>(
        ApiProductionRecord.CARRY_OUT_PRODUCTION_RECORD,
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
  };

  const onPressCloseModal = () => {
    setIsOpenModal(false);
  };

  const onPressSubmitModal = () => {
    handleMinus();
    setIsOpenModal(false);
  };

  useEffect(() => {
    getDataTimeSlot();
  }, []);

  useEffect(() => {
    compareTimeSlotWithRealTime();
  }, [getTimeSlot]);

  useEffect(() => {
    getDataInfo()
  },[dataPage.TimeSlot])

  // useEffect(() => {
  //   compareTimeSlotWithRealTime();
  //   onPressSubmit();
  // }, [dataPage.Qtydone]);

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

            <View style={{height: 100, backgroundColor: '#ffffff'}}>
              <View style={styles.content}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      color: '#1B3A4ECC',
                      fontFamily: 'Mulish-SemiBold',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      width: 150,
                      paddingBottom: 12,
                    }}>
                    Thực hiện
                  </Text>
                  <Text
                    style={{
                      color: '#1B3A4ECC',
                      fontFamily: 'Mulish-SemiBold',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      width: '40%',
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
                      width: 150,
                      paddingBottom: 12,
                      fontSize: 28,
                    }}>
                    {dataPage.Qtydone}
                  </Text>
                  <Text
                    style={{
                      color: '#008B09',
                      fontFamily: 'Mulish-SemiBold',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      width: '40%',
                      paddingLeft: 20,
                      paddingBottom: 12,
                      fontSize: 28,
                    }}>
                    {dataPage.QtyLK}
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

            {dataPage.Qtydone != '' && parseInt(dataPage.Qtydone) != 0 ? (
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

export default ProductionInputModal;
