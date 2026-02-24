import {View, Text, Alert, Dimensions, Image, TouchableOpacity, SafeAreaView} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './style.js';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import * as WeChat from 'react-native-wechat-lib';
import {getUserData, setUserData, getAlipayOrderStr, logout as apiLogout} from '../../api/index';
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
    /** 同一 code 只走一次 getAccessToken -> setUserData，避免 Promise 与 SendAuth.Resp 事件重复触发导致多次请求/400 */
    const authCodeHandled = useRef<string | null>(null);
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

    // 监听微信授权返回事件（从微信切回 App 时 native 会发 SendAuth.Resp，确保能走到 setUserData）
    useEffect(() => {
        const sub = WeChat.addListener('SendAuth.Resp', handleWeChatAuthResp);
        return () => sub.remove();
    }, []);

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

    // 微信回调：从后台回到 App 时可能通过事件收到 code，补发一次拉 token -> 存库 -> 刷新用户
    const handleWeChatAuthResp = (resp: { code?: string }) => {
        if (!resp?.code) return;
        if (authCodeHandled.current === resp.code) return;
        authCodeHandled.current = resp.code;
        getAccessToken(WECHAT_APP_ID, WECHAT_APP_SECRET, resp.code);
    };

    function handleFetchUser(unionid: string) {
        getUserData({unionid})
            .then(async res => {
                setUserInfo(res);
                setUserId(res.user_id);
                await AsyncStorage.setItem('userid', res.user_id.toString() || '');
            })
            .catch(err => console.log(err));
    }

    // 登录相关
    const handleLogin = () => {
        authCodeHandled.current = null; // 新一轮登录允许处理
        WeChat.sendAuthRequest('snsapi_userinfo', '')
            .then((response: any) => {
                if (!response?.code) return;
                if (authCodeHandled.current === response.code) return;
                authCodeHandled.current = response.code;
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
                if (!data || !data.unionid) {
                    if (data?.errcode) console.warn('getUserInfo err', data.errcode, data.errmsg);
                    return;
                }
                const unionid = data.unionid;
                storeUnionid(unionid);
                setUserData({
                    nickname: data.nickname,
                    unionid,
                    headimgurl: data.headimgurl,
                })
                    .then(() => {
                        handleFetchUser(unionid);
                    })
                    .catch(err => {
                        console.warn('setUserData failed', err);
                    });
            })
            .catch(error => {
                console.warn('getUserInfo failed', error);
            });
    }

    const storeUnionid = async (unionid: string) => {
        try {
            await AsyncStorage.setItem('unionid', unionid);
        } catch (e) {
            // saving error
        }
    };

    const handleLogout = async () => {
        Alert.alert('退出登录', '确定要退出登录吗？', [
            { text: '取消', style: 'cancel' },
            {
                text: '确定',
                onPress: async () => {
                    try {
                        const uid = await AsyncStorage.getItem('userid');
                        const unionid = await AsyncStorage.getItem('unionid');
                        await apiLogout({ userid: uid || undefined, unionid: unionid || undefined });
                    } catch (_) {}
                    await AsyncStorage.removeItem('userid');
                    await AsyncStorage.removeItem('unionid');
                    setUserId('');
                    setUserInfo({ nickname: '', headimg_url: '' });
                },
            },
        ]);
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

    return (
        <SafeAreaView style={styles.settingWrapper}>
            {/* 用户卡片 */}
            <View style={styles.userCard}>
                <View style={styles.userCardLeft}>
                    {userInfo?.headimg_url ? (
                        <Image source={{uri: userInfo.headimg_url}} style={styles.userAvatar} />
                    ) : (
                        <View style={[styles.userAvatar, { backgroundColor: '#e8e4dc' }]} />
                    )}
                    <View style={styles.userCardTextWrap}>
                        {userInfo?.headimg_url ? (
                            <>
                                <Text style={styles.userName}>{userInfo.nickname || '微信用户'}</Text>
                                <Text style={styles.userSubtext}>同步您的排盘记录</Text>
                            </>
                        ) : (
                            <Text style={styles.userName}>未登录</Text>
                        )}
                    </View>
                </View>
                {userInfo?.headimg_url ? (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                        <Text style={styles.logoutButtonText}>退出登录</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
                        <Text style={styles.loginButtonText}>微信登录</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 功能 */}
            <View style={{ marginTop: 20, paddingHorizontal: 24 }}>
                <Text style={styles.sectionTitle}>功能</Text>
                <View style={styles.funcCard}>
                    <TouchableOpacity style={styles.funcRow} onPress={handleAlipayPay} activeOpacity={0.7}>
                        <View style={styles.funcRowLeft}>
                            <View style={styles.funcRowIcon}>
                                <Icon name="wallet-outline" size={20} color="#8b4513" />
                            </View>
                            <Text style={styles.funcRowText}>支付宝支付</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color="#4a4238" style={styles.funcRowArrow} />
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    );
}
