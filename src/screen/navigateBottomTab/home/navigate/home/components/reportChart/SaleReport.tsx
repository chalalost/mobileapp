import dayjs from 'dayjs';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {Rect} from 'react-native-svg';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryLabel,
  VictoryTheme,
} from 'victory-native';
import {
  ApiHomeReport,
  ResponseService,
} from '../../../../../../share/app/constantsApi';
import CommonBase from '../../../../../../share/network/axios';
import {
  HomeState,
  IChartLabel,
  IListWorkCenter,
  ISaleReport,
} from '../../types/types';

import {connect} from 'react-redux';
import HomeAction from '../../saga/homeAction';
import {getDateTimeSelector} from '../../saga/homeSelectors';
import {Action, AnyAction, bindActionCreators, Dispatch} from 'redux';
import {createStructuredSelector} from 'reselect';
import baseAction from '../../../../../../base/saga/action';
import Storage from '../../../../../../share/storage/storage';

const marginVertical = 0;
const width = Dimensions.get('window').width;

type SaleInfoProp = {
  getDateTimeSelector: HomeState['getDateTimeSelector'];
  isShow: boolean;
  isRefreshing: boolean;
  baseAction: typeof baseAction;
};

const SaleReport: React.FC<SaleInfoProp> = prop => {
  const {getDateTimeSelector, isShow, baseAction, isRefreshing} = prop;

  // bao cao doanh thu
  const [dataChartSaleReportForToday, setDataChartSaleReportForToday] =
    useState<IChartLabel[]>([]);
  const [dataChartSaleReportForYesterday, setDataChartSaleReportForYesterday] =
    useState<IChartLabel[]>([]);
  const [dataLabel, setDataLabel] = useState<string[]>();

  const [isDataEmpty, setIsDataEmpty] = useState<boolean>(false);

  const [dataSaleReport, setDataSaleReport] = useState<ISaleReport[]>([]);

  // const handleSumDataSale = (
  //   data: ISaleReport,
  //   field: keyof IListWorkCenter,
  // ) => {
  //   let value = data?.ListWorkcenter?.reduce(
  //     (total, itemData: IListWorkCenter) => {
  //       return total + +itemData[field];
  //     },
  //     0,
  //   );
  //   return value;
  // };

  const getDataSaleReport = async () => {
    
    let dataResponse = await CommonBase.getAsync<ResponseService>(
      ApiHomeReport.SALE_REPORT + '/' + getDateTimeSelector,
      null,
    );
    if (
      typeof dataResponse !== 'string' &&
      dataResponse != null &&
      dataResponse.isSuccess === true
    ) {
      let data = {
        reportSale: dataResponse.data,
      };
      setDataSaleReport(data.reportSale);
      setupDataSaleReport(data.reportSale);
      setupLabel(data.reportSale);
    }
    
  };

  const [isShowK, setIsShowK] = useState<boolean>(false);

  const setupDataSaleReport = (listDataSale: ISaleReport[]) => {
    let dataSaleReport = listDataSale;
    if (dataSaleReport && dataSaleReport.length > 0) {
      var listSaleToday: IChartLabel[] = [];
      var listSaleYesterday: IChartLabel[] = [];
      var wcidTemp = '';
      var indexX = 0;
      for (var i = 0; i < dataSaleReport.length; i++) {
        dataSaleReport[i].ListWorkcenter.forEach(item => {
          if (item.Workcenterid != wcidTemp) {
            wcidTemp = item.Workcenterid;
            indexX++;
            if (item.CustomerRevenue >= 500000) {
              setIsShowK(true);
            } else {
              setIsShowK(false);
            }
            listSaleToday.push({
              x: indexX,
              y: item.CustomerRevenue,
            });
          } else {
            var datatemp = listSaleToday.find(m => m.x == indexX);
            if (datatemp != null) {
                datatemp.y += item.CustomerRevenue;
            }
          }
        });
      }
      var datatemp = listSaleToday.find(m => m.y >= 500000);
      if (datatemp != null) {
        setIsShowK(true);
      }
      if (listSaleToday.length == 0) {
        setIsDataEmpty(true);
      }
      if (listSaleYesterday.length == 0) {
        setIsDataEmpty(true);
      } else {
        setIsDataEmpty(false);
      }
      setDataChartSaleReportForToday([...listSaleToday]);
      setDataChartSaleReportForYesterday([...listSaleYesterday]);
    }
  };

  const setupLabel = (listDataSale: ISaleReport[]) => {
    let listTemp: any[] = [];
    if (listDataSale && listDataSale?.length > 0) {
      listDataSale.forEach(item => {
        item.ListWorkcenter.forEach(temp => {
          listTemp.push(temp);
        });
      });
    }
    var listLabel: string[] = [];
    listTemp.forEach(item => {
      var check = listLabel.find(m => m == item.Workcentername);
      if (check == null) {
        listLabel.push(item.Workcentername);
      }
    });

    if (listTemp.length == 0) {
      setIsDataEmpty(true);
    } else {
      setIsDataEmpty(false);
    }
    let removeDuplicate: string[] = [...new Set(listLabel)];
    setDataLabel([...removeDuplicate]);
  };

  const [moneyType, setMoneyType] = useState('');

  useEffect(() => {
    const fetch = async () => {
      let getData = await Storage.getItem('listConfigSystem');
      let removeFirstCharacter = getData?.replace('"', '');
      let final = removeFirstCharacter?.replace('"', '');
      setMoneyType(final || '');
    };
    fetch();
  }, []);

  useEffect(() => {
    getDataSaleReport();
  },[isRefreshing])

  useEffect(() => {
    baseAction.setSpinnerReducer({isSpinner: true, textSpinner: ''});
    if (getDateTimeSelector != '') {
      getDataSaleReport();
    }
    baseAction.setSpinnerReducer({isSpinner: false, textSpinner: ''});
  }, [getDateTimeSelector]);

  let datalength = dataChartSaleReportForToday.length;
  return (
    <View>
      {isShow == true && isDataEmpty == false ? (
        <>
          <View style={{...styles.chart}}>
            <ScrollView horizontal>
              <VictoryChart
                width={datalength > 3 ? width + datalength * 20 : width - 60}
                height={420}
                domainPadding={88}
                theme={VictoryTheme.material}>
                <VictoryLabel
                  x={2}
                  y={25}
                  style={{
                    fill: '#003350',
                    fontFamily: 'Mulish-Bold',
                    fontSize: 14,
                    fontStyle: 'normal',
                  }}
                  text={
                    isShowK == true
                      ? '( Đơn vị tính: K ' + moneyType + ')'
                      : '( Đơn vị tính: ' + moneyType + ')'
                  }
                />
                <VictoryAxis
                  padding={12}
                  dependentAxis={true}
                  tickFormat={
                    isShowK == true ? x => `${x / 1000}` : x => `${x}`
                  }
                  style={{
                    axis: {strokeWidth: 0},
                    ticks: {strokeWidth: 0},
                    tickLabels: {
                      fill: '#004B72',
                      fontFamily: 'Mulish-Bold',
                      fontSize: 10,
                    },
                  }}
                />
                <VictoryAxis
                  tickFormat={dataLabel}
                  style={{
                    axis: {stroke: '#003350', strokeWidth: 0.2},
                    ticks: {strokeWidth: 1},
                    tickLabels: {
                      fill: '#003350',
                      fontFamily: 'Mulish-Bold',
                      fontSize: 12,
                    },
                  }}
                />
                <VictoryGroup>
                  <VictoryBar
                    data={dataChartSaleReportForToday}
                    x={'x'}
                    y={'y'}
                    barWidth={14}
                    labels={() =>
                      dataChartSaleReportForToday.findIndex(x => x.y).toString()
                    }
                    cornerRadius={6}
                    labelComponent={
                      <VictoryLabel
                        text={({datum}): string =>
                          `${
                            isShowK == true
                              ? parseInt(
                                  (parseFloat(datum.y) / 1000).toFixed(0),
                                ) <= 1
                                ? ''
                                : parseInt(
                                    (parseFloat(datum.y) / 1000).toFixed(0),
                                  )
                              : parseFloat(datum.y).toFixed(0)
                          }`
                        }
                        dx={-32}
                        dy={0}
                        style={[
                          {
                            fill: '#003350',
                            fontFamily: 'Mulish-Bold',
                            fontSize: 12,
                          },
                        ]}
                        angle={-90}
                        textAnchor="start"
                        verticalAnchor="middle"
                      />
                    }
                    // animate={{
                    //     duration: 200,
                    //     onLoad: { duration: 200 },
                    // }}
                    style={{
                      data: {
                        fill: '#E75A5A',
                      },
                    }}
                  />

                  {/* <VictoryBar
                    data={dataChartSaleReportForYesterday}
                    x={'x'}
                    y={'y'}
                    labels={() =>
                      dataChartSaleReportForYesterday
                        .findIndex(x => x.y)
                        .toString()
                    }
                    labelComponent={
                      <VictoryLabel
                        text={({datum}): string =>
                          `${parseInt(datum.y) <= 1 ? '' : parseInt(datum.y)}`
                        }
                        dx={-34}
                        dy={0}
                        style={[
                          {
                            fill: '#003350',
                            fontFamily: 'Mulish-Bold',
                            fontSize: 12,
                          },
                        ]}
                        angle={-90}
                        textAnchor="start"
                        verticalAnchor="middle"
                      />
                    }
                    // animate={{
                    //     duration: 200,
                    //     onLoad: { duration: 200 },
                    // }}
                    style={{
                      data: {
                        fill: '#3CA8E5',
                      },
                    }}
                    barWidth={14}
                  /> */}
                </VictoryGroup>
              </VictoryChart>
            </ScrollView>
          </View>

          <View
            style={{justifyContent: 'center', alignItems: 'center'}}
            //style={[styles.gridSecond]}
          >
            <View style={[styles.label]}>
              <Svg
                style={{position: 'absolute', top: 8}}
                width="12"
                height="12"
                viewBox="0 0 9 9"
                fill="none">
                <Rect
                  x="0.0361328"
                  y="0.192383"
                  width="8"
                  height="8"
                  rx="4"
                  fill="#E75A5A"
                />
              </Svg>
              <TouchableOpacity>
                <Text style={[styles.text]}> Doanh thu hôm nay</Text>
              </TouchableOpacity>
            </View>
            {/* <View style={[styles.label]}>
              <Svg
                style={{position: 'absolute', top: 8}}
                width="12"
                height="12"
                viewBox="0 0 9 9"
                fill="none">
                <Rect
                  x="0.0361328"
                  y="0.192383"
                  width="8"
                  height="8"
                  rx="4"
                  fill="#3CA8E5"
                />
              </Svg>
              <TouchableOpacity>
                <Text style={[styles.text]}> Doanh thu hôm trước</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </>
      ) : (
        <View style={[styles.gridThird]}>
          <Text
            style={{
              color: '#003350',
              fontFamily: 'Mulish-SemiBold',
              fontStyle: 'normal',
              fontWeight: '600',
              fontSize: 16,
              alignContent: 'center',
              justifyContent: 'center',
              paddingTop: 26,
              height: 60,
            }}>
            Không có dữ liệu
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chart: {
    paddingLeft: 20,
    justifyContent: 'center',
  },
  gridSecond: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 24,
    paddingRight: 24,
  },
  gridThird: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontFamily: 'Mulish-Bold',
    fontSize: 12,
    color: '#003350',
    paddingLeft: 8,
  },
  label: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
});

const mapDispatchToProps = (dispatch: Dispatch<Action<AnyAction>>) => ({
  HomeAction: bindActionCreators(HomeAction, dispatch),
  baseAction: bindActionCreators(baseAction, dispatch),
});
const mapStateToProps = createStructuredSelector({
  getDateTimeSelector,
});
export default connect(mapStateToProps, mapDispatchToProps)(SaleReport);
