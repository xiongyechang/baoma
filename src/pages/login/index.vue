<template>
  <div class="container">
    <div class="main">
      <h2>登录</h2>
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
          <el-row justify="center" align="top">
            <el-col :span="12">
              <el-input
                class="input"
                v-model="ruleForm.verify_code"
                placeholder="请输入验证码"
              ></el-input>
            </el-col>
            <el-col :span="12">
              <div v-html="verifyCodeImg" @click="getVerifyCode"></div>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button @click="submitForm" type="primary">登录</el-button>
          <el-button @click="forgetPwd">忘记密码</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, toRefs } from "vue";
import API from "@/api/api";
import JSEncrypt from "jsencrypt";
import { HttpResponseCode } from "@/constants/constants";
import { ElMessage, ElMessageBox } from "element-plus";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  name: "login-page",
  setup() {
    const ruleFormRef = ref(null);

    const _data = reactive({
      verifyCodeImg: null,
      ruleForm: {
        username: "xiongyechang",
        password: "000000000",
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
        ],
      },
      publicKey: "",
    });

    const store = useStore();

    // 获取路由器实例
    const router = useRouter();

    const getVerifyCode = async () => {
      try {
        const { code, message, data } = await API.getVerifyCode();
        if (code === HttpResponseCode.OK) {
          _data.verifyCodeImg = data;
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const getPublicKey = async () => {
      try {
        const { code, message, data } = await API.getPublicKey();
        if (code === HttpResponseCode.OK) {
          _data.publicKey = data;
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const submitForm = async () => {
      (ruleFormRef.value as any).validate(async (valid: boolean) => {
        if (valid) {
          try {
            let encrypt = new JSEncrypt();
            encrypt.setPublicKey(_data.publicKey);
            let username = _data.ruleForm.username;
            let password = encrypt.encrypt(_data.ruleForm.password);
            let verify_code = _data.ruleForm.verify_code;
            const { code, message, data } = await API.login({
              username,
              password,
              verify_code,
            });

            if (code === HttpResponseCode.OK) {
              localStorage.setItem("access_token", data);
              store.dispatch("admin/setLoginStatus", true).then(() => {
                router.push({
                  name: "admin",
                });
              });
            } else {
              ElMessage.error(message);
            }
          } catch (error) {
            console.error(error);
          }
        } else {
          return false;
        }
      });
    };

    const forgetPwd = async () => {
      ElMessageBox.prompt("请输入你的邮箱", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern:
          /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
        inputErrorMessage: "邮箱格式错误",
      })
        .then(async ({ value }) => {
          const { msg } = await API.forgetPwd(value);
          ElMessage.success(msg);
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "取消输入",
          });
        });
    };

    // 先获取公钥, 再获取验证码, 这样前一个接口返回的cookie正好被后面的接口使用
    // 如果并行发送请求, 则会请求回来两个不同的cookie, 登陆时, 请求发送的cookie是不对的,
    // 无法验证 验证码的准确性
    const asyncRequest = async function () {
      await getPublicKey();
      await getVerifyCode();
    };

    asyncRequest();

    return {
      ruleFormRef,
      ...toRefs(_data),
      getVerifyCode,
      getPublicKey,
      submitForm,
      forgetPwd,
    };
  },
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
    padding: 0 20px;
    border-radius: 5px;
    width: 30%;
    h2 {
      margin: 10px 0;
    }
    .input {
      font-size: 16px;
    }
  }
}
</style>
