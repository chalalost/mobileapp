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
import LinearGradient from 'react-native-linear-gradient';

const deviceWidth = Dimensions.get('screen').width;


const MyStatusBar = ({ backgroundColor, ...props }: any) => (
    <View style={[styles.statusBar]}>
        <SafeAreaView>
            {/* <StatusBar translucent showHideTransition={true} backgroundColor={backgroundColor} {...props} /> */}

            <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                colors={['#003350', '#00598C']} style={{
                    flex: 1,
                    // height: Platform.OS == 'ios' ? 100 : 90,
                    // padding: 10,
                    // paddingTop: Platform.OS == 'ios' ? 47 : 40
                }}>
                <StatusBar translucent showHideTransition={true} barStyle="light-content"
                    backgroundColor="transparent" {...props} />
            </LinearGradient>
        </SafeAreaView >
    </View >
);

type AppBarTitleProps = {
    navigation: NavigationProp<any, any>
    setIsOpenModal: Function
    handleSetModal: Function
    component: JSX.Element | null
    title: string
    hidenStatusBar: boolean | true
}

const AppBarTitle = ({ navigation, setIsOpenModal, handleSetModal, component, title, hidenStatusBar }: AppBarTitleProps) => {
    return (
        <View style={styles.container}>
            {
                hidenStatusBar === true ?
                    null
                    :
                    <LinearGradient
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        colors={['#003350', '#00598C']} style={{
                            flex: 1,
                            //height: Platform.OS == 'ios' ? 80 : 90,
                            //padding: 10,
                            paddingTop: Platform.OS == 'ios' ? 47 : 0
                        }}>
                        <MyStatusBar backgroundColor="transparent" barStyle="light-content" />
                    </LinearGradient>
            }

            {
                component ?
                    component
                    :
                    <View style={styles.appBarTitle}>
                        <TouchableOpacity onPress={() => {
                            setIsOpenModal(false)
                            handleSetModal(false)
                        }} style={{ width: 50, justifyContent: 'center', alignItems: 'flex-start' }}
                        >
                            <Svg width="9" height="17" viewBox="0 0 9 17" fill="none">
                                <Path d="M8.5303 0.411989C8.8232 0.704879 8.8232 1.17976 8.5303 1.47265L1.81066 8.19232L8.5303 14.912C8.8232 15.2049 8.8232 15.6797 8.5303 15.9726C8.2374 16.2655 7.7626 16.2655 7.4697 15.9726L0.219668 8.72262C-0.0732225 8.42972 -0.0732225 7.95492 0.219668 7.66202L7.4697 0.411989C7.7626 0.119099 8.2374 0.119099 8.5303 0.411989Z" fill="white" />
                            </Svg>
                        </TouchableOpacity>

                        <View style={{ width: deviceWidth - 50 - 50 - 30, justifyContent: 'center' }}>
                            <Text style={{
                                color: '#ffffff',
                                fontWeight: '600',
                                fontSize: 16,
                                fontFamily: 'Mulish-SemiBold'
                            }}>{title}</Text>
                        </View>

                        <TouchableOpacity onPress={() => {
                            setIsOpenModal(false);
                            handleSetModal(false)
                            navigation.navigate('HomePageScreen')
                        }} style={{ width: 50, justifyContent: 'center', alignItems: 'flex-end' }}>
                            <Svg width="24" height="24" viewBox="0 0 28 28" fill="none" >
                                <Path d="M5.25 23.9162V10.8206L14 4.22937L22.75 10.8206V23.9162H15.6632V16.3632H12.3088V23.9162H5.25Z"
                                    fill={'#FFFFFF'} />
                            </Svg>
                        </TouchableOpacity>
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
        top: 0,
    },
    statusBar: {
        // height: 10,
    },
    appBarTitle: {
        backgroundColor: '#01446B',
        height: APPBAR_HEIGHT,
        flexDirection: 'row',
        // paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
        // paddingBottom: 10,
        // borderTopWidth: 0.5,
        // borderTopColor: '#dddddd',

    },

});


export { AppBarTitle, MyStatusBar };

