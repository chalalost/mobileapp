import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import CommonBase from '../../../share/network/axios';
import { ResponseService } from '../../../share/app/constantsApi';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryStack, VictoryAxis, VictoryLabel } from "victory-native";
import { ApiGateway } from '../../../share/network/apiGateway';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MyTitleHome from '../../../share/base/component/myStatusBar/MyTitleHome';
const screenWidth = Dimensions.get("window").width;


export interface ReportQualityScreenProps {
    navigation: NavigationProp<any, any>
};


export type DataSet = {
    data: Array<Number>;
};
export type BarChartData = {
    labels: Array<String>;
    datasets: Array<DataSet>;
};

const rows = 3;
const cols = 3;
const marginHorizontal = 0;
const marginVertical = 10;
const width = (Dimensions.get('window').width / cols) - (marginHorizontal * (cols + 1));
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

interface IReportQualityResponse {
    Fieldname: string | ''
    QtyLotQA: number | 0
    QtyLotQA_OK: number | 0
    QtyLotQA_NG: number | 0
    QtyLotQA_NotChecked: number | 0
    Rate_NG: number | 0
}

const data2012 = [
    { quarter: 1, earnings: 13000 },
    { quarter: 2, earnings: 16500 },
    { quarter: 3, earnings: 14250 },
    { quarter: 4, earnings: 19000 }
];

const data2013 = [
    { quarter: 1, earnings: 15000 },
    { quarter: 2, earnings: 12500 },
    { quarter: 3, earnings: 19500 },
    { quarter: 4, earnings: 13000 }
];

const data2014 = [
    { quarter: 1, earnings: 11500 },
    { quarter: 2, earnings: 13250 },
    { quarter: 3, earnings: 20000 },
    { quarter: 4, earnings: 15500 }
];

const data2015 = [
    { quarter: 1, earnings: 18000 },
    { quarter: 2, earnings: 13250 },
    { quarter: 3, earnings: 15000 },
    { quarter: 4, earnings: 12000 }
];

const ReportQuality = ({ navigation }: ReportQualityScreenProps) => {
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, []);
    const [getdata, setData] = useState<Array<IReportQualityResponse>>([]);
    const DataInput = {
        FromTime: "2023-01-01T17:00:00.000Z",
        IsWorkOrderAll: false,
        IsWorkcenterAll: false,
        ToTime: "2023-01-30T11:57:28.031Z",
        TypeReport: 2,
        WorkOrder: [],
        Workcenter: ["aa3e7db8-dfc7-43dd-bc07-446ab580f010"],
    }
    const getData = async () => {
        let dataResponse = await CommonBase.postAsync<ResponseService>("/api/production-management-service/report/report-quality", DataInput);
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            setData(dataResponse.data)
        }
    }
    const [filterId, setTabId] = useState<number>(1);
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
                        domainPadding={20}
                        width={screenWidth}
                        theme={VictoryTheme.material}
                    >
                        <VictoryAxis
                            tickValues={[1, 2, 3, 4, 1, 2]}
                            tickFormat={['04/2022', '05/2022', '06/2022', '07/2022', '08/2022', '09/2022']}
                        />
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(x) => (`${x / 10}`)}
                        />
                        <VictoryStack
                            colorScale={["#9E4910", "#FFC000", "#ED7D31", "#997300"]}
                        >
                            <VictoryBar
                                data={data2012}
                                x="quarter"
                                y="earnings"
                                animate={{
                                    duration: 1500,
                                    onLoad: { duration: 1500 },
                                }}
                            />
                            <VictoryBar
                                data={data2013}
                                x="quarter"
                                y="earnings"
                                animate={{
                                    duration: 1500,
                                    onLoad: { duration: 1500 },
                                }}
                            />
                            <VictoryBar
                                data={data2014}
                                x="quarter"
                                y="earnings"
                                animate={{
                                    duration: 1500,
                                    onLoad: { duration: 1500 },
                                }}
                            />
                            <VictoryBar
                                data={data2015}
                                x="quarter"
                                y="earnings"
                                animate={{
                                    duration: 2000,
                                    onLoad: { duration: 2000 },
                                }}
                            />
                        </VictoryStack>
                    </VictoryChart>
                </View>
                <View style={[styles.grid]}>
                    <View style={[styles.gridleft]}>
                        <View style={[styles.label]}>
                            <Text style={[styles.box1]}></Text>
                            <Text style={[styles.text]}> Tỉ lệ Iot ng</Text>
                        </View>
                        <View style={[styles.label]}>
                            <Text style={[styles.box2]}></Text>
                            <Text style={[styles.text]}> Lot Qa OK</Text>
                        </View>
                    </View>
                    <View style={[styles.gridright]}>
                        <View style={[styles.label]}>
                            <Text style={[styles.box3]}></Text>
                            <Text style={[styles.text]}> Lot Qa chưa kiểm tra</Text>
                        </View>
                        <View style={[styles.label]}>
                            <Text style={[styles.box4]}></Text>
                            <Text style={[styles.text]}> Lot Qa NG</Text>
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
    graphStyle: {
        width: '100%',
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
        width: '100%',
        justifyContent: 'center',
    },
    grid: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 40,
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
        height: 20,
        backgroundColor: '#9E4910',
        paddingRight: 5,
        borderRadius: 2
    },
    box2: {
        width: 20,
        height: 20,
        backgroundColor: '#FFC000',
        paddingRight: 5,
        borderRadius: 2
    },
    box3: {
        width: 20,
        height: 20,
        backgroundColor: '#ED7D31',
        paddingRight: 5,
        borderRadius: 2
    },
    box4: {
        width: 20,
        height: 20,
        backgroundColor: '#997300',
        paddingRight: 5,
        borderRadius: 2
    },
});
export default ReportQuality;