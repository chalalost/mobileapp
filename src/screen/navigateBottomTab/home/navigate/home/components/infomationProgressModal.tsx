import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Path, Svg } from 'react-native-svg'
import { IPopupReport } from '../types/types'

type InfomationProgressProps = {
    workCenterName: string,
    maincodeproduct: string,
    qtyInline: string,
    qtyOutputGarment: string,
    qtyLaundry: string,
    qtyAfterWash: string,
    qtyFinishedWarehouse: string,
    handleClose: () => void
}

export default function InfomationProgressModal(props: InfomationProgressProps) {
    const { workCenterName, qtyInline, qtyOutputGarment, qtyLaundry, qtyAfterWash, qtyFinishedWarehouse, maincodeproduct, handleClose } = props

    const handleOnPressClose = () => {
        handleClose()
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.textHeaderLabel}>
                    Thông tin sản xuất:
                </Text>
                <Text style={{
                    fontSize: 16,
                    fontFamily: 'Mulish-SemiBold',
                    fontStyle: 'normal',
                    fontWeight: '600',
                    paddingLeft: 8,
                    color: '#003350'
                }}>{workCenterName}</Text>
                {/* <TouchableOpacity onPress={handleOnPressClose}>
                    <Svg style={{ position: 'absolute', marginLeft: 70 }} width="24" height="24" viewBox="0 0 24 24" fill="none" >
                        <Path id="Vector" d="M12 12.9921L7.20472 17.7874C7.07874 17.9134 6.91748 17.9802 6.72094 17.9877C6.52378 17.9959 6.35433 17.9291 6.2126 17.7874C6.07087 17.6457 6 17.4803 6 17.2913C6 17.1024 6.07087 16.937 6.2126 16.7953L11.0079 12L6.2126 7.20472C6.08661 7.07874 6.01984 6.91717 6.01228 6.72C6.00409 6.52346 6.07087 6.35433 6.2126 6.2126C6.35433 6.07087 6.51969 6 6.70866 6C6.89764 6 7.06299 6.07087 7.20472 6.2126L12 11.0079L16.7953 6.2126C16.9213 6.08661 17.0828 6.01953 17.28 6.01134C17.4765 6.00378 17.6457 6.07087 17.7874 6.2126C17.9291 6.35433 18 6.51969 18 6.70866C18 6.89764 17.9291 7.06299 17.7874 7.20472L12.9921 12L17.7874 16.7953C17.9134 16.9213 17.9802 17.0825 17.9877 17.2791C17.9959 17.4762 17.9291 17.6457 17.7874 17.7874C17.6457 17.9291 17.4803 18 17.2913 18C17.1024 18 16.937 17.9291 16.7953 17.7874L12 12.9921Z" fill="#003350" />
                    </Svg>
                </TouchableOpacity> */}
            </View>
            <View style={styles.content}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.labelContent}>
                        Mã sản phẩm:
                    </Text>
                    <Text style={{
                        width: '40%',
                        fontFamily: 'Mulish-Bold',
                        color: '#000000',
                        paddingTop: 12,
                        paddingLeft: 24
                    }}>
                        {maincodeproduct}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.labelContent}>
                        Tổng số lượng đã vào chuyền:
                    </Text>
                    <Text style={{
                        width: '40%',
                        fontFamily: 'Mulish-Bold',
                        color: '#000000',
                        paddingTop: 12,
                        paddingLeft: 24
                    }}>
                        {qtyInline}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.labelContent}>
                        Tổng số lượng ra chuyền:
                    </Text>
                    <Text style={{
                        width: '40%',
                        fontFamily: 'Mulish-Bold',
                        color: '#000000',
                        paddingTop: 12,
                        paddingLeft: 24
                    }}>
                        {qtyOutputGarment}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.labelContent}>
                        Số lượng mang đi giặt:
                    </Text>
                    <Text style={{
                        width: '40%',
                        fontFamily: 'Mulish-Bold',
                        color: '#000000',
                        paddingTop: 12,
                        paddingLeft: 24
                    }}>
                        {qtyLaundry}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.labelContent}>
                        Số lượng đã nhận về:
                    </Text>
                    <Text style={{
                        width: '40%',
                        fontFamily: 'Mulish-Bold',
                        color: '#000000',
                        paddingTop: 12,
                        paddingLeft: 24
                    }}>
                        {qtyAfterWash}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.lastLabel}>
                        Số lượng vào kho hoàn thiện:
                    </Text>
                    <Text style={{
                        width: '40%',
                        fontFamily: 'Mulish-Bold',
                        color: '#000000',
                        paddingTop: 12,
                        paddingLeft: 24
                    }}>
                        {qtyFinishedWarehouse}
                    </Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        //justifyContent: 'center',
        width: '100%',
        backgroundColor: '#ffffff',
        marginBottom: '50%',
        padding: 6
    },
    header: {
        flexDirection: 'row',
        position: 'relative',
        paddingLeft: 10,
        height: 35,
        top: 0,
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '500',
    },
    content: {
        paddingLeft: 12,
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
        width: '55%',
        paddingTop: 12,
        paddingBottom: 12,
        borderColor: '#D9D9D9',
        borderRightWidth: 1,
    },
    lastLabel: {
        color: '#454749',
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '400',
        width: '55%',
        paddingBottom: 12,
        borderColor: '#D9D9D9',
        borderRightWidth: 1,
    },
    textHeaderLabel: {
        fontSize: 16,
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '600',
        color: '#001E31'
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        padding: 12,
        color: '#001E31'
    },
    submit: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#ffffff',
        position: 'absolute',
        bottom: 0,
    },
    exitButton: {
        alignItems: 'center',
        backgroundColor: '#ffffff',
        height: 50,
        width: '50%',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D9D9D9',
        color: '#454749'
    },
    submitButton: {
        alignItems: 'center',
        width: '50%',
        height: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D9D9D9'
    },
    exitLabel: {
        fontSize: 14,
        color: '#454749',
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '400',
    },
    submitLabel: {
        fontSize: 14,
        color: '#004B72',
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '600',
    }
})
