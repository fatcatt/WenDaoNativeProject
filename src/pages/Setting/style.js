import {View, Button, Text, DatePickerIOS, Platform} from 'react-native';
const styles = {
    settingWrapper: {
        flex: 1,
        fontSize: 12
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 32,
        justifyContent: 'space-between',
        backgroundColor: '#f5dd4b80'
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 40
    },
    userName: {
        fontSize: 18,
        fontWeight: 500
    },
    tabsButton: {
        width: 60,
        justifyContent: 'center', // Vertically center the content
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        color: '#000'
    },
    button: {
        margin: 5,
        backgroundColor: 'white',
        padding: 15,
        borderBottomColor: '#cdcdcd'
    },
    setLogo: {
        width: 28,
        height: 28
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        borderRadius: 16,
        padding: 16,
        marginTop: -16,
        backgroundColor: '#fff'
    },
    tabs: {
        flexDirection: 'row',
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: 'auto',
        marginBottom: 16
    },
    pagerView: {
        flex: 1
    },
    pagetext: {
        paddingTop: 32
    },
    buttonTextHl: {
        fontSize: 16,
        fontWeight: 500
    },
    buttonText: {
        fontSize: 16,
        color: 'rgba(0,0,0,.45)'
    },
    highlightBarWrapper: {
        width: 60,
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        textAlign: 'center'
    },
    highlightBar: {
        width: 25, // Width of the highlight bar should match the width of the tab button
        height: 2, // Height of the highlight bar
        backgroundColor: 'grey'
    },
    page: {
        flex: 1
    }
};
export default styles;
