import { NavigationProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageSourcePropType } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MyTitleHome from '../../../share/base/component/myStatusBar/MyTitleHome';

export interface LoginScreenProps {
    navigation: NavigationProp<any, any>
};

interface Iitem {
    id: string | ''
    quantity: string | ''
    title: string | ''
    iconLeft: ImageSourcePropType | undefined
    iconRight: ImageSourcePropType | undefined
}
const DATA = [
    {
        id: '1',
        iconLeft: require('../../../../images/report/Icon-3.png'),
        quantity: '40,102',
        title: 'Báo cáo sản lượng',
        iconRight: require('../../../../images/report/ic-trending-up-24px-1.png'),
    },
    {
        id: '2',
        iconLeft: require('../../../../images/report/Icon-2.png'),
        quantity: '40,102',
        title: 'Báo cáo chất lượng',
        iconRight: require('../../../../images/report/ic-trending-up-24px.png'),
    },
    {
        id: '3',
        iconLeft: require('../../../../images/report/Icon-1.png'),
        quantity: '40,102',
        title: 'Báo cáo sửa chữa sản xuất',
        iconRight: require('../../../../images/report/ic-trending-up-24px-1.png'),
    },
    {
        id: '4',
        iconLeft: require('../../../../images/report/Icon-6.png'),
        quantity: '40,102',
        title: 'Báo cáo OEE',
        iconRight: require('../../../../images/report/ic-trending-up-24px.png'),
    },
    {
        id: '5',
        iconLeft: require('../../../../images/report/Icon.png'),
        quantity: '40,102',
        title: 'Báo cáo nhập/xuất kho',
        iconRight: require('../../../../images/report/ic-trending-up-24px.png'),
    },
    {
        id: '6',
        iconLeft: require('../../../../images/report/Icon-5.png'),
        quantity: '40,102',
        title: 'Báo cáo bảo trì bảo dưỡng',
        iconRight: require('../../../../images/report/ic-trending-up-24px.png'),
    },


];

const rows = 3;
const cols = 3;
const marginHorizontal = 0;
const marginVertical = 10;
const width = (Dimensions.get('window').width / cols) - (marginHorizontal * (cols + 1));
const height = 122;
const Percent = (item: Iitem) => {
    if (item.iconRight == require('../../../../images/report/ic-trending-up-24px.png')) {
        return (
            <Text style={styles.percent1} >4.3%</Text>
        )
    } else
        return <Text style={styles.percent2} >4.3%</Text>
}

const Report = ({ navigation }: LoginScreenProps) => {
    const insets = useSafeAreaInsets();
    const renderItem = (item: Iitem, index: number) => {
        return (
            <View>
                <TouchableOpacity onPress={() => {
                    switch (parseInt(item.id)) {
                        case 1:
                            navigation.navigate('ReportQuantity')
                            break;
                        case 2:
                            navigation.navigate('ReportQuality')
                            break;
                        case 3:
                            navigation.navigate('ReportProductionRepair')
                            break;
                        case 4:
                            navigation.navigate('ReportOEE')
                            break;
                        case 5:
                            navigation.navigate('ReportImportExport')
                            break;
                        case 6:
                            navigation.navigate('ReportMaintenance')
                            break;
                        default:
                            break;
                    }
                }} key={index} style={styles.sectionContainer}>
                    <View style={styles.boxContainer1}>
                        <Image
                            resizeMode='contain'
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            source={item.iconLeft} />
                    </View>
                    <View style={styles.boxContainer2}>
                        <Text style={styles.text}>{item.title}</Text>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                    </View>
                    <View style={styles.boxContainer3}>
                        <Image
                            resizeMode='contain'
                            style={{ width: '70%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            source={item.iconRight} />
                        <Percent {...item} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#003350', '#00598C']} style={[styles.linearGradient, { paddingTop: insets.top }]}>

                <MyTitleHome
                    navigation={navigation}
                    toggleDrawer={() => {
                        // navigation.toggleDrawer()
                    }}
                    isShowIconLeft={false}
                    component={null}
                    title="Báo cáo"
                    hidenStatusBar={true}
                    isShowIconRight={false}
                />
            </LinearGradient>
            <FlatList
                data={DATA}
                renderItem={({ item, index, separators }) => renderItem(item, index)}
                keyExtractor={item => item.id}
            />
        </View>

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
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    sectionContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: 90,
        width: '100%'
    },

    boxContainer1: {
        width: '15%',
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingLeft: 15,
    },
    boxContainer2: {
        width: '70%',
        paddingLeft: 8,
        height: height,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    boxContainer3: {
        width: '15%',
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingRight: 12,
    },
    percent1: {
        fontSize: 12,
        color: '#00B69B',
        fontFamily: 'Mulish-SemiBold',
    },
    percent2: {
        fontSize: 12,
        color: '#F93C65',
        fontFamily: 'Mulish-SemiBold',
    },
    text: {
        width: '100%',
        height: 22,
        fontFamily: 'Mulish-SemiBold',
        fontweight: '200',
        fontSize: 14,
        color: '#394856'
    },
    quantity: {
        fontFamily: 'Mulish-Bold',
        fontSize: 18,
        fontWeight: '600',
        display: 'flex',
        color: '#394856'
    }
});
export default Report;