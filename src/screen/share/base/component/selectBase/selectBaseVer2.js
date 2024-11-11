import { useIsFocused } from '@react-navigation/native'
import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types';
import Select2 from "./plugin/react-select2-native/index";
import { Svg, Path } from "react-native-svg";


export default function SelectBaseVer2(props) {
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
                searchBoxTextChanged={props.searchBoxTextChanged}
                selectedValue={[...props.valueArr]}
                value={[...props.valueArr]}
            />
            <Svg style={props.stylesIcon} width="16" height="16" fill="#003350">
                <Path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
            </Svg>
            {/* <Svg style={props.stylesIcon} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <Path d="M4.31827 5.01102L1.29011 1.98286C0.66015 1.3529 1.10632 0.275757 1.99722 0.275757H8.28647C9.19534 0.275757 9.63293 1.39011 8.96692 2.00855L5.70583 5.03671C5.31167 5.40271 4.69861 5.39136 4.31827 5.01102Z" fill="#003350" />
            </Svg> */}
        </View>

    )
}

SelectBaseVer2.propTypes = {
    onSelect: PropTypes.func,
    onRemoveItem: PropTypes.func,
    styles: PropTypes.any,
    stylesIcon: PropTypes.any,
    popupTitle: PropTypes.string,
    title: PropTypes.string,
    searchBoxTextChanged: PropTypes.func,
    listData: PropTypes.oneOfType([PropTypes.array]),
    valueArr: PropTypes.oneOfType([PropTypes.array]),
    selectedValue: PropTypes.string,
    isSelectSingle: PropTypes.oneOfType([PropTypes.bool]),
}

