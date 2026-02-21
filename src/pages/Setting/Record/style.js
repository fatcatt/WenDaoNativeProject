import {View, Button, Text, DatePickerIOS, Platform} from 'react-native';
const styles = {
    container: {
        flex: 1,
        color: '#000'
    },
    nickname: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold'
    },
    title: {
        fontSize: 32
    },
    renderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16
    },
    renderItemLeft: {},
    renderItemLeftTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    gender: {
        color: 'rgba(0,0,0,.45)',
        marginLeft: 8
    },
    datetime: {
        color: 'rgba(0,0,0,.45)'
    },
    baziGan: {
        marginBottom: 8
    }
};
export default styles;
