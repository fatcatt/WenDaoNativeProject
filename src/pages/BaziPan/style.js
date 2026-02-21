import {View, Button, Text, DatePickerIOS, Platform} from 'react-native';
const styles = {
    paipanWrapper: {
        // backgroundColor: '#fff7b3',
        // backgroundColor: '#FFFFC0',
        // backgroundColor: '#F2F5FE',
        backgroundColor: '#FFFDD1',
        height: '100%',
        flex: 1
    },
    bazipanHeader: {
        backgroundColor: '#5b4942',
        alignItems: 'center',
        paddingTop: 3,
        paddingLeft: 8,
        paddingRight: 16,
        paddingBottom: 8,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 500,
        // flex: 1, // 右侧文字占用的空间
        textAlign: 'center'
    },
    paipanContainer: {
        flex: 1,
        padding: 14
    },
    safeArea: {
        backgroundColor: '#5b4942'
    },
    safeAreaBottom: {
        backgroundColor: '#FFFDD1'
    },
    header: {
        // height: 40,
        backgroundColor: '#333'
    },
    container: {
        backgroundColor: '#FFFDD1',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    column: {
        flex: 1,
        marginRight: 4
    },
    bigFont: {
        fontSize: 22,
        fontWeight: 800,
        fontFamily: 'Arial'
    },
    middleFont: {
        fontSize: 18,
        fontWeight: 500
    },
    miniFont: {
        fontSize: 14
    },
    boldFont: {
        fontWeight: 500
    },
    // 有相关性的间距与没有相关性的间距做区分 注意：有相关性的间距可能不是8，可能是0
    marginSeparate: {
        marginBottom: 10
    },
    // 正式的字体与非正式的字体做区分
    formalFontFamily: {},
    inFormalFontFamily: {},
    // 标题与content做锁紧区分
    tabLeft: {
        marginLeft: 8
    },
    colorJin: {
        color: '#FF9900'
    },
    colorMu: {
        color: '#22DD22'
    },
    colorShui: {
        color: '#000000'
    },
    colorHuo: {
        color: '#DD2222'
    },
    colorTu: {
        color: '#a06300'
    },
    fontFamilyMain: {
        fontFamily: 'Arial'
    },
    inline: {
        flexWrap: 'nowrap',
        flexDirection: 'row'
    },
    canggan: {
        marginBottom: 2
    },
    yunFont: {
        color: '#333',
        fontSize: 19,
        fontWeight: 600
    },
    genderTitle: {
        fontSize: 18
    },
    startWithBox: {
        marginBottom: 6,
        marginTop: 6,
        alignItems: 'center'
    },
    startWithText: {
        fontSize: 14
    },
    liunianText: {
        fontSize: 16,
        marginBottom: 2
    },
    touchable: {
        borderRadius: 2,
        backgroundColor: 'transparent',
        padding: 2
    },
    nianIndex: {
        alignItems: 'center'
    },

    notice: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: [
            {translateX: -110}, // Adjust by half width
            {translateY: -32} // Adjust by half height
        ],
        backgroundColor: '#F5F5F5CC',
        paddingTop: 8,
        width: 220,
        paddingBottom: 8,
        // paddingLeft: 32,
        // paddingRight: 32,
        borderRadius: 10,
        zIndex: 1000
        // boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
    },
    noticeText: {
        color: '#333',
        textAlign: 'center',
        fontSize: 16
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666'
    },
    remarkWrapper: {
        marginTop: 32
    },
    remark: {
        height: 40,
        borderWidth: 0.5,
        padding: 10,
        marginTop: 8
    },
    geju: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    // gejuText: {
    //     marginTop: 2,
    //     color: '#AF9153',
    //     fontWeight: 600
    // },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22
    },
    modalView: {
        width: '90%',
        margin: 20,
        backgroundColor: '#FFFFE7',
        borderRadius: 20,
        padding: 18,
        paddingTop: 16,
        paddingBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 10
    },
    openButton: {
        backgroundColor: '#F194FF',
        borderRadius: 15,
        padding: 8,
        elevation: 2,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 32,
        paddingRight: 32,
        marginTop: 16
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center'
    },
    modalTitleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'center'
    },
    gejuWrapper: {
        // felx: 1,
        // flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: '#D9EDF699',
        borderWidth: 1,
        borderColor: '#D9EDF6',
        paddingTop: 8,
        paddingBottom: 8,
        width: '100%',
        paddingLeft: 16,
        paddingRight: 16,
        // paddingRight: 18,
        borderRadius: 8,
        marginBottom: 8
    },
    gejuText: {
        color: '#42748a',
        fontWeight: 600,
        fontSize: 14,
        lineHeight: 22
    },
    yongshenText: {
        color: '#42748a',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 8
    },
    gejuModalTitle: {
        color: '#42748a',
        fontWeight: 600,
        fontSize: 20
    },
    mingyu: {
        // marginTop: 8,
        fontWeight: 600,
        fontSize: 14,
        lineHeight: 22
    },
    shenshaText: {
        color: '#42748a'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        width: '80%',
        maxHeight: '70%',
        borderRadius: 10,
        paddingTop: 18,
        paddingBottom: 18,
        paddingLeft: 8,
        paddingRight: 8,
        alignItems: 'center',
        backgroundColor: '#FFFFE7'
    },
    scrollContainer: {}
};
export default styles;
// 1、主体部分可以通过重复的方式凸显。比如八字主体和大运
// 2、应该形成明确的对比；主体的八字大运部分，和胎元命宫等形成明确对比
