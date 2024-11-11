import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationProp} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';
import {connect} from 'react-redux';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import {createStructuredSelector} from 'reselect';
import baseAction from '../../base/saga/action';
import {listMenuChild} from '../../base/saga/selectors';
import {IMenu} from '../../base/typeBase/type';
import {NavigateHome} from '../../share/app/constants/homeConst';
import ReportWorkerBeginScreen from './navigate/beginOfTheDay/reportWorkerBeginScreen';
import HomeScreen from './navigate/home/home';
import HomeAction from './navigate/home/saga/homeAction';
import {
  getDataHomeSelector,
  getErrorSelector,
  getStatusSelector,
} from './navigate/home/saga/homeSelectors';
import ProductionRecordScreen from './navigate/productionRecord/productionRecordScreen';

import DeliveryForWashScreen from './navigate/deliveryForWash/deliveryForWash';
import DeliveryIntoHTWareHouseScreen from './navigate/deliveryIntoHTWareHouse/deliveryIntoHTWareHouse';
import DeliverySemiFinishProductScreen from './navigate/deliverySemiFinishProduct/deliverySemiFinishProduct';
import ReceiveAfterWashScreen from './navigate/receiveAfterWash/receiveAfterWash';

import ProductionRecordWareHouseHTScreen from './navigate/productionRecordWareHouseHT/productionRecordHTScreen';
import HistoryQualityCheckScreen from './navigate/qualityControl/HistoryQualityCheckScreen';
import QAScreen from './navigate/qualityControl/QAScreen';
import QCScreen from './navigate/qualityControl/QCScreen';

const Drawer = createDrawerNavigator();

// khai bao kieu cua props
type HomeProps = {
  baseAction: typeof baseAction;
  navigation: NavigationProp<any, any>;
  listMenuChild: IMenu[] | [];
};

const HomeMain: React.FC<HomeProps> = ({
  navigation,
  listMenuChild,
  baseAction,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // navigation.dispatch(
      //     CommonActions.reset({
      //         index: 0,
      //         routes: [{ name: (NavigateHome.HomePageScreen) }],
      //     })
      // )
      navigation.navigate(NavigateHome.HomePageScreen);
    });
    return unsubscribe;
  }, [navigation]);

  return listMenuChild.length > 0 ? (
    <Drawer.Navigator
      screenListeners={({navigation}) => ({
        state: (e: any) => {
          let stateNavigator = e.data.state;
          let ScreenName = stateNavigator?.routeNames[stateNavigator.index];
          // Alert.alert(ScreenName)
          baseAction.onPressMenu({ScreenName: ScreenName, Type: 2});

          // Do something with the `navigation` object
          if (!navigation.canGoBack()) {
          }
        },
      })}
      // useLegacyImplementation
      screenOptions={{
        headerShown: false,
        //headerStyle: { backgroundColor: '', height: HeightNavigatorTitle.Height },
        headerTintColor: 'red',
        drawerInactiveTintColor: '#FFFFFF',
        drawerActiveTintColor: '#004B72',
        drawerActiveBackgroundColor: '#E0EEFA',
        drawerLabelStyle: {
          fontFamily: 'Mulish-Bold',
        },
        drawerStyle: {
          backgroundColor: '#01446B',
          paddingBottom: 22,
        },
      }}
      initialRouteName={NavigateHome.HomePageScreen}>
      {listMenuChild.findIndex(
        x => x.MenuTitle == NavigateHome.HomePageScreen,
      ) != -1 ? (
        <Drawer.Screen
          name={NavigateHome.HomePageScreen}
          component={HomeScreen}
          options={{
            // headerShown: true,
            title: 'Trang chủ',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(
        x => x.MenuTitle == NavigateHome.BeginOfTheDayPageScreen,
      ) != -1 ? (
        <Drawer.Screen
          name={NavigateHome.BeginOfTheDayPageScreen}
          component={ReportWorkerBeginScreen}
          options={{
            title: 'Báo số lao động đầu ngày',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(
        x => x.MenuTitle == NavigateHome.DeliverySemiFinishProductScreen,
      ) != -1 ? (
        <Drawer.Screen
          name={NavigateHome.DeliverySemiFinishProductScreen}
          component={DeliverySemiFinishProductScreen}
          options={{
            title: 'Giao nhận BTP',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(
        x => x.MenuTitle == NavigateHome.ProductionRecordPageScreen,
      ) != -1 ? (
        <Drawer.Screen
          name={NavigateHome.ProductionRecordPageScreen}
          component={ProductionRecordScreen}
          options={{
            headerShown: false,
            title: 'Ghi nhận sản lượng may',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(
        x => x.MenuTitle == NavigateHome.RecordWareHouseHTScreen,
      ) != -1 ? (
        <Drawer.Screen
          name={NavigateHome.RecordWareHouseHTScreen}
          component={ProductionRecordWareHouseHTScreen}
          options={{
            headerShown: false,
            title: 'Ghi nhận sản lượng hoàn thiện',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(
        x => x.MenuTitle == NavigateHome.DeliveryForWashScreen,
      ) != -1 ? (
        <Drawer.Screen
          name={NavigateHome.DeliveryForWashScreen}
          component={DeliveryForWashScreen}
          options={{
            title: 'Giao hàng đi giặt',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(
        x => x.MenuTitle == NavigateHome.ReceiveAfterWashScreen,
      ) != -1 ? (
        <Drawer.Screen
          name={NavigateHome.ReceiveAfterWashScreen}
          component={ReceiveAfterWashScreen}
          options={{
            title: 'Nhận hàng về sau giặt',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(
        x => x.MenuTitle == NavigateHome.DeliveryIntoHTWareHouseScreen,
      ) != -1 ? (
        <Drawer.Screen
          name={NavigateHome.DeliveryIntoHTWareHouseScreen}
          component={DeliveryIntoHTWareHouseScreen}
          options={{
            title: 'Giao nhận vào kho HT',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(x => x.MenuTitle == NavigateHome.QCScreen) !=
      -1 ? (
        <Drawer.Screen
          name={NavigateHome.QCScreen}
          component={QCScreen}
          options={{
            title: 'Kiểm tra chất lượng QC',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(x => x.MenuTitle == NavigateHome.QAScreen) !=
      -1 ? (
        <Drawer.Screen
          name={NavigateHome.QAScreen}
          component={QAScreen}
          options={{
            title: 'Kiểm tra chất lượng QA',
          }}
        />
      ) : null}

      {listMenuChild.findIndex(
        x => x.MenuTitle == NavigateHome.HistoryQualityCheckScreen,
      ) != -1 ? (
        <Drawer.Screen
          name={NavigateHome.HistoryQualityCheckScreen}
          component={HistoryQualityCheckScreen}
          options={{
            title: 'Lịch sử kiểm tra chất lượng',
          }}
        />
      ) : null}
    </Drawer.Navigator>
  ) : (
    <Drawer.Navigator
      // useLegacyImplementation
      screenOptions={{
        headerShown: false,
        //headerStyle: { backgroundColor: '', height: HeightNavigatorTitle.Height },
        headerTintColor: 'red',
        drawerInactiveTintColor: '#FFFFFF',
        drawerActiveTintColor: '#004B72',
        drawerActiveBackgroundColor: '#E0EEFA',
        drawerLabelStyle: {
          fontFamily: 'Mulish-Bold',
        },
        drawerStyle: {
          backgroundColor: '#003350',
          paddingBottom: 22,
        },
      }}
      initialRouteName={NavigateHome.HomePageScreen}>
      <Drawer.Screen
        name={NavigateHome.HomePageScreen}
        component={HomeScreen}
        options={{
          // headerShown: true,
          title: 'Trang chủ',
        }}
      />
    </Drawer.Navigator>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  HomeAction: bindActionCreators(HomeAction, dispatch),
  baseAction: bindActionCreators(baseAction, dispatch),
});
const mapStateToProps = createStructuredSelector({
  getDataHomeSelector,
  getStatusSelector,
  getErrorSelector,
  listMenuChild,
});
export default connect(mapStateToProps, mapDispatchToProps)(HomeMain);
