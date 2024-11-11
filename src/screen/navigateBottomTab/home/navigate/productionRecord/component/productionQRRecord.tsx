import { CommonActions, NavigationProp } from '@react-navigation/native';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { connect } from 'react-redux';
import { Action, AnyAction, bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import { ResponseService } from '../../../../../share/app/constantsApi';
import CommonBase from '../../../../../share/network/axios';
import { dataPageRecordSX, userScan } from '../saga/productionRecordSelectors';
import productionRecordAction from './../saga/productionRecordAction';
import { IDataPageRecordInput, IUserScan, IUserDropdown } from './../types/productionRecordTypes';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

export interface QRRecordScreenProps {
    navigation: NavigationProp<any, any>,
    dataPageRecordSX: IDataPageRecordInput,
    productionRecordAction: typeof productionRecordAction,

};

const QRRecordScreen = ({ navigation, dataPageRecordSX, productionRecordAction }: QRRecordScreenProps) => {
    const [isScan, setScan] = useState<boolean>(false);
    const refCam = useRef(null);


    const onSuccess = (e: any) => {
        let stringUser = e?.data;

        if (stringUser != undefined && stringUser != null && stringUser != '') {
            let infoUserArr = e.data.split("-evokey-");
            let userInfo: IUserScan = {
                id: infoUserArr[0],
                name: infoUserArr[1],
                code: infoUserArr[2]
            }
            productionRecordAction.setUserScan(userInfo);
        }

        setScan(false)
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'SubmitScreen' }],
            })
        );
    }

    const onPressHandleClose = () => {
        setScan(false)
        navigation.dispatch(
            CommonActions.reset({
                index: 4,
                routes: [{ name: 'InputScreen' }],
            })
        );
    }

    const onPressHandleManual = async () => {
        setScan(false)
        navigation.navigate('SubmitScreen')
        let msg = 'Chọn tên nhân viên và công đoạn !'
        if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.LONG)
        } else {
            Alert.alert(msg)
        }
        setTimeout(() => {
        }, 2000);
    }
    useEffect(() => {
        setScan(true);
    }, [isScan]);

    return (
        <View style={styles.container}>
            {isScan &&
                <Fragment>
                    <QRCodeScanner cameraStyle={styles.camera}
                        reactivate={true}
                        showMarker={true}
                        ref={refCam}
                        onRead={onSuccess}
                    />
                    <View style={styles.submit}>
                        <View style={{ height: 40, width: '30%', paddingRight: 20 }}>
                            <TouchableOpacity style={styles.delinceButton} onPress={onPressHandleClose} >
                                <View>
                                    <Text style={{ color: '#003350' }}>Hủy </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 40, width: '30%' }}>
                            <TouchableOpacity style={styles.submitButton} onPress={onPressHandleManual}>
                                <View>
                                    <Text style={{ color: '#ffffff' }}>Chọn tay</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Fragment>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
        flexDirection: 'column'
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '10%',
    },
    submitButton: {
        alignItems: 'center',
        backgroundColor: '#004B72',
        height: 35,
        justifyContent: 'center'
    },
    delinceButton: {
        alignItems: 'center',
        backgroundColor: '#ffffff',
        height: 35,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#137DB9'
    },
    textHeaderLabel: {
        fontWeight: '700',
        fontSize: 16,
        //fontFamily: 'Mulish',
        lineHeight: 20,
        color: '#001E31'
    },
    camera: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '60%',
        width: deviceWidth,
        flex: 1
    },
    textTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        padding: 16,
        color: '#001E31',
    },
    submit: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: 120,
        shadowColor: '#00000',
        shadowOpacity: 0.4,
        backgroundColor: '#fafafa',
        paddingRight: 10
    },
    textTitle1: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        padding: 16,
        color: '#001E31',
    },
    cardView: {
        width: deviceWidth - 32,
        height: deviceHeight - 350,
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: 10,
        padding: 25,
        marginLeft: 5,
        marginRight: 5,
        marginTop: '10%',
        backgroundColor: 'red'
    },
    scanCardView: {
        width: deviceWidth - 32,
        height: deviceHeight / 2,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        padding: 25,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 10,
        backgroundColor: 'blue'
    },
    buttonWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonScan: {
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#258ce3',
        paddingTop: 5,
        paddingRight: 25,
        paddingBottom: 5,
        paddingLeft: 25,
        marginTop: 20
    },
    centerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        padding: 32,
        color: '#001E31',
    },
    bottomContent: {
        width: deviceWidth,
        height: 120,
    },
    buttonTextStyle: {
        color: 'black',
        fontWeight: 'bold',
    },
})


const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
    productionRecordAction: bindActionCreators(productionRecordAction, dispatch),
});
const mapStateToProps = createStructuredSelector({
    dataPageRecordSX, userScan
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(QRRecordScreen);
