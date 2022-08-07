import { baseURL } from '@/config/config';
import { getToken } from '@/utils/utils';
import axios from "axios";
import router from "../router";
import API from '@/api/api';
import { HttpResponseCode } from '@/constants/constants';

axios.interceptors.request.use(config => {
    const access_token = getToken();
    if (access_token) {
      config.headers.authorization = 'Bearer ' + access_token;
    }
    return config;
}, Promise.reject);

// 无感刷新token
let isRefreshing = false;
// 请求队列
const requests = [];

axios.interceptors.response.use(response => {
    return response;
}, error => {
    const { status, config } = error.response;
    if (status == HttpResponseCode.UNAUTHORIZED) {
        requests.push(() => axios(config));
        if (!isRefreshing) {
            isRefreshing = true;
            return API.getRefreshToken().then(res => {
                const { data, code, message } = res;
                if (code === HttpResponseCode.OK) {
                    localStorage.setItem("access_token", data);
                    store.dispatch("admin/setLoginStatus", true);
                    requests.forEach(callback => callback());
                    requests.length = 0;
                } else {
                    ElMessage.error(message)
                    router.replace({
                        name: "login"
                    });
                }
            }).catch(e => {
                console.error(e);
                router.replace({
                    name: "login"
                });
            }).finally(() => {
                isRefreshing = false;
            })
        }
    } else {
        return Promise.reject(error);
    }
});

const request = (method, url, data) => {
    let args = null;

    if (method === "GET" || method === "DELETE") {
        args = {
            params: data,
        };
    } else if (method === "POST" || method === "PUT") {
        args = {
            data,
        };
    } else {
        args = {};
    }

    return axios({
        baseURL,
        method,
        url,
        ...args,
    });
};

export default class Http {
    static get(path, params) {
        return request(`GET`, `${path}`, params).then(({ data }) => data).catch(console.error);
    }
    static post(path, params) {
        return request(`POST`, `${path}`, params).then(({ data }) => data).catch(console.error);
    }
    static delete(path, params) {
        return request(`DELETE`, `${path}`, params).then(({ data }) => data).catch(console.error);
    }
    static put(path, params) {
        return request(`PUT`, `${path}`, params).then((({ data }) => data)).catch(console.error); 
    }
}