import axios from 'axios';

const base = 'https://gaocanyixue.com/py';
// 支付宝/用户接口后端（本地调试）
const PAY_LOCAL = true; // 打正式包/用线上时改为 false
// 模拟器用 localhost；真机必须改成你 Mac 的局域网 IP（Mac 与手机同一 WiFi），否则会 Connection refused
const PAY_LOCAL_HOST = 'http://192.168.18.124:8000'; // 真机调试：Mac 局域网 IP（ifconfig 查看），当前 192.168.18.124
const payBase = PAY_LOCAL ? PAY_LOCAL_HOST : 'https://gaocanyixue.com/py';
// 用户登录/记录接口与支付同源（本地时走 PAY_LOCAL_HOST）
const userBase = payBase;
const LOCAL_REQUEST_TIMEOUT = 30000; // 本地请求超时（毫秒）

// 添加请求拦截器
axios.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么
        return config;
    },
    function (error) {
        // 对请求错误做些什么
    }
);

// 拦截响应，遇到token不合法则报错
axios.interceptors.response.use(
    response => {
        if (response.data.token) {
            console.log('token:', response.data.token);
        }
        if (response.data.errno === -1) {
            return Promise.reject(response.data);
        } else {
            return response;
        }
    },
    error => {
        const errRes = error.response;
        if (errRes?.status === 401) {
            console.log(errRes);
        }
        return Promise.reject(error.message); // 返回接口返回的错误信息
    }
);
// 添加响应拦截器
// axios.interceptors.response.use(
//     function (response) {
//         // 对响应数据做点什么
//         // if (response != undefined && response != '' && JSON.stringify(response) != '{}' && JSON.stringify(response) != '[]') {
//         return response;
//         // } else {
//         //     router.push({ name: 'notFound' })
//         // }
//     },
//     function (error) {
//         // 对响应错误做点什么
//         console.log(error);
//     }
// );

const localConfig = PAY_LOCAL ? { timeout: LOCAL_REQUEST_TIMEOUT } : {};

export const getUserData = params => {
    return axios.get(`${userBase}/fetch_user_data`, { params, ...localConfig }).then(res => res.data);
};
export const setUserData = params => {
    return axios.post(`${userBase}/set_login_data`, params, localConfig).then(res => res?.data ?? res);
};
export const setBaziRecord = params => {
    return axios.post(`${userBase}/set_bazi_record`, params, localConfig).then(res => console.log(res));
};
export const getBaziRecord = params => {
    return axios.get(`${userBase}/fetch_bazi_record`, { params, ...localConfig }).then(res => res.data);
};

/** 退出登录：通知后端后本地清除 userid/unionid */
export const logout = params => {
    return axios.post(`${userBase}/logout`, params || {}, localConfig).then(res => res?.data ?? res);
};

/**
 * 获取支付宝 APP 支付订单串（由服务端签名，对接 XingYuanShuiJingPy /api/pay/create）
 * @param params subject 订单标题，total_amount 金额（元，两位小数），out_trade_no 可选商户订单号，body 可选描述
 * @returns 服务端返回的 order_string，直接传给 Alipay.pay(orderStr)
 */
export const getAlipayOrderStr = (params: {
    subject?: string;
    out_trade_no?: string;
    total_amount?: string;
    body?: string;
    [key: string]: unknown;
}) => {
    const query = {
        amount: params.total_amount ?? '0.01',
        subject: params.subject ?? '星垣水镜-订单',
        body: params.body ?? params.subject ?? '',
        out_trade_no: params.out_trade_no ?? ''
    };
    return axios
        .post<{ order_string: string }>(`${payBase}/api/pay/create`, null, { params: query })
        .then(res => res.data?.order_string ?? '');
};
