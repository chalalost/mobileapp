import { NavigationProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, NativeSyntheticEvent, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInputChangeEventData, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import baseAction from '../../../../../../base/saga/action';
import { ApiCommon, DropDownType, ResponseService } from '../../../../../../share/app/constantsApi';
import { generateGuid, IError, IRule, validateField, validateForm } from '../../../../../../share/commonVadilate/validate';
import CommonBase from '../../../../../../share/network/axios';
import { IWorker } from '../../../beginOfTheDay/types/reportWorkerTypes';
import { ISupportWorker } from '../../types/recordWorkerDataTypes';
import SelectBaseVer2 from '../../../../../../share/base/component/selectBase/selectBaseVer2';



const Rules: IRule[] = [
    {
        field: 'Workerid',
        required: true,
        maxLength: 255,
        minLength: 0,
        typeValidate: 0,
        valueCheck: false,
        maxValue: 0,
        messages: {
            required: 'Vui lòng chọn nhân viên',
            minLength: '',
            maxLength: '',
            validate: '',
            maxValue: ''
        }
    },
]

interface IDropdown {
    id: string | '',
    name: string | '',
    code: string | ''
}

export interface RecordSupportDateWorkerProps {
    navigation: NavigationProp<any, any>,
    handleCancel: any,
    handleSubmit: Function,
    workcenterid: string | '',
    listSupportWorkerProps: ISupportWorker[]
};

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const RecordSupportDateWorkerScreen: React.FC<RecordSupportDateWorkerProps> = ({ navigation, handleCancel, handleSubmit, workcenterid, listSupportWorkerProps }) => {
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, []);
    const [listWorker, setListWorker] = useState<IDropdown[]>([]);
    const [listWorkerShow, setListWorkerShow] = useState<IDropdown[]>([]);
    const [listSupportWorker, setListSupportWorker] = useState<ISupportWorker[]>([]);

    const handleSearchKeyword = (e: string) => {
        const value = e;
        getDataWorkerDropdown(value)
    }

    const handleAddMoreForm = () => {
        getDataWorkerDropdown('')
        let isCheckVadilate = true;
        if (listSupportWorker.length > 0) {
            listSupportWorker.forEach(item => {
                item.listError = validateForm(item, Rules, []);
                if (item.listError.length > 0) {
                    isCheckVadilate = false;
                }
            })
        }
        if (isCheckVadilate === true) {
            let data: ISupportWorker = {
                Id: generateGuid(),
                Workerid: '',
                Workercode: '',
                Workername: '',
                listError: []
            }
            listSupportWorker.push(data);
        }
        setListSupportWorker([...listSupportWorker]);
    }
    const handleRemoveItem = (item: ISupportWorker) => {
        if (listSupportWorker.length > 0) {
            let index = -1;
            listSupportWorker.forEach((Worker, j) => {
                if (Worker.Workerid == item.Workerid) {
                    index = j;
                }
            })
            if (index >= 0) {
                listSupportWorker.splice(index, 1);
                setListSupportWorker([...listSupportWorker])
            }
        }
    }

    const getDataWorkerDropdown = async (search: string) => {
        let dataRequest = {
            type: DropDownType.WorkerSupportWorkCenter,
            search: search,
            code: workcenterid,
            typeWorkcenter: 1
        }
        let dataDropdownRes = await CommonBase.getAsync<ResponseService>(ApiCommon.GET_API_COMMON + '?type=' + dataRequest.type + '&search=' + dataRequest.search
            + '&code=' + dataRequest.code + '&typeWorkcenter=' + dataRequest.typeWorkcenter, null)
        if (typeof dataDropdownRes !== 'string' && dataDropdownRes != null && dataDropdownRes.isSuccess === true) {
            setListWorker(dataDropdownRes.data);
            setListWorkerShow(dataDropdownRes.data);
            updateDropdownWorkerNew(dataDropdownRes.data, listSupportWorkerProps)
        }
    }

    const onPressHandleClose = () => {
        if (handleCancel)
            handleCancel()
    }
    const onPressHandleSubmit = async () => {
        let isCheckVadilate = true;
        if (listSupportWorker.length > 0) {
            listSupportWorker.forEach(item => {
                item.listError = validateForm(item, Rules, []);
                if (item.listError.length > 0) {
                    isCheckVadilate = false;
                }
            })
        }
        if (isCheckVadilate === true) {
            handleSubmit(listSupportWorker)
        }
        setListSupportWorker([...listSupportWorker])
    }

    const updateDropdownWorkerNew = (listWorker: IDropdown[], listSupportWorkerProps: ISupportWorker[]) => {
        if (listWorker && listWorker.length > 0) {
            let listShowNew: IDropdown[] = [];
            if (listSupportWorkerProps && listSupportWorkerProps.length > 0) {
                listWorker.forEach(item => {
                    let findItem = listSupportWorkerProps.find(x => x.Workerid == item.id);
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

    const updateDropdownSupport = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
        if (listWorker && listWorker.length > 0) {
            let listShowNew: IDropdown[] = [];
            if (listSupportWorker && listSupportWorker.length > 0) {
                listWorker.forEach(item => {
                    let findItem = listSupportWorker.find(x => x.Workerid == item.id);
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

    const dataWorkerShowDropdown = (item: ISupportWorker) => {
        if (item?.Workerid == '') {
            //const CustomDataWorkerLoadOut = listWorkerShow.slice(0, 50);
            return listWorkerShow;
        }
        let ListDataNew: IDropdown[] = JSON.parse(JSON.stringify(listWorkerShow));
        let findItem = ListDataNew.find(x => x.id == item.Workerid);
        if (findItem == undefined) {
            let findItemNew = listWorker.find(x => x.id == item.Workerid);
            if (findItemNew != undefined)
                ListDataNew.push(findItemNew);
        }
        return ListDataNew;
    }

    useEffect(() => {
        setListSupportWorker([...listSupportWorkerProps])
    }, [])

    useEffect(() => {
        getDataWorkerDropdown('')
        return () => {
            // set default data
            setListWorker([]);
            setListSupportWorker([]);
        }
    }, [])

    return (
        <SafeAreaView
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.textHeaderLabel}>
                    Danh sách công nhân hỗ trợ  {listSupportWorker.length > 0 ? '(' + listSupportWorker.length + ')' : null}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <View>
                        {
                            listSupportWorker && listSupportWorker.length > 0 ?
                                listSupportWorker.map((item, j) => {
                                    return (
                                        <View style={{ flexDirection: 'row', width: '100%', backgroundColor: '#ffffff', marginBottom: 15, height: 80 }} key={j}>
                                            <View style={{ width: 30, alignItems: 'center', marginTop: 28 }}>
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
                                                        <View style={{ width: deviceWidth - 100 - 20, height: '95%' }}>
                                                            <SelectBaseVer2
                                                                popupTitle='Danh sách công nhân'
                                                                listData={dataWorkerShowDropdown(item)}
                                                                onSelect={(data) => {
                                                                    if (listSupportWorker.length > 0) {
                                                                        listSupportWorker[j].Workerid = data[0];
                                                                        const obj = listWorker.find((x) => x.id == data[0]);
                                                                        if (obj != null) {
                                                                            listSupportWorker[j].Workercode = obj.code ?? null
                                                                            listSupportWorker[j].Workername = obj.name ?? null
                                                                        }
                                                                    }
                                                                    listSupportWorker[j].listError = validateField(data[0], Rules, 'Workerid', item.listError);
                                                                    setListWorkerShow([...listWorkerShow])
                                                                    updateDropdownSupport()
                                                                }}
                                                                styles={styles.inputBox}
                                                                searchBoxTextChanged={(data: string) => {
                                                                    handleSearchKeyword(data)
                                                                }}
                                                                title='Vui lòng chọn nhân viên'
                                                                stylesIcon={{ position: 'absolute', zIndex: -1, right: 10, top: 15 }}
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
                                            </View>
                                        </View>
                                    )
                                })
                                :
                                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', backgroundColor: '#F4F4F9', paddingHorizontal: 15, alignContent: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#001E31' }}>
                                        Vui lòng nhấn thêm thông tin công nhân hỗ trợ
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
                            <Text style={{ color: '#003350', fontFamily: 'Mulish-SemiBold' }}>Thêm người hỗ trợ</Text>
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
                            <Text style={{ color: '#ffffff', fontFamily: 'Mulish-SemiBold' }}>Lưu</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        width: '100%',
        backgroundColor: '#F4F4F9',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
        flexDirection: 'column',

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
    wrapBody: {
        borderBottomColor: '#001E31',
        height: '50%',
        backgroundColor: '#ffffff'
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
        width: '50%',
        height: 40,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        justifyContent: 'center',
        margin: 10
    },
    textInputContent: {
        flexDirection: 'row',
        height: 80,
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

export default RecordSupportDateWorkerScreen;
