import {ScrollView, View, Text, Animated, Button, Alert, Dimensions, Image, TouchableOpacity, SafeAreaView} from 'react-native';
import styles from './style.js';
import React, {Component, useEffect, useState, useRef} from 'react';
import * as WeChat from 'react-native-wechat-lib';
import PagerView from 'react-native-pager-view';
import usePagerView from './usePagerView';
import Record from './Record/index';
import {getUserData, setUserData, getBaziRecord, getAlipayOrderStr} from '../../api/index';
import {pay as alipayPay, setAlipaySandbox, isPaySuccess, getPayResultMessage} from '../../services/alipay';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {useUserStore} from '../../store/index';
import {WECHAT_APP_ID, WECHAT_UNIVERSAL_LINK, WECHAT_APP_SECRET} from '../../config/wechat';

const screenHeight = Dimensions.get('window').height;
export default function RNWeChatDemo({navigation}) {
    const {setUserId} = useUserStore();
    const [userInfo, setUserInfo] = useState({
        nickname: '',
        headimg_url: ''
    });
    const [records, setRecords] = useState([]);
    const {pagerRef, setPage, page} = usePagerView();
    const translateX = useRef(new Animated.Value(0)).current; // Animated value for the highlight bar

    const tabWidth = 60; // Width of each tab button, adjust based on your design
    useFocusEffect(
        React.useCallback(() => {
            const deviceId = DeviceInfo.getDeviceId();
            DeviceInfo.getUserAgent().then(userAgent => {
                // console.log(userAgent);
            });
            getUnionid();

            WeChat.registerApp(WECHAT_APP_ID, WECHAT_UNIVERSAL_LINK);
            WeChat.isWXAppInstalled().then(res => {
                // console.log(res);
            });
        }, [])
    );

    const getUnionid = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('unionid');
            if (jsonValue) {
                handleFetchUser(jsonValue);
            }
            return jsonValue || null;
        } catch (e) {
            // error reading value
        }
    };

    function handleFetchUser(unionid: string) {
        getUserData({unionid})
            .then(async res => {
                setUserInfo(res);
                handleGetBaziRecord(res.user_id);
                setUserId(res.user_id);
                await AsyncStorage.setItem('userid', res.user_id.toString() || '');
            })
            .catch(err => console.log(err));
    }

    const handleGetBaziRecord = user_id => {
        getBaziRecord({userid: user_id}).then(res => {
            setRecords(res);
        });
    };

    // 登录相关
    const handleLogin = () => {
        WeChat.sendAuthRequest('snsapi_userinfo', '')
            .then((response: any) => {
                // todo 登录 response.code
                getAccessToken(WECHAT_APP_ID, WECHAT_APP_SECRET, response.code);
            })
            .catch(error => {
                let errorCode = Number(error.code);
                if (errorCode === -2) {
                    Alert.alert('已取消授权登录');
                } else {
                    Alert.alert('微信授权登录失败');
                }
            });
    };

    const getAccessToken = (appid: string, secret: string, code: string) => {
        const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;

        axios
            .get(url)
            .then(response => {
                const {data} = response;
                // 如果需要，这里可以调用获取用户信息的函数
                getUserInfo(data.access_token, data.openid);
            })
            .catch(error => {});
    };

    function getUserInfo(access_token: string, openid: string) {
        const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`;

        axios
            .get(url)
            .then(response => {
                const {data} = response;
                storeUnionid(data.unionid);
                setUserData(data)
                    .then(res => {})
                    .catch(err => {});
            })
            .catch(error => {});
    }

    const storeUnionid = async (unionid: string) => {
        try {
            await AsyncStorage.setItem('unionid', unionid);
        } catch (e) {
            // saving error
        }
    };

    // 设为 true 时：不请求后端，用占位订单串仅测试「调起支付宝」是否成功（支付宝内会报错属正常）
    const USE_FAKE_ORDER_FOR_LAUNCH_TEST = false;

    // 支付宝支付：先向 XingYuanShuiJingPy 后端 /api/pay/create 获取订单串，再调起支付宝
    const handleAlipayPay = async () => {
        try {
            // 后端为沙箱时设为 true，正式环境设为 false
            setAlipaySandbox(false);
            let orderStr: string;
            if (USE_FAKE_ORDER_FOR_LAUNCH_TEST) {
                orderStr =
                    'app_id=xxx&method=alipay.trade.app.pay&charset=utf-8&version=1.0&sign_type=RSA2&sign=xxx';
            } else {
                orderStr = await getAlipayOrderStr({
                    subject: '星垣水镜-订单',
                    out_trade_no: `xy_${Date.now()}`,
                    total_amount: '0.01'
                });
                if (!orderStr) {
                    Alert.alert('提示', '获取订单失败，请确认支付后端已部署并配置 ALIPAY_APP_ID、ALIPAY_PRIVATE_KEY');
                    return;
                }
            }
            const result = await alipayPay(orderStr);
            Alert.alert(getPayResultMessage(result), isPaySuccess(result) ? '订单支付成功' : result.memo || '');
        } catch (e: any) {
            Alert.alert('支付宝支付失败', e?.message || String(e));
        }
    };

    const setPageInfo = tabNum => {
        setPage(tabNum);
    };

    const handlePageScroll = e => {
        const offset = e.nativeEvent.offset; // Page scroll offset (0.0 to 1.0)
        const position = e.nativeEvent.position; // Current page position
        const animatedValue = position * tabWidth + offset * tabWidth; // Calculate where the bar should be
        Animated.timing(translateX, {
            toValue: animatedValue,
            duration: 0, // No delay for smooth transition
            useNativeDriver: true
        }).start();
    };

    return (
        <SafeAreaView style={styles.settingWrapper}>
            <View style={styles.userInfo}>
                <View style={styles.infoLeft}>
                    {userInfo?.headimg_url && <Image source={{uri: `${userInfo.headimg_url}`}} style={styles.userAvatar} />}
                    <Text style={styles.userName}>{userInfo.nickname}</Text>
                    {!userInfo.headimg_url && <Button title="登录" color="#8b4513" onPress={() => handleLogin()} />}
                </View>
                <TouchableOpacity onPress={handleAlipayPay} style={styles.alipayButton}>
                    <Text style={styles.alipayButtonText}>支付宝支付</Text>
                </TouchableOpacity>
                {/* <SvgUri style={styles.setLogo} uri="https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/debian.svg" /> */}
            </View>
            <View style={styles.container}>
                <View style={styles.tabs}>
                    <TouchableOpacity style={styles.tabsButton} onPress={() => setPageInfo(0)}>
                        <Text style={page === 0 ? styles.buttonTextHl : styles.buttonText}>记录</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.tabsButton} onPress={() => setPageInfo(1)}>
                        <Text style={page === 1 ? styles.buttonTextHl : styles.buttonText}>收藏</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabsButton} onPress={() => setPageInfo(2)}>
                        <Text style={page === 2 ? styles.buttonTextHl : styles.buttonText}>喜欢</Text>
                    </TouchableOpacity> */}
                    <View style={styles.highlightBarWrapper}>
                        <Animated.View
                            style={[
                                styles.highlightBar,
                                {
                                    transform: [{translateX}]
                                }
                            ]}
                        />
                    </View>
                </View>
                <PagerView
                    ref={pagerRef}
                    style={styles.pagerView}
                    initialPage={0}
                    onPageSelected={e => {
                        setPageInfo(e.nativeEvent.position);
                    }}
                    onPageScroll={handlePageScroll}>
                    <View key="1" style={[styles.page, { flex: 1 }]}>
                        {!userInfo.headimg_url ? <Text style={styles.emptyHint}>登录后可记录</Text> : <Record passingRecords={records} navigation={navigation}></Record>}
                    </View>
                    <ScrollView key="2" style={styles.page}>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Second page</Text>
                        <Text style={styles.pagetext}>222Se2345cond page</Text>
                        <Text style={styles.pagetext}>222S345econd page</Text>
                        <Text style={styles.pagetext}>22223Second page</Text>
                        <Text style={styles.pagetext}>2224433Second page</Text>
                    </ScrollView>
                    <View key="3" style={styles.page}>
                        <Text>333333</Text>
                    </View>
                </PagerView>
            </View>
            {/* <Button title="登录123" onPress={handleLogin} /> */}
        </SafeAreaView>
    );
}
