import axios from 'axios';

const base = 'https://gaocanyixue.com/py';
// 支付宝支付后端（星垣水镜 Py 服务），可与 base 同域或单独部署
const payBase = 'https://gaocanyixue.com/py';

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

export const getUserData = params => {
    return axios.get(`${base}/fetch_user_data`, {params: params}).then(res => res.data);
};
export const setUserData = params => {
    return axios.post(`${base}/set_login_data`, params).then(res => console.log(res));
};
export const setBaziRecord = params => {
    return axios.post(`${base}/set_bazi_record`, params).then(res => console.log(res));
};
export const getBaziRecord = params => {
    return axios.get(`${base}/fetch_bazi_record`, {params: params}).then(res => res.data);
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
