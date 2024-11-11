import { CommonActions, NavigationProp, StackActions, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { NavigationHomeProductionRecord } from '../../../../share/app/constants/homeConst';
import InputProductionRecordScreen from './component/productionInputRecord';
import QRRecordScreen from './component/productionQRRecord';
import SubmitOTProductionRecordScreen from './component/productionSubmitOTRecord';
import SubmitProductionRecordScreen from './component/productionSubmitRecord';

export interface ProductionRecordProps {
    navigation: NavigationProp<any, any>
};

const ProductionRecordScreen: React.FC<ProductionRecordProps> = ({ navigation }) => {
    const Stack = createNativeStackNavigator();
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
        });

        return () => {
            unsubscribe;
        };
    }, [navigation]);

    const resetTabStacksOnBlur = ({ navigation }: ProductionRecordProps) => ({
        blur: () => {
            const state = navigation.getState();

            state.routes.forEach((route, tabIndex) => {
                if (state?.index !== tabIndex) {
                    navigation.dispatch(StackActions.popToTop());
                }
            });
        },
    });
    return (
        <Stack.Navigator
            screenOptions={{
                // ...tabScreenOptions, unmountOnBlur: true ,
                headerShown: false,
                headerTintColor: '#FFFFFF',
                headerStyle: {
                    backgroundColor: 'blue'
                }
            }}

            initialRouteName={NavigationHomeProductionRecord.InputScreen}>
            <Stack.Screen
                // listeners={({ navigation, route }) => ({
                //     blur: () => {
                //         navigation.dispatch(
                //             CommonActions.reset({
                //                 index: 1,
                //                 routes: [{ name: 'InputScreen' }]
                //             })
                //         )
                //     }
                // })}

                name={NavigationHomeProductionRecord.InputScreen} component={InputProductionRecordScreen}></Stack.Screen>
            {/* <Stack.Screen name="QRScanScreen" component={QRRecordScreen}></Stack.Screen> */}
            <Stack.Screen name={NavigationHomeProductionRecord.SubmitScreen} component={SubmitProductionRecordScreen}></Stack.Screen>
            {/* <Stack.Screen name="SubmitOTScreen" component={SubmitOTProductionRecordScreen}></Stack.Screen> */}
        </Stack.Navigator>
    )
}
export default ProductionRecordScreen;
