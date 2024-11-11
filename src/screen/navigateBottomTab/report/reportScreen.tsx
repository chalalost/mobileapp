import { NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dimensions, StyleSheet } from 'react-native';
import { ScreenNamesReportScreen } from '../../share/app/constants/constants';
import ReportComMain from './components/reportCompMain';
import ReportImportExport from './components/reportImportExport';
import ReportMaintenance from './components/reportMaintenance';
import ReportOEE from './components/reportOEE';
import ReportProductionRepair from './components/reportProductionRepair';
import ReportQuality from './components/reportQuality';
import ReportQuantity from './components/reportQuantity';

export interface ReportProps {
    navigation: NavigationProp<any, any>
};

const rows = 3;
const cols = 3;
const marginHorizontal = 0;
const marginVertical = 10;
const width = (Dimensions.get('window').width / cols) - (marginHorizontal * (cols + 1));
const height = 110;

const ReportScreen: React.FC<ReportProps> = ({ navigation }) => {
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#003350' },
                headerTintColor: '#FFFFFF',
                headerShown: false,
            }}
            initialRouteName={ScreenNamesReportScreen.ReportMain}
        >
            <Stack.Screen options={{
                title: 'Báo cáo',
                headerTitleStyle: { color: '#ffffff', fontFamily: 'Mulish-Bold' }
            }}
                name={ScreenNamesReportScreen.ReportMain}
                component={ReportComMain} />
            <Stack.Screen options={{
                title: 'Báo cáo sản lượng',
                headerTitleStyle: { color: '#ffffff', fontFamily: 'Mulish-Bold' }
            }}
                name={ScreenNamesReportScreen.ReportQuantity}
                component={ReportQuantity} />
            <Stack.Screen options={{
                title: 'Báo cáo chất lượng',
                headerTitleStyle: { color: '#ffffff', fontFamily: 'Mulish-Bold' }
            }}
                name={ScreenNamesReportScreen.ReportQuality}
                component={ReportQuality} />
            <Stack.Screen options={{
                title: 'Báo cáo sửa chữa sản xuất',
                headerTitleStyle: { color: '#ffffff', fontFamily: 'Mulish-Bold' }
            }}
                name={ScreenNamesReportScreen.ReportProductionRepair}
                component={ReportProductionRepair} />
            <Stack.Screen options={{
                title: 'Báo cáo OEE',
                headerTitleStyle: { color: '#ffffff', fontFamily: 'Mulish-Bold' }
            }}
                name={ScreenNamesReportScreen.ReportOEE}
                component={ReportOEE} />
            <Stack.Screen options={{
                title: 'Báo cáo nhập/xuất kho',
                headerTitleStyle: { color: '#ffffff', fontFamily: 'Mulish-Bold' }
            }}
                name={ScreenNamesReportScreen.ReportImportExport}
                component={ReportImportExport} />
            <Stack.Screen options={{
                title: 'Báo cáo bảo trì bảo dưỡng',
                headerTitleStyle: { color: '#ffffff', fontFamily: 'Mulish-Bold' }
            }}
                name={ScreenNamesReportScreen.ReportMaintenance}
                component={ReportMaintenance} />
        </Stack.Navigator>
    );
}
const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexdirection: 'row',
        alignitems: 'center',
        padding: 12,
        gap: 10,
        width: 343,
        height: 66,
        background: '#FFFFFF',
        borderradius: 3,
        flex: 0,
        order: 0,
        alignself: 'stretch',
        flexgrow: 0,
        backgroundColor: '#01456C',
    },
});

export default ReportScreen;