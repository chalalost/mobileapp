import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl, Alert } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryPie } from "victory-native";
import { ResponseService } from '../../../share/app/constantsApi';
import CommonBase from '../../../share/network/axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { ApiGateway } from '../../../share/network/apiGateway';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MyTitleHome from '../../../share/base/component/myStatusBar/MyTitleHome';
const screenWidth = Dimensions.get("window").width;

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

// const rows = 3;
// const cols = 3;
// const marginHorizontal = 0;
// const marginVertical = 10;
// const width = (Dimensions.get('window').width / cols) - (marginHorizontal * (cols + 1));
// const height = 110;

export interface ReportQuantityScreenProps {
    navigation: NavigationProp<any, any>,
};

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

const defaultGraphicData = [{ y: 0 }, { y: 0 }, { y: 100 }];// data default

const ReportQuantity = ({ navigation }: ReportQuantityScreenProps) => {
    const insets = useSafeAreaInsets();
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
        typeReportQuantity: 2,
        fromTime: "2023-01-01T17:00:00.000Z",
        toTime: "2023-01-30T11:57:28.031Z",
        isWorkcenterAll: true,
        isWorkerAll: true,
        isMachineAll: true,
        listWorkcenter: [],
        listWorker: [],
        listMachine: []
    }
    const getDataApi = async () => {
        //doi ve cong 81
        let dataResponse = await CommonBase.postAsync<ResponseService>("/api/production-management-service/report/quantity-report", DataInput);
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
    const getDataFilter = (tabid: number) => {
        return tabid;
    }

    useEffect(() => {
        getDataApi();
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
                    {getdata !== null && getdata.length > 0 ?
                        getdata.map((item: IReportQuantityResponse, j) => {
                            const graphicColor = ['#4BC0C0', '#FFFF00', '#FF6384', '#FF5449'];
                            const chartData = [
                                { y: item.qtyOK, x: 'SL đạt' },
                                { y: item.qtyTotal, x: 'SL hoàn thành' },
                                { y: item.qtyRepair, x: 'SL sửa chữa' },
                                { y: item.qtyCancel, x: 'SL hủy' },

                            ]
                            return (
                                <VictoryPie
                                    key={j}
                                    data={chartData}
                                    width={screenWidth}
                                    height={300}
                                    colorScale={graphicColor}
                                    innerRadius={50}
                                    labels={({ datum }) => `${datum.x}: ${datum.y}`}
                                    style={{
                                        labels: { fontSize: 12, fill: "gray" }
                                    }}
                                />
                            )
                        }) :
                        <VictoryPie
                            data={defaultGraphicData}
                            width={screenWidth}
                            height={300}
                            innerRadius={50}
                        />
                    }
                </View>
                <View>
                    <View style={[styles.gird]}>
                        <View style={[styles.label]}>
                            <Text style={[styles.box1]}></Text>
                            <TouchableOpacity>
                                <Text style={[styles.text]}> SL đạt</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.label]}>
                            <Text style={[styles.box2]}></Text>
                            <TouchableOpacity>
                                <Text style={[styles.text]}> SL hoàn thành</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.label]}>
                            <Text style={[styles.box3]}></Text>
                            <TouchableOpacity>
                                <Text style={[styles.text]}> SL sửa chữa</Text>
                            </TouchableOpacity>
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
    boxContainer2: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0
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
    chart: {
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
        fontSize: 14,
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
        backgroundColor: '#4BC0C0',
        paddingRight: 5,
    },
    box2: {
        width: 20,
        height: 20,
        backgroundColor: '#FFFF00',
        paddingRight: 5,
    },
    box3: {
        width: 20,
        height: 20,
        backgroundColor: '#FF6384',
        paddingRight: 5,
    },
    box4: {
        width: 20,
        height: 20,
        backgroundColor: '#FF5449',
        paddingRight: 5,
    },
    box5: {
        width: 20,
        height: 20,
        backgroundColor: '#983396',
        paddingRight: 5,
    },
    box6: {
        width: 20,
        height: 20,
        backgroundColor: '#CCBEFF',
        paddingRight: 5,
    },
    filterItem: {
        padding: 10,
    },
    spinnerTextStyle: {
        color: '#fcfcff'
    },
});
export default ReportQuantity;