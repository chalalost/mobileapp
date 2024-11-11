import { NavigationProp } from '@react-navigation/native';
import {
    Dimensions,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text, TouchableOpacity, View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HeightTitleApp } from '../../../app/constants/constansHeightApp';

const deviceWidth = Dimensions.get('screen').width;

type AppBarTitleProps = {
    navigation: NavigationProp<any, any>
    toggleDrawer: Function
    component: JSX.Element | null

    isShowIconRight: boolean | false
    isShowIconLeft: boolean | false
    title: string,
    hidenStatusBar: boolean | true
}

const MyTitleHome = ({ navigation, toggleDrawer, component, title, hidenStatusBar, isShowIconRight, isShowIconLeft }: AppBarTitleProps) => {
    return (
        <View style={styles.container}>
            {
                component ?
                    component
                    :
                    <View style={styles.appBarTitle}>
                        {
                            isShowIconLeft ?
                                <TouchableOpacity onPress={() => {
                                    toggleDrawer()
                                }} style={{ width: 50, justifyContent: 'center', alignItems: 'flex-start' }}
                                >

                                    <Svg width="25" height="25" fill="#ffffff" viewBox="0 0 16 16">
                                        <Path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                                    </Svg>

                                </TouchableOpacity>
                                :
                                null
                        }
                        <View style={{ width: deviceWidth - 50 - 50 - 30, justifyContent: 'center' }}>
                            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16, fontFamily: 'Mulish-Bold', }}>{title}</Text>
                        </View>
                        {
                            isShowIconRight ?
                                <TouchableOpacity onPress={() => {
                                    // setIsOpenModal(false);
                                    // handleSetModal(false)
                                    navigation.navigate('HomePageScreen')
                                }} style={{ width: 50, justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Svg width="24" height="24" viewBox="0 0 28 28" fill="none" >
                                        <Path d="M5.25 23.9162V10.8206L14 4.22937L22.75 10.8206V23.9162H15.6632V16.3632H12.3088V23.9162H5.25Z"
                                            fill={'#FFFFFF'} />
                                    </Svg>
                                </TouchableOpacity>
                                :
                                null
                        }
                    </View>
            }
        </View>
    );
}


const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? HeightTitleApp.Ios : HeightTitleApp.Android;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        paddingTop: 0,
    },
    statusBar: {
        height: 0,
    },
    appBarTitle: {
        // backgroundColor: '#003350',
        //height: APPBAR_HEIGHT,
        height: 40,
        flexDirection: 'row',

        // paddingTop: 10,
        // paddingLeft: 15,
        // paddingRight: 15,
        // paddingBottom: 10,
        // borderTopWidth: 0.5,
        // borderTopColor: '#dddddd',

    },

});


export default MyTitleHome;

