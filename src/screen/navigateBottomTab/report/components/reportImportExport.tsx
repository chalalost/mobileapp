import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import { VictoryBar, VictoryChart, VictoryGroup, VictoryAxis, VictoryTheme } from "victory-native";
import CommonBase from '../../../share/network/axios';
import { ResponseService } from '../../../share/app/constantsApi';
import { ApiGateway } from '../../../share/network/apiGateway';
import LinearGradient from 'react-native-linear-gradient';
import MyTitleHome from '../../../share/base/component/myStatusBar/MyTitleHome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ReportImportExportScreenProps {
    navigation: NavigationProp<any, any>
};

const rows = 3;
const cols = 3;
const marginHorizontal = 0;
const marginVertical = 10;
const width = (Dimensions.get('window').width);
const height = 110;

const DATA = {
    case1: [
        { x: 1, y: 210 },
        { x: 2, y: 180 },
        { x: 3, y: 250 },
        { x: 4, y: 100 },
        { x: 5, y: 240 },
        { x: 6, y: 220 },
    ],
    case2: [
        { x: 1, y: 400 },
        { x: 2, y: 250 },
        { x: 3, y: 600 },
        { x: 4, y: 200 },
        { x: 5, y: 700 },
        { x: 6, y: 550 },
    ],
}
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

interface IReportQuantityResponse {
    fieldname: string | ''
    qtyCancel: number | 0
    qtyOK: number | 0
    qtyOther: number | 0
    qtyRepair: number | 0
    qtyTotal: number | 0
    rateRepair: number | 0
    stt: number | 0
}
const ReportImportExport = ({ navigation }: ReportImportExportScreenProps) => {
    const [filterId, setTabId] = useState<number>(1);
    const [getdata, setData] = useState<Array<IReportQuantityResponse>>([]);
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, []);
    const DataInput = {
        //chua co data
    }
    const getData = async () => {
        //nhap xuat theo thoi diem
        let dataResponse = await CommonBase.postAsync<ResponseService>(ApiGateway.REPORT_API + "/api/material-management-service/inventory-report/inventory-by-time", DataInput);
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            setData(dataResponse.data);
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
    const insets = useSafeAreaInsets();
    const getDataFilter = (tabid: number) => {
        return tabid;
    }

    useEffect(() => {
        // Update the document title using the browser API
        getData();
    }, []);
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
                        width={width}
                        height={320}
                        theme={VictoryTheme.material}>
                        <VictoryGroup offset={15} >
                            <VictoryBar
                                data={[
                                    { x: 1, y: 210 },
                                    { x: 2, y: 180 },
                                    { x: 3, y: 250 },
                                    { x: 4, y: 100 },
                                    { x: 5, y: 240 },
                                ]}
                                animate={{
                                    duration: 2000,
                                    onLoad: { duration: 1000 },
                                }}
                                style={{
                                    data: {
                                        fill: '#00875A',
                                    },
                                }}
                                barWidth={10}
                            />
                            <VictoryBar
                                data={[
                                    { x: 1, y: 400 },
                                    { x: 2, y: 250 },
                                    { x: 3, y: 600 },
                                    { x: 4, y: 200 },
                                    { x: 5, y: 640 },
                                ]}
                                animate={{
                                    duration: 2000,
                                    onLoad: { duration: 1000 },
                                }}
                                style={{
                                    data: {
                                        fill: '#137DB9',
                                    },
                                }}
                                barWidth={10}
                            />
                            <VictoryAxis
                                tickValues={['09/2022', '10/2022', '11/2022', '12/2022', '01/2023']}
                                style={{
                                    tickLabels: { color: '#8F92A1' },
                                    ticks: { color: '#8F92A1' },
                                }}
                            />
                            <VictoryAxis
                                dependentAxis={true}
                                tickValues={[200, 300, 500, 750]}
                                style={{
                                    tickLabels: { fill: '#8F92A1' },
                                    ticks: { stroke: '#8F92A1' },
                                }}
                            />
                        </VictoryGroup>
                    </VictoryChart>
                </View>
                <View style={[styles.gird]}>
                    <View style={[styles.label]}>
                        <Text style={[styles.box1]}></Text>
                        <Text style={[styles.text]}> Xuất kho</Text>
                    </View>
                    <View style={[styles.label]}>
                        <Text style={[styles.box2]}></Text>
                        <Text style={[styles.text]}> Nhập kho</Text>
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
        paddingTop: 10,
        justifyContent: 'center',
    },
    gird: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
        width: '100%',
        padding: 20,
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
    },
    box1: {
        width: 20,
        height: 5,
        justifyContent: 'space-around',
        backgroundColor: '#137DB9',
        padding: 10,
        borderRadius: 1,
    },
    box2: {
        width: 20,
        height: 5,
        backgroundColor: '#00875A',
        padding: 10,
        borderRadius: 1,
    },
});
export default ReportImportExport;