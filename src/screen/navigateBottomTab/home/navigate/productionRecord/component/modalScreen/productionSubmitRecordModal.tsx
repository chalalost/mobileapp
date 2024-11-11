import { CommonActions, NavigationProp, useIsFocused } from '@react-navigation/native'
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Dimensions, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import Svg, { LinearGradient, Path } from 'react-native-svg';
import baseAction from '../../../../../../base/saga/action';
import { connect } from 'react-redux';
import { Action, AnyAction, bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import { dataPageRecordSX } from '../../saga/productionRecordSelectors';
import { NavigationHomeProductionRecord } from '../../../../../../share/app/constants/homeConst';
import { ApiProductionRecord, RequestService, ResponseService } from '../../../../../../share/app/constantsApi';
import { Regex } from '../../../../../../share/app/regex';
import PopUpBase from '../../../../../../share/base/component/popUp/popUpBase';
import { IError, IRule, typeVadilate, validateField, validateForm } from '../../../../../../share/commonVadilate/validate';
import CommonBase from '../../../../../../share/network/axios';
import productionRecordAction from '../../saga/productionRecordAction';
import { IDataPageRecordInput, IRecorDataByUser, IUserDefaultCallApi, IUserScan } from '../../types/productionRecordTypes';
import Modal from "react-native-modal";


const Rules: IRule[] = [
    {
        field: 'Qtydone',
        required: true,
        maxLength: 10,
        minLength: 0,
        typeValidate: typeVadilate.Number,
        valueCheck: Regex.Regex_integer,
        maxValue: 0,
        messages: {
            required: 'Vui lòng kiểm tra lại sản lượng!',
            minLength: '',
            maxLength: '',
            validate: 'Giá trị không hợp lệ',
            maxValue: 'Giá trị không hợp lệ',

        }
    },
    {
        field: 'QtyCutPart',
        required: false,
        maxLength: 10,
        minLength: 0,
        typeValidate: typeVadilate.Number,
        valueCheck: Regex.Regex_integer,
        maxValue: 0,
        messages: {
            required: '',
            minLength: '',
            maxLength: '',
            validate: 'Vui lòng kiểm tra lại đầu cắt part',
            maxValue: ''
        }
    },
    {
        field: 'QtyInputInline',
        required: false,
        maxLength: 10,
        minLength: 0,
        typeValidate: typeVadilate.numberv1,
        valueCheck: Regex.Regex_integer,
        maxValue: 0,
        messages: {
            required: '',
            minLength: '',
            maxLength: '',
            validate: 'Giá trị không hợp lệ',
            maxValue: 'Giá trị không hợp lệ',
        }
    },
    {
        field: 'WorkerName',
        required: false,
        maxLength: 255,
        minLength: 0,
        typeValidate: 0,
        valueCheck: '',
        maxValue: 0,
        messages: {
            required: 'Không được bỏ trống tên nhân viên !',
            minLength: '',
            maxLength: '',
            validate: '',
            maxValue: ''
        }
    }
]

const StatusCheck = {
    Create: 1,
    Edit: 0
}

interface IStepWorker {
    id: string | '',
    name: string | ''
}

export interface IProductionSubmitProp {
    navigation: NavigationProp<any, any>,
    handleCancel: any,
    handleSubmit: Function,
    dataPageRecordSXInput: IDataPageRecordInput,
    productionRecordAction: typeof productionRecordAction,
}

let localTime = new Date();
let date = moment(localTime).format('DD/MM/YYYY');

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const ProductionSubmitRecordModal: React.FC<IProductionSubmitProp> = ({ navigation, handleCancel, handleSubmit,
    dataPageRecordSXInput, productionRecordAction
    // , dataPageRecordSXInput, userScan
}) => {

    const isFocused = useIsFocused();
    const [isOpenModalQtyNeed, setIsOpenModalQtyNeed] = useState<boolean>(false);
    const [isOpenModalQtyLK, setIsOpenModalQtyLK] = useState<boolean>(false);
    const [workerData, setWorkerData] = useState<IUserScan[]>([]);

    const [dataPageRecordSX, setDataPageRecordSX] = useState<IDataPageRecordInput>({
        Workcenterid: '',
        Workordercode: '',
        ItemCode: '',
        Color: '',
        subCode: '',
        Maincodeproduct: '',
        Seasoncode: '',
        Marketcode: '',
        Sizecode: '',
        DateRecord: '',
        TimeSlot: ''
    });

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, []);
    const [errors, setErrors] = useState<IError[]>([]);
    const [dataInfo, setDataInfo] = useState<IUserDefaultCallApi>({
        Stepname: "",
        Workerid: "",
        Workername: "",
        Stepid: "",
        QtyCutPartOld: "",
        QtyCutPartNew: "",
        Qtydone: "",
        QtyInputInline: "",
        QtyNeed: "",
        QtyLK: ""
    });
    //const [dataStepWorker, setDataStepWorker] = useState<IStepWorker[]>([])
    const [isVisible, setIsvisible] = useState<boolean>();
    const [checkUpdateDataQty, setCheckUpdateDataQty] = useState<boolean>();

    const onPressCloseModalNeed = () => {
        setIsOpenModalQtyNeed(false)
    }

    const onPressSubmitModalNeed = () => {
        if (parseInt(dataInfo.QtyLK) < parseInt(dataInfo.Qtydone)) {
            setIsOpenModalQtyLK(true)
        }
        else {
            onPressSubmit()
        }
    }

    const onPressCloseModalLK = () => {
        setIsOpenModalQtyLK(false)
    }

    const onPressSubmitModalLK = () => {
        onPressSubmit()
    }

    // lay du lieu sau khi scan 
    const getDataInfo = async (dataPageRecordSXInputProps: IDataPageRecordInput) => {
        baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' })
        let request = {
            Workordercode: dataPageRecordSXInput.Workordercode,
            Workerid: dataInfo.Workerid,
            Workcenterid: dataPageRecordSXInputProps.Workcenterid,
            Stepid: '',
            Slottimecode: dataPageRecordSXInputProps.TimeSlot,
            RecordForDate: dataPageRecordSXInputProps.DateRecord,
            Productcode: dataPageRecordSXInputProps.ItemCode
        }
        baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' })
        // return;
        let dataResponse = await CommonBase.postAsync<ResponseService>(ApiProductionRecord.GET_INFO_WORKER_RECORD, request)
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            let dataInfo: IUserDefaultCallApi = {
                Stepname: dataResponse.data.Stepname,
                Workerid: dataResponse.data.Workerid,
                Workername: dataResponse.data.Workername,
                Stepid: dataResponse.data.Stepid,
                QtyCutPartOld: dataResponse.data?.QtyCutPartOld ? dataResponse.data?.QtyCutPartOld : 0,
                QtyCutPartNew: dataResponse.data?.QtyCutPartNew ?? '',
                Qtydone: dataResponse.data?.Qtydone ?? '',
                QtyInputInline: dataResponse.data?.QtyInputInline ?? '',
                QtyNeed: dataResponse.data?.QtyNeed ?? '',
                QtyLK: dataResponse.data?.QtyLK ?? '',
                // QtyCutPartOld: dataResponse.data.QtyCutPartOld,
                // QtyCutPartNew: dataResponse.data.QtyCutPartNew,
                // Qtydone: dataResponse.data.Qtydone,
                // QtyInputInline: dataResponse.data.QtyInputInline,
            }

            if (dataResponse.status == StatusCheck.Create) {
                setCheckUpdateDataQty(true)
            }

            // loadDataStepDropdownAfterScan(dataInfo.Stepid)
            setDataInfo(dataInfo)
            setIsvisible(true)
        }
    }

    const onPressHandleClose = () => {
        let userInfo: IUserScan = {
            id: '',
            name: '',
            code: '',
        }
        //khi quay tro ve trang inout se co du lieu trong
        clearData()
        //productionRecordAction.setDataPageRecorReducer(dataPageRecordSX);
        productionRecordAction.setUserScan(userInfo);

        navigation.dispatch(
            CommonActions.reset({
                routes: [{ name: 'InputScreen' }],
            })
        );

    }

    const checkQty = () => {
        if (parseInt(dataInfo.QtyNeed) < parseInt(dataInfo.Qtydone)) {
            setIsOpenModalQtyNeed(true)
        }
        if (parseInt(dataInfo.QtyLK) < parseInt(dataInfo.Qtydone)) {
            setIsOpenModalQtyLK(true)
        }
        if (parseInt(dataInfo.QtyNeed) >= parseInt(dataInfo.Qtydone) && parseInt(dataInfo.QtyLK) >= parseInt(dataInfo.Qtydone)) {
            onPressSubmit()
        }
    }


    const onPressSubmit = async () => {
        let localTime = new Date();
        let date = moment(localTime).format('DD/MM/YYYY');
        baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' })
        let request: IRecorDataByUser = {
            Productcode: dataPageRecordSX.ItemCode,
            Workcenterid: dataPageRecordSX.Workcenterid,
            Workordercode: dataPageRecordSX.Workordercode,
            Workerid: dataInfo.Workerid,
            Stepid: dataInfo.Stepid,
            QtyCutPartNew: dataInfo.QtyCutPartNew,
            Qtydone: dataInfo.Qtydone,
            QtyInputInline: dataInfo.QtyInputInline,
            Slottimecode: dataPageRecordSX.TimeSlot,
            RecordForDate: dataPageRecordSX.DateRecord,
        }
        let error = validateForm(dataInfo, Rules, []);
        if (error && error.length > 0) {
            setErrors([...error])
            baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
            return;
        }
        if (request.RecordForDate > date) {
            baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
            let msg = 'Ngày ghi nhận không được quá ngày hiện tại'
            if (Platform.OS === 'android') {
                ToastAndroid.show(msg, ToastAndroid.LONG)
            } else {
                Alert.alert(msg)
            }
            setTimeout(() => {
            }, 1500);
            return;
        }

        let dataResponse = await CommonBase.postAsync<RequestService>(ApiProductionRecord.CARRY_OUT_PRODUCTION_RECORD, request)
        baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            // bắn thông báo ghi nhận thành công=> chuyển hướng đến trang QRScanScreen
            let msg = 'Ghi nhận sản lượng thành công !'
            if (Platform.OS === 'android') {
                ToastAndroid.show(msg, ToastAndroid.LONG)
            } else {
                Alert.alert(msg)
            }
            handleSubmit()
        }

        else {
            baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
            if (Platform.OS === 'android') {
                ToastAndroid.show('Ghi nhận sản lượng không thành công !', ToastAndroid.SHORT)
                ToastAndroid.show('Vui lòng kiểm tra lại giá trị vừa nhập', ToastAndroid.LONG)
            } else {
                Alert.alert('Ghi nhận sản lượng không thành công. Vui lòng kiểm tra lại giá trị vừa nhập !')
            }

            setTimeout(() => {
            }, 1500);
        }
    }

    const clearData = () => {
        setDataPageRecordSX({
            Workcenterid: '',
            Workordercode: '',
            ItemCode: '',
            Color: '',
            subCode: '',
            Maincodeproduct: '',
            Seasoncode: '',
            Marketcode: '',
            Sizecode: '',
            DateRecord: date,
            TimeSlot: '',
        })
        let dataRequestReducer: IDataPageRecordInput = {
            Workcenterid: '',
            Workordercode: '',
            ItemCode: '',
            Color: '',
            subCode: '',
            Maincodeproduct: '',
            Seasoncode: '',
            Marketcode: '',
            Sizecode: '',
            DateRecord: date,
            TimeSlot: '',
        }
        productionRecordAction.setDataPageRecorReducer(dataRequestReducer);
    }

    const handleOnchangeQty = (event: any) => {
        const value = event.nativeEvent.text;
        let error = validateField(value, Rules, "QtyCutPart", errors);
        setErrors([...error])
        setDataInfo(prevState => ({
            ...prevState,
            QtyCutPartNew: value,
        }))
    }

    const handleOnchangeQtySL = (event: any) => {
        const value = event.nativeEvent.text;
        let error = validateField(value, Rules, "Qtydone", errors);
        setErrors([...error])
        setDataInfo(prevState => ({
            ...prevState,
            Qtydone: value,
        }))
    }

    const handleOnchangeQtyInputInline = (event: any) => {
        const value = event.nativeEvent.text;
        let error = validateField(value, Rules, "QtyInputInline", errors);
        setErrors([...error])
        setDataInfo(prevState => ({
            ...prevState,
            QtyInputInline: value,
        }))
    }

    const HandleShowErrorText = () => {
        return (
            <>
                <View style={{
                    backgroundColor: '#E7F2FF', flexDirection: 'row',
                    padding: 10,
                    width: '100%',
                    marginTop: 32,
                    paddingTop: 8,
                    paddingLeft: 12,
                    paddingRight: 12,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                }}>
                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <Path d="M10 11.075C10.2167 11.075 10.396 11.004 10.538 10.862C10.6793 10.7207 10.75 10.5417 10.75 10.325V5.8C10.75 5.6 10.6793 5.429 10.538 5.287C10.396 5.14567 10.2167 5.075 10 5.075C9.78333 5.075 9.60433 5.14567 9.463 5.287C9.321 5.429 9.25 5.60833 9.25 5.825V10.35C9.25 10.55 9.321 10.7207 9.463 10.862C9.60433 11.004 9.78333 11.075 10 11.075ZM10 14.725C10.2333 14.725 10.425 14.65 10.575 14.5C10.725 14.35 10.8 14.1583 10.8 13.925C10.8 13.6917 10.725 13.5 10.575 13.35C10.425 13.2 10.2333 13.125 10 13.125C9.76667 13.125 9.575 13.2 9.425 13.35C9.275 13.5 9.2 13.6917 9.2 13.925C9.2 14.1583 9.275 14.35 9.425 14.5C9.575 14.65 9.76667 14.725 10 14.725ZM10 19.5C8.68333 19.5 7.446 19.25 6.288 18.75C5.12933 18.25 4.125 17.575 3.275 16.725C2.425 15.875 1.75 14.8707 1.25 13.712C0.75 12.554 0.5 11.3167 0.5 10C0.5 8.68333 0.75 7.44567 1.25 6.287C1.75 5.129 2.425 4.125 3.275 3.275C4.125 2.425 5.12933 1.75 6.288 1.25C7.446 0.75 8.68333 0.5 10 0.5C11.3167 0.5 12.5543 0.75 13.713 1.25C14.871 1.75 15.875 2.425 16.725 3.275C17.575 4.125 18.25 5.129 18.75 6.287C19.25 7.44567 19.5 8.68333 19.5 10C19.5 11.3167 19.25 12.554 18.75 13.712C18.25 14.8707 17.575 15.875 16.725 16.725C15.875 17.575 14.871 18.25 13.713 18.75C12.5543 19.25 11.3167 19.5 10 19.5ZM10 18C12.2167 18 14.1043 17.221 15.663 15.663C17.221 14.1043 18 12.2167 18 10C18 7.78333 17.221 5.89567 15.663 4.337C14.1043 2.779 12.2167 2 10 2C7.78333 2 5.896 2.779 4.338 4.337C2.77933 5.89567 2 7.78333 2 10C2 12.2167 2.77933 14.1043 4.338 15.663C5.896 17.221 7.78333 18 10 18Z" fill="#004B72" />
                    </Svg>
                    <Text style={{
                        color: '#004B72',
                        paddingLeft: 5,
                        fontFamily: 'Mulish-Bold',
                        fontSize: 14,
                    }}>
                        Bạn đang tiến hành ghi nhận sản lượng tại {dataPageRecordSX.TimeSlot}</Text>
                </View>
                <View style={{
                    backgroundColor: '#E7F2FF', flexDirection: 'row',
                    padding: 10,
                    width: '100%',
                    marginTop: 20,
                    paddingTop: 8,
                    paddingLeft: 12,
                    paddingRight: 12,
                    justifyContent: 'flex-start',
                    alignItems: 'center',

                }}>
                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <Path d="M10 11.075C10.2167 11.075 10.396 11.004 10.538 10.862C10.6793 10.7207 10.75 10.5417 10.75 10.325V5.8C10.75 5.6 10.6793 5.429 10.538 5.287C10.396 5.14567 10.2167 5.075 10 5.075C9.78333 5.075 9.60433 5.14567 9.463 5.287C9.321 5.429 9.25 5.60833 9.25 5.825V10.35C9.25 10.55 9.321 10.7207 9.463 10.862C9.60433 11.004 9.78333 11.075 10 11.075ZM10 14.725C10.2333 14.725 10.425 14.65 10.575 14.5C10.725 14.35 10.8 14.1583 10.8 13.925C10.8 13.6917 10.725 13.5 10.575 13.35C10.425 13.2 10.2333 13.125 10 13.125C9.76667 13.125 9.575 13.2 9.425 13.35C9.275 13.5 9.2 13.6917 9.2 13.925C9.2 14.1583 9.275 14.35 9.425 14.5C9.575 14.65 9.76667 14.725 10 14.725ZM10 19.5C8.68333 19.5 7.446 19.25 6.288 18.75C5.12933 18.25 4.125 17.575 3.275 16.725C2.425 15.875 1.75 14.8707 1.25 13.712C0.75 12.554 0.5 11.3167 0.5 10C0.5 8.68333 0.75 7.44567 1.25 6.287C1.75 5.129 2.425 4.125 3.275 3.275C4.125 2.425 5.12933 1.75 6.288 1.25C7.446 0.75 8.68333 0.5 10 0.5C11.3167 0.5 12.5543 0.75 13.713 1.25C14.871 1.75 15.875 2.425 16.725 3.275C17.575 4.125 18.25 5.129 18.75 6.287C19.25 7.44567 19.5 8.68333 19.5 10C19.5 11.3167 19.25 12.554 18.75 13.712C18.25 14.8707 17.575 15.875 16.725 16.725C15.875 17.575 14.871 18.25 13.713 18.75C12.5543 19.25 11.3167 19.5 10 19.5ZM10 18C12.2167 18 14.1043 17.221 15.663 15.663C17.221 14.1043 18 12.2167 18 10C18 7.78333 17.221 5.89567 15.663 4.337C14.1043 2.779 12.2167 2 10 2C7.78333 2 5.896 2.779 4.338 4.337C2.77933 5.89567 2 7.78333 2 10C2 12.2167 2.77933 14.1043 4.338 15.663C5.896 17.221 7.78333 18 10 18Z" fill="#004B72" />
                    </Svg>
                    <Text style={{
                        color: '#004B72',
                        paddingLeft: 5,
                        fontFamily: 'Mulish-Bold',
                        fontSize: 14,
                    }}>Đầu cắt part gần nhất đang là: {dataInfo.QtyCutPartOld}</Text>
                </View>
            </>
        )
    }

    useEffect(() => {
        if (isFocused == true) {
            setDataPageRecordSX({ ...dataPageRecordSXInput });
            getDataInfo(dataPageRecordSXInput);
        } else {
            clearData()
        }
    }, [isFocused])

    return (
        <View
            style={styles.container}>
            <View style={{ flex: 1 }}>
                <ScrollView
                >
                    <View style={styles.content}>
                        {
                            dataPageRecordSX.TimeSlot != null && dataPageRecordSX.TimeSlot == 'CA5' ?
                                (
                                    <View style={styles.label}>
                                        <Text style={styles.labelField}>
                                            Vào chuyền trong ngày:
                                        </Text>
                                        <TextInput
                                            onChange={handleOnchangeQtyInputInline}
                                            value={dataInfo.QtyInputInline + ''}
                                            placeholder='Số lượng cắt part'
                                            placeholderTextColor='#AAABAE'
                                            keyboardType='numeric'
                                            style={styles.inputBox} />
                                    </View>
                                ) : null
                        }
                        {
                            errors && errors.length > 0
                                ?
                                (errors.map((item, j) => {
                                    if (item?.fieldName == 'QtyInputInline') {
                                        return (
                                            <Text key={j} style={{
                                                color: 'red',
                                                padding: 0,
                                                margin: 0,
                                                paddingTop: 8,
                                                paddingLeft: 140,
                                            }}>{item?.mes}</Text>
                                        )
                                    }
                                }))
                                :
                                null
                        }
                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Đầu cắt part:
                            </Text>
                            <TextInput
                                onChange={handleOnchangeQty}
                                value={dataInfo.QtyCutPartNew + ''}
                                placeholder='Số lượng cắt part'
                                keyboardType='numeric'
                                placeholderTextColor='#AAABAE'
                                style={styles.inputBox} />
                        </View>
                        {
                            errors && errors.length > 0
                                ?
                                (errors.map((item, j) => {
                                    if (item?.fieldName == 'QtyCutPart') {
                                        return (
                                            <Text key={j} style={{
                                                width: '100%',
                                                paddingLeft: (deviceWidth * 31) / 100,
                                                color: 'red',
                                                margin: 0,
                                            }}>{item.mes}</Text>
                                        )
                                    }
                                }))
                                :
                                null
                        }
                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                SL còn lại trong lệnh SX:
                            </Text>
                            <Text style={styles.input}>{dataInfo.QtyNeed}</Text>
                        </View>

                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Lũy kế:
                            </Text>
                            <Text style={styles.input}>{dataInfo.QtyLK}</Text>
                        </View>

                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Sản lượng:
                            </Text>
                            <TextInput
                                onChange={(data) => {
                                    handleOnchangeQtySL(data)
                                }}
                                placeholder='Sản lượng'
                                value={dataInfo?.Qtydone + ''}
                                style={styles.inputBox}
                                keyboardType='numeric'
                                placeholderTextColor='#AAABAE'
                            />
                        </View>
                        {
                            errors && errors.length > 0
                                ?
                                (errors.map((item, j) => {
                                    if (item?.fieldName == 'Qtydone') {
                                        return (
                                            <Text key={j} style={{
                                                width: '100%',
                                                paddingLeft: (deviceWidth * 31) / 100,
                                                color: 'red',
                                                margin: 0,
                                            }}>{item.mes}</Text>
                                        )
                                    }
                                }))
                                :
                                null
                        }
                        {isVisible ?
                            <HandleShowErrorText />
                            : null
                        }
                    </View>
                </ScrollView>
            </View>
            {/* submit */}
            <View style={styles.submit}>
                <View style={{ height: 40, width: '30%', paddingRight: 20 }}>

                    <TouchableOpacity style={styles.delinceButton} onPress={() => { onPressHandleClose() }} >
                        <View>
                            <Text style={{ color: '#006496', fontFamily: 'Mulish-Bold' }}>Hủy </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 40, width: '30%' }}>
                    <TouchableOpacity style={styles.submitButton} onPress={checkQty}>
                        <View>
                            <Text style={{ color: '#ffffff', fontFamily: 'Mulish-Bold' }}>Ghi nhận </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {
                isOpenModalQtyNeed ? (
                    <Modal
                        isVisible={isOpenModalQtyNeed}
                        //style={{ backgroundColor: '#ffffff', margin: 0 }}
                        onBackdropPress={() => setIsOpenModalQtyNeed(false)}
                        statusBarTranslucent={false}
                        deviceHeight={deviceHeight}
                        deviceWidth={deviceWidth}
                    >
                        <PopUpBase
                            title={'Thông báo'}
                            content={' Sản lượng đang lớn hơn tổng trong chuyền \n   Bạn có chắc chắn muốn ghi nhận ? '}
                            handleClose={(onPressCloseModalNeed)}
                            handleConfirm={(onPressSubmitModalNeed)}
                        />
                    </Modal>
                )
                    : null
            }

            {
                isOpenModalQtyLK ? (
                    <Modal
                        isVisible={isOpenModalQtyLK}
                        //style={{ backgroundColor: '#ffffff', margin: 0 }}
                        onBackdropPress={() => setIsOpenModalQtyLK(false)}
                        statusBarTranslucent={false}
                        deviceHeight={deviceHeight}
                        deviceWidth={deviceWidth}
                    >
                        <PopUpBase
                            title={'Thông báo'}
                            content={'     Sản lượng đang lớn hơn lũy kế \n Bạn có chắc chắn muốn ghi nhận ? '}
                            handleClose={(onPressCloseModalLK)}
                            handleConfirm={(onPressSubmitModalLK)}
                        />
                    </Modal>
                )
                    : null
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 2,
        height: '100%',
        width: '100%',
        backgroundColor: '#F4F4F9',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
        flexDirection: 'column'
    },
    header: {
        justifyContent: 'center',
        paddingLeft: 18,
        borderBottomColor: '#001E31',
        height: 60,
        backgroundColor: '#ffffff',
    },
    content: {
        height: 450,
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 14,
    },
    submit: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: 100,
        shadowColor: '#00000',
        shadowOpacity: 0.4,
        backgroundColor: '#ffffff',
        paddingRight: 10
    },
    textHeaderLabel: {
        fontWeight: '700',
        fontSize: 16,
        fontFamily: 'Mulish-Bold',
        lineHeight: 20,
        color: '#001E31'
    },
    label: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderBottomWidth: 1,
        borderBottomColor: "#eaeaea",
        paddingVertical: 8,
        color: '#1B3A4E'
    },
    imageLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    inputBox: {
        width: '70%',
        height: 40,
        paddingLeft: 15,
        color: '#001E31',
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Mulish-Bold'
    },
    inputWithQr: {
        justifyContent: "center",
        width: '45%',
        height: '80%',
        color: '#001E31',
        fontSize: 12,
    },
    inputDropdown: {
        justifyContent: "center",
        alignItems: 'center',
        color: '#001E31',
        width: 220,
        paddingLeft: 10,
        fontSize: 12,
        fontFamily: 'Mulish-Bold'

    },
    inputDropdownStepId: {
        justifyContent: "center",
        alignItems: 'center',
        color: '#001E31',
        width: 260,
        paddingLeft: 10,
        fontFamily: 'Mulish-Bold',
        fontSize: 12,
    },
    input: {
        justifyContent: "center",
        alignItems: "center",
        width: '70%',
        height: '90%',
        paddingLeft: 14,
        fontWeight: '600',
        color: '#001E31'
    },
    labelField: {
        width: '30%',
        color: '#001E31CC',
        fontSize: 14,
        fontFamily: 'Mulish-Bold'
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
    }
})

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
    productionRecordAction: bindActionCreators(productionRecordAction, dispatch),
    baseAction: bindActionCreators(baseAction, dispatch),
});
const mapStateToProps = createStructuredSelector({
    dataPageRecordSXInput: dataPageRecordSX,
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProductionSubmitRecordModal);

