import { CommonActions, DrawerActions, NavigationProp, useIsFocused } from '@react-navigation/native'
import React, { useCallback, useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl, Dimensions, ToastAndroid, Platform, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiProductionRecord, RequestService, ResponseService } from '../../../../../share/app/constantsApi';
import CommonBase from '../../../../../share/network/axios';
import { IDataPageRecordInput, IUserScan, IUserDefaultCallApi, IRecorDataByUser, IUserDropdown } from '../types/productionRecordTypes';
import { connect } from 'react-redux';
import { Action, AnyAction, bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import { dataPageRecordSX, userScan, isScan } from '../saga/productionRecordSelectors';
import productionRecordAction from './../saga/productionRecordAction';
import { IError, IRule, typeVadilate, validateField, validateForm } from '../../../../../share/commonVadilate/validate';
import { Path, Svg } from 'react-native-svg';
import { calendarFormat } from 'moment';
import { Regex } from '../../../../../share/app/regex';
import { NavigationHomeProductionRecord } from '../../../../../share/app/constants/homeConst';
import baseAction from '../../../../../base/saga/action';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import MyTitleHome from '../../../../../share/base/component/myStatusBar/MyTitleHome';
import PopUpBase from '../../../../../share/base/component/popUp/popUpBase';
import Modal from "react-native-modal";

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

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

export interface SubmitProductionRecordScreenProps {
    navigation: NavigationProp<any, any>,
    dataPageRecordSXInput: IDataPageRecordInput,
    userScan: IUserScan,
    isScan: boolean,
    productionRecordAction: typeof productionRecordAction,
    baseAction: typeof baseAction,
};

let localTime = new Date();
let date = moment(localTime).format('DD/MM/YYYY');

const SubmitProductionRecordScreen = ({ navigation, dataPageRecordSXInput, userScan, productionRecordAction, baseAction, isScan }: SubmitProductionRecordScreenProps) => {
    // const [workerData, setWorkderData] = useState<IUserScan[]>([{
    //     uerId: '',
    //     uerName: ''
    // }]);
    const isFocused = useIsFocused();
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
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

    const [dataStepWorker, setDataStepWorker] = useState<IStepWorker[]>([])
    const [isVisible, setIsvisible] = useState<boolean>();
    const [checkUpdateDataQty, setCheckUpdateDataQty] = useState<boolean>();

    const onPressCloseModal = () => {
        setIsOpenModal(false)
    }

    const onPressSubmitModal = () => {
        onPressSubmit()
    }

    // lay du lieu sau khi scan 
    const getDataInfo = async (dataPageRecordSXInputProps: IDataPageRecordInput) => {
        baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' })
        let request = {
            Workordercode: dataPageRecordSXInputProps.Workordercode,
            Workerid: userScan.id || dataInfo.Workerid,
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

            if (workerData.length > 0) {

            }

            if (dataResponse.status == StatusCheck.Create) {
                setCheckUpdateDataQty(true)
            }

            // loadDataStepDropdownAfterScan(dataInfo.Stepid)
            setDataInfo(dataInfo)
            setIsvisible(true)
        }


    }
    // lay data worker đổ ra dropdown worker
    // const handleDataDropdown = async () => {
    //     let dataInput = {
    //         type: 4,
    //         Code: dataPageRecordSX.Workordercode
    //     }
    //     if (dataPageRecordSX.Workordercode !== '') {
    //         let dataDropdownReponse = await CommonBase.getAsync<ResponseService>(ApiProductionRecord.GET_WORK_BY_TYPE + '?type='
    //             + dataInput.type + '&Code=' + dataInput.Code, null)
    //         if (typeof dataDropdownReponse !== 'string' && dataDropdownReponse != null && dataDropdownReponse.isSuccess === true) {
    //             let data = {
    //                 listData: dataDropdownReponse.data,
    //             }
    //             if (dataDropdownReponse.data.length <= 0) {
    //                 let msg = 'Không có nhân viên nào trên dây chuyền sản xuất này'
    //                 if (Platform.OS === 'android') {
    //                     ToastAndroid.show(msg, ToastAndroid.LONG)
    //                 } else {
    //                     Alert.alert(msg)
    //                 }
    //             }

    //             loadDataStepDropdown(userScan.id, dataInfo.Stepid)
    //             setWorkerData(data.listData)
    //             //setWorkderData(prevState => ({ ...prevState, uerId: data.id, uerName: data.name }))
    //         }
    //     } else {
    //         let msg = 'Lệnh sản xuất trống!'
    //         if (Platform.OS === 'android') {
    //             ToastAndroid.show(msg, ToastAndroid.LONG)
    //         } else {
    //             Alert.alert(msg)
    //         }
    //     }
    // }

    // load data dor ra dropdown step sau khi scan
    // const loadDataStepDropdownAfterScan = async (value: string) => {
    //     let request = {
    //         Workordercode: dataPageRecordSX.Workordercode,
    //         Workerid: userScan.id,
    //         Workcenterid: dataPageRecordSX.Workcenterid,
    //         Stepid: value,
    //     }

    //     let dataResponse = await CommonBase.postAsync<ResponseService>(ApiProductionRecord.GET_LIST_STEP_SUPPORT, request)
    //     if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
    //         setDataStepWorker(dataResponse.data)
    //         // setDataInfo(dataResponse.data)
    //     }
    // }

    // load data ra dropdown step
    const loadDataStepDropdown = async (value: string, stepid: string) => {
        // setRefreshing(true);
        // setTimeout(() => {
        //     setRefreshing(false)
        // }, 1500);
        if (value != '' || userScan.id != '' || stepid != '') {
            let request = {
                Workordercode: dataPageRecordSX.Workordercode,
                Workerid: value || userScan.id,
                Workcenterid: dataPageRecordSX.Workcenterid,
                Stepid: stepid,
            }
            let dataResponse = await CommonBase.postAsync<ResponseService>('/api/production-management-service/record-manufacturing-moblie/get-list-step-to-support', request)

            if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
                setDataStepWorker(dataResponse.data)
            }
        } else {
            return;
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


    const onPressSubmit = async () => {
        let localTime = new Date();
        let date = moment(localTime).format('DD/MM/YYYY');
        baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' })
        // setRefreshing(true);
        // setTimeout(() => {
        //     setRefreshing(false)
        // }, 1500);
        let request: IRecorDataByUser = {
            Productcode: dataPageRecordSX.ItemCode,
            Workcenterid: dataPageRecordSX.Workcenterid,
            Workordercode: dataPageRecordSX.Workordercode,
            Workerid: userScan.id || dataInfo.Workerid,
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
            let userInfo: IUserScan = {
                id: '',
                name: '',
                code: ''
            }
            productionRecordAction.setUserScan(userInfo);
            setTimeout(() => {
                //navigation.navigate(NavigationHomeProductionRecord.InputScreen)
                navigation.dispatch(
                    CommonActions.reset({
                        index: 4,
                        stale: true,
                        routes: [{ name: NavigationHomeProductionRecord.InputScreen }],
                    })
                );
            }, 1500);
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

    // const returnQr = () => {
    //     let userInfo: IUserScan = {
    //         id: '',
    //         name: '',
    //         code: '',
    //     }
    //     productionRecordAction.setUserScan(userInfo);
    //     navigation.dispatch(
    //         CommonActions.reset({
    //             routes: [{ name: 'QRScanScreen' }],
    //         })
    //     );
    // }

    // const handleSelectDropdownWorker = async (value: string) => {
    //     if (value != '' && value != null) {
    //         let request = {
    //             Workordercode: dataPageRecordSX.Workordercode,
    //             Workerid: value[0] || userScan.id,
    //             Workcenterid: dataPageRecordSX.Workcenterid,
    //             Stepid: '',
    //             Slottimecode: dataPageRecordSX.TimeSlot,
    //             RecordForDate: dataPageRecordSX.DateRecord
    //         }
    //         let dataResponse = await CommonBase.postAsync<ResponseService>(ApiProductionRecord.GET_INFO_WORKER_RECORD, request)
    //         if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {

    //             // setDefaultStep(dataResponse.data.Stepid)
    //             let dataInfo: IUserDefaultCallApi = {
    //                 Stepname: dataResponse.data.Stepname,
    //                 Workerid: dataResponse.data.Workerid,
    //                 Workername: dataResponse.data.Workername,
    //                 Stepid: dataResponse.data.Stepid,
    //                 QtyCutPartOld: dataResponse.data?.QtyCutPartOld ? dataResponse.data?.QtyCutPartOld : 0,
    //                 QtyCutPartNew: dataResponse?.data.QtyCutPartNew ?? 0,
    //                 Qtydone: dataResponse.data.Qtydone ?? 0,
    //                 QtyInputInline: dataResponse.data?.QtyInputInline ?? 0,
    //             }

    //             loadDataStepDropdown(dataInfo.Workerid, dataInfo.Stepid)
    //             //loadDataStepDropdownAfterScan(dataInfo.Stepid)
    //             setDefaultStep(dataResponse.data.Stepid);
    //             setCheckOTSubmit(false);
    //             if (dataResponse.status == StatusCheck.Create) {
    //                 setCheckUpdateDataQty(true)
    //             }
    //             else {
    //                 setCheckUpdateDataQty(false)
    //             }
    //             setDataInfo(dataInfo)
    //             setIsvisible(true)
    //         }
    //     }
    // }

    // const handleSelectDataStepDropdown = async (value: string) => {
    //     if (value[0] != dataInfo.Stepid) {
    //         setCheckOTSubmit(true)
    //     }
    //     else {
    //         setCheckOTSubmit(false)
    //         setCheckUpdateDataQty(true)
    //     }
    //     if (value != '' && value != null) {
    //         let request = {
    //             Workordercode: dataPageRecordSX.Workordercode,
    //             Workerid: dataInfo.Workerid || userScan.id,
    //             Workcenterid: dataPageRecordSX.Workcenterid,
    //             Stepid: value[0],
    //             Slottimecode: dataPageRecordSX.TimeSlot,
    //             RecordForDate: dataPageRecordSX.DateRecord
    //         }
    //         let dataResponse = await CommonBase.postAsync<ResponseService>(ApiProductionRecord.GET_INFO_WORKER_RECORD, request)
    //         if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
    //             let dataInfo: IUserDefaultCallApi = {
    //                 Stepname: dataResponse.data.Stepname,
    //                 Workerid: dataResponse.data.Workerid,
    //                 Workername: dataResponse.data.Workername,
    //                 Stepid: dataResponse.data.Stepid,
    //                 QtyCutPartOld: dataResponse.data?.QtyCutPartOld ?? 0,
    //                 QtyCutPartNew: dataResponse?.data.QtyCutPartNew,
    //                 Qtydone: dataResponse.data.Qtydone,
    //                 QtyInputInline: dataResponse.data?.QtyInputInline,
    //             }

    //             if (dataResponse.status == StatusCheck.Create) {
    //                 setCheckUpdateDataQty(true)
    //             }
    //             else {
    //                 setCheckUpdateDataQty(false)
    //             }
    //             setDataInfo(dataInfo)
    //             setIsvisible(true)
    //         }
    //     }

    // }

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
            TimeSlot: ''
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
            TimeSlot: ''
        }
        productionRecordAction.setDataPageRecorReducer(dataRequestReducer);
    }


    const handleOnchangeQty = (event: any) => {
        // setRefreshing(true);
        // setTimeout(() => {
        //     setRefreshing(false)
        // }, 1500);
        const value = event.nativeEvent.text;
        let error = validateField(value, Rules, "QtyCutPart", errors);
        // let minusData: string = (value - (+dataInfo.QtyCutPartOld)) + '';
        // if (value == '') {
        //     minusData = '';
        // }
        setErrors([...error])
        setDataInfo(prevState => ({
            ...prevState,
            QtyCutPartNew: value,
            //  Qtydone: minusData
        }))
    }

    const handleOnchangeQtySL = (event: any) => {
        // setRefreshing(true);
        // setTimeout(() => {
        //     setRefreshing(false)
        // }, 1500);
        const value = event.nativeEvent.text;
        let error = validateField(value, Rules, "Qtydone", errors);
        setErrors([...error])
        setDataInfo(prevState => ({
            ...prevState,
            Qtydone: value,
        }))
    }

    const handleOnchangeQtyInputInline = (event: any) => {
        // setRefreshing(true);
        // setTimeout(() => {
        //     setRefreshing(false)
        // }, 1500);
        const value = event.nativeEvent.text;
        let error = validateField(value, Rules, "QtyInputInline", errors);
        // let minusData: string = (value - (+dataInfo.QtyCutPartOld)) + '';
        // if (value == '') {
        //     minusData = '';
        // }
        setErrors([...error])
        setDataInfo(prevState => ({
            ...prevState,
            QtyInputInline: value,
            //  Qtydone: minusData
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
            {/* header */}
            {/* <View style={styles.header}>
                <Text style={styles.textHeaderLabel}>
                    Nhập số lượng sản xuất
                </Text>
            </View> */}
            <LinearGradient
                // start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                colors={['#003350', '#00598C']} style={{
                    height: 100, padding: 10,
                    paddingTop: 47
                }}>


                <MyTitleHome
                    navigation={navigation}
                    toggleDrawer={() => {
                        navigation.dispatch(DrawerActions.toggleDrawer());
                    }}
                    isShowIconLeft={true}
                    component={null}
                    title="Ghi nhận sản lượng"
                    hidenStatusBar={true}
                    isShowIconRight={true}

                />
            </LinearGradient>
            <View style={{ flex: 1 }}>
                <ScrollView
                >
                    <View style={styles.content}>
                        {/* <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Ghi nhận cho:
                            </Text>
                            <SelectBase
                                styles={styles.inputDropdown}
                                popupTitle='Danh sách công nhân'
                                listData={workerData}
                                onSelect={(data) => {
                                    setDataInfo((stateOld) => ({ ...stateOld, Workerid: data[0] }))
                                    handleSelectDropdownWorker(data)

                                }}
                                stylesIcon={{ position: 'absolute', zIndex: -1, right: 10, top: 15 }}
                                valueArr={[dataInfo.Workerid]}
                                isSelectSingle={true}
                            />
                            <TouchableOpacity onPress={returnQr}
                                style={{ justifyContent: 'center', alignItems: 'center', height: '10%', width: '10%' }}>
                                <Svg width="26" height="24" viewBox="0 0 26 24" fill="none" >
                                    <Path fill-rule="evenodd" clip-rule="evenodd" d="M10.3747 1.69238C10.3747 1.20913 9.98292 0.817383 9.49967 0.817383H2.49967H1.62467V1.69238V8.69238C1.62467 9.17563 2.01643 9.56738 2.49967 9.56738C2.98292 9.56738 3.37467 9.17563 3.37467 8.69238V2.56738H9.49967C9.98292 2.56738 10.3747 2.17563 10.3747 1.69238ZM10.3747 22.6924C10.3747 23.1756 9.98292 23.5674 9.49967 23.5674H2.49967H1.62467V22.6924V15.6924C1.62467 15.2091 2.01643 14.8174 2.49967 14.8174C2.98292 14.8174 3.37467 15.2091 3.37467 15.6924V21.8174H9.49967C9.98292 21.8174 10.3747 22.2091 10.3747 22.6924ZM16.4997 0.817383C16.0164 0.817383 15.6247 1.20913 15.6247 1.69238C15.6247 2.17563 16.0164 2.56738 16.4997 2.56738H22.6247V8.69238C22.6247 9.17563 23.0164 9.56738 23.4997 9.56738C23.9829 9.56738 24.3747 9.17563 24.3747 8.69238V1.69238V0.817383H23.4997H16.4997ZM15.6247 22.6924C15.6247 23.1756 16.0164 23.5674 16.4997 23.5674H23.4997H24.3747V22.6924V15.6924C24.3747 15.2091 23.9829 14.8174 23.4997 14.8174C23.0164 14.8174 22.6247 15.2091 22.6247 15.6924V21.8174H16.4997C16.0164 21.8174 15.6247 22.2091 15.6247 22.6924ZM1.33301 11.3174C0.849759 11.3174 0.458008 11.7091 0.458008 12.1924C0.458008 12.6756 0.849759 13.0674 1.33301 13.0674H24.6663C25.1496 13.0674 25.5413 12.6756 25.5413 12.1924C25.5413 11.7091 25.1496 11.3174 24.6663 11.3174H1.33301Z" fill="#0D1D2A" />
                                </Svg>
                            </TouchableOpacity>
                        </View>
                        {
                            errors && errors.length > 0
                                ?
                                (errors.map((item, j) => {
                                    if (item?.fieldName == 'WorkerName') {
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
                                Công đoạn:
                            </Text>
                            <SelectBase
                                styles={styles.inputDropdownStepId}
                                popupTitle='Danh sách công đoạn'
                                listData={dataStepWorker}
                                onSelect={(data) => {
                                    if (data == defaultStep) {
                                        setCheckOTSubmit(false)
                                    }
                                    else {
                                        setCheckOTSubmit(true)
                                    }
                                    setDataInfo((stateOld) => ({ ...stateOld, Stepid: data }))
                                    handleSelectDataStepDropdown(data)
                                }}
                                stylesIcon={{ position: 'absolute', zIndex: -1, right: 10, top: 15 }}
                                valueArr={[dataInfo.Stepid]}
                                isSelectSingle={true}
                            />
                        </View> */}
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
                                placeholderTextColor='#AAABAE'
                                keyboardType='numeric'
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
                                Tổng sản lượng vào chuyền:
                            </Text>
                            <Text style={styles.input}>{dataInfo.QtyNeed}</Text>
                        </View>
                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Sản lượng:
                            </Text>
                            <TextInput
                                onChange={handleOnchangeQtySL}
                                placeholder='Sản lượng'
                                placeholderTextColor='#AAABAE'
                                value={dataInfo?.Qtydone + ''}
                                style={styles.inputBox}
                                keyboardType='numeric'
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
                    <TouchableOpacity style={styles.submitButton} onPress={() => { setIsOpenModal(true) }}>
                        <View>
                            <Text style={{ color: '#ffffff', fontFamily: 'Mulish-Bold' }}>Ghi nhận </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

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
                            content={' Sản lượng đang lớn hơn tổng vào chuyền \n   Bạn có chắc chắn muốn ghi nhận ? '}
                            handleClose={(onPressCloseModal)}
                            handleConfirm={(onPressSubmitModal)}
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
        height: 350,
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
        paddingRight: 10,
        paddingBottom: 10,
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
        paddingTop: 5,
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
    dataPageRecordSXInput: dataPageRecordSX, userScan, isScan
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SubmitProductionRecordScreen);
