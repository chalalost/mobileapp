import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { ApiCommon, ApiHomeReport, ResponseService } from '../../../../../../share/app/constantsApi'
import { WorkByTypeEnumMobile } from '../../../productionRecord/types/enum/productionRecord';
import { IDropdownData, IProductionInfo, IWorkCenter } from '../../types/types';

import { connect } from 'react-redux';
import CommonBase from '../../../../../../share/network/axios';
import HomeAction from '../../saga/homeAction';
import { getDateTimeSelector } from '../../saga/homeSelectors';
import { HomeState, IChartLabel, ILaborReport } from '../../types/types';
import { Action, AnyAction, bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import baseAction from '../../../../../../base/saga/action';

type ProductionInfoProp = {
    getDateTimeSelector: HomeState['getDateTimeSelector'];
    isRefreshing : boolean,
    workOrderCode: string,
}

const ProductionInfo: React.FC<ProductionInfoProp> = (prop) => {

    const { getDateTimeSelector, workOrderCode, isRefreshing } = prop;

    const [dataProductionInfo, setDataProductionInfo] = useState<IProductionInfo>();

    const getDataProductionInfo = async () => {
        let request = {
            Workordercode: workOrderCode,
            Date: getDateTimeSelector
        }
        let dataResponse = await CommonBase.postAsync<ResponseService>(ApiHomeReport.PRODUCTION_INFO, request)
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            let data = {
                productionInfo: dataResponse.data
            }
            setDataProductionInfo(data.productionInfo)
        }
    }

    useEffect(() => {
        getDataProductionInfo()
    }, [workOrderCode])

    useEffect(() => {
        getDataProductionInfo()
    }, [isRefreshing])

    useEffect(() => {
        if (getDateTimeSelector != '') {
            getDataProductionInfo()
        }
    }, [getDateTimeSelector])

    return (
        <View style={styles.content}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.labelContent}>
                    Tổng số lượng đã vào chuyền:
                </Text>
                <Text style={{
                    width: '30%',
                    fontFamily: 'Mulish-Bold',
                    color: '#000000',
                    paddingLeft: 30
                }}>
                    {dataProductionInfo?.TotalInline ?? 0}
                </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.labelContent}>
                    Tổng số lượng ra chuyền:
                </Text>
                <Text style={{
                    width: '30%',
                    fontFamily: 'Mulish-Bold',
                    color: '#000000',
                    paddingLeft: 30
                }}>
                    {dataProductionInfo?.TotalOutput ?? 0}
                </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.labelContent}>
                    Số lượng mang đi giặt:
                </Text>
                <Text style={{
                    width: '30%',
                    fontFamily: 'Mulish-Bold',
                    color: '#000000',
                    paddingLeft: 30
                }}>
                    {dataProductionInfo?.TotalLaundry ?? 0}
                </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.labelContent}>
                    Số lượng đã nhận về:
                </Text>
                <Text style={{
                    width: '30%',
                    fontFamily: 'Mulish-Bold',
                    color: '#000000',
                    paddingLeft: 30
                }}>
                    {dataProductionInfo?.TotalAfterWash ?? 0}
                </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.lastLabel}>
                    Số lượng vào kho hoàn thiện:
                </Text>
                <Text style={{
                    width: '30%',
                    fontFamily: 'Mulish-Bold',
                    color: '#000000',
                    paddingLeft: 30
                }}>
                    {dataProductionInfo?.TotalFinishWarehouse ?? 0}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
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
)(ProductionInfo);
