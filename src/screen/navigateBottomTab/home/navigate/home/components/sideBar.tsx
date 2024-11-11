import { NavigationProp } from '@react-navigation/native';
import React from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const routes = [
    {
        name: 'Báo số lao động đầu ngày',
        Screen: '',

    },
    {
        name: 'Báo số lao động cuối ngày',
        Screen: '',

    },
    {
        name: 'Ghi nhận sản lượng',
        Screen: '',

    }
]

export interface SidebarProp {
    navigation: NavigationProp<any, any>;
}

//const SideBarDrawer = ({navigation} : SidebarProp) => {
const SideBarDrawer = (props: any) => {
    const RenderItem = () => {
        return (
            <View>
                <TouchableOpacity>
                    <Text>Báo số lao động đầu ngày</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={{ color: 'white', paddingLeft: 15, fontSize: 18, fontWeight: '700', lineHeight: 24}}>
                    Menu
                </Text>
            </View>
            <View style={styles.content}>
                <FlatList
                    data={routes}
                    renderItem={({ item }) =>
                        <View style={styles.label}>
                            <TouchableOpacity style={styles.labelOnPress}>
                                <Text style={{ color: '#004B72', fontSize: 14, fontWeight: '500', lineHeight: 16}}>Báo số lao động đầu ngày</Text>
                            </TouchableOpacity>
                        </View>}

                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#003350',
        width: '100%',
        height: '100%',
    },
    header: {
        backgroundColor: '#003350',
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: "#eaeaea",
        paddingVertical: 8,
        justifyContent: 'center',
        paddingRight: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 20, height: 20 },
        shadowOpacity: 1,
        shadowRadius: 3,
    },
    content: {
        paddingTop: 22,
        paddingLeft: 5
    },
    label: {
        paddingBottom: 22
    },
    labelWarpBody: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        width: 260,
        height: 40,
    },
    labelOnPress: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        width: 260,
        height: 40,
        backgroundColor: '#E0EEFA',
        borderRadius: 4
    }
})

export default SideBarDrawer;
