import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import { VictoryBar, VictoryChart, VictoryGroup, VictoryAxis, VictoryTheme } from "victory-native";
import CommonBase from '../../../share/network/axios';
import { ResponseService } from '../../../share/app/constantsApi';
import axios from 'axios';
import { ApiGateway } from '../../../share/network/apiGateway';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MyTitleHome from '../../../share/base/component/myStatusBar/MyTitleHome';

export interface ReportOEEScreenProps {
    navigation: NavigationProp<any, any>
};

const rows = 3;
const cols = 3;
const marginHorizontal = 0;
const marginVertical = 10;
const width = (Dimensions.get('window').width);
const height = (Dimensions.get('window').height);
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

const ReportOEE = ({ navigation }: ReportOEEScreenProps) => {
    const insets = useSafeAreaInsets();
    const [filterId, setTabId] = useState<number>(1);
    const [getdata, setData] = useState<any>();
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, []);
    const DataInput = {
        fromTime: "2022-10-10",
        isAllmachine: true,
        listmachine: ["1c1436ca-f2fb-401b-a0ff-c6aea3c6f20e"],
        toTime: "2023-01-17",
    }
    const getData = async () => {
        let dataResponse = await CommonBase.postAsync<ResponseService>("/api/production-management-service/report/infor-oee", DataInput);
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            setData(dataResponse.data)
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
                        <VictoryGroup offset={15} colorScale={'qualitative'}>
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
                                        fill: '#007300',
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
                                    { x: 5, y: 700 },
                                ]}
                                animate={{
                                    duration: 2000,
                                    onLoad: { duration: 1000 },
                                }}
                                style={{
                                    data: {
                                        fill: '#FD7E14',
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
                                    { x: 5, y: 700 },
                                ]}
                                animate={{
                                    duration: 2000,
                                    onLoad: { duration: 1000 },
                                }}
                                style={{
                                    data: {
                                        fill: '#0DCAF0',
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
                                    tickLabels: {
                                        fill: '#8F92A1'
                                    },
                                    ticks: { stroke: '#8F92A1' },
                                }}
                            // tickComponent={<LineSegment events={{ onClick: 'aaaa' }} />}
                            />
                        </VictoryGroup>
                    </VictoryChart>
                </View>
                <View style={[styles.gird]}>
                    <View style={[styles.label]}>
                        <Text style={[styles.box1]}></Text>
                        <TouchableOpacity>
                            <Text style={[styles.text]}> Performent</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.label]}>
                        <Text style={[styles.box2]}></Text>
                        <TouchableOpacity>
                            <Text style={[styles.text]}> Quantity</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.label]}>
                        <Text style={[styles.box3]}></Text>
                        <TouchableOpacity>
                            <Text style={[styles.text]}> Availability</Text>
                        </TouchableOpacity>
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
        paddingTop: 20,
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
        backgroundColor: '#007300',
        padding: 10,
        borderRadius: 1,
    },
    box2: {
        width: 20,
        height: 5,
        backgroundColor: '#FD7E14',
        padding: 10,
        borderRadius: 1,
    },
    box3: {
        width: 20,
        height: 5,
        backgroundColor: '#0DCAF0',
        padding: 10,
        borderRadius: 1,
    },
});
export default ReportOEE;