import { CommonActions, NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View, Image, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import Modal from "react-native-modal";
import { Action, AnyAction, bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import loginAction from '../../../login/saga/loginAction';
import CommonBase from '../../../share/network/axios';
import Storage from '../../../share/storage/storage';
import { ResponseDataService } from '../../../share/network/typeNetwork';
import jwt_decode from 'jwt-decode';
import { NavigateHome } from '../../../share/app/constants/homeConst';
import PopUpBase from '../../../share/base/component/popUp/popUpBase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MyTitleHome from '../../../share/base/component/myStatusBar/MyTitleHome';
import { Circle, Path, Svg } from 'react-native-svg';
// import DatePicker from '@ant-design/react-native/lib/date-picker';

// import List from '@ant-design/react-native/lib/list';
// import Provider from '@ant-design/react-native/lib/provider';
// import DatePickerView from '@ant-design/react-native/lib/date-picker-view'

//import DatePick from './datePicker'

const dimension = Dimensions.get('window');

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

export interface SettingProps {
    navigation: NavigationProp<any, any>,
    loginAction: typeof loginAction;
};



// const Stack = createNativeStackNavigator();

const rows = 3;
const cols = 3;
const marginHorizontal = 0;
const marginVertical = 10;
const width = (Dimensions.get('window').width / cols) - (marginHorizontal * (cols + 1));
const height = 110;


interface UpTokenData {
    userId: string | '',
    TokenMobile: string | null | undefined
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
    // whatever else is in the JWT.
}

const Setting: React.FC<SettingProps> = ({ navigation, loginAction }) => {
    const insets = useSafeAreaInsets();
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [data, setData] = useState<any>();
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, []);
    const getUserData = async () => {
        const tokenData = await Storage.getItem('token');
        if (tokenData != "" && tokenData != null && tokenData != undefined) {
            const decodedToken = jwt_decode<Token>(JSON.parse(tokenData));
            setFullName(decodedToken.full_name)
            setUserName(decodedToken.user_name)
        }
    }

    const onPressCloseModal = () => {
        setIsOpenModal(false)
    }

    const logout = async () => {
        await Storage.removeItem('evomes_token_info');
        await Storage.removeItem('userLogin');
        const tokenData = await Storage.getItem('token');
        if (tokenData != "" && tokenData != null && tokenData != undefined) {
            const decodedToken = jwt_decode<Token>(JSON.parse(tokenData));
            const userId = decodedToken.sub;
            deleteToken(userId);
        }
        loginAction.logoutUnAuthenReducer();
        setIsOpenModal(false)
        // navigation.dispatch(
        //     CommonActions.reset({
        //         index: 0,
        //         routes: [{ name: (NavigateHome.HomePageScreen) }],
        //     })
        // )

    }

    const deleteToken = async (userId: string) => {
        const fcmToken = await Storage.getItem('fcmtoken')
        //#region custom token string
        let removeFirstCharacter = fcmToken?.replace("\"", "")
        let finalToken = removeFirstCharacter?.replace("\"", "")
        //#endregion
        let uploadTokendata: UpTokenData = {
            userId: userId,
            TokenMobile: '',
        }
        let uploadTokenMobileRes = await CommonBase.postAsync<ResponseDataService>('/api/identity/mobi/update-device-mobile-token-by-userId', uploadTokendata)

        if (uploadTokenMobileRes != undefined && typeof uploadTokenMobileRes !== 'string' && uploadTokenMobileRes != null && uploadTokenMobileRes.isSuccess == true) {

        }
    }
    useEffect(() => {
        getUserData()
    }, []);

    return (
        <View style={[styles.container]} >
            <LinearGradient
                colors={['#003350', '#00598C']} style={[styles.linearGradient, { paddingTop: insets.top }]}>

                <MyTitleHome
                    navigation={navigation}
                    toggleDrawer={() => {
                        //navigation.toggleDrawer()
                    }}
                    isShowIconLeft={false}
                    component={null}
                    title="Thông tin cá nhân"
                    hidenStatusBar={true}
                    isShowIconRight={false}
                />
            </LinearGradient>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={[styles.item, { flexDirection: 'row' }]}>

                    <View style={{ width: '30%' }}>
                        <Image
                            style={styles.image}
                            source={require('../../../../images/setting/avatar.png')}
                            resizeMode={"contain"} // <- needs to be "cover" for borderRadius to take effect on Android
                        />
                        {/* <View style={styles.image}></View> */}
                    </View>
                    <View style={{ width: '70%', paddingLeft: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#001E31', fontFamily: 'Mulish-Bold' }}>{fullName}</Text>
                        <Text style={{ fontSize: 16, color: '#001E31', fontWeight: '600', fontFamily: 'Mulish-Bold' }}>{userName}</Text>
                    </View>

                </View>

                <TouchableOpacity style={[styles.item, { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#C6C6C9', marginTop: 15 }]}>
                    {/* <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path id="Exclude" fill-rule="evenodd" clip-rule="evenodd" d="M8.38333 16.711C7.275 17.1287 6.225 17.6875 5.23333 18.3875C4.45556 17.5903 3.83333 16.6519 3.36667 15.5723C2.9 14.4936 2.66667 13.3028 2.66667 12C2.66667 9.41389 3.57589 7.21161 5.39433 5.39317C7.212 3.5755 9.41389 2.66667 12 2.66667C14.5861 2.66667 16.7884 3.5755 18.6068 5.39317C20.4245 7.21161 21.3333 9.41389 21.3333 12C21.3333 13.3028 21.1 14.4936 20.6333 15.5723C20.1667 16.6519 19.5444 17.5903 18.7667 18.3875C17.775 17.6875 16.725 17.1287 15.6167 16.711C14.5083 16.2926 13.3028 16.0833 12 16.0833C10.6972 16.0833 9.49167 16.2926 8.38333 16.711ZM9.50683 11.5765C10.1773 12.2477 11.0083 12.5833 12 12.5833C12.9917 12.5833 13.8227 12.2477 14.4932 11.5765C15.1644 10.9061 15.5 10.075 15.5 9.08333C15.5 8.09167 15.1644 7.26022 14.4932 6.589C13.8227 5.91856 12.9917 5.58333 12 5.58333C11.0083 5.58333 10.1773 5.91856 9.50683 6.589C8.83561 7.26022 8.5 8.09167 8.5 9.08333C8.5 10.075 8.83561 10.9061 9.50683 11.5765ZM7.8875 21.6833C9.17083 22.2278 10.5417 22.5 12 22.5C13.4583 22.5 14.8292 22.2278 16.1125 21.6833C17.3958 21.1389 18.5092 20.3953 19.4527 19.4527C20.3953 18.5092 21.1389 17.3958 21.6833 16.1125C22.2278 14.8292 22.5 13.4583 22.5 12C22.5 10.5417 22.2278 9.17083 21.6833 7.8875C21.1389 6.60417 20.3953 5.49078 19.4527 4.54733C18.5092 3.60467 17.3958 2.86111 16.1125 2.31667C14.8292 1.77222 13.4583 1.5 12 1.5C10.5417 1.5 9.17083 1.77222 7.8875 2.31667C6.60417 2.86111 5.49117 3.60467 4.5485 4.54733C3.60506 5.49078 2.86111 6.60417 2.31667 7.8875C1.77222 9.17083 1.5 10.5417 1.5 12C1.5 13.4583 1.77222 14.8292 2.31667 16.1125C2.86111 17.3958 3.60506 18.5092 4.5485 19.4527C5.49117 20.3953 6.60417 21.1389 7.8875 21.6833ZM12 21.625C17.3157 21.625 21.625 17.3157 21.625 12C21.625 6.68426 17.3157 2.375 12 2.375C6.68426 2.375 2.375 6.68426 2.375 12C2.375 17.3157 6.68426 21.625 12 21.625Z"
                            fill="#004B72" />
                    </Svg> */}
                    <Image
                        style={{ width: 24, height: 24, marginLeft: 0 }}
                        source={require('../../../../images/setting/info.png')}
                        resizeMode={"contain"} // <- needs to be "cover" for borderRadius to take effect on Android
                    />

                    <Text style={{ color: '#001E31', fontSize: 16, fontWeight: '400', paddingLeft: 15, fontFamily: 'Mulish-Bold' }}>Thông tin cá nhân</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.item, { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#C6C6C9' }]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Circle id="Ellipse 1912" cx="12" cy="12" r="9.5" fill="#004B72" stroke="#004B72" />
                        <Path id="Vector" d="M12 20.5C10.8368 20.5 9.73691 20.2763 8.70021 19.8289C7.66411 19.3816 6.76191 18.7738 5.99363 18.0055C5.22595 17.2378 4.61842 16.3359 4.17105 15.2998C3.72368 14.2631 3.5 13.1632 3.5 12C3.5 10.8219 3.72368 9.71842 4.17105 8.68947C4.61842 7.66053 5.22595 6.76191 5.99363 5.99363C6.76191 5.22595 7.66411 4.61842 8.70021 4.17105C9.73691 3.72368 10.8368 3.5 12 3.5C13.1781 3.5 14.2816 3.72368 15.3105 4.17105C16.3395 4.61842 17.2378 5.22595 18.0055 5.99363C18.7738 6.76191 19.3816 7.66053 19.8289 8.68947C20.2763 9.71842 20.5 10.8219 20.5 12C20.5 13.1632 20.2763 14.2631 19.8289 15.2998C19.3816 16.3359 18.7738 17.2378 18.0055 18.0055C17.2378 18.7738 16.3395 19.3816 15.3105 19.8289C14.2816 20.2763 13.1781 20.5 12 20.5ZM12 19.1355C12.4623 18.539 12.8464 17.9315 13.1524 17.3129C13.4578 16.6938 13.7149 16.0189 13.9237 15.2882H10.0763C10.2851 16.0338 10.5425 16.7159 10.8485 17.3344C11.1539 17.9536 11.5377 18.5539 12 19.1355ZM10.2776 18.8895C9.93465 18.3974 9.62537 17.8382 9.34979 17.2118C9.07361 16.5855 8.86096 15.9443 8.71184 15.2882H5.66974C6.14693 16.2127 6.7807 16.992 7.57105 17.6261C8.3614 18.2596 9.2636 18.6807 10.2776 18.8895ZM13.7224 18.8895C14.7364 18.6807 15.6386 18.2596 16.4289 17.6261C17.2193 16.992 17.8531 16.2127 18.3303 15.2882H15.2882C15.1092 15.9443 14.8855 16.5891 14.6171 17.2226C14.3487 17.8566 14.0504 18.4123 13.7224 18.8895ZM5.11053 13.9461H8.44342C8.38377 13.618 8.33904 13.2935 8.30921 12.9726C8.27939 12.6523 8.26447 12.3281 8.26447 12C8.26447 11.6719 8.27939 11.3474 8.30921 11.0265C8.33904 10.7062 8.38377 10.382 8.44342 10.0539H5.11053C5.02105 10.3522 4.95395 10.6654 4.90921 10.9934C4.86447 11.3215 4.84211 11.657 4.84211 12C4.84211 12.343 4.86447 12.6785 4.90921 13.0066C4.95395 13.3346 5.02105 13.6478 5.11053 13.9461ZM9.78553 13.9461H14.2145C14.2741 13.618 14.3189 13.2974 14.3487 12.9842C14.3785 12.6711 14.3934 12.343 14.3934 12C14.3934 11.657 14.3785 11.3289 14.3487 11.0158C14.3189 10.7026 14.2741 10.382 14.2145 10.0539H9.78553C9.72588 10.382 9.68114 10.7026 9.65132 11.0158C9.62149 11.3289 9.60658 11.657 9.60658 12C9.60658 12.343 9.62149 12.6711 9.65132 12.9842C9.68114 13.2974 9.72588 13.618 9.78553 13.9461ZM15.5566 13.9461H18.8895C18.9789 13.6478 19.0461 13.3346 19.0908 13.0066C19.1355 12.6785 19.1579 12.343 19.1579 12C19.1579 11.657 19.1355 11.3215 19.0908 10.9934C19.0461 10.6654 18.9789 10.3522 18.8895 10.0539H15.5566C15.6162 10.382 15.661 10.7062 15.6908 11.0265C15.7206 11.3474 15.7355 11.6719 15.7355 12C15.7355 12.3281 15.7206 12.6523 15.6908 12.9726C15.661 13.2935 15.6162 13.618 15.5566 13.9461ZM15.2882 8.71184H18.3303C17.8531 7.77237 17.2232 6.99305 16.4406 6.37389C15.6574 5.75533 14.7513 5.32675 13.7224 5.08816C14.0654 5.61009 14.3711 6.18033 14.6395 6.79889C14.9079 7.41805 15.1241 8.0557 15.2882 8.71184ZM10.0763 8.71184H13.9237C13.7149 7.96623 13.4504 7.27639 13.1301 6.64232C12.8091 6.00884 12.4325 5.41623 12 4.86447C11.5675 5.41623 11.1912 6.00884 10.8708 6.64232C10.5499 7.27639 10.2851 7.96623 10.0763 8.71184ZM5.66974 8.71184H8.71184C8.87588 8.0557 9.09211 7.41805 9.36053 6.79889C9.62895 6.18033 9.93465 5.61009 10.2776 5.08816C9.23377 5.32675 8.32412 5.75533 7.54868 6.37389C6.77325 6.99305 6.14693 7.77237 5.66974 8.71184Z"
                            fill="white" />
                    </Svg>

                    <Text style={{ color: '#001E31', fontSize: 16, fontWeight: '400', paddingLeft: 15, fontFamily: 'Mulish-Bold' }}>Ngôn ngữ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { setIsOpenModal(true) }}
                    style={[styles.item, { flexDirection: 'row' }]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path id="Vector" d="M15.7139 15.1522C15.5677 14.9899 15.4947 14.8113 15.4947 14.6164C15.4947 14.4216 15.5677 14.2511 15.7139 14.105L17.5647 12.2542H10.1126C9.90157 12.2542 9.72721 12.185 9.58953 12.0467C9.4512 11.909 9.38204 11.7347 9.38204 11.5236C9.38204 11.3125 9.4512 11.1378 9.58953 10.9995C9.72721 10.8618 9.90157 10.793 10.1126 10.793H17.5647L15.7139 8.91781C15.5677 8.77169 15.4947 8.60122 15.4947 8.40639C15.4947 8.21157 15.5677 8.0411 15.7139 7.89498C15.86 7.74886 16.0304 7.6758 16.2253 7.6758C16.4201 7.6758 16.5824 7.74074 16.7123 7.87062L19.7565 10.9148C19.8376 10.9959 19.8987 11.0891 19.9396 11.1943C19.9799 11.3002 20 11.4099 20 11.5236C20 11.6372 19.9799 11.7467 19.9396 11.8519C19.8987 11.9577 19.8376 12.0512 19.7565 12.1324L16.7123 15.1766C16.5662 15.3389 16.4 15.412 16.2136 15.3957C16.0265 15.3795 15.86 15.2983 15.7139 15.1522ZM5.75342 20.0472C5.26636 20.0472 4.85236 19.8767 4.51142 19.5358C4.17047 19.1948 4 18.7808 4 18.2938V4.75343C4 4.26636 4.17047 3.85236 4.51142 3.51142C4.85236 3.17047 5.26636 3 5.75342 3H11.5738C11.7686 3 11.9391 3.06884 12.0852 3.20651C12.2314 3.34484 12.3044 3.51953 12.3044 3.73059C12.3044 3.94165 12.2314 4.11602 12.0852 4.2537C11.9391 4.39202 11.7686 4.46119 11.5738 4.46119H5.75342C5.68848 4.46119 5.62354 4.49366 5.5586 4.5586C5.49366 4.62354 5.46119 4.68848 5.46119 4.75343V18.2938C5.46119 18.3587 5.49366 18.4236 5.5586 18.4886C5.62354 18.5535 5.68848 18.586 5.75342 18.586H11.5738C11.7686 18.586 11.9391 18.6548 12.0852 18.7925C12.2314 18.9308 12.3044 19.1055 12.3044 19.3166C12.3044 19.5277 12.2314 19.7023 12.0852 19.8407C11.9391 19.9783 11.7686 20.0472 11.5738 20.0472H5.75342Z"
                            fill="#DE372F" />
                    </Svg>

                    <Text style={{ color: '#001E31', fontSize: 16, fontWeight: '400', paddingLeft: 15, fontFamily: 'Mulish-Bold' }}>Đăng xuất</Text>
                </TouchableOpacity>
            </ScrollView>

            {
                isOpenModal ? (
                    <Modal
                        isVisible={isOpenModal}
                        //style={{ backgroundColor: '#ffffff', margin: 0 }}
                        onBackdropPress={() => setIsOpenModal(false)}
                        statusBarTranslucent={false}
                        deviceHeight={deviceHeight}
                        deviceWidth={deviceWidth}
                    >
                        <PopUpBase
                            title={'Thông báo'}
                            content={'Bạn có chắc chắn muốn đăng xuất ?'}
                            handleClose={onPressCloseModal}
                            handleConfirm={logout}
                        />
                    </Modal>
                )
                    : null
            }
        </View>
    );
}
const styles = StyleSheet.create({
    linearGradient: {
        //flex: 1,
        padding: 10,
        // paddingTop: insets.top,
        // margin: 0,
        // width: '100%',
        // height: '100%'
    },
    container: {
        flex: 1,
        backgroundColor: '#fcfcff',
    },
    item: {
        width: '100%',
        backgroundColor: '#ffffff',
        padding: 10,
        paddingTop: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    image: {
        width: 100,
        height: 100,
        borderColor: '#dddddd',
        borderWidth: 5,
        borderRadius: 75
    }

});


const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
    loginAction: bindActionCreators(loginAction, dispatch),
});
// const mapStateToProps = createStructuredSelector({
//     isAuthSelector
// });
export default connect(
    null,
    mapDispatchToProps
)(Setting);

