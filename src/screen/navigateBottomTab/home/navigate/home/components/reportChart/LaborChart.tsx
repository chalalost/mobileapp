import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { connect } from 'react-redux';
import { Action, AnyAction, bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryLabel, VictoryStack, VictoryTheme, VictoryZoomContainer } from 'victory-native';
import baseAction from '../../../../../../base/saga/action';
import { ApiHomeReport, ResponseService } from '../../../../../../share/app/constantsApi';
import CommonBase from '../../../../../../share/network/axios';
import HomeAction from '../../saga/homeAction';
import { getDateTimeSelector } from '../../saga/homeSelectors';
import { HomeState, IChartLabel, ILaborReport } from '../../types/types';


const marginVertical = 0;
const width = (Dimensions.get('window').width);
const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

type LaborChartProp = {
    isShow: boolean,
    isRefreshing: boolean;
    getDateTimeSelector: HomeState['getDateTimeSelector'];
    baseAction: typeof baseAction,
}


const LaborChart: React.FC<LaborChartProp> = (prop) => {

    const { isShow, getDateTimeSelector, baseAction, isRefreshing } = prop;

    const [isDataEmpty, setIsDataEmpty] = useState<boolean>(false)

    const [dataLaborReport, setDataLaborReport] = useState<ILaborReport[]>([]);
    //bao cao lao dong
    const [dataWorkToday, setDataWorkToday] = useState<IChartLabel[]>([]);
    const [dataWorkAbsense, setDataWorkAbsense] = useState<IChartLabel[]>([]);
    const [dataLabel, setDataLabel] = useState<string[]>()


    const getDataLaborReport = async () => {
        
        let dataResponse = await CommonBase.getAsync<ResponseService>(ApiHomeReport.LABORWORK_REPORT + '/' + getDateTimeSelector, null)
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            let data = {
                laborWork: dataResponse.data
            }
            setDataLaborReport(data.laborWork)
            setDataForLaborReport(data.laborWork)
        }
    }

    const setDataForLaborReport = (listData: ILaborReport) => {

        if (listData && listData.ListWorkcenter.length > 0) {
            var dataQtyReal: IChartLabel[] = []
            var dataQtyOff: IChartLabel[] = []
            var dataLabel: string[] = []
            for (var i = 0; i < listData.ListWorkcenter.length; i++) {
                dataQtyReal.push({
                    x: (i + 1),
                    y: listData.ListWorkcenter[i].QtyLaborReal
                })
                dataQtyOff.push({
                    x: (i + 1),
                    y: listData.ListWorkcenter[i].QtyLaborDayOff
                })
                dataLabel.push(listData.ListWorkcenter[i].Workcentername)
            }
            setDataWorkToday([...dataQtyReal])
            setDataWorkAbsense([...dataQtyOff])
            setDataLabel(dataLabel)
        }
    }

    useEffect(() => {
        getDataLaborReport()
    }, [])

    useEffect(() => {
        getDataLaborReport()
    }, [isRefreshing])

    useEffect(() => {
        baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
        if (getDateTimeSelector != '') {
            getDataLaborReport()
        }
        baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
    }, [getDateTimeSelector])
    let datalength = dataWorkToday.length
    return (
        <>
            {
                isShow == true && isDataEmpty == false ? (
                    <>
                        <View style={[styles.chart]}>
                            <ScrollView
                                horizontal
                            >
                                <VictoryChart
                                    domainPadding={20}
                                    width={width + 1675}
                                    //width={width}
                                    height={420}
                                    theme={VictoryTheme.material}
                                >
                                    <VictoryLabel x={2} y={25} style={{
                                        fill: '#003350',
                                        fontFamily: "Mulish-SemiBold",
                                        fontSize: 14,
                                        fontStyle: "normal"
                                    }}
                                        text={"( Người )"}
                                    />
                                    <VictoryAxis
                                        tickFormat={dataLabel}
                                        style={{
                                            axis: { stroke: '#003350', strokeWidth: 0.2 },
                                            ticks: { strokeWidth: 0 },
                                            tickLabels: {
                                                fill: '#004B72',
                                                fontFamily: "Mulish-SemiBold",
                                                fontSize: 12,
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
                                    >

                                        <VictoryBar
                                            data={dataWorkToday}
                                            x="x"
                                            y="y"
                                            // animate={{
                                            //     duration: 1500,
                                            //     onLoad: { duration: 1500 },
                                            // }}
                                            style={{
                                                data: {
                                                    fill: '#008B09',
                                                },
                                            }}
                                            barWidth={20}
                                            labels={() => dataWorkToday.findIndex(x => x.y).toString()}
                                            labelComponent={
                                                <VictoryLabel
                                                    text={({ datum }): string => `${(
                                                        parseInt(datum.y) <= 0 ? '' : parseInt(datum.y)
                                                    )}`}
                                                    dx={-15}
                                                    dy={0}
                                                    style={[
                                                        {
                                                            fill: '#003350',
                                                            fontFamily: "Mulish-Bold",
                                                            fontSize: 12,
                                                        },
                                                    ]}
                                                    angle={-90}
                                                    textAnchor="start"
                                                    verticalAnchor="middle"
                                                />
                                            }
                                        />
                                        <VictoryBar
                                            data={dataWorkAbsense}
                                            x="x"
                                            y="y"
                                            // animate={{
                                            //     duration: 2000,
                                            //     onLoad: { duration: 2000 },
                                            // }}
                                            style={{
                                                data: {
                                                    fill: '#DE372F',
                                                },
                                            }}
                                            barWidth={20}
                                            labels={() => dataWorkAbsense.findIndex(x => x.y).toString()}
                                            labelComponent={
                                                <VictoryLabel
                                                    text={({ datum }): string => `${(
                                                        parseInt(datum.y) <= 0 ? '' : parseInt(datum.y)
                                                    )}`}
                                                    dx={-9}
                                                    dy={0}
                                                    style={[
                                                        {
                                                            fill: '#003350',
                                                            fontFamily: "Mulish-Bold",
                                                            fontSize: 12,
                                                        },
                                                    ]}
                                                    angle={-90}
                                                    textAnchor="start"
                                                    verticalAnchor="middle"
                                                />
                                            }
                                        />
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
                    </>
                )
                    :
                    (
                        <View style={[styles.gridThird]}>
                            <Text style={{
                                color: '#003350',
                                fontFamily: 'Mulish-SemiBold',
                                fontStyle: 'normal',
                                fontWeight: '600',
                                fontSize: 16,
                                alignContent: 'center',
                                justifyContent: 'center',
                                paddingTop: 26,
                                height: 60
                            }}>
                                Không có dữ liệu
                            </Text>
                        </View>
                    )
            }
        </>
    )
}
const styles = StyleSheet.create({
    chart: {
        justifyContent: 'center',
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
})

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
    HomeAction: bindActionCreators(HomeAction, dispatch),
    baseAction: bindActionCreators(baseAction, dispatch),
});
const mapStateToProps = createStructuredSelector({
    getDateTimeSelector
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LaborChart);
