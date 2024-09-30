import http from "@/http/http";
import { baseURL } from "@/config/config";
import { toQuerystring } from "@/utils/utils";

const prefix = `/api`;

const CodeSnippetRoute = `/code-snippet`;

const CodeCategoryRoute = `/code-category`;

const CommonRoute = `/common`;

const UserRoute = `/user`;

const addCodeSnippet = (codesnippet) => {
  return http.post<any>(`${baseURL}${prefix}${CodeSnippetRoute}`, codesnippet);
};

const updateCodeSnippet = (_id, codesnippet) => {
  return http.put<any>(
    `${baseURL}${prefix}${CodeSnippetRoute}/${_id}`,
    codesnippet,
  );
};

const fetchCodeSnippets = (params) => {
  return http.get<any>(
    `${baseURL}${prefix}${CodeSnippetRoute}?${toQuerystring(params)}`,
  );
};

const fetchCodeSnippet = (_id) => {
  return http.get<any>(`${baseURL}${prefix}${CodeSnippetRoute}/${_id}`);
};

const removeCodeSnippet = (_id) => {
  return http.delete<any>(`${baseURL}${prefix}${CodeSnippetRoute}/${_id}`);
};

const removeCodeSnippets = (_ids: string[]) => {
  return http.delete<any>(`${baseURL}${prefix}${CodeSnippetRoute}`, {
    _ids,
  });
};

const fetchCodeCategories = (params) => {
  return http.get<any>(
    `${baseURL}${prefix}${CodeCategoryRoute}?${toQuerystring(params)}`,
  );
};

const fetchCodeSnippetsByCategory = ({ _id, page = 1, limit = 20 }) => {
  return http.get<any>(
    `${baseURL}${prefix}${CodeSnippetRoute}/by?categoryId=${_id}&page=${page}&limit=${limit}`,
  );
};

const addCategory = (category) => {
  return http.post<any>(`${baseURL}${prefix}${CodeCategoryRoute}`, category);
};

const removeCategory = (_id: string) => {
  return http.delete<any>(`${baseURL}${prefix}${CodeCategoryRoute}/${_id}`);
};

const updateCategory = (_id, category) => {
  return http.put<any>(
    `${baseURL}${prefix}${CodeCategoryRoute}/${_id}`,
    category,
  );
};

const fetchQiniuToken = () => {
  return http.get<any>(`${baseURL}${prefix}${CommonRoute}/getQiniuToken`);
};

const fetchQiniuDomain = () => {
  return http.get<any>(`${baseURL}${prefix}${CommonRoute}/getQiniuDomain`);
};

const fetchVerifyCode = <T>() => {
  return http.get<T>(`${baseURL}${prefix}${CommonRoute}/getVerifyCode`);
};

const fetchPublicKey = () => {
  return http.get<any>(`${baseURL}${prefix}${CommonRoute}/getPublicKey`);
};

const login = (secret) => {
  return http.post<any>(`${baseURL}${prefix}${UserRoute}/login`, secret);
};

const getRefreshToken = () => {
  return http.get<any>(`${baseURL}${prefix}${UserRoute}/getRefreshToken`);
};

const forgetPassword = (password) => {
  return http.post<any>(`${baseURL}${prefix}${UserRoute}/forgetPwd`, {
    password,
  });
};

export {
  addCodeSnippet,
  updateCodeSnippet,
  fetchCodeSnippets,
  fetchCodeSnippet,
  removeCodeSnippet,
  removeCodeSnippets,
  fetchCodeCategories,
  fetchCodeSnippetsByCategory,
  addCategory,
  removeCategory,
  updateCategory,
  fetchQiniuToken,
  fetchQiniuDomain,
  fetchVerifyCode,
  fetchPublicKey,
  login,
  getRefreshToken,
  forgetPassword,
};
