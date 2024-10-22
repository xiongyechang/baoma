import { baseURL } from "@/config/config";
import { getToken } from "@/utils/utils";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import router from "../router";
import { getRefreshToken } from "@/api/api";
import { HttpResponseCode } from "@/constants/constants";
import { ElMessage } from "element-plus";
import store from "@/store";

axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const access_token = getToken();
  if (access_token) {
    config.headers.authorization = "Bearer " + access_token;
  }
  return config;
}, Promise.reject);

// 无感刷新token
let isRefreshing = false;
// 请求队列
const requests: Array<() => void> = [];

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { status, config } = error.response;
    if (status == HttpResponseCode.UNAUTHORIZED) {
      requests.push(() => axios(config));
      if (!isRefreshing) {
        isRefreshing = true;
        return getRefreshToken()
          .then((res) => {
            const { data, code, message } = res;
            if (code === HttpResponseCode.OK) {
              localStorage.setItem("access_token", data);
              store.dispatch("admin/setLoginStatus", true);
              requests.forEach((callback) => callback());
              requests.length = 0;
            } else {
              ElMessage.error(message);
              router.replace({
                name: "login",
              });
            }
          })
          .catch((e) => {
            console.error(e);
            router.replace({
              name: "login",
            });
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
    } else {
      return Promise.reject(error);
    }
  },
);

type ResponseData<T> = {
  code: number;
  data: T;
  message: string;
};

type PromisedResponse<T> = Promise<ResponseData<T>>;

const handleRequest = async <T>(
  config: AxiosRequestConfig,
): PromisedResponse<T> => {
  try {
    const response: AxiosResponse<ResponseData<T>> = await axios(config);
    const { data } = response;
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        data: null as unknown as T,
        code: error.response?.status || 500,
        message: error.message,
      };
    } else {
      return {
        data: null as unknown as T,
        code: 500,
        message: "Unknown error",
      };
    }
  }
};

export default class Http {
  static get<T>(
    url: string,
    params?: Record<string, any>,
  ): PromisedResponse<T> {
    return handleRequest<T>({
      baseURL,
      method: "GET",
      url,
      params,
    });
  }
  static post<T>(url: string, data?: Record<string, any>): PromisedResponse<T> {
    return handleRequest<T>({
      baseURL,
      method: "POST",
      url,
      data,
    });
  }
  static delete<T>(
    url: string,
    params?: Record<string, any>,
  ): PromisedResponse<T> {
    return handleRequest<T>({
      baseURL,
      method: "DELETE",
      url,
      params,
    });
  }
  static put<T>(url: string, data?: Record<string, any>): PromisedResponse<T> {
    return handleRequest<T>({
      baseURL,
      method: "PUT",
      url,
      data,
    });
  }
}
