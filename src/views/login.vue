<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <!-- 中心区域容器 -->
    <div class="login-center">
      <div class="login-wrapper">
        <!-- 左侧品牌信息 -->
        <div class="brand-section">
          <div class="brand-logo">
            <i class="el-icon-cpu"></i>
          </div>
          <h1 class="brand-title">RouteMate出行服务</h1>
          <p class="brand-subtitle">高效、智能的企业级出行服务平台</p>

          <div class="feature-list">
            <div class="feature-item">
              <i class="el-icon-check"></i>
              <span>快速生成热点轨迹</span>
            </div>
            <div class="feature-item">
              <i class="el-icon-check"></i>
              <span>支持频繁模式分析</span>
            </div>
            <div class="feature-item">
              <i class="el-icon-check"></i>
              <span>免费全能功能体验</span>
            </div>
          </div>
        </div>

        <!-- 右侧登录表单 -->
        <div class="login-form-section">
          <div class="login-header">
            <h2 class="login-title">欢迎回来</h2>
            <p class="login-subtitle">请登录您的账户以继续使用</p>
          </div>

        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <div class="input-wrapper">
              <label class="input-label">用户账号</label>
              <el-input
                v-model="loginForm.username"
                type="text"
                auto-complete="off"
                placeholder="请输入您的账号"
                class="custom-input"
              >
                <svg-icon slot="prefix" icon-class="user" class="input-icon" />
              </el-input>
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-wrapper">
              <label class="input-label">登录密码</label>
              <el-input
                v-model="loginForm.password"
                type="password"
                auto-complete="off"
                placeholder="请输入您的密码"
                class="custom-input"
                @keyup.enter.native="handleLogin"
              >
                <svg-icon slot="prefix" icon-class="password" class="input-icon" />
              </el-input>
            </div>
          </el-form-item>

          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="input-wrapper">
              <label class="input-label">验证码</label>
              <div class="captcha-container">
                <el-input
                  v-model="loginForm.code"
                  auto-complete="off"
                  placeholder="请输入验证码"
                  class="custom-input captcha-input"
                  @keyup.enter.native="handleLogin"
                >
                  <svg-icon slot="prefix" icon-class="validCode" class="input-icon" />
                </el-input>
                <div class="captcha-image-wrapper">
                  <img :src="codeUrl" @click="getCode" class="captcha-image" title="点击刷新验证码"/>
                </div>
              </div>
            </div>
          </el-form-item>

          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe" class="remember-me">
              <span>记住登录状态</span>
            </el-checkbox>
            <div class="register-link" v-if="register">
              <router-link class="link-text" :to="'/register'">立即注册</router-link>
            </div>
          </div>

          <el-form-item class="login-button-wrapper">
            <el-button
              :loading="loading"
              type="primary"
              class="login-button"
              @click.native.prevent="handleLogin"
            >
              <span v-if="!loading">
                <i class="el-icon-user-solid"></i>
                立即登录
              </span>
              <span v-else>
                登录中...
              </span>
            </el-button>
          </el-form-item>
        </el-form>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="login-footer">
      <span>Copyright © 2026 Naiweilanlan All Rights Reserved.</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: "Login",
  data() {
    return {
      title: "RouteMate出行服务",
      codeUrl: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        code: "",
        uuid: ""
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" }
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      loading: false,
      // 验证码开关
      captchaEnabled: true,
      // 注册开关
      register: true,
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.getCode()
    this.getCookie()
  },
  methods: {
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
        if (this.captchaEnabled) {
          // this.codeUrl = "data:image/gif;base64," + res.img
          this.codeUrl =  res.img
          this.loginForm.uuid = res.uuid
        }
      })
    },
    getCookie() {
      const username = Cookies.get("username")
      const password = Cookies.get("password")
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 })
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 })
            Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 })
          } else {
            Cookies.remove("username")
            Cookies.remove("password")
            Cookies.remove('rememberMe')
          }
          this.$store.dispatch("Login", this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || "/" }).catch(()=>{})
          }).catch(() => {
            this.loading = false
            if (this.captchaEnabled) {
              this.getCode()
            }
          })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #4A90E2 0%, #E8F4FD 100%);
  overflow: hidden;
  padding: 20px;
}

// 背景装饰
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;

  .decoration-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;

    &.circle-1 {
      width: 200px;
      height: 200px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }

    &.circle-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }

    &.circle-3 {
      width: 100px;
      height: 100px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.9;
  }
}

// 中心登录区域
.login-center {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1100px;
  animation: slideIn 0.6s ease-out;

  .login-wrapper {
    display: flex;
    background: white;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    min-height: 600px;

    // 左侧品牌信息
    .brand-section {
      flex: 1;
      background: linear-gradient(135deg, #4A90E2 0%, #5CA9E8 100%);
      padding: 60px 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      text-align: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        top: -100px;
        right: -100px;
      }

      .brand-logo {
        width: 100px;
        height: 100px;
        margin: 0 auto 28px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.3);
        position: relative;
        z-index: 1;

        i {
          font-size: 48px;
          color: white;
        }
      }

      .brand-title {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 16px 0;
        position: relative;
        z-index: 1;
      }

      .brand-subtitle {
        font-size: 16px;
        margin: 0 0 40px 0;
        opacity: 0.95;
        line-height: 1.6;
        position: relative;
        z-index: 1;
      }

      .feature-list {
        width: 100%;
        max-width: 320px;
        position: relative;
        z-index: 1;

        .feature-item {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          margin-bottom: 12px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateX(8px);
          }

          i {
            color: #81D4FA;
            margin-right: 12px;
            font-size: 18px;
            font-weight: bold;
          }

          span {
            font-size: 15px;
            text-align: left;
          }
        }
      }
    }

    // 右侧登录表单
    .login-form-section {
      flex: 1;
      padding: 60px 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .login-header {
        text-align: center;
        margin-bottom: 36px;

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .login-subtitle {
          font-size: 15px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
      }

      // 登录表单
      .login-form {
        .input-wrapper {
          margin-bottom: 22px;

          .input-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
          }

          .custom-input {
            .el-input__inner {
              height: 48px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding-left: 48px;
              font-size: 15px;
              transition: all 0.3s ease;

              &:focus {
                border-color: #4A90E2;
                box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
              }

              &::placeholder {
                color: #9ca3af;
              }
            }

            .el-input__prefix {
              left: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .input-icon {
              color: #9ca3af;
              font-size: 18px;
              width: 18px;
              height: 18px;
            }
          }

          .captcha-container {
            display: flex;
            gap: 12px;

            .captcha-input {
              flex: 1;
            }

            .captcha-image-wrapper {
              width: 120px;
              height: 48px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
              cursor: pointer;
              transition: all 0.3s ease;

              &:hover {
                border-color: #4A90E2;
              }

              .captcha-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
          }
        }

        .login-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 18px 0 28px;

          .remember-me {
            .el-checkbox__label {
              font-size: 14px;
              color: #6b7280;
            }

            .el-checkbox__inner {
              border-radius: 4px;
            }

            &.is-checked .el-checkbox__inner {
              background-color: #4A90E2;
              border-color: #4A90E2;
            }
          }

          .register-link {
            .link-text {
              color: #4A90E2;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              transition: color 0.3s ease;

              &:hover {
                color: #2C6AB8;
              }
            }
          }
        }

        .login-button-wrapper {
          margin-bottom: 0;

          .login-button {
            width: 100%;
            height: 50px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 12px;
            background: linear-gradient(135deg, #4A90E2 0%, #5CA9E8 100%);
            border: none;
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 25px rgba(74, 144, 226, 0.4);
            }

            &:active {
              transform: translateY(0);
            }

            i {
              margin-right: 8px;
            }
          }
        }
      }
    }
  }
}

// 底部版权信息
.login-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  text-align: center;
  z-index: 10;

  span {
    display: inline-block;
    font-weight: 400;
    letter-spacing: 0.5px;
  }
}

// 动画效果
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .login-center {
    max-width: 900px;

    .login-wrapper {
      .brand-section {
        padding: 50px 40px;

        .brand-logo {
          width: 90px;
          height: 90px;
          margin-bottom: 24px;

          i {
            font-size: 42px;
          }
        }

        .brand-title {
          font-size: 28px;
        }

        .brand-subtitle {
          font-size: 15px;
          margin-bottom: 32px;
        }

        .feature-list {
          max-width: 280px;
        }
      }

      .login-form-section {
        padding: 50px 40px;
      }
    }
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: 15px;
  }

  .login-center {
    max-width: 100%;

    .login-wrapper {
      flex-direction: column;
      min-height: auto;

      .brand-section {
        padding: 40px 30px;

        &::before {
          width: 200px;
          height: 200px;
        }

        .brand-logo {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;

          i {
            font-size: 38px;
          }
        }

        .brand-title {
          font-size: 26px;
          margin-bottom: 12px;
        }

        .brand-subtitle {
          font-size: 14px;
          margin-bottom: 28px;
        }

        .feature-list {
          max-width: 100%;

          .feature-item {
            padding: 12px 16px;
            margin-bottom: 10px;

            i {
              font-size: 16px;
            }

            span {
              font-size: 14px;
            }
          }
        }
      }

      .login-form-section {
        padding: 40px 30px;

        .login-header {
          margin-bottom: 28px;

          .login-title {
            font-size: 24px;
          }

          .login-subtitle {
            font-size: 14px;
          }
        }

        .login-form {
          .input-wrapper {
            margin-bottom: 20px;

            .input-label {
              font-size: 13px;
            }

            .custom-input .el-input__inner {
              height: 46px;
              font-size: 14px;
            }

            .captcha-container {
              flex-direction: column;

              .captcha-image-wrapper {
                width: 100%;
                height: 46px;
              }
            }
          }

          .login-options {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
            margin: 16px 0 24px;
          }

          .login-button-wrapper .login-button {
            height: 48px;
            font-size: 15px;
          }
        }
      }
    }
  }

  .login-footer {
    padding: 12px 15px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }

  .login-center .login-wrapper {
    border-radius: 16px;

    .brand-section {
      padding: 30px 20px;

      .brand-logo {
        width: 70px;
        height: 70px;
        margin-bottom: 16px;
        border-radius: 18px;

        i {
          font-size: 34px;
        }
      }

      .brand-title {
        font-size: 22px;
        margin-bottom: 10px;
      }

      .brand-subtitle {
        font-size: 13px;
        margin-bottom: 24px;
      }

      .feature-list .feature-item {
        padding: 10px 14px;
        margin-bottom: 8px;

        span {
          font-size: 13px;
        }
      }
    }

    .login-form-section {
      padding: 30px 20px;

      .login-header {
        margin-bottom: 24px;

        .login-title {
          font-size: 22px;
        }

        .login-subtitle {
          font-size: 13px;
        }
      }

      .login-form {
        .input-wrapper {
          margin-bottom: 18px;

          .custom-input .el-input__inner {
            height: 44px;
            font-size: 14px;
            padding-left: 44px;
          }
        }

        .login-button-wrapper .login-button {
          height: 46px;
          font-size: 14px;
        }
      }
    }
  }

  .login-footer {
    padding: 10px 12px;
    font-size: 10px;
  }
}
</style>
