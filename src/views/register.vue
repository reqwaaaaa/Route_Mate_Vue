<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <!-- 中心区域容器 -->
    <div class="register-center">
      <div class="register-wrapper">
        <!-- 左侧品牌信息 -->
        <div class="brand-section">
          <div class="brand-logo">
            <i class="el-icon-cpu"></i>
          </div>
          <h1 class="brand-title">RouteMate出行服务</h1>
          <p class="brand-subtitle">注册即可体验强大的出行服务推荐</p>

          <div class="feature-list">
            <div class="feature-item">
              <i class="el-icon-check"></i>
              <span>免费注册使用</span>
            </div>
            <div class="feature-item">
              <i class="el-icon-check"></i>
              <span>热点轨迹生成</span>
            </div>
            <div class="feature-item">
              <i class="el-icon-check"></i>
              <span>系统同步管理</span>
            </div>
          </div>
        </div>

        <!-- 右侧注册表单 -->
        <div class="register-form-section">
          <div class="register-header">
            <h2 class="register-title">创建账户</h2>
            <p class="register-subtitle">填写以下信息完成注册</p>
          </div>

        <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form">
          <el-form-item prop="username">
            <div class="input-wrapper">
              <label class="input-label">用户账号</label>
              <el-input
                v-model="registerForm.username"
                type="text"
                auto-complete="off"
                placeholder="请输入用户账号"
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
                v-model="registerForm.password"
                type="password"
                auto-complete="off"
                placeholder="请输入登录密码"
                class="custom-input"
                @keyup.enter.native="handleRegister"
              >
                <svg-icon slot="prefix" icon-class="password" class="input-icon" />
              </el-input>
            </div>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <div class="input-wrapper">
              <label class="input-label">确认密码</label>
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                auto-complete="off"
                placeholder="请再次输入密码"
                class="custom-input"
                @keyup.enter.native="handleRegister"
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
                  v-model="registerForm.code"
                  auto-complete="off"
                  placeholder="请输入验证码"
                  class="custom-input captcha-input"
                  @keyup.enter.native="handleRegister"
                >
                  <svg-icon slot="prefix" icon-class="validCode" class="input-icon" />
                </el-input>
                <div class="captcha-image-wrapper">
                  <img :src="codeUrl" @click="getCode" class="captcha-image" title="点击刷新验证码"/>
                </div>
              </div>
            </div>
          </el-form-item>

          <div class="register-options">
            <div class="agreement-text">
              注册即表示您同意我们的
              <a href="#" class="link-text">服务条款</a>
              和
              <a href="#" class="link-text">隐私政策</a>
            </div>
            <div class="login-link">
              <span>已有账户？</span>
              <router-link class="link-text" :to="'/login'">立即登录</router-link>
            </div>
          </div>

          <el-form-item class="register-button-wrapper">
            <el-button
              :loading="loading"
              type="primary"
              class="register-button"
              @click.native.prevent="handleRegister"
            >
              <span v-if="!loading">
                <i class="el-icon-user-solid"></i>
                立即注册
              </span>
              <span v-else>
                注册中...
              </span>
            </el-button>
          </el-form-item>
        </el-form>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="register-footer">
      <span>Copyright © 2026 Naiweilanlan All Rights Reserved.</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg, register } from "@/api/login"

export default {
  name: "Register",
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.registerForm.password !== value) {
        callback(new Error("两次输入的密码不一致"))
      } else {
        callback()
      }
    }
    return {
      title: "RouteMate出行服务",
      codeUrl: "",
      registerForm: {
        username: "",
        password: "",
        confirmPassword: "",
        code: "",
        uuid: ""
      },
      registerRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" },
          { min: 2, max: 20, message: '用户账号长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" },
          { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
          { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, trigger: "blur", message: "请再次输入您的密码" },
          { required: true, validator: equalToPassword, trigger: "blur" }
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      loading: false,
      captchaEnabled: true
    }
  },
  created() {
    this.getCode()
  },
  methods: {
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
        if (this.captchaEnabled) {
          this.codeUrl =  res.img
          this.registerForm.uuid = res.uuid
        }
      })
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.loading = true
          register(this.registerForm).then(res => {
            const username = this.registerForm.username
            this.$alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", '系统提示', {
              dangerouslyUseHTMLString: true,
              type: 'success'
            }).then(() => {
              this.$router.push("/login")
            }).catch(() => {})
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
.register-container {
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

// 中心注册区域
.register-center {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1100px;
  animation: slideIn 0.6s ease-out;

  .register-wrapper {
    display: flex;
    background: white;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    min-height: 650px;

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

    // 右侧注册表单
    .register-form-section {
      flex: 1;
      padding: 60px 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .register-header {
        text-align: center;
        margin-bottom: 32px;

        .register-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .register-subtitle {
          font-size: 15px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
      }

      // 注册表单
      .register-form {
        .input-wrapper {
          margin-bottom: 20px;

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

        .register-options {
          margin: 18px 0 24px;

          .agreement-text {
            font-size: 13px;
            color: #6b7280;
            text-align: center;
            margin-bottom: 12px;
            line-height: 1.5;

            .link-text {
              color: #4A90E2;
              text-decoration: none;
              font-weight: 500;
              transition: color 0.3s ease;

              &:hover {
                color: #2C6AB8;
              }
            }
          }

          .login-link {
            text-align: center;
            font-size: 14px;
            color: #6b7280;

            .link-text {
              color: #4A90E2;
              text-decoration: none;
              font-weight: 500;
              margin-left: 4px;
              transition: color 0.3s ease;

              &:hover {
                color: #2C6AB8;
              }
            }
          }
        }

        .register-button-wrapper {
          margin-bottom: 0;

          .register-button {
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
.register-footer {
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

  @media (max-width: 768px) {
    padding: 12px 15px;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 10px;
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
  .register-center {
    max-width: 900px;

    .register-wrapper {
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

      .register-form-section {
        padding: 50px 40px;
      }
    }
  }
}

@media (max-width: 768px) {
  .register-container {
    padding: 15px;
  }

  .register-center {
    max-width: 100%;

    .register-wrapper {
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

      .register-form-section {
        padding: 40px 30px;

        .register-header {
          margin-bottom: 24px;

          .register-title {
            font-size: 24px;
          }

          .register-subtitle {
            font-size: 14px;
          }
        }

        .register-form {
          .input-wrapper {
            margin-bottom: 18px;

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

          .register-options {
            margin: 16px 0 20px;

            .agreement-text {
              font-size: 12px;
              margin-bottom: 10px;
            }

            .login-link {
              font-size: 13px;
            }
          }

          .register-button-wrapper .register-button {
            height: 48px;
            font-size: 15px;
          }
        }
      }
    }
  }

  .register-footer {
    padding: 12px 15px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 10px;
  }

  .register-center .register-wrapper {
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

    .register-form-section {
      padding: 30px 20px;

      .register-header {
        margin-bottom: 20px;

        .register-title {
          font-size: 22px;
        }

        .register-subtitle {
          font-size: 13px;
        }
      }

      .register-form {
        .input-wrapper {
          margin-bottom: 16px;

          .custom-input .el-input__inner {
            height: 44px;
            font-size: 14px;
            padding-left: 44px;
          }
        }

        .register-button-wrapper .register-button {
          height: 46px;
          font-size: 14px;
        }
      }
    }
  }

  .register-footer {
    padding: 10px 12px;
    font-size: 10px;
  }
}
</style>
