import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryStack, VictoryAxis, VictoryLabel, VictoryGroup } from "victory-native";
import CommonBase from '../../../share/network/axios';
import { Authen } from "../reportSaga/type/reportTypes"
import axios from 'axios';
import { ApiGateway } from '../../../share/network/apiGateway';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MyTitleHome from '../../../share/base/component/myStatusBar/MyTitleHome';
const screenWidth = Dimensions.get("window").width;

export interface ReportProductionRepairScreenProps {
    navigation: NavigationProp<any, any>
};

const rows = 3;
const cols = 3;
const marginHorizontal = 0;
const marginVertical = 10;
const width = (Dimensions.get('window').width);
const height = 110;
const DATAFILTER = [
    {
        id: 1,
        title: '1 Tuần',
    },
    {
        id: 2,
        title: '1 Tháng',
    },
    {
        id: 3,
        title: '3 Tháng',
    },
    {
        id: 4,
        title: '6 Tháng',
    },
    {
        id: 5,
        title: 'Xem thêm',
    }
];

interface Iitem {
    id: number | ''
    title: string | ''
}

interface dataLogin {
    UserName: string | ''
    Password: string | ''
}


const ReportProductionRepair = ({ navigation }: ReportProductionRepairScreenProps) => {
    const insets = useSafeAreaInsets();
    const [filterId, setTabId] = useState<number>(1);
    const [data, setData] = useState<any>();
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, []);
    const DataInput = {
        FromTime: "2022-07-31T17:00:00.000Z",
        IsWorkcenterAll: true,
        ToTime: "2023-01-17T12:11:41.228Z",
        TypeReport: 1,
        Workcenter: "",
    }
    const getData = async () => {
        let data: dataLogin = {
            UserName: "admin@gmail.com",
            Password: "evomes!@#"
        }
        let dataAuth = await CommonBase.postAsync<Authen>("https://authen.viecgicungco.com/api/identity/mobi/login-mobile", data);
        let dataResponse = await axios.post(ApiGateway.REPORT_API + "/api/production-management-service/report/report-quality", DataInput);
        if (dataAuth != undefined && typeof dataAuth !== 'string' && dataAuth != null && dataAuth.Success == true) {
            CommonBase.setAuthHeader(dataAuth.Data.token);
        }
    }

    const renderfilter = (item: Iitem, index: number) => {
        return (
            <TouchableOpacity onPress={() => {
                if (filterId === item.id) {
                    return;
                }

                if (item.id) {
                    setTabId(item.id);
                    getDataFilter(item.id);
                }

                switch (item.id) {
                    case 1:
                        break;
                    default:
                        break;
                }
            }} key={index} style={styles.filterItem}>
                <Text style={[filterId === item.id ? { fontWeight: '800', color: '#001E31' } : null]}>{item.title}</Text>
            </TouchableOpacity>
        )
    };

    const getDataFilter = (tabid: number) => {
        return tabid;
    }

    useEffect(() => {
        // Update the document title using the browser API
        //getData();
    });
    return (
        <SafeAreaView style={[styles.container]}>
            <LinearGradient
                colors={['#003350', '#00598C']} style={[styles.linearGradient, { paddingTop: insets.top }]}>

                <MyTitleHome
                    navigation={navigation}
                    toggleDrawer={() => {
                        //navigation.toggleDrawer()
                    }}
                    isShowIconLeft={true}
                    component={null}
                    title="Trang chủ"
                    hidenStatusBar={true}
                    isShowIconRight={false}
                />
            </LinearGradient>
            <View style={[styles.filter]} >
                <FlatList
                    data={DATAFILTER}
                    renderItem={({ item, index, separators }) => renderfilter(item, index)}
                    keyExtractor={item => item.id.toString()}
                    horizontal={true}
                />
            </View>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={[styles.chart]}>
                    <VictoryChart
                        domainPadding={20}
                        width={screenWidth}
                        theme={VictoryTheme.material}
                    >
                        <VictoryGroup offset={15} domainPadding={20}>
                            <VictoryBar
                                data={[
                                    { x: 1, y: 21 },
                                    { x: 2, y: 18 },
                                    { x: 3, y: 25 },
                                    { x: 4, y: 10 },
                                ]}
                                animate={{
                                    duration: 1000,
                                    onLoad: { duration: 1000 },
                                }}
                                style={{
                                    data: {
                                        fill: '#983396',
                                    },
                                }}
                                barWidth={10}
                            />
                            <VictoryBar
                                data={[
                                    { x: 1, y: 35 },
                                    { x: 2, y: 25 },
                                    { x: 3, y: 65 },
                                    { x: 4, y: 21 },
                                ]}
                                animate={{
                                    duration: 1000,
                                    onLoad: { duration: 1000 },
                                }}
                                style={{
                                    data: {
                                        fill: '#FF5449',
                                    },
                                }}
                                barWidth={10}
                            />
                            <VictoryBar
                                data={[
                                    { x: 1, y: 12 },
                                    { x: 2, y: 25 },
                                    { x: 3, y: 40 },
                                    { x: 4, y: 56 },
                                ]}
                                animate={{
                                    duration: 1000,
                                    onLoad: { duration: 1000 },
                                }}
                                style={{
                                    data: {
                                        fill: '#137DB9',
                                    },
                                }}
                                barWidth={10}
                            />
                            <VictoryBar
                                data={[
                                    { x: 1, y: 40 },
                                    { x: 2, y: 25 },
                                    { x: 3, y: 24 },
                                    { x: 4, y: 53 },
                                ]}
                                animate={{
                                    duration: 1000,
                                    onLoad: { duration: 1000 },
                                }}
                                style={{
                                    data: {
                                        fill: '#5EB2F1',
                                    },
                                }}
                                barWidth={10}
                            />
                            <VictoryAxis
                                tickValues={['04/2022', '05/2022', '06/2022', '07/2022']}
                            />
                            <VictoryAxis
                                dependentAxis={true}
                                tickValues={[20, 30, 50, 75]}
                            />
                        </VictoryGroup>
                    </VictoryChart>
                </View>
                <View style={[styles.grid]}>
                    <View style={[styles.gridleft]}>
                        <View style={[styles.label]}>
                            <Text style={[styles.box1]}></Text>
                            <Text style={[styles.text]}> Tỉ lệ hủy</Text>
                        </View>
                        <View style={[styles.label]}>
                            <Text style={[styles.box2]}></Text>
                            <Text style={[styles.text]}> Tỉ lệ sửa thành công</Text>
                        </View>
                    </View>
                    <View style={[styles.gridright]}>
                        <View style={[styles.label]}>
                            <Text style={[styles.box3]}></Text>
                            <Text style={[styles.text]}> Tỉ lệ đang sửa </Text>
                        </View>
                        <View style={[styles.label]}>
                            <Text style={[styles.box4]}></Text>
                            <Text style={[styles.text]}> Tỉ lệ chờ sửa</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>

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
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fcfcff',
    },
    filter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: 12,
        backgroundColor: '#fcfcff',
        paddingBottom: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#C6C6C9'
    },
    filterItem: {
        padding: 10,
    },
    chart: {
        paddingLeft: 10,
        width: '100%',
        justifyContent: 'center',
    },
    grid: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 20,
        paddingRight: 10,
    },
    gridleft: {
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        paddingBottom: 10,
    },
    gridright: {
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        paddingBottom: 10,
        paddingRight: 20
    },
    text: {
        //fontFamily: 'Averta',
        fontWeight: "400",
        color: '#001E31'
    },
    label: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        width: '100%',
    },
    box1: {
        width: 20,
        height: 20,
        backgroundColor: '#983396',
        paddingRight: 5,
    },
    box2: {
        width: 20,
        height: 20,
        backgroundColor: '#FF5449',
        paddingRight: 5,
    },
    box3: {
        width: 20,
        height: 20,
        backgroundColor: '#137DB9',
        paddingRight: 5,
    },
    box4: {
        width: 20,
        height: 20,
        backgroundColor: '#5EB2F1',
        paddingRight: 5,
    },
});
export default ReportProductionRepair;