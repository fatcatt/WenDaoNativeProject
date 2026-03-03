import {ScrollView, View, Text, TextInput, Button, TouchableWithoutFeedback, TouchableOpacity, Alert, SafeAreaView, Platform} from 'react-native';
import React, {useEffect, useState, useReducer} from 'react';
import {JD, J2000, radd, int2, rad2str2} from '../../utils/eph0.js';
import {SZJ} from '../../utils/eph.js';
import {SQv, JWv} from '../../utils/JW.js';
import {addOp, year2Ayear, storageL, timeStr2hour} from '../../utils/tools.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import styles from './style.js';
import moment from 'moment';
import {Gan, YangGan, YangZhi, YinZhi} from '../../utils/constants/shensha';
import calendar from 'js-calendar-converter';
import {Lunar, Solar} from 'lunar-javascript';
import SelectDropdown from 'react-native-select-dropdown';
import Clipboard from '@react-native-clipboard/clipboard';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../../theme/colorsBazi';
import {useUserStore} from '../../store/index';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserData} from '../../api/index';

const reducer = (inputFrom, action) => {
    switch (action.type) {
        case 'UPDATE_NAME':
            return {...inputFrom, inputName: action.payload};
        case 'UPDATE_RELATIONSHIP':
            return {...inputFrom, relationship: action.payload};
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

/** 选择关系弹窗：分类与选项（含「自己」） */
const RELATIONSHIP_CATEGORIES = [
    { title: '亲密关系', color: '#c0392b', items: ['自己', '恋人', '伴侣', '暧昧对象'] },
    { title: '家人', color: '#e67e22', items: ['父母', '孩子', '家人', '亲友'] },
    { title: '社交', color: '#3498db', items: ['朋友', '同学', '前任', '特殊关系'] },
    { title: '合作', color: '#9b59b6', items: ['同事', '领导', '老师', '学生', '客户'] },
    { title: '其他', color: '#c0392b', items: ['名人', '案例', '其他'] },
];
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
export default function AddArchiveScreen({navigation, route}) {
    const {userInfo, setUserInfo: setUserInfoStore} = useUserStore();
    const [zhouSelected, setZhouSelected] = useState('亚洲');

    // 进入首页时若已登录但 store 无头像，从接口拉取并写入 store（与「我的」同源）
    useFocusEffect(
        React.useCallback(() => {
            if (userInfo?.headimg_url) return;
            AsyncStorage.getItem('unionid').then(unionid => {
                if (!unionid) return;
                getUserData({unionid}).then(res => setUserInfoStore(res)).catch(() => {});
            });
        }, [userInfo?.headimg_url, setUserInfoStore])
    );
    // 八字相关
    const [Cp11_J, setCp11_J] = useState('120');
    const [Ml_result, setMl_result] = useState('');
    const [Cal5, setCal5] = useState('');
    const [bazi, setBazi] = useState({});
    const [fantuiModalVis, setFantuiModalVis] = useState(false);
    // 时间
    const [inputFrom, dispatch] = useReducer(reducer, {
        inputName: '',
        relationship: '',
        inputDate: '',
        inputPlace: '',
        inputTime: ''
    });
    const [relationshipModalVis, setRelationshipModalVis] = useState(false);
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
    // 编辑模式：从八字盘「编辑」进入时带 recordId，开始排盘后传给八字盘用于更新而非新建
    const [editingRecordId, setEditingRecordId] = useState<string | number | null>(null);

    // 从八字盘点击「编辑」跳回首页时，用传入的 editParams 预填表单，并标记为编辑该记录
    useEffect(() => {
        const editParams = route?.params?.editParams;
        if (!editParams || !editParams.solarDate) {
            setEditingRecordId(null);
            return;
        }
        if (editParams.recordId != null && editParams.recordId !== '') {
            setEditingRecordId(editParams.recordId);
        } else {
            setEditingRecordId(null);
        }
        const parts = editParams.solarDate.trim().split(/\s+/);
        const dateStr = parts[0] || '';
        const timeStr = parts[1] || '00:00';
        const [y, m, d] = dateStr.split('-').map(Number);
        if (!y || !m || !d) return;
        const dateNormalized = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const timeNormalized = timeStr.length <= 5 ? timeStr : timeStr.slice(0, 5);
        const [hh, mm] = timeNormalized.split(':').map(Number);
        dispatch({type: 'UPDATE_DATE', payload: dateNormalized});
        dispatch({type: 'UPDATE_TIME', payload: timeNormalized});
        dispatch({type: 'UPDATE_NAME', payload: editParams.nickname || ''});
        dispatch({type: 'UPDATE_RELATIONSHIP', payload: editParams.relationship || ''});
        setSolarDate(dateNormalized);
        try {
            const lunar = calendar.solar2lunar(String(y), String(m), String(d));
            setLunarDate(lunar?.lunarDate || lunar || '');
        } catch (_) {}
        setCurrentDate(new Date(y, m - 1, d));
        setCurrentTime(new Date(0, 0, 0, hh || 0, mm || 0));
        setGender(editParams.gender === 'female' ? 'female' : 'male');
        setDateType('gregorian');
    }, [route?.params?.editParams]);

    // 从首页「生辰」进入且尚无「自己」档案时，预填关系为「自己」
    useEffect(() => {
        const initial = route?.params?.initialRelationship;
        if (initial) {
            dispatch({type: 'UPDATE_RELATIONSHIP', payload: initial});
        }
    }, [route?.params?.initialRelationship]);

    const handleCalaFantui = () => {
        var l = Solar.fromBaZi(ftBaziInfo.nianGan + ftBaziInfo.nianZhi, ftBaziInfo.yueGan + ftBaziInfo.yueZhi, ftBaziInfo.riGan + ftBaziInfo.riZhi, ftBaziInfo.shiGan + ftBaziInfo.shiZhi);
        const ftres = [];
        for (var i = 0, j = l.length; i < j; i++) {
            let d = l[i];
            ftres.push(d.toFullString());
        }
        setFtRes(ftres);
    };

    const onSelectDate = () => setDateSelectVis(true);
    const onSelectTime = () => setTimeSelectVis(true);
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
    const onDateChange = (_e, date) => {
        if (date != null) setCurrentDate(date);
    };
    const onTimeChange = (_e, time) => {
        if (time != null) setCurrentTime(time);
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

    /**********************
    命理八字计算
    **********************/
    async function ML_calc() {
        const lu = Lunar.fromDate(moment(solarDate + ' ' + inputFrom.inputTime, 'YYYY-M-D H').toDate());
        var d = lu.getEightChar();

        // ---------------------我是分割-----------------------
        const [Cml_y, Cml_m, Cml_d] = solarDate.split(/[-\s:]/);
        const [Cml_h, Cml_i, Cml_s = '00'] = inputFrom.inputTime.split(/[-\s:]/);
        const Cml_his = Cml_h + ':' + Cml_i + ':' + Cml_s;
        var ob = new Object();
        var t = timeStr2hour(Cml_his);
        var jd = JD.JD(year2Ayear(Cml_y), Cml_m - 0, Cml_d - 0 + t / 24);
        setBazi(ob);
        const res = '<font color=red>  <b>[日标]：</b></font>' + '公历 ' + Cml_y + '-' + Cml_m + '-' + Cml_d + ' 儒略日数 ' + int2(jd + 0.5) + ' 距2000年首' + int2(jd + 0.5 - J2000) + '日<br>' + '<font color=red  ><b>[八字]：</b></font>' + ob.bz_jn + '年 ' + ob.bz_jy + '月 ' + ob.bz_jr + '日 ' + ob.bz_js + '时 真太阳 <font color=red>' + ob.bz_zty + '</font><br>' + '<font color=green><b>[纪时]：</b></font><i>' + ob.bz_JS + '</i><br>' + '<font color=green><b>[时标]：</b></font><i>' + '23　 01　 03　 05　 07　 09　 11　 13　 15　 17　 19　 21　 23';
        setMl_result(res);
        const isEditFlow = editingRecordId != null && editingRecordId !== '';
        navigation.navigate('八字盘', {
            navigationParams: {
                solarDate: solarDate + '  ' + Cml_his,
                lunarDate: lunarDate + '  ' + Cml_his,
                nickname: inputFrom.inputName,
                place: inputFrom.inputPlace,
                gender,
                relationship: inputFrom.relationship || '',
                id: isEditFlow ? String(editingRecordId) : '',
                autoSaveAfterEdit: isEditFlow
            }
        });
    }

    function ML_settime() {
        set_date_screen(1);
    }

    const handlePaste = async () => {
        try {
            Clipboard.setString('ZGLQS0401');
            Alert.alert('复制成功，去微信添加');
        } catch (error) {
        }
    };

    return (
        <SafeAreaView style={styles.homeWrapper}>
            {/* 顶部栏：返回 | 八字记录入口 */}
            <View style={styles.headerBar}>
                <TouchableOpacity
                    style={styles.headerBackBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('记录');
                        }
                    }}
                >
                    <Icon name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.headerRecordsBtn}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('记录')}
                >
                    <FontAwesome5 name="list-alt" size={18} color="#5c4a3a" />
                </TouchableOpacity>
            </View>
            <View style={styles.contentWrapper}>
                <View style={styles.inputInfo}>
                    <View style={styles.selectButtons}>
                        <View style={styles.genderWrapper}>
                            <TouchableOpacity style={[gender === 'male' ? styles.activeButton : styles.unActiveButton, styles.segmentFirst]} onPress={selectMale} activeOpacity={0.8}>
                                <Text style={gender === 'male' ? styles.activeGenderText : styles.unActiveGenderText}>男</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[gender === 'female' ? styles.activeButton : styles.unActiveButton, styles.segmentLast]} onPress={selectFemale} activeOpacity={0.8}>
                                <Text style={gender === 'female' ? styles.activeGenderText : styles.unActiveGenderText}>女</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.genderWrapper}>
                            <TouchableOpacity style={[dateType === 'gregorian' ? styles.activeButton : styles.unActiveButton, styles.segmentFirst]} onPress={() => setDateType('gregorian')} activeOpacity={0.8}>
                                <Text style={dateType === 'gregorian' ? styles.activeGenderText : styles.unActiveGenderText}>公历</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[dateType === 'lunar' ? styles.activeButton : styles.unActiveButton]} onPress={() => setDateType('lunar')} activeOpacity={0.8}>
                                <Text style={dateType === 'lunar' ? styles.activeGenderText : styles.unActiveGenderText}>农历</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[dateType === 'fantui' ? styles.activeButton : styles.unActiveButton, styles.segmentLast]} onPress={() => handleChangeDateType('fantui')} activeOpacity={0.8}>
                                <Text style={dateType === 'fantui' ? styles.activeGenderText : styles.unActiveGenderText}>反推</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableWithoutFeedback onPress={onSelectDate}>
                        <View style={styles.inputContainer}>
                            <TextInput value={inputFrom.inputDate} editable={false} placeholder="选择日期" placeholderTextColor="#9c958a" pointerEvents="none" style={styles.formItem} />
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={onSelectTime}>
                        <View style={styles.inputContainer}>
                            <TextInput value={inputFrom.inputTime} editable={false} placeholder="选择时间" placeholderTextColor="#9c958a" pointerEvents="none" style={styles.formItem} />
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={styles.inputContainer}>
                        <TextInput value={inputFrom.inputName} onChangeText={text => dispatch({type: 'UPDATE_NAME', payload: text})} placeholder="姓名" placeholderTextColor="#9c958a" style={styles.formItem} />
                    </View>
                    <TouchableOpacity style={styles.inputContainer} onPress={() => setRelationshipModalVis(true)} activeOpacity={1}>
                        <View style={styles.formItemRow}>
                            <Text style={[styles.formItemValue, !inputFrom.relationship && styles.formItemPlaceholder]}>
                                {inputFrom.relationship || '请选择关系'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.inputContainer}>
                        <TextInput value={inputFrom.inputPlace} editable={false} placeholder="出生地点" placeholderTextColor="#9c958a" pointerEvents="none" style={styles.formItem} />
                    </View>
                </View>
                <TouchableOpacity style={styles.button} onPress={ML_calc}>
                    <Text style={styles.buttonText}>{'开始排盘'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contact} onPress={handlePaste} activeOpacity={0.7}>
                    <Text style={styles.contactText}>
                        点击关注 <Text style={styles.contactLink}>星垣水镜</Text>
                    </Text>
                </TouchableOpacity>
                {/* 日期选择器 */}
                <Modal
                    isVisible={dateSelectVis}
                    style={styles.modal}
                    onBackdropPress={() => {
                        setDateSelectVis(false);
                        setFtRes([]);
                    }}>
                    <View style={styles.modalPickerBox}>
                        <View style={styles.modalPickerWrapper}>
                            <DateTimePicker
                                value={currentDate}
                                onChange={onDateChange}
                                display="spinner"
                                mode="date"
                                locale="zh_CN"
                            />
                        </View>
                        <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => handleComfirmDate(null, currentDate)} activeOpacity={0.8}>
                            <Text style={styles.modalConfirmBtnText}>确定</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                {/* 选择关系弹窗 */}
                <Modal isVisible={relationshipModalVis} style={styles.modal} onBackdropPress={() => setRelationshipModalVis(false)}>
                    <View style={styles.modalRelationBox}>
                        <View style={styles.modalRelationHeader}>
                            <Text style={styles.modalRelationTitle}>请选择关系</Text>
                            <TouchableOpacity style={styles.modalRelationClose} onPress={() => setRelationshipModalVis(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                                <Icon name="close" size={22} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalRelationScroll} contentContainerStyle={styles.modalRelationScrollContent} showsVerticalScrollIndicator={false}>
                            {RELATIONSHIP_CATEGORIES.map((cat, idx) => (
                                <View key={idx} style={styles.relationCategory}>
                                    <View style={[styles.relationCategoryBar, { backgroundColor: cat.color }]} />
                                    <View style={styles.relationCategoryContent}>
                                        <Text style={styles.relationCategoryTitle}>{cat.title}</Text>
                                        <View style={styles.relationOptionsRow}>
                                            {cat.items.map((item) => {
                                                const selected = inputFrom.relationship === item;
                                                return (
                                                    <TouchableOpacity
                                                        key={item}
                                                        style={[styles.relationOptionBtn, selected && styles.relationOptionBtnActive]}
                                                        onPress={() => dispatch({ type: 'UPDATE_RELATIONSHIP', payload: item })}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Text style={[styles.relationOptionText, selected && styles.relationOptionTextActive]}>{item}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalRelationConfirm} onPress={() => setRelationshipModalVis(false)} activeOpacity={0.8}>
                            <Text style={styles.modalRelationConfirmText}>确认</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                {/* 时间选择器 */}
                <Modal isVisible={timeSelectVis} style={styles.modal} onBackdropPress={() => setTimeSelectVis(false)}>
                    <View style={styles.modalPickerBox}>
                        <View style={styles.modalPickerWrapper}>
                            <DateTimePicker
                                value={currentTime}
                                onChange={onTimeChange}
                                display="spinner"
                                mode="time"
                                locale="zh_CN"
                            />
                        </View>
                        <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => handleComfirmTime()} activeOpacity={0.8}>
                            <Text style={styles.modalConfirmBtnText}>确定</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                <Modal isVisible={fantuiModalVis} style={styles.modal} onBackdropPress={() => setFantuiModalVis(false)}>
                    <View style={styles.modalBox}>
                        <ScrollView
                            style={styles.modalFantuiScroll}
                            contentContainerStyle={styles.modalFantuiScrollContent}
                            showsVerticalScrollIndicator={true}
                        >
                        <View style={[styles.modalFtRes, styles.ml16]}>
                            <Text style={{fontWeight: 500, marginTop: 8}}>请选择：</Text>
                            {ftRes.map((e, index) => (
                                <TouchableOpacity key={`ftres-${index}`} onPress={() => linkToBazi(e)} style={styles.ftResItem}>
                                    <Text style={{fontWeight: 500}}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={[styles.middleFont, styles.mt16, styles.ml16]}>选择八字四柱：</Text>
                        <View style={styles.flexContainer}>
                            <View style={styles.containerColumn}>
                                <View>
                                    <Text style={[styles.middleFont, styles.mb16, styles.mt16]}>年柱</Text>
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={Gan}
                                        dropdownStyle={styles.gzDropdownList}
                                        disableAutoScroll
                                        defaultValue={ftBaziInfo.nianGan}
                                        onSelect={(selectedItem) => setFtBaziInfo({type: 'UPDATE_NIANGAN', payload: selectedItem})}
                                        renderButton={(selectedItem) => (
                                            <View style={styles.gzSelectBox}>
                                                <Text style={styles.bigFont}>{selectedItem != null ? selectedItem : ftBaziInfo.nianGan}</Text>
                                            </View>
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.gzDropdownItem}><Text style={styles.middleFont}>{item}</Text></View>
                                        )}
                                    />
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={YangGan.indexOf(ftBaziInfo.nianGan) === -1 ? YinZhi : YangZhi}
                                        dropdownStyle={styles.gzDropdownList}
                                        disableAutoScroll
                                        defaultValue={ftBaziInfo.nianZhi}
                                        onSelect={(selectedItem) => setFtBaziInfo({type: 'UPDATE_NIANZHI', payload: selectedItem})}
                                        renderButton={(selectedItem) => (
                                            <View style={styles.gzSelectBox}>
                                                <Text style={styles.bigFont}>{selectedItem != null ? selectedItem : ftBaziInfo.nianZhi}</Text>
                                            </View>
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.gzDropdownItem}><Text style={styles.middleFont}>{item}</Text></View>
                                        )}
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
                                        dropdownStyle={styles.gzDropdownList}
                                        disableAutoScroll
                                        defaultValue={ftBaziInfo.yueGan}
                                        onSelect={(selectedItem) => setFtBaziInfo({type: 'UPDATE_YUEGAN', payload: selectedItem})}
                                        renderButton={(selectedItem) => (
                                            <View style={styles.gzSelectBox}>
                                                <Text style={styles.bigFont}>{selectedItem != null ? selectedItem : ftBaziInfo.yueGan}</Text>
                                            </View>
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.gzDropdownItem}><Text style={styles.middleFont}>{item}</Text></View>
                                        )}
                                    />
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={YangGan.indexOf(ftBaziInfo.yueGan) === -1 ? YinZhi : YangZhi}
                                        dropdownStyle={styles.gzDropdownList}
                                        disableAutoScroll
                                        defaultValue={ftBaziInfo.yueZhi}
                                        onSelect={(selectedItem) => setFtBaziInfo({type: 'UPDATE_YUEZHI', payload: selectedItem})}
                                        renderButton={(selectedItem) => (
                                            <View style={styles.gzSelectBox}>
                                                <Text style={styles.bigFont}>{selectedItem != null ? selectedItem : ftBaziInfo.yueZhi}</Text>
                                            </View>
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.gzDropdownItem}><Text style={styles.middleFont}>{item}</Text></View>
                                        )}
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
                                        dropdownStyle={styles.gzDropdownList}
                                        disableAutoScroll
                                        defaultValue={ftBaziInfo.riGan}
                                        onSelect={(selectedItem) => setFtBaziInfo({type: 'UPDATE_RIGAN', payload: selectedItem})}
                                        renderButton={(selectedItem) => (
                                            <View style={styles.gzSelectBox}>
                                                <Text style={styles.bigFont}>{selectedItem != null ? selectedItem : ftBaziInfo.riGan}</Text>
                                            </View>
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.gzDropdownItem}><Text style={styles.middleFont}>{item}</Text></View>
                                        )}
                                    />
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={YangGan.indexOf(ftBaziInfo.riGan) === -1 ? YinZhi : YangZhi}
                                        dropdownStyle={styles.gzDropdownList}
                                        disableAutoScroll
                                        defaultValue={ftBaziInfo.riZhi}
                                        onSelect={(selectedItem) => setFtBaziInfo({type: 'UPDATE_RIZHI', payload: selectedItem})}
                                        renderButton={(selectedItem) => (
                                            <View style={styles.gzSelectBox}>
                                                <Text style={styles.bigFont}>{selectedItem != null ? selectedItem : ftBaziInfo.riZhi}</Text>
                                            </View>
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.gzDropdownItem}><Text style={styles.middleFont}>{item}</Text></View>
                                        )}
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
                                        dropdownStyle={styles.gzDropdownList}
                                        disableAutoScroll
                                        defaultValue={ftBaziInfo.shiGan}
                                        onSelect={(selectedItem) => setFtBaziInfo({type: 'UPDATE_SHIGAN', payload: selectedItem})}
                                        renderButton={(selectedItem) => (
                                            <View style={styles.gzSelectBox}>
                                                <Text style={styles.bigFont}>{selectedItem != null ? selectedItem : ftBaziInfo.shiGan}</Text>
                                            </View>
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.gzDropdownItem}><Text style={styles.middleFont}>{item}</Text></View>
                                        )}
                                    />
                                </View>
                                <View style={styles.mb16}>
                                    <SelectDropdown
                                        data={YangGan.indexOf(ftBaziInfo.shiGan) === -1 ? YinZhi : YangZhi}
                                        dropdownStyle={styles.gzDropdownList}
                                        disableAutoScroll
                                        defaultValue={ftBaziInfo.shiZhi}
                                        onSelect={(selectedItem) => setFtBaziInfo({type: 'UPDATE_SHIZHI', payload: selectedItem})}
                                        renderButton={(selectedItem) => (
                                            <View style={styles.gzSelectBox}>
                                                <Text style={styles.bigFont}>{selectedItem != null ? selectedItem : ftBaziInfo.shiZhi}</Text>
                                            </View>
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.gzDropdownItem}><Text style={styles.middleFont}>{item}</Text></View>
                                        )}
                                    />
                                </View>
                            </View>
                        </View>
                        <Button title="确定" onPress={handleCalaFantui} />
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}
