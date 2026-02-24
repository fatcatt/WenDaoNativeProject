import React, {useEffect, useState, useRef} from 'react';
import {View, Text, SafeAreaView, ScrollView, TouchableWithoutFeedback, Animated, TouchableOpacity, ActivityIndicator, Modal, TouchableHighlight, Alert, TextInput} from 'react-native';
import moment from 'moment';
import {obb} from '../../utils/lunar.js';
import {JD, J2000, radd, int2} from '../../utils/eph0.js';
import {year2Ayear, timeStr2hour} from '../../utils/tools.js';
import {getShenSha} from '../../utils/calcBazi';
import calendar from 'js-calendar-converter';
import {Lunar, LunarUtil} from 'lunar-javascript';
import {setBaziRecord} from '../../api/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GanZhiMap, simShishen} from '../../utils/constants/shensha';
import styles from './style.js';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {geju} from '../../utils/constants/geju.js';
import {yongshen} from '../../utils/constants/yongshen.js';

// 地支藏干（本气），用于大运支十神，兼容 lunar-javascript 的 ZHI_HIDE_GAN 键为占位符的情况
const ZHI_HIDE_GAN_CN: Record<string, string[]> = {
    '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'], '卯': ['乙'],
    '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'], '午': ['丁', '己'], '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'], '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

function BaziPanScreen({route}) {
    const navigation = useNavigation();
    const curTZ = -8; //当前时区
    const {solarDate, gender, nickname, id = ''} = route.params.navigationParams;
    const [Cp11_J, setCp11_J] = useState('120');
    const [ob, setBazi] = useState({});
    const [BZ_result, setBZ_result] = useState({});
    // 使用 Animated.Value 来管理背景透明度
    const [animatedValues, setAnimatedValues] = useState([]);
    // 从记录点开时带 id，说明该盘已在收藏表中，初始为已收藏
    const [isSaved, setIsSaved] = useState(!!id);
    const [notice, setNotice] = useState(false);
    const [remark, setRemark] = useState('');
    const [gejuModalVisible, setGejuModalVisible] = useState(false);
    const [lunardata, setlunardate] = useState();
    const [shenShaToast, setshenShaToast] = useState({});
    const [shenShaModalVisible, setShenShaModalVisible] = useState(false);
    const [yongshenModal, setYongshenModal] = useState(false);
    const [activeTab, setActiveTab] = useState(1); // 0基本信息 1基本排盘 2专业细盘 3断事笔记

    const handlePressIn = index => {
        // 点击时渐渐显示
        Animated.timing(animatedValues[index], {
            toValue: 1, // 最终透明度
            duration: 300, // 动画持续时间
            useNativeDriver: false // 使用 JS 驱动动画，因为我们改变的是背景色
        }).start();
    };

    const handlePressOut = index => {
        // 松开时渐渐消失
        Animated.timing(animatedValues[index], {
            toValue: 0, // 回到透明
            duration: 300, // 动画持续时间
            useNativeDriver: false
        }).start();
    };

    useEffect(() => {
        if (BZ_result?.dayun) {
            // 当 BZ_result.dayun 有效时，为每个列初始化一个 Animated.Value
            const newAnimatedValues = BZ_result.dayun.map(() => new Animated.Value(0));
            setAnimatedValues(newAnimatedValues);
        }
    }, [BZ_result]);

    useEffect(() => {
        ML_calc();
    }, [route.params.navigationParams]);

    function ML_calc() {
        // const lunarDate = res?.lunarDate;
        // 阳历转阴历

        const timeRegex = /\d{1,2}:\d{2}(:\d{2})?/;
        const datetime = solarDate.match(timeRegex) ? solarDate.match(timeRegex)[0] : '';

        const [year, month, day] = solarDate.split(/[-\s:]/);
        const lunarDate = calendar.solar2lunar(year, month, day).lunarDate + ' ' + datetime;
        setlunardate(lunarDate);
        const lu = Lunar.fromDate(moment(solarDate, 'YYYY-M-D H').toDate());
        var d = lu.getEightChar();
        // form表单中的date有时是阴历，有时是阳历；这里使用排盘专用的阳历.以下是排八字
        const [Cml_y, Cml_m, Cml_d] = solarDate.split(/[-\s:]/);
        var ob = new Object();
        var t = timeStr2hour(datetime);
        var jd = JD.JD(year2Ayear(Cml_y), Cml_m - 0, Cml_d - 0 + t / 24);
        obb.mingLiBaZi(jd + curTZ / 24 - J2000, Cp11_J / radd, ob); //八字计算
        // getLunar(Cml_y, Cml_m);
        // 运
        var dayun = [];
        var yun = d.getYun(gender === 'male' ? 1 : 0);
        const getDaYun = yun.getDaYun() || [];
        const dayunLen = Math.min(getDaYun.length, 11);
        for (let i = 0; i < dayunLen; i++) {
            const dy = getDaYun[i];
            if (!dy) continue;
            const ganZhi = dy.getGanZhi && dy.getGanZhi();
            const zhiChar = ganZhi ? ganZhi.slice(1, 2) : '';
            const hideGanRaw = (zhiChar && LunarUtil.ZHI_HIDE_GAN && LunarUtil.ZHI_HIDE_GAN[zhiChar]);
            const hideGan = Array.isArray(hideGanRaw) ? hideGanRaw : (ZHI_HIDE_GAN_CN[zhiChar] || []);
            const hideGan0 = hideGan[0] || '';
            dayun.push({
                qiyun: '出生' + yun.getStartYear() + '年' + yun.getStartMonth() + '个月' + yun.getStartDay() + '天后起运',
                ganzhi: ganZhi || '',
                startYear: dy.getStartYear ? dy.getStartYear() : 0,
                endYear: dy.getEndYear ? dy.getEndYear() : 0,
                startAge: dy.getStartAge ? dy.getStartAge() : 0,
                endAge: dy.getEndAge ? dy.getEndAge() : 0,
                liuNian: dy.getLiuNian ? dy.getLiuNian() : [],
                xiaoYun: dy.getXiaoYun ? dy.getXiaoYun() : [],
                ganShishen: (ganZhi && ob?.bz_jr && LunarUtil.SHI_SHEN) ? (LunarUtil.SHI_SHEN[ob.bz_jr.slice(0, 1) + ganZhi.slice(0, 1)] || '') : '',
                zhiShishen: (ganZhi && ob?.bz_jr && hideGan0 && LunarUtil.SHI_SHEN) ? (LunarUtil.SHI_SHEN[ob.bz_jr.slice(0, 1) + hideGan0] || '') : ''
            });
        }
        // 藏干
        let canggan = {
            year: {wuxing: d.getYearHideGan(), shishen: d.getYearShiShenZhi()},
            month: {wuxing: d.getMonthHideGan(), shishen: d.getMonthShiShenZhi()},
            day: {wuxing: d.getDayHideGan(), shishen: d.getDayShiShenZhi()},
            time: {wuxing: d.getTimeHideGan(), shishen: d.getTimeShiShenZhi()}
        };
        // 十神
        let shishen = {
            year: d.getYearShiShenGan(),
            month: d.getMonthShiShenGan(),
            day: d.getDayShiShenGan(),
            time: d.getTimeShiShenGan()
        };
        // 纳音
        let nayin = {
            year: d.getYearNaYin(),
            month: d.getMonthNaYin(),
            day: d.getDayNaYin(),
            time: d.getTimeNaYin()
        };
        // 十二长生
        let zhangsheng = {
            year: d.getYearDiShi(),
            month: d.getMonthDiShi(),
            day: d.getDayDiShi(),
            time: d.getTimeDiShi()
        };
        // 胎元 命宫 身宫
        let taiyuan = d.getTaiYuan();
        let minggong = d.getMingGong();
        let shengong = d.getShenGong();
        // 节气
        let jieqi = '';
        const [lunarCml_y, lunarCml_m, lunarCml_d] = lunarDate.split(/[-\s:]/);
        const lunarDayObj = Lunar.fromYmd(lunarCml_y, lunarCml_m, lunarCml_d);
        const currentJq = lunarDayObj && lunarDayObj.getCurrentJieQi && lunarDayObj.getCurrentJieQi();
        if (currentJq) {
            const name = (currentJq.getName && currentJq.getName()) || (currentJq._p && currentJq._p.name) || '';
            jieqi = '出生于' + name + '0天';
        } else {
            const prev = lunarDayObj && lunarDayObj.getPrevJieQi && lunarDayObj.getPrevJieQi(false);
            if (prev) {
                const solar = prev.getSolar && prev.getSolar();
                const prevName = (prev.getName && prev.getName()) || (prev._p && prev._p.name) || '';
                const prevYmd = solar && solar.toYmdHms ? solar.toYmdHms() : solarDate;
                const diff = moment(solarDate, 'YYYY-M-D H').diff(moment(prevYmd), 'days');
                jieqi = '出生于' + prevName + '后' + diff + '天';
            }
        }
        // ---------------------我是分割-----------------------

        setBazi(ob);
        const shensha = getShenSha(ob, gender);
        setBZ_result({ob, dayun, solarDate: solarDate, lunarDate: lunarDate, jieqi, canggan, shishen, nayin, gender, taiyuan, minggong, shengong, shensha, zhangsheng});
        // const dayun = getDaYun(gender, ob.bz_jy, ob.bz_jr);
        // getNianLi(Cml_y);
        // const userid = await AsyncStorage.getItem('userid');
        // setBaziRecord({userid, nickname, gender: gender, solar_datetime: solarDate, bazi_summary: JSON.stringify(ob), place: ''}).then(res => {});
    }

    const toggleSwitch = async () => {
        const userid = await AsyncStorage.getItem('userid');
        if (!isSaved && userid) {
            setBaziRecord({userid, nickname, gender: gender, solar_datetime: solarDate, bazi_summary: JSON.stringify(ob), place: '', remark}).then(res => {
                setNotice(true);
                setTimeout(() => setNotice(false), 800);
            });
            setIsSaved(!isSaved);
        } else if (!userid) {
            Alert.alert('没有用户信息');
        }
    };

    const onChangeText = value => {
        setRemark(value);
    };

    const handleGejuModal = () => {
        setGejuModalVisible(true);
    };

    const handleYongshenModal = () => {
        setYongshenModal(true);
    };

    const toggleJishen = e => {
        setshenShaToast(e);
        setShenShaModalVisible(true);
    };
    const TAB_LABELS = ['基本信息', '基本排盘', '专业细盘', '断事笔记'];

    return (
        <View style={styles.paipanWrapper}>
            <SafeAreaView style={styles.safeAreaTop} />
            {/* 导航栏：与上方分割，白底 */}
            <View style={styles.navBar}>
                <View style={styles.navSide}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="chevron-back-outline" size={24} color="#1a1612" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerTitleWrap}>
                    <Text style={styles.headerTitle}>星垣水镜 八字盘</Text>
                </View>
                <View style={styles.navSideRight}>
                    {isSaved ? (
                        <TouchableOpacity onPress={toggleSwitch}>
                            <Icon name="bookmark" size={22} color="#8b4513" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={toggleSwitch}>
                            <Icon name="bookmark-outline" size={22} color="#1a1612" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {/* Tab 栏：与盘面分割 */}
            <View style={styles.tabBar}>
                {TAB_LABELS.map((label, index) => (
                    <TouchableOpacity
                        key={label}
                        style={[styles.tabItem, activeTab === index && styles.tabItemActive]}
                        onPress={() => setActiveTab(index)}
                        activeOpacity={0.7}>
                        <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {notice && (
                <View style={styles.notice}>
                    <Text style={styles.noticeText}>保 存 成 功!</Text>
                </View>
            )}
            <ScrollView style={{flex: 1}} contentContainerStyle={{paddingBottom: 24}}>
                <View style={styles.paipanContainer}>
                    {activeTab === 0 && <View />}
                    {activeTab === 1 && (
                        <>
                    <Text style={styles.miniFont}>{'姓名：' + nickname}</Text>
                    <Text style={styles.miniFont}>{'出生时间（阳历）：' + solarDate}</Text>
                    <Text style={styles.miniFont}>{'出生时间（阴历）：' + lunardata}</Text>
                    <Text style={[styles.marginSeparate, styles.miniFont]}>{BZ_result.jieqi}</Text>
                    <View style={[styles.container, styles.marginSeparate]}>
                        <View style={styles.column}>
                            <Text style={[styles.genderTitle]}>{BZ_result?.gender === 'male' ? '乾造：' : '坤造：'}</Text>
                            <TouchableOpacity
                                onPress={handleGejuModal} // Handle back navigation
                            >
                                <Text style={styles.gejuText}>[格局]</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleYongshenModal}>
                                <Text style={styles.gejuText}>[用神]</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.miniFont}>{BZ_result?.nayin?.year}</Text>
                            <Text>{BZ_result?.shishen?.year}</Text>
                            <Text style={[styles.bigFont, styles['color' + GanZhiMap[ob?.bz_jn?.slice(0, 1)]]]}>{BZ_result.ob?.bz_jn?.slice(0, 1)}</Text>
                            <Text style={[styles.bigFont, styles['color' + GanZhiMap[ob?.bz_jn?.slice(1, 2)]]]}>{BZ_result.ob?.bz_jn?.slice(1, 2)}</Text>
                            {BZ_result?.canggan?.year?.wuxing.map((e, i) => {
                                return (
                                    <View style={[styles.inline, styles.canggan]}>
                                        <Text style={[styles.miniFont, styles['color' + GanZhiMap[e]]]}>{e + ' '}</Text>
                                        <Text style={styles.miniFont}>{BZ_result?.canggan?.year?.shishen[i]}</Text>
                                    </View>
                                );
                            })}
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.miniFont}>{BZ_result?.nayin?.month}</Text>
                            <Text>{BZ_result?.shishen?.month}</Text>
                            <Text style={[styles.bigFont, styles['color' + GanZhiMap[ob?.bz_jy?.slice(0, 1)]]]}>{ob?.bz_jy?.slice(0, 1)}</Text>
                            <Text style={[styles.bigFont, styles['color' + GanZhiMap[ob?.bz_jy?.slice(1, 2)]]]}>{ob?.bz_jy?.slice(1, 2)}</Text>
                            {BZ_result?.canggan?.month?.wuxing?.map((e, i) => {
                                return (
                                    <View style={[styles.inline, styles.canggan]}>
                                        <Text style={[styles.miniFont, styles['color' + GanZhiMap[e]]]}>{e + ' '}</Text>
                                        <Text style={styles.miniFont}>{BZ_result?.canggan?.month?.shishen[i]}</Text>
                                    </View>
                                );
                            })}
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.miniFont}>{BZ_result?.nayin?.day}</Text>
                            <Text>{BZ_result?.shishen?.day}</Text>
                            <Text style={[styles.bigFont, styles['color' + GanZhiMap[ob?.bz_jr?.slice(0, 1)]]]}>{ob?.bz_jr?.slice(0, 1)}</Text>
                            <Text style={[styles.bigFont, styles['color' + GanZhiMap[ob?.bz_jr?.slice(1, 2)]]]}>{ob?.bz_jr?.slice(1, 2)}</Text>
                            {BZ_result?.canggan &&
                                BZ_result?.canggan.day.wuxing.map((e, i) => {
                                    return (
                                        <View style={[styles.inline, styles.canggan]}>
                                            <Text style={[styles.miniFont, styles['color' + GanZhiMap[e]]]}>{e + ' '}</Text>
                                            <Text style={styles.miniFont}>{BZ_result?.canggan?.day.shishen[i]}</Text>
                                        </View>
                                    );
                                })}
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.miniFont}>{BZ_result?.nayin?.time}</Text>
                            <Text>{BZ_result?.shishen?.time}</Text>
                            <Text style={[styles.bigFont, styles['color' + GanZhiMap[ob?.bz_js?.slice(0, 1)]]]}>{ob?.bz_js?.slice(0, 1)}</Text>
                            <Text style={[styles.bigFont, styles['color' + GanZhiMap[ob?.bz_js?.slice(1, 2)]]]}>{ob?.bz_js?.slice(1, 2)}</Text>
                            {BZ_result?.canggan &&
                                BZ_result?.canggan.time.wuxing.map((e, i) => {
                                    return (
                                        <View style={[styles.inline, styles.canggan]}>
                                            <Text style={[styles.miniFont, styles['color' + GanZhiMap[e]]]}>{e + ' '}</Text>
                                            <Text style={styles.miniFont}>{BZ_result?.canggan?.time.shishen[i]}</Text>
                                        </View>
                                    );
                                })}
                        </View>
                    </View>
                    <View style={styles.container}>
                        <Text style={[styles.column, styles.boldFont]}>{'长生:'}</Text>
                        <View style={styles.column}>
                            <Text>{BZ_result?.zhangsheng?.year}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text>{BZ_result?.zhangsheng?.month}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text>{BZ_result?.zhangsheng?.day}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text>{BZ_result?.zhangsheng?.time}</Text>
                        </View>
                    </View>
                    <View style={styles.container}>
                        <Text style={[styles.column, styles.boldFont]}>{'神煞：'}</Text>
                        <View style={styles.column}>
                            {BZ_result?.shensha?.year?.jishen?.map(e => {
                                return (
                                    <TouchableOpacity onPress={() => toggleJishen({...e, position: 'nian'})}>
                                        <Text style={styles.shenshaText}>{e.shenName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                            {BZ_result?.shensha?.year?.xiongsha?.map(e => {
                                return (
                                    <TouchableOpacity onPress={() => toggleJishen({...e, position: 'nian'})}>
                                        <Text style={styles.shenshaText}>{e.shenName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.column}>
                            {BZ_result?.shensha?.month?.jishen?.map(e => {
                                return (
                                    <TouchableOpacity onPress={() => toggleJishen({...e, position: 'yue'})}>
                                        <Text style={styles.shenshaText}>{e.shenName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                            {BZ_result?.shensha?.month?.xiongsha?.map(e => {
                                return (
                                    <TouchableOpacity onPress={() => toggleJishen({...e, position: 'nian'})}>
                                        <Text style={styles.shenshaText}>{e.shenName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.column}>
                            {BZ_result?.shensha?.day?.jishen?.map(e => {
                                return (
                                    <TouchableOpacity onPress={() => toggleJishen({...e, position: 'ri'})}>
                                        <Text style={styles.shenshaText}>{e.shenName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                            {BZ_result?.shensha?.day?.xiongsha?.map(e => {
                                return (
                                    <TouchableOpacity onPress={() => toggleJishen({...e, position: 'nian'})}>
                                        <Text style={styles.shenshaText}>{e.shenName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.column}>
                            {BZ_result?.shensha?.time?.jishen?.map(e => {
                                return (
                                    <TouchableOpacity onPress={() => toggleJishen({...e, position: 'shi'})}>
                                        <Text style={styles.shenshaText}>{e.shenName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                            {BZ_result?.shensha?.time?.xiongsha?.map(e => {
                                return (
                                    <TouchableOpacity onPress={() => toggleJishen({...e, position: 'nian'})}>
                                        <Text style={styles.shenshaText}>{e.shenName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    <View style={[styles.container]}>
                        <Text style={[styles.miniFont, styles.column]}>{'胎元：' + BZ_result?.taiyuan}</Text>
                        <Text style={[styles.miniFont, styles.column]}>{'命宫：' + BZ_result?.minggong}</Text>
                        <Text style={[styles.miniFont, styles.column]}>{'身宫：' + BZ_result?.shengong}</Text>
                    </View>
                    <View>{BZ_result?.dayun && <Text style={styles.miniFont}>{'起运时间：' + BZ_result?.dayun[0]?.qiyun}</Text>}</View>
                    {/* <Text style={styles.miniFont}>{'大运：'}</Text> */}
                    <ScrollView horizontal={true} style={styles.container}>
                        {BZ_result?.dayun &&
                            BZ_result?.dayun.map((e, index) => {
                                const backgroundColor = animatedValues[index]?.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['rgba(247, 232, 170, 0)', 'rgba(247, 232, 170, 0.6)']
                                });
                                return (
                                    <View style={styles.column}>
                                        <TouchableWithoutFeedback key={index} onPressIn={() => handlePressIn(index)} onPressOut={() => handlePressOut(index)}>
                                            <Animated.View style={[styles.touchable, {backgroundColor}]}>
                                                <View>
                                                    {e.ganzhi ? (
                                                        <View style={{alignItems: 'center'}}>
                                                            <View style={styles.inline}>
                                                                <Text style={styles.yunFont}>{e.ganzhi.slice(0, 1)}</Text>
                                                                <Text style={styles.yunFont}>{e.ganzhi.slice(1, 2)}</Text>
                                                            </View>
                                                            <Text style={styles.startWithText}>{e.ganShishen ? ((simShishen[e.ganShishen] || '') + (simShishen[e.zhiShishen] || '')) : '小运'}</Text>
                                                        </View>
                                                    ) : (
                                                        <View>
                                                            <Text style={styles.yunFont}>小运</Text>
                                                            <Text></Text>
                                                        </View>
                                                    )}
                                                    <View style={styles.startWithBox}>
                                                        <Text style={styles.startWithText}>{e.startYear}</Text>
                                                        <Text style={styles.startWithText}>{e.startAge}岁</Text>
                                                    </View>
                                                    <View>
                                                        {e.liuNian.map((nian, nianIndex) => (
                                                            <View key={nianIndex} style={styles.nianIndex}>
                                                                <Text style={styles.liunianText}>{nian.getGanZhi()}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            </Animated.View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                );
                            })}
                    </ScrollView>
                        </>
                    )}
                    {activeTab === 0 && <View />}
                    {activeTab === 2 && <View />}
                    {activeTab === 3 && <View />}
                </View>
            </ScrollView>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={gejuModalVisible}
                    onRequestClose={() => {
                        setGejuModalVisible(!gejuModalVisible);
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.modalTitleWrapper}>
                                <Text style={styles.gejuModalTitle}>格局</Text>
                            </View>
                            {(geju[ob?.bz_jr?.slice(0, 1) + ob?.bz_jy?.slice(1, 2)]?.ge || '').split(' ').map(item => {
                                return (
                                    <View style={styles.gejuWrapper}>
                                        <Text style={styles.gejuText}>本命：{item}</Text>
                                    </View>
                                );
                            })}
                            <Text style={styles.mingyu}>格局：{geju[ob?.bz_jr?.slice(0, 1) + ob?.bz_jy?.slice(1, 2)]?.mingyu || ''}</Text>
                            <TouchableOpacity
                                style={{...styles.openButton, backgroundColor: '#42748a'}}
                                onPress={() => {
                                    setGejuModalVisible(!gejuModalVisible);
                                }}>
                                <Text style={styles.textStyle}>关闭</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={shenShaModalVisible}
                    onRequestClose={() => {
                        setShenShaModalVisible(!shenShaModalVisible);
                    }}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <ScrollView contentContainerStyle={styles.scrollContainer}>
                                <View style={styles.modalTitleWrapper}>
                                    <Text style={styles.gejuModalTitle}>神煞</Text>
                                </View>
                                <View style={styles.gejuWrapper}>
                                    <Text style={styles.gejuText}>
                                        {shenShaToast?.shenName}：{shenShaToast?.shenInterpretation?.sum}
                                    </Text>
                                </View>
                                {shenShaToast?.shenInterpretation?.[shenShaToast.position] && (
                                    <View style={styles.gejuWrapper}>
                                        <Text style={styles.mingyu}>{shenShaToast?.shenInterpretation?.[shenShaToast.position]}</Text>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Close button */}
                            <TouchableOpacity
                                style={{...styles.openButton, backgroundColor: '#42748a'}}
                                onPress={() => {
                                    setShenShaModalVisible(!shenShaModalVisible);
                                }}>
                                <Text style={styles.textStyle}>关闭</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={yongshenModal}
                    onRequestClose={() => {
                        setYongshenModal(!yongshenModal);
                    }}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <ScrollView contentContainerStyle={styles.scrollContainer}>
                                <View style={styles.modalTitleWrapper}>
                                    <Text style={styles.gejuModalTitle}>用神分析</Text>
                                </View>
                                <View style={styles.gejuWrapper}>
                                    {yongshen[ob?.bz_jr?.slice(0, 1) + ob?.bz_jy?.slice(1, 2)]?.map(item => {
                                        return <Text style={styles.yongshenText}>{'    ' + item}</Text>;
                                    })}
                                </View>
                            </ScrollView>

                            {/* Close button */}
                            <TouchableOpacity
                                style={{...styles.openButton, backgroundColor: '#42748a'}}
                                onPress={() => {
                                    setYongshenModal(!yongshenModal);
                                }}>
                                <Text style={styles.textStyle}>关闭</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            <SafeAreaView style={styles.safeAreaBottom} />
        </View>
    );
}

export default BaziPanScreen;
