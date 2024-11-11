import { NavigationProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Dimensions, View, Platform } from 'react-native';
import Modal from "react-native-modal";
import { AppBarTitle } from "../myStatusBar/MyStatusBar";

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;
type ModalProps = {
    navigation: NavigationProp<any, any>
    isOpenModalProps: boolean | false
    handleSetModal: Function
    component: JSX.Element
    title: string
}

const ModalBase = ({ navigation, isOpenModalProps, component, handleSetModal, title }: ModalProps) => {
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    useEffect(() => {
        setIsOpenModal(isOpenModalProps);
    }, [isOpenModalProps])

    return (
        <Modal
            isVisible={isOpenModal}
            style={{ backgroundColor: '#ffffff', margin: 0 }
            }
            onBackdropPress={() => setIsOpenModal(false)}
            statusBarTranslucent={false}
            deviceHeight={deviceHeight}
            deviceWidth={deviceWidth}
        >
            <AppBarTitle
                navigation={navigation}
                setIsOpenModal={() => setIsOpenModal(false)}
                handleSetModal={() => handleSetModal(false)}
                title={title}
                component={null}
                hidenStatusBar={Platform.OS === 'ios' ? false : true}
            />

            <View style={{ width: deviceWidth, backgroundColor: 'blue', flex: 1 }}>
                {component}
            </View>

        </Modal >
    )
};

export default ModalBase;
