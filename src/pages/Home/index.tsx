import {ScrollView, View, Text, TextInput, Button, TouchableWithoutFeedback, TouchableOpacity, Alert, SafeAreaView, Platform} from 'react-native';
import React, {useEffect, useState, useReducer} from 'react';
import {JD, J2000, radd, int2, rad2str2} from '../../utils/eph0.js';
import {SZJ} from '../../utils/eph.js';
import {SQv, JWv} from '../../utils/JW.js';
import {addOp, year2Ayear, storageL, timeStr2hour} from '../../utils/tools.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import styles from './style.js';
import moment from 'moment';
import {Gan, YangGan, YangZhi, YinZhi} from '../../utils/constants/shensha';
import calendar from 'js-calendar-converter';
import {Lunar1} from '../../utils/lunar1';
import SelectDropdown from 'react-native-select-dropdown';
import Clipboard from '@react-native-clipboard/clipboard';
// import {Lunar1} from '../../../lll.js';
const reducer = (inputFrom, action) => {
    switch (action.type) {
        case 'UPDATE_NAME':
            return {...inputFrom, inputName: action.payload};
        case 'UPDATE_PLACE':
            return {...inputFrom, inputPlace: action.payload};
        case 'UPDATE_DATE':
            return {...inputFrom, inputDate: action.payload};
        case 'UPDATE_TIME':
            return {...inputFrom, inputTime: action.payload};
        default:
            return inputFrom;
    }
};
const fantuiReducer = (ftBaziInfo, action) => {
    switch (action.type) {
        case 'UPDATE_NIANGAN':
            return {...ftBaziInfo, nianGan: action.payload};
        case 'UPDATE_NIANZHI':
            return {...ftBaziInfo, nianZhi: action.payload};
        case 'UPDATE_YUEGAN':
            return {...ftBaziInfo, yueGan: action.payload};
        case 'UPDATE_YUEZHI':
            return {...ftBaziInfo, yueZhi: action.payload};
        case 'UPDATE_RIGAN':
            return {...ftBaziInfo, riGan: action.payload};
        case 'UPDATE_RIZHI':
            return {...ftBaziInfo, riZhi: action.payload};
        case 'UPDATE_SHIGAN':
            return {...ftBaziInfo, shiGan: action.payload};
        case 'UPDATE_SHIZHI':
            return {...ftBaziInfo, shiZhi: action.payload};
        default:
            return ftBaziInfo;
    }
};

// @ts-ignore ts-migrate(2700) FIXME: Rest types may only be created from object types.
export default function HomeScreen({navigation}) {
    const [zhouSelected, setZhouSelected] = useState('亚洲');
    // 八字相关
    const [Cp11_J, setCp11_J] = useState('120');
    const [Ml_result, setMl_result] = useState('');
    const [Cal5, setCal5] = useState('');
    const [bazi, setBazi] = useState({});
    const [fantuiModalVis, setFantuiModalVis] = useState(false);
    // 时间
    const [inputFrom, dispatch] = useReducer(reducer, {
        inputName: '',
        inputDate: '',
        inputPlace: '',
        inputTime: ''
    });
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    // 公历时间和农历时间
    const [solarDate, setSolarDate] = useState('');
    const [lunarDate, setLunarDate] = useState('');
    const [dateSelectVis, setDateSelectVis] = useState(false);
    const [timeSelectVis, setTimeSelectVis] = useState(false);
    const [gender, setGender] = useState('male');
    const [dateType, setDateType] = useState('gregorian');
    // 反推相关
    const [ftBaziInfo, setFtBaziInfo] = useReducer(fantuiReducer, {
        nianGan: '甲',
        nianZhi: '辰',
        yueGan: '丙',
        yueZhi: '寅',
        riGan: '辛',
        riZhi: '亥',
        shiGan: '甲',
        shiZhi: '午'
    });
    const [ftRes, setFtRes] = useState([]);
    const [contact, setContact] = useState('');

    const handleCalaFantui = () => {
        var l = Lunar1().Solar.fromBaZi(ftBaziInfo.nianGan + ftBaziInfo.nianZhi, ftBaziInfo.yueGan + ftBaziInfo.yueZhi, ftBaziInfo.riGan + ftBaziInfo.riZhi, ftBaziInfo.shiGan + ftBaziInfo.shiZhi);
        const ftres = [];
        for (var i = 0, j = l.length; i < j; i++) {
            let d = l[i];
            ftres.push(d.toFullString());
        }
        setFtRes(ftres);
    };

    const onSelectDate = () => {
        if (Platform.OS === 'android') {
            launchAndroidDate();
        } else {
            setDateSelectVis(true);
        }
    };
    const launchAndroidDate = () => {
        DateTimePickerAndroid.open({
            value: currentDate,
            onChange: onDateChange,
            display: 'spinner',
            mode: 'date'
        });
    };
    const launchAndroidTime = () => {
        DateTimePickerAndroid.open({
            value: currentDate,
            onChange: onTimeChange,
            display: 'spinner',
            mode: 'time'
        });
    };
    const onSelectTime = () => {
        if (Platform.OS === 'android') {
            launchAndroidTime();
        } else {
            setTimeSelectVis(true);
        }
    };
    const handleComfirmDate = (e, date) => {
        // form表单中的date和计算八字的date分别使用；
        if (dateType == 'lunar') {
            const [year, month, day] = moment(date ? date : currentDate)
                .format('YYYY-MM-DD')
                .split(/[-\s:]/);
            const grego = calendar.lunar2solar(year, month, day);
            dispatch({type: 'UPDATE_DATE', payload: grego.date});
            setLunarDate(`${year}-${month}-${day}`);
            setSolarDate(grego.date);
        } else {
            setSolarDate(moment(date ? date : currentDate).format('YYYY-MM-DD'));
            const [year, month, day] = moment(currentDate)
                .format('YYYY-MM-DD')
                .split(/[-\s:]/);
            const lunarDate = calendar.solar2lunar(year, month, day);
            setLunarDate(lunarDate.lunarDate);
        }
        dispatch({type: 'UPDATE_DATE', payload: moment(date ? date : currentDate).format('YYYY-MM-DD')});
        setDateSelectVis(false);
    };
    const handleComfirmTime = (time?) => {
        dispatch({type: 'UPDATE_TIME', payload: time ? time : moment(currentTime).format('HH:mm')});
        setTimeSelectVis(false);
    };
    const onDateChange = (e, date) => {
        setCurrentDate(date);
        console.log(date);
        if (Platform.OS === 'android') {
            // 选择了时间，更新状态并关闭弹窗
            handleComfirmDate(e, date);
            setDateSelectVis(false);
        }
    };
    const onTimeChange = (e, time) => {
        setCurrentTime(time);
        if (Platform.OS === 'android') {
            setTimeSelectVis(false);
            setTimeout(() => {
                dispatch({type: 'UPDATE_TIME', payload: moment(time).format('HH:mm')});
            }, 0);
        }
    };
    const selectMale = () => {
        setGender('male');
    };
    const selectFemale = () => {
        setGender('female');
    };
    const handleChangeDateType = type => {
        setDateType(type);
        if (type === 'fantui') {
            setFantuiModalVis(true);
        }
    };
    const linkToBazi = e => {
        const DATETIMETEM = extractDateAndTime(e);
        const [year, month, day] = DATETIMETEM.date.split('-');
        const date = new Date(year, month - 1, day); // month is zero-indexed
        setCurrentDate(date);
        setCurrentTime(DATETIMETEM.time);
        handleComfirmDate('', DATETIMETEM.date);
        handleComfirmTime(DATETIMETEM.time);
        setFantuiModalVis(false);
    };

    function extractDateAndTime(inputString) {
        // 匹配日期部分，格式为YYYY-MM-DD
        var datePattern = /\d{4}-\d{2}-\d{2}/;
        // 匹配时间部分，格式为HH:MM:SS
        var timePattern = /\d{2}:\d{2}:\d{2}/;

        // 使用正则表达式进行匹配
        var dateMatch = inputString.match(datePattern);
        var timeMatch = inputString.match(timePattern);

        // 提取日期和时间
        var date = dateMatch ? dateMatch[0] : null;
        var time = timeMatch ? timeMatch[0] : null;

        return {date: date, time: time};
    }
    var curJD; //现在日期
    var curTZ = -8; //当前时区

    /****************
    外地时间选择
    ****************/
    function change_dq() {
        //国家或地区改变
        // var i,
        //     v = Sel_dq.current.options[Sel_dq.current.selectedIndex].value;
        // v = v.split('#');
        // Sel_dq.current.v = v[0]; //地区时差
        // Sel_dq.current.rg = v[1]; //日光节约参数
        // Sel_sqsm.current.innerHTML = v[2]; //时区说明
    }

    /****************
    地理经纬度选择的页面控制函数
    ****************/
    function change2() {
        var i,
            v = new JWdecode(Sel2.options[Sel2.selectedIndex].value);
        Sel2.vJ = v.J;
        Sel2.vW = v.W;
        (Cb_J.value = ((v.J / Math.PI) * 180).toFixed(6)), (Cb_W.value = ((v.W / Math.PI) * 180).toFixed(6));
        Cf_J.value = Cd_J.value = Cp9_J.value = Cb_J.value;
        Cf_W.value = Cd_W.value = Cp9_W.value = Cb_W.value;
        Cp11_J = Cb_J.value;
        Cal_zdzb.innerHTML = '经 ' + rad2str2(v.J) + ' 纬 ' + rad2str2(v.W);
        // showMessD(-2);
        storageL.setItem('Sel1', Sel1.selectedIndex, 1000);
        storageL.setItem('Sel2', Sel2.selectedIndex, 1000);
    }
    function change() {
        Sel2.length = 0;
        var i,
            ob = JWv[Sel1.options[Sel1.selectedIndex].value - 0];
        for (i = 1; i < ob.length; i++) addOp(Sel2, ob[i].substr(0, 4), ob[i].substr(4, ob[i].length - 4));
        change2();
    }
    var i;
    // for (i = 0; i < JWv.length; i++) addOp(document.all.Sel1, i, JWv[i][0]);

    var seI1 = storageL.getItem('Sel1');
    var seI2 = storageL.getItem('Sel2');
    // Sel1.selectedIndex = seI1;
    // change();
    // Sel2.selectedIndex = seI2;
    // change2();

    /**********************
    命理八字计算
    **********************/
    async function ML_calc() {
        const lu = Lunar1().Lunar.fromDate(moment(solarDate + ' ' + inputFrom.inputTime, 'YYYY-M-D H').toDate());
        var d = lu.getEightChar();

        // ---------------------我是分割-----------------------
        // form表单中的date有时是阴历，有时是阳历；这里使用排盘专用的阳历
        const [Cml_y, Cml_m, Cml_d] = solarDate.split(/[-\s:]/);
        const [Cml_h, Cml_i, Cml_s = '00'] = inputFrom.inputTime.split(/[-\s:]/);
        const Cml_his = Cml_h + ':' + Cml_i + ':' + Cml_s;
        var ob = new Object();
        var t = timeStr2hour(Cml_his);
        var jd = JD.JD(year2Ayear(Cml_y), Cml_m - 0, Cml_d - 0 + t / 24);
        setBazi(ob);
        const res = '<font color=red>  <b>[日标]：</b></font>' + '公历 ' + Cml_y + '-' + Cml_m + '-' + Cml_d + ' 儒略日数 ' + int2(jd + 0.5) + ' 距2000年首' + int2(jd + 0.5 - J2000) + '日<br>' + '<font color=red  ><b>[八字]：</b></font>' + ob.bz_jn + '年 ' + ob.bz_jy + '月 ' + ob.bz_jr + '日 ' + ob.bz_js + '时 真太阳 <font color=red>' + ob.bz_zty + '</font><br>' + '<font color=green><b>[纪时]：</b></font><i>' + ob.bz_JS + '</i><br>' + '<font color=green><b>[时标]：</b></font><i>' + '23　 01　 03　 05　 07　 09　 11　 13　 15　 17　 19　 21　 23';
        setMl_result(res);
        navigation.navigate('八字盘', {navigationParams: {solarDate: solarDate + '  ' + Cml_his, lunarDate: lunarDate + '  ' + Cml_his, nickname: inputFrom.inputName, place: inputFrom.inputPlace, gender}});
    }

    // 此刻
    function ML_settime() {
        set_date_screen(1);
        // ML_calc();
    }

    /********************
    升降计算等
    *********************/

    function RTS1(jd, vJ, vW, tz) {
        SZJ.calcRTS(jd, 1, vJ, vW, tz); //升降计算,使用北时时间,tz=-8指东8区,jd+tz应在当地正午左右(误差数小时不要紧)
        var s,
            ob = SZJ.rts[0];
        // JD.setFromJD(jd+J2000);
        s = '日出 <font color=red>' + ob.s + '</font> 日落 ' + ob.j + ' 中天 ' + ob.z + '<br>';
        s += '月出 ' + ob.Ms + ' 月落 ' + ob.Mj + ' 月中 ' + ob.Mz + '<br>';
        s += '晨起天亮 ' + ob.c + ' 晚上天黑 ' + ob.h + '<br>';
        s += '日照时间 ' + ob.sj + ' 白天时间 ' + ob.ch + '<br>';
        return s;
    }

    const handlePaste = async () => {
        try {
            Clipboard.setString('ZGLQS0401');
            Alert.alert('复制成功，去微信添加');
        } catch (error) {
            // Alert.alert('Error', 'Failed to paste text.');
        }
    };

    return (
        <SafeAreaView style={styles.homeWrapper}>
            {/* <View style={styles.header}>
                <Text style={styles.headerText}>Custom Header</Text>
            </View> */}
            {/* <!--命理八字--> */}
            <View style={styles.contentWrapper}>
                <View style={styles.inputInfo}>
                    <View style={styles.selectButtons}>
                        <View style={styles.genderWrapper}>
                            <TouchableOpacity style={[gender === 'male' ? styles.activeButton : styles.unActiveButton, {borderTopLeftRadius: 5, borderBottomLeftRadius: 5}]} onPress={selectMale} activeOpacity={1}>
                                <Text style={gender === 'male' ? styles.activeGenderText : styles.unActiveGenderText}>{'男'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[gender === 'female' ? styles.activeButton : styles.unActiveButton, {borderTopRightRadius: 5, borderBottomRightRadius: 5}]} onPress={selectFemale} activeOpacity={1}>
                                <Text style={gender === 'female' ? styles.activeGenderText : styles.unActiveGenderText}>{'女'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.genderWrapper}>
                            <TouchableOpacity
                                style={[dateType === 'gregorian' ? styles.activeButton : styles.unActiveButton, {borderTopLeftRadius: 5, borderBottomLeftRadius: 5}]}
                                onPress={() => {
                                    setDateType('gregorian');
                                }}
                                activeOpacity={1}>
                                <Text style={dateType === 'gregorian' ? styles.activeGenderText : styles.unActiveGenderText}>{'公历'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[dateType === 'lunar' ? styles.activeButton : styles.unActiveButton, {borderRightWidth: 0, borderLeftWidth: 0}]} onPress={() => setDateType('lunar')} activeOpacity={1}>
                                <Text style={dateType === 'lunar' ? styles.activeGenderText : styles.unActiveGenderText}>{'农历'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[dateType === 'fantui' ? styles.activeButton : styles.unActiveButton, {borderTopRightRadius: 5, borderBottomRightRadius: 5}]} onPress={() => handleChangeDateType('fantui')} activeOpacity={1}>
                                <Text style={dateType === 'fantui' ? styles.activeGenderText : styles.unActiveGenderText}>{'反推'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableWithoutFeedback onPress={onSelectDate}>
                        {/* 点击这个 View 区域会触发 openModal 函数 */}
                        <View style={styles.inputContainer}>
                            <TextInput value={inputFrom.inputDate} editable={false} placeholder="日期" pointerEvents="none" style={styles.formItem} />
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={onSelectTime}>
                        {/* 点击这个 View 区域会触发 openModal 函数 */}
                        <View style={styles.inputContainer}>
                            <TextInput value={inputFrom.inputTime} editable={false} placeholder="时间" pointerEvents="none" style={styles.formItem} />
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={styles.inputContainer}>
                        <TextInput value={inputFrom.inputPlace} editable={false} placeholder="地点" pointerEvents="none" style={styles.formItem} />
                    </View>
                    {/* <View style={styles.inputContainer}> */}
                    <TextInput value={inputFrom.inputName} onChangeText={text => dispatch({type: 'UPDATE_NAME', payload: text})} placeholder="姓名" style={styles.formItem} />
                    {/* </View> */}
                </View>
                <TouchableOpacity style={styles.button} onPress={ML_calc}>
                    <Text style={styles.buttonText}>{'开始排盘'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contact}>
                    <Text onPress={handlePaste}>{"点击关注  '天机排盘'"}</Text>
                </TouchableOpacity>
                {/* 日期选择器 */}
                {Platform.OS === 'ios' ? (
                    <Modal
                        isVisible={dateSelectVis}
                        style={styles.modal}
                        onBackdropPress={() => {
                            setDateSelectVis(false);
                            setFtRes([]);
                        }}>
                        <View style={styles.modalBox}>
                            <DateTimePicker value={currentDate} onChange={onDateChange} display="spinner" mode="date" />
                            {Platform.OS === 'ios' && <Button title="确定" onPress={handleComfirmDate} />}
                        </View>
                    </Modal>
                ) : (
                    dateSelectVis && <View style={styles.modalBox}>{/* <DateTimePicker value={currentDate} onChange={onDateChange} display="spinner" mode="date" positiveButton={{label: '确定'}} negativeButton={{label: '取消', textColor: 'grey'}} /> */}</View>
                )}
                {/* 时间选择器 */}
                {Platform.OS === 'ios' ? (
                    <Modal isVisible={timeSelectVis} style={styles.modal} onBackdropPress={() => setTimeSelectVis(false)}>
                        <View style={styles.modalBox}>
                            <DateTimePicker value={currentTime} onChange={onTimeChange} display="spinner" mode="time" />
                            <Button title="确定" onPress={() => handleComfirmTime()} />
                        </View>
                    </Modal>
                ) : (
                    timeSelectVis && <View style={styles.modalBox}>{/* {<DateTimePicker value={currentTime} onChange={onTimeChange} display="spinner" mode="time" />} */}</View>
                )}
                <Modal isVisible={fantuiModalVis} style={styles.modal} onBackdropPress={() => setFantuiModalVis(false)}>
                    <View style={styles.modalBox}>
                        <View style={[styles.modalFtRes, styles.ml16]}>
                            <Text style={{fontWeight: 500, marginTop: 8}}>请选择：</Text>
                            {ftRes.map(e => {
                                return (
                                    <TouchableOpacity onPress={() => linkToBazi(e)} style={styles.ftResItem}>
                                        <Text style={{fontWeight: 500}}>{e}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.flexContainer}>
                            <View style={styles.containerColumn}>
                                <View>
                                    <Text style={[styles.middleFont, styles.mb16, styles.mt16]}>年柱</Text>
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={Gan}
                                        buttonStyle={{width: 60, height: 60, borderRadius: 30}}
                                        defaultButtonText={ftBaziInfo.nianGan}
                                        onSelect={(selectedItem, index) => {
                                            setFtBaziInfo({type: 'UPDATE_NIANGAN', payload: selectedItem});
                                        }}
                                    />
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={YangGan.indexOf(ftBaziInfo.nianGan) === -1 ? YinZhi : YangZhi}
                                        buttonStyle={{width: 60, height: 60, borderRadius: 30}}
                                        defaultButtonText={ftBaziInfo.nianZhi}
                                        onSelect={(selectedItem, index) => {
                                            setFtBaziInfo({type: 'UPDATE_NIANZHI', payload: selectedItem});
                                        }}
                                    />
                                </View>
                            </View>
                            <View style={styles.containerColumn}>
                                <View>
                                    <Text style={[styles.middleFont, styles.mb16, styles.mt16]}>月柱</Text>
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={Gan}
                                        buttonStyle={{width: 60, height: 60, borderRadius: 30}}
                                        defaultButtonText={ftBaziInfo.yueGan}
                                        onSelect={(selectedItem, index) => {
                                            setFtBaziInfo({type: 'UPDATE_YUEGAN', payload: selectedItem});
                                        }}
                                    />
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={YangGan.indexOf(ftBaziInfo.yueGan) === -1 ? YinZhi : YangZhi}
                                        buttonStyle={{width: 60, height: 60, borderRadius: 30}}
                                        defaultButtonText={ftBaziInfo.yueZhi}
                                        onSelect={(selectedItem, index) => {
                                            setFtBaziInfo({type: 'UPDATE_YUEZHI', payload: selectedItem});
                                        }}
                                    />
                                </View>
                            </View>
                            <View style={styles.containerColumn}>
                                <View>
                                    <Text style={[styles.middleFont, styles.mb16, styles.mt16]}>日柱</Text>
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={Gan}
                                        buttonStyle={{width: 60, height: 60, borderRadius: 30}}
                                        defaultButtonText={ftBaziInfo.riGan}
                                        onSelect={(selectedItem, index) => {
                                            setFtBaziInfo({type: 'UPDATE_RIGAN', payload: selectedItem});
                                        }}
                                    />
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={YangGan.indexOf(ftBaziInfo.riGan) === -1 ? YinZhi : YangZhi}
                                        buttonStyle={{width: 60, height: 60, borderRadius: 30}}
                                        defaultButtonText={ftBaziInfo.riZhi}
                                        onSelect={(selectedItem, index) => {
                                            setFtBaziInfo({type: 'UPDATE_RIZHI', payload: selectedItem});
                                        }}
                                    />
                                </View>
                            </View>
                            <View style={styles.containerColumn}>
                                <View>
                                    <Text style={[styles.middleFont, styles.mb16, styles.mt16]}>时柱</Text>
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={Gan}
                                        buttonStyle={{width: 60, height: 60, borderRadius: 30}}
                                        defaultButtonText={ftBaziInfo.shiGan}
                                        onSelect={(selectedItem, index) => {
                                            setFtBaziInfo({type: 'UPDATE_SHIGAN', payload: selectedItem});
                                        }}
                                    />
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={YangGan.indexOf(ftBaziInfo.shiGan) === -1 ? YinZhi : YangZhi}
                                        buttonStyle={{width: 60, height: 60, borderRadius: 30}}
                                        defaultButtonText={ftBaziInfo.shiZhi}
                                        onSelect={(selectedItem, index) => {
                                            setFtBaziInfo({type: 'UPDATE_SHIZHI', payload: selectedItem});
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                        <Button title="确定" onPress={handleCalaFantui} />
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}
