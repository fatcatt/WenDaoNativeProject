import React, {useEffect, useState, useRef} from 'react';
import {View, Text, SafeAreaView, ScrollView, TouchableWithoutFeedback, Animated, TouchableOpacity, ActivityIndicator, Modal, TouchableHighlight, Alert} from 'react-native';
import moment from 'moment';
import {obb} from '../../utils/lunar.js';
import {JD, J2000, radd, int2} from '../../utils/eph0.js';
import {year2Ayear, timeStr2hour} from '../../utils/tools.js';
import {getShenSha} from '../../utils/calcBazi';
import calendar from 'js-calendar-converter';
import {Lunar1} from '../../utils/lunar1';
import {setBaziRecord} from '../../api/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GanZhiMap, simShishen} from '../../utils/constants/shensha';
import styles from './style.js';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {geju} from '../../utils/constants/geju.js';
import {yongshen} from '../../utils/constants/yongshen.js';
function BaziPanScreen({route}) {
    const navigation = useNavigation();
    const curTZ = -8; //当前时区
    const {solarDate, gender, nickname, id = ''} = route.params.navigationParams;
    const [Cp11_J, setCp11_J] = useState('120');
    const [ob, setBazi] = useState({});
    const [BZ_result, setBZ_result] = useState({});
    // 使用 Animated.Value 来管理背景透明度
    const [animatedValues, setAnimatedValues] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
    const [notice, setNotice] = useState(false);
    const [remark, setRemark] = useState('');
    const [gejuModalVisible, setGejuModalVisible] = useState(false);
    const [lunardata, setlunardate] = useState();
    const [shenShaToast, setshenShaToast] = useState({});
    const [shenShaModalVisible, setShenShaModalVisible] = useState(false);
    const [yongshenModal, setYongshenModal] = useState(false);

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
        const lu = Lunar1().Lunar.fromDate(moment(solarDate, 'YYYY-M-D H').toDate());
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
        const getDaYun = yun.getDaYun();
        for (let i = 0; i < 11; i++) {
            if (getDaYun[i].getGanZhi()) {
                var hideGan = Lunar1().LunarUtil.ZHI_HIDE_GAN[getDaYun[i].getGanZhi().slice(1, 2)];
            }
            dayun.push({
                qiyun: '出生' + yun.getStartYear() + '年' + yun.getStartMonth() + '个月' + yun.getStartDay() + '天后起运',
                ganzhi: getDaYun[i].getGanZhi(),
                startYear: getDaYun[i].getStartYear(),
                endYear: getDaYun[i].getEndYear(),
                startAge: getDaYun[i].getStartAge(),
                endAge: getDaYun[i].getEndAge(),
                liuNian: getDaYun[i].getLiuNian(),
                xiaoYun: getDaYun[i].getXiaoYun(),
                ganShishen: getDaYun[i].getGanZhi() ? Lunar1().LunarUtil.SHI_SHEN_GAN[ob?.bz_jr?.slice(0, 1) + getDaYun[i].getGanZhi().slice(0, 1)] : '',
                zhiShishen: getDaYun[i].getGanZhi() ? Lunar1().LunarUtil.SHI_SHEN_ZHI[ob?.bz_jr?.slice(0, 1) + hideGan[0]] : ''
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
        let jieqi;
        const [lunarCml_y, lunarCml_m, lunarCml_d] = lunarDate.split(/[-\s:]/);
        var d = Lunar1().Lunar.fromYmd(lunarCml_y, lunarCml_m, lunarCml_d);
        if (d.getCurrentJieQi()) {
            jieqi = '出生于' + d.getCurrentJieQi()._p.name + '0天';
        } else {
            let prev = d.getPrevJieQi(false);
            let diff = moment(solarDate, 'YYYY-M-D H').diff(moment(prev.getSolar().toYmdHms()), 'days');
            jieqi = '出生于' + prev.getName() + '后' + diff + '天';
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
    return (
        <ScrollView style={styles.paipanWrapper}>
            <SafeAreaView style={styles.safeArea}></SafeAreaView>
            {/* {!BZ_result.solarDate ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#666666CC" />
                    <Text style={styles.loadingText}>加载中...</Text>
                </View>
            ) : ( */}
            <View>
                <View style={styles.bazipanHeader}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()} // Handle back navigation
                    >
                        <Icon name="chevron-back-outline" size={20} color="#fff"></Icon>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>天机八字盘</Text>
                    <View>
                        {isSaved ? (
                            <TouchableOpacity
                                onPress={toggleSwitch} // Handle back navigation
                            >
                                <Icon name="bookmark" size={22} color="#FFB54C" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={toggleSwitch} // Handle back navigation
                            >
                                <Icon name="bookmark-outline" size={22} color="#fff" />
                            </TouchableOpacity>
                        )}
                        {/* <Text>保存：</Text>
                    <Switch style={styles.saveSwitch} trackColor={{false: '#767577', true: '#81b0ff'}} thumbColor={isSaved ? '#f5dd4b' : '#f4f3f4'} ios_backgroundColor="#3e3e3e" onValueChange={toggleSwitch} value={isSaved} /> */}
                    </View>
                </View>
                {notice && (
                    <View style={styles.notice}>
                        <Text style={styles.noticeText}>保 存 成 功!</Text>
                    </View>
                )}
                <View style={styles.paipanContainer}>
                    <View style={styles.header}></View>
                    {/* <Text>{JSON.stringify(route)}</Text> */}
                    <Text>{'姓名：' + nickname}</Text>
                    <Text>{'出生时间：' + '阳历' + solarDate}</Text>
                    <Text>{'出生时间：' + '阴历' + lunardata}</Text>
                    <Text style={styles.marginSeparate}>{BZ_result.jieqi}</Text>
                    {/* <Text>{`${ob?.bz_jn}年${ob?.bz_jy}月${ob?.bz_jr}日${ob?.bz_js}时`}</Text> */}
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
                                247;
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
                                                            <Text style={styles.startWithText}>{e.ganShishen ? simShishen[e.ganShishen] + simShishen[e.zhiShishen] : '小运'}</Text>
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
                    {/* <Text>{dayun.join(',')}</Text> */}
                    {/* <View style={styles.remarkWrapper}>
                            <Text>备注：</Text>
                            <TextInput style={styles.remark} placeholder="写入备注后请保存" onChangeText={onChangeText} />
                        </View> */}
                </View>
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
            </View>
            {/* )} */}
            <SafeAreaView style={styles.safeAreaBottom} />
        </ScrollView>
    );
}

export default BaziPanScreen;
