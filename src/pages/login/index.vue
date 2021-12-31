<template>
	<div class="container">
		<div class="main">
			<div class="main_login">
				<p class="main_login-title">登录</p>
			</div>
			<el-form
				ref="ruleFormRef"
				:model="ruleForm"
				:rules="rules"
				label-width="80px"
				label-position="right"
				:status-icon="true"
			>
				<el-form-item label="账号:" prop="username" required>
					<el-input
						class="input"
						type="text"
						v-model="ruleForm.username"
						placeholder="请输入账号"
					></el-input>
				</el-form-item>
				<el-form-item label="密码:" prop="password" required>
					<el-input
						class="input"
						type="password"
						v-model="ruleForm.password"
						placeholder="请输入密码"
					></el-input>
				</el-form-item>
				<el-form-item label="验证码:" prop="verify_code">
					<el-row>
						<el-col :span="12">
							<el-input
								class="input"
								v-model="ruleForm.verify_code"
								placeholder="请输入验证码"
							></el-input>
						</el-col>
						<el-col :span="12">
							<div
								v-html="verifyCodeImg"
								@click="getVerifyCode"
							></div>
						</el-col>
					</el-row>
				</el-form-item>
			</el-form>
			<el-row type="flex" justify="center">
				<el-col :span="4">
					<el-button @click="submitForm" type="primary">登录</el-button>
				</el-col>
				<el-col :span="4">
					<el-button @click="forgetPwd" type="text">忘记密码</el-button>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script>
	import { ref, reactive, toRefs } from 'vue'
	import API from "@/api/api"
	import JSEncrypt from "jsencrypt"
	import { HttpResponseCode } from '@/constants/constants'
	import { ElMessage } from 'element-plus'
	import { useStore } from 'vuex'
	import { useRoute, useRouter } from "vue-router"

	export default {
		name: "login-page",
		setup() {

			const ruleFormRef = ref(null)

			const _data = reactive({
				verifyCodeImg: null,
				ruleForm: {
					username: "",
					password: "",
					email: "",
					verify_code: "",
				},
				rules: {
					username: [
						{
							required: true,
							message: "请输入用户名",
							trigger: "blur",
						},
						{
							min: 6,
							max: 16,
							message: "长度在3-16个字符",
							trigger: "blur",
						},
					],
					password: [
						{ required: true, message: "请输入密码", trigger: "blur" },
						{
							min: 6,
							max: 12,
							message: "长度在6-12个字符",
							trigger: "blur",
						},
					],
					email: [
						{ required: false, message: "请输入邮箱", trigger: "blur" },
						{
							partten: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
							message: "邮箱格式错误",
							trigger: "blur",
						},
					],
					verify_code: [
						{
							required: true,
							message: "请输入验证码",
							trigger: "blur",
						},
						{
							min: 4,
							max: 4,
							message: "长度在4-6个字符",
							trigger: "blur",
						},
					]
				},
				publicKey: ""
			})

			const store = useStore()

			// 获取路由器实例
		    const router = useRouter()
		    // route是响应式对象,可监控器变化
		    const route = useRoute()

			const getVerifyCode = async () => {
				try {
					const { code, message, data } = await API.getVerifyCode();
					if (code === HttpResponseCode.OK) {
						_data.verifyCodeImg = data
					} else {
						ElMessage.error(message)
					}
				} catch (error) {
					console.error(error)
				}
			}


			const getPublicKey = async () => {
				try {
					const { code, message, data } = await API.getPublicKey();
					if (code === HttpResponseCode.OK) {
						_data.publicKey = data
					} else {
						ElMessage.error(message)
					}
				} catch (error) {
					console.error(error)
				}
			}

			const submitForm = async formName => {
				ruleFormRef.value.validate(async valid => {
					if (valid) {
						try {
							let encrypt = new JSEncrypt();
							encrypt.setPublicKey(_data.publicKey);
							let username = _data.ruleForm.username;
							let password = encrypt.encrypt(_data.ruleForm.password);
							let verify_code = _data.ruleForm.verify_code;
							const { code, message, data } = await API.login({ username, password, verify_code })
							
							if (code === HttpResponseCode.OK) {
								localStorage.setItem("access_token", data);
								store.dispatch("admin/setLoginStatus", true)
									.then(() => {
										router.push({
											name: "admin",
										})
									})
							} else {
								ElMessage.error(message)
							}
						} catch (error) {
							console.error(error);
						}
					} else {
						return false;
					}
				});
			}

			const forgetPwd = async () => {
				let email;
				if (_data.ruleForm.email) {
					email = _data.ruleForm.email;
				} else {
					email = prompt("请输入邮箱:");
				}
				if (email.trim()) {
					let { msg } = await API.forgetPwd(email);
					ElMessage.success(msg);
				}
			}

			// 先获取公钥, 再获取验证码, 这样前一个接口返回的cookie正好被后面的接口使用
			// 如果并行发送请求, 则会请求回来两个不同的cookie, 登陆时, 请求发送的cookie是不对的,
			// 无法验证 验证码的准确性
			const asyncRequest = async function(){
				await getPublicKey()
				await getVerifyCode()
			}

			asyncRequest()

			return {
				ruleFormRef,
				...toRefs(_data),
				getVerifyCode,
				getPublicKey,
				submitForm,
				forgetPwd
			}

		}
	};
</script>

<style lang="scss" scoped>
	.container {
		background-image: url("http://cdn.xiongyechang.com/blog-background.jpg");
		background-size: cover;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		.main {
			text-align: center;
			background-color: #ffffff;
			padding: 20px;
			border-radius: 1px;
			width: 30%;
			&_login {
				margin: 0 0 10px 0;
				border-bottom: 1px dashed #dcdfe6;
				&-title {
					font-size: 20px;
					line-height: 1.5em;
				}
			}
			.input {
				font-size: 16px;
			}
		}
	}
</style>
