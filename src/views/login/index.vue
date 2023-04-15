<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">商家后台管理系统</h3>
      </div>

      <el-form-item prop="userName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="userName"
          v-model="loginForm.userName"
          placeholder="UserName"
          name="userName"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-table-column>
        <el-button
          :loading="loading"
          type="primary"
          style="width: 143px;margin-bottom:30px;"
          @click.native.prevent="handleRegister"
        >注册</el-button>
        <el-button
          :loading="loading"
          type="primary"
          style="width: 143px;margin-bottom:30px;"
          @click.native.prevent="handleLogin"
        >登录</el-button>
        <el-button
          :loading="loading"
          type="primary"
          style="width: 143px;margin-bottom:30px;"
          @click.native.prevent="handleLogin"
        >忘记密码</el-button>
      </el-table-column>
      <!--<div class="tips">-->
      <!--<span style="margin-right:20px;">userName: admin</span>-->
      <!--<span> password: any</span>-->
      <!--</div>-->
    </el-form>

    <!-- :visible.sync，vue标签，设置动态的显示内容与否 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <div class="userinfo">
          <el-form-item label="用户名" prop="userName" label-width="120px" style="background-color: white">
            <el-input v-model="temp.userName" />
            <!--placeholder="请输入用户名" style="width: 200px;color: #2b2f3a;border:1px solid #000; border-color: #d3dce6;"-->
          </el-form-item>
        </div>


        <el-form-item label="初始密码" prop="password" label-width="120px" style="background-color: white">
          <el-input v-model="temp.password" placeholder="请输入初始密码" style="width: 200px;border:1px solid #000; border-color: #d3dce6;" />
        </el-form-item>

        <el-form-item label="* 手机号" prop="mobile" label-width="120px" style="background-color: white">
          <el-input v-model="temp.mobile" placeholder="请输入手机号" style="width: 200px;border:1px solid #000; border-color: #d3dce6;" />
        </el-form-item>

        <el-form-item label="* 邮箱" prop="email" label-width="120px" style="background-color: white">
          <el-input v-model="temp.email" placeholder="请输入邮箱" style="width: 200px;border:1px solid #000; border-color: #d3dce6;" />
        </el-form-item>

        <el-form-item label="* 个人简介" prop="introduction" label-width="120px" style="background-color: white">
          <el-input v-model="temp.introduction" placeholder="请输入介绍" style="width: 200px;border:1px solid #000; border-color: #d3dce6;" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createData">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { addUserInfo, editUserInfo } from '@/api/seller/user'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        userName: 'admin',
        password: '111111'
      },
      loginRules: {
        userName: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        changePassword: '修改密码',
        register: '注册'
      },
      rules: {
        userName: [{ required: true, message: '用户名必填', trigger: 'blur' }],
        password: [{ required: true, message: '初始密码必填', trigger: 'blur' }]
      },
      temp: {
        userName: undefined
      }
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
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleRegister() {
      // this.resetTemp()
      this.dialogStatus = 'register'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          var requestBody = {
            userName: this.temp.userName,
            password: this.temp.password,
            mobile: this.temp.mobile,
            email: this.temp.email,
            // 头像，只用于后台系统的右上角的头像展示，没必要提供添加和编辑功能，后续用户真有需求，可以完善下
            headPicUrl: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
          }
          addUserInfo(requestBody).then(response => {
            // 将记录添加到Table中，不再reload页面
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
            // 应该跳转到登录页
            // this.reload()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'changePassword'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          var requestBody = {
            userId: this.temp.userId,
            userName: this.temp.userName,
            password: this.temp.password,
            mobile: this.temp.mobile,
            email: this.temp.email
          }
          editUserInfo(requestBody).then(() => {
            // const index = this.list.findIndex(v => v.sellerId === this.temp.sellerId)
            // // 展示框中更新对应记录
            // this.list.splice(index, 1, this.temp)
            // this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            // 应该跳转到登录页
            // this.reload()
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
         margin-right: 16px;
       }
      }
    }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
