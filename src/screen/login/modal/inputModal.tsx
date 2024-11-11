import React, { useState } from 'react'
import { Text, View, TextInput, TouchableHighlight, StyleSheet, Dimensions, NativeSyntheticEvent, TextInputChangeEventData } from "react-native";
import { IGateway } from '../../share/app/gateway';
import PropTypes from 'prop-types'
import { PortTypes } from '../types/portType.proptype';
import { IRule, typeVadilate } from '../../share/commonVadilate/validate';

const { height, width } = Dimensions.get('window');


interface InputProps {
    addNew: (name: string, port: string, TenantName: string) => void
    editCurrentName: (name: string) => void
    editCurrentPort: (port: string) => void
    editCurrentTenent: (TenantName: string) => void
    finishEdit: () => void
    currentDefault: IGateway | null
}

export default function InputModal(props: InputProps) {
    const { addNew, editCurrentName, editCurrentPort, finishEdit, editCurrentTenent, currentDefault } = props;
    const [name, setName] = useState<string>('');
    const [port, setPort] = useState<string>('');
    const [TenantName, setTenantName] = useState<string>('');

    const handleSubmit = (event: any) => {
        event.preventDefault()
        if (currentDefault) {
            finishEdit()
            if (name) setName('')
            if (port) setPort('')
            if (TenantName) setTenantName('')
        }
        else {
            addNew(name, port, TenantName)
            setName(name)
            setPort(port)
            setTenantName(TenantName)
        }
    }

    const onChangeInputName = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
        const value = event.nativeEvent.text;
        if (currentDefault) {
            editCurrentName(value)
        } else {
            setName(value)
        }
    }

    const onChangeInputPort = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
        const value = event.nativeEvent.text;
        if (currentDefault) {
            editCurrentPort(value)
        } else {
            setPort(value)
        }
    }

    const onChangeInputTenet = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
        const value = event.nativeEvent.text;
        if (currentDefault) {
            editCurrentTenent(value)
        } else {
            setTenantName(value)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}> Tên nhà máy: </Text>
            <TextInput
                style={styles.input}
                placeholder={'Điền tên nhà máy...'}
                placeholderTextColor={'#b5b5b5'}
                onChange={onChangeInputName}
                value={currentDefault ? currentDefault.name : name} />
            <Text style={styles.label}> Url: </Text>
            <TextInput
                style={styles.input}
                placeholderTextColor={'#b5b5b5'}
                placeholder={'Điền port nhà máy...'}
                onChange={onChangeInputPort}
                value={currentDefault ? currentDefault.port : port} />

            <TouchableHighlight onPress={handleSubmit} style={styles.submitButton}>
                <Text style={{ color: '#ffffff' }}>Lưu</Text>
            </TouchableHighlight>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        height: '50%',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: '70%'
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        padding: 12,
        color: '#001E31'
    },
    input: {
        borderColor: 'gray',
        borderRadius: 12,
        borderBottomWidth: 1,
        height: '15%',
        padding: 12,
        color: '#001E31'
    },
    submitButton: {
        alignItems: 'center',
        backgroundColor: '#003350',
        width: '20%',
        height: '10%',
        margin: 12,
        justifyContent: 'center'
    }
})

InputModal.propTypes = {
    addNew: PropTypes.func.isRequired,
    editCurrentName: PropTypes.func.isRequired,
    editCurrentPort: PropTypes.func.isRequired,
    editCurrentTenent: PropTypes.func.isRequired,
    finishEdit: PropTypes.func.isRequired,
    currentDefault: PropTypes.oneOfType([PortTypes, PropTypes.oneOf([null])])
}
