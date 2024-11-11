import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { VictoryAxis, VictoryBar, VictoryBrushContainer, VictoryChart, VictoryGroup, VictoryLabel, VictoryLine, VictoryScatter, VictoryTheme, VictoryZoomContainer } from 'victory-native';
import { ApiHomeReport, ResponseService } from '../../../../../../share/app/constantsApi';
import SelectBaseWithoutIcon from '../../../../../../share/base/component/selectBase/selectBaseWithoutIcon';


import { connect } from 'react-redux';
import CommonBase from '../../../../../../share/network/axios';
import HomeAction from '../../saga/homeAction';
import { getDateTimeSelector } from '../../saga/homeSelectors';
import { HomeState, IChartLabel, ILaborReport, IReportQuantityByDay } from '../../types/types';
import { Action, AnyAction, bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import baseAction from '../../../../../../base/saga/action';


const marginVertical = 0;
const width = (Dimensions.get('window').width);

type QuantityChartProp = {
    getDateTimeSelector: HomeState['getDateTimeSelector'];
    workCenter: string,
    isRefreshing: boolean,
    baseAction: typeof baseAction,
}

const QuantityChart: React.FC<QuantityChartProp> = (prop) => {
    const { getDateTimeSelector, workCenter, isRefreshing, baseAction } = prop;

    // bao cao chenh lenh sl
    const [dataChartQuantityReportForQtyNow, setDataChartQuantityReportForQtyNow] = useState<IChartLabel[]>([]);
    const [dataChartQuantityReportForQtyOld, setDataChartQuantityForQtyOld] = useState<IChartLabel[]>([]);
    const [dataChartQuantityReportForQtyDiff, setDataChartQuantityReportForQtyDiff] = useState<IChartLabel[]>([]);
    const [dataOutBond, setDataOutBond] = useState<IChartLabel[]>([]);
    const [dataOutboundLabel, setDataOutboundLabel] = useState<string[]>([])


    const getDataReportQuantityByDay = async () => {
        
        let request = {
            workcenterid: workCenter,
            date: getDateTimeSelector
        }
        let dataResponse = await CommonBase.postAsync<ResponseService>(ApiHomeReport.REPORT_QUANTITY_BY_DAY, request)
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            let data = {
                reportDataQuantity: dataResponse.data
            }
            setDataChartQuantity(data.reportDataQuantity)
        }
        
    }

    const setDataChartQuantity = (listDataReport: IReportQuantityByDay[]) => {
        let dataReportQuantity = listDataReport
        if (dataReportQuantity && dataReportQuantity.length > 0) {
            var listDataQtyNow: IChartLabel[] = [];
            var listDataQtyOld: IChartLabel[] = [];
            var listDataQtyDiff: IChartLabel[] = [];
            var dataOutBond: IChartLabel[] = [];
            var label: string[] = []
            for (var i = 0; i < dataReportQuantity.length; i++) {
                listDataQtyNow.push({
                    x: (i + 1),
                    y: dataReportQuantity[i].Qtynow,
                })
                listDataQtyOld.push({
                    x: (i + 1),
                    y: dataReportQuantity[i].Qtyold,
                })
                listDataQtyDiff.push({
                    x: (i + 1),
                    y: dataReportQuantity[i].Qtydifference,
                })
                dataOutBond.push({
                    x: (i + 1),
                    y: dataReportQuantity[i].QtyOuputBond,
                })
                label.push((dataReportQuantity[i].QtyOuputBond).toString())
            }
            setDataChartQuantityReportForQtyNow([...listDataQtyNow])
            setDataChartQuantityForQtyOld([...listDataQtyOld])
            setDataChartQuantityReportForQtyDiff([...listDataQtyDiff])
            setDataOutBond([...dataOutBond])
            setDataOutboundLabel([...label])
        }
    }

    useEffect(() => {
        getDataReportQuantityByDay()
    }, [workCenter])

    useEffect(() => {
        getDataReportQuantityByDay()
    }, [isRefreshing])

    useEffect(() => {
        baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
        if (getDateTimeSelector != '') {
            getDataReportQuantityByDay()
        }
        baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
    }, [getDateTimeSelector])

    return (
        <View>
            <View style={[styles.chart]}>
                <ScrollView
                    horizontal
                >
                    <VictoryChart
                        width={width + 80}
                        height={400}
                        theme={VictoryTheme.material}
                    // containerComponent={
                    //     <VictoryZoomContainer
                    //         responsive={false}
                    //         zoomDimension="x"
                    //         allowZoom={false}
                    //         allowPan
                    //         zoomDomain={{ x: [0.2, 6] }}
                    //     />
                    // }
                    >
                        <VictoryLabel x={5} y={25} style={{
                            fill: '#003350',
                            fontFamily: "Mulish-Bold",
                            fontSize: 14,
                            fontStyle: "normal"
                        }}
                            text={"( Pcs )"}
                        />
                        <VictoryAxis
                            tickValues={['7h15-9h', '9h-11h', '11h-14h', '14h-16h', '16h-18h']}
                            style={{
                                axis: { strokeWidth: 0.2 },
                                ticks: { strokeWidth: 0 },
                                tickLabels: {
                                    fill: '#003350',
                                    fontFamily: "Mulish-Bold",
                                    fontSize: 13,
                                }
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(x) => (`${x / 1}`)}
                            style={{
                                axis: { strokeWidth: 0 },
                                ticks: { strokeWidth: 0 },
                                tickLabels: {
                                    fill: '#004B72',
                                    fontFamily: "Mulish-Bold",
                                    fontSize: 13
                                }
                            }}
                        />

                        <VictoryGroup
                            offset={15}
                        >
                            {/* sl hiện tại */}
                            <VictoryBar
                                data={
                                    dataChartQuantityReportForQtyNow
                                }
                                x={'x'}
                                y={'y'}
                                // animate={{
                                //     duration: 200,
                                //     onLoad: { duration: 200 },
                                // }}
                                cornerRadius={6}
                                style={{
                                    data: {
                                        fill: '#9782E6',
                                    },
                                }}
                                barWidth={14}
                                labels={() => dataChartQuantityReportForQtyNow.findIndex(x => x.y).toString()}
                                labelComponent={
                                    <VictoryLabel
                                        text={({ datum }): string => `${(
                                            parseInt(datum.y) <= 1 ? '' : parseInt(datum.y)
                                        )}`}
                                        dx={-26}
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

                            {/* sl ngày trc */}
                            <VictoryBar
                                data={
                                    dataChartQuantityReportForQtyOld
                                }
                                x={'x'}
                                y={'y'}
                                // animate={{
                                //     duration: 200,
                                //     onLoad: { duration: 200 },
                                // }}
                                cornerRadius={6}
                                style={{
                                    data: {
                                        fill: '#4E9ECB',
                                    },
                                }}
                                barWidth={14}
                                labels={() => dataChartQuantityReportForQtyOld.findIndex(x => x.y).toString()}
                                labelComponent={
                                    <VictoryLabel
                                        text={({ datum }): string => `${(
                                            parseInt(datum.y) <= 1 ? '' : parseInt(datum.y)
                                        )}`}
                                        dx={-26}
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

                            {/* sl cuối ngày trc */}
                            <VictoryBar
                                data={
                                    dataChartQuantityReportForQtyDiff
                                }
                                x={'x'}
                                y={'y'}
                                // animate={{
                                //     duration: 200,
                                //     onLoad: { duration: 200 },
                                // }}
                                cornerRadius={6}
                                style={{
                                    data: {
                                        fill: '#8FE475',
                                    },
                                    labels: {
                                        color: '#003350'
                                    },
                                }}
                                barWidth={14}
                                labels={() => dataChartQuantityReportForQtyDiff.findIndex(x => x.y).toString()}
                                labelComponent={
                                    <VictoryLabel
                                        text={({ datum }): string => `${(
                                            parseInt(datum.y) <= 1 ? '' : parseInt(datum.y)
                                        )}`}
                                        dx={-26}
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
                        </VictoryGroup>

                        {/* khoán */}
                        <VictoryLine
                            data={
                                dataOutBond
                            }
                            x={'x'}
                            y={'y'}
                            // animate={{
                            //     duration: 200,
                            //     onLoad: { duration: 200 },
                            // }}
                            style={{
                                data: { stroke: "#DE372F", strokeWidth: 1, },

                            }}
                        />
                        <VictoryScatter
                            data={
                                dataOutBond
                            }
                            x={'x'}
                            y={'y'}
                            style={{
                                data: {
                                    fill: '#DE372F',
                                },

                            }}
                            labels={() => dataOutboundLabel}
                            labelComponent={
                                <VictoryLabel
                                    text={({ datum }): string => `${(parseFloat(datum.y)) <= 0 ? '' : (parseFloat(datum.y)).toFixed(2)}`}
                                    style={[
                                        {
                                            fill: '#DE372F',
                                            fontFamily: "Mulish-Bold",
                                            fontSize: 12,
                                        },
                                    ]}
                                />
                            }
                        />
                    </VictoryChart>
                </ScrollView>
            </View>
            <View style={[styles.grid]}>
                <View style={[styles.label]}>
                    <Svg style={{ position: 'absolute', top: 8 }} width="12" height="12" viewBox="0 0 9 9" fill="none">
                        <Rect x="0.0361328" y="0.192383" width="8" height="8" rx="4" fill="#9782E6" />
                    </Svg>
                    <TouchableOpacity>
                        <Text style={[styles.text]}> SL hiện tại</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.label]}>
                    <Svg style={{ position: 'absolute', top: 8 }} width="12" height="12" viewBox="0 0 9 9" fill="none">
                        <Rect x="0.0361328" y="0.192383" width="8" height="8" rx="4" fill="#3091C8" />
                    </Svg>

                    <TouchableOpacity>
                        <Text style={[styles.text]}> SL ngày trước</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.label]}>
                    <Svg style={{ position: 'absolute', top: 8 }} width="12" height="12" viewBox="0 0 9 9" fill="none">
                        <Rect x="0.964844" y="0.192383" width="8" height="8" rx="4" fill="#8FE475" />
                    </Svg>

                    <TouchableOpacity>
                        <Text style={[styles.text]}> SL cuối ngày trước</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
    text: {
        fontFamily: 'Mulish-Bold',
        fontSize: 12,
        color: '#003350',
        paddingLeft: 8
    },
    label: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 5,
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
)(QuantityChart);
