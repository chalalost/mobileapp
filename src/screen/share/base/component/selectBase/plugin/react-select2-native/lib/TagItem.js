import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Path, Svg } from 'react-native-svg';

const TagItem = ({ tagName, onRemoveTag }) => {
    return (
        <TouchableOpacity
            onPress={onRemoveTag}
            style={{
                paddingVertical: 4, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#f5f6f5', borderWidth: 1, borderColor: '#e9e9e9', margin: 4,
                borderRadius: 3
            }}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path id="Vector" d="M6.06199 14.709L5.29199 13.939L9.22899 10.001L5.29199 6.06297L6.06199 5.29297L9.99999 9.22997L13.938 5.29297L14.708 6.06297L10.771 10.001L14.708 13.939L13.938 14.709L9.99999 10.772L6.06199 14.709Z" fill="#1A1C1E" />
            </Svg>

            <Text style={{
                fontSize: 14, color: '#333', paddingLeft: 4
            }}>
                {tagName}
            </Text>
        </TouchableOpacity>
    );
}
export default TagItem;