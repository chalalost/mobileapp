import { useIsFocused } from '@react-navigation/native'
import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types';
import Select2 from "./plugin/react-select2-native/index";


export default function SelectBaseWithoutIcon(props) {
    const [data, setdata] = useState();
    const isFocused = useIsFocused();
    return (
        <View>
            <Select2
                isSelectSingle={props.isSelectSingle}
                style={props?.styles}
                colorTheme={'#001E31'}
                filterOption={false}
                popupTitle={props.popupTitle}
                title={props.title}
                data={props?.listData ? [...props?.listData] : []}
                onSelect={(data) => {
                    if (props.isSelectSingle == true && data.length == 0)
                        return;
                    props.onSelect(data)
                }}
                onRemoveItem={(data) => {
                    setdata(data);
                }}
                selectedValue={[...props.valueArr]}
                value={[...props.valueArr]}
            />
        </View>

    )
}

SelectBaseWithoutIcon.propTypes = {
    onSelect: PropTypes.func,
    onRemoveItem: PropTypes.func,
    styles: PropTypes.any,
    stylesIcon: PropTypes.any,
    popupTitle: PropTypes.string,
    title: PropTypes.string,
    listData: PropTypes.oneOfType([PropTypes.array]),
    valueArr: PropTypes.oneOfType([PropTypes.array]),
    selectedValue: PropTypes.string,
    isSelectSingle: PropTypes.oneOfType([PropTypes.bool]),
}

