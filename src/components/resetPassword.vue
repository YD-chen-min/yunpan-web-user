<template>
  <div>
    <el-steps :active="active" finish-status="success" align-center>
      <el-step title="验证账号或手机"></el-step>
      <el-step title="验证邮箱"></el-step>
      <el-step title="重置密码"></el-step>
    </el-steps>
    <el-divider></el-divider>
    <br />
    <div class="pane">
      <div v-if="active == 0" class="inline">
        <div class="line">
          <el-input v-model="user" placeholder="请输入账号或手机"></el-input>
        </div>

        <div class="line">
          <el-button type="primary" @click="getUserInfo">下一步</el-button>
        </div>
      </div>
      <div v-if="active == 1" class="inline">
        <div class="line">验证码已经发送到邮箱{{ email }}</div>
        <div class="line">
          <el-input v-model="code" placeholder="请输入验证码"></el-input>
        </div>
        <div class="line">
          <el-button type="primary" @click="VailCode">下一步</el-button>
        </div>
      </div>
      <div v-if="active == 2" class="inline">
        <el-form>
          <div class="line">
            <el-form-item label="密码">
              <el-input v-model="password" show-password required></el-input>
            </el-form-item>
          </div>

          <div class="line">
            <el-form-item label="确认密码">
              <el-input
                v-model="ensurePassword"
                type="password"
                @change="surePassword"
                required
              ></el-input>
              <b style="color: red" v-if="isSured">两次密码不一致!</b>
            </el-form-item>
          </div>
        </el-form>

        <el-button type="primary" @click="reset" :disabled="isSured"
          >完成</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import md5 from "js-md5";
export default {
  name: "RestPassword",
  data() {
    return {
      active: 0,
      email: "",
      code: "",
      password: "",
      ensurePassword: "",
      isSured: false,
      HOST: "http://localhost:10001/",
      user: "",
      code1: "",
    };
  },
  methods: {
    surePassword() {
      if (this.password != this.ensurePassword) {
        this.isSured = true;
      } else {
        this.isSured = false;
      }
    },
    getUserInfo() {
      let _this = this;
      _this.$http
        .get(_this.HOST + "user/get/info", {
          params: {
            user: _this.user,
          },
        })
        .then((res) => {
          if (res.body.code == 0) {
            _this.email = res.body.data.email;

            _this.code1 = _this.createCode(6);
            _this.$http
              .post(
                _this.HOST + "code/send",
                {
                  email: _this.email,
                  code: _this.code1,
                },
                { emulateJSON: true }
              )
              .then((res) => {
                if (res.body.code == 0) {
                  _this.$message({
                    showClose: true,
                    message: "验证码发送成功",
                    type: "success",
                  });
                  _this.active++;
                  _this.user = res.body.data.user;
                } else {
                  _this.$message({
                    showClose: true,
                    message: res.body.msg,
                    type: "error",
                  });
                }
              });
          } else {
            _this.$message({
              showClose: true,
              message: res.body.msg,
              type: "error",
            });
          }
        });
    },
    createCode(length) {
      let code = "";
      for (var i = 1; i <= length; i++) {
        code += parseInt(Math.random() * 10);
      }

      return code;
    },
    VailCode() {
      if (this.code == this.code1) {
        this.active++;
      } else {
        this.$message({
          showClose: true,
          message: "验证码错误",
          type: "error",
        });
      }
    },
    reset() {
      let _this = this;
      _this.$http
        .post(
          _this.HOST + "user/modify/password",
          {
            user: _this.user,
            password: md5(_this.password),
          },
          { emulateJSON: true }
        )
        .then((res) => {
          if (res.body.code == 0) {
            _this.$message({
              showClose: true,
              message: "修改成功",
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
    },
  },
};
</script>

<style scoped>
.pane {
  display: flex;
  flex-flow: column;
  justify-content: center;
  width: 100%;
  align-items: center;
}
.inline {
  width: 40%;
  text-align: center;
  padding: 10px;
}
.line {
  padding: 5px 10px;
}
</style>