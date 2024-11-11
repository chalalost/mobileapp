import { NavigationProp } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions, ScrollView, RefreshControl, Alert } from 'react-native'
import CommonBase from "../../../../../share/network/axios";
import { RequestService } from "../../../../../share/app/constantsApi";

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

export interface SubmitProductionRecordScreenProps {
    navigation: NavigationProp<any, any>,
};

export default function SubmitOTProductionRecordScreen({ navigation }: SubmitProductionRecordScreenProps) {

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, []);
    const [returnQR, setReturnQR] = useState();
    const requestData = {
        Workordercode: "string",
        Workerid: "string",
        workcenterid: "string",
        Stepid: "string"
    }
    // truyen them stepId
    const postDataRecord = async () => {
        let dataRequest = await CommonBase.postAsync<RequestService>("/api/production-management-service/record-manufacturing-moblie/get-list-step-to-support", requestData)
        if (typeof dataRequest !== 'string' && dataRequest != null && dataRequest.isSuccess === true) {
            Alert.alert(dataRequest.message)
            return dataRequest.message
        }
    }

    const onPressReturnQr = () => {
        navigation.navigate('QRScanScreen')
    }

    const onPressHandleClose = () => {
        navigation.navigate('InputScreen')
    }

    const onPressHandleNextStep = () => {
        navigation.navigate('SubmitOTScreen')
    }

    return (
        <SafeAreaView
            style={styles.container}>
            {/* header */}
            <View style={styles.header}>
                <Text style={styles.textHeaderLabel}>
                    Nhập số lượng sản xuất
                </Text>
            </View>
            <View style={{ height: deviceHeight - styles.header.height - deviceHeight }}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <View style={styles.content}>
                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Ghi nhận SL cho:
                            </Text>
                            <TextInput placeholder='Nguyen van a'
                                style={styles.inputBox} />
                        </View>
                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Công đoạn:
                            </Text>
                            <TextInput placeholder='Nhập công đoạn'
                                style={styles.inputBox} />
                        </View>
                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Đầu cắt part:
                            </Text>
                            <TextInput placeholder='Nhập đầu cutpart'
                                style={styles.inputBox} />
                        </View>
                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Đầu cắt part trước đó:
                            </Text>
                            <Text style={styles.input}>990</Text>
                        </View>
                        <View style={styles.label}>
                            <Text style={styles.labelField}>
                                Nhập sản lượng:
                            </Text>
                            <TextInput placeholder='Nhập sản lượng' style={styles.inputBox} />
                        </View>
                    </View>
                </ScrollView>
            </View>
            {/* submit */}
            <View style={styles.submit}>
                <TouchableOpacity style={styles.submitButton} onPress={onPressHandleNextStep}>
                    <View>
                        <Text style={{ color: '#ffffff' }}>Công đoạn tiếp theo</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={onPressReturnQr}>
                    <View>
                        <Text style={{ color: '#ffffff' }}>Ghi nhận </Text>
                    </View>
                </TouchableOpacity>
                <View style={{ height: 40, width: '50%' }}>
                    <TouchableOpacity onPress={onPressHandleClose} style={{ alignContent: 'center', paddingLeft: 70 }} >
                        <Image
                            style={{
                                width: '30%',
                                height: 40,
                            }}
                            source={require('../../../../../../images/login/ios-close-2-48.png')} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
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
        marginTop: 10,
        borderBottomColor: '#001E31',
        borderBottomWidth: 1,
        height: 25
    },
    content: {
        height: '50%',
        alignItems: 'flex-start',
        marginBottom: 10
    },
    submit: {
        flexDirection: 'column',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#001E31'
    },
    textHeaderLabel: {
        fontWeight: '700',
        fontSize: 16,
        //fontFamily: 'Mulish',
        lineHeight: 20,
        color: '#001E31'
    },
    label: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
        paddingTop: 15,
        color: '#001E31',
    },
    inputBox: {
        borderRadius: 2,
        borderBottomWidth: 0.5,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderTopWidth: 0.5,
        width: '50%',
        height: 40,
        paddingTop: 8,
        paddingLeft: 15,
        color: '#001E31',
        fontSize: 12,
    },
    inputWithQr: {
        justifyContent: "center",
        borderRadius: 4,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        width: '40%',
        height: '80%',
        color: '#001E31',
    },
    input: {
        justifyContent: "center",
        alignItems: "center",
        width: '50%',
        height: '80%',
        color: '#001E31'
    },
    labelField: {
        width: '40%',
        justifyContent: "center",
        alignItems: "center",
        color: '#001E31'
    },
    submitButton: {
        alignItems: 'center',
        backgroundColor: '#003350',
        width: '50%',
        height: '18%',
        marginTop: 10,
        marginBottom: 32,
        justifyContent: 'center'
    }
})
