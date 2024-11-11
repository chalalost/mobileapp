import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, NativeSyntheticEvent, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TextInputChangeEventData, TouchableOpacity, View } from 'react-native';

export type TextInputProps = {
    placeHolder: any,
    keyboardType: any,
    editable: boolean
    defaultValue: any
    isDisable: boolean
}

const TextInputBase = ({placeHolder, keyboardType, editable, defaultValue, isDisable}: TextInputProps) => {

    return(
        <View>
            <TextInput
                defaultValue= {defaultValue}
                placeholder={placeHolder}
                placeholderTextColor={'#AAABAE'}
                keyboardType= {keyboardType}
                editable= {editable}
                style={isDisable == true ? styles.disableInputBox : styles.inputBox}
            >
            </TextInput>
        </View>
    )
}

const styles = StyleSheet.create({
    inputBox: {
        width: '100%',
        height: 40,
        paddingLeft: 35,
        color: '#001E31',
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Mulish'
      },
      disableInputBox: {
        width: '100%',
        height: 40,
        paddingLeft: 35,
        color: '#808588',
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Mulish'
      }
})
export default TextInputBase;