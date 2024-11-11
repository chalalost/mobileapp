import AsyncStorage from '@react-native-async-storage/async-storage';

const Storage = {
    async setItem(STORAGE_KEY: string, DATA: any) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
    },

    async getItem(STORAGE_KEY: string) {
        try {
            let data = await AsyncStorage.getItem(STORAGE_KEY);
            return data;
        } catch (error) {
            return undefined;
        }
    },

    async removeItem(STORAGE_KEY: string) {
        await AsyncStorage.removeItem(STORAGE_KEY);
    }
}

export default Storage;