import http from '@/http/http';
import { baseURL } from '@/config/config';

const prefix = `/api`;

const CodeSnippetRoute = `/code-snippet`;

const CodeCategoryRoute = `/code-category`;

const AdminRoute = `/admin`;

export default {
	addCodeSnippet (codesnippet) {
		return http.post(`${baseURL}${prefix}${CodeSnippetRoute}`, codesnippet);
	},
	updateCodeSnippet (codesnippet) {
		return http.put(`${baseURL}${prefix}${CodeSnippetRoute}`, codesnippet);
	},
	getCodeSnippets (page = 1, limit = 20) {
		return http.get(`${baseURL}${prefix}${CodeSnippetRoute}?page=${page}&limit=${limit}`);
	},
	getCodeSnippet (_id) {
		return http.get(`${baseURL}${prefix}${CodeSnippetRoute}/${_id}`)
	},
	removeCodeSnippet (_id) {
		return http.delete(`${baseURL}${prefix}${CodeSnippetRoute}?_id=${_id}`);
	},
	searchCodeSnippets (keyword = '', category = '', page = 1, limit = 20) {
		return http.get(`${baseURL}${prefix}${CodeSnippetRoute}/search?keyword=${keyword}&category=${category}&page=${page}&limit=${limit}`);
	},
	getCodeCategories () {
		return http.get(`${baseURL}${prefix}${CodeCategoryRoute}`);
	},
	getCodeSnippetsByCategory ({ _id, page = 1, limit = 20 }) {
		return http.get(`${baseURL}${prefix}${CodeSnippetRoute}/by?categoryId=${_id}&page=${page}&limit=${limit}`);
	},
	addCategory (category) {
		return http.post(`${baseURL}${prefix}${CodeCategoryRoute}`, category);
	},
	removeCategory ({ _id }) {
		return http.delete(`${baseURL}${prefix}${CodeCategoryRoute}?_id=${_id}`);
	},
	updateCategory (category) {
		return http.put(`${baseURL}${prefix}${CodeCategoryRoute}`, category);
	},
	// 管理员
	getQiniuToken () {
		return http.get(`${baseURL}${prefix}${AdminRoute}/getQiniuToken`);
	},
	getQiniuDomain () {
		return http.get(`${baseURL}${prefix}${AdminRoute}/getQiniuDomain`);
	},
	getVerifyCode () {
		return http.get(`${baseURL}${prefix}${AdminRoute}/getVerifyCode`);
	},
	getPublicKey () {
		return http.get(`${baseURL}${prefix}${AdminRoute}/getPublicKey`);
	},
	login(secret) {
		return http.post(`${baseURL}${prefix}${AdminRoute}/login`, secret);
	},
	getRefreshToken() {
		return http.get(`${baseURL}${prefix}${AdminRoute}/getRefreshToken`);
	},
}
