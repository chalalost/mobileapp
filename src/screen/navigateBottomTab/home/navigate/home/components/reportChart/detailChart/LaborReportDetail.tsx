import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryLabel, VictoryStack, VictoryTheme } from 'victory-native';
import { ApiHomeReport, ResponseService } from '../../../../../../../share/app/constantsApi';
import CommonBase from '../../../../../../../share/network/axios';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { IChartLabel, ILaborReport } from '../../../types/types';

const marginVertical = 0;
const width = (Dimensions.get('window').width);

let localTime = new Date();
let date = dayjs(localTime).format('DD/MM/YYYY');

const LaborReportDetail = () => {

    const [dataLaborReport, setDataLaborReport] = useState<ILaborReport[]>([]);
    //bao cao lao dong
    const [dataWorkToday, setDataWorkToday] = useState<IChartLabel[]>([]);
    const [dataWorkAbsense, setDataWorkAbsense] = useState<IChartLabel[]>([]);

    const handleGetDataForLaborReport = () => {

    }

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDate, setShowDate] = useState(date);
    const [datePickerVisible, setDatePickerVisible] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const handleConfirm = (datePickerChoose: Date) => {
        if (Platform.OS == 'ios') {
            setSelectedDate(datePickerChoose);
            setShowDate(dayjs(datePickerChoose).format('DD/MM/YYYY'))
            hideDatePicker()
        }
        else {
            hideDatePicker()
            setSelectedDate(datePickerChoose);
            setShowDate(dayjs(datePickerChoose).format('DD/MM/YYYY'))
        }

    };

    const getDataLaborReport = async () => {
        let dateData = dayjs(localTime).format('YYYY-MM-DD');
        let dataResponse = await CommonBase.getAsync<ResponseService>(ApiHomeReport.LABORWORK_REPORT + '/' + { dateData }, null)
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            let data = {
                laborWork: dataResponse.data
            }
            setDataLaborReport(data.laborWork)
            // setupDataSaleReport(data.reportSale)
        }
    }
    return (
        <View style={styles.container}>
            <View style={{
                marginTop: 10,
                flexDirection: 'row',
                alignContent: 'space-between',
                padding: 16
            }}>
                <Text style={{
                    fontFamily: 'Mulish-Bold',
                    fontSize: 14,
                    fontStyle: 'normal',
                    fontWeight: '600',
                    color: '#003350',
                    lineHeight: 16,
                    paddingRight: 110,
                    paddingTop: 8
                }}>
                    Báo cáo lao động
                </Text>

                <TouchableOpacity style={{
                    shadowColor: '#00000',
                    shadowOpacity: 0.3,
                    elevation: 5,
                    borderRadius: 5,
                    backgroundColor: '#FFFFFF',
                    width: 100,
                    marginBottom: 8
                }}
                    onPress={showDatePicker}
                >
                    <View style={{
                        padding: 6,
                        display: 'flex',
                    }}>
                        <Text
                            style={{
                                fontFamily: 'Mulish-Bold', fontSize: 12, fontWeight: '600',
                                color: '#003350', paddingRight: 4
                            }}
                        >
                            {showDate}
                        </Text>
                        <Svg style={{ position: 'absolute', right: 2, top: 4 }} width="20" height="21" viewBox="0 0 20 21" fill="none">
                            <Path d="M9.99999 12.2543C9.81933 12.2543 9.66666 12.192 9.54199 12.0673C9.41666 11.9427 9.35399 11.79 9.35399 11.6093C9.35399 11.4287 9.41666 11.2723 9.54199 11.1403C9.66666 11.0083 9.81933 10.9423 9.99999 10.9423C10.1807 10.9423 10.3333 11.0083 10.458 11.1403C10.5833 11.2723 10.646 11.4217 10.646 11.5883C10.646 11.769 10.5833 11.9253 10.458 12.0573C10.3333 12.1887 10.1807 12.2543 9.99999 12.2543ZM6.74999 12.2543C6.56933 12.2543 6.41666 12.192 6.29199 12.0673C6.16666 11.9427 6.10399 11.79 6.10399 11.6093C6.10399 11.4287 6.16666 11.2723 6.29199 11.1403C6.41666 11.0083 6.56933 10.9423 6.74999 10.9423C6.93066 10.9423 7.08333 11.0083 7.20799 11.1403C7.33333 11.2723 7.39599 11.4217 7.39599 11.5883C7.39599 11.769 7.33333 11.9253 7.20799 12.0573C7.08333 12.1887 6.93066 12.2543 6.74999 12.2543ZM13.25 12.2543C13.0693 12.2543 12.9167 12.192 12.792 12.0673C12.6667 11.9427 12.604 11.79 12.604 11.6093C12.604 11.4287 12.6667 11.2723 12.792 11.1403C12.9167 11.0083 13.0693 10.9423 13.25 10.9423C13.4307 10.9423 13.5833 11.0083 13.708 11.1403C13.8333 11.2723 13.896 11.4217 13.896 11.5883C13.896 11.769 13.8333 11.9253 13.708 12.0573C13.5833 12.1887 13.4307 12.2543 13.25 12.2543ZM9.99999 15.1923C9.81933 15.1923 9.66666 15.1297 9.54199 15.0043C9.41666 14.8797 9.35399 14.727 9.35399 14.5463C9.35399 14.3657 9.41666 14.2093 9.54199 14.0773C9.66666 13.946 9.81933 13.8803 9.99999 13.8803C10.1807 13.8803 10.3333 13.946 10.458 14.0773C10.5833 14.2093 10.646 14.3587 10.646 14.5253C10.646 14.706 10.5833 14.8623 10.458 14.9943C10.3333 15.1263 10.1807 15.1923 9.99999 15.1923ZM6.74999 15.1923C6.56933 15.1923 6.41666 15.1297 6.29199 15.0043C6.16666 14.8797 6.10399 14.727 6.10399 14.5463C6.10399 14.3657 6.16666 14.2093 6.29199 14.0773C6.41666 13.946 6.56933 13.8803 6.74999 13.8803C6.93066 13.8803 7.08333 13.946 7.20799 14.0773C7.33333 14.2093 7.39599 14.3587 7.39599 14.5253C7.39599 14.706 7.33333 14.8623 7.20799 14.9943C7.08333 15.1263 6.93066 15.1923 6.74999 15.1923ZM13.25 15.1923C13.0693 15.1923 12.9167 15.1297 12.792 15.0043C12.6667 14.8797 12.604 14.727 12.604 14.5463C12.604 14.3657 12.6667 14.2093 12.792 14.0773C12.9167 13.946 13.0693 13.8803 13.25 13.8803C13.4307 13.8803 13.5833 13.946 13.708 14.0773C13.8333 14.2093 13.896 14.3587 13.896 14.5253C13.896 14.706 13.8333 14.8623 13.708 14.9943C13.5833 15.1263 13.4307 15.1923 13.25 15.1923ZM4.74999 17.7753C4.37533 17.7753 4.05933 17.6437 3.80199 17.3803C3.54533 17.1163 3.41699 16.8037 3.41699 16.4423V5.94233C3.41699 5.581 3.54533 5.26867 3.80199 5.00533C4.05933 4.74133 4.37533 4.60933 4.74999 4.60933H6.58299V2.50433H7.68799V4.60933H12.333V2.50433H13.417V4.60933H15.25C15.6247 4.60933 15.9407 4.74133 16.198 5.00533C16.4547 5.26867 16.583 5.581 16.583 5.94233V16.4423C16.583 16.8037 16.4547 17.1163 16.198 17.3803C15.9407 17.6437 15.6247 17.7753 15.25 17.7753H4.74999ZM4.74999 16.6923H15.25C15.3053 16.6923 15.361 16.6647 15.417 16.6093C15.4723 16.5533 15.5 16.4977 15.5 16.4423V9.44233H4.49999V16.4423C4.49999 16.4977 4.52766 16.5533 4.58299 16.6093C4.63899 16.6647 4.69466 16.6923 4.74999 16.6923Z" fill="#003350" />
                        </Svg>
                    </View>
                </TouchableOpacity>
                <DateTimePickerModal
                    date={selectedDate}
                    isVisible={datePickerVisible}
                    mode="date"
                    maximumDate={new Date()}
                    locale={'vi'}
                    display="inline"
                    confirmTextIOS={'Lưu'}
                    cancelTextIOS={'Hủy'}
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
                <TouchableOpacity style={{
                    shadowColor: '#00000',
                    shadowOpacity: 0.3,
                    elevation: 5,
                    borderRadius: 5,
                    backgroundColor: '#FFFFFF',
                    width: 30,
                    marginBottom: 8,
                    marginLeft: 8
                }}
                >
                    <View style={{
                        padding: 6,
                        display: 'flex',
                    }}>
                        <Svg style={{ position: 'absolute', right: 3, top: 5 }} width="25" height="25" viewBox="0 0 20 21" fill="none" >
                            <Path id="Vector" d="M9.99999 12.9844L5.29199 8.25438L6.06199 7.48438L9.99999 11.4214L13.938 7.48438L14.708 8.25438L9.99999 12.9844Z" fill="#003350" />
                        </Svg>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{ ...styles.chart }}>
                <ScrollView
                    horizontal
                >
                    <VictoryChart
                        domainPadding={20}
                        width={width + 150}
                        height={420}
                        theme={VictoryTheme.material}
                    >
                        <VictoryLabel x={2} y={25} style={{
                            fill: '#003350',
                            fontFamily: "Mulish-Bold",
                            fontSize: 14,
                            fontStyle: "normal"
                        }}
                            text={"( Người )"}
                        />
                        <VictoryAxis
                            tickValues={[1, 2, 3, 4, 1, 2]}
                            tickFormat={['Tổ may 1', 'Tổ may 2', 'Tổ may 3', 'Tổ may 4', 'Tổ may 5', 'Tổ may 6']}
                            style={{
                                axis: { stroke: '#003350', strokeWidth: 0.2 },
                                ticks: { strokeWidth: 0 },
                                tickLabels: {
                                    fill: '#004B72',
                                    fontFamily: "Mulish-Bold",
                                    fontSize: 13
                                }
                            }} />
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(x) => (`${x / 1}`)}
                            style={{
                                axis: { stroke: '#003350', strokeWidth: 0 },
                                ticks: { strokeWidth: 0.2 },
                                tickLabels: {
                                    fill: '#003350',
                                    fontFamily: "Mulish-Bold",
                                    fontSize: 12
                                }
                            }} />
                        <VictoryStack
                            domainPadding={5}
                        >
                            <VictoryBar
                                data={dataWorkToday}
                                x="x"
                                y="y"
                                animate={{
                                    duration: 1500,
                                    onLoad: { duration: 1500 },
                                }}
                                style={{
                                    data: {
                                        fill: '#008B09',
                                    },
                                }}
                                barWidth={20} />
                            <VictoryBar
                                data={dataWorkAbsense}
                                x="x"
                                y="y"
                                animate={{
                                    duration: 2000,
                                    onLoad: { duration: 2000 },
                                }}
                                style={{
                                    data: {
                                        fill: '#DE372F',
                                    },
                                }}
                                barWidth={20} />
                        </VictoryStack>
                    </VictoryChart>
                </ScrollView>
            </View>
            <View style={[styles.gridThird]}>
                <View style={[styles.label2]}>
                    <Svg style={{ position: 'absolute', top: 8 }} width="12" height="12" viewBox="0 0 9 9" fill="none">
                        <Rect x="0.0361328" y="0.192383" width="8" height="8" rx="4" fill="#008B09" />
                    </Svg>
                    <TouchableOpacity>
                        <Text style={[styles.text2]}> SL đi làm</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.label2]}>
                    <Svg style={{ position: 'absolute', top: 8 }} width="12" height="12" viewBox="0 0 9 9" fill="none">
                        <Rect x="0.0361328" y="0.192383" width="8" height="8" rx="4" fill="#D94949" />
                    </Svg>
                    <TouchableOpacity>
                        <Text style={[styles.text2]}> SL nghỉ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
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
        height: '100%',
        width: '100%',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 20, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
        flexDirection: 'column',
        flex: 1,
        // paddingHorizontal: 5
    },
    // container: { alignItems: 'center', justifyContent: 'center', height: 1050 },
    gauge: {
        position: 'absolute',
        width: 100,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gaugeText: {
        backgroundColor: 'transparent',
        color: '#000',
        fontSize: 24,
    },
    sectionContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: marginVertical,
        marginBottom: marginVertical,

    },
    chart: {
        justifyContent: 'center',
        padding: 8
    },
    grid: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingLeft: 8,
        paddingRight: 8,
    },
    gridSecond: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingLeft: 24,
        paddingRight: 24
    },
    gridThird: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    paginationLabel: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingTop: 12
    },
    content: {
        paddingLeft: 8,
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '500',
    },
    labelContent: {
        color: '#454749',
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '400',
        width: '70%',
        paddingBottom: 6,
        borderColor: '#D9D9D9',
        borderRightWidth: 1,
    },
    lastLabel: {
        color: '#454749',
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '400',
        width: '70%',
        borderColor: '#D9D9D9',
        borderRightWidth: 1,
    },
    text: {
        fontFamily: 'Mulish-Bold',
        fontSize: 12,
        color: '#003350',
        paddingLeft: 8
    },
    text2: {
        fontFamily: 'Mulish-Bold',
        fontSize: 13,
        color: '#003350',
        paddingLeft: 8
    },
    label: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 5,
    },
    label2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 5,
        paddingRight: 15
    },
    percent: {
        fontSize: 12,
        fontFamily: 'Mulish-Bold',
        paddingLeft: 5,
    },
})

export default LaborReportDetail;
