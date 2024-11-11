import {NavigationProp} from '@react-navigation/native';
import React, {useEffect, useState, useCallback} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MyTitleHome from '../../share/base/component/myStatusBar/MyTitleHome';
import Storage from '../../share/storage/storage';
import jwt_decode from 'jwt-decode';
import CommonBase from '../../share/network/axios';
import {ApiNotification, ResponseService} from '../../share/app/constantsApi';
import {dataPageRecordSX} from '../home/navigate/productionRecord/saga/productionRecordSelectors';
import {
  IDataNotifi,
  IItemNotification,
  IJsonMessage,
  INotification,
  typeBusiness,
  workOrderType,
} from './types/notificationPropTypes';
import Modal from 'react-native-modal';
import {Circle, Defs, G, Svg} from 'react-native-svg';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import {createStructuredSelector} from 'reselect';
import baseAction from '../../base/saga/action';
import moment from 'moment';
import {connect} from 'react-redux';

export interface SettingProps {
  navigation: NavigationProp<any, any>;
  baseAction: typeof baseAction;
}
const rows = 4;
const cols = 3;
const marginHorizontal = 0;
const marginVertical = 10;
const width = Dimensions.get('window').width / rows;
const height = 70;

interface Iitem {
  id: number | '';
  title: string | '';
}

interface Token {
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
  full_name: string;
  user_name: string;
  UserID: string;
  // whatever else is in the JWT.
}

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const NotificationScreen: React.FC<SettingProps> = ({
  navigation,
  baseAction,
}) => {
  const [tabId, setTabId] = useState<number>(1);
  const [userId, setUserId] = useState('');

  const [isOnReached, setIsOnReached] = useState<boolean>(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [numberPageIndex, setNumberPageIndex] = useState<number>(1);

  const [dataDetailNotifi, setDataDetailNotifi] = useState<INotification[]>([]);

  const [viewDetail, setViewDetailData] = useState<INotification>();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const insets = useSafeAreaInsets();

  const getUserData = async () => {
    const tokenData = await Storage.getItem('token');
    if (tokenData != '' && tokenData != null && tokenData != undefined) {
      const decodedToken = jwt_decode<Token>(JSON.parse(tokenData));
      setUserId(decodedToken.UserID);
    }
  };

  const getListNotification = async () => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiNotification.GET_LIST +
        userId +
        // '1f4ba45f-b37e-4aa4-b05f-348bde1b8020' +
        '?pageIndex=' +
        1 +
        '&pageSize=10',
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data: IDataNotifi = {
        items: dataResponse.data.items,
        pageIndex: dataResponse.data.pageIndex,
        pageSize: dataResponse.data.pageSize,
        totalCount: dataResponse.data.totalCount,
      };
      //setUpData(data.items)
      var dataConvert: INotification[] = [];
      for (var i = 0; i < data.items.length; i++) {
        dataConvert.push(JSON.parse(data.items[i].info));
      }
      setDataDetailNotifi(dataConvert);
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  };

  const handleLoadMore = async (numberIndex: number) => {
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiNotification.GET_LIST +
        userId +
        // '1f4ba45f-b37e-4aa4-b05f-348bde1b8020' +
        '?pageIndex=' +
        numberIndex +
        '&pageSize=10',
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data: IDataNotifi = {
        items: dataResponse.data.items,
        pageIndex: dataResponse.data.pageIndex,
        pageSize: dataResponse.data.pageSize,
        totalCount: dataResponse.data.totalCount,
      };
      if (data.items != null && data.items.length > 0) {
        setUpData(data.items);
        setNumberPageIndex(numberIndex);
      } else {
        setIsOnReached(true);
      }
    }
  };

  const setUpData = (data: IItemNotification[]) => {
    if (data != undefined) {
      var dataConvert: INotification[] = [];
      for (var i = 0; i < data.length; i++) {
        dataConvert.push(JSON.parse(data[i].info));
      }
      if (dataDetailNotifi.length > 0) {
        dataDetailNotifi.push(...dataConvert);
      }
    }
  };

  const renderItemNotifiCation = (item: INotification, index: number) => {
    if (item.Id != '') {
      return (
        <TouchableOpacity
          onPress={() => {
            setIsOpenModal(true);
            setViewDetailData(item);
            handleIsRead(item.Id, index);
            console.log(item);
          }}
          style={[
            {
              flexDirection: 'row',
              padding: 16,
              backgroundColor: item.IsRead == true ? '#fff' : '#E7F2FFB2',
              borderBottomWidth: 1,
              borderRadius: 12,
              borderColor: '#E7F2FFB2',
            },
          ]}>
          <View
            style={[
              {
                width: '20%',
                height: height,
              },
            ]}>
            <Image
              resizeMode="contain"
              style={{
                width: 60,
                height: height,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../images/notification/icon-notification.jpg')}
            />
          </View>

          <View
            style={[
              styles.boxContainer2,
              {
                height: height,
                width: '80%',
              },
            ]}>
            <Text
              style={[
                {
                  width: '100%',
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#001E31',
                  fontFamily: 'Mulish-Bold',
                  marginBottom: 5,
                },
              ]}>
              {item.Title}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                {
                  width: '100%',
                  fontSize: 13,
                  fontWeight: '400',
                  color: '#394856',
                  fontFamily: 'Mulish-SemiBold',
                  marginBottom: 5,
                  paddingRight: 16,
                },
              ]}>
              {/* {item.MessageContent} */}
              {renderContentNoti(
                  JSON.parse(item.JsonMessage),
                  item.BusinessType,
                )}
            </Text>

            <Text
              
              style={{
                fontSize: 12,
                width: '100%',
                color: '#137DB9',
                fontFamily: 'Mulish-SemiBold',
              }}>
              {moment(item.UpdateDate).format('HH:mm DD/MM')}
            </Text>
          </View>
          {item.IsRead == false ? (
            <Svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              style={{position: 'absolute', right: 10, top: 15}}>
              <G filter="url(#filter0_d_3081_9699)">
                <Circle cx="10" cy="6.19238" r="5" fill="#006496" />
              </G>
            </Svg>
          ) : null}
        </TouchableOpacity>
      );
    } else {
      return <></>;
    }
  };

  const renderContentNoti = (data: any, businessType: any) => {
    switch (businessType) {
      case typeBusiness.SendNotiApproval:
        break;
      case typeBusiness.SendReportRecordProduction:
        if (data != null) {
          let temp = data;
          return (
            temp.workcentername +
            ' sản xuất sản phẩm ' +
            temp.mainproductcode +
            ' ít hơn ngày hôm trước ' +
            (parseInt(temp.qtyold) - parseInt(temp.qtycurrent))
          );
        }
        break;
      case typeBusiness.SendNotiUpdateWorkorder:
        break;
      case typeBusiness.SendOutputRecordingWarning:
        break;
      case typeBusiness.SendMailDailyProductionProgress:
        break;
      case typeBusiness.WarningNotedOutputNoti:
        if (data != null) {
          let temp = data;
          let listWC = temp.map((item: any) => {
            return item.Workcentername;
          });
          let stringWC = listWC.join(', ');
          return 'Các tổ may chưa ghi nhận sản lượng hiện tại: ' + stringWC;
        }
        break;
      case typeBusiness.OuputBondWarning:
        if (data != null) {
          let temp = data;
          return (
            temp.workcentername +
            ' sản xuất sản phẩm ' +
            temp.mainproductcode +
            ' ít hơn 90% khoán'
          );
        }
        break;
      case typeBusiness.NotiWorkorderStatusChange:
        if (data != null) {
          let temp = data;
          return (
            'Lệnh sản xuất ' +
            temp.Workordercode +
            ' đã được thay đổi trạng thái' +
            (temp.Status == workOrderType.close
              ? ' hủy'
              : temp.Status == workOrderType.finish
              ? ' hoàn thành'
              : '')
          );
        }
        break;
      default:
        break;
    }
    return '';
  };

  const handleIsRead = async (itemId: string, index: number) => {
    if (dataDetailNotifi.length > 0) {
      dataDetailNotifi[index].IsRead = true;
    }
    let dataResponse = await CommonBase.postAsync<ResponseService>(
      ApiNotification.UPDATE_IS_READ + itemId + '/' + userId,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
    }
  };

  useEffect(() => {
    getUserData();
    getListNotification();
  }, []);

  useEffect(() => {
    getListNotification();
  }, [userId]);

  useEffect(() => {
    if (refreshing == true) {
      setNumberPageIndex(1);
      getListNotification();
    }
  }, [refreshing]);
  return (
    <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      <LinearGradient
        colors={['#003350', '#00598C']}
        style={[styles.linearGradient, {paddingTop: insets.top}]}>
        <MyTitleHome
          navigation={navigation}
          toggleDrawer={() => {
            //navigation.toggleDrawer()
          }}
          isShowIconLeft={false}
          component={null}
          title="Thông báo"
          hidenStatusBar={true}
          isShowIconRight={false}
        />
      </LinearGradient>
      {/* <View
        style={{
          margin: 0,
          paddingLeft: 10,
          paddingRight: 10,
          backgroundColor: '#FFFFFF',
        }}>
        <FlatList
          data={DATATAB}
          renderItem={({item, index, separators}) =>
            renderItemhorizontal(item, index)
          }
          keyExtractor={item => item.id.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </View> */}
      <View style={{flex: 1, paddingBottom: 30}}>
        {dataDetailNotifi && dataDetailNotifi.length > 0 ? (
          <FlatList
            data={dataDetailNotifi}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => renderItemNotifiCation(item, index)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={() => {
              handleLoadMore(numberPageIndex + 1);
            }}
            onEndReachedThreshold={0.4}
            onMomentumScrollBegin={() => {
              setIsOnReached(false);
            }}
            ListFooterComponent={() => {
              return !isOnReached ? (
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    height: 150,
                    paddingTop: 10,
                  }}>
                  <ActivityIndicator size="large" color="#006699" />
                </View>
              ) : null;
            }}
          />
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 15,
              alignContent: 'center',
              justifyContent: 'center',
              paddingTop: 50,
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
      {isOpenModal ? (
        <Modal
          isVisible={isOpenModal}
          statusBarTranslucent
          useNativeDriver
          onBackdropPress={() => setIsOpenModal(false)}
          deviceHeight={deviceHeight}
          deviceWidth={deviceWidth}>
          {viewDetail && viewDetail?.Id != '' ? (
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: 22,
              }}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '600',
                  color: '#001E31',
                }}>
                {viewDetail?.Title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  color: '#001E31',
                  marginTop: 8,
                  marginBottom: 12,
                }}>
                {'Thời gian: ' +
                  moment(viewDetail.UpdateDate).format('HH:mm DD/MM')}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Mulish-SemiBold',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  color: '#003350',
                }}>
                {'Nội dung: \n\n' +
                  renderContentNoti(
                    JSON.parse(viewDetail.JsonMessage),
                    viewDetail.BusinessType,
                  )}
              </Text>
            </View>
          ) : null}
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    padding: 10,
  },
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  sectionContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: marginVertical,
    marginBottom: marginVertical,
  },
  boxContainer1: {
    width: '15%',
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gold',
  },
  boxContainer2: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  boxContainer3: {
    width: '15%',
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gold',
  },
  title: {
    fontSize: 32,
    color: 'red',
  },
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  baseAction: bindActionCreators(baseAction, dispatch),
});
export default connect(null, mapDispatchToProps)(NotificationScreen);
