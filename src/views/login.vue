<template>
  <div class="tabs-wrapper">
    <div label="登录页三" name="third" class="wrapper-box03">
      <div class="login">
        <div class="login-logo">
          <div class="login-logo-img03"></div>
          欢迎使用-扫码溯源后台管理系统
        </div>
        <div class="login-box03">
          <el-form
            ref="loginRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            label-position="top"
          >
            <div class="login-logo-img02"></div>
            <h3 class="title">用户登录</h3>
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                size="large"
                auto-complete="off"
                placeholder="账号"
              >
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                size="large"
                auto-complete="off"
                placeholder="密码"
                @keyup.enter="handleLogin"
              >
              </el-input>
            </el-form-item>
            <el-form-item prop="code" v-if="captchaEnabled">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                style="width: 100%"
                @keyup.enter="handleLogin"
              >
              </el-input>
              <div class="login-code">
                <img :src="codeUrl" @click="getCode" class="login-code-img" />
              </div>
            </el-form-item>
            <el-checkbox
              v-model="loginForm.rememberMe"
              style="margin: 0px 0px 25px 0px"
              >记住密码</el-checkbox
            >
            <el-form-item style="width: 100%">
              <el-button
                :loading="loading"
                size="large"
                type="primary"
                style="width: 100%; padding: 15px 20px; font-size: 16px"
                @click.prevent="handleLogin"
              >
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
              <div style="float: right" v-if="register">
                <router-link class="link-type" :to="'/register'"
                  >立即注册</router-link
                >
              </div>
            </el-form-item>
          </el-form>
          <!--  底部  -->
          <!-- 侧栏 -->
          <div class="login-pic03"></div>
        </div>
        <div class="el-login-footer">
          <span>Copyright © 2018-2022 ruoyi.vip All Rights Reserved.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";

import useUserStore from "@/store/modules/user";

const userStore = useUserStore();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: "",
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }],
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

function handleLogin() {
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), {
          expires: 30,
        });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore
        .login(loginForm.value)
        .then(() => {
          router.push({ path: redirect.value || "/" });
        })
        .catch(() => {
          loading.value = false;
          // 重新获取验证码
          if (captchaEnabled.value) {
            getCode();
          }
        });
    }
  });
}

function getCode() {
  getCodeImg().then((res) => {
    captchaEnabled.value =
      res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password:
      password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
  };
}

getCode();
getCookie();
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  min-height: 750px;
  min-width: 1300px;
  /* background-image: url("../assets/images/login-background.jpg");
  background-size: cover; */
}
.title {
  margin: 0px auto 8px auto;
  text-align: left;
  font-size: 22px;
  font-weight: bold;
  color: #202329;
}
.other-text {
  font-size: 16px;
  color: #646a73;
  margin-bottom: 30px;
  display: inline-block;
}
.login-logo-img {
  background: url("../assets/logo/logo.png") no-repeat left top;
  position: absolute;
  left: 20px;
  top: 10px;
  width: 64px;
  height: 64px;
}
.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 450px;
  margin: 0 auto;
  padding: 20px 30px;
  .el-form-item__label {
    font-size: 16px;
    line-height: 30px;
  }
  .el-input {
    height: 38px;
    border: 0;
    input {
      height: 38px;
      border: 0;
      border-bottom: 1px solid #d9d9d9;
      padding: 0;
      box-shadow: none;
    }
  }
  .login-form {
    border-radius: 6px;
    background: #ffffff;
    width: 400px;
    padding: 25px 25px 5px 25px;
    .el-input {
      height: 40px;
      input {
        height: 40px;
      }
    }
    .input-icon {
      height: 39px;
      width: 14px;
      margin-left: 0px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 38px;
  position: absolute;
  right: 0;
  text-align: right;
  top: -3px;
  img.login-code-img {
    cursor: pointer;
    vertical-align: middle;
    width: 95px;
  }
}
.el-login-footer {
  height: 60px;
  line-height: 60px;
  position: fixed;
  bottom: 0;
  right: 600px;
  left: 0px;
  text-align: center;
  color: #666666;
  font-size: 13px;
}

.wrapper-box03 {
  background-color: #3269c2;
  display: flex;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  .login {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    min-height: 750px;
    min-width: 1300px;
  }
  .login-logo {
    width: 880px;
    display: flex;
    align-items: center;
    margin: 0px auto 40px;
    justify-content: center;
    font-size: 28px;
    font-weight: bold;
    color: #ffffff;
    .login-logo-img03 {
      background: url("../assets/logo/logo.png") no-repeat left top;
      width: 64px;
      height: 64px;
      margin-right: 8px;
    }
  }
  .login-box03 {
    background: #ffffff;
    border-radius: 8px;
    width: 880px;
    margin: 0 auto;
    padding: 30px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014,
      0 9px 28px 8px #0000000d !important;
    .login-form {
      width: 420px;
      padding: 20px;
      margin: 0;
    }
    .el-input {
      height: 48px;
    }
    .login-text {
      text-align: center;
      padding: 0 0 30px;
      margin-top: 0;
      font-size: 32px;
      font-weight: bold;
    }
    .el-input input {
      border: 1px solid #e5e5e5;
      padding: 5px 18px !important;
      height: 50px !important;
      font-size: 16px;
      border-radius: 50px !important;
    }
    .login-code {
      margin-right: 18px;
      margin-top: 10px;
    }
    .login-pic03 {
      background: url("../assets/images/login-pic03.png") no-repeat left top;
      width: 404px;
      height: 230px;
    }
  }
  .el-login-footer {
    right: 0;
    left: 0;
    color: #ffffff;
  }
}
</style>
