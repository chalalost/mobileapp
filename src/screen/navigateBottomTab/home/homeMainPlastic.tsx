import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationProp} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {Action, AnyAction, Dispatch, bindActionCreators} from 'redux';
import {createStructuredSelector} from 'reselect';
import baseAction from '../../base/saga/action';
import {listMenuChild} from '../../base/saga/selectors';
import {IMenu} from '../../base/typeBase/type';
import {NavigateHome} from '../../share/app/constants/homeConst';
import HomeScreen from './navigate/home/home';
import HomeAction from './navigate/home/saga/homeAction';
import {
  getDataHomeSelector,
  getErrorSelector,
  getStatusSelector,
} from './navigate/home/saga/homeSelectors';
import ProductionMoldingRecordScreen from './navigate/productionMoldingRecord/productionMoldingRecordScreen';

const Drawer = createDrawerNavigator();

// khai bao kieu cua props
type HomePlasticProps = {
  baseAction: typeof baseAction;
  navigation: NavigationProp<any, any>;
  listMenuChild: IMenu[] | [];
};

const HomeMainPlasticScreen: React.FC<HomePlasticProps> = ({
  baseAction,
  navigation,
  listMenuChild,
}) => {
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

      <Drawer.Screen
        name={NavigateHome.ProductionMoldingRecordScreen}
        component={ProductionMoldingRecordScreen}
        options={{
          title: 'Ghi nhận sản lượng đúc',
        }}
      />

      {/* {listMenuChild.findIndex(
          x => x.MenuTitle == NavigateHome.HistoryQualityCheckScreen,
        ) != -1 ? (
          <Drawer.Screen
            name={NavigateHome.HistoryQualityCheckScreen}
            component={HistoryQualityCheckScreen}
            options={{
              title: 'Lịch sử kiểm tra chất lượng',
            }}
          />
        ) : null} */}
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
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeMainPlasticScreen);
