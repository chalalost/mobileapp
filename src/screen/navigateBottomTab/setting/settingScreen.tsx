import { NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import SettingCompMain from './components/settingCompMain';

import { ScreenNamesBySettingsScreen } from '../../share/app/constants/constants'


const dimension = Dimensions.get('window');

export interface SettingProps {
    navigation: NavigationProp<any, any>
};

const rows = 3;
const cols = 3;
const marginHorizontal = 0;
const marginVertical = 10;
const width = (Dimensions.get('window').width / cols) - (marginHorizontal * (cols + 1));
const height = 110;


const SettingScreen: React.FC<SettingProps> = ({ navigation }) => {
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: '#003350' }
            }}
            initialRouteName={ScreenNamesBySettingsScreen.SettingCompMain}
        >
            <Stack.Screen options={{ title: 'Thông tin cá nhân', headerTitleStyle: { color: '#ffffff', fontFamily: 'Mulish-Bold' } }} name={ScreenNamesBySettingsScreen.SettingCompMain} component={SettingCompMain} />
        </Stack.Navigator>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003350'
    },
});


export default SettingScreen;