<template>
  <div class="bg">
    <div class="box">
      <el-form>
        <div class="line">
          <el-form-item label="账号" required>
            <el-input v-model="userForm.user" @blur="checkUser"></el-input>
            <b style="color: red" v-if="isExisted">改账号已经存在！</b>
          </el-form-item>
        </div>
        <div class="line">
          <el-form-item label="用户名" required>
            <el-input v-model="userForm.name"></el-input>
          </el-form-item>
        </div>
        <div class="line">
          <el-form-item label="手机" required>
            <el-input v-model="userForm.tel"></el-input>
          </el-form-item>
        </div>

        <div class="line">
          <el-form-item label="邮箱" required>
            <el-input
              v-model="userForm.email"
              type="email"
              @change="vailedEmail"
            ></el-input>
            <b style="color: red" v-if="!isEmail">邮箱不合法!</b>
          </el-form-item>
        </div>

        <div class="line">
          <el-form-item label="密码" required>
            <el-input v-model="userForm.password" show-password></el-input>
          </el-form-item>
        </div>

        <div class="line">
          <el-form-item label="确认密码" required>
            <el-input
              v-model="ensurePassword"
              type="password"
              @change="surePassword"
            ></el-input>
            <b style="color: red" v-if="isSured">两次密码不一致!</b>
          </el-form-item>
        </div>
      </el-form>
      <el-button
        type="primary"
        @click="register"
        :disabled="isExisted || isSured || !isEmail"
        >注&nbsp&nbsp&nbsp&nbsp&nbsp册</el-button
      >
    </div>
  </div>
</template>

<script>
const HOST = "http://localhost:10001/";
import md5 from "js-md5";
export default {
  name: "Register",
  data() {
    return {
      userForm: {
        user: "",
        name: "",
        tel: "",
        email: "",
        password: "",
        ip: "",
      },
      ensurePassword: "",
      isExisted: false,
      isSured: false,
      isEmail: true,
    };
  },
  methods: {
    register() {
      let _this = this;
      if (
        _this.userForm.user == "" ||
        _this.userForm.name == "" ||
        _this.userForm.tel == "" ||
        _this.userForm.email == "" ||
        _this.userForm.password == ""
      ) {
        _this.$message("请输入完整信息");
      } else if (!_this.isSured && !_this.isExisted) {
        _this.$http
          .post(
            HOST + "user/register",
            {
              user: _this.userForm.user,
              tel: _this.userForm.tel,
              password: md5(_this.userForm.password),
              ip: _this.userForm.ip,
              name: _this.userForm.name,
              email: _this.userForm.email,
            },
            { emulateJSON: true }
          )
          .then((res) => {
            if (res.body.code == 0) {
              _this.$message({
                showClose: true,
                message: res.body.msg,
                type: "success",
              });
              _this.$router.push("/login");
            } else {
              _this.$message({
                showClose: true,
                message: res.body.msg,
                type: "error",
              });
            }
          });
      } else {
        _this.$message("两次密码不一致!");
      }
    },
    checkUser() {
      let _this = this;
      if (_this.userForm.user != "") {
        _this.$http
          .get(HOST + "user/exist", {
            params: {
              user: _this.userForm.user,
            },
          })
          .then((res) => {
            if (res.body.code == 0) {
              _this.isExisted = true;
            } else {
              _this.isExisted = false;
            }
          });
      }
    },
    surePassword() {
      if (this.userForm.password != this.ensurePassword) {
        this.isSured = true;
      } else {
        this.isSured = false;
      }
    },
    vailedEmail() {
      var regEmail =
        /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (this.userForm.email != "" && !regEmail.test(this.userForm.email)) {
        this.isEmail = false;
      } else {
        this.isEmail = true;
      }
    },
  },
};
</script>

<style scoped>
.bg {
  display: flex;
  position: absolute;
  width: 100%;
  height: 100%;
  background: url("../assets/bg.png") fixed repeat;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.box {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  width: 400px;
  width: 800px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 1);
}
.line {
  padding: 5px 10px;
}
</style>