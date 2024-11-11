import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryLabel, VictoryLegend, VictoryPie, VictoryTheme } from 'victory-native';
import { ApiHomeReport, ResponseService } from '../../../../../../share/app/constantsApi';
import { HomeState, IChartLabel, IChartPie, IListWorkCenter, ISaleReport } from '../../types/types';

import { connect } from 'react-redux';
import CommonBase from '../../../../../../share/network/axios';
import HomeAction from '../../saga/homeAction';
import { getDateTimeSelector } from '../../saga/homeSelectors';
import { Action, AnyAction, bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import baseAction from '../../../../../../base/saga/action';

const marginVertical = 0;
const width = (Dimensions.get('window').width);


type SaleReportByCustomerProp = {
    getDateTimeSelector: HomeState['getDateTimeSelector'];
    isShow: boolean,
    baseAction: typeof baseAction,
}

interface IManager {
    name: string | ''
}

const SaleReportByCustomer: React.FC<SaleReportByCustomerProp> = (prop) => {

    const { getDateTimeSelector, isShow, baseAction } = prop;
    const [isDataEmpty, setIsDataEmpty] = useState<boolean>(false)
    // bao cao doanh thu
    const [dataChartSaleReportCus, setDataChartSaleReportCus] = useState<IChartPie[]>([]);
    const [dataLegend, setDataLegend] = useState<IManager[]>([]);

    const handleSumDataSale = (data: ISaleReport, field: keyof IListWorkCenter) => {
        let value = data?.ListWorkcenter?.reduce((total, itemData: IListWorkCenter) => {
            return total + (+itemData[field])
        }, 0)
        return value;
    }


    const getDataSaleReport = async () => {     
        let dataResponse = await CommonBase.getAsync<ResponseService>(ApiHomeReport.SALE_REPORT + '/' +
            getDateTimeSelector
            , null)
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            let data = {
                reportSale: dataResponse.data
            }
            //setupDataSaleReport(data.reportSale)
            setupLabel(data.reportSale)
        }     
    }

    const setupLabel = (listDataSale: ISaleReport[]) => {
        let listTemp: any[] = [];
        if (listDataSale && listDataSale?.length > 0) {
            listDataSale.forEach((item) => {
                item.ListWorkcenter.forEach((temp) => {
                    listTemp.push(temp);
                });
            });
        }
        let listCustomer: any[] = [];
        listTemp.forEach((item) => {
            var check = listCustomer.find(
                (m) => m.Customercode == item.Customercode
            );
            if (check == null) {
                listCustomer.push({
                    Customercode: item.Customercode,
                    Customername: item.Customername,
                    ListWorkcenter: listTemp.filter(
                        (m) => m.Customercode == item.Customercode
                    ),
                });
            }
        });
        var listSaleToday: IChartPie[] = [];
        var listLabel: IManager[] = []
        var xData = 0;
        var total = listCustomer.reduce((total: any, i: any) => {
            return total + i.ListWorkcenter.reduce((total: any, i: IListWorkCenter) => {
                return total + i.CustomerRevenue;
            }, 0);
        }, 0);

        listCustomer.forEach((item) => {
            listLabel.push({
                name: item.Customername ?? ""
            });
            xData++;
            let value = item.ListWorkcenter.reduce((total: any, i: IListWorkCenter) => {
                return total + i.CustomerRevenue;
            }, 0);

            listSaleToday.push({
                x: xData,
                y: value,
                label: total != 0 ?
                    (value == 0) ? " "
                        : ((value / total) * 100).toFixed(2) + " %"
                    : " "
            });

        });
        if (listSaleToday.length == 0) {
            setIsDataEmpty(true)
        }
        else {
            setIsDataEmpty(false)
        }
        setDataChartSaleReportCus([...listSaleToday])
        setDataLegend([...listLabel])
    }

    useEffect(() => {
        baseAction.setSpinnerReducer({ isSpinner: true, textSpinner: '' });
        if (getDateTimeSelector != '') {
            getDataSaleReport()
        }
        baseAction.setSpinnerReducer({ isSpinner: false, textSpinner: '' });
    }, [getDateTimeSelector])


    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {
                isShow == true && isDataEmpty == false ? (
                    <>
                        <View style={{
                            backgroundColor: '#FFFFFF',
                        }}>
                            <VictoryPie
                                data={dataChartSaleReportCus}
                                colorScale={["#D94949", "#FEB74F", "#71C6A5", "#9BCA3C", "#A98F00", '#8750A1', '#5B52A3', '#D1499B']}
                                width={width-40}
                                height={300}
                                // animate={{
                                //     duration: 1500,
                                //     onLoad: { duration: 1500 },
                                // }}
                                style={{
                                    data: {
                                        stroke: "#FFFFFF", strokeWidth: 2
                                    },
                                    labels: {
                                        fontSize: 11,
                                        fill: "#003350",
                                        fontFamily: 'Mulish-Bold'
                                    }
                                }}
                            />
                            <VictoryLegend
                                width={width - 60}
                                height={150}
                                centerTitle={true}
                                orientation="vertical"
                                style={{
                                    labels: {
                                        fontSize: 11,
                                        fill: "#003350",
                                        fontFamily: 'Mulish-Bold'
                                    }
                                }}
                                colorScale={["#D94949", "#FEB74F", "#71C6A5", "#9BCA3C", "#A98F00", '#8750A1', '#5B52A3', '#D1499B']}
                                data={dataLegend}
                            />
                        </View>
                    </>
                ) :
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
            }
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
        justifyContent: 'flex-start',
        width: '100%',
        paddingLeft: 18,
        paddingRight: 18,
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
        fontSize: 12,
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
)(SaleReportByCustomer);


