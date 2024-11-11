import { NavigationProp } from '@react-navigation/native';
import { min } from 'moment';
import { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, Platform } from 'react-native';
import { Circle, Defs, LinearGradient, Path, Stop, Svg } from 'react-native-svg';
import { ApiCommon, DropDownType, ResponseService } from '../../../../../../share/app/constantsApi';
import { Regex } from '../../../../../../share/app/regex';
import { IRule, generateGuid, validateField, validateForm, typeVadilate } from '../../../../../../share/commonVadilate/validate';
import CommonBase from '../../../../../../share/network/axios';
import SelectBaseVer2 from '../../../../../../share/base/component/selectBase/selectBaseVer2';
import { IWorker } from '../../types/reportWorkerTypes';
import InputSpinner from "react-native-input-spinner";
import { HeightTitleApp } from '../../../../../../share/app/constants/constansHeightApp';

const Rules: IRule[] = [
    {
        field: 'Workerid',
        required: true,
        maxLength: 100,
        minLength: 0,
        typeValidate: 0,
        valueCheck: '',
        maxValue: 0,
        messages: {
            required: 'Vui lòng chọn nhân viên',
            minLength: '',
            maxLength: '',
            validate: '',
            maxValue: ''
        }
    },
    {
        field: 'ReasonCode',
        required: true,
        maxLength: 100,
        minLength: 0,
        typeValidate: 0,
        valueCheck: '',
        maxValue: 0,
        messages: {
            required: 'Vui lòng chọn lý do',
            minLength: '',
            maxLength: '',
            validate: '',
            maxValue: ''
        }
    },
    {
        field: 'NumberWorkOff',
        required: true,
        maxLength: 100,
        minLength: 0,
        typeValidate: typeVadilate.numberv1,
        valueCheck: Regex.Regex_decimal_v1,
        maxValue: 1,
        messages: {
            required: 'Vui lòng nhập số công nghỉ',
            minLength: '',
            maxLength: '',
            validate: 'Giá trị không hợp lệ',
            maxValue: 'Giá trị không vượt quá 1',
        }
    },
    {
        field: 'OrtherReason',
        required: false,
        maxLength: 255,
        minLength: 0,
        typeValidate: 0,
        valueCheck: '',
        maxValue: 0,
        messages: {
            required: 'Vui lòng nhập ghi chú',
            minLength: '',
            maxLength: 'Ghi chú không được vượt quá 100 kí tự',
            validate: 'Giá trị không hợp lệ',
            maxValue: '',
        }
    },

]

interface IReason {
    id: string | '',
    name: string | '',
    code: string | null
}

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

let heightStatusBar = StatusBar.currentHeight ? StatusBar.currentHeight : 0;
let HeightTitleAppPage = HeightTitleApp.Android;
if (Platform.OS == 'ios') {
    HeightTitleAppPage = HeightTitleApp.Ios
}

export interface AbsenseWorkerProps {
    navigation: NavigationProp<any, any>,
    handleCancel: any,
    handleSubmit: Function,
    workcenterid: string | '',
    listAbsenseWorkerProps: IWorker[]
}

const AbsenseWorkerModal: React.FC<AbsenseWorkerProps> = ({ navigation, handleCancel, handleSubmit, workcenterid, listAbsenseWorkerProps }) => {

    const [listWorker, setListWorker] = useState<IReason[]>([]);
    const [listWorkerShow, setListWorkerShow] = useState<IReason[]>([]);
    const [absenseReason, setAbsenseReason] = useState<IReason[]>([]);
    const [listAbsenseWorker, setlistAbsenseWorker] = useState<IWorker[]>([]);

    const handleAddMoreForm = () => {
        let isCheckVadilate = true;
        if (listAbsenseWorker.length > 0) {
            listAbsenseWorker.forEach(item => {
                item.listError = validateForm(item, Rules, []);
                if (item.listError.length > 0) {
                    isCheckVadilate = false;
                }
            })
        }
        if (isCheckVadilate === true) {
            let data: IWorker = {
                Id: generateGuid(),
                Workerid: '',
                ReasonCode: '',
                NumberWorkOff: '1',
                OrtherReason: '',
                listError: []
            }
            listAbsenseWorker.push(data);
        }
        setlistAbsenseWorker([...listAbsenseWorker]);
    }

    const handleRemoveItem = (item: IWorker) => {
        if (listAbsenseWorker.length > 0) {
            let index = -1;
            listAbsenseWorker.forEach((AbsenseWorker, j) => {
                if (AbsenseWorker.Id == item.Id) {
                    index = j;
                }
            })
            if (index >= 0) {
                listAbsenseWorker.splice(index, 1);
                setlistAbsenseWorker([...listAbsenseWorker])
                updateDropdownWorker();
            }
        }
    }

    // const getDropdown
    const onPressHandleClose = () => {
        if (handleCancel) {
            handleCancel()
        }
    }

    const onPressHandleSubmit = async () => {
        let isCheckVadilate = true;
        if (listAbsenseWorker.length > 0) {
            listAbsenseWorker.forEach(item => {
                item.listError = validateForm(item, Rules, []);
                if (item.listError.length > 0) {
                    isCheckVadilate = false;
                }
            })
        }
        if (isCheckVadilate === true) {
            handleSubmit(listAbsenseWorker)
        }
        setlistAbsenseWorker([...listAbsenseWorker])
    }
    const getDataReasonDropdown = async () => {
        let dataDropdownRes = await CommonBase.getAsync<ResponseService>(ApiCommon.GET_API_COMMON + '?type=' + DropDownType.Reason, null)
        if (typeof dataDropdownRes !== 'string' && dataDropdownRes != null && dataDropdownRes.isSuccess === true) {
            let data = {
                list: dataDropdownRes.data
            }
            setAbsenseReason(data.list)
        }
    }
    const getDataWorkerDropdown = async () => {
        let dataRequest = {
            type: DropDownType.WorkerInWorkcenter,
            search: '',
            code: workcenterid,
        }
        let dataDropdownRes = await CommonBase.getAsync<ResponseService>(ApiCommon.GET_API_COMMON + '?type=' + dataRequest.type + '&code=' + dataRequest.code, null)

        if (typeof dataDropdownRes !== 'string' && dataDropdownRes != null && dataDropdownRes.isSuccess === true) {
            setListWorker(dataDropdownRes.data);
            setListWorkerShow(dataDropdownRes.data);
            updateDropdownWorkerNew(dataDropdownRes.data, listAbsenseWorkerProps)

        }
    }

    const updateDropdownWorkerNew = (listWorker: IReason[], listAbsenseWorkerProps: IWorker[]) => {
        if (listWorker && listWorker.length > 0) {
            let listShowNew: IReason[] = [];
            if (listAbsenseWorkerProps && listAbsenseWorkerProps.length > 0) {
                listWorker.forEach(item => {
                    let findItem = listAbsenseWorkerProps.find(x => x.Workerid == item.id);
                    if (findItem == undefined) {
                        listShowNew.push(item);
                    }
                })
                setListWorkerShow(listShowNew);
            } else {
                setListWorkerShow(listWorker);
            }
        }
    }

    const updateDropdownWorker = () => {
        if (listWorker && listWorker.length > 0) {
            let listShowNew: IReason[] = [];
            if (listAbsenseWorker && listAbsenseWorker.length > 0) {
                listWorker.forEach(item => {
                    let findItem = listAbsenseWorker.find(x => x.Workerid == item.id);
                    if (findItem == undefined) {
                        listShowNew.push(item);
                    }
                })
                setListWorkerShow(listShowNew);
            } else {
                setListWorkerShow(listWorker);
            }
        }
    }

    const handleChangeInput = (e: any, index: number, fieldName: string) => {
        let value = e;
        if (listAbsenseWorker.length > 0) {
            listAbsenseWorker[index].NumberWorkOff = value;
        }
        listAbsenseWorker[index].listError = validateField(value, Rules, 'NumberWorkOff', listAbsenseWorker[index].listError);

        setlistAbsenseWorker([...listAbsenseWorker]);
    }

    const handleChangeInputNote = (e: any, index: number, fieldName: string) => {
        let value = e.nativeEvent.text;
        if (listAbsenseWorker.length > 0) {
            listAbsenseWorker[index].OrtherReason = value;
        }
        listAbsenseWorker[index].listError = validateField(value, Rules, 'OrtherReason', listAbsenseWorker[index].listError);

        setlistAbsenseWorker([...listAbsenseWorker]);
    }

    const dataWorkerShowDropdown = (item: IWorker) => {
        if (item?.Workerid == '') {
            return listWorkerShow;
        }
        let ListDataNew: IReason[] = JSON.parse(JSON.stringify(listWorkerShow));
        let findItem = ListDataNew.find(x => x.id == item.Workerid);
        if (findItem == undefined) {
            let findItemNew = listWorker.find(x => x.id == item.Workerid);
            if (findItemNew != undefined)
                ListDataNew.push(findItemNew);
        }
        return ListDataNew;
    }

    useEffect(() => {
        setlistAbsenseWorker([...listAbsenseWorkerProps])
    }, [])

    useEffect(() => {
        getDataReasonDropdown()
        getDataWorkerDropdown()
        return () => {
            // set default data
            setAbsenseReason([]);
            setlistAbsenseWorker([]);
            setListWorker([]);
        }
    }, [])


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.textHeaderLabel}>
                    Danh sách công nhân nghỉ {listAbsenseWorker.length > 0 ? '(' + listAbsenseWorker.length + ')' : null}
                </Text>
            </View>
            <View
                // style={{ flex: 1 }}
                style={{ height: deviceHeight - styles.header.height - styles.submit.height - heightStatusBar - styles.plusButton.height - styles.plusButton.marginTop - HeightTitleAppPage }}
            >
                <ScrollView>
                    <View>
                        {
                            listAbsenseWorker && listAbsenseWorker.length > 0 ?
                                listAbsenseWorker.map((item, j) => {
                                    return (
                                        <View style={{ flexDirection: 'row', width: '100%', backgroundColor: '#ffffff', marginBottom: 15 }} key={j}>
                                            <View style={{ width: 30, alignItems: 'center', marginTop: 32 }}>
                                                <TouchableOpacity
                                                    onPress={() => { handleRemoveItem(item) }}
                                                >
                                                    <Svg width="24" height="25" viewBox="0 0 24 25" fill="none" >
                                                        <Circle cx="12" cy="12.1923" r="9" fill="#CCE5FF" />
                                                        <Path d="M7 12.1923H17" stroke="#003350" stroke-width="2" stroke-linecap="round" />
                                                    </Svg>
                                                </TouchableOpacity>
                                            </View>

                                            <View style={{ width: deviceWidth - 30, backgroundColor: '#ffffff' }}>
                                                <View style={styles.content}>
                                                    <View style={styles.textInputContent}>
                                                        <View style={{ width: 100 }}>
                                                            <Text style={styles.label}>Nhân viên:
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: deviceWidth - 100 - 20, height: '80%' }}>
                                                            <SelectBaseVer2
                                                                key={item.Id}
                                                                popupTitle='Danh sách công nhân'
                                                                title='Chọn công nhân'
                                                                listData={dataWorkerShowDropdown(item)}
                                                                onSelect={(data) => {

                                                                    if (listAbsenseWorker.length > 0) {
                                                                        listAbsenseWorker[j].Workerid = data[0];
                                                                    }
                                                                    listAbsenseWorker[j].listError = validateField(data[0], Rules, 'Workerid', item.listError);
                                                                    setlistAbsenseWorker([...listAbsenseWorker]);

                                                                    updateDropdownWorker();
                                                                }}
                                                                styles={styles.inputBox}
                                                                stylesIcon={{ position: 'absolute', zIndex: -1, right: 10, top: 20 }}
                                                                valueArr={[item.Workerid]}
                                                                isSelectSingle={true}
                                                            />
                                                            {
                                                                item?.listError?.length > 0 ?
                                                                    item?.listError?.map((err, j) => {
                                                                        if (err.fieldName == 'Workerid') {
                                                                            return (
                                                                                <Text key={j} style={{ color: 'red', paddingLeft: 15, margin: 0, height: 25, fontFamily: 'Mulish-SemiBold', fontSize: 13 }}>{err.mes}</Text>
                                                                            )
                                                                        }
                                                                    })
                                                                    :
                                                                    null
                                                            }
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={styles.content}>
                                                    <View style={styles.textInputContent}>
                                                        <View style={{ width: 100 }}>
                                                            <Text style={styles.label}>Lý do nghỉ:
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: deviceWidth - 100 - 20, height: '80%' }}>
                                                            <SelectBaseVer2
                                                                listData={absenseReason}
                                                                popupTitle='Lý do nghỉ'
                                                                styles={styles.inputBox}
                                                                onSelect={(data) => {
                                                                    if (listAbsenseWorker.length > 0) {
                                                                        listAbsenseWorker[j].ReasonCode = data[0];
                                                                    }
                                                                    listAbsenseWorker[j].listError = validateField(data[0], Rules, 'ReasonCode', item.listError);
                                                                    setlistAbsenseWorker([...listAbsenseWorker]);
                                                                }}
                                                                title='Chọn lý do'
                                                                stylesIcon={{ position: 'absolute', zIndex: -1, right: 10, top: 20 }}
                                                                valueArr={[item.ReasonCode]}
                                                                isSelectSingle={true}
                                                            />
                                                            {
                                                                item?.listError?.length > 0 ?
                                                                    item.listError.map((err, j) => {
                                                                        if (err.fieldName == 'ReasonCode') {
                                                                            return (
                                                                                <Text key={j} style={{ color: 'red', paddingLeft: 15, margin: 0, height: 25, fontFamily: 'Mulish-SemiBold', fontSize: 13 }}>{err.mes}</Text>
                                                                            )
                                                                        }
                                                                    })
                                                                    :
                                                                    null
                                                            }
                                                        </View>
                                                    </View>
                                                </View>

                                                {
                                                    item.ReasonCode && item.ReasonCode == 'LDK' ?
                                                        (
                                                            <View style={styles.content}>
                                                                <View style={styles.textInputContent}>
                                                                    <View style={{ width: 100 }}>
                                                                        <Text style={styles.label}>Ghi chú:</Text>
                                                                    </View>
                                                                    <View style={{ width: deviceWidth - 100 - 20, height: '80%' }}>
                                                                        <TextInput
                                                                            onChange={(e) => {
                                                                                handleChangeInputNote(e, j, 'OrtherReason')
                                                                            }}
                                                                            style={{ ...styles.inputBox }}
                                                                            maxLength={100}
                                                                            placeholder='Vd: Có việc bận...'
                                                                            placeholderTextColor='#AAABAE'
                                                                            value={item.OrtherReason}
                                                                        />
                                                                        {
                                                                            item?.listError?.length > 0 ?
                                                                                item.listError.map((err, j) => {
                                                                                    if (err.fieldName == 'OrtherReason') {
                                                                                        return (
                                                                                            <Text key={j} style={{ color: 'red', paddingLeft: 15, margin: 0, height: 25, fontFamily: 'Mulish-SemiBold', fontSize: 13 }}>{err.mes}</Text>
                                                                                        )
                                                                                    }
                                                                                })
                                                                                :
                                                                                null
                                                                        }
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        )
                                                        :
                                                        null
                                                }

                                                <View style={styles.content}>
                                                    <View style={styles.textInputContent}>
                                                        <View style={{ width: 100 }}>
                                                            <Text style={styles.label}>Số công nghỉ:</Text>
                                                        </View>
                                                        <View style={{ width: deviceWidth - 100 - 20, height: '80%' }}>
                                                            {/* <TextInput
                                                                onChange={(e) => {
                                                                    handleChangeInput(e, j, 'NumberWorkOff')
                                                                }}
                                                                style={{ ...styles.inputBox }}
                                                                keyboardType='numeric'
                                                                maxLength={5}
                                                                placeholder='Vd: 0.25, 0.5, 1.0...'
                                                                placeholderTextColor={'#ddddd'}

                                                                value={item.NumberWorkOff + ''}
                                                            /> */}
                                                            <InputSpinner
                                                                step={0.25}
                                                                //precision={1}
                                                                max={1}
                                                                min={0.25}
                                                                type={"real"}
                                                                skin="round"
                                                                editable={false}
                                                                buttonStyle={{ backgroundColor: '#00598C' }}
                                                                style={{ width: 160, marginLeft: 20, height: 30, backgroundColor: '#00598C' }}
                                                                value={item.NumberWorkOff + ''}
                                                                colorMax={"#00598C"}
                                                                colorMin={"#00598C"}
                                                                onChange={(num) => {
                                                                    handleChangeInput(num, j, 'NumberWorkOff')
                                                                }}
                                                            />
                                                            {
                                                                item?.listError?.length > 0 ?
                                                                    item.listError.map((err, j) => {
                                                                        if (err.fieldName == 'NumberWorkOff') {
                                                                            return (
                                                                                <Text key={j} style={{ color: 'red', paddingLeft: 10, margin: 0, height: 25, fontFamily: 'Mulish-SemiBold', }}>{err.mes}</Text>
                                                                            )
                                                                        }
                                                                    })
                                                                    :
                                                                    null
                                                            }

                                                        </View>
                                                    </View>
                                                </View>

                                            </View>
                                        </View>
                                    )
                                })
                                :
                                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', backgroundColor: '#F4F4F9', paddingHorizontal: 15, alignContent: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#001E31', fontFamily: 'Mulish-SemiBold' }}>
                                        Vui lòng nhấn thêm thông tin công nhân nghỉ
                                    </Text>
                                </View>
                        }
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <TouchableOpacity style={styles.plusButton}
                            onPress={() => handleAddMoreForm()}>
                            <Svg width="20" height="21" viewBox="0 0 20 21" fill="none" >
                                <Circle cx="10" cy="10.1923" r="7.5" fill="#CCE5FF" />
                                <Path d="M9.99935 14.1507C10.1799 14.1507 10.3293 14.0918 10.4477 13.974C10.5655 13.8557 10.6243 13.7062 10.6243 13.5257V10.8173H13.3535C13.5202 10.8173 13.6627 10.7582 13.781 10.6398C13.8988 10.5221 13.9577 10.3729 13.9577 10.1923C13.9577 10.0118 13.8988 9.86234 13.781 9.74401C13.6627 9.62623 13.5132 9.56734 13.3327 9.56734H10.6243V6.83818C10.6243 6.67151 10.5655 6.52929 10.4477 6.41151C10.3293 6.29318 10.1799 6.23401 9.99935 6.23401C9.81879 6.23401 9.66963 6.29318 9.55185 6.41151C9.43352 6.52929 9.37435 6.67845 9.37435 6.85901V9.56734H6.64518C6.47852 9.56734 6.33629 9.62623 6.21852 9.74401C6.10018 9.86234 6.04102 10.0118 6.04102 10.1923C6.04102 10.3729 6.10018 10.5221 6.21852 10.6398C6.33629 10.7582 6.48546 10.8173 6.66602 10.8173H9.37435V13.5465C9.37435 13.7132 9.43352 13.8557 9.55185 13.974C9.66963 14.0918 9.81879 14.1507 9.99935 14.1507Z" fill="url(#paint0_linear_938_3918)" />
                                <Defs>
                                    <LinearGradient id="paint0_linear_938_3918" x1="9.99935" y1="6.23401" x2="9.99935" y2="14.1507" gradientUnits="userSpaceOnUse">
                                        <Stop stop-color="#003350" />
                                        <Stop offset="1" stop-color="#00598C" />
                                    </LinearGradient>
                                </Defs>
                            </Svg>
                            <Text style={{ color: '#003350', fontFamily: 'Mulish-SemiBold' }}>Thêm người nghỉ</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            <View style={styles.submit}>
                <View style={{ height: 40, width: '30%', paddingRight: 20 }}>
                    <TouchableOpacity style={styles.exitButton} onPress={onPressHandleClose} >
                        <View>
                            <Text style={{ color: '#006496', fontFamily: 'Mulish-SemiBold' }}>Hủy </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 40, width: '30%' }}>
                    <TouchableOpacity style={styles.submitButton} onPress={onPressHandleSubmit}>
                        <View>
                            <Text style={{ color: '#ffffff', fontFamily: 'Mulish-SemiBold' }}>Báo nghỉ</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#F4F4F9',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
        flexDirection: 'column',
        flex: 1,
        // paddingHorizontal: 5
    },
    header: {
        justifyContent: 'center',
        paddingLeft: 18,
        borderBottomColor: '#001E31',
        height: 60,
        backgroundColor: '#F4F4F9'
    },
    content: {
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
    },
    submit: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: 80,
        backgroundColor: '#FFFFFF',
        paddingRight: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
    },
    plusButton: {
        alignContent: 'flex-end',
        flexDirection: 'row',
        backgroundColor: '#E3F0FE',
        borderRadius: 5,
        width: '42%',
        height: 40,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',

    },
    textInputContent: {
        flexDirection: 'row',
        height: 90,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eaeaea",
        paddingVertical: 8,
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Mulish-SemiBold',
    },
    textHeaderLabel: {
        fontWeight: '600',
        fontSize: 16,
        fontFamily: 'Mulish-SemiBold',
        color: '#001E31'
    },
    label: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        justifyContent: 'center',
        width: '100%',
        color: '#1B3A4E',
        paddingBottom: 2,
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Mulish-SemiBold',
    },
    inputBox: {
        color: '#001E31',
        paddingTop: 15,
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Mulish-SemiBold',
    },
    dropdownBox: {
        width: '100%',
        color: '#001E31',
        fontSize: 12,
        backgroundColor: '#fffffff',
        justifyContent: 'flex-start',
        paddingLeft: 150
    },
    labelField: {
        width: '40%',
        height: '50%',
        color: '#001E31',
    },
    submitButton: {
        alignItems: 'center',
        backgroundColor: '#004B72',
        height: 35,
        justifyContent: 'center'
    },
    exitButton: {
        alignItems: 'center',
        backgroundColor: '#ffffff',
        height: 35,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#137DB9'
    }
})

export default AbsenseWorkerModal;
