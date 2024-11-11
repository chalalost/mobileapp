import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PopUpProps = {
    title: string,
    content: string,
    handleClose: () => void
    handleConfirm: () => void
}

export default function PopUpBase(props: PopUpProps) {
    const { title, content, handleClose, handleConfirm } = props

    const handleOnPressClose = () => {
        handleClose()
    }

    const handleOnPressSubmit = () => {
        handleConfirm()
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.textHeaderLabel}>
                    {title}
                </Text>
            </View>
            <View style={styles.content}>
                <Text style={{
                    color: '#000000', fontFamily: 'Mulish-SemiBold', fontStyle: 'normal',
                    fontWeight: '400'
                }}>
                    {content}
                </Text>
            </View>
            <View style={styles.submit}>
                <TouchableOpacity style={styles.exitButton} onPress={handleOnPressClose} >
                    <View>
                        <Text style={styles.exitLabel}>
                            Hủy
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleOnPressSubmit}>
                    <View>
                        <Text style={styles.submitLabel}>
                            Xác nhận
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        //justifyContent: 'center',
        height: '30%',
        width: '100%',
        backgroundColor: '#ffffff',
        marginBottom: '50%'
    },
    header: {
        justifyContent: 'center',
        position: 'relative',
        paddingLeft: 10,
        borderColor: '#D9D9D9',
        height: 50,
        borderBottomWidth: 1,
        top: 0,
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '500',
    },
    content: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '500',
    },
    textHeaderLabel: {
        fontSize: 16,
        fontFamily: 'Mulish-SemiBold',
        fontStyle: 'normal',
        fontWeight: '600',
        color: '#003350'
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
