import axios from 'axios';

const base = 'https://gaocanyixue.com/py';

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
