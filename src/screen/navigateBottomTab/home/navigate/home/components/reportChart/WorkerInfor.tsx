import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { ApiHomeReport, ResponseService } from '../../../../../../share/app/constantsApi';
import CommonBase from '../../../../../../share/network/axios';
import { HomeState, ILaborInfo } from '../../types/types';

import { connect } from 'react-redux';
import HomeAction from '../../saga/homeAction';
import { getDateTimeSelector } from '../../saga/homeSelectors';
import { Action, AnyAction, bindActionCreators, Dispatch } from 'redux';
import { createStructuredSelector } from 'reselect';
import baseAction from '../../../../../../base/saga/action';

type LaborInfo = {
    getDateTimeSelector: HomeState['getDateTimeSelector'];
    isRereshing: boolean,
    isShow: boolean
}

const WorkerInfor: React.FC<LaborInfo> = (prop) => {
    const { getDateTimeSelector, isShow, isRereshing } = prop

    const [dataLabor, setDataLabor] = useState<ILaborInfo>()

    const gateDataLabor = async () => {
        let dataResponse = await CommonBase.getAsync<ResponseService>(ApiHomeReport.LABORWORK_REPORT + '/' + getDateTimeSelector, null)
        if (typeof dataResponse !== 'string' && dataResponse != null && dataResponse.isSuccess === true) {
            let data = {
                laborInfo: dataResponse.data
            }
            setDataLabor(data.laborInfo)
        }
    }

    useEffect(() => {
        if (getDateTimeSelector != '') {
            gateDataLabor()
        }
    }, [getDateTimeSelector])

    useEffect(() => {
        gateDataLabor()
    }, [isRereshing])

    return (
        <View style={styles.content}>
            {
                isShow == true ? (
                    <>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.labelContent}>
                                Tổng số lao động:
                            </Text>
                            <Text style={{
                                width: '30%',
                                fontFamily: 'Mulish-Bold',
                                color: '#000000',
                                paddingLeft: 30
                            }}>
                                {dataLabor?.QtyAllLabor}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.labelContent}>
                                Số lao động báo nghỉ:
                            </Text>
                            <Text style={{
                                width: '30%',
                                fontFamily: 'Mulish-Bold',
                                color: '#000000',
                                paddingLeft: 30
                            }}>
                                {dataLabor?.QtyAllAbsence}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.labelContent}>
                                Số lao động đi làm:
                            </Text>
                            <Text style={{
                                width: '30%',
                                fontFamily: 'Mulish-Bold',
                                color: '#000000',
                                paddingLeft: 30
                            }}>
                                {dataLabor?.QtyAllReal}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.labelContent}>
                                Số lao động tính năng suất:
                            </Text>
                            <Text style={{
                                width: '30%',
                                fontFamily: 'Mulish-Bold',
                                color: '#000000',
                                paddingLeft: 30
                            }}>
                                {dataLabor?.QtyAllProductivity}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.labelContent}>
                                Học sinh đào tạo:
                            </Text>
                            <Text style={{
                                width: '30%',
                                fontFamily: 'Mulish-Bold',
                                color: '#000000',
                                paddingLeft: 30
                            }}>
                                {dataLabor?.QtyAllStudent}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.labelContent}>
                                Thời vụ:
                            </Text>
                            <Text style={{
                                width: '30%',
                                fontFamily: 'Mulish-Bold',
                                color: '#000000',
                                paddingLeft: 30
                            }}>
                                {dataLabor?.QtyAllTV}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.lastLabel}>
                                Báo ăn:
                            </Text>
                            <Text style={{
                                width: '30%',
                                fontFamily: 'Mulish-Bold',
                                color: '#000000',
                                paddingLeft: 30
                            }}>
                                {dataLabor?.QtyAllEatinglabor}
                            </Text>
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
        borderColor: '#006496',
        borderRightWidth: 1,
    },
    gridThird: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    lastLabel: {
        color: '#454749',
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '400',
        width: '70%',
        borderColor: '#006496',
        borderRightWidth: 1,
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
)(WorkerInfor);