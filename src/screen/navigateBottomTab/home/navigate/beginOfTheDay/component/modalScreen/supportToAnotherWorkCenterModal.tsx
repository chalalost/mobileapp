import { NavigationProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import baseAction from '../../../../../../base/saga/action';
import { ApiCommon, ApiProductionRecord, DropDownType, ResponseService } from '../../../../../../share/app/constantsApi';
import { generateGuid, IError, IRule, validateField, validateForm } from '../../../../../../share/commonVadilate/validate';
import CommonBase from '../../../../../../share/network/axios';
import { IWorkerSupportOther } from '../../../endOfTheDay/types/recordWorkerDataTypes';


export interface RecordSupportDateWorkerProps {
    navigation: NavigationProp<any, any>,
    handleCancel: any,
    handleSubmit: Function,
    workcenterid: string | '',
    listSupportOtherWorkerProps: IWorkerSupportOther[]
};

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const SupportToAnotherWorkCenterModal: React.FC<RecordSupportDateWorkerProps> = ({ navigation, handleCancel, handleSubmit, workcenterid, listSupportOtherWorkerProps }) => {
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, []);
    const [listSupportOtherWorker, setListSupportOtherWorker] = useState<IWorkerSupportOther[]>([]);

    const onPressHandleClose = () => {
        if (handleCancel)
            handleCancel()
    }

    useEffect(() => {
        setListSupportOtherWorker([...listSupportOtherWorkerProps])
    }, [])

    useEffect(() => {
        return () => {
            // set default data
            setListSupportOtherWorker([]);
        }
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.textHeaderLabel}>
                    Danh sách công nhân đi hỗ trợ  {listSupportOtherWorker.length > 0 ? '(' + listSupportOtherWorker.length + ')' : null}
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
                            listSupportOtherWorker && listSupportOtherWorker.length > 0 ?
                                listSupportOtherWorker.map((item, j) => {
                                    return (
                                        <View style={{ flexDirection: 'row', width: '100%', backgroundColor: '#ffffff', marginBottom: 15 }} key={j}>
                                            <View style={{ width: 30, alignItems: 'center', marginTop: 28 }}>
                                            </View>

                                            <View style={{ width: deviceWidth - 30, backgroundColor: '#ffffff' }}>
                                                <View style={styles.content}>
                                                    <View style={styles.textInputContent}>
                                                        <View style={{ width: 100 }}>
                                                            <Text style={styles.label}>Nhân viên:
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: deviceWidth - 100 - 20, height: '80%' }}>
                                                            <TextInput
                                                                editable={false}
                                                                style={{ ...styles.inputBox }}
                                                                maxLength={100}
                                                                placeholder='Công nhân đi hỗ trợ'
                                                                placeholderTextColor='#AAABAE'
                                                                value={item.Workercode + ' - ' + item.Workername}
                                                            />

                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={styles.content}>
                                                    <View style={styles.textInputContent}>
                                                        <View style={{ width: 100 }}>
                                                            <Text style={styles.label}>Đi hỗ trợ tổ:
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: deviceWidth - 100 - 20, height: '84%' }}>
                                                            <TextInput
                                                                key={item.Workerid}
                                                                editable={false}
                                                                style={{ ...styles.inputBox }}
                                                                maxLength={100}
                                                                placeholder='Đi hỗ trợ cho tổ ...'
                                                                placeholderTextColor='#AAABAE'
                                                                value={item.WorkcenterTo}
                                                            />

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
                                        Không có công nhân đi hỗ trợ
                                    </Text>
                                </View>
                        }
                    </View>
                </ScrollView>
            </View>

            <View style={styles.submit}>
                <View style={{ height: 40, width: '30%', paddingRight: 20 }}>
                    <TouchableOpacity style={styles.exitButton} onPress={onPressHandleClose}>
                        <View>
                            <Text style={{ color: '#003350', fontFamily: 'Mulish-SemiBold' }}>Đóng </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {/* <View style={{ height: 40, width: '30%' }}>
                    <TouchableOpacity style={styles.submitButton} onPress={onPressHandleSubmit}>
                        <View>
                            <Text style={{ color: '#ffffff' }}>Lưu</Text>
                        </View>
                    </TouchableOpacity>
                </View> */}
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
        elevation: 5,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
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
        height: 80
    },
    wrapBody: {
        borderBottomColor: '#001E31',
        height: '50%',
        backgroundColor: '#ffffff'
    },
    submit: {
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
        shadowOpacity: 0.4,
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
        color: '#001E31CC',
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Mulish-SemiBold',
    },
    inputBox: {
        width: '100%',
        height: 50,
        paddingLeft: 10,
        paddingRight: 25,
        color: '#001E31',
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
        color: '#1B3A4E',
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

export default SupportToAnotherWorkCenterModal;
